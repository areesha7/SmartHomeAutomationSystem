
/**
 * 
 * FACTORY METHOD PATTERN - Simplified
 * 
 * 
 * WHAT: A creational pattern that defines an interface for creating objects,
 *       but lets subclasses decide which class to instantiate.
 * 
 * WHY USED HERE: Creates different simulation scenario objects (Normal, Peak,
 *                Energy Saving, Sensor Failure, Emergency) without coupling
 *                the main component to specific scenario classes.
 * 
 * HOW IT WORKS:
 *   1. SimulationScenario (interface) - defines what all scenarios must have
 *   2. Concrete scenarios (NormalScenario, PeakScenario, etc.) - implement the interface
 *   3. ScenarioFactory - creates the right scenario based on mode
 * 
 * BENEFIT: Adding a new scenario only requires creating a new class and adding
 *          one line to the factory - no changes to existing simulation logic!
 * 
 */

import { useState, useEffect, useMemo } from "react";
import Layout from "../Components/Layout";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import { Activity, GitBranch, Zap, Play, RotateCcw, CheckCircle, RefreshCw } from "lucide-react";

const API = import.meta.env.VITE_API_URL;
const STATES = ["OFF", "ON", "IDLE", "FAULT"];
const GREEN = "#63a17f";
const ACCENT = "#5c35b0";
const GOLD = "#b8860b";
const STATE_COLORS = { OFF: "#90A4AE", ON: "#63a17f", IDLE: "#b8860b", FAULT: "#c03030" };


/*
 Product Interface - All simulation scenarios must implement this
 */
class SimulationScenario {
  getConfig() {
    throw new Error("Method must be implemented");
  }
  
  calculateMetrics(inputs) {
    throw new Error("Method must be implemented");
  }
  
  getName() {
    throw new Error("Method must be implemented");
  }
  
  getDescription() {
    throw new Error("Method must be implemented");
  }
}

/*
  Concrete Product - Normal Usage Scenario
 */
class NormalScenario extends SimulationScenario {
  getConfig() {
    return {
      responseTimeMultiplier: 1.2,
      utilizationMultiplier: 1.0,
      energyMultiplier: 1.0,
      stabilityReduction: 0.5,
      label: "Normal Usage"
    };
  }
  
  calculateMetrics(inputs) {
    const { totalEvents, totalDevices, spanHours, avgPower } = inputs;
    const lambda = spanHours > 0 ? (totalEvents / spanHours).toFixed(2) : 0;
    return {
      label: this.getName(),
      avgResponseTime: (100 + totalEvents * 1.2).toFixed(1),
      utilization: Math.min(0.95, totalDevices > 0 ? totalEvents / (totalDevices * 10) : 0).toFixed(2),
      energyKwh: (avgPower * totalDevices * spanHours / 1000).toFixed(2),
      stability: Math.max(0, 100 - (totalEvents / Math.max(totalDevices, 1)) * 0.5).toFixed(1),
      lambda
    };
  }
  
  getName() { return "Normal Usage"; }
  getDescription() { return "Standard daily usage pattern with typical energy consumption"; }
}

/* Concrete Product - Peak Usage Scenario
 */
class PeakScenario extends SimulationScenario {
  getConfig() {
    return {
      responseTimeMultiplier: 2.5,
      utilizationMultiplier: 1.8,
      energyMultiplier: 1.8,
      stabilityReduction: 1.2,
      label: "Peak Usage"
    };
  }
  
  calculateMetrics(inputs) {
    const { totalEvents, totalDevices, spanHours, avgPower } = inputs;
    const lambda = spanHours > 0 ? (totalEvents / spanHours).toFixed(2) : 0;
    return {
      label: this.getName(),
      avgResponseTime: (200 + totalEvents * 2.5).toFixed(1),
      utilization: Math.min(0.99, totalDevices > 0 ? (totalEvents * 1.8) / (totalDevices * 10) : 0).toFixed(2),
      energyKwh: (avgPower * totalDevices * spanHours * 1.8 / 1000).toFixed(2),
      stability: Math.max(0, 100 - (totalEvents / Math.max(totalDevices, 1)) * 1.2).toFixed(1),
      lambda
    };
  }
  
  getName() { return "Peak Usage"; }
  getDescription() { return "High demand scenario during rush hours with increased load"; }
}

/* Concrete Product - Energy Saving Scenario
 */
class EnergySavingScenario extends SimulationScenario {
  getConfig() {
    return {
      responseTimeMultiplier: 1.0,
      utilizationMultiplier: 0.45,
      energyMultiplier: 0.45,
      stabilityReduction: 0.3,
      label: "Energy Saving"
    };
  }
  
  calculateMetrics(inputs) {
    const { totalEvents, totalDevices, spanHours, avgPower } = inputs;
    const lambda = spanHours > 0 ? (totalEvents / spanHours).toFixed(2) : 0;
    return {
      label: this.getName(),
      avgResponseTime: (130 + totalEvents * 1.0).toFixed(1),
      utilization: Math.min(0.60, totalDevices > 0 ? totalEvents / (totalDevices * 18) : 0).toFixed(2),
      energyKwh: (avgPower * totalDevices * spanHours * 0.45 / 1000).toFixed(2),
      stability: Math.max(0, 100 - (totalEvents / Math.max(totalDevices, 1)) * 0.3).toFixed(1),
      lambda
    };
  }
  
  getName() { return "Energy Saving"; }
  getDescription() { return "Optimized for minimal energy consumption with efficient operations"; }
}

/* Concrete Product - Sensor Failure Scenario
 */
class SensorFailureScenario extends SimulationScenario {
  getConfig() {
    return {
      responseTimeMultiplier: 3.0,
      utilizationMultiplier: 1.5,
      energyMultiplier: 1.3,
      stabilityReduction: 2.0,
      label: "Sensor Failure"
    };
  }
  
  calculateMetrics(inputs) {
    const { totalEvents, totalDevices, spanHours, avgPower } = inputs;
    const lambda = spanHours > 0 ? (totalEvents / spanHours).toFixed(2) : 0;
    return {
      label: this.getName(),
      avgResponseTime: (350 + totalEvents * 3.0).toFixed(1),
      utilization: Math.min(0.99, totalDevices > 0 ? (totalEvents * 1.5) / (totalDevices * 8) : 0).toFixed(2),
      energyKwh: (avgPower * totalDevices * spanHours * 1.3 / 1000).toFixed(2),
      stability: Math.max(0, 100 - (totalEvents / Math.max(totalDevices, 1)) * 2.0).toFixed(1),
      lambda
    };
  }
  
  getName() { return "Sensor Failure"; }
  getDescription() { return "Simulates malfunctioning sensors causing delayed responses"; }
}

/* Concrete Product - Emergency Alert Scenario
 */
class EmergencyScenario extends SimulationScenario {
  getConfig() {
    return {
      responseTimeMultiplier: 4.0,
      utilizationMultiplier: 2.2,
      energyMultiplier: 2.0,
      stabilityReduction: 3.0,
      label: "Emergency Alert"
    };
  }
  
  calculateMetrics(inputs) {
    const { totalEvents, totalDevices, spanHours, avgPower } = inputs;
    const lambda = spanHours > 0 ? (totalEvents / spanHours).toFixed(2) : 0;
    return {
      label: this.getName(),
      avgResponseTime: (480 + totalEvents * 4.0).toFixed(1),
      utilization: Math.min(0.99, totalDevices > 0 ? (totalEvents * 2.2) / (totalDevices * 6) : 0).toFixed(2),
      energyKwh: (avgPower * totalDevices * spanHours * 2.0 / 1000).toFixed(2),
      stability: Math.max(0, 100 - (totalEvents / Math.max(totalDevices, 1)) * 3.0).toFixed(1),
      lambda
    };
  }
  
  getName() { return "Emergency Alert"; }
  getDescription() { return "Critical situation with maximum alert and rapid response requirements"; }
}

/* Factory - Creates the appropriate simulation scenario
 */
class SimulationScenarioFactory {
  static createScenario(type) {
    switch (type) {
      case "normal":
        return new NormalScenario();
      case "peak":
        return new PeakScenario();
      case "energy":
        return new EnergySavingScenario();
      case "sensor":
        return new SensorFailureScenario();
      case "emergency":
        return new EmergencyScenario();
      default:
        return new NormalScenario();
    }
  }
  
  static getAllScenarioTypes() {
    return [
      { id: "normal", name: "Normal Usage", icon: "📊" },
      { id: "peak", name: "Peak Usage", icon: "⚡" },
      { id: "energy", name: "Energy Saving Mode", icon: "💚" },
      { id: "sensor", name: "Sensor Failure", icon: "⚠️" },
      { id: "emergency", name: "Emergency Alert", icon: "🚨" }
    ];
  }
}
 

const buildRoomIdSet = (rooms) => {
  const ids = new Set();
  rooms.forEach(r => {
    if (r._id) ids.add(r._id.toString());
    if (r.id) ids.add(r.id.toString());
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
  return events.filter(event => {
    const deviceId = event.device?.toString() ||
      event.deviceId?.toString() ||
      event.device_id?.toString();
    return deviceId && userDeviceIds.has(deviceId);
  });
};

class SimulationTemplate {
  run(params) { return {}; }
  execute(params) { return this.run(params); }
}
class NormalSimulation extends SimulationTemplate {
  run({ totalEvents, totalDevices, spanHours, avgPower }) {
    const lambda = spanHours > 0 ? (totalEvents / spanHours).toFixed(2) : 0;
    return { label: "Normal Usage", avgResponseTime: (100 + totalEvents * 1.2).toFixed(1), utilization: Math.min(0.95, totalDevices > 0 ? totalEvents / (totalDevices * 10) : 0).toFixed(2), energyKwh: (avgPower * totalDevices * spanHours / 1000).toFixed(2), stability: Math.max(0, 100 - (totalEvents / Math.max(totalDevices, 1)) * 0.5).toFixed(1), lambda };
  }
}
class PeakSimulation extends SimulationTemplate {
  run({ totalEvents, totalDevices, spanHours, avgPower }) {
    const lambda = spanHours > 0 ? (totalEvents / spanHours).toFixed(2) : 0;
    return { label: "Peak Usage", avgResponseTime: (200 + totalEvents * 2.5).toFixed(1), utilization: Math.min(0.99, totalDevices > 0 ? (totalEvents * 1.8) / (totalDevices * 10) : 0).toFixed(2), energyKwh: (avgPower * totalDevices * spanHours * 1.8 / 1000).toFixed(2), stability: Math.max(0, 100 - (totalEvents / Math.max(totalDevices, 1)) * 1.2).toFixed(1), lambda };
  }
}
class EnergySavingSimulation extends SimulationTemplate {
  run({ totalEvents, totalDevices, spanHours, avgPower }) {
    const lambda = spanHours > 0 ? (totalEvents / spanHours).toFixed(2) : 0;
    return { label: "Energy Saving", avgResponseTime: (130 + totalEvents * 1.0).toFixed(1), utilization: Math.min(0.60, totalDevices > 0 ? totalEvents / (totalDevices * 18) : 0).toFixed(2), energyKwh: (avgPower * totalDevices * spanHours * 0.45 / 1000).toFixed(2), stability: Math.max(0, 100 - (totalEvents / Math.max(totalDevices, 1)) * 0.3).toFixed(1), lambda };
  }
}
class SensorFailureSimulation extends SimulationTemplate {
  run({ totalEvents, totalDevices, spanHours, avgPower }) {
    const lambda = spanHours > 0 ? (totalEvents / spanHours).toFixed(2) : 0;
    return { label: "Sensor Failure", avgResponseTime: (350 + totalEvents * 3.0).toFixed(1), utilization: Math.min(0.99, totalDevices > 0 ? (totalEvents * 1.5) / (totalDevices * 8) : 0).toFixed(2), energyKwh: (avgPower * totalDevices * spanHours * 1.3 / 1000).toFixed(2), stability: Math.max(0, 100 - (totalEvents / Math.max(totalDevices, 1)) * 2.0).toFixed(1), lambda };
  }
}
class EmergencySimulation extends SimulationTemplate {
  run({ totalEvents, totalDevices, spanHours, avgPower }) {
    const lambda = spanHours > 0 ? (totalEvents / spanHours).toFixed(2) : 0;
    return { label: "Emergency Alert", avgResponseTime: (480 + totalEvents * 4.0).toFixed(1), utilization: Math.min(0.99, totalDevices > 0 ? (totalEvents * 2.2) / (totalDevices * 6) : 0).toFixed(2), energyKwh: (avgPower * totalDevices * spanHours * 2.0 / 1000).toFixed(2), stability: Math.max(0, 100 - (totalEvents / Math.max(totalDevices, 1)) * 3.0).toFixed(1), lambda };
  }
}

const simulationMap = {
  normal: new NormalSimulation(), peak: new PeakSimulation(),
  energy: new EnergySavingSimulation(), sensor: new SensorFailureSimulation(),
  emergency: new EmergencySimulation(),
};

const buildPoissonChart = (events, lambdaPerHour) => {
  if (!events.length) return [];
  const buckets = {};
  events.forEach(ev => {
    const h = new Date(ev.timestamp).getHours();
    const key = `${String(h).padStart(2, "0")}:00`;
    buckets[key] = (buckets[key] || 0) + 1;
  });
  return Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, arrivals]) => ({ time, arrivals, expected: lambdaPerHour }));
};

const buildMarkovMatrix = (events) => {
  const counts = {};
  STATES.forEach(f => { counts[f] = {}; STATES.forEach(t => { counts[f][t] = 0; }); });
  const byDevice = {};
  events.forEach(ev => {
    const id = ev.device?.toString() || ev.deviceId?.toString() || ev.device_id?.toString();
    if (!id) return;
    if (!byDevice[id]) byDevice[id] = [];
    byDevice[id].push({ action: ev.action, ts: new Date(ev.timestamp) });
  });
  Object.values(byDevice).forEach(devEvents => {
    const sorted = devEvents.sort((a, b) => a.ts - b.ts);
    for (let i = 0; i < sorted.length - 1; i++) {
      const from = sorted[i].action;
      const to = sorted[i + 1].action;
      if (STATES.includes(from) && STATES.includes(to)) counts[from][to]++;
    }
  });
  return STATES.map(from => {
    const row = STATES.map(to => counts[from][to]);
    const total = row.reduce((a, b) => a + b, 0);
    return total === 0
      ? STATES.map((_, i) => (i === STATES.indexOf(from) ? 1 : 0))
      : row.map(v => parseFloat((v / total).toFixed(3)));
  });
};

const computeSteadyState = (matrix) => {
  let state = STATES.map(() => 1 / STATES.length);
  for (let i = 0; i < 1000; i++) {
    const next = STATES.map(() => 0);
    for (let j = 0; j < STATES.length; j++)
      for (let k = 0; k < STATES.length; k++)
        next[j] += state[k] * matrix[k][j];
    state = next;
  }
  return state;
};
const WINDOW_HOURS = 24;
const computeLambda = (events) => {
  return parseFloat((events.length / WINDOW_HOURS).toFixed(4));
};

const SectionHeader = ({ title, subtitle, icon: Icon, color }) => (
  <div style={{ marginBottom: "24px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={18} color={color} strokeWidth={2} />
      </div>
      <h2 style={{ margin: 0, fontWeight: "800", fontSize: "20px", color: "#1a1a1a" }}>{title}</h2>
    </div>
    <p style={{ margin: "0 0 0 46px", fontSize: "13px", color: "#777" }}>{subtitle}</p>
    <hr style={{ margin: "16px 0 0", border: "none", borderTop: "1.5px solid #e8e4f0" }} />
  </div>
);

const card = { background: "white", borderRadius: "14px", boxShadow: "0 6px 15px rgba(0,0,0,0.06)", padding: "24px" };

const StatusBadge = ({ status }) => {
  const color = STATE_COLORS[status] || "#aaa";
  return (
    <span style={{ padding: "3px 10px", borderRadius: "20px", background: `${color}18`, color, fontSize: "12px", fontWeight: "700", border: `1px solid ${color}33` }}>
      {status}
    </span>
  );
};

export default function ModelingSimulation() {
  const { token, user } = useAuth();

  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [allDevices, setAllDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [loadingEv, setLoadingEv] = useState(true);
  const [loadingDev, setLoadingDev] = useState(true);
  const [error, setError] = useState("");
  const [selectedDevice, setSelectedDevice] = useState("all");
  const [simMode, setSimMode] = useState("normal");
  const [simResults, setSimResults] = useState([]);
  const [simRunning, setSimRunning] = useState(false);
  const [controlling, setControlling] = useState(null);
  const [backendMarkov, setBackendMarkov] = useState(null);
  const [markovSource, setMarkovSource] = useState("frontend");
  const [homeId, setHomeId] = useState(null);
  const [backendLambda, setBackendLambda] = useState(null);
  const [loadingLambda, setLoadingLambda] = useState(false);


  const [energyDaily,   setEnergyDaily]   = useState(null);
  const [energyWeekly,  setEnergyWeekly]  = useState(null);
  const [energyLive,    setEnergyLive]    = useState(null);
  const [energyLoading, setEnergyLoading] = useState(false);
  const [energyTab,     setEnergyTab]     = useState("overview");

  const scenarioMap = {
    normal: "NORMAL", peak: "HIGH_USAGE", energy: "ENERGY_SAVING",
    sensor: "HIGH_USAGE", emergency: "HIGH_USAGE",
  };

  const getHeaders = () => {
    const tok = token || localStorage.getItem("token");
    return { Authorization: `Bearer ${tok}` };
  };

  const fetchUserDevices = async () => {
    try {
      setLoadingDev(true);
      const headers = getHeaders();

      const homeRes = await axios.get(`${API}/homes/mine`, { headers });
      const home = homeRes.data?.data?.home || homeRes.data?.home;
      const hId = home?.id || home?._id;
      setHomeId(hId);

      if (!hId) { setFilteredDevices([]); setAllDevices([]); return new Set(); }

      const roomsRes = await axios.get(`${API}/rooms/${hId}/rooms`, { headers });
      const roomList = roomsRes.data?.data?.rooms || roomsRes.data?.rooms || [];
      const roomIdSet = buildRoomIdSet(roomList);

      const devicesRes = await axios.get(`${API}/devices`, { headers });
      const allDevs = devicesRes.data?.data?.devices || devicesRes.data?.devices || [];
      setAllDevices(allDevs);

      const filtered = allDevs.filter(d => deviceBelongsToUser(d, roomIdSet));
      setFilteredDevices(filtered);

      
      fetchEnergy(hId);

      return new Set(filtered.map(d => (d._id || d.id)?.toString()));
    } catch (err) {
      console.error("Error fetching devices:", err);
      setError("Failed to load devices from backend.");
      setFilteredDevices([]); setAllDevices([]);
      return new Set();
    } finally {
      setLoadingDev(false);
    }
  };

  const fetchBackendMarkov = async (deviceId) => {
    try {
      const res = await axios.get(`${API}/model/device/${deviceId}/markov`, { headers: getHeaders() });
      const data = res.data?.data || res.data;
      if (!data?.matrix) return null;
      const arr = STATES.map(from => STATES.map(to => data.matrix[from]?.[to] ?? 0));
      return { matrix: arr, deviceName: data.deviceName, totalTransitions: data.totalTransitions, source: "backend" };
    } catch { return null; }
  };

  const fetchBackendLambda = async (deviceId) => {
    if (deviceId === "all") {
      setBackendLambda(null);
      return null;
    }

    try {
      setLoadingLambda(true);
      const windowHours = 24;
      const res = await axios.get(
        `${API}/events/device/${deviceId}/lambda?windowHours=${windowHours}`,
        { headers: getHeaders() }
      );
      const data = res.data?.data || res.data;
      setBackendLambda(data);
      return data;
    } catch (err) {
      console.error("Error fetching backend lambda:", err);
      setBackendLambda(null);
      return null;
    } finally {
      setLoadingLambda(false);
    }
  };

  const fetchEnergy = async (hId) => {
    if (!hId) return;
    setEnergyLoading(true);
    try {
      const headers = getHeaders();
      const today = new Date().toLocaleDateString('en-CA');
      const [dailyRes, weeklyRes, liveRes] = await Promise.all([
        axios.get(`${API}/energy/home/${hId}/daily?date=${today}`, { headers }),
        axios.get(`${API}/energy/home/${hId}/weekly`, { headers }),
        axios.get(`${API}/energy/home/${hId}/live`, { headers }),
      ]);
      setEnergyDaily(dailyRes.data?.data || dailyRes.data);
      setEnergyWeekly(weeklyRes.data?.data || weeklyRes.data);
      setEnergyLive(liveRes.data?.data || liveRes.data);
    } catch (err) {
      console.error("[Energy] fetch failed:", err);
    } finally {
      setEnergyLoading(false);
    }
  };

  const handleDeviceSelect = async (deviceId) => {
    setSelectedDevice(deviceId);
    if (deviceId === "all") {
      setBackendMarkov(null);
      setBackendLambda(null);
      setMarkovSource("frontend");
    } else {
      const markovResult = await fetchBackendMarkov(deviceId);
      const lambdaResult = await fetchBackendLambda(deviceId);
      if (markovResult) { setBackendMarkov(markovResult); setMarkovSource("backend"); }
      else { setBackendMarkov(null); setMarkovSource("frontend"); }
      if (lambdaResult) setBackendLambda(lambdaResult);
    }
  };

  const fetchEvents = async (deviceIds = null) => {
    try {
      setLoadingEv(true);
      const res = await axios.get(`${API}/events/recent?limit=500`, { headers: getHeaders() });
      const rawEvents = res.data?.data?.events || res.data?.events || [];
      setAllEvents(rawEvents);

      if (deviceIds && deviceIds.size > 0) {
        setFilteredEvents(filterEventsByUserDevices(rawEvents, deviceIds));
      } else {
        setFilteredEvents([]);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events from backend.");
      setFilteredEvents([]);
    } finally {
      setLoadingEv(false);
    }
  };

  useEffect(() => {
    const tok = token || localStorage.getItem("token");
    if (!tok) return;

    setFilteredDevices([]); setFilteredEvents([]); setAllDevices([]); setAllEvents([]);

    const init = async () => {
      const deviceIds = await fetchUserDevices();
      await fetchEvents(deviceIds);
    };
    init();

    const interval = setInterval(async () => {
      const deviceIds = await fetchUserDevices();
      await fetchEvents(deviceIds);
    }, 600000);
    return () => clearInterval(interval);
  }, [token]);

  const events = filteredEvents;
  const devices = filteredDevices;

  const filteredEventsByDevice = useMemo(() => {
    if (selectedDevice === "all") return events;
    return events.filter(e => {
      const deviceId = e.device?.toString() || e.deviceId?.toString() || e.device_id?.toString();
      return deviceId === selectedDevice;
    });
  }, [events, selectedDevice]);

  const lambda = useMemo(() => computeLambda(filteredEventsByDevice), [filteredEventsByDevice]);
  const chartLambda = (selectedDevice !== "all" && backendLambda)
    ? backendLambda.lambdaPerHour
    : lambda;
  const poissonChart = useMemo(() => buildPoissonChart(filteredEventsByDevice, chartLambda), [filteredEventsByDevice, chartLambda]);
  const frontendMarkov = useMemo(() => buildMarkovMatrix(events), [events]);
  const markovMatrix = backendMarkov ? backendMarkov.matrix : frontendMarkov;
  const steadyState = useMemo(() => computeSteadyState(markovMatrix), [markovMatrix]);

  const actionCounts = useMemo(() => {
    const c = { ON: 0, OFF: 0, IDLE: 0, FAULT: 0 };
    filteredEventsByDevice.forEach(e => { if (c[e.action] !== undefined) c[e.action]++; });
    return c;
  }, [filteredEventsByDevice]);

  const triggerCounts = useMemo(() => {
    const c = { USER: 0, AUTOMATION: 0, IOT_FEEDBACK: 0 };
    filteredEventsByDevice.forEach(e => { if (c[e.triggeredBy] !== undefined) c[e.triggeredBy]++; });
    return c;
  }, [filteredEventsByDevice]);

  const spanHours = useMemo(() => {
    if (filteredEventsByDevice.length < 2) return 1;
    const sorted = filteredEventsByDevice.map(e => new Date(e.timestamp)).sort((a, b) => a - b);
    return Math.max(1, (sorted[sorted.length - 1] - sorted[0]) / 3600000);
  }, [filteredEventsByDevice]);

  const avgPower = useMemo(() => {
    if (!devices.length) return 0;
    return devices.reduce((s, d) => s + (d.powerRatingWatt || 0), 0) / devices.length;
  }, [devices]);

  const handleRunSim = async () => {
    setSimRunning(true);
    try {
      const backendScenario = scenarioMap[simMode];
      const durationHours = Math.max(0.1, parseFloat(spanHours.toFixed(1)));

      const scenario = SimulationScenarioFactory.createScenario(simMode);
      const localResult = scenario.calculateMetrics({
        totalEvents: filteredEventsByDevice.length,
        totalDevices: devices.length,
        spanHours,
        avgPower
      });
      
      const res = await axios.post(
        `${API}/simulation/run`,
        { scenario: backendScenario, duration_hours: durationHours },
        { headers: getHeaders() }
      );
      const data = res.data.data || res.data;
      const merged = {
        ...localResult, id: Date.now(),
        energyKwh: data.energyKwh ?? localResult.energyKwh,
        avgResponseTime: data.avgResponseTimeMs ?? localResult.avgResponseTime,
        utilization: data.utilization != null ? (data.utilization / 100).toFixed(2) : localResult.utilization,
      };
      setSimResults(prev => [merged, ...prev].slice(0, 5));

    } catch (e) {
      setError(e.response?.data?.message || "Simulation failed. Make sure devices are ON.");
    } finally {
      setSimRunning(false);
    }
  };

  const handleControl = async (deviceId, action) => {
    try {
      setControlling(deviceId);
      await axios.post(`${API}/devices/${deviceId}/control`, { action }, { headers: getHeaders() });
      const deviceIds = await fetchUserDevices();
      await fetchEvents(deviceIds);
    } catch (e) {
      setError(e.response?.data?.message || "Device control failed.");
    } finally {
      setControlling(null);
    }
  };

  const comparisonData = simResults.length > 1
    ? simResults.slice(0, 5).reverse().map(r => ({
      label: r.label.split(" ")[0],
      responseTime: parseFloat(r.avgResponseTime),
      utilization: parseFloat((r.utilization * 100).toFixed(1)),
      stability: parseFloat(r.stability),
    }))
    : null;

  const inputStyle = { padding: "8px 12px", borderRadius: "8px", border: "1.5px solid #e0dcea", fontSize: "14px", outline: "none", color: "#1a1a1a", background: "white", width: "100%", boxSizing: "border-box" };
  const loading = loadingEv || loadingDev;

  return (
    <Layout>
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f8f9fa,#eef3f7)", padding: "24px" }}>
{/* 
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
          <div>
            <h1 style={{ margin: "0 0 6px", fontWeight: "800", fontSize: "24px", color: "#1a1a1a" }}>Modeling & Simulation</h1>
            <p style={{ margin: 0, fontSize: "14px", color: "#777" }}>
              Poisson arrival modeling · Markov chain analysis · Multi-scenario simulation engine
            </p>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: GREEN }}>
              Showing data from your home only: {devices.length} devices, {events.length} events
            </p>
          </div>
          <button onClick={async () => { const ids = await fetchUserDevices(); await fetchEvents(ids); }}
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "white", border: "1.5px solid #e0dcea", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "#555" }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div> */}

        {error && (
          <div style={{ background: "#fee8e8", border: "1px solid #fdd", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", fontSize: "13px", color: "#c03030" }}>
            {error} <button onClick={() => setError("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#c03030", fontWeight: "700", marginLeft: "8px" }}>x</button>
          </div>
        )}

        {loading ? (
          <div style={{ ...card, textAlign: "center", padding: "60px", color: "#aaa" }}>
            <RefreshCw size={32} color="#e0dcea" style={{ animation: "spin 1s linear infinite" }} />
            <p style={{ margin: "16px 0 0", fontWeight: "600" }}>Loading real data from ...</p>
          </div>
        ) : (
          <>
            <SectionHeader
              title="Energy Consumption Summary"
              
              icon={Zap} color={GOLD}
            />


            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
              {[
                { id: "overview", label: "🏠 Home Overview" },
                { id: "rooms",    label: "🚪 By Room" },
                { id: "devices",  label: "💡 By Device" },
                { id: "weekly",   label: "📅 Weekly Trend" },
                { id: "live",     label: "⚡ Live Sessions" },
              ].map(tab => (
                <button key={tab.id} onClick={() => setEnergyTab(tab.id)}
                  style={{ padding: "8px 16px", borderRadius: "20px", border: energyTab === tab.id ? `2px solid ${GOLD}` : "1.5px solid #e0dcea", background: energyTab === tab.id ? `${GOLD}15` : "white", color: energyTab === tab.id ? GOLD : "#777", fontSize: "13px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s" }}>
                  {tab.label}
                </button>
              ))}
              <button onClick={() => fetchEnergy(homeId)} disabled={energyLoading}
                style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "20px", border: "1.5px solid #e0dcea", background: "white", color: "#777", fontSize: "13px", cursor: "pointer" }}>
                <RefreshCw size={13} style={{ animation: energyLoading ? "spin 1s linear infinite" : "none" }} />
                {energyLoading ? "Loading..." : "Refresh"}
              </button>
            </div>

            {energyLoading ? (
              <div style={{ ...card, textAlign: "center", padding: "60px", color: "#aaa", marginBottom: "32px" }}>
                <RefreshCw size={28} color="#e0dcea" style={{ animation: "spin 1s linear infinite" }} />
                <p style={{ margin: "12px 0 0" }}>Fetching energy data...</p>
              </div>
            ) : (
              <div style={{ marginBottom: "32px" }}>

                {/* ── HOME OVERVIEW TAB ── */}
                {energyTab === "overview" && (() => {
                  const todayKwh   = energyDaily?.totalKwh ?? 0;
                  const weekKwh    = energyWeekly?.totalKwh ?? 0;
                  const liveSess   = (energyLive?.records || []).length;
                  const liveWatt   = (energyLive?.records || []).reduce((s, r) => s + (r.watt || 0), 0);
                  const weekData   = (energyWeekly?.byDay || []).map(d => ({ date: d.date?.slice(5), kwh: d.totalKwh }));
                  const topRooms   = [...(energyDaily?.byRoom || [])].sort((a,b) => b.totalKwh - a.totalKwh).slice(0, 5);
                  const PIE_COLORS = ["#5c35b0","#63a17f","#b8860b","#2a7ec8","#c03030"];
                  return (
                    <>
                     
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "20px" }}>
                        {[
                          { label: "Consumed Today",  value: `${todayKwh} kWh`, color: GOLD,   bg: "#fdf8e8", icon: "⚡" },
                          { label: "This Week", value: `${weekKwh} kWh`, color: ACCENT, bg: "#f3f0fc", icon: "📅" },
                          { label: "Live Sessions",   value: liveSess, color: GREEN,  bg: "#e8f5ee", icon: "🟢" },
                          { label: "Live Draw", value: `${liveWatt} W`, color: "#2a7ec8", bg: "#e8f4fc", icon: "📡" },
                        ].map(k => (
                          <div key={k.label} style={{ ...card, padding: "20px", background: k.bg, border: `1.5px solid ${k.color}25` }}>
                            <div style={{ fontSize: "24px", marginBottom: "6px" }}>{k.icon}</div>
                            <div style={{ fontSize: "26px", fontWeight: "800", color: k.color, lineHeight: 1 }}>{k.value}</div>
                            <div style={{ fontSize: "12px", color: "#777", marginTop: "4px", fontWeight: "600" }}>{k.label}</div>
                          </div>
                        ))}
                      </div>

                      <div className="row g-3">
                        {/* Weekly */}
                        <div className="col-md-7">
                          <div style={card}>
                            <h5 style={{ margin: "0 0 4px", fontWeight: "700", fontSize: "14px", color: "#1a1a1a" }}>Weekly Consumption (kWh)</h5>
                            <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#aaa" }}>7-day trend for your home</p>
                            {weekData.length === 0 ? (
                              <div style={{ textAlign: "center", padding: "40px", color: "#ccc", fontSize: "13px" }}>No weekly data yet</div>
                            ) : (
                              <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={weekData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                                  <defs>
                                    <linearGradient id="kwhGrad" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%"  stopColor={GOLD} stopOpacity={0.25} />
                                      <stop offset="95%" stopColor={GOLD} stopOpacity={0.02} />
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8eaf0" />
                                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#aaa" }} />
                                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#aaa" }} unit=" kWh" />
                                  <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e0dcea", fontSize: "13px" }} formatter={v => [`${v} kWh`, "Energy"]} />
                                  <Area type="monotone" dataKey="kwh" stroke={GOLD} strokeWidth={2.5} fill="url(#kwhGrad)" dot={{ r: 4, fill: GOLD, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                                </AreaChart>
                              </ResponsiveContainer>
                            )}
                          </div>
                        </div>

                        {/* Room  */}
                        <div className="col-md-5">
                          <div style={{ ...card, height: "100%" }}>
                            <h5 style={{ margin: "0 0 4px", fontWeight: "700", fontSize: "14px", color: "#1a1a1a" }}>Today by Room</h5>
                            <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#aaa" }}>Share of today's consumption</p>
                            {topRooms.length === 0 ? (
                              <div style={{ textAlign: "center", padding: "40px", color: "#ccc", fontSize: "13px" }}>No data for today</div>
                            ) : (
                              <>
                                <ResponsiveContainer width="100%" height={160}>
                                  <PieChart>
                                    <Pie data={topRooms} dataKey="totalKwh" nameKey="roomName" cx="50%" cy="50%" outerRadius={70} innerRadius={36} paddingAngle={3} strokeWidth={0}>
                                      {topRooms.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={v => [`${v} kWh`, ""]} contentStyle={{ borderRadius: "10px", fontSize: "12px" }} />
                                  </PieChart>
                                </ResponsiveContainer>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
                                  {topRooms.map((r, i) => (
                                    <div key={r.roomId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                        <span style={{ fontSize: "12px", color: "#555" }}>{r.roomName}</span>
                                      </div>
                                      <span style={{ fontSize: "12px", fontWeight: "700", color: PIE_COLORS[i % PIE_COLORS.length] }}>{r.totalKwh} kWh</span>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}

                
                {energyTab === "rooms" && (() => {
                  const rooms = [...(energyDaily?.byRoom || [])].sort((a,b) => b.totalKwh - a.totalKwh);
                  const ROOM_COLORS = ["#5c35b0","#63a17f","#b8860b","#2a7ec8","#c03030","#e67e22","#1abc9c"];
                  if (rooms.length === 0) return (
                    <div style={{ ...card, textAlign: "center", padding: "60px", color: "#ccc", fontSize: "13px" }}>No room energy data for today.</div>
                  );
                  const maxKwh = Math.max(...rooms.map(r => r.totalKwh), 0.001);
                  return (
                    <div className="row g-3">
                      <div className="col-md-7">
                        <div style={card}>
                          <h5 style={{ margin: "0 0 4px", fontWeight: "700", fontSize: "14px", color: "#1a1a1a" }}>Energy by Room — Today</h5>
                          <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#aaa" }}>Total kWh consumed per room</p>
                          <ResponsiveContainer width="100%" height={Math.max(200, rooms.length * 52)}>
                            <BarChart data={rooms} layout="vertical" margin={{ top: 4, right: 16, left: 60, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e8eaf0" />
                              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#aaa" }} unit=" kWh" />
                              <YAxis type="category" dataKey="roomName" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#555", fontWeight: "600" }} width={58} />
                              <Tooltip contentStyle={{ borderRadius: "10px", fontSize: "13px" }} formatter={v => [`${v} kWh`, "Consumed"]} />
                              <Bar dataKey="totalKwh" radius={[0, 6, 6, 0]} maxBarSize={28}>
                                {rooms.map((_, i) => <Cell key={i} fill={ROOM_COLORS[i % ROOM_COLORS.length]} />)}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className="col-md-5">
                        <div style={card}>
                          <h5 style={{ margin: "0 0 16px", fontWeight: "700", fontSize: "14px", color: "#1a1a1a" }}>Room Breakdown</h5>
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {rooms.map((r, i) => {
                              const pct = ((r.totalKwh / maxKwh) * 100).toFixed(1);
                              const color = ROOM_COLORS[i % ROOM_COLORS.length];
                              return (
                                <div key={r.roomId}>
                                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#333" }}>{r.roomName}</span>
                                    <span style={{ fontSize: "13px", fontWeight: "700", color }}>{r.totalKwh} kWh</span>
                                  </div>
                                  <div style={{ height: "6px", borderRadius: "4px", background: "#f0eef8" }}>
                                    <div style={{ height: "100%", width: `${pct}%`, borderRadius: "4px", background: color, transition: "width 0.6s ease" }} />
                                  </div>
                                  <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>{r.sessionCount} sessions · {Math.round(r.totalDurationSecs / 60)} min</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {energyTab === "devices" && (() => {

                  const liveRecords = energyLive?.records || [];
                  const deviceMap = {};
                  liveRecords.forEach(r => {
                    const id   = r.device?._id || r.device?.id || r.recordId;
                    const name = r.device?.name || "Unknown";
                    const type = r.device?.type || "";
                    if (!deviceMap[id]) deviceMap[id] = { name, type, watt: r.watt || 0, liveKwh: 0, sessions: 0 };
                    deviceMap[id].liveKwh += r.liveKwh || 0;
                    deviceMap[id].sessions += 1;
                  });
                  const deviceData = Object.values(deviceMap).sort((a,b) => b.watt - a.watt);

                  const typeMap = {};
                  devices.forEach(d => {
                    const t = d.type || "OTHER";
                    if (!typeMap[t]) typeMap[t] = { type: t, totalWatt: 0, count: 0 };
                    typeMap[t].totalWatt += d.powerRatingWatt || 0;
                    typeMap[t].count += 1;
                  });
                  const typeData = Object.values(typeMap);
                  const TYPE_COLORS = { AC: "#2a7ec8", FAN: "#63a17f", LIGHT: GOLD, OTHER: "#aaa" };

                  return (
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div style={card}>
                          <h5 style={{ margin: "0 0 4px", fontWeight: "700", fontSize: "14px", color: "#1a1a1a" }}>Live Sessions — Power Draw per Device</h5>
                          <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#aaa" }}>{deviceData.length} active sessions right now</p>
                          {deviceData.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px", color: "#ccc", fontSize: "13px" }}>No live sessions currently running.</div>
                          ) : (
                            <ResponsiveContainer width="100%" height={Math.max(200, deviceData.length * 48)}>
                              <BarChart data={deviceData} layout="vertical" margin={{ top: 4, right: 16, left: 80, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e8eaf0" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#aaa" }} unit="W" />
                                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#555" }} width={76} />
                                <Tooltip contentStyle={{ borderRadius: "10px", fontSize: "13px" }} formatter={(v, n) => [`${v} ${n === "watt" ? "W" : "kWh"}`, n]} />
                                <Bar dataKey="watt" name="watt" fill={ACCENT} radius={[0, 6, 6, 0]} maxBarSize={22} />
                              </BarChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div style={{ ...card, marginBottom: "14px" }}>
                          <h5 style={{ margin: "0 0 4px", fontWeight: "700", fontSize: "14px", color: "#1a1a1a" }}>Power Rating by Device Type</h5>
                          <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#aaa" }}>Total installed wattage per category</p>
                          {typeData.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "30px", color: "#ccc", fontSize: "13px" }}>No devices found.</div>
                          ) : (
                            <ResponsiveContainer width="100%" height={200}>
                              <BarChart data={typeData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8eaf0" />
                                <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#555", fontWeight: "600" }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#aaa" }} unit="W" />
                                <Tooltip contentStyle={{ borderRadius: "10px", fontSize: "13px" }} formatter={v => [`${v} W`, "Total Wattage"]} />
                                <Bar dataKey="totalWatt" radius={[6, 6, 0, 0]} maxBarSize={48}>
                                  {typeData.map((d, i) => <Cell key={i} fill={TYPE_COLORS[d.type] || "#aaa"} />)}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          )}
                        </div>

                        <div style={card}>
                          <h5 style={{ margin: "0 0 12px", fontWeight: "700", fontSize: "14px", color: "#1a1a1a" }}>Device Summary</h5>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {devices.slice(0, 6).map(d => (
                              <div key={d._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderRadius: "8px", background: d.status === "ON" ? "#e8f5ee" : "#fafafa", border: `1px solid ${d.status === "ON" ? "#c2e0cf" : "#f0eef8"}` }}>
                                <div>
                                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#1a1a1a" }}>{d.name}</span>
                                  <span style={{ fontSize: "11px", color: "#aaa", marginLeft: "6px" }}>{d.type}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <span style={{ fontSize: "12px", color: "#777" }}>{d.powerRatingWatt}W</span>
                                  <span style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "700", background: `${STATE_COLORS[d.status]}18`, color: STATE_COLORS[d.status] }}>{d.status}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {energyTab === "weekly" && (() => {
                  const byDay = energyWeekly?.byDay || [];
                  const maxDay = byDay.reduce((m, d) => d.totalKwh > m.kwh ? { kwh: d.totalKwh, date: d.date } : m, { kwh: 0, date: "" });
                  const totalWeek = energyWeekly?.totalKwh ?? 0;
                  const avgDay = byDay.length ? (totalWeek / byDay.length).toFixed(4) : 0;
                  return (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px", marginBottom: "20px" }}>
                        {[
                          { label: "Week Total", value: `${totalWeek} kWh`, color: ACCENT, icon: "📅" },
                          { label: "Daily Average", value: `${avgDay} kWh`,   color: GREEN,  icon: "📊" },
                          { label: "Peak Day", value: maxDay.date?.slice(5) || "—", color: "#c03030", icon: "🔺" },
                        ].map(k => (
                          <div key={k.label} style={{ ...card, padding: "20px" }}>
                            <div style={{ fontSize: "24px", marginBottom: "4px" }}>{k.icon}</div>
                            <div style={{ fontSize: "24px", fontWeight: "800", color: k.color, lineHeight: 1 }}>{k.value}</div>
                            <div style={{ fontSize: "12px", color: "#777", marginTop: "4px", fontWeight: "600" }}>{k.label}</div>
                          </div>
                        ))}
                      </div>

                      <div style={card}>
                        <h5 style={{ margin: "0 0 4px", fontWeight: "700", fontSize: "14px", color: "#1a1a1a" }}>Daily Breakdown — This Week</h5>
                        <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#aaa" }}>
                          {energyWeekly?.weekStart} → {energyWeekly?.weekEnd}
                        </p>
                        {byDay.length === 0 ? (
                          <div style={{ textAlign: "center", padding: "40px", color: "#ccc", fontSize: "13px" }}>No weekly data yet.</div>
                        ) : (
                          <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={byDay.map(d => ({ date: d.date?.slice(5), kwh: d.totalKwh }))} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                              <defs>
                                <linearGradient id="weekBar" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%"   stopColor={ACCENT} stopOpacity={1} />
                                  <stop offset="100%" stopColor={ACCENT} stopOpacity={0.5} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8eaf0" />
                              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#555", fontWeight: "600" }} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#aaa" }} unit=" kWh" />
                              <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e0dcea", fontSize: "13px" }} formatter={v => [`${v} kWh`, "Consumed"]} />
                              <Bar dataKey="kwh" fill="url(#weekBar)" radius={[6, 6, 0, 0]} maxBarSize={52} />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </>
                  );
                })()}

                {energyTab === "live" && (() => {
                  const records = energyLive?.records || [];
                  const totalWatt = records.reduce((s, r) => s + (r.watt || 0), 0);
                  const totalLiveKwh = records.reduce((s, r) => s + (r.liveKwh || 0), 0).toFixed(4);
                  return (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px", marginBottom: "20px" }}>
                        {[
                          { label: "Active Sessions", value: records.length,          color: GREEN,     icon: "🟢" },
                          { label: "Total Draw",      value: `${totalWatt} W`,        color: ACCENT,    icon: "⚡" },
                          { label: "Est. kWh So Far", value: `${totalLiveKwh} kWh`,  color: GOLD,      icon: "🔋" },
                        ].map(k => (
                          <div key={k.label} style={{ ...card, padding: "20px" }}>
                            <div style={{ fontSize: "24px", marginBottom: "4px" }}>{k.icon}</div>
                            <div style={{ fontSize: "24px", fontWeight: "800", color: k.color, lineHeight: 1 }}>{k.value}</div>
                            <div style={{ fontSize: "12px", color: "#777", marginTop: "4px", fontWeight: "600" }}>{k.label}</div>
                          </div>
                        ))}
                      </div>

                      {records.length === 0 ? (
                        <div style={{ ...card, textAlign: "center", padding: "60px", color: "#ccc", fontSize: "13px" }}>
                          No live sessions right now. Turn on some devices!
                        </div>
                      ) : (
                        <div className="row g-3">
                          <div className="col-md-6">
                            <div style={card}>
                              <h5 style={{ margin: "0 0 4px", fontWeight: "700", fontSize: "14px", color: "#1a1a1a" }}>Live kWh by Session</h5>
                              <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#aaa" }}>Estimated energy consumed since session start</p>
                              <ResponsiveContainer width="100%" height={Math.max(180, records.length * 44)}>
                                <BarChart data={records.map(r => ({ name: r.device?.name || "Device", kwh: parseFloat(r.liveKwh?.toFixed(4) || 0), watt: r.watt }))} layout="vertical" margin={{ top: 4, right: 16, left: 70, bottom: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e8eaf0" />
                                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#aaa" }} unit=" kWh" />
                                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#555" }} width={68} />
                                  <Tooltip contentStyle={{ borderRadius: "10px", fontSize: "13px" }} formatter={(v, n) => [`${v} ${n === "kwh" ? "kWh" : "W"}`, n.toUpperCase()]} />
                                  <Bar dataKey="kwh" fill={GREEN} radius={[0, 6, 6, 0]} maxBarSize={22} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          <div className="col-md-6">
                            <div style={card}>
                              <h5 style={{ margin: "0 0 12px", fontWeight: "700", fontSize: "14px", color: "#1a1a1a" }}>Session Details</h5>
                              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {records.map((r, i) => {
                                  const elapsed = r.elapsedSeconds || 0;
                                  const mins  = Math.floor(elapsed / 60);
                                  const secs  = elapsed % 60;
                                  return (
                                    <div key={r.recordId || i} style={{ padding: "12px 14px", borderRadius: "10px", background: "#f0faf4", border: "1px solid #c2e0cf" }}>
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <div>
                                          <span style={{ fontSize: "13px", fontWeight: "700", color: "#1a1a1a" }}>{r.device?.name || "Unknown"}</span>
                                          <span style={{ fontSize: "11px", color: "#aaa", marginLeft: "6px" }}>{r.device?.type} · {r.room?.name}</span>
                                        </div>
                                        <span style={{ fontSize: "13px", fontWeight: "700", color: GREEN }}>{r.watt}W</span>
                                      </div>
                                      <div style={{ display: "flex", gap: "16px", marginTop: "6px" }}>
                                        <span style={{ fontSize: "11px", color: "#777" }}>⏱ {mins}m {secs}s elapsed</span>
                                        <span style={{ fontSize: "11px", color: GOLD, fontWeight: "600" }}>~{r.liveKwh?.toFixed(4)} kWh used</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}

              </div>
            )}


            <SectionHeader
              title="Simulation Engine"
              subtitle={`5 scenario simulations · Inputs: ${filteredEventsByDevice.length} events, ${devices.length} devices, lambda=${lambda}, avgPower=${avgPower.toFixed(0)}W — all from your home`}
              icon={Play} color="#2a7ec8"
            />

            <div className="row g-3">
              <div className="col-md-4">
                <div style={card}>
                  <h5 style={{ margin: "0 0 16px", fontWeight: "700", fontSize: "15px", color: "#1a1a1a" }}>Simulation Inputs (your home)</h5>
                  <div style={{ padding: "12px 14px", background: "#f0faf4", borderRadius: "10px", border: "1px solid #c2e0cf", marginBottom: "16px" }}>
                    {[
                      ["Total Events", filteredEventsByDevice.length],
                      ["Total Devices", devices.length],
                      ["Time Span", `${spanHours.toFixed(1)}h`],
                      ["Avg Power", `${avgPower.toFixed(0)}W`],
                      ["λ (events/h)", lambda],
                    ].map(([label, value]) => (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                        <span style={{ color: "#555" }}>{label}</span>
                        <strong style={{ color: GREEN }}>{value}</strong>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <p style={{ margin: "0 0 6px", fontSize: "13px", fontWeight: "600", color: "#444" }}>Scenario</p>
                    <select style={inputStyle} value={simMode} onChange={e => setSimMode(e.target.value)}>
                      {SimulationScenarioFactory.getAllScenarioTypes().map(scenario => (
                        <option key={scenario.id} value={scenario.id}>{scenario.icon} {scenario.name}</option>
                      ))}
                    </select>
                  </div>
                  <button onClick={handleRunSim} disabled={simRunning}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "11px", borderRadius: "10px", border: "none", background: simRunning ? "#e0dcea" : `linear-gradient(135deg,${GREEN},#2e8b57)`, color: "white", fontSize: "14px", fontWeight: "700", cursor: simRunning ? "not-allowed" : "pointer" }}>
                    {simRunning ? <><RotateCcw size={15} style={{ animation: "spin 1s linear infinite" }} /> Running...</> : <><Play size={15} /> Run Simulation</>}
                  </button>
                </div>
              </div>

              <div className="col-md-8">
                {simResults.length === 0 ? (
                  <div style={{ ...card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "260px", color: "#aaa" }}>
                    <Play size={40} color="#e0dcea" strokeWidth={1.5} />
                    <p style={{ margin: "12px 0 4px", fontWeight: "600", fontSize: "15px" }}>No simulations run yet</p>
                    <p style={{ margin: 0, fontSize: "13px" }}>Outputs will be computed from your {events.length} real events + {devices.length} devices</p>
                  </div>
                ) : (
                  <>
                    <div className="row g-3" style={{ marginBottom: "16px" }}>
                      {[
                        { label: "Avg Response Time", value: `${simResults[0].avgResponseTime} ms`, color: ACCENT },
                        { label: "Device Utilization", value: `${(simResults[0].utilization * 100).toFixed(1)}%`, color: GREEN },
                        { label: "Energy Consumed", value: `${simResults[0].energyKwh} kWh`, color: GOLD },
                        { label: "System Stability", value: `${simResults[0].stability}%`, color: parseFloat(simResults[0].stability) > 70 ? GREEN : "#c03030" },
                      ].map((stat, i) => (
                        <div key={i} className="col-6">
                          <div style={{ ...card, padding: "16px 18px" }}>
                            <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</p>
                            <p style={{ margin: "0 0 2px", fontSize: "24px", fontWeight: "800", color: stat.color, lineHeight: 1 }}>{stat.value}</p>
                            <p style={{ margin: 0, fontSize: "11px", color: "#aaa" }}>{simResults[0].label} · lambda={simResults[0].lambda}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {comparisonData && (
                      <div style={{ ...card, marginBottom: "16px" }}>
                        <h5 style={{ margin: "0 0 4px", fontWeight: "700", fontSize: "15px", color: "#1a1a1a" }}>Scenario Comparison</h5>
                        <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#aaa" }}>Last {comparisonData.length} simulations</p>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={comparisonData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8eaf0" />
                            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#888" }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#aaa" }} />
                            <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e0dcea", fontSize: "13px" }} />
                            <Legend iconType="square" wrapperStyle={{ fontSize: "12px" }} />
                            <Bar dataKey="responseTime" name="Response (ms)" fill={ACCENT} radius={[4, 4, 0, 0]} maxBarSize={32} />
                            <Bar dataKey="stability" name="Stability (%)" fill={GREEN} radius={[4, 4, 0, 0]} maxBarSize={32} />
                            <Bar dataKey="utilization" name="Utilization (%)" fill={GOLD} radius={[4, 4, 0, 0]} maxBarSize={32} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    <div style={{ ...card, padding: "16px 20px" }}>
                      <h5 style={{ margin: "0 0 12px", fontWeight: "700", fontSize: "14px", color: "#1a1a1a" }}>Run History</h5>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {simResults.map((r, i) => (
                          <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: i === 0 ? "#f0faf4" : "#fafafa", borderRadius: "8px", border: `1px solid ${i === 0 ? "#c2e0cf" : "#f0eef8"}` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <CheckCircle size={14} color={i === 0 ? GREEN : "#aaa"} />
                              <span style={{ fontSize: "13px", fontWeight: "600", color: "#1a1a1a" }}>{r.label}</span>
                            </div>
                            <div style={{ display: "flex", gap: "12px" }}>
                              <span style={{ fontSize: "12px", color: "#777" }}>{r.avgResponseTime}ms</span>
                              <span style={{ fontSize: "12px", color: "#777" }}>{r.energyKwh} kWh</span>
                              <span style={{ fontSize: "12px", color: "#777" }}>lambda={r.lambda}</span>
                              <span style={{ fontSize: "12px", fontWeight: "700", color: parseFloat(r.stability) > 70 ? GREEN : "#c03030" }}>{r.stability}% stable</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <style>{`
        h5 { font-size: 1rem; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </Layout>
  );
}



{/* <SectionHeader
              title="Poisson Event Modeling"
              subtitle={`Analyzing ${events.length} real events from your home · Computed λ = ${lambda} events/hour · Filter by device to see individual rates`}
              icon={Activity} color={GREEN}
            />

            <div className="row g-3" style={{ marginBottom: "32px" }}>
              <div className="col-md-3">
                <div style={card}>
                  <h5 style={{ margin: "0 0 14px", fontWeight: "700", fontSize: "15px", color: "#1a1a1a" }}>
                    Filter by Device
                    {selectedDevice !== "all" && loadingLambda && (
                      <span style={{ marginLeft: "8px", fontSize: "11px", color: GREEN }}>
                        <RefreshCw size={12} style={{ animation: "spin 1s linear infinite", display: "inline" }} />
                      </span>
                    )}
                  </h5>
                  <select style={inputStyle} value={selectedDevice} onChange={e => handleDeviceSelect(e.target.value)}>
                    <option value="all">All Devices ({events.length} events)</option>
                    {devices.map(d => {
                      const count = events.filter(ev => {
                        const did = ev.device?.toString() || ev.deviceId?.toString() || ev.device_id?.toString();
                        return did === d._id;
                      }).length;
                      return <option key={d._id} value={d._id}>{d.name} ({count})</option>;
                    })}
                  </select>

                  <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    {selectedDevice !== "all" && backendLambda && (
                      <div style={{ padding: "12px", background: "linear-gradient(135deg, #667eea08, #764ba208)", borderRadius: "10px", border: "1px solid #667eea40" }}>
                        <p style={{ margin: "0 0 2px", fontSize: "11px", fontWeight: "700", color: "#667eea", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          Calculated λ
                        </p>
                        <p style={{ margin: 0, fontSize: "28px", fontWeight: "800", color: "#667eea", lineHeight: 1 }}>
                          {backendLambda.lambdaPerHour}
                        </p>
                        <p style={{ margin: "4px 0 0", fontSize: "10px", color: "#aaa" }}>
                          {backendLambda.eventCount} events · {backendLambda.windowHours}h window
                        </p>
                        <p style={{ margin: "6px 0 0", fontSize: "10px", color: "#667eea", fontStyle: "italic" }}>
                          {backendLambda.interpretation}
                        </p>
                      </div>
                    )}

                    {selectedDevice !== "all" && !backendLambda && !loadingLambda && (
                      <div style={{ padding: "12px", background: "#fff3e0", borderRadius: "10px", border: "1px solid #ffb74d" }}>
                        <p style={{ margin: 0, fontSize: "11px", color: "#e65100", textAlign: "center" }}>
                          No λ data available for this device
                        </p>
                      </div>
                    )}

                    <div style={{ padding: "12px", background: "#f3f0fc", borderRadius: "10px", border: "1px solid #d4c8f0" }}>
                      <p style={{ margin: "0 0 2px", fontSize: "11px", fontWeight: "700", color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em" }}>E[X] = Var[X] = λ·t</p>
                      <p style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: ACCENT, lineHeight: 1 }}>
                        {((selectedDevice !== "all" && backendLambda ? backendLambda.lambdaPerHour : lambda) * WINDOW_HOURS).toFixed(2)}
                      </p>
                      <p style={{ margin: 0, fontSize: "11px", color: "#aaa" }}>
                        expected events over {WINDOW_HOURS}h · λ={(selectedDevice !== "all" && backendLambda ? backendLambda.lambdaPerHour : lambda)} /hr
                      </p>
                    </div>
                    <div style={{ padding: "12px", background: "#fafae8", borderRadius: "10px", border: "1px solid #e0de80" }}>
                      <p style={{ margin: "0 0 6px", fontSize: "11px", fontWeight: "700", color: GOLD, textTransform: "uppercase", letterSpacing: "0.05em" }}>Trigger Sources</p>
                      {Object.entries(triggerCounts).map(([k, v]) => (
                        <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#555", marginBottom: "2px" }}>
                          <span>{k}</span><strong>{v}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-9">
                <div style={{ ...card, marginBottom: "16px" }}>
                  <h5 style={{ margin: "0 0 4px", fontWeight: "700", fontSize: "15px", color: "#1a1a1a" }}>Event Arrivals vs Time</h5>
                  <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#aaa" }}>
                    Actual arrivals vs expected λ={lambda} per hour · {filteredEventsByDevice.length} events · {spanHours.toFixed(1)} hour span
                    {selectedDevice !== "all" && backendLambda && (
                      <span style={{ display: "block", marginTop: "4px", color: "#667eea", fontSize: "11px" }}>
                         λ={backendLambda.lambdaPerHour} (based on {backendLambda.eventCount} events over {backendLambda.windowHours}h)
                      </span>
                    )}
                  </p>
                  {poissonChart.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "#aaa", fontSize: "13px" }}>
                      No events recorded yet. Toggle devices to generate Poisson data.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={poissonChart} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8eaf0" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#aaa" }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#aaa" }} />
                        <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e0dcea", fontSize: "13px" }} />
                        <Legend iconType="square" wrapperStyle={{ fontSize: "12px" }} />
                        <Bar dataKey="arrivals" name="Actual Arrivals" fill={GREEN} radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Line dataKey="expected" name={`Expected λ=${lambda}`} stroke={ACCENT} strokeDasharray="4 4" dot={false} strokeWidth={2} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div style={{ ...card, padding: "16px 20px" }}>
                  <p style={{ margin: "0 0 12px", fontWeight: "700", fontSize: "14px", color: "#1a1a1a" }}>Action Type Distribution</p>
                  <div className="row g-3">
                    {Object.entries(actionCounts).map(([action, count]) => (
                      <div key={action} className="col-3">
                        <div style={{ background: `${STATE_COLORS[action]}12`, borderRadius: "10px", padding: "12px", border: `1px solid ${STATE_COLORS[action]}30`, textAlign: "center" }}>
                          <p style={{ margin: "0 0 2px", fontSize: "11px", fontWeight: "700", color: STATE_COLORS[action], textTransform: "uppercase" }}>{action}</p>
                          <p style={{ margin: 0, fontSize: "26px", fontWeight: "800", color: STATE_COLORS[action], lineHeight: 1 }}>{count}</p>
                          <p style={{ margin: 0, fontSize: "11px", color: "#aaa" }}>
                            {filteredEventsByDevice.length > 0 ? ((count / filteredEventsByDevice.length) * 100).toFixed(1) : 0}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <SectionHeader
              title="Markov Chain State Modeling"
              subtitle={markovSource === "" && backendMarkov ? `Real transition matrix from backend · Device: ${backendMarkov.deviceName} · ${backendMarkov.totalTransitions} recorded transitions · Steady-state via 1000-step power iteration` : `Transition matrix computed from ${events.length} real events · Steady-state via 1000-step power iteration`}
              icon={GitBranch} color={ACCENT}
            />

            <div className="row g-3" style={{ marginBottom: "32px" }}>
              <div className="col-md-5">
                <div style={card}>
                  <h5 style={{ margin: "0 0 4px", fontWeight: "700", fontSize: "15px", color: "#1a1a1a" }}>Computed Transition Matrix</h5>
                  <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#aaa" }}>
                    {markovSource === "backend" && backendMarkov
                      ? ` · ${backendMarkov.deviceName} · ${backendMarkov.totalTransitions} transitions recorded`
                      : "P(row state to column state) derived from real event log "}
                  </p>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                      <thead>
                        <tr>
                          <th style={{ padding: "6px 8px", textAlign: "left", color: "#888", fontWeight: "600", fontSize: "11px" }}>From \ To</th>
                          {STATES.map(s => (
                            <th key={s} style={{ padding: "6px 8px", textAlign: "center", color: STATE_COLORS[s], fontWeight: "700", fontSize: "12px" }}>{s}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {STATES.map((fromState, ri) => (
                          <tr key={fromState} style={{ borderTop: "1px solid #f0eef8" }}>
                            <td style={{ padding: "10px 8px", fontWeight: "700", color: STATE_COLORS[fromState], fontSize: "12px" }}>{fromState}</td>
                            {markovMatrix[ri].map((val, ci) => (
                              <td key={ci} style={{ padding: "8px", textAlign: "center" }}>
                                <span style={{ display: "inline-block", padding: "4px 8px", borderRadius: "6px", background: val > 0.3 ? `${STATE_COLORS[STATES[ci]]}20` : "transparent", color: val > 0.3 ? STATE_COLORS[STATES[ci]] : "#bbb", fontWeight: val > 0.3 ? "700" : "400", fontSize: "12px" }}>
                                  {val.toFixed(3)}
                                </span>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p style={{ margin: "12px 0 0", fontSize: "11px", color: "#aaa", fontStyle: "italic" }}>Values highlighted where P &gt; 0.3. Auto-updates when you refresh.</p>
                </div>
              </div>
              <div className="col-md-7">
                <div style={card}>
                  <h5 style={{ margin: "0 0 4px", fontWeight: "700", fontSize: "15px", color: "#1a1a1a" }}>Long-Run Steady-State Probabilities</h5>
                  <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#aaa" }}>pi = pi * P after 1000 iterations — long-term device behavior</p>
                  <div className="row g-3" style={{ marginBottom: "16px" }}>
                    {STATES.map((s, i) => (
                      <div key={s} className="col-6 col-md-3">
                        <div style={{ background: `${STATE_COLORS[s]}12`, borderRadius: "12px", padding: "14px", border: `1px solid ${STATE_COLORS[s]}28`, textAlign: "center" }}>
                          <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "700", color: STATE_COLORS[s], textTransform: "uppercase", letterSpacing: "0.05em" }}>{s}</p>
                          <p style={{ margin: 0, fontSize: "26px", fontWeight: "800", color: STATE_COLORS[s], lineHeight: 1 }}>{(steadyState[i] * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={STATES.map((s, i) => ({ state: s, value: parseFloat((steadyState[i] * 100).toFixed(1)) }))}>
                      <PolarGrid stroke="#e8e4f0" />
                      <PolarAngleAxis dataKey="state" tick={{ fontSize: 12, fontWeight: "600", fill: "#555" }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "#aaa" }} />
                      <Radar name="Steady State %" dataKey="value" stroke={ACCENT} fill={ACCENT} fillOpacity={0.18} strokeWidth={2} />
                      <Tooltip formatter={v => `${v}%`} contentStyle={{ borderRadius: "10px", border: "1px solid #e0dcea", fontSize: "13px" }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <SectionHeader
              title="Live Device Control"
              subtitle={`${devices.length} real devices from your home · Current status · Toggle to generate new Poisson events and Markov transitions`}
              icon={Zap} color={GOLD}
            />

            <div className="row g-3" style={{ marginBottom: "32px" }}>
              {devices.length === 0 ? (
                <div className="col-12">
                  <div style={{ ...card, textAlign: "center", color: "#aaa", padding: "40px", fontSize: "13px" }}>
                    No devices found in your home. Add devices first to see them here.
                  </div>
                </div>
              ) : devices.map(d => (
                <div key={d._id} className="col-md-4 col-sm-6">
                  <div style={{ ...card, padding: "18px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div>
                        <p style={{ margin: "0 0 2px", fontWeight: "700", fontSize: "14px", color: "#1a1a1a" }}>{d.name}</p>
                        <p style={{ margin: 0, fontSize: "12px", color: "#aaa" }}>{d.type} · {d.powerRatingWatt}W · {d.room?.name || "No room"}</p>
                      </div>
                      <StatusBadge status={d.status} />
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {["ON", "OFF", "IDLE"].map(action => (
                        <button key={action} onClick={() => handleControl(d._id, action)}
                          disabled={controlling === d._id || d.status === action || d.status === "FAULT"}
                          style={{ flex: 1, padding: "7px 0", borderRadius: "8px", border: `1.5px solid ${d.status === action ? `${STATE_COLORS[action]}44` : "#eee"}`, background: d.status === action ? `${STATE_COLORS[action]}20` : "#f5f5f5", color: d.status === action ? STATE_COLORS[action] : "#999", fontSize: "12px", fontWeight: "700", cursor: "pointer", opacity: (controlling === d._id || d.status === "FAULT") ? 0.5 : 1 }}>
                          {controlling === d._id ? "..." : action}
                        </button>
                      ))}
                    </div>
                    {d.status === "FAULT" && (
                      <p style={{ margin: "8px 0 0", fontSize: "11px", color: "#c03030", fontWeight: "600" }}>FAULT — cannot be controlled</p>
                    )}
                  </div>
                </div>
              ))}
            </div> */}
