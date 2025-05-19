import React, { useState, useEffect, useCallback, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const NavBar = memo(({ isAuthenticated, userRole }) => {
  console.log("NavBar rendered"); // تتبع عدد مرات التقديم
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  const updateCountsFromLocalStorage = useCallback(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setCartCount(savedCart.length);
    setWishlistCount(savedWishlist.length);
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      const token = localStorage.getItem("token");
      if (!token || isAuthenticated === false) {
        updateCountsFromLocalStorage();
        return;
      }

      try {
        const wishlistResponse = await axios.get("http://localhost:5000/api/wishlist", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        const wishlistItems = Array.isArray(wishlistResponse.data) ? wishlistResponse.data : [];
        setWishlistCount(wishlistItems.length);
        localStorage.setItem("wishlist", JSON.stringify(wishlistItems));

        const cartResponse = await axios.get("http://localhost:5000/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        const cartItems = Array.isArray(cartResponse.data.items) ? cartResponse.data.items : [];
        setCartCount(cartItems.length);
        localStorage.setItem("cart", JSON.stringify(cartItems));
      } catch (error) {
        console.error("fetchCounts: Error:", error.response?.data || error.message);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          toast.info("Session expired, please log in again", { position: "top-right" });
          navigate("/login");
        } else if (error.response?.status === 404) {
          console.error("Cart endpoint not found. Falling back to local cart.");
          updateCountsFromLocalStorage();
        } else {
          toast.error("Failed to fetch cart/wishlist", { position: "top-right" });
        }
      }
    };

    fetchCounts();

    const handleStorageChange = () => {
      if (!isAuthenticated) {
        updateCountsFromLocalStorage();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [isAuthenticated, navigate, updateCountsFromLocalStorage]);

  return (
    <div className="bg-white py-4 shadow-md" id="main-nav-bar">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-decoration-none">
              <h2 className="text-2xl font-bold text-gray-800">
                <span className="text-gray-800 border border-gray-800 px-2 mr-1">E</span>LORA MARYA
              </h2>
            </Link>
          </div>

          {/* Navigation Links - Centered */}
          <div
            className={`flex-1 flex justify-center ${isMenuOpen ? "block" : "hidden"} lg:flex`}
          >
            <div className="flex flex-col lg:flex-row lg:space-x-6 items-center">
              <Link
                to="/"
                className="block px-4 py-2 text-gray-800 hover:text-[#d39c94] transition duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/shop"
                className="block px-4 py-2 text-gray-800 hover:text-[#d39c94] transition duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop
              </Link>
              <Link
                to="/contact"
                className="block px-4 py-2 text-gray-800 hover:text-[#d39c94] transition duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact us
              </Link>
              <Link
                to="/about"
                className="block px-4 py-2 text-gray-800 hover:text-[#d39c94] transition duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                About us
              </Link>
            </div>
          </div>

          {/* Icons and Hamburger Menu */}
          <div className="flex items-center space-x-6">
            <Link
              to="/wishlist"
              className="relative text-gray-800 hover:text-[#d39c94] transition duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#d39c94] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              to="/ShoppingCart"
              className="relative text-gray-800 hover:text-[#d39c94] transition duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#d39c94] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            {isAuthenticated === true ? (
              <Link
                to={userRole === "admin" ? "/admin" : "/profile"}
                className="text-gray-800 hover:text-[#d39c94] transition duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </Link>
            ) : (
              <Link
                to="/login"
                className="text-gray-800 hover:text-[#d39c94] transition duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
              </Link>
            )}
            <div className="lg:hidden">
              <button
                className="text-gray-800 focus:outline-none"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white py-4">
            <div className="flex flex-col items-center space-y-2">
              <Link
                to="/"
                className="block px-4 py-2 text-gray-800 hover:text-[#d39c94] transition duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/shop"
                className="block px-4 py-2 text-gray-800 hover:text-[#d39c94] transition duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop
              </Link>
              <Link
                to="/contact"
                className="block px-4 py-2 text-gray-800 hover:text-[#d39c94] transition duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact us
              </Link>
              <Link
                to="/about"
                className="block px-4 py-2 text-gray-800 hover:text-[#d39c94] transition duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                About us
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

NavBar.displayName = "NavBar";
export default NavBar;