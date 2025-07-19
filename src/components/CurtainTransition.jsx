import { useEffect, useState } from "react";
import "../styles/curtainTransition.css";
import leftImg from "../assets/curtainLeft.png";
import rightImg from "../assets/curtainRight.png";

export default function CurtainTransition({ trigger, onComplete }) {
  const [active, setActive] = useState(false);

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
      <div className="curtain left" />
      <div className="curtain right" />
    </div>
  );
}
