import React, { useState } from "react";
import "../styles/theme.css";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {

  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["","","","","",""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const dummyCode = "123456";

  const handleCodeChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if(value && index < 5){
      document.getElementById(`code-${index+1}`).focus();
    }
  };

  const sendLink = () => {
    if(!email){
      alert("Enter email first");
      return;
    }

    alert("Dummy verification code: 123456");
    setStep(2);
  };

  const verifyCode = () => {
    if(code.join("") === dummyCode){
      setStep(3);
    } else {
      alert("Incorrect code");
    }
  };

  const changePassword = () => {

    if(password !== confirmPassword){
      alert("Passwords do not match");
      return;
    }

    alert("Password updated successfully");
    navigate("/login");
  };

  return (
    <div className="auth-page">
      <div className="form-container">

        {/* Left Logo */}
        <div className="form-left">
          <img src="/logo.png" alt="logo" />
        </div>

        {/* Right Form */}
        <div className="form-right">
          <div className="form-card">

            {/* STEP 1 EMAIL */}
            {step === 1 && (
              <>
                <h2>Reset Password</h2>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                />

                <button className="button-primary" onClick={sendLink}>
                  Send Code
                </button>
              </>
            )}

            {/* STEP 2 VERIFICATION CODE */}
            {step === 2 && (
              <>
                <h2>Enter Verification Code</h2>

                <div style={{
                  display:"flex",
                  justifyContent:"center",
                  gap:"8px",
                  margin:"15px 0"
                }}>

                  {code.map((digit,index)=>(
                    <input
                      key={index}
                      id={`code-${index}`}
                      value={digit}
                      maxLength="1"
                      onChange={(e)=>handleCodeChange(e.target.value,index)}
                      style={{
                        width:"40px",
                        height:"40px",
                        textAlign:"center",
                        fontSize:"18px",
                        borderRadius:"8px",
                        border:"1px solid #ccc"
                      }}
                    />
                  ))}

                </div>

                <button className="button-primary" onClick={verifyCode}>
                  Verify Code
                </button>
              </>
            )}

            {/* STEP 3 NEW PASSWORD */}
            {step === 3 && (
              <>
                <h2>Create New Password</h2>

                <input
                  type="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                />

                <input
                  type="password"
                  placeholder="Re-enter Password"
                  value={confirmPassword}
                  onChange={(e)=>setConfirmPassword(e.target.value)}
                />

                <button className="button-primary" onClick={changePassword}>
                  Change Password
                </button>
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
