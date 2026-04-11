
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { token: authToken, user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [homeInfo, setHomeInfo] = useState(null);
  const [accepting, setAccepting] = useState(false);

  //  token storage
  useEffect(() => {
    if (token) {
      sessionStorage.setItem("pendingInvitationToken", token);
    }
  }, [token]);

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

  useEffect(() => {
    const processInvitation = async () => {
      const pendingToken = sessionStorage.getItem("pendingInvitationToken");
      
      if (!pendingToken) {
        navigate("/");
        return;
      }

      if (isAuthenticated && authToken && !accepting) {
        setAccepting(true);
        try {
          console.log("Processing pending invitation for user:", user?.email);
          const response = await acceptInvitation(authToken);
          
          const homeData = response?.data?.home || response?.home;
          setHomeInfo(homeData);
          setSuccess(true);
          
          sessionStorage.removeItem("pendingInvitationToken");
          
          setTimeout(() => {
            navigate("/");
          }, 3000);
          
        } catch (err) {
          console.error("Error accepting invitation:", err);
          
          let errorMessage = "Failed to accept invitation. ";
          
          if (err.response?.status === 403) {
            errorMessage = `This invitation was sent to a different email address.\n\nYou are logged in as: ${user?.email}\n\nPlease log out and log in with the email address where you received this invitation.`;
          } else if (err.response?.status === 404) {
            errorMessage = "Invitation not found or has expired. Please ask the admin to send a new invitation.";
          } else if (err.response?.status === 409) {
            errorMessage = "You are already a resident of this home.";
            setTimeout(() => {
              navigate("/");
            }, 2000);
          } else {
            errorMessage += err.response?.data?.message || "Please try again.";
          }
          
          setError(errorMessage);
        } finally {
          setLoading(false);
          setAccepting(false);
        }
      } else if (!isAuthenticated && !accepting) {
        setLoading(false);
      }
    };

    processInvitation();
  }, [isAuthenticated, authToken, user, navigate, accepting]);

  const handleResidentSignup = () => {
    const pendingToken = sessionStorage.getItem("pendingInvitationToken");
    navigate(`/signup-resident?token=${pendingToken}`);
  };

  const handleLoginRedirect = () => {
    const pendingToken = sessionStorage.getItem("pendingInvitationToken");
    const redirectUrl = `/accept-invitation?token=${pendingToken}`;
    navigate(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
  };

  if (!isAuthenticated && !loading && !success && !error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5", padding: "20px" }}>
        <div style={{ background: "white", padding: "40px", borderRadius: "16px", maxWidth: "450px", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏠</div>
          <h2 style={{ color: "#333", marginBottom: "16px" }}>You've Been Invited!</h2>
          <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px", lineHeight: 1.6 }}>
            Someone has invited you to join their smart home. 
            To accept this invitation, please create an account or login with the email address where you received this invitation.
          </p>
          
          <button 
            onClick={handleResidentSignup}
            style={{
              display: "block",
              padding: "12px 24px",
              background: "#2e8b57",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "14px",
              width: "100%",
              marginBottom: "12px"
            }}
          >
            Create New Account
          </button>
          
          <button 
            onClick={handleLoginRedirect}
            style={{
              display: "block",
              padding: "12px 24px",
              background: "#5c35b0",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "14px",
              width: "100%"
            }}
          >
            Login to Existing Account
          </button>
          
          <p style={{ fontSize: "12px", color: "#999", marginTop: "20px" }}>
            Make sure to use the same email address where you received this invitation.
          </p>
        </div>
      </div>
    );
  }

  // Loading 
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #2e8b57",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "20px auto"
          }}></div>
          <p style={{ marginTop: "16px", color: "#666" }}>Processing your invitation...</p>
        </div>
      </div>
    );
  }

  // Error 
  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5", padding: "20px" }}>
        <div style={{ background: "white", padding: "40px", borderRadius: "16px", maxWidth: "500px", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
          <h2 style={{ color: "#c03030", marginBottom: "16px" }}>Cannot Accept Invitation</h2>
          <div style={{ 
            color: "#c03030", 
            fontSize: "14px", 
            marginBottom: "20px",
            background: "#fee",
            padding: "16px",
            borderRadius: "8px",
            textAlign: "left",
            whiteSpace: "pre-line"
          }}>
            {error}
          </div>
          
          {error.includes("different email address") && (
            <button 
              onClick={() => {
                localStorage.removeItem("token");
                sessionStorage.setItem("pendingInvitationToken", token);
                window.location.href = "/login";
              }}
              style={{
                display: "block",
                padding: "12px 24px",
                background: "#5c35b0",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "14px",
                width: "100%",
                marginBottom: "10px"
              }}
            >
              Logout & Switch Account
            </button>
          )}
          
          <Link to="/" style={{
            display: "inline-block",
            padding: "12px 24px",
            background: "#666",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "600"
          }}>
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5", padding: "20px" }}>
        <div style={{ background: "white", padding: "40px", borderRadius: "16px", maxWidth: "500px", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
          <h2 style={{ color: "#2e8b57", marginBottom: "16px" }}>Welcome to Your New Home!</h2>
          <p style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>
            You have successfully joined the home!
          </p>
          {homeInfo && (
            <div style={{ 
              background: "#e8f5ee", 
              padding: "16px", 
              borderRadius: "8px",
              marginTop: "16px"
            }}>
              <p style={{ fontSize: "14px", color: "#2e8b57", fontWeight: "bold", margin: 0 }}>
                🏠 {homeInfo.name}
              </p>
              {homeInfo.address && (
                <p style={{ fontSize: "12px", color: "#666", marginTop: "8px", margin: 0 }}>
                  📍 {homeInfo.address}
                </p>
              )}
            </div>
          )}
          <p style={{ fontSize: "13px", color: "#666", marginTop: "20px" }}>
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return null;
}