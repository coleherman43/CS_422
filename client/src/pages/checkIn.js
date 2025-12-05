import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { API_URL } from "../config";
import "../styles/CheckIn.css";

function CheckIn() {
  const { eventId: paramEventId } = useParams();
  const [searchParams] = useSearchParams();

  const [name, setName] = useState("");
  const [uoId, setUoId] = useState("");
  const [qrCodeToken, setQrCodeToken] = useState("");
  const [eventId, setEventId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [eventName, setEventName] = useState("");
  const [checkInSuccess, setCheckInSuccess] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    const eventIdFromUrl = searchParams.get("eventId");

    if (tokenFromUrl) {
      setQrCodeToken(tokenFromUrl);
      setMessage("QR code detected! Please enter your details to check in.");
    }
    
    const finalEventId = eventIdFromUrl || paramEventId || "";
    if (finalEventId) {
      setEventId(finalEventId);
      fetchEventName(finalEventId);
    }
  }, [searchParams, paramEventId]);

  const fetchEventName = async (id) => {
    if (!id) return;
    try {
      const response = await fetch(`${API_URL}/events/${id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.event) {
          setEventName(data.data.event.title || data.data.event.name || "");
        }
      }
    } catch (err) {
      // Silently fail - event name is not critical
      console.error("Error fetching event:", err);
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    // Validate inputs
    if (!qrCodeToken || !qrCodeToken.trim()) {
      setError("Missing QR code token. Please scan the QR code again.");
      setLoading(false);
      return;
    }

    if (!eventId || !eventId.trim()) {
      setError("Missing event information. Please scan the QR code again.");
      setLoading(false);
      return;
    }

    if (!name || !name.trim()) {
      setError("Name is required.");
      setLoading(false);
      return;
    }

    try {
      // Prepare safe values - truncate first, then trim
      const safeName = name.substring(0, 100).trim();
      const safeUoId = uoId ? uoId.substring(0, 20).trim() : null;
      const safeToken = qrCodeToken.trim();

      if (!safeName) {
        setError("Name cannot be empty.");
        setLoading(false);
        return;
      }

      // Build request body
      const requestBody = {
        name: safeName,
        qr_code_token: safeToken
      };

      if (safeUoId && safeUoId.length > 0) {
        requestBody.uo_id = safeUoId;
      }

      // Make API call
      const response = await fetch(`${API_URL}/events/${eventId}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.message || data.error || `Error ${response.status}: ${response.statusText}`;
        setError(errorMsg);
        setLoading(false);
        return;
      }

      if (data.success) {
        setMessage(data.message || "Check-in successful! Your attendance has been recorded.");
        setError("");
        setCheckInSuccess(true);
        setName("");
        setUoId("");
      } else {
        setError(data.message || "Check-in failed. Please try again.");
      }
    } catch (err) {
      console.error("Check-in error:", err);
      if (err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) {
        setError("Network error: Could not connect to server. Please check your connection and try again.");
      } else {
        setError(err.message || "An error occurred during check-in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="check-in-container">
      <h1 className="check-in-title">Event Check-in</h1>
      {eventName && <p className="event-name">Event: {eventName}</p>}
      <p className="check-in-description">
        {qrCodeToken 
          ? "Please enter your details to complete your check-in."
          : "Scan the event QR code and enter your details to check in."}
      </p>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {!checkInSuccess && (
        <form onSubmit={handleCheckIn} className="check-in-form">
          <div className="form-group">
            <label htmlFor="name">Your Full Name *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 100) {
                  setName(value);
                }
              }}
              required
              disabled={loading}
              placeholder="Enter your full name"
              maxLength={100}
            />
            {name.length > 0 && (
              <small style={{ color: name.length > 90 ? '#ff6b6b' : '#666', fontSize: '0.85rem' }}>
                {name.length}/100 characters
              </small>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="uoId">Your UO ID (95#) (optional)</label>
            <input
              type="text"
              id="uoId"
              value={uoId}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 20) {
                  setUoId(value);
                }
              }}
              disabled={loading}
              placeholder="Enter your 95# (optional)"
              maxLength={20}
            />
            {uoId.length > 0 && (
              <small style={{ color: uoId.length > 18 ? '#ff6b6b' : '#666', fontSize: '0.85rem' }}>
                {uoId.length}/20 characters
              </small>
            )}
          </div>

          <button type="submit" className="check-in-btn" disabled={loading}>
            {loading ? "Checking In..." : "Check In"}
          </button>
        </form>
      )}

      {checkInSuccess && (
        <div style={{ marginTop: "2rem", textAlign: "center", color: "#666" }}>
          <p>You can close this page now.</p>
        </div>
      )}
    </div>
  );
}

export default CheckIn;
