import { useState, useEffect, useRef } from 'react';
import mqtt from 'mqtt';
import '../styles/SensorData.css';
import { Chart, registerables } from 'chart.js';

// Mendaftarkan komponen Chart.js yang diperlukan
Chart.register(...registerables);

const SensorData = () => {
  // Data sensor dari ESP32
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    lastUpdate: new Date(),
    // Array untuk menyimpan data historis untuk grafik
    temperatureHistory: [],
    humidityHistory: [],
    timeHistory: []
  });

  const [connectionStatus, setConnectionStatus] = useState('Menghubungkan...');

  useEffect(() => {
    // Koneksi ke HiveMQ broker (sama dengan ESP32)
    const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

    client.on('connect', () => {
      console.log('Terhubung ke HiveMQ broker');
      setConnectionStatus('Terhubung');
      
      // Subscribe ke topik yang sama dengan ESP32
      client.subscribe('usk/iot/mqtt/contoh', (err) => {
        if (err) {
          console.error('Gagal subscribe:', err);
          setConnectionStatus('Gagal subscribe');
        } else {
          console.log('Berhasil subscribe ke topik: usk/iot/mqtt/contoh');
        }
      });
    });

    client.on('message', (topic, message) => {
      try {
        // Parse JSON message dari ESP32
        const data = JSON.parse(message.toString());
        console.log('Data diterima:', data);
        
        const currentTime = new Date().toLocaleTimeString('id-ID', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        });
        
        setSensorData(prev => {
          // Simpan maksimal 20 data point untuk grafik
          const newTempHistory = [...prev.temperatureHistory, data.temp].slice(-20);
          const newHumidityHistory = [...prev.humidityHistory, data.humidity].slice(-20);
          const newTimeHistory = [...prev.timeHistory, currentTime].slice(-20);
          
          return {
            temperature: data.temp,
            humidity: data.humidity,
            lastUpdate: new Date(),
            temperatureHistory: newTempHistory,
            humidityHistory: newHumidityHistory,
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

    // Cleanup pada unmount
    return () => {
      client.end();
    };
  }, []);

  // Referensi untuk elemen canvas chart
  const temperatureChartRef = useRef(null);
  const humidityChartRef = useRef(null);
  const tempChartInstanceRef = useRef(null);
  const humidityChartInstanceRef = useRef(null);
  
  // Membuat chart menggunakan Chart.js
  useEffect(() => {
    // Chart Suhu
    if (temperatureChartRef.current && sensorData.temperatureHistory.length > 0) {
      // Hapus chart sebelumnya jika ada
      if (tempChartInstanceRef.current) {
        tempChartInstanceRef.current.destroy();
      }
      
      // Buat chart baru
      const ctx = temperatureChartRef.current.getContext('2d');
      tempChartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: sensorData.timeHistory,
          datasets: [{
            label: 'Suhu (°C)',
            data: sensorData.temperatureHistory,
            backgroundColor: 'rgba(231, 76, 60, 0.2)',
            borderColor: 'rgba(231, 76, 60, 1)',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: 'rgba(231, 76, 60, 1)',
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                label: function(context) {
                  return `Suhu: ${context.raw}°C`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              title: {
                display: true,
                text: 'Suhu (°C)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Waktu'
              }
            }
          }
        }
      });
    }
    
    // Chart Kelembaban
    if (humidityChartRef.current && sensorData.humidityHistory.length > 0) {
      // Hapus chart sebelumnya jika ada
      if (humidityChartInstanceRef.current) {
        humidityChartInstanceRef.current.destroy();
      }
      
      // Buat chart baru
      const ctx = humidityChartRef.current.getContext('2d');
      humidityChartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: sensorData.timeHistory,
          datasets: [{
            label: 'Kelembaban (%)',
            data: sensorData.humidityHistory,
            backgroundColor: 'rgba(52, 152, 219, 0.2)',
            borderColor: 'rgba(52, 152, 219, 1)',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: 'rgba(52, 152, 219, 1)',
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                label: function(context) {
                  return `Kelembaban: ${context.raw}%`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: 'Kelembaban (%)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Waktu'
              }
            }
          }
        }
      });
    }
    
    // Cleanup pada unmount
    return () => {
      if (tempChartInstanceRef.current) {
        tempChartInstanceRef.current.destroy();
      }
      if (humidityChartInstanceRef.current) {
        humidityChartInstanceRef.current.destroy();
      }
    };
  }, [sensorData.temperatureHistory, sensorData.humidityHistory, sensorData.timeHistory]);

  // Fungsi untuk menentukan status berdasarkan suhu dan kelembaban
  const getEnvironmentStatus = () => {
    const temp = sensorData.temperature;
    const humidity = sensorData.humidity;
    
    if (temp > 30 && humidity > 70) return 'Panas & Lembab';
    if (temp > 30) return 'Panas';
    if (temp < 20) return 'Dingin';
    if (humidity > 80) return 'Sangat Lembab';
    if (humidity < 30) return 'Kering';
    return 'Normal';
  };

  return (
    <div className="sensor-data-container">
      <div className="forecast-header">
        <h2>Data Sensor IoT ESP32</h2>
        <div className="location-info">
          <p>Status Koneksi: <span className={connectionStatus === 'Data diterima' ? 'status-connected' : 'status-disconnected'}>{connectionStatus}</span></p>
          <p>Update Terakhir: {sensorData.lastUpdate.toLocaleString('id-ID')}</p>
          <p>Topik MQTT: usk/iot/mqtt/contoh</p>
        </div>
      </div>
      
      <div className="gauges-container">
        <div className="gauge-card">
          <div className="gauge-title">Suhu</div>
          <div className="gauge-value">{sensorData.temperature.toFixed(1)}°C</div>
          <div className="gauge-icon"><i className="fas fa-thermometer-half"></i></div>
        </div>
        
        <div className="gauge-card">
          <div className="gauge-title">Kelembaban</div>
          <div className="gauge-value">{sensorData.humidity.toFixed(1)}%</div>
          <div className="gauge-icon"><i className="fas fa-tint"></i></div>
        </div>
        
        <div className="gauge-card">
          <div className="gauge-title">Status Lingkungan</div>
          <div className="gauge-value">{getEnvironmentStatus()}</div>
          <div className="gauge-icon"><i className="fas fa-info-circle"></i></div>
        </div>
      </div>
      
      {sensorData.temperatureHistory.length > 0 && (
        <>
          <div className="chart-container">
            <h3>Grafik Suhu Realtime</h3>
            <div className="chart-wrapper">
              <canvas ref={temperatureChartRef}></canvas>
            </div>
          </div>
          
          <div className="chart-container">
            <h3>Grafik Kelembaban Realtime</h3>
            <div className="chart-wrapper">
              <canvas ref={humidityChartRef}></canvas>
            </div>
          </div>
        </>
      )}
      
      <div className="data-source">
        <p>Sumber Data: Sensor DHT22 ESP32 via HiveMQ (broker.hivemq.com)</p>
        <p>Data Points: {sensorData.temperatureHistory.length} / 20 (maksimal)</p>
      </div>
    </div>
  );
};

export default SensorData;