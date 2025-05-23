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

// Fungsi untuk membuat ikon berdasarkan kondisi
const createSensorIcon = (Condition, Waterlevel) => {
  let className = 'sensor-marker';
  let label = '';

  if (Waterlevel > 1) {
    className += ' banjir';
    label = 'Banjir';
  } else if (Condition === 'Hujan') {
    className += ' hujan';
    label = 'Hujan';
  } else {
    className += ' normal';
    label = 'Normal';
  }

  return L.divIcon({
    className,
    html: `<div>${label}</div>`,
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -25]
  });
};

const MapComponent = () => {
  const position = [5.560139, 95.3443647];

  const [locations, setLocations] = useState([
    { name: "Sensor 1 - Darussalam", position: [5.5731363, 95.3664551], Condition: "Normal", Waterlevel: 0, selected: true },
    { name: "Sensor 2 - Ulee Kareng", position: [5.5474374, 95.3378723], Condition: "Normal", Waterlevel: 0 },
  ]);

  const [sensorData, setSensorData] = useState({
    Condition: "Normal",
    Waterlevel: 0
  });

  const [selectedLocation, setSelectedLocation] = useState(locations[0]);

  useEffect(() => {
    const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

    client.on('connect', () => {
      console.log('Terhubung ke broker HiveMQ untuk peta');
      client.subscribe('usk/iot/mqtt/contoh', (err) => {
        if (err) console.error('Gagal subscribe:', err);
        else console.log('Berhasil subscribe ke topik usk/iot/mqtt/contoh');
      });
    });

    client.on('message', (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Data diterima:', data);

        if (data.Condition !== undefined && data.Waterlevel !== undefined) {
          setSensorData({
            Condition: data.Condition,
            Waterlevel: data.Waterlevel
          });

          setLocations(prevLocations =>
            prevLocations.map((loc, index) =>
              index === 0
                ? { ...loc, Condition: data.Condition, Waterlevel: data.Waterlevel }
                : loc
            )
          );
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    return () => {
      client.end();
    };
  }, []);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setLocations(prevLocations =>
      prevLocations.map(loc => ({
        ...loc,
        selected: loc.name === location.name
      }))
    );
  };

  return (
    <div className="map-container">
      <h2>Kondisi Cuaca Di Aceh</h2>
      <MapContainer center={position} zoom={13} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {locations.map((location, index) => {
          const sensorIcon = createSensorIcon(location.Condition, location.Waterlevel);
          return (
            <Marker
              key={index}
              position={location.position}
              icon={sensorIcon}
              eventHandlers={{ click: () => handleLocationSelect(location) }}
            >
              <Popup>
                <strong>{location.name}</strong><br />
                Kondisi: {location.Condition}<br />
                Ketinggian Air: {location.Waterlevel} Cm
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <div className="sensor-info">
        <h3>Data Sensor Terbaru di {selectedLocation.name}</h3>
        <p>Kondisi: {sensorData.Condition}</p>
        <p>Ketinggian Air: {sensorData.Waterlevel} Cm</p>
      </div>

      <div className="attribution">Data Sensor IoT © ESP32 via HiveMQ</div>
    </div>
  );
};

export default MapComponent;
