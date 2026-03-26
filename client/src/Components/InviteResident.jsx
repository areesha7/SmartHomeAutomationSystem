
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function InviteResident({ homeId, onInviteSent }) {
  const { token } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendInvite = async () => {
    if (!email) {
      setError("Please enter an email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      console.log("Sending invitation to:", email);
      console.log("Home ID:", homeId);
      
      // Using your existing route: POST /homes/:homeId/invitations
      const response = await axios.post(
        `${API_URL}/homes/${homeId}/invitations`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Invitation sent:", response.data);
      setSuccess(`Invitation sent to ${email}!`);
      setEmail("");
      
      if (onInviteSent) {
        onInviteSent();
      }

      setTimeout(() => setSuccess(""), 5000);

    } catch (err) {
      console.error("Error sending invitation:", err);
      const message = err.response?.data?.message || "Failed to send invitation. Please try again.";
      setError(message);
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", background: "#f0faf4", borderRadius: "12px", marginBottom: "20px" }}>
      <h3 style={{ marginBottom: "16px", fontSize: "18px", color: "#1a1a1a" }}>Invite Resident</h3>
      <p style={{ fontSize: "13px", color: "#666", marginBottom: "16px" }}>
        Send an invitation email to a new resident. They will receive a link to join your home.
      </p>
      
      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", flexWrap: "wrap" }}>
        <input
          type="email"
          placeholder="resident@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            flex: 1,
            minWidth: "200px",
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid #e0dcea",
            fontSize: "14px",
            outline: "none"
          }}
          disabled={loading}
        />
        
        <button
          onClick={handleSendInvite}
          disabled={loading}
          style={{
            padding: "10px 24px",
            background: loading ? "#ccc" : "#63a17f",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "600",
            fontSize: "14px"
          }}
        >
          {loading ? "Sending..." : "Send Invite"}
        </button>
      </div>
      
      {error && (
        <p style={{ color: "#c03030", fontSize: "13px", marginTop: "12px" }}>
          ⚠️ {error}
        </p>
      )}
      
      {success && (
        <p style={{ color: "#63a17f", fontSize: "13px", marginTop: "12px" }}>
          ✓ {success}
        </p>
      )}
    </div>
  );
}