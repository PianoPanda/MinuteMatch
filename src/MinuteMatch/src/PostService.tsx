// export default PostService
import React, { useState, useEffect } from "react"; // use later in the implementation of the code we want
import axios from 'axios';
import "./PostRequestService.css";

const PostService: React.FC = () => {
        // code for updating the instances throught the use effect set up
        const[typeDropdown, setTypeDropdown] = useState('');
        const[typeCategory, setTypeCategory] = useState('');
        const[typeGroup, setTypeGroup] = useState('');
        const[serviceDescription, setServiceDescription] =useState('')
        const[picture, setPicture] = useState<File | null>(null);


        const[groups, setGroups] = useState([]);
        const[categories, setCategories] = useState([])
        // implemented for the minor debugging purposes we will be implementing
        useEffect(() => {
            console.log(`Type Dropdown has changed to: ${typeDropdown}`);    
        },[typeDropdown]);

        useEffect(() => {
            console.log(`Category Dropdown has changed to: ${typeCategory}`);
        }, [typeCategory]);
        // implement the fetch categories for all of the category names here (mostly generic inserts in here for the time being)


        // Fetch Groups
        useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await axios.get('http://localhost:3000/group');
                setGroups(response.data.map((g: { groupname: string }) => g.groupname));
            } catch (error) {
                console.error('Error fetching groups:', error);
            }
            };
            fetchGroups();
        }, []);

    // Fetch Categories
       
    useEffect(() => {
        const fetchCategories = async () => {
          try {
            const { data } = await axios.get('http://localhost:3000/categories'); // issue is we cannot reach the data base to send out the information and everthing we are implementing
            console.log("Do we get to this portion and implementation in our code")
            const names = data.map((cat: { name: string }) => cat.name);
            setCategories(names);
          } catch (error) {
            console.error('Error fetching categories:', error);
          }
        };
      
        fetchCategories();
      }, []);


        // implement the fetch gourps for all of the data in there for all group nams (moslt generic inserts for now)
        useEffect(() => {
            console.log(`service Description has changed to: ${serviceDescription}`);
        }, [serviceDescription]);

        useEffect(() => {
            if (picture) {
                console.log(`Picture has been selected: ${picture.name}`);
            } else {
                console.log('No picture was uploaded into this instance of the post')
            }
          }, [picture]);
        // for updating and checking the file we are implementing into the data base
          const FileImplementation = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files ? e.target.files[0] : null;
            setPicture(file);
          };


         
          // check our existing implementation of our code and see if all data fields are input correctly
          //We also want to implement a set up to verify there are no malicious inputs in our set up
          const submissionCheck = async (e: React.FormEvent) => {
            e.preventDefault();

            if (!typeDropdown) {
                window.alert("You need to select the type of post this is.");
                return;
            }
            if (!typeCategory) {
                window.alert("You need to select a category.");
                return;
            }
            if (!serviceDescription) {
                window.alert("You need to fill out the description.");
                return;
            }

            const formData = new FormData();
            formData.append('service', typeDropdown === "postService" ? 'true' : 'false');
            formData.append('category', typeCategory);
            formData.append('description', serviceDescription);
            if (picture) {
                formData.append('picture', picture);
            }

            try {
                const response = await axios.post('http://localhost:3000/posts', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                console.log('Post submitted successfully:', response.data);
                window.alert('Post submitted successfully!');
            } catch (error) {
                console.error('Error submitting the post:', error);
                window.alert('Error submitting the post. Please try again.');
            }
          };

  
    return (
        <div className="form-container">
            <h1 className="form-title">Post a Service</h1>
            <form>
                <div className="form-group">
                    <label htmlFor="type">Select a Type</label>
                    <select name="type" value = {typeDropdown} onChange={(e) => setTypeDropdown(e.target.value)}>
                        <option value="" disabled>Select a type</option>
                        <option value="postService">Post a Service</option>
                        <option value="requestHelp">Request Help</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Select a Category</label>
                    <select value={typeCategory} onChange={(e) => setTypeCategory(e.target.value)}>
                        <option value="" disabled>Select a category</option>
                        {categories.length > 0 ? (
                            categories.map((category, index) => (
                                <option key={index} value={category}>{category}</option>
                            ))
                        ) : (
                            <option value="">No categories available</option>
                        )}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="group">Select a Group</label>
                    <select name="group" value = {typeGroup} onChange = {(e) => setTypeGroup(e.target.value)}>
                        <option value="" disabled>Select a group</option>
                        {/*We need to input the reference to the data base which has all of the category values we are implementing*/}
                        {groups.length > 0 ? (groups.map((group, index) => ( <option key={index} value={group}>{group}</option>))) : (<option value="">No groups available</option>)}
                    </select>
                </div>
                

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea name="description" value={serviceDescription} onChange={(e) => setServiceDescription(e.target.value)} placeholder="Description"></textarea>
                </div>

                {/*here we want to implement the two input functions tot see if we can add our data into the data base of our functions*/}

                <div className="form-group">
                    <label htmlFor="picture">Upload a Picture</label>
                    <input type="file" name="picture" onChange = {FileImplementation} />
                </div>

                <div className="form-group">
                    <button type="submit" onClick = {submissionCheck}>SUBMIT</button>
                </div>
            </form>
        </div>
    );
    
};

export default PostService;