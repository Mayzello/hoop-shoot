import { useNavigate } from "react-router-dom";
import { useState } from "react";
import CurtainTransition from "../components/CurtainTransition";
import "../styles/splash.css";
import ballImage from "../assets/ball.png";

export default function SplashScreen() {
  const navigate = useNavigate();
  const [tapped, setTapped] = useState(false);

  const handleClick = () => {
    if (!tapped) setTapped(true);
  };

  const handleCurtainFinish = () => {
    navigate("/loading");
  };

  return (
    <div className="splash-container" onClick={handleClick}>
      <div className="splash-overlay" />
      <h1 className="title">🏀 HOOP SHOT</h1>
      <img src={ballImage} alt="Ball" className={`ball ${tapped ? "no-bounce" : "bounce"}`} />
      {!tapped && <p className="tap-text">Tap to Start</p>}

      {/* Tirai muncul jika sudah tap */}
      <CurtainTransition trigger={tapped} onComplete={handleCurtainFinish} />
    </div>
  );
}
