// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useAuth } from "../context/AuthContext";
// import InviteResident from "../Components/InviteResident";

// const API_URL = import.meta.env.VITE_API_URL;

// export default function HomeAdmin() {
//   const { token, user } = useAuth();
//   const [home, setHome] = useState(null);
//   const [invitations, setInvitations] = useState([]);
//   const [residents, setResidents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // Fetch user's home
//   useEffect(() => {
//     const fetchHome = async () => {
//       try {
//         console.log("Fetching home for user:", user?.id);
//         const response = await axios.get(`${API_URL}/homes/mine`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         console.log("Home response:", response.data);
        
//         const homeData = response.data?.data?.home || response.data?.home;
//         setHome(homeData);
        
//         if (homeData) {
//           const homeId = homeData.id || homeData._id;
//           fetchInvitations(homeId);
//           fetchResidents(homeId);
//         }
//       } catch (err) {
//         console.error("Error fetching home:", err);
//         setError("Could not load home information");
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchHome();
//   }, [token, user]);

//   // Fetch invitations for this home
//   const fetchInvitations = async (homeId) => {
//     try {
//       console.log("Fetching invitations for home:", homeId);
      
//       const response = await axios.get(
//         `${API_URL}/homes/${homeId}/invitations`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
      
//       const invitationsData = response.data?.data || response.data || [];
//       setInvitations(Array.isArray(invitationsData) ? invitationsData : []);
//       console.log("Invitations:", invitationsData);
//     } catch (err) {
//       console.error("Error fetching invitations:", err);
//     }
//   };

//   // Fetch residents for this home
//   const fetchResidents = async (homeId) => {
//     try {
//       console.log("Fetching residents for home:", homeId);
      
//       const response = await axios.get(
//         `${API_URL}/homes/${homeId}/residents`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
      
//       const residentsData = response.data?.data || response.data || [];
//       setResidents(Array.isArray(residentsData) ? residentsData : []);
//       console.log("Residents:", residentsData);
//     } catch (err) {
//       console.error("Error fetching residents:", err);
//     }
//   };

//   const handleCancelInvitation = async (invitationId) => {
//     try {
//       const homeId = home.id || home._id;
      
//       await axios.delete(
//         `${API_URL}/homes/${homeId}/invitations/${invitationId}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
      
//       fetchInvitations(homeId);
//     } catch (err) {
//       console.error("Error cancelling invitation:", err);
//       setError("Failed to cancel invitation");
//     }
//   };

//   const handleRemoveResident = async (residentId) => {
//     try {
//       const homeId = home.id || home._id;
      
//       await axios.delete(
//         `${API_URL}/homes/${homeId}/residents/${residentId}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
      
//       fetchResidents(homeId);
//     } catch (err) {
//       console.error("Error removing resident:", err);
//       setError("Failed to remove resident");
//     }
//   };

//   if (loading) {
//     return <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>;
//   }

//   if (!home) {
//     return (
//       <div style={{ padding: "40px", textAlign: "center" }}>
//         <h3>No Home Found</h3>
//         <p>You need to create a home first to invite residents.</p>
//         <button 
//           onClick={() => window.location.href = "/create-home"}
//           style={{
//             padding: "10px 20px",
//             background: "#63a17f",
//             color: "white",
//             border: "none",
//             borderRadius: "8px",
//             cursor: "pointer"
//           }}
//         >
//           Create Home
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
//       <h2>Home Management</h2>
//       <p style={{ color: "#666", marginBottom: "30px" }}>
//         Manage your home: <strong>{home.name}</strong>
//       </p>

//       {/* Invite Resident Section */}
//       <InviteResident 
//         homeId={home.id || home._id} 
//         onInviteSent={() => fetchInvitations(home.id || home._id)}
//       />

//       {/* Current Residents */}
//       <div style={{ marginTop: "30px", padding: "20px", background: "#f9f9f9", borderRadius: "12px" }}>
//         <h3>Current Residents ({residents.length})</h3>
//         {residents.length > 0 ? (
//           <ul style={{ listStyle: "none", padding: 0 }}>
//             {residents.map((resident) => (
//               <li key={resident._id || resident.id} style={{ 
//                 padding: "12px", 
//                 borderBottom: "1px solid #eee",
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center"
//               }}>
//                 <div>
//                   <strong>{resident.name}</strong>
//                   <span style={{ marginLeft: "10px", fontSize: "12px", color: "#666" }}>
//                     {resident.email}
//                   </span>
//                   {resident.role === "ADMIN" && (
//                     <span style={{ marginLeft: "10px", fontSize: "11px", background: "#63a17f20", padding: "2px 8px", borderRadius: "12px", color: "#63a17f" }}>
//                       Admin
//                     </span>
//                   )}
//                 </div>
//                 {resident.role !== "ADMIN" && (
//                   <button
//                     onClick={() => handleRemoveResident(resident._id || resident.id)}
//                     style={{
//                       padding: "4px 12px",
//                       background: "#fee",
//                       color: "#c03030",
//                       border: "1px solid #fcc",
//                       borderRadius: "6px",
//                       cursor: "pointer",
//                       fontSize: "12px"
//                     }}
//                   >
//                     Remove
//                   </button>
//                 )}
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <p style={{ color: "#aaa" }}>No residents yet. Invite some!</p>
//         )}
//       </div>

//       {/* Pending Invitations */}
//       {invitations.length > 0 && (
//         <div style={{ marginTop: "30px", padding: "20px", background: "#f9f9f9", borderRadius: "12px" }}>
//           <h3>Pending Invitations ({invitations.length})</h3>
//           <div>
//             {invitations.map((invite) => (
//               <div key={invite._id} style={{ 
//                 padding: "12px", 
//                 borderBottom: "1px solid #eee",
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center"
//               }}>
//                 <div>
//                   <strong>{invite.email}</strong>
//                   {invite.createdAt && (
//                     <span style={{ marginLeft: "10px", fontSize: "12px", color: "#888" }}>
//                       Sent: {new Date(invite.createdAt).toLocaleDateString()}
//                     </span>
//                   )}
//                   {invite.expiresAt && (
//                     <span style={{ marginLeft: "10px", fontSize: "12px", color: "#f90" }}>
//                       Expires: {new Date(invite.expiresAt).toLocaleDateString()}
//                     </span>
//                   )}
//                 </div>
//                 <button
//                   onClick={() => handleCancelInvitation(invite._id)}
//                   style={{
//                     padding: "4px 12px",
//                     background: "#fee",
//                     color: "#c03030",
//                     border: "1px solid #fcc",
//                     borderRadius: "6px",
//                     cursor: "pointer",
//                     fontSize: "12px"
//                   }}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {error && (
//         <div style={{ 
//           marginTop: "20px", 
//           padding: "10px", 
//           background: "#fee", 
//           color: "#c03030", 
//           borderRadius: "8px",
//           fontSize: "13px"
//         }}>
//           {error}
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import InviteResident from "../Components/InviteResident";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function HomeAdmin() {
  const { token, user } = useAuth();
  const [home, setHome] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch user's home
  useEffect(() => {
    const fetchHome = async () => {
      try {
        console.log("Fetching home for user:", user?.id);
        const response = await axios.get(`${API_URL}/homes/mine`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Home response:", response.data);
        
        const homeData = response.data?.data?.home || response.data?.home;
        setHome(homeData);
        
        if (homeData) {
          const homeId = homeData.id || homeData._id;
          fetchInvitations(homeId);
          fetchResidents(homeId);
        }
      } catch (err) {
        console.error("Error fetching home:", err);
        if (err.response?.status === 404) {
          setError("You haven't created a home yet. Please create a home first.");
        } else {
          setError("Could not load home information");
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchHome();
    }
  }, [token, user]);

  // Fetch invitations for this home
  const fetchInvitations = async (homeId) => {
    try {
      console.log("Fetching invitations for home:", homeId);
      
      const response = await axios.get(
        `${API_URL}/homes/${homeId}/invitations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Handle different response structures
      let invitationsData = response.data?.data?.invitations || 
                           response.data?.invitations || 
                           response.data?.data || 
                           [];
      setInvitations(Array.isArray(invitationsData) ? invitationsData : []);
      console.log("Invitations:", invitationsData);
    } catch (err) {
      console.error("Error fetching invitations:", err);
    }
  };

  // Fetch residents for this home
  const fetchResidents = async (homeId) => {
    try {
      console.log("Fetching residents for home:", homeId);
      
      const response = await axios.get(
        `${API_URL}/homes/${homeId}/residents`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Handle different response structures
      let residentsData = response.data?.data?.residents || 
                         response.data?.residents || 
                         response.data?.data || 
                         [];
      setResidents(Array.isArray(residentsData) ? residentsData : []);
      console.log("Residents:", residentsData);
    } catch (err) {
      console.error("Error fetching residents:", err);
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    try {
      const homeId = home.id || home._id;
      
      await axios.delete(
        `${API_URL}/homes/${homeId}/invitations/${invitationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchInvitations(homeId);
    } catch (err) {
      console.error("Error cancelling invitation:", err);
      setError("Failed to cancel invitation");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleRemoveResident = async (residentId) => {
    try {
      const homeId = home.id || home._id;
      
      await axios.delete(
        `${API_URL}/homes/${homeId}/residents/${residentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchResidents(homeId);
    } catch (err) {
      console.error("Error removing resident:", err);
      setError("Failed to remove resident");
      setTimeout(() => setError(""), 3000);
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>;
  }

  if (!home) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h3>No Home Found</h3>
        <p>You need to create a home first to invite residents.</p>
        <button 
          onClick={() => window.location.href = "/create-home"}
          style={{
            padding: "10px 20px",
            background: "#2e8b57",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            marginTop: "16px"
          }}
        >
          Create Home
        </button>
      </div>
    );
  }

  const homeId = home.id || home._id;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ margin: 0, color: "#1a1a1a" }}>Home Management</h2>
        <p style={{ color: "#666", marginTop: "8px" }}>
          Manage your home: <strong style={{ color: "#2e8b57" }}>{home.name}</strong>
        </p>
        {home.address && (
          <p style={{ color: "#888", fontSize: "13px", marginTop: "4px" }}>
            📍 {home.address}
          </p>
        )}
      </div>

      {/* Invite Resident Section */}
      <InviteResident 
        homeId={homeId}
        onInviteSent={() => fetchInvitations(homeId)}
      />

      {/* Current Residents */}
      <div style={{ marginTop: "30px", padding: "20px", background: "#f9f9f9", borderRadius: "12px" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "18px" }}>
          Current Residents ({residents.length})
        </h3>
        {residents.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {residents.map((resident) => (
              <li key={resident._id || resident.id} style={{ 
                padding: "12px", 
                borderBottom: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <strong>{resident.name || resident.email}</strong>
                  {resident.email && (
                    <span style={{ marginLeft: "10px", fontSize: "12px", color: "#666" }}>
                      {resident.email}
                    </span>
                  )}
                  {resident.role === "ADMIN" && (
                    <span style={{ 
                      marginLeft: "10px", 
                      fontSize: "11px", 
                      background: "#2e8b5720", 
                      padding: "2px 8px", 
                      borderRadius: "12px", 
                      color: "#2e8b57" 
                    }}>
                      Admin
                    </span>
                  )}
                </div>
                {resident.role !== "ADMIN" && (
                  <button
                    onClick={() => handleRemoveResident(resident._id || resident.id)}
                    style={{
                      padding: "4px 12px",
                      background: "#fee",
                      color: "#c03030",
                      border: "1px solid #fcc",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "#aaa", margin: 0 }}>No residents yet. Invite some!</p>
        )}
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div style={{ marginTop: "30px", padding: "20px", background: "#fff8f0", borderRadius: "12px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "18px" }}>
            Pending Invitations ({invitations.length})
          </h3>
          <div>
            {invitations.map((invite) => (
              <div key={invite._id} style={{ 
                padding: "12px", 
                borderBottom: "1px solid #f0e0cc",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <strong>{invite.email}</strong>
                  {invite.createdAt && (
                    <span style={{ marginLeft: "10px", fontSize: "12px", color: "#888" }}>
                      Sent: {new Date(invite.createdAt).toLocaleDateString()}
                    </span>
                  )}
                  {invite.expiresAt && (
                    <span style={{ marginLeft: "10px", fontSize: "12px", color: "#f90" }}>
                      Expires: {new Date(invite.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleCancelInvitation(invite._id)}
                  style={{
                    padding: "4px 12px",
                    background: "#fee",
                    color: "#c03030",
                    border: "1px solid #fcc",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px"
                  }}
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div style={{ 
          marginTop: "20px", 
          padding: "10px", 
          background: "#fee", 
          color: "#c03030", 
          borderRadius: "8px",
          fontSize: "13px"
        }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}