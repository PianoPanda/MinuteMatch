import {Service} from "../../types.ts";
import "./ServiceCard.css";

function ServiceCard({service}:{service:Service}) {
    return(<div className="service-card">
        <h3>{service.type}</h3>
        <i>{service.group}</i>
        <p>{service.category}</p>
        <p>{service.description}</p>
    </div>)
}

export default ServiceCard;