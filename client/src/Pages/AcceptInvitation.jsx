import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logoHomi.jpeg";

const API_URL = import.meta.env.VITE_API_URL;

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { token: authToken, user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [homeInfo, setHomeInfo] = useState(null);

  useEffect(() => {
    const acceptInvitation = async () => {
      if (!token) {
        setError("No invitation token provided. The invitation link may be invalid.");
        setLoading(false);
        return;
      }

      // If user is not logged in, redirect to login with return URL
      if (!isAuthenticated) {
        console.log("User not logged in, redirecting to login");
        navigate(`/login?redirect=/accept-invitation?token=${token}`);
        return;
      }

      try {
        console.log("Accepting invitation with token:", token);
        
        // Using your backend route: POST /homes/accept-invitation
        const response = await axios.post(
          `${API_URL}/homes/accept-invitation`,
          { token },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        
        console.log("Invitation accepted:", response.data);
        
        const homeData = response.data?.data?.home || response.data?.home;
        setHomeInfo(homeData);
        setSuccess("You have successfully joined the home!");
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate("/");
        }, 3000);
        
      } catch (err) {
        console.error("Error accepting invitation:", err);
        const message = err.response?.data?.message || "Failed to accept invitation. The link may have expired or been cancelled.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    acceptInvitation();
  }, [token, user, authToken, isAuthenticated, navigate]);

  // If not logged in, show login prompt
  if (!isAuthenticated && !loading) {
    return (
      <div className="auth-page">
        <div className="form-container">
          <div className="form-left">
            <img src={logo} alt="logo" />
          </div>
          <div className="form-right">
            <div className="form-card">
              <h2>Login Required</h2>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
                You need to log in to accept this invitation.
              </p>
              <Link 
                to={`/login?redirect=/accept-invitation?token=${token}`}
                className="button-primary"
                style={{ textDecoration: "none", display: "inline-block", textAlign: "center", width: "100%" }}
              >
                Login to Accept Invitation
              </Link>
              <div className="form-links" style={{ marginTop: "15px" }}>
                Don't have an account? <Link to="/signup">Signup</Link>
              </div>
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
            {loading && (
              <>
                <h2>Accepting Invitation</h2>
                <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
                  Please wait while we process your invitation...
                </p>
                <div style={{ textAlign: "center" }}>
                  <div className="spinner"></div>
                </div>
              </>
            )}
            
            {error && (
              <>
                <h2 style={{ color: "#c03030" }}>Invitation Failed</h2>
                <p style={{ color: "#c03030", fontSize: "14px", marginBottom: "20px" }}>
                  {error}
                </p>
                <p style={{ fontSize: "13px", color: "#666" }}>
                  The invitation may have expired or been cancelled by the admin.
                </p>
                <Link to="/" className="button-primary" style={{ textDecoration: "none", display: "inline-block", textAlign: "center", width: "100%", marginTop: "20px" }}>
                  Go to Dashboard
                </Link>
              </>
            )}
            
            {success && (
              <>
                <h2 style={{ color: "#63a17f" }}>Welcome! 🎉</h2>
                <p style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>
                  {success}
                </p>
                {homeInfo && (
                  <p style={{ fontSize: "14px", color: "#63a17f", fontWeight: "bold" }}>
                    You are now a resident of: {homeInfo.name}
                  </p>
                )}
                <p style={{ fontSize: "13px", color: "#666", marginTop: "20px" }}>
                  Redirecting to dashboard...
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #63a17f;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 20px auto;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}