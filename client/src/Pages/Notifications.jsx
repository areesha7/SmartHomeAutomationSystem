import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ArrowLeft, AlertTriangle, Info, CheckCircle } from "lucide-react";

/* =====================================================
   INITIAL NOTIFICATION DATA
   These notifications appear when the component loads.
===================================================== */
const initialNotifications = [
  { id: "1", title: "Front Door Opened", message: "Front door was unlocked at 3:24 PM", time: "2 min ago", type: "alert", read: false },
  { id: "2", title: "Energy Spike Detected", message: "Usage exceeded 5kWh threshold", time: "15 min ago", type: "alert", read: false },
  { id: "3", title: "AC Maintenance Due", message: "Schedule servicing for living room AC", time: "1 hour ago", type: "info", read: false },
  { id: "4", title: "Smart Speaker Updated", message: "Firmware v3.2.1 installed successfully", time: "3 hours ago", type: "success", read: true },
  { id: "5", title: "Motion Detected", message: "Motion detected in backyard at 1:12 AM", time: "6 hours ago", type: "alert", read: true },
  { id: "6", title: "Weekly Report Ready", message: "Your energy report for this week is available", time: "1 day ago", type: "info", read: true },
];


/* =====================================================
   FACTORY DESIGN PATTERN

   Instead of the component deciding which icon,
   color, and background to use, it asks the
   NotificationFactory to provide it.

   This keeps the UI logic clean and scalable.
===================================================== */
class NotificationFactory {

  /*
    Returns configuration based on notification type
  */
  static getConfig(type) {

    const configs = {

      alert: {
        icon: AlertTriangle,
        color: "#E53935",
        bg: "#FDECEA",
      },

      info: {
        icon: Info,
        color: "#1A73E8",
        bg: "#E8F0FE",
      },

      success: {
        icon: CheckCircle,
        color: "#4CAF50",
        bg: "#E6F4EA",
      },

    };

    return configs[type];
  }
}


/* =====================================================
   NOTIFICATIONS COMPONENT
===================================================== */
const Notifications = () => {

  const navigate = useNavigate();

  /* State storing notifications */
  const [notifications, setNotifications] = useState(initialNotifications);


  /* Mark all notifications as read */
  const markAllRead = () =>
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );


  /* Remove a specific notification */
  const dismiss = (id) =>
    setNotifications(prev =>
      prev.filter(n => n.id !== id)
    );


  /* Count unread notifications */
  const unreadCount = notifications.filter(n => !n.read).length;


  return (
    <div className="dashboard-wrapper">

      {/* ================= NAVBAR ================= */}
      <nav className="navbar shadow-sm" style={{ backgroundColor: "#63a17f" }}>
        <div className="container-fluid d-flex align-items-center justify-content-between">

          <div className="d-flex align-items-center">

            {/* Back Button */}
            <button
              className="btn btn-sm me-2 text-white"
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
            <h4 className="text-white mb-0">Notifications</h4>

            {/* Unread counter */}
            {unreadCount > 0 && (
              <span
                className="ms-2 px-2 py-1 rounded-pill"
                style={{
                  backgroundColor: "#FDD835",
                  color: "#1a2c5c",
                  fontSize: "0.8rem"
                }}
              >
                {unreadCount} new
              </span>
            )}
          </div>

          {/* Mark All Read Button */}
          <button className="btn mark-read-btn" onClick={markAllRead}>
            Mark All Read
          </button>

        </div>
      </nav>


      {/* ================= NOTIFICATIONS LIST ================= */}
      <div className="p-4">

        {/* If there are NO notifications */}
        {notifications.length === 0 ? (

          <div className="empty-notifications">
            <h5>No Notifications Yet</h5>
            <p>Your alerts and updates will appear here.</p>
          </div>

        ) : (

          notifications.map((n) => {

            /* Factory pattern used here */
            const config = NotificationFactory.getConfig(n.type);

            return (
              <div
                key={n.id}
                className={`notification-card ${!n.read ? "unread-card" : ""}`}
              >

                {/* Notification Icon */}
                <div
                  className="icon-wrapper"
                  style={{ backgroundColor: config.bg }}
                >
                  <config.icon size={18} color={config.color} />
                </div>

                {/* Notification Content */}
                <div className="notification-content">

                  <div className="d-flex align-items-center justify-content-between">
                    <h6 className="mb-1">{n.title}</h6>

                    {/* Unread indicator */}
                    {!n.read && <span className="unread-dot"></span>}
                  </div>

                  <p className="mb-1">{n.message}</p>
                  <p className="text-muted small">{n.time}</p>

                </div>

                {/* Delete Notification */}
                <button
                  className="delete-btn"
                  onClick={() => dismiss(n.id)}
                >
                  <Trash2 size={16} />
                </button>

              </div>
            );
          })

        )}

      </div>


      {/* ================= STYLES ================= */}
      <style jsx>{`

        .dashboard-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa, #eef3f7);
        }

        .mark-read-btn {
          background-color: #CDCC58;
          color: white;
          border: none;
          border-radius: 12px;
          padding: 0.35rem 0.75rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .mark-read-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.2);
          background-color: #b8b742;
        }

        .notification-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background-color: white;
          border-radius: 12px;
          padding: 12px 16px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.08);
          margin-bottom: 12px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .notification-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.12);
        }

        .notification-content {
          flex: 1;
        }

        .unread-dot {
          width: 8px;
          height: 8px;
          background-color: #FFCDD2;
          border-radius: 50%;
        }

        .icon-wrapper {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .delete-btn {
          background-color: #B71C1C;
          border: none;
          border-radius: 8px;
          padding: 0.35rem 0.5rem;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .delete-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.2);
          background-color: #D32F2F;
        }

        .unread-card {
          border-left: 4px solid #B71C1C;
        }

        /* Empty state UI */
        .empty-notifications {
          text-align: center;
          padding: 60px 20px;
          color: #6c757d;
        }

        .empty-notifications h5 {
          font-weight: 600;
          margin-bottom: 8px;
        }

      `}</style>

    </div>
  );
};

export default Notifications;
