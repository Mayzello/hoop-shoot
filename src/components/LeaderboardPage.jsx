import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../utils/firebaseConfig"; // gunakan Realtime DB
import { ref, query, orderByChild, limitToFirst, onValue } from "firebase/database";
import "../styles/leaderboard.css";
import bgImage from "../assets/bg.png";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = () => {
      const usersRef = ref(db, "users");
      const leaderboardQuery = query(usersRef, orderByChild("highScore"), limitToFirst(100));

      onValue(leaderboardQuery, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const sorted = Object.entries(data)
            .map(([uid, user]) => ({
              username: user.username || "Unknown",
              highScore: user.highScore || 0,
            }))
            .sort((a, b) => b.highScore - a.highScore)
            .slice(0, 10); // ambil top 10 setelah diurutkan manual (karena limitToFirst ambil skor kecil dulu)

          setLeaderboard(sorted);
        } else {
          setLeaderboard([]);
        }
      });
    };

    fetchLeaderboard();
  }, []);

  return (
    <div
      className="leaderboard-container"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="overlay" />

      <div className="leaderboard-content fade-in">
        <h2>🏆 LEADERBOARD</h2>

        {leaderboard.length > 0 ? (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Nama</th>
                <th>High Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((user, index) => (
                <tr key={index}>
                  <td>
                    {index === 0
                      ? "🥇"
                      : index === 1
                      ? "🥈"
                      : index === 2
                      ? "🥉"
                      : `#${index + 1}`}
                  </td>
                  <td>{user.username}</td>
                  <td>{user.highScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Belum ada data skor.</p>
        )}

        <button onClick={() => navigate("/landing")} className="back-btn">
          ⬅ Kembali ke Lobby
        </button>
      </div>
    </div>
  );
}
