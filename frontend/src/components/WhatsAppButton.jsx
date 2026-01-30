import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { contactInfo } from '../data/mock';

const WhatsAppButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Show button immediately for testing, with animation
    setIsVisible(true);
  }, []);

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Hi! I would like to know more about your services.');
    window.open(`https://wa.me/${contactInfo.whatsapp.replace(/\+/g, '')}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50" style={{ display: isVisible ? 'block' : 'none' }}>
      <button
        onClick={handleWhatsAppClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={28} />
        
        {/* Pulse effect */}
        <span className="absolute inset-0 rounded-full bg-green-500 opacity-75 animate-ping"></span>
        
        {/* Tooltip */}
        {isHovered && (
          <div className="absolute bottom-full right-0 mb-2 w-48 bg-gray-900 text-white text-sm rounded-lg px-4 py-2 shadow-xl">
            <p className="font-semibold mb-1">Chat with us!</p>
            <p className="text-xs text-gray-300">Quick response guaranteed</p>
            <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
          </div>
        )}
      </button>
    </div>
  );
};

export default WhatsAppButton;
