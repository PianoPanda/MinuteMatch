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
        .select('*');//list of objects with groupname attr
    if (error){
        console.error('Error fetching groups:', error);
        res.status(500).json({ message: 'Error fetching group' });
        return;
    }
    res.json(group);
});

// app.post('/group', async (req, res) => {
// //name members categories
//     console.log(req.body);

//     //check duplicates
//     let {data:dupes,error3} = await supabase
//         .from("group")
//         .select('*')
//         .eq("groupname",req.body.groupname);
//     if (error3){
//         console.error('Error fetching group:', error);
//         res.status(500).json({ message: 'Error finding dupes' });
//     }
//     if(dupes.length > 0){
//         res.status(500).json({message: "DUPLICATE GROUPNAME"})
//     }
//     //-------

//     let {data:memberIDs,error1} = await supabase
//         .from("users")
//         .select('userid')
//         .likeAnyOf("username",req.body.members)
//     if(error1){
//         res.status(500).json(error)
//         return;
//     }
//     console.log(memberIDs)
//     memberIDs = memberIDs.map(i=>i.userid)
//     let {data:catIDs,error2} = await supabase
//         .from("categories")
//         .select('id')
//         .likeAnyOf("name",req.body.categories);
//     if (error2){res.status(500).json(error)
//     return;}
//     catIDs=catIDs.map((i)=>i.id)

//     let { data: group, error } = await supabase
//         .from('group')
//         .insert({groupname:req.body.name})
//         .select()
//         .single();//list of objects with groupname attr
//     if (error){
//         console.error('Error adding group:', error);
//         res.status(500).json({ message: 'Error adding group' });
//         return;
//     }

//     await memberIDs.forEach(async (id)=>{
//         console.log(group)
//         let {error} = await supabase
//             .from("group_members")
//             .insert({group_id:group.groupid,member_id:id})
//         if(error){
//             console.error('Error adding group:', error);
//         }
//     });

//     await catIDs.forEach(async (id)=>{
//         console.log(id)
//         let {error} = await supabase
//             .from("group_categories")
//             .insert({group_id:group.groupid,category_id:id})
//         if(error){
//             console.error('Error adding group:', error);
//         }
//     });

//     res.json(group);
// });

app.post('/group', async (req, res) => {
    console.log(req.body);
  
    // 1. Check for duplicate group name
    const { data: dupes, error: error3 } = await supabase
      .from("group")
      .select("*")
      .eq("groupname", req.body.groupname);
  
    if (error3) {
      console.error("Error checking dupes:", error3);
      return res.status(500).json({ message: "Error finding dupes" });
    }
  
    if (dupes.length > 0) {
      return res.status(400).json({ message: "DUPLICATE GROUPNAME" });
    }
  
    // 2. Get user IDs and current groups for the members
    let { data: memberIDs, error: error1 } = await supabase
      .from("users")
      .select("userid, groups")
      .likeAnyOf("username", req.body.members);
  
    if (error1) {
      return res.status(500).json(error1);
    }
  
    // 3. Get category IDs
    let { data: catIDs, error: error2 } = await supabase
      .from("categories")
      .select("id")
      .likeAnyOf("name", req.body.categories);
  
    if (error2) {
      return res.status(500).json(error2);
    }
  
    const categoryIdList = catIDs.map((c) => c.id);
  
    // 4. Create the group using groupname
    const { data: group, error } = await supabase
      .from("group")
      .insert({ groupname: req.body.groupname }) // ✅ use groupname
      .select()
      .single();
  
    if (error) {
      console.error("Error adding group:", error);
      return res.status(500).json({ message: "Error adding group" });
    }
  
    const groupId = group.groupid;
    const groupName = group.groupname;
  
    // 5. Insert into group_members and update each user's groups (using group name)
    await Promise.all(
      memberIDs.map(async ({ userid, groups }) => {
        // Insert into group_members table
        const { error: memberError } = await supabase
          .from("group_members")
          .insert({ group_id: groupId, member_id: userid });
  
        if (memberError) {
          console.error("Error adding to group_members:", memberError);
        }
  
        // Update user's `groups` array with groupname, not groupid
        const updatedGroups = Array.from(new Set([...(groups || []), groupName]));
  
        const { error: userUpdateError } = await supabase
          .from("users")
          .update({ groups: updatedGroups })
          .eq("userid", userid);
  
        if (userUpdateError) {
          console.error("Error updating user.groups:", userUpdateError);
        }
      })
    );
  
    // 6. Insert into group_categories
    await Promise.all(
      categoryIdList.map(async (id) => {
        const { error: catError } = await supabase
          .from("group_categories")
          .insert({ group_id: groupId, category_id: id });
  
        if (catError) {
          console.error("Error adding to group_categories:", catError);
        }
      })
    );
  
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
    console.log(req.query)
    let {data, error} = await supabase
    .from('users')
    .select (
        "userid,username,email,ranking,verified,groups,last_active,flagged,reviews,password"
    )
        .eq("username",req.query.username)
        .single();
    console.log(data)
    if(error){
        console.error("Error fetching users:",error);
        return res.status(500).json({error: "Failed to fetch users"});
    }
    data = {...data,Reviews: Array.isArray(data.Reviews)?data.Reviews:[]}
    /*const users = data.map(user => ({
        ...user, //get all of the users from our data base
        Reviews: Array.isArray(user.Reviews) ? user.Reviews : []
      }));*/
    
      res.status(200).json(data);
});

app.get("/all_users", async (req,res)=>{
    let {data, error} = await supabase
        .from("users")
        .select("*")
    if(error){
        console.error('Error fetching users:', error);
        res.status(500).json({error: "Failed to fetch users"});
    }
    res.status(200).json(data);

})

// ** Add Users **
app.post('/user', async (req, res) => {
    const {
        //todo these values need to double check the implementation of the code for this instance
      // UserID,
      // Username,
      // Email,
      // Password,
      // Ranking = 0,
      // Verified = false,
      // Groups = [],
      // Last_active = new Date().toISOString(),
      // Flagged = false,
      // Reviews = [],
      // IsAdmin = false
      username,
      password,
      email,          // add real email if you collect it
      ranking,         // defaults that match your /user route
      verified,
      groups,
      reviews,
      last_active,
      flagged,
      isAdmin
    } = req.body;
    console.log(username)
    console.log(password)
    console.log(req.body)

    if (!username || !password) {
      return res.status(400).json({ error: "Missing required fields (UserID, Username, Password)" });
    }
  
    const { data, error } = await supabase
      .from('user')
      .insert([
        {
          username: username,
          email: email,
          password: password,
          ranking: ranking,
          verified: verified,
          groups: groups,
          last_active: last_active,
          flagged: flagged,
          reviews: reviews,
          isAdmin: isAdmin
        }
      ]);      
  
    if (error) {
      console.error("Error adding user:", error);
      return res.status(500).json({ error: "Failed to add user" });
    }
  
    res.status(201).json({ message: "User added successfully", user: data[0] });
  });


// **Add a Post**
// app.post('/posts', upload.single('picture'), async (req, res) => {
//         const { service, category, description, group} = req.body;
//         const picture = req.file ? req.file.buffer.toString("base64") : null; // <-- This is the fix: use the buffer instead of path
//         if (!service) {
//             return res.status(400).json({ error: 'Service type is required' });
//         }
//         if (!category) {
//             return res.status(400).json({ error: 'Category is required' });
//         }
//         if (!description || description.trim().length < 2) {
//             return res.status(400).json({ error: 'Description must be at least 10 characters long' });
//         }

//         const categoryArray = Array.isArray(category) ? category : [category];
//         const groupID = group?await supabase
//             .from("group")
//             .select("groupid")
//             .eq("groupname",group).limit(1).single():null;
//         let {data:result,error} = await supabase
//         .from('posts')
//         .insert({servicetype:service,text:description,picture:picture,groupid:groupID?groupID.data.groupid:null})
//         .select();
//         if (error){
//             console.error('Error inserting post:', error);

//             if (error instanceof multer.MulterError) {
//                 return res.status(400).json({ error: error.message });
//             }

//             res.status(500).json({ error: 'Failed to add post' });
//         }
//     let {data: catIDArr,error3} = await supabase
//         .from('categories')
//         .select("id")
//         .eq("name",category.slice(1,-1))
//         .limit(1);
//     if(error3){
//         console.error('Error finding post category:', error);
//     }
//     let catID=catIDArr[0].id;

//     let {error2} = await supabase.from("post_categories")
//         .insert({post_id:result[0].postid,category_id:catID})
//     if(error2){console.error("Error submitting post category:", error);}


//     res.status(201).json(result[0]);
// });


/*Posts are actually what we want to submit with the user id*/

/* We will also need to come back to this and implement the comment storage into the posts data as well for this implementation*/
app.post('/posts', upload.single('picture'), async (req, res) => {
    const { service, category, description, group, username } = req.body;
    const picture = req.file ? req.file.buffer.toString("base64") : null;
  
    if (!service) return res.status(400).json({ error: 'Service type is required' });
    if (!category) return res.status(400).json({ error: 'Category is required' });
    if (!description || description.trim().length < 10)
      return res.status(400).json({ error: 'Description must be at least 10 characters long' });
    if (!username) return res.status(400).json({ error: 'Username is required' });
  
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('userid')
      .eq('username', username)
      .single();
  
    if (userError || !userData) {
      console.error("Failed to find user:", userError);
      return res.status(400).json({ error: "User not found" });
    }
  
    const userid = userData.userid;
  
    const groupID = group
      ? await supabase.from("group").select("groupid").eq("groupname", group).limit(1).single()
      : null;
  
    const { data: result, error } = await supabase
      .from('posts')
      .insert({
        servicetype: service,
        text: description,
        picture: picture,
        groupid: groupID ? groupID.data.groupid : null,
        userid: userid
      })
      .select();
  
    if (error) {
      console.error('Error inserting post:', error);
      return res.status(500).json({ error: 'Failed to add post' });
    }
  
    const { data: catIDArr, error: error3 } = await supabase
      .from('categories')
      .select("id")
      .eq("name", category.slice(1, -1))
      .limit(1);
  
    if (error3) {
      console.error('Error finding post category:', error3);
      return res.status(500).json({ error: 'Category lookup failed' });
    }
  
    const catID = catIDArr[0]?.id;
    if (!catID) return res.status(400).json({ error: "Invalid category" });
  
    const { error: error2 } = await supabase
      .from("post_categories")
      .insert({ post_id: result[0].postid, category_id: catID });
  
    if (error2) {
      console.error("Error submitting post category:", error2);
      return res.status(500).json({ error: "Category linking failed" });
    }
  
    res.status(201).json(result[0]);
  });
  


/*New app of the posts feature we will need to add the comments set up for the get and the post with the user name*/
// app.get('/posts', async (req, res) => {
//     const { data: result, error } = await supabase
//       .from('posts')
//       .select(`
//         *,
//         user:users!userid (username),
//         post_categories (
//           category_id:categories (*)
//         ),
//         groupid:group (
//           groupname
//         )
//       `);
  
//     if (error) {
//       console.error('Error retrieving posts:', error);
//       return res.status(500).json({ error: 'Failed to fetch posts' });
//     }
  
//     const posts = result.map(post => {
//       const base64 = post.picture
//         ? Buffer.from(post.picture, "base64").toString("base64")
//         : null;
  
//       const catArr = post.post_categories.map(postcat => postcat.category_id.name);
  
//       const resolvedUsername = post.user?.username ?? "Unknown"; // ✅ Ensures fallback if username missing
  
//       return {
//         id: post.postid,
//         ServiceType: post.servicetype,
//         picture: base64
//           ? `data:application/octet-stream;base64,${base64}`
//           : null,
//         groupId: post.groupid?.groupname ?? null,
//         category: catArr,
//         description: post.text,
//         postComments: post.postcomments ?? [],
//         timestamp: post.timestamp,
//         flagged: post.flagged,
//         username: resolvedUsername
//       };
//     });
  
//     res.status(200).json(posts);
//     console.log("Final posts sent to the frontend:", posts);
//   });

app.get('/posts', async (req, res) => {
    const { data: result, error } = await supabase
      .from('posts')
      .select(`
        postid,
        servicetype,
        picture,
        text,
        comments,
        flagged,
        timestamp,
        userid,
        user:users!userid (username),
        post_categories (
            category_id:categories (*)
        ),
        groupid:group (
            groupname
        )
`);
  
    if (error) {
      console.error('Error retrieving posts:', error);
      return res.status(500).json({ error: 'Failed to fetch posts' });
    }
  
    const posts = result.map(post => {
      const base64 = post.picture
        ? Buffer.from(post.picture, "base64").toString("base64")
        : null;
  
      const catArr = post.post_categories.map(postcat => postcat.category_id.name);
  
      const resolvedUsername = post.user?.username ?? "Unknown";
  
      return {
        id: post.postid,
        ServiceType: post.servicetype,
        picture: base64
          ? `data:application/octet-stream;base64,${base64}`
          : null,
        groupId: post.groupid?.groupname ?? null,
        category: catArr,
        description: post.text,
        comments: post.comments ?? [], 
        timestamp: post.timestamp,
        flagged: post.flagged,
        username: resolvedUsername
      };
    });
  
    res.status(200).json(posts);
  });


/*end of the test to see what the new posts will do to store the usernames in this instance*/

app.post("/flag", async (req, res) => {
    let {data,error} = await supabase
        .from("posts")
        .update({flagged:true})
        .eq("postid",req.body.id)
        .select();
    if(error){
        console.error('Error updating post:', error);
        res.status(500).json({ error: 'Failed to update post' });
    }
    res.status(200).json(data);

})

/*PRESTON's FUNCTIONS DO NOT TOUCH LEAVE FOR TESTING PURPOSES*/

app.post('/comment', async (req, res) => {
    const { postId, username, text } = req.body;
  
    if (!postId || !username || !text) {
      return res.status(400).json({ error: "Missing postId, username, or text" });
    }
  
    const { data: existing, error: fetchError } = await supabase
      .from("posts")
      .select("comments")
      .eq("postid", postId)
      .single();
  
    if (fetchError) {
      console.error("Error fetching existing comments:", fetchError);
      return res.status(500).json({ error: "Could not fetch existing comments" });
    }
  
    const newComment = {
      username,
      text,
      timestamp: new Date().toISOString()
    };
  
    const updatedComments = [...(existing?.comments || []), newComment];
  
    const { error: updateError } = await supabase
      .from("posts")
      .update({ comments: updatedComments })
      .eq("postid", postId);
  
    if (updateError) {
      console.error("Error updating comments:", updateError);
      return res.status(500).json({ error: "Could not update comments" });
    }
  
    res.status(200).json({ message: "Comment added", comment: newComment });
  });


app.get("/usernames", async (req, res) => {
    const { data, error } = await supabase
        .from("users")
        .select("username");

    if (error) {
        console.error("Error fetching usernames:", error);
        return res.status(500).json({ error: "Failed to fetch usernames" });
    }

    const usernames = data.map(user => user.username);
    res.status(200).json(usernames);
});

app.get("/userreview", async (req, res) => {
    const { username, category } = req.query;
  
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }
  
    const { data, error } = await supabase
      .from("users")
      .select("reviews")
      .eq("username", username)
      .single();
  
    if (error) {
      console.error("Error fetching user reviews:", error);
      return res.status(500).json({ error: "Failed to fetch user reviews" });
    }
  
    let reviews = Array.isArray(data.reviews) ? data.reviews : [];
  
    // Filter if category is provided
    if (category) {
      reviews = reviews.filter(r => r.category?.toLowerCase() === category.toLowerCase());
    }
  
    res.status(200).json(reviews);
  });

app.get("/usergroups", async (req, res) => {
    const { data, error } = await supabase
        .from('users')
        .select(`
    userid,
    username,
    group_members (
      group_id,
      group (
        groupid,
        groupname
      )
      )
    )
  `);
    if (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: "Failed to fetch user groups" });
    }
    console.log(data)
    res.json(data);

})

app.post("/usergroups", async (req, res) => {
    console.log("USER GROUPS")
    const {userid,groupid} = req.body;
    let {error}=await supabase.from("group_members")
        .insert({group_id:groupid,member_id:userid});
    if(error){
        console.error("TRYING TO ADD MEMBERSHIP",error)
        res.status(500).json({ error: "Failed to add membership" });
    }
    res.status(200).json(userid);
})

  app.post("/reviews", async (req, res) => {
    const {
      reviewer,
      who_ranked,
      post_ID,
      text,
      category,
      score
    } = req.body;
  
    console.log("Incoming review:", req.body);
  
    if (!reviewer || !who_ranked || !category || score === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }
  
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("reviews")
      .eq("username", who_ranked)
      .single();
  
    if (fetchError) {
      console.error("Error fetching target user:", fetchError);
      return res.status(500).json({ error: "Could not find user to review" });
    }
  
    const currentReviews = Array.isArray(user.reviews) ? user.reviews : [];
  
    const newReview = {
      text,
      score,
      post_ID,
      category,
      reviewer,
      timestamp: new Date().toISOString()
    };
  
    const { error: updateError } = await supabase
      .from("users")
      .update({ reviews: [...currentReviews, newReview] })
      .eq("username", who_ranked);
  
    if (updateError) {
      console.error("Error saving review:", updateError);
      return res.status(500).json({ error: "Failed to add review" });
    }
  
    res.status(201).json({ message: "Review added successfully" });
  });

/*END OF THE TESTING FUNCTIONS THAT WE ARE USING FOR THIS INSTANCE*/

app.post("/unflag", async (req, res) => {
    const { postId, userId } = req.body; //postId is correct now, userId is still incorrect

    console.log("Received postId:", postId, "and userId:", userId); // Debug

    // Check if user is admin
    const { data: user, error: userError } = await supabase
        .from("users")
        .select("isAdmin")
        .eq("userid", userId)
        .single();

    console.log("User Data:", user, "Error:", userError); // Debug

    if (userError || !user?.isAdmin) {
        return res.status(403).json({ error: 'Unauthorized user' });
    }

    const { data: result, error } = await supabase
        .from("posts")
        .update({ flagged: false })
        .eq("postid", postId)
        .select();

    if (error) {
        return res.status(500).json({ error: 'Failed to unflag post' });
    }

    res.status(200).json(result);
});

const PORT = process.env.PORT || 3000;
console.log(`${PORT} Print out the port number to see if this is even working`);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});