import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./PostRequestService.css";

const PostService: React.FC = () => {
  const [typeDropdown, setTypeDropdown] = useState("");
  const [typeCategory, setTypeCategory] = useState("");
  const [typeGroup, setTypeGroup] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [picture, setPicture] = useState<File | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [groups, setGroups] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [username, setUsername] = useState<string | null>(null); // <-- added this
  const tempNewCategory = useRef("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) {
      alert("You must be logged in to post a service.");
    }
    setUsername(storedUsername);
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get("http://localhost:3000/group");
        setGroups(response.data.map((g: { groupname: string }) => g.groupname));
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/categories");
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (newCategory) {
      const makeCategory = async () => {
        try {
          await axios.post("http://localhost:3000/categories", { categoryName: newCategory });
          setCategories([...categories, newCategory]);
        } catch (error) {
          console.error("Error adding category:", error);
        }
      };
      makeCategory();
    }
  }, [newCategory]);

  const FileImplementation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      const allowedFormats = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
      if (!allowedFormats.includes(file.type)) {
        alert("Invalid file format. Please upload a .jpg, .png, .pdf, or .gif file.");
        return;
      }
      setPicture(file);
    }
  };

  const submissionCheck = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!typeDropdown || !typeCategory || serviceDescription.trim().length < 10) {
      alert("Please fill out all required fields correctly.");
      return;
    }

    if (!username) {
      alert("User not found in local storage. Please login again.");
      return;
    }

    const formData = new FormData();
    formData.append("service", typeDropdown === "postService" ? "true" : "false");
    formData.append("category", JSON.stringify(typeCategory));
    formData.append("description", serviceDescription);
    formData.append("username", username); // <-- using cleanly loaded username

    if (typeGroup) {
      formData.append("group", typeGroup);
    }

    if (picture) {
      formData.append("picture", picture);
    }

    try {
      const response = await axios.post("http://localhost:3000/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Post submitted successfully:", response.data);
      alert("Post submitted successfully!");
    } catch (error: any) {
      console.error("Error submitting the post:", error);
      alert(`Error: ${error.response?.data?.error || "Failed to submit post."}`);
    }
  };

  return (
    <div className="form-container">
      <h1 className="form-title">Post a Service</h1>
      <form onSubmit={submissionCheck}>
        <div className="form-group">
          <label htmlFor="type">Select a Type</label>
          <select name="type" value={typeDropdown} onChange={(e) => setTypeDropdown(e.target.value)}>
            <option value="" disabled>Select a type</option>
            <option value="postService">Post a Service</option>
            <option value="requestHelp">Request Help</option>
          </select>
        </div>

        <div className="form-group">
          <label id="newCatLabel">OPTIONAL: Create new Category</label>
          <input type="text" onChange={(e) => (tempNewCategory.current = e.target.value)} />
          <button type="button" className="smallButton" onClick={() => setNewCategory(tempNewCategory.current)}>Create</button>
          <label>Select a Category</label>
          <select value={typeCategory} onChange={(e) => setTypeCategory(e.target.value)}>
            <option value="" disabled>Select a category</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="group">Select a Group</label>
          <select name="group" value={typeGroup} onChange={(e) => setTypeGroup(e.target.value)}>
            <option value="" disabled>Select a group</option>
            {groups.map((group, index) => (
              <option key={index} value={group}>{group}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            name="description"
            value={serviceDescription}
            onChange={(e) => setServiceDescription(e.target.value)}
            placeholder="Enter a description"
          />
        </div>

        <div className="form-group">
          <label htmlFor="picture">Upload a Picture</label>
          <input type="file" name="picture" onChange={FileImplementation} />
        </div>

        <div className="form-group">
          <button type="submit">SUBMIT</button>
        </div>
      </form>
    </div>
  );
};

export default PostService;