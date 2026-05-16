import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { currentUser, logout, isAdmin, loginWithGoogle } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/causes', label: 'Causes' },
    { to: '/donate-monthly', label: 'Donate Monthly' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/blog', label: 'Blog' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">❤</span>
          <div className="logo-text">
            <span className="logo-name">Aneesha Joy</span>
            <span className="logo-tag">Foundation</span>
          </div>
        </Link>

        <div className="navbar-links">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          {currentUser ? (
            <div className="user-menu-wrap">
              <button className="user-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <img src={currentUser.photoURL || '/default-avatar.png'} alt="avatar" className="user-avatar" />
                <span className="user-name">{currentUser.displayName?.split(' ')[0]}</span>
                <ChevronDown size={14} />
              </button>
              {userMenuOpen && (
                <div className="user-dropdown">
                  {isAdmin && (
                    <Link to="/admin" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      Admin Panel
                    </Link>
                  )}
                  <Link to="/volunteer" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    Volunteer Area
                  </Link>
                  <button className="dropdown-item logout" onClick={() => { logout(); setUserMenuOpen(false); }}>
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn-login" onClick={loginWithGoogle}>
              <User size={16} /> Sign In
            </button>
          )}
          <Link to="/causes" className="btn-donate">
            <Heart size={15} /> Donate
          </Link>
        </div>

        <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="mobile-menu">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} className={`mobile-link ${location.pathname === link.to ? 'active' : ''}`}>
              {link.label}
            </Link>
          ))}
          <div className="mobile-actions">
            {currentUser ? (
              <>
                {isAdmin && <Link to="/admin" className="mobile-link">Admin Panel</Link>}
                <button onClick={logout} className="mobile-link">Sign Out</button>
              </>
            ) : (
              <button onClick={loginWithGoogle} className="mobile-link">Sign In with Google</button>
            )}
            <Link to="/causes" className="btn-primary" style={{ marginTop: 8 }}>Donate Now</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
