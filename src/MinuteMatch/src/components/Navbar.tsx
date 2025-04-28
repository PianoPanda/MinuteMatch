// //import React from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import './Navbar.css';

// interface NavbarItem {
//   route: string;
//   text: string;
// }

// const Navbar = () => {
//   const location = useLocation();
//     // add in the other paths and services to our navbar
//   const navbarInfo: NavbarItem[] = [
//     { route: '/', text: 'View' },
//     { route: '/post-service', text: 'Post Service' },
//     { route: '/request', text: 'Request Service' },
//     { route: '/useraccount', text: 'User Account' },
//     { route: '/groups', text: 'Groups' },
//     { route: '/category', text: 'Category' },
//   ];

//   return (
//     <nav className="navbar">
//       {navbarInfo.map((item, index) => (
//         <Link
//           to={item.route}
//           className={location.pathname === item.route ? 'navbar-item-highlight' : 'navbar-item'}
//           key={index}
//         >
//           {item.text}
//         </Link>
//       ))}
//     </nav>
//   );
// };

// export default Navbar;
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

interface NavbarItem {
  route: string;
  text: string;
}

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navbarInfo: NavbarItem[] = [
    { route: '/', text: 'View' },
    { route: '/post-service', text: 'Post Service' },
    { route: '/request', text: 'Request Service' },
    { route: '/useraccount', text: 'User Account' },
    { route: '/groups', text: 'Groups' },
    { route: '/category', text: 'Category' },
  ];

  const handleLogout = () => {
    localStorage.clear(); // clear session
    navigate('/login');   // redirect to login
  };

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

      {/* 🔐 Logout button */}
      <button className="navbar-item logout-button" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
};

export default Navbar;