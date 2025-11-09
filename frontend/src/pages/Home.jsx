import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const rawApi = import.meta.env.VITE_API_URL;
    // If env points to the docker service name (http://backend:5000) but
    // the browser is not running inside that network (hostname !== 'backend'),
    // prefer localhost so requests succeed in local dev.
    const apiBase = (rawApi && rawApi.includes("backend") && typeof window !== "undefined" && window.location.hostname !== "backend")
      ? "http://localhost:5000"
      : (rawApi || "http://localhost:5000");

    fetch(`${apiBase}/api/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || `Error ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // backend returns a message, e.g. "Welcome user@example.com to CafeLove Dashboard"
        setProfile({ message: data.message });
      })
      .catch((err) => {
        console.error("Failed to load profile:", err);
        setError(err.message || "Failed to load profile");
        // if token invalid, redirect to login
        if (err.message && /token|Invalid|expired/i.test(err.message)) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="home-container">
      <div className="home-card">
        <h1 className="home-title">Welcome to CafeLove ☕</h1>
        {error && <p className="error">{error}</p>}
        {profile ? (
          <>
            <p>{profile.message}</p>
          </>
        ) : (
          <p>Loading profile…</p>
        )}
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}
