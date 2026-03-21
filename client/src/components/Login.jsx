import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import "./css/Login.css";

function Login({ handleGoogleSuccess, handleAdminLogin }) {
  const [showAdmin, setShowAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-wrapper">
      <div className="login-card">

        <h2 className="brand-title">Query Flow</h2>
        <p className="brand-sub">Smart Discussion Platform</p>

        {!showAdmin ? (
          <>
            <div className="google-container">
              <GoogleLogin
                clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                onSuccess={handleGoogleSuccess}
                onError={() => console.log("Login Failed")}
              />
            </div>

            <div className="divider">OR</div>

            <button
              className="switch-btn"
              onClick={() => setShowAdmin(true)}
            >
              Login as Admin
            </button>
          </>
        ) : (
          <>
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="toggle-eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁"}
              </span>
            </div>

            <button
              className="admin-login-btn"
              onClick={() => handleAdminLogin(email, password)}
            >
              Login
            </button>

            <div className="divider">OR</div>

            <button
              className="switch-btn"
              onClick={() => setShowAdmin(false)}
            >
              Back to Google Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;