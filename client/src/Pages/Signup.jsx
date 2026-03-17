// import React from "react"; // Import React to use JSX
// import "../styles/theme.css"; // Import global CSS styles
// import { Link } from "react-router-dom"; // Import Link for routing between pages
// import logo from "../assets/logoHomi.jpeg"; 

// // Functional component for Signup page
// export default function Signup() {
//   return (
//     <div className="auth-page"> {/* Wrapper div for CSS scope and general page background */}
//       <div className="form-container"> {/* Flex container holding left and right sections */}

//         {/* Left section: logo or image */}
//         <div className="form-left">
//           <img src={logo} alt="logo" /> {/* App logo */}
//         </div>

//         {/* Right section: Signup form */}
//         <div className="form-right">
//           <div className="form-card"> {/* Card style for the form container */}
//             <h2>Signup</h2> {/* Form title */}

//             {/* Input fields for user details */}
//             <input placeholder="Full Name" />
//             <input placeholder="Email" type="email" />
//             <input placeholder="Password" type="password" />

//             {/* Button to submit signup form */}
//             <button className="button-primary">Signup</button>

//             {/* Alternative signup option using Google */}
//             <button className="button-google">
//               <img src="/google.logo.png" alt="google" />
//               Signup with Google
//             </button>

//             {/* Link to login page for existing users */}
//             <div className="form-links">
//               Already have an account? <Link to="/login">Login</Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useState } from "react";
import "../styles/theme.css";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logoHomi.jpeg";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function Signup() {
  const navigate  = useNavigate();
  const { login } = useAuth();

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setError("All fields are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        role: "ADMIN",
      });

      const { user, tokens } = response.data.data;

      login(user, tokens.accessToken);

      navigate("/create-home");

    } catch (err) {
      const message = err.response?.data?.message || "Signup failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    console.log("Google signup — coming soon");
  };

  return (
    <div className="auth-page">
      <div className="form-container">

        <div className="form-left">
          <img src={logo} alt="logo" />
        </div>

        <div className="form-right">
          <div className="form-card">
            <h2>Signup</h2>

            {error && (
              <p style={{ color: "red", fontSize: "13px", marginBottom: "10px" }}>
                {error}
              </p>
            )}

            <input
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              className="button-primary"
              onClick={handleSignup}
              disabled={loading}
            >
              {loading ? "Creating account..." : "Signup"}
            </button>

            <button className="button-google" onClick={handleGoogleSignup}>
              <img src="/google.logo.png" alt="google" />
              Signup with Google
            </button>

            <div className="form-links">
              Already have an account? <Link to="/login">Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}