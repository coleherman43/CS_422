import React, { useState } from "react";
import "../styles/CreateEvent.css";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [eventData, setEventData] = useState({
    name: "",
    date: "",
    location: "",
    description: "",
  });

  function handleChange(e) {
    setEventData({
      ...eventData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Get the logged-in user's email from localStorage to find their member ID
      const userEmail = localStorage.getItem("userEmail");
      
      // Map form fields to API fields
      const apiData = {
        title: eventData.name, // Map 'name' to 'title' for API
        event_date: new Date(eventData.date).toISOString(), // Convert date to ISO string
        location: eventData.location,
        description: eventData.description || null,
        created_by: null // Will be set by backend if needed, or we can fetch member ID
      };

      // If we have user email, try to get member ID (optional - backend may handle this)
      if (userEmail) {
        try {
          const memberResponse = await fetch(`${API_URL}/members?search=${encodeURIComponent(userEmail)}`);
          const memberData = await memberResponse.json();
          if (memberData.success && memberData.data.members && memberData.data.members.length > 0) {
            apiData.created_by = memberData.data.members[0].id;
          }
        } catch (err) {
          console.log("Could not fetch member ID, continuing without it");
        }
      }

      const response = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      });

      const data = await response.json();

      if (data.success) {
        // Navigate back to events page after creating
        navigate("/dashboard/events");
      } else {
        setError(data.message || "Failed to create event");
      }
    } catch (err) {
      console.error("Error creating event:", err);
      setError("Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="create-event-container">
      <h1 className="create-event-title">Create New Event</h1>
      {error && <div className="error-message" style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}

      <form className="create-event-form" onSubmit={handleSubmit}>
        <label>Event Name</label>
        <input
          type="text"
          name="name"
          value={eventData.name}
          onChange={handleChange}
          required
        />

        <label>Date</label>
        <input
          type="date"
          name="date"
          value={eventData.date}
          onChange={handleChange}
          required
        />

        <label>Location</label>
        <input
          type="text"
          name="location"
          value={eventData.location}
          onChange={handleChange}
          required
        />

        <label>Description (optional)</label>
        <textarea
          name="description"
          value={eventData.description}
          onChange={handleChange}
        />

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Creating..." : "Create Event"}
        </button>
      </form>
    </div>
  );
}

export default CreateEvent;