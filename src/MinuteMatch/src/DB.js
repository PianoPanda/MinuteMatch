import express from 'express';
import pkg from 'pg';
import cors from 'cors';
import {orm_service} from "./ORM.js";
import multer from 'multer';  // for the file uploads

const { Pool } = pkg;

// Initialize Express
const app = express();
app.use(express.json());
app.use(cors()); // Allow cross-origin requests
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
// for the image set up and implementation


// for handling the file uploads
const upload = multer({
    storage: multer.memoryStorage(), // <-- This is the fix: use memory storage for handling binary data
    limits: { fileSize: 10 * 1024 * 1024 }, // Max file size: 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files and PDFs are allowed'), false);
        }
    },
});


// PostgreSQL Connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres', // Ensure this is the correct database name
    password: 'Bacon85!',
    port: 5432,
});

// Check Database Connection
pool.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch((err) => console.error('PostgreSQL connection error:', err));

async function get_user_by_id(id) {
    let client;
    try{
        client = await pool.connect();
        const result = await client.query("SELECT * FROM users WHERE id = $1", [id]);
        return result.rows[0];
    }
    catch(err){
        console.error('Error fetching user:', err);
        return null;
    }
}
// **Fetch Groups**
app.get('/group', async (req, res) => {
    let client;
    try {
        client = await pool.connect();
        const result = await client.query('SELECT "groupname" FROM "group"'); // Ensure table name is correct
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching groups:', err);
        res.status(500).json({ message: 'Error fetching group' });
    } finally {
        if (client) client.release();
    }
});

// **Fetch Categories**
app.get('/categories', async (req, res) => {
    try {
        console.log("Do we even reach the back end to get to the fetch function!!!!!!");
        const result = await pool.query('SELECT "name" from "categories"');

        const categories = result.rows.map(row => row.name);

        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// **Add a Group**
app.get('/api/posts', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Posts');
        // Map each post, converting Picture (BYTEA) to a Base64 string if present
        const posts = result.rows.map(post => ({
            id: post.PostID,
            ServiceType: post.ServiceType,
            picture: post.Picture
              ? `data:application/octet-stream;base64,${post.Picture.toString('base64')}`
              : null,
            user: {
                id: post.UserID,
                name: "Unknown User" // Adjust if you join with a users table
            },
            group: post.groupID ? `Group ${post.groupID}` : null,
            category: post.category || [],
            description: post.Text || "No description available",
            postComments: post.PostComments || [],
            timestamp: post.TimeStamp,
        }));
        res.json(posts);
    } catch (error) {
        console.error('Error retrieving posts:', error);
        res.status(500).json({ error: 'Failed to retrieve posts' });
    }
});


// **Add a Category**
app.post('/categories', async (req, res) => {
    const { categoryName } = req.body;
    if (!categoryName) {
        return res.status(400).json({ message: 'Category name is required' });
    }

    let client;
    try {
        client = await pool.connect();
        const checkDuplicates = await client.query('SELECT * FROM categories WHERE name = $1', [categoryName]);
        if (checkDuplicates.rows.length > 0) {
            return res.status(400).json({ message: `Category ${categoryName} already exists` });
        }

        await client.query('INSERT INTO categories (name) VALUES ($1)', [categoryName]);
        res.status(201).json({ message: `Category ${categoryName} added successfully` });
    } catch (err) {
        console.error('Error adding category:', err);
        res.status(500).json({ message: 'Error adding category' });
    } finally {
        if (client) client.release();
    }
});

// **Add a Post**
app.post('/posts', upload.single('picture'), async (req, res) => {
    try {
        const { service, category, description } = req.body;
        const picture = req.file ? req.file.buffer : null; // <-- This is the fix: use the buffer instead of path

        if (!service) {
            return res.status(400).json({ error: 'Service type is required' });
        }
        if (!category) {
            return res.status(400).json({ error: 'Category is required' });
        }
        if (!description || description.trim().length < 2) {
            return res.status(400).json({ error: 'Description must be at least 10 characters long' });
        }

        const categoryArray = Array.isArray(category) ? category : [category];

        const query = 'INSERT INTO "posts"("servicetype", "category", "text", "picture") VALUES($1, $2, $3, $4) RETURNING *';
        const values = [service, categoryArray, description, picture]; // <-- Sending the picture as binary data

        const result = await pool.query(query, values);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error inserting post:', error);

        if (error instanceof multer.MulterError) {
            return res.status(400).json({ error: error.message });
        }

        res.status(500).json({ error: 'Failed to add post' });
    }
});

// **Get Posts**
// app.get('/api/posts', async (req, res) => {
//     try {
//         const query = 'SELECT * FROM posts';
//         const result = await pool.query(query);
//         res.status(200).json(result.rows);
//     } catch (error) {
//         console.error('Error fetching posts:', error);
//         res.status(500).json({ error: 'Failed to fetch posts' });
//     }
// });

app.get('/posts', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM posts');

        // Convert the bytea (binary data) to base64 so frontend can use it
        const posts = result.rows.map(post => ({
            ...post,
            picture: post.picture
                ? `data:application/octet-stream;base64,${post.picture.toString('base64')}`
                : null
        }));

        res.status(200).json(posts);
    } catch (error) {
        console.error('Error retrieving posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

const PORT = process.env.PORT || 3000;
console.log(`${PORT} Print out the port number to see if this is even working`);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});