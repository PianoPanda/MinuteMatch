import React from "react";

import { Service } from "../../types"; // adjust the path as needed
import "./ServiceCard.css";
import { JSX } from "react/jsx-runtime";

function ServiceCard({ service }: { service: Service }): JSX.Element {
    return (
        <div className="service-card">
            <h3>{service.ServiceType ? 'Service Post' : 'General Post'}</h3>

            {/* Display the picture if it exists */}
            {service.picture ? (
                service.picture.startsWith("data:application")
                ? <img src={service.picture} alt="service" style={{ width: "200px" }} />
                : <iframe src={service.picture} width="400" height="500" title="file-view" />
            ) : (
                console.log(`${service.picture}`),
                <p>No picture available</p>
            )}

            <i>Posted by: <b>{service.user.name}</b></i>
            {service.groupId && <p><i>Group: {service.groupId}</i></p>}
            {service.category && service.category.length > 0 && (
                <p><i>Categories: {service.category.join(', ')}</i></p>
            )}
            <p>{service.description}</p>
            <p><i>Posted on: {new Date(service.timestamp).toLocaleString()}</i></p>
            {service.postComments && service.postComments.length > 0 && (
                <div className="comments">
                    {service.postComments.map((comment, index) => (
                        <div key={index} className="comment">
                            <p>{comment}</p>
                        </div>
                    ))}
                </div>
            )}

            <textarea placeholder="Add a comment..." />
            <button>Add Comment</button>
        </div>
    );
}

export default ServiceCard;