import React from 'react';
import ChatBubble from './ChatBubble';

const ChatHistory = ({ messages }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-900">
      {messages.map((msg, index) => (
        <div key={index} className="flex flex-col items-start">
          <ChatBubble 
            message={msg.text} 
            isUser={msg.isUser} 
          />
          {msg.priority && (
            <span className={`text-xs text-gray-300 mt-1 ${msg.isUser ? 'self-end' : 'self-start'}`}>
              Priority: {msg.priority}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChatHistory;