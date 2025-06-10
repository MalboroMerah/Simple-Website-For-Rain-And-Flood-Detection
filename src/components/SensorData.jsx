import { useState, useEffect, useRef } from 'react';
import mqtt from 'mqtt';
import { Chart, registerables } from 'chart.js';
import '../styles/SensorData.css';

Chart.register(...registerables);

const SensorData = () => {
  // State data sensor dan histori untuk grafik
  const [sensorData, setSensorData] = useState({
    rain_value: 0,
    rain_status: '-',
    water_level_value: 0,
    water_level_status: '-',
    final_status: 'Aman',
    lastUpdate: new Date(),
    rainValueHistory: [],
    waterLevelValueHistory: [],
    timeHistory: []
  });

  const [connectionStatus, setConnectionStatus] = useState('Menghubungkan...');
  const [floodDetectionTime, setFloodDetectionTime] = useState(null);

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

        // Cek apakah level air tinggi untuk deteksi banjir
        if (data.water_level_status === 'Tinggi') {
          if (!floodDetectionTime) {
            setFloodDetectionTime(new Date());
          }
        } else {
          setFloodDetectionTime(null);
        }

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
  }, [floodDetectionTime]);

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
            borderColor: '#5161ce',
            backgroundColor: 'rgba(81, 97, 206, 0.2)',
            fill: true,
            tension: 0.3,
            pointRadius: 3,
            pointBackgroundColor: '#5161ce',
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                boxWidth: 12,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              titleFont: {
                size: 13
              },
              bodyFont: {
                size: 12
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Nilai Hujan' },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              },
              ticks: {
                font: {
                  size: 11
                }
              }
            },
            x: {
              title: { display: true, text: 'Waktu' },
              grid: {
                display: false
              },
              ticks: {
                maxRotation: 45,
                minRotation: 45,
                font: {
                  size: 10
                }
              }
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
            borderColor: '#fd7e14',
            backgroundColor: 'rgba(253, 126, 20, 0.2)',
            fill: true,
            tension: 0.3,
            pointRadius: 3,
            pointBackgroundColor: '#fd7e14',
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                boxWidth: 12,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              titleFont: {
                size: 13
              },
              bodyFont: {
                size: 12
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Nilai Level Air' },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              },
              ticks: {
                font: {
                  size: 11
                }
              }
            },
            x: {
              title: { display: true, text: 'Waktu' },
              grid: {
                display: false
              },
              ticks: {
                maxRotation: 45,
                minRotation: 45,
                font: {
                  size: 10
                }
              }
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

  // Helper function untuk menentukan class status
  const getStatusClass = (status) => {
    if (status === 'Tidak Hujan' || status === 'Rendah' || status === 'Aman' || status === '-') {
      return 'status-normal';
    } else if (status === 'Gerimis' || status === 'Sedang' || status === 'Waspada') {
      return 'status-warning';
    } else {
      return 'status-danger';
    }
  };

  // Helper function untuk menentukan class status koneksi
  const getConnectionStatusClass = () => {
    if (connectionStatus === 'Terhubung' || connectionStatus === 'Data diterima') {
      return 'status-connected';
    } else if (connectionStatus === 'Menghubungkan...') {
      return 'status-connecting';
    } else {
      return 'status-error';
    }
  };

  // Hitung waktu deteksi banjir
  const getFloodDetectionInfo = () => {
    if (!floodDetectionTime) {
      return {
        status: 'safe',
        message: 'Tidak ada potensi banjir terdeteksi'
      };
    }

    const now = new Date();
    const elapsedMinutes = Math.floor((now - floodDetectionTime) / (1000 * 60));
    const remainingMinutes = 2 - elapsedMinutes;

    if (sensorData.final_status === 'Berpotensi Banjir') {
      return {
        status: 'danger',
        message: 'PERINGATAN: Berpotensi Banjir!'
      };
    } else if (elapsedMinutes >= 1) {
      return {
        status: 'warning',
        message: `Peringatan: Level air tinggi selama ${elapsedMinutes} menit. Potensi banjir dalam ${remainingMinutes} menit lagi.`
      };
    } else {
      return {
        status: 'warning',
        message: `Level air tinggi terdeteksi selama ${elapsedMinutes} menit. Monitoring...`
      };
    }
  };

  const floodInfo = getFloodDetectionInfo();

  return (
    <div className="sensor-data-container">
      <div className="sensor-header">
        <h2>Monitoring Sensor Banjir (ESP32)</h2>
        <div className="connection-info">
          <div className={`mqtt-status-dot mqtt-${connectionStatus === 'Terhubung' || connectionStatus === 'Data diterima' ? 'connected' : connectionStatus === 'Menghubungkan...' ? 'connecting' : 'error'}`}></div>
          {sensorData.lastUpdate && (
            <div className="last-update">
              Update: {sensorData.lastUpdate.toLocaleTimeString('id-ID')}
            </div>
          )}
        </div>
      </div>

      {/* Flood Detection Section */}
      <div className="flood-detection">
        <div className="flood-detection-title">Sistem Deteksi Banjir</div>
        <p>Sistem akan mendeteksi potensi banjir jika level air tinggi terdeteksi selama 2 menit atau lebih.</p>
        <div className="flood-status">
          <div className={`flood-indicator flood-${floodInfo.status}`}></div>
          <div className="flood-message">{floodInfo.message}</div>
        </div>
      </div>

      <h3>Data Statistik Sensor</h3>
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-title">Nilai Sensor Hujan</div>
          <div className="stat-value">{sensorData.rain_value}</div>
          <div className={`stat-status ${getStatusClass(sensorData.rain_status)}`}>
            {sensorData.rain_status}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Nilai Sensor Level Air</div>
          <div className="stat-value">{sensorData.water_level_value}</div>
          <div className={`stat-status ${getStatusClass(sensorData.water_level_status)}`}>
            {sensorData.water_level_status}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Status Banjir</div>
          <div className="stat-value">{sensorData.final_status}</div>
          <div className={`stat-status ${getStatusClass(sensorData.final_status)}`}>
            {sensorData.final_status === 'Aman' ? 'Aman' : 'Waspada'}
          </div>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-box">
          <div className="chart-title">Grafik Nilai Sensor Hujan</div>
          <div className="chart-wrapper">
            <canvas ref={rainChartRef}></canvas>
          </div>
        </div>
        <div className="chart-box">
          <div className="chart-title">Grafik Nilai Sensor Level Air</div>
          <div className="chart-wrapper">
            <canvas ref={waterLevelChartRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorData;