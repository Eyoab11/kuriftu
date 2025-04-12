import React from "react";
import { motion } from "framer-motion";

const Hero = ({ onChatWithAdminClick, onGiveFeedbackClick }) => {
  return (
    <div className="relative w-full h-[50vh] overflow-hidden bg-black md:h-[40vh] lg:h-[100vh]">
      {/* Hero Content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full w-full text-center px-4">
        <motion.h1
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white uppercase leading-tight tracking-tight"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Transform Guest Feedback with <br />
          <span className="bg-gradient-to-r from-futuristicpurple-600 via-futuristicpurple-400 to-futuristicpurple-800 bg-clip-text text-transparent">
            Kuriftu
          </span>{" "}
          <br />
          Real-Time Insights for Excellence
        </motion.h1>

        <motion.p
          className="mt-4 max-w-xl mx-auto text-sm md:text-base lg:text-lg text-white opacity-90"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          Leverage AI-powered sentiment analysis and real-time escalation to enhance guest satisfaction, ensuring swift responses and actionable insights for a winning demo.
        </motion.p>

        {/* Button Container */}
        <div className="mt-6 flex justify-between items-center w-full max-w-lg px-4">
          {/* Chat with Admin Button */}
          <motion.button
            className="px-4 py-2 sm:px-6 sm:py-3 md:px-6 md:py-3 bg-gradient-to-r from-futuristicpurple-600 via-futuristicpurple-400 to-futuristicpurple-800 rounded-full text-white font-semibold text-sm sm:text-base md:text-base hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            onClick={onChatWithAdminClick}
          >
            Chat with Admin
          </motion.button>

          {/* Give Feedback Button */}
          <motion.button
            className="px-4 py-2 sm:px-6 sm:py-3 md:px-6 md:py-3 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full text-gray-200 font-semibold text-sm sm:text-base md:text-base hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-gray-500/30"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            onClick={onGiveFeedbackClick}
          >
            Give Feedback
          </motion.button>
        </div>
      </div>

      {/* Semi-transparent overlay to dim stars */}
      <div className="absolute inset-0 bg-black/40 z-10" />
    </div>
  );
};

export default Hero;