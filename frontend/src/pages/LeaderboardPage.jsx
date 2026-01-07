import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import NavigationRail from '../components/NavigationRail';
import UserAvatar from '../components/UserAvatar';

const LeaderboardPage = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchLeaderboard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/api/chat/leaderboard');
            setLeaderboard(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base-100 flex">
            <NavigationRail />

            <div className="flex-1 p- overflow-y-auto">
                <div className="max-w-7xl mx-auto p-4 md:p-8 pb-32">
                    <div className="flex flex-col md:flex-row justify-between mb-8 gap-6">
                        <div>
                            <h1 className="text-3xl font-black text-base-content mb-1 tracking-tight">Leaderboards</h1>
                            <p className="text-base-content/60 text-sm">Top language exchange streaks in the community</p>
                        </div>

                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <span className="loading loading-spinner loading-lg text-accent"></span>
                        </div>
                    ) : (
                        <div className="bg-base-200 rounded-3xl shadow-xl overflow-hidden border border-base-content/5">
                            {leaderboard.length === 0 ? (
                                <div className="p-10 text-center opacity-50">
                                    <i className="fas fa-fire-extinguisher text-5xl mb-4"></i>
                                    <p>No streaks yet. Start chatting to make the list!</p>
                                </div>
                            ) : (
                                <table className="table w-full">
                                    <thead className="bg-base-300/50 text-base-content uppercase tracking-wider">
                                        <tr>
                                            <th className="text-center w-20">Rank</th>
                                            <th>Participants</th>
                                            <th>Languages</th>
                                            <th className="text-center">Streak</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaderboard.map((item, index) => {
                                            const p1 = item.participants[0];
                                            const p2 = item.participants[1];
                                            // Highlight top 3
                                            let rankClass = "font-bold opacity-50";
                                            if (index === 0) rankClass = "text-yellow-500 text-3xl";
                                            if (index === 1) rankClass = "text-gray-400 text-2xl";
                                            if (index === 2) rankClass = "text-amber-600 text-xl";

                                            return (
                                                <tr key={item._id} className="hover:bg-base-100 transition-colors border-b border-base-content/5 last:border-0">
                                                    <td className="text-center">
                                                        <div className={rankClass}>
                                                            {index < 3 ? <i className="fas fa-crown"></i> : `#${index + 1}`}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex -space-x-4">
                                                                <UserAvatar user={p1} size="w-12" className="z-10" innerClassName="ring ring-base-100 ring-offset-base-100" />
                                                                <UserAvatar user={p2} size="w-12" className="z-0" innerClassName="ring ring-base-100 ring-offset-base-100" />
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-lg">{p1.username} & {p2.username}</div>
                                                                <div className="text-xs opacity-50">Active Learners</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="flex gap-2">
                                                            {item.languages.map(l => (
                                                                <span key={l} className="badge badge-outline">{l}</span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="flex flex-col items-center">
                                                            <span className="font-black text-2xl text-orange-500 font-mono flex items-center gap-2">
                                                                {item.streak} <i className="fas fa-fire animate-pulse"></i>
                                                            </span>
                                                            <span className="text-[10px] uppercase opacity-60 font-bold">Days</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeaderboardPage;
