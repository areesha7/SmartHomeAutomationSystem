import React, { useState } from "react";
import Layout from "../Components/Layout";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { Zap, Calendar, Target, Settings, Lightbulb, Clock } from "lucide-react";

class EnergyStrategy {
  calculate(data) { return 0; }
}
class TotalKwhStrategy extends EnergyStrategy {
  calculate(data) { return data.reduce((sum, d) => sum + d.kwh, 0).toFixed(1); }
}
class AverageDailyStrategy extends EnergyStrategy {
  calculate(data) { return (data.reduce((sum, d) => sum + d.kwh, 0) / data.length).toFixed(1); }
}

const weeklyData = [
  { day: "Mon", kwh: 24.3 },
  { day: "Tue", kwh: 26.1 },
  { day: "Wed", kwh: 22.8 },
  { day: "Thu", kwh: 29.4 },
  { day: "Fri", kwh: 23.6 },
  { day: "Sat", kwh: 31.2 },
  { day: "Sun", kwh: 30.9 },
];

const deviceData = [
  { name: "Heating/Cooling", value: 42, color: "#63a17f" },
  { name: "Appliances",      value: 15, color: "#CDCC58" },
  { name: "Lighting",        value: 18, color: "#2e8b57" },
  { name: "Entertainment",   value: 14, color: "#5c35b0" },
  { name: "Other",           value: 11, color: "#b8d4c4" },
];

const tips = [
  {
    icon: Zap,
    title: "Optimize Thermostat",
    desc: "Reduce heating/cooling by 2°F when away to save up to 10% monthly",
    bg: "#f0faf4", iconBg: "#d4f0e0", iconColor: "#2e8b57",
  },
  {
    icon: Lightbulb,
    title: "LED Lighting",
    desc: "Switching to LED bulbs could save 75% on lighting costs",
    bg: "#f5f4e0", iconBg: "#eeecb0", iconColor: "#9a9800",
  },
  {
    icon: Clock,
    title: "Peak Hours",
    desc: "Use appliances during off-peak hours (10 PM – 6 AM) for lower rates",
    bg: "#f2f0fa", iconBg: "#e0d8f5", iconColor: "#5c35b0",
  },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "white", borderRadius: "10px", padding: "10px 16px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.13)", border: "1px solid #e0ece6",
      }}>
        <p style={{ margin: "0 0 4px", fontWeight: "700", color: "#1a1a1a" }}>{label}</p>
        <p style={{ margin: 0, color: "#63a17f", fontWeight: "600", fontSize: "14px" }}>
          Usage (kWh) : {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const [limit,     setLimit]    = useState(750);
  const [editing,   setEditing]  = useState(false);
  const [tempLimit, setTempLimit] = useState(750);

  const totalKwh  = new TotalKwhStrategy().calculate(weeklyData);
  const dailyAvg  = new AverageDailyStrategy().calculate(weeklyData);

  const monthKwh   = 623;
  const budgetUsed = Math.round((monthKwh / limit) * 100);
  const progressPct = Math.min((monthKwh / limit) * 100, 100);

  const statCards = [
    {
      label: "This Month", value: "623 kWh", sub: "16.7% vs last month",
      subColor: "#2e8b57", icon: Zap, iconColor: "#63a17f",
      bg: "#f0faf4", border: "#c2e0cf",
    },
    {
      label: "Daily Average", value: `${dailyAvg} kWh`, sub: "This week",
      subColor: "#5c35b0", icon: Calendar, iconColor: "#5c35b0",
      bg: "#f2f0fa", border: "#d4c8f0",
    },
    {
      label: "Weekly Total", value: `${totalKwh} kWh`, sub: "Mon – Sun",
      subColor: "#9a9800", icon: Zap, iconColor: "#CDCC58",
      bg: "#fafae8", border: "#e0e080",
    },
    {
      label: "Budget Used", value: `${budgetUsed}%`, sub: `${monthKwh}/${limit} kWh`,
      subColor: "#2e8b57", icon: Target, iconColor: "#63a17f",
      bg: "#f0faf4", border: "#c2e0cf",
    },
  ];

  const card = {
    background: "white",
    borderRadius: "14px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.06)",
    padding: "24px",
  };

  return (
    <Layout>
      <div className="p-4">

        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ margin: "0 0 4px", fontWeight: "800", fontSize: "22px", color: "#1a1a1a" }}>
            Energy Analytics
          </h2>
          <p style={{ margin: 0, fontSize: "14px", color: "#777" }}>
            Monitor and optimize your energy consumption
          </p>
        </div>

        <div className="row g-3" style={{ marginBottom: "24px" }}>
          {statCards.map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} className="col-md-3 col-sm-6">
                <div style={{
                  background: c.bg, borderRadius: "14px", padding: "18px 20px",
                  border: `1px solid ${c.border}`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 24px rgba(0,0,0,0.10)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)"; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#555" }}>{c.label}</span>
                    <Icon size={18} color={c.iconColor} strokeWidth={2} />
                  </div>
                  <div style={{ fontSize: "26px", fontWeight: "800", color: "#1a1a1a", lineHeight: 1.1, marginBottom: "8px" }}>
                    {c.value}
                  </div>
                  <div style={{ fontSize: "12px", color: c.subColor, fontWeight: "500" }}>{c.sub}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ ...card, marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
            <div>
              <h5 style={{ margin: "0 0 4px", fontWeight: "700", fontSize: "17px", color: "#1a1a1a" }}>
                Monthly Usage Limit
              </h5>
              <p style={{ margin: 0, fontSize: "13px", color: "#888" }}>
                Set a monthly energy consumption goal
              </p>
            </div>
            {editing ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="number"
                  value={tempLimit}
                  onChange={e => setTempLimit(Number(e.target.value))}
                  style={{
                    width: "90px", padding: "6px 10px", borderRadius: "8px",
                    border: "1.5px solid #a8d4b8", fontSize: "14px", fontWeight: "600",
                    outline: "none", color: "#1a1a1a",
                  }}
                />
                <button
                  onClick={() => { setLimit(tempLimit); setEditing(false); }}
                  style={{
                    background: "#63a17f", color: "white", border: "none",
                    borderRadius: "8px", padding: "6px 14px", fontSize: "13px",
                    fontWeight: "600", cursor: "pointer",
                  }}>
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  style={{
                    background: "#f0f0f0", color: "#555", border: "none",
                    borderRadius: "8px", padding: "6px 12px", fontSize: "13px",
                    fontWeight: "600", cursor: "pointer",
                  }}>
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setTempLimit(limit); setEditing(true); }}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  background: "white", border: "1.5px solid #e0e0e0",
                  borderRadius: "8px", padding: "7px 14px", cursor: "pointer",
                  fontSize: "13px", fontWeight: "600", color: "#444",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#63a17f"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#e0e0e0"}
              >
                <Settings size={14} color="#666" strokeWidth={2} /> Edit
              </button>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", color: "#555" }}>Current limit</span>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#1a1a1a" }}>{limit} kWh</span>
          </div>
          <div style={{ height: "14px", background: "#e8f0eb", borderRadius: "10px", overflow: "hidden", marginBottom: "8px" }}>
            <div style={{
              height: "100%", width: `${progressPct}%`,
              background: "linear-gradient(90deg, #63a17f, #2e8b57)",
              borderRadius: "10px",
              transition: "width 0.6s ease",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#999" }}>
            <span>0 kWh</span>
            <span style={{ color: "#2e8b57", fontWeight: "600" }}>{monthKwh} kWh used</span>
            <span>{limit} kWh</span>
          </div>
        </div>

        <div style={{ ...card, marginBottom: "24px" }}>
          <h5 style={{ margin: "0 0 4px", fontWeight: "700", fontSize: "17px", color: "#1a1a1a" }}>
            This Week's Usage
          </h5>
          <div style={{ marginBottom: "20px" }}>
            <span style={{ fontSize: "13px", color: "#555" }}>Total: <strong>{totalKwh} kWh</strong></span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8f0eb" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: "#888" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#aaa" }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,161,127,0.08)" }} />
              <Legend iconType="square" wrapperStyle={{ fontSize: "13px", paddingTop: "16px" }} />
              <Bar dataKey="kwh" name="Usage (kWh)" fill="#63a17f" radius={[5, 5, 0, 0]} maxBarSize={52} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="row g-3">

          <div className="col-md-6">
            <div style={{ ...card, height: "100%" }}>
              <h5 style={{ margin: "0 0 20px", fontWeight: "700", fontSize: "17px", color: "#1a1a1a" }}>
                Usage by Device Type
              </h5>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name} ${value}%`}
                    labelLine={true}
                  >
                    {deviceData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `${val}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-md-6">
            <div style={{ ...card, height: "100%" }}>
              <h5 style={{ margin: "0 0 20px", fontWeight: "700", fontSize: "17px", color: "#1a1a1a" }}>
                Energy Saving Tips
              </h5>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {tips.map((tip, i) => {
                  const Icon = tip.icon;
                  return (
                    <div key={i} style={{
                      background: tip.bg, borderRadius: "12px", padding: "14px 16px",
                      display: "flex", alignItems: "flex-start", gap: "14px",
                      transition: "transform 0.2s ease",
                    }}
                      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                    >
                      <div style={{
                        width: "38px", height: "38px", borderRadius: "10px",
                        background: tip.iconBg, display: "flex", alignItems: "center",
                        justifyContent: "center", flexShrink: 0,
                      }}>
                        <Icon size={18} color={tip.iconColor} strokeWidth={2} />
                      </div>
                      <div>
                        <p style={{ margin: "0 0 4px", fontWeight: "700", fontSize: "14px", color: "#1a1a1a" }}>
                          {tip.title}
                        </p>
                        <p style={{ margin: 0, fontSize: "12.5px", color: "#666", lineHeight: 1.5 }}>
                          {tip.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        h5 { font-size: 1.1rem; }
      `}</style>

    </Layout>
  );
};

export default Analytics;