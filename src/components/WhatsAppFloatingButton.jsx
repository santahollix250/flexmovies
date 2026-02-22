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
        // Your WhatsApp channel invite link
        group: "https://chat.whatsapp.com/0029Vb6gSfuFcowDBIM2rp2u", // Changed to invite link format
        direct: "250783948792",
    };

    const openLink = (type) => {
        if (type === 'group') {
            // For WhatsApp group/channel - use the direct invite link
            const groupUrl = whatsappLinks.group;

            if (isMobile) {
                // On mobile, try to open in WhatsApp app first
                window.location.href = groupUrl;
            } else {
                // On desktop, open in new tab
                window.open(groupUrl, '_blank');
            }
        } else {
            // For direct chat
            const phoneNumber = whatsappLinks.direct.replace(/\D/g, '');

            if (isMobile) {
                // On mobile, use intent for Android or universal link for iOS
                const userAgent = navigator.userAgent || navigator.vendor;
                if (/android/i.test(userAgent)) {
                    // Android intent
                    window.location.href = `intent://send?phone=${phoneNumber}#Intent;scheme=whatsapp;package=com.whatsapp;end`;
                } else if (/iPad|iPhone|iPod/i.test(userAgent)) {
                    // iOS universal link
                    window.location.href = `https://wa.me/${phoneNumber}`;
                } else {
                    // Fallback
                    window.location.href = `https://wa.me/${phoneNumber}`;
                }
            } else {
                // On desktop, open WhatsApp Web
                window.open(`https://web.whatsapp.com/send?phone=${phoneNumber}`, '_blank');
            }
        }

        // Close the menu
        setIsExpanded(false);
    };

    // Test function to verify link works
    const testLink = () => {
        console.log('Group link:', whatsappLinks.group);
        console.log('Is mobile:', isMobile);
    };

    return (
        <div className="fixed bottom-4 right-4 z-[9999]">
            {isExpanded && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/30 z-[9997]"
                        onClick={() => setIsExpanded(false)}
                    />

                    {/* Buttons */}
                    <div className={`absolute ${isMobile ? 'bottom-16' : 'bottom-14'} right-0 mb-2 space-y-2 z-[9998]`}>
                        <button
                            onClick={() => openLink('group')}
                            onTouchStart={() => openLink('group')}
                            className="flex items-center gap-2 bg-green-600 active:bg-green-700 text-white px-3 py-2.5 rounded-full shadow-xl text-xs w-full min-w-[140px] font-medium border border-green-400/30 cursor-pointer active:scale-95 transition-transform"
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                            <FaUsers className="text-white text-sm" />
                            <span>Join Channel</span>
                        </button>

                        <button
                            onClick={() => openLink('direct')}
                            onTouchStart={() => openLink('direct')}
                            className="flex items-center gap-2 bg-blue-600 active:bg-blue-700 text-white px-3 py-2.5 rounded-full shadow-xl text-xs w-full min-w-[140px] font-medium border border-blue-400/30 cursor-pointer active:scale-95 transition-transform"
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                            <FaComment className="text-white text-sm" />
                            <span>Direct Chat</span>
                        </button>
                    </div>
                </>
            )}

            <button
                onClick={() => {
                    setIsExpanded(!isExpanded);
                    testLink(); // Remove this in production
                }}
                onTouchStart={() => setIsExpanded(!isExpanded)}
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