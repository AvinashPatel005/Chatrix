import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
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

    const isActive = (path) => {
        if (path === '/' && location.pathname === '/') return true;
        if (path !== '/' && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-base-100/80 backdrop-blur-lg border-t border-base-content/5 pb-safe safe-area-bottom">
            <div className="flex justify-around items-center p-2">
                <button
                    onClick={() => navigate('/')}
                    className={`btn btn-ghost btn-circle ${isActive('/') ? 'text-primary bg-primary/10' : 'text-base-content/50'}`}
                >
                    <i className="fas fa-comments text-xl"></i>
                </button>
                <button
                    onClick={() => navigate('/discovery')}
                    className={`btn btn-ghost btn-circle ${isActive('/discovery') ? 'text-secondary bg-secondary/10' : 'text-base-content/50'}`}
                >
                    <i className="fas fa-globe text-xl"></i>
                </button>
                <button
                    onClick={() => navigate('/requests')}
                    className={`btn btn-ghost btn-circle relative ${isActive('/requests') ? 'text-info bg-info/10' : 'text-base-content/50'}`}
                >
                    <i className="fas fa-envelope text-xl"></i>
                    {requestCount > 0 && (
                        <span className="absolute top-2 right-2 badge badge-error badge-xs w-2 h-2 p-0 border border-base-100"></span>
                    )}
                </button>
                <button
                    onClick={() => navigate('/leaderboard')}
                    className={`btn btn-ghost btn-circle ${isActive('/leaderboard') ? 'text-accent bg-accent/10' : 'text-base-content/50'}`}
                >
                    <i className="fas fa-trophy text-xl"></i>
                </button>
            </div>
        </div>
    );
};

export default BottomNav;
