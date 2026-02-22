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
        group: "https://whatsapp.com/channel/0029Vb6gSfuFcowDBIM2rp2u", // Join Channel/Group
        direct: "250783948792", // Direct chat number
    };

    const openLink = (type) => {
        const url = type === 'group' ? whatsappLinks.group : whatsappLinks.direct;
        if (!url) return;

        if (type === 'group') {
            // For group/channel links, just open directly
            window.open(url, '_blank');
        } else {
            // For direct chat, use the appropriate format based on device
            if (isMobile) {
                // On mobile, open WhatsApp app directly
                window.location.href = `https://wa.me/${url}`;
            } else {
                // On desktop, open WhatsApp Web
                window.open(`https://web.whatsapp.com/send?phone=${url}`, '_blank');
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
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-full shadow-lg text-sm w-full min-w-[140px] active:scale-95 transition-transform font-medium"
                    >
                        <FaUsers className="text-white text-sm" />
                        <span>Join Channel</span>
                    </button>
                    <button
                        onClick={() => openLink('direct')}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-full shadow-lg text-sm w-full min-w-[140px] active:scale-95 transition-transform font-medium"
                    >
                        <FaComment className="text-white text-sm" />
                        <span>Direct Chat</span>
                    </button>
                </div>
            )}

            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="relative w-14 h-14 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
            >
                {isExpanded ? (
                    <FaTimes className="text-white text-xl" />
                ) : (
                    <>
                        <FaWhatsapp className="text-white text-2xl" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    </>
                )}
            </button>

            {/* Backdrop for mobile */}
            {isExpanded && isMobile && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-20 z-40"
                    onClick={() => setIsExpanded(false)}
                    style={{ backdropFilter: 'blur(2px)' }}
                />
            )}
        </div>
    );
};

export default WhatsAppFloatingButton;