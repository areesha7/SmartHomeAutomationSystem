import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "../styles/theme.css";
import logo from "../assets/logoHomi.jpeg";
import { useAuth } from "../context/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (window.googleInitialized) return;
    
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.googleInitialized = true;
      
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      
      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInButton"),
        { 
          theme: "outline", 
          size: "large",
          text: "signin_with",
          shape: "rectangular"
        }
      );
    };
    
    document.head.appendChild(script);
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      setGoogleLoading(true);
      setError("");
      
      const res = await axios.post(`${API_URL}/auth/google`, {
        idToken: response.credential,
        role: "ADMIN"
      });
      
      const { user, tokens } = res.data.data;
      login(user, tokens.accessToken);

      if (redirectUrl) {
        navigate(decodeURIComponent(redirectUrl));  // ✅ use navigate + decode
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Google login error:", err);
      const message = err.response?.data?.message || "Google login failed. Please try again.";
      setError(message);
      setGoogleLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { user, tokens } = response.data.data;
      login(user, tokens.accessToken);

      if (redirectUrl) {
        navigate(decodeURIComponent(redirectUrl));  // ✅ use navigate + decode
      } else {
        navigate("/");
      }

    } catch (err) {
      const message = err.response?.data?.message || "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="form-container">
        <div className="form-left">
          <img src={logo} alt="logo" />
        </div>
        <div className="form-right">
          <div className="form-card">
            <h2>Login</h2>

            {error && (
              <p style={{ color: "red", fontSize: "13px", marginBottom: "10px" }}>
                {error}
              </p>
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div style={{ position: "relative", width: "100%" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                style={{ width: "100%", paddingRight: "40px" }}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#888",
                  fontSize: "18px"
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button
              className="button-primary"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <div style={{ textAlign: "center", margin: "15px 0", color: "#aaa" }}>
              ───── or ─────
            </div>

            <div 
              id="googleSignInButton" 
              style={{ 
                display: "flex", 
                justifyContent: "center",
                width: "100%"
              }}
            ></div>
            
            {googleLoading && (
              <p style={{ textAlign: "center", fontSize: "12px", marginTop: "10px", color: "#63a17f" }}>
                Signing in...
              </p>
            )}

            <div className="form-links">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            <div className="form-links">
              Don't have an account? <Link to="/signup">Signup</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}