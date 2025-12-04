// src/pages/reports.js
import React, { useState, useEffect } from "react";
import "../styles/Reports.css";

// Import dummy data from members page (same source)
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

export default function Reports() {
  const [activeReport, setActiveReport] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [members, setMembers] = useState([]);
  const [useDummyData, setUseDummyData] = useState(true);

  const reportOptions = [
    { id: "membership", label: "Membership" },
    { id: "attendance", label: "Attendance" },
    { id: "workplace", label: "Workplace" },
    { id: "dues", label: "Dues" },
  ];

  // Format membership report
  const renderMembershipReport = (data) => {
    const { membership, roles, workplaces } = data;
    return (
      <div className="report-content">
        <h2>Membership Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{membership?.total_members || 0}</div>
            <div className="stat-label">Total Members</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{membership?.active_members || 0}</div>
            <div className="stat-label">Active Members</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{membership?.inactive_members || 0}</div>
            <div className="stat-label">Inactive Members</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{membership?.graduated_members || 0}</div>
            <div className="stat-label">Graduated</div>
          </div>
        </div>

        <h3>Dues Status</h3>
        <div className="stats-grid">
          <div className="stat-card stat-paid">
            <div className="stat-value">{membership?.paid_dues || 0}</div>
            <div className="stat-label">Paid</div>
          </div>
          <div className="stat-card stat-unpaid">
            <div className="stat-value">{membership?.unpaid_dues || 0}</div>
            <div className="stat-label">Unpaid</div>
          </div>
          <div className="stat-card stat-exempt">
            <div className="stat-value">{membership?.exempt_dues || 0}</div>
            <div className="stat-label">Exempt</div>
          </div>
        </div>

        {roles && roles.length > 0 && (
          <>
            <h3>Roles Distribution</h3>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role, idx) => (
                    <tr key={idx}>
                      <td>{role.name || role.role_name || 'N/A'}</td>
                      <td>{role.count || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {workplaces && workplaces.length > 0 && (
          <>
            <h3>Workplaces Distribution</h3>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Workplace</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {workplaces.map((wp, idx) => (
                    <tr key={idx}>
                      <td>{wp.name || wp.workplace_name || 'N/A'}</td>
                      <td>{wp.count || wp.member_count || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    );
  };

  // Format attendance report
  const renderAttendanceReport = (data) => {
    if (data.member) {
      // Individual member report
      return (
        <div className="report-content">
          <h2>Member Attendance: {data.member.name}</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{data.attendance_rate?.rate || 0}%</div>
              <div className="stat-label">Attendance Rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{data.statistics?.total_events || 0}</div>
              <div className="stat-label">Total Events</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{data.statistics?.attended || 0}</div>
              <div className="stat-label">Attended</div>
            </div>
          </div>
          {data.attendance_history && data.attendance_history.length > 0 && (
            <>
              <h3>Attendance History</h3>
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.attendance_history.map((att, idx) => (
                      <tr key={idx}>
                        <td>{att.event_name || 'N/A'}</td>
                        <td>{att.event_date ? new Date(att.event_date).toLocaleDateString() : 'N/A'}</td>
                        <td><span className={`badge ${att.checked_in ? 'badge-success' : 'badge-missing'}`}>
                          {att.checked_in ? 'Attended' : 'Absent'}
                        </span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      );
    } else if (data.event) {
      // Event-specific report
      return (
        <div className="report-content">
          <h2>Event Attendance: {data.event.name}</h2>
          <div className="event-info">
            <p><strong>Date:</strong> {data.event.date ? new Date(data.event.date).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Location:</strong> {data.event.location || 'N/A'}</p>
          </div>
          {data.summary && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{data.summary.total_attendees || 0}</div>
                <div className="stat-label">Total Attendees</div>
              </div>
            </div>
          )}
          {data.attendance && data.attendance.length > 0 && (
            <>
              <h3>Attendees</h3>
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Check-in Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.attendance.map((att, idx) => (
                      <tr key={idx}>
                        <td>{att.member_name || 'N/A'}</td>
                        <td>{att.check_in_time ? new Date(att.check_in_time).toLocaleString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      );
    } else {
      // General attendance report
      return (
        <div className="report-content">
          <h2>General Attendance Report</h2>
          {data.message ? (
            <div style={{ padding: "20px", color: "#666", fontStyle: "italic", textAlign: "center" }}>
              <p>{data.message}</p>
            </div>
          ) : (
            <>
              {data.recent_check_ins && data.recent_check_ins.length > 0 && (
                <>
                  <h3>Recent Check-ins</h3>
                  <div className="data-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Member</th>
                          <th>Event</th>
                          <th>Check-in Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.recent_check_ins.map((checkin, idx) => (
                          <tr key={idx}>
                            <td>{checkin.member_name || 'N/A'}</td>
                            <td>{checkin.event_name || 'N/A'}</td>
                            <td>{checkin.check_in_time ? new Date(checkin.check_in_time).toLocaleString() : 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
              {data.event_statistics && (
                <>
                  <h3>Event Statistics</h3>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-value">{data.event_statistics.total_events || 0}</div>
                      <div className="stat-label">Total Events</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{data.event_statistics.total_attendees || 0}</div>
                      <div className="stat-label">Total Attendees</div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      );
    }
  };

  // Format workplace report
  const renderWorkplaceReport = (data) => {
    const { statistics, workplaces } = data;
    return (
      <div className="report-content">
        <h2>Workplace Statistics</h2>
        {statistics && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{statistics.total_workplaces || 0}</div>
              <div className="stat-label">Total Workplaces</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{statistics.total_members || 0}</div>
              <div className="stat-label">Total Members</div>
            </div>
          </div>
        )}
        {workplaces && workplaces.length > 0 && (
          <>
            <h3>Workplace Breakdown</h3>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Workplace</th>
                    <th>Members</th>
                  </tr>
                </thead>
                <tbody>
                  {workplaces.map((wp, idx) => (
                    <tr key={idx}>
                      <td>{wp.name || wp.workplace_name || 'N/A'}</td>
                      <td>{wp.member_count || wp.count || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    );
  };

  // Format dues report
  const renderDuesReport = (data) => {
    const { summary, unpaid_members } = data;
    return (
      <div className="report-content">
        <h2>Dues Report</h2>
        {summary && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{summary.total_members || 0}</div>
                <div className="stat-label">Total Members</div>
              </div>
              <div className="stat-card stat-paid">
                <div className="stat-value">{summary.paid_dues || 0}</div>
                <div className="stat-label">Paid</div>
              </div>
              <div className="stat-card stat-unpaid">
                <div className="stat-value">{summary.unpaid_dues || 0}</div>
                <div className="stat-label">Unpaid</div>
              </div>
              <div className="stat-card stat-exempt">
                <div className="stat-value">{summary.exempt_dues || 0}</div>
                <div className="stat-label">Exempt</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{summary.payment_rate || 0}%</div>
                <div className="stat-label">Payment Rate</div>
              </div>
            </div>
          </>
        )}
        {unpaid_members && unpaid_members.length > 0 && (
          <>
            <h3>Members with Unpaid Dues</h3>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Workplace</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {unpaid_members.map((member, idx) => (
                    <tr key={idx}>
                      <td>{member.name || 'N/A'}</td>
                      <td>{member.email || 'N/A'}</td>
                      <td>{member.workplace_name || 'N/A'}</td>
                      <td><span className="badge badge-unpaid">Unpaid</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    );
  };

  // Render appropriate report based on type
  const renderReport = () => {
    if (!data) return null;
    if (data.error) {
      return (
        <div className="error">
          <p>Error loading report: {data.error}</p>
        </div>
      );
    }

    switch (activeReport) {
      case 'membership':
        return renderMembershipReport(data);
      case 'attendance':
        return renderAttendanceReport(data);
      case 'workplace':
        return renderWorkplaceReport(data);
      case 'dues':
        return renderDuesReport(data);
      default:
        return <pre>{JSON.stringify(data, null, 2)}</pre>;
    }
  };

  // Fetch members data (same as members page)
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/members`);
        const result = await response.json();
        
        if (result.success && result.data && result.data.members) {
          setMembers(result.data.members);
          setUseDummyData(false);
        } else {
          throw new Error("API response format unexpected");
        }
      } catch (err) {
        console.log("Using dummy data for reports:", err.message);
        setMembers(DUMMY_MEMBERS);
        setUseDummyData(true);
      }
    };

    fetchMembers();
  }, []);

  // Generate report statistics from member data
  const generateReportFromMembers = (reportType, memberList) => {
    switch (reportType) {
      case "membership":
        return generateMembershipReport(memberList);
      case "attendance":
        return generateAttendanceReport(memberList);
      case "workplace":
        return generateWorkplaceReport(memberList);
      case "dues":
        return generateDuesReport(memberList);
      default:
        return null;
    }
  };

  const generateMembershipReport = (memberList) => {
    const total = memberList.length;
    const active = memberList.filter(m => m.membership_status === "active").length;
    const inactive = memberList.filter(m => m.membership_status === "inactive").length;
    const graduated = memberList.filter(m => m.membership_status === "graduated").length;
    const paid = memberList.filter(m => m.dues_status === "paid").length;
    const unpaid = memberList.filter(m => m.dues_status === "unpaid").length;
    const exempt = memberList.filter(m => m.dues_status === "exempt").length;

    // Count by role
    const roleCounts = {};
    memberList.forEach(member => {
      const role = member.role_name || "N/A";
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });
    const roles = Object.entries(roleCounts).map(([name, count]) => ({ role_name: name, count }));

    // Count by workplace
    const workplaceCounts = {};
    memberList.forEach(member => {
      const workplace = member.workplace_name || "N/A";
      workplaceCounts[workplace] = (workplaceCounts[workplace] || 0) + 1;
    });
    const workplaces = Object.entries(workplaceCounts).map(([name, count]) => ({ workplace_name: name, count }));

    return {
      membership: {
        total_members: total,
        active_members: active,
        inactive_members: inactive,
        graduated_members: graduated,
        paid_dues: paid,
        unpaid_dues: unpaid,
        exempt_dues: exempt
      },
      roles,
      workplaces
    };
  };

  const generateAttendanceReport = (memberList) => {
    return {
      event_statistics: {
        total_events: 0,
        avg_attendance: 0,
        total_attendees: 0
      },
      recent_check_ins: [],
      message: "Attendance data requires event information. Please check the events page."
    };
  };

  const generateWorkplaceReport = (memberList) => {
    const workplaceCounts = {};
    memberList.forEach(member => {
      const workplace = member.workplace_name || "N/A";
      workplaceCounts[workplace] = (workplaceCounts[workplace] || 0) + 1;
    });
    const workplaces = Object.entries(workplaceCounts).map(([name, count]) => ({
      workplace_name: name,
      member_count: count
    }));

    return {
      statistics: {
        total_workplaces: workplaces.length,
        total_members: memberList.length
      },
      workplaces
    };
  };

  const generateDuesReport = (memberList) => {
    const total = memberList.length;
    const paid = memberList.filter(m => m.dues_status === "paid").length;
    const unpaid = memberList.filter(m => m.dues_status === "unpaid").length;
    const exempt = memberList.filter(m => m.dues_status === "exempt").length;
    const paymentRate = total > 0 ? Math.round((paid / total) * 100) : 0;

    const unpaidMembers = memberList
      .filter(m => m.dues_status === "unpaid")
      .map(m => ({
        id: m.id,
        name: m.name,
        email: m.email,
        workplace_name: m.workplace_name
      }));

    return {
      summary: {
        total_members: total,
        paid_dues: paid,
        unpaid_dues: unpaid,
        exempt_dues: exempt,
        payment_rate: paymentRate
      },
      unpaid_members: unpaidMembers
    };
  };

  // Fetch report data when a box is clicked
  useEffect(() => {
    if (!activeReport) {
      setData(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Try to fetch from API first
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    fetch(`${apiUrl}/reports/${activeReport}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        if (json.success) {
          setData(json.data);
        } else {
          throw new Error(json.message || "Failed to load report");
        }
      })
      .catch((err) => {
        console.log("API report failed, generating from member data:", err.message);
        // Generate report from member data
        const reportData = generateReportFromMembers(activeReport, members.length > 0 ? members : DUMMY_MEMBERS);
        setData(reportData);
      })
      .finally(() => setLoading(false));
  }, [activeReport, members]);

  return (
    <div className="reports-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "15px" }}>
        <div>
          <h1 className="reports-title">Reports</h1>
          {useDummyData && (
            <div style={{ 
              fontSize: "0.9rem", 
              color: "#666", 
              fontStyle: "italic",
              marginTop: "5px"
            }}>
              Using member data for reports
            </div>
          )}
        </div>
      </div>

      {/* Report Selection Boxes */}
      <div className="reports-grid">
        {reportOptions.map((r) => (
          <div
            key={r.id}
            className={`report-box ${activeReport === r.id ? "active" : ""}`}
            onClick={() => setActiveReport(r.id)}
          >
            {r.label}
          </div>
        ))}
      </div>

      {/* Report Modal Overlay */}
      {activeReport && (
        <div className="report-modal-overlay" onClick={() => setActiveReport(null)}>
          <div className="report-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="report-modal-header">
              <h2>{reportOptions.find(r => r.id === activeReport)?.label} Report</h2>
              <button className="report-modal-close" onClick={() => setActiveReport(null)}>×</button>
            </div>
            <div className="report-modal-body">
              {loading ? (
                <p className="loading">Loading {activeReport} report...</p>
              ) : error ? (
                <div className="error-message">{error}</div>
              ) : data && data.error ? (
                <div className="error">
                  <p>Error loading report: {data.error}</p>
                </div>
              ) : data ? (
                renderReport()
              ) : (
                <p className="loading">No data available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
