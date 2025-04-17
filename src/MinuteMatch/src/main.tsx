
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import './index.css'
import App from './App.tsx'
import Navbar from "./components/Navbar.tsx";
import PostService from "./PostService.tsx"
import RequestService from "./RequestService.tsx";
import Login from "./components/pages/Login.tsx";
import UserAccount from "./UserAccount.tsx"; 
import Groups from './Groups.tsx';
import { JSX } from 'react';
import Categories from './Categories.tsx';

const root = document.getElementById("root");

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const isAuthenticated = localStorage.getItem('authenticated') === 'true';
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}


createRoot(root!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <>
            <Navbar />
            <App />
          </>
        </ProtectedRoute>
      } />
      <Route path="/post-service" element={
        <ProtectedRoute>
          <>
            <Navbar />
            <PostService />
          </>
        </ProtectedRoute>
      } />
      <Route path="/request" element={
        <ProtectedRoute>
          <>
            <Navbar />
            <RequestService />
          </>
        </ProtectedRoute>
      } />
      <Route path="/useraccount" element={
        <ProtectedRoute>
          <>
            <Navbar />
            <UserAccount />
          </>
        </ProtectedRoute>
      } />
      <Route path="/groups" element={
        <ProtectedRoute>
          <>
            <Navbar />
            <Groups />
          </>
        </ProtectedRoute>
      } />
      <Route path="/category" element={
        <ProtectedRoute>
          <>
            <Navbar />
            <Categories />
          </>
        </ProtectedRoute>
      } />
    </Routes>
  </BrowserRouter>
);
