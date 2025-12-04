import React, { useState, useEffect } from "react";
import "../styles/Events.css";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

function Events() {
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Fetch upcoming events
      const upcomingResponse = await fetch(`${API_URL}/events/upcoming`);
      const upcomingData = await upcomingResponse.json();
      
      if (upcomingData.success) {
        setUpcomingEvents(upcomingData.data.events || []);
      }

      // Fetch all events to determine past events
      const allResponse = await fetch(`${API_URL}/events`);
      const allData = await allResponse.json();
      
      if (allData.success) {
        const now = new Date();
        const past = (allData.data.events || []).filter(event => {
          if (!event.event_date) return false;
          const eventDate = new Date(event.event_date);
          return eventDate < now;
        });
        setPastEvents(past);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="events-container">
        <p>Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="events-container">
        <p className="error-text">{error}</p>
      </div>
    );
  }

  return (
    <div className="events-container">

      {/* CREATE EVENT BUTTON */}
      <button
        className="create-event-btn"
        onClick={() => navigate("/dashboard/events/create")}
      >
        + Create Event
      </button>

      {/* UPCOMING EVENTS */}
      <h1 className="events-title">Upcoming Events</h1>

      <div className="events-grid">
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((event) => (
            <div key={event.id} className="event-card">
              <h2>{event.title || event.name}</h2>
              <p><strong>Date:</strong> {formatDate(event.event_date)}</p>
              {event.location && <p><strong>Location:</strong> {event.location}</p>}

              <button
                className="event-btn"
                onClick={() => navigate(`/dashboard/events/${event.id}`)}
              >
                View Details
              </button>
            </div>
          ))
        ) : (
          <p className="empty-text">No upcoming events.</p>
        )}
      </div>

      {/* PAST EVENTS */}
      <h1 className="events-title">Past Events</h1>

      <div className="events-grid">
        {pastEvents.length > 0 ? (
          pastEvents.map((event) => (
            <div key={event.id} className="event-card past">
              <h2>{event.title || event.name}</h2>
              <p><strong>Date:</strong> {formatDate(event.event_date)}</p>
              {event.location && <p><strong>Location:</strong> {event.location}</p>}

              <button
                className="event-btn past"
                onClick={() => navigate(`/dashboard/events/${event.id}`)}
              >
                View Summary
              </button>
            </div>
          ))
        ) : (
          <p className="empty-text">No past events.</p>
        )}
      </div>
    </div>
  );
}

export default Events;