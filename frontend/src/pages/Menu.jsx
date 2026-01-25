import React, { useEffect, useState } from "react";
import MainNavbar from "../components/MainNavbar.jsx";
import MenuCard from "../components/MenuCard.jsx";
import sampleImg from "../assets/signup-banner.jpg";
import "./Menu.css";

export default function Menu() {
  const [beverages, setBeverages] = useState([]);
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const rawApi = import.meta.env.VITE_API_URL;
    const apiBase = (rawApi && rawApi.includes("backend") && typeof window !== "undefined" && window.location.hostname !== "backend")
      ? "http://localhost:5000"
      : (rawApi || "http://localhost:5000");

    fetch(`${apiBase}/api/menu`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || `Error ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setBeverages(data.beverages || []);
        setSweets(data.sweets || []);
      })
      .catch((err) => {
        console.error("Failed to load menu:", err);
        setError(err.message || "Failed to load menu");
      })
      .finally(() => setLoading(false));

    // Scroll to hash if present
    if (window.location.hash) {
      const element = document.getElementById(window.location.hash.substring(1));
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="menu-page">
      <MainNavbar />
      <div className="menu-hero">
        <h1 className="menu-title">Our Menu</h1>
        <div className="menu-title-reflect">Our Menu</div>
      </div>

      <main className="menu-content">
        {loading && <p>Loading menu…</p>}
        {error && <p className="error">{error}</p>}

        <section className="menu-section" id="beverages">
          <h2>Beverages</h2>
          <div className="menu-grid">
            {(beverages.length ? beverages : [
              { title: "Espresso", price: "$2.50", img: sampleImg, desc: "Bold and concentrated." },
            ]).map((it) => (
              <MenuCard key={it.id || it.title} {...it} />
            ))}
          </div>
        </section>

        <section className="menu-section" id="sweets">
          <h2>Sweets</h2>
          <div className="menu-grid">
            {(sweets.length ? sweets : [
              { title: "Croissant", price: "$2.00", img: sampleImg, desc: "Buttery and flaky." },
            ]).map((it) => (
              <MenuCard key={it.id || it.title} {...it} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
