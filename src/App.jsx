import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css';
import SplashScreen from "./components/SplashScreen";
import LoadingPage from "./components/LoadingScreen"; 
import LandingPage from "./components/LandingPage";
import TutorialPage from "./components/TutorialPage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import ProfilePage from "./components/ProfilePage";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import SkinSelectPage from "./components/SkinSelectPage";
import GameplayPage from "./components/GameplayPage";
import LeaderboardPage from "./components/LeaderboardPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/tutorial" element={<TutorialPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/forgot" element={<ForgotPasswordPage />} />
        <Route path="/select-skin" element={<SkinSelectPage />} />
        <Route path="/game" element={<GameplayPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;
