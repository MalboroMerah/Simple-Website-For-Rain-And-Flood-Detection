import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import MapComponent from './components/Map';
import SensorData from './components/SensorData';
import About from './components/About';
import './App.css';

// Import Font Awesome untuk ikon di navbar
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="content-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/peta" element={<MapComponent />} />
            <Route path="/statistik" element={<SensorData />} />
            <Route path="/tentang" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
