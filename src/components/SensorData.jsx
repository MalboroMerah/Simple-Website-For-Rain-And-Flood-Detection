import { useState, useEffect, useRef } from 'react';
import mqtt from 'mqtt';
import '../styles/SensorData.css';
import { Chart, registerables } from 'chart.js';

// Mendaftarkan komponen Chart.js yang diperlukan
Chart.register(...registerables);

const SensorData = () => {
  // Data cuaca untuk kota yang dipilih (default: Banda Aceh)
  const [selectedCity, setSelectedCity] = useState('Banda Aceh');
  const [weatherData, setWeatherData] = useState({
    temperature: 28.5,
    windSpeed: 3.2,
    precipitation: 12.0,
    longitude: 95.3171,
    latitude: 5.5548,
    elevation: 8,
    hourlyForecast: [
      { time: '03:00', temp: 26.5, precip: 0.0, windSpeed: 2.1, windDir: 138 },
      { time: '04:00', temp: 26.2, precip: 0.0, windSpeed: 2.4, windDir: 144 },
      { time: '05:00', temp: 26.0, precip: 0.0, windSpeed: 2.3, windDir: 166 },
      { time: '06:00', temp: 25.8, precip: 0.0, windSpeed: 2.6, windDir: 174 },
      { time: '07:00', temp: 26.1, precip: 0.0, windSpeed: 2.4, windDir: 184 },
      { time: '08:00', temp: 27.5, precip: 0.0, windSpeed: 2.9, windDir: 195 },
      { time: '09:00', temp: 28.4, precip: 0.4, windSpeed: 3.0, windDir: 206 },
      { time: '10:00', temp: 29.2, precip: 0.1, windSpeed: 3.6, windDir: 202 },
      { time: '11:00', temp: 30.1, precip: 0.0, windSpeed: 3.5, windDir: 204 },
      { time: '12:00', temp: 30.6, precip: 0.0, windSpeed: 3.7, windDir: 207 },
      { time: '13:00', temp: 31.2, precip: 0.0, windSpeed: 3.8, windDir: 210 },
      { time: '14:00', temp: 31.5, precip: 0.0, windSpeed: 3.5, windDir: 215 },
      { time: '15:00', temp: 31.8, precip: 0.0, windSpeed: 3.2, windDir: 218 },
      { time: '16:00', temp: 31.1, precip: 0.0, windSpeed: 3.0, windDir: 220 },
      { time: '17:00', temp: 30.5, precip: 0.2, windSpeed: 2.8, windDir: 215 },
      { time: '18:00', temp: 29.8, precip: 0.5, windSpeed: 2.5, windDir: 210 },
      { time: '19:00', temp: 28.9, precip: 0.3, windSpeed: 2.2, windDir: 205 },
      { time: '20:00', temp: 28.2, precip: 0.0, windSpeed: 1.9, windDir: 200 },
      { time: '21:00', temp: 27.5, precip: 0.0, windSpeed: 1.6, windDir: 195 },
      { time: '22:00', temp: 27.1, precip: 0.0, windSpeed: 1.3, windDir: 190 },
      { time: '23:00', temp: 26.8, precip: 0.0, windSpeed: 1.0, windDir: 185 },
      { time: '00:00', temp: 26.5, precip: 0.0, windSpeed: 0.8, windDir: 180 }
    ]
  });

  useEffect(() => {
    // Koneksi ke broker MQTT menggunakan WebSocket
    const client = mqtt.connect('wss://broker.emqx.io:8084/mqtt');

    client.on('connect', () => {
      console.log('Terhubung ke broker MQTT untuk data cuaca');
      // Subscribe ke topik cuaca untuk kota yang dipilih
      client.subscribe(`weather/${selectedCity}/+`, (err) => {
        if (err) console.error('Gagal subscribe:', err);
      });
    });

    client.on('message', (topic, message) => {
      const topicParts = topic.split('/');
      const dataType = topicParts[2]; // temperature, windspeed, precipitation, etc.
      const value = parseFloat(message.toString());
      
      setWeatherData(prev => ({
        ...prev,
        [dataType]: value
      }));
    });

    // Cleanup pada unmount
    return () => {
      client.end();
    };
  }, [selectedCity]);

  // Referensi untuk elemen canvas chart
  const temperatureChartRef = useRef(null);
  const precipitationChartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const precipChartInstanceRef = useRef(null);
  
  // Fungsi untuk menghasilkan data grafik suhu harian
  const generateTemperatureChartData = () => {
    const times = [];
    const temps = [];
    const precips = [];
    
    weatherData.hourlyForecast.forEach(hour => {
      times.push(hour.time);
      temps.push(hour.temp);
      precips.push(hour.precip);
    });
    
    return { times, temps, precips };
  };
  
  const chartData = generateTemperatureChartData();
  
  // Membuat chart menggunakan Chart.js
  useEffect(() => {
    if (temperatureChartRef.current) {
      // Hapus chart sebelumnya jika ada
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      
      // Buat chart baru
      const ctx = temperatureChartRef.current.getContext('2d');
      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: chartData.times,
          datasets: [{
            label: 'Suhu (°C)',
            data: chartData.temps,
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
    
    if (precipitationChartRef.current) {
      // Hapus chart sebelumnya jika ada
      if (precipChartInstanceRef.current) {
        precipChartInstanceRef.current.destroy();
      }
      
      // Buat chart baru
      const ctx = precipitationChartRef.current.getContext('2d');
      precipChartInstanceRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: chartData.times,
          datasets: [{
            label: 'Curah Hujan (mm)',
            data: chartData.precips,
            backgroundColor: 'rgba(52, 152, 219, 0.5)',
            borderColor: 'rgba(52, 152, 219, 1)',
            borderWidth: 1
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
                  return `Curah Hujan: ${context.raw} mm`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Curah Hujan (mm)'
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
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      if (precipChartInstanceRef.current) {
        precipChartInstanceRef.current.destroy();
      }
    };
  }, [chartData]);

  return (
    <div className="weather-container">
      <div className="forecast-header">
        <h2>Forecast for {selectedCity}</h2>
        <div className="location-info">
          <p>Longitude: {weatherData.longitude} degr.</p>
          <p>Latitude: {weatherData.latitude} degr.</p>
          <p>Elevation: {weatherData.elevation} m.</p>
        </div>
      </div>
      
      <div className="gauges-container">
        <div className="gauge-card">
          <div className="gauge temperature-gauge">
            <div className="gauge-value">{weatherData.temperature} °C</div>
            <div className="gauge-scale">
              <span>-40</span>
              <span>40</span>
            </div>
          </div>
          <div className="gauge-label">Temperature (latest)</div>
        </div>
        
        <div className="gauge-card">
          <div className="gauge wind-gauge">
            <div className="gauge-value">{weatherData.windSpeed} m/s</div>
            <div className="gauge-scale">
              <span>0</span>
              <span>32</span>
            </div>
          </div>
          <div className="gauge-label">Wind speed (latest)</div>
        </div>
        
        <div className="gauge-card">
          <div className="gauge precipitation-gauge">
            <div className="gauge-value">{weatherData.precipitation} mm</div>
            <div className="gauge-scale">
              <span>0</span>
              <span>60</span>
            </div>
          </div>
          <div className="gauge-label">Precipitation (next 24 hours)</div>
        </div>
      </div>
      
      <div className="forecast-details">
        <h3>Prakiraan Suhu untuk {selectedCity}</h3>
        <p className="forecast-date">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        
        <div className="modern-chart-container">
          <canvas ref={temperatureChartRef} height="250"></canvas>
        </div>
        
        <h3 className="mt-4">Prakiraan Curah Hujan untuk {selectedCity}</h3>
        <div className="modern-chart-container">
          <canvas ref={precipitationChartRef} height="200"></canvas>
        </div>
      </div>
      
      <div className="forecast-table">
        <h3>Prakiraan untuk {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
        <table>
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Suhu (°C)</th>
              <th>Curah Hujan (mm)</th>
              <th>Kecepatan Angin (m/s)</th>
              <th>Arah Angin (derajat)</th>
            </tr>
          </thead>
          <tbody>
            {weatherData.hourlyForecast.slice(0, 10).map((hour, index) => (
              <tr key={index}>
                <td>{hour.time}</td>
                <td>{hour.temp}</td>
                <td>{hour.precip}</td>
                <td>{hour.windSpeed}</td>
                <td>{hour.windDir}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="table-attribution">MET Norway</div>
      </div>
    </div>
  );
};

export default SensorData;