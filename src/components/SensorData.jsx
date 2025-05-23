import { useState, useEffect, useRef } from 'react';
import mqtt from 'mqtt';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const SensorData = () => {
  // State data sensor dan histori untuk grafik
  const [sensorData, setSensorData] = useState({
    rain_value: 0,
    rain_status: '-',
    water_level_value: 0,
    water_level_status: '-',
    final_status: '-',
    lastUpdate: new Date(),
    rainValueHistory: [],
    waterLevelValueHistory: [],
    timeHistory: []
  });

  const [connectionStatus, setConnectionStatus] = useState('Menghubungkan...');

  useEffect(() => {
    const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

    client.on('connect', () => {
      console.log('Terhubung ke HiveMQ broker');
      setConnectionStatus('Terhubung');
      client.subscribe('sensor/banjir', (err) => {
        if (err) {
          console.error('Gagal subscribe:', err);
          setConnectionStatus('Gagal subscribe');
        }
      });
    });

    client.on('message', (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Data diterima:', data);

        const currentTime = new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

        setSensorData(prev => {
          const newRainHistory = [...prev.rainValueHistory, data.rain_value].slice(-20);
          const newWaterLevelHistory = [...prev.waterLevelValueHistory, data.water_level_value].slice(-20);
          const newTimeHistory = [...prev.timeHistory, currentTime].slice(-20);

          return {
            rain_value: data.rain_value,
            rain_status: data.rain_status,
            water_level_value: data.water_level_value,
            water_level_status: data.water_level_status,
            final_status: data.final_status,
            lastUpdate: new Date(),
            rainValueHistory: newRainHistory,
            waterLevelValueHistory: newWaterLevelHistory,
            timeHistory: newTimeHistory
          };
        });

        setConnectionStatus('Data diterima');
      } catch (error) {
        console.error('Error parsing message:', error);
        setConnectionStatus('Error parsing data');
      }
    });

    client.on('error', (error) => {
      console.error('MQTT Error:', error);
      setConnectionStatus('Error koneksi');
    });

    client.on('close', () => {
      console.log('Koneksi MQTT tertutup');
      setConnectionStatus('Koneksi terputus');
    });

    return () => {
      client.end();
    };
  }, []);

  // Chart refs & instance refs
  const rainChartRef = useRef(null);
  const waterLevelChartRef = useRef(null);
  const rainChartInstanceRef = useRef(null);
  const waterLevelChartInstanceRef = useRef(null);

  // Buat grafik rain_value dan water_level_value
  useEffect(() => {
    if (rainChartRef.current && sensorData.rainValueHistory.length > 0) {
      if (rainChartInstanceRef.current) rainChartInstanceRef.current.destroy();

      const ctx = rainChartRef.current.getContext('2d');
      rainChartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: sensorData.timeHistory,
          datasets: [{
            label: 'Nilai Sensor Hujan',
            data: sensorData.rainValueHistory,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            fill: true,
            tension: 0.3,
            pointRadius: 2,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Nilai Hujan' }
            },
            x: {
              title: { display: true, text: 'Waktu' }
            }
          }
        }
      });
    }

    if (waterLevelChartRef.current && sensorData.waterLevelValueHistory.length > 0) {
      if (waterLevelChartInstanceRef.current) waterLevelChartInstanceRef.current.destroy();

      const ctx = waterLevelChartRef.current.getContext('2d');
      waterLevelChartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: sensorData.timeHistory,
          datasets: [{
            label: 'Nilai Sensor Level Air',
            data: sensorData.waterLevelValueHistory,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            fill: true,
            tension: 0.3,
            pointRadius: 2,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Nilai Level Air' }
            },
            x: {
              title: { display: true, text: 'Waktu' }
            }
          }
        }
      });
    }

    return () => {
      if (rainChartInstanceRef.current) rainChartInstanceRef.current.destroy();
      if (waterLevelChartInstanceRef.current) waterLevelChartInstanceRef.current.destroy();
    };
  }, [sensorData.rainValueHistory, sensorData.waterLevelValueHistory, sensorData.timeHistory]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Monitoring Sensor Banjir (ESP32)</h2>

      <p>Status Koneksi: <strong>{connectionStatus}</strong></p>
      <p>Update Terakhir: {sensorData.lastUpdate.toLocaleString('id-ID')}</p>
      <p>Topik MQTT: sensor/banjir</p>

      <div style={{ marginTop: '20px' }}>
        <h3>Data Saat Ini</h3>
        <ul>
          <li>Nilai Sensor Hujan: {sensorData.rain_value}</li>
          <li>Kondisi Hujan: {sensorData.rain_status}</li>
          <li>Nilai Sensor Level Air: {sensorData.water_level_value}</li>
          <li>Kondisi Level Air: {sensorData.water_level_status}</li>
          <li><strong>Kesimpulan Akhir: {sensorData.final_status}</strong></li>
        </ul>
      </div>

      <div style={{ display: 'flex', gap: '40px', marginTop: '40px', height: '300px' }}>
        <div style={{ flex: 1 }}>
          <h4>Grafik Nilai Sensor Hujan</h4>
          <canvas ref={rainChartRef}></canvas>
        </div>
        <div style={{ flex: 1 }}>
          <h4>Grafik Nilai Sensor Level Air</h4>
          <canvas ref={waterLevelChartRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default SensorData;
