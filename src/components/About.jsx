import React from 'react';
import '../styles/About.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1>Tentang Aplikasi Kami</h1>
        <p className="about-subtitle">Sistem Mitigasi Bencana Berbasis IoT dengan Sensor Water Level di Aceh Besar</p>
      </div>
      
      <div className="about-content">
        <div className="about-section">
          <h2>Visi & Misi</h2>
          <p>
            <strong>Visi:</strong> Menjadi sistem peringatan dini terpercaya yang membantu masyarakat Aceh Besar dalam mengantisipasi dan 
            merespons potensi bencana banjir secara cepat dan efektif.
          </p>
          <p>
            <strong>Misi:</strong> Membangun jaringan sensor ketinggian air yang terintegrasi dan menyajikan data real-time, guna meningkatkan 
            kesiapsiagaan masyarakat dan mendukung pengambilan keputusan oleh pihak berwenang dalam situasi darurat.
          </p>
        </div>
        
        <div className="about-section">
          <h2>Teknologi</h2>
          <p>
            Aplikasi ini mengintegrasikan teknologi IoT (Internet of Things) dengan sensor water level yang dipasang di titik-titik rawan banjir 
            di kawasan Aceh Besar. Sistem ini mampu:
          </p>
          <ul className="tech-list">
            <li><i className="fas fa-water"></i> Mendeteksi ketinggian permukaan air secara real-time</li>
            <li><i className="fas fa-broadcast-tower"></i> Mengirim data melalui jaringan MQTT</li>
            <li><i className="fas fa-chart-line"></i> Menyajikan visualisasi data dalam antarmuka berbasis web</li>
            <li><i className="fas fa-bell"></i> Memberikan peringatan dini saat ambang batas tercapai</li>
          </ul>
          <p>
            Data dari sensor diproses secara otomatis di server pusat, dianalisis, lalu ditampilkan dalam dashboard yang mudah dipahami oleh masyarakat dan petugas.
          </p>
        </div>
        
        <div className="about-section">
          <h2>Tim Pengembang</h2>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-avatar">
                <i className="fas fa-user-circle"></i>
              </div>
              <h3>Ryan Akmal Pasya</h3>
              <p className="member-role">APP Developer</p>
              <p>Mahasiswa Universitas Syiah Kuala Spesialis Data</p>
            </div>
            
            <div className="team-member">
              <div className="member-avatar">
                <i className="fas fa-user-circle"></i>
              </div>
              <h3>T. Saidil Anam</h3>
              <p className="member-role">IOT Specialist</p>
              <p>Mahasiswa Universitas Syiah Kuala Spesialis IOT</p>
            </div>
          </div>
        </div>
        
        <div className="about-section">
          <h2>Kerjasama & Dukungan</h2>
          <p>
            Proyek ini didukung oleh berbagai lembaga dan mitra yang peduli terhadap pengurangan risiko bencana, antara lain:
          </p>
          <ul className="partners-list">
            <li></li>
            <li>1. BMKG</li>
            <li>2. Universitas Syiah Kuala</li>
          </ul>
        </div>
        
        <div className="about-section contact-section">
          <h2>Hubungi Kami</h2>
          <div className="contact-info">
            <div className="contact-item">
              <i className="fas fa-envelope"></i>
              <p>kontak@mitigasibencana-aceh.id</p>
            </div>
            <div className="contact-item">
              <i className="fas fa-phone"></i>
              <p>+62 651 7555123</p>
            </div>
            <div className="contact-item">
              <i className="fas fa-map-marker-alt"></i>
              <p>Jl. Teuku Nyak Arief No. 441, Aceh Besar, Indonesia</p>
            </div>
          </div>
          <div className="social-media">
            <a href="#" className="social-icon"><i className="fab fa-facebook"></i></a>
            <a href="#" className="social-icon"><i className="fab fa-twitter"></i></a>
            <a href="#" className="social-icon"><i className="fab fa-instagram"></i></a>
            <a href="#" className="social-icon"><i className="fab fa-youtube"></i></a>
          </div>
        </div>
      </div>
      
      <div className="about-footer">
        <p>© 2023 Sistem Mitigasi Bencana Aceh</p>
        <p></p>
      </div>
    </div>
  );
};

export default About;
