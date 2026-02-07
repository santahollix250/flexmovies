import React, { useState } from 'react';
import { FaWhatsapp, FaTimes, FaUsers, FaComment } from 'react-icons/fa';

const WhatsAppFloatingButton = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    // 🔥 REPLACE THESE WITH YOUR ACTUAL WHATSAPP LINKS 🔥
    const whatsappLinks = {
        // WhatsApp Group Link
        group: "https://whatsapp.com/channel/0029Vb6gSfuFcowDBIM2rp2u",

        // WhatsApp Direct Chat (your phone number)
        direct: "https://wa.me/250783948792", // Format: https://wa.me/250783948792

        // WhatsApp Business (optional)
        business: "https://wa.me/250783948792?text=Hello%20Agasobanuye%20Flex%20Zone%21",
    };

    const openLink = (url) => {
        if (url && url !== "https://chat.whatsapp.com/YOUR_INVITE_CODE") {
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            alert('WhatsApp link not configured yet! Please update the WhatsApp link in WhatsAppFloatingButton.jsx');
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Expanded Menu */}
            {isExpanded && (
                <div className="absolute bottom-14 right-0 mb-2 space-y-2">
                    {/* Group Chat Option */}
                    <button
                        onClick={() => openLink(whatsappLinks.group)}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-3 py-2 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl group animate-slide-up"
                        style={{ animationDelay: '0.1s' }}
                    >
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <FaUsers className="text-white text-sm" />
                        </div>
                        <div className="text-left">
                            <div className="font-semibold text-sm">Join Group</div>
                            <div className="text-xs opacity-90">Community</div>
                        </div>
                    </button>

                    {/* Direct Chat Option */}
                    <button
                        onClick={() => openLink(whatsappLinks.direct)}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-3 py-2 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl group animate-slide-up"
                        style={{ animationDelay: '0.2s' }}
                    >
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <FaComment className="text-white text-sm" />
                        </div>
                        <div className="text-left">
                            <div className="font-semibold text-sm">Direct Chat</div>
                            <div className="text-xs opacity-90">Get Support</div>
                        </div>
                    </button>
                </div>
            )}

            {/* Main WhatsApp Button - Smaller Size */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="relative w-14 h-14 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 rounded-full shadow-2xl flex items-center justify-center transform transition-all duration-300 hover:scale-110 group"
            >
                {/* Notification Badge - Smaller */}
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-white text-xs font-bold">!</span>
                </div>

                {/* WhatsApp Icon - Smaller */}
                {isExpanded ? (
                    <FaTimes className="text-white text-xl transition-transform duration-300 rotate-180" />
                ) : (
                    <>
                        <FaWhatsapp className="text-white text-2xl transition-transform duration-300 group-hover:scale-110" />
                        {/* Pulsing Effect - Smaller */}
                        <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20"></div>
                    </>
                )}

                {/* Tooltip - Right side tooltip since button is on right */}
                <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    Chat with us
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-8 border-transparent border-l-black"></div>
                </div>
            </button>

            {/* Connection Status - Smaller and repositioned */}
            <div className="absolute -bottom-6 right-0 left-0 text-center">
                <div className={`text-xs ${whatsappLinks.group !== "https://chat.whatsapp.com/YOUR_INVITE_CODE" ? 'text-green-400' : 'text-amber-400'}`}>
                    {whatsappLinks.group !== "https://chat.whatsapp.com/YOUR_INVITE_CODE" ? '✓ Connected' : '⚠️ Configure'}
                </div>
            </div>

            {/* Add CSS for animation */}
            <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
      `}</style>
        </div>
    );
};

// Fixed export statement - was misspelled "defult"
export default WhatsAppFloatingButton;