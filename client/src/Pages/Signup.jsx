import React from "react"; // Import React to use JSX
import "../styles/theme.css"; // Import global CSS styles
import { Link } from "react-router-dom"; // Import Link for routing between pages
import logo from "../assets/logoHomi.jpeg"; 

// Functional component for Signup page
export default function Signup() {
  return (
    <div className="auth-page"> {/* Wrapper div for CSS scope and general page background */}
      <div className="form-container"> {/* Flex container holding left and right sections */}

        {/* Left section: logo or image */}
        <div className="form-left">
          <img src={logo} alt="logo" /> {/* App logo */}
        </div>

        {/* Right section: Signup form */}
        <div className="form-right">
          <div className="form-card"> {/* Card style for the form container */}
            <h2>Signup</h2> {/* Form title */}

            {/* Input fields for user details */}
            <input placeholder="Full Name" />
            <input placeholder="Email" type="email" />
            <input placeholder="Password" type="password" />

            {/* Button to submit signup form */}
            <button className="button-primary">Signup</button>

            {/* Alternative signup option using Google */}
            <button className="button-google">
              <img src="/google.logo.png" alt="google" />
              Signup with Google
            </button>

            {/* Link to login page for existing users */}
            <div className="form-links">
              Already have an account? <Link to="/login">Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
