import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import { authMiddleware } from "./src/middleware/authMiddleware.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);

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

