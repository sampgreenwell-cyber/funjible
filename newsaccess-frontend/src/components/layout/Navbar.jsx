import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <h2>📰 Funjibly</h2>
        </div>
        
        {isAuthenticated && (
          <div className="navbar-menu">
            <a href="/dashboard">Dashboard</a>
            <a href="/articles">Articles</a>
            <a href="/wallet">Wallet</a>
            <a href="/profile">Profile</a>
          </div>
        )}

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <span className="navbar-user">Hello, {user?.firstName}</span>
              <button onClick={logout} className="btn-logout">
                Logout
              </button>
            </>
          ) : (
            <a href="/" className="btn-login">Login</a>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;