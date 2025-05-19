import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { getOrderDetails } from "../services/api";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

// Initialize SweetAlert2 with React
const MySwal = withReactContent(Swal);

// Custom styling for the toast
const toastStyle = {
  background: "#f9f1f0",
  color: "#bc7265",
  fontWeight: "bold",
  border: "2px solid #bc7265",
  borderRadius: "8px",
  padding: "10px",
  fontSize: "18px",
};

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, cartItems } = location.state || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        console.log("OrderConfirmation: Fetching order details for orderId:", orderId);

        if (!token || !orderId) {
          console.log("OrderConfirmation: Missing token or orderId, redirecting to shop");
          toast.error("Invalid order details", { position: "top-right", style: toastStyle });
          navigate("/shop");
          return;
        }

        // Fetch order details using api.jsx
        const orderResponse = await getOrderDetails(orderId);
        console.log("OrderConfirmation: Order response:", orderResponse.data);
        setOrder(orderResponse.data);
      } catch (error) {
        console.error("OrderConfirmation: Fetch order details error:", error);
        setError("Failed to load order details. Please try again.");
        if (error.isAuthError || error.message.includes("No authentication token found")) {
          console.log("OrderConfirmation: Authentication error, clearing session and redirecting to login");
          document.cookie = `token=;expires=${new Date(0).toUTCString()};path=/;SameSite=Strict;domain=${window.location.hostname}`;
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        } else if (error.response?.status === 404) {
          setError("Order not found.");
        }
      } finally {
        setLoading(false);

        // Show SweetAlert2 success message if orderId is valid
        if (orderId) {
          MySwal.fire({
            icon: "success",
            title: "Order Completed Successfully!",
            html: (
              <div>
                <p>Your purchase has been successfully completed.</p>
                <p>Thank you for shopping with us!</p>
                {orderId && <p>Order ID: {orderId}</p>}
              </div>
            ),
            confirmButtonText: "Continue",
            confirmButtonColor: "#bc7265",
            background: "#f9f1f0",
            customClass: {
              confirmButton: "px-4 py-2 rounded text-white",
              title: "text-[#bc7265] font-bold",
              htmlContainer: "text-gray-600",
            },
          }).then(() => {
            console.log("OrderConfirmation: SweetAlert2 closed");
          });
          console.log("OrderConfirmation: SweetAlert2 success triggered");
        }
      }
    };

    fetchOrderDetails();
  }, [orderId, navigate]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!order) return <div className="text-center py-10">Order not found</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8" style={{ color: "#bc7265" }}>
          Order Confirmation
        </h1>
        <div className="text-center mb-8">
          <p className="text-2xl font-extrabold text-[#bc7265] mb-4">
            🎉 Purchase Successful! 🎉
          </p>
          <p className="text-lg font-semibold">
            Thank you for your order! Your purchase has been successfully completed.
          </p>
          <p className="text-gray-600 mt-2">Order ID: {order?._id || orderId}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: "#bc7265" }}>
            Order Details
          </h2>
          {cartItems && cartItems.length > 0 ? (
            cartItems.map((item, index) => (
              <div key={index} className="flex justify-between mb-2">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No items available</p>
          )}
          <div className="flex justify-between font-semibold mt-4">
            <span>Total</span>
            <span>${order?.totalAmount?.toFixed(2) || "N/A"}</span>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: "#bc7265" }}>
            Shipping Information
          </h2>
          <p>{order?.shippingAddress?.street || "N/A"}</p>
          <p>
            {(order?.shippingAddress?.city || "") +
              (order?.shippingAddress?.postalCode ? ", " + order?.shippingAddress?.postalCode : "") ||
              "N/A"}
          </p>
          <p>{order?.shippingAddress?.country || "N/A"}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: "#bc7265" }}>
            Payment Information
          </h2>
          <p>Payment Method: {order?.paymentMethod || "N/A"}</p>
          <p>Status: {order?.status || "N/A"}</p>
          {order?.transactionId && <p>Transaction ID: {order.transactionId}</p>}
          <p>Amount: ${order?.totalAmount?.toFixed(2) || "N/A"}</p>
        </div>

        <div className="text-center">
          <Link
            to="/"
            className="inline-block px-6 py-2 bg-[#bc7265] text-white rounded hover:bg-[#d39c94]"
            aria-label="Return to home page"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;