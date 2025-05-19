import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { addCustomProduct } from "../services/api";

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

const StarIcon = ({ className, filled, onClick }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill={filled ? "currentColor" : "none"}
    viewBox="0 0 24 24"
    stroke="currentColor"
    onClick={onClick}
    style={{ cursor: onClick ? "pointer" : "default" }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 .587l3.668 7.431 8.332 1.151-6 5.828 1.417 8.003L12 18.891l-7.417 3.109 1.417-8.003-6-5.828 8.332-1.151z"
    />
  </svg>
);

const ShopDetail = ({ isAuthenticated }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [wishlist, setWishlist] = useState({});
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);

  // Custom Product Form State
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [giftType, setGiftType] = useState("");
  const [messageType, setMessageType] = useState("text");
  const [textMessage, setTextMessage] = useState("");
  const [audioMessage, setAudioMessage] = useState(null);
  const [videoMessage, setVideoMessage] = useState(null);
  const [audioPreview, setAudioPreview] = useState("");
  const [videoPreview, setVideoPreview] = useState("");
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const cookies = document.cookie;
        const token = localStorage.getItem("token");
        const headers = { ...config.headers };

        if (token && !headers.Authorization) {
          headers.Authorization = `Bearer ${token}`;
        }

        const headerString = JSON.stringify(headers) + cookies;
        const headerSize = new Blob([headerString]).size;
        console.log(`Request to ${config.url}: Header size = ${headerSize} bytes`);

        if (headerSize > 3000) {
          console.warn("Header size too large, clearing cookies...");
          document.cookie.split(";").forEach((c) => {
            document.cookie = c
              .replace(/^ +/, "")
              .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
          });
          toast.error(
            "Request headers too large. Please clear browser data and log in again.",
            { position: "top-right" }
          );
          return Promise.reject(new Error("Header size too large"));
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    const fetchProduct = async () => {
      try {
        console.log("fetchProduct: Fetching product...");
        const response = await axios.get(`http://localhost:5000/api/products/${id}`, {
          withCredentials: true,
        });
        setProduct(response.data);

        console.log("fetchProduct: Fetching related products...");
        const relatedResponse = await axios.get("http://localhost:5000/api/products", {
          params: { category: response.data.category_id?._id || "" },
          withCredentials: true,
        });
        const related = relatedResponse.data.products
          ? relatedResponse.data.products
              .filter((p) => p._id !== id)
              .slice(0, 4)
              .map((p) => ({
                _id: p._id,
                name: p.name,
                price: p.price,
                images: p.images,
                stock: p.stock,
                inStock: p.inStock,
                discountApplied: p.discountApplied,
                discountedPrice: p.discountedPrice,
              }))
          : [];
        setRelatedProducts(related);

        if (isAuthenticated) {
          console.log("fetchProduct: Fetching reviews...");
          const reviewsResponse = await axios.get(
            `http://localhost:5000/api/reviews/product/${id}`,
            { withCredentials: true }
          );
          setReviews(reviewsResponse.data);
        }
      } catch (error) {
        console.error("fetchProduct: Error:", error.response?.data || error.message);
        if (error.response?.status === 404) {
          setError("Product not found");
        } else {
          setError("Error fetching product");
          toast.error("Error fetching product", { position: "top-right" });
        }
      } finally {
        setLoading(false);
      }
    };

    const loadWishlistAndCart = () => {
      const storedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      const wishlistState = {};
      storedWishlist.forEach((item) => {
        wishlistState[item._id] = true;
      });
      setWishlist(wishlistState);

      const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
      const cartState = {};
      storedCart.forEach((item) => {
        cartState[item._id] = true;
      });
      setCart(cartState);
    };

    fetchProduct();
    loadWishlistAndCart();

    return () => axios.interceptors.request.eject(requestInterceptor);
  }, [id, isAuthenticated]);

  const handleQuantityChange = (action) => {
    if (action === "increase") {
      setQuantity((prev) => prev + 1);
    } else if (action === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = useCallback(
    async (productToAdd) => {
      try {
        if (!product && !productToAdd) {
          toast.error("Product data not available", { position: "top-right" });
          return;
        }

        let localCart = JSON.parse(localStorage.getItem("cart")) || [];
        const selectedProduct = productToAdd._id === id ? product : relatedProducts.find((p) => p._id === productToAdd._id);

        if (!selectedProduct) {
          toast.error("Product not found", { position: "top-right" });
          return;
        }

        const productData = {
          _id: selectedProduct._id,
          name: selectedProduct.name,
          price: selectedProduct.discountApplied ? selectedProduct.discountedPrice : selectedProduct.price,
          images: selectedProduct.images,
          stock: selectedProduct.stock,
          inStock: selectedProduct.inStock,
          discountApplied: selectedProduct.discountApplied,
          discountedPrice: selectedProduct.discountApplied ? selectedProduct.discountedPrice : null,
          quantity: productToAdd._id === id ? quantity : 1,
        };

        if (cart[selectedProduct._id]) {
          localCart = localCart.filter((item) => item._id !== selectedProduct._id);
          setCart((prev) => ({
            ...prev,
            [selectedProduct._id]: false,
          }));
          if (isAuthenticated) {
            try {
              await axios.delete(`http://localhost:5000/api/cart/${selectedProduct._id}`, {
                withCredentials: true,
              });
            } catch (apiError) {
              console.warn("API delete failed, continuing with local cart update:", apiError.message);
            }
          }
          toast.info("Removed from cart", { position: "top-right" });
        } else {
          const existingProductIndex = localCart.findIndex((item) => item._id === selectedProduct._id);
          if (existingProductIndex >= 0) {
            localCart[existingProductIndex].quantity = (localCart[existingProductIndex].quantity || 1) + (productToAdd._id === id ? quantity : 1);
          } else {
            localCart.push(productData);
          }
          setCart((prev) => ({
            ...prev,
            [selectedProduct._id]: true,
          }));
          if (isAuthenticated) {
            try {
              await axios.post(
                "http://localhost:5000/api/cart",
                { productId: selectedProduct._id, quantity: productToAdd._id === id ? quantity : 1 },
                { withCredentials: true }
              );
            } catch (apiError) {
              console.warn("API post failed, continuing with local cart update:", apiError.message);
            }
          }
          toast.success("Product added to cart!", { position: "top-right" });
        }

        localStorage.setItem("cart", JSON.stringify(localCart));
      } catch (error) {
        console.error("Error managing cart:", error);
        if (error.response?.status === 401 && isAuthenticated) {
          toast.info("Session expired, cart updated locally", { position: "top-right" });
        } else {
          toast.error("Failed to update cart", { position: "top-right" });
        }
      }
    },
    [cart, id, product, relatedProducts, quantity, isAuthenticated]
  );

  const handleAddToWishlist = async (productId) => {
    console.log("handleAddToWishlist: Toggling wishlist, productId:", productId);
    try {
      let localWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      const productToAdd = productId === id ? product : relatedProducts.find((p) => p._id === productId);
      if (!productToAdd) {
        toast.error("Product not found", { position: "top-right" });
        return;
      }

      const productData = {
        _id: productToAdd._id,
        name: productToAdd.name,
        price: productToAdd.discountApplied ? productToAdd.discountedPrice : productToAdd.price,
        images: productToAdd.images,
        stock: productToAdd.stock,
        inStock: productToAdd.inStock,
        discountApplied: productToAdd.discountApplied,
        discountedPrice: productToAdd.discountedPrice,
      };

      if (wishlist[productId]) {
        localWishlist = localWishlist.filter((item) => item._id !== productId);
        setWishlist((prev) => {
          const newWishlist = { ...prev };
          delete newWishlist[productId];
          return newWishlist;
        });
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
      console.error("handleAddToWishlist: Error:", error.response?.data || error.message);
      if (error.response?.status === 401 && isAuthenticated) {
        toast.info("Session expired, wishlist updated locally", { position: "top-right" });
      } else if (error.response?.status === 404) {
        toast.warning("Wishlist service unavailable, item added locally. Please check your server.", { position: "top-right" });
      } else {
        toast.error("Failed to update wishlist", { position: "top-right" });
      }
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info("Please log in to submit a review", { position: "top-right" });
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }
    setIsSubmittingReview(true);
    try {
      await axios.post(
        "http://localhost:5000/api/reviews",
        {
          product: id,
          rating: newReview.rating,
          comment: newReview.comment,
        },
        { withCredentials: true }
      );
      const reviewsResponse = await axios.get(`http://localhost:5000/api/reviews/product/${id}`, {
        withCredentials: true,
      });
      setReviews(reviewsResponse.data);
      setNewReview({ rating: 5, comment: "" });
      toast.success("Review submitted successfully!", { position: "top-right" });
    } catch (error) {
      console.error("handleReviewSubmit: Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || "Error submitting review", {
        position: "top-right",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleImageChange = (direction) => {
    if (!product || !product.images) return;
    if (direction === "next") {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    } else if (direction === "prev") {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const handleImageChangeCustom = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviewImages(files.map((file) => URL.createObjectURL(file)));
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioMessage(file);
      setAudioPreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoMessage(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleCustomProductSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info("Please log in to submit a custom design", { position: "top-right" });
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }
    try {
      if (!productName || !description) {
        throw new Error("Please fill all required fields: name, description");
      }

      const formData = new FormData();
      formData.append("name", productName);
      formData.append("designDescription", description);
      if (giftType) formData.append("giftType", giftType);
      formData.append("messageType", messageType);

      if (messageType === "text") {
        formData.append("textMessage", textMessage);
      } else if (messageType === "audio" && audioMessage) {
        formData.append("audioMessage", audioMessage);
      } else if (messageType === "video" && videoMessage) {
        formData.append("videoMessage", videoMessage);
      }

      images.forEach((image) => {
        formData.append("images", image);
      });

      await addCustomProduct(formData);

      toast.success(
        "✅ Your custom request has been submitted successfully! It will be reviewed soon.",
        {
          position: "top-right",
          autoClose: 5000,
        }
      );

      // Reset all fields after successful submission
      setProductName("");
      setDescription("");
      setGiftType("");
      setMessageType("text");
      setTextMessage("");
      setAudioMessage(null);
      setVideoMessage(null);
      setAudioPreview("");
      setVideoPreview("");
      setImages([]);
      setPreviewImages([]);
    } catch (error) {
      console.error("Error creating custom product:", error);
      const errorMessage =
        error.response?.data?.error || error.message || "An unknown error occurred";
      toast.error("Error creating request: " + errorMessage, {
        position: "top-right",
      });
    }
  };

  if (isAuthenticated === null) {
    return <div className="text-center py-10 text-gray-600">Checking authentication...</div>;
  }

  if (loading) {
    return <div className="text-center py-10 text-gray-600">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!product) {
    return <div className="text-center py-10 text-gray-600">Product not found</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white py-6 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Product Details</h1>
          <nav className="text-sm sm:text-base text-gray-600">
            <Link to="/" className="hover:text-[#d39c94] transition duration-300">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[#d39c94]">Product Details</span>
          </nav>
        </div>
      </div>

      {/* Product Overview Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Image Gallery */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="relative aspect-w-4 aspect-h-3">
              <img
                src={`http://localhost:5000/${product.images[currentImageIndex]}`}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={() => handleImageChange("prev")}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white text-gray-600 p-2 rounded-full shadow-md hover:bg-gray-100 transition duration-300"
              >
                ←
              </button>
              <button
                onClick={() => handleImageChange("next")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white text-gray-600 p-2 rounded-full shadow-md hover:bg-gray-100 transition duration-300"
              >
                →
              </button>
            </div>
            <div className="flex justify-center mt-4 space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={`http://localhost:5000/${image}`}
                  alt={`Thumbnail ${index}`}
                  className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 transition duration-300 ${
                    currentImageIndex === index ? "border-[#d39c94]" : "border-transparent hover:border-gray-300"
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">{product.name}</h2>
            <div className="flex items-center mb-3">
              <div className="text-yellow-400 text-lg">
                {"★".repeat(
                  Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1))
                )}
                {"☆".repeat(
                  5 -
                    Math.round(
                      reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1)
                    )
                )}
              </div>
              <span className="ml-2 text-sm text-gray-600">({reviews.length} reviews)</span>
            </div>
            <p className="text-gray-600 text-sm sm:text-base mb-4">{product.description}</p>
            <div className="flex items-center mb-4">
              <h3 className="text-2xl sm:text-3xl font-bold text-[#d39c94]">
                ${product.discountApplied ? product.discountedPrice : product.price.toFixed(2)}
              </h3>
              {product.discountApplied && (
                <span className="ml-3 text-lg text-gray-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => handleQuantityChange("decrease")}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition duration-300"
                >
                  -
                </button>
                <input
                  type="text"
                  className="w-12 text-center border-0 text-gray-800 focus:outline-none"
                  value={quantity}
                  readOnly
                />
                <button
                  onClick={() => handleQuantityChange("increase")}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition duration-300"
                >
                  +
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleAddToCart(product)}
                  className="p-2 bg-[#d39c94] text-white rounded-full hover:bg-[#bc7265] transition duration-300"
                  title={cart[product._id] ? "Remove from Cart" : "Add to Cart"}
                >
                  {cart[product._id] ? <CartFillIcon className="h-6 w-6" /> : <CartIcon className="h-6 w-6" />}
                </button>
                <button
                  onClick={() => handleAddToWishlist(id)}
                  className="p-2 bg-white border border-[#d39c94] text-[#d39c94] rounded-full hover:bg-[#f9f1f0] transition duration-300"
                  title={wishlist[id] ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  {wishlist[id] ? <HeartFillIcon className="h-6 w-6" /> : <HeartIcon className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex flex-wrap gap-2 border-b border-gray-200 mb-6">
            {["description", "reviews", "custom-design"].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 text-sm sm:text-base font-medium rounded-t-lg transition duration-300 ${
                  activeTab === tab
                    ? "bg-[#d39c94] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "description" && "Description & Info"}
                {tab === "reviews" && `Reviews (${reviews.length})`}
                {tab === "custom-design" && "Design Your Own"}
              </button>
            ))}
          </div>

          {activeTab === "description" && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Product Description</h4>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{product.description}</p>
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Additional Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-gray-600 text-sm sm:text-base">
                      <span className="font-medium text-gray-800">Category:</span>{" "}
                      {product.category_id?.name || "Uncategorized"}
                    </p>
                    <p className="text-gray-600 text-sm sm:text-base">
                      <span className="font-medium text-gray-800">Stock:</span>{" "}
                      {product.inStock ? "Available" : "Not Available"}
                    </p>
                    <p className="text-gray-600 text-sm sm:text-base">
                      <span className="font-medium text-gray-800">Material:</span>{" "}
                      {product.material || "Not specified"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-600 text-sm sm:text-base">
                      <span className="font-medium text-gray-800">Product Code:</span>{" "}
                      {product._id.substr(-6).toUpperCase()}
                    </p>
                    <p className="text-gray-600 text-sm sm:text-base">
                      <span className="font-medium text-gray-800">Weight:</span>{" "}
                      {product.weight || "Not specified"}
                    </p>
                    <p className="text-gray-600 text-sm sm:text-base">
                      <span className="font-medium text-gray-800">Dimensions:</span>{" "}
                      {product.dimensions || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Customer Reviews</h4>
              {reviews.length === 0 ? (
                <p className="text-gray-600 italic text-sm sm:text-base">
                  No reviews yet. Be the first to review this product!
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="border-b border-gray-200 py-4">
                      <div className="flex items-center mb-2">
                        <span className="text-yellow-400 text-lg">
                          {"★".repeat(review.rating)}
                          {"☆".repeat(5 - review.rating)}
                        </span>
                        <span className="ml-2 text-sm text-gray-600">
                          {review.user?.name || "Anonymous"}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm sm:text-base">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 bg-gray-50 p-4 sm:p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Add a Review</h4>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className="h-6 w-6 text-yellow-400"
                          filled={star <= newReview.rating}
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                    <textarea
                      value={newReview.comment}
                      onChange={(e) =>
                        setNewReview({ ...newReview, comment: e.target.value })
                      }
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d39c94] text-gray-800 min-h-[100px] resize-y transition duration-300"
                      placeholder="Share your thoughts about this product..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#d39c94] text-white rounded-lg hover:bg-[#bc7265] transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={isSubmittingReview}
                  >
                    {isSubmittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "custom-design" && (
            <div className="space-y-6">
              <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Design Your Own Product</h4>
              <div className="relative">
                <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-[#d39c94] "></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#d39c94]"></div>

                <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-8 sm:p-10 relative z-10 border-t-4 border-[#d39c94]">
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-center mb-8 sm:mb-10 tracking-tight text-[#d39c94]">
                    Design Your Custom Product
                  </h2>

                  <form onSubmit={handleCustomProductSubmit} className="space-y-8">
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-700">Product Name *</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                          required
                          className="w-full p-4 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d39c94] focus:border-[#d39c94] text-gray-800 placeholder-gray-400 transition-all duration-300 shadow-sm"
                          placeholder="Example: Family Portrait"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-700">Design Description *</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="w-full p-4 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d39c94] focus:border-[#d39c94] text-gray-800 placeholder-gray-400 min-h-40 resize-y transition-all duration-300 shadow-sm"
                        placeholder="Describe design details (colors, sizes, etc.)"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-700">Gift Type (Optional)</label>
                      <select
                        value={giftType}
                        onChange={(e) => setGiftType(e.target.value)}
                        className="w-full p-4 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d39c94] focus:border-[#d39c94] text-gray-800 transition-all duration-300 shadow-sm"
                      >
                        <option value="">Select gift type</option>
                        <option value="Paintings">Paintings</option>
                        <option value="Candles">Candles</option>
                        <option value="Resin">Resin</option>
                        <option value="Office Supplies">Office Supplies</option>
                        <option value="Printed Clothing">Printed Clothing</option>
                        <option value="Beauty Products">Beauty Products</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-700">Reference Images (Optional)</label>
                      <div className="relative bg-gray-50 rounded-xl border-2 border-dashed p-8 transition-all duration-300 hover:border-[#d39c94]">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageChangeCustom}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="text-center">
                          <p className="mt-2 text-sm text-gray-600 font-medium">
                            Drag images here or click to upload reference images (you can upload multiple images)
                          </p>
                        </div>
                      </div>
                      {previewImages.length > 0 && (
                        <div className="mt-6 grid grid-cols-2 gap-4">
                          {previewImages.map((src, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={src}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border-2 shadow-md border-[#d39c94]"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                                <button 
                                  type="button" 
                                  className="p-1 bg-[#d39c94] text-white rounded-full hover:bg-[#bc7265]"
                                  onClick={() => {
                                    const updatedPreviews = [...previewImages];
                                    const updatedImages = [...images];
                                    updatedPreviews.splice(index, 1);
                                    updatedImages.splice(index, 1);
                                    setPreviewImages(updatedPreviews);
                                    setImages(updatedImages);
                                  }}
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-700">Additional Message (Optional)</label>

                      <div className="mb-4">
                        <div className="flex space-x-4 mb-4">
                          <button
                            type="button"
                            onClick={() => setMessageType("text")}
                            className={`px-4 py-2 rounded-lg transition-all ${
                              messageType === "text"
                                ? "bg-[#d39c94] text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            Text
                          </button>
                          <button
                            type="button"
                            onClick={() => setMessageType("audio")}
                            className={`px-4 py-2 rounded-lg transition-all ${
                              messageType === "audio"
                                ? "bg-[#d39c94] text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            Audio
                          </button>
                          <button
                            type="button"
                            onClick={() => setMessageType("video")}
                            className={`px-4 py-2 rounded-lg transition-all ${
                              messageType === "video"
                                ? "bg-[#d39c94] text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            Video
                          </button>
                        </div>
                      </div>

                      {messageType === "text" && (
                        <textarea
                          value={textMessage}
                          onChange={(e) => setTextMessage(e.target.value)}
                          className="w-full p-4 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d39c94] focus:border-[#d39c94] text-gray-800 placeholder-gray-400 min-h-32 resize-y transition-all duration-300 shadow-sm"
                          placeholder="Add comments or special requests"
                        />
                      )}

                      {messageType === "audio" && (
                        <div className="space-y-4">
                          <div className="relative bg-gray-50 rounded-xl border-2 border-dashed p-8 transition-all duration-300 hover:border-[#d39c94]">
                            <input
                              type="file"
                              accept="audio/*"
                              onChange={handleAudioChange}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="text-center">
                              <p className="mt-2 text-sm text-gray-600 font-medium">
                                Click to upload audio message
                              </p>
                            </div>
                          </div>

                          {audioPreview && (
                            <div className="mt-4">
                              <audio controls className="w-full">
                                <source src={audioPreview} />
                                Your browser does not support the audio element.
                              </audio>
                            </div>
                          )}
                        </div>
                      )}

                      {messageType === "video" && (
                        <div className="space-y-4">
                          <div className="relative bg-gray-50 rounded-xl border-2 border-dashed p-8 transition-all duration-300 hover:border-[#d39c94]">
                            <input
                              type="file"
                              accept="video/*"
                              onChange={handleVideoChange}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="text-center">
                              <p className="mt-2 text-sm text-gray-600 font-medium">
                                Click to upload video message
                              </p>
                            </div>
                          </div>

                          {videoPreview && (
                            <div className="mt-4">
                              <video controls className="w-full rounded-lg">
                                <source src={videoPreview} />
                                Your browser does not support the video element.
                              </video>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full p-4 text-white rounded-xl font-semibold hover:bg-[#bc7265] transition-all duration-300 shadow-lg bg-[#d39c94]"
                    >
                      Submit Design Request
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 text-center mb-6 sm:mb-8">You May Also Like</h2>
        {relatedProducts.length === 0 ? (
          <p className="text-center text-gray-600 text-sm sm:text-base">No related products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((item) => (
              <div
                key={item._id}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 group hover:shadow-md transition duration-300"
              >
                <div className="relative overflow-hidden rounded-lg mb-4">
                  <img
                    src={`http://localhost:5000/${item.images[0]}`}
                    alt={item.name}
                    className="w-full h-48 object-cover rounded-lg transform group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link
                      to={`/ShopDetail/${item._id}`}
                      className="bg-white text-[#d39c94] p-2 rounded-full shadow-md hover:bg-gray-100 transition duration-300"
                      title="Quick View"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2 hover:text-[#d39c94] transition duration-300 text-center">
                  <Link to={`/ShopDetail/${item._id}`}>{item.name}</Link>
                </h3>
                <p className="text-[#d39c94] font-medium mb-4 text-center text-sm sm:text-base">
                  ${item.discountApplied ? item.discountedPrice : item.price.toFixed(2)}
                  {item.discountApplied && (
                    <span className="text-gray-400 line-through ml-2">
                      ${item.price.toFixed(2)}
                    </span>
                  )}
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="p-2 bg-[#d39c94] text-white rounded-full hover:bg-[#bc7265] transition duration-300"
                    title={cart[item._id] ? "Remove from Cart" : "Add to Cart"}
                  >
                    {cart[item._id] ? <CartFillIcon className="h-6 w-6" /> : <CartIcon className="h-6 w-6" />}
                  </button>
                  <button
                    onClick={() => handleAddToWishlist(item._id)}
                    className="p-2 bg-white border border-[#d39c94] text-[#d39c94] rounded-full hover:bg-[#f9f1f0] transition duration-300"
                    title={wishlist[item._id] ? "Remove from Wishlist" : "Add to Wishlist"}
                  >
                    {wishlist[item._id] ? <HeartFillIcon className="h-6 w-6" /> : <HeartIcon className="h-6 w-6" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopDetail;