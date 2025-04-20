// Categories.tsx
import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import axios from 'axios';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:3000/categories');
        setCategories(res.data);
        setSelectedCategory(res.data[0] || ""); // default to first category
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

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
      </div>
    </>
  );
};

export default Categories;
