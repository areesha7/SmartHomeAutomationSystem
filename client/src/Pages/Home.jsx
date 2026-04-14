/* FLOW:
   User clicks → Command executes → API calls happen
   → Observer notifies → Subscribed parts react/update
*/

import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Zap, Lightbulb, Thermometer, Lock, Power, ChevronRight,
  Wifi, Cpu, WifiOff, RotateCcw, AlertTriangle, Home, Activity,
  Bell, Battery, TrendingUp, Shield, Users, RefreshCw, Settings, UserCog,
  Clock, Play, PowerOff, GitBranch
} from "lucide-react";
import { motion } from "framer-motion";
import Layout from "../Components/Layout";
import { useAuth } from "../context/AuthContext";


const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


const apiFetch = async (path, token, options = {}) => {
  const storedToken = token || localStorage.getItem("token") || null;
  if (!storedToken) throw new Error("No auth token");

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${storedToken}`,
      ...(options.headers || {}),
    },
  });

  if (!res.ok) throw new Error(`API ${res.status}`);
  if (res.status === 204) return { data: null, headers: res.headers };

  const data = await res.json();
  return { data, headers: res.headers };
};

/* 
   OBSERVER PATTERN — dashboardBus acts as a central event system.
   - Components subscribe to events like "lights"
   - When lights are updated (after API call), notify() is triggered
   - All subscribed functions automatically run (e.g., logging or UI updates)
 */
class DashboardObserver {
  constructor() { this._listeners = {}; }
  subscribe(event, fn)   { if (!this._listeners[event]) this._listeners[event] = []; this._listeners[event].push(fn); }
  unsubscribe(event, fn) { if (this._listeners[event]) this._listeners[event] = this._listeners[event].filter(l => l !== fn); }
  notify(event, data)    { (this._listeners[event] || []).forEach(fn => fn(data)); }
}
const dashboardBus = new DashboardObserver();

/* 
   COMMAND PATTERN — BulkLightCommand wraps the action of controlling multiple lights.
   - Instead of directly calling API, we create a command object
   - execute() performs the action for all devices
   - After execution, it notifies observers and refreshes dashboard
 */
class Command { execute() {} undo() {} }

class BulkLightCommand extends Command {
  constructor(devices, action, token, onDone) {
    super();
    this._devices = devices;
    this._action  = action;
    this._token   = token;
    this._onDone  = onDone;
  }
  async execute() {
    const lights = this._devices.filter(d => d.type === "LIGHT" && d.status !== "FAULT");
    await Promise.allSettled(
      lights.map(d =>
        apiFetch(`/devices/${d._id}/control`, this._token, {
          method: "POST",
          body: JSON.stringify({ action: this._action }),
        })
      )
    );
    dashboardBus.notify("lights", { state: this._action.toLowerCase() });
    if (this._onDone) this._onDone();
  }
}


const timeAgo = (ts) => {
  const mins = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const ACTION_COLORS = {
  ON:   "#2e8b57",
  OFF:  "#888",
  IDLE: "#b8860b",
  FAULT:"#c03030",
};

const ACTION_ICONS = {
  ON: Play,
  OFF: PowerOff,
  FAULT: AlertTriangle,
};

function useClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 9000); return () => clearInterval(id); }, []);
  return t;
}

const SectionHeader = ({ title, right }) => (
  <div style={{ marginBottom: "20px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
      <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", color: "#5c35b0" }}>{title}</span>
      {right}
    </div>
    <div style={{ height: "1px", background: "linear-gradient(90deg, rgba(92,53,176,0.25) 0%, rgba(92,53,176,0.06) 100%)" }} />
  </div>
);

const LiveBadge = ({ online, loading }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: "600", background: loading ? "#f0f0f0" : online ? "#e8f5ee" : "#fdecea", color: loading ? "#888" : online ? "#2e8b57" : "#c03030" }}>
    {loading ? <RotateCcw size={9} style={{ animation: "spin 1s linear infinite" }} /> : online ? <Wifi size={9} /> : <WifiOff size={9} />}
    {loading ? "Loading" : online ? "Live" : "Offline"}
  </span>
);

const LoadingBox = ({ height = 120 }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height, color: "#aaa", gap: "8px", fontSize: "13px", background: "white", borderRadius: "14px" }}>
    <RotateCcw size={15} style={{ animation: "spin 1s linear infinite" }} /> Loading...
  </div>
);

const Dashboard = () => {
  const navigate        = useNavigate();
  const now             = useClock();
  const { token, user } = useAuth();

  const P      = "#2e8b57";
  const PURPLE = "#5c35b0";
  const GOLD   = "#b8860b";
  const RED    = "#c03030";

  const [summary,       setSummary]       = useState(null);
  const [allDevices,    setAllDevices]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [online,        setOnline]        = useState(false);
  const [bulkLoading,   setBulkLoading]   = useState(false);
  const [activeAction,  setActive]        = useState(null);
  const [cmdHistory,    setCmdHist]       = useState([]);

  const [scopedAlerts,  setScopedAlerts]  = useState(null);
  const [userHomeId,    setUserHomeId]    = useState(null);


  const resolveHomeId = useCallback(async (summaryData) => {
    const homeIdFromSummary = summaryData?.home?.id || summaryData?.home?._id;
    if (homeIdFromSummary) {
      setUserHomeId(homeIdFromSummary);
      return homeIdFromSummary;
    }

    try {
      const userId = user?._id || user?.id || localStorage.getItem("userId");
      if (!userId) return null;

      const { data } = await apiFetch(`/users/${userId}`, token);
      const resolvedHomeId = data?.data?.homeId || data?.homeId || data?.data?.home?._id;
      if (resolvedHomeId) {
        setUserHomeId(resolvedHomeId);
        return resolvedHomeId;
      }
    } catch (err) {
      console.error("[Dashboard] resolveHomeId failed:", err);
    }
    return null;
  }, [token, user]);

  const fetchScopedAlerts = useCallback(async (homeId) => {
    if (!homeId) return;

    try {
      const isAdmin = user?.role === "ADMIN" || user?.user?.role === "ADMIN";

      if (isAdmin) {
        const { data } = await apiFetch(`/alerts/home/${homeId}?limit=100`, token);
        const responseData = data?.data || data;
        const alertsList = responseData?.data || responseData || [];
        const totalAlerts = responseData?.pagination?.total || alertsList.length || 0;
        
        const unreadCount = alertsList.filter(a => !a.isRead).length;
        const criticalCount = alertsList.filter(a => a.severity === "critical" && !a.isRead).length;
        
        console.log("[Dashboard] Admin alerts fetched:", { totalAlerts, unreadCount, criticalCount });
        
        setScopedAlerts({
          unread: unreadCount,
          critical: criticalCount,
          total: totalAlerts,
        });
      } else {
        const { data } = await apiFetch(`/alerts/stats`, token);
        const stats = data?.data || data;
        
        console.log("[Dashboard] Resident alerts stats:", stats);
        
        setScopedAlerts({
          unread: stats?.unread ?? 0,
          critical: stats?.critical ?? 0,
          total: stats?.total ?? 0,
        });
      }
    } catch (err) {
      console.error("[Dashboard] fetchScopedAlerts failed:", err);
      setScopedAlerts({
        unread: 0,
        critical: 0,
        total: 0,
      });
    }
  }, [token, user]);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiFetch("/dashboard", token);
      const s = data?.data || data;
      console.log("[DEBUG] Full dashboard response:", s);
      console.log("[DEBUG] Energy object:", s?.energy);
      console.log("[DEBUG] TodayKwh value:", s?.energy?.todayKwh);
      console.log("[DEBUG] Automations:", s?.automations);
      setSummary(s);
      setOnline(true);

      // Fetch fresh devices list to ensure accurate counts
      const { data: devData } = await apiFetch("/devices", token);
      const devList = devData?.data?.devices || devData?.devices || [];
      console.log("[DEBUG] Devices fetched:", devList.length, "devices");
      console.log("[DEBUG] Active automations:", s?.automations?.active);
      setAllDevices(devList);

      const homeId = await resolveHomeId(s);
      if (homeId) {
        await fetchScopedAlerts(homeId);
      }

    } catch (err) {
      console.error("[Dashboard] fetchDashboard error:", err);
      setOnline(false);
    } finally {
      setLoading(false);
    }
  }, [token, resolveHomeId, fetchScopedAlerts]);

  useEffect(() => {
    const handleDeviceChange = () => {
      console.log("[Dashboard] Device change detected, refreshing...");
      fetchDashboard();
    };
    
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        fetchDashboard();
      }
    };
    
 
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("[Dashboard] Tab visible, refreshing...");
        fetchDashboard();
      }
    };
    
    window.addEventListener('device-updated', handleDeviceChange);
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('device-updated', handleDeviceChange);
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchDashboard]);

  useEffect(() => {
    if (!token && !localStorage.getItem("token")) return;
    fetchDashboard();
    const id = setInterval(fetchDashboard, 30000);
    return () => clearInterval(id);
  }, [token, fetchDashboard]);

  // Refetch alerts when homeId changes
  useEffect(() => {
    if (userHomeId) {
      fetchScopedAlerts(userHomeId);
    }
  }, [userHomeId, fetchScopedAlerts]);

  useEffect(() => {
    const onL = d => console.log("[Observer] Lights →", d.state);
    dashboardBus.subscribe("lights", onL);
    return () => dashboardBus.unsubscribe("lights", onL);
  }, []);

  const handleBulkLights = async (action) => {
    setBulkLoading(true);
    setActive(action === "ON" ? "lon" : "lof");
    const cmd = new BulkLightCommand(allDevices, action, token, fetchDashboard);
    await cmd.execute();
    setCmdHist(h => [...h, cmd]);
    setBulkLoading(false);
    setTimeout(() => setActive(null), 700);
  };

  const fmt      = d => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const fmtDate  = d => d.toLocaleDateString("en-US",  { weekday: "long", month: "long", day: "numeric" });
  const hour     = now.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const userName = user?.name || user?.email?.split("@")[0] || "";

  const isAdmin = user?.role === "ADMIN" ||
                  user?.user?.role === "ADMIN" ||
                  summary?.home?.admin === user?._id ||
                  summary?.home?.admin === user?.id;

  const card = { background: "white", borderRadius: "14px", boxShadow: "0 6px 15px rgba(0,0,0,0.06)" };
  const fade = (i, base = 0.1) => ({
    initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 },
    transition: { delay: base + i * 0.07, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  });

  const home        = summary?.home;
  const devices     = summary?.devices;
  const energy      = summary?.energy;
  const automations = summary?.automations;
  const events      = summary?.recentEvents || [];
  const alerts = scopedAlerts ?? summary?.alerts;

  const statCards = [
    { title: "Active Devices",   value: devices?.byStatus?.on ?? 0,    suffix: "",    sub: `of ${devices?.total ?? 0} total`,       icon: Zap,          accent: PURPLE },
    { title: "Active Automations", value: automations?.active ?? 0,   suffix: "",    sub: `${automations?.total ?? 0} total rules`, icon: GitBranch,    accent: GOLD   },
    { title: "Live Wattage",     value: energy?.liveWattage ?? 0,      suffix: "W",   sub: `${energy?.liveSessions ?? 0} sessions`,  icon: Activity,     accent: P      },
    { title: "Unread Alerts",    value: alerts?.unread ?? 0,           suffix: "",    sub: `${alerts?.critical ?? 0} critical`,      icon: AlertTriangle,accent: RED    },
  ];

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@300;400;500;600&display=swap');
        .hq * { box-sizing: border-box; }
        .hq, .hq button { font-family: 'Inter', sans-serif; }
        .hq-card { transition: all 0.3s ease; }
        .hq-card:hover { transform: translateY(-5px); box-shadow: 0 12px 28px rgba(0,0,0,0.12) !important; }
        .hq-action { transition: all 0.25s ease; }
        .hq-action:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(0,0,0,0.10) !important; }
        .hq-action:hover .hq-icon { transform: scale(1.1); }
        .hq-icon { transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1); }
        .hq-viewall { transition: background 0.2s ease; }
        .hq-viewall:hover { background: rgba(46,139,87,0.10) !important; }
        .activity-card { transition: all 0.3s ease; cursor: pointer; }
        .activity-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.1) !important; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

      <div className="hq" style={{ minHeight: "100vh", background: "transparent", padding: "28px 32px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

          <motion.div
            initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ background: "white", borderRadius: "14px", boxShadow: "0 6px 15px rgba(0,0,0,0.06)", border: "1px solid rgba(92,53,176,0.10)", padding: "0", marginBottom: "28px", overflow: "hidden" }}>
            <div style={{ height: "3px", background: `linear-gradient(90deg, ${PURPLE}, ${P})` }} />
            <div style={{ padding: "26px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: `linear-gradient(135deg,${PURPLE}22,${P}18)`, border: `1px solid ${PURPLE}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Cpu size={20} color={PURPLE} strokeWidth={1.8} />
                </div>
                <div>
                  <p style={{ margin: "0 0 3px", fontSize: "11px", fontWeight: "600", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a90b8" }}>
                    {fmtDate(now)}
                    {home?.name && <span style={{ marginLeft: "8px", color: PURPLE }}>· {home.name}</span>}
                  </p>
                  <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "700", fontFamily: "'Syne',sans-serif", color: "#18103a", lineHeight: 1.2 }}>
                    {greeting}{userName ? `, ${userName}` : ""}
                  </h1>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#7a72a0", fontWeight: "400" }}>
                    {home?.address ? `📍 ${home.address}` : "Here's what's happening in your home today."}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                <div style={{ textAlign: "right", flexShrink: 0, paddingLeft: "28px", borderLeft: "1px solid rgba(92,53,176,0.10)", marginLeft: "24px" }}>
                  <div style={{ fontSize: "34px", fontFamily: "'Syne',sans-serif", fontWeight: "700", letterSpacing: "-1px", lineHeight: 1, color: "#18103a" }}>
                    {fmt(now)}
                  </div>
                  {home && (
                    <div style={{ marginTop: "6px", fontSize: "11px", color: "#9a90b8" }}>
                      {home.rooms} rooms · {home.residents} residents
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <LiveBadge online={online} loading={loading} />
                  <button onClick={fetchDashboard}
                    style={{ display: "flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: "600", background: "#f0f0f0", border: "none", cursor: "pointer", color: "#555" }}>
                    <RefreshCw size={9} /> Refresh
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ADMIN SECTION */}
          {isAdmin && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.4 }}
              style={{ marginBottom: "32px" }}>
              <SectionHeader
                title="Admin Panel"
                right={<span style={{ fontSize: "10px", color: PURPLE, background: `${PURPLE}10`, padding: "2px 8px", borderRadius: "12px" }}>🔐 Admin Access</span>}
              />
              <div
                className="hq-card"
                onClick={() => navigate("/home-admin")}
                style={{
                  ...card,
                  cursor: "pointer",
                  padding: "20px",
                  background: `linear-gradient(135deg, ${PURPLE}08, ${P}08)`,
                  border: `1px solid ${PURPLE}20`,
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 6px 15px rgba(0,0,0,0.06)";
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "14px",
                    background: `linear-gradient(135deg, ${PURPLE}, ${P})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 4px 12px ${PURPLE}40`
                  }}>
                    <UserCog size={26} color="white" strokeWidth={1.8} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#18103a" }}>Home Management Dashboard</h3>
                    <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#7a72a0" }}>
                      Manage residents, invitations, and home settings
                    </p>
                  </div>
                  <ChevronRight size={20} color={PURPLE} />
                </div>
              </div>
            </motion.div>
          )}

          {/* STAT */}
          <motion.div {...fade(0, 0.08)} style={{ marginBottom: "32px" }}>
            <SectionHeader
              title="Overview"
              right={<LiveBadge online={online} loading={loading} />}
            />
            {loading ? <LoadingBox height={110} /> : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px" }}>
                {statCards.map((c, i) => {
                  const Icon = c.icon;
                  return (
                    <motion.div key={c.title} {...fade(i, 0.12)} className="hq-card"
                      style={{ ...card, padding: "20px", borderTop: `2.5px solid ${c.accent}` }}>
                      <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: `${c.accent}14`, border: `1px solid ${c.accent}28`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
                        <Icon size={17} color={c.accent} strokeWidth={2} />
                      </div>
                      <div style={{ fontSize: "26px", fontWeight: "700", fontFamily: "'Syne',sans-serif", color: "#18103a", lineHeight: 1.1 }}>
                        {c.value}{c.suffix}
                      </div>
                      <div style={{ fontSize: "12.5px", color: "#2e2550", marginTop: "5px", fontWeight: "500" }}>{c.title}</div>
                      <div style={{ fontSize: "11px", color: "#9a90b8", marginTop: "2px" }}>{c.sub}</div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* HOME INFO */}
          {!loading && summary && (
            <motion.div {...fade(0, 0.18)} style={{ marginBottom: "32px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px" }}>
                <div style={{ ...card, padding: "20px" }}>
                  <p style={{ margin: "0 0 12px", fontSize: "11px", fontWeight: "700", color: "#9a90b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Device Breakdown</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      { label: "Air Conditioners", value: devices?.byType?.ac ?? 0,    color: "#5c35b0" },
                      { label: "Fans",              value: devices?.byType?.fan ?? 0,   color: "#2e8b57" },
                      { label: "Lights",            value: devices?.byType?.light ?? 0, color: "#b8860b" },
                    ].map(row => (
                      <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", color: "#555" }}>{row.label}</span>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: row.color }}>{row.value}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: "1px solid #f0eef8", paddingTop: "8px", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "13px", color: "#555" }}>FAULT devices</span>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: RED }}>{devices?.byStatus?.fault ?? 0}</span>
                    </div>
                  </div>
                </div>

                <div style={{ ...card, padding: "20px" }}>
                  <p style={{ margin: "0 0 12px", fontSize: "11px", fontWeight: "700", color: "#9a90b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Energy Today</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      { label: "Consumed today",  value: `${energy?.todayKwh ?? 0} kWh`,     color: P      },
                      { label: "Live wattage",     value: `${energy?.liveWattage ?? 0} W`,    color: PURPLE },
                      { label: "Active sessions",  value: energy?.liveSessions ?? 0,          color: GOLD   },
                    ].map(row => (
                      <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", color: "#555" }}>{row.label}</span>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: row.color }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ ...card, padding: "20px" }}>
                  <p style={{ margin: "0 0 12px", fontSize: "11px", fontWeight: "700", color: "#9a90b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Automation Rules</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      { label: "Active rules",     value: automations?.active ?? 0,  color: GOLD   },
                      { label: "Total rules",      value: automations?.total ?? 0,   color: PURPLE },
                    ].map(row => (
                      <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", color: "#555" }}>{row.label}</span>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: row.color }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* QUICK ACTIONS */}
          <motion.div {...fade(0, 0.28)} style={{ marginBottom: "32px" }}>
            <SectionHeader
              title="Quick Actions"
              right={bulkLoading ? <LiveBadge online={true} loading={true} /> : null}
            />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "14px" }}>
              {[
                { key: "lon", label: "All Lights On",  icon: Lightbulb, accent: GOLD,   action: "ON"  },
                { key: "lof", label: "All Lights Off", icon: Power,      accent: PURPLE, action: "OFF" },
              ].map(btn => {
                const Icon   = btn.icon;
                const active = activeAction === btn.key;
                return (
                  <motion.button key={btn.key} className="hq-action"
                    whileTap={{ scale: 0.97 }}
                    animate={active ? { boxShadow: [`0 0 0 transparent`, `0 0 20px ${btn.accent}45`, `0 0 0 transparent`] } : {}}
                    onClick={() => handleBulkLights(btn.action)}
                    disabled={bulkLoading}
                    style={{ ...card, padding: "20px", border: "none", cursor: bulkLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "14px", textAlign: "left", borderLeft: `3px solid ${btn.accent}`, opacity: bulkLoading ? 0.7 : 1 }}>
                    <div className="hq-icon" style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${btn.accent}14`, border: `1px solid ${btn.accent}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={18} color={btn.accent} strokeWidth={2} />
                    </div>
                    <div>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#18103a", lineHeight: 1.3, display: "block" }}>{btn.label}</span>
                      <span style={{ fontSize: "11px", color: "#9a90b8" }}>
                        {devices?.byType?.light ?? 0} light{(devices?.byType?.light ?? 0) !== 1 ? "s" : ""} · updates backend
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* RECENT ACTIVITY */}
          <motion.div {...fade(0, 0.38)} style={{ marginBottom: "32px" }}>
            <SectionHeader
              title="Recent Activity"
              right={
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <LiveBadge online={online} loading={loading} />
                  <Link to="/analytics" className="hq-viewall"
                    style={{ color: P, fontSize: "11px", fontWeight: "600", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", background: "rgba(46,139,87,0.08)", padding: "5px 11px", borderRadius: "7px", border: `1px solid ${P}28`, letterSpacing: "0.05em" }}>
                    View All <ChevronRight size={12} strokeWidth={2.5} />
                  </Link>
                </div>
              }
            />
            
            {loading ? (
              <LoadingBox height={180} />
            ) : events.length === 0 ? (
              <div style={{ padding: "48px", textAlign: "center", color: "#bbb", fontSize: "13px", background: "white", borderRadius: "14px" }}>
                <Activity size={32} style={{ marginBottom: "12px", opacity: 0.5 }} />
                <p>No recent activity. Toggle devices to generate events.</p>
              </div>
            ) : (
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
                gap: "16px" 
              }}>
                {events.slice(0, 6).map((ev, idx) => {
                  const actionColor = ACTION_COLORS[ev.action] || "#aaa";
                  const ActionIcon = ACTION_ICONS[ev.action] || Activity;
                  const isOn = ev.action === "ON";
                  
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.3 }}
                      className="activity-card"
                      onClick={() => navigate("/analytics")}
                      style={{
                        background: "white",
                        borderRadius: "16px",
                        overflow: "hidden",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        border: `1px solid ${actionColor}15`,
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{
                        height: "3px",
                        background: `linear-gradient(90deg, ${actionColor}, ${actionColor}60)`,
                      }} />
                      
                      <div style={{ padding: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                          <div style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "12px",
                            background: `${actionColor}10`,
                            border: `1px solid ${actionColor}20`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}>
                            <ActionIcon size={18} color={actionColor} strokeWidth={2} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#18103a" }}>
                              {ev.deviceName}
                            </p>
                            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#9a90b8" }}>
                              {ev.triggeredBy}
                            </p>
                          </div>
                        </div>
                        
                        <div style={{ marginBottom: "12px" }}>
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 10px",
                            borderRadius: "16px",
                            fontSize: "11px",
                            fontWeight: "600",
                            background: `${actionColor}10`,
                            color: actionColor,
                          }}>
                            <div style={{
                              width: "5px",
                              height: "5px",
                              borderRadius: "50%",
                              background: actionColor,
                              animation: isOn ? "pulse 1.5s ease-in-out infinite" : "none",
                            }} />
                            Turned {ev.action}
                          </span>
                        </div>
                        
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          borderTop: `1px solid ${actionColor}10`,
                          paddingTop: "10px",
                          marginTop: "2px",
                        }}>
                          <Clock size={11} color="#9a90b8" />
                          <span style={{ fontSize: "10px", color: "#9a90b8", fontWeight: "500" }}>
                            {timeAgo(ev.timestamp)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
            
            {events.length > 6 && (
              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <Link to="/analytics" style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  color: P,
                  fontSize: "12px",
                  fontWeight: "500",
                  textDecoration: "none",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  background: `${P}08`,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = `${P}15`}
                onMouseLeave={(e) => e.currentTarget.style.background = `${P}08`}
                >
                  View All {events.length} Activities
                  <ChevronRight size={14} />
                </Link>
              </div>
            )}
          </motion.div>

          {/* ROOMS */}
          <motion.div {...fade(0, 0.48)}>
            <SectionHeader
              title="Your Home"
              right={
                <Link to="/rooms" className="hq-viewall"
                  style={{ color: P, fontSize: "11px", fontWeight: "600", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", background: "rgba(46,139,87,0.08)", padding: "5px 11px", borderRadius: "7px", border: `1px solid ${P}28`, letterSpacing: "0.05em" }}>
                  View Rooms <ChevronRight size={12} strokeWidth={2.5} />
                </Link>
              }
            />
            {loading ? <LoadingBox height={80} /> : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px" }}>
                <div className="hq-card" onClick={() => navigate("/rooms")}
                  style={{ ...card, cursor: "pointer", padding: "20px", display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "46px", height: "46px", background: "#e7f3ee", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Home size={22} color={P} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "#18103a", lineHeight: 1 }}>{home?.rooms ?? 0}</p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#9a90b8" }}>Total Rooms</p>
                  </div>
                </div>

                <div className="hq-card" onClick={() => navigate("/profile")}
                  style={{ ...card, cursor: "pointer", padding: "20px", display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "46px", height: "46px", background: "#f3f0fc", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Users size={22} color={PURPLE} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "#18103a", lineHeight: 1 }}>{home?.residents ?? 0}</p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#9a90b8" }}>Residents</p>
                  </div>
                </div>

                <div className="hq-card" onClick={() => navigate("/automations")}
                  style={{ ...card, cursor: "pointer", padding: "20px", display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "46px", height: "46px", background: "#fdf8e8", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Zap size={22} color={GOLD} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "#18103a", lineHeight: 1 }}>{automations?.active ?? 0}</p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#9a90b8" }}>Active Automations</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;