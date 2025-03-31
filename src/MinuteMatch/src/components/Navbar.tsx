import React from 'react';
import "./Navbar.css"
import {Link} from 'react-router-dom';

const Navbar=()=>{
    return (<>
        <Link to="/" className="navbar-item">View</Link>
        <Link to="/post-services" className="navbar-item">Post Service</Link>
        </>
    )

}

export default Navbar;