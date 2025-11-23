import React, { useState, useEffect } from "react";
import "../styles/Member.css";

// Dummy data for demonstration
const DUMMY_MEMBERS = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex.johnson@uoregon.edu",
    uo_id: "951234567",
    workplace_id: 1,
    role_id: 1,
    workplace_name: "EMU",
    role_name: "President",
    dues_status: "paid",
    membership_status: "active",
    major: "Computer Science",
    phone: "555-0101",
    pronouns: "they/them",
    graduation_year: 2025,
    created_at: "2023-08-15T10:00:00Z",
    updated_at: "2024-01-20T14:30:00Z"
  },
  {
    id: 2,
    name: "Sarah Chen",
    email: "sarah.chen@uoregon.edu",
    uo_id: "951234568",
    workplace_id: 2,
    role_id: 2,
    workplace_name: "Central Kitchen",
    role_name: "Treasurer",
    dues_status: "paid",
    membership_status: "active",
    major: "Business Administration",
    phone: "555-0102",
    pronouns: "she/her",
    graduation_year: 2024,
    created_at: "2023-09-01T09:15:00Z",
    updated_at: "2024-01-18T11:20:00Z"
  },
  {
    id: 3,
    name: "Marcus Rodriguez",
    email: "marcus.rodriguez@uoregon.edu",
    uo_id: "951234569",
    workplace_id: 3,
    role_id: 3,
    workplace_name: "Library",
    role_name: "Executive Member",
    dues_status: "unpaid",
    membership_status: "active",
    major: "Psychology",
    phone: "555-0103",
    pronouns: "he/him",
    graduation_year: 2026,
    created_at: "2023-10-10T13:45:00Z",
    updated_at: "2024-01-15T16:00:00Z"
  },
  {
    id: 4,
    name: "Taylor Kim",
    email: "taylor.kim@uoregon.edu",
    uo_id: "951234570",
    workplace_id: 4,
    role_id: 4,
    workplace_name: "Recreation Center",
    role_name: "Member",
    dues_status: "paid",
    membership_status: "active",
    major: "Environmental Studies",
    phone: "555-0104",
    pronouns: "she/they",
    graduation_year: 2025,
    created_at: "2023-11-05T08:30:00Z",
    updated_at: "2024-01-12T10:15:00Z"
  },
  {
    id: 5,
    name: "Jordan Smith",
    email: "jordan.smith@uoregon.edu",
    uo_id: "951234571",
    workplace_id: 5,
    role_id: 4,
    workplace_name: "Bookstore",
    role_name: "Member",
    dues_status: "unpaid",
    membership_status: "inactive",
    major: "Mathematics",
    phone: "555-0105",
    pronouns: "he/him",
    graduation_year: 2024,
    created_at: "2022-12-01T12:00:00Z",
    updated_at: "2023-11-20T14:00:00Z"
  },
  {
    id: 6,
    name: "Casey Williams",
    email: "casey.williams@uoregon.edu",
    uo_id: "951234572",
    workplace_id: 6,
    role_id: 4,
    workplace_name: "Dining Services",
    role_name: "Member",
    dues_status: "paid",
    membership_status: "graduated",
    major: "English Literature",
    phone: "555-0106",
    pronouns: "they/them",
    graduation_year: 2023,
    created_at: "2022-09-15T10:30:00Z",
    updated_at: "2023-06-10T09:00:00Z"
  },
  {
    id: 7,
    name: "Riley Martinez",
    email: "riley.martinez@uoregon.edu",
    uo_id: "951234573",
    workplace_id: 1,
    role_id: 4,
    workplace_name: "EMU",
    role_name: "Member",
    dues_status: "exempt",
    membership_status: "active",
    major: "Journalism",
    phone: "555-0107",
    pronouns: "she/her",
    graduation_year: 2026,
    created_at: "2024-01-10T11:00:00Z",
    updated_at: "2024-01-10T11:00:00Z"
  },
  {
    id: 8,
    name: "Morgan Brown",
    email: "morgan.brown@uoregon.edu",
    uo_id: "951234574",
    workplace_id: 2,
    role_id: 4,
    workplace_name: "Central Kitchen",
    role_name: "Member",
    dues_status: "paid",
    membership_status: "active",
    major: "Biology",
    phone: "555-0108",
    pronouns: "he/they",
    graduation_year: 2025,
    created_at: "2023-12-05T15:20:00Z",
    updated_at: "2024-01-22T13:45:00Z"
  }
];

const DUMMY_ROLES = [
  { id: 1, name: "President" },
  { id: 2, name: "Treasurer" },
  { id: 3, name: "Executive Member" },
  { id: 4, name: "Member" }
];

const DUMMY_WORKPLACES = [
  { id: 1, name: "EMU" },
  { id: 2, name: "Central Kitchen" },
  { id: 3, name: "Library" },
  { id: 4, name: "Recreation Center" },
  { id: 5, name: "Bookstore" },
  { id: 6, name: "Dining Services" }
];

function Member() {
  const [members, setMembers] = useState(DUMMY_MEMBERS);
  const [roles, setRoles] = useState(DUMMY_ROLES);
  const [workplaces, setWorkplaces] = useState(DUMMY_WORKPLACES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useDummyData, setUseDummyData] = useState(true);
  
  // Filters
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [duesFilter, setDuesFilter] = useState("All");
  
  // UI State
  const [expandedMemberId, setExpandedMemberId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  
  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    uo_id: "",
    workplace_id: "",
    role_id: "",
    dues_status: "unpaid",
    membership_status: "active",
    major: "",
    phone: "",
    pronouns: "",
    graduation_year: ""
  });

  // Fetch members from backend
  const fetchMembers = async () => {
    // If using dummy data, skip fetch
    if (useDummyData) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter) params.append("search", filter);
      if (statusFilter !== "All") params.append("membership_status", statusFilter.toLowerCase());
      
      const response = await fetch(`/api/members?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setMembers(data.data.members);
        setError(null);
      } else {
        setError(data.message || "Failed to fetch members");
        // Fallback to dummy data on error
        setUseDummyData(true);
        setMembers(DUMMY_MEMBERS);
      }
    } catch (err) {
      console.error("Error fetching members:", err);
      setError("Failed to load members. Showing dummy data instead.");
      // Fallback to dummy data on error
      setUseDummyData(true);
      setMembers(DUMMY_MEMBERS);
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles and workplaces for dropdowns
  const fetchDropdownData = async () => {
    // If using dummy data, skip fetch
    if (useDummyData) {
      return;
    }
    
    try {
      const [rolesRes, workplacesRes] = await Promise.all([
        fetch("/api/roles"),
        fetch("/api/workplaces")
      ]);
      
      const rolesData = await rolesRes.json();
      const workplacesData = await workplacesRes.json();
      
      if (rolesData.success) setRoles(rolesData.data.roles);
      if (workplacesData.success) setWorkplaces(workplacesData.data.workplaces);
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
      // Keep dummy data on error
      setUseDummyData(true);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchDropdownData();
  }, [filter, statusFilter]);

  // Handle add member
  const handleAddMember = async (e) => {
    e.preventDefault();
    
    // If using dummy data, just add to local state
    if (useDummyData) {
      const newMember = {
        id: Math.max(...members.map(m => m.id)) + 1,
        ...formData,
        workplace_name: workplaces.find(wp => wp.id == formData.workplace_id)?.name || null,
        role_name: roles.find(r => r.id == formData.role_id)?.name || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setMembers([...members, newMember]);
      alert("Member added successfully! (Dummy data)");
      setShowAddModal(false);
      resetForm();
      return;
    }
    
    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert("Member added successfully!");
        setShowAddModal(false);
        resetForm();
        fetchMembers();
      } else {
        alert(data.message || "Failed to add member");
      }
    } catch (err) {
      console.error("Error adding member:", err);
      alert("Failed to add member. Please try again.");
    }
  };

  // Handle update member
  const handleUpdateMember = async (e) => {
    e.preventDefault();
    
    // If using dummy data, just update local state
    if (useDummyData) {
      const updatedMembers = members.map(m => 
        m.id === editingMember.id 
          ? {
              ...m,
              ...formData,
              workplace_name: workplaces.find(wp => wp.id == formData.workplace_id)?.name || null,
              role_name: roles.find(r => r.id == formData.role_id)?.name || null,
              updated_at: new Date().toISOString()
            }
          : m
      );
      setMembers(updatedMembers);
      alert("Member updated successfully! (Dummy data)");
      setEditingMember(null);
      resetForm();
      setExpandedMemberId(null);
      return;
    }
    
    try {
      const response = await fetch(`/api/members/${editingMember.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert("Member updated successfully!");
        setEditingMember(null);
        resetForm();
        fetchMembers();
        setExpandedMemberId(null);
      } else {
        alert(data.message || "Failed to update member");
      }
    } catch (err) {
      console.error("Error updating member:", err);
      alert("Failed to update member. Please try again.");
    }
  };

  // Handle delete member
  const handleDeleteMember = async (id) => {
    if (!window.confirm("Are you sure you want to delete this member?")) {
      return;
    }
    
    // If using dummy data, just remove from local state
    if (useDummyData) {
      setMembers(members.filter(m => m.id !== id));
      alert("Member deleted successfully! (Dummy data)");
      if (expandedMemberId === id) {
        setExpandedMemberId(null);
      }
      return;
    }
    
    try {
      const response = await fetch(`/api/members/${id}`, {
        method: "DELETE"
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert("Member deleted successfully!");
        fetchMembers();
        if (expandedMemberId === id) {
          setExpandedMemberId(null);
        }
      } else {
        alert(data.message || "Failed to delete member");
      }
    } catch (err) {
      console.error("Error deleting member:", err);
      alert("Failed to delete member. Please try again.");
    }
  };

  // Open edit form
  const openEditForm = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || "",
      email: member.email || "",
      uo_id: member.uo_id || "",
      workplace_id: member.workplace_id || "",
      role_id: member.role_id || "",
      dues_status: member.dues_status || "unpaid",
      membership_status: member.membership_status || "active",
      major: member.major || "",
      phone: member.phone || "",
      pronouns: member.pronouns || "",
      graduation_year: member.graduation_year || ""
    });
    setExpandedMemberId(member.id);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      uo_id: "",
      workplace_id: "",
      role_id: "",
      dues_status: "unpaid",
      membership_status: "active",
      major: "",
      phone: "",
      pronouns: "",
      graduation_year: ""
    });
  };

  // Toggle expand member details
  const toggleExpand = (memberId) => {
    setExpandedMemberId(expandedMemberId === memberId ? null : memberId);
    if (editingMember && editingMember.id !== memberId) {
      setEditingMember(null);
      resetForm();
    }
  };

  // Filter members
  const filteredMembers = members.filter((member) => {
    if (duesFilter !== "All" && member.dues_status !== duesFilter.toLowerCase()) {
      return false;
    }
    return true;
  });

  if (loading && members.length === 0) {
    return (
      <div className="member-container">
        <p>Loading members...</p>
      </div>
    );
  }

  return (
    <div className="member-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "15px" }}>
        <div>
          <h1 className="member-title">Members</h1>
          {useDummyData && (
            <div style={{ 
              fontSize: "0.9rem", 
              color: "#666", 
              fontStyle: "italic",
              marginTop: "5px"
            }}>
              Showing dummy data for demonstration
            </div>
          )}
        </div>
        <button 
          className="member-actions button"
          onClick={() => {
            resetForm();
            setShowAddModal(true);
            setEditingMember(null);
          }}
        >
          + Add Member
        </button>
      </div>

      {error && <div style={{ color: "red", marginBottom: "15px", padding: "10px", backgroundColor: "#ffe6e6", borderRadius: "5px" }}>{error}</div>}

      {/* Filters */}
      <div className="member-filters">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Graduated">Graduated</option>
          <option value="Suspended">Suspended</option>
        </select>
        <select value={duesFilter} onChange={(e) => setDuesFilter(e.target.value)}>
          <option value="All">All Dues Status</option>
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Exempt">Exempt</option>
        </select>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Member</h2>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>UO ID (95#) *</label>
                <input
                  type="text"
                  value={formData.uo_id}
                  onChange={(e) => setFormData({ ...formData, uo_id: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Workplace</label>
                <select
                  value={formData.workplace_id}
                  onChange={(e) => setFormData({ ...formData, workplace_id: e.target.value || "" })}
                >
                  <option value="">None</option>
                  {workplaces.map(wp => (
                    <option key={wp.id} value={wp.id}>{wp.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value || "" })}
                >
                  <option value="">None</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Dues Status</label>
                <select
                  value={formData.dues_status}
                  onChange={(e) => setFormData({ ...formData, dues_status: e.target.value })}
                >
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="exempt">Exempt</option>
                </select>
              </div>
              <div className="form-group">
                <label>Membership Status</label>
                <select
                  value={formData.membership_status}
                  onChange={(e) => setFormData({ ...formData, membership_status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="graduated">Graduated</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="form-group">
                <label>Major</label>
                <input
                  type="text"
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Pronouns</label>
                <input
                  type="text"
                  value={formData.pronouns}
                  onChange={(e) => setFormData({ ...formData, pronouns: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Graduation Year</label>
                <input
                  type="number"
                  value={formData.graduation_year}
                  onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value || "" })}
                />
              </div>
              <div className="modal-buttons">
                <button type="submit">Add Member</button>
                <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-wrapper">
        <table className="member-table">
          <thead>
            <tr>
              <th>Actions</th>
              <th>Name</th>
              <th>95#</th>
              <th>Activity</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  No members found
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => (
                <React.Fragment key={member.id}>
                  <tr>
                    <td>
                      <button
                        className="three-dots"
                        onClick={() => toggleExpand(member.id)}
                        title="View/Edit Details"
                      >
                        {expandedMemberId === member.id ? "▼" : "▶"}
                      </button>
                    </td>
                    <td>{member.name}</td>
                    <td>{member.uo_id}</td>
                    <td>
                      <span className={`status-badge status-${member.membership_status}`}>
                        {member.membership_status?.charAt(0).toUpperCase() + member.membership_status?.slice(1)}
                      </span>
                    </td>
                  </tr>
                  {expandedMemberId === member.id && (
                    <tr className="member-details-row">
                      <td colSpan="4">
                        <div className="member-details">
                          {editingMember?.id === member.id ? (
                            <form onSubmit={handleUpdateMember}>
                              <h3>Edit Member</h3>
                              <div className="form-grid">
                                <div className="form-group">
                                  <label>Name *</label>
                                  <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Email *</label>
                                  <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                  />
                                </div>
                                <div className="form-group">
                                  <label>UO ID (95#) *</label>
                                  <input
                                    type="text"
                                    value={formData.uo_id}
                                    onChange={(e) => setFormData({ ...formData, uo_id: e.target.value })}
                                    required
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Workplace</label>
                                  <select
                                    value={formData.workplace_id}
                                    onChange={(e) => setFormData({ ...formData, workplace_id: e.target.value || "" })}
                                  >
                                    <option value="">None</option>
                                    {workplaces.map(wp => (
                                      <option key={wp.id} value={wp.id}>{wp.name}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="form-group">
                                  <label>Role</label>
                                  <select
                                    value={formData.role_id}
                                    onChange={(e) => setFormData({ ...formData, role_id: e.target.value || "" })}
                                  >
                                    <option value="">None</option>
                                    {roles.map(role => (
                                      <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="form-group">
                                  <label>Dues Status</label>
                                  <select
                                    value={formData.dues_status}
                                    onChange={(e) => setFormData({ ...formData, dues_status: e.target.value })}
                                  >
                                    <option value="paid">Paid</option>
                                    <option value="unpaid">Unpaid</option>
                                    <option value="exempt">Exempt</option>
                                  </select>
                                </div>
                                <div className="form-group">
                                  <label>Membership Status</label>
                                  <select
                                    value={formData.membership_status}
                                    onChange={(e) => setFormData({ ...formData, membership_status: e.target.value })}
                                  >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="graduated">Graduated</option>
                                    <option value="suspended">Suspended</option>
                                  </select>
                                </div>
                                <div className="form-group">
                                  <label>Major</label>
                                  <input
                                    type="text"
                                    value={formData.major}
                                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Phone</label>
                                  <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Pronouns</label>
                                  <input
                                    type="text"
                                    value={formData.pronouns}
                                    onChange={(e) => setFormData({ ...formData, pronouns: e.target.value })}
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Graduation Year</label>
                                  <input
                                    type="number"
                                    value={formData.graduation_year}
                                    onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value || "" })}
                                  />
                                </div>
                              </div>
                              <div className="member-details-buttons">
                                <button type="submit">Save Changes</button>
                                <button type="button" onClick={() => {
                                  setEditingMember(null);
                                  resetForm();
                                }}>Cancel</button>
                                <button type="button" onClick={() => handleDeleteMember(member.id)} style={{ backgroundColor: "#dc3545" }}>
                                  Delete Member
                                </button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <h3>Member Details</h3>
                              <div className="form-grid">
                                <p><strong>Name:</strong> {member.name}</p>
                                <p><strong>Email:</strong> {member.email}</p>
                                <p><strong>UO ID:</strong> {member.uo_id}</p>
                                <p><strong>Phone:</strong> {member.phone || "N/A"}</p>
                                <p><strong>Pronouns:</strong> {member.pronouns || "N/A"}</p>
                                <p><strong>Major:</strong> {member.major || "N/A"}</p>
                                <p><strong>Graduation Year:</strong> {member.graduation_year || "N/A"}</p>
                                <p><strong>Workplace:</strong> {member.workplace_name || "N/A"}</p>
                                <p><strong>Role:</strong> {member.role_name || "N/A"}</p>
                                <p><strong>Dues Status:</strong> {member.dues_status?.charAt(0).toUpperCase() + member.dues_status?.slice(1)}</p>
                                <p><strong>Membership Status:</strong> {member.membership_status?.charAt(0).toUpperCase() + member.membership_status?.slice(1)}</p>
                                <p><strong>Created:</strong> {member.created_at ? new Date(member.created_at).toLocaleDateString() : "N/A"}</p>
                                <p><strong>Last Updated:</strong> {member.updated_at ? new Date(member.updated_at).toLocaleDateString() : "N/A"}</p>
                              </div>
                              <div className="member-details-buttons">
                                <button onClick={() => openEditForm(member)}>Edit Member</button>
                                <button onClick={() => handleDeleteMember(member.id)} style={{ backgroundColor: "#dc3545" }}>
                                  Delete Member
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Member;
