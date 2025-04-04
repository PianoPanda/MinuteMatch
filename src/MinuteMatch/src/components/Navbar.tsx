//import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

interface NavbarItem {
  route: string;
  text: string;
}

const Navbar = () => {
  const location = useLocation();
    // add in the other paths and services to our navbar
  const navbarInfo: NavbarItem[] = [
    { route: '/', text: 'View' },
    { route: '/post-service', text: 'Post Service' },
    { route: '/request', text: 'Request Service' },
  ];

  return (
    <nav className="navbar">
      {navbarInfo.map((item, index) => (
        <Link
          to={item.route}
          className={location.pathname === item.route ? 'navbar-item-highlight' : 'navbar-item'}
          key={index}
        >
          {item.text}
        </Link>
      ))}
    </nav>
  );
};

export default Navbar;