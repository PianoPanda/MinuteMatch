

import React, { useEffect, useRef, useState } from 'react';
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
  const [selectedGroup, setSelectedGroup] = useState<string>(''); // initially empty
  const [posts, setPosts] = useState<Service[]>([]);
  const [groupMap, setGroupMap] = useState<GroupMapping[]>([]);
  const [newGroup, setNewGroup] = useState(null);
  const newGroupName = useRef('');
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState<any[]>([]);
  const [newGroupCategories, setNewGroupCategories] = useState([]);
  const [newGroupUsers, setNewGroupUsers] = useState([]);

  useEffect(() => {
    const debugFetchGroupTable = async () => {
      try {
        const res = await axios.get('http://localhost:3000/group');
        console.log('Full group table response from Supabase:', res.data);
      } catch (err) {
        console.error('Error fetching group table:', err);
      }
    };
    debugFetchGroupTable();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get('http://localhost:3000/categories');
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3000/all_users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get('http://localhost:3000/group');
        const groupNames = res.data.map((group: any) => group.groupname);
        const mappings = res.data.map((group: any) => ({
          id: group.groupid,
          name: group.groupname,
        }));
        setGroupMap(mappings);
        setGroups(groupNames);
      } catch (err) {
        console.error('Error fetching groups:', err);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    if (!selectedGroup) return;
    const fetchPostsForGroup = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/posts?groupId=${selectedGroup}`);
        setPosts(res.data);
      } catch (err) {
        console.error('Error fetching posts for group:', err);
      }
    };
    fetchPostsForGroup();
  }, [selectedGroup]);

  const filteredPosts = posts.filter((post) => {
    const filteredGroupMap = groupMap.find(
      (group) => group.name.toLowerCase() === String(post.groupId).toLowerCase()
    );
    return String(filteredGroupMap?.id) === String(selectedGroup);
  });

  const makeGroup = async () => {
    try {
      await axios.post('http://localhost:3000/group', {
        name: newGroupName.current,
        members: newGroupUsers,
        categories: newGroupCategories,
      });
      setGroups(newGroup ? [...groups, newGroup] : groups);
    } catch (error) {
      console.error('Error adding group:', error);
    }
  };

  function selectUser(user) {
    setNewGroupUsers([...newGroupUsers, user]);
  }

  function selectCategory(cat) {
    setNewGroupCategories([...newGroupCategories, cat]);
  }

  return (
    <>
      <Navbar />
      <div style={{ padding: '2rem' }}>
        <h1>Groups Page</h1>
        <h2>Create Group</h2>
        <form>
          <label>Group Name</label>
          <input
            type="text"
            onChange={(e) => {
              newGroupName.current = e.target.value;
            }}
          />

          <label>Select Categories: </label>
          {newGroupCategories.join(', ')}
          <select onChange={(e) => selectCategory(e.target.value)} defaultValue="">
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>

          <label>Add Members: </label>
          {newGroupUsers.join(', ')}
          <select onChange={(e) => selectUser(e.target.value)} defaultValue="">
            <option value="" disabled>
              Select a user
            </option>
            {users.map((user, index) => (
              <option key={index} value={user.username}>
                {user.username}
              </option>
            ))}
          </select>

          <button type="submit" onClick={makeGroup}>
            Create Group
          </button>
        </form>

        <h2>
          <label htmlFor="groupSelect">Select a group:</label>
        </h2>
        <select
          id="groupSelect"
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>
            Select a group
          </option>
          {groupMap.map((group, idx) => (
            <option key={idx} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>

        {selectedGroup && (
          <p style={{ marginTop: '1rem' }}>
            You selected:{' '}
            <strong>{groupMap.find((g) => g.id === selectedGroup)?.name || 'Unknown Group'}</strong>
          </p>
        )}

        <h2 style={{ marginTop: '2rem' }}>Posts in this group</h2>

        <div style={{ width: '100%', maxWidth: '2000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post, idx) => {
                const modifiedPost = {
                  ...post,
                  description: post.text || 'No description',
                };
                return (
                  <div
                    key={idx}
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        width: '200%',
                        position: 'relative',
                        left: '50%',
                        transform: 'translateX(-50%)',
                    }}
                  >
                    <div style={{ width: '100%', maxWidth: '1000px' }}>
                      <ServiceCard service={modifiedPost} />
                    </div>
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