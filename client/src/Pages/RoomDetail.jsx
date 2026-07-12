
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Power, Zap, Thermometer, Lightbulb,
  Home, RotateCcw, Wifi, WifiOff, AlertTriangle, Plus, X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const BASE_URL = "http://localhost:5000";

const apiFetch = async (path, token, options = {}) => {
  const storedToken = token || localStorage.getItem("token");
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

/* 
   OBSERVER PATTERN
   DeviceManager is the Subject.
   It holds all device ON/OFF states and notifies every registered observer whenever any state changes.
   The React setState function is registered as the observer.
 */
class DeviceManager {
  constructor() {
    this._states    = {};  // { deviceId: boolean }
    this._observers = [];
  }

  subscribe(fn)   { this._observers.push(fn); }
  unsubscribe(fn) { this._observers = this._observers.filter(o => o !== fn); }
  notify()        { this._observers.forEach(fn => fn({ ...this._states })); }


  setDevices(devices) {
    this._states = {};
    devices.forEach(d => { this._states[d._id] = d.status === "ON"; });
    this.notify();
  }


  toggle(deviceId) {
    this._states[deviceId] = !this._states[deviceId];
    this.notify();
    return this._states[deviceId];
  }

  rollback(deviceId) {
    this._states[deviceId] = !this._states[deviceId];
    this.notify();
  }
}

/* Singleton — one manager per app session */
const deviceManager = new DeviceManager();


const DEVICE_TYPES  = ["LIGHT", "FAN", "AC"];
const iconMap       = { LIGHT: Lightbulb, FAN: Zap, AC: Thermometer };
const TYPE_LABELS   = { LIGHT: "Light", FAN: "Fan", AC: "Air Conditioner" };

const Overlay = ({ onClick }) => (
  <div onClick={onClick} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000 }} />
);

const RoomDetail = () => {
  const { id }            = useParams();       // room MongoDB _id from URL
  const navigate          = useNavigate();
  const { token, user }   = useAuth();

  const isAdmin = user?.role === "ADMIN";

  const [homeId,         setHomeId]         = useState(null);
  const [room,           setRoom]           = useState(null);
  const [devices,        setDevices]        = useState([]);
  const [deviceStates,   setDeviceStates]   = useState({});
  const [loadingRoom,    setLoadingRoom]    = useState(true);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [roomOnline,     setRoomOnline]     = useState(false);

  const [showAddDevice, setShowAddDevice] = useState(false);
  const [devForm,       setDevForm]       = useState({ name: "", type: "LIGHT", power_rating_watt: "" });
  const [devError,      setDevError]      = useState("");
  const [devSubmitting, setDevSubmitting] = useState(false);

  /*  Register Observer so UI re-renders on device state change  */
  useEffect(() => {
    const observer = (states) => setDeviceStates(states);
    deviceManager.subscribe(observer);
    return () => deviceManager.unsubscribe(observer);
  }, []);

  const fetchHomeId = useCallback(async () => {
    const t = token || localStorage.getItem("token");
    if (!t) return null;
    try {
      const data = await apiFetch("/homes/mine", t);
      const home = data?.data?.home || data?.home;
      const hid  = home?.id || home?._id;
      setHomeId(hid);
      return hid;
    } catch { return null; }
  }, [token]);

  const fetchRoom = useCallback(async (hid) => {
    if (!hid || !id) return;
    setLoadingRoom(true);
    const t = token || localStorage.getItem("token");
    try {
      const data = await apiFetch(`/rooms/${hid}/rooms/${id}`, t);
      const r    = data?.data?.room || data?.room;
      setRoom(r);
      setRoomOnline(true);
    } catch {
      setRoomOnline(false);
    } finally {
      setLoadingRoom(false);
    }
  }, [token, id]);

  const fetchDevices = useCallback(async () => {
    if (!id) return;
    setLoadingDevices(true);
    const t = token || localStorage.getItem("token");
    try {
      const data = await apiFetch(`/devices?roomId=${id}`, t);
      const list = data?.data?.devices || data?.devices || [];
      setDevices(list);
      deviceManager.setDevices(list);  // inject Observer subject with real states
    } catch {
      setDevices([]);
    } finally {
      setLoadingDevices(false);
    }
  }, [token, id]);

  useEffect(() => {
    const t = token || localStorage.getItem("token");
    if (!t) return;
    const boot = async () => {
      const hid = await fetchHomeId();
      await Promise.all([fetchRoom(hid), fetchDevices()]);
    };
    boot();
  }, [token, id]);

  /*  
     Observer notifies UI immediately (optimistic),
     then syncs with backend. Rolls back on failure.
   */
  const toggleDevice = async (deviceId) => {
    const isNowOn = deviceManager.toggle(deviceId);  // Observer notifies immediately
    const action  = isNowOn ? "ON" : "OFF";
    try {
      await apiFetch(`/devices/${deviceId}/control`, token, {
        method: "POST",
        body:   JSON.stringify({ action }),
      });
      
      setDevices(prev => prev.map(d =>
        d._id === deviceId ? { ...d, status: action } : d
      ));
    } catch {
      deviceManager.rollback(deviceId); 
    }
  };

  /*  Add Device  (ADMIN only) 
   */
  const handleAddDevice = async () => {
    setDevError("");
    if (!devForm.name.trim())          { setDevError("Device name is required."); return; }
    if (!devForm.power_rating_watt || isNaN(Number(devForm.power_rating_watt)) || Number(devForm.power_rating_watt) < 1) {
      setDevError("Power rating must be a number (min 1 watt)."); return;
    }

    setDevSubmitting(true);
    const t = token || localStorage.getItem("token");
    try {
      const data = await apiFetch("/devices", t, {
        method: "POST",
        body: JSON.stringify({
          name:              devForm.name.trim(),
          type:              devForm.type,
          room_id:           id,                           
          power_rating_watt: Number(devForm.power_rating_watt),
        }),
      });
      const newDevice = data?.data?.device || data?.device;
      if (newDevice) {
        setDevices(prev => [...prev, newDevice]);
        deviceManager.setDevices([...devices, newDevice]);  // re-seed Observer
      }
      setShowAddDevice(false);
      setDevForm({ name: "", type: "LIGHT", power_rating_watt: "" });
    } catch (err) {
      setDevError("Failed to add device. Check your inputs and try again.");
    } finally {
      setDevSubmitting(false);
    }
  };

  const loading = loadingRoom || loadingDevices;

  /*  Styles  */
  const inputStyle = { width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #e0dcea", fontSize: "14px", outline: "none", color: "#1a1a1a", background: "white", boxSizing: "border-box" };
  const modalBox   = { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "white", borderRadius: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.20)", padding: "28px", width: "min(460px,90vw)", zIndex: 1001 };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f8f9fa, #eef3f7)" }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        .device-card { background: white; padding: 18px 20px; margin-bottom: 12px; border-radius: 14px; box-shadow: 0 6px 15px rgba(0,0,0,0.06); display: flex; justify-content: space-between; align-items: center; transition: transform 0.2s ease; }
        .device-card:hover { transform: translateY(-2px); }
        .switch { position: relative; display: inline-block; width: 50px; height: 26px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; inset: 0; background-color: #ccc; transition: 0.4s; border-radius: 34px; }
        .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background-color: white; transition: 0.4s; border-radius: 50%; }
        input:checked + .slider { background-color: #63a17f; }
        input:checked + .slider:before { transform: translateX(24px); }
      `}</style>

    
      <nav className="navbar shadow-sm" style={{ backgroundColor: "#63a17f" }}>
        <div className="container-fluid d-flex align-items-center justify-content-between">
          <button className="btn text-white d-flex align-items-center"
            style={{ background: "transparent", border: "none", gap: "8px" }}
            onClick={() => navigate("/rooms")}>
            <ArrowLeft size={22} /> Back to Rooms
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "600", background: roomOnline ? "rgba(255,255,255,0.25)" : "rgba(255,0,0,0.2)", color: "white" }}>
              {roomOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
              {roomOnline ? "Live" : "Offline"}
            </span>
           
            {isAdmin && !loading && room && (
              <button
                onClick={() => { setShowAddDevice(true); setDevError(""); setDevForm({ name: "", type: "LIGHT", power_rating_watt: "" }); }}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "8px", border: "1.5px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.15)", color: "white", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
                <Plus size={14} /> Add Device
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="p-4">

        {loading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px", color: "#aaa", gap: "10px", fontSize: "14px" }}>
            <RotateCcw size={18} style={{ animation: "spin 1s linear infinite" }} /> Loading room...
          </div>
        )}

        {!loading && !room && (
          <div style={{ textAlign: "center", padding: "60px", color: "#bbb" }}>
            <AlertTriangle size={40} color="#e0dcea" strokeWidth={1.5} style={{ marginBottom: "12px", display: "block", margin: "0 auto 12px" }} />
            <p style={{ fontWeight: "600", color: "#aaa", margin: "0 0 12px" }}>Room not found</p>
            <button onClick={() => navigate("/rooms")}
              style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: "#63a17f", color: "white", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
              Back to Rooms
            </button>
          </div>
        )}

        {!loading && room && (
          <>
           
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
              <div style={{ width: "60px", height: "60px", background: "#e7f3ee", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Home size={30} color="#63a17f" />
              </div>
              <div>
                <h3 style={{ margin: "0 0 4px", fontWeight: "800", fontSize: "22px", color: "#1a1a1a" }}>{room.name}</h3>
                {room.description && (
                  <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#888" }}>{room.description}</p>
                )}
                <p style={{ margin: 0, fontSize: "12px", color: "#63a17f", fontWeight: "600" }}>
                  {devices.length} device{devices.length !== 1 ? "s" : ""} in this room
                </p>
              </div>
            </div>

         
            {loadingDevices ? (
              <div style={{ textAlign: "center", padding: "32px", color: "#aaa", fontSize: "13px" }}>
                <RotateCcw size={16} style={{ animation: "spin 1s linear infinite", marginRight: "8px" }} />
                Loading devices...
              </div>
            ) : devices.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#bbb", fontSize: "14px", background: "white", borderRadius: "14px", boxShadow: "0 6px 15px rgba(0,0,0,0.06)" }}>
                <Power size={32} color="#e0dcea" strokeWidth={1.5} style={{ marginBottom: "10px", display: "block", margin: "0 auto 10px" }} />
                <p style={{ margin: "0 0 4px", fontWeight: "600", color: "#aaa" }}>No devices in this room yet</p>
                {isAdmin && <p style={{ margin: 0, fontSize: "12px" }}>Click "Add Device" in the top bar to add one.</p>}
              </div>
            ) : (
              devices.map(device => {
                const Icon    = iconMap[device.type] || Power;
                const isOn    = deviceStates[device._id] || false;
                const isFault = device.status === "FAULT";
                return (
                  <div key={device._id} className="device-card"
                    style={{ borderLeft: `3px solid ${isFault ? "#c03030" : isOn ? "#63a17f" : "transparent"}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: isOn ? "#e7f3ee" : "#f5f3fb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={18} color={isFault ? "#c03030" : isOn ? "#63a17f" : "#a09ab8"} strokeWidth={2} />
                      </div>
                      <div>
                        <p style={{ margin: "0 0 2px", fontSize: "14px", fontWeight: "600", color: "#1a1a1a" }}>{device.name}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: isFault ? "#c03030" : isOn ? "#63a17f" : "#ccc", display: "inline-block" }} />
                          <span style={{ fontSize: "11px", color: isFault ? "#c03030" : isOn ? "#63a17f" : "#aaa", fontWeight: "600" }}>
                            {device.status}
                          </span>
                          <span style={{ fontSize: "11px", color: "#ccc" }}>·</span>
                          <span style={{ fontSize: "11px", color: "#bbb" }}>{TYPE_LABELS[device.type] || device.type}</span>
                          {device.powerRatingWatt && (
                            <span style={{ fontSize: "11px", color: "#bbb" }}>· {device.powerRatingWatt}W</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <label className="switch" style={{ opacity: isFault ? 0.4 : 1, cursor: isFault ? "not-allowed" : "pointer" }}>
                      <input
                        type="checkbox"
                        checked={isOn}
                        disabled={isFault}
                        onChange={() => !isFault && toggleDevice(device._id)}
                      />
                      <span className="slider" />
                    </label>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>


      {showAddDevice && (
        <>
          <Overlay onClick={() => setShowAddDevice(false)} />
          <div style={modalBox}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h5 style={{ margin: 0, fontWeight: "700", fontSize: "17px", color: "#1a1a1a" }}>Add Device to Room</h5>
              <button onClick={() => setShowAddDevice(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} color="#888" />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

              <div>
                <p style={{ margin: "0 0 6px", fontSize: "13px", fontWeight: "600", color: "#444" }}>Device Name *</p>
                <input style={inputStyle} placeholder="e.g. Ceiling Light"
                  value={devForm.name}
                  onChange={e => setDevForm(f => ({ ...f, name: e.target.value }))} />
              </div>

              <div>
                <p style={{ margin: "0 0 6px", fontSize: "13px", fontWeight: "600", color: "#444" }}>Device Type *</p>
                <select style={inputStyle} value={devForm.type}
                  onChange={e => setDevForm(f => ({ ...f, type: e.target.value }))}>
                  {DEVICE_TYPES.map(t => (
                    <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>

              <div>
                <p style={{ margin: "0 0 6px", fontSize: "13px", fontWeight: "600", color: "#444" }}>Power Rating (Watts) *</p>
                <input style={inputStyle} type="number" min="1" placeholder="e.g. 60"
                  value={devForm.power_rating_watt}
                  onChange={e => setDevForm(f => ({ ...f, power_rating_watt: e.target.value }))} />
                <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#aaa" }}>
                  Typical: Light 10–100W · Fan 30–75W · AC 800–2000W
                </p>
              </div>

              {devError && (
                <div style={{ padding: "10px 14px", background: "#fef2f2", borderRadius: "8px", border: "1px solid #fdd", fontSize: "13px", color: "#c03030" }}>
                  {devError}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "24px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowAddDevice(false)}
                style={{ background: "#f0f0f0", color: "#555", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleAddDevice} disabled={devSubmitting}
                style={{ background: devSubmitting ? "#aaa" : "#63a17f", color: "white", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "14px", fontWeight: "600", cursor: devSubmitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                {devSubmitting
                  ? <><RotateCcw size={13} style={{ animation: "spin 1s linear infinite" }} /> Adding...</>
                  : "Add Device"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RoomDetail;