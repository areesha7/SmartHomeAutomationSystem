import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCamera, FaEye, FaEyeSlash } from "react-icons/fa";
import { ArrowLeft } from "lucide-react";
import Layout from "../Components/Layout";

/* =========================
   OBSERVER PATTERN IMPLEMENTATION
   ========================= */

class ProfileManager {
  constructor(initialData) {
    this.data = initialData;
    this.observers = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  notify() {
    this.observers.forEach(observer => observer(this.data));
  }

  updateField(tab, key, value) {
    if (tab === "profile") this.data.profile[key] = value;
    if (tab === "security") this.data.profile[key] = value;
    if (tab === "notifications") this.data.notifications[key] = value;
    if (tab === "preferences") this.data.preferences[key] = value;

    this.notify();
  }

  toggle(tab, key) {
    if (tab === "notifications" || tab === "preferences") {
      this.data[tab][key] = !this.data[tab][key];
      this.notify();
    }
  }

  setProfileImage(img) {
    this.data.profileImage = img;
    this.notify();
  }
}

/* =========================
   DEFAULT DATA
   ========================= */

const defaultProfile = {
  name: "Alex Johnson",
  email: "alex@smarthome.io",
  phone: "+92-3198891620",
  location: "Pakistan, Karachi",
};

const initialData = {
  profile: { name: "", email: "", phone: "", location: "", current: "", new: "", confirm: "" },
  notifications: {
    deviceAlerts: true,
    securityAlerts: true,
    energyReports: false,
    weeklyDigest: true,
    pushNotifications: true,
    emailNotifications: false,
  },
  preferences: {
    temperatureUnit: "fahrenheit",
    autoLock: true,
    motionDetection: true,
  },
  profileImage: null,
};

/* =========================
   PROFILE COMPONENT
   ========================= */

const Profile = () => {
  const navigate = useNavigate();
  const primaryColor = "#63a17f";
  const colors = { primary: primaryColor, white: "#fff", black: "#32312b", gray: "#666", inputBg: "#f0f0f0", inputBorder: "#ccc" };

  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [showToast, setShowToast] = useState(false);
  const [data, setData] = useState(initialData);

  // Create Subject
  const [manager] = useState(() => new ProfileManager(initialData));

  // Observer registration
  useEffect(() => {
    manager.subscribe(updatedData => setData({ ...updatedData }));
  }, [manager]);

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const newImage = URL.createObjectURL(e.target.files[0]);
      manager.setProfileImage(newImage);
    }
  };

  /* Toggle switch styling */
  const toggle = { position: "relative", display: "inline-block", width: "40px", height: "20px" };
  const toggleSlider = (checked) => ({ position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: checked ? primaryColor : "#ccc", borderRadius: "20px", transition: "0.3s" });
  const toggleCircle = (checked) => ({ position: "absolute", height: "16px", width: "16px", left: checked ? "22px" : "2px", bottom: "2px", backgroundColor: colors.white, borderRadius: "50%", transition: "0.3s" });

  return (
    <Layout>
    <div className="dashboard-wrapper">

      {/* Top Navbar */}
      <nav className="navbar shadow-sm" style={{ backgroundColor: primaryColor }}>
        <div className="container-fluid d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <button className="btn btn-sm me-2 text-white" onClick={() => navigate("/dashboard")} style={{ background: "transparent", border: "none", fontSize: "1.5rem" }}>
              <ArrowLeft size={24} />
            </button>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
              <span style={{ fontSize: "20px", fontWeight: "bold", color: "#fff" }}>Profile Settings</span>
              <span style={{ fontSize: "14px", color: "#f0f0f0" }}>Manage Account</span>
            </div>
          </div>
        </div>
      </nav>

      <div style={{ padding: "30px 50px", fontFamily: "Arial, sans-serif", maxWidth: "700px", margin: "0 auto" }}>
        {/* Avatar + Name + Email */}
        <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "25px" }}>
          <div style={{ position: "relative", width: "60px", height: "60px" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "#d0d0d0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "20px", color: primaryColor, overflow: "hidden" }}>
              {data.profileImage
                ? <img src={data.profileImage} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : data.profile.name ? data.profile.name.split(" ").map(n => n[0]).join("") : "AJ"}
            </div>
            <label htmlFor="profile-upload" style={{ position: "absolute", bottom: -5, right: -5, background: primaryColor, color: "#fff", borderRadius: "50%", padding: "5px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FaCamera />
            </label>
            <input id="profile-upload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "22px", color: colors.black }}>{data.profile.name || defaultProfile.name}</h2>
            <div style={{ fontSize: "14px", color: primaryColor }}>{data.profile.email || defaultProfile.email}</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "15px", marginBottom: "25px", borderBottom: `2px solid ${colors.inputBorder}` }}>
          {["profile", "notifications", "preferences", "security"].map(tab => (
            <div key={tab} style={{ padding: "10px 18px", cursor: "pointer", borderBottom: activeTab === tab ? `3px solid ${primaryColor}` : "3px solid transparent", fontWeight: activeTab === tab ? "bold" : "normal", color: activeTab === tab ? primaryColor : colors.gray, transition: "0.3s" }} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </div>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "profile" && (
            <>
              {Object.entries(defaultProfile).map(([key, value]) => (
                <div key={key} style={{ display: "flex", flexDirection: "column", marginBottom: "20px" }}>
                  <input placeholder={value} value={data.profile[key]} onChange={e => manager.updateField("profile", key, e.target.value)} style={{ padding: "10px", borderRadius: "8px", border: `1px solid ${colors.inputBorder}`, backgroundColor: colors.inputBg, fontSize: "14px" }} />
                </div>
              ))}
              <button onClick={handleSave} style={buttonStyle(primaryColor)}>Save Changes</button>
            </>
          )}

          {activeTab === "notifications" && (
            <>
              {Object.keys(data.notifications).map(key => (
                <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ textTransform: "capitalize", fontSize: "14px" }}>{key.replace(/([A-Z])/g, " $1")}</span>
                  <label style={toggle}>
                    <input type="checkbox" checked={data.notifications[key]} onChange={() => manager.toggle("notifications", key)} style={{ display: "none" }} />
                    <span style={toggleSlider(data.notifications[key])}></span>
                    <span style={toggleCircle(data.notifications[key])}></span>
                  </label>
                </div>
              ))}
              <button onClick={handleSave} style={buttonStyle(primaryColor)}>Save Notifications</button>
            </>
          )}

          {activeTab === "preferences" && (
            <>
              <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                {["fahrenheit", "celsius"].map(u => (
                  <button key={u} onClick={() => manager.updateField("preferences", "temperatureUnit", u)} style={{ padding: "8px 12px", borderRadius: "6px", border: data.preferences.temperatureUnit === u ? `2px solid ${primaryColor}` : `1px solid ${colors.inputBorder}`, backgroundColor: data.preferences.temperatureUnit === u ? "#e3f4c5" : "#f0f0f0", cursor: "pointer" }}>{u === "fahrenheit" ? "°F" : "°C"}</button>
                ))}
              </div>
              {Object.entries({ "Auto-Lock Doors": data.preferences.autoLock, "Motion Detection": data.preferences.motionDetection }).map(([labelText, value]) => (
                <div key={labelText} style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", alignItems: "center" }}>
                  <span>{labelText}</span>
                  <label style={toggle}>
                    <input type="checkbox" checked={value} onChange={() => manager.toggle("preferences", labelText === "Auto-Lock Doors" ? "autoLock" : "motionDetection")} style={{ display: "none" }} />
                    <span style={toggleSlider(value)}></span>
                    <span style={toggleCircle(value)}></span>
                  </label>
                </div>
              ))}
              <button onClick={handleSave} style={buttonStyle(primaryColor)}>Save Preferences</button>
            </>
          )}

          {activeTab === "security" && (
            <>
              {["current", "new", "confirm"].map(key => (
                <div key={key} style={{ position: "relative", marginBottom: "20px" }}>
                  <input type={showPassword[key] ? "text" : "password"} placeholder={key === "current" ? "Current Password" : key === "new" ? "New Password" : "Confirm Password"} value={data.profile[key]} onChange={e => manager.updateField("security", key, e.target.value)} style={{ padding: "10px 40px 10px 10px", borderRadius: "8px", border: `1px solid ${colors.inputBorder}`, backgroundColor: colors.inputBg, width: "100%" }} />
                  <span onClick={() => setShowPassword({ ...showPassword, [key]: !showPassword[key] })} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: colors.gray, fontSize: "16px" }}>{showPassword[key] ? <FaEyeSlash /> : <FaEye />}</span>
                </div>
              ))}
              <button onClick={handleSave} style={buttonStyle(primaryColor)}>Update Security</button>
            </>
          )}
        </div>

        {/* Toast */}
        {showToast && (
          <div style={{ position: "fixed", bottom: "20px", right: "20px", backgroundColor: primaryColor, color: "#fff", padding: "12px 20px", borderRadius: "8px", fontSize: "14px", zIndex: 1000 }}>
            Settings saved successfully!
          </div>
        )}
      </div>

      <style>{`
        .fade-in { animation: fadeUp 0.6s ease forwards; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
    </Layout>
  );

  function buttonStyle(bgColor) {
    return { padding: "12px 25px", backgroundColor: bgColor, color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", marginTop: "10px" };
  }
};

export default Profile;
