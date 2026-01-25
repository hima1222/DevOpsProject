import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/MainNavbar.jsx";
import heroImg from "../assets/signup-banner.jpg";
import logoSvg from "../assets/logo_img.png";
import coffee1 from "../assets/coffeeMenu/espresso.jpg";
import coffee2 from "../assets/coffeeMenu/cappuccino.jpg";
import coffee3 from "../assets/coffeeMenu/vanillaLatte.jpg";
import sweet1 from "../assets/snackMenu/chocoChipCookies.jpg";
import sweet2 from "../assets/snackMenu/croissants.jpg";
import sweet3 from "../assets/snackMenu/blueberryMuffins.jpg";
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
            CafeLove is a cozy neighbourhood coffee shop where great conversations begin over great coffee. 
            We serve a wide variety of handcrafted beverages, 
            from rich espresso classics to smooth specialty brews, 
            all made with carefully selected quality beans.
            <br></br> <br></br>
            Alongside our coffee, we offer a selection of freshly prepared snacks and small-batch pastries, 
            baked with care and full of flavour—perfect for a quick bite or a slow, 
            relaxed treat.
            <br></br> <br></br>
            At CafeLove, we believe coffee is more than just a drink. 
            It’s a reason to pause, connect, and feel at home. 
            With friendly service and a warm, relaxed atmosphere, our space is designed for friends to meet, 
            ideas to flow, and moments to be enjoyed—one cup at a time.
          </p>
        </section>

        <section className="menu">
          <h2>Our Menu</h2>
          <div className="menu-category">
            <h3>Beverages</h3>
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
              <button className="view-more" onClick={() => navigate("/menu#beverages")}>View More Beverages</button>
            </div>
          </div>
          <div className="menu-category">
            <h3>Sweets</h3>
            <div className="menu-grid">
              <article className="menu-item">
                <img src={sweet1} alt="Chocolate Chip Cookie" />
                <h3>Chocolate Chip Cookie</h3>
                <p>Classic treat with chocolate chips.</p>
              </article>
              <article className="menu-item">
                <img src={sweet2} alt="Croissant" />
                <h3>Croissant</h3>
                <p>Buttery and flaky.</p>
              </article>
              <article className="menu-item">
                <img src={sweet3} alt="Blueberry Muffin" />
                <h3>Blueberry Muffin</h3>
                <p>Fresh berries inside.</p>
              </article>
            </div>
            <div className="menu-actions">
              <button className="view-more" onClick={() => navigate("/menu#sweets")}>View More Sweets</button>
            </div>
          </div>
        </section>

        <section className="contact">
          <h2>Contact Us</h2>
          <div className="contact-details">
            <div className="contact-item">
              <span>📍</span>
              <p>123 Coffee Lane, Brewtown</p>
            </div>
            <div className="contact-item">
              <span>📧</span>
              <a href="mailto:hello@cafelove.example">hello@cafelove.example</a>
            </div>
            <div className="contact-item">
              <span>📞</span>
              <a href="tel:+15551234567">+1 (555) 123-4567</a>
            </div>
            <div className="contact-item">
              <span>📷</span>
              <a href="https://instagram.com/cafelove" target="_blank" rel="noopener noreferrer">Follow us on Instagram</a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
