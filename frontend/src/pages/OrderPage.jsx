import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/MainNavbar.jsx";
import { useCart } from "../contexts/CartContext.jsx";
import "./OrderPage.css";

export default function OrderPage() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [globalAddress, setGlobalAddress] = useState("");
  const [itemAddresses, setItemAddresses] = useState({});

  useEffect(() => {
    const rawApi = import.meta.env.VITE_API_URL;
    const apiBase = (rawApi && rawApi.includes("backend") && typeof window !== "undefined" && window.location.hostname !== "backend")
      ? "http://localhost:5000"
      : (rawApi || "http://localhost:5000");

    const token = localStorage.getItem("token");
    if (!token) return; // Should not happen due to Protected

    // Fetch order history
    fetch(`${apiBase}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
            return;
          }
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || `Error ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setOrders(data))
      .catch((err) => {
        if (err.message !== "Unauthorized") {
          console.error("Failed to load orders:", err);
          setError(err.message || "Failed to load orders");
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleAddressChange = (id, address) => {
    setItemAddresses((prev) => ({ ...prev, [id]: address }));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + parseFloat(item.price.replace("$", "")) * item.quantity, 0);
  };

  const handlePlaceOrder = async () => {
    const token = localStorage.getItem("token");
    const rawApi = import.meta.env.VITE_API_URL;
    const apiBase = (rawApi && rawApi.includes("backend") && typeof window !== "undefined" && window.location.hostname !== "backend")
      ? "http://localhost:5000"
      : (rawApi || "http://localhost:5000");

    const items = cart.map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      address: itemAddresses[item.id] || globalAddress,
    }));

    try {
      const res = await fetch(`${apiBase}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items, total: calculateTotal() }),
      });

      if (res.ok) {
        alert("Order placed successfully!");
        clearCart();
        // Refresh orders
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to place order");
      }
    } catch (err) {
      alert("Error placing order: " + err.message);
    }
  };

  return (
    <div className="order-page">
      <MainNavbar />
      <div className="order-container">
        <h1>My Orders</h1>

        {loading && <p>Loading orders...</p>}
        {error && <p className="error">{error}</p>}

        {/* Current Cart */}
        <section className="cart-section">
          <h2>Current Order (Cart)</h2>
          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              <div className="global-address">
                <label>Global Address (optional):</label>
                <input
                  type="text"
                  value={globalAddress}
                  onChange={(e) => setGlobalAddress(e.target.value)}
                  placeholder="Enter address for all items"
                />
              </div>
              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <img src={item.img} alt={item.title} />
                    <div className="cart-item-details">
                      <h3>{item.title}</h3>
                      <p>{item.desc}</p>
                      <p>Price: {item.price}</p>
                      <label>Quantity:</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                      />
                      <label>Address:</label>
                      <input
                        type="text"
                        value={itemAddresses[item.id] || ""}
                        onChange={(e) => handleAddressChange(item.id, e.target.value)}
                        placeholder="Enter specific address"
                      />
                      <button onClick={() => removeFromCart(item.id)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="cart-total">
                <strong>Total: ${calculateTotal().toFixed(2)}</strong>
              </div>
              <button className="place-order-btn" onClick={handlePlaceOrder}>
                Place Order (Cash on Delivery)
              </button>
            </>
          )}
        </section>

        {/* Order History */}
        <section className="history-section">
          <h2>Order History</h2>
          {orders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            <div className="order-history">
              {orders.map((order) => (
                <div key={order._id} className="order-item">
                  <p><strong>Order ID:</strong> {order._id}</p>
                  <p><strong>Status:</strong> {order.status}</p>
                  <p><strong>Total:</strong> ${order.total}</p>
                  <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                  <div className="order-items">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="order-item-detail">
                        <p>{item.title} x{item.quantity} - {item.price} - Address: {item.address}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}