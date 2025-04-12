import React from 'react';
import { motion } from 'framer-motion';

const WaitingAnimation = () => {
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
    >
      <svg
        width="80"
        height="80"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#FFD700"
        strokeWidth="2"
      >
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21L12 17.77L5.82 21L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
    </motion.div>
  );
};

export default WaitingAnimation;