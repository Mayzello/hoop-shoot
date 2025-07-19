import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../utils/firebaseConfig";
import { ref, onValue, update } from "firebase/database";
import "../styles/skinselect.css";
import bgImage from "../assets/bg.png";

export default function SkinSelectPage() {
  const [user, setUser] = useState(null);
  const [score, setScore] = useState(0);
  const [selectedSkin, setSelectedSkin] = useState("");
  const [skins, setSkins] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userRef = ref(db, "users/" + firebaseUser.uid);
        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            setScore(data.highScore || 0);
            setSelectedSkin(data.selectedSkin || "default");
          }
        });
      }
    });

    // Ambil data skins dari DB
    const skinsRef = ref(db, "skins");
    onValue(skinsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const skinsArray = Object.entries(data).map(([id, val]) => ({
          id,
          ...val,
        }));
        setSkins(skinsArray);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSelect = async (skinId) => {
    if (!user) return;
    const skin = skins.find((s) => s.id === skinId);
    if (score >= skin.unlockScore) {
      await update(ref(db, "users/" + user.uid), {
        selectedSkin: skinId,
      });
      navigate("/game");
    } else {
      alert("Skor kamu belum cukup untuk membuka skin ini!");
    }
  };

  return (
    <div
      className="skin-select-container"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="overlay" />

      <h2>Pilih Bola</h2>
      <div className="skin-list">
        {skins.map((skin) => (
          <div
            key={skin.id}
            className={`skin ${selectedSkin === skin.id ? "selected" : ""}`}
          >
            <img src={skin.imageUrl} alt={skin.name} />
            <p>{skin.name}</p>
            <button
              onClick={() => handleSelect(skin.id)}
              disabled={score < skin.unlockScore}
            >
              {score >= skin.unlockScore
                ? "Pilih"
                : `Terkunci (${skin.unlockScore})`}
            </button>
          </div>
        ))}
      </div>
      <button onClick={() => navigate("/landing")} className="back-btn">
        ⬅ Kembali ke Lobby
      </button>
    </div>
  );
}
