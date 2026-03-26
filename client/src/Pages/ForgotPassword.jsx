import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/theme.css";
import logo from "../assets/logoHomi.jpeg";

const API_URL = import.meta.env.VITE_API_URL;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendResetCode = async () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await axios.post(`${API_URL}/auth/forgot-password`, { email });

      setSuccess("A password reset code has been sent to your email.");
      
      // Navigate to verify code page after 2 seconds
      setTimeout(() => {
        navigate("/verify-reset-code", { state: { email } });
      }, 2000);

    } catch (err) {
      const message = err.response?.data?.message || "Failed to send reset code. Please try again.";
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
            <h2>Forgot Password</h2>
            
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>
              Enter your email address and we'll send you a verification code to reset your password.
            </p>

            {error && (
              <p style={{ color: "red", fontSize: "13px", marginBottom: "10px" }}>
                {error}
              </p>
            )}

            {success && (
              <p style={{ color: "#63a17f", fontSize: "13px", marginBottom: "10px" }}>
                {success}
              </p>
            )}

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendResetCode()}
            />

            <button
              className="button-primary"
              onClick={handleSendResetCode}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Code"}
            </button>

            <div className="form-links">
              <Link to="/login">Back to Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}