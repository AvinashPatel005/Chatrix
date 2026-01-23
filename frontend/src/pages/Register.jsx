import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import bgImage from '../assets/i.png';

const AVAILABLE_LANGUAGES = [
    'English', 'Spanish', 'French', 'German', 'Italian',
    'Portuguese', 'Chinese', 'Japanese', 'Russian', 'Arabic', 'Hindi', 'Bengali', 'Odia (Oriya)', 'Korean'
];

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    // Core Data
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    // Complex Language Data
    const [nativeLanguages, setNativeLanguages] = useState([]);
    const [learningLanguages, setLearningLanguages] = useState([]);

    const [error, setError] = useState('');
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Toggle Handlers
    const toggleNative = (lang) => {
        if (nativeLanguages.includes(lang)) {
            setNativeLanguages(nativeLanguages.filter(l => l !== lang));
        } else {
            setNativeLanguages([...nativeLanguages, lang]);
        }
    };

    const toggleLearning = (lang) => {
        // Check if already selected
        const exists = learningLanguages.find(l => l.language === lang);
        if (exists) {
            setLearningLanguages(learningLanguages.filter(l => l.language !== lang));
        } else {
            // Default level to beginner for now to match UI simplicity
            setLearningLanguages([...learningLanguages, { language: lang, level: 'beginner' }]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (nativeLanguages.length === 0 || learningLanguages.length === 0) {
            setError('Please add at least one native and one learning language.');
            return;
        }

        try {
            await register({
                ...formData,
                nativeLanguages, // Map to codes if needed, for now standardizing on Title Case strings
                learningLanguages
            });
            navigate('/');
        } catch (err) {
            setError('Registration failed. Try again.');
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-base-300 flex items-center justify-center py-12 px-4">
            <div className="card w-full max-w-4xl bg-base-100 shadow-2xl overflow-hidden grid lg:grid-cols-2">
                {/* Visual Side */}
                <div
                    className="relative bg-primary text-primary-content flex flex-col justify-end"
                    style={{
                        backgroundImage: `url(${bgImage})`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'top center',
                        backgroundRepeat: 'no-repeat'
                    }}
                >
                    {/* Spacer to reserve image space */}
                    <div className="h-64 sm:h-72 lg:h-80"></div>

                    {/* Text Section with Background */}
                    <div className="bg-primary p-10 text-center lg:text-left">
                        <h1 className="text-4xl font-bold mb-4">Welcome to Chatrix</h1>

                        <p className="text-lg opacity-90">
                            Share the languages you speak and learn with people who match your goals.
                        </p>

                        <div className="mt-8 space-y-2 opacity-80 text-sm">
                            <div className="flex items-center gap-2 justify-center lg:justify-start">
                                <i className="fas fa-check-circle"></i> Find the right language partners
                            </div>
                            <div className="flex items-center gap-2 justify-center lg:justify-start">
                                <i className="fas fa-check-circle"></i> Build real one-to-one connections
                            </div>
                            <div className="flex items-center gap-2 justify-center lg:justify-start">
                                <i className="fas fa-check-circle"></i> Chat privately and comfortably
                            </div>
                        </div>
                    </div>
                </div>


                {/* Form Side */}
                <form onSubmit={handleSubmit} className="p-8 lg:p-10 flex flex-col gap-6 overflow-y-auto max-h-[90vh]">
                    <h2 className="text-2xl font-bold text-base-content">Create Account</h2>
                    {error && <div className="alert alert-error text-sm py-2">{error}</div>}

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text">Username</span></label>
                            <input name="username" onChange={handleChange} className="input input-bordered" required />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Email</span></label>
                            <input name="email" type="email" onChange={handleChange} className="input input-bordered" required />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Password</span></label>
                            <input name="password" type="password" onChange={handleChange} className="input input-bordered" required />
                        </div>
                    </div>

                    <div className="divider">LANGUAGES</div>

                    {/* Native Languages */}
                    <div className="form-control">
                        <label className="label"><span className="label-text font-bold">I speak (Native)</span></label>
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_LANGUAGES.map(lang => (
                                <button
                                    key={`native-${lang}`}
                                    type="button"
                                    onClick={() => toggleNative(lang)}
                                    className={`btn btn-sm ${nativeLanguages.includes(lang) ? 'btn-primary' : 'btn-ghost border-base-300'}`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Learning Languages */}
                    <div className="form-control">
                        <label className="label"><span className="label-text font-bold">I want to learn</span></label>
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_LANGUAGES.map(lang => {
                                const isSelected = learningLanguages.some(l => l.language === lang);
                                return (
                                    <button
                                        key={`learn-${lang}`}
                                        type="button"
                                        onClick={() => toggleLearning(lang)}
                                        className={`btn btn-sm ${isSelected ? 'btn-secondary' : 'btn-ghost border-base-300'}`}
                                    >
                                        {lang}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="form-control mt-6">
                        <button type="submit" className="btn btn-neutral w-full">Complete Registration</button>
                    </div>

                    <p className="text-center text-sm">
                        Existing user? <Link to="/login" className="link link-primary">Log in</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
