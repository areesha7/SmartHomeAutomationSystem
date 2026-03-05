import React from "react"; // Import React to use JSX
import "../styles/theme.css"; // Import global CSS styles
import { Link } from "react-router-dom"; // Import Link to navigate between pages

// Functional component for Reset Password page
export default function ResetPassword() {
  return (
    <div className="auth-page"> {/* Wrapper div for CSS scope and background styling */}
      <div className="form-container"> {/* Container holding the left and right sections */}

        {/* Left section: logo/image */}
        <div className="form-left">
          <img src="/logo.png" alt="logo" /> {/* Logo image */}
        </div>

        {/* Right section: Reset Password form */}
        <div className="form-right">
          <div className="form-card"> {/* Card styling for the form */}
            <h2>Reset Password</h2> {/* Form title */}

            {/* Input field for email */}
            <input placeholder="Enter your email" type="email" />

            {/* Button to submit the reset password request */}
            <button className="button-primary">Send Reset Link</button>

            {/* Link to go back to login page */}
            <div className="form-links">
              <Link to="/login">Back to Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
