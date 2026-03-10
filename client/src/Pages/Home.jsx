
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Zap, Lightbulb, Thermometer, Lock, Power, ChevronRight,
  Sofa, ChefHat, Bed, Bath, Briefcase, Car,
  Droplets, TrendingUp, Shield, BatteryLow, Bell, Wifi, Sun,
  Activity, Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../Components/Layout";

/* 
   FACTORY PATTERN */
class RoomFactory {
  static createRoom(id, type, temperature, humidity, devices) {
    const iconMap = { living:Sofa,kitchen:ChefHat,bedroom:Bed,bathroom:Bath,office:Briefcase,garage:Car,dining:Sofa,guest:Bed,balcony:Car,laundry:Bath };
    const nameMap = { living:"Living Room",kitchen:"Kitchen",bedroom:"Bedroom",bathroom:"Bathroom",office:"Home Office",garage:"Garage",dining:"Dining Room",guest:"Guest Room",balcony:"Balcony",laundry:"Laundry Room" };
    return { id, name:nameMap[type], icon:iconMap[type], temperature, humidity, devices };
  }
}
export const rooms = [
  RoomFactory.createRoom("1","living","23°C","45%",8),
  RoomFactory.createRoom("2","kitchen","22°C","50%",6),
  RoomFactory.createRoom("3","bedroom","21°C","42%",5),
  RoomFactory.createRoom("4","bathroom","24°C","60%",3),
  RoomFactory.createRoom("5","office","22°C","40%",4),
  RoomFactory.createRoom("6","garage","19°C","55%",2),
  RoomFactory.createRoom("7","dining","23°C","48%",4),
  RoomFactory.createRoom("8","guest","22°C","43%",3),
  RoomFactory.createRoom("9","balcony","26°C","65%",2),
  RoomFactory.createRoom("10","laundry","24°C","58%",3),
];

/* 
   OBSERVER PATTERN  (Dashboard event bus)
 */
class DashboardObserver {
  constructor() { this._listeners = {}; }
  subscribe(event, fn)   { if (!this._listeners[event]) this._listeners[event]=[]; this._listeners[event].push(fn); }
  unsubscribe(event, fn) { if (this._listeners[event]) this._listeners[event]=this._listeners[event].filter(l=>l!==fn); }
  notify(event, data)    { (this._listeners[event]||[]).forEach(fn=>fn(data)); }
}
const dashboardBus = new DashboardObserver();

/* 
   COMMAND PATTERN  (execute + undo support)
 */
class Command { execute(){} undo(){} }
class LightsOnCommand  extends Command { constructor(s,p){super();this._s=s;this._p=p;} execute(){this._s(x=>({...x,lightsOn:x.totalDevices}));dashboardBus.notify("lights",{state:"on"});} undo(){this._s(x=>({...x,lightsOn:this._p}));} }
class LightsOffCommand extends Command { constructor(s,p){super();this._s=s;this._p=p;} execute(){this._s(x=>({...x,lightsOn:0}));dashboardBus.notify("lights",{state:"off"});} undo(){this._s(x=>({...x,lightsOn:this._p}));} }
class LockAllCommand   extends Command { constructor(s,p){super();this._s=s;this._p=p;} execute(){this._s(x=>({...x,doorsLocked:x.totalDoors}));dashboardBus.notify("doors",{state:"locked"});} undo(){this._s(x=>({...x,doorsLocked:this._p}));} }
class SetTempCommand   extends Command { constructor(s,t,p){super();this._s=s;this._t=t;this._p=p;} execute(){this._s(x=>({...x,averageTemp:this._t}));dashboardBus.notify("temp",{value:this._t});} undo(){this._s(x=>({...x,averageTemp:this._p}));} }

/*  Static data  */
const initialDevices = [
  {id:1,name:"Ceiling Light",          room:"Living Room",icon:Lightbulb,  type:"toggle",    isOn:true, brightness:80},
  {id:2,name:"Table Lamp",             room:"Living Room",icon:Sun,         type:"toggle",    isOn:false,brightness:null},
  {id:3,name:"Living Room Thermostat", room:"Living Room",icon:Thermometer, type:"thermostat",current:72,target:72},
  {id:4,name:"Security Camera",        room:"Living Room",icon:Shield,      type:"status",    status:"Recording",statusColor:"#2e8b57"},
  {id:5,name:"Smart Plug",             room:"Living Room",icon:Zap,         type:"toggle",    isOn:true, brightness:null},
  {id:6,name:"Main Light",             room:"Bedroom",    icon:Lightbulb,   type:"toggle",    isOn:false,brightness:null},
];
const systemAlerts = [
  {id:1,icon:BatteryLow,label:"Low Battery",    detail:"Front Door Lock — 12%",       color:"#b8860b"},
  {id:2,icon:Wifi,      label:"Device Offline", detail:"Garage Sensor disconnected",  color:"#c03030"},
  {id:3,icon:Bell,      label:"Motion Detected",detail:"Backyard Camera — 2 min ago", color:"#2e8b57"},
];
const energyDays = [
  {day:"Mon",kwh:18},{day:"Tue",kwh:22},{day:"Wed",kwh:19},
  {day:"Thu",kwh:25},{day:"Fri",kwh:21},{day:"Sat",kwh:24.3},{day:"Sun",kwh:17},
];

/*  Live clock  */
function useClock() {
  const [t,setT] = useState(new Date());
  useEffect(()=>{const id=setInterval(()=>setT(new Date()),1000);return()=>clearInterval(id);},[]);
  return t;
}

const SectionHeader = ({ title, right }) => (
  <div style={{ marginBottom:"20px" }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
      <span style={{
        fontSize:"11px", fontWeight:"700", letterSpacing:"0.12em",
        textTransform:"uppercase", color:"#5c35b0",
      }}>{title}</span>
      {right}
    </div>
    <div style={{ height:"1px", background:"linear-gradient(90deg, rgba(92,53,176,0.25) 0%, rgba(92,53,176,0.06) 100%)" }} />
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const now      = useClock();

  const P      = "#2e8b57";
  const PURPLE = "#5c35b0";
  const GOLD   = "#b8860b";
  const TEAL   = "#187070";

  const [stats, setStats]         = useState({totalDevices:24,activeDevices:18,lightsOn:7,averageTemp:22.5,doorsLocked:4,totalDoors:6});
  const [devices, setDevices]     = useState(initialDevices);
  const [thermoTarget, setThermo] = useState(72);
  const [activeAction, setActive] = useState(null);
  const [cmdHistory, setCmdHist]  = useState([]);

  /* Observer subscriptions */
  useEffect(() => {
    const onL = d => console.log("[Observer] Lights →", d.state);
    const onD = d => console.log("[Observer] Doors →",  d.state);
    const onT = d => console.log("[Observer] Temp →",   d.value);
    dashboardBus.subscribe("lights", onL);
    dashboardBus.subscribe("doors",  onD);
    dashboardBus.subscribe("temp",   onT);
    return () => {
      dashboardBus.unsubscribe("lights",onL);
      dashboardBus.unsubscribe("doors",onD);
      dashboardBus.unsubscribe("temp",onT);
    };
  }, []);

  const toggleDevice = id =>
    setDevices(prev => prev.map(d => d.id===id && d.type==="toggle" ? {...d,isOn:!d.isOn} : d));

  const runCommand = (cmd, key) => {
    cmd.execute();
    setCmdHist(h=>[...h,cmd]);
    setActive(key);
    setTimeout(()=>setActive(null), 700);
  };

  const quickActions = [
    {key:"lon",label:"All Lights On",  icon:Lightbulb,  accent:GOLD,   cmd:()=>new LightsOnCommand(setStats,stats.lightsOn)},
    {key:"lof",label:"All Lights Off", icon:Power,       accent:PURPLE, cmd:()=>new LightsOffCommand(setStats,stats.lightsOn)},
    {key:"lck",label:"Lock All Doors", icon:Lock,        accent:TEAL,   cmd:()=>new LockAllCommand(setStats,stats.doorsLocked)},
    {key:"tmp",label:"Set to 22°C",    icon:Thermometer, accent:P,      cmd:()=>new SetTempCommand(setStats,22,stats.averageTemp)},
  ];

  const statCards = [
    {title:"Active Devices",  value:stats.activeDevices,                        suffix:"",   sub:`of ${stats.totalDevices} total`, icon:Zap,         accent:PURPLE},
    {title:"Lights On",       value:stats.lightsOn,                             suffix:"",   sub:"currently active",               icon:Lightbulb,   accent:GOLD},
    {title:"Avg Temperature", value:stats.averageTemp,                          suffix:"°C", sub:"across all rooms",               icon:Thermometer, accent:P},
    {title:"Doors Locked",    value:`${stats.doorsLocked}/${stats.totalDoors}`, suffix:"",   sub:"perimeter secured",              icon:Lock,        accent:TEAL},
  ];

  const maxKwh         = Math.max(...energyDays.map(d=>d.kwh));
  const dashboardRooms = rooms.slice(0,6);
  const fmt     = d => d.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
  const fmtDate = d => d.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
  const hour    = now.getHours();
  const greeting = hour<12?"Good Morning":hour<17?"Good Afternoon":"Good Evening";

  const card = {
    background:"white",
    borderRadius:"14px",
    boxShadow:"0 6px 15px rgba(0,0,0,0.06)",
  };

  const fade = (i, base=0.1) => ({
    initial:{opacity:0,y:16},
    animate:{opacity:1,y:0},
    transition:{delay:base+i*0.07,duration:0.4,ease:[0.25,0.1,0.25,1]},
  });

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@300;400;500;600&display=swap');
        .hq * { box-sizing:border-box; }
        .hq, .hq button { font-family:'Inter',sans-serif; }

        /* Card hover — identical to Rooms.jsx .room-card:hover */
        .hq-card { transition:all 0.3s ease; }
        .hq-card:hover { transform:translateY(-5px); box-shadow:0 12px 28px rgba(0,0,0,0.12) !important; }

        .hq-action { transition:all 0.25s ease; }
        .hq-action:hover { transform:translateY(-3px); box-shadow:0 10px 24px rgba(0,0,0,0.10) !important; }
        .hq-action:hover .hq-icon { transform:scale(1.1); }
        .hq-icon { transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1); }

        .hq-toggle-track { transition:background 0.3s ease, box-shadow 0.3s ease; }
        .hq-toggle-thumb { transition:left 0.28s cubic-bezier(0.34,1.56,0.64,1); }

        .hq-viewall { transition:background 0.2s ease; }
        .hq-viewall:hover { background:rgba(46,139,87,0.10) !important; }
      `}</style>

      <div className="hq" style={{minHeight:"100vh",background:"transparent",padding:"28px 32px"}}>
        <div style={{maxWidth:"1200px",margin:"0 auto"}}>


          <motion.div
            initial={{opacity:0,y:-14}} animate={{opacity:1,y:0}} transition={{duration:0.5,ease:[0.25,0.1,0.25,1]}}
            style={{
              background:"white",
              borderRadius:"14px",
              boxShadow:"0 6px 15px rgba(0,0,0,0.06)",
              border:"1px solid rgba(92,53,176,0.10)",
              padding:"0",
              marginBottom:"28px",
              overflow:"hidden",
            }}>
           
            <div style={{height:"3px",background:`linear-gradient(90deg, ${PURPLE}, ${P})`}}/>
            <div style={{padding:"26px 32px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
             
              <div style={{display:"flex",alignItems:"center",gap:"18px"}}>
                <div style={{
                  width:"48px",height:"48px",borderRadius:"12px",
                  background:`linear-gradient(135deg,${PURPLE}22,${P}18)`,
                  border:`1px solid ${PURPLE}25`,
                  display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                }}>
                  <Cpu size={20} color={PURPLE} strokeWidth={1.8}/>
                </div>
                <div>
                  <p style={{margin:"0 0 3px",fontSize:"11px",fontWeight:"600",letterSpacing:"0.1em",textTransform:"uppercase",color:"#9a90b8"}}>
                    {fmtDate(now)}
                  </p>
                  <h1 style={{
                    margin:0,fontSize:"22px",fontWeight:"700",
                    fontFamily:"'Syne',sans-serif",color:"#18103a",lineHeight:1.2,
                  }}>
                    {greeting}, Areesha
                  </h1>
                  <p style={{margin:"4px 0 0",fontSize:"13px",color:"#7a72a0",fontWeight:"400"}}>
                    Here's what's happening in your home today.
                  </p>
                </div>
              </div>

              <div style={{
                textAlign:"right",flexShrink:0,
                paddingLeft:"28px",
                borderLeft:"1px solid rgba(92,53,176,0.10)",
                marginLeft:"24px",
              }}>
                <div style={{
                  fontSize:"34px",fontFamily:"'Syne',sans-serif",fontWeight:"700",
                  letterSpacing:"-1px",lineHeight:1,color:"#18103a",
                }}>
                  {fmt(now)}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"5px",justifyContent:"flex-end",marginTop:"7px"}}>
                  <Sun size={13} color={GOLD} strokeWidth={2}/>
                  <span style={{fontSize:"12px",color:"#9a90b8",fontWeight:"500"}}>Karachi &middot; 31°C &middot; Clear</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div {...fade(0,0.08)} style={{marginBottom:"32px"}}>
            <SectionHeader title="Overview" />
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"14px"}}>
              {statCards.map((c,i) => {
                const Icon = c.icon;
                return (
                  <motion.div key={c.title} {...fade(i,0.12)}
                    className="hq-card"
                    style={{
                      ...card,
                      padding:"20px",
                      borderTop:`2.5px solid ${c.accent}`,
                    }}>
                    <div style={{
                      width:"38px",height:"38px",borderRadius:"10px",
                      background:`${c.accent}14`,border:`1px solid ${c.accent}28`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      marginBottom:"14px",
                    }}>
                      <Icon size={17} color={c.accent} strokeWidth={2}/>
                    </div>
                    <div style={{fontSize:"26px",fontWeight:"700",fontFamily:"'Syne',sans-serif",color:"#18103a",lineHeight:1.1}}>
                      {c.value}{c.suffix}
                    </div>
                    <div style={{fontSize:"12.5px",color:"#2e2550",marginTop:"5px",fontWeight:"500"}}>{c.title}</div>
                    <div style={{fontSize:"11px",color:"#9a90b8",marginTop:"2px"}}>{c.sub}</div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div {...fade(0,0.28)} style={{marginBottom:"32px"}}>
            <SectionHeader title="Quick Actions" />
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"14px"}}>
              {quickActions.map(btn => {
                const Icon = btn.icon;
                const active = activeAction===btn.key;
                return (
                  <motion.button
                    key={btn.key}
                    className="hq-action"
                    whileTap={{scale:0.97}}
                    animate={active?{boxShadow:[`0 0 0 transparent`,`0 0 20px ${btn.accent}45`,`0 0 0 transparent`]}:{}}
                    onClick={()=>runCommand(btn.cmd(), btn.key)}
                    style={{
                      ...card,
                      padding:"20px",
                      border:"none",
                      cursor:"pointer",
                      display:"flex",alignItems:"center",gap:"14px",
                      textAlign:"left",
                      borderLeft:`3px solid ${btn.accent}`,
                    }}>
                    <div className="hq-icon" style={{
                      width:"40px",height:"40px",borderRadius:"10px",
                      background:`${btn.accent}14`,border:`1px solid ${btn.accent}28`,
                      display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                    }}>
                      <Icon size={18} color={btn.accent} strokeWidth={2}/>
                    </div>
                    <span style={{fontSize:"13px",fontWeight:"600",color:"#18103a",lineHeight:1.3}}>{btn.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          <motion.div {...fade(0,0.36)} style={{marginBottom:"32px"}}>
            <SectionHeader title="Recently Used Devices" />
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"14px"}}>
              {devices.map((device,i) => {
                const Icon = device.icon;
                const on = device.type==="toggle" && device.isOn;
                return (
                  <motion.div
                    key={device.id}
                    {...fade(i,0.38)}
                    className="hq-card"
                    style={{
                      ...card,
                      padding:"18px 20px",
                      borderLeft:`3px solid ${on?P:"transparent"}`,
                    }}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"12px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"11px"}}>
                        <motion.div
                          animate={{background:on?`${P}1c`:"#f5f3fb",borderColor:on?`${P}40`:"#ede9f5"}}
                          transition={{duration:0.3}}
                          style={{width:"36px",height:"36px",borderRadius:"9px",border:"1px solid #ede9f5",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          <Icon size={15} color={on?P:"#a09ab8"} strokeWidth={2}/>
                        </motion.div>
                        <div>
                          <p style={{margin:0,fontSize:"13px",fontWeight:"600",color:"#18103a",lineHeight:1.3}}>{device.name}</p>
                          <p style={{margin:0,fontSize:"11px",color:"#9a90b8"}}>{device.room}</p>
                        </div>
                      </div>

                      {device.type==="toggle" && (
                        <label style={{position:"relative",display:"inline-block",width:"42px",height:"23px",cursor:"pointer",flexShrink:0}}>
                          <input type="checkbox" checked={device.isOn} onChange={()=>toggleDevice(device.id)} style={{display:"none"}}/>
                          <span className="hq-toggle-track" style={{position:"absolute",inset:0,borderRadius:"23px",background:device.isOn?`linear-gradient(135deg,${P},#3aad72)`:"#cec9e0",boxShadow:device.isOn?`0 0 8px ${P}50`:undefined}}/>
                          <span className="hq-toggle-thumb" style={{position:"absolute",width:"17px",height:"17px",background:"white",borderRadius:"50%",top:"3px",left:device.isOn?"22px":"3px",boxShadow:"0 1px 4px rgba(0,0,0,0.18)"}}/>
                        </label>
                      )}

                      {device.type==="thermostat" && (
                        <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                          <button onClick={()=>setThermo(t=>t-1)} style={{width:"24px",height:"24px",borderRadius:"50%",border:`1px solid ${TEAL}40`,background:`${TEAL}12`,cursor:"pointer",fontSize:"15px",color:TEAL,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                          <span style={{fontSize:"12px",fontWeight:"700",color:TEAL,minWidth:"32px",textAlign:"center"}}>{thermoTarget}°F</span>
                          <button onClick={()=>setThermo(t=>t+1)} style={{width:"24px",height:"24px",borderRadius:"50%",border:`1px solid ${TEAL}40`,background:`${TEAL}12`,cursor:"pointer",fontSize:"15px",color:TEAL,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                        </div>
                      )}
                    </div>

                    {device.type==="toggle" && device.brightness && (
                      <div>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"5px"}}>
                          <span style={{fontSize:"11px",color:"#9a90b8"}}>Brightness</span>
                          <span style={{fontSize:"11px",fontWeight:"600",color:P}}>{device.brightness}%</span>
                        </div>
                        <div style={{height:"4px",background:"#eae6f5",borderRadius:"4px",overflow:"hidden"}}>
                          <motion.div
                            initial={{width:0}} animate={{width:`${device.brightness}%`}}
                            transition={{duration:0.9,ease:"easeOut",delay:0.55}}
                            style={{height:"100%",background:`linear-gradient(90deg,${PURPLE},${P})`,borderRadius:"4px"}}
                          />
                        </div>
                      </div>
                    )}

                    {device.type==="status" && (
                      <div style={{display:"flex",alignItems:"center",gap:"7px"}}>
                        <motion.span
                          animate={{opacity:[1,0.3,1],scale:[1,1.2,1]}}
                          transition={{duration:1.8,repeat:Infinity,ease:"easeInOut"}}
                          style={{width:"7px",height:"7px",borderRadius:"50%",background:device.statusColor,display:"inline-block",boxShadow:`0 0 7px ${device.statusColor}80`}}
                        />
                        <span style={{fontSize:"12px",color:device.statusColor,fontWeight:"600"}}>{device.status}</span>
                      </div>
                    )}

                    {device.type==="thermostat" && (
                      <div style={{display:"flex",gap:"20px",paddingTop:"4px"}}>
                        <div>
                          <p style={{margin:"0 0 2px",fontSize:"10px",color:"#9a90b8",textTransform:"uppercase",letterSpacing:"0.07em"}}>Current</p>
                          <p style={{margin:0,fontSize:"15px",fontWeight:"700",color:"#18103a",fontFamily:"'Syne',sans-serif"}}>{device.current}°F</p>
                        </div>
                        <div style={{width:"1px",background:"#ede9f5"}}/>
                        <div>
                          <p style={{margin:"0 0 2px",fontSize:"10px",color:"#9a90b8",textTransform:"uppercase",letterSpacing:"0.07em"}}>Target</p>
                          <p style={{margin:0,fontSize:"15px",fontWeight:"700",color:TEAL,fontFamily:"'Syne',sans-serif"}}>{thermoTarget}°F</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div {...fade(0,0.48)} style={{marginBottom:"32px"}}>
            <SectionHeader title="Energy & Alerts" />
            <div style={{display:"grid",gridTemplateColumns:"1.25fr 1fr",gap:"14px"}}>

              <div style={{...card,padding:"22px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
                  <div>
                    <p style={{margin:0,fontSize:"11px",color:"#9a90b8",fontWeight:"600",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:"3px"}}>This Week</p>
                    <div style={{display:"flex",alignItems:"baseline",gap:"5px"}}>
                      <span style={{fontSize:"26px",fontWeight:"700",fontFamily:"'Syne',sans-serif",color:"#18103a"}}>24.3</span>
                      <span style={{fontSize:"13px",color:"#9a90b8"}}>kWh today</span>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:"5px",background:`${P}12`,borderRadius:"7px",padding:"5px 10px",border:`1px solid ${P}25`}}>
                    <TrendingUp size={12} color={P} strokeWidth={2.5}/>
                    <span style={{fontSize:"11px",fontWeight:"600",color:P}}>−8% this week</span>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"flex-end",gap:"7px",height:"80px"}}>
                  {energyDays.map((d,i) => {
                    const today = d.day==="Sat";
                    return (
                      <div key={d.day} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"5px"}}>
                        <motion.div
                          initial={{height:0,opacity:0}} animate={{height:`${(d.kwh/maxKwh)*64}px`,opacity:1}}
                          transition={{delay:0.5+i*0.06,duration:0.5,ease:[0.25,0.46,0.45,0.94]}}
                          style={{
                            width:"100%",borderRadius:"4px 4px 0 0",
                            background:today?`linear-gradient(180deg,${PURPLE},${P})`:`rgba(92,53,176,0.13)`,
                            boxShadow:today?`0 0 10px ${PURPLE}35`:undefined,
                          }}
                        />
                        <span style={{fontSize:"9px",fontWeight:today?"700":"400",color:today?PURPLE:"#b8b0d0",letterSpacing:"0.04em"}}>{d.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{...card,padding:"22px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
                  <p style={{margin:0,fontSize:"11px",fontWeight:"600",letterSpacing:"0.06em",textTransform:"uppercase",color:"#9a90b8"}}>System Alerts</p>
                  <span style={{fontSize:"10px",fontWeight:"700",color:GOLD,background:`${GOLD}18`,border:`1px solid ${GOLD}30`,padding:"3px 9px",borderRadius:"5px"}}>
                    3 Active
                  </span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                  {systemAlerts.map((alert,i) => {
                    const Icon = alert.icon;
                    return (
                      <motion.div
                        key={alert.id}
                        initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}}
                        transition={{delay:0.52+i*0.09,duration:0.35}}
                        style={{
                          display:"flex",alignItems:"center",gap:"12px",
                          padding:"10px 12px",borderRadius:"10px",
                          background:`${alert.color}0b`,border:`1px solid ${alert.color}22`,
                        }}>
                        <div style={{width:"30px",height:"30px",borderRadius:"8px",background:`${alert.color}1a`,border:`1px solid ${alert.color}28`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          <Icon size={13} color={alert.color} strokeWidth={2}/>
                        </div>
                        <div>
                          <p style={{margin:0,fontSize:"12.5px",fontWeight:"600",color:"#18103a",lineHeight:1.3}}>{alert.label}</p>
                          <p style={{margin:0,fontSize:"11px",color:"#9a90b8"}}>{alert.detail}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div {...fade(0,0.58)}>
            <SectionHeader
              title="Your Rooms"
              right={
                <Link
                  to="/rooms"
                  className="hq-viewall"
                  style={{
                    color:P,fontSize:"11px",fontWeight:"600",textDecoration:"none",
                    display:"flex",alignItems:"center",gap:"4px",
                    background:"rgba(46,139,87,0.08)",padding:"5px 11px",borderRadius:"7px",
                    border:`1px solid ${P}28`,letterSpacing:"0.05em",
                  }}>
                  View All <ChevronRight size={12} strokeWidth={2.5}/>
                </Link>
              }
            />
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"14px"}}>
              {dashboardRooms.map((room,i) => {
                const Icon = room.icon;
                return (
                  <motion.div
                    key={room.id}
                    {...fade(i,0.6)}
                    className="hq-card"
                    onClick={()=>navigate(`/rooms/${room.id}`)}
                    style={{...card,cursor:"pointer",padding:"20px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"12px"}}>
                      <div style={{width:"50px",height:"50px",background:"#e7f3ee",borderRadius:"12px",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <Icon size={26} color="#63a17f"/>
                      </div>
                      <div>
                        <h5 style={{margin:0,fontWeight:"bold",fontSize:"16px",color:"#1a1a1a"}}>{room.name}</h5>
                        <p style={{margin:0,fontSize:"12px",color:"#888"}}>{room.devices} devices</p>
                      </div>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:"13px",color:"#888"}}>
                      <span style={{display:"flex",alignItems:"center",gap:"4px"}}><Thermometer size={14}/>{room.temperature}</span>
                      <span style={{display:"flex",alignItems:"center",gap:"4px"}}><Droplets size={14}/>{room.humidity}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

