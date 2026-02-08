import React, { useState } from 'react';
import { FaWhatsapp, FaTimes, FaUsers, FaComment } from 'react-icons/fa';

const WhatsAppFloatingButton = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const whatsappLinks = {
        group: "https://whatsapp.com/channel/0029Vb6gSfuFcowDBIM2rp2u",
        direct: "https://wa.me/250783948792",
    };

    const openLink = (url) => {
        if (url && url !== "https://chat.whatsapp.com/YOUR_INVITE_CODE") {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Expanded Menu - Shows on both mobile and desktop when clicked */}
            {isExpanded && (
                <div className="absolute bottom-14 right-0 mb-2 space-y-2">
                    {/* Group Chat - Mobile friendly size */}
                    <button
                        onClick={() => {
                            openLink(whatsappLinks.group);
                            setIsExpanded(false); // Close menu after selection
                        }}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-full shadow-lg text-sm w-full min-w-[140px] active:scale-95 transition-transform"
                    >
                        <FaUsers className="text-white" />
                        <span>Join Group</span>
                    </button>

                    {/* Direct Chat - Mobile friendly size */}
                    <button
                        onClick={() => {
                            openLink(whatsappLinks.direct);
                            setIsExpanded(false); // Close menu after selection
                        }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg text-sm w-full min-w-[140px] active:scale-95 transition-transform"
                    >
                        <FaComment className="text-white" />
                        <span>Direct Chat</span>
                    </button>
                </div>
            )}

            {/* Main WhatsApp Button - Responsive size */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="relative w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
            >
                {/* WhatsApp Icon */}
                {isExpanded ? (
                    <FaTimes className="text-white text-lg md:text-xl" />
                ) : (
                    <>
                        <FaWhatsapp className="text-white text-xl md:text-2xl" />
                        {/* Notification dot */}
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    </>
                )}

                {/* Click instruction for mobile */}
                {!isExpanded && (
                    <div className="absolute -top-8 right-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                        Tap for options
                    </div>
                )}
            </button>

            {/* Backdrop to close menu when tapping outside (mobile only) */}
            {isExpanded && (
                <div
                    className="fixed inset-0 z-40 md:hidden"
                    onClick={() => setIsExpanded(false)}
                />
            )}
        </div>
    );
};

export default WhatsAppFloatingButton;