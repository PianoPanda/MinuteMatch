import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import './index.css'
import App from './App.tsx'
import Navbar from "./Navbar.tsx";
import PostService from "./PostService.tsx"

const root = document.getElementById("root");
createRoot(root!).render(
    <>
    <BrowserRouter>
    <Navbar />
    <div>

        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/post-service" element={<PostService/>}/>
        </Routes>
    </div>
    </BrowserRouter>
    </>
);
