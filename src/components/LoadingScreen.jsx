import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/loading.css";
import ballImage from "../assets/ball.png";

export default function LoadingScreen() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => navigate("/landing"), 500);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="loading-container">
      <div className="loading-overlay" />
      <img src={ballImage} alt="Loading Ball" className="loading-ball" />
      <p className="loading-text">Loading... {progress}%</p>
    </div>
  );
}
