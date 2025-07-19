import { useNavigate } from "react-router-dom";
import "../styles/tutorial.css";
import bgImage from "../assets/bg.png"; // gunakan background yang sama

export default function TutorialPage() {
  const navigate = useNavigate();

  return (
    <div
      className="tutorial-container"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="overlay" />

      <div className="tutorial-content fade-in">
        <h2>📘 Cara Bermain</h2>
        <ul className="tutorial-list">
          <li>🎯 Drag bola ke atas untuk menentukan arah dan kekuatan.</li>
          <li>🏀 Bola akan meluncur mengikuti lintasan parabola.</li>
          <li>🎉 Masukkan bola ke ring untuk mendapatkan skor dan combo!</li>
          <li>❌ Jika gagal, combo akan di-reset.</li>
        </ul>
        <button onClick={() => navigate("/landing")} className="tutorial-btn">
          ⬅ Kembali ke Lobby
        </button>
      </div>
    </div>
  );
}
