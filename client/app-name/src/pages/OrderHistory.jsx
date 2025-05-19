import React, { useState, useEffect } from "react";
import { getUserOrders } from "../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getUserOrders();
        setOrders(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error(error.response?.data?.error || "Failed to fetch orders", { position: "top-right" });
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "processing":
      case "shipped":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-opacity-30" style={{ backgroundColor: "white", filter: "blur(60px)", transform: "translate(-30%, -30%)" }}></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-opacity-30" style={{ backgroundColor: "white", filter: "blur(70px)", transform: "translate(30%, 30%)" }}></div>

      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 relative z-10 border-t-4 border-[#d39c94]">
        <h2 className="text-3xl font-bold text-center mb-8" style={{ color: "#bc7265" }}>
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#b8e0ec] text-[#bc7265] mr-2">
            🛍️
          </span>
          Order History
        </h2>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : orders.length > 0 ? (
          <ul className="space-y-6">
            {orders.map((order) => (
              <li
                key={order._id}
                className="bg-white border-2 border-[#b8e0ec] rounded-lg p-6 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold" style={{ color: "#bc7265" }}>
                    Order #{order._id}
                  </h3>
                  <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4">
                  <p
                    className="px-4 py-2 rounded-full text-sm font-medium"
                    style={{ backgroundColor: "#b8e0ec", color: "#bc7265" }}
                  >
                    💰 Total: ${order.totalAmount.toFixed(2)}
                  </p>
                  <p
                    className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusStyle(order.status)}`}
                  >
                    📌 Status: {order.status}
                  </p>
                </div>

                <div className="mt-4 text-right">
                  <button
                    onClick={() => navigate(`/order/${order._id}`)}
                    className="text-[#bc7265] hover:text-[#d39c94] text-sm font-medium transition-all duration-300 flex items-center gap-1"
                  >
                    View Details
                    <span className="transform translate-x-0.5">→</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-[#b8e0ec]">
            <p className="text-gray-600 text-lg">🚀 No previous orders.</p>
            <p className="text-sm text-gray-500 mt-2">Start shopping now to add orders!</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/shop")}
            className="w-full sm:w-auto p-3 text-white rounded-lg font-semibold hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
            style={{ background: `linear-gradient(to right, #bc7265, #d39c94)` }}
          >
            <span>🏬 Back to Shopping</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;