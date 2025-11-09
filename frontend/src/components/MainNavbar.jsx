import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const MainNavbar = () => {
  return (
    <nav className="navbar main-navbar">
      <div className="logo">CafeLove</div>
      <ul className="nav-links">
        <li><Link to="/home">Home</Link></li>
        <li><Link to="/myorders">My Orders</Link></li>
        <li><Link to="/menu">Menu</Link></li>
        <li><Link to="/profile">Profile</Link></li>
      </ul>
    </nav>
  );
};

export default MainNavbar;
