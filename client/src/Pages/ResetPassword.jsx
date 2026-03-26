import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import "../styles/theme.css";
import logo from "../assets/logoHomi.jpeg";

const API_URL = import.meta.env.VITE_API_URL;

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const code = location.state?.code || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!email || !code) {
      setError("Invalid reset session. Please start over.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        email,
        newPassword
      });

      setSuccess("Password reset successfully! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      const message = err.response?.data?.message || "Failed to reset password. Please try again.";
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
              <h2>Reset Password</h2>
              <p style={{ color: "red", marginBottom: "20px" }}>
                Invalid reset session. Please start over.
              </p>
              <Link to="/forgot-password" className="button-primary" style={{ textDecoration: "none", display: "inline-block", textAlign: "center" }}>
                Start Over
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
            <h2>Reset Password</h2>
            
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>
              Create a new password for <strong>{email}</strong>
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
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleResetPassword()}
            />

            <button
              className="button-primary"
              onClick={handleResetPassword}
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
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