//PLEASE PLEASE PLEASE

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

        const cleanedData = response.data
          .sort(
            (a: any, b: any) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
          .map((post: any) => ({
            id: post.id || post.postid,
            ServiceType: post.ServiceType ?? post.servicetype,
            picture: post.picture ?? null,
            group: post.groupId || null,
            groupId: post.groupId || null,
            category: post.category,
            description: post.description || post.text,
            comments: post.comments || [], 
            timestamp: post.timestamp,
            flagged: post.flagged || false,
            username: post.username,
          }));

        console.log(`${cleanedData.length} services fetched from the API`);
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
        services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))
      ) : (
        <p>Loading services...</p>
      )}
    </div>
  );
}

export default App;