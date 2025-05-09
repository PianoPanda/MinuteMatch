// import React, {useEffect, useState, useRef} from "react"
// import axios from "axios";
// import "./GroupPage.css"


// function GroupPage() {
//     const [groups, setGroups] = useState([]);
//     const [newGroup, setNewGroup] = useState(null);
//     const newGroupName = useRef("");
//     const [categories,setCategories] = useState([]);
//     const [users, setUsers] = useState<any[]>([]);
//     const [newGroupCategories,setNewGroupCategories] = useState([]);
//     const [newGroupUsers,setNewGroupUsers] = useState([]);


//     useEffect(() => {
//         const fetchCategories = async () => {
//             try {
//                 const { data } = await axios.get("http://localhost:3000/categories");
//                 console.log("Successfully fetched categories");
//                 setCategories(data);
//             } catch (error) {
//                 console.error("Error fetching categories:", error);
//             }
//         };
//         fetchCategories();
//     }, []);

//     useEffect(() => {
//         const fetchGroups = async () => {
//             try {
//                 const response = await axios.get("http://localhost:3000/group");
//                 setGroups(response.data);
//             } catch (error) {
//                 console.error("Error fetching groups:", error);
//             }
//         };
//         fetchGroups();
//         console.log(groups)
//     }, []);

//     useEffect(() => {
//         const fetchUsers = async () => {
//             try {
//                 const response = await axios.get("http://localhost:3000/user");
//                 setUsers(response.data);
//             } catch (error) {
//                 console.error("Error fetching users:", error);
//             }
//         };
//         fetchUsers();
//     }, []);

// const makeGroup = async () => {
//     try {

//         await axios.post("http://localhost:3000/group",{name:newGroupName.current,members:newGroupUsers,categories:newGroupCategories});
//         console.log("Successfully added group");
//         setGroups(newGroup?[...groups, newGroup]:groups);
//     }
//     catch(error){
//         console.error("Error adding group:", error);
//     }
// };

//     console.log(users)

//     function selectUser(user){
//         setNewGroupUsers([...newGroupUsers,user]);
//     }
//     function selectCategory(cat){
//         console.log("WE CLICKED IT")
//         setNewGroupCategories([...newGroupCategories,cat]);
//     }


//     return (
//         <>
//             <h1>Create Group</h1>
//                 <form>
//                     <label>Group Name</label>
//                     <input type={"text"} onChange={(e)=> {
//                         newGroupName.current = e.target.value
//                     }}></input>
//                     <label>Select Categories: </label>{newGroupCategories.join(", ")}
//                     <select onChange={(e)=>selectCategory(e.target.value)}>
//                         {categories.map((category,index) => (
//                             <option key={index} value={category} onClick={()=>selectCategory(category)}>{category}</option>
//                         ))}
//                     </select>
//                     <label>Add Members: </label>{newGroupUsers.join(", ")}
//                     <select onChange={(e)=>selectUser(e.target.value)}>
//                         {users.map((user,index) => (
//                             <option key={index} value={user.username} onClick={()=>selectUser(user.username)}>{user.username}</option>
//                         ))}
//                     </select>
//                     <button type={"submit"} onClick={makeGroup}>Create Group</button>
//                 </form>
//             <h1>Groups:</h1>
//             {groups.map((g:any,index)=>{
//                 return (
//                     <div className={"group-card"} key={index}>
//                         <h3>{g.groupname}</h3>
//                         <i>Categories: <b>{g.categories.map((c)=>c.name).join(", ")}</b></i>
//                         <i>Members: <b>{g.members.map((m)=>m.username).join(", ")}</b></i>
//                     </div>
//                 )
//             })}
//         </>
//     )

// }

// export default GroupPage

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./GroupPage.css";

function GroupPage() {
    const [groups, setGroups] = useState([]);
    const [newGroup, setNewGroup] = useState(null);
    const newGroupName = useRef("");
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState<any[]>([]);
    const [newGroupCategories, setNewGroupCategories] = useState([]);
    const [newGroupUsers, setNewGroupUsers] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await axios.get("http://localhost:3000/categories");
                console.log("Successfully fetched categories");
                setCategories(data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await axios.get("http://localhost:3000/group");
                setGroups(response.data);
            } catch (error) {
                console.error("Error fetching groups:", error);
            }
        };
        fetchGroups();
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get("http://localhost:3000/user");
                setUsers(response.data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers();
    }, []);

    const makeGroup = async () => {
        try {
            await axios.post("http://localhost:3000/group", {
                name: newGroupName.current,
                members: newGroupUsers,
                categories: newGroupCategories
            });
            console.log("Successfully added group");
            setGroups(newGroup ? [...groups, newGroup] : groups);
        } catch (error) {
            console.error("Error adding group:", error);
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
            <h1>Create Group</h1>
            <form>
                <label>Group Name</label>
                <input
                    type="text"
                    onChange={(e) => {
                        newGroupName.current = e.target.value;
                    }}
                />

                <label>Select Categories: </label>{newGroupCategories.join(", ")}
                {/* ✅ Updated dropdown for categories */}
                <select onChange={(e) => selectCategory(e.target.value)} defaultValue="">
                    <option value="" disabled>Select a category</option>
                    {categories.map((category, index) => (
                        <option key={index} value={category}>{category}</option>
                    ))}
                </select>

                <label>Add Members: </label>{newGroupUsers.join(", ")}
                {/* ✅ Updated dropdown for users */}
                <select onChange={(e) => selectUser(e.target.value)} defaultValue="">
                    <option value="" disabled>Select a user</option>
                    {users.map((user, index) => (
                        <option key={index} value={user.username}>{user.username}</option>
                    ))}
                </select>

                <button type="submit" onClick={makeGroup}>Create Group</button>
            </form>

            <h1>Groups:</h1>
            {groups.map((g: any, index) => {
                return (
                    <div className="group-card" key={index}>
                        <h3>{g.groupname}</h3>
                        <i>Categories: <b>{g.categories.map((c) => c.name).join(", ")}</b></i>
                        <i>Members: <b>{g.members.map((m) => m.username).join(", ")}</b></i>
                    </div>
                );
            })}
        </>
    );
}

export default GroupPage;