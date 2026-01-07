import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import NavigationRail from '../components/NavigationRail';
import UserAvatar from '../components/UserAvatar';

const RequestsPage = () => {
    const [activeTab, setActiveTab] = useState('received');
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { addToast } = useToast();

    useEffect(() => {
        fetchAllRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAllRequests = async () => {
        try {
            setLoading(true);
            const [receivedRes, sentRes] = await Promise.all([
                api.get('/api/chat?type=pending'),
                api.get('/api/chat?type=sent')
            ]);
            setReceivedRequests(receivedRes.data);
            setSentRequests(sentRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status, type) => {
        try {
            await api.put('/api/chat/status', { conversationId: id, status });

            if (type === 'received') {
                setReceivedRequests(prev => prev.filter(r => r._id !== id));
                if (status === 'accepted') addToast("Request Accepted!", "success");
            } else {
                setSentRequests(prev => prev.filter(r => r._id !== id));
                if (status === 'cancelled') addToast("Request Cancelled", "info");
            }
        } catch (error) {
            console.error(error);
            addToast(error.response?.data?.message || "Action failed", "error");
        }
    };

    const RequestCard = ({ req, type }) => {
        // Determine the other user
        const otherUser = type === 'received'
            ? req.participants.find(p => p._id === req.requester)
            : req.participants.find(p => p._id === req.recipient);

        const myId = user._id;
        const otherId = otherUser?._id;

        const langITeach = req.learningMap?.[otherId];
        const langILearn = req.learningMap?.[myId];

        if (!otherUser) return null;

        return (
            <div className="card w-64 bg-base-100/80 backdrop-blur-sm shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-base-200/60 rounded-3xl overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="card-body p-4 flex flex-col items-center text-center h-full">
                    {/* Avatar */}
                    <div className="mb-3 relative">
                        <UserAvatar user={otherUser} size="w-16" />
                    </div>

                    <h2 className="text-base font-bold text-base-content mb-1 truncate w-full px-2 pb-2">{otherUser.username}</h2>

                    {/* Exchange Info */}
                    <div className="w-full bg-base-200/40 rounded-xl p-3 mb-3 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-1.5 opacity-70">
                                <i className="fas fa-comment text-primary text-[10px]"></i>
                                <span className="font-semibold">Speaks</span>
                            </div>
                            <span className="font-bold text-primary">{langITeach}</span>
                        </div>
                        <div className="h-px bg-base-content/5 w-full"></div>
                        <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-1.5 opacity-70">
                                <i className="fas fa-graduation-cap text-secondary text-[10px]"></i>
                                <span className="font-semibold">Wants to Learn</span>
                            </div>
                            <span className="font-bold text-secondary">{langILearn}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="w-full mt-auto grid grid-cols-2 gap-2">
                        {type === 'received' ? (
                            <>
                                <button
                                    onClick={() => handleAction(req._id, 'accepted', 'received')}
                                    className="btn btn-sm btn-primary rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all text-xs"
                                >
                                    Accept
                                </button>
                                <button
                                    onClick={() => handleAction(req._id, 'rejected', 'received')}
                                    className="btn btn-sm btn-ghost bg-base-200 hover:bg-base-300 rounded-xl font-bold text-base-content/70 text-xs"
                                >
                                    Decline
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => handleAction(req._id, 'cancelled', 'sent')}
                                className="col-span-2 btn btn-sm btn-outline btn-error hover:btn-error hover:text-white rounded-xl font-bold border-2 text-xs"
                            >
                                Cancel Request
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-base-200/50 flex font-sans overflow-hidden">
            <NavigationRail />

            <div className="flex-1 overflow-y-auto relative custom-scrollbar">

                <div className="max-w-7xl mx-auto p-4 md:p-8 pb-32">
                    <div className="flex flex-col md:flex-row justify-between mb-8 gap-6">
                        <div>
                            <h1 className="text-3xl font-black text-base-content mb-1 tracking-tight">Requests</h1>
                            <p className="text-base-content/60 text-sm">Manage your connections.</p>
                        </div>
                        <div role="tablist" className="tabs tabs-boxed items-center">
                            <a
                                role="tab"
                                className={`tab ${activeTab === 'received' ? 'tab-active' : ''}`}
                                onClick={() => setActiveTab('received')}
                            >
                                Received
                                {receivedRequests.length > 0 && (
                                    <span className="badge badge-sm ml-2">{receivedRequests.length}</span>
                                )}
                            </a>
                            <a
                                role="tab"
                                className={`tab ${activeTab === 'sent' ? 'tab-active' : ''}`}
                                onClick={() => setActiveTab('sent')}
                            >
                                Sent
                                {sentRequests.length > 0 && (
                                    <span className="badge badge-sm ml-2">{sentRequests.length}</span>
                                )}
                            </a>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-32">
                            <span className="loading loading-dots loading-lg text-primary scale-150"></span>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start animate-fade-in">
                            {activeTab === 'received' ? (
                                receivedRequests.length === 0 ? (
                                    <div className="w-full min-h-[50vh] flex flex-col items-center justify-center opacity-50">
                                        <div className="bg-base-100 w-16 h-16 rounded-full flex items-center justify-center shadow-md mb-3">
                                            <i className="fas fa-inbox text-2xl"></i>
                                        </div>
                                        <h3 className="text-lg font-bold">No received requests</h3>
                                        <p className="text-sm">Check back later!</p>
                                    </div>
                                ) : (
                                    receivedRequests.map(req => <RequestCard key={req._id} req={req} type="received" />)
                                )
                            ) : (
                                sentRequests.length === 0 ? (
                                    <div className="w-full min-h-[50vh] flex flex-col items-center justify-center opacity-50">
                                        <div className="bg-base-100 w-16 h-16 rounded-full flex items-center justify-center shadow-md mb-3">
                                            <i className="fas fa-paper-plane text-2xl"></i>
                                        </div>
                                        <h3 className="text-lg font-bold">No sent requests</h3>
                                        <p className="text-sm">Start discovering partners!</p>
                                    </div>
                                ) : (
                                    sentRequests.map(req => <RequestCard key={req._id} req={req} type="sent" />)
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default RequestsPage;
