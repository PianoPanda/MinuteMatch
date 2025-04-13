import React, { useState } from "react";

import { Service } from "../../types"; // adjust the path as needed
import "./ServiceCard.css";
import { JSX } from "react/jsx-runtime";

interface Comment {
    text: string;
    timestamp: string;
}

function ServiceCard({ service }: { service: Service }): JSX.Element {
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState<Comment[]>([]);

    const handleAddComment = () => {
        if (comment.trim() === "") return; // skip empty comments

        console.log("New comment:", comment);
        const timestamp = new Date().toLocaleString();
        const comment_yay: Comment = {
            text: comment,
            timestamp: timestamp,
          };
        const newComment: Comment = comment_yay;

        setComments([...comments, newComment]); // add new comment to list
        //TODO: Comments don't update database
        setComment(""); // reset textarea
    };

    return (
        <div className="service-card">
            <h3>{service.ServiceType ? 'Service Post' : 'General Post'}</h3>

            {/* Display the picture if it exists */}
            {service.picture ? (
                service.picture.startsWith("data:application")
                ? <img src={service.picture} alt="service" style={{ width: "200px" }} />
                : <>
                <iframe src={service.picture} width="400" height="500" title="file-view" />
                {console.log('\n')}
                </>
            ) : (
                console.log(`${service.picture}`),
                console.log(`${service.user.id}`),
                console.log(`${service.user}`),
                <p>No picture available</p>
            )}

            <i>Posted by: <b>{service.user.id}</b></i>
            {service.groupId && <p><i>Group: {service.groupId}</i></p>}
            {service.category && service.category.length > 0 && (
                <p><i>Categories: {service.category.join(', ')}</i></p>
            )}
            <p>{service.description}</p>
            <p><i>Posted on: {new Date(service.timestamp).toLocaleString()}</i></p> {/*'Posted on' label*/}

            {/* Display the comments that have been posted to a post */}
            {comments.map((c, index) => (
                <div key={index} className="comment">
                    <p>{c.text}</p>
                    <p>{c.timestamp}</p>
                </div>
            ))}

            {/* 'Add comment' button triggers the setComment function call */}
            <textarea
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
            />
            <button onClick={handleAddComment}>Add Comment</button>
        </div>
    );
}

export default ServiceCard;