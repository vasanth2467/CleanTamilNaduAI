import React, { useState } from 'react';
import { ShieldCheck, PlusCircle, MapPin, LayoutDashboard, Home, AlertCircle, Menu, X, Sparkles } from 'lucide-react';

export default function Navbar({ activePage, setActivePage, aiModeInfo }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'report', label: 'Report Garbage', icon: PlusCircle },
    { id: 'map', label: 'Hotspot Map', icon: MapPin },
    { id: 'admin', label: 'Admin Dashboard', icon: LayoutDashboard },
  ];

  const handleNavClick = (pageId) => {
    setActivePage(pageId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Tamil Nadu Civic Ribbon */}
      <div className="civic-ribbon">
        <div className="civic-ribbon-left">
          <ShieldCheck size={16} />
          <span>Government of Tamil Nadu — Municipal Administration & Water Supply Dept</span>
        </div>
        <div className="civic-ribbon-right">
          <span>Swachh Tamil Nadu Mission | தூய்மை தமிழ்நாடு</span>
          <span style={{ opacity: 0.8 }}>Emergency Civic Helpline: 1913</span>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="navbar">
        <div className="nav-container">
          <div className="brand-wrapper" style={{ cursor: 'pointer' }} onClick={() => handleNavClick('home')}>
            <div className="brand-logo-badge">
              <Sparkles size={24} />
            </div>
            <div className="brand-titles">
              <h1>
                CleanTamil Nadu <span style={{ color: 'var(--accent-gold)' }}>AI</span>
              </h1>
              <div className="tamil-sub">ஸ்மார்ட் குப்பை கண்டறிதல் & ஹாட்ஸ்பாட் மேலாண்மை</div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="nav-links" style={{ display: 'flex' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="nav-mode-pill" title="Transparent Prototype: Computer vision heuristic simulation active">
              <AlertCircle size={14} color="#ca8a04" />
              <span>AI Mode: Demo / Prototype</span>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
