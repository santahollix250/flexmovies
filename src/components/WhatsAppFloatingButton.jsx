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
        group: "https://whatsapp.com/channel/0029Vb6gSfuFcowDBIM2rp2u",
        direct: "250783948792",
    };

    const openLink = (type) => {
        if (type === 'group') {
            const groupUrl = whatsappLinks.group;

            if (isMobile) {
                window.location.href = groupUrl;
            } else {
                window.open(groupUrl, '_blank');
            }
        } else {
            const phoneNumber = whatsappLinks.direct.replace(/\D/g, '');

            if (isMobile) {
                const userAgent = navigator.userAgent || navigator.vendor;
                if (/android/i.test(userAgent)) {
                    window.location.href = `intent://send?phone=${phoneNumber}#Intent;scheme=whatsapp;package=com.whatsapp;end`;
                } else if (/iPad|iPhone|iPod/i.test(userAgent)) {
                    window.location.href = `https://wa.me/${phoneNumber}`;
                } else {
                    window.location.href = `https://wa.me/${phoneNumber}`;
                }
            } else {
                window.open(`https://web.whatsapp.com/send?phone=${phoneNumber}`, '_blank');
            }
        }

        setIsExpanded(false);
    };

    // Handle main button click - toggle options
    const handleMainButtonClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    // Handle option button click
    const handleOptionClick = (e, type) => {
        e.preventDefault();
        e.stopPropagation();
        openLink(type);
    };

    return (
        <div className="fixed bottom-4 right-4 z-[9999]">
            {isExpanded && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/30 z-[9997]"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsExpanded(false);
                        }}
                    />

                    {/* Buttons Container */}
                    <div className={`absolute ${isMobile ? 'bottom-16' : 'bottom-14'} right-0 mb-2 space-y-2 z-[9998] min-w-[150px]`}>
                        <button
                            onClick={(e) => handleOptionClick(e, 'group')}
                            className="flex items-center gap-2 bg-green-600 active:bg-green-700 text-white px-4 py-3 rounded-full shadow-xl text-sm w-full font-medium border border-green-400/30 cursor-pointer active:scale-95 transition-all duration-200 hover:bg-green-700"
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                            <FaUsers className="text-white text-base" />
                            <span>Join Channel</span>
                        </button>

                        <button
                            onClick={(e) => handleOptionClick(e, 'direct')}
                            className="flex items-center gap-2 bg-blue-600 active:bg-blue-700 text-white px-4 py-3 rounded-full shadow-xl text-sm w-full font-medium border border-blue-400/30 cursor-pointer active:scale-95 transition-all duration-200 hover:bg-blue-700"
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                            <FaComment className="text-white text-base" />
                            <span>Direct Chat</span>
                        </button>
                    </div>
                </>
            )}

            {/* Main WhatsApp Button */}
            <button
                onClick={handleMainButtonClick}
                className="relative w-14 h-14 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer z-[9999] focus:outline-none"
                style={{ WebkitTapHighlightColor: 'transparent' }}
                aria-label="WhatsApp options"
            >
                {isExpanded ? (
                    <FaTimes className="text-white text-2xl" />
                ) : (
                    <>
                        <FaWhatsapp className="text-white text-3xl" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    </>
                )}
            </button>
        </div>
    );
};

export default WhatsAppFloatingButton;