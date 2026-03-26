import React, { useState, useEffect } from "react";
import "../styles/theme.css";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logoHomi.jpeg";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        document.getElementById("googleSignUpButton"),
        { 
          theme: "outline", 
          size: "large",
          text: "signup_with",
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
      
      navigate("/create-home");
    } catch (err) {
      const message = err.response?.data?.message || "Google signup failed. Please try again.";
      setError(message);
      setGoogleLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setError("All fields are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        role: "ADMIN",
      });

      const { user, tokens } = response.data.data;

      login(user, tokens.accessToken);

      navigate("/create-home");

    } catch (err) {
      const message = err.response?.data?.message || "Signup failed. Please try again.";
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
            <h2>Signup</h2>

            {error && (
              <p style={{ color: "red", fontSize: "13px", marginBottom: "10px" }}>
                {error}
              </p>
            )}

            <input
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              className="button-primary"
              onClick={handleSignup}
              disabled={loading}
            >
              {loading ? "Creating account..." : "Signup"}
            </button>

            <div style={{ textAlign: "center", margin: "15px 0", color: "#aaa" }}>
              ───── or ─────
            </div>

            <div 
              id="googleSignUpButton" 
              style={{ 
                display: "flex", 
                justifyContent: "center",
                width: "100%"
              }}
            ></div>
            
            {googleLoading && (
              <p style={{ textAlign: "center", fontSize: "12px", marginTop: "10px", color: "#63a17f" }}>
                Signing up...
              </p>
            )}

            <div className="form-links">
              Already have an account? <Link to="/login">Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}