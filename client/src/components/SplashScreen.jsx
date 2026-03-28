import { useEffect, useState } from "react";
import './css/SplashScreen.css';
import icon from '../asscet/FLOW.png';

function SplashScreen({ onFinish }) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setFade(true); // start fade out
    }, 2000);

    const timer2 = setTimeout(() => {
      onFinish(); // go to login
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinish]);

  return (
    <div className={`splash-container ${fade ? "fade-out" : ""}`}>
      <img src={icon} alt="Logo" className="logo-image" />
      <h1 className="logo">Query Flow</h1>
    </div>
  );
}

export default SplashScreen;