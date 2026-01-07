import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket, useOnlineUsers } from '../context/SocketContext';
import UserAvatar from './UserAvatar';
import EditProfileModal from './EditProfileModal';

const Sidebar = ({ onSelectConversation, selectedConversationId }) => {
    const [conversations, setConversations] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const { user, logout } = useAuth();
    const socket = useSocket();
    const onlineUsers = useOnlineUsers();

    useEffect(() => {
        fetchConversations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Join rooms
    useEffect(() => {
        if (socket && conversations.length > 0) {
            conversations.forEach(c => socket.emit('join_conversation', c._id));
        }
    }, [socket, conversations]);

    // Listen for updates
    useEffect(() => {
        if (!socket) return;
        const handleMessage = (msg) => {
            if (msg.type === 'call_invite' || msg.type === 'text' || msg.type === 'image') {
                setConversations(prev => {
                    const idx = prev.findIndex(c => c._id === msg.conversationId);
                    if (idx === -1) return prev;
                    const updated = { ...prev[idx], lastMessage: msg, lastInteraction: msg.createdAt };
                    const newList = [...prev];
                    newList.splice(idx, 1);
                    return [updated, ...newList];
                });
            }
        };
        socket.on('receive_message', handleMessage);
        return () => socket.off('receive_message', handleMessage);
    }, [socket]);

    const fetchConversations = async () => {
        try {
            const { data } = await api.get('/api/chat?type=active');
            setConversations(data);
        } catch (error) { console.error(error); }
    };



    return (
        <div className="w-80 bg-base-300 flex flex-col h-full border-r border-base-content/10">
            {/* Header */}
            {/* Header */}
            <div className="p-6 bg-base-200 border-b border-base-content/10 flex flex-col gap-4 shadow-lg z-10 relative">
                <button
                    className="absolute top-8 right-2 btn btn-ghost btn-xs btn-circle opacity-50 hover:opacity-100"
                    title="Edit Profile"
                    onClick={() => setShowEditModal(true)}
                >
                    <i className="fas fa-pencil-alt"></i>
                </button>

                <div className="flex items-center gap-4">
                    <UserAvatar user={user} size="w-16" />
                    <div>
                        <h2 className="text-xl font-black text-base-content">{user?.username}</h2>
                        <p className="text-xs font-semibold opacity-50 uppercase tracking-widest">Language Learner</p>
                    </div>
                </div>

                <div className="bg-base-100/50 p-3 rounded-xl border border-base-content/5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="w-[75px] text-[10px] font-black uppercase opacity-40 flex items-center gap-1.5 shrink-0">
                            <i className="fas fa-comment"></i> Speaks
                        </span>
                        <div className="flex flex-wrap gap-1">
                            {user?.nativeLanguages?.map(l => (
                                <span key={l} className="badge badge-ghost badge-xs font-bold">{l}</span>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="w-[75px] text-[10px] font-black uppercase opacity-40 flex items-center gap-1.5 shrink-0">
                            <i className="fas fa-graduation-cap"></i> Learning
                        </span>
                        <div className="flex flex-wrap gap-1">
                            {user?.learningLanguages?.map(l => (
                                <span key={l.language} className="badge badge-primary py-2 badge-xs font-bold">{l?.language}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>



            {/* List */}
            <div className="flex-1 overflow-y-auto bg-base-200 p-2 space-y-2">
                {conversations.map(conv => {
                    const otherUser = conv.participants.find(p => p._id !== user._id);
                    const isSelected = selectedConversationId === conv._id;
                    const langs = conv.languages || [];

                    let lastMsgText = "No messages yet";
                    if (conv.lastMessage) {
                        if (typeof conv.lastMessage === 'object') {
                            if (conv.lastMessage.type === 'image') lastMsgText = '📷 Photo';
                            else if (conv.lastMessage.type === 'call_invite') lastMsgText = '📞 Call';
                            else lastMsgText = conv.lastMessage.originalText || "Message";
                        }
                    }

                    return (
                        <div
                            key={conv._id}
                            onClick={() => onSelectConversation(conv)}
                            className={`group p-3 rounded-xl cursor-pointer transition-all flex items-center gap-4 ${isSelected ? 'bg-primary text-primary-content shadow-md' : 'hover:bg-primary/10 bg-base-100 hover:shadow-sm'}`}
                        >
                            <div className="relative">
                                <UserAvatar user={otherUser} size="w-12" />
                                {onlineUsers.includes(otherUser?._id) && (
                                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-base-100 rounded-full"></span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                <div className="flex justify-between items-baseline">
                                    <h3 className={`font-bold text-sm ${isSelected ? 'text-primary-content' : 'text-base-content'}`}>{otherUser?.username}</h3>
                                    {conv.streak > 0 && (
                                        <span className={`text-[10px] font-bold flex items-center gap-1 ${isSelected ? 'text-primary-content/80' : 'text-orange-500'}`}>
                                            <i className="fas fa-fire"></i> {conv.streak}
                                        </span>
                                    )}
                                </div>

                                <div className={`text-xs flex items-center gap-3 ${isSelected ? 'opacity-90' : 'opacity-60'} mt-0.5`}>
                                    <div className="flex items-center gap-1" title="You Learn">
                                        <i className="fas fa-graduation-cap text-[10px]"></i>
                                        <span className="font-bold uppercase tracking-widest">
                                            {user?.learningLanguages?.find(ll => langs.includes(ll.language))?.language || langs[0]}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-75" title="You Speak">
                                        <i className="fas fa-comment text-[10px]"></i>
                                        <span className="font-medium uppercase tracking-widest">
                                            {user?.nativeLanguages?.find(nl => langs.includes(nl)) || langs[1]}
                                        </span>
                                    </div>
                                </div>

                                <p className={`text-xs truncate ${isSelected ? 'opacity-90 font-medium' : 'opacity-60'}`}>
                                    {lastMsgText}
                                </p>
                            </div>
                        </div>
                    );
                })}
                {conversations.length === 0 && <div className="text-center opacity-50 py-10">No active chats</div>}
            </div>
            {showEditModal && <EditProfileModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} />}
        </div>
    );
};

export default Sidebar;
