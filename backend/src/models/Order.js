import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{
    id: { type: Number, required: true },
    title: { type: String, required: true },
    price: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    address: { type: String, required: true },
  }],
  total: { type: Number, required: true },
  status: { type: String, default: "pending" }, // pending, delivered, etc.
  paymentMethod: { type: String, default: "cash on delivery" },
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);