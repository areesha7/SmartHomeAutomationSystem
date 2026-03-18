// import { useState, useMemo } from "react";
// import Layout from "../Components/Layout";
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
//   LineChart, Line, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
// } from "recharts";
// import { Zap, Activity, GitBranch, Play, RotateCcw, CheckCircle } from "lucide-react";

// /* 
//    TEMPLATE METHOD PATTERN
//    Base simulation class defines the fixed algorithm:
//    initialize → run → collectResults → display
//    Each scenario overrides only the variant steps.
//  */
// class SimulationTemplate {
//   initialize(params) { return params; }
//   run(params)        { return {}; }
//   collectResults(raw) { return raw; }

//   execute(params) {
//     const init    = this.initialize(params);
//     const raw     = this.run(init);
//     return this.collectResults(raw);
//   }
// }

// class NormalSimulation extends SimulationTemplate {
//   run({ lambda, devices, hours }) {
//     return {
//       avgResponseTime: (120 + Math.random() * 30).toFixed(1),
//       utilization:     (0.55 + Math.random() * 0.10).toFixed(2),
//       energyKwh:       (lambda * hours * devices * 0.18).toFixed(2),
//       stability:       (94 + Math.random() * 4).toFixed(1),
//       label: "Normal Usage",
//     };
//   }
// }
// class PeakSimulation extends SimulationTemplate {
//   run({ lambda, devices, hours }) {
//     return {
//       avgResponseTime: (220 + Math.random() * 60).toFixed(1),
//       utilization:     (0.82 + Math.random() * 0.10).toFixed(2),
//       energyKwh:       (lambda * hours * devices * 0.34).toFixed(2),
//       stability:       (74 + Math.random() * 8).toFixed(1),
//       label: "Peak Usage",
//     };
//   }
// }
// class EnergySavingSimulation extends SimulationTemplate {
//   run({ lambda, devices, hours }) {
//     return {
//       avgResponseTime: (140 + Math.random() * 20).toFixed(1),
//       utilization:     (0.38 + Math.random() * 0.08).toFixed(2),
//       energyKwh:       (lambda * hours * devices * 0.09).toFixed(2),
//       stability:       (97 + Math.random() * 2).toFixed(1),
//       label: "Energy Saving",
//     };
//   }
// }
// class SensorFailureSimulation extends SimulationTemplate {
//   run({ lambda, devices, hours }) {
//     return {
//       avgResponseTime: (350 + Math.random() * 100).toFixed(1),
//       utilization:     (0.60 + Math.random() * 0.15).toFixed(2),
//       energyKwh:       (lambda * hours * devices * 0.22).toFixed(2),
//       stability:       (55 + Math.random() * 12).toFixed(1),
//       label: "Sensor Failure",
//     };
//   }
// }
// class EmergencySimulation extends SimulationTemplate {
//   run({ lambda, devices, hours }) {
//     return {
//       avgResponseTime: (480 + Math.random() * 120).toFixed(1),
//       utilization:     (0.95 + Math.random() * 0.04).toFixed(2),
//       energyKwh:       (lambda * hours * devices * 0.41).toFixed(2),
//       stability:       (38 + Math.random() * 10).toFixed(1),
//       label: "Emergency Alert",
//     };
//   }
// }

// const simulationMap = {
//   normal:    new NormalSimulation(),
//   peak:      new PeakSimulation(),
//   energy:    new EnergySavingSimulation(),
//   sensor:    new SensorFailureSimulation(),
//   emergency: new EmergencySimulation(),
// };

// const GREEN  = "#63a17f";
// const ACCENT = "#5c35b0";
// const GOLD   = "#b8860b";

// const markovStates = ["OFF", "ON", "IDLE", "FAULT"];
// const initialMatrix = [
//   [0.70, 0.30, 0.00, 0.00],
//   [0.20, 0.60, 0.20, 0.00],
//   [0.10, 0.40, 0.50, 0.00],
//   [0.50, 0.20, 0.10, 0.20],
// ];

// const computeSteadyState = (matrix) => {
//   let state = [0.25, 0.25, 0.25, 0.25];
//   for (let i = 0; i < 1000; i++) {
//     const next = [0, 0, 0, 0];
//     for (let j = 0; j < 4; j++)
//       for (let k = 0; k < 4; k++)
//         next[j] += state[k] * matrix[k][j];
//     state = next;
//   }
//   return state;
// };

// const generatePoissonArrivals = (lambda, slots = 12) => {
//   return Array.from({ length: slots }, (_, i) => {
//     const expected = lambda;
//     const arrivals = Math.round(expected + (Math.random() - 0.5) * expected * 0.6);
//     return { time: `${i * 2}:00`, arrivals: Math.max(0, arrivals), expected: lambda };
//   });
// };

// const eventTypes = [
//   { key: "motion",    label: "Motion Detected",     color: GREEN  },
//   { key: "doorOpen",  label: "Door Open/Close",      color: ACCENT },
//   { key: "appliance", label: "Appliance Usage",      color: GOLD   },
//   { key: "alert",     label: "Security Alert",       color: "#c03030" },
//   { key: "power",     label: "Power Consumption Spike", color: "#2a7ec8" },
// ];

// const SectionHeader = ({ title, subtitle, icon: Icon, color }) => (
//   <div style={{ marginBottom: "24px" }}>
//     <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
//       <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
//         <Icon size={18} color={color} strokeWidth={2} />
//       </div>
//       <h2 style={{ margin: 0, fontWeight: "800", fontSize: "20px", color: "#1a1a1a" }}>{title}</h2>
//     </div>
//     <p style={{ margin: "0 0 0 46px", fontSize: "13px", color: "#777" }}>{subtitle}</p>
//     <hr style={{ margin: "16px 0 0", border: "none", borderTop: "1.5px solid #e8e4f0" }} />
//   </div>
// );

// const card = { background: "white", borderRadius: "14px", boxShadow: "0 6px 15px rgba(0,0,0,0.06)", padding: "24px" };

// const ModelingSimulation = () => {

//   const [lambdaValues, setLambdaValues] = useState({ motion: 12, doorOpen: 8, appliance: 6, alert: 3, power: 5 });
//   const [selectedEvent, setSelectedEvent] = useState("motion");
//   const [matrix, setMatrix]   = useState(initialMatrix);
//   const [simMode,  setSimMode] = useState("normal");
//   const [simHours, setSimHours] = useState(8);
//   const [simDevices, setSimDevices] = useState(6);
//   const [results,  setResults] = useState([]);
//   const [running,  setRunning] = useState(false);

//   const poissonData  = useMemo(() => generatePoissonArrivals(lambdaValues[selectedEvent]), [lambdaValues, selectedEvent]);
//   const steadyState  = useMemo(() => computeSteadyState(matrix), [matrix]);

//   const steadyData = markovStates.map((s, i) => ({
//     state: s,
//     probability: (steadyState[i] * 100).toFixed(1),
//   }));

//   const radarData = markovStates.map((state, i) => ({
//     state,
//     value: parseFloat((steadyState[i] * 100).toFixed(1)),
//   }));

//   const handleCellChange = (row, col, val) => {
//     const num = parseFloat(val);
//     if (isNaN(num) || num < 0 || num > 1) return;
//     const updated = matrix.map((r, ri) => r.map((c, ci) => ri === row && ci === col ? num : c));
//     setMatrix(updated);
//   };

//   const handleRunSimulation = () => {
//     setRunning(true);
//     setTimeout(() => {
//       const sim = simulationMap[simMode];
//       const result = sim.execute({ lambda: lambdaValues[selectedEvent], devices: simDevices, hours: simHours });
//       setResults(prev => [{ ...result, id: Date.now() }, ...prev].slice(0, 5));
//       setRunning(false);
//     }, 1200);
//   };

//   const comparisonData = results.length > 1 ? results.slice(0, 5).reverse().map(r => ({
//     label: r.label.split(" ")[0],
//     responseTime: parseFloat(r.avgResponseTime),
//     utilization:  parseFloat((r.utilization * 100).toFixed(1)),
//     stability:    parseFloat(r.stability),
//   })) : null;

//   const inputStyle = {
//     padding: "8px 12px", borderRadius: "8px", border: "1.5px solid #e0dcea",
//     fontSize: "14px", outline: "none", color: "#1a1a1a", background: "white",
//     width: "100%", boxSizing: "border-box",
//   };

//   return (
//     <Layout>
//       <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f8f9fa,#eef3f7)", padding: "24px" }}>

//         <div style={{ marginBottom: "32px" }}>
//           <h1 style={{ margin: "0 0 6px", fontWeight: "800", fontSize: "24px", color: "#1a1a1a" }}>
//             Modeling & Simulation
//           </h1>
//           <p style={{ margin: 0, fontSize: "14px", color: "#777" }}>
//             Poisson arrival modeling · Markov chain analysis · Multi-scenario simulation engine
//           </p>
//         </div>

//         {/* ── SECTION 1: POISSON ── */}
//         <SectionHeader
//           title="Poisson Event Modeling"
//           subtitle="Model random event arrivals across smart home device types using Poisson rates (λ)"
//           icon={Activity}
//           color={GREEN}
//         />

//         <div className="row g-3" style={{ marginBottom: "32px" }}>

//           <div className="col-md-4">
//             <div style={card}>
//               <h5 style={{ margin: "0 0 16px", fontWeight: "700", fontSize: "15px", color: "#1a1a1a" }}>
//                 Event Rate Configuration (λ/hour)
//               </h5>
//               <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
//                 {eventTypes.map(ev => (
//                   <div key={ev.key}>
//                     <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
//                       <label style={{ fontSize: "12px", fontWeight: "600", color: ev.key === selectedEvent ? ev.color : "#555", cursor: "pointer" }}
//                         onClick={() => setSelectedEvent(ev.key)}>
//                         {ev.label}
//                       </label>
//                       <span style={{ fontSize: "12px", fontWeight: "700", color: ev.color }}>λ = {lambdaValues[ev.key]}</span>
//                     </div>
//                     <input
//                       type="range" min="1" max="30" value={lambdaValues[ev.key]}
//                       onChange={e => setLambdaValues(v => ({ ...v, [ev.key]: Number(e.target.value) }))}
//                       onClick={() => setSelectedEvent(ev.key)}
//                       style={{ width: "100%", accentColor: ev.color }}
//                     />
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div className="col-md-8">
//             <div style={card}>
//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
//                 <h5 style={{ margin: 0, fontWeight: "700", fontSize: "15px", color: "#1a1a1a" }}>
//                   Event Arrivals vs Time
//                 </h5>
//                 <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//                   {eventTypes.map(ev => (
//                     <button key={ev.key} onClick={() => setSelectedEvent(ev.key)}
//                       style={{ padding: "4px 10px", borderRadius: "6px", border: `1.5px solid ${ev.key === selectedEvent ? ev.color : "#e0dcea"}`, background: ev.key === selectedEvent ? `${ev.color}15` : "white", color: ev.key === selectedEvent ? ev.color : "#888", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>
//                       {ev.label.split(" ")[0]}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//               <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#aaa" }}>
//                 Expected λ = {lambdaValues[selectedEvent]} events/hour · 24-hour window
//               </p>
//               <ResponsiveContainer width="100%" height={220}>
//                 <BarChart data={poissonData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
//                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8eaf0" />
//                   <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#aaa" }} />
//                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#aaa" }} />
//                   <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e0dcea", fontSize: "13px" }} />
//                   <Bar dataKey="arrivals" name="Actual Arrivals" fill={eventTypes.find(e => e.key === selectedEvent)?.color} radius={[4, 4, 0, 0]} maxBarSize={36} />
//                   <Line dataKey="expected" name="Expected (λ)" stroke="#aaa" strokeDasharray="4 4" dot={false} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </div>

//           <div className="col-12">
//             <div style={{ ...card, padding: "18px 24px" }}>
//               <div className="row g-4">
//                 {eventTypes.map(ev => (
//                   <div key={ev.key} className="col-md col-6">
//                     <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>{ev.label}</p>
//                     <p style={{ margin: "0 0 2px", fontSize: "26px", fontWeight: "800", color: ev.color, lineHeight: 1 }}>λ = {lambdaValues[ev.key]}</p>
//                     <p style={{ margin: 0, fontSize: "11px", color: "#aaa" }}>E[X] = {lambdaValues[ev.key]} · Var = {lambdaValues[ev.key]}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//         </div>

//         {/* ── SECTION 2: MARKOV ── */}
//         <SectionHeader
//           title="Markov Chain State Modeling"
//           subtitle="Device state transitions: OFF → ON → IDLE → FAULT. Edit transition probabilities and compute long-run steady-state."
//           icon={GitBranch}
//           color={ACCENT}
//         />

//         <div className="row g-3" style={{ marginBottom: "32px" }}>

//           <div className="col-md-5">
//             <div style={card}>
//               <h5 style={{ margin: "0 0 4px", fontWeight: "700", fontSize: "15px", color: "#1a1a1a" }}>
//                 Transition Matrix Editor
//               </h5>
//               <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#aaa" }}>Each row must sum to 1.0</p>
//               <div style={{ overflowX: "auto" }}>
//                 <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
//                   <thead>
//                     <tr>
//                       <th style={{ padding: "6px 8px", textAlign: "left", color: "#888", fontWeight: "600", fontSize: "11px" }}>From \ To</th>
//                       {markovStates.map(s => (
//                         <th key={s} style={{ padding: "6px 8px", textAlign: "center", color: ACCENT, fontWeight: "700", fontSize: "12px" }}>{s}</th>
//                       ))}
//                       <th style={{ padding: "6px 8px", textAlign: "center", color: "#aaa", fontWeight: "600", fontSize: "11px" }}>Sum</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {markovStates.map((fromState, ri) => {
//                       const rowSum = matrix[ri].reduce((a, b) => a + b, 0);
//                       const valid  = Math.abs(rowSum - 1) < 0.01;
//                       return (
//                         <tr key={fromState} style={{ borderTop: "1px solid #f0eef8" }}>
//                           <td style={{ padding: "8px", fontWeight: "700", color: "#1a1a1a", fontSize: "12px" }}>{fromState}</td>
//                           {matrix[ri].map((val, ci) => (
//                             <td key={ci} style={{ padding: "4px" }}>
//                               <input
//                                 type="number" step="0.01" min="0" max="1"
//                                 value={val}
//                                 onChange={e => handleCellChange(ri, ci, e.target.value)}
//                                 style={{ width: "58px", padding: "5px 6px", borderRadius: "6px", border: `1.5px solid ${ri === ci ? `${ACCENT}44` : "#e0dcea"}`, fontSize: "12px", textAlign: "center", outline: "none", background: ri === ci ? `${ACCENT}08` : "white" }}
//                               />
//                             </td>
//                           ))}
//                           <td style={{ padding: "8px", textAlign: "center", fontWeight: "700", fontSize: "12px", color: valid ? GREEN : "#c03030" }}>
//                             {rowSum.toFixed(2)}
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>

//           <div className="col-md-7">
//             <div style={{ ...card, marginBottom: "16px" }}>
//               <h5 style={{ margin: "0 0 4px", fontWeight: "700", fontSize: "15px", color: "#1a1a1a" }}>
//                 Long-Run Steady-State Probabilities
//               </h5>
//               <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#aaa" }}>Computed after 1000 iterations — represents long-term device behavior</p>
//               <div className="row g-3" style={{ marginBottom: "16px" }}>
//                 {steadyData.map((d, i) => {
//                   const colors = [GREEN, ACCENT, GOLD, "#c03030"];
//                   return (
//                     <div key={d.state} className="col-6 col-md-3">
//                       <div style={{ background: `${colors[i]}10`, borderRadius: "12px", padding: "14px", border: `1px solid ${colors[i]}25`, textAlign: "center" }}>
//                         <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "700", color: colors[i], textTransform: "uppercase", letterSpacing: "0.05em" }}>{d.state}</p>
//                         <p style={{ margin: 0, fontSize: "28px", fontWeight: "800", color: colors[i], lineHeight: 1 }}>{d.probability}%</p>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//               <ResponsiveContainer width="100%" height={180}>
//                 <RadarChart data={radarData}>
//                   <PolarGrid stroke="#e8e4f0" />
//                   <PolarAngleAxis dataKey="state" tick={{ fontSize: 12, fontWeight: "600", fill: "#555" }} />
//                   <PolarRadiusAxis angle={30} domain={[0, 50]} tick={{ fontSize: 10, fill: "#aaa" }} />
//                   <Radar name="Steady State %" dataKey="value" stroke={ACCENT} fill={ACCENT} fillOpacity={0.18} strokeWidth={2} />
//                   <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e0dcea", fontSize: "13px" }} formatter={(v) => `${v}%`} />
//                 </RadarChart>
//               </ResponsiveContainer>
//             </div>
//           </div>

//         </div>

//         {/* ── SECTION 3: SIMULATION ── */}
//         <SectionHeader
//           title="Simulation Engine"
//           subtitle="Run 5 scenario simulations and compare response time, utilization, energy consumption, and stability"
//           icon={Zap}
//           color={GOLD}
//         />

//         <div className="row g-3">

//           <div className="col-md-4">
//             <div style={card}>
//               <h5 style={{ margin: "0 0 16px", fontWeight: "700", fontSize: "15px", color: "#1a1a1a" }}>
//                 Simulation Parameters
//               </h5>

//               <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
//                 <div>
//                   <p style={{ margin: "0 0 6px", fontSize: "13px", fontWeight: "600", color: "#444" }}>Scenario</p>
//                   <select style={inputStyle} value={simMode} onChange={e => setSimMode(e.target.value)}>
//                     <option value="normal">Normal Usage</option>
//                     <option value="peak">Peak Usage</option>
//                     <option value="energy">Energy Saving Mode</option>
//                     <option value="sensor">Sensor Failure</option>
//                     <option value="emergency">Emergency Alert</option>
//                   </select>
//                 </div>
//                 <div>
//                   <p style={{ margin: "0 0 6px", fontSize: "13px", fontWeight: "600", color: "#444" }}>Duration (hours): {simHours}h</p>
//                   <input type="range" min="1" max="24" value={simHours} onChange={e => setSimHours(Number(e.target.value))} style={{ width: "100%", accentColor: GOLD }} />
//                 </div>
//                 <div>
//                   <p style={{ margin: "0 0 6px", fontSize: "13px", fontWeight: "600", color: "#444" }}>Number of Devices: {simDevices}</p>
//                   <input type="range" min="1" max="20" value={simDevices} onChange={e => setSimDevices(Number(e.target.value))} style={{ width: "100%", accentColor: GOLD }} />
//                 </div>
//                 <div style={{ padding: "10px 14px", background: "#fafae8", borderRadius: "8px", border: "1px solid #e0de80", fontSize: "12px", color: "#888" }}>
//                   Using λ = <strong style={{ color: GOLD }}>{lambdaValues[selectedEvent]}</strong> from Poisson config · {simDevices} devices · {simHours}h
//                 </div>
//               </div>

//               <button
//                 onClick={handleRunSimulation}
//                 disabled={running}
//                 style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "11px", borderRadius: "10px", border: "none", background: running ? "#e0dcea" : `linear-gradient(135deg, ${GREEN}, #2e8b57)`, color: "white", fontSize: "14px", fontWeight: "700", cursor: running ? "not-allowed" : "pointer", transition: "all 0.2s ease" }}>
//                 {running ? <><RotateCcw size={15} style={{ animation: "spin 1s linear infinite" }} /> Running...</> : <><Play size={15} /> Run Simulation</>}
//               </button>
//             </div>
//           </div>

//           <div className="col-md-8">
//             {results.length === 0 ? (
//               <div style={{ ...card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "260px", color: "#aaa" }}>
//                 <Play size={40} color="#e0dcea" strokeWidth={1.5} />
//                 <p style={{ margin: "12px 0 4px", fontWeight: "600", fontSize: "15px" }}>No simulations run yet</p>
//                 <p style={{ margin: 0, fontSize: "13px" }}>Configure parameters and click Run Simulation</p>
//               </div>
//             ) : (
//               <>
//                 <div className="row g-3" style={{ marginBottom: "16px" }}>
//                   {[
//                     { label: "Avg Response Time", value: `${results[0].avgResponseTime} ms`, color: ACCENT },
//                     { label: "Device Utilization", value: `${(results[0].utilization * 100).toFixed(1)}%`, color: GREEN },
//                     { label: "Energy Consumed",    value: `${results[0].energyKwh} kWh`,     color: GOLD },
//                     { label: "System Stability",   value: `${results[0].stability}%`,          color: results[0].stability > 80 ? GREEN : "#c03030" },
//                   ].map((stat, i) => (
//                     <div key={i} className="col-6">
//                       <div style={{ ...card, padding: "16px 18px" }}>
//                         <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</p>
//                         <p style={{ margin: "0 0 2px", fontSize: "24px", fontWeight: "800", color: stat.color, lineHeight: 1 }}>{stat.value}</p>
//                         <p style={{ margin: 0, fontSize: "11px", color: "#aaa" }}>{results[0].label}</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {comparisonData && (
//                   <div style={card}>
//                     <h5 style={{ margin: "0 0 4px", fontWeight: "700", fontSize: "15px", color: "#1a1a1a" }}>Scenario Comparison</h5>
//                     <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#aaa" }}>Last {comparisonData.length} simulations</p>
//                     <ResponsiveContainer width="100%" height={200}>
//                       <BarChart data={comparisonData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
//                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8eaf0" />
//                         <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#888" }} />
//                         <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#aaa" }} />
//                         <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e0dcea", fontSize: "13px" }} />
//                         <Legend iconType="square" wrapperStyle={{ fontSize: "12px" }} />
//                         <Bar dataKey="responseTime" name="Response (ms)" fill={ACCENT} radius={[4, 4, 0, 0]} maxBarSize={32} />
//                         <Bar dataKey="stability"    name="Stability (%)" fill={GREEN}  radius={[4, 4, 0, 0]} maxBarSize={32} />
//                         <Bar dataKey="utilization"  name="Utilization (%)" fill={GOLD} radius={[4, 4, 0, 0]} maxBarSize={32} />
//                       </BarChart>
//                     </ResponsiveContainer>
//                   </div>
//                 )}

//                 <div style={{ ...card, marginTop: "16px", padding: "16px 20px" }}>
//                   <h5 style={{ margin: "0 0 12px", fontWeight: "700", fontSize: "14px", color: "#1a1a1a" }}>Run History</h5>
//                   <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
//                     {results.map((r, i) => (
//                       <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: i === 0 ? "#f0faf4" : "#fafafa", borderRadius: "8px", border: `1px solid ${i === 0 ? "#c2e0cf" : "#f0eef8"}` }}>
//                         <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//                           <CheckCircle size={14} color={i === 0 ? GREEN : "#aaa"} />
//                           <span style={{ fontSize: "13px", fontWeight: "600", color: "#1a1a1a" }}>{r.label}</span>
//                         </div>
//                         <div style={{ display: "flex", gap: "16px" }}>
//                           <span style={{ fontSize: "12px", color: "#777" }}>{r.avgResponseTime}ms</span>
//                           <span style={{ fontSize: "12px", color: "#777" }}>{r.energyKwh} kWh</span>
//                           <span style={{ fontSize: "12px", fontWeight: "700", color: parseFloat(r.stability) > 80 ? GREEN : "#c03030" }}>{r.stability}% stable</span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>

//         </div>
//       </div>

//       <style jsx>{`
//         h5 { font-size: 1rem; }
//         @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
//       `}</style>
//     </Layout>
//   );
// };

// export default ModelingSimulation;



import { useState, useMemo, useEffect, useCallback } from "react";
import Layout from "../Components/Layout";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { Zap, Activity, GitBranch, Play, RotateCcw, CheckCircle, Wifi, WifiOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const BASE_URL = "http://localhost:5000";

const apiFetch = async (path, token) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
};

/* 
   TEMPLATE METHOD PATTERN
 */
class SimulationTemplate {
  initialize(params) { return params; }
  run(params)        { return {}; }
  collectResults(raw) { return raw; }
  execute(params) {
    const init = this.initialize(params);
    const raw  = this.run(init);
    return this.collectResults(raw);
  }
}
class NormalSimulation extends SimulationTemplate {
  run({ lambda, devices, hours }) {
    return { avgResponseTime: (120 + Math.random() * 30).toFixed(1), utilization: (0.55 + Math.random() * 0.10).toFixed(2), energyKwh: (lambda * hours * devices * 0.18).toFixed(2), stability: (94 + Math.random() * 4).toFixed(1), label: "Normal Usage" };
  }
}
class PeakSimulation extends SimulationTemplate {
  run({ lambda, devices, hours }) {
    return { avgResponseTime: (220 + Math.random() * 60).toFixed(1), utilization: (0.82 + Math.random() * 0.10).toFixed(2), energyKwh: (lambda * hours * devices * 0.34).toFixed(2), stability: (74 + Math.random() * 8).toFixed(1), label: "Peak Usage" };
  }
}
class EnergySavingSimulation extends SimulationTemplate {
  run({ lambda, devices, hours }) {
    return { avgResponseTime: (140 + Math.random() * 20).toFixed(1), utilization: (0.38 + Math.random() * 0.08).toFixed(2), energyKwh: (lambda * hours * devices * 0.09).toFixed(2), stability: (97 + Math.random() * 2).toFixed(1), label: "Energy Saving" };
  }
}
class SensorFailureSimulation extends SimulationTemplate {
  run({ lambda, devices, hours }) {
    return { avgResponseTime: (350 + Math.random() * 100).toFixed(1), utilization: (0.60 + Math.random() * 0.15).toFixed(2), energyKwh: (lambda * hours * devices * 0.22).toFixed(2), stability: (55 + Math.random() * 12).toFixed(1), label: "Sensor Failure" };
  }
}
class EmergencySimulation extends SimulationTemplate {
  run({ lambda, devices, hours }) {
    return { avgResponseTime: (480 + Math.random() * 120).toFixed(1), utilization: (0.95 + Math.random() * 0.04).toFixed(2), energyKwh: (lambda * hours * devices * 0.41).toFixed(2), stability: (38 + Math.random() * 10).toFixed(1), label: "Emergency Alert" };
  }
}
const simulationMap = {
  normal: new NormalSimulation(), peak: new PeakSimulation(),
  energy: new EnergySavingSimulation(), sensor: new SensorFailureSimulation(),
  emergency: new EmergencySimulation(),
};

const GREEN  = "#63a17f";
const ACCENT = "#5c35b0";
const GOLD   = "#b8860b";

const markovStates = ["OFF", "ON", "IDLE", "FAULT"];

const initialMatrix = [
  [0.70, 0.30, 0.00, 0.00],
  [0.20, 0.60, 0.20, 0.00],
  [0.10, 0.40, 0.50, 0.00],
  [0.50, 0.20, 0.10, 0.20],
];

const computeSteadyState = (matrix) => {
  let state = [0.25, 0.25, 0.25, 0.25];
  for (let i = 0; i < 1000; i++) {
    const next = [0, 0, 0, 0];
    for (let j = 0; j < 4; j++)
      for (let k = 0; k < 4; k++)
        next[j] += state[k] * matrix[k][j];
    state = next;
  }
  return state;
};

const buildPoissonFromEvents = (events, selectedKey, lambdaValues) => {
  const slots = 12;
  const buckets = Array.from({ length: slots }, (_, i) => ({
    time: `${i * 2}:00`,
    arrivals: 0,
    expected: lambdaValues[selectedKey],
  }));
  if (events && events.length > 0) {
    const now = Date.now();
    const windowMs = 24 * 60 * 60 * 1000;
    events.forEach((ev) => {
      const age = now - new Date(ev.timestamp).getTime();
      if (age > windowMs) return;
      const slotIndex = Math.floor(((windowMs - age) / windowMs) * slots);
      const idx = Math.min(slotIndex, slots - 1);
      buckets[idx].arrivals += 1;
    });
    return buckets;
  }
  return buckets.map((b) => ({
    ...b,
    arrivals: Math.max(0, Math.round(lambdaValues[selectedKey] + (Math.random() - 0.5) * lambdaValues[selectedKey] * 0.6)),
  }));
};

/* COMMENTED OUT — no /markov endpoint yet, uncomment when route is added
const computeMarkovFromDevices = (devices) => {
  if (!devices || devices.length === 0) return null;
  const counts = { OFF: 0, ON: 0, IDLE: 0, FAULT: 0 };
  devices.forEach((d) => { if (counts[d.status] !== undefined) counts[d.status]++; });
  const total = devices.length;
  return markovStates.map((s) => counts[s] / total);
};
*/

const eventTypes = [
  { key: "motion",    label: "Motion Detected",        color: GREEN     },
  { key: "doorOpen",  label: "Door Open/Close",         color: ACCENT    },
  { key: "appliance", label: "Appliance Usage",         color: GOLD      },
  { key: "alert",     label: "Security Alert",          color: "#c03030" },
  { key: "power",     label: "Power Consumption Spike", color: "#2a7ec8" },
];

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

const card = {
  background: "white", borderRadius: "14px",
  boxShadow: "0 6px 15px rgba(0,0,0,0.06)", padding: "24px",
};

const StatusPill = ({ online, loading }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: "5px",
    padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600",
    background: loading ? "#f0f0f0" : online ? "#e8f5ee" : "#fdecea",
    color: loading ? "#888" : online ? GREEN : "#c03030",
  }}>
    {loading
      ? <RotateCcw size={10} style={{ animation: "spin 1s linear infinite" }} />
      : online ? <Wifi size={10} /> : <WifiOff size={10} />}
    {loading ? "Fetching..." : online ? "Live data" : "Offline — showing demo"}
  </span>
);

const ModelingSimulation = () => {
  const { token } = useAuth();

  const [events,         setEvents]         = useState([]);
  const [devices,        setDevices]        = useState([]);
  const [loadingEvents,  setLoadingEvents]  = useState(true);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [eventsOnline,   setEventsOnline]   = useState(false);
  const [devicesOnline,  setDevicesOnline]  = useState(false);

  const [lambdaValues,  setLambdaValues]  = useState({ motion: 12, doorOpen: 8, appliance: 6, alert: 3, power: 5 });
  const [selectedEvent, setSelectedEvent] = useState("motion");
  const [matrix,        setMatrix]        = useState(initialMatrix);
  const [simMode,       setSimMode]       = useState("normal");
  const [simHours,      setSimHours]      = useState(8);
  const [simDevices,    setSimDevices]    = useState(6);
  const [results,       setResults]       = useState([]);
  const [running,       setRunning]       = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const data = await apiFetch("/events/recent?limit=100", token);
      const list = data?.data?.events || data?.events || [];
      setEvents(list);
      setEventsOnline(true);
    } catch {
      setEventsOnline(false);
    } finally {
      setLoadingEvents(false);
    }
  }, [token]);


  const fetchDevices = useCallback(async () => {
    setLoadingDevices(true);
    try {
      const data = await apiFetch("/devices", token);
      const list = data?.data?.devices || data?.devices || [];
      setDevices(list);
      setDevicesOnline(true);
      if (list.length > 0) setSimDevices(Math.min(list.length, 20));
    } catch {
      setDevicesOnline(false);
    } finally {
      setLoadingDevices(false);
    }
  }, [token]);

  useEffect(() => {
    fetchEvents();
    fetchDevices();
    const id = setInterval(() => { fetchEvents(); fetchDevices(); }, 30000);
    return () => clearInterval(id);
  }, [fetchEvents, fetchDevices]);


  const poissonData = useMemo(
    () => buildPoissonFromEvents(eventsOnline ? events : null, selectedEvent, lambdaValues),
    [events, eventsOnline, selectedEvent, lambdaValues]
  );

  /* COMMENTED OUT — markov from real devices, re-enable when /markov endpoint exists
  const steadyState = useMemo(() => {
    if (devicesOnline && devices.length > 0) {
      const live = computeMarkovFromDevices(devices);
      if (live) return live;
    }
    return computeSteadyState(matrix);
  }, [devices, devicesOnline, matrix]);
  */
  const steadyState = useMemo(() => computeSteadyState(matrix), [matrix]);

  const steadyData = markovStates.map((s, i) => ({
    state: s,
    probability: (steadyState[i] * 100).toFixed(1),
  }));
  const radarData = markovStates.map((state, i) => ({
    state,
    value: parseFloat((steadyState[i] * 100).toFixed(1)),
  }));

  /* COMMENTED OUT — device state counts for live markov strip, re-enable with /markov endpoint
  const deviceStateCounts = useMemo(() => {
    const counts = { OFF: 0, ON: 0, IDLE: 0, FAULT: 0 };
    devices.forEach((d) => { if (counts[d.status] !== undefined) counts[d.status]++; });
    return counts;
  }, [devices]);
  */

  const handleCellChange = (row, col, val) => {
    const num = parseFloat(val);
    if (isNaN(num) || num < 0 || num > 1) return;
    setMatrix(matrix.map((r, ri) => r.map((c, ci) => ri === row && ci === col ? num : c)));
  };

  const handleRunSimulation = () => {
    setRunning(true);
    setTimeout(() => {
      const sim = simulationMap[simMode];
      const result = sim.execute({
        lambda: lambdaValues[selectedEvent],
        devices: simDevices,
        hours: simHours,
      });
      setResults((prev) => [{ ...result, id: Date.now() }, ...prev].slice(0, 5));
      setRunning(false);
    }, 1200);
  };

  const comparisonData = results.length > 1
    ? results.slice(0, 5).reverse().map((r) => ({
        label: r.label.split(" ")[0],
        responseTime: parseFloat(r.avgResponseTime),
        utilization:  parseFloat((r.utilization * 100).toFixed(1)),
        stability:    parseFloat(r.stability),
      }))
    : null;

  const inputStyle = {
    padding: "8px 12px", borderRadius: "8px", border: "1.5px solid #e0dcea",
    fontSize: "14px", outline: "none", color: "#1a1a1a", background: "white",
    width: "100%", boxSizing: "border-box",
  };

  return (
    <Layout>
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f8f9fa,#eef3f7)", padding: "24px" }}>

        <div style={{ marginBottom: "32px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <h1 style={{ margin: "0 0 6px", fontWeight: "800", fontSize: "24px", color: "#1a1a1a" }}>
              Modeling & Simulation
            </h1>
            <p style={{ margin: 0, fontSize: "14px", color: "#777" }}>
              Poisson arrival modeling · Markov chain analysis · Multi-scenario simulation engine
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <StatusPill online={eventsOnline}  loading={loadingEvents}  />
            <StatusPill online={devicesOnline} loading={loadingDevices} />
          </div>
        </div>

        {/* 
            SECTION 1 — POISSON EVENT MODELING
         */}
        <SectionHeader
          title="Poisson Event Modeling"
          subtitle="Random event arrivals from your smart home — live data from /events/recent"
          icon={Activity}
          color={GREEN}
        />

        <div className="row g-3" style={{ marginBottom: "32px" }}>

          {/* Lambda config sliders */}
          <div className="col-md-4">
            <div style={card}>
              <h5 style={{ margin: "0 0 4px", fontWeight: "700", fontSize: "15px", color: "#1a1a1a" }}>
                Event Rate Configuration (λ/hour)
              </h5>
              <p style={{ margin: "0 0 14px", fontSize: "12px", color: "#aaa" }}>
                {eventsOnline
                  ? `Chart built from ${events.length} real events in the last 24h`
                  : "Adjust λ to configure synthetic arrivals"}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {eventTypes.map((ev) => (
                  <div key={ev.key}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <label
                        style={{ fontSize: "12px", fontWeight: "600", color: ev.key === selectedEvent ? ev.color : "#555", cursor: "pointer" }}
                        onClick={() => setSelectedEvent(ev.key)}>
                        {ev.label}
                      </label>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: ev.color }}>
                        λ = {lambdaValues[ev.key]}
                      </span>
                    </div>
                    <input
                      type="range" min="1" max="30" value={lambdaValues[ev.key]}
                      onChange={(e) => setLambdaValues((v) => ({ ...v, [ev.key]: Number(e.target.value) }))}
                      onClick={() => setSelectedEvent(ev.key)}
                      style={{ width: "100%", accentColor: ev.color }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Arrivals bar chart */}
          <div className="col-md-8">
            <div style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <h5 style={{ margin: 0, fontWeight: "700", fontSize: "15px", color: "#1a1a1a" }}>
                  Event Arrivals vs Time
                </h5>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {eventTypes.map((ev) => (
                    <button key={ev.key} onClick={() => setSelectedEvent(ev.key)}
                      style={{ padding: "4px 10px", borderRadius: "6px", border: `1.5px solid ${ev.key === selectedEvent ? ev.color : "#e0dcea"}`, background: ev.key === selectedEvent ? `${ev.color}15` : "white", color: ev.key === selectedEvent ? ev.color : "#888", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>
                      {ev.label.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>
              <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#aaa" }}>
                {eventsOnline
                  ? `Real device events bucketed into 2-hour slots · λ reference = ${lambdaValues[selectedEvent]}/hr`
                  : `Expected λ = ${lambdaValues[selectedEvent]} events/hour · 24-hour window (demo)`}
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={poissonData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8eaf0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#aaa" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#aaa" }} />
                  <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e0dcea", fontSize: "13px" }} />
                  <Bar
                    dataKey="arrivals"
                    name={eventsOnline ? "Real Arrivals" : "Simulated Arrivals"}
                    fill={eventTypes.find((e) => e.key === selectedEvent)?.color}
                    radius={[4, 4, 0, 0]} maxBarSize={36}
                  />
                  <Line dataKey="expected" name="Expected (λ)" stroke="#aaa" strokeDasharray="4 4" dot={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-12">
            <div style={{ ...card, padding: "18px 24px" }}>
              <div className="row g-4">
                {eventTypes.map((ev) => (
                  <div key={ev.key} className="col-md col-6">
                    <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>{ev.label}</p>
                    <p style={{ margin: "0 0 2px", fontSize: "26px", fontWeight: "800", color: ev.color, lineHeight: 1 }}>λ = {lambdaValues[ev.key]}</p>
                    <p style={{ margin: 0, fontSize: "11px", color: "#aaa" }}>E[X] = {lambdaValues[ev.key]} · Var = {lambdaValues[ev.key]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* 
            SECTION 2 — MARKOV CHAIN
         */}
        <SectionHeader
          title="Markov Chain State Modeling"
          subtitle="Device state transitions: OFF → ON → IDLE → FAULT. Edit transition probabilities below."
          icon={GitBranch}
          color={ACCENT}
        />

        {/* COMMENTED OUT — live device state strip, re-enable when /markov endpoint is added
        {devicesOnline && devices.length > 0 && (
          <div style={{ ...card, padding: "14px 20px", marginBottom: "16px", background: `${ACCENT}08`, border: `1px solid ${ACCENT}22` }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
              <Wifi size={13} color={ACCENT} />
              <span style={{ fontSize: "12px", fontWeight: "700", color: ACCENT }}>
                Live Device States ({devices.length} devices)
              </span>
            </div>
            <div className="row g-3">
              {markovStates.map((s, i) => {
                const colors = [GREEN, ACCENT, GOLD, "#c03030"];
                return (
                  <div key={s} className="col-6 col-md-3">
                    <div style={{ background: `${colors[i]}10`, borderRadius: "10px", padding: "10px 14px", border: `1px solid ${colors[i]}25`, textAlign: "center" }}>
                      <p style={{ margin: "0 0 2px", fontSize: "11px", fontWeight: "700", color: colors[i], textTransform: "uppercase" }}>{s}</p>
                      <p style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: colors[i], lineHeight: 1 }}>{deviceStateCounts[s]}</p>
                      <p style={{ margin: 0, fontSize: "11px", color: "#aaa" }}>devices</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        */}

        <div className="row g-3" style={{ marginBottom: "32px" }}>

          <div className="col-md-5">
            <div style={card}>
              <h5 style={{ margin: "0 0 4px", fontWeight: "700", fontSize: "15px", color: "#1a1a1a" }}>
                Transition Matrix Editor
              </h5>
              <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#aaa" }}>Each row must sum to 1.0</p>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "6px 8px", textAlign: "left", color: "#888", fontWeight: "600", fontSize: "11px" }}>From \ To</th>
                      {markovStates.map((s) => (
                        <th key={s} style={{ padding: "6px 8px", textAlign: "center", color: ACCENT, fontWeight: "700", fontSize: "12px" }}>{s}</th>
                      ))}
                      <th style={{ padding: "6px 8px", textAlign: "center", color: "#aaa", fontWeight: "600", fontSize: "11px" }}>Sum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {markovStates.map((fromState, ri) => {
                      const rowSum = matrix[ri].reduce((a, b) => a + b, 0);
                      const valid  = Math.abs(rowSum - 1) < 0.01;
                      return (
                        <tr key={fromState} style={{ borderTop: "1px solid #f0eef8" }}>
                          <td style={{ padding: "8px", fontWeight: "700", color: "#1a1a1a", fontSize: "12px" }}>{fromState}</td>
                          {matrix[ri].map((val, ci) => (
                            <td key={ci} style={{ padding: "4px" }}>
                              <input
                                type="number" step="0.01" min="0" max="1" value={val}
                                onChange={(e) => handleCellChange(ri, ci, e.target.value)}
                                style={{ width: "58px", padding: "5px 6px", borderRadius: "6px", border: `1.5px solid ${ri === ci ? `${ACCENT}44` : "#e0dcea"}`, fontSize: "12px", textAlign: "center", outline: "none", background: ri === ci ? `${ACCENT}08` : "white" }}
                              />
                            </td>
                          ))}
                          <td style={{ padding: "8px", textAlign: "center", fontWeight: "700", fontSize: "12px", color: valid ? GREEN : "#c03030" }}>
                            {rowSum.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Steady-state probabilities */}
          <div className="col-md-7">
            <div style={{ ...card, marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <h5 style={{ margin: 0, fontWeight: "700", fontSize: "15px", color: "#1a1a1a" }}>
                  Long-Run Steady-State Probabilities
                </h5>
                {/* COMMENTED OUT — "From real devices" badge, re-enable when /markov endpoint exists
                {devicesOnline && (
                  <span style={{ fontSize: "11px", fontWeight: "600", color: GREEN, background: "#e8f5ee", padding: "3px 8px", borderRadius: "6px" }}>
                    From real devices
                  </span>
                )}
                */}
              </div>
              <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#aaa" }}>
                Computed after 1000 iterations — represents long-term device behavior
              </p>
              <div className="row g-3" style={{ marginBottom: "16px" }}>
                {steadyData.map((d, i) => {
                  const colors = [GREEN, ACCENT, GOLD, "#c03030"];
                  return (
                    <div key={d.state} className="col-6 col-md-3">
                      <div style={{ background: `${colors[i]}10`, borderRadius: "12px", padding: "14px", border: `1px solid ${colors[i]}25`, textAlign: "center" }}>
                        <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "700", color: colors[i], textTransform: "uppercase", letterSpacing: "0.05em" }}>{d.state}</p>
                        <p style={{ margin: 0, fontSize: "28px", fontWeight: "800", color: colors[i], lineHeight: 1 }}>{d.probability}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e8e4f0" />
                  <PolarAngleAxis dataKey="state" tick={{ fontSize: 12, fontWeight: "600", fill: "#555" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 50]} tick={{ fontSize: 10, fill: "#aaa" }} />
                  <Radar name="Steady State %" dataKey="value" stroke={ACCENT} fill={ACCENT} fillOpacity={0.18} strokeWidth={2} />
                  <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e0dcea", fontSize: "13px" }} formatter={(v) => `${v}%`} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        <SectionHeader
          title="Simulation Engine"
          subtitle="Run 5 scenario simulations and compare response time, utilization, energy consumption, and stability"
          icon={Zap}
          color={GOLD}
        />

        <div className="row g-3">

          <div className="col-md-4">
            <div style={card}>
              <h5 style={{ margin: "0 0 16px", fontWeight: "700", fontSize: "15px", color: "#1a1a1a" }}>
                Simulation Parameters
              </h5>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
                <div>
                  <p style={{ margin: "0 0 6px", fontSize: "13px", fontWeight: "600", color: "#444" }}>Scenario</p>
                  <select style={inputStyle} value={simMode} onChange={(e) => setSimMode(e.target.value)}>
                    <option value="normal">Normal Usage</option>
                    <option value="peak">Peak Usage</option>
                    <option value="energy">Energy Saving Mode</option>
                    <option value="sensor">Sensor Failure</option>
                    <option value="emergency">Emergency Alert</option>
                  </select>
                </div>
                <div>
                  <p style={{ margin: "0 0 6px", fontSize: "13px", fontWeight: "600", color: "#444" }}>Duration (hours): {simHours}h</p>
                  <input type="range" min="1" max="24" value={simHours}
                    onChange={(e) => setSimHours(Number(e.target.value))}
                    style={{ width: "100%", accentColor: GOLD }} />
                </div>
                <div>
                  <p style={{ margin: "0 0 6px", fontSize: "13px", fontWeight: "600", color: "#444" }}>
                    Number of Devices: {simDevices}
                    {devicesOnline && (
                      <span style={{ fontSize: "11px", color: GREEN, marginLeft: "6px" }}>
                        ({devices.length} real)
                      </span>
                    )}
                  </p>
                  <input type="range" min="1" max="20" value={simDevices}
                    onChange={(e) => setSimDevices(Number(e.target.value))}
                    style={{ width: "100%", accentColor: GOLD }} />
                </div>
                <div style={{ padding: "10px 14px", background: "#fafae8", borderRadius: "8px", border: "1px solid #e0de80", fontSize: "12px", color: "#888" }}>
                  Using λ = <strong style={{ color: GOLD }}>{lambdaValues[selectedEvent]}</strong> · {simDevices} devices · {simHours}h
                  {devicesOnline && (
                    <span style={{ display: "block", marginTop: "4px", color: GREEN }}>
                      Device count from your {devices.length} real devices
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleRunSimulation}
                disabled={running}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "11px", borderRadius: "10px", border: "none", background: running ? "#e0dcea" : `linear-gradient(135deg, ${GREEN}, #2e8b57)`, color: "white", fontSize: "14px", fontWeight: "700", cursor: running ? "not-allowed" : "pointer", transition: "all 0.2s ease" }}>
                {running
                  ? <><RotateCcw size={15} style={{ animation: "spin 1s linear infinite" }} /> Running...</>
                  : <><Play size={15} /> Run Simulation</>}
              </button>
            </div>
          </div>


          <div className="col-md-8">
            {results.length === 0 ? (
              <div style={{ ...card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "260px", color: "#aaa" }}>
                <Play size={40} color="#e0dcea" strokeWidth={1.5} />
                <p style={{ margin: "12px 0 4px", fontWeight: "600", fontSize: "15px" }}>No simulations run yet</p>
                <p style={{ margin: 0, fontSize: "13px" }}>Configure parameters and click Run Simulation</p>
              </div>
            ) : (
              <>
                <div className="row g-3" style={{ marginBottom: "16px" }}>
                  {[
                    { label: "Avg Response Time", value: `${results[0].avgResponseTime} ms`, color: ACCENT },
                    { label: "Device Utilization", value: `${(results[0].utilization * 100).toFixed(1)}%`, color: GREEN },
                    { label: "Energy Consumed",    value: `${results[0].energyKwh} kWh`,     color: GOLD },
                    { label: "System Stability",   value: `${results[0].stability}%`, color: parseFloat(results[0].stability) > 80 ? GREEN : "#c03030" },
                  ].map((stat, i) => (
                    <div key={i} className="col-6">
                      <div style={{ ...card, padding: "16px 18px" }}>
                        <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</p>
                        <p style={{ margin: "0 0 2px", fontSize: "24px", fontWeight: "800", color: stat.color, lineHeight: 1 }}>{stat.value}</p>
                        <p style={{ margin: 0, fontSize: "11px", color: "#aaa" }}>{results[0].label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {comparisonData && (
                  <div style={card}>
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
                        <Bar dataKey="stability"    name="Stability (%)" fill={GREEN}  radius={[4, 4, 0, 0]} maxBarSize={32} />
                        <Bar dataKey="utilization"  name="Utilization (%)" fill={GOLD} radius={[4, 4, 0, 0]} maxBarSize={32} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div style={{ ...card, marginTop: "16px", padding: "16px 20px" }}>
                  <h5 style={{ margin: "0 0 12px", fontWeight: "700", fontSize: "14px", color: "#1a1a1a" }}>Run History</h5>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {results.map((r, i) => (
                      <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: i === 0 ? "#f0faf4" : "#fafafa", borderRadius: "8px", border: `1px solid ${i === 0 ? "#c2e0cf" : "#f0eef8"}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <CheckCircle size={14} color={i === 0 ? GREEN : "#aaa"} />
                          <span style={{ fontSize: "13px", fontWeight: "600", color: "#1a1a1a" }}>{r.label}</span>
                        </div>
                        <div style={{ display: "flex", gap: "16px" }}>
                          <span style={{ fontSize: "12px", color: "#777" }}>{r.avgResponseTime}ms</span>
                          <span style={{ fontSize: "12px", color: "#777" }}>{r.energyKwh} kWh</span>
                          <span style={{ fontSize: "12px", fontWeight: "700", color: parseFloat(r.stability) > 80 ? GREEN : "#c03030" }}>{r.stability}% stable</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      <style jsx>{`
        h5 { font-size: 1rem; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </Layout>
  );
};

export default ModelingSimulation;