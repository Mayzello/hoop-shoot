import { useEffect, useRef, useState } from "react";
import { auth, db } from "../utils/firebaseConfig";
import { onValue, ref, update, get } from "firebase/database";
import { useNavigate } from "react-router-dom";
import "../styles/gameplay.css";
import bgImage from "../assets/bg.png";
import ballDefault from "../assets/ball.png";
import ringImg from "../assets/ring_only.png";
import boardImg from "../assets/board_only.png";

export default function GameplayPage() {
  const canvasRef = useRef(null);
  const [ballImage, setBallImage] = useState(ballDefault);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameOver, setGameOver] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [storedScore, setStoredScore] = useState(0);
  const [scoreEffect, setScoreEffect] = useState(null);
  const navigate = useNavigate();

  const ball = useRef({ x: 160, y: 500, vx: 0, vy: 0, isMoving: false });
  const board = useRef({ x: 80, y: 140, width: 200, height: 120 });
  const ring = useRef({ x: 0, y: 0, width: 280, height: 160 }); // 🔴 Ring diperbesar
  const hasScored = useRef(false);

  const scoreRef = useRef(0);
  const comboRef = useRef(0);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = ref(db, "users/" + user.uid);
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      const selectedSkin = data?.selectedSkin || "default";
      setStoredScore(data?.highScore || 0);

      if (selectedSkin === "default") {
        setBallImage(ballDefault);
        return;
      }

      const skinRef = ref(db, "skins/" + selectedSkin);
      onValue(skinRef, (skinSnap) => {
        const skinData = skinSnap.val();
        if (skinData && skinData.imageUrl) {
          const img = new Image();
          img.src = skinData.imageUrl;
          img.onload = () => {
            setBallImage(skinData.imageUrl);
          };
        } else {
          setBallImage(ballDefault);
        }
      });
    });
  }, []);

  useEffect(() => {
    const fetchGameplayTime = async () => {
      try {
        const snapshot = await get(ref(db, "settings/gameplayTime"));
        if (snapshot.exists()) {
          setTimeLeft(snapshot.val());
        } else {
          setTimeLeft(10);
        }
      } catch (error) {
        console.error("Gagal mengambil waktu gameplay:", error);
        setTimeLeft(10);
      }
    };
    fetchGameplayTime();
  }, []);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    comboRef.current = combo;
  }, [combo]);

  const saveFinalScore = () => {
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(db, "users/" + user.uid);
      const updates = score > storedScore
        ? { highScore: score, lastScore: score }
        : { lastScore: score };
      update(userRef, updates);
    }
  };

  useEffect(() => {
    // Inisialisasi posisi ring berdasarkan papan
    board.current = { x: 80, y: 140, width: 200, height: 120 };
    ring.current.x = board.current.x + (board.current.width / 2) - (ring.current.width / 2);
    ring.current.y = board.current.y + board.current.height - 10;
  }, []);

  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          saveFinalScore();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.style.background = "#c0c0c0";
    ctx.imageSmoothingEnabled = false;

    const boardImage = new Image();
    boardImage.src = boardImg;
    const ringImage = new Image();
    ringImage.src = ringImg;
    const ballImg = new Image();
    ballImg.src = ballImage;

    const updateFrame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(boardImage, board.current.x, board.current.y, board.current.width, board.current.height);
      ctx.drawImage(ringImage, ring.current.x, ring.current.y, ring.current.width, ring.current.height);

      if (ball.current.isMoving) {
        ball.current.vy += 0.14;
        ball.current.x += ball.current.vx;
        ball.current.y += ball.current.vy;

        const maxSpeed = 10;
        ball.current.vx = Math.max(Math.min(ball.current.vx, maxSpeed), -maxSpeed);
        ball.current.vy = Math.max(Math.min(ball.current.vy, maxSpeed), -maxSpeed);

        const ballCenterX = ball.current.x;
        const ringCenterY = ring.current.y + ring.current.height / 2;
        const insideHorizontal =
          ballCenterX > ring.current.x && ballCenterX < ring.current.x + ring.current.width;

        const passedThroughRing =
          !hasScored.current &&
          insideHorizontal &&
          ball.current.vy > 0 &&
          ball.current.y - ball.current.vy < ringCenterY &&
          ball.current.y >= ringCenterY;

        if (passedThroughRing) {
          hasScored.current = true;
          const newCombo = comboRef.current + 1;
          const newScore = scoreRef.current + 1;
          comboRef.current = newCombo;
          scoreRef.current = newScore;
          setCombo(newCombo);
          setScore(newScore);
          setTimeLeft((prev) => prev + 2);
          setScoreEffect({ x: 180, y: 300, value: "+1" });
          setTimeout(() => setScoreEffect(null), 600);
          setTimeout(() => {
            // pindahkan papan, ring ikut fix posisinya
            const newX = Math.random() * 100 + 40;
            const newY = Math.random() * 100 + 120;
            board.current.x = newX;
            board.current.y = newY;
            ring.current.x = newX + (board.current.width / 2) - (ring.current.width / 2);
            ring.current.y = newY + board.current.height - 10;
            resetBall();
          }, 300);
        }

        if (ball.current.y > canvas.height) {
          setCombo(0);
          comboRef.current = 0;
          hasScored.current = false;
          resetBall();
        }
      }

      ctx.drawImage(ballImg, ball.current.x - 40, ball.current.y - 40, 80, 80);

      if (ball.current.x - 40 <= 0 || ball.current.x + 40 >= canvas.width) {
        ball.current.vx *= -0.7;
        if (ball.current.x - 40 <= 0) ball.current.x = 40;
        if (ball.current.x + 40 >= canvas.width) ball.current.x = canvas.width - 40;
      }

      requestAnimationFrame(updateFrame);
    };

    updateFrame();
  }, [ballImage]);

  const resetBall = () => {
    ball.current = { x: 160, y: 500, vx: 0, vy: 0, isMoving: false };
    hasScored.current = false;
  };

  const handleMouseDown = (e) => {
    if (!ball.current.isMoving && !gameOver) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setStartPos({ x, y });
    }
  };

  const handleMouseUp = (e) => {
    if (!ball.current.isMoving && !gameOver) {
      const rect = canvasRef.current.getBoundingClientRect();
      const endX = e.clientX - rect.left;
      const endY = e.clientY - rect.top;

      const dx = endX - startPos.x;
      const dy = endY - startPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 5) {
        const power = Math.min(distance / 4.5, 22);
        const angle = Math.atan2(dy, dx);
        ball.current.vx = Math.cos(angle) * power * 1.1;
        ball.current.vy = Math.sin(angle) * power * 1.1;
        ball.current.isMoving = true;
      }
    }
  };

  const restartGame = () => {
    saveFinalScore();
    setScore(0);
    scoreRef.current = 0;
    setCombo(0);
    comboRef.current = 0;
    setGameOver(false);
    resetBall();
    get(ref(db, "settings/gameplayTime")).then((snapshot) => {
      setTimeLeft(snapshot.exists() ? snapshot.val() : 10);
    });
  };

  return (
    <div className="gameplay-container" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="overlay" />
      <div className="game-info">
        <div className="score">Score: {score}</div>
        <div className="combo">Combo: x{combo}</div>
        <div className="timer">⏱ {timeLeft}s</div>
      </div>
      <canvas
        ref={canvasRef}
        width={360}
        height={600}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className="game-canvas"
      />
      {scoreEffect && (
        <div className="score-effect" style={{ left: `${scoreEffect.x}px`, top: `${scoreEffect.y}px` }}>
          {scoreEffect.value}
        </div>
      )}
      {gameOver && (
        <div className="game-over-popup">
          <h2>🎮 Game Over</h2>
          <p>Skor: {score}</p>
          <div className="popup-buttons">
            <button onClick={() => { saveFinalScore(); navigate("/select-skin"); }}>🎨 Pilih Skin</button>
            <button onClick={restartGame}>🔁 Main Ulang</button>
            <button onClick={() => { saveFinalScore(); navigate("/landing"); }}>🏠 Kembali ke Lobby</button>
            <button onClick={() => { saveFinalScore(); navigate("/leaderboard"); }}>🏆 Leaderboard</button>
          </div>
        </div>
      )}
    </div>
  );
}
