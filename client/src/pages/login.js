import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Welcome to Flock Manager</h1>
        <p className="login-subtitle">Enter your email to continue</p>

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