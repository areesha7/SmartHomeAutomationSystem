import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Power,
  Thermometer,
  Droplets,
  Sofa,
  ChefHat,
  Bed,
  Bath,
  Briefcase,
  Car,
} from "lucide-react";

/* =====================================================
   OBSERVER PATTERN IMPLEMENTATION
   ===================================================== */

/*
Subject Class

This class manages the device states and notifies
all observers whenever a device state changes.
*/
class DeviceManager {
  constructor(devices) {
    this.devices = {};        // stores device states
    this.observers = [];      // list of observers

    // initialize all devices OFF
    devices.forEach(device => {
      this.devices[device] = false;
    });
  }

  /* Register an observer */
  subscribe(observer) {
    this.observers.push(observer);
  }

  /* Notify all observers when state changes */
  notify() {
    this.observers.forEach(observer => observer(this.devices));
  }

  /* Toggle device state */
  toggle(device) {
    this.devices[device] = !this.devices[device];
    this.notify();
  }

  /* Get current state */
  getState() {
    return this.devices;
  }
}

/* =====================================================
   ROOM DATA
   ===================================================== */

const roomsData = {
  1: {
    name: "Living Room",
    icon: Sofa,
    temperature: "23°C",
    humidity: "45%",
    devices: [
      "Ceiling Light",
      "Floor Lamp",
      "AC",
      "TV",
      "Smart Speaker",
      "Window Blinds",
      "Air Purifier",
      "Router",
    ],
  },

  2: {
    name: "Kitchen",
    icon: ChefHat,
    temperature: "22°C",
    humidity: "50%",
    devices: [
      "Main Light",
      "Exhaust Fan",
      "Coffee Machine",
      "Refrigerator",
      "Dishwasher",
      "Water Filter",
    ],
  },

  3: {
    name: "Bedroom",
    icon: Bed,
    temperature: "21°C",
    humidity: "42%",
    devices: [
      "Main Light",
      "Bedside Lamp",
      "AC",
      "Smart TV",
      "Smart Speaker",
    ],
  },
};

/* =====================================================
   MAIN COMPONENT
   ===================================================== */

const RoomDetail = () => {

  /* Get room id from URL */
  const { id } = useParams();

  /* Navigation hook */
  const navigate = useNavigate();

  /* Get room data */
  const room = roomsData[id];

  /* React state for device UI */
  const [deviceStates, setDeviceStates] = useState({});

  /* Device Manager (Observer Subject) */
  const [deviceManager] = useState(
    () => new DeviceManager(room.devices)
  );

  /* =====================================================
     OBSERVER REGISTRATION
     ===================================================== */

  useEffect(() => {

    /*
    Register observer

    Whenever device state changes,
    this observer updates React state
    which re-renders the UI.
    */

    deviceManager.subscribe((updatedState) => {
      setDeviceStates({ ...updatedState });
    });

    /* Initialize state */
    setDeviceStates(deviceManager.getState());

  }, [deviceManager]);

  /* =====================================================
     DEVICE TOGGLE FUNCTION
     ===================================================== */

  const toggleDevice = (device) => {
    deviceManager.toggle(device);
  };

  /* Room icon */
  const Icon = room.icon;

  return (
    <div className="room-detail-wrapper">

      {/* Navbar */}
      <nav className="navbar shadow-sm" style={{ backgroundColor: "#63a17f" }}>
        <div className="container-fluid">

          {/* Back Button */}
          <button
            className="btn text-white d-flex align-items-center"
            style={{ background: "transparent", border: "none", gap: "8px" }}
            onClick={() => navigate("/rooms")}
          >
            <ArrowLeft size={22} />
            Back to Rooms
          </button>

        </div>
      </nav>

      {/* Room Header */}
      <div className="p-4">

        <div className="d-flex align-items-center gap-3 mb-4">

          {/* Room Icon */}
          <div className="room-icon-large">
            <Icon size={30} color="#63a17f" />
          </div>

          {/* Room Info */}
          <div>
            <h3 className="fw-bold mb-1">{room.name}</h3>

            <div className="text-muted d-flex gap-3">

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

        {/* =====================================================
            DEVICE LIST (Observers)
           ===================================================== */}

        {room.devices.map((device, index) => (

          <div key={index} className="device-card">

            {/* Device Name */}
            <div className="d-flex align-items-center gap-2">
              <Power size={18} color="#63a17f" />
              <span>{device}</span>
            </div>

            {/* Toggle Switch */}
            <label className="switch">

              <input
                type="checkbox"
                checked={deviceStates[device] || false}
                onChange={() => toggleDevice(device)}
              />

              <span className="slider"></span>

            </label>

          </div>

        ))}

      </div>

      {/* =====================================================
         STYLES
         ===================================================== */}

      <style jsx>{`

        .room-detail-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa, #eef3f7);
        }

        .room-icon-large {
          width: 60px;
          height: 60px;
          background: #e7f3ee;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .device-card {
          background: white;
          padding: 18px 20px;
          margin-bottom: 15px;
          border-radius: 14px;
          box-shadow: 0 6px 15px rgba(0,0,0,0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* Toggle Switch */

        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 26px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background-color: #ccc;
          transition: 0.4s;
          border-radius: 34px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.4s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: #63a17f;
        }

        input:checked + .slider:before {
          transform: translateX(24px);
        }

      `}</style>

    </div>
  );
};

export default RoomDetail;
