import React, { useState } from "react";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div>
      
      <nav className="navbar" style={{ backgroundColor: "#63a17f" }}>
        <div className="container-fluid" >
          <div className="d-flex align-items-center">
            <button 
              className="btn btn-sm me-2" 
              onClick={toggleSidebar}
              style={{ backgroundColor: "transparent", border: "none", color: "white" }}
            >
              <span style={{ fontSize: "1.5rem" }}>☰</span>
            </button>
            <a className="navbar-brand" href="#">
              <img src="/docs/5.3/assets/brand/bootstrap-logo.svg" alt="Logo" width="30" height="24" className="d-inline-block align-text-top"/>
              <b>Homiq</b>
            </a>
          </div>
          
          <div className="d-flex flex-column align-items-end ms-auto" >
            <b>Areesha's Home!</b>
            <p className="mb-0 small">All systems online</p>
          </div>
        </div>
      </nav>
      
      <div className="d-flex" >
        {/* Sidebar */}
        <div 
          className="p-3 sidebar"
          style={{ 
            width: sidebarOpen ? "250px" : "0",
            minHeight: "calc(100vh - 56px)", 
            backgroundColor: "#CDCC58",
            overflow: "hidden",
            transition: "width 0.3s ease",
            whiteSpace: "nowrap"
          }} 
        >
          <ul className="nav flex-column">
            <li className="nav-item mb-2">
              <a href="#" className="nav-link text-white custom-nav-link">Dashboard</a>
            </li>
            <li className="nav-item mb-2">
              <a href="#" className="nav-link text-white custom-nav-link">Rooms</a>
            </li>
            <li className="nav-item mb-2">
              <a href="#" className="nav-link text-white custom-nav-link">Automations</a>
            </li>
            <li className="nav-item mb-2">
              <a href="#" className="nav-link text-white custom-nav-link">Analytics</a>
            </li>
            <li className="nav-item mb-2">
              <a href="#" className="nav-link text-white custom-nav-link">Profile</a>
            </li>
          </ul>
        </div>
      
        {/* Main Content */}
        <div className="flex-grow-1 p-4 main-content">
          <h2>Welcome</h2>
          <p>This is your dashboard.</p>
          
          {/* Responsive text for mobile */}
          <div className="d-md-none mt-3">
            <p className="text-muted">
              <small>Sidebar is {sidebarOpen ? 'open' : 'closed'}. Click the menu icon to toggle.</small>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-nav-link {
          transition: all 0.3s ease;
          border-radius: 5px;
          padding: 8px 12px;
        }
        
        .custom-nav-link:hover {
          background-color: #63a17f !important;
          color: white !important;
        }
        
        .custom-nav-link:active,
        .custom-nav-link:focus,
        .custom-nav-link.active {
          background-color: #63a17f !important;
          color: white !important;
        }

        /* Responsive styles */
        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            z-index: 1000;
            height: 100%;
            box-shadow: 2px 0 5px rgba(0,0,0,0.1);
          }
          
          .main-content {
            margin-left: ${sidebarOpen ? '250px' : '0'};
            transition: margin-left 0.3s ease;
            width: 100%;
          }
          
          .navbar-brand b {
            font-size: 1rem;
          }
        }

        /* For very small screens */
        @media (max-width: 576px) {
          .navbar-brand b {
            display: none;
          }
          
          .d-flex.flex-column.align-items-end b {
            font-size: 0.9rem;
          }
          
          .d-flex.flex-column.align-items-end p {
            font-size: 0.7rem;
          }
        }
      `}
      </style>
    </div>
  );
};

export default Dashboard;