import { useState, useEffect } from "react";
import { Service } from "../../types"; // adjust the path as needed
import "./ServiceCard.css";
import { JSX } from "react/jsx-runtime";
import axios from "axios";

interface Comment {
    text: string;
    timestamp: string;
}

function ServiceCard({ service, userId, isAdmin }: { service: Service, userId: string, isAdmin: boolean }): JSX.Element {
    console.log(service)
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState<Comment[]>([]);

    const handleAddComment = () => {
        if (comment.trim() === "") return; // skip empty comments

        console.log("New comment:", comment);
        const timestamp = new Date().toLocaleString();
        const newComment: Comment = { text: comment, timestamp: timestamp };

        setComments([...comments, newComment]); // add new comment to list
        // TODO: Comments don't update the database
        setComment(""); // reset the textarea
    };

    const flagService = async (s: Service) => {
        await axios.post("http://localhost:3000/flag", { id: s.id });
    };

    const unflagService = async (s: Service) => {
        try {
            console.log(s) //this is correct
            console.log(s.id)
            console.log(userId)
            await axios.post("http://localhost:3000/unflag", { postId: s.id, userId });
            // Optionally refresh or adjust the state here to reflect the change.
        } catch (error) {
            console.error("Error unflagging service:", error);
        }
    }

    return (
        <div className="service-card">
            <div style={{ position: "relative", textAlign: "center", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0, color:service.ServiceType ? "#9A3131":"white"}}>
                    {service.ServiceType ? 'Service Post' : 'General Post'}
                </h3>
                <button
                    onClick={() => navigator.clipboard.writeText(String(service.id))}
                    title="Copy Post ID"
                    style={{
                        position: "absolute",
                        right: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "24px",
                        height: "24px",
                        background: "none",
                        border: "1px solid #aaa",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        padding: 0,
                        fontSize: "14px",
                    }}
                >
                    📋
                </button>

                {service.flagged ? (
                    isAdmin && (
                        <button
                            onClick={() => unflagService(service)}
                            title="Unflag Post"
                            style={{
                                position: "absolute",
                                right: 0,
                                top: "50%",
                                transform: "translateY(-50%) translateX(-100%)",
                                width: "24px",
                                height: "24px",
                                background: "none",
                                border: "1px solid red",
                                borderRadius: "4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                padding: 0,
                                fontSize: "14px",
                            }}
                        >
                            ❌
                        </button>
                    )
                ) : (
                    <button
                        onClick={() => flagService(service)}
                        title="Flag Post"
                        style={{
                            position: "absolute",
                            right: 0,
                            top: "50%",
                            transform: "translateY(-50%) translateX(-100%)",
                            width: "24px",
                            height: "24px",
                            background: "none",
                            border: "1px solid #aaa",
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            padding: 0,
                            fontSize: "14px",
                        }}
                    >
                        🚩
                    </button>
                )}
            </div>

            {/* Display the picture if it exists */}
            {service.picture ? (
                service.picture.startsWith("data:application") ? (
                    <img src={service.picture} alt="service" style={{ width: "600px" }} />
                ) : (
                    <>
                        <iframe src={service.picture} width="400" height="500" title="file-view" />
                        {console.log('\n')}
                    </>
                )
            ) : (
                <p>No picture available</p>
            )}

            {service.groupId && <p><i>Group: {service.groupId}</i></p>}
            {service.category && service.category.length > 0 && (
                <p><i>Categories: {service.category.join(', ')}</i></p>
            )}
            <p>{service.description}</p>
            <p><i>Posted on: {new Date(service.timestamp).toLocaleString()}</i></p> {/* 'Posted on' label */}

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
