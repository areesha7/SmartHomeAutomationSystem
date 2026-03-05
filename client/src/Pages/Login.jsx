import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/theme.css";

export default function Login() {
  // -----------------------------
  // State hooks for controlled inputs
  // -----------------------------
  const [email, setEmail] = useState("");       // Stores email input
  const [password, setPassword] = useState(""); // Stores password input

  // -----------------------------
  // Handler for login button
  // -----------------------------
  const handleLogin = () => {
    // TODO: Add login API call or validation logic
    console.log("Logging in with:", { email, password });
  };

  // -----------------------------
  // Handler for Google login
  // -----------------------------
  const handleGoogleLogin = () => {
    // TODO: Integrate Google OAuth login here
    console.log("Signing in with Google");
  };

  return (
    <div className="auth-page"> {/* Wrapper for page styling */}
      <div className="form-container">
        
        {/* -----------------------------
            Left side: logo or branding
        ----------------------------- */}
        <div className="form-left">
          <img src="/logo.png" alt="logo" />
        </div>

        {/* -----------------------------
            Right side: login form
        ----------------------------- */}
        <div className="form-right">
          <div className="form-card">

            {/* Form header */}
            <h2>Login</h2>

            {/* Email input */}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Update state on change
            />

            {/* Password input */}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Update state on change
            />

            {/* Login button */}
            <button className="button-primary" onClick={handleLogin}>
              Login
            </button>

            {/* Google login button */}
            <button className="button-google" onClick={handleGoogleLogin}>
              <img src="/google.logo.png" alt="google" />
              Sign in with Google
            </button>

            {/* Links for password reset */}
            <div className="form-links">
              <Link to="/reset">Forgot Password?</Link>
            </div>

            {/* Links for signup */}
            <div className="form-links">
              Don't have an account? <Link to="/signup">Signup</Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
