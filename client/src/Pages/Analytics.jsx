// import React, { useState } from "react";
// import Layout from "../Components/Layout";
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
//   ResponsiveContainer, PieChart, Pie, Cell, Legend
// } from "recharts";
// import { Zap, Calendar, Target, Settings, Lightbulb, Clock } from "lucide-react";

// class EnergyStrategy {
//   calculate(data) { return 0; }
// }
// class TotalKwhStrategy extends EnergyStrategy {
//   calculate(data) { return data.reduce((sum, d) => sum + d.kwh, 0).toFixed(1); }
// }
// class AverageDailyStrategy extends EnergyStrategy {
//   calculate(data) { return (data.reduce((sum, d) => sum + d.kwh, 0) / data.length).toFixed(1); }
// }

// const weeklyData = [
//   { day: "Mon", kwh: 24.3 },
//   { day: "Tue", kwh: 26.1 },
//   { day: "Wed", kwh: 22.8 },
//   { day: "Thu", kwh: 29.4 },
//   { day: "Fri", kwh: 23.6 },
//   { day: "Sat", kwh: 31.2 },
//   { day: "Sun", kwh: 30.9 },
// ];

// const deviceData = [
//   { name: "Heating/Cooling", value: 42, color: "#63a17f" },
//   { name: "Appliances",      value: 15, color: "#CDCC58" },
//   { name: "Lighting",        value: 18, color: "#2e8b57" },
//   { name: "Entertainment",   value: 14, color: "#5c35b0" },
//   { name: "Other",           value: 11, color: "#b8d4c4" },
// ];

// const tips = [
//   {
//     icon: Zap,
//     title: "Optimize Thermostat",
//     desc: "Reduce heating/cooling by 2°F when away to save up to 10% monthly",
//     bg: "#f0faf4", iconBg: "#d4f0e0", iconColor: "#2e8b57",
//   },
//   {
//     icon: Lightbulb,
//     title: "LED Lighting",
//     desc: "Switching to LED bulbs could save 75% on lighting costs",
//     bg: "#f5f4e0", iconBg: "#eeecb0", iconColor: "#9a9800",
//   },
//   {
//     icon: Clock,
//     title: "Peak Hours",
//     desc: "Use appliances during off-peak hours (10 PM – 6 AM) for lower rates",
//     bg: "#f2f0fa", iconBg: "#e0d8f5", iconColor: "#5c35b0",
//   },
// ];

// const CustomTooltip = ({ active, payload, label }) => {
//   if (active && payload && payload.length) {
//     return (
//       <div style={{
//         background: "white", borderRadius: "10px", padding: "10px 16px",
//         boxShadow: "0 4px 16px rgba(0,0,0,0.13)", border: "1px solid #e0ece6",
//       }}>
//         <p style={{ margin: "0 0 4px", fontWeight: "700", color: "#1a1a1a" }}>{label}</p>
//         <p style={{ margin: 0, color: "#63a17f", fontWeight: "600", fontSize: "14px" }}>
//           Usage (kWh) : {payload[0].value}
//         </p>
//       </div>
//     );
//   }
//   return null;
// };

// const Analytics = () => {
//   const [limit,     setLimit]    = useState(750);
//   const [editing,   setEditing]  = useState(false);
//   const [tempLimit, setTempLimit] = useState(750);

//   const totalKwh  = new TotalKwhStrategy().calculate(weeklyData);
//   const dailyAvg  = new AverageDailyStrategy().calculate(weeklyData);

//   const monthKwh   = 623;
//   const budgetUsed = Math.round((monthKwh / limit) * 100);
//   const progressPct = Math.min((monthKwh / limit) * 100, 100);

//   const statCards = [
//     {
//       label: "This Month", value: "623 kWh", sub: "16.7% vs last month",
//       subColor: "#2e8b57", icon: Zap, iconColor: "#63a17f",
//       bg: "#f0faf4", border: "#c2e0cf",
//     },
//     {
//       label: "Daily Average", value: `${dailyAvg} kWh`, sub: "This week",
//       subColor: "#5c35b0", icon: Calendar, iconColor: "#5c35b0",
//       bg: "#f2f0fa", border: "#d4c8f0",
//     },
//     {
//       label: "Weekly Total", value: `${totalKwh} kWh`, sub: "Mon – Sun",
//       subColor: "#9a9800", icon: Zap, iconColor: "#CDCC58",
//       bg: "#fafae8", border: "#e0e080",
//     },
//     {
//       label: "Budget Used", value: `${budgetUsed}%`, sub: `${monthKwh}/${limit} kWh`,
//       subColor: "#2e8b57", icon: Target, iconColor: "#63a17f",
//       bg: "#f0faf4", border: "#c2e0cf",
//     },
//   ];

//   const card = {
//     background: "white",
//     borderRadius: "14px",
//     boxShadow: "0 6px 15px rgba(0,0,0,0.06)",
//     padding: "24px",
//   };

//   return (
//     <Layout>
//       <div className="p-4">

//         <div style={{ marginBottom: "24px" }}>
//           <h2 style={{ margin: "0 0 4px", fontWeight: "800", fontSize: "22px", color: "#1a1a1a" }}>
//             Energy Analytics
//           </h2>
//           <p style={{ margin: 0, fontSize: "14px", color: "#777" }}>
//             Monitor and optimize your energy consumption
//           </p>
//         </div>

//         <div className="row g-3" style={{ marginBottom: "24px" }}>
//           {statCards.map((c, i) => {
//             const Icon = c.icon;
//             return (
//               <div key={i} className="col-md-3 col-sm-6">
//                 <div style={{
//                   background: c.bg, borderRadius: "14px", padding: "18px 20px",
//                   border: `1px solid ${c.border}`,
//                   boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
//                   transition: "transform 0.3s ease, box-shadow 0.3s ease",
//                 }}
//                   onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 24px rgba(0,0,0,0.10)"; }}
//                   onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)"; }}
//                 >
//                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
//                     <span style={{ fontSize: "13px", fontWeight: "600", color: "#555" }}>{c.label}</span>
//                     <Icon size={18} color={c.iconColor} strokeWidth={2} />
//                   </div>
//                   <div style={{ fontSize: "26px", fontWeight: "800", color: "#1a1a1a", lineHeight: 1.1, marginBottom: "8px" }}>
//                     {c.value}
//                   </div>
//                   <div style={{ fontSize: "12px", color: c.subColor, fontWeight: "500" }}>{c.sub}</div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         <div style={{ ...card, marginBottom: "24px" }}>
//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
//             <div>
//               <h5 style={{ margin: "0 0 4px", fontWeight: "700", fontSize: "17px", color: "#1a1a1a" }}>
//                 Monthly Usage Limit
//               </h5>
//               <p style={{ margin: 0, fontSize: "13px", color: "#888" }}>
//                 Set a monthly energy consumption goal
//               </p>
//             </div>
//             {editing ? (
//               <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//                 <input
//                   type="number"
//                   value={tempLimit}
//                   onChange={e => setTempLimit(Number(e.target.value))}
//                   style={{
//                     width: "90px", padding: "6px 10px", borderRadius: "8px",
//                     border: "1.5px solid #a8d4b8", fontSize: "14px", fontWeight: "600",
//                     outline: "none", color: "#1a1a1a",
//                   }}
//                 />
//                 <button
//                   onClick={() => { setLimit(tempLimit); setEditing(false); }}
//                   style={{
//                     background: "#63a17f", color: "white", border: "none",
//                     borderRadius: "8px", padding: "6px 14px", fontSize: "13px",
//                     fontWeight: "600", cursor: "pointer",
//                   }}>
//                   Save
//                 </button>
//                 <button
//                   onClick={() => setEditing(false)}
//                   style={{
//                     background: "#f0f0f0", color: "#555", border: "none",
//                     borderRadius: "8px", padding: "6px 12px", fontSize: "13px",
//                     fontWeight: "600", cursor: "pointer",
//                   }}>
//                   Cancel
//                 </button>
//               </div>
//             ) : (
//               <button
//                 onClick={() => { setTempLimit(limit); setEditing(true); }}
//                 style={{
//                   display: "flex", alignItems: "center", gap: "6px",
//                   background: "white", border: "1.5px solid #e0e0e0",
//                   borderRadius: "8px", padding: "7px 14px", cursor: "pointer",
//                   fontSize: "13px", fontWeight: "600", color: "#444",
//                   transition: "all 0.2s ease",
//                 }}
//                 onMouseEnter={e => e.currentTarget.style.borderColor = "#63a17f"}
//                 onMouseLeave={e => e.currentTarget.style.borderColor = "#e0e0e0"}
//               >
//                 <Settings size={14} color="#666" strokeWidth={2} /> Edit
//               </button>
//             )}
//           </div>

//           <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
//             <span style={{ fontSize: "13px", color: "#555" }}>Current limit</span>
//             <span style={{ fontSize: "13px", fontWeight: "700", color: "#1a1a1a" }}>{limit} kWh</span>
//           </div>
//           <div style={{ height: "14px", background: "#e8f0eb", borderRadius: "10px", overflow: "hidden", marginBottom: "8px" }}>
//             <div style={{
//               height: "100%", width: `${progressPct}%`,
//               background: "linear-gradient(90deg, #63a17f, #2e8b57)",
//               borderRadius: "10px",
//               transition: "width 0.6s ease",
//             }} />
//           </div>
//           <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#999" }}>
//             <span>0 kWh</span>
//             <span style={{ color: "#2e8b57", fontWeight: "600" }}>{monthKwh} kWh used</span>
//             <span>{limit} kWh</span>
//           </div>
//         </div>

//         <div style={{ ...card, marginBottom: "24px" }}>
//           <h5 style={{ margin: "0 0 4px", fontWeight: "700", fontSize: "17px", color: "#1a1a1a" }}>
//             This Week's Usage
//           </h5>
//           <div style={{ marginBottom: "20px" }}>
//             <span style={{ fontSize: "13px", color: "#555" }}>Total: <strong>{totalKwh} kWh</strong></span>
//           </div>
//           <ResponsiveContainer width="100%" height={260}>
//             <BarChart data={weeklyData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
//               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8f0eb" />
//               <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: "#888" }} />
//               <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#aaa" }} />
//               <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,161,127,0.08)" }} />
//               <Legend iconType="square" wrapperStyle={{ fontSize: "13px", paddingTop: "16px" }} />
//               <Bar dataKey="kwh" name="Usage (kWh)" fill="#63a17f" radius={[5, 5, 0, 0]} maxBarSize={52} />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         <div className="row g-3">

//           <div className="col-md-6">
//             <div style={{ ...card, height: "100%" }}>
//               <h5 style={{ margin: "0 0 20px", fontWeight: "700", fontSize: "17px", color: "#1a1a1a" }}>
//                 Usage by Device Type
//               </h5>
//               <ResponsiveContainer width="100%" height={260}>
//                 <PieChart>
//                   <Pie
//                     data={deviceData}
//                     cx="50%"
//                     cy="50%"
//                     outerRadius={100}
//                     dataKey="value"
//                     label={({ name, value }) => `${name} ${value}%`}
//                     labelLine={true}
//                   >
//                     {deviceData.map((entry, i) => (
//                       <Cell key={i} fill={entry.color} />
//                     ))}
//                   </Pie>
//                   <Tooltip formatter={(val) => `${val}%`} />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//           </div>

//           <div className="col-md-6">
//             <div style={{ ...card, height: "100%" }}>
//               <h5 style={{ margin: "0 0 20px", fontWeight: "700", fontSize: "17px", color: "#1a1a1a" }}>
//                 Energy Saving Tips
//               </h5>
//               <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
//                 {tips.map((tip, i) => {
//                   const Icon = tip.icon;
//                   return (
//                     <div key={i} style={{
//                       background: tip.bg, borderRadius: "12px", padding: "14px 16px",
//                       display: "flex", alignItems: "flex-start", gap: "14px",
//                       transition: "transform 0.2s ease",
//                     }}
//                       onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
//                       onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
//                     >
//                       <div style={{
//                         width: "38px", height: "38px", borderRadius: "10px",
//                         background: tip.iconBg, display: "flex", alignItems: "center",
//                         justifyContent: "center", flexShrink: 0,
//                       }}>
//                         <Icon size={18} color={tip.iconColor} strokeWidth={2} />
//                       </div>
//                       <div>
//                         <p style={{ margin: "0 0 4px", fontWeight: "700", fontSize: "14px", color: "#1a1a1a" }}>
//                           {tip.title}
//                         </p>
//                         <p style={{ margin: 0, fontSize: "12.5px", color: "#666", lineHeight: 1.5 }}>
//                           {tip.desc}
//                         </p>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>

//         </div>
//       </div>

//       <style jsx>{`
//         h5 { font-size: 1.1rem; }
//       `}</style>

//     </Layout>
//   );
// };

// export default Analytics;

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

/* 
   API CONFIG
*/
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

/* =====================================================
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

/*  Event observers  */
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
      ? <span style={{ fontSize: "11px", fontWeight: "600", color: "#63a17f", background: "#e8f5ee", padding: "3px 8px", borderRadius: "6px" }}>Live from backend</span>
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
  const { token } = useAuth();

  const [devices,        setDevices]        = useState([]);
  const [events,         setEvents]         = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [loadingEvents,  setLoadingEvents]  = useState(true);
  const [devicesOnline,  setDevicesOnline]  = useState(false);
  const [eventsOnline,   setEventsOnline]   = useState(false);

  const fetchDevices = useCallback(async () => {
    setLoadingDevices(true);
    try {
      const data = await apiFetch("/devices", token);
      setDevices(data?.data?.devices || data?.devices || []);
      setDevicesOnline(true);
    } catch {
      setDevicesOnline(false);
    } finally {
      setLoadingDevices(false);
    }
  }, [token]);

  /*  Fetch events  */
  const fetchEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const data = await apiFetch("/events/recent?limit=200", token);
      setEvents(data?.data?.events || data?.events || []);
      setEventsOnline(true);
    } catch {
      setEventsOnline(false);
    } finally {
      setLoadingEvents(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDevices();
    fetchEvents();
    const id = setInterval(() => { fetchDevices(); fetchEvents(); }, 30000);
    return () => clearInterval(id);
  }, [fetchDevices, fetchEvents]);

  /* 
     OBSERVER PATTERN
     All stats below auto-update whenever devices or events state changes.
   */
  const deviceStats   = useMemo(() => deriveDeviceStats(devices),          [devices]);
  const devicePieData = useMemo(() => deriveDevicePie(devices),            [devices]);
  const powerData     = useMemo(() => derivePowerByType(devices),          [devices]);
  const eventStats    = useMemo(() => deriveEventStats(events),            [events]);
  const hourlyData    = useMemo(() => deriveHourlyActivity(events),        [events]);
  const peakHour      = useMemo(() => derivePeakHour(hourlyData),         [hourlyData]);
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

        {/* 
            DEVICE SUMMARY STRIP
            Observer: derives from devices state
            Source: GET /devices
         */}
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
                  { label: "Total",         value: deviceStats.total,                                                                      color: "#5c35b0", bg: "#f2f0fa" },
                  { label: "ON",            value: deviceStats.on,                                                                         color: "#2e8b57", bg: "#f0faf4" },
                  { label: "OFF",           value: deviceStats.off,                                                                        color: "#888",    bg: "#f5f5f5" },
                  { label: "IDLE",          value: deviceStats.idle,                                                                       color: "#b8860b", bg: "#fdf8e8" },
                  { label: "FAULT",         value: deviceStats.fault,                                                                      color: "#c03030", bg: "#fef2f2" },
                  { label: "Live Power",    value: `${deviceStats.livePowerW}W`,                                                           color: "#b8860b", bg: "#fdf8e8" },
                  { label: "Capacity",      value: `${deviceStats.totalCapacityW}W`,                                                       color: "#5c35b0", bg: "#f2f0fa" },
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

        {/* 
            EVENT SUMMARY STRIP
            Observer: derives from events state
            Source: GET /events/recent
         */}
        {!loadingEvents && (
          <div style={{ ...card, padding: "14px 20px", marginBottom: "20px", background: "#f2f0fa", border: "1px solid #d4c8f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
              <Activity size={13} color="#5c35b0" />
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#5c35b0" }}>
                {eventsOnline ? `Live Event Activity — last 24 hours` : "Event data unavailable"}
              </span>
            </div>
            {eventsOnline ? (
              <div className="row g-3">
                {[
                  { label: "Total Events",  value: eventStats.total,        color: "#5c35b0", bg: "#ebe8f8" },
                  { label: "ON Events",     value: eventStats.ON,           color: "#2e8b57", bg: "#f0faf4" },
                  { label: "OFF Events",    value: eventStats.OFF,          color: "#888",    bg: "#f5f5f5" },
                  { label: "IDLE Events",   value: eventStats.IDLE,         color: "#b8860b", bg: "#fdf8e8" },
                  { label: "FAULT Events",  value: eventStats.FAULT,        color: "#c03030", bg: "#fef2f2" },
                  { label: "Peak Hour",     value: peakHour,                color: "#5c35b0", bg: "#ebe8f8" },
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

        {/* 
            HOURLY ACTIVITY LINE CHART
            Observer: derives from events state
            Source: GET /events/recent
         */}
        <div style={{ ...card, marginBottom: "24px" }}>
          <SectionLabel text="Device Activity — Last 24 Hours" live={eventsOnline} />
          <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#aaa" }}>
            {eventsOnline
              ? `${eventStats.total} events bucketed by hour · peak at ${peakHour}`
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
                {eventsOnline ? "Real ON/OFF/IDLE/FAULT counts last 24h" : "No event data"}
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

        {/* 
            DEVICE COUNT PIE
            Observer: derives from devices state
            Source: GET /devices
         */}
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

        {/* ENERGY SAVING TIPS
 */}
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