import defaultImg from "../assets/ball.png";
import fireImg from "../assets/ballred.png";
import neonImg from "../assets/ballblue.png";

const skins = [
  { id: "default", name: "Default Ball", image: defaultImg, unlockScore: 0 },
  { id: "fire", name: "Fire Ball", image: fireImg, unlockScore: 10 },
  { id: "neon", name: "Neon Ball", image: neonImg, unlockScore: 25 }
];

export default skins;
