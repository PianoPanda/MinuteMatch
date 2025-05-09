import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import axios from 'axios';
import ServiceCard from './components/blocks/ServiceCard';
import { Service } from './types';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(''); // Empty by default
  const [posts, setPosts] = useState<Service[]>([]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:3000/categories');
        console.log('Fetched categories:', res.data);
        setCategories(res.data);
        setSelectedCategory('');
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
      <div style={{ padding: '2rem', boxSizing: 'border-box' }}>
        <h1 style={{ textAlign: 'center' }}>Categories Page</h1>
        <label htmlFor="categorySelect" style={{ display: 'block', textAlign: 'center', marginTop: '1rem' }}>
          Select a category:
        </label>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
          <select
            id="categorySelect"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            defaultValue=""
            style={{ padding: '0.5rem', borderRadius: '8px', minWidth: '200px' }}
          >
            <option value="" disabled>Select a category</option>
            {categories.map((category, idx) => (
              <option key={idx} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {selectedCategory && (
          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            You selected: <strong>{selectedCategory}</strong>
          </p>
        )}

        <h2 style={{ marginTop: '2rem', textAlign: 'center' }}>Posts in this category</h2>

        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {posts.length > 0 ? (
              posts.map((post, idx) => {
                const modifiedPost = {
                  ...post,
                  description: post.text || 'No description',
                };

                return (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'center', width: '200%', transform: 'translateX(-50%)', position: 'relative', left: '50%',}}>
                    <div style={{ width: '200%', maxWidth: '1000px' }}>
                      <ServiceCard service={modifiedPost} />
                    </div>
                  </div>
                );
              })
            ) : (
              selectedCategory && <p style={{ textAlign: 'center' }}>No posts available for this category.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Categories;
