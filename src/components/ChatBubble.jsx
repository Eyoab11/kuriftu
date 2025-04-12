import React from 'react';

const ChatBubble = ({ message, isUser = false }) => {
  return (
    <div
      className={`max-w-[70%] p-3 rounded-lg mb-2 shadow-md ${
        isUser 
          ? 'bg-gray-700 text-gray-200 ml-auto' 
          : 'bg-gray-600 text-gray-300'
      }`}
    >
      {message}
    </div>
  );
};

export default ChatBubble;