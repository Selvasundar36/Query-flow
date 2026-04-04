import { useEffect, useState } from "react";
import './css/SplashScreen.css';
import icon from '../asscet/qf.png';

function SplashScreen({ onFinish }) {
  const [fade, setFade] = useState(false);
  const welcomeText = "Welcome".split("");

  useEffect(() => {
    // Start fade out at 3 seconds to allow animations to play
    const timer1 = setTimeout(() => {
      setFade(true); 
    }, 3000);

    // Call onFinish after fade animation completes
    const timer2 = setTimeout(() => {
      onFinish(); 
    }, 3800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinish]);

  return (
    <div className={`splash-container ${fade ? "fade-out" : ""}`}>
      {/* Background Shapes */}
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      
      {/* Main Glassmorphic Wrapper */}
      <div className="content-wrapper">
        <div className="logo-container">
          <div className="glow-ring"></div>
          <div className="glow-ring-2"></div>
          <img src={icon} alt="Logo" className="logo-image" />
        </div>
        
        {/* Animated Letter Text */}
        <h1 className="logo-text">
          {welcomeText.map((char, index) => (
            <span 
              key={index} 
              style={{ animationDelay: `${index * 0.1}s` }}
              className="anim-letter"
            >
              {char}
            </span>
          ))}
        </h1>
        
        {/* Animated Loading Bar */}
        <div className="loading-bar-container">
          <div className="loading-bar"></div>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;