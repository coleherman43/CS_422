// src/pages/dashboard.js
import React, { useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import CreateEvent from "./createEvent";
import ViewEvent from "./viewEvent";
import StaggeredMenu from "../components/StaggeredMenu";
import Member from "./member";
import Events from "./events";
import Reports from "./reports";
import UOSWLogo from "../Images/UOSW_Logo.png";

function Dashboard({ setIsLoggedIn }) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("loggedIn");
    setIsLoggedIn(false);
    navigate("/login");
  }

  const menuItems = [
    { label: 'Overview', ariaLabel: 'Go to dashboard overview', link: '/dashboard' },
    { label: 'Members', ariaLabel: 'View members', link: '/dashboard/members' },
    { label: 'Events', ariaLabel: 'View events', link: '/dashboard/events' },
    { label: 'Reports', ariaLabel: 'View reports', link: '/dashboard/reports' },
    { label: 'Log Out', ariaLabel: 'Log out of account', link: '#', onClick: handleLogout }
  ];

  const handleMenuClose = () => {
    // Optional: handle menu close if needed
  };

  return (
    <div className="dashboard-container">
      {/* Staggered Menu */}
      <StaggeredMenu
        position="left"
        items={menuItems.map(item => {
          if (item.onClick) {
            return {
              ...item,
              link: '#',
              onClick: item.onClick
            };
          }
          return item;
        })}
        displaySocials={false}
        displayItemNumbering={false}
        menuButtonColor="#B8241C"
        openMenuButtonColor="#fff"
        changeMenuColorOnOpen={true}
        colors={['#B8241C', '#e7615a']}
        logoUrl={UOSWLogo}
        accentColor="#B8241C"
        onMenuOpen={() => console.log('Menu opened')}
        onMenuClose={handleMenuClose}
      />

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar With Logo */}
        <div className="dashboard-topbar">
          <Link to="/dashboard" style={{ cursor: "pointer" }}>
            <img src={UOSWLogo} alt="Union Logo" className="dashboard-logo-top" />
          </Link>
        </div>
      <Routes>
      <Route
        index
        element={
          <>
            <div className="dashboard-header">
            <h1 className="title">Dashboard Overview</h1>
          </div>

          <p className="subtitle">A quick look at your union activity</p>


            <div className="grid">

              {/* MEMBERSHIP SUMMARY */}
              <div className="dashboard-card">
                <h2>Membership Stats</h2>
                <ul className="notifications">
                  <li><strong>Total Members:</strong> 142</li>
                  <li><strong>Active Members:</strong> 119</li>
                  <li><strong>Dues Unpaid:</strong> 23</li>
                  <li><strong>Most Common Workplace:</strong> EMU</li>
                </ul>
              </div>

              {/* EVENTS SUMMARY */}
              <div className="dashboard-card">
                <h2>Event Summary</h2>
                <p><strong>Upcoming Events:</strong> 3</p>
                <p><strong>Last Attendance:</strong> 85%</p>
                <button className="btn" onClick={() => navigate("/dashboard/events")}>
                  View Events
                </button>
              </div>

              {/* RECENT ACTIVITY */}
              <div className="dashboard-card">
                <h2>Recent Activity</h2>
                <ul className="notifications">
                  <li>✔ Jane Doe renewed membership</li>
                  <li>✔ John Smith attended Office Hours</li>
                  <li>➕ New member registered: Alex Green</li>
                </ul>
              </div>

              {/* QUICK ACTIONS */}
              <div className="dashboard-card">
                <h2>Quick Actions</h2>

                <div className="quick-actions-buttons">
                  <button className="btn" onClick={() => navigate("/dashboard/members")}>
                    Add Member
                  </button>
                  <button className="btn" onClick={() => navigate("/dashboard/events")}>
                    Create Event
                  </button>
                  <button className="btn" onClick={() => navigate("/dashboard/reports")}>
                    View Reports
                  </button>
                </div>

              </div>


            </div>
          </>
        }
      />

      {/* Members Page */}
      <Route path="members" element={<Member />} />
      <Route path="events" element={<Events />} />
      <Route path="events/create" element={<CreateEvent />} />
      <Route path="events/:id" element={<ViewEvent />} />
      <Route path="reports" element={<Reports />} />


      </Routes>
      </main>
      </div>
  );
}

export default Dashboard;