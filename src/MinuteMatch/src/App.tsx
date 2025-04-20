// App.tsx
import { useEffect, useState } from "react";
import "./App.css";
import { Service } from "./types";
import ServiceCard from "./components/blocks/ServiceCard";
import axios from "axios";

function App() {
    const [services, setServices] = useState<Service[]>([]);

    useEffect(() => {
        const fetch_services = async () => {
            try {
                const response = await axios.get("http://localhost:3000/posts");
                // Map response data to match the Service type
                console.log(`${response.data}`)
                const cleanedData = response.data.map((post: any) => ({
                    id: post.postid,
                    ServiceType: post.servicetype,
                    picture: post.picture, // already a Base64 string if present
                    user: {
                        id: post.userid || 'N/A', //todo User id has not been made yet so defualt null
                        //name: post.user?.name || "Unknown User",
                    },
                    group: post.groupid || null, //todo: this is not going to be a null
                    category: post.category || [],
                    description: post.text || "No description available",
                    postComments: post.postcomments || [], //todo; may not need the empty array for the implementation of the service card, can be removed if not needed
                    timestamp: post.timestamp,
                }));
                console.log(`${cleanedData.length} services fetched from the API`);
                console.log(`${cleanedData.description} what is the data being inputed `)
                setServices(cleanedData);
            } catch (error) {
                console.error("Error fetching services:", error);
            }
        };

        fetch_services();
    }, []);

    return (
        <div className="App">
            <h1>WELCOME TO MINUTEMATCH</h1>
            {services.length > 0 ? (
                services.reverse().map((service) => (
                    <ServiceCard key={service.id} service={service} />
                ))
            ) : (
                <p>Loading services...</p>
            )}
        </div>
    );
}

export default App;
