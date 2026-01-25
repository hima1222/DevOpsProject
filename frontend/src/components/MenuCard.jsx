import React from "react";
import PropTypes from "prop-types";
import { useCart } from "../contexts/CartContext.jsx";
import "./MenuCard.css";

export default function MenuCard({ title, price, img, desc, id }) {
  const { addToCart } = useCart();

  const handleOrder = () => {
    addToCart({ id, title, price, img, desc });
    alert(`${title} added to cart!`);
  };

  return (
    <article className="menu-card">
      <div className="menu-card-media">
        <img src={img} alt={title} />
      </div>
      <div className="menu-card-body">
        <h3 className="menu-card-title">{title}</h3>
        <p className="menu-card-desc">{desc}</p>
        <div className="menu-card-foot">
          <span className="menu-card-price">{price}</span>
          <button className="menu-card-btn" onClick={handleOrder}>Order</button>
        </div>
      </div>
    </article>
  );
}

MenuCard.propTypes = {
  title: PropTypes.string.isRequired,
  price: PropTypes.string,
  img: PropTypes.string,
  desc: PropTypes.string,
  id: PropTypes.number.isRequired,
};

MenuCard.defaultProps = {
  price: "",
  img: "",
  desc: "",
};
