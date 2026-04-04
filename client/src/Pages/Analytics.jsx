import React, { useState, useEffect, useCallback, useMemo } from "react";
import Layout from "../Components/Layout";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line
} from "recharts";
import {
  Zap, Wifi, WifiOff, RotateCcw, Activity, Lightbulb, Clock
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const BASE_URL = "http://localhost:5000";

const apiFetch = async (path, token) => {
  const storedToken = token || localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
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
  const roomId = typeof device.room === "object"
    ? (device.room._id || device.room.id)
    : device.room;
  if (!roomId) return false;
  return roomIdSet.has(roomId.toString());
};


const filterEventsByUserDevices = (events, userDeviceIds) => {
  if (!events || events.length === 0) return [];
  if (!userDeviceIds || userDeviceIds.size === 0) return [];
  
  const filtered = events.filter(event => {
    // The device field is a string ID in your events
    const deviceId = event.device?.toString() || 
                     event.deviceId?.toString() ||
                     event.device_id?.toString();
    
    return deviceId && userDeviceIds.has(deviceId);
  });
  
  return filtered;
};

/* 
   OBSERVER PATTERN
   All analytics stats are derived automatically from
   the two live data sources (devices + events) via
   useMemo. Any change in either source instantly
   reflects everywhere — no manual sync needed.

   Observers:
     deviceStats   — observes devices state
     eventStats    — observes events state
     hourlyData    — observes events state
     actionData    — observes events state
     pieData       — observes devices state
     powerData     — observes devices state
*/

/*  Device observers  */
const deriveDeviceStats = (devices) => ({
  total:         devices.length,
  on:            devices.filter(d => d.status === "ON").length,
  off:           devices.filter(d => d.status === "OFF").length,
  idle:          devices.filter(d => d.status === "IDLE").length,
  fault:         devices.filter(d => d.status === "FAULT").length,
  totalCapacityW: devices.reduce((s, d) => s + (d.powerRatingWatt || 0), 0),
  livePowerW:    devices
    .filter(d => d.status === "ON")
    .reduce((s, d) => s + (d.powerRatingWatt || 0), 0),
  healthScore:   devices.length > 0
    ? Math.round(((devices.length - devices.filter(d => d.status === "FAULT").length) / devices.length) * 100)
    : 100,
});

const deriveDevicePie = (devices) => {
  if (!devices || devices.length === 0) return [];
  const colors = { LIGHT: "#CDCC58", FAN: "#63a17f", AC: "#5c35b0", OTHER: "#b8d4c4" };
  const labels = { LIGHT: "Lighting", FAN: "Ventilation", AC: "Heating/Cooling", OTHER: "Other" };
  const counts = {};
  devices.forEach(d => {
    const t = d.type || "OTHER";
    counts[t] = (counts[t] || 0) + 1;
  });
  const total = devices.length;
  return Object.entries(counts).map(([type, count]) => ({
    name:  labels[type] || type,
    value: Math.round((count / total) * 100),
    color: colors[type] || "#b8d4c4",
  }));
};

const derivePowerByType = (devices) => {
  if (!devices || devices.length === 0) return [];
  const colors = { LIGHT: "#CDCC58", FAN: "#63a17f", AC: "#5c35b0", OTHER: "#b8d4c4" };
  const labels = { LIGHT: "Lighting", FAN: "Ventilation", AC: "Heating/Cooling", OTHER: "Other" };
  const power = {};
  devices.forEach(d => {
    const t = d.type || "OTHER";
    power[t] = (power[t] || 0) + (d.powerRatingWatt || 0);
  });
  return Object.entries(power).map(([type, watts]) => ({
    name:  labels[type] || type,
    watts,
    color: colors[type] || "#b8d4c4",
  }));
};


const deriveEventStats = (events) => {
  const now   = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const recent = events.filter(ev => (now - new Date(ev.timestamp).getTime()) < dayMs);
  const counts = { ON: 0, OFF: 0, IDLE: 0, FAULT: 0 };
  recent.forEach(ev => { if (counts[ev.action] !== undefined) counts[ev.action]++; });
  return { total: recent.length, ...counts };
};

const deriveHourlyActivity = (events) => {
  const hours = Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, "0")}:00`, events: 0,
  }));
  const now   = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  events.forEach(ev => {
    const age = now - new Date(ev.timestamp).getTime();
    if (age > dayMs) return;
    const h = new Date(ev.timestamp).getHours();
    hours[h].events += 1;
  });
  return hours;
};

const derivePeakHour = (hourlyData) => {
  if (!hourlyData || hourlyData.every(h => h.events === 0)) return "No activity";
  return hourlyData.reduce((max, h) => h.events > max.events ? h : max, hourlyData[0]).hour;
};

const tips = [
  { icon: Zap,       title: "Optimize Thermostat", desc: "Reduce heating/cooling by 2°F when away to save up to 10% monthly",   bg: "#f0faf4", iconBg: "#d4f0e0", iconColor: "#2e8b57" },
  { icon: Lightbulb, title: "LED Lighting",         desc: "Switching to LED bulbs could save 75% on lighting costs",             bg: "#f5f4e0", iconBg: "#eeecb0", iconColor: "#9a9800" },
  { icon: Clock,     title: "Peak Hours",           desc: "Use appliances during off-peak hours (10 PM – 6 AM) for lower rates", bg: "#f2f0fa", iconBg: "#e0d8f5", iconColor: "#5c35b0" },
];

const StatusPill = ({ online, loading, label }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: loading ? "#f0f0f0" : online ? "#e8f5ee" : "#fdecea", color: loading ? "#888" : online ? "#63a17f" : "#c03030" }}>
    {loading
      ? <RotateCcw size={10} style={{ animation: "spin 1s linear infinite" }} />
      : online ? <Wifi size={10} /> : <WifiOff size={10} />}
    {loading ? "Loading..." : online ? label || "Live" : "Offline"}
  </span>
);

const SectionLabel = ({ text, live }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
    <h5 style={{ margin: 0, fontWeight: "700", fontSize: "17px", color: "#1a1a1a" }}>{text}</h5>
    {live
      ? <span style={{ fontSize: "11px", fontWeight: "600", color: "#63a17f", background: "#e8f5ee", padding: "3px 8px", borderRadius: "6px" }}>Live </span>
      : <span style={{ fontSize: "11px", color: "#bbb", padding: "3px 8px" }}>Static</span>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "white", borderRadius: "10px", padding: "10px 16px", boxShadow: "0 4px 16px rgba(0,0,0,0.13)", border: "1px solid #e0ece6" }}>
        <p style={{ margin: "0 0 4px", fontWeight: "700", color: "#1a1a1a" }}>{label}</p>
        <p style={{ margin: 0, color: "#5c35b0", fontWeight: "600", fontSize: "14px" }}>
          {payload[0].name}: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

const LoadingBox = ({ height = 220 }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height, color: "#aaa", fontSize: "13px", gap: "8px" }}>
    <RotateCcw size={16} style={{ animation: "spin 1s linear infinite" }} /> Loading...
  </div>
);

const EmptyBox = ({ height = 220, message = "No data available" }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height, color: "#ccc", fontSize: "13px" }}>
    {message}
  </div>
);

const Analytics = () => {
  const { token, user } = useAuth();

  const [devices,        setDevices]        = useState([]);
  const [allEvents,      setAllEvents]      = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [loadingEvents,  setLoadingEvents]  = useState(true);
  const [devicesOnline,  setDevicesOnline]  = useState(false);
  const [eventsOnline,   setEventsOnline]   = useState(false);

  const fetchDevices = useCallback(async (t) => {
    setLoadingDevices(true);
    try {
      const tok = t || token || localStorage.getItem("token");

      // Get this user's home
      const homeData = await apiFetch("/homes/mine", tok);
      const home     = homeData?.data?.home || homeData?.home;
      const homeId   = home?.id || home?._id;
      
      if (!homeId) { 
        setDevices([]); 
        setDevicesOnline(false);
        return { filteredDevices: [], deviceIds: new Set() };
      }

      // 2. Get rooms for this home
      const roomData = await apiFetch(`/rooms/${homeId}/rooms`, tok);
      const roomList = roomData?.data?.rooms || roomData?.rooms || [];
      const roomIdSet = buildRoomIdSet(roomList);

      // 3. Get all devices, filter to only this home's rooms
      const devData  = await apiFetch("/devices", tok);
      const allDevices = devData?.data?.devices || devData?.devices || [];

      const filtered = allDevices.filter(d => deviceBelongsToUser(d, roomIdSet));
      setDevices(filtered);
      setDevicesOnline(true);
      
      // Return both filtered devices and their IDs for event filtering
      const deviceIds = new Set(filtered.map(d => d._id?.toString() || d.id?.toString()));
      return { filteredDevices: filtered, deviceIds };
    } catch (error) {
      console.error("Error fetching devices:", error);
      setDevices([]);
      setDevicesOnline(false);
      return { filteredDevices: [], deviceIds: new Set() };
    } finally {
      setLoadingDevices(false);
    }
  }, [token]);

 
  const fetchEvents = useCallback(async (deviceIds = null) => {
    setLoadingEvents(true);
    try {
      const data = await apiFetch("/events/recent?limit=500", token);
      const rawEvents = data?.data?.events || data?.events || [];
      setAllEvents(rawEvents);
      setEventsOnline(true);
     
      if (deviceIds && deviceIds.size > 0) {
        const filtered = filterEventsByUserDevices(rawEvents, deviceIds);
        setFilteredEvents(filtered);
      } else {
        setFilteredEvents([]);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setEventsOnline(false);
      setFilteredEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  }, [token]);

  useEffect(() => {
    const tok = token || localStorage.getItem("token");
    if (!tok) return;

    setDevices([]);
    setAllEvents([]);
    setFilteredEvents([]);

    const init = async () => {
      
      const { deviceIds } = await fetchDevices(tok);
      
      await fetchEvents(deviceIds);
    };
    init();

    const id = setInterval(async () => { 
      const { deviceIds } = await fetchDevices(tok);
      await fetchEvents(deviceIds);
    }, 30000);
    return () => clearInterval(id);
  }, [token, user, fetchDevices, fetchEvents]);

  /* 
     OBSERVER PATTERN
     All stats below auto-update whenever devices or filteredEvents state changes.
   */
  const deviceStats   = useMemo(() => deriveDeviceStats(devices), [devices]);
  const devicePieData = useMemo(() => deriveDevicePie(devices), [devices]);
  const powerData = useMemo(() => derivePowerByType(devices), [devices]);
  const eventStats = useMemo(() => deriveEventStats(filteredEvents), [filteredEvents]);
  const hourlyData = useMemo(() => deriveHourlyActivity(filteredEvents),[filteredEvents]);
  const peakHour = useMemo(() => derivePeakHour(hourlyData),         [hourlyData]);
  const actionBarData = useMemo(() => [
    { action: "ON",    count: eventStats.ON,    color: "#63a17f"  },
    { action: "OFF",   count: eventStats.OFF,   color: "#5c35b0"  },
    { action: "IDLE",  count: eventStats.IDLE,  color: "#b8860b"  },
    { action: "FAULT", count: eventStats.FAULT, color: "#c03030"  },
  ], [eventStats]);

  const utilizationPct = deviceStats.totalCapacityW > 0
    ? Math.round((deviceStats.livePowerW / deviceStats.totalCapacityW) * 100)
    : 0;

  const card = {
    background: "white", borderRadius: "14px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.06)", padding: "24px",
  };

  return (
    <Layout>
      <div className="p-4">

        <div style={{ marginBottom: "24px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontWeight: "800", fontSize: "22px", color: "#1a1a1a" }}>Energy Analytics</h2>
            <p style={{ margin: 0, fontSize: "14px", color: "#777" }}>Monitor and optimize your energy consumption</p>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <StatusPill online={devicesOnline} loading={loadingDevices} label="Devices live" />
            <StatusPill online={eventsOnline}  loading={loadingEvents}  label="Events live"  />
          </div>
        </div>

        {!loadingDevices && (
          <div style={{ ...card, padding: "14px 20px", marginBottom: "20px", background: "#f0faf4", border: "1px solid #c2e0cf" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
              <Wifi size={13} color="#63a17f" />
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#63a17f" }}>
                {devicesOnline ? `Live Device Summary — ${deviceStats.total} devices` : "Device data unavailable"}
              </span>
            </div>
            {devicesOnline && deviceStats.total > 0 ? (
              <div className="row g-3">
                {[
                  { label: "Total", value: deviceStats.total,                                                                      color: "#5c35b0", bg: "#f2f0fa" },
                  { label: "ON", value: deviceStats.on,                                                                         color: "#2e8b57", bg: "#f0faf4" },
                  { label: "OFF", value: deviceStats.off,                                                                        color: "#888",    bg: "#f5f5f5" },
                  { label: "IDLE", value: deviceStats.idle,                                                                       color: "#b8860b", bg: "#fdf8e8" },
                  { label: "FAULT", value: deviceStats.fault,                                                                      color: "#c03030", bg: "#fef2f2" },
                  { label: "Live Power", value: `${deviceStats.livePowerW}W`,                                                           color: "#b8860b", bg: "#fdf8e8" },
                  { label: "Capacity", value: `${deviceStats.totalCapacityW}W`,                                                       color: "#5c35b0", bg: "#f2f0fa" },
                  { label: "Utilization",   value: `${utilizationPct}%`,                                                                   color: "#5c35b0", bg: "#f2f0fa" },
                  { label: "Health Score",  value: `${deviceStats.healthScore}%`, color: deviceStats.healthScore > 80 ? "#2e8b57" : "#c03030", bg: deviceStats.healthScore > 80 ? "#f0faf4" : "#fef2f2" },
                ].map((s, i) => (
                  <div key={i} className="col-6 col-md-4 col-lg">
                    <div style={{ background: s.bg, borderRadius: "10px", padding: "10px 14px", textAlign: "center" }}>
                      <p style={{ margin: "0 0 2px", fontSize: "11px", fontWeight: "700", color: s.color, textTransform: "uppercase" }}>{s.label}</p>
                      <p style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: s.color, lineHeight: 1 }}>{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: "13px", color: "#aaa" }}>Could not load device data.</p>
            )}
          </div>
        )}


        {!loadingEvents && (
          <div style={{ ...card, padding: "14px 20px", marginBottom: "20px", background: "#f2f0fa", border: "1px solid #d4c8f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
              <Activity size={13} color="#5c35b0" />
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#5c35b0" }}>
                {eventsOnline ? `Live Event Activity — last 24 hours (${eventStats.total} events from your devices)` : "Event data unavailable"}
              </span>
            </div>
            {eventsOnline ? (
              <div className="row g-3">
                {[
                  { label: "Total Events",  value: eventStats.total, color: "#5c35b0", bg: "#ebe8f8" },
                  { label: "ON Events",     value: eventStats.ON, color: "#2e8b57", bg: "#f0faf4" },
                  { label: "OFF Events",    value: eventStats.OFF, color: "#888",    bg: "#f5f5f5" },
                  { label: "IDLE Events",   value: eventStats.IDLE, color: "#b8860b", bg: "#fdf8e8" },
                  { label: "FAULT Events",  value: eventStats.FAULT, color: "#c03030", bg: "#fef2f2" },
                  { label: "Peak Hour",     value: peakHour, color: "#5c35b0", bg: "#ebe8f8" },
                ].map((s, i) => (
                  <div key={i} className="col-6 col-md-4 col-lg-2">
                    <div style={{ background: s.bg, borderRadius: "10px", padding: "10px 14px", textAlign: "center" }}>
                      <p style={{ margin: "0 0 2px", fontSize: "11px", fontWeight: "700", color: s.color, textTransform: "uppercase" }}>{s.label}</p>
                      <p style={{ margin: 0, fontSize: s.label === "Peak Hour" ? "14px" : "18px", fontWeight: "800", color: s.color, lineHeight: 1 }}>{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: "13px", color: "#aaa" }}>Could not load event data.</p>
            )}
          </div>
        )}

        <div style={{ ...card, marginBottom: "24px" }}>
          <SectionLabel text="Device Activity — Last 24 Hours" live={eventsOnline} />
          <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#aaa" }}>
            {eventsOnline
              ? `${eventStats.total} events from your devices bucketed by hour · peak at ${peakHour}`
              : "No event data available"}
          </p>
          {loadingEvents ? <LoadingBox /> : !eventsOnline ? <EmptyBox message="Could not load event data" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={hourlyData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8eaf0" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#aaa" }} interval={3} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#aaa" }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="events" name="Events" stroke="#5c35b0" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#5c35b0" }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="row g-3" style={{ marginBottom: "24px" }}>

          <div className="col-md-6">
            <div style={{ ...card, height: "100%" }}>
              <SectionLabel text="Event Action Breakdown" live={eventsOnline} />
              <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#aaa" }}>
                {eventsOnline ? `Real ON/OFF/IDLE/FAULT counts from your devices (last 24h)` : "No event data"}
              </p>
              {loadingEvents ? <LoadingBox /> : !eventsOnline ? <EmptyBox /> : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={actionBarData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8eaf0" />
                    <XAxis dataKey="action" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: "#888" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#aaa" }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(92,53,176,0.06)" }} />
                    <Bar dataKey="count" name="Events" radius={[5, 5, 0, 0]} maxBarSize={52}>
                      {actionBarData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="col-md-6">
            <div style={{ ...card, height: "100%" }}>
              <SectionLabel text="Power Capacity by Device Type (W)" live={devicesOnline} />
              <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#aaa" }}>
                {devicesOnline ? `Total: ${deviceStats.totalCapacityW}W · Live draw: ${deviceStats.livePowerW}W` : "No device data"}
              </p>
              {loadingDevices ? <LoadingBox /> : !devicesOnline || powerData.length === 0 ? <EmptyBox /> : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={powerData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8eaf0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#aaa" }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,161,127,0.06)" }} />
                    <Bar dataKey="watts" name="Watts" radius={[5, 5, 0, 0]} maxBarSize={60}>
                      {powerData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>

 
        <div style={{ ...card, marginBottom: "24px" }}>
          <SectionLabel text="Device Count by Type" live={devicesOnline} />
          {loadingDevices ? <LoadingBox height={260} /> : !devicesOnline || devicePieData.length === 0 ? <EmptyBox height={260} /> : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={devicePieData} cx="50%" cy="50%" outerRadius={100} dataKey="value"
                  label={({ name, value }) => `${name} ${value}%`} labelLine={true}>
                  {devicePieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(val) => `${val}%`} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={card}>
          <h5 style={{ margin: "0 0 20px", fontWeight: "700", fontSize: "17px", color: "#1a1a1a" }}>
            Energy Saving Tips
          </h5>
          <div className="row g-3">
            {tips.map((tip, i) => {
              const Icon = tip.icon;
              return (
                <div key={i} className="col-md-4">
                  <div style={{ background: tip.bg, borderRadius: "12px", padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: "14px", transition: "transform 0.2s ease", height: "100%" }}
                    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                    <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: tip.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={18} color={tip.iconColor} strokeWidth={2} />
                    </div>
                    <div>
                      <p style={{ margin: "0 0 4px", fontWeight: "700", fontSize: "14px", color: "#1a1a1a" }}>{tip.title}</p>
                      <p style={{ margin: 0, fontSize: "12.5px", color: "#666", lineHeight: 1.5 }}>{tip.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <style>{`
        h5 { font-size: 1.1rem; }
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </Layout>
  );
};

export default Analytics;