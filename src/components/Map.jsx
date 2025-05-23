import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
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
const createSensorIcon = (kondisiCuaca, levelAir, potensiBanjir) => {
  let className = 'sensor-marker';
  let label = '';

  // Prioritas: Berpotensi Banjir > Hujan Lebat > Status lainnya
  if (potensiBanjir === 'Berpotensi Banjir') {
    className += ' banjir';
    label = 'Banjir';
  } else if (kondisiCuaca === 'Hujan Lebat') {
    className += ' hujan';
    label = 'Hujan';
  } else if (kondisiCuaca === 'Gerimis') {
    className += ' hujan';
    label = 'Gerimis';
  } else {
    className += ' aman';
    label = 'Aman';
  }

  return L.divIcon({
    className,
    html: `<div>${label}</div>`,
    iconSize: [60, 30],
    iconAnchor: [30, 15],
    popupAnchor: [0, -15]
  });
};

const MapComponent = () => {
  const position = [5.560139, 95.3443647];

  const [locations, setLocations] = useState([
    { 
      name: "Sensor 1 - Darussalam", 
      position: [5.5731363, 95.3664551], 
      kondisiCuaca: "Tidak Hujan", 
      levelAir: "Rendah",
      potensiBanjir: "Aman",
      rainValue: 0,
      waterLevelValue: 0,
      selected: true 
    },
    { 
      name: "Sensor 2 - Ulee Kareng", 
      position: [5.5474374, 95.3378723], 
      kondisiCuaca: "Tidak Hujan", 
      levelAir: "Rendah",
      potensiBanjir: "Aman",
      rainValue: 0,
      waterLevelValue: 0
    },
  ]);

  const [sensorData, setSensorData] = useState({
    kondisiCuaca: "Tidak Hujan",
    levelAir: "Rendah",
    potensiBanjir: "Aman",
    rainValue: 0,
    waterLevelValue: 0
  });

  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
  const [connectionStatus, setConnectionStatus] = useState('Terputus');
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

    client.on('connect', () => {
      console.log('Terhubung ke broker HiveMQ untuk peta');
      setConnectionStatus('Terhubung');
      client.subscribe('sensor/banjir', (err) => {
        if (err) {
          console.error('Gagal subscribe:', err);
          setConnectionStatus('Error');
        } else {
          console.log('Berhasil subscribe ke topik sensor/banjir');
        }
      });
    });

    client.on('message', (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Data diterima dari ESP32:', data);

        if (data.rain_status && data.water_level_status && data.final_status) {
          const newSensorData = {
            kondisiCuaca: data.rain_status,
            levelAir: data.water_level_status,
            potensiBanjir: data.final_status,
            rainValue: data.rain_value || 0,
            waterLevelValue: data.water_level_value || 0
          };

          setSensorData(newSensorData);

          // Update sensor pertama (Darussalam) dengan data real
          setLocations(prevLocations =>
            prevLocations.map((loc, index) =>
              index === 0
                ? { 
                    ...loc, 
                    kondisiCuaca: data.rain_status,
                    levelAir: data.water_level_status,
                    potensiBanjir: data.final_status,
                    rainValue: data.rain_value || 0,
                    waterLevelValue: data.water_level_value || 0
                  }
                : loc
            )
          );

          setLastUpdate(new Date().toLocaleTimeString());
        }
      } catch (error) {
        console.error('Error parsing MQTT message:', error);
        setConnectionStatus('Error Parsing');
      }
    });

    client.on('error', (error) => {
      console.error('MQTT Error:', error);
      setConnectionStatus('Error Koneksi');
    });

    client.on('close', () => {
      console.log('MQTT connection closed');
      setConnectionStatus('Terputus');
    });

    client.on('reconnect', () => {
      console.log('MQTT reconnecting...');
      setConnectionStatus('Reconnecting...');
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
      <div style={{ marginBottom: '20px' }}>
        <h2>Sistem Monitoring Banjir Aceh</h2>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ 
            padding: '5px 15px', 
            borderRadius: '20px', 
            backgroundColor: connectionStatus === 'Terhubung' ? '#d4edda' : '#f8d7da',
            color: connectionStatus === 'Terhubung' ? '#155724' : '#721c24',
            fontSize: '14px',
            fontWeight: 'bold',
            border: connectionStatus === 'Terhubung' ? '1px solid #c3e6cb' : '1px solid #f5c6cb'
          }}>
            MQTT: {connectionStatus}
          </div>
          {lastUpdate && (
            <div style={{ fontSize: '14px', color: '#666' }}>
              Update: {lastUpdate}
            </div>
          )}
        </div>
      </div>

      <MapContainer center={position} zoom={13} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {locations.map((location, index) => {
          const sensorIcon = createSensorIcon(location.kondisiCuaca, location.levelAir, location.potensiBanjir);
          return (
            <Marker
              key={index}
              position={location.position}
              icon={sensorIcon}
              eventHandlers={{ click: () => handleLocationSelect(location) }}
            >
              <Popup>
                <div>
                  <strong>{location.name}</strong><br />
                  <div style={{ marginTop: '8px' }}>
                    <div><strong>Cuaca:</strong> {location.kondisiCuaca}</div>
                    <div><strong>Level Air:</strong> {location.levelAir}</div>
                    <div><strong>Status:</strong> <span style={{ 
                      color: location.potensiBanjir === 'Berpotensi Banjir' ? '#dc3545' : '#28a745',
                      fontWeight: 'bold'
                    }}>{location.potensiBanjir}</span></div>
                    <hr style={{ margin: '8px 0' }} />
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      <div>Rain Sensor: {location.rainValue}</div>
                      <div>Water Level: {location.waterLevelValue}</div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <div className="sensor-info">
        <h3 style={{ color: '#000000' }}>Data Sensor Real-time - {selectedLocation.name}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginTop: '15px' }}>
          
          <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>Kondisi Cuaca</h4>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: sensorData.kondisiCuaca === 'Hujan Lebat' ? '#dc3545' : 
                     sensorData.kondisiCuaca === 'Gerimis' ? '#ffc107' : '#28a745',
              marginBottom: '8px'
            }}>
              {sensorData.kondisiCuaca}
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>
              Raw Value: {sensorData.rainValue}
            </div>
            <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '5px' }}>
              {sensorData.rainValue > 3200 ? 'Tidak Hujan (>3200)' : 
               sensorData.rainValue > 2400 ? 'Gerimis (2400-3200)' : 
               'Hujan Lebat (<2400)'}
            </div>
          </div>

          <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>Level Air</h4>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: sensorData.levelAir === 'Tinggi' ? '#dc3545' : 
                     sensorData.levelAir === 'Sedang' ? '#ffc107' : '#28a745',
              marginBottom: '8px'
            }}>
              {sensorData.levelAir}
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>
              Raw Value: {sensorData.waterLevelValue}
            </div>
            <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '5px' }}>
              {sensorData.waterLevelValue < 1000 ? 'Rendah (<1000)' : 
               sensorData.waterLevelValue < 2500 ? 'Sedang (1000-2500)' : 
               'Tinggi (>2500)'}
            </div>
          </div>

          <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>Status Akhir</h4>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: sensorData.potensiBanjir === 'Berpotensi Banjir' ? '#dc3545' : '#28a745',
              marginBottom: '8px'
            }}>
              {sensorData.potensiBanjir}
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>
              {sensorData.potensiBanjir === 'Berpotensi Banjir' ? 
                '⚠️ Waspada Banjir!' : '✅ Kondisi Normal'}
            </div>
            <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '5px' }}>
              {sensorData.kondisiCuaca === 'Hujan Lebat' && sensorData.levelAir === 'Tinggi' ? 
                'Hujan Lebat + Air Tinggi' : 'Kondisi dalam batas normal'}
            </div>
          </div>
        </div>
      </div>

      <div className="attribution">
        Data Sensor IoT © ESP32 via HiveMQ MQTT Broker
      </div>

      <style jsx>{`
        .map-container {
          padding: 20px;
          font-family: Arial, sans-serif;
        }

        .sensor-info {
          margin-top: 20px;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .attribution {
          margin-top: 15px;
          font-size: 12px;
          color: #666;
          text-align: center;
        }

        .sensor-marker {
          border-radius: 15px;
          text-align: center;
          font-weight: bold;
          font-size: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .sensor-marker.banjir {
          background-color: #dc3545;
          color: white;
        }

        .sensor-marker.hujan {
          background-color: #ffc107;
          color: black;
        }

        .sensor-marker.aman {
          background-color: #28a745;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default MapComponent;