import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams, useNavigate } from "react-router-dom";
import "./app.css";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard"; // Dashboard already handles sub-routes
import CheckIn from "./pages/checkIn"; // Public check-in page
import { getAuth, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { API_URL, FIREBASE_CONFIG } from "./config";

// Initialize Firebase using runtime config
const app = FIREBASE_CONFIG && FIREBASE_CONFIG.apiKey ? initializeApp(FIREBASE_CONFIG) : null;
const auth = app ? getAuth(app) : null;

// Verify component to handle email link callback
function Verify({ setIsLoggedIn }) {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Verifying...");
  const [emailInput, setEmailInput] = useState("");
  const [needsEmail, setNeedsEmail] = useState(false);
  const navigate = useNavigate();

  const verifyEmailLink = useCallback(async (email) => {
      try {
        const token = searchParams.get("token");

        // Check for development token (when Firebase is not configured)
        if (token && email) {
          console.log("Using development token authentication");
          const response = await fetch(`${API_URL}/auth/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, email }),
          });

          const data = await response.json();
          if (data.success && data.data.token) {
            localStorage.setItem("token", data.data.token);
            localStorage.setItem("loggedIn", "true");
            window.localStorage.removeItem("emailForSignIn");
            setIsLoggedIn(true);
            setStatus("Login successful! Redirecting...");
            setTimeout(() => navigate("/dashboard"), 1000);
            return;
          } else {
            setStatus(data.message || "Verification failed.");
            setTimeout(() => navigate("/login"), 2000);
            return;
          }
        }

        // Firebase authentication (production mode)
        if (!auth) {
          setStatus("Firebase not configured. Please use the development login link.");
          setTimeout(() => navigate("/login"), 3000);
          return;
        }

        // Check if this is a Firebase email link
        if (!isSignInWithEmailLink(auth, window.location.href)) {
          setStatus("Invalid verification link.");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        // If email not provided and it's a Firebase link, we need the email
        if (!email) {
          setNeedsEmail(true);
          setStatus("Please enter your email address to complete sign-in:");
          return;
        }

        // Complete Firebase email link sign-in
        console.log("Attempting Firebase sign-in with email:", email);
        console.log("Current URL:", window.location.href);
        try {
          const result = await signInWithEmailLink(auth, email, window.location.href);
          console.log("Firebase sign-in successful, getting ID token...");
          const idToken = await result.user.getIdToken();
          console.log("ID token obtained, verifying with backend...");

          const apiUrl = API_URL;
          console.log("Calling backend API:", `${apiUrl}/auth/verify`);
          
          const response = await fetch(`${apiUrl}/auth/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });

          console.log("Backend response status:", response.status);
          const data = await response.json();
          console.log("Backend response data:", data);
          
          if (data.success && data.data.token) {
            localStorage.setItem("token", data.data.token);
            localStorage.setItem("loggedIn", "true");
            window.localStorage.removeItem("emailForSignIn");
            setIsLoggedIn(true);
            setStatus("Login successful! Redirecting...");
            setTimeout(() => navigate("/dashboard"), 1000);
          } else {
            const errorMsg = data.message || data.details || "Verification failed.";
            console.error("Backend verification failed:", errorMsg);
            setStatus(`Verification failed: ${errorMsg}`);
            setTimeout(() => navigate("/login"), 3000);
          }
        } catch (firebaseError) {
          console.error("Firebase sign-in error:", firebaseError);
          console.error("Error code:", firebaseError.code);
          console.error("Error message:", firebaseError.message);
          
          if (firebaseError.code === 'auth/invalid-action-code') {
            setStatus("This link has expired or been used already. Please request a new login link.");
            setTimeout(() => navigate("/login"), 3000);
          } else if (firebaseError.code === 'auth/invalid-email') {
            setStatus("Invalid email address. Please try again.");
            setNeedsEmail(true);
          } else {
            setStatus(`Error: ${firebaseError.message || firebaseError.code || 'Unknown error'}. Please try again.`);
            setNeedsEmail(true);
          }
        }
      } catch (error) {
        console.error("Verify error:", error);
        console.error("Error stack:", error.stack);
        const errorMessage = error.message || error.toString() || "Unknown error";
        setStatus(`An error occurred during verification: ${errorMessage}`);
        setTimeout(() => navigate("/login"), 3000);
      }
  }, [searchParams, navigate, setIsLoggedIn]);

  useEffect(() => {
    // Try to get email from localStorage or URL params
    const email = window.localStorage.getItem("emailForSignIn") || searchParams.get("email");
    verifyEmailLink(email);
  }, [searchParams, verifyEmailLink]);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes("@")) {
      setStatus("Please enter a valid email address.");
      return;
    }
    setNeedsEmail(false);
    setStatus("Verifying...");
    verifyEmailLink(emailInput);
  };

  if (needsEmail) {
    return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", gap: "20px" }}>
        <p>{status}</p>
        <form onSubmit={handleEmailSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", width: "300px" }}>
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="Enter your email"
            style={{ padding: "10px", fontSize: "16px" }}
            autoFocus
          />
          <button type="submit" style={{ padding: "10px", fontSize: "16px", cursor: "pointer" }}>
            Continue
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <p>{status}</p>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("loggedIn") === "true"
  );

  // Sync login state across tabs
  useEffect(() => {
    const handleStorage = () => {
      setIsLoggedIn(localStorage.getItem("loggedIn") === "true");
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Redirect root based on login */}
        <Route
          path="/"
          element={
            isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          }
        />

        {/* Login page */}
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />

        {/* Verify email link */}
        <Route path="/verify" element={<Verify setIsLoggedIn={setIsLoggedIn} />} />

        {/* Public check-in routes (no authentication required) */}
        <Route path="/checkin/:eventId" element={<CheckIn />} />
        <Route path="/checkin" element={<CheckIn />} />

        {/* Dashboard and all its sub-routes (members, events, reports, etc.) */}
        <Route
          path="/dashboard/*"
          element={
            isLoggedIn ? (
              <Dashboard setIsLoggedIn={setIsLoggedIn} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;