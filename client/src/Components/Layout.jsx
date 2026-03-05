import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/noBgLogo.png";

const Layout = ({ children }) => {

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="dashboard-wrapper">

      {/* NAVBAR */}
      <nav className="navbar shadow-sm" style={{ backgroundColor: "#63a17f" }}>
        <div className="container-fluid">

          <div className="d-flex align-items-center">

            <button
              className="btn btn-sm me-2 text-white"
              onClick={toggleSidebar}
              style={{ background: "transparent", border: "none" }}
            >
              <span style={{ fontSize: "1.5rem" }}>☰</span>
            </button>

            <a className="navbar-brand logo-wrapper">
              <img src={Logo} alt="Logo" className="logo-img" />
            </a>

          </div>

          <div className="d-flex flex-column align-items-end ms-auto text-white">
            <b>Areesha's Home!</b>
            <p className="mb-0 small">All systems online</p>
          </div>

        </div>
      </nav>

      <div className="d-flex">

        {/* SIDEBAR */}
        <div
  className="sidebar"
  style={{
    width: sidebarOpen ? "260px" : "0px",
    minHeight: "calc(100vh - 56px)",
    backgroundColor: "#CDCC58",
    overflow: "hidden",
    transition: "all 0.35s ease",
    whiteSpace: "nowrap",
    padding: sidebarOpen ? "16px" : "0px"
  }}
>

          <ul className="nav flex-column">

            <li className="nav-item mb-2">
              <Link to="/" className="nav-link text-white custom-nav-link">
                Dashboard
              </Link>
            </li>

            <li className="nav-item mb-2">
              <Link to="/rooms" className="nav-link text-white custom-nav-link">
                Rooms
              </Link>
            </li>

            <li className="nav-item mb-2">
              <Link to="/profile" className="nav-link text-white custom-nav-link">
                Profile
              </Link>
            </li>

          </ul>

        </div>

        {/* PAGE CONTENT */}
        <div className="flex-grow-1 p-4 main-content">
          {children}
        </div>

      </div>

      {/* SAME CSS */}
      <style jsx>{`

        .dashboard-wrapper {
          background: linear-gradient(135deg, #f8f9fa, #eef3f7);
          min-height: 100vh;
        }

        .sidebar {
          transition: width 0.4s ease;
          background: linear-gradient(180deg, #CDCC58, #b8b742);
        }

        .custom-nav-link {
          transition: all 0.3s ease;
          border-radius: 5px;
          padding: 8px 12px;
        }

        .custom-nav-link:hover {
          background-color: #63a17f !important;
          color: white !important;
        }

        .logo-wrapper {
          padding:6px 18px;
          border-radius:12px;
          backdrop-filter: blur(6px);
        }

        .logo-img {
          height: 56px;
          width: auto;
          object-fit: contain;
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.25));
          transition: transform 0.3s ease;
        }

        .logo-img:hover {
          transform: scale(1.05);
        }

      `}</style>

    </div>
  );
};

export default Layout;