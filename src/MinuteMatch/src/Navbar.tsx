import React from 'react';
import {Link} from 'react-router-dom';

const Navbar=()=>{
    return (<>
        <Link to="/">View</Link>
        <Link to="/post-services">Post Service</Link>
        </>
    )

}

export default Navbar;