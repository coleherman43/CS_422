import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams, useNavigate } from "react-router-dom";
import "./app.css";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard"; // Dashboard already handles sub-routes
import { getAuth, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { initializeApp } from "firebase/app";

// Initialize Firebase (minimal config - will need to be set by frontend team)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
};
const app = firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;

// Verify component to handle email link callback
function Verify({ setIsLoggedIn }) {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Verifying...");
  const navigate = useNavigate();

  useEffect(() => {
    async function verifyEmailLink() {
      if (!auth) {
        setStatus("Firebase not configured.");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      try {
        const email = window.localStorage.getItem("emailForSignIn") || searchParams.get("email");
        
        if (isSignInWithEmailLink(auth, window.location.href) && email) {
          const result = await signInWithEmailLink(auth, email, window.location.href);
          const idToken = await result.user.getIdToken();

          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });

          const data = await response.json();
          if (data.success && data.data.token) {
            localStorage.setItem("token", data.data.token);
            localStorage.setItem("loggedIn", "true");
            window.localStorage.removeItem("emailForSignIn");
            setIsLoggedIn(true);
            setStatus("Login successful! Redirecting...");
            setTimeout(() => navigate("/dashboard"), 1000);
          } else {
            setStatus(data.message || "Verification failed.");
            setTimeout(() => navigate("/login"), 2000);
          }
        } else {
          setStatus("Invalid verification link.");
          setTimeout(() => navigate("/login"), 2000);
        }
      } catch (error) {
        console.error("Verify error:", error);
        setStatus("An error occurred during verification.");
        setTimeout(() => navigate("/login"), 2000);
      }
    }

    verifyEmailLink();
  }, [searchParams, navigate, setIsLoggedIn]);

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