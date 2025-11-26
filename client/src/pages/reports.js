// src/pages/reports.js
import React, { useState, useEffect } from "react";
import "../styles/Reports.css";

export default function Reports() {
  const [activeReport, setActiveReport] = useState(null);
  const [data, setData] = useState(null);

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
    if (!data || data.error) return null;

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

  // Fetch report data when a box is clicked
  useEffect(() => {
    if (!activeReport) {
      setData(null);
      return;
    }

    // Reset data when switching reports
    setData(null);

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
          console.error('Report error:', json.message);
          setData({ error: json.message });
        }
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setData({ error: err.message || 'Failed to load report data' });
      });
  }, [activeReport]);

  return (
    <div className="reports-container">
      <h1 className="reports-title">Reports</h1>

      {/* Boxes */}
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

      {/* Data Output */}
      {activeReport && (
        <div className="report-output">
          {!data ? (
            <p className="loading">Loading {activeReport} report...</p>
          ) : data.error ? (
            <div className="error">
              <p>Error loading report: {data.error}</p>
            </div>
          ) : (
            renderReport()
          )}
        </div>
      )}
    </div>
  );
}
