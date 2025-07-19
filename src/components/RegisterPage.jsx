import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth, db } from "../utils/firebaseConfig"; // gunakan db untuk Realtime DB
import { ref, set } from "firebase/database";
import "../styles/login.css";
import bgImage from "../assets/bg.png";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // Simpan data user ke Realtime Database
      await set(ref(db, "users/" + user.uid), {
        email: user.email,
        username: username,
        highScore: 0,
        lastScore: 0,
        selectedSkin: "default",
      });

      navigate("/landing");
    } catch (error) {
      setErrorMsg("Gagal daftar: " + error.message);
    }
  };

  const handleGoogleRegister = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Simpan data user ke Realtime Database
      await set(ref(db, "users/" + user.uid), {
        email: user.email,
        username: user.displayName || "User",
        highScore: 0,
        lastScore: 0,
        selectedSkin: "default",
      });

      navigate("/landing");
    } catch (error) {
      setErrorMsg("Gagal daftar dengan Google.");
    }
  };

  return (
    <div
      className="login-page"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="overlay" />

      <div className="login-box">
        <h2>📝 Daftar Akun</h2>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password (min 6 karakter)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn primary">Daftar</button>
        </form>

        <button onClick={handleGoogleRegister} className="btn google">
          🔵 Daftar dengan Google
        </button>

        {errorMsg && <p className="error">{errorMsg}</p>}

        <div className="extra-links">
          <Link to="/login">Sudah punya akun?</Link>
        </div>

        <button onClick={() => navigate("/landing")} className="btn back-btn">
          ← Kembali ke Halaman Utama
        </button>
      </div>
    </div>
  );
}
