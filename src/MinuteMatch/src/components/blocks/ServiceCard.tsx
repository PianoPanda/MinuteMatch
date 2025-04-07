import {Service} from "../../types.ts";
import "./ServiceCard.css";
//TODO: Test picture
function ServiceCard({service}:{service:Service}) {
    // console.log(service);
    // return(<div className="service-card">
    //     <h3>{service.type}</h3>
    //     {!service.picture?<p></p>:<img src={service.picture} alt="service-image"/>}
    //     <i>Posted By <b>{service.user.name}</b></i>
    //     <p><i>{service.group?service.group:""}</i></p>
    //     <p>{service.category}</p>
    //     <p>{service.description}</p>
    // </div>)
}

export default ServiceCard;