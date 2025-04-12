import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import FeedbackPage from './pages/FeedbackPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;