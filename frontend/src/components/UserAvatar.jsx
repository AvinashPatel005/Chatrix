import React from 'react';

const tailwindBgClasses = [
    "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-yellow-500", "bg-lime-500",
    "bg-green-500", "bg-emerald-500", "bg-teal-500", "bg-cyan-500", "bg-sky-500",
    "bg-blue-500", "bg-indigo-500", "bg-violet-500", "bg-purple-500", "bg-fuchsia-500",
    "bg-pink-500", "bg-rose-500"
];

const getAvatarColor = (id) => {
    if (!id) return "bg-gray-500";
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
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
