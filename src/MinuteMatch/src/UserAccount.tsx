import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./components/Navbar";
import "./UserAccount.css";

const UserAccount: React.FC = () => {
  const [username, setUsername] = useState("Loading...");
  const [rank, setRank] = useState<number | null>(null);
  const [reviews, setReviews] = useState<[string, number][]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [lastActive, setLastActive] = useState<string>("");
  const [flagged, setFlagged] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    reviewee: "",
    postId: "",
    text: "",
    rating: 0,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get("http://localhost:3000/user");
        const user = res.data[0];
        setUsername(user.Username);
        setRank(user.Ranking);
        setReviews(user.Reviews);
        setGroups(user.Groups || []);
        setLastActive(user.Last_active);
        setFlagged(user.Flagged);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    fetchUserData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/reviews", {
        reviewer: username,
        ...formData,
        rating: Number(formData.rating),
      });
      alert("Review submitted!");
      setFormData({ reviewee: "", postId: "", text: "", rating: 0 });
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to submit review.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="user-account-container">
        <div className="user-account-layout">
          {/* LEFT: User Details */}
          <div className="user-details-panel">
            <h1>👤 {username}</h1>
            <p><strong>Ranking:</strong> {rank?.toFixed(1) ?? "N/A"}</p>
            <p><strong>Last Active:</strong> {new Date(lastActive).toLocaleString()}</p>
            <p><strong>Account Flagged:</strong> {flagged ? "Yes" : "No"}</p>

            <div className="section">
              <h2>Groups</h2>
              <ul className="group-list">
                {groups.length > 0 ? (
                  groups.map((group, idx) => <li key={idx}>{group}</li>)
                ) : (
                  <li>No groups joined</li>
                )}
              </ul>
            </div>

            <div className="section">
              <h2>Category-Based Ratings</h2>
              <div className="category-grid">
                {reviews.length > 0 ? (
                  reviews.map(([category, score], idx) => (
                    <div key={idx} className="category-box">
                      <strong>{category}</strong>
                      <div>{score}/5</div>
                    </div>
                  ))
                ) : (
                  <p>No reviews yet</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Rate Form */}
          <div className="rate-user-panel">
            <h2>Rate Another User</h2>
            <form className="rate-form" onSubmit={handleSubmit}>
              <label>Username</label>
              <input
                type="text"
                placeholder="Type username..."
                className="rate-input"
                value={formData.reviewee}
                onChange={(e) => setFormData({ ...formData, reviewee: e.target.value })}
              />

              <label>Post ID</label>
              <input
                type="text"
                placeholder="Enter Post ID"
                className="rate-input"
                value={formData.postId}
                onChange={(e) => setFormData({ ...formData, postId: e.target.value })}
              />

              <label>Review Text</label>
              <textarea
                placeholder="Write your review..."
                className="rate-textarea"
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              />

              <label>Rating (0–5)</label>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                className="rate-slider"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
              />
              <div style={{ textAlign: "right" }}>{formData.rating}/5</div>

              <button type="submit" className="rate-submit">
                Submit Review
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserAccount;