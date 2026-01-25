import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/MainNavbar.jsx";
import "./ProfilePage.css";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", contact: "", address: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return; // Should not happen due to Protected

    const rawApi = import.meta.env.VITE_API_URL;
    const apiBase = (rawApi && rawApi.includes("backend") && typeof window !== "undefined" && window.location.hostname !== "backend")
      ? "http://localhost:5000"
      : (rawApi || "http://localhost:5000");

    // Fetch profile
    fetch(`${apiBase}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
            return;
          }
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || `Error ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setFormData({ name: data.name, contact: data.contact || "", address: data.address || "" });
      })
      .catch((err) => {
        if (err.message !== "Unauthorized") {
          console.error("Failed to load profile:", err);
          setError(err.message || "Failed to load profile");
        }
      });

    // Fetch orders
    fetch(`${apiBase}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
            return;
          }
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || `Error ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setOrders(data))
      .catch((err) => {
        if (err.message !== "Unauthorized") {
          console.error("Failed to load orders:", err);
          setError(err.message || "Failed to load orders");
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleUpdate = async () => {
    const token = localStorage.getItem("token");
    const rawApi = import.meta.env.VITE_API_URL;
    const apiBase = (rawApi && rawApi.includes("backend") && typeof window !== "undefined" && window.location.hostname !== "backend")
      ? "http://localhost:5000"
      : (rawApi || "http://localhost:5000");

    try {
      const res = await fetch(`${apiBase}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setEditing(false);
        alert("Profile updated!");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update profile");
      }
    } catch (err) {
      alert("Error updating profile: " + err.message);
    }
  };

  return (
    <div className="profile-page">
      <MainNavbar />
      <div className="profile-container">
        <h1>My Profile</h1>

        {loading && <p>Loading profile...</p>}
        {error && <p className="error">{error}</p>}

        {profile && (
          <section className="profile-info">
            <h2>Personal Information</h2>
            {editing ? (
              <div className="profile-form">
                <label>Name:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <label>Contact:</label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                />
                <label>Address:</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
                <button onClick={handleUpdate}>Save</button>
                <button onClick={() => setEditing(false)}>Cancel</button>
              </div>
            ) : (
              <div className="profile-display">
                <p><strong>Name:</strong> {profile.name}</p>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Contact:</strong> {profile.contact || "Not provided"}</p>
                <p><strong>Address:</strong> {profile.address || "Not provided"}</p>
                <button onClick={() => setEditing(true)}>Edit Profile</button>
              </div>
            )}
          </section>
        )}

        <section className="profile-orders">
          <h2>Recent Orders</h2>
          {orders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            <div className="order-history">
              {orders.slice(0, 5).map((order) => (
                <div key={order._id} className="order-item">
                  <p><strong>Order ID:</strong> {order._id}</p>
                  <p><strong>Status:</strong> {order.status}</p>
                  <p><strong>Total:</strong> ${order.total}</p>
                  <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}