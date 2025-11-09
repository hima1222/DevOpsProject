import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignupPage.css";

export default function Signup() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!formData.name || !formData.email || !formData.password) {
      setMessage("Please fill all required fields.");
      return;
    }

    if (formData.password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const rawApi = import.meta.env.VITE_API_URL;
      // If env points to the docker service name (http://backend:5000) but
      // the browser is not running inside that network (hostname !== 'backend'),
      // prefer localhost so requests succeed in local dev.
      const apiBase = (rawApi && rawApi.includes("backend") && typeof window !== "undefined" && window.location.hostname !== "backend")
        ? "http://localhost:5000"
        : (rawApi || "http://localhost:5000");
      const res = await fetch(`${apiBase}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify( formData ),
      });

       // try to parse JSON, fall back to text
      const contentType = res.headers.get("content-type") || "";
      const body = contentType.includes("application/json") ? await res.json() : await res.text();

      console.log("Response status:", res.status, "body:", body);

      if (res.ok) {
        setMessage(body.message || "Signup successful ✅");
        // optionally navigate to login: navigate("/login");
      } else {
        // prefer server message if available
        const serverMsg = (body && body.message) || body || `Error ${res.status}`;
        setMessage(serverMsg);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setMessage(`Network or server error: ${err.message}`);
    }
  
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1 className="signup-title">Join CafeLove</h1>
        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <label>Confirm Password</label>
          <input 
            type="password" 
            placeholder="Confirm Your Password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
          />

          <button type="submit">Sign Up</button>
        </form>
        {message && <p>{message}</p>}
        <p className="signup-footer">Already have an account? <a href="/login">Login</a></p>
      </div>
    </div>
  );
}

