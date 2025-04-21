import React, {useEffect, useState} from "react"
import axios from "axios";
import "./GroupPage.css"


function GroupPage() {
    let [groups, setGroups] = useState([]);

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

    return (
        <>
            <h1>Groups:</h1>
            {groups.map((g:any,index)=>{
                return (
                    <div className={"group-card"} key={index}>
                        <h3>{g.groupname}</h3>
                        <i>Categories: <b>{g.categories.map((c)=>c.name).join(", ")}</b></i>
                        <i>Members: <b>{g.members.map((m)=>m.username).join(", ")}</b></i>
                    </div>
                )
            })}
        </>
    )

}

export default GroupPage