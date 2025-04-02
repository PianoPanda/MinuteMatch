import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import './index.css'
import App from './App.tsx'
import Navbar from "./components/Navbar.tsx";
import PostService from "./PostService.tsx"
import RequestService from "./RequestService.tsx";

const root = document.getElementById("root");
createRoot(root!).render(
    <>
    <BrowserRouter>
    <Navbar />
    <div>

        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/post-service" element={<PostService/>}/>
            <Route path="/request" element={<RequestService/>}/>
        </Routes>
    </div>
    </BrowserRouter>
    </>
);
