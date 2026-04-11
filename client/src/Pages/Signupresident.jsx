import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "../styles/theme.css";
import logo from "../assets/logoHomi.jpeg";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function SignupResident() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const { login }      = useAuth();
  const inviteToken    = searchParams.get("token");
  const [accepting, setAccepting] = useState(false);

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  // Store token in session storage if not already there
  useEffect(() => {
    if (inviteToken && !sessionStorage.getItem("pendingInvitationToken")) {
      sessionStorage.setItem("pendingInvitationToken", inviteToken);
    }
  }, [inviteToken]);

  const acceptInvitation = async (authToken) => {
    const pendingToken = sessionStorage.getItem("pendingInvitationToken");
    if (!pendingToken) {
      throw new Error("No invitation token found");
    }

    const response = await axios.post(
      `${API_URL}/homes/accept-invitation`,
      { token: pendingToken },
      { 
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        } 
      }
    );
    
    return response.data;
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
    
    const pendingToken = sessionStorage.getItem("pendingInvitationToken");
    if (!pendingToken) {
      setError("No invitation token found. Please use the link from your invitation email.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Register as RESIDENT
      const regRes = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        role: "RESIDENT",
      });

      const { user, tokens } = regRes.data.data;
      login(user, tokens.accessToken);

      // Now accept the invitation
      setAccepting(true);
      const acceptResult = await acceptInvitation(tokens.accessToken);
      
      const homeData = acceptResult?.data?.home || acceptResult?.home;
      
      // Clear the pending token
      sessionStorage.removeItem("pendingInvitationToken");
      
      // Redirect to dashboard
      navigate("/dashboard");
      
    } catch (err) {
      console.error("Signup error:", err);
      const message = err.response?.data?.message || "Signup failed. Please try again.";
      setError(message);
      setAccepting(false);
    } finally {
      setLoading(false);
    }
  };

  if (!inviteToken && !sessionStorage.getItem("pendingInvitationToken")) {
    return (
      <div className="auth-page">
        <div className="form-container">
          <div className="form-left">
            <img src={logo} alt="logo" />
          </div>
          <div className="form-right">
            <div className="form-card">
              <h2>Invalid Invitation</h2>
              <p style={{ fontSize: "13px", color: "#c03030", marginBottom: "16px" }}>
                No invitation token found. Please use the link from your invitation email.
              </p>
              <Link to="/" className="button-primary" style={{ textDecoration: "none", display: "block", textAlign: "center" }}>
                Go Home
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
            <h2>Join as Resident</h2>
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "16px" }}>
              Create your account to accept the invitation and join your home.
            </p>
            
            {error && (
              <p style={{ color: "red", fontSize: "13px", marginBottom: "10px" }}>{error}</p>
            )}
            
            {accepting && (
              <p style={{ color: "#2e8b57", fontSize: "13px", marginBottom: "10px" }}>
                Account created! Accepting invitation...
              </p>
            )}
            
            <input
              placeholder="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={loading || accepting}
            />
            
            <input
              type="email"
              placeholder="Email (must match your invitation)"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading || accepting}
            />
            
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading || accepting}
            />
            
            <button
              className="button-primary"
              onClick={handleSignup}
              disabled={loading || accepting}
            >
              {loading ? "Creating account..." : accepting ? "Joining home..." : "Create Account & Join Home"}
            </button>
            
            <div className="form-links">
              Already have an account?{" "}
              <Link to={`/login?redirect=${encodeURIComponent(`/accept-invitation?token=${inviteToken}`)}`}>
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}