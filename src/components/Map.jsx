import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/Map.css';
import mqtt from 'mqtt';

// Mengatasi masalah ikon Leaflet di React
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Fungsi untuk mendapatkan warna berdasarkan suhu
const getTemperatureColor = (temp) => {
  if (temp < 0) return '#3498db'; // Biru untuk suhu dingin
  if (temp < 10) return '#2ecc71'; // Hijau untuk suhu sejuk
  if (temp < 20) return '#f1c40f'; // Kuning untuk suhu normal
  if (temp < 30) return '#e67e22'; // Oranye untuk suhu hangat
  return '#e74c3c'; // Merah untuk suhu panas
};

// Membuat custom icon untuk marker suhu
const createTemperatureIcon = (temp) => {
  const color = getTemperatureColor(temp);
  return L.divIcon({
    className: 'temperature-marker',
    html: `<div style="background-color: ${color}; color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${temp}°C</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

const MapComponent = () => {
  // Posisi awal peta (Banda Aceh)
  const position = [5.5548, 95.3171];
  
  // Data lokasi kota dengan suhu (akan diperbarui dari MQTT)
  const [locations, setLocations] = useState([
    { name: "Banda Aceh", position: [5.5548, 95.3171], temp: 28, selected: true },
    { name: "Sabang", position: [5.8886, 95.3209], temp: 27 },
    { name: "Lhokseumawe", position: [5.1801, 97.1507], temp: 29 },
    { name: "Meulaboh", position: [4.1389, 96.1278], temp: 28 },
    { name: "Langsa", position: [4.4730, 97.9753], temp: 30 },
    { name: "Takengon", position: [4.6231, 96.8428], temp: 24 }
  ]);
  
  // Lokasi yang dipilih untuk ditampilkan detailnya
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
  
  useEffect(() => {
    // Koneksi ke broker MQTT
    const client = mqtt.connect('wss://broker.emqx.io:8084/mqtt');
    
    client.on('connect', () => {
      console.log('Terhubung ke broker MQTT untuk peta');
      // Subscribe ke topik suhu untuk berbagai kota
      client.subscribe('weather/+/temperature', (err) => {
        if (err) console.error('Gagal subscribe:', err);
      });
    });
    
    client.on('message', (topic, message) => {
      // Format topik: weather/cityname/temperature
      const cityName = topic.split('/')[1];
      const temperature = parseFloat(message.toString());
      
      // Update data lokasi dengan suhu baru
      setLocations(prevLocations => {
        return prevLocations.map(loc => {
          if (loc.name.toLowerCase() === cityName.toLowerCase()) {
            return { ...loc, temp: temperature };
          }
          return loc;
        });
      });
    });
    
    // Cleanup pada unmount
    return () => {
      client.end();
    };
  }, []);
  
  // Handler untuk memilih lokasi
  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setLocations(prevLocations => {
      return prevLocations.map(loc => ({
        ...loc,
        selected: loc.name === location.name
      }));
    });
  };
  
  return (
    <div className="map-container">
      <h2>Suhu di Aceh (°C)</h2>
      <MapContainer 
        center={position} 
        zoom={8} 
        style={{ height: '500px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        
        {locations.map((location, index) => (
          <Marker 
            key={index} 
            position={location.position}
            icon={createTemperatureIcon(location.temp)}
            eventHandlers={{
              click: () => handleLocationSelect(location)
            }}
          >
            <Popup>
              <strong>{location.name}</strong><br />
              Suhu: {location.temp}°C
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="attribution">Data Cuaca Aceh © BMKG Indonesia</div>
    </div>
  );
};

export default MapComponent;