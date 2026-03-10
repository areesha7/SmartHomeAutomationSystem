import { Routes, Route } from "react-router-dom";

import Dashboard     from "./Pages/Home";
import Rooms         from "./Pages/Rooms";
import Automations   from "./Pages/Automations";
import Profile       from "./Pages/Profile";
import RoomDetail    from "./Pages/RoomDetail";
import Analytics from "./Pages/Analytics";
import Settings      from "./Pages/Settings";
import Notifications from "./Pages/Notifications";
import Login         from "./Pages/Login";
import Signup        from "./Pages/Signup";

function App() {
  return (
    <Routes>
      <Route path="/"  element={<Dashboard />}/>
      <Route path="/rooms" element={<Rooms />} />
      <Route path="/rooms/:id" element={<RoomDetail />} />
      <Route path="/automations" element={<Automations />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/analytics" element={<Analytics />} /> 
      <Route path="/settings"  element={<Settings />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/login" element={<Login />}  />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}

export default App;