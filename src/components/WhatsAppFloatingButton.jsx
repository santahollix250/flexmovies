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
                } else {
                    window.location.href = `https://wa.me/${phoneNumber}`;
                }
            } else {
                window.open(`https://web.whatsapp.com/send?phone=${phoneNumber}`, '_blank');
            }
        }
        setIsExpanded(false);
    };

    const handleMainButtonClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    const handleOptionClick = (e, type) => {
        e.preventDefault();
        e.stopPropagation();
        openLink(type);
    };

    return (
        <div className="fixed bottom-4 right-4 z-[9999]">
            {isExpanded && (
                <>
                    <div
                        className="fixed inset-0 bg-black/20 z-[9997]"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsExpanded(false);
                        }}
                    />

                    <div className={`absolute ${isMobile ? 'bottom-14' : 'bottom-12'} right-0 mb-2 space-y-2 z-[9998] min-w-[140px]`}>
                        <button
                            onClick={(e) => handleOptionClick(e, 'group')}
                            className="flex items-center gap-2 bg-green-600 active:bg-green-700 text-white px-3 py-2 rounded-full shadow-lg text-xs w-full font-medium border border-green-400/30 cursor-pointer active:scale-95 transition-all duration-200"
                        >
                            <FaUsers className="text-white text-xs" />
                            <span>Join Channel</span>
                        </button>

                        <button
                            onClick={(e) => handleOptionClick(e, 'direct')}
                            className="flex items-center gap-2 bg-blue-600 active:bg-blue-700 text-white px-3 py-2 rounded-full shadow-lg text-xs w-full font-medium border border-blue-400/30 cursor-pointer active:scale-95 transition-all duration-200"
                        >
                            <FaComment className="text-white text-xs" />
                            <span>Direct Chat</span>
                        </button>
                    </div>
                </>
            )}

            <button
                onClick={handleMainButtonClick}
                className="relative w-11 h-11 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer z-[9999] focus:outline-none"
                aria-label="WhatsApp options"
            >
                {isExpanded ? (
                    <FaTimes className="text-white text-lg" />
                ) : (
                    <>
                        <FaWhatsapp className="text-white text-xl" />
                        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
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