import React from 'react';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-hero">
        <h1>Selamat Datang di SIGAB</h1>
        <p className="hero-subtitle">Sistem Informasi Geografis Aceh Berbasis IoT untuk Pemantauan Cuaca</p>
      </div>
      
      <div className="home-content">
        <div className="intro-section">
          <h2>Tentang SIGAB</h2>
          <p>
            SIGAB adalah aplikasi pemantauan cuaca berbasis IoT (Internet of Things) yang dirancang khusus untuk wilayah Aceh. 
            Aplikasi ini menyediakan informasi cuaca real-time dan perkiraan cuaca untuk membantu masyarakat Aceh dalam 
            merencanakan aktivitas harian mereka dengan lebih baik.
          </p>
          <p>
            Dengan menggunakan jaringan sensor IoT yang tersebar di berbagai lokasi di Aceh, SIGAB mampu mengumpulkan 
            data cuaca secara akurat dan tepat waktu, memberikan informasi yang dapat diandalkan untuk pengambilan keputusan.
          </p>
        </div>
        
        <div className="features-section">
          <h2>Fitur Utama</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-map-marked-alt"></i>
              </div>
              <h3>Peta Cuaca Interaktif</h3>
              <p>Visualisasi data cuaca dalam bentuk peta interaktif yang menampilkan suhu, curah hujan, dan kondisi cuaca di berbagai lokasi di Aceh.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3>Statistik Cuaca</h3>
              <p>Grafik dan statistik detail tentang suhu, curah hujan, kecepatan angin, dan parameter cuaca lainnya untuk analisis mendalam.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-clock"></i>
              </div>
              <h3>Perkiraan Cuaca</h3>
              <p>Perkiraan cuaca hingga 24 jam ke depan untuk membantu Anda merencanakan aktivitas dengan lebih baik.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-bell"></i>
              </div>
              <h3>Peringatan Cuaca</h3>
              <p>Sistem peringatan dini untuk kondisi cuaca ekstrem seperti hujan lebat, angin kencang, atau potensi banjir.</p>
            </div>
          </div>
        </div>
        
        <div className="how-to-section">
          <h2>Cara Menggunakan SIGAB</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Jelajahi Peta</h3>
                <p>Klik pada menu "Peta Cuaca" untuk melihat kondisi cuaca terkini di berbagai lokasi di Aceh.</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Analisis Statistik</h3>
                <p>Kunjungi halaman "Statistik" untuk melihat grafik dan data detail tentang parameter cuaca.</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Cari Lokasi</h3>
                <p>Gunakan fitur pencarian untuk menemukan informasi cuaca di lokasi spesifik yang Anda inginkan.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="home-footer">
        <p>SIGAB - Memantau cuaca Aceh untuk kehidupan yang lebih baik</p>
        <p className="copyright">© 2023 SIGAB. Hak Cipta Dilindungi.</p>
      </div>
    </div>
  );
};

export default Home;