import React, { useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';
import * as THREE from 'three';
import ChatInput from '../components/ChatInput';
import ChatHistory from '../components/ChatHistory';
import WaitingAnimation from '../components/WaitingAnimation';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

const FeedbackPage = () => {
  const [rating, setRating] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [messages, setMessages] = useState([]);
  const [waiting, setWaiting] = useState(false);
  const [sendSnackbar, setSendSnackbar] = useState(false);
  const [receiveSnackbar, setReceiveSnackbar] = useState(false);
  const [showChatForm, setShowChatForm] = useState(false);
  const [showOneTimeForm, setShowOneTimeForm] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [isRoomLoading, setIsRoomLoading] = useState(false);
  const sendSound = new Howl({ src: ['/send.mp3'], volume: 0.7 });
  const clickSound = new Howl({ src: ['/click.mp3'], volume: 0.7 });
  const backgroundRef = useRef(null);
  const navigate = useNavigate();

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
      }
    };
    checkAuth();
  }, [navigate]);

  // Three.js starfield animation
  useEffect(() => {
    const container = backgroundRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1000;
    const positions = [];
    const colors = [];

    for (let i = 0; i < starCount; i++) {
      positions.push(
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000
      );
      colors.push(
        0.9 + Math.random() * 0.1,
        0.7 + Math.random() * 0.3,
        0.1 + Math.random() * 0.2
      );
    }

    starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    starGeometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);
      stars.rotation.x += 0.0005;
      stars.rotation.y += 0.0005;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Setup room when chat form opens
  useEffect(() => {
    if (showChatForm) {
      const setupRoom = async () => {
        setIsRoomLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          setShowChatForm(false);
          setIsRoomLoading(false);
          return;
        }

        let { data: room, error: roomError } = await supabase
          .from('rooms')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (roomError && roomError.code !== 'PGRST116') {
          console.error('Error fetching room:', roomError);
          setIsRoomLoading(false);
          return;
        }

        if (!room) {
          const { data: newRoom, error: createError } = await supabase
            .from('rooms')
            .insert({ user_id: user.id })
            .select('id')
            .single();
          if (createError) {
            console.error('Error creating room:', createError);
            setIsRoomLoading(false);
            return;
          }
          room = newRoom;
        }

        setRoomId(room.id);
        setIsRoomLoading(false);
      };

      setupRoom();
    } else {
      setRoomId(null);
    }
  }, [showChatForm, navigate]);

  // Real-time subscription for chat messages
  useEffect(() => {
    if (roomId && showChatForm) {
      // Fetch initial messages for the room
      const fetchMessages = async () => {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('room_id', roomId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching messages:', error);
        } else {
          console.log('Fetched messages:', data); // Debug log
          setMessages(data.map(msg => ({
            text: msg.message,
            isUser: msg.is_user,
            priority: msg.priority,
          })));
        }
      };
      fetchMessages();

      // Subscribe to new messages in the room
      const channel = supabase
        .channel(`chat-room-${roomId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` },
          (payload) => {
            console.log('New message received:', payload); // Debug log
            setMessages((prev) => [
              ...prev,
              {
                text: payload.new.message,
                isUser: payload.new.is_user,
                priority: payload.new.priority,
              },
            ]);
            if (!payload.new.is_user) {
              setWaiting(false);
              setReceiveSnackbar(true);
              clickSound.play();
              setTimeout(() => {
                setReceiveSnackbar(false);
              }, 3000);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [roomId, showChatForm]);

  const handleChatSubmit = async (data) => {
    if (!roomId || isRoomLoading) {
      console.error('Room not ready');
      return;
    }

    setWaiting(true);
    setSendSnackbar(true);
    sendSound.play();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user logged in');
      setWaiting(false);
      setSendSnackbar(false);
      navigate('/login');
      return;
    }

    // Insert user message
    const { data: insertedData, error: insertError } = await supabase
      .from('chat_messages')
      .insert({
        room_id: roomId,
        user_id: user.id,
        message: data.feedback,
        is_user: true,
        priority: data.priority,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting message:', insertError);
      setWaiting(false);
      setSendSnackbar(false);
      return;
    }

    console.log('Inserted message:', insertedData); // Debug log

    // Append message locally for immediate UI update
    setMessages((prev) => [
      ...prev,
      {
        text: data.feedback,
        isUser: true,
        priority: data.priority,
      },
    ]);

    setTimeout(() => {
      setSendSnackbar(false);
    }, 2000);
  };

  const handleOneTimeSubmit = async (e) => {
    e.preventDefault();
    if (rating && feedbackText) {
      setSendSnackbar(true);
      sendSound.play();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user logged in');
        setSendSnackbar(false);
        navigate('/login');
        return;
      }

      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          rating,
          feedback_text: feedbackText,
        });

      if (error) {
        console.error('Error inserting feedback:', error);
        setSendSnackbar(false);
        return;
      }

      setTimeout(() => {
        setSendSnackbar(false);
        setRating(null);
        setFeedbackText('');
      }, 2000);
    }
  };

  const handleChatWithAdminClick = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }
    setShowChatForm((prev) => !prev);
  };

  const handleGiveFeedbackClick = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }
    setShowOneTimeForm((prev) => !prev);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Three.js background with black background */}
      <div ref={backgroundRef} className="fixed inset-0 z-0 w-full h-full bg-black"></div>

      {/* Semi-transparent overlay to dim the stars */}
      <div className="fixed inset-0 z-1 bg-black/40" />

      {/* Hero Section at the Top */}
      <div className="relative z-20">
        <Hero
          onChatWithAdminClick={handleChatWithAdminClick}
          onGiveFeedbackClick={handleGiveFeedbackClick}
          showChatForm={showChatForm}
          showOneTimeForm={showOneTimeForm}
        />
      </div>

      {/* One-Time Feedback Form */}
      {showOneTimeForm && (
        <motion.div
          className="relative z-40 w-full max-w-md mx-auto mt-2 sm:mt-4 md:mt-6 bg-gray-900/90 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-gray-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl font-bold text-gray-200 mb-4 text-center">Provide Feedback</h2>
          <form onSubmit={handleOneTimeSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Rating</label>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl ${
                      rating >= star ? 'text-yellow-500' : 'text-gray-500'
                    } hover:text-yellow-400`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ★
                  </motion.button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Feedback</label>
              <textarea
                className="w-full p-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-200 bg-gray-700"
                placeholder="Type your feedback..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows="4"
              />
            </div>
            <motion.button
              type="submit"
              className="w-full bg-gray-600 text-gray-200 py-2 rounded-lg hover:bg-gray-500 transition duration-200 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!rating || !feedbackText}
            >
              Submit
            </motion.button>
          </form>
        </motion.div>
      )}

      {/* Chat-based Feedback Form */}
      {showChatForm && (
        <motion.div
          className="relative z-30 flex flex-col h-screen max-w-lg mx-auto bg-gray-900/90 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden mt-0  border border-gray-800"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.5 }}
        >
          <header className="bg-gradient-to-r from-gray-800 to-gray-900 text-gray-200 p-4 text-center text-xl font-bold shadow-md">
            Chat with Admin
          </header>
          <div className="flex-1 flex flex-col overflow-hidden text-gray-300">
            {isRoomLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <WaitingAnimation />
              </div>
            ) : (
              <>
                <ChatHistory messages={messages} />
                {waiting && <WaitingAnimation />}
                <ChatInput onSubmit={handleChatSubmit} initialRating={rating || null} roomId={roomId} />
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Snackbar notifications */}
      {sendSnackbar && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          className="fixed top-6 right-6 bg-gray-700 text-gray-200 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2"
          style={{ maxWidth: 'calc(100% - 2rem)' }}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="#FFD700" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>Message Sent Successfully</span>
        </motion.div>
      )}
      {receiveSnackbar && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          className="fixed top-6 right-6 bg-gray-700 text-gray-200 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2"
          style={{ maxWidth: 'calc(100% - 2rem)' }}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="#FFD700" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Admin Response Received</span>
        </motion.div>
      )}
    </div>
  );
};

export default FeedbackPage;