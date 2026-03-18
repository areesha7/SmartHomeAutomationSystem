


import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Settings, Bell, ChevronUp, LogOut } from "lucide-react";
import Logo from "../assets/noBgLogo.png";
import { useAuth } from "../context/AuthContext";

const Layout = ({ children }) => {

  const { logout, user }       = useAuth();
  const navigate               = useNavigate();

  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logoutOpen,   setLogoutOpen]   = useState(false);

  const settingsRef = useRef(null);
  const logoutRef   = useRef(null);

  const toggleSidebar  = () => setSidebarOpen(!sidebarOpen);
  const toggleSettings = () => { setSettingsOpen(o => !o); setLogoutOpen(false); };
  const toggleLogout   = () => { setLogoutOpen(o => !o);   setSettingsOpen(false); };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) setSettingsOpen(false);
      if (logoutRef.current   && !logoutRef.current.contains(e.target))   setLogoutOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const popupLink = (extra = {}) => ({
    display: "flex", alignItems: "center", gap: "10px",
    padding: "12px 16px", textDecoration: "none",
    color: "#1a1a1a", fontSize: "14px", fontWeight: "500",
    transition: "background 0.2s", ...extra,
  });

  const iconBox = (bg) => ({
    width: "32px", height: "32px", borderRadius: "8px", background: bg,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  });

  const triggerBtn = (active) => ({
    width: "100%", display: "flex", alignItems: "center", gap: "10px",
    background: active ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.30)",
    borderRadius: "10px", padding: "10px 12px",
    cursor: "pointer", color: "white", transition: "background 0.2s ease",
  });

  const popup = {
    position: "absolute", bottom: "56px", left: 0, right: 0,
    background: "white", borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
    overflow: "hidden", animation: "fadeUp 0.2s ease",
  };

  return (
    <div className="dashboard-wrapper">

      <nav className="navbar shadow-sm" style={{ backgroundColor: "#63a17f" }}>
        <div className="container-fluid">
          <div className="d-flex align-items-center">
            <button className="btn btn-sm me-2 text-white" onClick={toggleSidebar}
              style={{ background: "transparent", border: "none" }}>
              <span style={{ fontSize: "1.5rem" }}>☰</span>
            </button>
            <a className="navbar-brand logo-wrapper">
              <img src={Logo} alt="Logo" className="logo-img" />
            </a>
          </div>
          <div className="d-flex flex-column align-items-end ms-auto text-white">
            <b>{user?.name || "Areesha's Home!"}</b>
            <p className="mb-0 small">All systems online</p>
          </div>
        </div>
      </nav>

      <div className="d-flex">

        <div className="sidebar" style={{
          width: sidebarOpen ? "260px" : "0px",
          minHeight: "calc(100vh - 56px)",
          flexShrink: 0,
          overflow: "hidden",
          transition: "all 0.35s ease",
          whiteSpace: "nowrap",
          padding: sidebarOpen ? "16px" : "0px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}>

          <ul className="nav flex-column">
            <li className="nav-item mb-2">
              <Link to="/" className="nav-link text-white custom-nav-link">Dashboard</Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/rooms" className="nav-link text-white custom-nav-link">Rooms</Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/automations" className="nav-link text-white custom-nav-link">Automations</Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/analytics" className="nav-link text-white custom-nav-link">Analytics</Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/profile" className="nav-link text-white custom-nav-link">Profile</Link>
            </li>
            <li className="nav-item mb-2">
  <Link to="/modeling" className="nav-link text-white custom-nav-link">Modeling</Link>
</li>
          </ul>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>

            <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.35)", margin: "0 0 4px" }} />

            <div ref={settingsRef} style={{ position: "relative" }}>
              {settingsOpen && (
                <div style={popup}>
                  <Link to="/notifications" onClick={() => setSettingsOpen(false)}
                    style={popupLink({ borderBottom: "1px solid #f0f0f0" })}
                    onMouseEnter={e => e.currentTarget.style.background = "#f5f3ff"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div style={iconBox("#eef3ff")}><Bell size={16} color="#5c35b0" strokeWidth={2} /></div>
                    Notifications
                  </Link>
                  <Link to="/settings" onClick={() => setSettingsOpen(false)}
                    style={popupLink()}
                    onMouseEnter={e => e.currentTarget.style.background = "#f5f3ff"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div style={iconBox("#eef3ff")}><Settings size={16} color="#5c35b0" strokeWidth={2} /></div>
                    Settings
                  </Link>
                </div>
              )}
              <button onClick={toggleSettings} style={triggerBtn(settingsOpen)}>
                <div style={{ width:"34px",height:"34px",borderRadius:"8px",background:"rgba(255,255,255,0.22)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  <Settings size={17} color="white" strokeWidth={2} />
                </div>
                <div style={{ flex:1, textAlign:"left" }}>
                  <p style={{ margin:0, fontSize:"13px", fontWeight:"600", lineHeight:1.3 }}>Preferences</p>
                  <p style={{ margin:0, fontSize:"11px", opacity:0.75, lineHeight:1.3 }}>Settings & Notifications</p>
                </div>
                <ChevronUp size={15} color="white" strokeWidth={2} style={{
                  transform: settingsOpen ? "rotate(0deg)" : "rotate(180deg)",
                  transition: "transform 0.25s ease", flexShrink: 0,
                }} />
              </button>
            </div>

            <div ref={logoutRef} style={{ position: "relative" }}>
              {logoutOpen && (
                <div style={popup}>
                  <button
                    onClick={handleLogout}
                    style={{ ...popupLink(), width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fff5f5"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div style={iconBox("#fee8e8")}><LogOut size={16} color="#c03030" strokeWidth={2} /></div>
                    Logout
                  </button>
                </div>
              )}
              <button onClick={toggleLogout} style={triggerBtn(logoutOpen)}>
                <div style={{ width:"34px",height:"34px",borderRadius:"8px",background:"rgba(220,60,60,0.30)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  <LogOut size={17} color="white" strokeWidth={2} />
                </div>
                <div style={{ flex:1, textAlign:"left" }}>
                  <p style={{ margin:0, fontSize:"13px", fontWeight:"600", lineHeight:1.3 }}>Logout</p>
                  <p style={{ margin:0, fontSize:"11px", opacity:0.75, lineHeight:1.3 }}>Click to sign out</p>
                </div>
                <ChevronUp size={15} color="white" strokeWidth={2} style={{
                  transform: logoutOpen ? "rotate(0deg)" : "rotate(180deg)",
                  transition: "transform 0.25s ease", flexShrink: 0,
                }} />
              </button>
            </div>

          </div>
        </div>

        <div className="flex-grow-1 main-content">
          {children}
        </div>

      </div>

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
          padding: 6px 18px;
          border-radius: 12px;
          backdrop-filter: blur(6px);
        }
        .logo-img {
          height: 56px;
          width: auto;
          object-fit: contain;
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.25));
          transition: transform 0.3s ease;
        }
        .logo-img:hover { transform: scale(1.05); }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </div>
  );
};

export default Layout;

