import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../Components/Layout";

import {
  Thermometer,
  Droplets,
  ArrowLeft,
  Sofa,
  ChefHat,
  Bed,
  Bath,
  Briefcase,
  Car,
  Plus,
  Trash2,
  X
} from "lucide-react";


/* =====================================================
   FACTORY PATTERN
   -----------------------------------------------------
   This class is responsible for creating room objects.
   Instead of manually writing every room object,
   we call the factory to generate them.

   Benefit:
   - Centralized object creation
   - Easy to add new room types
   - Cleaner component code
===================================================== */

class RoomFactory {

  static createRoom(id, type, temperature, humidity, devices) {

    const iconMap = {
      living: Sofa,
      kitchen: ChefHat,
      bedroom: Bed,
      bathroom: Bath,
      office: Briefcase,
      garage: Car,
      dining: Sofa,
      guest: Bed,
      balcony: Car,
      laundry: Bath
    };

    const nameMap = {
      living: "Living Room",
      kitchen: "Kitchen",
      bedroom: "Bedroom",
      bathroom: "Bathroom",
      office: "Home Office",
      garage: "Garage",
      dining: "Dining Room",
      guest: "Guest Room",
      balcony: "Balcony",
      laundry: "Laundry Room"
    };

    return {
      id,
      name: nameMap[type] || type,
      icon: iconMap[type] || Sofa,
      temperature,
      humidity,
      devices
    };
  }
}


/* =====================================================
   ROOM DATA
===================================================== */

const initialRooms = [
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

export const rooms = initialRooms;

const roomTypes = ["living","kitchen","bedroom","bathroom","office","garage","dining","guest","balcony","laundry","other"];
const deviceTypes = ["Light","Fan","AC","Thermostat","Camera","Smart Plug","TV","Speaker","Sensor","Other"];


/* =====================================================
   ROOMS COMPONENT
===================================================== */

const Rooms = () => {

  const navigate = useNavigate();

  const [roomList,    setRoomList]   = useState(initialRooms);
  const [showModal,   setShowModal]  = useState(false);
  const [deleteId,    setDeleteId]   = useState(null);
  const [newRoom,     setNewRoom]    = useState({ type: "living", customName: "", temperature: "", humidity: "", deviceList: [] });
  const [deviceInput, setDeviceInput] = useState({ type: "Light", count: "1" });

  const addDeviceEntry = () => {
    if (!deviceInput.count || Number(deviceInput.count) < 1) return;
    setNewRoom(r => ({ ...r, deviceList: [...r.deviceList, { type: deviceInput.type, count: Number(deviceInput.count) }] }));
    setDeviceInput({ type: "Light", count: "1" });
  };

  const removeDeviceEntry = (i) => setNewRoom(r => ({ ...r, deviceList: r.deviceList.filter((_, idx) => idx !== i) }));

  const handleAdd = () => {
    if (!newRoom.temperature || !newRoom.humidity) return;
    if (newRoom.type === "other" && !newRoom.customName.trim()) return;
    const id = String(Date.now());
    const totalDevices = newRoom.deviceList.reduce((sum, d) => sum + d.count, 0) || 0;
    const typeKey = newRoom.type === "other" ? newRoom.customName.trim() : newRoom.type;
    const room = RoomFactory.createRoom(id, typeKey, newRoom.temperature, newRoom.humidity, totalDevices);
    if (newRoom.type === "other") room.name = newRoom.customName.trim();
    room.deviceList = newRoom.deviceList;
    setRoomList(prev => [...prev, room]);
    setNewRoom({ type: "living", customName: "", temperature: "", humidity: "", deviceList: [] });
    setDeviceInput({ type: "Light", count: "1" });
    setShowModal(false);
  };

  const handleDelete = () => {
    setRoomList(prev => prev.filter(r => r.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <Layout>
    <div className="rooms-wrapper">

      {/* ================= NAVBAR ================= */}
      <nav className="navbar">
        <div className="container-fluid d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <button className="btn btn-sm me-2 text-white" onClick={() => navigate("/")} style={{ background: "transparent", border: "none", fontSize: "1.5rem", backgroundColor: "#63a17f" }}>
              <ArrowLeft size={24} />
            </button>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
              <span style={{ fontSize: "20px", fontWeight: "bold", color: "#63a17f" }}>Your Rooms</span>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "#63a17f", color: "white", border: "none", borderRadius: "8px", padding: "7px 14px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
          >
            <Plus size={16} /> Add Room
          </button>
        </div>
      </nav>


      {/* ================= ROOMS GRID ================= */}
      <div className="p-4">
        <div className="row">

          {roomList.map((room) => {

            const Icon = room.icon;

            return (

              <div key={room.id} className="col-md-4 col-sm-6 mb-4">

                <div
                  className="room-card p-4"
                  style={{ position: "relative" }}
                  onClick={() => navigate(`/rooms/${room.id}`)}
                >

                  {/* ===== DELETE BUTTON ===== */}
                  <button
                    className="delete-btn"
                    onClick={e => { e.stopPropagation(); setDeleteId(room.id); }}
                  >
                    <Trash2 size={14} color="#c03030" />
                  </button>

                  {/* ===== TOP SECTION ===== */}
                  <div className="d-flex align-items-center gap-3 mb-3">

                    <div className="room-icon">
                      <Icon size={26} color="#63a17f" />
                    </div>

                    <div>
                      <h5 className="mb-1 fw-bold">{room.name}</h5>
                      <p className="text-muted small mb-0">
                        {room.devices} devices
                      </p>
                    </div>

                  </div>


                  {/* ===== TEMPERATURE & HUMIDITY ===== */}
                  <div className="d-flex justify-content-between text-muted small">

                    <span className="d-flex align-items-center gap-1">
                      <Thermometer size={16} />
                      {room.temperature}
                    </span>

                    <span className="d-flex align-items-center gap-1">
                      <Droplets size={16} />
                      {room.humidity}
                    </span>

                  </div>

                </div>
              </div>
            );
          })}

        </div>
      </div>


      {/* ================= ADD ROOM MODAL ================= */}
      {showModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowModal(false)} />
          <div className="modal-box">

            <div className="modal-header">
              <h5 style={{ margin: 0, fontWeight: "700", fontSize: "17px", color: "#1a1a1a" }}>Add New Room</h5>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} color="#888" />
              </button>
            </div>

            <div className="modal-body">

              <div className="field-group">
                <p className="field-label">Room Type</p>
                <select className="field-input" value={newRoom.type} onChange={e => setNewRoom(r => ({ ...r, type: e.target.value, customName: "" }))}>
                  {roomTypes.map(t => (
                    <option key={t} value={t}>
                      {t === "other" ? "Other (custom name)" : t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {newRoom.type === "other" && (
                <div className="field-group">
                  <p className="field-label">Room Name</p>
                  <input className="field-input" placeholder="e.g. Studio, Gym, Workshop..." value={newRoom.customName} onChange={e => setNewRoom(r => ({ ...r, customName: e.target.value }))} />
                </div>
              )}

              <div className="field-group">
                <p className="field-label">Temperature</p>
                <input className="field-input" placeholder="e.g. 22°C" value={newRoom.temperature} onChange={e => setNewRoom(r => ({ ...r, temperature: e.target.value }))} />
              </div>

              <div className="field-group">
                <p className="field-label">Humidity</p>
                <input className="field-input" placeholder="e.g. 45%" value={newRoom.humidity} onChange={e => setNewRoom(r => ({ ...r, humidity: e.target.value }))} />
              </div>

              <div className="field-group">
                <p className="field-label">Devices</p>
                <div className="device-row">
                  <select className="field-input" style={{ flex: 2 }} value={deviceInput.type} onChange={e => setDeviceInput(d => ({ ...d, type: e.target.value }))}>
                    {deviceTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input className="field-input" style={{ flex: 1 }} type="number" min="1" placeholder="Qty" value={deviceInput.count} onChange={e => setDeviceInput(d => ({ ...d, count: e.target.value }))} />
                  <button className="add-device-btn" onClick={addDeviceEntry}>+</button>
                </div>

                {newRoom.deviceList.length > 0 ? (
                  <div className="device-list">
                    {newRoom.deviceList.map((d, i) => (
                      <div key={i} className="device-tag">
                        <span>{d.type} <strong>×{d.count}</strong></span>
                        <button onClick={() => removeDeviceEntry(i)} style={{ background: "none", border: "none", cursor: "pointer", padding: "0 2px", display: "flex", alignItems: "center" }}>
                          <X size={13} color="#c03030" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#aaa" }}>No devices added yet.</p>
                )}
              </div>

            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAdd}>Add Room</button>
            </div>

          </div>
        </>
      )}


      {/* ================= DELETE CONFIRM MODAL ================= */}
      {deleteId && (
        <>
          <div className="modal-overlay" onClick={() => setDeleteId(null)} />
          <div className="modal-box" style={{ textAlign: "center", maxWidth: "360px" }}>

            <div style={{ width: "52px", height: "52px", background: "#fee8e8", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={22} color="#c03030" />
            </div>

            <h5 style={{ margin: "0 0 8px", fontWeight: "700", fontSize: "17px", color: "#1a1a1a" }}>Delete Room?</h5>
            <p style={{ margin: "0 0 24px", fontSize: "13px", color: "#777" }}>This will permanently remove the room and all its data.</p>

            <div className="modal-footer" style={{ justifyContent: "center" }}>
              <button className="btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn-danger"   onClick={handleDelete}>Delete</button>
            </div>

          </div>
        </>
      )}


      {/* ================= STYLES ================= */}
      <style jsx>{`

        .rooms-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg,#f8f9fa,#eef3f7);
        }

        .room-card {
          background: white;
          border-radius: 14px;
          box-shadow: 0 6px 15px rgba(0,0,0,0.06);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .room-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.12);
        }

        .room-icon {
          width: 50px;
          height: 50px;
          background: #e7f3ee;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        h5 {
          font-size: 1.1rem;
        }

        .delete-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: #fee8e8;
          border: none;
          border-radius: 8px;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .delete-btn:hover {
          background: #fdd0d0;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          z-index: 1000;
        }

        .modal-box {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.20);
          padding: 28px;
          width: min(420px, 90vw);
          z-index: 1001;
          max-height: 85vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-body {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .modal-footer {
          display: flex;
          gap: 10px;
          margin-top: 24px;
          justify-content: flex-end;
        }

        .field-group {
          display: flex;
          flex-direction: column;
        }

        .field-label {
          margin: 0 0 6px;
          font-size: 13px;
          font-weight: 600;
          color: #444;
        }

        .field-input {
          width: 100%;
          padding: 9px 12px;
          border-radius: 8px;
          border: 1.5px solid #d0e8da;
          font-size: 14px;
          outline: none;
          color: #1a1a1a;
          background: white;
          box-sizing: border-box;
        }

        .device-row {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }

        .add-device-btn {
          background: #63a17f;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0 14px;
          cursor: pointer;
          font-weight: 700;
          font-size: 18px;
          flex-shrink: 0;
        }

        .device-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .device-tag {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f0faf4;
          border-radius: 8px;
          padding: 7px 12px;
          border: 1px solid #c2e0cf;
          font-size: 13px;
          color: #1a1a1a;
        }

        .btn-primary {
          background: #63a17f;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-secondary {
          background: #f0f0f0;
          color: #555;
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-danger {
          background: #c03030;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

      `}</style>

    </div>
    </Layout>
  );
};

export default Rooms;