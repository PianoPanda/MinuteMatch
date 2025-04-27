import React, {useEffect, useRef, useState} from 'react';
import Navbar from './components/Navbar';
import axios from 'axios';
import ServiceCard from './components/blocks/ServiceCard';
import { Service } from './types';

type GroupMapping = {
    id: string;
    name: string;
  };

  
const Groups: React.FC = () => {
    const [groups, setGroups] = useState<string[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<string>("");
    const [posts, setPosts] = useState<Service[]>([]);
    const [groupMap, setGroupMap] = useState<GroupMapping[]>([]);
    const [newGroup, setNewGroup] = useState(null);
    const newGroupName = useRef("");
    const [categories,setCategories] = useState([]);
    const [users, setUsers] = useState<any[]>([]);
    const [newGroupCategories,setNewGroupCategories] = useState([]);
    const [newGroupUsers,setNewGroupUsers] = useState([]);

    useEffect(() => {
        const debugFetchGroupTable = async () => {
          try {
            const res = await axios.get('http://localhost:3000/group');
            console.log("Full group table response from Supabase:", res.data);
          } catch (err) {
            console.error("Error fetching group table:", err);
          }
        };
    
        debugFetchGroupTable();
    }, []);

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

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get("http://localhost:3000/all_users");
                setUsers(response.data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers();
    }, []);

    // Fetch group mapping and names
    useEffect(() => {
        const fetchGroups = async () => {
        try {
            const res = await axios.get('http://localhost:3000/group');
            console.log("Fetched groups:", res.data);
            const groupNames = res.data.map((group: any) => group.groupname);
            const mappings = res.data.map((group: any) => ({
                id: group.groupid,
                name: group.groupname,
            }));
            setGroupMap(mappings);
              

            setGroups(groupNames);
            setSelectedGroup(mappings[0]?.id || "");
        } catch (err) {
            console.error("Error fetching groups:", err);
        }
        };

        fetchGroups();
    }, []);

    // // Fetch posts
    // useEffect(() => {
    //     const fetchPosts = async () => {
    //     try {
    //         const res = await axios.get('http://localhost:3000/posts');
    //         setPosts(res.data);
    //     } catch (err) {
    //         console.error("Error fetching posts:", err);
    //     }
    //     };

    //     fetchPosts();
    // }, []);
    useEffect(() => {
        if (!selectedGroup) return;
    
        const fetchPostsForGroup = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/posts?groupId=${selectedGroup}`);
                console.log(res)
                setPosts(res.data);
            } catch (err) {
                console.error("Error fetching posts for group:", err);
            }
        };
    
        fetchPostsForGroup();
    }, [selectedGroup]);
    

    // Filter posts based on selected group using groupMap
    const filteredPosts = posts.filter((post) => {
        // console.log("groupMap keys:", Object.keys(groupMap));
        const selectedGroupObj = groupMap.find(
            (group) => group.name.toLowerCase() === selectedGroup.toLowerCase()
        );
        // console.log(groupMap)
        // console.log(selectedGroupObj)
        // console.log(selectedGroupObj.id) //2c94fb2a-1eda-414f-9f8f-7aa18e517e7c
        // console.log(post)
        const groupName = post.groupId
        // console.log(groupMap)
        // console.log(groupName) //Umass Assenters
        // console.log(selectedGroup) //2c94fb2a-1eda-414f-9f8f-7aa18e517e7c
        // console.log(String(groupName) === String(selectedGroup)) //will always be false
        const filteredGroupMap = groupMap.find(
            (group) => group.name.toLowerCase() === String(groupName).toLowerCase()
        );
        // console.log(selectedGroupObj2)
        // console.log(selectedGroupObj2?.id)
        return String(filteredGroupMap?.id) === String(selectedGroup)
    });
    console.log("Filtered posts:", filteredPosts);


    const makeGroup = async () => {
        try {

            await axios.post("http://localhost:3000/group",{name:newGroupName.current,members:newGroupUsers,categories:newGroupCategories});
            console.log("Successfully added group");
            setGroups(newGroup?[...groups, newGroup]:groups);
        }
        catch(error){
            console.error("Error adding group:", error);
        }
    };

    console.log(users)

    function selectUser(user){
        setNewGroupUsers([...newGroupUsers,user]);
    }
    function selectCategory(cat){
        console.log("WE CLICKED IT")
        setNewGroupCategories([...newGroupCategories,cat]);
    }


    return (
        <>
        <Navbar />
        <div style={{ padding: '2rem' }}>
            <h1>Groups Page</h1>
            <h2>Create Group</h2>
            <form>
                <label>Group Name</label>
                <input type={"text"} onChange={(e)=> {
                    newGroupName.current = e.target.value
                }}></input>
                <label>Select Categories: </label>{newGroupCategories.join(", ")}
                <select onChange={(e)=>selectCategory(e.target.value)}>
                    {categories.map((category,index) => (
                        <option key={index} value={category} onClick={()=>selectCategory(category)}>{category}</option>
                    ))}
                </select>
                <label>Add Members: </label>{newGroupUsers.join(", ")}
                <select onChange={(e)=>selectUser(e.target.value)}>
                    {users.map((user,index) => (
                        <option key={index} value={user.username} onClick={()=>selectUser(user.username)}>{user.username}</option>
                    ))}
                </select>
                <button type={"submit"} onClick={makeGroup}>Create Group</button>
            </form>
            <h2><label htmlFor="groupSelect">Select a group:</label></h2>
            <select
            id="groupSelect"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            >
            {groupMap.map((group, idx) => (
                <option key={idx} value={group.id}>
                {group.name}
                </option>
            ))}
            </select>

            {selectedGroup && (
            <p style={{ marginTop: '1rem' }}>
                You selected: <strong>{groupMap.find(g => g.id === selectedGroup)?.name || "Unknown Group"}</strong>
            </p>
            )}

            <h2 style={{ marginTop: '2rem' }}>Posts in this group</h2>
            
            <div style={{ width: '100%', maxWidth: '2000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {filteredPosts.length > 0 ? (
                    // filteredPosts.map((post, idx) => (
                    // <div key={idx} style={{ width: '100%' }}>
                    //     <ServiceCard service={post} />
                    //     <p style={{ marginTop: '0.5rem' }}>{post.text}</p>
                    // </div>
                    // ))
                    filteredPosts.map((post, idx) => {
                        const modifiedPost = {
                          ...post,
                          description: post.text || "No description",
                        };
                      
                        return (
                          <div key={idx} style={{ width: '100%' }}>
                            <ServiceCard service={modifiedPost} />
                          </div>
                        );
                    })
                ) : (
                    <p>No posts available for this group.</p>
                )}
                </div>
            </div>
        </div>
        </>
    );
};

export default Groups;
