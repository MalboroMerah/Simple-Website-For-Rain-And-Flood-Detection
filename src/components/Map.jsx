import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
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

// Fungsi untuk membuat ikon berdasarkan status banjir
const createSensorIcon = (status) => {
  let className = 'sensor-marker';
  let label = '';

  // Hanya tampilkan status banjir atau aman
  if (status === 'Berpotensi Banjir') {
    className += ' banjir';
    label = 'Banjir';
  } else {
    className += ' aman';
    label = 'Aman';
  }

  return L.divIcon({
    className,
    html: `<div>${label}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

const MapComponent = () => {
  const position = [5.560139, 95.3443647]; // Pusat peta

  // Tambahkan lebih banyak lokasi sensor untuk demonstrasi
  const [locations, setLocations] = useState([
    { 
      name: "Sensor 1 - Darussalam", 
      position: [5.5731363, 95.3664551], 
      status: "Aman",
      selected: true 
    },
    { 
      name: "Sensor 2 - Ulee Kareng", 
      position: [5.5474374, 95.3378723], 
      status: "Aman"
    },
    { 
      name: "Sensor 3 - Syiah Kuala", 
      position: [5.5823, 95.3683], 
      status: "Aman"
    },
    { 
      name: "Sensor 4 - Banda Aceh", 
      position: [5.5482, 95.3235], 
      status: "Aman"
    },
    { 
      name: "Sensor 5 - Krueng Aceh", 
      position: [5.5612, 95.3345], 
      status: "Aman"
    },
  ]);

  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

    client.on('connect', () => {
      console.log('Terhubung ke broker HiveMQ untuk peta');
      setConnectionStatus('connected');
      client.subscribe('sensor/banjir', (err) => {
        if (err) {
          console.error('Gagal subscribe:', err);
          setConnectionStatus('error');
        }
      });
    });

    client.on('message', (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Data diterima dari ESP32:', data);

        // Update sensor pertama (Darussalam) dengan data real
        setLocations(prevLocations =>
          prevLocations.map((loc, index) =>
            index === 0
              ? { 
                  ...loc, 
                  status: data.final_status
                }
              : loc
          )
        );

        // Simulasi perubahan status acak pada sensor lain untuk demonstrasi
        if (Math.random() > 0.7) {
          const randomIndex = Math.floor(Math.random() * (locations.length - 1)) + 1;
          const newStatus = Math.random() > 0.5 ? "Berpotensi Banjir" : "Aman";
          
          setLocations(prevLocations =>
            prevLocations.map((loc, index) =>
              index === randomIndex
                ? { ...loc, status: newStatus }
                : loc
            )
          );
        }

        setLastUpdate(new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Error parsing MQTT message:', error);
        setConnectionStatus('error');
      }
    });

    client.on('error', () => {
      setConnectionStatus('error');
    });

    client.on('close', () => {
      setConnectionStatus('disconnected');
    });

    client.on('reconnect', () => {
      setConnectionStatus('connecting');
    });

    return () => {
      client.end();
    };
  }, []);

  return (
    <div className="map-fullscreen-container">
      <div className="map-status-bar">
        <div className="connection-info">
          <div className={`mqtt-status-dot mqtt-${connectionStatus}`}></div>
          <span className="connection-label">MQTT</span>
          {lastUpdate && (
            <div className="last-update">
              Update: {lastUpdate}
            </div>
          )}
        </div>
      </div>

      <MapContainer 
        center={position} 
        zoom={13} 
        zoomControl={false}
        style={{ height: '100vh', width: '100%' }}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {locations.map((location, index) => {
          const sensorIcon = createSensorIcon(location.status);
          return (
            <Marker
              key={index}
              position={location.position}
              icon={sensorIcon}
            >
              <Popup className="custom-popup">
                <div className="map-popup">
                  <strong>{location.name}</strong>
                  <div className="popup-status">
                    <span className={`status-${location.status === 'Berpotensi Banjir' ? 'danger' : 'normal'}`}>
                      {location.status}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapComponent;