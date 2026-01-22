import React from 'react';

const tailwindBgClasses = [
    // Reds / Oranges
    "bg-red-400", "bg-red-500", "bg-red-600",
    "bg-orange-400", "bg-orange-500", "bg-orange-600",
    "bg-amber-400", "bg-amber-500", "bg-amber-600",
    "bg-yellow-400", "bg-yellow-500", "bg-yellow-600",

    // Greens
    "bg-lime-400", "bg-lime-500", "bg-lime-600",
    "bg-green-400", "bg-green-500", "bg-green-600",
    "bg-emerald-400", "bg-emerald-500", "bg-emerald-600",
    "bg-teal-400", "bg-teal-500", "bg-teal-600",

    // Blues
    "bg-cyan-400", "bg-cyan-500", "bg-cyan-600",
    "bg-sky-400", "bg-sky-500", "bg-sky-600",
    "bg-blue-400", "bg-blue-500", "bg-blue-600",
    "bg-indigo-400", "bg-indigo-500", "bg-indigo-600",

    // Purples / Pinks
    "bg-violet-400", "bg-violet-500", "bg-violet-600",
    "bg-purple-400", "bg-purple-500", "bg-purple-600",
    "bg-fuchsia-400", "bg-fuchsia-500", "bg-fuchsia-600",
    "bg-pink-400", "bg-pink-500", "bg-pink-600",
    "bg-rose-400", "bg-rose-500", "bg-rose-600"
];


const getAvatarColor = (id) => {
    if (!id) return "bg-gray-500";

    let hash = 2166136261; // FNV offset basis
    for (let i = 0; i < id.length; i++) {
        hash ^= id.charCodeAt(i);
        hash +=
            (hash << 1) +
            (hash << 4) +
            (hash << 7) +
            (hash << 8) +
            (hash << 24);
    }

    const index = Math.abs(hash) % tailwindBgClasses.length;
    return tailwindBgClasses[index];
};


const UserAvatar = ({ user, size = "w-10", className = "", innerClassName = "" }) => {
    if (!user) return <div className={`${size} bg-gray-300 rounded-full`}></div>;

    const initials = user.username ? user.username.slice(0, 2).toUpperCase() : '??';
    const bgClass = getAvatarColor(user._id || user.username);

    return (
        <div className={`avatar placeholder ${className}`}>
            <div
                className={`${size} rounded-full text-white flex items-center justify-center font-bold ${bgClass} ${innerClassName}`}
            >
                <span>{initials}</span>
            </div>
        </div>
    );
};

export default UserAvatar;
