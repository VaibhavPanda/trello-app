import { useContext } from "react";
import { Link } from "react-router-dom";

import "./Navbar.css";

import { AuthContext } from "../../context/AuthContext";
import { logout } from "../../services/authService";

const Navbar = () => {
  const { user } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-logo">Trello-Clone</div>

      <nav className="navbar-links">
        <Link to="/dashboard" className="navbar-board-link">
          My Board
        </Link>
      </nav>

      <div className="navbar-actions">
        {user && (
          <>
            <div className="navbar-user">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="navbar-avatar"
                />
              ) : (
                <div className="navbar-profile">
                  {user.displayName?.charAt(0)}
                </div>
              )}

              <span className="navbar-user-name">{user.displayName}</span>
            </div>

            <button className="navbar-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
