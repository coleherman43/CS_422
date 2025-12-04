import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import "../styles/ViewEvent.css";

function ViewEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrCode, setQrCode] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState("");
  const [expirationInfo, setExpirationInfo] = useState(null);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/events/${id}`);
      const data = await response.json();
      
      if (data.success && data.data.event) {
        setEvent(data.data.event);
      } else {
        setError("Event not found");
      }
    } catch (err) {
      console.error("Error fetching event:", err);
      setError("Failed to load event");
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    try {
      setQrLoading(true);
      setQrError("");
      const response = await fetch(`${API_URL}/events/${id}/qrcode`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setQrCode(data.data.qr_code);
        if (data.data.expires_at) {
          setExpirationInfo({
            expiresAt: new Date(data.data.expires_at),
            expiresInSeconds: data.data.expires_in_seconds
          });
        }
      } else {
        setQrError(data.message || "Failed to generate QR code");
      }
    } catch (err) {
      console.error("Error generating QR code:", err);
      setQrError("Failed to generate QR code");
    } finally {
      setQrLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatExpiration = (expiresAt) => {
    if (!expiresAt) return "";
    try {
      return expiresAt.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return "";
    }
  };

  if (loading) {
    return (
      <div className="view-event-container">
        <p>Loading event...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="view-event-container">
        <h1 className="view-event-title">Event Not Found</h1>
        <button className="back-btn" onClick={() => navigate("/dashboard/events")}>
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="view-event-container">
      <h1 className="view-event-title">{event.title || event.name}</h1>

      <div className="event-details-card">
        <p><strong>Date:</strong> {formatDate(event.event_date)}</p>
        {event.location && <p><strong>Location:</strong> {event.location}</p>}
        {event.description && (
          <p>
            <strong>Description:</strong> {event.description}
          </p>
        )}
      </div>

      {/* QR Code Section */}
      <div className="qr-code-section">
        <h2 className="qr-code-title">Event Check-in QR Code</h2>
        <p className="qr-code-description">
          Generate a QR code for this event. Attendees can scan it to check in.
        </p>
        
        {!qrCode && (
          <button 
            className="generate-qr-btn" 
            onClick={generateQRCode}
            disabled={qrLoading}
          >
            {qrLoading ? "Generating..." : "Generate QR Code"}
          </button>
        )}

        {qrError && <p className="qr-error">{qrError}</p>}

        {qrCode && (
          <div className="qr-code-display">
            <img src={qrCode} alt="Event QR Code" className="qr-code-image" />
            {expirationInfo && (
              <p className="qr-expiration">
                Expires: {formatExpiration(expirationInfo.expiresAt)}
              </p>
            )}
            <button 
              className="regenerate-qr-btn" 
              onClick={generateQRCode}
              disabled={qrLoading}
            >
              {qrLoading ? "Regenerating..." : "Regenerate QR Code"}
            </button>
          </div>
        )}
      </div>

      <button className="back-btn" onClick={() => navigate("/dashboard/events")}>
        ⬅ Back to Events
      </button>
    </div>
  );
}

export default ViewEvent;