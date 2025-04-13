import express from 'express';
import cors from 'cors';
import multer from 'multer';  // for the file uploads



import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://swzbqpnkyetlzdovujon.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

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


// **Fetch Groups**
app.get('/group', async (req, res) => {

    let { data: group, error } = await supabase
        .from('group')
        .select('groupname');//list of objects with groupname attr
    if (error){
        console.error('Error fetching groups:', error);
        res.status(500).json({ message: 'Error fetching group' });
        return;
    }
    res.json(group);
});

// **Fetch Categories**
app.get('/categories', async (req, res) => {
        console.log("Do we even reach the back end to get to the fetch function!!!!!!");
        let {data:catNames,error} = await supabase
            .from("categories")
            .select("name")
        if(error){
            console.error(error);
            res.status(500).json({ error: 'Database error' });
        }
        const categories = catNames.map(row => row.name);
        res.json(categories);
});

// **Add a Group**
app.get('/api/posts', async (req, res) => {
        let {data:result,error} = await supabase
            .from('posts')
            .select("*");
        if (error){
            console.error('Error retrieving posts:', error);
            res.status(500).json({ error: 'Failed to retrieve posts' });
        }
        // Map each post, converting Picture (BYTEA) to a Base64 string if present
        const posts = result.map(post => ({
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

    //     client = await pool.connect();
    //     const checkDuplicates = await client.query('SELECT * FROM "group" WHERE groupname = $1', [groupName]);
    //     if (checkDuplicates.rows.length > 0) {
    //         return res.status(400).json({ message: `Group ${groupName} already exists` });
    //     }

    //     await client.query('INSERT INTO "group" (groupname) VALUES ($1)', [groupName]);
    //     res.status(201).json({ message: `Group ${groupName} added successfully` });
    // } catch (err) {
    //     console.error('Error adding group:', err);
    //     res.status(500).json({ message: 'Error adding group' });
    // } finally {
    //     if (client) client.release();
    });


// **Add a Category**
app.post('/categories', async (req, res) => {
    const { categoryName } = req.body;
    if (!categoryName) {
        return res.status(400).json({ message: 'Category name is required' });
    }
    let {data:checkDuplicates,error} = await supabase
    .from('categories')
    .select("*")
    .eq("name",categoryName);
    if (error){
        console.error('Error adding category:', err);
        res.status(500).json({ message: 'Error adding category' });
    }
    if (checkDuplicates.rows.length > 0) {
        return res.status(400).json({ message: `Category ${categoryName} already exists` });
    }
    let {error2} = await supabase
        .from('categories')
        .insert({name:categoryName});
    if (error2){
        res.status(500).json({message:"Error adding category"});
        console.error('Error adding category:', error);
    }
    res.status(201).json({ message: `Category ${categoryName} added successfully` });

});

// **Add a Post**
app.post('/posts', upload.single('picture'), async (req, res) => {
        const { service, category, description } = req.body;
        const picture = req.file ? req.file.buffer.toString("base64") : null; // <-- This is the fix: use the buffer instead of path
        console.log(picture);
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

        let {data:result,error} = await supabase
        .from('posts')
        .insert({servicetype:service,category:categoryArray,text:description,picture:picture})
        .select();
        if (error){
            console.error('Error inserting post:', error);

            if (error instanceof multer.MulterError) {
                return res.status(400).json({ error: error.message });
            }

            res.status(500).json({ error: 'Failed to add post' });
        }
        res.status(201).json(result[0]);
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
        let{data:result,error} = await supabase
        .from('posts')
        .select("*");
        if(error){
            console.error('Error retrieving posts:', error);
            res.status(500).json({ error: 'Failed to fetch posts' });
        }
        // Convert the bytea (binary data) to base64 so frontend can use it
        const posts = result.map(post => {
            let base64;
            if(post.picture) {
                console.log(/^[0-9a-fA-F]+$/.test(post.picture.slice(2)));
                console.log(post.picture.slice(0, 20));
                console.log(Buffer.from(post.picture.slice(2), "base64"))//TODO: IT IS LOGGING THE HEX BYTES FOR BASE64 FOR A PDF
            }
            base64 = post.picture ? Buffer.from(post.picture, "base64").toString("base64") : null;
            if(post.picture){console.log(base64.slice(0,50));}//TODO: the buffer is GETTING WRITTEN IN AS A JSON STRING BRUH FIX THIS
            return {...
                post,
                    picture
            :
                post.picture
                    ? `data:application/octet-stream;base64,${base64}`
                    : null
            }
        });
        console.log(posts);
        res.status(200).json(posts);
});

const PORT = process.env.PORT || 3000;
console.log(`${PORT} Print out the port number to see if this is even working`);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});