import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const NavigationRail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const [requestCount, setRequestCount] = useState(0);

    useEffect(() => {
        fetchRequestCount();
        const interval = setInterval(fetchRequestCount, 30000); // Polling every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchRequestCount = async () => {
        try {
            const { data } = await api.get('/api/chat?type=pending');
            setRequestCount(data.length);
        } catch (error) {
            console.error("Failed to fetch notification count", error);
        }
    };

    // Check path for active state style
    const isActive = (path) => {
        if (path === '/' && location.pathname === '/') return true;
        if (path !== '/' && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <div className="w-20 bg-base-300 flex flex-col items-center py-6 gap-6 border-r border-base-content/10 h-[100vh]">
            {/* Logo or Brand Icon (Optional) */}
            <div className="mb-4">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />

            </div>

            {/* Navigation Items */}
            <div className="flex flex-col gap-4 flex-1 w-full items-center px-2">
                <button
                    onClick={() => navigate('/')}
                    className={`btn btn-circle w-12 h-12 ${isActive('/') ? 'btn-primary shadow-lg shadow-primary/30' : 'btn-ghost'}`}
                    title="Chats"
                >
                    <i className="fas fa-comments text-xl"></i>
                </button>

                <button
                    onClick={() => navigate('/discovery')}
                    className={`btn btn-circle w-12 h-12 ${isActive('/discovery') ? 'btn-secondary shadow-lg shadow-secondary/30' : 'btn-ghost'}`}
                    title="Discovery"
                >
                    <i className="fas fa-globe text-xl"></i>
                </button>

                <button
                    onClick={() => navigate('/requests')}
                    className={`btn btn-circle w-12 h-12 relative ${isActive('/requests') ? 'btn-info text-info-content shadow-lg shadow-info/30' : 'btn-ghost'}`}
                    title="Requests"
                >
                    <i className="fas fa-envelope text-xl"></i>
                    {requestCount > 0 && (
                        <span className="absolute -top-1 -right-1 badge badge-error badge-xs w-4 h-4 p-0">
                            {requestCount}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => navigate('/leaderboard')}
                    className={`btn btn-circle w-12 h-12 ${isActive('/leaderboard') ? 'btn-accent text-accent-content shadow-lg shadow-accent/30' : 'btn-ghost'}`}
                    title="Leaderboard"
                >
                    <i className="fas fa-trophy text-xl"></i>
                </button>
            </div>

            {/* Footer Items */}
            <div className="mt-auto flex flex-col gap-4">
                <button onClick={logout} className="btn btn-ghost btn-circle w-12 h-12 hover:bg-error/20 hover:text-error" title="Logout">
                    <i className="fas fa-sign-out-alt text-xl"></i>
                </button>
            </div>
        </div>
    );
};

export default NavigationRail;
