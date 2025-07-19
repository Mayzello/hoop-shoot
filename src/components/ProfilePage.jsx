import { useEffect, useState } from "react";
import { auth, db } from "../utils/firebaseConfig"; // gunakan db untuk Realtime DB
import { useNavigate } from "react-router-dom";
import { ref, get } from "firebase/database";
import "../styles/profile.css";
import bgImage from "../assets/bg.png";

export default function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate("/login");
      return;
    }

    const userRef = ref(db, "users/" + user.uid);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        setUserData(snapshot.val());
      }
    });
  }, [navigate]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  return (
    <div
      className="profile-container"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="overlay" />

      <div className="profile-content fade-in">
        <h2>👤 PROFIL PEMAIN</h2>

        {userData ? (
          <div className="profile-card">
            <p><strong>Nama:</strong> {userData.username}</p>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>High Score:</strong> {userData.highScore ?? 0}</p>
            <p><strong>Skor Terakhir:</strong> {userData.lastScore ?? 0}</p>

            <div className="profile-buttons">
              <button onClick={() => navigate("/landing")}>🏠 Kembali ke Lobby</button>
              <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}
