import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import api from '../api/axios';
import { useSocket, useOnlineUsers } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { StreamVideo, StreamVideoClient } from '@stream-io/video-react-sdk';
import CallModal from './CallModal';
import UserAvatar from './UserAvatar';

const CallInviteMessage = ({ client, callId, onJoin }) => {
    const [isActive, setIsActive] = useState(false);
    const [label, setLabel] = useState("Checking...");

    useEffect(() => {
        let mounted = true;
        const checkCallStatus = async () => {
            if (!client) return;
            try {
                const { calls } = await client.queryCalls({
                    filter_conditions: { id: callId },
                    limit: 1,
                    watch: true
                });

                if (mounted) {
                    if (calls.length > 0) {
                        const call = calls[0];
                        const updateState = () => {
                            const count = call.state.participantCount;
                            setIsActive(count > 0);
                            setLabel(count > 0 ? "Join Call" : "Call Ended");
                        };

                        updateState();

                        call.on('call.session_participant_joined', () => mounted && updateState());
                        call.on('call.session_participant_left', () => mounted && updateState());
                    } else {
                        setIsActive(false);
                        setLabel("Call Ended");
                    }
                }
            } catch (error) {
                console.error("Error checking call status:", error);
                if (mounted) setLabel("Call Ended");
            }
        };

        checkCallStatus();
        return () => { mounted = false; };
    }, [client, callId]);

    return (
        <button
            onClick={onJoin}
            disabled={!isActive}
            className={`px-4 py-2 rounded-full text-sm transition shadow-sm flex items-center ${isActive
                ? 'bg-success text-success-content hover:bg-success-focus'
                : 'bg-base-300 text-base-content/50 cursor-not-allowed'
                }`}
        >
            <i className={`fas ${isActive ? 'fa-video' : 'fa-phone-slash'} mr-2`}></i>
            {label}
        </button>
    );
};

const ChatWindow = ({ conversation, user, onBack }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [translationOn, setTranslationOn] = useState(true);
    const [client, setClient] = useState(null);
    const [call, setCall] = useState(null);
    const [isCallModalOpen, setIsCallModalOpen] = useState(false);

    const socket = useSocket();
    const onlineUsers = useOnlineUsers();
    const { addToast } = useToast();
    const messageContainerRef = useRef(null);
    const fileInputRef = useRef(null);

    const otherUser = conversation?.participants?.find(p => String(p._id) !== String(user._id));

    // Init Stream Video Client
    useEffect(() => {
        const initVideoClient = async () => {
            if (!user) return;
            try {
                const { data } = await api.get('/api/chat/stream-token');

                const videoClient = new StreamVideoClient({
                    apiKey: data.apiKey,
                    user: { id: user._id, name: user.username, image: user.avatar },
                    token: data.token,
                });
                setClient(videoClient);
            } catch (error) {
                console.error('Failed to init video client', error);
            }
        };
        initVideoClient();
    }, [user]);

    useEffect(() => {
        if (conversation) {
            fetchMessages();
            if (socket) socket.emit('join_conversation', conversation._id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversation]);

    useEffect(() => {
        if (socket) {
            const handleMessage = (message) => {
                if (message.conversationId === conversation?._id) {
                    setMessages((prev) => [...prev, message]);
                }
            };
            socket.on('receive_message', handleMessage);
            return () => socket.off('receive_message', handleMessage);
        }
    }, [socket, conversation]);

    const fetchMessages = async () => {
        try {
            const { data } = await api.get(`/api/chat/${conversation._id}/messages`);
            setMessages(data);
        } catch (error) {
            console.error(error);
        }
    };

    useLayoutEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const startCall = async (isVideo = true) => {
        if (!client || !conversation) return;

        const callId = conversation._id;
        const newCall = client.call('default', callId);

        try {
            if (!isVideo) {
                // Audio only logic if needed, usually SDK handles via toggle, or disable camera initially
                // await newCall.camera.disable(); // Requires call to be created/joined first usually or set options
            }

            await newCall.join({ create: true });

            // If audio only, we can disable camera after join or configure before
            if (!isVideo) {
                await newCall.camera.disable();
            }

            setCall(newCall);
            setIsCallModalOpen(true);

            if (socket) {
                const messageData = {
                    senderId: user._id,
                    conversationId: conversation._id,
                    content: isVideo ? 'Started a Video Call' : 'Started a Voice Call',
                    originalLanguage: conversation?.learningMap?.[otherUser?._id] || user.nativeLanguages?.[0] || 'en',
                    targetLanguage: conversation?.learningMap?.[user._id] || otherUser?.nativeLanguages?.[0] || 'es',
                    type: 'call_invite'
                };
                socket.emit('send_message', messageData);
            }
        } catch (error) {
            console.error("Error starting call", error);
            addToast("Failed to start call", "error");
        }
    };

    const joinCall = async () => {
        if (!client || !conversation) return;

        const callId = conversation._id;
        const newCall = client.call('default', callId); // Get existing call object

        try {
            await newCall.join();
            setCall(newCall);
            setIsCallModalOpen(true);
        } catch (error) {
            console.error("Error joining call", error);
            // If already joined (e.g. re-opening modal), just show modal
            // But simpler to just show modal if we have call state
            setCall(newCall);
            setIsCallModalOpen(true);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result;
            const messageData = {
                senderId: user._id,
                conversationId: conversation._id,
                content: base64,
                originalLanguage: conversation?.learningMap?.[otherUser?._id] || user.nativeLanguages?.[0] || 'en',
                targetLanguage: conversation?.learningMap?.[user._id] || otherUser?.nativeLanguages?.[0] || 'es',
                type: 'image'
            };
            if (socket) socket.emit('send_message', messageData);
        };
        reader.readAsDataURL(file);
    };

    const speak = (text, lang) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop valid utterances
            const utterance = new SpeechSynthesisUtterance(text);
            if (lang) utterance.lang = lang;
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleSend = () => {
        if (!newMessage.trim()) return;

        const messageData = {
            senderId: user._id,
            conversationId: conversation._id,
            content: newMessage,
            originalLanguage: conversation?.learningMap?.[otherUser?._id] || user.nativeLanguages?.[0] || 'en',
            targetLanguage: conversation?.learningMap?.[user._id] || otherUser?.nativeLanguages?.[0] || 'es',
            type: 'text'
        };

        if (socket) socket.emit('send_message', messageData);
        setNewMessage('');
    };

    if (!conversation) {
        return (
            <div className="flex-1 flex items-center justify-center bg-base-100 flex-col">
                <h2 className="text-3xl font-bold text-base-content/20">Chatrix</h2>
                <p className="text-base-content/40">Select a chat to start learning!</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-base-100 relative">

            {/* Call Modal Wrapper */}
            {client && (
                <StreamVideo client={client}>
                    {isCallModalOpen && <CallModal
                        call={call}
                        onClose={async () => {
                            setIsCallModalOpen(false);
                            if (call) {
                                // Don't leave immediately if you just want to minimize?
                                // For now, assume closing modal means leaving call
                                try {
                                    await call.leave();
                                } catch (e) {
                                    console.warn("Call leave error", e);
                                }
                            }
                        }}
                    />}
                </StreamVideo>
            )}

            {/* Header */}
            <div className="navbar bg-base-100 border-b border-base-200 px-2 md:px-4 h-16 shadow-sm z-20">
                <div className="flex-1 flex items-center gap-2 md:gap-3 min-w-0">
                    {onBack && (
                        <button onClick={onBack} className="btn btn-ghost btn-circle btn-sm md:hidden shrink-0">
                            <i className="fas fa-arrow-left"></i>
                        </button>
                    )}
                    <UserAvatar user={otherUser} size="w-8 md:w-10" />
                    <div className="min-w-0">
                        <div className="font-bold text-sm md:text-lg truncate">{otherUser?.username}</div>
                        <div className={`text-[10px] md:text-xs font-semibold ${onlineUsers.includes(otherUser?._id) ? "text-success" : "opacity-50"}`}>
                            {onlineUsers.includes(otherUser?._id) ? "Online" : "Offline"}
                        </div>
                    </div>
                </div>
                <div className="flex-none flex items-center gap-1 md:gap-4">
                    <div className="form-control hidden xs:block">
                        <label className="label cursor-pointer gap-2">
                            <span className="label-text text-xs font-semibold hidden sm:inline">Translate</span>
                            <input
                                type="checkbox"
                                className="toggle toggle-xs md:toggle-sm toggle-primary"
                                checked={translationOn}
                                onChange={() => setTranslationOn(!translationOn)}
                            />
                        </label>
                    </div>
                    <button onClick={() => startCall(true)} className="btn btn-ghost btn-circle btn-sm md:btn-md text-primary">
                        <i className="fas fa-video text-sm md:text-lg"></i>
                    </button>
                    <button onClick={() => startCall(false)} className="btn btn-ghost btn-circle btn-sm md:btn-md text-success">
                        <i className="fas fa-phone text-sm md:text-lg"></i>
                    </button>
                </div>
            </div>

            {/* Messages */}
            {/* Messages */}
            <div
                ref={messageContainerRef}
                className="flex-1 overflow-y-auto p-2 md:p-4 space-y-4 bg-base-200/50 custom-scrollbar"
            >
                {messages.map((msg, index) => {
                    const isMe = msg.sender === user._id || msg.sender._id === user._id; // Handle populated or id

                    let messageContent;
                    if (msg.type === 'image') {
                        messageContent = <img src={msg.originalText} alt="Shared" className="rounded-xl max-h-40 md:max-h-60" />;
                    } else if (msg.type === 'call_invite') {
                        const isVideo = msg.originalText.toLowerCase().includes('video');
                        messageContent = (
                            <div className="w-full min-w-[200px] md:min-w-[220px]">
                                <div className="flex items-center gap-3 md:gap-4 mb-3">
                                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shadow-sm ${isMe ? 'bg-white/20' : 'bg-base-content/5'}`}>
                                        <i className={`fas ${isVideo ? 'fa-video' : 'fa-phone'} text-lg md:text-xl`}></i>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm md:text-base">{isVideo ? 'Video Call' : 'Voice Call'}</h3>
                                        <p className="text-[10px] md:text-xs opacity-75">{msg.originalText}</p>
                                    </div>
                                </div>
                                <div className="w-full">
                                    <CallInviteMessage
                                        client={client}
                                        callId={conversation._id}
                                        onJoin={() => joinCall()}
                                    />
                                </div>
                            </div>
                        );
                    } else {
                        messageContent = (
                            <div className="flex flex-col">
                                <div className="flex items-center justify-between">
                                    <span className="whitespace-pre-wrap text-sm md:text-base">{msg.originalText}</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); speak(msg.originalText, msg.originalLanguage); }}
                                        className="btn btn-ghost btn-xs btn-circle opacity-50 hover:opacity-100 min-h-0 h-6 w-6 ml-2 shrink-0"
                                        title="Play Pronunciation"
                                    >
                                        <i className="fas fa-volume-high text-xs"></i>
                                    </button>
                                </div>
                                {!isMe && translationOn && (
                                    <div className="mt-2 pt-2 border-t border-base-content/10 text-xs flex items-start gap-1.5 opacity-90">
                                        <i className="fas fa-wand-magic-sparkles text-primary text-[10px] mt-0.5" title="AI Translated"></i>
                                        <span className="italic">{msg.translatedText || "Translating..."}</span>
                                    </div>
                                )}
                            </div>
                        );
                    }

                    const isImage = msg.type === 'image';
                    const bubbleClass = `chat-bubble shadow-sm max-w-[85%] md:max-w-[60%] ${isMe ? 'chat-bubble-primary' : 'chat-bubble-neutral'} ${isImage ? 'p-1' : ''}`;

                    return (
                        <div key={index} className={`chat ${isMe ? 'chat-end' : 'chat-start'}`}>
                            <div className="chat-image avatar hidden md:block">
                                <UserAvatar user={isMe ? user : otherUser} size="w-10" />
                            </div>
                            <div className="chat-header text-[10px] md:text-xs opacity-50 mb-1">
                                {isMe ? 'You' : (msg.sender.username || otherUser.username)}
                                <time className="text-[10px] md:text-xs opacity-50 ml-1">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                            </div>
                            <div className={bubbleClass}>
                                {messageContent}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input */}
            <div className="p-2 md:p-4 bg-base-100 border-t border-base-200 flex items-center gap-2 md:gap-3">
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                />
                <button onClick={() => fileInputRef.current?.click()} className="btn btn-ghost btn-circle btn-sm md:btn-md">
                    <i className="fas fa-paperclip text-lg"></i>
                </button>

                <input
                    type="text"
                    className="input input-bordered input-sm md:input-md w-full rounded-full focus:outline-none text-sm md:text-base"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                    onClick={handleSend}
                    className="btn btn-primary btn-circle btn-sm md:btn-md text-white shadow-lg shrink-0">
                    <i className="fas fa-paper-plane text-sm md:text-lg"></i>
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;
