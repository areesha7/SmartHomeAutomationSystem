// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import "../styles/theme.css";
// import logo from "../assets/logoHomi.jpeg";

// export default function Login() {
//   // -----------------------------
//   // State hooks for controlled inputs
//   // -----------------------------
//   const [email, setEmail] = useState("");       // Stores email input
//   const [password, setPassword] = useState(""); // Stores password input

//   // -----------------------------
//   // Handler for login button
//   // -----------------------------
//   const handleLogin = () => {
//     // TODO: Add login API call or validation logic
//     console.log("Logging in with:", { email, password });
//   };

//   // -----------------------------
//   // Handler for Google login
//   // -----------------------------
//   const handleGoogleLogin = () => {
//     // TODO: Integrate Google OAuth login here
//     console.log("Signing in with Google");
//   };

//   return (
//     <div className="auth-page"> {/* Wrapper for page styling */}
//       <div className="form-container">
        
//         {/* -----------------------------
//             Left side: logo or branding
//         ----------------------------- */}
//         <div className="form-left">
//           <img src={logo} alt="logo" />
//         </div>

//         {/* -----------------------------
//             Right side: login form
//         ----------------------------- */}
//         <div className="form-right">
//           <div className="form-card">

//             {/* Form header */}
//             <h2>Login</h2>

//             {/* Email input */}
//             <input
//               type="email"
//               placeholder="Email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)} // Update state on change
//             />

//             {/* Password input */}
//             <input
//               type="password"
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)} // Update state on change
//             />

//             {/* Login button */}
//             <button className="button-primary" onClick={handleLogin}>
//               Login
//             </button>

//             {/* Google login button */}
//             <button className="button-google" onClick={handleGoogleLogin}>
//               <img src="/google.logo.png" alt="google" />
//               Sign in with Google
//             </button>

//             {/* Links for password reset */}
//             <div className="form-links">
//               <Link to="/reset">Forgot Password?</Link>
//             </div>

//             {/* Links for signup */}
//             <div className="form-links">
//               Don't have an account? <Link to="/signup">Signup</Link>
//             </div>

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/theme.css";
import logo from "../assets/logoHomi.jpeg";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const navigate    = useNavigate();
  const { login }   = useAuth();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { user, tokens } = response.data.data;

      login(user, tokens.accessToken);

      navigate("/");

    } catch (err) {
      const message = err.response?.data?.message || "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log("Google login — coming soon");
  };

  return (
    <div className="auth-page">
      <div className="form-container">

        <div className="form-left">
          <img src={logo} alt="logo" />
        </div>

        <div className="form-right">
          <div className="form-card">

            <h2>Login</h2>

            {error && (
              <p style={{ color: "red", fontSize: "13px", marginBottom: "10px" }}>
                {error}
              </p>
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              className="button-primary"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <button className="button-google" onClick={handleGoogleLogin}>
              <img src="/google.logo.png" alt="google" />
              Sign in with Google
            </button>

            <div className="form-links">
              <Link to="/reset">Forgot Password?</Link>
            </div>

            <div className="form-links">
              Don't have an account? <Link to="/signup">Signup</Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}