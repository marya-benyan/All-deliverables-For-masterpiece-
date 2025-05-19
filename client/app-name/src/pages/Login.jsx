import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

axios.defaults.withCredentials = true;

const Login = ({ showMessage, checkAuth }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/users/login", {
        email,
        password,
      });
      console.log("Login: Login Response:", response.data);

      const { user, message } = response.data;
      console.log("Login: Message:", message);
      console.log("Login: User:", user);

      toast.success(message, { position: "top-right" });
      console.log("Login: Toast executed");

      // تحديث حالة الـ authentication في App.jsx
      await checkAuth();

      // Redirect based on state.from, state.redirect, or role
      const from = location.state?.from?.pathname || location.state?.redirect || "";
      let cart = location.state?.cart || location.state?.from?.cart || [];
      let total = location.state?.total || location.state?.from?.total || 0;

      // Fallback to localStorage if cart is empty
      if (from === "/checkout" && cart.length === 0) {
        const localCart = JSON.parse(localStorage.getItem("cart")) || [];
        if (localCart.length > 0) {
          console.log("Login: Using localStorage cart as fallback", { localCart });
          cart = localCart;
          total = cart
            .reduce((sum, item) => {
              const price = item.discountApplied ? item.discountedPrice : item.price;
              return sum + price * (item.quantity || 1);
            }, 0)
            .toFixed(2);
        }
      }

      console.log("Login: Redirecting", { from, cartLength: cart.length, total, role: user.role });

      if (from === "/checkout") {
        console.log("Login: Navigating to /checkout with cart");
        navigate("/checkout", { state: { cart, total } });
      } else if (user.role === "admin") {
        console.log("Login: Navigating to /admin");
        navigate("/admin");
      } else {
        console.log("Login: Navigating to /profile");
        navigate("/profile");
      }
    } catch (error) {
      console.error("Login: Login error:", error.response?.data || error.message);
      toast.error(
        "خطأ في تسجيل الدخول: " + (error.response?.data?.error || error.message),
        { position: "top-right" }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpClick = () => {
    navigate("/register");
  };

  const handleForgotPasswordClick = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-pink-100 rounded-full opacity-30 -translate-x-1/3 -translate-y-1/3 blur-xl"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-100 rounded-full opacity-30 translate-x-1/3 translate-y-1/3 blur-xl"></div>
      
      {/* Login container */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden">
        {/* Left side - Welcome section */}
        <div className="w-full md:w-1/2 p-6 md:p-8 text-white flex flex-col justify-center relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, #bc7265 0%, #d39c94 100%)",
            }}
          ></div>
          
          <div
            className="hidden md:block absolute inset-0"
            style={{
              background: "linear-gradient(135deg, #bc7265 0%, #d39c94 100%)",
              clipPath: "polygon(0 0, 100% 0, 95% 100%, 0 100%)",
            }}
          ></div>
            
          <div className="relative z-10 p-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">WELCOME BACK!</h2>
            <p className="text-lg md:text-xl opacity-90">Hope you and your family have a great day</p>
            
            <div className="mt-8 md:mt-10 space-y-4">
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 p-2 rounded-full mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Quick and secure login</span>
              </div>
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 p-2 rounded-full mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Access your account instantly</span>
              </div>
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 p-2 rounded-full mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Personalized experience</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Login form */}
        <div className="w-full md:w-1/2 p-6 md:p-8 lg:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8" style={{ color: "#bc7265" }}>
            Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <label className="text-sm font-medium mb-1 block" style={{ color: "#bc7265" }}>
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-gray-50 border-b-2 rounded-lg focus:outline-none focus:border-pink-400 text-gray-800 transition-colors"
                  style={{ borderColor: "#bc7265" }}
                  placeholder="Enter your email"
                  disabled={loading}
                  dir="ltr"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#bc7265" }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="relative">
              <label className="text-sm font-medium mb-1 block" style={{ color: "#bc7265" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-gray-50 border-b-2 rounded-lg focus:outline-none focus:border-pink-400 text-gray-800 transition-colors"
                  style={{ borderColor: "#bc7265" }}
                  placeholder="Enter your password"
                  disabled={loading}
                  dir="ltr"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#bc7265" }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full p-3 text-white rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-md hover:shadow-lg transform hover:-translate-y-1"
              style={{ background: "linear-gradient(to right, #bc7265, #d39c94)" }}
              disabled={loading}
            >
              {loading ? "Logging In..." : "Login"}
            </button>

            <div className="mt-4 text-center">
              <p className="text-gray-600">
                Don’t have an account?{" "}
                <button
                  type="button"
                  onClick={handleSignUpClick}
                  className="font-medium hover:underline"
                  style={{ color: "#bc7265" }}
                >
                  Sign Up
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;