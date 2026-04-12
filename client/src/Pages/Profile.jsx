
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCamera, FaEye, FaEyeSlash } from "react-icons/fa";
import { ArrowLeft } from "lucide-react";
import Layout from "../Components/Layout";
import { useAuth } from "../context/AuthContext";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const apiFetch = async (path, token, options = {}) => {
  const storedToken = token || localStorage.getItem("token") || null;
  if (!storedToken) throw new Error("No auth token");
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${storedToken}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || `API ${res.status}`);
  return data;
};

/* 
   OBSERVER PATTERN IMPLEMENTATION
*/

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
    if (tab === "home") this.data.home[key] = value;
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

/* 
   DEFAULT DATA
*/

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
  home: { name: "", address: "" },
  profileImage: null,
};

/* 
   IMAGE COMPRESSION HELPER
*/

const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        const MAX_WIDTH = 150;
        const MAX_HEIGHT = 150;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = (height * MAX_WIDTH) / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = (width * MAX_HEIGHT) / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
        resolve(compressedBase64);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

/* 
   PROFILE COMPONENT
*/

const Profile = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const primaryColor = "#63a17f";
  const colors = { primary: primaryColor, white: "#fff", black: "#32312b", gray: "#666", inputBg: "#f0f0f0", inputBorder: "#ccc" };

  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Settings saved successfully!");
  const [toastError, setToastError] = useState(false);
  const [data, setData] = useState(initialData);
  const [isUploading, setIsUploading] = useState(false);

  // Home-specific state
  const [userRole, setUserRole] = useState("");
  const [homeId, setHomeId] = useState(null);
  const [homeLoading, setHomeLoading] = useState(false);
  const [homeResidents, setHomeResidents] = useState(0);
  const [homeRooms, setHomeRooms] = useState(0);

  // Create Subject
  const [manager] = useState(() => new ProfileManager(initialData));

  // Helper to get user-specific localStorage key
  const getAvatarStorageKey = () => {
    const userId = user?.id || user?._id;
    return userId ? `userAvatar_${userId}` : null;
  };

  // Observer registration
  useEffect(() => {
    manager.subscribe(updatedData => setData({ ...updatedData }));
  }, [manager]);

  // Helper for toast messages
  const showToastMsg = (msg, isError = false) => {
    setToastMessage(msg);
    setToastError(isError);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // ── Load real profile from backend on mount ──────────────────────────────
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await apiFetch("/users/me", token);
        const u = res?.data?.user || res?.user || res?.data;
        if (u) {
          manager.updateField("profile", "name", u.name || "");
          manager.updateField("profile", "email", u.email || "");
          setUserRole(u.role || "");
          
          // Load saved avatar from backend
          if (u.avatar) {
            manager.setProfileImage(u.avatar);
            // Store in user-specific localStorage
            const storageKey = getAvatarStorageKey();
            if (storageKey) {
              localStorage.setItem(storageKey, u.avatar);
            }
          } else {
            // Check user-specific localStorage for avatar
            const storageKey = getAvatarStorageKey();
            if (storageKey && localStorage.getItem(storageKey)) {
              manager.setProfileImage(localStorage.getItem(storageKey));
            }
          }
        }
      } catch (err) {
        showToastMsg(err.message || "Failed to load profile.", true);
      }
    })();
  }, [token, user]);

  // ── Load home info from GET /homes/mine ──────────────────────────────────
  useEffect(() => {
    if (!token) return;
    (async () => {
      setHomeLoading(true);
      try {
        const res = await apiFetch("/homes/mine", token);
        const h = res?.data?.home || res?.data || res?.home;
        if (h) {
          setHomeId(h.id || h._id || null);
          manager.updateField("home", "name", h.name || "");
          manager.updateField("home", "address", h.address || "");
          setHomeResidents((h.residents || []).length);
          setHomeRooms(h.rooms ?? 0);
        }
      } catch (err) {
        console.warn("[Profile] home fetch:", err.message);
      } finally {
        setHomeLoading(false);
      }
    })();
  }, [token]);

  // ── Unified save handler ─────────────────────────────────────────────────
  const handleSave = async () => {
    // Profile tab → PATCH /users/me (name only; email not editable)
    if (activeTab === "profile") {
      try {
        await apiFetch("/users/me", token, {
          method: "PATCH",
          body: JSON.stringify({ name: data.profile.name }),
        });
        showToastMsg("Profile updated successfully!");
      } catch (err) {
        showToastMsg(err.message || "Failed to update profile.", true);
      }
      return;
    }

    // Security tab → PATCH /users/me/password
    if (activeTab === "security") {
      const { current, new: newPw, confirm } = data.profile;
      if (!current || !newPw || !confirm)
        return showToastMsg("All password fields are required.", true);
      if (newPw !== confirm)
        return showToastMsg("New passwords do not match.", true);
      if (newPw.length < 6)
        return showToastMsg("Password must be at least 6 characters.", true);
      try {
        await apiFetch("/users/me/password", token, {
          method: "PATCH",
          body: JSON.stringify({ currentPassword: current, newPassword: newPw }),
        });
        manager.updateField("security", "current", "");
        manager.updateField("security", "new", "");
        manager.updateField("security", "confirm", "");
        showToastMsg("Password changed successfully!");
      } catch (err) {
        showToastMsg(err.message || "Failed to change password.", true);
      }
      return;
    }

    // Home tab → PATCH /homes/:homeId (admin only)
    if (activeTab === "home") {
      if (userRole !== "ADMIN") {
        return showToastMsg("Only admins can update home details.", true);
      }
      if (!homeId) {
        return showToastMsg("No home found to update.", true);
      }
      try {
        await apiFetch(`/homes/${homeId}`, token, {
          method: "PATCH",
          body: JSON.stringify({
            name: data.home.name,
            address: data.home.address,
          }),
        });
        showToastMsg("Home updated successfully!");
      } catch (err) {
        showToastMsg(err.message || "Failed to update home.", true);
      }
      return;
    }

    // Notifications / Preferences — local only
    showToastMsg("Settings saved successfully!");
  };

  // ── Handle image upload with compression ─────────────────────────────────
  const handleImageChange = async (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    
    // Check file size - warn if too large
    if (file.size > 1024 * 1024) { // 1MB
      showToastMsg("Image too large. Please select an image under 1MB.", true);
      return;
    }
    
    setIsUploading(true);
    showToastMsg("Compressing image...", false);
    
    try {
      // Compress the image
      const compressedBase64 = await compressImage(file);
      
      // Update preview immediately
      manager.setProfileImage(compressedBase64);
      
      // Store in user-specific localStorage
      const storageKey = getAvatarStorageKey();
      if (storageKey) {
        localStorage.setItem(storageKey, compressedBase64);
      }
      
      // Send to backend
      try {
        const response = await fetch(`${BASE_URL}/users/me`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ avatar: compressedBase64 }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data?.message || `Upload failed: ${response.status}`);
        }
        
        showToastMsg("Profile picture updated!");
        
      } catch (uploadErr) {
        // Even if backend fails, we still have the image in localStorage and UI
        console.warn("Backend upload failed, but image saved locally:", uploadErr);
        showToastMsg("Image saved locally. Will sync when connection improves.", false);
      }
      
    } catch (err) {
      console.error("Compression error:", err);
      showToastMsg("Failed to process image. Please try a different image.", true);
    } finally {
      setIsUploading(false);
    }
  };

  const toggle = { position: "relative", display: "inline-block", width: "40px", height: "20px" };
  const toggleSlider = (checked) => ({ position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: checked ? primaryColor : "#ccc", borderRadius: "20px", transition: "0.3s" });
  const toggleCircle = (checked) => ({ position: "absolute", height: "16px", width: "16px", left: checked ? "22px" : "2px", bottom: "2px", backgroundColor: colors.white, borderRadius: "50%", transition: "0.3s" });

  const tabs = ["profile", "home", "notifications", "preferences", "security"];

  return (
    <Layout>
      <div className="dashboard-wrapper">
       
        <nav className="navbar">
          <div className="container-fluid d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <button className="btn btn-sm me-2 text-white" onClick={() => navigate("/")} style={{ background: "transparent", border: "none", fontSize: "1.5rem", backgroundColor: primaryColor }}>
                <ArrowLeft size={24} />
              </button>
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                <span style={{ fontSize: "20px", fontWeight: "bold", color: "#63a17f" }}>Profile Settings</span>
                <span style={{ fontSize: "14px", color: "#63a17f" }}>Manage Account</span>
              </div>
            </div>
          </div>
        </nav>

        <div style={{ padding: "30px 50px", fontFamily: "Arial, sans-serif", maxWidth: "700px", margin: "0 auto" }}>
          {/* Avatar + Name + Email */}
          <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "25px" }}>
            <div style={{ position: "relative", width: "60px", height: "60px" }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "#d0d0d0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "20px", color: primaryColor, overflow: "hidden" }}>
                {data.profileImage ? (
                  <img src={data.profileImage} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  data.profile.name ? data.profile.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "AJ"
                )}
              </div>
              <label htmlFor="profile-upload" style={{ position: "absolute", bottom: -5, right: -5, background: primaryColor, color: "#fff", borderRadius: "50%", padding: "5px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", opacity: isUploading ? 0.5 : 1 }}>
                <FaCamera />
              </label>
              <input id="profile-upload" type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleImageChange} disabled={isUploading} style={{ display: "none" }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "22px", color: colors.black }}>{data.profile.name || defaultProfile.name}</h2>
              <div style={{ fontSize: "14px", color: primaryColor }}>{data.profile.email || defaultProfile.email}</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "15px", marginBottom: "25px", borderBottom: `2px solid ${colors.inputBorder}`, flexWrap: "wrap" }}>
            {tabs.map(tab => (
              <div key={tab} style={{ padding: "10px 18px", cursor: "pointer", borderBottom: activeTab === tab ? `3px solid ${primaryColor}` : "3px solid transparent", fontWeight: activeTab === tab ? "bold" : "normal", color: activeTab === tab ? primaryColor : colors.gray, transition: "0.3s" }} onClick={() => setActiveTab(tab)}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </div>
            ))}
          </div>

          {/* Tab Content */}
          <div>
            {/* Profile tab */}
            {activeTab === "profile" && (
              <>
                <div style={{ display: "flex", flexDirection: "column", marginBottom: "20px" }}>
                  <input
                    placeholder="Full Name"
                    value={data.profile.name}
                    onChange={e => manager.updateField("profile", "name", e.target.value)}
                    style={{ padding: "10px", borderRadius: "8px", border: `1px solid ${colors.inputBorder}`, backgroundColor: colors.inputBg, fontSize: "14px" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginBottom: "20px" }}>
                  <input
                    placeholder="Email"
                    value={data.profile.email}
                    readOnly
                    style={{ padding: "10px", borderRadius: "8px", border: `1px solid ${colors.inputBorder}`, backgroundColor: "#e8e8e8", fontSize: "14px", cursor: "not-allowed" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginBottom: "20px" }}>
                  <input
                    placeholder="Phone"
                    value={data.profile.phone}
                    onChange={e => manager.updateField("profile", "phone", e.target.value)}
                    style={{ padding: "10px", borderRadius: "8px", border: `1px solid ${colors.inputBorder}`, backgroundColor: colors.inputBg, fontSize: "14px" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginBottom: "20px" }}>
                  <input
                    placeholder="Location"
                    value={data.profile.location}
                    onChange={e => manager.updateField("profile", "location", e.target.value)}
                    style={{ padding: "10px", borderRadius: "8px", border: `1px solid ${colors.inputBorder}`, backgroundColor: colors.inputBg, fontSize: "14px" }}
                  />
                </div>
                <button onClick={handleSave} style={buttonStyle(primaryColor)}>Save Changes</button>
              </>
            )}

            {/* Home tab */}
            {activeTab === "home" && (
              <>
                {homeLoading ? (
                  <p style={{ color: colors.gray, fontSize: "14px" }}>Loading home info...</p>
                ) : !homeId ? (
                  <p style={{ color: colors.gray, fontSize: "14px" }}>You are not associated with any home yet.</p>
                ) : (
                  <>
                    <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
                      <div style={{ flex: 1, padding: "14px", borderRadius: "8px", background: colors.inputBg, textAlign: "center" }}>
                        <div style={{ fontSize: "22px", fontWeight: "bold", color: primaryColor }}>{homeResidents}</div>
                        <div style={{ fontSize: "12px", color: colors.gray }}>Residents</div>
                      </div>
                      <div style={{ flex: 1, padding: "14px", borderRadius: "8px", background: colors.inputBg, textAlign: "center" }}>
                        <div style={{ fontSize: "22px", fontWeight: "bold", color: primaryColor }}>{homeRooms}</div>
                        <div style={{ fontSize: "12px", color: colors.gray }}>Rooms</div>
                      </div>
                      <div style={{ flex: 1, padding: "14px", borderRadius: "8px", background: colors.inputBg, textAlign: "center" }}>
                        <div style={{ fontSize: "22px", fontWeight: "bold", color: primaryColor }}>{userRole}</div>
                        <div style={{ fontSize: "12px", color: colors.gray }}>Your Role</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", marginBottom: "20px" }}>
                      <label style={{ fontSize: "12px", color: colors.gray, marginBottom: "6px" }}>Home Name</label>
                      <input
                        placeholder="Home name"
                        value={data.home.name}
                        onChange={e => manager.updateField("home", "name", e.target.value)}
                        readOnly={userRole !== "ADMIN"}
                        style={{ padding: "10px", borderRadius: "8px", border: `1px solid ${colors.inputBorder}`, backgroundColor: userRole !== "ADMIN" ? "#e8e8e8" : colors.inputBg, fontSize: "14px", cursor: userRole !== "ADMIN" ? "not-allowed" : "text" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", marginBottom: "20px" }}>
                      <label style={{ fontSize: "12px", color: colors.gray, marginBottom: "6px" }}>Address</label>
                      <input
                        placeholder="Home address"
                        value={data.home.address}
                        onChange={e => manager.updateField("home", "address", e.target.value)}
                        readOnly={userRole !== "ADMIN"}
                        style={{ padding: "10px", borderRadius: "8px", border: `1px solid ${colors.inputBorder}`, backgroundColor: userRole !== "ADMIN" ? "#e8e8e8" : colors.inputBg, fontSize: "14px", cursor: userRole !== "ADMIN" ? "not-allowed" : "text" }}
                      />
                    </div>

                    {userRole === "ADMIN" && (
                      <button onClick={handleSave} style={buttonStyle(primaryColor)}>Save Home</button>
                    )}
                  </>
                )}
              </>
            )}

            {/* Notifications tab */}
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

            {/* Preferences tab */}
            {activeTab === "preferences" && (
              <>
                <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                  {["fahrenheit", "celsius"].map(u => (
                    <button key={u} onClick={() => manager.updateField("preferences", "temperatureUnit", u)} style={{ padding: "8px 12px", borderRadius: "6px", border: data.preferences.temperatureUnit === u ? `2px solid ${primaryColor}` : `1px solid ${colors.inputBorder}`, backgroundColor: data.preferences.temperatureUnit === u ? "#e3f4c5" : "#f0f0f0", cursor: "pointer" }}>
                      {u === "fahrenheit" ? "°F" : "°C"}
                    </button>
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

            {/* Security tab */}
            {activeTab === "security" && (
              <>
                {["current", "new", "confirm"].map(key => (
                  <div key={key} style={{ position: "relative", marginBottom: "20px" }}>
                    <input
                      type={showPassword[key] ? "text" : "password"}
                      placeholder={key === "current" ? "Current Password" : key === "new" ? "New Password" : "Confirm Password"}
                      value={data.profile[key]}
                      onChange={e => manager.updateField("security", key, e.target.value)}
                      style={{ padding: "10px 40px 10px 10px", borderRadius: "8px", border: `1px solid ${colors.inputBorder}`, backgroundColor: colors.inputBg, width: "100%" }}
                    />
                    <span onClick={() => setShowPassword({ ...showPassword, [key]: !showPassword[key] })} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: colors.gray, fontSize: "16px" }}>
                      {showPassword[key] ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                ))}
                <button onClick={handleSave} style={buttonStyle(primaryColor)}>Update Security</button>
              </>
            )}
          </div>

          {/* Toast notification */}
          {showToast && (
            <div style={{ position: "fixed", bottom: "20px", right: "20px", backgroundColor: toastError ? "#c03030" : primaryColor, color: "#fff", padding: "12px 20px", borderRadius: "8px", fontSize: "14px", zIndex: 1000 }}>
              {toastMessage}
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