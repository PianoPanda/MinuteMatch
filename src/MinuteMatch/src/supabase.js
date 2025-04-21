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
    if (checkDuplicates.length > 0) {
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

//** Get Users**
// todo this will be implemented and used for the userlogin and also implemented and used for the ranking system**************************
app.get('/user', async (req, res) => {
    const {data, error} = await supabase
    .from('user')
    .select (
        UserID,
        Username,
        email, //todo do we even implement the email login for this set up???????
        ranking,
        verified,
        groups,
        last_active,
        flagged,
        reviews
    );

    if(error){
        console.error("Error fetching users:",error);
        return res.status(500).json({error: "Failed to fetch users"});
    }

    const users = data.map(user => ({
        ...user, //get all of the users from our data base
        Reviews: Array.isArray(user.Reviews) ? user.Reviews : []
      }));
    
      res.status(200).json(users);
});

// ** Add Users **
app.post('/user', async (req, res) => {
    const {
        //todo these values need to double check the implementation of the code for this instance
      UserID,
      Username,
      Email,
      Password,
      Ranking = 0,
      Verified = false,
      Groups = [],
      Last_active = new Date().toISOString(),
      Flagged = false,
      Reviews = []
    } = req.body;
  
    if (!UserID || !Username || !Password) {
      return res.status(400).json({ error: "Missing required fields (UserID, Username, Password)" });
    }
  
    const { data, error } = await supabase
      .from('user')
      .insert([
        {
          userID,
          username,
          email,
          password,
          ranking,
          verified,
          groups,
          last_active,
          flagged,
          reviews
        }
      ]);
  
    if (error) {
      console.error("Error adding user:", error);
      return res.status(500).json({ error: "Failed to add user" });
    }
  
    res.status(201).json({ message: "User added successfully", user: data[0] });
  });


// **Add a Post**
app.post('/posts', upload.single('picture'), async (req, res) => {
        const { service, category, description, group} = req.body;
        console.log(req.body);
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
        const groupID = group?await supabase
            .from("group")
            .select("groupid")
            .eq("groupname",group).limit(1).single():null;
        console.log(groupID);
        let {data:result,error} = await supabase
        .from('posts')
        .insert({servicetype:service,text:description,picture:picture,groupid:groupID?groupID.data.groupid:null})
        .select();
        if (error){
            console.error('Error inserting post:', error);

            if (error instanceof multer.MulterError) {
                return res.status(400).json({ error: error.message });
            }

            res.status(500).json({ error: 'Failed to add post' });
        }
    let {data: catIDArr,error3} = await supabase
        .from('categories')
        .select("id")
        .eq("name",category.slice(1,-1))
        .limit(1);
    if(error3){
        console.error('Error finding post category:', error);
    }
    let catID=catIDArr[0].id;

    let {error2} = await supabase.from("post_categories")
        .insert({post_id:result[0].postid,category_id:catID})
    if(error2){console.error("Error submitting post category:", error);}


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
        .select("*, post_categories (category_id:categories (*)), groupid:group (*)");
        if(error){
            console.error('Error retrieving posts:', error);
            res.status(500).json({ error: 'Failed to fetch posts' });
        }
        console.log(result);
        // Convert the bytea (binary data) to base64 so frontend can use it
        const posts = result.map(post => {
            let base64;
            console.log(post.post_categories[0])
            if(post.picture) {
                //console.log(/^[0-9a-fA-F]+$/.test(post.picture.slice(2)));
                //console.log(post.picture.slice(0, 20));
                //console.log(Buffer.from(post.picture.slice(2), "base64"))//TODO: IT IS LOGGING THE HEX BYTES FOR BASE64 FOR A PDF
            }
            base64 = post.picture ? Buffer.from(post.picture, "base64").toString("base64") : null;
            //if(post.picture){console.log(base64.slice(0,50));}//TODO: the buffer is GETTING WRITTEN IN AS A JSON STRING BRUH FIX THIS
            let catArr = post.post_categories.map(postcat => {
                return postcat.category_id.name;
            })
            return {...
                post,
                groupId:post.groupid?post.groupid.groupname:null,
                category:catArr,
                    picture
            :
                post.picture
                    ? `data:application/octet-stream;base64,${base64}`
                    : null
            }
        });
        //console.log(posts);
        res.status(200).json(posts);
});

const PORT = process.env.PORT || 3000;
console.log(`${PORT} Print out the port number to see if this is even working`);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});