
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import "./UserAccount.css";

const UserAccount: React.FC = () => {
  const [username, setUsername] = useState("Loading...");
  const [rank, setRank] = useState<number | null>(null);
  const [reviews, setReviews] = useState<[string, number][]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [lastActive, setLastActive] = useState<string>("");
  const [flagged, setFlagged] = useState<boolean>(false);
  const [reviewFeed, setReviewFeed] = useState<any[]>([]);
  const [reviewCategory, setReviewCategory] = useState("");

  const navigate = useNavigate();

  const calculateCategoryAverages = (reviewList: any[]): [string, number][] => {
    const grouped: Record<string, number[]> = {};
    reviewList.forEach((r) => {
      if (!grouped[r.category]) grouped[r.category] = [];
      grouped[r.category].push(r.score);
    });
    return Object.entries(grouped).map(([category, scores]) => {
      const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      return [category, avg];
    });
  };

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) return navigate("/login");

    const fetchUserData = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/user?username=${encodeURIComponent(storedUsername)}`);
        const user = res.data;

        setUsername(user.username || "Unknown");
        setRank(user.ranking ?? null);
        setReviews(calculateCategoryAverages(user.reviews || []));
        setGroups(user.group_members.map((m)=>m.group.groupname) || []);
        setLastActive(user.last_active || new Date().toISOString());
        setFlagged(user.flagged ?? false);
      } catch (err) {
        console.error("Error fetching user:", err);
        navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    const fetchUserReviews = async () => {
      try {
        const res = await axios.get("http://localhost:3000/userreview", {
          params: {
            username,
            category: reviewCategory || undefined,
          },
        });
        setReviewFeed(res.data);
      } catch (err) {
        console.error("Error fetching user reviews:", err);
      }
    };
    if (username !== "Loading...") fetchUserReviews();
  }, [username, reviewCategory]);

  return (
    <>
      <Navbar />
      <div className="ua-container">
        <div className="ua-info-panel">
          <h1 className="ua-title">👤 {username}</h1>
          <p><strong>Ranking:</strong> {rank?.toFixed(1) ?? "N/A"}</p>
          <p><strong>Last Active:</strong> {new Date(lastActive).toLocaleString()}</p>
          <p><strong>Account Flagged:</strong> {flagged ? "Yes" : "No"}</p>

          <div className="ua-section">
            <h2 className="ua-subtitle">Groups</h2>
            <ul className="ua-group-list">
              {groups.length > 0 ? (
                groups.map((group, idx) => <li key={idx}>{group}</li>)
              ) : (
                <li>No groups joined</li>
              )}
            </ul>
          </div>

          <div className="ua-section">
            <h2 className="ua-subtitle">Category-Based Ratings</h2>
            <div className="ua-grid">
              {reviews.length > 0 ? (
                reviews.map(([category, score], idx) => (
                  <div key={idx} className="ua-box">
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

        <div className="ua-info-panel">
          <h2 className="ua-subtitle">All Reviews</h2>
          <div className="ua-feed">
            {reviewFeed.length > 0 ? (
              reviewFeed.map((r, i) => (
                <div key={i} className="ua-card">
                  <strong>{r.category}</strong> — {r.score}/5
                  <p>{r.text}</p>
                  <small>by {r.reviewer}</small>
                </div>
              ))
            ) : (
              <p>No reviews to show.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserAccount;
