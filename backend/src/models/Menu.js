import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  price: { type: String, required: true },
  img: { type: String, required: true },
  desc: { type: String, required: true },
  category: { type: String, required: true, enum: ["beverage", "sweet"] },
}, { timestamps: true });

export default mongoose.model("MenuItem", menuItemSchema);