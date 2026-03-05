import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wifi, Shield, Bell, HardDrive, Info } from "lucide-react";

/* =========================================================
   OBSERVER PATTERN IMPLEMENTATION

   The Observer Pattern allows objects (observers)
   to be notified automatically when another object
   (subject) changes its state.

   In our case:

   Subject → SettingsManager
   Observers → Components or modules listening for changes

   When a setting is toggled → all observers are notified.
========================================================= */

class SettingsManager {

  constructor(initialSettings) {

    /* Store settings */
    this.settings = initialSettings;

    /* List of observers */
    this.observers = [];
  }

  /* Add an observer */
  subscribe(observer) {
    this.observers.push(observer);
  }

  /* Remove observer */
  unsubscribe(observer) {
    this.observers = this.observers.filter(o => o !== observer);
  }

  /* Notify all observers when something changes */
  notify() {
    this.observers.forEach(observer => observer(this.settings));
  }

  /* Toggle a setting value */
  toggleSetting(key) {
    this.settings[key] = !this.settings[key];
    this.notify();
  }
}

/* =========================================================
   SETTINGS COMPONENT
========================================================= */

const Settings = () => {

  /* Hook used to navigate between pages */
  const navigate = useNavigate();

  /* React state storing current settings */
  const [settings, setSettings] = useState({
    autoUpdate: true,
    notifications: true,
    energySaving: false,
    guestAccess: false,
    twoFactor: true,
    analytics: true,
  });

  /* Create SettingsManager instance */
  const manager = new SettingsManager(settings);

  /* Subscribe React state as an observer */
  manager.subscribe((updatedSettings) => {
    setSettings({ ...updatedSettings });
  });

  /* Toggle setting through the manager */
  const toggle = (key) => {
    manager.toggleSetting(key);
  };

  /* =========================================================
     SECTIONS CONFIGURATION

     This structure defines how settings are grouped.
  ========================================================= */

  const sections = [
    {
      title: "Network",
      icon: Wifi,
      items: [
        {
          key: "autoUpdate",
          label: "Auto-update devices",
          desc: "Automatically install firmware updates"
        },
      ],
    },

    {
      title: "Security",
      icon: Shield,
      items: [
        {
          key: "twoFactor",
          label: "Two-factor authentication",
          desc: "Require 2FA for sensitive actions"
        },
        {
          key: "guestAccess",
          label: "Guest access",
          desc: "Allow guests to control basic devices"
        },
      ],
    },

    {
      title: "Notifications",
      icon: Bell,
      items: [
        {
          key: "notifications",
          label: "Push notifications",
          desc: "Receive alerts on your phone"
        },
      ],
    },

    {
      title: "System",
      icon: HardDrive,
      items: [
        {
          key: "energySaving",
          label: "Energy saving mode",
          desc: "Reduce power consumption automatically"
        },
        {
          key: "analytics",
          label: "Usage analytics",
          desc: "Share anonymous usage data"
        },
      ],
    },
  ];

  /* =========================================================
     UI RENDER
  ========================================================= */

  return (
    <div className="dashboard-wrapper">

      {/* HEADER NAVBAR */}
      <nav className="navbar shadow-sm" style={{ backgroundColor: "#63a17f" }}>

        <div className="container-fluid d-flex align-items-center">

          <div className="d-flex align-items-center">

            {/* Back Button */}
            <button
              className="btn btn-sm text-white"
              onClick={() => navigate(-1)}
              style={{
                background: "transparent",
                border: "none",
                fontSize: "1.5rem"
              }}
            >
              <ArrowLeft size={24} />
            </button>

            {/* Page Title */}
            <h4 className="text-white fw-bold mb-0 ms-2">
              Settings
            </h4>

          </div>

        </div>

      </nav>

      {/* ================= MAIN SETTINGS ================= */}

      <div className="p-4">

        {/* Loop through sections */}
        {sections.map((section) => (

          <div key={section.title} className="notification-card mb-4">

            {/* Section Header */}
            <div className="d-flex align-items-center gap-2 mb-3">

              {/* Icon */}
              <section.icon size={18} color="#63a17f" />

              {/* Section title */}
              <h6 className="mb-0">{section.title}</h6>

            </div>

            {/* Section Items */}
            {section.items.map(item => (

              <div
                key={item.key}
                className="d-flex align-items-center justify-content-between mb-2"
              >

                {/* TEXT LEFT SIDE */}
                <div>

                  {/* Setting label */}
                  <p className="mb-0">{item.label}</p>

                  {/* Setting description */}
                  <small className="text-muted">
                    {item.desc}
                  </small>

                </div>

                {/* TOGGLE SWITCH */}
                <label className="switch">

                  <input
                    type="checkbox"
                    checked={settings[item.key]}
                    onChange={() => toggle(item.key)}
                  />

                  <span className="slider"></span>

                </label>

              </div>

            ))}

          </div>

        ))}

        {/* ================= ABOUT SECTION ================= */}

        <div className="notification-card">

          <div className="d-flex align-items-center gap-2 mb-2">

            <Info size={18} color="#63a17f" />

            <h6 className="mb-0">About</h6>

          </div>

          <div className="ms-4 text-muted small">

            <p>SmartHome Control Center v2.1.0</p>

            <p>Hub firmware: 4.3.2</p>

            <p>Connected devices: 14</p>

          </div>

        </div>

      </div>

      {/* ================= STYLES ================= */}

      <style jsx>{`

        .dashboard-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa, #eef3f7);
        }

        .notification-card {
          background-color: white;
          border-radius: 12px;
          padding: 12px 16px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.08);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .notification-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.12);
        }

        /* Toggle Switch */

        .switch {
          position: relative;
          display: inline-block;
          width: 40px;
          height: 20px;
        }

        .switch input {
          display: none;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: 0.3s;
          border-radius: 34px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: #63a17f;
        }

        input:checked + .slider:before {
          transform: translateX(20px);
        }

      `}</style>

    </div>
  );
};

export default Settings;
