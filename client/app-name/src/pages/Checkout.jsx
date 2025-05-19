import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { createOrder, clearProblematicCookies, applyCoupon } from "../services/api";
import { toast } from "react-toastify";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponId, setCouponId] = useState(null);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    const loadCartData = () => {
      if (location.state?.cart) {
        setCart(location.state.cart);
        setTotal(location.state.total || calculateTotal(location.state.cart, 0));
        return;
      }

      const redirectData = localStorage.getItem("checkout_redirect");
      if (redirectData) {
        try {
          const { cart: savedCart, total: savedTotal } = JSON.parse(redirectData);
          setCart(savedCart);
          setTotal(savedTotal || calculateTotal(savedCart, 0));
          localStorage.removeItem("checkout_redirect");
        } catch (e) {
          console.error("Checkout: Failed to parse redirect data:", e);
        }
        return;
      }

      const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
      if (savedCart.length > 0) {
        setCart(savedCart);
        setTotal(calculateTotal(savedCart, 0));
      } else {
        toast.error("Your cart is empty");
        navigate("/ShoppingCart");
      }
    };

    loadCartData();
  }, [location.state, navigate]);

  const calculateTotal = (cartItems = cart, discountPercentage = discount) => {
    const subtotal = cartItems.reduce((sum, item) => {
      const product = item.product || item;
      const price = product.discountedPrice || product.price || 0;
      return sum + price * (item.quantity || 1);
    }, 0);
    const discountedTotal = subtotal - (subtotal * discountPercentage) / 100;
    return discountedTotal.toFixed(2);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = async () => {
    try {
      if (!couponCode) {
        console.log("Checkout: No coupon code entered");
        toast.error("Please enter a coupon code", { position: "top-right" });
        return;
      }
      console.log("Checkout: Applying coupon with code:", couponCode);
      clearProblematicCookies(navigate);
      const response = await applyCoupon({ code: couponCode });
      if (!response.data || !response.data.couponId || typeof response.data.discount !== "number") {
        throw new Error("Invalid coupon or response data");
      }
      setCouponId(response.data.couponId);
      setDiscount(response.data.discount);
      setTotal(calculateTotal(cart, response.data.discount));
      toast.success(`Coupon applied! ${response.data.discount}% discount`, { position: "top-right" });
    } catch (error) {
      console.error("Checkout: Coupon error:", error);
      if (error.isAuthError || error.response?.status === 401) {
        console.log("Checkout: Authentication error during coupon apply, redirecting to login");
        toast.error("Session expired, please log in again", { position: "top-right" });
        navigate("/login", { state: { redirect: "/checkout", cart, total } });
      } else if (error.response?.status === 431) {
        console.log("Checkout: 431 error during coupon apply, staying on page");
        toast.warn("Request headers too large, cookies cleared, please try again", { position: "top-right" });
        clearProblematicCookies(navigate);
      } else {
        toast.error(`Failed to apply coupon: ${error.response?.data?.error || error.message}`, { position: "top-right" });
      }
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsProcessing(true);

    try {
      const token = localStorage.getItem("token");

      const { fullName, address, city, postalCode, country, phone } = shippingInfo;
      if (!fullName || !address || !city || !postalCode || !country || !phone) {
        toast.error("Please fill in all shipping information");
        setLoading(false);
        setIsProcessing(false);
        return;
      }
      clearProblematicCookies();

      const orderItems = cart.map((item) => {
        const product = item.product || item;
        return {
          productId: product._id,
          name: product.name,
          quantity: item.quantity || 1,
          price: product.discountedPrice || product.price || 0,
          image: product.images?.[0] || "default.jpg",
        };
      });

      const sanitizedItems = orderItems.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
      }));

      const shippingAddress = {
        street: shippingInfo.address,
        city: shippingInfo.city,
        country: shippingInfo.country,
        postalCode: shippingInfo.postalCode,
      };

      const orderData = {
        items: sanitizedItems,
        shippingAddress,
        totalAmount: parseFloat(total),
        couponId: couponId || null,
      };
      console.log(orderData);
      console.log("Shipping Info:", shippingInfo);

      navigate("/payment", {
        state: {
          cart,
          total,
          shippingAddress,
        },
      });
    } catch (error) {
      console.error("Checkout error:", error);
      if (error.response?.status === 401 || error.isAuthError) {
        toast.error("Session expired. Please log in again.");
        navigate("/login", { state: { redirect: "/checkout", cart, total } });
      } else if (error.response?.status === 431 || error.redirectToLogin) {
        toast.warn("Request headers too large. Cookies cleared, please try again.");
        clearProblematicCookies();
        navigate("/login", { state: { redirect: "/checkout", cart, total } });
      } else {
        toast.error(error.response?.data?.message || "Checkout failed. Please try again.");
      }
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-[#c37c73] mb-4">Your cart is empty</h2>
          <Link
            to="/shop"
            className="inline-block px-6 py-2 bg-[#c37c73] text-white rounded hover:opacity-90"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8" style={{ color: "#bc7265" }}>
          Checkout
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4" style={{ color: "#bc7265" }}>
              Shipping Information
            </h2>
            <form onSubmit={handleCheckoutSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={shippingInfo.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bc7265]"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Address *</label>
                <input
                  type="text"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bc7265]"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">City *</label>
                <input
                  type="text"
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bc7265]"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Postal Code *</label>
                <input
                  type="text"
                  name="postalCode"
                  value={shippingInfo.postalCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bc7265]"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Country *</label>
                <input
                  type="text"
                  name="country"
                  value={shippingInfo.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bc7265]"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={shippingInfo.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bc7265]"
                  required
                />
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4" style={{ color: "#bc7265" }}>
                  Apply Coupon
                </h2>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bc7265]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-[#bc7265] text-white rounded-lg hover:bg-[#d39c94] transition-colors"
                    disabled={loading || isProcessing}
                  >
                    Apply Coupon
                  </button>
                </div>
                {discount > 0 && (
                  <p className="text-green-500 mt-2">Discount applied: {discount}%</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || isProcessing || cart.length === 0}
                className={`w-full px-6 py-3 bg-[#bc7265] text-white rounded-lg hover:bg-[#d39c94] transition-colors ${
                  loading || isProcessing || cart.length === 0
                    ? "opacity-70 cursor-not-allowed"
                    : ""
                }`}
              >
                {isProcessing
                  ? "Processing..."
                  : loading
                  ? "Loading..."
                  : "Proceed to Payment"}
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4" style={{ color: "#bc7265" }}>
              Order Summary
            </h2>

            <div className="space-y-4 mb-6">
              {cart.map((item, index) => {
                const product = item.product || item;
                const quantity = item.quantity || 1;
                const price = product.discountedPrice || product.price || 0;

                return (
                  <div
                    key={index}
                    className="flex justify-between items-center pb-4 border-b"
                  >
                    <div className="flex items-center">
                      <img
                        src={`http://localhost:5000/${
                          product.images?.[0] || "default.jpg"
                        }`}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded mr-4"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/64";
                        }}
                      />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">Qty: {quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium">${(price * quantity).toFixed(2)}</p>
                  </div>
                );
              })}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total}</span>
              </div>
              {discount > 0 && (
                <p className="text-green-500 mt-2">Discount: {discount}%</p>
              )}
            </div>

            <Link
              to="/ShoppingCart"
              className="block text-center mt-6 text-[#bc7265] hover:underline"
            >
              Edit Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;