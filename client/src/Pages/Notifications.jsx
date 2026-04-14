import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ArrowLeft, AlertTriangle, Info, CheckCircle, RefreshCw } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL;

/* =====================================================
   FACTORY DESIGN PATTERN
   
   Instead of the component deciding which icon,
   color, and background to use, it asks the
   NotificationFactory to provide it.
   
   This keeps the UI logic clean and scalable.
===================================================== */
class NotificationFactory {
  /*
    Returns configuration based on notification severity/type
  */
  static getConfig(severity) {
    const configs = {
      critical: {
        icon: AlertTriangle,
        color: "#E53935",
        bg: "#FDECEA",
      },
      high: {
        icon: AlertTriangle,
        color: "#FF6B35",
        bg: "#FFF0E8",
      },
      medium: {
        icon: Info,
        color: "#F5A623",
        bg: "#FEF5E7",
      },
      low: {
        icon: Info,
        color: "#1A73E8",
        bg: "#E8F0FE",
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

    return configs[severity] || configs.info;
  }

  static getTypeFromSeverity(severity) {
    const typeMap = {
      critical: "alert",
      high: "alert",
      medium: "info",
      low: "info",
      info: "info",
    };
    return typeMap[severity] || "info";
  }
}

/* =====================================================
   NOTIFICATIONS COMPONENT
===================================================== */
const Notifications = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);

  const getHeaders = () => {
    const tok = token || localStorage.getItem("token");
    return { Authorization: `Bearer ${tok}` };
  };

  /* Fetch notifications from backend */
  const fetchNotifications = async (currentPage = 1) => {
    try {
      setLoading(true);
      setError("");
      
      const headers = getHeaders();
      
      // Fetch alerts from the alerts endpoint
      const response = await axios.get(`${API}/alerts/unread`, { headers });
      
      // Also fetch read alerts if needed (you can add pagination later)
      // For now, we'll combine unread and recently read
      const unreadAlerts = response.data?.data || [];
      
      // Convert alerts to notification format
      const formattedNotifications = unreadAlerts.map(alert => ({
        id: alert._id,
        title: getAlertTitle(alert),
        message: alert.message,
        time: formatTime(alert.createdAt),
        type: NotificationFactory.getTypeFromSeverity(alert.severity),
        read: alert.isRead || false,
        severity: alert.severity,
        deviceName: alert.device?.name,
        createdAt: alert.createdAt
      }));
      
      setNotifications(formattedNotifications);
      setTotalNotifications(formattedNotifications.length);
      setTotalPages(1);
      
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err.response?.data?.message || "Failed to load notifications");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  /* Helper function to generate alert title */
  const getAlertTitle = (alert) => {
    const deviceName = alert.device?.name || "Device";
    const severity = alert.severity?.toUpperCase() || "ALERT";
    
    const titles = {
      critical: `⚠️ Critical: ${deviceName}`,
      high: `🔴 High Priority: ${deviceName}`,
      medium: `📢 Alert: ${deviceName}`,
      low: `ℹ️ Info: ${deviceName}`,
    };
    
    return titles[alert.severity] || `${severity}: ${deviceName}`;
  };

  /* Format time for display */
  const formatTime = (timestamp) => {
    if (!timestamp) return "Just now";
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  /* Mark a single notification as read */
  const markAsRead = async (alertId) => {
    try {
      const headers = getHeaders();
      await axios.patch(`${API}/alerts/${alertId}/read`, {}, { headers });
      
      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === alertId ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  /* Mark all notifications as read */
  const markAllRead = async () => {
    try {
      const headers = getHeaders();
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      
      // Mark each unread notification as read
      await Promise.all(
        unreadIds.map(id => 
          axios.patch(`${API}/alerts/${id}/read`, {}, { headers })
        )
      );
      
      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (err) {
      console.error("Error marking all as read:", err);
      setError("Failed to mark all as read");
    }
  };

  /* Remove/dismiss a notification (mark as read and filter out) */
  const dismiss = async (id) => {
    await markAsRead(id);
    // Remove from view after marking as read
    setNotifications(prev =>
      prev.filter(n => n.id !== id)
    );
  };

  /* Count unread notifications */
  const unreadCount = notifications.filter(n => !n.read).length;

  /* Load notifications on component mount */
  useEffect(() => {
    const tok = token || localStorage.getItem("token");
    if (!tok) {
      navigate("/login");
      return;
    }
    fetchNotifications(page);
  }, [token, page]);

  /* Auto-refresh every 30 seconds */
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications(page);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [page]);

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

          <div className="d-flex gap-2">
            {/* Refresh Button */}
            <button 
              className="btn mark-read-btn" 
              onClick={() => fetchNotifications(page)}
              disabled={loading}
              style={{ backgroundColor: "#63a17f" }}
            >
              <RefreshCw size={16} className={loading ? "spin" : ""} />
            </button>

            {/* Mark All Read Button */}
            {unreadCount > 0 && (
              <button className="btn mark-read-btn" onClick={markAllRead}>
                Mark All Read
              </button>
            )}
          </div>

        </div>
      </nav>

      {/* ================= NOTIFICATIONS LIST ================= */}
      <div className="p-4">

        {/* Loading State */}
        {loading && notifications.length === 0 && (
          <div className="empty-notifications">
            <RefreshCw size={48} className="spin mb-3" color="#63a17f" />
            <h5>Loading notifications...</h5>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="empty-notifications">
            <AlertTriangle size={48} color="#E53935" className="mb-3" />
            <h5>Error Loading Notifications</h5>
            <p>{error}</p>
            <button 
              className="btn mark-read-btn mt-3"
              onClick={() => fetchNotifications(page)}
            >
              Try Again
            </button>
          </div>
        )}

        {/* If there are NO notifications */}
        {!loading && !error && notifications.length === 0 && (
          <div className="empty-notifications">
            <CheckCircle size={48} color="#4CAF50" className="mb-3" />
            <h5>All Caught Up!</h5>
            <p>No new notifications or alerts at this time.</p>
          </div>
        )}

        {/* Display notifications */}
        {!loading && notifications.length > 0 && (
          <>
            {notifications.map((n) => {
              /* Factory pattern used here */
              const config = NotificationFactory.getConfig(n.severity);
              
              return (
                <div
                  key={n.id}
                  className={`notification-card ${!n.read ? "unread-card" : ""}`}
                  onClick={() => !n.read && markAsRead(n.id)}
                  style={{ cursor: !n.read ? "pointer" : "default" }}
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
                    <div className="d-flex align-items-center gap-3">
                      <p className="text-muted small mb-0">{n.time}</p>
                      {n.deviceName && (
                        <span className="badge bg-light text-dark small">
                          {n.deviceName}
                        </span>
                      )}
                      {n.severity && (
                        <span className={`badge severity-${n.severity}`}>
                          {n.severity.toUpperCase()}
                        </span>
                      )}
                    </div>

                  </div>

                  {/* Delete/Dismiss Notification */}
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      dismiss(n.id);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>

                </div>
              );
            })}

            {/* Pagination (if needed) */}
            {totalPages > 1 && (
              <div className="pagination-wrapper mt-4">
                <button
                  className="btn pagination-btn"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </button>
                <span className="mx-3">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="btn pagination-btn"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
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
          background-color: #E53935;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
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
          border-left: 4px solid #E53935;
          background-color: #fffbfb;
        }

        .severity-critical {
          background-color: #E53935;
          color: white;
          font-size: 10px;
          padding: 2px 6px;
        }

        .severity-high {
          background-color: #FF6B35;
          color: white;
          font-size: 10px;
          padding: 2px 6px;
        }

        .severity-medium {
          background-color: #F5A623;
          color: white;
          font-size: 10px;
          padding: 2px 6px;
        }

        .severity-low {
          background-color: #1A73E8;
          color: white;
          font-size: 10px;
          padding: 2px 6px;
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

        .pagination-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .pagination-btn {
          background-color: white;
          border: 1px solid #ddd;
          color: #63a17f;
          padding: 6px 16px;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>

    </div>
  );
};

export default Notifications;