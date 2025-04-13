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

//** Get Users**
// todo this will be implemented and used for the userlogin and also implemented and used for the ranking system**************************
// app.get('/user', async (req, res) => {
//     const {data, error} = await supabase
//     .from('users')
//     .select(`
//         userid,
//         username,
//         password,
//         email,
//         ranking,
//         verified,
//         groups,
//         last_active,
//         flagged,
//         reviews
//       `)

//     if(error){
//         console.error("Error fetching users:",error);
//         return res.status(500).json({error: "Failed to fetch users"});
//     }

//     const users = data.map(user => ({
//         ...user, //get all of the users from our data base
//         Reviews: Array.isArray(user.Reviews) ? user.Reviews : []
//       }));
    
//       res.status(200).json(users);
// });

app.get('/user', async (req, res) => {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ error: "Username query parameter is required" });
    }
  
    const { data, error } = await supabase
      .from('users')
      .select(`
        userid,
        username,
        password,
        email,
        ranking,
        verified,
        groups,
        last_active,
        flagged,
        reviews
      `)
      .eq('username', username)
      .single();
  
    if (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ error: "Failed to fetch user" });
    }
    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }
  
    // ← FIX: always return reviews as an array
    const user = {
      ...data,
      reviews: Array.isArray(data.reviews) ? data.reviews : []
    };
  
    res.status(200).json(user);
  });

// ** Add Users **
app.post('/user', async (req, res) => {
    try {
        const {
            username,
            email = null,
            password,
            ranking = 0,
            verified = false,
            groups = [],
            reviews = []
        } = req.body;
        // console.log("\n177: "+username)
        // console.log("\n178: "+password)
        if (!username || !password) {
            return res.status(400).json({ error: "Username and Password are required" });
        }

        const { data, error } = await supabase
            .from('users')
            .insert([
                {
                    username,
                    email,
                    password,
                    ranking,
                    verified,
                    groups,
                    reviews,
                    last_active: new Date().toISOString(),
                    flagged: false
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            return res.status(500).json({
                error: error.message || 'Insert failed',
                details: error.details,
                hint: error.hint,
                code: error.code
            });
        }

        res.status(201).json({ user: data });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: "Server error" });
    }
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
    console.log(result)
    let catID=catIDArr[0].id;
    console.log({post_id:result[0].postid,category_id:catID})

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
        .select("*, post_categories (category_id:categories (*))");
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

// ***Posts the Reviews of the Users to users table***
//todo: Preston come back and clean up the set up of this instance
app.post('/reviews', async (req, res) => {
    const { reviewer, who_ranked, post_ID, text, category, score } = req.body;
  
    console.log("Incoming review payload:", req.body);
  
    if (!reviewer || !who_ranked || !category || score == null) {
      return res.status(400).json({ error: "Missing fields in request" });
    }
  
    if (reviewer.trim().toLowerCase() === who_ranked.trim().toLowerCase()) {
      return res.status(400).json({ error: "You cannot review yourself" });
    }
  
    const normalizedUsername = who_ranked.trim().toLowerCase();
  
    const { data: userMatchData, error: fetchError } = await supabase
      .from('users')
      .select('userid, username, reviews')
      .ilike('username', normalizedUsername); // case-insensitive match
  
    if (fetchError || !userMatchData || userMatchData.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
  
    const userData = userMatchData[0];
  
    let existingReviews = [];
    if (Array.isArray(userData.reviews)) {
      existingReviews = userData.reviews;
    } else if (typeof userData.reviews === "object" && userData.reviews !== null) {
      existingReviews = [userData.reviews];
    }
  
    const newReview = {
      reviewer,
      post_ID,
      text,
      category,
      score,
      timestamp: new Date().toISOString()
    };
  
    existingReviews.push(newReview);
  
    // Calculate new overall ranking (average of all scores)
    const scores = existingReviews.map(r => r.score);
    const avgRanking = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  
    const { error: updateError } = await supabase
      .from('users')
      .update({
        reviews: existingReviews,
        ranking: avgRanking
      })
      .eq('userid', userData.userid)
      .select('', { count: 'exact', head: true });
  
    if (updateError) {
      return res.status(500).json({ error: "Failed to update user reviews/rank" });
    }
  
    return res.status(200).json({ message: "Review and ranking updated successfully" });
  });

  //****** This is a lazy fix just to get all of the users */
  app.get("/usernames", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("username");
  
      if (error) throw error;
  
      const usernames = data.map(user => user.username);
      res.json(usernames); // returns ["user1", "user2", ...]
    } catch (err) {
      console.error("Error fetching usernames:", err);
      res.status(500).json({ error: "Failed to fetch usernames" });
    }
  });
  //****lazy way of just getting all the user and seeing there text review */
  app.get('/userreview', async (req, res) => {
    const { username, category } = req.query;
  
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }
  
    const { data, error } = await supabase
      .from('users')
      .select('reviews')
      .eq('username', username)
      .maybeSingle();
  
    if (error || !data) {
      console.error("Failed to fetch reviews:", error);
      return res.status(500).json({ error: "Could not fetch user reviews" });
    }
  
    const allReviews = Array.isArray(data.reviews) ? data.reviews : [];
    const filtered = category
      ? allReviews.filter(r => r.category?.toLowerCase() === category.toLowerCase())
      : allReviews;
  
    res.status(200).json(filtered);
  });

const PORT = process.env.PORT || 3000;
console.log(`${PORT} Print out the port number to see if this is even working`);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});