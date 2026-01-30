import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Signup from "./pages/SignupPage.jsx";
import Login from "./pages/LoginPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import Home from "./pages/Home.jsx";
import Menu from "./pages/Menu.jsx";
import Order from "./pages/OrderPage.jsx";
import Profile from "./pages/ProfilePage.jsx";
import MainNavbar from "./components/MainNavbar.jsx";
import { CartProvider } from "./contexts/CartContext.jsx";
import "./App.css";

function Protected({ children }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return isAuthenticated ? children : null;
}

export default function App() {
  return (
    <CartProvider>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Public Auth Pages */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Home (user profile) */}
        <Route path="/home" element={<Protected><Home /></Protected>} />

        {/* Menu (public) */}
        <Route path="/menu" element={<Menu />} />

        {/* Protected Order */}
        <Route path="/order" element={<Protected><Order /></Protected>} />

        {/* Protected Profile */}
        <Route path="/profile" element={<Protected><Profile /></Protected>} />

            {/* Default → Landing */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </CartProvider>
      );
    }
