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
        <div className="fixed bottom-6 left-6 z-50">
            {/* Expanded Menu */}
            {isExpanded && (
                <div className="absolute bottom-16 left-0 mb-3 space-y-3">
                    {/* Group Chat Option */}
                    <button
                        onClick={() => openLink(whatsappLinks.group)}
                        className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-4 py-3 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl group animate-slide-up"
                        style={{ animationDelay: '0.1s' }}
                    >
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <FaUsers className="text-white text-lg" />
                        </div>
                        <div className="text-left">
                            <div className="font-semibold">Join Our Group</div>
                            <div className="text-xs opacity-90">Connect with community</div>
                        </div>
                    </button>

                    {/* Direct Chat Option */}
                    <button
                        onClick={() => openLink(whatsappLinks.direct)}
                        className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 py-3 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl group animate-slide-up"
                        style={{ animationDelay: '0.2s' }}
                    >
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <FaComment className="text-white text-lg" />
                        </div>
                        <div className="text-left">
                            <div className="font-semibold">Chat Directly</div>
                            <div className="text-xs opacity-90">Get instant support</div>
                        </div>
                    </button>
                </div>
            )}

            {/* Main WhatsApp Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="relative w-16 h-16 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 rounded-full shadow-2xl flex items-center justify-center transform transition-all duration-300 hover:scale-110 group"
            >
                {/* Notification Badge */}
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-white text-xs font-bold">!</span>
                </div>

                {/* WhatsApp Icon */}
                {isExpanded ? (
                    <FaTimes className="text-white text-2xl transition-transform duration-300 rotate-180" />
                ) : (
                    <>
                        <FaWhatsapp className="text-white text-3xl transition-transform duration-300 group-hover:scale-110" />
                        {/* Pulsing Effect */}
                        <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20"></div>
                    </>
                )}

                {/* Tooltip */}
                <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-black text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    Chat with us on WhatsApp
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-8 border-transparent border-l-black"></div>
                </div>
            </button>

            {/* Connection Status */}
            <div className="absolute -bottom-8 left-0 right-0 text-center">
                <div className={`text-xs font-medium ${whatsappLinks.group !== "https://chat.whatsapp.com/YOUR_INVITE_CODE" ? 'text-green-400' : 'text-amber-400'}`}>
                    {whatsappLinks.group !== "https://chat.whatsapp.com/YOUR_INVITE_CODE" ? '✓ WhatsApp Connected' : '⚠️ Configure WhatsApp'}
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

export default WhatsAppFloatingButton;