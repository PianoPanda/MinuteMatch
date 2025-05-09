
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useState } from 'react';

interface NavbarItem {
  route: string;
  text: string;
}

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const navbarInfo: NavbarItem[] = [
    { route: '/', text: 'View' },
    { route: '/groups', text: 'Groups' },
    { route: '/category', text: 'Category' },
    { route: '/post-service', text: 'Post' },
    //{ route: '/request', text: 'Request Service' }, // remove as not used at all
    { route: '/useraccount', text: 'Profile' },
    {route: '/reviewuser', text: 'Search User'}
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="navbar-container">
      <button className="hamburger" onClick={toggleMenu}>
        ☰
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          {navbarInfo.map((item, index) => (
            <Link
              to={item.route}
              className={location.pathname === item.route ? 'navbar-item-highlight' : 'navbar-item'}
              key={index}
              onClick={() => setIsOpen(false)}
            >
              {item.text}
            </Link>
          ))}
          <button className="navbar-item logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;