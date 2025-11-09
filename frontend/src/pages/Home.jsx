import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/MainNavbar.jsx";
import heroImg from "../assets/signup-banner.jpg";
import logoSvg from "../assets/logo_img.png";
import coffee1 from "../assets/coffeeMenu/espresso.jpg";
import coffee2 from "../assets/coffeeMenu/cappuccino.jpg";
import coffee3 from "../assets/coffeeMenu/vanillaLatte.jpg";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="site-wrap">
      <MainNavbar />

      <header className="hero" >
        <div className="hero-overlay">
          <img src={logoSvg} alt="CafeLove logo" className="hero-logo" />
          <h1 className="hero-title">CafeLove</h1>
          <p className="hero-sub">Fresh coffee & cozy vibes</p>
        </div>
      </header>

      <main className="content">
        <section className="about">
          <h2>About Us</h2>
          <p>
            CafeLove is a neighbourhood coffee shop serving handcrafted beverages and
            small-batch pastries. We focus on quality beans, friendly service, and a
            relaxed atmosphere where people can connect.
          </p>
        </section>

        <section className="menu">
          <h2>Our Menu</h2>
          <div className="menu-grid">
            <article className="menu-item">
              <img src={coffee1} alt="Espresso" />
              <h3>Espresso</h3>
              <p>Rich and bold single-origin espresso.</p>
            </article>
            <article className="menu-item">
              <img src={coffee2} alt="Cappuccino" />
              <h3>Cappuccino</h3>
              <p>Creamy cappuccino with perfectly textured milk.</p>
            </article>
            <article className="menu-item">
              <img src={coffee3} alt="Latte" />
              <h3>Vanilla Latte</h3>
              <p>Smooth latte with a hint of vanilla.</p>
            </article>
          </div>
          <div className="menu-actions">
            <button className="view-more" onClick={() => navigate("/menu")}>View More</button>
          </div>
        </section>

        <section className="contact">
          <h2>Contact Us</h2>
          <p>123 Coffee Lane, Brewtown</p>
          <p>Email: hello@cafelove.example</p>
          <p>Phone: +1 (555) 123-4567</p>
        </section>
      </main>
    </div>
  );
}
