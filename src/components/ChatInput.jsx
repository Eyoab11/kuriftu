import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ChatInput = ({ onSubmit, initialRating, roomId }) => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(initialRating || null);

  const handleRating = (value) => {
    if (!initialRating) setRating(value);
  };

  const handleFeedbackChange = (e) => setFeedback(e.target.value);

  const getPriority = (rating) => {
    if (rating <= 2) return 'Low';
    if (rating === 3) return 'Medium';
    return 'High';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (feedback && (rating || initialRating)) {
      onSubmit({ rating: rating || initialRating, feedback, priority: getPriority(rating || initialRating) });
      setFeedback('');
      setRating(null);
    }
  };

  return (
    <div className="p-4 bg-gray-800 bg-opacity-90 rounded-t-lg shadow-md min-h-[3rem] border border-gray-700">
      {!initialRating && (
        <div className="text-center mb-2">
          <h3 className="text-lg font-semibold text-gray-300 mb-1">Rate Your Issue</h3>
          <div className="flex justify-center space-x-3">
            {[1, 2, 3, 4, 5].map((value) => (
              <div key={value} className="flex flex-col items-center">
                <motion.button
                  type="button"
                  onClick={() => handleRating(value)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl ${
                    rating === value
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-600 text-yellow-500 hover:bg-gray-500'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ★
                </motion.button>
                <span className="mt-1 text-xs text-gray-300">{getPriority(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          className="flex-1 p-1 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-200 bg-gray-700"
          placeholder="Type your message..."
          value={feedback}
          onChange={handleFeedbackChange}
        />
        <motion.button
          type="submit"
          className="bg-gray-600 text-gray-200 p-1 rounded-lg hover:bg-gray-500 transition duration-200 disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!roomId || !feedback || (!rating && !initialRating)}
        >
          Send
        </motion.button>
      </form>
    </div>
  );
};

export default ChatInput;