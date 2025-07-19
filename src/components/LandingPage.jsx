// src/pages/LandingPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../utils/firebaseConfig";
import "../styles/landing.css";
import bgImage from "../assets/bg.png"; // jika perlu preload atau validasi path

export default function LandingPage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <div className="landing-container" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="overlay" />

      {/* HEADER TOP */}
      <div className="top-bar">
        <h2 className="game-title">🏀 Hoop Shot</h2>
        <div className="top-right">
          {user ? (
            <>
              <button onClick={() => navigate("/profile")}>👤 Profile</button>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <button onClick={() => navigate("/login")}>Login</button>
          )}
        </div>
      </div>

      {/* CENTER BUTTONS */}
      <div className="center-content fade-in">
        <div className="button-group">
          <button onClick={() => navigate("/select-skin")}>Play</button>
          <button onClick={() => navigate("/tutorial")}>Tutorial</button>
          <button onClick={() => navigate("/leaderboard")}>Leaderboard</button>
        </div>
      </div>
    </div>
  );
}
