// // import { useState } from 'react'
// // import reactLogo from './assets/react.svg'
// // import viteLogo from '/vite.svg'
// import './App.css'
// import Dashboard from './Pages/Home.jsx'

// function App() {
//   return <Dashboard />;
// }

// export default App;


import { Routes, Route } from "react-router-dom";

import Dashboard from "./Pages/Home";
import Rooms from "./Pages/Rooms";
// import Automations from "./Pages/Automations";
// import Analytics from "./Pages/Analytics";
import Profile from "./Pages/Profile";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/rooms" element={<Rooms />} />
      {/* <Route path="/automations" element={<Automations />} />
      <Route path="/analytics" element={<Analytics />} /> */}
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default App;