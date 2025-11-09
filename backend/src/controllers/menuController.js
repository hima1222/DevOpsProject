const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export const getMenu = (req, res) => {
  const beverages = [
    { id: 1, title: "Espresso", price: "2.50", img: `${FRONTEND_URL}/src/assets/signup-banner.jpg`, desc: "Bold and concentrated." },
    { id: 2, title: "Cappuccino", price: "3.50", img: `${FRONTEND_URL}/src/assets/signup-banner.jpg`, desc: "Silky milk and espresso." },
    { id: 3, title: "Vanilla Latte", price: "3.75", img: `${FRONTEND_URL}/src/assets/signup-banner.jpg`, desc: "Smooth latte with vanilla." },
  ];

  const sweets = [
    { id: 101, title: "Croissant", price: "2.00", img: `${FRONTEND_URL}/src/assets/signup-banner.jpg`, desc: "Buttery and flaky." },
    { id: 102, title: "Blueberry Muffin", price: "2.25", img: `${FRONTEND_URL}/src/assets/signup-banner.jpg`, desc: "Fresh berries inside." },
  ];

  res.json({ beverages, sweets });
};
