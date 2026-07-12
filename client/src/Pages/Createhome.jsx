import React, { useState } from "react";
import "../styles/theme.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function CreateHome() {
  const navigate    = useNavigate();
  const { token }   = useAuth();

  const [homeName, setHomeName] = useState("");
  const [address,  setAddress]  = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleCreateHome = async () => {
    if (!homeName.trim()) {
      setError("Home name is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await axios.post(
        `${API_URL}/homes/createHome`,
        { name: homeName, address },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate("/");

    } catch (err) {
      const message = err.response?.data?.message || "Could not create home. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="form-container">

        <div className="form-left">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "12px", padding: "24px" }}>
            <h2 style={{ color: "white", fontWeight: "800", fontSize: "28px", textAlign: "center" }}>
              Welcome! 🏠
            </h2>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "15px", textAlign: "center" }}>
              Let's set up your smart home. You can always update these details later.
            </p>
          </div>
        </div>

        <div className="form-right">
          <div className="form-card">
            <h2>Create Your Home</h2>
            <p style={{ color: "#777", fontSize: "13px", marginBottom: "16px" }}>
              Give your home a name to get started.
            </p>

            {error && (
              <p style={{ color: "red", fontSize: "13px", marginBottom: "10px" }}>
                {error}
              </p>
            )}

            <input
              placeholder="Home Name (e.g. My Home, Areesha's Place)"
              value={homeName}
              onChange={(e) => setHomeName(e.target.value)}
            />

            <input
              placeholder="Address (optional)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <button
              className="button-primary"
              onClick={handleCreateHome}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Home"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}