import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Service } from "../../types";
import "./ServiceCard.css";
import { JSX } from "react/jsx-runtime";
import axios from "axios";

interface Comment {
  username: string;
  text: string;
  timestamp: string;
}

function ServiceCard({ service }: { service: Service }): JSX.Element {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [isFlagged, setIsFlagged] = useState<boolean>(service.flagged || false);
  const navigate = useNavigate();

  useEffect(() => {
    if (service.comments && Array.isArray(service.comments)) {
      setComments(service.comments);
    }
  }, [service.comments]);

  const handleAddComment = async () => {
    if (comment.trim() === "") return;
    const username = localStorage.getItem("username");
    if (!username) {
      alert("You must be logged in to comment.");
      return;
    }
    try {
      const response = await axios.post("http://localhost:3000/comment", {
        postId: service.id,
        username,
        text: comment,
      });
      const newComment = response.data.comment;
      setComments([...comments, newComment]);
      setComment("");
    } catch (err) {
      console.error("Failed to submit comment:", err);
      alert("Failed to add comment.");
    }
  };

  async function flagService(s: Service) {
    try {
      await axios.post("http://localhost:3000/flag", { id: s.id });
      setIsFlagged(true);
    } catch (err) {
      console.error("Failed to flag service:", err);
    }
  }

  const handleUsernameClick = (clickedUsername: string) => {
    navigate("/reviewuser", {
      state: {
        username: clickedUsername,
        postId: service.id,
      },
    });
  };

  return (
    <div className="service-card">
      <div className="card-header">
        <h3 style={{ color: service.ServiceType ? "green" : "red" }}>
          {service.ServiceType ? "Service Post" : "Request Post"}
        </h3>
        <i className="username-label">
          Posted by: <b onClick={() => handleUsernameClick(service.username)} className="clickable">{service.username}</b>
        </i>
        <button
          onClick={() => navigator.clipboard.writeText(String(service.id))}
          title="Copy Post ID"
          className="icon-button copy"
        >📋</button>
        <button
          onClick={() => !isFlagged && flagService(service)}
          title={isFlagged ? "Already flagged" : "Flag Post"}
          className="icon-button flag"
          disabled={isFlagged}
        >🚩</button>
      </div>

      {service.picture ? (
        service.picture.startsWith("data:application") ? (
          <img src={service.picture} alt="service" />
        ) : (
          <iframe
            src={service.picture}
            width="400"
            height="500"
            title="file-view"
          />
        )
      ) : <p>No picture available</p>}

      {service.groupId && <p><i>Group: {service.groupId}</i></p>}

      {service.category?.length > 0 && (
        <p><i>Categories: {service.category.join(", ")}</i></p>
      )}

      <p>{service.description}</p>
      <p><i>Posted on: {new Date(service.timestamp).toLocaleString()}</i></p>

      <div className="comments-section">
        <h4>Comments</h4>
        {comments.length > 0 ? (
          comments.map((c, index) => (
            <div key={index} className="comment">
              <p><strong onClick={() => handleUsernameClick(c.username)} className="clickable">{c.username}</strong>: {c.text}</p>
              <p className="timestamp">{new Date(c.timestamp).toLocaleString()}</p>
            </div>
          ))
        ) : (
          <p>No comments yet.</p>
        )}
      </div>

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