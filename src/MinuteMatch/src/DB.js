import express from 'express';
import pkg from 'pg';
import cors from 'cors';
import {orm_service} from "./ORM.js";


const { Pool } = pkg;

// Initialize Express
const app = express();
app.use(express.json());
app.use(cors()); // Allow cross-origin requests


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
        console.log("Do we even reach the back end to get to the fetch function!!!!!!")
        const result = await pool.query('SELECT "name" from "categories" ');
        res.json(result.rows); // [{ name: "Tech", client_name: "Client A" }, ...]
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
      }
});

// **Add a Group**
app.post('/group', async (req, res) => {
    const { groupName } = req.body;
    if (!groupName) {
        return res.status(400).json({ message: 'Group name is required' });
    }

    let client;
    try {
        client = await pool.connect();
        const checkDuplicates = await client.query('SELECT * FROM group WHERE groupname = $1', [groupName]);
        if (checkDuplicates.rows.length > 0) {
            return res.status(400).json({ message: `Group ${groupName} already exists` });
        }

        await client.query('INSERT INTO group (groupname) VALUES ($1)', [groupName]);
        res.status(201).json({ message: `Group ${groupName} added successfully` });
    } catch (err) {
        console.error('Error adding group:', err);
        res.status(500).json({ message: 'Error adding group' });
    } finally {
        if (client) client.release();
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

// ** ADD to the Posts
//todo: this will require update and fixes for the post set up and everything we are imlpementing
app.post('/posts', async (req, res) => {
    try {
        // Extract the data from the request body
        const { service, category, description, picture } = req.body;

        // Query to insert the post data into the database
        const query = 'INSERT INTO "posts"(type, category, description, picture) VALUES($1, $2, $3, $4) RETURNING *';
        const values = [service, category, description, picture];

        // Execute the query
        const result = await pool.query(query, values);

        // Send back the inserted post
        res.status(201).json(result.rows[0]);  // Return the inserted post data
    } catch (error) {
        console.error('Error inserting post:', error);
        res.status(500).json({ error: 'Failed to add post' });
    }
});


// ** Get Data from POSTs
//todo: these will require some updates and fixes
app.get('/api/posts', async (req, res) => {
    try {
        // Query to select all posts from the database
        const query = 'SELECT * FROM posts';
        
        // Execute the query
        const result = await pool.query(query); // Use pool.query instead of client.query

        function orm_service(service){
            service.user = get_user_by_id(service.userid);
            service.group = get_group_by_id(service.groupid);
            service.categories = service.category.map(get_category_by_id);
            service.helpers = service.helperlist.map(get_user_by_id);
        }


        // Return the posts data to the client
        res.status(200).json(result.rows.map(orm_service));  // Send all posts as a JSON response
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

const PORT = process.env.PORT || 3000;
console.log(`${PORT} Print out the port number to see if this is even working`)
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});