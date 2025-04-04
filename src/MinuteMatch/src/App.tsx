import './App.css'
import {Service} from "./types.ts";
import ServiceCard from "./components/blocks/ServiceCard.tsx"
import axios from "axios";
import {useEffect,useState} from "react";

/*function get_services():Array<Service>{
    return [
        {id:0,type:"test",category:"Test Category",group:"Students for poorly tested software",description:"This is a service",user:{id:0,name:"Timmald"}},
        {id:1,type:"test2",category:"Test Category 2",group:"Students for well tested software",description:"This is not a service",user:{id:0,name:"Timmald"}},
        {id:2,type:"test3",category:"Test Category 3",group:"Students for mediocrily tested software",description:"This might be a service",user:{id:0,name:"Timmald"}}
    ]
}*/




function App() {
    const [services,setServices] = useState<Array<Service>>([]);
    useEffect(()=>{
        const fetch_services = async ()=>{
            const response = await axios.get("http://localhost:3000/api/posts");
            setServices(response.data);
        }
        fetch_services();
        console.log(services);
    })

  return (
    <>
      <h1>WELCOME TO MINUTEMATCH</h1>
        {services.map((service:Service)=>(<ServiceCard key={service.id} service={service}/>))}
    </>
  )
}

export default App
