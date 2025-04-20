import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import axios from 'axios';
import ServiceCard from './components/blocks/ServiceCard';
import { Service } from './types';
import { group } from 'console';
// import { group } from 'console';

type GroupMapping = {
    id: string;
    name: string;
  };

  
const Groups: React.FC = () => {
    const [groups, setGroups] = useState<string[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<string>("");
    const [posts, setPosts] = useState<Service[]>([]);
    const [groupMap, setGroupMap] = useState<GroupMapping[]>([]);

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
            setSelectedGroup(groupNames[0] || "");
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
        console.log(groupMap)
        console.log(selectedGroupObj)
        // console.log(selectedGroupObj.id) //2c94fb2a-1eda-414f-9f8f-7aa18e517e7c
        const groupName = post.groupid
        console.log(groupMap)
        console.log(groupName) //2c94fb2a-1eda-414f-9f8f-7aa18e517e7c
        console.log(selectedGroup) //Umass Assenters
        console.log(String(groupName) === String(selectedGroup))
        const selectedGroupObj2 = groupMap.find(
            (group) => group.name.toLowerCase() === selectedGroup.toLowerCase()
        );
        console.log(selectedGroupObj2)
        console.log(selectedGroupObj2?.id)
        return String(groupName) === String(selectedGroup)
        // return groupName === selectedGroup
    });
    console.log("Filtered posts:", filteredPosts);

    return (
        <>
        <Navbar />
        <div style={{ padding: '2rem' }}>
            <h1>Groups Page</h1>
            <label htmlFor="groupSelect">Select a group:</label>
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
