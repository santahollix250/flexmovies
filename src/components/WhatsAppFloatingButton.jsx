import React, { useState, useEffect } from 'react';
import { FaWhatsapp, FaTimes, FaUsers, FaComment } from 'react-icons/fa';

const WhatsAppFloatingButton = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
            setIsMobile(mobileRegex.test(userAgent));
        };
        checkMobile();
    }, []);

    const whatsappLinks = {
        // FIXED: This is the correct format for WhatsApp channels
        group: "https://whatsapp.com/channel/0029Vb6gSfuFcowDBIM2rp2u",
        direct: "250783948792",
    };

    const openLink = (type) => {
        const url = type === 'group' ? whatsappLinks.group : whatsappLinks.direct;
        if (!url) return;

        if (type === 'group') {
            // For WhatsApp channels, use direct URL
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            // For direct chat
            const phoneNumber = url.replace(/\D/g, '');
            // Try multiple formats for better mobile compatibility
            const waUrl = `https://wa.me/${phoneNumber}`;
            window.open(waUrl, '_blank', 'noopener,noreferrer');
        }

        // Close the menu
        setTimeout(() => setIsExpanded(false), 100);
    };

    // Handle touch events properly on mobile
    const handleTouchStart = (e) => {
        e.stopPropagation();
    };

    return (
        <div className="fixed bottom-4 right-4 z-[9999]">
            {isExpanded && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/30 z-[9997]"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(false);
                        }}
                        onTouchStart={handleTouchStart}
                    />

                    {/* Buttons */}
                    <div className={`absolute ${isMobile ? 'bottom-16' : 'bottom-14'} right-0 mb-2 space-y-2 z-[9998]`}>
                        <a
                            href={whatsappLinks.group}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(false);
                            }}
                            onTouchStart={handleTouchStart}
                            className="flex items-center gap-2 bg-green-600 active:bg-green-700 text-white px-3 py-2.5 rounded-full shadow-xl text-xs w-full min-w-[140px] font-medium border border-green-400/30 cursor-pointer active:scale-95 transition-transform no-underline"
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                            <FaUsers className="text-white text-sm" />
                            <span>Join Channel</span>
                        </a>

                        <a
                            href={`https://wa.me/${whatsappLinks.direct.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(false);
                            }}
                            onTouchStart={handleTouchStart}
                            className="flex items-center gap-2 bg-blue-600 active:bg-blue-700 text-white px-3 py-2.5 rounded-full shadow-xl text-xs w-full min-w-[140px] font-medium border border-blue-400/30 cursor-pointer active:scale-95 transition-transform no-underline"
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                            <FaComment className="text-white text-sm" />
                            <span>Direct Chat</span>
                        </a>
                    </div>
                </>
            )}

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                }}
                onTouchStart={handleTouchStart}
                className="relative w-12 h-12 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer z-[9999]"
                style={{ WebkitTapHighlightColor: 'transparent' }}
                aria-label="WhatsApp options"
            >
                {isExpanded ? (
                    <FaTimes className="text-white text-lg" />
                ) : (
                    <>
                        <FaWhatsapp className="text-white text-xl" />
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                    </>
                )}
            </button>
        </div>
    );
};

export default WhatsAppFloatingButton;