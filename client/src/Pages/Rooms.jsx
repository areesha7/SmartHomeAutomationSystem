
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sofa, ChefHat, Bed, Bath, Briefcase, Car,
  Home, RotateCcw, Wifi, WifiOff, Plus, X
} from "lucide-react";
import Layout from "../Components/Layout";
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
   FACTORY PATTERN
   RoomFactory.fromBackend() maps raw backend room
   to consistent UI shape. Picks icon from room name.
 */
const iconMap = {
  living: Sofa, kitchen: ChefHat, bedroom: Bed,
  bathroom: Bath, office: Briefcase, garage: Car,
  dining: Sofa, guest: Bed, balcony: Car, laundry: Bath,
};

class RoomFactory {
  static fromBackend(room) {
    const nameLower = (room.name || "").toLowerCase();
    const iconKey   = Object.keys(iconMap).find(k => nameLower.includes(k)) || null;
    return {
      id:          room.id || room._id,
      name:        room.name,
      description: room.description || null,
      deviceCount: room.deviceCount ?? 0,
      icon:        iconKey ? iconMap[iconKey] : Home,
    };
  }
}

const StatusPill = ({ online, loading }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: loading ? "#f0f0f0" : online ? "#e8f5ee" : "#fdecea", color: loading ? "#888" : online ? "#63a17f" : "#c03030" }}>
    {loading ? <RotateCcw size={10} style={{ animation: "spin 1s linear infinite" }} /> : online ? <Wifi size={10} /> : <WifiOff size={10} />}
    {loading ? "Loading..." : online ? "Live" : "Offline"}
  </span>
);

const Overlay = ({ onClick }) => (
  <div onClick={onClick} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000 }} />
);

const Rooms = () => {
  const navigate      = useNavigate();
  const { token, user } = useAuth();

  const isAdmin = user?.role === "ADMIN";

  const [homeId,   setHomeId]   = useState(null);
  const [rooms,    setRooms]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [online,   setOnline]   = useState(false);

  const [showModal,   setShowModal]   = useState(false);
  const [formName,    setFormName]    = useState("");
  const [formDesc,    setFormDesc]    = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [formError,   setFormError]   = useState("");


  const fetchHomeId = useCallback(async () => {
    const t = token || localStorage.getItem("token");
    if (!t) return null;
    try {
      const data = await apiFetch("/homes/mine", t);
      const home = data?.data?.home || data?.home;
      const id   = home?.id || home?._id;
      setHomeId(id);
      return id;
    } catch { return null; }
  }, [token]);


  const fetchRooms = useCallback(async (id) => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    const t = token || localStorage.getItem("token");
    try {
      const data = await apiFetch(`/rooms/${id}/rooms`, t);
      const list = data?.data?.rooms || data?.rooms || [];
      setRooms(list.map(r => RoomFactory.fromBackend(r)));
      setOnline(true);
    } catch {
      setOnline(false);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const t = token || localStorage.getItem("token");
    if (!t) return;
    const boot = async () => {
      const id = await fetchHomeId();
      await fetchRooms(id);
    };
    boot();
  }, [token]);

  const handleAddRoom = async () => {
    setFormError("");
    if (!formName.trim()) { setFormError("Room name is required."); return; }
    if (!homeId)          { setFormError("Could not find your home. Try refreshing."); return; }
    setSubmitting(true);
    const t = token || localStorage.getItem("token");
    try {
      const data = await apiFetch(`/rooms/${homeId}/rooms`, t, {
        method: "POST",
        body:   JSON.stringify({ name: formName.trim(), description: formDesc.trim() || undefined }),
      });
      const newRoom = data?.data?.room || data?.room;
      if (newRoom) setRooms(prev => [...prev, RoomFactory.fromBackend(newRoom)]);
      setShowModal(false);
      setFormName("");
      setFormDesc("");
    } catch (err) {
      setFormError(err.message.includes("409") ? "A room with this name already exists." : "Failed to create room. Try again.");
    } finally {
      setSubmitting(false);
    }
  };


  const inputStyle = { width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #e0dcea", fontSize: "14px", outline: "none", color: "#1a1a1a", background: "white", boxSizing: "border-box" };
  const modalBox   = { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "white", borderRadius: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.20)", padding: "28px", width: "min(460px,90vw)", zIndex: 1001 };

  return (
    <Layout>
      <style>{`
        .room-card { background: white; border-radius: 14px; padding: 20px; box-shadow: 0 6px 15px rgba(0,0,0,0.06); cursor: pointer; transition: transform 0.3s ease, box-shadow 0.3s ease; border: 1px solid #f0eef8; }
        .room-card:hover { transform: translateY(-5px); box-shadow: 0 12px 28px rgba(0,0,0,0.12); }
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>

      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f8f9fa, #eef3f7)", padding: "24px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontWeight: "800", fontSize: "22px", color: "#1a1a1a" }}>Rooms</h2>
            <p style={{ margin: 0, fontSize: "14px", color: "#777" }}>Manage and monitor every room in your home</p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <StatusPill online={online} loading={loading} />
            {isAdmin && (
              <button
                onClick={() => { setShowModal(true); setFormError(""); }}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "10px", border: "none", background: "#63a17f", color: "white", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                <Plus size={16} /> Add Room
              </button>
            )}
          </div>
        </div>

      
        {loading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px", color: "#aaa", gap: "10px", fontSize: "14px" }}>
            <RotateCcw size={18} style={{ animation: "spin 1s linear infinite" }} /> Loading rooms...
          </div>
        )}

        {!loading && rooms.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px", color: "#bbb", fontSize: "14px", background: "white", borderRadius: "14px", boxShadow: "0 6px 15px rgba(0,0,0,0.06)" }}>
            <Home size={40} color="#e0dcea" strokeWidth={1.5} style={{ marginBottom: "12px", display: "block", margin: "0 auto 12px" }} />
            <p style={{ margin: "0 0 4px", fontWeight: "600", fontSize: "15px", color: "#aaa" }}>
              {online ? "No rooms yet" : "Could not load rooms"}
            </p>
            <p style={{ margin: 0, fontSize: "13px" }}>
              {online && isAdmin ? 'Click "Add Room" to create your first room.' : online ? "Ask your admin to add rooms." : "Check your connection and try again."}
            </p>
          </div>
        )}

        {!loading && rooms.length > 0 && (
          <div className="row g-3">
            {rooms.map(room => {
              const Icon = room.icon;
              return (
                <div key={room.id} className="col-md-4 col-sm-6">
                  <div className="room-card" onClick={() => navigate(`/rooms/${room.id}`)}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
                      <div style={{ width: "54px", height: "54px", background: "#e7f3ee", borderRadius: "13px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={26} color="#63a17f" />
                      </div>
                      <div>
                        <h5 style={{ margin: "0 0 3px", fontWeight: "700", fontSize: "16px", color: "#1a1a1a" }}>{room.name}</h5>
                        <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>
                          {room.deviceCount} device{room.deviceCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    {room.description && (
                      <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#aaa", lineHeight: 1.5 }}>{room.description}</p>
                    )}
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <span style={{ fontSize: "11px", color: "#63a17f", fontWeight: "600", background: "#e8f5ee", padding: "3px 10px", borderRadius: "10px" }}>
                        View Room →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <>
          <Overlay onClick={() => setShowModal(false)} />
          <div style={modalBox}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h5 style={{ margin: 0, fontWeight: "700", fontSize: "17px", color: "#1a1a1a" }}>Add New Room</h5>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} color="#888" />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <p style={{ margin: "0 0 6px", fontSize: "13px", fontWeight: "600", color: "#444" }}>Room Name *</p>
                <input style={inputStyle} placeholder="e.g. Living Room"
                  value={formName} onChange={e => setFormName(e.target.value)} />
              </div>
              <div>
                <p style={{ margin: "0 0 6px", fontSize: "13px", fontWeight: "600", color: "#444" }}>Description <span style={{ color: "#aaa", fontWeight: "400" }}>(optional)</span></p>
                <input style={inputStyle} placeholder="e.g. Main living area on ground floor"
                  value={formDesc} onChange={e => setFormDesc(e.target.value)} />
              </div>
              {formError && (
                <div style={{ padding: "10px 14px", background: "#fef2f2", borderRadius: "8px", border: "1px solid #fdd", fontSize: "13px", color: "#c03030" }}>
                  {formError}
                </div>
              )}
              <div style={{ padding: "10px 14px", background: "#f0faf4", borderRadius: "8px", border: "1px solid #c2e0cf", fontSize: "12px", color: "#63a17f" }}>
                After creating the room, open it to add devices.
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "24px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowModal(false)}
                style={{ background: "#f0f0f0", color: "#555", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleAddRoom} disabled={submitting}
                style={{ background: submitting ? "#aaa" : "#63a17f", color: "white", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "14px", fontWeight: "600", cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                {submitting ? <><RotateCcw size={13} style={{ animation: "spin 1s linear infinite" }} /> Creating...</> : "Create Room"}
              </button>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default Rooms;