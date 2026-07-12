import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom"; // Add Link here
import axios from "axios";
import "../styles/theme.css";
import logo from "../assets/logoHomi.jpeg";

const API_URL = import.meta.env.VITE_API_URL;

export default function VerifyResetCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    if (!email) {
      setError("Email not found. Please go back and try again.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await axios.post(`${API_URL}/auth/verify-reset-code`, { email, code });

      navigate("/reset-password", { state: { email, code } });

    } catch (err) {
      const message = err.response?.data?.message || "Invalid verification code. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="auth-page">
        <div className="form-container">
          <div className="form-left">
            <img src={logo} alt="logo" />
          </div>
          <div className="form-right">
            <div className="form-card">
              <h2>Verification Failed</h2>
              <p style={{ color: "red", marginBottom: "20px" }}>
                No email provided. Please go back and try again.
              </p>
              <Link to="/forgot-password" className="button-primary" style={{ textDecoration: "none", display: "inline-block", textAlign: "center" }}>
                Go Back
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="form-container">

        <div className="form-left">
          <img src={logo} alt="logo" />
        </div>

        <div className="form-right">
          <div className="form-card">
            <h2>Verify Reset Code</h2>
            
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>
              Enter the 6-digit verification code sent to <strong>{email}</strong>
            </p>

            {error && (
              <p style={{ color: "red", fontSize: "13px", marginBottom: "10px" }}>
                {error}
              </p>
            )}

            <input
              type="text"
              placeholder="Enter 6-digit code"
              maxLength="6"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              onKeyPress={(e) => e.key === 'Enter' && handleVerifyCode()}
            />

            <button
              className="button-primary"
              onClick={handleVerifyCode}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>

            <div className="form-links">
              <Link to="/forgot-password">Request New Code</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}