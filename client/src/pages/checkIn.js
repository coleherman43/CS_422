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

    // Validate QR token is present and not empty FIRST
    if (!qrCodeToken || qrCodeToken.trim().length === 0) {
      setError("Missing QR code token. Please scan the QR code again.");
      setLoading(false);
      return;
    }

    // Validate eventId is present
    if (!eventId || eventId.trim().length === 0) {
      setError("Missing event information. Please scan the QR code again.");
      setLoading(false);
      return;
    }

    if (!name || name.trim().length === 0) {
      setError("Name is required.");
      setLoading(false);
      return;
    }

    try {
      // CRITICAL: Truncate to database limits FIRST (before any processing)
      // Database: name VARCHAR(100), uo_id VARCHAR(20)
      // We truncate to 100/20 FIRST, then trim, to ensure we NEVER exceed limits
      let safeName = typeof name === 'string' ? name.substring(0, 100) : '';
      let safeUoId = (uoId && typeof uoId === 'string') ? uoId.substring(0, 20) : null;
      
      // Now trim whitespace
      safeName = safeName.trim();
      safeUoId = safeUoId ? safeUoId.trim() : null;
      
      // Final validation - ensure name is not empty after processing
      if (!safeName || safeName.length === 0) {
        setError("Name is required.");
        setLoading(false);
        return;
      }
      
      // Double-check lengths (should never exceed, but safety check)
      if (safeName.length > 100) {
        safeName = safeName.substring(0, 100);
      }
      if (safeUoId && safeUoId.length > 20) {
        safeUoId = safeUoId.substring(0, 20);
      }
      
      // Log what we're sending for debugging
      console.log('Sending check-in request:', {
        nameLength: safeName.length,
        uoIdLength: safeUoId ? safeUoId.length : 0,
        eventId: eventId,
        hasToken: !!qrCodeToken
      });
      
      const requestBody = {
        name: safeName,
        qr_code_token: qrCodeToken.trim() // Ensure token is trimmed
      };
      
      // Only include uo_id if it's provided and not empty
      if (safeUoId && safeUoId.length > 0) {
        requestBody.uo_id = safeUoId;
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
        const errorMessage = data.message || data.error || `Error: ${response.status} ${response.statusText}`;
        console.error('Check-in API error:', {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
          data: data
        });
        setError(errorMessage);
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
              onChange={(e) => {
                // Enforce maxLength in real-time
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
                // Enforce maxLength in real-time
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

