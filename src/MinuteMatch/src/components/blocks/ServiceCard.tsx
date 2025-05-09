import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Service } from "../../types"; // adjust the path as needed
import "./ServiceCard.css";
import { JSX } from "react/jsx-runtime";
import axios from "axios";

interface Comment {
  username: string;
  text: string;
  timestamp: string;
}

function ServiceCard({ service, userId, isAdmin }: { service: Service, userId: string, isAdmin: boolean }): JSX.Element {
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

  const flagService = async (s: Service) => {
      await axios.post("http://localhost:3000/flag", { id: s.id });
  };

  const unflagService = async (s: Service) => {
      try {
          console.log(s) //this is correct
          console.log(s.id)
          console.log(userId)
          // console.log("ServiceCard 38:", isAdmin)
          if (isAdmin) {
            await axios.post("http://localhost:3000/unflag", { postId: s.id, userId });
          }
          // Optionally refresh or adjust the state here to reflect the change.
      } catch (error) {
          console.error("Error unflagging service:", error);
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
