import React from 'react';
import '../styles/About.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1>Tentang SIGAB</h1>
        <p className="about-subtitle">Sistem Informasi Geografis Aceh Berbasis IoT</p>
      </div>
      
      <div className="about-content">
        <div className="about-section">
          <h2>Visi & Misi</h2>
          <p>
            <strong>Visi:</strong> Menjadi platform informasi cuaca terdepan untuk wilayah Aceh yang dapat diandalkan oleh masyarakat 
            dalam menghadapi perubahan iklim dan cuaca ekstrem.
          </p>
          <p>
            <strong>Misi:</strong> Menyediakan data cuaca yang akurat, tepat waktu, dan mudah diakses untuk membantu masyarakat Aceh 
            dalam mengambil keputusan sehari-hari dan meningkatkan kesiapsiagaan terhadap bencana alam terkait cuaca.
          </p>
        </div>
        
        <div className="about-section">
          <h2>Teknologi</h2>
          <p>
            SIGAB dibangun dengan menggunakan teknologi IoT (Internet of Things) yang menghubungkan jaringan sensor cuaca 
            yang tersebar di berbagai lokasi strategis di Aceh. Sensor-sensor ini mengumpulkan data secara real-time tentang:
          </p>
          <ul className="tech-list">
            <li><i className="fas fa-temperature-high"></i> Suhu udara</li>
            <li><i className="fas fa-wind"></i> Kecepatan dan arah angin</li>
            <li><i className="fas fa-cloud-rain"></i> Curah hujan</li>
            <li><i className="fas fa-compress-alt"></i> Tekanan udara</li>
            <li><i className="fas fa-tint"></i> Kelembaban</li>
          </ul>
          <p>
            Data yang dikumpulkan dikirim melalui jaringan MQTT (Message Queuing Telemetry Transport) ke server pusat untuk diproses 
            dan divisualisasikan dalam aplikasi web yang interaktif dan responsif.
          </p>
        </div>
        
        <div className="about-section">
          <h2>Tim Pengembang</h2>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-avatar">
                <i className="fas fa-user-circle"></i>
              </div>
              <h3>Dr. Ahmad Fauzi</h3>
              <p className="member-role">Ketua Proyek</p>
              <p>Pakar meteorologi dengan pengalaman 15 tahun di BMKG Indonesia</p>
            </div>
            
            <div className="team-member">
              <div className="member-avatar">
                <i className="fas fa-user-circle"></i>
              </div>
              <h3>Ir. Siti Rahmah</h3>
              <p className="member-role">Ahli Sistem Informasi Geografis</p>
              <p>Spesialis pemetaan digital dan visualisasi data spasial</p>
            </div>
            
            <div className="team-member">
              <div className="member-avatar">
                <i className="fas fa-user-circle"></i>
              </div>
              <h3>Budi Santoso, M.Kom</h3>
              <p className="member-role">Lead Developer</p>
              <p>Pengembang software dengan keahlian di bidang IoT dan sistem terdistribusi</p>
            </div>
            
            <div className="team-member">
              <div className="member-avatar">
                <i className="fas fa-user-circle"></i>
              </div>
              <h3>Dewi Putri, S.T.</h3>
              <p className="member-role">UI/UX Designer</p>
              <p>Desainer antarmuka dengan fokus pada pengalaman pengguna yang intuitif</p>
            </div>
          </div>
        </div>
        
        <div className="about-section">
          <h2>Kerjasama & Dukungan</h2>
          <p>
            Proyek SIGAB dikembangkan dengan dukungan dan kerjasama dari:
          </p>
          <ul className="partners-list">
            <li>Badan Meteorologi, Klimatologi, dan Geofisika (BMKG) Indonesia</li>
            <li>Pemerintah Provinsi Aceh</li>
            <li>Universitas Syiah Kuala</li>
            <li>Badan Penanggulangan Bencana Daerah (BPBD) Aceh</li>
            <li>Komunitas IoT Indonesia</li>
          </ul>
        </div>
        
        <div className="about-section contact-section">
          <h2>Hubungi Kami</h2>
          <div className="contact-info">
            <div className="contact-item">
              <i className="fas fa-envelope"></i>
              <p>info@sigab-aceh.id</p>
            </div>
            <div className="contact-item">
              <i className="fas fa-phone"></i>
              <p>+62 651 7555123</p>
            </div>
            <div className="contact-item">
              <i className="fas fa-map-marker-alt"></i>
              <p>Jl. Teuku Nyak Arief No. 441, Banda Aceh, Indonesia</p>
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
        <p>© 2023 SIGAB - Sistem Informasi Geografis Aceh Berbasis IoT</p>
        <p>Semua hak dilindungi undang-undang.</p>
      </div>
    </div>
  );
};

export default About;