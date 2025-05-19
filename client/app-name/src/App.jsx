import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "./services/api";
import NavBar from "./components/NavBar";
import PromoBanner from "./components/PromoBanner";
import ProductCategories from "./components/ProductCategories";
import FeaturesSection from "./components/FeaturesSection";
import HeroBanner from "./components/HeroBanner";
import TrandyProducts from "./components/TrandyProducts";
import NewsletterSection from "./components/NewsletterSection";
import JustArrivedSection from "./components/JustArrivedSection";
import Footer from "./components/Footer";
import ContactUs from "./pages/ContactUs";
import AboutUs from "./pages/AboutUs";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ShopPage from "./pages/ShopPage";
import Profile from "./pages/Profile";
import ShoppingCart from "./pages/ShoppingCart";
import Wishlist from "./pages/Wishlist";
import ShopDetail from "./pages/ShopDetail";
import CreateCustomProduct from "./pages/CreateCustomProduct";
import OrderHistory from "./pages/OrderHistory";
import PaymentPage from "./pages/PaymentPage";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import AdminDashboard from "./pages/AdminDashboard";
import Products from "./components/admin/Products";
import CustomOrders from "./components/admin/CustomOrders";
import Users from "./components/admin/Users";
import Reviews from "./components/admin/Reviews";
import Categories from "./components/admin/Categories";
import ContactMessages from "./components/admin/ContactMessages";
import Coupons from "./components/admin/Coupons";
import Orders from "./components/admin/Orders";
import DashboardContent from "./pages/DashboardContent";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
      console.warn(`App: Clearing cookie: ${cookieName} (size: ${c.length} bytes)`);
      document.cookie = `${cookieName}=;expires=${new Date(0).toUTCString()};path=/;SameSite=Strict;domain=${window.location.hostname}`;
    }
  });

  if (totalSize > 2000) {
    console.warn(`App: Total cookie size ${totalSize} bytes exceeds 2000, clearing all cookies`);
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
  console.log(`App: After clearing, total cookie size: ${finalSize} bytes`, { cookies: finalCookies });
};

// Periodic cookie cleanup
const setupCookieCleanup = () => {
  const interval = setInterval(() => {
    const cookies = document.cookie.split("; ");
    const totalSize = cookies.reduce((sum, c) => sum + c.length, 0);
    if (totalSize > 2000) {
      console.warn(`App: Periodic cleanup triggered, total cookie size: ${totalSize} bytes`);
      clearProblematicCookies();
    }
  }, 15000);
  return () => clearInterval(interval);
};

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="text-center py-10 text-red-500">An error occurred. Please reload the page.</div>;
    }
    return this.props.children;
  }
}

// Layout for most pages with NavBar and Footer
const DefaultLayout = React.memo(({ children, isAuthenticated, userRole, message, setMessage }) => {
  const location = useLocation();
  console.log("DefaultLayout: Rendering", {
    path: location.pathname,
    isAuthenticated,
    userRole,
  });

  if (location.pathname === "/") {
    console.log("DefaultLayout: Skipping additional NavBar rendering for root path");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar isAuthenticated={isAuthenticated} userRole={userRole} />
      {message && (
        <div className="fixed top-0 left-0 right-0 bg-green-500 text-white p-4 text-center z-50">
          {message}
        </div>
      )}
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
});

// Layout for auth pages (Login, Register) without NavBar and Footer
const AuthLayout = React.memo(({ children, message, setMessage }) => {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-white py-6 sm:py-8">
      {message && (
        <div className="fixed top-0 left-0 right-0 bg-green-500 text-white p-4 text-center z-50">
          {message}
        </div>
      )}
      {children}
    </div>
  );
});

const App = () => {
  const [message, setMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("cart")) || []);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    console.log("App: Loading cart from localStorage");
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log("App: Saving cart to localStorage", cart);
      localStorage.setItem("cart", JSON.stringify(cart));
    }, 500);
    return () => clearTimeout(timeout);
  }, [cart]);

  useEffect(() => {
    return setupCookieCleanup();
  }, []);

  const checkAuth = useCallback(async () => {
    console.log("App: checkAuth starting...");
    try {
      clearProblematicCookies();

      const cachedUser = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");
      if (cachedUser && token) {
        console.log("App: Using cached user data", cachedUser);
        setIsAuthenticated(true);
        setUserRole(cachedUser.role);
        setIsCheckingAuth(false);

        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        if (decodedToken.exp < currentTime) {
          console.log("App: Token expired, clearing session");
          toast.info("Session expired, please log in again.", {
            position: "top-right",
            autoClose: 5000,
          });
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          setUserRole(null);
          return;
        }

        try {
          const response = await getCurrentUser();
          console.log("App: Server validation success, user:", response.data);
          localStorage.setItem("user", JSON.stringify(response.data));
          setUserRole(response.data.role);
        } catch (serverError) {
          if (serverError.response?.status === 431) {
            console.warn("App: 431 error during server validation, clearing cookies...");
            clearProblematicCookies();
            try {
              const retryResponse = await getCurrentUser();
              console.log("App: Retry server validation success, user:", retryResponse.data);
              localStorage.setItem("user", JSON.stringify(retryResponse.data));
              setUserRole(retryResponse.data.role);
            } catch (retryError) {
              console.error("App: Retry server validation failed:", retryError);
              toast.warn("Request headers too large, cookies cleared. Please try again.", {
                position: "top-right",
                autoClose: 5000,
              });
              setIsAuthenticated(false);
              setUserRole(null);
            }
          } else if (serverError.response?.status === 401) {
            console.log("App: Server validation failed, clearing session");
            toast.info("Session invalid, please log in again.", {
              position: "top-right",
              autoClose: 5000,
            });
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            setIsAuthenticated(false);
            setUserRole(null);
          } else {
            throw serverError;
          }
        }
        return;
      }

      const response = await getCurrentUser();
      console.log("App: checkAuth success, user:", response.data);
      setIsAuthenticated(true);
      setUserRole(response.data.role);
      localStorage.setItem("user", JSON.stringify(response.data));
    } catch (error) {
      console.error("App: checkAuth failed:", {
        status: error.response?.status,
        error: error.response?.data?.error || error.message,
      });
      setIsAuthenticated(false);
      setUserRole(null);
      if (error.response?.status === 431) {
        console.warn("App: 431 error, clearing cookies and retrying...");
        clearProblematicCookies();
        try {
          const retryResponse = await getCurrentUser();
          console.log("App: Retry checkAuth success, user:", retryResponse.data);
          setIsAuthenticated(true);
          setUserRole(retryResponse.data.role);
          localStorage.setItem("user", JSON.stringify(retryResponse.data));
        } catch (retryError) {
          console.error("App: Retry checkAuth failed:", retryError);
          toast.warn("Request headers too large, cookies cleared. Please try again.", {
            position: "top-right",
            autoClose: 5000,
          });
        }
      } else if (error.isAuthError || error.response?.status === 401) {
        console.log("App: Handling unauthorized error");
        toast.info("Session expired, please log in again.", {
          position: "top-right",
          autoClose: 5000,
        });
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } else {
        toast.error("Failed to verify session. Please try again.", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } finally {
      console.log("App: checkAuth completed, setting isCheckingAuth to false");
      setIsCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    if (isCheckingAuth && isAuthenticated === null) {
      checkAuth();
    }
  }, [checkAuth, isCheckingAuth, isAuthenticated]);

  const ProtectedRoute = React.memo(({ children, userRole }) => {
    const location = useLocation();
    console.log("ProtectedRoute: Checking", {
      isAuthenticated,
      userRole,
      path: location.pathname,
      isCheckingAuth,
    });

    if (location.pathname === "/payment") {
      if (!isAuthenticated) {
        toast.info("Please log in to proceed with payment.");
        return <Navigate to="/login" state={{ from: location }} replace />;
      }
      return children;
    }

    if (isCheckingAuth || isAuthenticated === null) {
      return <div className="text-center py-10">Loading...</div>;
    }

    const localCart = JSON.parse(localStorage.getItem("cart")) || [];
    const token = localStorage.getItem("token");

    if (location.pathname === "/ShoppingCart" || location.pathname === "/wishlist") {
      console.log("ProtectedRoute: Allowing", location.pathname, {
        cartLength: localCart.length,
        tokenExists: !!token,
      });
      return children;
    }

    if (location.pathname === "/checkout") {
      if (localCart.length > 0) {
        console.log("ProtectedRoute: Allowing", location.pathname, {
          cartLength: localCart.length,
          tokenExists: !!token,
        });
        return children;
      } else {
        console.log("ProtectedRoute: Cart is empty, redirecting to ShoppingCart from", location.pathname);
        toast.warn("Your cart is empty. Add items before proceeding.", {
          position: "top-right",
          autoClose: 5000,
        });
        return <Navigate to="/ShoppingCart" replace />;
      }
    }

    if (!isAuthenticated) {
      console.log("ProtectedRoute: Redirecting to /login from", location.pathname);
      toast.info("Please log in to access this page.", {
        position: "top-right",
        autoClose: 5000,
      });
      return (
        <Navigate
          to="/login"
          state={{ from: location, cart: localCart }}
          replace
        />
      );
    }

    if (userRole === "admin" && location.pathname === "/profile") {
      console.log("ProtectedRoute: Redirecting admin to /admin");
      return <Navigate to="/admin" replace />;
    }
    return children;
  });

  const AdminRoute = React.memo(({ children }) => {
    const location = useLocation();
    console.log("AdminRoute: Checking", {
      isAuthenticated,
      userRole,
      path: location.pathname,
      isCheckingAuth,
    });

    if (isCheckingAuth || isAuthenticated === null) {
      return <div className="text-center py-10">Loading...</div>;
    }
    if (!isAuthenticated) {
      console.log("AdminRoute: Redirecting to /login from", location.pathname);
      toast.info("Please log in to access the admin panel.", {
        position: "top-right",
        autoClose: 5000,
      });
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    if (userRole !== "admin") {
      console.log("AdminRoute: Redirecting to /profile");
      toast.warn("Access denied. You are not an admin.", {
        position: "top-right",
        autoClose: 5000,
      });
      return <Navigate to="/profile" replace />;
    }
    return children;
  });

  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          <Route
            path="/"
            element={
              <DefaultLayout
                isAuthenticated={isAuthenticated}
                userRole={userRole}
                message={message}
                setMessage={setMessage}
              >
                {isCheckingAuth || isAuthenticated === null ? (
                  <div className="text-center py-10">Loading...</div>
                ) : (
                  <>
                    <HeroBanner />
                    <FeaturesSection />
                    <ProductCategories />
                    <PromoBanner />
                    <TrandyProducts />
                    <NewsletterSection />
                    <JustArrivedSection />
                  </>
                )}
              </DefaultLayout>
            }
          />
          <Route
            path="/about"
            element={
              <DefaultLayout
                isAuthenticated={isAuthenticated}
                userRole={userRole}
                message={message}
                setMessage={setMessage}
              >
                <AboutUs />
              </DefaultLayout>
            }
          />
          <Route
            path="/contact"
            element={
              <DefaultLayout
                isAuthenticated={isAuthenticated}
                userRole={userRole}
                message={message}
                setMessage={setMessage}
              >
                <ContactUs />
              </DefaultLayout>
            }
          />
          <Route
            path="/login"
            element={
              <AuthLayout message={message} setMessage={setMessage}>
                {isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <Login showMessage={setMessage} checkAuth={checkAuth} />
                )}
              </AuthLayout>
            }
          />
          <Route
            path="/register"
            element={
              <AuthLayout message={message} setMessage={setMessage}>
                <Register showMessage={setMessage} />
              </AuthLayout>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <DefaultLayout
                isAuthenticated={isAuthenticated}
                userRole={userRole}
                message={message}
                setMessage={setMessage}
              >
                <ForgotPassword />
              </DefaultLayout>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <DefaultLayout
                isAuthenticated={isAuthenticated}
                userRole={userRole}
                message={message}
                setMessage={setMessage}
              >
                <ResetPassword />
              </DefaultLayout>
            }
          />
          <Route
            path="/shop"
            element={
              <DefaultLayout
                isAuthenticated={isAuthenticated}
                userRole={userRole}
                message={message}
                setMessage={setMessage}
              >
                <ShopPage />
              </DefaultLayout>
            }
          />
          <Route
            path="/ShopDetail/:id"
            element={
              <DefaultLayout
                isAuthenticated={isAuthenticated}
                userRole={userRole}
                message={message}
                setMessage={setMessage}
              >
                <ShopDetail cart={cart} setCart={setCart} isAuthenticated={isAuthenticated} />
              </DefaultLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <DefaultLayout
                isAuthenticated={isAuthenticated}
                userRole={userRole}
                message={message}
                setMessage={setMessage}
              >
                <ProtectedRoute userRole={userRole}>
                  <Profile />
                </ProtectedRoute>
              </DefaultLayout>
            }
          />
          <Route
            path="/ShoppingCart"
            element={
              <DefaultLayout
                isAuthenticated={isAuthenticated}
                userRole={userRole}
                message={message}
                setMessage={setMessage}
              >
                <ShoppingCart cart={cart} setCart={setCart} isAuthenticated={isAuthenticated} />
              </DefaultLayout>
            }
          />
          <Route
            path="/checkout"
            element={
              <DefaultLayout
                isAuthenticated={isAuthenticated}
                userRole={userRole}
                message={message}
                setMessage={setMessage}
              >
                <ProtectedRoute userRole={userRole}>
                  <Checkout cart={cart} setCart={setCart} setMessage={setMessage} />
                </ProtectedRoute>
              </DefaultLayout>
            }
          />
          <Route
            path="/wishlist"
            element={
              <DefaultLayout
                isAuthenticated={isAuthenticated}
                userRole={userRole}
                message={message}
                setMessage={setMessage}
              >
                <Wishlist />
              </DefaultLayout>
            }
          />
          <Route
            path="/custom-product"
            element={
              <DefaultLayout
                isAuthenticated={isAuthenticated}
                userRole={userRole}
                message={message}
                setMessage={setMessage}
              >
                <ProtectedRoute userRole={userRole}>
                  <CreateCustomProduct />
                </ProtectedRoute>
              </DefaultLayout>
            }
          />
          <Route
            path="/orders"
            element={
              <DefaultLayout
                isAuthenticated={isAuthenticated}
                userRole={userRole}
                message={message}
                setMessage={setMessage}
              >
                <ProtectedRoute userRole={userRole}>
                  <OrderHistory />
                </ProtectedRoute>
              </DefaultLayout>
            }
          />
          <Route
            path="/payment"
            element={
              <DefaultLayout
                isAuthenticated={isAuthenticated}
                userRole={userRole}
                message={message}
                setMessage={setMessage}
              >
                <ProtectedRoute userRole={userRole}>
                  <PaymentPage isAuthenticated={isAuthenticated} setMessage={setMessage} />
                </ProtectedRoute>
              </DefaultLayout>
            }
          />
          <Route
            path="/order-confirmation"
            element={
              <DefaultLayout
                isAuthenticated={isAuthenticated}
                userRole={userRole}
                message={message}
                setMessage={setMessage}
              >
                <ProtectedRoute userRole={userRole}>
                  <OrderConfirmation />
                </ProtectedRoute>
              </DefaultLayout>
            }
          />
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          >
            <Route index element={<DashboardContent />} />
            <Route path="products" element={<Products />} />
            <Route path="custom-orders" element={<CustomOrders />} />
            <Route path="users" element={<Users />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="categories" element={<Categories />} />
            <Route path="contact-messages" element={<ContactMessages />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="orders" element={<Orders />} />
          </Route>
          <Route path="*" element={<div className="text-center py-10">Page not found. <a href="/" className="text-blue-500">Go to Home</a></div>} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
};

export default App;