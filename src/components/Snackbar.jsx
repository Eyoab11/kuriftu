import React from 'react';
import { motion } from 'framer-motion';

const Snackbar = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-4 right-4 bg-gray-700 text-gray-200 p-4 rounded-lg shadow-lg z-50"
    >
      Feedback sent successfully!
      <button onClick={onClose} className="ml-4 text-gray-300 hover:text-gray-100">
        ✕
      </button>
    </motion.div>
  );
};

export default Snackbar;