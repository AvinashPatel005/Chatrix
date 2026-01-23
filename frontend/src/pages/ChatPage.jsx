import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import NavigationRail from '../components/NavigationRail';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../context/AuthContext';

const ChatPage = () => {
    const [selectedConversation, setSelectedConversation] = useState(null);
    const { user } = useAuth();
    const [selectedConversationId, setSelectedConversationId] = useState(null);

    const handleSelectConversation = (conv) => {
        setSelectedConversation(conv);
        setSelectedConversationId(conv._id);
    };

    return (
        <div className="h-screen flex overflow-hidden bg-base-100">
            {/* Sidebar View (Mobile: only shown if no chat selected) */}
            <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} flex-none h-full`}>
                <div className="hidden md:block h-full">
                    <NavigationRail />
                </div>
            </div>

            {/* Mobile Bottom Nav (Only show when NOT in a chat on mobile) */}
            {!selectedConversation && <BottomNav />}

            <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} flex-1 md:flex-none h-full pb-16 md:pb-0`}>
                <Sidebar
                    selectedConversationId={selectedConversationId}
                    onSelectConversation={handleSelectConversation}
                />
            </div>

            {/* Chat View (Mobile: only shown if chat selected) */}
            <div className={`${selectedConversation ? 'flex' : 'hidden md:flex'} flex-1 w-full md:w-auto h-full`}>
                <ChatWindow
                    conversation={selectedConversation}
                    user={user}
                    onBack={() => {
                        setSelectedConversation(null);
                        setSelectedConversationId(null);
                    }}
                />
            </div>
        </div>
    );
};

export default ChatPage;
