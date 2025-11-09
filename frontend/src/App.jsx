import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/SignupPage.jsx";
import Login from "./pages/LoginPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import Home from "./pages/Home.jsx";
import MainNavbar from "./components/MainNavbar.jsx";
import "./App.css";

// Simple protected wrapper that reads token on each render
function Protected({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Public Auth Pages */}
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Home (user profile) */}
      <Route path="/home" element={<Protected><Home /></Protected>} />

      {/* Default → Landing */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
