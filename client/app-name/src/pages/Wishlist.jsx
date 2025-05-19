import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Utility to clear problematic cookies
const clearProblematicCookies = () => {
  const cookies = document.cookie.split("; ");
  let totalSize = 0;
  const problematicCookies = [
    "sdZnT8w4fAh7Y9OoBKtQbmpHG6NHZI",
    "sdZnT8w4fAh7Y9OoBKtQbmpHG6NHZI+LHCCzYAAAA==",
    "__stripe_mid",
    "__stripe_sid",
  ];

  cookies.forEach((c) => {
    totalSize += c.length;
    const cookieName = c.split("=")[0].trim();
    if (problematicCookies.some((prefix) => cookieName.includes(prefix)) || totalSize > 2000) {
      console.warn(`Wishlist: Clearing cookie: ${cookieName} (size: ${c.length} bytes)`);
      document.cookie = `${cookieName}=;expires=${new Date(0).toUTCString()};path=/;SameSite=Strict;domain=${window.location.hostname}`;
    }
  });

  if (totalSize > 2000) {
    console.warn(`Wishlist: Total cookie size ${totalSize} bytes exceeds 2000, clearing all cookies`);
    cookies.forEach((c) => {
      const cookieName = c.split("=")[0].trim();
      document.cookie = `${cookieName}=;expires=${new Date(0).toUTCString()};path=/;SameSite=Strict;domain=${window.location.hostname}`;
    });
    toast.warn("Large cookies detected and cleared. Please try again.", {
      position: "top-right",
      autoClose: 5000,
    });
  }

  const finalCookies = document.cookie.split("; ");
  const finalSize = finalCookies.reduce((sum, c) => sum + c.length, 0);
  console.log(`Wishlist: After clearing, total cookie size: ${finalSize} bytes`, { cookies: finalCookies });
};

// Fallback image URL
const FALLBACK_IMAGE = "https://placehold.co/150x150";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("cart")) || []);
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("token");

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        console.log("Wishlist: Fetching wishlist...");
        setLoading(true);
        let localWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        if (isAuthenticated) {
          const response = await axios.get("http://localhost:5000/api/wishlist", {
            withCredentials: true,
          });
          console.log("Wishlist: Fetch response:", response.data);
          const serverWishlist = response.data?.products || response.data || [];
          localWishlist = serverWishlist.map(item => item.product || item); // Normalize to product object
          setWishlist(serverWishlist);
          localStorage.setItem("wishlist", JSON.stringify(localWishlist));
        } else {
          setWishlist(localWishlist); // Use local data if not authenticated
        }
      } catch (err) {
        console.error("Wishlist: Error fetching wishlist:", err);
        if (err.response?.status === 401 && isAuthenticated) {
          console.log("Wishlist: Authentication error, redirecting to login");
          toast.error("Session expired. Please log in again.", { position: "top-right" });
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login", { state: { redirect: "/wishlist" } });
        } else if (err.response?.status === 401 && !isAuthenticated) {
          console.log("Wishlist: Unauthenticated, using local wishlist");
          const localWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
          setWishlist(localWishlist);
        } else if (err.response?.status === 431) {
          console.warn("Wishlist: 431 error, clearing cookies...");
          clearProblematicCookies();
          setError("Request headers too large. Cookies cleared, please try again.");
        } else {
          setError("Failed to load wishlist. Please try again.");
          const localWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
          setWishlist(localWishlist); // Fallback to local data on other errors
        }
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [navigate, isAuthenticated]);

  const handleRemove = async (productId) => {
    try {
      console.log("Wishlist: Removing product from wishlist:", productId);
      clearProblematicCookies();
      if (isAuthenticated) {
        await axios.delete(`http://localhost:5000/api/wishlist/${productId}`, {
          withCredentials: true,
        });
      }
      const updatedWishlist = wishlist.filter((item) => item._id !== productId);
      setWishlist(updatedWishlist);
      localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
      toast.success("Item removed from wishlist.", { position: "top-right" });
    } catch (err) {
      console.error("Wishlist: Error removing item:", err);
      if (err.response?.status === 401 && isAuthenticated) {
        console.log("Wishlist: Authentication error during remove, redirecting to login");
        toast.error("Session expired. Please log in again.", { position: "top-right" });
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { state: { redirect: "/wishlist" } });
      } else if (err.response?.status === 431) {
        console.warn("Wishlist: 431 error during remove, clearing cookies...");
        clearProblematicCookies();
        setError("Request headers too large. Cookies cleared, please try again.");
      } else {
        setError("Failed to remove item from wishlist.");
      }
    }
  };

  const handleAddToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      const newItem = {
        _id: product._id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: product.name || "Unnamed Product",
        price: product.price || 0,
        images: product.images || [],
        quantity: quantity,
        stock: product.stock || 0,
        discountApplied: product.discountApplied || false,
        discountedPrice: product.discountedPrice || product.price || 0,
      };
      let currentCart = cart || JSON.parse(localStorage.getItem("cart")) || [];
      const existingItemIndex = currentCart.findIndex((item) => item._id === newItem._id);

      if (existingItemIndex !== -1) {
        currentCart[existingItemIndex].quantity += quantity;
      } else {
        currentCart.push(newItem);
      }

      setCart([...currentCart]);
      localStorage.setItem("cart", JSON.stringify(currentCart));
      const updatedWishlist = wishlist.filter((w) => w._id !== newItem._id);
      setWishlist(updatedWishlist);
      localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
      toast.success("Item added to cart locally.", { position: "top-right" });
      navigate("/ShoppingCart", {
        state: {
          cart: currentCart,
          total: currentCart
            .reduce(
              (sum, item) =>
                sum + (item.discountApplied ? item.discountedPrice : item.price) * item.quantity,
              0
            )
            .toFixed(2),
        },
      });
      return;
    }

    setIsAddingToCart(true);
    console.log("Wishlist: Adding product to cart, productId:", product._id, "quantity:", quantity);
    try {
      if (!product || !product._id || (product.inStock === false && product.stock <= 0)) {
        console.log("Wishlist: Product out of stock or unavailable");
        toast.error("This product is currently unavailable", { position: "top-right" });
        return;
      }

      if (product.stock < quantity) {
        console.log("Wishlist: Insufficient stock");
        toast.error(`Only ${product.stock} items in stock`, { position: "top-right" });
        return;
      }

      let currentCart = cart || JSON.parse(localStorage.getItem("cart")) || [];
      const existingItemIndex = currentCart.findIndex((item) => item._id === product._id);

      if (existingItemIndex !== -1) {
        currentCart[existingItemIndex].quantity += quantity;
      } else {
        currentCart.push({
          _id: product._id,
          name: product.name,
          price: product.discountApplied ? product.discountedPrice : product.price,
          images: product.images || [],
          quantity: quantity,
          stock: product.stock,
          discountApplied: product.discountApplied,
          discountedPrice: product.discountedPrice || product.price,
        });
      }

      console.log("Wishlist: Updating cart:", currentCart);
      setCart(currentCart);
      localStorage.setItem("cart", JSON.stringify(currentCart));

      await axios.delete(`http://localhost:5000/api/wishlist/${product._id}`, {
        withCredentials: true,
      });
      const updatedWishlist = wishlist.filter((w) => w._id !== product._id);
      setWishlist(updatedWishlist);
      localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));

      console.log("Wishlist: Syncing with backend, payload:", { productId: product._id, quantity });
      await axios.post(
        "http://localhost:5000/api/cart/add",
        { productId: product._id, quantity },
        { withCredentials: true }
      );
      console.log("Wishlist: Backend sync successful");

      toast.success("Item moved to cart!", { position: "top-right" });
      navigate("/ShoppingCart", {
        state: {
          cart: currentCart,
          total: currentCart
            .reduce(
              (sum, item) =>
                sum + (item.discountApplied ? item.discountedPrice : item.price) * item.quantity,
              0
            )
            .toFixed(2),
        },
      });
    } catch (err) {
      console.error("Wishlist: Error adding to cart:", err);
      if (err.response?.status === 401 && isAuthenticated) {
        console.log("Wishlist: Authentication error during add to cart, redirecting to login");
        toast.error("Session expired. Please log in again.", { position: "top-right" });
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { state: { redirect: "/wishlist" } });
      } else if (err.response?.status === 431) {
        console.warn("Wishlist: 431 error during add to cart, clearing cookies...");
        clearProblematicCookies();
        setError("Request headers too large. Cookies cleared, please try again.");
      } else if (err.response?.status === 400) {
        console.log("Wishlist: Bad request, possibly duplicate item in cart");
        setError("Failed to sync with server. Item added locally. Please check your cart.");
      } else if (err.response?.status === 404) {
        console.log("Wishlist: 404 error, cart endpoint not found");
        setError("Cart service unavailable. Please check the endpoint or contact support.");
      } else {
        setError(`Failed to add item to cart: ${err.response?.data?.error || err.message}`);
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white" style={{ minHeight: "100vh" }}>
      <div className="py-8 text-center" style={{ backgroundColor: "#d39c94" }}>
        <h1 className="text-3xl font-bold text-white">WISHLIST</h1>
        <div className="flex justify-center gap-2 mt-2">
          <span className="text-white opacity-80">Home</span>
          <span className="text-white opacity-80">-</span>
          <span className="text-white font-medium">Wishlist</span>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-3/4">
            {wishlist.length === 0 ? (
              <div
                className="bg-white p-6 rounded-lg shadow-md text-center border"
                style={{ borderColor: "#ecf4fc" }}
              >
                <p className="text-lg" style={{ color: "#c37c73" }}>
                  Your wishlist is empty
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {wishlist.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white shadow-md rounded-lg p-4 flex flex-col md:flex-row items-center border"
                    style={{ borderColor: "#ecf4fc" }}
                  >
                    <img
                      src={item.images?.[0] ? `http://localhost:5000/${item.images[0]}` : FALLBACK_IMAGE}
                      alt={item.name || "Product"}
                      className="w-24 h-24 object-cover rounded-lg mr-4 mb-3 md:mb-0"
                      onError={(e) => {
                        if (e.target.src !== FALLBACK_IMAGE) {
                          e.target.src = FALLBACK_IMAGE;
                        }
                      }}
                    />
                    <div className="flex-grow">
                      <h5 className="text-lg font-semibold" style={{ color: "#c37c73" }}>
                        {item.name || "Unnamed Product"}
                      </h5>
                      <p className="font-medium" style={{ color: "#d39c94" }}>
                        ${item.discountApplied
                          ? (item.discountedPrice || 0).toFixed(2)
                          : (item.price || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-3 md:mt-0">
                      <button
                        onClick={() => handleAddToCart(item, 1)}
                        className="w-full px-4 py-2 bg-[#ecf4fc] text-[#bc7265] rounded-lg hover:bg-[#b8e0ec] transition duration-300 font-medium disabled:bg-gray-400"
                        disabled={isAddingToCart}
                      >
                        {isAddingToCart ? "Adding..." : "Add to Cart"}
                      </button>
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="w-10 h-10 flex items-center justify-center rounded-full text-white hover:opacity-90 transition"
                        style={{ backgroundColor: "#d39c94" }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="w-full md:w-1/4">
            <div
              className="bg-white shadow-md rounded-lg overflow-hidden border"
              style={{ borderColor: "#ecf4fc" }}
            >
              <div className="p-4 border-b" style={{ backgroundColor: "#d39c94" }}>
                <h2 className="text-xl font-bold text-white">Wishlist Summary</h2>
              </div>
              <div className="p-4">
                <p style={{ color: "#c37c73" }}>
                  You can add items to the cart to proceed with your purchase.
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="font-medium" style={{ color: "#c37c73" }}>
                    Total Items: {wishlist.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6">
        <button
          className="w-12 h-12 flex items-center justify-center text-white p-3 rounded-full hover:opacity-90 transition shadow-lg"
          style={{ backgroundColor: "#c37c73" }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ↑
        </button>
      </div>
    </div>
  );
};

export default Wishlist;