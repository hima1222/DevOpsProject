import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import MenuItem from "./src/models/Menu.js";
import authRoutes from "./src/routes/authRoutes.js";
import menuRoutes from "./src/routes/menuRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";
import { authMiddleware } from "./src/middleware/authMiddleware.js";

dotenv.config();
connectDB();

// Seed menu items if empty
const seedMenu = async () => {
  try {
    const count = await MenuItem.countDocuments();
    if (count === 0) {
      const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
      const menuItems = [
        { id: 1, title: "Espresso", price: "2.50", img: `${FRONTEND_URL}/src/assets/coffeeMenu/espresso.jpg`, desc: "Bold and concentrated.", category: "beverage" },
        { id: 2, title: "Cappuccino", price: "3.50", img: `${FRONTEND_URL}/src/assets/coffeeMenu/cappuccino.jpg`, desc: "Silky milk and espresso.", category: "beverage" },
        { id: 3, title: "Vanilla Latte", price: "3.75", img: `${FRONTEND_URL}/src/assets/coffeeMenu/vanillaLatte.jpg`, desc: "Smooth latte with vanilla.", category: "beverage" },
        { id: 101, title: "Croissant", price: "2.00", img: `${FRONTEND_URL}/src/assets/signup-banner.jpg`, desc: "Buttery and flaky.", category: "sweet" },
        { id: 102, title: "Blueberry Muffin", price: "2.25", img: `${FRONTEND_URL}/src/assets/signup-banner.jpg`, desc: "Fresh berries inside.", category: "sweet" },
      ];
      await MenuItem.insertMany(menuItems);
      console.log("Menu seeded successfully");
    }
  } catch (err) {
    console.error("Error seeding menu:", err);
  }
};

seedMenu();

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/profile", profileRoutes);

// Example protected route (generic message — don't expose user email/name)
app.get("/api/dashboard", authMiddleware, (req, res) => {
  res.json({ message: "Welcome to CafeLove Dashboard" });
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Server is running!" });
});


app.use((req, res, next) => {
  console.log("Request URL:", req.url);
  next();
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on http://0.0.0.0:${PORT}`));

