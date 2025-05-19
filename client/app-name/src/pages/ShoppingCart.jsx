import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

const ShoppingCart = () => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const isInitialLoad = useRef(true);

  const clearSpecificCookies = useCallback(() => {
    const cookies = document.cookie.split("; ");
    let totalSize = 0;
    const problematicCookies = [
      "sdZnT8w4fAh7Y9OoBKtQbmpHG6NHZI",
      "__stripe_mid",
      "__stripe_sid",
    ];

    cookies.forEach((c) => {
      totalSize += c.length;
      const cookieName = c.split("=")[0].trim();
      if (problematicCookies.some((prefix) => cookieName.startsWith(prefix))) {
        console.warn(`Clearing oversized cookie: ${cookieName}`);
        document.cookie = `${cookieName}=;expires=${new Date(0).toUTCString()};path=/`;
      }
    });

    if (totalSize > 4000) {
      console.warn("Total cookie size too large, cleared problematic cookies.");
      toast.error(
        "Request headers too large, cookies cleared. Please log in again.",
        { position: "top-right" }
      );
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return true;
    }
    return false;
  }, []);

  const checkToken = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    if (token.length > 1500) {
      console.warn("Token too large, clearing...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.error("Session token too large, please log in again.", {
        position: "top-right",
      });
      return null;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return null;
      }
      return token;
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return null;
    }
  }, []);

  const safeProductData = useCallback((product) => {
    if (!product) {
      return {
        _id: "unknown_" + Math.random().toString(36).substr(2, 9),
        name: "Unknown Product",
        price: 0,
        images: [],
        stock: 0,
        discountApplied: false,
        discountedPrice: 0,
      };
    }
    return {
      _id: product._id || "unknown_" + Math.random().toString(36).substr(2, 9),
      name: product.name || "Unknown Product",
      price: product.price || 0,
      images: Array.isArray(product.images) ? product.images : [],
      stock: product.stock || 0,
      discountApplied: product.discountApplied || false,
      discountedPrice: product.discountedPrice || product.price || 0,
    };
  }, []);

  const updateLocalStorage = useCallback((items) => {
    localStorage.setItem(
      "cart",
      JSON.stringify(
        items.map((item) => ({
          _id: item.product._id,
          name: item.product.name,
          price: item.product.price,
          images: item.product.images,
          stock: item.product.stock,
          discountApplied: item.product.discountApplied,
          discountedPrice: item.product.discountedPrice,
          quantity: item.quantity,
        }))
      )
    );
  }, []);

  useEffect(() => {
    if (!isInitialLoad.current) return;

    const fetchCart = async () => {
      try {
        setLoading(true);
        const token = checkToken();
        let items = [];

        clearSpecificCookies();

        let localCart = JSON.parse(localStorage.getItem("cart")) || [];

        if (!token) {
          items = localCart.map((item) => ({
            product: safeProductData(item),
            quantity: item.quantity || 1,
          }));
        } else {
          try {
            const response = await axios.get("http://localhost:5000/api/cart", {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
            });

            console.log("API Response:", response.data);

            items = (response.data?.items || response.data || []).map((item) => ({
              product: safeProductData(item.product || item),
              quantity: item.quantity || 1,
            }));

            const localCartMap = new Map(localCart.map((item) => [item._id, item]));
            const mergedItems = [...items];

            localCart.forEach((localItem) => {
              if (localItem._id.startsWith("local_")) return;
              if (!localCartMap.has(localItem._id)) {
                mergedItems.push({
                  product: safeProductData(localItem),
                  quantity: localItem.quantity || 1,
                });
              }
            });

            items = mergedItems;

            const localCartToSync = localCart.filter((item) => !item._id.startsWith("local_"));
            if (localCartToSync.length > 0) {
              await axios.post(
                "http://localhost:5000/api/cart/sync",
                localCartToSync,
                { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
              );
            }
          } catch (error) {
            if (error.response?.status === 431) {
              clearSpecificCookies();
              items = localCart.map((item) => ({
                product: safeProductData(item),
                quantity: item.quantity || 1,
              }));
              setError("Failed to sync cart with server, using local cart.");
              toast.warn("Unable to sync cart, please log in again.", {
                position: "top-right",
              });
            } else {
              throw error;
            }
          }
        }

        setCart({ items });
        updateLocalStorage(items);
      } catch (error) {
        console.error("Failed to fetch cart:", error);
        setError(error.message || "Failed to load cart. Please try again.");
        if (error.response?.status === 401 || error.response?.status === 431) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        }
      } finally {
        setLoading(false);
        isInitialLoad.current = false;
      }
    };

    fetchCart();
  }, [checkToken, safeProductData, clearSpecificCookies, navigate, updateLocalStorage]);

  const handleQuantityChange = async (productId, action) => {
    try {
      const token = checkToken();
      const item = cart.items.find((item) => item.product._id === productId);
      if (!item) return;

      let newQuantity = item.quantity || 1;
      if (action === "increase") {
        if (newQuantity >= (item.product.stock || 999)) {
          toast.error(`Maximum ${item.product.stock} items available`);
          return;
        }
        newQuantity += 1;
      } else if (action === "decrease" && newQuantity > 1) {
        newQuantity -= 1;
      } else {
        return;
      }

      clearSpecificCookies();

      const updatedItems = cart.items.map((item) =>
        item.product._id === productId ? { ...item, quantity: newQuantity } : item
      );

      setCart({ items: updatedItems });
      updateLocalStorage(updatedItems);

      if (token) {
        try {
          await axios.patch(
            "http://localhost:5000/api/cart/update",
            { productId, quantity: newQuantity },
            { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
          );
        } catch (error) {
          if (error.response?.status === 431) {
            clearSpecificCookies();
            toast.warn("Unable to sync cart, changes saved locally.", {
              position: "top-right",
            });
            return;
          }
          throw error;
        }
      }

      toast.success("Cart updated successfully!");
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast.error(error.message || "Failed to update quantity");
      if (error.response?.status === 401 || error.response?.status === 431) {
        navigate("/login");
      }
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const token = checkToken();

      clearSpecificCookies();

      const updatedItems = cart.items.filter((item) => item.product._id !== productId);

      setCart({ items: updatedItems });
      updateLocalStorage(updatedItems);

      if (token) {
        try {
          await axios.delete(`http://localhost:5000/api/cart/remove/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });
        } catch (error) {
          if (error.response?.status === 431) {
            clearSpecificCookies();
            toast.warn("Unable to sync cart, item removed locally.", {
              position: "top-right",
            });
            return;
          }
          throw error;
        }
      }

      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error(error.message || "Failed to remove item");
      if (error.response?.status === 401 || error.response?.status === 431) {
        navigate("/login");
      }
    }
  };

  const handleClearCart = async () => {
    try {
      const token = checkToken();

      clearSpecificCookies();

      setCart({ items: [] });
      updateLocalStorage([]);

      if (token) {
        try {
          await axios.delete("http://localhost:5000/api/cart/clear", {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });
        } catch (error) {
          if (error.response?.status === 431) {
            clearSpecificCookies();
            toast.warn("Unable to sync cart, cart cleared locally.", {
              position: "top-right",
            });
            return;
          }
          throw error;
        }
      }

      toast.success("Cart cleared successfully");
    } catch (error) {
      console.error("Failed to clear cart:", error);
      toast.error(error.message || "Failed to clear cart");
      if (error.response?.status === 401 || error.response?.status === 431) {
        navigate("/login");
      }
    }
  };

  const calculateTotal = useMemo(() => {
    return cart.items
      .reduce((total, item) => {
        const price = item.product.discountApplied
          ? item.product.discountedPrice
          : item.product.price;
        return total + price * (item.quantity || 1);
      }, 0)
      .toFixed(2);
  }, [cart.items]);

  const handleCheckout = useCallback(() => {
    if (cart.items.length === 0) return;
    if (!checkToken()) {
      navigate("/checkout");
      return;
    }

    if (clearSpecificCookies()) {
      setTimeout(() => {
        navigate("/login?redirect=/checkout");
      }, 1000);
      return;
    }

    navigate("/checkout");
  }, [cart.items, checkToken, navigate, clearSpecificCookies]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="py-10 text-center bg-[#d39c94] shadow-md relative overflow-hidden">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-2">SHOPPING CART</h1>
          <div className="flex justify-center gap-2 text-sm">
            <span className="text-white opacity-80 hover:opacity-100 cursor-pointer">Home</span>
            <span className="text-white opacity-80">/</span>
            <span className="text-white font-medium">Shopping Cart</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            {cart.items.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
                <div className="mb-4 text-[#c37c73] opacity-80">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <p className="text-xl font-medium text-gray-600 mb-6">Your cart is empty</p>
                <Link
                  to="/shop"
                  className="inline-block px-8 py-3 bg-[#c37c73] text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg shadow-sm hidden md:flex items-center text-gray-500 font-medium">
                  <div className="w-1/2 pl-24">Product</div>
                  <div className="w-1/6 text-center">Price</div>
                  <div className="w-1/6 text-center">Quantity</div>
                  <div className="w-1/6 text-center">Total</div>
                </div>

                {cart.items.map((item) => (
                  <div
                    key={item.product._id}
                    className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-[#d39c94] hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="flex flex-col md:flex-row items-center">
                      <div className="flex md:w-1/2 items-center mb-4 md:mb-0">
                        <div className="relative">
                          <img
                            src={`http://localhost:5000/${item.product.images[0] || "default.jpg"}`}
                            alt={item.product.name}
                            className="w-20 h-20 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/96";
                            }}
                          />
                          <button
                            onClick={() => handleRemoveItem(item.product._id)}
                            className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-[#c37c73] text-white rounded-full hover:bg-[#b36c63] transition-colors duration-200"
                          >
                            ×
                          </button>
                        </div>
                        <div className="ml-4">
                          <h5 className="text-lg font-semibold text-[#c37c73]">
                            {item.product.name}
                          </h5>
                          <p className="text-sm text-gray-500">
                            {item.product.category || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="md:w-1/6 text-center">
                        <p className="text-[#d39c94] font-medium">
                          ${(item.product.discountApplied
                            ? item.product.discountedPrice
                            : item.product.price
                          ).toFixed(2)}
                        </p>
                        {item.product.discountApplied && item.product.price && (
                          <p className="text-gray-400 line-through text-sm">
                            ${item.price.toFixed(2)}
                          </p>
                        )}
                      </div>

                      <div className="md:w-1/6 flex justify-center my-4 md:my-0">
                        <div className="flex items-center border rounded-lg overflow-hidden shadow-sm">
                          <button
                            onClick={() => handleQuantityChange(item.product._id, "decrease")}
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                            disabled={(item.quantity || 1) <= 1}
                          >
                            −
                          </button>
                          <span className="w-10 text-center py-1">{item.quantity || 1}</span>
                          <button
                            onClick={() => handleQuantityChange(item.product._id, "increase")}
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                            disabled={(item.quantity || 1) >= (item.product.stock || 999)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="md:w-1/6 text-center">
                        <p className="font-semibold text-[#c37c73]">
                          ${((item.product.discountApplied
                            ? item.product.discountedPrice
                            : item.product.price) * (item.quantity || 1)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm sticky top-8">
              <div className="p-5 bg-[#d39c94] rounded-t-lg">
                <h2 className="text-xl font-bold text-white">Cart Summary</h2>
              </div>
              <div className="p-6">
                <div className="mb-6 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium text-[#c37c73]">${calculateTotal}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium text-[#c37c73]">$0.00</span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold text-gray-700">Total:</span>
                    <span className="font-bold text-xl text-[#c37c73]">${calculateTotal}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleCheckout}
                    className={`w-full py-3 bg-[#c37c73] text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 ${
                      cart.items.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={cart.items.length === 0}
                  >
                    Proceed to Checkout
                  </button>
                  <button
                    onClick={handleClearCart}
                    className={`w-full py-3 bg-gray-100 text-[#c37c73] rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 ${
                      cart.items.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={cart.items.length === 0}
                  >
                    Clear Cart
                  </button>
                  <Link
                    to="/shop"
                    className="block w-full text-center py-3 text-[#d39c94] hover:text-[#c37c73] transition-colors duration-200"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6">
        <button
          className="w-12 h-12 flex items-center justify-center bg-[#c37c73] text-white rounded-full shadow-lg hover:bg-[#b36c63] transition-colors duration-200"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ↑
        </button>
      </div>
    </div>
  );
};

export default ShoppingCart;