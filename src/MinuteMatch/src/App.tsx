import './App.css'
import {Service} from "./types.ts";
import ServiceCard from "./components/blocks/ServiceCard.tsx"

function get_services():Array<Service>{
    return [
        {id:0,type:"test",category:"Test Category",group:"Students for poorly tested software",description:"This is a service"},
        {id:1,type:"test2",category:"Test Category 2",group:"Students for well tested software",description:"This is not a service"},
        {id:2,type:"test3",category:"Test Category 3",group:"Students for mediocrily tested software",description:"This might be a service"}
    ]
}


function App() {
  return (
    <>
      <h1>WELCOME TO MINUTEMATCH</h1>
        {get_services().map((service:Service)=>(<ServiceCard key={service.id} service={service}/>))}
    </>
  )
}

export default App
