import React from "react";
import PropTypes from "prop-types";
import "./MenuCard.css";

export default function MenuCard({ title, price, img, desc }) {
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
          <button className="menu-card-btn">Order</button>
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
};

MenuCard.defaultProps = {
  price: "",
  img: "",
  desc: "",
};
