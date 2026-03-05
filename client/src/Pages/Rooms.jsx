import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../Components/Layout";

/* Import icons from lucide-react */
import {
  Thermometer,
  Droplets,
  ArrowLeft,
  Sofa,
  ChefHat,
  Bed,
  Bath,
  Briefcase,
  Car
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

  /* Static method that returns a room object */
  static createRoom(id, type, temperature, humidity, devices) {

    /* Map each room type to an icon */
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

    /* Map each type to its display name */
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

    /* Return the room object */
    return {
      id,
      name: nameMap[type],
      icon: iconMap[type],
      temperature,
      humidity,
      devices
    };
  }
}


/* =====================================================
   ROOM DATA
   -----------------------------------------------------
   Instead of writing objects manually,
   we create them using RoomFactory.
===================================================== */

const rooms = [
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


/* =====================================================
   ROOMS COMPONENT
===================================================== */

const Rooms = () => {

  /* React Router hook used for navigation */
  const navigate = useNavigate();

  return (
    <Layout>
    <div className="rooms-wrapper">

      {/* ================= NAVBAR ================= */}
      <nav className="navbar shadow-sm" style={{ backgroundColor: "#63a17f" }}>
        <div className="container-fluid d-flex align-items-center">

          {/* Back Button */}
          <button
            className="btn text-white d-flex align-items-center"
            onClick={() => navigate("/dashboard")}
            style={{ background: "transparent", border: "none", gap: "8px" }}
          >
            {/* Arrow icon */}
            <ArrowLeft size={22} />

            {/* Page title */}
            <span style={{ fontWeight: 600 }}>Your Rooms</span>
          </button>

        </div>
      </nav>


      {/* ================= ROOMS GRID ================= */}
      <div className="p-4">
        <div className="row">

          {/* Loop through rooms array */}
          {rooms.map((room) => {

            /* Extract icon component from room object */
            const Icon = room.icon;

            return (

              /* Bootstrap grid column */
              <div key={room.id} className="col-md-4 col-sm-6 mb-4">

                {/* Room Card */}
                <div
                  className="room-card p-4"

                  /* Navigate to room details page */
                  onClick={() => navigate(`/rooms/${room.id}`)}
                >

                  {/* ===== TOP SECTION ===== */}
                  <div className="d-flex align-items-center gap-3 mb-3">

                    {/* Room icon container */}
                    <div className="room-icon">

                      {/* Render dynamic icon */}
                      <Icon size={26} color="#63a17f" />

                    </div>

                    {/* Room information */}
                    <div>

                      {/* Room name */}
                      <h5 className="mb-1 fw-bold">{room.name}</h5>

                      {/* Number of devices */}
                      <p className="text-muted small mb-0">
                        {room.devices} devices
                      </p>

                    </div>
                  </div>


                  {/* ===== TEMPERATURE & HUMIDITY ===== */}
                  <div className="d-flex justify-content-between text-muted small">

                    {/* Temperature */}
                    <span className="d-flex align-items-center gap-1">
                      <Thermometer size={16} />
                      {room.temperature}
                    </span>

                    {/* Humidity */}
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

      `}</style>

    </div>
    </Layout>
  );
};

export default Rooms;
