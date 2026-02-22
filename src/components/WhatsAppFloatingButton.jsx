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
            window.open(url, '_blank');
        } else {
            const phoneNumber = url.replace(/\D/g, '');
            window.open(`https://wa.me/${phoneNumber}`, '_blank');
        }
        setIsExpanded(false);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {isExpanded && (
                <div className={`absolute ${isMobile ? 'bottom-14' : 'bottom-12'} right-0 mb-2 space-y-2`}>
                    <button
                        onClick={() => openLink('group')}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-full shadow-lg text-xs w-full min-w-[130px] active:scale-95 transition-all duration-200 font-medium"
                    >
                        <FaUsers className="text-white text-xs" />
                        <span>Join Channel</span>
                    </button>
                    <button
                        onClick={() => openLink('direct')}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-full shadow-lg text-xs w-full min-w-[130px] active:scale-95 transition-all duration-200 font-medium"
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
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                    </>
                )}
            </button>

            {isExpanded && isMobile && (
                <div
                    className="fixed inset-0 bg-black/20 z-40"
                    onClick={() => setIsExpanded(false)}
                />
            )}
        </div>
    );
};

export default WhatsAppFloatingButton;