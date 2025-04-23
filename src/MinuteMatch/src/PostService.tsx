import React, {useState, useEffect, useRef} from "react";
import axios from "axios";
import "./PostRequestService.css";

const PostService: React.FC = () => {
  // Form state
  const [typeDropdown, setTypeDropdown] = useState("");
  const [typeCategory, setTypeCategory] = useState("");
  const [typeGroup, setTypeGroup] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [picture, setPicture] = useState<File | null>(null);
  const [newCategory, setNewCategory] = useState("");

  // Dropdown data
  const [groups, setGroups] = useState<string[]>([]); // will not be implementing multiple groups in the set up
  const [categories, setCategories] = useState<string[]>([]);


  const tempNewCatgory=useRef("");
  // Debug logs
  useEffect(() => {
    console.log(`Type Dropdown has changed to: ${typeDropdown}`);
  }, [typeDropdown]);

  useEffect(() => {
    console.log(`Category Dropdown has changed to: ${typeCategory}`);
  }, [typeCategory]);

  useEffect(() => {
    console.log(`Service Description has changed to: ${serviceDescription}`);
  }, [serviceDescription]);

  useEffect(() => {
    if (picture) {
      console.log(`Picture has been selected: ${picture.name}`);
    } else {
      console.log("No picture was uploaded into this instance of the post");
    }
  }, [picture]);

  // Fetch available groups
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

  // Fetch available categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/categories");
        console.log("Successfully fetched categories");
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(()=>{
    //TODO: Send post to new category route
    const makeCategory = async () => {
      try {
        await axios.post("http://localhost:3000/categories",{categoryName:newCategory});
        console.log("Successfully added category");
        setCategories([...categories, newCategory]);
      }
      catch(error){
        console.error("Error adding category:", error);
      }
    };
    makeCategory()
  },[newCategory])

  // File input handler
  const FileImplementation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      const allowedFormats = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
      if (!allowedFormats.includes(file.type)) {
        window.alert("Invalid file format. Please upload a .jpg, .png, .pdf, or .gif file.");
        return;
      }
      setPicture(file);
    }
  };

  // Form submission
  const submissionCheck = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!typeDropdown) {
      return window.alert("You need to select the type of post this is.");
    }
    if (!typeCategory) {
      return window.alert("You need to select at least one category.");
    }
    if (!serviceDescription || serviceDescription.trim().length < 10) {
      return window.alert("Description must be at least 10 characters long.");
    }

    // Create FormData object
    const formData = new FormData();
    formData.append("service", typeDropdown === "postService" ? "true" : "false");
    formData.append("category", JSON.stringify(typeCategory));
    formData.append("description", serviceDescription);
    
    if (typeGroup) {
        formData.append("group", typeGroup);
    }

    if (picture) {
      formData.append("picture", picture);
    }

    try {
      const response = await axios.post("http://localhost:3000/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Post submitted successfully:", response.data);
      window.alert("Post submitted successfully!");
    } catch (error: any) {
      console.error("Error submitting the post:", error);
      if (error.response && error.response.data) {
        window.alert(`Error submitting the post: ${error.response.data.error || "Please try again."}`);
      } else {
        window.alert("Error submitting the post. Please try again.");
      }
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
          <label id={"newCatLabel"}>OPTIONAL: Create new Category</label>
          <input type={"text"} onChange={(e)=>{tempNewCatgory.current=e.target.value}}></input>
          <button type="button" className={"smallButton"} onClick={()=>setNewCategory(tempNewCatgory.current)}>Create</button>
          <label>Select a Category</label>
          <select value={typeCategory} onChange={(e) => setTypeCategory(e.target.value)}>
            <option value="" disabled>Select a category</option>
            {categories.length > 0 ? (
              categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))
            ) : (
              <option value="">No categories available</option>
            )}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="group">Select a Group</label>
          <select name="group" value={typeGroup} onChange={(e) => setTypeGroup(e.target.value)}>
            <option value="" disabled>Select a group</option>
            {groups.length > 0 ? (
              groups.map((group, index) => (
                <option key={index} value={group}>
                  {group}
                </option>
              ))
            ) : (
              <option value="">No groups available</option>
            )}
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