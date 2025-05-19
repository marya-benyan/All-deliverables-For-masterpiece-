import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getProducts } from '../services/api';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

const JustArrivedSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState({});
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("token");

  useEffect(() => {
    const fetchJustArrived = async () => {
      try {
        const response = await getProducts({ sort: 'latest', limit: 8, page: 1 });
        const fetchedProducts = Array.isArray(response.data.products) ? response.data.products : [];
        setProducts(
          fetchedProducts.map((product) => ({
            id: product._id,
            name: product.name,
            price: `$${product.discountApplied ? product.discountedPrice : product.price.toFixed(2)}`,
            image: product.images && product.images.length > 0
              ? `http://localhost:5000/${product.images[0]}`
              : '/api/placeholder/400/500',
            alt: product.name,
            rawPrice: product.discountApplied ? product.discountedPrice : product.price,
            discountApplied: product.discountApplied,
            originalPrice: product.price,
            stock: product.stock,
            inStock: product.inStock,
            images: product.images || [],
          }))
        );
      } catch (error) {
        console.error('Error fetching just arrived products:', error);
        toast.error('Failed to fetch just arrived products', { position: 'top-right' });
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    // Load wishlist from localStorage on mount
    const storedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const wishlistState = {};
    storedWishlist.forEach(item => {
      wishlistState[item._id] = true;
    });
    setWishlist(wishlistState);

    fetchJustArrived();
  }, []);

  const handleAddToWishlist = async (productId) => {
    try {
      let localWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
      const product = products.find(p => p.id === productId);
      if (!product) {
        toast.error("Product not found", { position: "top-right" });
        return;
      }

      const productData = {
        _id: product.id,
        name: product.name,
        price: product.rawPrice,
        images: product.images,
        stock: product.stock,
        inStock: product.inStock,
        discountApplied: product.discountApplied,
        discountedPrice: product.discountApplied ? product.rawPrice : null,
      };

      // Check if product is already in wishlist
      if (wishlist[productId]) {
        // Remove from wishlist
        localWishlist = localWishlist.filter(item => item._id !== productId);
        setWishlist(prev => ({
          ...prev,
          [productId]: false
        }));
        if (isAuthenticated) {
          await axios.delete(`http://localhost:5000/api/wishlist/${productId}`, {
            withCredentials: true,
          });
        }
        toast.info("Removed from wishlist", { position: "top-right" });
      } else {
        // Add to wishlist
        localWishlist.push(productData);
        setWishlist(prev => ({
          ...prev,
          [productId]: true
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

      // Update localStorage
      localStorage.setItem('wishlist', JSON.stringify(localWishlist));
    } catch (error) {
      console.error("Error managing wishlist:", error);
      if (error.response?.status === 401 && isAuthenticated) {
        toast.info("Session expired, wishlist updated locally", { position: "top-right" });
        // No redirect to login, just keep the local change
      } else {
        toast.error("Failed to update wishlist", { position: "top-right" });
      }
    }
  };

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-6 font-serif relative inline-block">
            Just Arrived 
            <span className="absolute -bottom-3 left-0 w-full h-1 bg-[#c37c73] rounded-full"></span>
          </h2>
          <div className="w-16 h-1 bg-[#bc7265] opacity-60 rounded-full mt-1"></div>
        </div>
  
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#bc7265]"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center max-w-md mx-auto">
            <div className="text-[#c37c73] mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No Candles Available</h3>
            <p className="text-gray-600">New candles will be added soon, please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className="relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.alt}
                    className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-0 right-0 m-3">
                    <button
                      onClick={() => handleAddToWishlist(product.id)}
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 text-[#c37c73] hover:text-white hover:bg-[#c37c73]"
                    >
                      {wishlist[product.id] ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="p-5 text-center">
                  <h3 className="text-lg font-medium text-[#c37c73] hover:text-[#bc7265] transition-colors mb-2 group-hover:text-[#bc7265]">
                    {product.name}
                  </h3>
                  <div className="mb-5">
                    <span className="text-2xl font-semibold text-[#bc7265]">{product.price}</span>
                  </div>
                  <a
                    href={`/ShopDetail/${product.id}`}
                    className="inline-flex items-center px-6 py-2 text-white bg-gradient-to-r from-[#d39c94] to-[#bc7265] rounded-lg hover:from-[#bc7265] hover:to-[#a56459] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Details
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* إضافة زر "Browse All Candles" كما في قسم المنتجات المميزة */}
        <div className="mt-16 text-center">
          <a 
            href="/shop" 
            className="inline-flex items-center px-8 py-3 border-2 border-[#c37c73] text-[#c37c73] rounded-lg hover:bg-[#c37c73] hover:text-white transition-colors duration-300 font-medium group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center">
              Browse All Products
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            <span className="absolute top-0 left-0 w-0 h-full bg-[#c37c73] -z-1 group-hover:w-full transition-all duration-300"></span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default JustArrivedSection;