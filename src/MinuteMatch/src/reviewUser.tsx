
import React, { useEffect, useState } from "react";
import Autosuggest from "react-autosuggest";
import axios from "axios";
import Navbar from "./components/Navbar";
import { useLocation } from "react-router-dom";
import "./reviewUser.css";

const ReviewUser: React.FC = () => {
  const location = useLocation();
  const state = location.state as { username?: string; postId?: string };

  const [username, setUsername] = useState("Loading...");
  const [formData, setFormData] = useState({
    who_ranked: state?.username || "",
    post_ID: state?.postId || "",
    text: "",
    category: "",
    score: 0,
  });
  const [searchUsername, setSearchUsername] = useState(state?.username || "");
  const [searchUserReviews, setSearchUserReviews] = useState<any[]>([]);
  const [allUsernames, setAllUsernames] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [userSuggestions, setUserSuggestions] = useState<string[]>([]);
  const [categorySuggestions, setCategorySuggestions] = useState<string[]>([]);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);

    const fetchUsernames = async () => {
      try {
        const res = await axios.get("http://localhost:3000/usernames");
        setAllUsernames(res.data);
      } catch (err) {
        console.error("Error fetching usernames:", err);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:3000/categories");
        setAllCategories(res.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchUsernames();
    fetchCategories();

    // Auto-trigger review load if username provided
    if (state?.username) fetchSearchUserReviews(state.username);
  }, [state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.who_ranked.trim().toLowerCase() === username.trim().toLowerCase()) {
      alert("You cannot rate yourself.");
      return;
    }

    try {
      await axios.post("http://localhost:3000/reviews", {
        reviewer: username,
        ...formData,
        score: Number(formData.score),
      });

      alert("Review submitted!");
      setFormData({ who_ranked: "", post_ID: "", text: "", category: "", score: 0 });
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to submit review.");
    }
  };

  const fetchSearchUserReviews = async (targetUsername?: string) => {
    const userToSearch = targetUsername || searchUsername;
    if (!userToSearch) return;
    try {
      const res = await axios.get("http://localhost:3000/userreview", {
        params: { username: userToSearch },
      });
      setSearchUserReviews(res.data);
    } catch (err) {
      console.error("Failed to fetch searched user reviews", err);
    }
  };

  const getCategorySuggestions = (value: string) => {
    const input = value.toLowerCase().trim();
    return allCategories.filter(c => c.toLowerCase().includes(input)).slice(0, 10);
  };

  const getUserSuggestions = (value: string) => {
    const input = value.toLowerCase().trim();
    return allUsernames.filter(user => user.toLowerCase().includes(input)).slice(0, 10);
  };

  return (
    <>
      <Navbar />
      <div className="user-account-container">
        <div className="rate-user-panel">
          <h2>Rate Another User</h2>
          <form className="rate-form" onSubmit={handleSubmit}>
            <label>Username</label>
            <Autosuggest
              suggestions={userSuggestions}
              onSuggestionsFetchRequested={({ value }) => setUserSuggestions(getUserSuggestions(value))}
              onSuggestionsClearRequested={() => setUserSuggestions([])}
              getSuggestionValue={s => s}
              renderSuggestion={s => <div>{s}</div>}
              inputProps={{
                placeholder: "Search username...",
                value: formData.who_ranked,
                onChange: (_e, { newValue }) => setFormData({ ...formData, who_ranked: newValue })
              }}
            />

            <label>Post ID</label>
            <input
              type="text"
              className="rate-input"
              value={formData.post_ID}
              placeholder="Enter Post ID"
              onChange={(e) => setFormData({ ...formData, post_ID: e.target.value })}
            />

            <label>Review Text</label>
            <textarea
              className="rate-textarea"
              placeholder="Write your review..."
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            />

            <label>Category</label>
            <Autosuggest
              suggestions={categorySuggestions}
              onSuggestionsFetchRequested={({ value }) => setCategorySuggestions(getCategorySuggestions(value))}
              onSuggestionsClearRequested={() => setCategorySuggestions([])}
              getSuggestionValue={s => s}
              renderSuggestion={s => <div>{s}</div>}
              inputProps={{
                placeholder: "Type category...",
                value: formData.category,
                onChange: (_e, { newValue }) => setFormData({ ...formData, category: newValue })
              }}
            />

            <label>Score (0–5)</label>
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              className="rate-slider"
              value={formData.score}
              onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) })}
            />
            <div style={{ textAlign: "right" }}>{formData.score}/5</div>

            <button type="submit" className="rate-submit">
              Submit Review
            </button>
          </form>
        </div>

        <div className="section">
          <h2>Search User Reviews</h2>
          <Autosuggest
            suggestions={userSuggestions}
            onSuggestionsFetchRequested={({ value }) => setUserSuggestions(getUserSuggestions(value))}
            onSuggestionsClearRequested={() => setUserSuggestions([])}
            getSuggestionValue={s => s}
            renderSuggestion={s => <div>{s}</div>}
            inputProps={{
              placeholder: "Search username...",
              value: searchUsername,
              onChange: (_e, { newValue }) => setSearchUsername(newValue)
            }}
          />
          <button onClick={() => fetchSearchUserReviews()} className="rate-submit" style={{ marginTop: "1rem" }}>
            Search Reviews
          </button>
          <div className="review-feed" style={{ marginTop: "1rem" }}>
            {searchUserReviews.length > 0 ? (
              searchUserReviews.map((r, i) => (
                <div key={i} className="review-card">
                  <strong>{r.category}</strong> — {r.score}/5
                  <p>{r.text}</p>
                  <small>by {r.reviewer}</small>
                </div>
              ))
            ) : (
              <p>No reviews for this user.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReviewUser;
