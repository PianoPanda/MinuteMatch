import {useState} from 'react';
import "./Navbar.css"
import {Link} from 'react-router-dom';

const Navbar=()=>{
    const [curPage,updateCurPage] = useState<number>(0)
    const navbarInfo = [
        {route:"/",text:"View"},
        {route:"/post-service",text:"Post Service"},
        {route:"/request",text:"Request Service"}
    ]
    return (<>
            {navbarInfo.map((item,index)=>(curPage!=index)?<Link to={item.route} className="navbar-item" key={index} onClick={()=>updateCurPage(index)}>{item.text}</Link>:<Link to={item.route} className="navbar-item-highlight" key={index} onClick={()=>updateCurPage(index)}>{item.text}</Link>)}
        </>
    )

}

export default Navbar;