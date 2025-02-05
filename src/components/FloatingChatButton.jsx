import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BsChatDotsFill } from 'react-icons/bs';

const FloatingChatButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/ai-chat')}
      className="fixed bottom-6 right-6 p-4 bg-secondary text-white rounded-full shadow-lg hover:bg-secondary/90 transition-all duration-300 z-50 flex items-center justify-center group"
    >
      <BsChatDotsFill className="text-2xl group-hover:scale-110 transition-transform duration-300" />
      <span className="absolute right-full mr-3 bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        Chat with AI Assistant
      </span>
    </button>
  );
};

export default FloatingChatButton; 