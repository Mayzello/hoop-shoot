import { useEffect, useState } from "react";
import "../styles/curtainTransition.css";
import leftImg from "../assets/curtainLeft.png";
import rightImg from "../assets/curtainRight.png";

export default function CurtainTransition({ trigger, onComplete }) {
  const [active, setActive] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (trigger) {
      setActive(true);
      const timer = setTimeout(() => {
        setActive(false);
        onComplete?.();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  return (
    <div className={`curtain-wrapper ${active ? "active" : ""}`}>
      <div 
        className="curtain left" 
        style={{
          backgroundImage: `url(${leftImg})`,
          width: `${windowSize.width / 2}px`,
          height: `${windowSize.height}px`
        }} 
      />
      <div 
        className="curtain right" 
        style={{
          backgroundImage: `url(${rightImg})`,
          width: `${windowSize.width / 2}px`,
          height: `${windowSize.height}px`
        }} 
      />
    </div>
  );
}