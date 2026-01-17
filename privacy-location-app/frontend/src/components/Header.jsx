import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <span className="logo-icon">🔐</span>
          <span className="logo-text">Privacy Location</span>
        </Link>

        {user && (
          <nav className="nav">
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
            <Link to="/map" className="nav-link">
              Map
            </Link>
            <Link to="/circles" className="nav-link">
              Circles
            </Link>
            <Link to="/settings" className="nav-link">
              Settings
            </Link>
            <button onClick={handleLogout} className="nav-link logout-btn">
              Logout
            </button>
          </nav>
        )}

        {user && (
          <div className="user-info">
            <span className="user-badge">{user.username}</span>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
