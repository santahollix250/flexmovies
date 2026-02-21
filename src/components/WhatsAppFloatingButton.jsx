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
        group: "https://chat.whatsapp.com/0029Vb6gSfuFcowDBIM2rp2u",
        direct: "250783948792",
    };

    const openLink = (type) => {
        const url = type === 'group' ? whatsappLinks.group : whatsappLinks.direct;
        if (!url) return;

        if (type === 'group') {
            if (isMobile) {
                window.location.href = url;
                setTimeout(() => window.open(url, '_blank'), 500);
            } else {
                window.open(url, '_blank', 'noopener,noreferrer');
            }
        } else {
            const whatsappUrl = isMobile
                ? `https://wa.me/${url}`
                : `https://web.whatsapp.com/send?phone=${url}`;

            if (isMobile) {
                window.location.href = whatsappUrl;
                setTimeout(() => window.open(whatsappUrl, '_blank'), 500);
            } else {
                window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
            }
        }
        setIsExpanded(false);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {isExpanded && (
                <div className={`absolute ${isMobile ? 'bottom-14' : 'bottom-12'} right-0 mb-2 space-y-2`}>
                    <button
                        onClick={() => openLink('group')}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-full shadow-lg text-xs w-full min-w-[130px] active:scale-95 transition-transform"
                    >
                        <FaUsers className="text-white text-xs" />
                        <span>Join Group</span>
                    </button>
                    <button
                        onClick={() => openLink('direct')}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-full shadow-lg text-xs w-full min-w-[130px] active:scale-95 transition-transform"
                    >
                        <FaComment className="text-white text-xs" />
                        <span>Direct Chat</span>
                    </button>
                </div>
            )}

            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="relative w-12 h-12 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
            >
                {isExpanded ? (
                    <FaTimes className="text-white text-lg" />
                ) : (
                    <>
                        <FaWhatsapp className="text-white text-xl" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    </>
                )}
            </button>

            {isExpanded && isMobile && (
                <div className="fixed inset-0 z-40" onClick={() => setIsExpanded(false)} />
            )}
        </div>
    );
};

export default WhatsAppFloatingButton;