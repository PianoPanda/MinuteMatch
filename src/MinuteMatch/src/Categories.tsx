import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import axios from 'axios';
import ServiceCard from './components/blocks/ServiceCard';
import { Service } from './types';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [posts, setPosts] = useState<Service[]>([]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:3000/categories');
        console.log('Fetched categories:', res.data);
        setCategories(res.data);
        setSelectedCategory(res.data[0] || '');
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // Fetch posts for selected category
  useEffect(() => {
    if (!selectedCategory) return;

    const fetchPostsForCategory = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/posts`);
        const filtered = res.data.filter((post: Service) =>
          post.category.includes(selectedCategory)
        );
        setPosts(filtered);
      } catch (err) {
        console.error('Error fetching posts for category:', err);
      }
    };

    fetchPostsForCategory();
  }, [selectedCategory]);

  return (
    <>
      <Navbar />
      <div style={{ padding: '2rem' }}>
        <h1>Categories Page</h1>
        <label htmlFor="categorySelect">Select a category:</label>
        <select
          id="categorySelect"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((category, idx) => (
            <option key={idx} value={category}>{category}</option>
          ))}
        </select>

        {selectedCategory && (
          <p style={{ marginTop: '1rem' }}>
            You selected: <strong>{selectedCategory}</strong>
          </p>
        )}

        <h2 style={{ marginTop: '2rem' }}>Posts in this category</h2>

        <div style={{ width: '100%', maxWidth: '2000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {posts.length > 0 ? (
              posts.map((post, idx) => {
                const modifiedPost = {
                  ...post,
                  description: post.text || 'No description',
                };

                return (
                  <div key={idx} style={{ width: '100%' }}>
                    <ServiceCard service={modifiedPost} />
                  </div>
                );
              })
            ) : (
              <p>No posts available for this category.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Categories;
