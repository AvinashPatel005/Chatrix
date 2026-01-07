import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import NavigationRail from '../components/NavigationRail';
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
            <NavigationRail />
            <Sidebar
                selectedConversationId={selectedConversationId}
                onSelectConversation={handleSelectConversation}
            />
            <ChatWindow
                conversation={selectedConversation}
                user={user}
            />
        </div>
    );
};

export default ChatPage;
