import { useState, useEffect, useRef } from 'react';
gimport { Link, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const [activeItem, setActiveItem] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navbarRef = useRef(null);
  const horiSelectorRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    // Set active item based on current path
    const path = location.pathname;
    if (path === '/') setActiveItem(0);
    else if (path === '/peta') setActiveItem(1);
    else if (path === '/statistik') setActiveItem(2);
    else if (path === '/tentang') setActiveItem(3);
    
    if (navbarRef.current && horiSelectorRef.current) {
      const activeElement = navbarRef.current.querySelector('.active');
      if (activeElement) {
        const activeWidth = activeElement.offsetWidth;
        const itemPosition = activeElement.offsetLeft;
        
        horiSelectorRef.current.style.left = `${itemPosition}px`;
        horiSelectorRef.current.style.width = `${activeWidth}px`;
      }
    }
  }, [activeItem, location]);

  const handleItemClick = (index, e) => {
    setActiveItem(index);
    const activeWidth = e.currentTarget.offsetWidth;
    const itemPosition = e.currentTarget.offsetLeft;
    
    if (horiSelectorRef.current) {
      horiSelectorRef.current.style.left = `${itemPosition}px`;
      horiSelectorRef.current.style.width = `${activeWidth}px`;
    }
  };
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode');
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Mencari lokasi:', searchQuery);
    // Implementasi pencarian lokasi akan ditambahkan di sini
  };

  return (
    <div id="navbar-animmenu" ref={navbarRef} className={darkMode ? 'dark-theme' : ''}>
      <div className="navbar-brand">
        <i className="fas fa-cloud-sun"></i>
        <span>SIGAB</span>
      </div>
      
      <ul className="show-dropdown main-navbar">
        <div className="hori-selector">
          <div className="left"></div>
          <div className="right"></div>
        </div>
        <li className={activeItem === 0 ? 'active' : ''} onClick={(e) => handleItemClick(0, e)}>
          <Link to="/"><i className="fas fa-home"></i>Beranda</Link>
        </li>
        <li className={activeItem === 1 ? 'active' : ''} onClick={(e) => handleItemClick(1, e)}>
          <Link to="/peta"><i className="fas fa-map-marked-alt"></i>Peta Cuaca</Link>
        </li>
        <li className={activeItem === 2 ? 'active' : ''} onClick={(e) => handleItemClick(2, e)}>
          <Link to="/statistik"><i className="fas fa-chart-line"></i>Statistik</Link>
        </li>
        <li className={activeItem === 3 ? 'active' : ''} onClick={(e) => handleItemClick(3, e)}>
          <Link to="/tentang"><i className="fas fa-info-circle"></i>Tentang</Link>
        </li>
      </ul>
      
      <div className="navbar-right">
        <form className="search-form" onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Cari lokasi..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit"><i className="fas fa-search"></i></button>
        </form>
        
        <button className="theme-toggle" onClick={toggleDarkMode}>
          {darkMode ? (
            <i className="fas fa-sun"></i>
          ) : (
            <i className="fas fa-moon"></i>
          )}
        </button>
      </div>
    </div>
  );
};

export default Navbar;