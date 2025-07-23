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
  const ring = useRef({ x: 0, y: 0, width: 280, height: 160 });
  const hasScored = useRef(false);

  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const scaleRef = useRef({ x: 1, y: 1 });

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
      const updates =
        score > storedScore
          ? { highScore: score, lastScore: score }
          : { lastScore: score };
      update(userRef, updates);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = canvas.parentElement;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Maintain aspect ratio 360x600
      const scale = Math.min(containerWidth / 360, containerHeight / 600);
      canvas.width = 360 * scale;
      canvas.height = 600 * scale;
      canvas.style.width = `${360 * scale}px`;
      canvas.style.height = `${600 * scale}px`;
      
      scaleRef.current = {
        x: canvas.width / 360,
        y: canvas.height / 600
      };

      // Recalculate board and ring positions
      board.current = { 
        x: 80 * scaleRef.current.x, 
        y: 140 * scaleRef.current.y, 
        width: 200 * scaleRef.current.x, 
        height: 120 * scaleRef.current.y 
      };
      ring.current = {
        x: board.current.x + board.current.width / 2 - (280 * scaleRef.current.x) / 2,
        y: board.current.y + board.current.height - (10 * scaleRef.current.y),
        width: 280 * scaleRef.current.x,
        height: 160 * scaleRef.current.y
      };
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

      ctx.drawImage(
        boardImage,
        board.current.x,
        board.current.y,
        board.current.width,
        board.current.height
      );
      ctx.drawImage(
        ringImage,
        ring.current.x,
        ring.current.y,
        ring.current.width,
        ring.current.height
      );

      if (ball.current.isMoving) {
        const prevY = ball.current.y;

        ball.current.vy += 0.14 * scaleRef.current.y;
        ball.current.x += ball.current.vx * scaleRef.current.x;
        ball.current.y += ball.current.vy * scaleRef.current.y;

        const maxSpeed = 10;
        ball.current.vx = Math.max(Math.min(ball.current.vx, maxSpeed), -maxSpeed);
        ball.current.vy = Math.max(Math.min(ball.current.vy, maxSpeed), -maxSpeed);

        // Score detection
        const ringCenterY = ring.current.y + ring.current.height / 2;
        const ringLeft = ring.current.x;
        const ringRight = ring.current.x + ring.current.width;
        const margin = ring.current.width * 0.35;
        const ballCenterX = ball.current.x;

        const insideHorizontal =
          ballCenterX > ringLeft + margin &&
          ballCenterX < ringRight - margin;

        const passedThroughRing =
          !hasScored.current &&
          ball.current.vy > 0 &&
          prevY < ringCenterY &&
          ball.current.y >= ringCenterY &&
          insideHorizontal;

        if (passedThroughRing) {
          hasScored.current = true;
          const newCombo = comboRef.current + 1;
          const newScore = scoreRef.current + newCombo; // Score increases with combo
          comboRef.current = newCombo;
          scoreRef.current = newScore;
          setCombo(newCombo);
          setScore(newScore);
          setTimeLeft((prev) => prev + 3);
          setScoreEffect({ 
            x: 180 * scaleRef.current.x, 
            y: 300 * scaleRef.current.y, 
            value: `+${newCombo}` 
          });
          setTimeout(() => setScoreEffect(null), 600);
          setTimeout(() => {
            const newX = Math.random() * (100 * scaleRef.current.x) + (40 * scaleRef.current.x);
            const newY = Math.random() * (100 * scaleRef.current.y) + (120 * scaleRef.current.y);
            board.current.x = newX;
            board.current.y = newY;
            ring.current.x = newX + board.current.width / 2 - ring.current.width / 2;
            ring.current.y = newY + board.current.height - (10 * scaleRef.current.y);
            resetBall();
          }, 300);
        }

        if (ball.current.y > canvas.height && !hasScored.current) {
          setCombo(0);
          comboRef.current = 0;
          resetBall();
        }
      }

      const ballSize = 80 * Math.min(scaleRef.current.x, scaleRef.current.y);
      ctx.drawImage(
        ballImg, 
        ball.current.x - ballSize/2, 
        ball.current.y - ballSize/2, 
        ballSize, 
        ballSize
      );

      // Wall collision
      const ballRadius = ballSize/2;
      if (ball.current.x - ballRadius <= 0 || ball.current.x + ballRadius >= canvas.width) {
        ball.current.vx *= -0.7;
        if (ball.current.x - ballRadius <= 0) ball.current.x = ballRadius;
        if (ball.current.x + ballRadius >= canvas.width) ball.current.x = canvas.width - ballRadius;
      }

      requestAnimationFrame(updateFrame);
    };

    updateFrame();
  }, [ballImage]);

  const resetBall = () => {
    ball.current = { 
      x: 160 * scaleRef.current.x, 
      y: 500 * scaleRef.current.y, 
      vx: 0, 
      vy: 0, 
      isMoving: false 
    };
    hasScored.current = false;
  };

  const handleMouseDown = (e) => {
    if (!ball.current.isMoving && !gameOver) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvasRef.current.width / rect.width);
      const y = (e.clientY - rect.top) * (canvasRef.current.height / rect.height);
      setStartPos({ x, y });
    }
  };

  const handleMouseUp = (e) => {
    if (!ball.current.isMoving && !gameOver) {
      const rect = canvasRef.current.getBoundingClientRect();
      const endX = (e.clientX - rect.left) * (canvasRef.current.width / rect.width);
      const endY = (e.clientY - rect.top) * (canvasRef.current.height / rect.height);

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

  const handleTouchStart = (e) => {
    if (!ball.current.isMoving && !gameOver) {
      e.preventDefault();
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.touches[0].clientX - rect.left) * (canvasRef.current.width / rect.width);
      const y = (e.touches[0].clientY - rect.top) * (canvasRef.current.height / rect.height);
      setStartPos({ x, y });
    }
  };

  const handleTouchEnd = (e) => {
    if (!ball.current.isMoving && !gameOver) {
      e.preventDefault();
      const rect = canvasRef.current.getBoundingClientRect();
      const endX = (e.changedTouches[0].clientX - rect.left) * (canvasRef.current.width / rect.width);
      const endY = (e.changedTouches[0].clientY - rect.top) * (canvasRef.current.height / rect.height);

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
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="game-canvas"
      />
      {scoreEffect && (
        <div
          className="score-effect"
          style={{ 
            left: `${scoreEffect.x}px`, 
            top: `${scoreEffect.y}px`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {scoreEffect.value}
        </div>
      )}
      {gameOver && (
        <div className="game-over-popup">
          <h2>🎮 Game Over</h2>
          <p>Skor: {score}</p>
          {score > storedScore && <p className="new-highscore">🎉 New High Score!</p>}
          <div className="popup-buttons">
            <button onClick={() => { saveFinalScore(); navigate("/select-skin"); }}>
              🎨 Pilih Skin
            </button>
            <button onClick={restartGame}>🔁 Main Ulang</button>
            <button onClick={() => { saveFinalScore(); navigate("/landing"); }}>
              🏠 Kembali ke Lobby
            </button>
            <button onClick={() => { saveFinalScore(); navigate("/leaderboard"); }}>
              🏆 Leaderboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}