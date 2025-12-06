import React, { useState, useEffect } from "react";
import "../styles/SendEmail.css";
import { API_URL } from "../config";

function SendEmail() {
  const [workplaces, setWorkplaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [memberCount, setMemberCount] = useState(null);
  const [checkingCount, setCheckingCount] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    subject: "",
    message: ""
  });

  // Filter state
  const [filters, setFilters] = useState({
    workplace_id: "",
    dues_status: "",
    membership_status: "",
    search: ""
  });

  // Fetch workplaces for dropdown
  useEffect(() => {
    fetchWorkplaces();
  }, []);

  // Check member count when filters change
  useEffect(() => {
    if (filters.workplace_id || filters.dues_status || filters.membership_status || filters.search) {
      checkMemberCount();
    } else {
      setMemberCount(null);
    }
  }, [filters]);

  const fetchWorkplaces = async () => {
    try {
      const response = await fetch(`${API_URL}/workplaces`);
      const data = await response.json();
      if (data.success) {
        setWorkplaces(data.data.workplaces || []);
      }
    } catch (err) {
      console.error("Error fetching workplaces:", err);
    }
  };

  const checkMemberCount = async () => {
    setCheckingCount(true);
    try {
      const params = new URLSearchParams();
      if (filters.workplace_id) params.append("workplace_id", filters.workplace_id);
      if (filters.dues_status) params.append("dues_status", filters.dues_status);
      if (filters.membership_status) params.append("membership_status", filters.membership_status);
      if (filters.search) params.append("search", filters.search);

      const response = await fetch(`${API_URL}/members?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setMemberCount(data.data.members?.length || 0);
      } else {
        setMemberCount(0);
      }
    } catch (err) {
      console.error("Error checking member count:", err);
      setMemberCount(null);
    } finally {
      setCheckingCount(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate form
    if (!formData.subject.trim()) {
      setError("Subject is required");
      setLoading(false);
      return;
    }

    if (!formData.message.trim()) {
      setError("Message is required");
      setLoading(false);
      return;
    }

    // Check if we have any filters or if user wants to send to all
    const hasFilters = filters.workplace_id || filters.dues_status || filters.membership_status || filters.search;
    
    if (!hasFilters) {
      const confirmSend = window.confirm(
        "No filters are applied. This will send the email to ALL members. Are you sure you want to continue?"
      );
      if (!confirmSend) {
        setLoading(false);
        return;
      }
    }

    try {
      // Build query string for filters
      const params = new URLSearchParams();
      if (filters.workplace_id) params.append("workplace_id", filters.workplace_id);
      if (filters.dues_status) params.append("dues_status", filters.dues_status);
      if (filters.membership_status) params.append("membership_status", filters.membership_status);
      if (filters.search) params.append("search", filters.search);

      // Get authentication token
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to send emails. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/members/send-email?${params.toString()}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: formData.subject.trim(),
          message: formData.message.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Email sent successfully to ${data.data.recipients_count} member(s)!`);
        // Reset form
        setFormData({ subject: "", message: "" });
        setFilters({
          workplace_id: "",
          dues_status: "",
          membership_status: "",
          search: ""
        });
        setMemberCount(null);
      } else {
        setError(data.message || "Failed to send email");
      }
    } catch (err) {
      console.error("Error sending email:", err);
      setError("Failed to send email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      workplace_id: "",
      dues_status: "",
      membership_status: "",
      search: ""
    });
    setMemberCount(null);
  };

  return (
    <div className="send-email-container">
      <h1 className="send-email-title">Send Email to Members</h1>

      {error && (
        <div className="send-email-alert send-email-error">
          {error}
        </div>
      )}

      {success && (
        <div className="send-email-alert send-email-success">
          {success}
        </div>
      )}

      <div className="send-email-content">
        {/* Filters Section */}
        <div className="send-email-filters">
          <h2>Filter Members</h2>
          <p className="send-email-subtitle">
            Select filters to target specific groups of members. Leave all filters empty to send to all members.
          </p>

          <div className="send-email-filters-grid">
            <div className="form-group">
              <label>Workplace</label>
              <select
                value={filters.workplace_id}
                onChange={(e) => handleFilterChange("workplace_id", e.target.value)}
              >
                <option value="">All Workplaces</option>
                {workplaces.map(wp => (
                  <option key={wp.id} value={wp.id}>{wp.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Dues Status</label>
              <select
                value={filters.dues_status}
                onChange={(e) => handleFilterChange("dues_status", e.target.value)}
              >
                <option value="">All Dues Status</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="exempt">Exempt</option>
              </select>
            </div>

            <div className="form-group">
              <label>Membership Status</label>
              <select
                value={filters.membership_status}
                onChange={(e) => handleFilterChange("membership_status", e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div className="form-group">
              <label>Search (Name or Email)</label>
              <input
                type="text"
                placeholder="Search members..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
          </div>

          <div className="send-email-filters-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
            {(filters.workplace_id || filters.dues_status || filters.membership_status || filters.search) && (
              <div className="member-count-preview">
                {checkingCount ? (
                  <span>Checking...</span>
                ) : memberCount !== null ? (
                  <span>
                    <strong>{memberCount}</strong> member{memberCount !== 1 ? "s" : ""} will receive this email
                  </span>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Email Form Section */}
        <div className="send-email-form-section">
          <h2>Email Content</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Subject *</label>
              <input
                type="text"
                placeholder="Email subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                maxLength={200}
              />
            </div>

            <div className="form-group">
              <label>Message *</label>
              <textarea
                placeholder="Email message content"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={10}
                maxLength={5000}
              />
              <div className="char-count">
                {formData.message.length} / 5000 characters
              </div>
            </div>

            <div className="send-email-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Email"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setFormData({ subject: "", message: "" });
                  setError("");
                  setSuccess("");
                }}
                disabled={loading}
              >
                Clear Form
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SendEmail;

