import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address", {
        position: "top-right",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword({ email });
      
      if (response.data.success) {
        toast.success("A reset link has been sent to your email!", {
          position: "top-right",
        });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error(response.data.message || "An error occurred while sending", {
          position: "top-right",
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 
        "A server error occurred. Please try again later",
        {
          position: "top-right",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLoginClick = () => {
    navigate("/login");
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <ToastContainer />

      {/* Background design */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-0 left-0 w-64 h-64 rounded-full"
          style={{ 
            backgroundColor: "rgba(184, 224, 236, 0.3)", 
            filter: "blur(60px)", 
            transform: "translate(-30%, -30%)" 
          }}
        ></div>
        <div
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full"
          style={{ 
            backgroundColor: "rgba(211, 156, 148, 0.3)", 
            filter: "blur(70px)", 
            transform: "translate(30%, 30%)" 
          }}
        ></div>
      </div>

      {/* Form card */}
      <div className="relative bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold" style={{ color: "#bc7265" }}>
            Forgot Password
          </h2>
          <p className="text-gray-600 mt-2">
            Enter your email to receive a password reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label 
              htmlFor="email" 
              className="block text-sm font-medium"
              style={{ color: "#bc7265" }}
            >
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                style={{ borderColor: "#b8e0ec" }}
                placeholder="example@domain.com"
                disabled={loading}
              />
              <div 
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                style={{ color: "#bc7265" }}
              >
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

          <button
            type="submit"
            className={`w-full p-3 text-white rounded-lg font-semibold transition-all ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"
            }`}
            style={{ background: "linear-gradient(to right, #bc7265, #d39c94)" }}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sending...
              </span>
            ) : (
              "Send Reset Link"
            )}
          </button>

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={handleBackToLoginClick}
              className="text-sm font-medium hover:underline"
              style={{ color: "#bc7265" }}
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;