
import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Zap, Lightbulb, Thermometer, Lock, Power, ChevronRight,
  Wifi, Cpu, WifiOff, RotateCcw, AlertTriangle, Home, Activity
} from "lucide-react";
import { motion } from "framer-motion";
import Layout from "../Components/Layout";
import { useAuth } from "../context/AuthContext";

const BASE_URL = "http://localhost:5000";

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
  if (res.status === 204) return null;
  return res.json();
};

class RoomCardFactory {
  static fromBackend(room) {
    return {
      id:          room.id || room._id,
      name:        room.name,
      description: room.description || null,
      deviceCount: room.deviceCount ?? 0,
    };
  }
}

class DashboardObserver {
  constructor() { this._listeners = {}; }
  subscribe(event, fn)   { if (!this._listeners[event]) this._listeners[event] = []; this._listeners[event].push(fn); }
  unsubscribe(event, fn) { if (this._listeners[event]) this._listeners[event] = this._listeners[event].filter(l => l !== fn); }
  notify(event, data)    { (this._listeners[event] || []).forEach(fn => fn(data)); }
}
const dashboardBus = new DashboardObserver();

class Command { execute() {} undo() {} }

class LightsOnCommand extends Command {
  constructor(setter, prev) { super(); this._s = setter; this._p = prev; }
  execute() { this._s(x => ({ ...x, lightsOn: x.totalDevices })); dashboardBus.notify("lights", { state: "on" }); }
  undo()    { this._s(x => ({ ...x, lightsOn: this._p })); }
}
class LightsOffCommand extends Command {
  constructor(setter, prev) { super(); this._s = setter; this._p = prev; }
  execute() { this._s(x => ({ ...x, lightsOn: 0 })); dashboardBus.notify("lights", { state: "off" }); }
  undo()    { this._s(x => ({ ...x, lightsOn: this._p })); }
}

const deriveStatsFromDevices = (devices) => ({
  totalDevices:  devices.length,
  activeDevices: devices.filter(d => d.status === "ON").length,
  lightsOn:      devices.filter(d => d.type === "LIGHT" && d.status === "ON").length,
  livePowerW:    devices.filter(d => d.status === "ON").reduce((s, d) => s + (d.powerRatingWatt || 0), 0),
  faultCount:    devices.filter(d => d.status === "FAULT").length,
  totalDoors:    0,
  doorsLocked:   0,
});

const deriveRecentDevices = (devices) => {
  const iconMap = { LIGHT: Lightbulb, FAN: Zap, AC: Thermometer };
  return [...devices]
    .sort((a, b) => new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0))
    .slice(0, 6)
    .map(d => ({
      id:         d._id,
      _backendId: d._id,
      name:       d.name,
      room:       typeof d.room === "object" ? d.room?.name : "—",
      icon:       iconMap[d.type] || Zap,
      isOn:       d.status === "ON",
      status:     d.status,
      type:       d.type,
    }));
};

const deriveAlertsFromEvents = (events) => {
  const now   = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  return events
    .filter(ev => ev.action === "FAULT" && (now - new Date(ev.timestamp).getTime()) < dayMs)
    .slice(0, 2)
    .map(ev => {
      const minsAgo   = Math.floor((now - new Date(ev.timestamp).getTime()) / 60000);
      const timeLabel = minsAgo < 1 ? "just now" : minsAgo < 60 ? `${minsAgo} min ago` : `${Math.floor(minsAgo / 60)}h ago`;
      return {
        id:     ev._id || Math.random(),
        icon:   AlertTriangle,
        label:  "Device Fault",
        detail: `${ev.deviceName} — ${timeLabel}`,
        color:  "#c03030",
      };
    });
};

const deriveActivityFromEvents = (events) => {
  const now   = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  return events
    .filter(ev => ev.action === "ON" && (now - new Date(ev.timestamp).getTime()) < dayMs)
    .slice(0, 2)
    .map(ev => {
      const minsAgo   = Math.floor((now - new Date(ev.timestamp).getTime()) / 60000);
      const timeLabel = minsAgo < 1 ? "just now" : minsAgo < 60 ? `${minsAgo} min ago` : `${Math.floor(minsAgo / 60)}h ago`;
      return {
        id:     ev._id || Math.random(),
        icon:   Activity,
        label:  "Device Activated",
        detail: `${ev.deviceName} — ${timeLabel}`,
        color:  "#2e8b57",
      };
    });
};


const buildRoomIdSet = (rooms) => {
  const ids = new Set();
  rooms.forEach(r => {
    if (r._id) ids.add(r._id.toString());
    if (r.id)  ids.add(r.id.toString());
  });
  return ids;
};

const deviceBelongsToUser = (device, roomIdSet) => {
  if (!device.room) return false;
  let roomId;
  if (typeof device.room === "object") {
    roomId = (device.room._id || device.room.id);
  } else {
    roomId = device.room;
  }
  if (!roomId) return false;
  return roomIdSet.has(roomId.toString());
};

const eventBelongsToUser = (event, deviceIdSet) => {
  if (!event.device) return false;
  let deviceId;
  if (typeof event.device === "object") {
    deviceId = (event.device._id || event.device.id);
  } else {
    deviceId = event.device;
  }
  if (!deviceId) return false;
  return deviceIdSet.has(deviceId.toString());
};


function useClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
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
    {loading
      ? <RotateCcw size={9} style={{ animation: "spin 1s linear infinite" }} />
      : online ? <Wifi size={9} /> : <WifiOff size={9} />}
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
  const TEAL   = "#187070";
  const RED    = "#c03030";

  const [home,           setHome]           = useState(null);
  const [rooms,          setRooms]          = useState([]);
  const [allDevices,     setAllDevices]     = useState([]);
  const [liveEvents,     setLiveEvents]     = useState([]);
  const [loadingHome,    setLoadingHome]    = useState(true);
  const [loadingRooms,   setLoadingRooms]   = useState(true);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [loadingEvents,  setLoadingEvents]  = useState(true);
  const [homeOnline,     setHomeOnline]     = useState(false);
  const [roomsOnline,    setRoomsOnline]    = useState(false);
  const [devicesOnline,  setDevicesOnline]  = useState(false);
  const [eventsOnline,   setEventsOnline]   = useState(false);
  const [bulkLoading,    setBulkLoading]    = useState(false);


  const [userRoomIds,   setUserRoomIds]   = useState(new Set());
  const [userDeviceIds, setUserDeviceIds] = useState(new Set());

  const [stats,         setStats]         = useState({ totalDevices: 0, activeDevices: 0, lightsOn: 0, livePowerW: 0, faultCount: 0, totalDoors: 0, doorsLocked: 0 });
  const [recentDevices, setRecentDevices] = useState([]);
  const [activeAction,  setActive]        = useState(null);
  const [cmdHistory,    setCmdHist]       = useState([]);

  const loadAll = useCallback(async (t) => {

    setLoadingHome(true);
    let homeId = null;
    try {
      const data = await apiFetch("/homes/mine", t);
      const h    = data?.data?.home || data?.home;
      setHome(h);
      setHomeOnline(true);
      homeId = h?.id || h?._id;
    } catch {
      setHomeOnline(false);
    } finally {
      setLoadingHome(false);
    }


    setLoadingRooms(true);
    let roomIdSet = new Set();
    try {
      if (homeId) {
        const data = await apiFetch(`/rooms/${homeId}/rooms`, t);
        const list = data?.data?.rooms || data?.rooms || [];
        setRooms(list.map(r => RoomCardFactory.fromBackend(r)));
        setRoomsOnline(true);
        roomIdSet = buildRoomIdSet(list); 
        setUserRoomIds(roomIdSet);
      }
    } catch {
      setRoomsOnline(false);
    } finally {
      setLoadingRooms(false);
    }

    setLoadingDevices(true);
    let deviceIdSet = new Set();
    try {
      const data = await apiFetch("/devices", t);
      const list = data?.data?.devices || data?.devices || [];

      const filtered = list.filter(d => deviceBelongsToUser(d, roomIdSet));
      setAllDevices(filtered);
      setDevicesOnline(true);
      setStats(prev => ({ ...prev, ...deriveStatsFromDevices(filtered) }));
      setRecentDevices(deriveRecentDevices(filtered));
      deviceIdSet = new Set(filtered.map(d => d._id?.toString()));
      setUserDeviceIds(deviceIdSet);
    } catch {
      setDevicesOnline(false);
    } finally {
      setLoadingDevices(false);
    }

    setLoadingEvents(true);
    try {
      const data = await apiFetch("/events/recent?limit=50", t);
      const list = data?.data?.events || data?.events || [];

      const filtered = list.filter(ev => eventBelongsToUser(ev, deviceIdSet));
      setLiveEvents(filtered);
      setEventsOnline(true);
    } catch {
      setEventsOnline(false);
    } finally {
      setLoadingEvents(false);
    }

    return { roomIdSet, deviceIdSet };
  }, [token]);

  useEffect(() => {
    const t = token || localStorage.getItem("token");
    if (!t) return;

    setHome(null);
    setRooms([]);
    setAllDevices([]);
    setLiveEvents([]);
    setRecentDevices([]);
    setUserRoomIds(new Set());
    setUserDeviceIds(new Set());
    setStats({ totalDevices: 0, activeDevices: 0, lightsOn: 0, livePowerW: 0, faultCount: 0, totalDoors: 0, doorsLocked: 0 });

    loadAll(t);

    const id = setInterval(() => {
      const currentToken = token || localStorage.getItem("token");
      if (currentToken) loadAll(currentToken);
    }, 30000);

    return () => clearInterval(id);
  }, [token]); 

  useEffect(() => {
    const onL = d => console.log("[Observer] Lights →", d.state);
    dashboardBus.subscribe("lights", onL);
    return () => { dashboardBus.unsubscribe("lights", onL); };
  }, []);

  const toggleDevice = async (id) => {
    const device = recentDevices.find(d => d.id === id);
    if (!device) return;
    const newAction = device.isOn ? "OFF" : "ON";
    setRecentDevices(prev => prev.map(d => d.id === id ? { ...d, isOn: !d.isOn, status: newAction } : d));
    setStats(prev => ({
      ...prev,
      activeDevices: newAction === "ON" ? prev.activeDevices + 1 : Math.max(0, prev.activeDevices - 1),
      lightsOn: device.type === "LIGHT"
        ? newAction === "ON" ? prev.lightsOn + 1 : Math.max(0, prev.lightsOn - 1)
        : prev.lightsOn,
    }));
    try {
      await apiFetch(`/devices/${device._backendId}/control`, token, {
        method: "POST",
        body:   JSON.stringify({ action: newAction }),
      });
    } catch {
      setRecentDevices(prev => prev.map(d => d.id === id ? { ...d, isOn: device.isOn, status: device.status } : d));
    }
  };

  const bulkControlLights = async (action) => {
    const lightDevices = allDevices.filter(d => d.type === "LIGHT" && d.status !== "FAULT");
    if (lightDevices.length === 0) return;

    setBulkLoading(true);

    const cmd = action === "ON"
      ? new LightsOnCommand(setStats, stats.lightsOn)
      : new LightsOffCommand(setStats, stats.lightsOn);
    cmd.execute();
    setCmdHist(h => [...h, cmd]);
    setActive(action === "ON" ? "lon" : "lof");

    setRecentDevices(prev => prev.map(d =>
      d.type === "LIGHT" && d.status !== "FAULT"
        ? { ...d, isOn: action === "ON", status: action }
        : d
    ));

    const results = await Promise.allSettled(
      lightDevices.map(d =>
        apiFetch(`/devices/${d._id}/control`, token, {
          method: "POST",
          body:   JSON.stringify({ action }),
        })
      )
    );

    const failed = results.filter(r => r.status === "rejected").length;
    if (failed > 0) {
      const t = token || localStorage.getItem("token");
      if (t) loadAll(t);
    }

    setBulkLoading(false);
    setTimeout(() => setActive(null), 700);
  };

  const faultAlerts    = eventsOnline ? deriveAlertsFromEvents(liveEvents)   : [];
  const activityAlerts = eventsOnline ? deriveActivityFromEvents(liveEvents) : [];
  const allAlerts      = [...faultAlerts, ...activityAlerts].slice(0, 3);

  const quickActions = [
    {
      key:    "lon",
      label:  "All Lights On",
      icon:   Lightbulb,
      accent: GOLD,
      onClick: () => bulkControlLights("ON"),
    },
    {
      key:    "lof",
      label:  "All Lights Off",
      icon:   Power,
      accent: PURPLE,
      onClick: () => bulkControlLights("OFF"),
    },
  ];

  const statCards = [
    { title: "Active Devices",  value: stats.activeDevices, suffix: "",   sub: `of ${stats.totalDevices} total`, icon: Zap,           accent: PURPLE },
    { title: "Lights On",       value: stats.lightsOn,      suffix: "",   sub: "currently on",                   icon: Lightbulb,     accent: GOLD   },
    { title: "Live Power Draw", value: stats.livePowerW,    suffix: "W",  sub: "from ON devices",                icon: Activity,      accent: P      },
    { title: "Fault Devices",   value: stats.faultCount,    suffix: "",   sub: "need attention",                 icon: AlertTriangle, accent: RED    },
  ];

  const fmt      = d => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const fmtDate  = d => d.toLocaleDateString("en-US",  { weekday: "long", month: "long", day: "numeric" });
  const hour     = now.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const userName = user?.name || user?.email?.split("@")[0] || "";

  const card = { background: "white", borderRadius: "14px", boxShadow: "0 6px 15px rgba(0,0,0,0.06)" };
  const fade = (i, base = 0.1) => ({
    initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 },
    transition: { delay: base + i * 0.07, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  });

  const dashboardRooms = rooms.slice(0, 6);

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
        .hq-toggle-track { transition: background 0.3s ease, box-shadow 0.3s ease; }
        .hq-toggle-thumb { transition: left 0.28s cubic-bezier(0.34,1.56,0.64,1); }
        .hq-viewall { transition: background 0.2s ease; }
        .hq-viewall:hover { background: rgba(46,139,87,0.10) !important; }
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
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
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <LiveBadge online={homeOnline}    loading={loadingHome}    />
                  <LiveBadge online={devicesOnline} loading={loadingDevices} />
                  <LiveBadge online={eventsOnline}  loading={loadingEvents}  />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div {...fade(0, 0.08)} style={{ marginBottom: "32px" }}>
            <SectionHeader
              title="Overview"
              right={<LiveBadge online={devicesOnline} loading={loadingDevices} />}
            />
            {loadingDevices ? <LoadingBox height={110} /> : (
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

          <motion.div {...fade(0, 0.28)} style={{ marginBottom: "32px" }}>
            <SectionHeader
              title="Quick Actions"
              right={bulkLoading ? <LiveBadge online={true} loading={true} /> : null}
            />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "14px" }}>
              {quickActions.map(btn => {
                const Icon   = btn.icon;
                const active = activeAction === btn.key;
                return (
                  <motion.button key={btn.key} className="hq-action" whileTap={{ scale: 0.97 }}
                    animate={active ? { boxShadow: [`0 0 0 transparent`, `0 0 20px ${btn.accent}45`, `0 0 0 transparent`] } : {}}
                    onClick={btn.onClick}
                    disabled={bulkLoading}
                    style={{ ...card, padding: "20px", border: "none", cursor: bulkLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "14px", textAlign: "left", borderLeft: `3px solid ${btn.accent}`, opacity: bulkLoading ? 0.7 : 1 }}>
                    <div className="hq-icon" style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${btn.accent}14`, border: `1px solid ${btn.accent}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {bulkLoading && active === btn.key
                        ? <RotateCcw size={18} color={btn.accent} style={{ animation: "spin 1s linear infinite" }} />
                        : <Icon size={18} color={btn.accent} strokeWidth={2} />}
                    </div>
                    <div>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#18103a", lineHeight: 1.3, display: "block" }}>{btn.label}</span>
                      <span style={{ fontSize: "11px", color: "#9a90b8" }}>
                        {allDevices.filter(d => d.type === "LIGHT").length} light{allDevices.filter(d => d.type === "LIGHT").length !== 1 ? "s" : ""} 
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          <motion.div {...fade(0, 0.36)} style={{ marginBottom: "32px" }}>
            <SectionHeader
              title="Recently Used Devices"
              right={<LiveBadge online={devicesOnline} loading={loadingDevices} />}
            />
            {loadingDevices ? <LoadingBox /> : recentDevices.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", color: "#bbb", fontSize: "13px", background: "white", borderRadius: "14px" }}>
                No devices found. Add devices to your home first.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px" }}>
                {recentDevices.map((device, i) => {
                  const Icon = device.icon;
                  const on   = device.isOn;
                  return (
                    <motion.div key={device.id} {...fade(i, 0.38)} className="hq-card"
                      style={{ ...card, padding: "18px 20px", borderLeft: `3px solid ${on ? P : "transparent"}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
                          <motion.div
                            animate={{ background: on ? `${P}1c` : "#f5f3fb", borderColor: on ? `${P}40` : "#ede9f5" }}
                            transition={{ duration: 0.3 }}
                            style={{ width: "36px", height: "36px", borderRadius: "9px", border: "1px solid #ede9f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Icon size={15} color={on ? P : "#a09ab8"} strokeWidth={2} />
                          </motion.div>
                          <div>
                            <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#18103a", lineHeight: 1.3 }}>{device.name}</p>
                            <p style={{ margin: 0, fontSize: "11px", color: "#9a90b8" }}>{device.room}</p>
                          </div>
                        </div>
                        <label style={{ position: "relative", display: "inline-block", width: "42px", height: "23px", cursor: "pointer", flexShrink: 0 }}>
                          <input type="checkbox" checked={device.isOn} onChange={() => toggleDevice(device.id)} style={{ display: "none" }} />
                          <span className="hq-toggle-track" style={{ position: "absolute", inset: 0, borderRadius: "23px", background: on ? `linear-gradient(135deg,${P},#3aad72)` : "#cec9e0", boxShadow: on ? `0 0 8px ${P}50` : undefined }} />
                          <span className="hq-toggle-thumb" style={{ position: "absolute", width: "17px", height: "17px", background: "white", borderRadius: "50%", top: "3px", left: on ? "22px" : "3px", boxShadow: "0 1px 4px rgba(0,0,0,0.18)" }} />
                        </label>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: on ? P : device.status === "FAULT" ? RED : "#ccc", display: "inline-block" }} />
                        <span style={{ fontSize: "11px", color: on ? P : device.status === "FAULT" ? RED : "#aaa", fontWeight: "600" }}>
                          {device.status}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          <motion.div {...fade(0, 0.48)} style={{ marginBottom: "32px" }}>
            <SectionHeader
              title="System Alerts"
              right={<LiveBadge online={eventsOnline} loading={loadingEvents} />}
            />
            {loadingEvents ? <LoadingBox height={100} /> : allAlerts.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: "#bbb", fontSize: "13px", background: "white", borderRadius: "14px" }}>
                {eventsOnline ? "No alerts in the last 24 hours." : "Could not load event data."}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px" }}>
                {allAlerts.map((alert, i) => {
                  const Icon = alert.icon;
                  return (
                    <motion.div key={alert.id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.52 + i * 0.09, duration: 0.35 }}
                      style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderRadius: "14px", background: `${alert.color}0b`, border: `1px solid ${alert.color}22` }}>
                      <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: `${alert.color}1a`, border: `1px solid ${alert.color}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={14} color={alert.color} strokeWidth={2} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: "12.5px", fontWeight: "600", color: "#18103a", lineHeight: 1.3 }}>{alert.label}</p>
                        <p style={{ margin: 0, fontSize: "11px", color: "#9a90b8" }}>{alert.detail}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          <motion.div {...fade(0, 0.58)}>
            <SectionHeader
              title="Your Rooms"
              right={
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <LiveBadge online={roomsOnline} loading={loadingRooms} />
                  <Link to="/rooms" className="hq-viewall"
                    style={{ color: P, fontSize: "11px", fontWeight: "600", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", background: "rgba(46,139,87,0.08)", padding: "5px 11px", borderRadius: "7px", border: `1px solid ${P}28`, letterSpacing: "0.05em" }}>
                    View All <ChevronRight size={12} strokeWidth={2.5} />
                  </Link>
                </div>
              }
            />
            {loadingRooms ? <LoadingBox /> : dashboardRooms.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", color: "#bbb", fontSize: "13px", background: "white", borderRadius: "14px" }}>
                {roomsOnline ? "No rooms yet. Create your first room." : "Could not load rooms."}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px" }}>
                {dashboardRooms.map((room, i) => (
                  <motion.div key={room.id} {...fade(i, 0.6)} className="hq-card"
                    onClick={() => navigate(`/rooms/${room.id}`)}
                    style={{ ...card, cursor: "pointer", padding: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                      <div style={{ width: "50px", height: "50px", background: "#e7f3ee", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Home size={26} color="#63a17f" />
                      </div>
                      <div>
                        <h5 style={{ margin: 0, fontWeight: "bold", fontSize: "16px", color: "#1a1a1a" }}>{room.name}</h5>
                        <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>
                          {room.deviceCount} device{room.deviceCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    {room.description && (
                      <p style={{ margin: 0, fontSize: "12px", color: "#aaa", lineHeight: 1.4 }}>{room.description}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;