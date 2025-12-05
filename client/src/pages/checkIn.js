import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { API_URL } from "../config";
import "../styles/CheckIn.css";

function CheckIn() {
  const { eventId: paramEventId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [uoId, setUoId] = useState("");
  const [qrCodeToken, setQrCodeToken] = useState("");
  const [eventId, setEventId] = useState(paramEventId || "");
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
    if (eventIdFromUrl) {
      setEventId(eventIdFromUrl);
    } else if (paramEventId) {
      setEventId(paramEventId);
    }

    // Fetch event name if eventId is available
    if (eventIdFromUrl || paramEventId) {
      fetchEventName(eventIdFromUrl || paramEventId);
    }
  }, [searchParams, paramEventId]);

  const fetchEventName = async (id) => {
    if (!id) return;
    try {
      const response = await fetch(`${API_URL}/events/${id}`);
      if (!response.ok) {
        console.error("Failed to fetch event:", response.status);
        return;
      }
      const data = await response.json();
      if (data.success && data.data.event) {
        setEventName(data.data.event.title || data.data.event.name);
      }
    } catch (err) {
      console.error("Error fetching event:", err);
      // Don't show error to user for event name fetch failure
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (!name) {
      setError("Name is required.");
      setLoading(false);
      return;
    }

    // Validate field lengths
    if (name.trim().length > 100) {
      setError("Name is too long. Please enter a name with 100 characters or less.");
      setLoading(false);
      return;
    }

    if (uoId.trim().length > 20) {
      setError("95# is too long. Please enter a 95# with 20 characters or less.");
      setLoading(false);
      return;
    }

    if (!qrCodeToken && !eventId) {
      setError("Missing QR code information. Please scan the QR code again.");
      setLoading(false);
      return;
    }

    try {
      // Truncate to database limits to prevent errors
      // Database: name VARCHAR(100), uo_id VARCHAR(20)
      const trimmedName = name.trim().substring(0, 100);
      const trimmedUoId = uoId ? uoId.trim().substring(0, 20) : null;
      
      const requestBody = {
        name: trimmedName,
        qr_code_token: qrCodeToken
      };
      
      // Only include uo_id if it's provided
      if (trimmedUoId && trimmedUoId.length > 0) {
        requestBody.uo_id = trimmedUoId;
      }

      const response = await fetch(`${API_URL}/events/${eventId}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      // Check if response is ok before trying to parse JSON
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("JSON parse error:", jsonError);
        setError(`Server error: ${response.status} ${response.statusText}. Please try again.`);
        setMessage("");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        // Handle HTTP error status codes
        setError(data.message || `Error: ${response.status} ${response.statusText}`);
        setMessage("");
        setLoading(false);
        return;
      }

      if (data.success) {
        setMessage(data.message || "Check-in successful! Your attendance has been recorded.");
        setError("");
        setCheckInSuccess(true);
        // Clear form after successful check-in
        setName("");
        setUoId("");
        setQrCodeToken(""); // Clear token after successful use
        // Don't redirect since user may not be logged in
        // Just show success message
      } else {
        setError(data.message || "Check-in failed. Please try again.");
        setMessage("");
      }
    } catch (err) {
      console.error("Check-in error:", err);
      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        setError("Network error: Could not connect to server. Please check your connection and try again.");
      } else {
        setError(err.message || "An error occurred during check-in. Please try again.");
      }
      setMessage("");
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
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your full name"
              maxLength={100}
            />
          </div>
          <div className="form-group">
            <label htmlFor="uoId">Your UO ID (95#) (optional)</label>
            <input
              type="text"
              id="uoId"
              value={uoId}
              onChange={(e) => setUoId(e.target.value)}
              disabled={loading}
              placeholder="Enter your 95# (optional)"
              maxLength={20}
            />
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

