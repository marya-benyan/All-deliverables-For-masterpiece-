import axios from "axios";

// Initialize axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Utility to get token from cookie or localStorage
const getTokenFromCookie = () => {
  const cookies = document.cookie.split("; ");
  const tokenCookie = cookies.find((c) => c.startsWith("token="));
  const token = tokenCookie ? tokenCookie.split("=")[1] : localStorage.getItem("token");

  console.log("API: Checking token, found:", token ? "Yes" : "No");
  if (token) {
    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedToken.exp < currentTime) {
        console.warn("API: Token expired, clearing session...");
        document.cookie = `token=;expires=${new Date(0).toUTCString()};path=/;SameSite=Strict;domain=${window.location.hostname}`;
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        return null;
      }
    } catch (error) {
      console.error("API: Invalid token format, clearing session...", error);
      document.cookie = `token=;expires=${new Date(0).toUTCString()};path=/;SameSite=Strict;domain=${window.location.hostname}`;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }
  }
  return token || null;
};

// Utility to clear problematic cookies
export const clearProblematicCookies = (navigate = null) => {
  const cookies = document.cookie.split("; ");
  let totalSize = 0;
  const problematicCookies = [
    "sdZnT8w4fAh7Y9OoBKtQbmpHG6NHZI",
    "sdZnT8w4fAh7Y9OoBKtQbmpHG6NHZI+LHCCzYAAAA==",
    "__stripe_mid",
    "__stripe_sid",
  ];

  console.log("API: Checking cookies for clearing...");
  cookies.forEach((c) => {
    totalSize += c.length;
    const cookieName = c.split("=")[0].trim();
    if (problematicCookies.some((prefix) => cookieName.includes(prefix)) || totalSize > 1000) {
      console.warn(`API: Clearing cookie: ${cookieName} (size: ${c.length} bytes)`);
      document.cookie = `${cookieName}=;expires=${new Date(0).toUTCString()};path=/;domain=${window.location.hostname};SameSite=Strict`;
    }
  });

  if (totalSize > 1000) {
    console.warn(`API: Total cookie size too large (${totalSize} bytes). Clearing all cookies.`);
    cookies.forEach((c) => {
      const cookieName = c.split("=")[0].trim();
      document.cookie = `${cookieName}=;expires=${new Date(0).toUTCString()};path=/;domain=${window.location.hostname};SameSite=Strict`;
    });
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    if (navigate) {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      console.log(`API: Navigating to /login with cart`, { cartLength: cart.length });
      navigate("/login", { state: { redirect: "/checkout", cart } });
    }
    return true;
  }

  const finalCookies = document.cookie.split("; ");
  const finalSize = finalCookies.reduce((sum, c) => sum + c.length, 0);
  console.log(`API: After clearing, total cookie size: ${finalSize} bytes`, { cookies: finalCookies });
  return false;
};

// Request interceptor to manage headers
api.interceptors.request.use(
  (config) => {
    const cookiesCleared = clearProblematicCookies();
    const token = getTokenFromCookie();
    const headers = { ...config.headers };

    if (cookiesCleared) {
      console.warn("API: Cookies cleared due to size, skipping token addition.");
    } else if (token) {
      if (token.length > 300) {
        console.warn(`API: Token too large (${token.length} bytes), clearing session...`);
        document.cookie = `token=;expires=${new Date(0).toUTCString()};path=/;SameSite=Strict;domain=${window.location.hostname}`;
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } else if (!headers.Authorization) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    delete headers["User-Agent"];
    delete headers["Accept"];
    delete headers["Host"];

    const headerString = JSON.stringify(headers) + document.cookie;
    const headerSize = new Blob([headerString]).size;
    console.log(`API: Request to ${config.url}: Header size = ${headerSize} bytes, Token length: ${token?.length || 0}, Data size: ${config.data ? new Blob([JSON.stringify(config.data)]).size : 0} bytes`);

    if (headerSize > 2500) {
      console.warn(`API: Header size too large (${headerSize} bytes), clearing all cookies...`);
      document.cookie.split(";").forEach((c) => {
        const name = c.trim().split("=")[0];
        document.cookie = `${name}=;expires=${new Date(0).toUTCString()};path=/;domain=${window.location.hostname};SameSite=Strict`;
      });
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      throw new Error("Header size too large");
    }

    config.headers = headers;
    return config;
  },
  (error) => {
    console.error("API: Request interceptor error:", error.message);
    throw error;
  }
);

// Response interceptor to handle errors and PayPal responses
api.interceptors.response.use(
  (response) => {
    const setCookie = response.headers["set-cookie"];
    if (setCookie) {
      console.log("API: Set-Cookie headers in response:", setCookie);
      if (setCookie.some((c) => c.includes("sdZnT8w4fAh7Y9OoBKtQbmpHG6NHZI"))) {
        console.warn("API: Backend is setting problematic cookie, clearing immediately...");
        clearProblematicCookies();
      }
    }

    if (response.data?.redirectUrl && response.config.url === "/payments/pay") {
      console.log("API: PayPal redirect URL received:", response.data.redirectUrl);
      window.location.href = response.data.redirectUrl;
    }
    return response;
  },
  async (error) => {
    if (error.response) {
      console.error(
        `API Error: ${error.response.status} - ${error.response.data?.error || error.message}`
      );
      if ((error.response.status === 401 || error.response.status === 403) && !error.config.url.includes("/users/forgot-password")) {
        console.log("API: Unauthorized, marking as auth error");
        document.cookie = `token=;expires=${new Date(0).toUTCString()};path=/;SameSite=Strict;domain=${window.location.hostname}`;
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        throw { ...error, isAuthError: true };
      }
      if (error.response.status === 431) {
        console.error("API: 431 Request Header Fields Too Large, clearing cookies...");
        const cookiesCleared = clearProblematicCookies();
        if (cookiesCleared) {
          const cart = JSON.parse(localStorage.getItem("cart")) || [];
          throw { ...error, redirectToLogin: true, cart };
        }
        if (!error.config._retry) {
          error.config._retry = true;
          console.log("API: Retrying request after clearing cookies...");
          return api(error.config);
        } else if (!error.config._secondRetry) {
          error.config._secondRetry = true;
          console.log("API: Second retry after clearing all cookies...");
          document.cookie.split(";").forEach((c) => {
            const name = c.trim().split("=")[0];
            document.cookie = `${name}=;expires=${new Date(0).toUTCString()};path=/;domain=${window.location.hostname};SameSite=Strict`;
          });
          return api(error.config);
        } else {
          console.error("API: Retry failed, headers still too large");
          const cart = JSON.parse(localStorage.getItem("cart")) || [];
          throw { ...error, redirectToLogin: true, cart };
        }
      }
    } else {
      console.error("API Error: No response from server", error.message);
    }
    throw error;
  }
);

// Auth endpoints
export const registerUser = (userData) => api.post("/users/register", userData);
export const loginUser = async ({ email, password }) => {
  console.log("loginUser called with:", { email, password });
  const response = await api.post("/users/login", { email, password });
  return response;
};
export const logoutUser = () => {
  document.cookie = `token=;expires=${new Date(0).toUTCString()};path=/;SameSite=Strict;domain=${window.location.hostname}`;
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.setItem("cart", JSON.stringify([]));
  return api.post("/users/logout");
};
export const getCurrentUser = async () => {
  console.log("getCurrentUser: Sending request to /users/me");
  try {
    const response = await api.get("/users/me");
    console.log("getCurrentUser: Success, response:", response.data);
    return response;
  } catch (error) {
    console.error("getCurrentUser: Error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};
export const updateUser = (userData) => api.post("/users/me", userData);
export const forgotPassword = (emailInput) => {
  const email = typeof emailInput === "string" ? emailInput : emailInput.email;
  console.log("forgotPassword called with:", { email });
  return api.post("/users/forgot-password", { email });
};
export const resetPassword = (token, password) =>
  api.post(`/users/reset-password/${token}`, { password });

// Admin endpoints
export const getUsers = () => api.get("/admin/users");
export const getReviews = () => api.get("/admin/reviews");
export const deleteReview = (reviewId) => {
  return api.delete(`/admin/reviews/${reviewId}`);
};
export const getContactMessages = () => api.get("/admin/contact-messages");
export const replyContactMessage = (id, reply) =>
  api.post(`/admin/contact-messages/${id}/reply`, { reply });
export const getGiftMessages = () => api.get("/admin/gift-messages");
export const getDiscounts = () => api.get("/admin/discounts");
export const addDiscount = (discountData) => api.post("/admin/discounts", discountData);

// Category endpoints
export const getCategories = () => api.get("/categories");
export const addCategory = (categoryData) => api.post("/categories", categoryData);
export const updateCategory = (id, data) => {
  console.log(`Updating category with ID: ${id} and data:`, data);
  return api.put(`/categories/${id}`, data);
};
export const deleteCategory = (id) => {
  console.log(`Deleting category ID: ${id}`);
  return api.delete(`/categories/${id}`);
};

// Product endpoints
export const getProducts = async ({ sort, limit, page, category, price, search }) => {
  const params = new URLSearchParams();
  if (sort) {
    const validSort = sort === "best+rating" ? "rating" : sort === "latest" ? "createdAt" : sort;
    params.append("sort", validSort);
  }
  if (limit) params.append("limit", limit);
  if (page) params.append("page", page);
  if (category) params.append("category", category);
  if (price) params.append("price", price);
  if (search) params.append("search", search);
  return api.get(`/products?${params}`);
};
export const getProductById = async (productId, params = {}) => {
  try {
    console.log("Fetching product with ID:", productId);
    const response = await api.get(`/products/${productId}`, { params });
    return response;
  } catch (error) {
    console.error("getProductById error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};
export const addProduct = async (formData) => {
  try {
    console.log("Adding product with data:", Object.fromEntries(formData));
    const response = await api.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("Product added successfully:", response.data);
    return response;
  } catch (error) {
    console.error("addProduct error:", error.response?.status, "-", error.response?.data || error.message);
    throw error;
  }
};
export const addCustomProduct = async (formData) => {
  try {
    console.log("Adding custom product with data:", Object.fromEntries(formData));
    const response = await api.post("/custom-orders", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("Custom product added successfully:", response.data);
    return response;
  } catch (error) {
    console.error("addCustomProduct error:", error.response?.data || error.message);
    throw error;
  }
};
export const deleteProduct = async (productId) => {
  console.log("Deleting product with ID:", productId);
  const response = await api.delete(`/products/${productId}`);
  return response;
};
export const updateProduct = async (productId, formData) => {
  console.log("Updating product with ID:", productId, "and data:", Object.fromEntries(formData));
  const response = await api.put(`/products/${productId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response;
};
export const getCustomOrders = () => api.get("/custom-orders");
export const updateCustomOrder = (id, data) => api.put(`/custom-orders/${id}`, data);

// Coupon endpoints
export const applyCoupon = async (couponData) => {
  try {
    console.log("Applying coupon with data:", couponData);
    const response = await api.post("/coupons/apply", couponData);
    return response;
  } catch (error) {
    console.error("applyCoupon error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};
export const getCoupons = () => api.get("/coupons");
export const addCoupon = (couponData) => api.post("/coupons", couponData);
export const updateCoupon = (id, couponData) => {
  console.log(`Updating coupon with ID: ${id} and data:`, couponData);
  return api.put(`/coupons/${id}`, couponData);
};
export const deleteCoupon = (id) => {
  console.log(`Deleting coupon ID: ${id}`);
  return api.delete(`/coupons/${id}`);
};

// Wishlist endpoints
export const getWishlist = () => api.get("/wishlist");
export const addToWishlist = (productId) => api.post("/wishlist", { productId });
export const removeFromWishlist = (productId) => api.delete(`/wishlist/${productId}`);

// Order endpoints
export const createOrder = async (orderData) => {
  try {
    console.log("Creating order with data:", orderData);
    const response = await api.post("/orders", orderData);
    return response;
  } catch (error) {
    console.error("createOrder error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};
export const getOrders = async () => {
  try {
    console.log("Fetching all orders");
    const response = await api.get("/orders");
    return response;
  } catch (error) {
    console.error("getOrders error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};
export const getUserOrders = async () => {
  try {
    console.log("Fetching user orders");
    const response = await api.get("/orders/me");
    return response;
  } catch (error) {
    console.error("getUserOrders error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

// Add these to your existing API service
export const updateOrderStatus = async (orderId, statusData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await api.put(`/orders/${orderId}/status`, statusData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Update order status error:", error);
    throw error;
  }
};

export const getOrderDetails = async (orderId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await api.get(`/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Get order details error:", error);
    throw error;
  }
};

export const getAllOrders = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await api.get('/orders', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Get all orders error:", error);
    throw error;
  }
};

// Payment endpoints
export const createPayment = async (paymentData) => {
  try {
    console.log("Creating payment with data:", paymentData);
    const response = await api.post("/payments/pay", paymentData);
    if (response.data?.redirectUrl) {
      console.log("API: Redirecting to PayPal with URL:", response.data.redirectUrl);
      window.location.href = response.data.redirectUrl;
    }
    return response;
  } catch (error) {
    console.error("createPayment error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};
export const getPaymentStatus = async (orderId) => {
  try {
    console.log("Fetching payment status for order:", orderId);
    const response = await api.get(`/payments/${orderId}`);
    return response;
  } catch (error) {
    console.error("getPaymentStatus error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

// Cart endpoints
export const addToCart = async (data) => {
  const token = getTokenFromCookie();
  if (!token) {
    try {
      if (!data.productId || !data.quantity || data.quantity <= 0) {
        throw new Error("Invalid cart data: Product ID and quantity are required");
      }
      console.log("Adding to cart locally with data:", data);
      let localCart = JSON.parse(localStorage.getItem("cart")) || [];
      const existingItemIndex = localCart.findIndex((item) => item._id === data.productId);
      if (existingItemIndex !== -1) {
        localCart[existingItemIndex].quantity += data.quantity;
      } else {
        localCart.push({
          _id: data.productId,
          quantity: data.quantity,
          name: data.name || "Unnamed Product",
          price: data.price || 0,
          images: data.images || [],
          stock: data.stock || 0,
          discountApplied: data.discountApplied || false,
          discountedPrice: data.discountedPrice || data.price || 0,
        });
      }
      localStorage.setItem("cart", JSON.stringify(localCart));
      return { message: "Item added to cart locally", cart: localCart };
    } catch (error) {
      console.error("addToCart local error:", error.message);
      throw error;
    }
  }

  try {
    if (!data.productId || !data.quantity || data.quantity <= 0) {
      throw new Error("Invalid cart data: Product ID and quantity are required");
    }
    console.log("Adding to cart with data:", data);
    const response = await api.post("/cart/add", data);
    const cart = await getCart();
    const minimalCart = cart.data.items.map((item) => ({
      _id: item.product._id,
      quantity: item.quantity,
    }));
    localStorage.setItem("cart", JSON.stringify(minimalCart));
    return response;
  } catch (error) {
    console.error("addToCart error:", error.response?.data || error.message);
    throw error;
  }
};

export const getCart = async () => {
  const token = getTokenFromCookie();
  if (!token) {
    const localCart = JSON.parse(localStorage.getItem("cart")) || [];
    console.log("Fetching local cart:", localCart);
    return { data: { items: localCart.map(item => ({ product: item, quantity: item.quantity })) } };
  }

  try {
    console.log("Fetching cart from server");
    const response = await api.get("/cart");
    const minimalCart = response.data.items.map((item) => ({
      _id: item.product._id,
      quantity: item.quantity,
    }));
    localStorage.setItem("cart", JSON.stringify(minimalCart));
    return response;
  } catch (error) {
    console.error("getCart error:", error.response?.data || error.message);
    throw error;
  }
};

export const updateCartItem = async (data) => {
  const token = getTokenFromCookie();
  if (!token) {
    try {
      console.log("Updating cart item locally with data:", data);
      let localCart = JSON.parse(localStorage.getItem("cart")) || [];
      const itemIndex = localCart.findIndex((item) => item._id === data.productId);
      if (itemIndex !== -1) {
        localCart[itemIndex].quantity = data.quantity;
        localStorage.setItem("cart", JSON.stringify(localCart));
        return { message: "Cart updated locally", cart: localCart };
      }
      throw new Error("Item not found in local cart");
    } catch (error) {
      console.error("updateCartItem local error:", error.message);
      throw error;
    }
  }

  try {
    console.log("Updating cart item with data:", data);
    const response = await api.patch("/cart/update", data);
    const cart = await getCart();
    const minimalCart = cart.data.items.map((item) => ({
      _id: item.product._id,
      quantity: item.quantity,
    }));
    localStorage.setItem("cart", JSON.stringify(minimalCart));
    return response;
  } catch (error) {
    console.error("updateCartItem error:", error.response?.data || error.message);
    throw error;
  }
};

export const removeCartItem = async (productId) => {
  const token = getTokenFromCookie();
  if (!token) {
    try {
      console.log("Removing from cart locally, productId:", productId);
      let localCart = JSON.parse(localStorage.getItem("cart")) || [];
      localCart = localCart.filter((item) => item._id !== productId);
      localStorage.setItem("cart", JSON.stringify(localCart));
      return { message: "Item removed from local cart", cart: localCart };
    } catch (error) {
      console.error("removeCartItem local error:", error.message);
      throw error;
    }
  }

  try {
    console.log("Removing from cart, productId:", productId);
    const response = await api.delete(`/cart/remove/${productId}`);
    const cart = await getCart();
    const minimalCart = cart.data.items.map((item) => ({
      _id: item.product._id,
      quantity: item.quantity,
    }));
    localStorage.setItem("cart", JSON.stringify(minimalCart));
    return response;
  } catch (error) {
    console.error("removeCartItem error:", error.response?.data || error.message);
    throw error;
  }
};

export const clearCart = async () => {
  const token = getTokenFromCookie();
  if (!token) {
    try {
      console.log("Clearing local cart");
      localStorage.setItem("cart", JSON.stringify([]));
      return { message: "Local cart cleared" };
    } catch (error) {
      console.error("clearCart local error:", error.message);
      throw error;
    }
  }

  try {
    console.log("Clearing cart on server");
    const response = await api.delete("/cart/clear");
    localStorage.setItem("cart", JSON.stringify([]));
    return response;
  } catch (error) {
    console.error("clearCart error:", error.response?.data || error.message);
    throw error;
  }
};

export const syncLocalCartWithBackend = async (localCart) => {
  try {
    console.log("Syncing local cart with Backend:", localCart);
    if (!Array.isArray(localCart) || localCart.length === 0) {
      console.log("No items to sync");
      return { message: "No items to sync" };
    }

    const minimalCart = localCart
      .filter((item) => item._id && item.quantity && !item._id.startsWith("local_"))
      .map((item) => ({
        productId: item._id,
        quantity: item.quantity,
        name: item.name,
        price: item.price,
        images: item.images,
        stock: item.stock,
        discountApplied: item.discountApplied,
        discountedPrice: item.discountedPrice,
      }));

    await clearCart();
    for (const item of minimalCart) {
      if (!item.productId || !item.quantity) {
        console.warn("Invalid cart item, skipping:", item);
        continue;
      }
      await addToCart(item);
    }

    const response = await getCart();
    return response;
  } catch (error) {
    console.error("syncLocalCartWithBackend error:", error.response?.data || error.message);
    throw error;
  }
};

// Auth endpoint
export const logout = async () => {
  try {
    console.log("Logging out");
    const response = await api.post("/auth/logout");
    document.cookie = `token=;expires=${new Date(0).toUTCString()};path=/;SameSite=Strict;domain=${window.location.hostname}`;
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.setItem("cart", JSON.stringify([]));
    return response;
  } catch (error) {
    console.error("logout error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

// Product section endpoints
export const getJustArrivedProducts = () => api.get("/products/just-arrived");
export const getTrandyProducts = () => api.get("/products/trandy");

// Reviews endpoint
export const getReviewsByProductId = async (id) => {
  try {
    console.log(`Fetching reviews for product ID: ${id}`);
    const response = await api.get(`/reviews/product/${id}`);
    return response;
  } catch (error) {
    console.error("getReviewsByProductId error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export default api;