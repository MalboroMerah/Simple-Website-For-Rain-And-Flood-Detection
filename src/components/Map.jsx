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

// Fungsi untuk mendapatkan warna berdasarkan kelembaban
const getHumidityColor = (humidity) => {
  if (humidity < 30) return '#e74c3c'; // Merah untuk kelembaban rendah
  if (humidity < 50) return '#e67e22'; // Oranye untuk kelembaban sedang rendah
  if (humidity < 70) return '#f1c40f'; // Kuning untuk kelembaban normal
  if (humidity < 85) return '#2ecc71'; // Hijau untuk kelembaban tinggi
  return '#3498db'; // Biru untuk kelembaban sangat tinggi
};

// Membuat custom icon untuk marker suhu dan kelembaban
const createSensorIcon = (temp, humidity) => {
  const tempColor = getTemperatureColor(temp);
  const humidityColor = getHumidityColor(humidity);
  return L.divIcon({
    className: 'sensor-marker',
    html: `<div style="position: relative; width: 50px; height: 50px;">
            <div style="position: absolute; top: 0; left: 0; background-color: ${tempColor}; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; justify-content: center; align-items: center; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${temp}°C</div>
            <div style="position: absolute; bottom: 0; right: 0; background-color: ${humidityColor}; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; justify-content: center; align-items: center; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${humidity}%</div>
          </div>`,
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -25]
  });
};

const MapComponent = () => {
  // Posisi awal peta (Banda Aceh)
  const position = [5.5548, 95.3171];
  
  // Data lokasi sensor dengan suhu dan kelembaban (akan diperbarui dari MQTT)
  const [locations, setLocations] = useState([
    { name: "Sensor 1 - Banda Aceh", position: [5.5548, 95.3171], temp: 28, humidity: 65, selected: true },
    { name: "Sensor 2 - Sabang", position: [5.8886, 95.3209], temp: 27, humidity: 70 },
    { name: "Sensor 3 - Lhokseumawe", position: [5.1801, 97.1507], temp: 29, humidity: 60 },
    { name: "Sensor 4 - Meulaboh", position: [4.1389, 96.1278], temp: 28, humidity: 68 },
    { name: "Sensor 5 - Langsa", position: [4.4730, 97.9753], temp: 30, humidity: 55 },
    { name: "Sensor 6 - Takengon", position: [4.6231, 96.8428], temp: 24, humidity: 75 }
  ]);
  
  // Data sensor dari ESP32/Wokwi
  const [sensorData, setSensorData] = useState({
    temp: 28,
    humidity: 65
  });
  
  // Lokasi yang dipilih untuk ditampilkan detailnya
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
  
  useEffect(() => {
    // Koneksi ke broker HiveMQ menggunakan WebSocket
    const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');
    
    client.on('connect', () => {
      console.log('Terhubung ke broker HiveMQ untuk peta');
      // Subscribe ke topik MQTT dari ESP32/Wokwi
      client.subscribe('usk/iot/mqtt/contoh', (err) => {
        if (err) console.error('Gagal subscribe:', err);
        else console.log('Berhasil subscribe ke topik usk/iot/mqtt/contoh');
      });
    });
    
    client.on('message', (topic, message) => {
      try {
        // Parse pesan JSON dari ESP32
        const data = JSON.parse(message.toString());
        console.log('Data diterima:', data);
        
        if (data.temp !== undefined && data.humidity !== undefined) {
          // Update data sensor
          setSensorData({
            temp: data.temp,
            humidity: data.humidity
          });
          
          // Update data lokasi sensor pertama dengan data dari ESP32
          setLocations(prevLocations => {
            return prevLocations.map((loc, index) => {
              if (index === 0) { // Update sensor pertama (Banda Aceh)
                return { ...loc, temp: data.temp, humidity: data.humidity };
              }
              return loc;
            });
          });
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
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
            icon={createSensorIcon(location.temp, location.humidity)}
            eventHandlers={{
              click: () => handleLocationSelect(location)
            }}
          >
            <Popup>
              <strong>{location.name}</strong><br />
              Suhu: {location.temp}°C<br />
              Kelembaban: {location.humidity}%
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="sensor-info">
        <h3>Data Sensor Terbaru</h3>
        <p>Suhu: {sensorData.temp}°C</p>
        <p>Kelembaban: {sensorData.humidity}%</p>
      </div>
      <div className="attribution">Data Sensor IoT © ESP32 via HiveMQ</div>
    </div>
  );
};

export default MapComponent;