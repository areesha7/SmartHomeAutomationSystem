
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Dashboard      from "./Pages/Home";
import Rooms          from "./Pages/Rooms";
import Automations    from "./Pages/Automations";
import Profile        from "./Pages/Profile";
import RoomDetail     from "./Pages/RoomDetail";
import Analytics      from "./Pages/Analytics";
import Settings       from "./Pages/Settings";
import Notifications  from "./Pages/Notifications";
import Login          from "./Pages/Login";
import Signup         from "./Pages/Signup";
import CreateHome     from "./Pages/Createhome";
import ModelingSimulation from "./Pages/ModelingSimulation";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />}   />
      <Route path="/signup" element={<Signup />}  />

      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}    />
      <Route path="/rooms"  element={<ProtectedRoute><Rooms /></ProtectedRoute>}        />
      <Route path="/rooms/:id" element={<ProtectedRoute><RoomDetail /></ProtectedRoute>}   />
      <Route path="/automations" element={<ProtectedRoute><Automations /></ProtectedRoute>}  />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>}      />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>}    />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>}     />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>}/>
      <Route path="/create-home" element={<ProtectedRoute><CreateHome /></ProtectedRoute>}   />
      <Route path="/modeling" element={<ProtectedRoute><ModelingSimulation /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;