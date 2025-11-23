import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import "../styles/Login.css";

function Login({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    if (!email) {
      alert("Please enter your email.");
      return;
    }

    // Store email for verification
    window.localStorage.setItem("emailForSignIn", email);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/request-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Check your email for a login link!");
      } else {
        alert(data.message || "Failed to send login link.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred. Please try again.");
    }
  }

  const circularText = "UOSW • ".repeat(8);

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-orbit-wrapper">
          <motion.svg
            className="login-orbit"
            viewBox="0 0 220 220"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 56, ease: "linear" }}
          >
            <defs>
              <path
                id="orbitPath"
                d="M 110,110 m -90,0 a 90,90 0 1,1 180,0 a 90,90 0 1,1 -180,0"
              />
            </defs>
            <text>
              <textPath href="#orbitPath" startOffset="50%" textAnchor="middle">
                {circularText}
              </textPath>
            </text>
          </motion.svg>

          <div className="login-header">
            <h1 className="login-title">Welcome to Flock Manager</h1>
            <p className="login-subtitle">Enter your email to continue</p>
          </div>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="UO Email or 95#"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" className="login-btn">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;