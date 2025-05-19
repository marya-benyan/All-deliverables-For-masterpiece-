import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// SVG Icons as Components
const HeartIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const HeartFillIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
  </svg>
);

const EyeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
  </svg>
);

const CartIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const CartFillIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.25 3h1.5l.4 2h14.35l-1.5 9H6.4l-1.5-9h-2.5V3zm4.15 12l1.5 9h8.7l1.5-9H6.4zm10.35 12a2.25 2.25 0 110-4.5 2.25 2.25 0 010 4.5zm-9 0a2.25 2.25 0 110-4.5 2.25 2.25 0 010 4.5z" />
  </svg>
);

const ShopProduct = ({ categoryFilter, priceFilter }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState("Latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState({});
  const [cart, setCart] = useState({}); // New cart state
  const productsPerPage = 6;
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("token");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/products", {
          params: {
            category: categoryFilter === "all" ? "" : categoryFilter,
            price: priceFilter === "price-all" ? "" : priceFilter,
            search: searchTerm,
            sort: sortBy.toLowerCase(),
            page: currentPage,
            limit: productsPerPage,
          },
          withCredentials: true,
        });
        const fetchedProducts = Array.isArray(response.data)
          ? response.data
          : response.data.products || [];
        setProducts(
          fetchedProducts.map((product) => ({
            ...product,
            rawPrice: product.discountApplied ? product.discountedPrice : product.price,
            images: product.images || [],
          }))
        );
        setTotalPages(
          Array.isArray(response.data)
            ? Math.ceil(response.data.length / productsPerPage)
            : response.data.totalPages || 1
        );

        // Load wishlist from localStorage
        const storedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        const wishlistState = {};
        storedWishlist.forEach((item) => {
          wishlistState[item._id] = true;
        });
        setWishlist(wishlistState);

        // Load cart from localStorage
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        const cartState = {};
        storedCart.forEach((item) => {
          cartState[item._id] = true;
        });
        setCart(cartState);
      } catch (error) {
        setError("Error fetching products. Please try again.");
        setProducts([]);
      }
    };

    fetchProducts();
  }, [categoryFilter, priceFilter, searchTerm, sortBy, currentPage]);

  const handleSortSelect = (option) => {
    setSortBy(option);
    setSortDropdownOpen(false);
    setCurrentPage(1);
  };

  const handleAddToWishlist = async (productId) => {
    try {
      let localWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      const product = products.find((p) => p._id === productId);
      if (!product) {
        toast.error("Product not found", { position: "top-right" });
        return;
      }

      const productData = {
        _id: product._id,
        name: product.name,
        price: product.rawPrice,
        images: product.images,
        stock: product.stock,
        inStock: product.inStock,
        discountApplied: product.discountApplied,
        discountedPrice: product.discountApplied ? product.rawPrice : null,
      };

      if (wishlist[productId]) {
        localWishlist = localWishlist.filter((item) => item._id !== productId);
        setWishlist((prev) => ({
          ...prev,
          [productId]: false,
        }));
        if (isAuthenticated) {
          await axios.delete(`http://localhost:5000/api/wishlist/${productId}`, {
            withCredentials: true,
          });
        }
        toast.info("Removed from wishlist", { position: "top-right" });
      } else {
        localWishlist.push(productData);
        setWishlist((prev) => ({
          ...prev,
          [productId]: true,
        }));
        if (isAuthenticated) {
          await axios.post(
            "http://localhost:5000/api/wishlist",
            { productId },
            { withCredentials: true }
          );
        }
        toast.success("Product added to wishlist!", { position: "top-right" });
      }

      localStorage.setItem("wishlist", JSON.stringify(localWishlist));
    } catch (error) {
      console.error("Error managing wishlist:", error);
      if (error.response?.status === 401 && isAuthenticated) {
        toast.info("Session expired, wishlist updated locally", { position: "top-right" });
      } else {
        toast.error("Failed to update wishlist", { position: "top-right" });
      }
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      let localCart = JSON.parse(localStorage.getItem("cart")) || [];
      const product = products.find((p) => p._id === productId);
      if (!product) {
        toast.error("Product not found", { position: "top-right" });
        return;
      }

      const productData = {
        _id: product._id,
        name: product.name,
        price: product.rawPrice,
        images: product.images,
        stock: product.stock,
        inStock: product.inStock,
        discountApplied: product.discountApplied,
        discountedPrice: product.discountApplied ? product.rawPrice : null,
      };

      if (cart[productId]) {
        // Remove from cart
        localCart = localCart.filter((item) => item._id !== productId);
        setCart((prev) => ({
          ...prev,
          [productId]: false,
        }));
        if (isAuthenticated) {
          await axios.delete(`http://localhost:5000/api/cart/${productId}`, {
            withCredentials: true,
          });
        }
        toast.info("Removed from cart", { position: "top-right" });
      } else {
        // Add to cart
        localCart.push(productData);
        setCart((prev) => ({
          ...prev,
          [productId]: true,
        }));
        if (isAuthenticated) {
          await axios.post(
            "http://localhost:5000/api/cart",
            { productId },
            { withCredentials: true }
          );
        }
        toast.success("Product added to cart!", { position: "top-right" });
      }

      // Update localStorage
      localStorage.setItem("cart", JSON.stringify(localCart));
    } catch (error) {
      console.error("Error managing cart:", error);
      if (error.response?.status === 401 && isAuthenticated) {
        toast.info("Session expired, cart updated locally", { position: "top-right" });
      } else {
        toast.error("Failed to update cart", { position: "top-right" });
      }
    }
  };

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Our Collection
        </h2>
  
        {error && (
          <div className="text-center text-red-500 mb-6 p-3 bg-red-50 rounded-lg">
            {error}
          </div>
        )}
  
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative w-full md:w-auto mb-4 md:mb-0">
              <div className="flex items-center border-2 border-[#d39c94] rounded-md overflow-hidden bg-white shadow-sm">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full px-5 py-3 focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="bg-[#d39c94] px-4 py-3 text-white hover:bg-[#c08b84] transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="relative w-auto">
              <button
                className="flex items-center border-2 border-[#d39c94] rounded-md px-4 py-3 text-sm text-[#d39c94] bg-white shadow-sm hover:bg-[#f9f1f0] transition-colors"
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              >
                <span>Sort by: {sortBy}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {sortDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1 z-10 border border-gray-100">
                  <button
                    onClick={() => handleSortSelect("Latest")}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#f9f1f0] hover:text-[#d39c94]"
                  >
                    Latest
                  </button>
                  <button
                    onClick={() => handleSortSelect("Popularity")}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#f9f1f0] hover:text-[#d39c94]"
                  >
                    Popularity
                  </button>
                  <button
                    onClick={() => handleSortSelect("Best Rating")}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#f9f1f0] hover:text-[#d39c94]"
                  >
                    Best Rating
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.length > 0 ? (
            products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-md overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative overflow-hidden group">
                  <img
                    src={`http://localhost:5000/${product.images[0]}`}
                    alt={product.name}
                    className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#d39c94]/20 to-[#f9f1f0]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <a
                      href={`/ShopDetail/${product._id}`}
                      className="bg-white text-[#d39c94] rounded-md p-3 mx-2 transform -translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                      title="Quick View"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </a>
                    <button
                      onClick={() => handleAddToWishlist(product._id)}
                      className="bg-white text-[#d39c94] rounded-md p-3 mx-2 transform -translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75"
                      title={wishlist[product._id] ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      {wishlist[product._id] ? (
                        <HeartFillIcon className="h-5 w-5" />
                      ) : (
                        <HeartIcon className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleAddToCart(product._id)}
                      className="bg-white text-[#d39c94] rounded-md p-3 mx-2 transform -translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-150"
                      title={cart[product._id] ? "Remove from Cart" : "Add to Cart"}
                    >
                      {cart[product._id] ? (
                        <CartFillIcon className="h-5 w-5" />
                      ) : (
                        <CartIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-lg font-medium text-gray-800 mb-2 hover:text-[#d39c94] transition-colors">
                    <a href={`/ShopDetail/${product._id}`}>
                      {product.name}
                    </a>
                  </h3>
                  <div className="mb-5">
                    <span className="text-lg font-semibold text-[#d39c94]">
                      ${product.discountApplied ? product.discountedPrice : product.price.toFixed(2)}
                    </span>
                    {product.discountApplied && (
                      <span className="text-gray-400 line-through ml-2">
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-center space-x-6 mt-4">
                    <a
                      href={`/ShopDetail/${product._id}`}
                      className="p-3 text-white bg-[#d39c94] hover:bg-[#b77c75] transition-colors rounded-md"
                      title="View Product Details"
                    >
                      <EyeIcon className="h-6 w-6" />
                    </a>
                    <button
                      onClick={() => handleAddToWishlist(product._id)}
                      className="p-3 text-[#d39c94] border-2 border-[#d39c94] hover:bg-[#f9f1f0] transition-colors rounded-md"
                      title={wishlist[product._id] ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      {wishlist[product._id] ? (
                        <HeartFillIcon className="h-6 w-6" />
                      ) : (
                        <HeartIcon className="h-6 w-6" />
                      )}
                    </button>
                    <button
                      onClick={() => handleAddToCart(product._id)}
                      className="p-3 text-[#d39c94] border-2 border-[#d39c94] hover:bg-[#f9f1f0] transition-colors rounded-md"
                      title={cart[product._id] ? "Remove from Cart" : "Add to Cart"}
                    >
                      {cart[product._id] ? (
                        <CartFillIcon className="h-6 w-6" />
                      ) : (
                        <CartIcon className="h-6 w-6" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-16 text-center">
              <p className="text-xl text-gray-600">No products found.</p>
              <p className="mt-2 text-gray-500">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
  
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <nav className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-l-md border border-[#d39c94] text-[#d39c94] hover:bg-[#f9f1f0] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 flex items-center justify-center py-2 border-t border-b border-[#d39c94] ${
                    currentPage === page
                      ? "bg-[#d39c94] text-white"
                      : "text-[#d39c94] hover:bg-[#f9f1f0]"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-r-md border border-[#d39c94] text-[#d39c94] hover:bg-[#f9f1f0] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopProduct;