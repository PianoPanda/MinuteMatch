// import React, { useEffect, useState } from "react";
// import Autosuggest from "react-autosuggest";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import Navbar from "./components/Navbar";
// import "./UserAccount.css";

// const UserAccount: React.FC = () => {
//   const [username, setUsername] = useState("Loading...");
//   const [rank, setRank] = useState<number | null>(null);
//   const [reviews, setReviews] = useState<[string, number][]>([]);
//   const [groups, setGroups] = useState<string[]>([]);
//   const [lastActive, setLastActive] = useState<string>("");
//   const [flagged, setFlagged] = useState<boolean>(false);

//   const [categorySuggestions, setCategorySuggestions] = useState<string[]>([]);
//   const [allCategories, setAllCategories] = useState<string[]>([]);

//   const [userSuggestions, setUserSuggestions] = useState<string[]>([]);
//   const [allUsernames, setAllUsernames] = useState<string[]>([]);

//   const [formData, setFormData] = useState({
//     who_ranked: "",
//     post_ID: "",
//     text: "",
//     category: "",
//     score: 0,
//   });

//   const [reviewFeed, setReviewFeed] = useState<any[]>([]);
//   const [reviewCategory, setReviewCategory] = useState("");
//   const [searchUsername, setSearchUsername] = useState("");
//   const [searchUserReviews, setSearchUserReviews] = useState<any[]>([]);

//   const navigate = useNavigate();

//   const calculateCategoryAverages = (reviewList: any[]): [string, number][] => {
//     const grouped: Record<string, number[]> = {};
//     reviewList.forEach((r) => {
//       if (!grouped[r.category]) grouped[r.category] = [];
//       grouped[r.category].push(r.score);
//     });
//     return Object.entries(grouped).map(([category, scores]) => {
//       const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
//       return [category, avg];
//     });
//   };

//   const calculateOverallRank = (reviewList: any[]): number => {
//     if (!reviewList.length) return 0;
//     const total = reviewList.reduce((sum, r) => sum + r.score, 0);
//     return total / reviewList.length;
//   };

//   useEffect(() => {
//     const storedUsername = localStorage.getItem("username");
//     if (!storedUsername) return navigate("/login");

//     const fetchUserData = async () => {
//       try {
//         const res = await axios.get(`http://localhost:3000/user?username=${encodeURIComponent(storedUsername)}`);
//         const user = res.data;

//         setUsername(user.username || "Unknown");
//         setRank(user.ranking ?? null);
//         setReviews(calculateCategoryAverages(user.reviews || []));
//         setGroups(user.groups || []);
//         setLastActive(user.last_active || new Date().toISOString());
//         setFlagged(user.flagged ?? false);
//       } catch (err) {
//         console.error("Error fetching user:", err);
//         navigate("/login");
//       }
//     };

//     const fetchCategories = async () => {
//       try {
//         const res = await axios.get("http://localhost:3000/categories");
//         setAllCategories(res.data);
//       } catch (err) {
//         console.error("Error fetching categories:", err);
//       }
//     };

//     const fetchUsernames = async () => {
//       try {
//         const res = await axios.get("http://localhost:3000/usernames");
//         if (Array.isArray(res.data)) {
//           setAllUsernames(res.data.filter(u => u.toLowerCase() !== storedUsername.toLowerCase()));
//         }
//       } catch (err) {
//         console.error("Error fetching usernames:", err);
//       }
//     };

//     fetchUserData();
//     fetchCategories();
//     fetchUsernames();
//   }, [navigate]);

//   const fetchUserReviews = async () => {
//     try {
//       const res = await axios.get("http://localhost:3000/userreview", {
//         params: {
//           username,
//           category: reviewCategory || undefined,
//         },
//       });
//       setReviewFeed(res.data);
//     } catch (err) {
//       console.error("Error fetching user reviews:", err);
//     }
//   };

//   const fetchSearchUserReviews = async () => {
//     if (!searchUsername) return;
//     try {
//       const res = await axios.get("http://localhost:3000/userreview", {
//         params: { username: searchUsername },
//       });
//       setSearchUserReviews(res.data);
//     } catch (err) {
//       console.error("Failed to fetch searched user reviews", err);
//     }
//   };

//   useEffect(() => {
//     if (username !== "Loading...") {
//       fetchUserReviews();
//     }
//   }, [username, reviewCategory]);

//   const getCategorySuggestions = (value: string) => {
//     const input = value.toLowerCase().trim();
//     return allCategories.filter(c => c.toLowerCase().includes(input)).slice(0, 10);
//   };

//   const getUserSuggestions = (value: string) => {
//     const input = value.toLowerCase().trim();
//     return allUsernames
//       .filter(user => user.toLowerCase().includes(input))
//       .slice(0, 10);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (formData.who_ranked.trim().toLowerCase() === username.trim().toLowerCase()) {
//       alert("You cannot rate yourself.");
//       return;
//     }

//     try {
//       await axios.post("http://localhost:3000/reviews", {
//         reviewer: username,
//         who_ranked: formData.who_ranked,
//         post_ID: formData.post_ID,
//         text: formData.text,
//         category: formData.category,
//         score: Number(formData.score),
//       });

//       const res = await axios.get(`http://localhost:3000/user?username=${formData.who_ranked}`);
//       const updatedUser = res.data;

//       if (formData.who_ranked.trim().toLowerCase() === username.trim().toLowerCase()) {
//         setReviews(calculateCategoryAverages(updatedUser.reviews || []));
//         setRank(calculateOverallRank(updatedUser.reviews || []));
//       }

//       alert("Review submitted!");
//       setFormData({ who_ranked: "", post_ID: "", text: "", category: "", score: 0 });
//     } catch (err: any) {
//       alert(err?.response?.data?.error || "Failed to submit review.");
//     }
//   };

//   return (
//     <>
//       <Navbar />
//       <div className="user-account-container">
//         <div className="user-account-layout">
//           <div className="user-details-panel">
//             <h1>👤 {username}</h1>
//             <p><strong>Ranking:</strong> {rank?.toFixed(1) ?? "N/A"}</p>
//             <p><strong>Last Active:</strong> {new Date(lastActive).toLocaleString()}</p>
//             <p><strong>Account Flagged:</strong> {flagged ? "Yes" : "No"}</p>

//             <div className="section">
//               <h2>Groups</h2>
//               <ul className="group-list">
//                 {groups.length > 0 ? (
//                   groups.map((group, idx) => <li key={idx}>{group}</li>)
//                 ) : (
//                   <li>No groups joined</li>
//                 )}
//               </ul>
//             </div>

//             <div className="section">
//               <h2>Category-Based Ratings</h2>
//               <div className="category-grid">
//                 {reviews.length > 0 ? (
//                   reviews.map(([category, score], idx) => (
//                     <div key={idx} className="category-box">
//                       <strong>{category}</strong>
//                       <div>{score}/5</div>
//                     </div>
//                   ))
//                 ) : (
//                   <p>No reviews yet</p>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* RIGHT: Rate Form */}
//           <div className="rate-user-panel">
//             <h2>Rate Another User</h2>
//             <form className="rate-form" onSubmit={handleSubmit}>
//               <label>Username</label>
//               <Autosuggest
//                 suggestions={userSuggestions}
//                 onSuggestionsFetchRequested={({ value }) =>
//                   setUserSuggestions(getUserSuggestions(value))
//                 }
//                 onSuggestionsClearRequested={() => setUserSuggestions([])}
//                 getSuggestionValue={s => s}
//                 renderSuggestion={s => <div>{s}</div>}
//                 inputProps={{
//                   placeholder: "Search username...",
//                   value: formData.who_ranked,
//                   onChange: (_e, { newValue }) =>
//                     setFormData({ ...formData, who_ranked: newValue })
//                 }}
//               />

//               <label>Post ID</label>
//               <input
//                 type="text"
//                 className="rate-input"
//                 value={formData.post_ID}
//                 placeholder="Enter Post ID"
//                 onChange={(e) => setFormData({ ...formData, post_ID: e.target.value })}
//               />

//               <label>Review Text</label>
//               <textarea
//                 className="rate-textarea"
//                 placeholder="Write your review..."
//                 value={formData.text}
//                 onChange={(e) => setFormData({ ...formData, text: e.target.value })}
//               />

//               <label>Category</label>
//               <Autosuggest
//                 suggestions={categorySuggestions}
//                 onSuggestionsFetchRequested={({ value }) =>
//                   setCategorySuggestions(getCategorySuggestions(value))
//                 }
//                 onSuggestionsClearRequested={() => setCategorySuggestions([])}
//                 getSuggestionValue={s => s}
//                 renderSuggestion={s => <div>{s}</div>}
//                 inputProps={{
//                   placeholder: "Type category...",
//                   value: formData.category,
//                   onChange: (_e, { newValue }) =>
//                     setFormData({ ...formData, category: newValue })
//                 }}
//               />

//               <label>Score (0–5)</label>
//               <input
//                 type="range"
//                 min="0"
//                 max="5"
//                 step="1"
//                 className="rate-slider"
//                 value={formData.score}
//                 onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) })}
//               />
//               <div style={{ textAlign: "right" }}>{formData.score}/5</div>

//               <button type="submit" className="rate-submit">
//                 Submit Review
//               </button>
//             </form>
//           </div>
//         </div>

//         <div className="section">
//           <h2>All Reviews</h2>
//           <input
//             className="rate-input"
//             type="text"
//             placeholder="Filter by category (optional)"
//             value={reviewCategory}
//             onChange={(e) => setReviewCategory(e.target.value)}
//           />
//           <div className="review-feed">
//             {reviewFeed.length > 0 ? (
//               reviewFeed.map((r, i) => (
//                 <div key={i} className="review-card">
//                   <strong>{r.category}</strong> — {r.score}/5
//                   <p>{r.text}</p>
//                   <small>by {r.reviewer}</small>
//                 </div>
//               ))
//             ) : (
//               <p>No reviews to show.</p>
//             )}
//           </div>
//         </div>

//         <div className="section">
//           <h2>Search User Reviews</h2>
//           <Autosuggest
//             suggestions={userSuggestions}
//             onSuggestionsFetchRequested={({ value }) =>
//               setUserSuggestions(getUserSuggestions(value))
//             }
//             onSuggestionsClearRequested={() => setUserSuggestions([])}
//             getSuggestionValue={s => s}
//             renderSuggestion={s => <div>{s}</div>}
//             inputProps={{
//               placeholder: "Search username...",
//               value: searchUsername,
//               onChange: (_e, { newValue }) => setSearchUsername(newValue)
//             }}
//           />
//           <button onClick={fetchSearchUserReviews} className="rate-submit" style={{ marginTop: "1rem" }}>
//             Search Reviews
//           </button>
//           <div className="review-feed" style={{ marginTop: "1rem" }}>
//             {searchUserReviews.length > 0 ? (
//               searchUserReviews.map((r, i) => (
//                 <div key={i} className="review-card">
//                   <strong>{r.category}</strong> — {r.score}/5
//                   <p>{r.text}</p>
//                   <small>by {r.reviewer}</small>
//                 </div>
//               ))
//             ) : (
//               <p>No reviews for this user.</p>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default UserAccount;

// see if the fix works
import React, { useEffect, useState } from "react";
import Autosuggest from "react-autosuggest";
import Autosuggest from "react-autosuggest";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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

  const [categorySuggestions, setCategorySuggestions] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [userSuggestions, setUserSuggestions] = useState<string[]>([]);
  const [allUsernames, setAllUsernames] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    who_ranked: "",
    post_ID: "",
    who_ranked: "",
    post_ID: "",
    text: "",
    category: "",
    score: 0,
  });

  const [reviewFeed, setReviewFeed] = useState<any[]>([]);
  const [reviewCategory, setReviewCategory] = useState("");
  const [searchUsername, setSearchUsername] = useState("");
  const [searchUserReviews, setSearchUserReviews] = useState<any[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) return navigate("/login");

    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) return navigate("/login");

    const fetchUserData = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/user?username=${encodeURIComponent(storedUsername)}`);
        const user = res.data;

        setUsername(user.username || "Unknown");
        setRank(user.ranking ?? null);
        setReviews(calculateCategoryAverages(user.reviews || []));
        setGroups(user.groups || []);
        setLastActive(user.last_active || new Date().toISOString());
        setFlagged(user.flagged ?? false);
      } catch (err) {
        console.error("Error fetching user:", err);
        navigate("/login");
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

    const fetchUsernames = async () => {
      try {
        const res = await axios.get("http://localhost:3000/usernames");
        if (Array.isArray(res.data)) {
          setAllUsernames(res.data.filter(u => u.toLowerCase() !== storedUsername.toLowerCase()));
        }
        const res = await axios.get(`http://localhost:3000/user?username=${encodeURIComponent(storedUsername)}`);
        const user = res.data;

        setUsername(user.username || "Unknown");
        setRank(user.ranking ?? null);
        setReviews(calculateCategoryAverages(user.reviews || []));
        setGroups(user.groups || []);
        setLastActive(user.last_active || new Date().toISOString());
        setFlagged(user.flagged ?? false);
      } catch (err) {
        console.error("Error fetching user:", err);
        navigate("/login");
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

    const fetchUsernames = async () => {
      try {
        const res = await axios.get("http://localhost:3000/usernames");
        if (Array.isArray(res.data)) {
          setAllUsernames(res.data.filter(u => u.toLowerCase() !== storedUsername.toLowerCase()));
        }
      } catch (err) {
        console.error("Error fetching usernames:", err);
        console.error("Error fetching usernames:", err);
      }
    };


    fetchUserData();
    fetchCategories();
    fetchUsernames();
  }, [navigate]);

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

  const calculateOverallRank = (reviewList: any[]): number => {
    if (!reviewList.length) return 0;
    const total = reviewList.reduce((sum, r) => sum + r.score, 0);
    return total / reviewList.length;
  };

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

  const fetchSearchUserReviews = async () => {
    if (!searchUsername) return;
    try {
      const res = await axios.get("http://localhost:3000/userreview", {
        params: { username: searchUsername },
      });
      setSearchUserReviews(res.data);
    } catch (err) {
      console.error("Failed to fetch searched user reviews", err);
    }
  };

  useEffect(() => {
    if (username !== "Loading...") {
      fetchUserReviews();
    }
  }, [username, reviewCategory]);

  const getCategorySuggestions = (value: string) => {
    const input = value.toLowerCase().trim();
    return allCategories.filter(c => c.toLowerCase().includes(input)).slice(0, 10);
  };

  const getUserSuggestions = (value: string) => {
    const input = value.toLowerCase().trim();
    return allUsernames
      .filter(user => user.toLowerCase().includes(input))
      .slice(0, 10);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.who_ranked.trim().toLowerCase() === username.trim().toLowerCase()) {
      alert("You cannot rate yourself.");
      return;
    }

    if (formData.who_ranked.trim().toLowerCase() === username.trim().toLowerCase()) {
      alert("You cannot rate yourself.");
      return;
    }

    try {
      await axios.post("http://localhost:3000/reviews", {
        reviewer: username,
        who_ranked: formData.who_ranked,
        post_ID: formData.post_ID,
        text: formData.text,
        category: formData.category,
        score: Number(formData.score),
      });

      alert("Review submitted!");
      setFormData({ who_ranked: "", post_ID: "", text: "", category: "", score: 0 });
      setFormData({ who_ranked: "", post_ID: "", text: "", category: "", score: 0 });
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to submit review.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="user-account-container">
        <div className="user-account-layout">
          {/* Panel 1 */}
          <div className="panel user-details-panel">
            <h1>👤 {username}</h1>
            <p><strong>Ranking:</strong> {rank?.toFixed(1) ?? "N/A"}</p>
            <p><strong>Last Active:</strong> {new Date(lastActive).toLocaleString()}</p>
            <p><strong>Account Flagged:</strong> {flagged ? "Yes" : "No"}</p>

            <h2>Groups</h2>
            <ul className="group-list">
              {groups.length > 0 ? (
                groups.map((group, idx) => <li key={idx}>{group}</li>)
              ) : (
                <li>No groups joined</li>
              )}
            </ul>

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

          {/* Panel 2 */}
          <div className="panel rate-user-panel">
            <h2>Rate Another User</h2>
            <form className="rate-form" onSubmit={handleSubmit}>
              <label>Username</label>
              <Autosuggest
                suggestions={userSuggestions}
                onSuggestionsFetchRequested={({ value }) =>
                  setUserSuggestions(getUserSuggestions(value))
                }
                onSuggestionsClearRequested={() => setUserSuggestions([])}
                getSuggestionValue={s => s}
                renderSuggestion={s => <div>{s}</div>}
                inputProps={{
                  placeholder: "Search username...",
                  value: formData.who_ranked,
                  onChange: (_e, { newValue }) =>
                    setFormData({ ...formData, who_ranked: newValue })
                }}
              <Autosuggest
                suggestions={userSuggestions}
                onSuggestionsFetchRequested={({ value }) =>
                  setUserSuggestions(getUserSuggestions(value))
                }
                onSuggestionsClearRequested={() => setUserSuggestions([])}
                getSuggestionValue={s => s}
                renderSuggestion={s => <div>{s}</div>}
                inputProps={{
                  placeholder: "Search username...",
                  value: formData.who_ranked,
                  onChange: (_e, { newValue }) =>
                    setFormData({ ...formData, who_ranked: newValue })
                }}
              />

              <label>Post ID</label>
              <input
                type="text"
                className="rate-input"
                value={formData.post_ID}
                className="rate-input"
                value={formData.post_ID}
                placeholder="Enter Post ID"
                onChange={(e) => setFormData({ ...formData, post_ID: e.target.value })}
                onChange={(e) => setFormData({ ...formData, post_ID: e.target.value })}
              />

              <label>Review Text</label>
              <textarea
                className="rate-textarea"
                className="rate-textarea"
                placeholder="Write your review..."
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              />

              <label>Category</label>
              <Autosuggest
                suggestions={categorySuggestions}
                onSuggestionsFetchRequested={({ value }) =>
                  setCategorySuggestions(getCategorySuggestions(value))
                }
                onSuggestionsClearRequested={() => setCategorySuggestions([])}
                getSuggestionValue={s => s}
                renderSuggestion={s => <div>{s}</div>}
                inputProps={{
                  placeholder: "Type category...",
                  value: formData.category,
                  onChange: (_e, { newValue }) =>
                    setFormData({ ...formData, category: newValue })
                }}
              />

              <label>Score (0–5)</label>
              <label>Category</label>
              <Autosuggest
                suggestions={categorySuggestions}
                onSuggestionsFetchRequested={({ value }) =>
                  setCategorySuggestions(getCategorySuggestions(value))
                }
                onSuggestionsClearRequested={() => setCategorySuggestions([])}
                getSuggestionValue={s => s}
                renderSuggestion={s => <div>{s}</div>}
                inputProps={{
                  placeholder: "Type category...",
                  value: formData.category,
                  onChange: (_e, { newValue }) =>
                    setFormData({ ...formData, category: newValue })
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
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) })}
              />
              <div style={{ textAlign: "right" }}>{formData.score}/5</div>
              <div style={{ textAlign: "right" }}>{formData.score}/5</div>

              <button type="submit" className="rate-submit">
                Submit Review
              </button>
            </form>
          </div>

          {/* Panel 3 */}
          <div className="panel all-reviews">
            <h2>All Reviews</h2>
            <input
              className="rate-input"
              type="text"
              placeholder="Filter by category (optional)"
              value={reviewCategory}
              onChange={(e) => setReviewCategory(e.target.value)}
            />
            <div className="review-feed">
              {reviewFeed.length > 0 ? (
                reviewFeed.map((r, i) => (
                  <div key={i} className="review-card">
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

          {/* Panel 4 */}
          <div className="panel search-reviews">
            <h2>Search User Reviews</h2>
            <Autosuggest
              suggestions={userSuggestions}
              onSuggestionsFetchRequested={({ value }) =>
                setUserSuggestions(getUserSuggestions(value))
              }
              onSuggestionsClearRequested={() => setUserSuggestions([])}
              getSuggestionValue={s => s}
              renderSuggestion={s => <div>{s}</div>}
              inputProps={{
                placeholder: "Search username...",
                value: searchUsername,
                onChange: (_e, { newValue }) => setSearchUsername(newValue)
              }}
            />
            <button onClick={fetchSearchUserReviews} className="rate-submit">
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
      </div>
    </>
  );
};

export default UserAccount;
