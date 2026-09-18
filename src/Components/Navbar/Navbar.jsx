import { useContext } from "react";
import "./Navbar.css";
import { AuthContext } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../services/authService";
const Navbar = () => {

  const {user} = useContext(AuthContext)
  const navigate = useNavigate

  const handleLogout = async() => {
    try{
      await logout();
      navigate("/login");
    } catch (error){
      console.log(error)
    }
  }

  return (
    <header className="navbar">
      <div className="navbar-logo">panda</div>
      <nav className="navbar-links">
        <Link href="/dashboard">My Board</Link>
      </nav>

      <div className="navbar-actions">
        {user && (
          <>
            <div className="navbar-user">
              {user.photoURL ? (<img src={user.photoURL}
                                alt="Profile"
                                classname="navbar-profile"/>
                              ) : (
                                <div className="navbar-profile">
                                  {user.displayName?.charAt(0)}
                                </div>
                              )
              }

              <span className="navbar-user-name">
                {user.displayName}
              </span>
            </div>
            <button className="navbar-logout" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
