import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const EditProfileModal = ({ isOpen, onClose }) => {
    const { user, updateUser } = useAuth();
    const { addToast } = useToast();
    const [username, setUsername] = useState('');
    const [nativeLanguages, setNativeLanguages] = useState([]);
    const [learningLanguages, setLearningLanguages] = useState([]);
    const [loading, setLoading] = useState(false);

    // List of common languages for selection
    const commonLanguages = [
        'English', 'Spanish', 'French', 'German', 'Italian',
        'Portuguese', 'Chinese', 'Japanese', 'Russian', 'Arabic', 'Hindi', 'Bengali', 'Odia (Oriya)', 'Korean'
    ];
    useEffect(() => {
        if (user && isOpen) {
            setUsername(user.username || '');
            setNativeLanguages(user.nativeLanguages || []);
            setLearningLanguages(user.learningLanguages?.map(l => l.language) || []);
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleSave = async () => {
        try {
            setLoading(true);
            const payload = {
                username,
                nativeLanguages,
                learningLanguages: learningLanguages.map(lang => ({
                    language: lang,
                    level: user.learningLanguages?.find(l => l.language === lang)?.level || 'beginner'
                }))
            };

            const { data } = await api.put('/api/auth/profile', payload);
            updateUser(data);
            addToast("Profile updated successfully", "success");
            onClose();
        } catch (error) {
            console.error('Failed to update profile', error);
            addToast('Failed to update profile', "error");
        } finally {
            setLoading(false);
        }
    };

    const toggleNative = (lang) => {
        if (nativeLanguages.includes(lang)) {
            setNativeLanguages(nativeLanguages.filter(l => l !== lang));
        } else {
            setNativeLanguages([...nativeLanguages, lang]);
        }
    };

    const toggleLearning = (lang) => {
        if (learningLanguages.includes(lang)) {
            setLearningLanguages(learningLanguages.filter(l => l !== lang));
        } else {
            setLearningLanguages([...learningLanguages, lang]);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-base-100 p-6 rounded-2xl shadow-xl w-full max-w-lg border border-base-300">
                <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

                <div className="space-y-4">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">Username</span>
                        </label>
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">I Speak (Native)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {commonLanguages.map(lang => (
                                <button
                                    key={`native-${lang}`}
                                    onClick={() => toggleNative(lang)}
                                    className={`btn btn-sm ${nativeLanguages.includes(lang) ? 'btn-primary' : 'btn-ghost border-base-300'}`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">I Want to Learn</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {commonLanguages.map(lang => (
                                <button
                                    key={`learn-${lang}`}
                                    onClick={() => toggleLearning(lang)}
                                    className={`btn btn-sm ${learningLanguages.includes(lang) ? 'btn-secondary' : 'btn-ghost border-base-300'}`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="modal-action mt-8">
                    <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
                    <button className="btn btn-primary px-8" onClick={handleSave} disabled={loading}>
                        {loading ? <span className="loading loading-spinner"></span> : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;
