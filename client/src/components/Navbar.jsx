import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });

  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleAuthChange = () => {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setUser(null);
        return;
      }

      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    };

    window.addEventListener("authChanged", handleAuthChange);

    return () => {
      window.removeEventListener("authChanged", handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setProfileOpen(false);

    window.dispatchEvent(new Event("authChanged"));

    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          🎓 Campus Lost & Found
        </Link>

        {/* Navigation */}
        <div className="navbar-links">
          <Link to="/" className="nav-link">
            Home
          </Link>

          <Link to="/browse" className="nav-link">
            🔎 Browse
          </Link>

          {!user && (
            <>
              <Link to="/login" className="nav-link">
                👨‍🎓 Student Login
              </Link>

              <Link to="/register" className="nav-link">
                Register
              </Link>

              <Link to="/admin/login" className="nav-link">
                🔐 Admin Login
              </Link>
            </>
          )}

          {user && user.role === "student" && (
            <>
              <Link to="/dashboard" className="nav-link">
                📊 Dashboard
              </Link>

              <Link to="/my-matches" className="nav-link">
                🤝 My Matches
              </Link>
            </>
          )}

          {user && user.role === "admin" && (
            <>
              <Link to="/admin/dashboard" className="nav-link">
                📊 Admin Dashboard
              </Link>

              <Link to="/admin/matches" className="nav-link">
                🤝 Matches
              </Link>
            </>
          )}

          {/* Profile */}
          {user && (
            <div className="profile-container">
              <button
                className="profile-button"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                👤
              </button>

              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-header">
                    <div className="profile-icon">👤</div>

                    <div>
                      <h4>{user.name}</h4>
                      <p>{user.email}</p>
                    </div>
                  </div>

                  <div className="profile-divider"></div>

                  <button className="logout-button" onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
