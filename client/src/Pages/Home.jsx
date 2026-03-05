import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/noBgLogo.png";
import Layout from "../Components/Layout";

/*  OBSERVER PATTERN  */
class Observable {
  constructor(value) {
    this.value = value;
    this.observers = [];
  }

  subscribe(fn) {
    this.observers.push(fn);
  }

  notify() {
    this.observers.forEach(fn => fn(this.value));
  }

  setValue(newValue) {
    this.value = newValue;
    this.notify();
  }

  getValue() {
    return this.value;
  }
}

/*  COMMAND PATTERN  */
class Command {
  constructor(execute) {
    this.execute = execute;
  }
}

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [animateStats, setAnimateStats] = useState(false);
  const [stats, setStats] = useState({
    totalDevices: 24,
    activeDevices: 18,
    lightsOn: 7,
    averageTemp: 22.5,
    doorsLocked: 4,
    totalDoors: 6
  });

  const homeStats = new Observable(stats);

  useEffect(() => {
    setAnimateStats(true);
    homeStats.subscribe(updatedStats => setStats(updatedStats));
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const commands = {
    allLightsOn: new Command(() => homeStats.setValue({ ...stats, lightsOn: stats.totalDevices })),
    allLightsOff: new Command(() => homeStats.setValue({ ...stats, lightsOn: 0 })),
    lockAllDoors: new Command(() => homeStats.setValue({ ...stats, doorsLocked: stats.totalDoors })),
    setTemp22: new Command(() => homeStats.setValue({ ...stats, averageTemp: 22 }))
  };

  const rooms = [
    { name: "Living Room", devices: 8 },
    { name: "Kitchen", devices: 6 },
    { name: "Bedroom", devices: 5 },
    { name: "Bathroom", devices: 3 },
    { name: "Home Office", devices: 4 }
  ];

  const quickActions = [
    {label:"All Lights On", color:"#4CAF50", icon:"fa-lightbulb", cmd: commands.allLightsOn},
    {label:"All Lights Off", color:"#E53935", icon:"fa-lightbulb", cmd: commands.allLightsOff},
    {label:"Lock All Doors", color:"#4CAF50", icon:"fa-lock", cmd: commands.lockAllDoors},
    {label:"Set to 22°C", color:"#FDD835", icon:"fa-temperature-high", cmd: commands.setTemp22}
  ];

  return (
    <Layout>
    <div className="dashboard-wrapper">


      <div className="d-flex">

        <div className="flex-grow-1 p-4 main-content">

          <div className="mb-4 fade-in">
            <h1 className="display-6 fw-semibold">Welcome home, Areesha! 👋</h1>
            <p className="text-muted">Here's what's happening in your home today.</p>
          </div>

          <div className="row mb-4">
            {[
              { title:"Active Devices", value:stats.activeDevices, sub:`out of ${stats.totalDevices} total devices`, color:"#541a5c", gradient:["#e3cceb","#d6b2e6"], icon:"fa-bolt" },
              { title:"Lights On", value:stats.lightsOn, sub:"lights active", color:"#5c5b1a", gradient:["#e3f1a5","#cddc39"], icon:"fa-lightbulb" },
              { title:"Avg Temperature", value:`${stats.averageTemp}°C`, sub:"across all rooms", color:"#1a5c38", gradient:["#c9ebc1","#a3d9a5"], icon:"fa-temperature-high" },
              { title:"Doors Locked", value:stats.doorsLocked, sub:"doors locked", color:"#1a2c5c", gradient:["#c9dbeb","#a3c4eb"], icon:"fa-lock" }
            ].map((card,index)=>(
              <div key={index} className="col-md-3 col-sm-6 mb-3">
                <div className="card stat-card" style={{ background: `linear-gradient(135deg, ${card.gradient[0]}, ${card.gradient[1]})` }}>
                  <div className="card-body">
                    <h6 className="mb-2" style={{ color: card.color }}>
                      {card.title} <i className={`fas ${card.icon}`} style={{ color: card.color }}></i>
                    </h6>
                    <h3 className={`mb-0 stat-number ${animateStats ? "animate-number" : ""}`} style={{ color: card.color }}>
                      {card.value}
                    </h3>
                    <h6 className="small mb-0" style={{ color: card.color }}>{card.sub}</h6>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <h5 className="mb-3 fw-semibold">Quick Actions</h5>
            <div className="row">
              {quickActions.map((btn,i)=>(
                <div key={i} className="col-md-3 col-6 mb-2">
                  <button 
                    className="btn action-btn w-100 py-3" 
                    style={{ 
                      border: `2px solid ${btn.color}`,
                      background: "white"
                    }} 
                    onClick={() => btn.cmd.execute()}
                  >
                    <i className={`fas ${btn.icon}`} style={{ color: btn.color, fontSize: "1.2rem" }}></i>
                    <h6 className="mb-0 mt-1" style={{color: btn.color}}>{btn.label}</h6>
                  </button>
                </div>
              ))}
            </div>
          </div>

 
          <div>
            <h5 className="mb-3 fw-semibold">Your Rooms</h5>
            <div className="row">
              {rooms.map((room,index)=>(
                <div key={index} className="col-md-4 mb-3">
                  <div className="card border-0 shadow-sm h-100 room-card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="mb-0">{room.name} 🛋️</h6>
                      </div>
                      <p className="text-muted small mb-2">{room.devices} devices</p>
                      <button className="btn btn-sm btn-outline-primary mt-3 w-100">View Room</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-wrapper { 
          background: linear-gradient(135deg, #f8f9fa, #eef3f7); 
          min-height: 100vh; 
        }
        
        .fade-in { 
          animation: fadeUp 0.6s ease forwards; 
        }
        
        @keyframes fadeUp { 
          from { opacity:0; transform:translateY(10px); } 
          to { opacity:1; transform:translateY(0); } 
        }

        .sidebar { 
          transition: width 0.4s ease; 
          background: linear-gradient(180deg, #CDCC58, #b8b742); 
        }

        .custom-nav-link {
          transition: all 0.3s ease;
          border-radius: 5px;
          padding: 8px 12px;
        }
        
        .custom-nav-link:hover {
          background-color: #63a17f !important;
          color: white !important;
        }

        .stat-card { 
          border-radius: 14px; 
          box-shadow: 0 6px 18px rgba(0,0,0,0.06); 
          transition: transform 0.4s ease, box-shadow 0.4s ease; 
          border: none;
        }
        
        .stat-card:hover { 
          transform: translateY(-8px); 
          box-shadow: 0 14px 28px rgba(0,0,0,0.12); 
        }

        .stat-number { 
          transition: all 0.4s ease; 
        }
        
        .animate-number { 
          animation: pulseNumber 0.4s ease; 
        }
        
        @keyframes pulseNumber { 
          0% { transform: scale(0.95); opacity:0.7; } 
          100% { transform: scale(1); opacity:1; } 
        }

        .action-btn { 
          border-radius:12px; 
          box-shadow: 0 6px 15px rgba(0,0,0,0.05); 
          transition: transform 0.3s ease, box-shadow 0.3s ease; 
        }
        
        .action-btn:hover { 
          transform: translateY(-4px); 
          box-shadow: 0 12px 25px rgba(0,0,0,0.12); 
        }

        .room-card { 
          border-radius:12px; 
          transition: transform 0.3s ease, box-shadow 0.3s ease; 
        }
        
        .room-card:hover { 
          transform: translateY(-6px); 
          box-shadow: 0 12px 28px rgba(0,0,0,0.12); 
        }

        .logo-wrapper { 
          padding:6px 18px; 
          border-radius:12px; 
          backdrop-filter: blur(6px); 
        }

        .logo-img {
          height: 56px;
          width: auto;
          object-fit: contain;
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.25));
          transition: transform 0.3s ease;
        }

        .logo-img:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
    </Layout>
  );
};

export default Dashboard;