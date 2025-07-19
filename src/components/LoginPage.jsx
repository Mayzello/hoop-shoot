import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../utils/firebaseConfig";
import { ref, get, set, child } from "firebase/database";
import "../styles/login.css";
import bgImage from "../assets/bg.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const getUsernameFromEmail = (email) => {
    return email.split("@")[0];
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // Cek dan simpan ke Realtime DB jika belum ada
      const userRef = ref(db, "users/" + user.uid);
      const snapshot = await get(userRef);
      if (!snapshot.exists()) {
        await set(userRef, {
          email: user.email,
          username: getUsernameFromEmail(user.email),
          highScore: 0,
          lastScore: 0,
          selectedSkin: "default"
        });
      }

      navigate("/landing");
    } catch (err) {
      setErrorMsg("Email atau password salah.");
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Cek dan simpan ke Realtime DB jika belum ada
      const userRef = ref(db, "users/" + user.uid);
      const snapshot = await get(userRef);
      if (!snapshot.exists()) {
        await set(userRef, {
          email: user.email,
          username: user.displayName || "User",
          highScore: 0,
          lastScore: 0,
          selectedSkin: "default"
        });
      }

      navigate("/landing");
    } catch (err) {
      setErrorMsg("Gagal login dengan Google.");
    }
  };

  return (
    <div className="login-page" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="overlay" />
      <div className="login-box">
        <h2>🏀 Masuk ke Hoop Shot</h2>

        <form onSubmit={handleEmailLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn primary">Login</button>
        </form>

        <button onClick={handleGoogleLogin} className="btn google">
          🔵 Login dengan Google
        </button>

        {errorMsg && <p className="error">{errorMsg}</p>}

        <div className="extra-links">
          <Link to="/register">Buat Akun</Link>
          <span> | </span>
          <Link to="/forgot">Lupa Password?</Link>
        </div>

        <button onClick={() => navigate("/landing")} className="btn back-btn">
          ← Kembali
        </button>
      </div>
    </div>
  );
}
