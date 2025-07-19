import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../utils/firebaseConfig";
import "../styles/login.css";
import bgImage from "../assets/bg.png";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrorMsg("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Link reset password telah dikirim ke email kamu.");
    } catch (err) {
      setErrorMsg("Gagal mengirim email reset: " + err.message);
    }
  };

  return (
    <div
      className="login-page"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="overlay" />

      <div className="login-box">
        <h2>🔒 Reset Password</h2>

        <form onSubmit={handleReset}>
          <input
            type="email"
            placeholder="Masukkan email kamu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" className="btn primary">Kirim Link Reset</button>
        </form>

        {message && <p style={{ color: "#4caf50", marginTop: "1rem" }}>{message}</p>}
        {errorMsg && <p className="error">{errorMsg}</p>}

        <div className="extra-links">
          <Link to="/login">← Kembali ke Login</Link>
        </div>

        <button onClick={() => navigate("/landing")} className="btn back-btn">
          ← Kembali ke Halaman Utama
        </button>
      </div>
    </div>
  );
}
