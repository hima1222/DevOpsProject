import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const rawApi = import.meta.env.VITE_API_URL;
          // If env points to the docker service name (http://backend:5000) but
          // the browser is not running inside that network (hostname !== 'backend'),
          // prefer localhost so requests succeed in local dev.
          const apiBase = (rawApi && rawApi.includes("backend") && typeof window !== "undefined" && window.location.hostname !== "backend")
            ? "http://localhost:5000"
            : (rawApi || "http://localhost:5000");

      const url = `${apiBase}/api/auth/login`;
      console.log("Login request ->", url, formData);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        const text = await res.text();
        data = { message: text };
      }

      if (res.ok && data && data.token) {
        localStorage.setItem("token", data.token);
        console.log("✅ Login success, token:", data.token);
        setMessage("Login successful ✅");

        // small delay so token is stored before navigating
        setTimeout(() => {
          navigate("/home", { replace: true });
        }, 200);
      } else {
        const serverMsg = data.message || `Login failed (${res.status})`;
        setMessage(serverMsg);
      }
    } catch (err) {
      console.error("Login fetch error:", err);
      setMessage(`Network or server error: ${err.message}. Check backend at ${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/test`);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Welcome Back</h1>
        <form onSubmit={handleSubmit}>
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

          <button type="submit">Login</button>
        </form>
        {message && <p>{message}</p>}
        <p className="login-footer">
          Don’t have an account? <a href="/signup">Sign Up</a>
        </p>
      </div>
    </div>
  );
}
