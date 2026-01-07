import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import NavigationRail from '../components/NavigationRail';
import UserAvatar from '../components/UserAvatar';

const DiscoveryPage = () => {
    const [matches, setMatches] = useState([]);
    const [filteredMatches, setFilteredMatches] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('All');
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { addToast } = useToast();

    useEffect(() => {
        fetchMatches();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        let result = matches;

        // Filter by Search Term
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(m =>
                m.username.toLowerCase().includes(lower) ||
                m.nativeLanguages.some(l => l.toLowerCase().includes(lower)) ||
                m.matchInfo.canTeachMe.some(l => l.toLowerCase().includes(lower))
            );
        }

        // Filter by Selected Language (Section)
        if (selectedLanguage !== 'All') {
            result = result.filter(m => m.matchInfo.canTeachMe.includes(selectedLanguage));
        }

        setFilteredMatches(result);
    }, [searchTerm, matches, selectedLanguage]);

    const fetchMatches = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/api/chat/matches');
            setMatches(data);
            setFilteredMatches(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const sendRequest = async (e, receiverId, teachLang, learnLang) => {
        e.stopPropagation(); // Prevent modal opening
        try {
            await api.post('/api/chat', {
                receiverId,
                teachLanguage: teachLang,
                learnLanguage: learnLang
            });

            setMatches(prev => prev.filter(m => m._id !== receiverId));
            addToast("Connection request sent!", "success");
        } catch (error) {
            console.error(error);
            addToast(error.response?.data?.message || "Failed to send request", "error");
        }
    };

    // Get unique languages I can learn from available matches
    const availableLanguages = ['All', ...new Set(matches.flatMap(m => m.matchInfo.canTeachMe))];

    return (
        <div className="h-screen bg-base-200/50 flex font-sans overflow-hidden">
            <NavigationRail />

            <div className="flex-1 overflow-y-auto overflow-x-hidden relative custom-scrollbar">

                <div className="max-w-7xl mx-auto p-4 md:p-8 pb-32">
                    {/* Header Section */}
                    <div className="flex flex-col xl:flex-row justify-between mb-8 gap-6">
                        <div>
                            <h1 className="text-3xl font-black text-base-content mb-1 tracking-tight">Discover</h1>
                            <p className="text-base-content/60 text-sm">Connect with language partners.</p>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                            {/* Search */}
                            <div className="flex items-center relative group w-full md:w-72">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="input input-md bg-gray-700 shadow-sm border-base-300 w-full pl-10 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-primary transition-colors text-sm"></i>
                            </div>
                        </div>
                    </div>

                    {/* Filter Pills */}
                    {availableLanguages.length > 2 && (
                        <div className="flex flex-wrap gap-2 mb-8">
                            {availableLanguages.map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => setSelectedLanguage(lang)}
                                    className={`btn btn-sm rounded-full border-0 px-4 font-bold transition-all ${selectedLanguage === lang
                                        ? 'bg-primary '
                                        : 'bg-base-100 text-base-content/70 hover:bg-base-200'}`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Content */}
                    {loading ? (
                        <div className="flex justify-center py-40">
                            <span className="loading loading-dots loading-lg text-primary scale-150"></span>
                        </div>
                    ) : (
                        <>
                            {filteredMatches.length === 0 ? (
                                <div className="text-center py-32 opacity-60 animate-fade-in">
                                    <div className="bg-base-100 w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-lg mb-4">
                                        <i className="fas fa-search text-3xl text-base-content/40"></i>
                                    </div>
                                    <h3 className="text-xl font-bold mb-1">No matches found</h3>
                                    <p className="text-sm">Try adjusting your filters.</p>
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    {[...new Set(filteredMatches.flatMap(m => m.matchInfo.canTeachMe))].map(lang => {
                                        // If filter is active, only show that language section
                                        if (selectedLanguage !== 'All' && lang !== selectedLanguage) return null;

                                        const sectionMatches = filteredMatches.filter(m => m.matchInfo.canTeachMe.includes(lang));

                                        if (sectionMatches.length === 0) return null;

                                        return (
                                            <div key={lang} className="animate-fade-in group/section">
                                                {/* Section Header */}
                                                <div className="flex items-center gap-3 mb-4 px-1">
                                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                        <i className="fas fa-graduation-cap"></i>
                                                    </div>
                                                    <div>
                                                        <h2 className="text-xl font-bold flex items-center gap-2 text-base-content">
                                                            {lang}
                                                        </h2>
                                                    </div>
                                                </div>

                                                {/* Horizontal Scroll Container */}
                                                <div className="relative -mx-4 px-4 md:-mx-8 md:px-8">
                                                    <div className="flex overflow-x-auto pb-8 pt-2 gap-4 snap-x scrollbar-hide px-2">
                                                        {sectionMatches.map((match, idx) => {
                                                            const teach = match.matchInfo.wantsToLearn[0];
                                                            // Find level for the language they want to learn
                                                            const levelInfo = match.learningLanguages?.find(l => l.language === teach);
                                                            const level = levelInfo ? levelInfo.level : 'Beginner';

                                                            return (
                                                                <div
                                                                    key={match._id}
                                                                    className="snap-center w-56 flex-shrink-0 relative"
                                                                    style={{ animationDelay: `${idx * 100}ms` }}
                                                                >
                                                                    <div className="group bg-base-100/80 backdrop-blur-sm rounded-3xl p-4 hover:shadow-xl transition-all duration-300 border border-base-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.02)] h-full flex flex-col items-center text-center cursor-pointer">

                                                                        {/* Avatar & Identity */}
                                                                        <div className="mb-3 relative">
                                                                            <UserAvatar user={match} size="w-16" />
                                                                        </div>

                                                                        <h2 className="text-base font-bold text-base-content mb-1 truncate w-full px-2 pb-2">{match.username}</h2>


                                                                        {/* Exchange Info - Compact Redesign */}
                                                                        <div className="w-full bg-base-200/40 rounded-xl p-3 mb-3 space-y-2">
                                                                            <div className="flex justify-between items-center text-xs">
                                                                                <div className="flex items-center gap-1.5 opacity-70">
                                                                                    <i className="fas fa-comment text-primary text-[10px]"></i>
                                                                                    <span className="font-semibold">Speaks</span>
                                                                                </div>
                                                                                <span className="font-bold text-primary">{lang}</span>
                                                                            </div>
                                                                            <div className="separator h-px bg-base-content/5 w-full"></div>
                                                                            <div className="flex justify-between items-center text-xs">
                                                                                <div className="flex items-center gap-1.5 opacity-70">
                                                                                    <i className="fas fa-graduation-cap text-secondary text-[10px]"></i>
                                                                                    <span className="font-semibold">Wants to Learn</span>
                                                                                </div>
                                                                                <span className="font-bold text-secondary">{teach}</span>
                                                                            </div>
                                                                        </div>

                                                                        {/* Action */}
                                                                        <div className="w-full mt-auto">
                                                                            <button
                                                                                onClick={(e) => sendRequest(e, match._id, teach, lang)}
                                                                                className="btn btn-primary btn-sm w-full rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all text-xs"
                                                                            >
                                                                                Connect
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    {/* Fade masks for scroll */}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DiscoveryPage;
