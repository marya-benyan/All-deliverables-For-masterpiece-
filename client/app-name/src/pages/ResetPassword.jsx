import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  // Regular expression for password validation
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions while submitting
    if (isSubmitting) return;

    // Password validation
    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must be at least 8 characters, including an uppercase letter, a lowercase letter, a number, and a special character",
        { position: "top-right" }
      );
      return;
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      toast.error("Password and confirm password do not match", {
        position: "top-right",
      });
      return;
    }

    setLoading(true);
    setIsSubmitting(true);

    try {
      await resetPassword(token, password);
      toast.success("Password reset successfully!", {
        position: "top-right",
      });
      setTimeout(() => {
        navigate("/login");
        setLoading(false);
        setIsSubmitting(false);
      }, 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      toast.error("Error: " + errorMessage, {
        position: "top-right",
      });
      if (errorMessage.includes("Invalid or expired")) {
        setTimeout(() => {
          navigate("/forgot-password");
        }, 3000);
      }
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-gray-50 overflow-hidden">
      <ToastContainer />
      <div
        className="absolute top-0 left-0 w-64 h-64 rounded-full bg-opacity-30"
        style={{ backgroundColor: "white" }}
      ></div>
      <div
        className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-opacity-30"
        style={{ backgroundColor: "white" }}
      ></div>

      <div className="relative bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-8" style={{ color: "#bc7265" }}>
          Reset Password
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-6 relative">
            <label className="text-sm font-medium mb-1 block" style={{ color: "#bc7265" }}>
              New Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-gray-50 border-b-2 rounded-lg focus:outline-none text-gray-800"
                style={{ borderColor: "#b8e0ec" }}
                placeholder="Enter your new password"
                disabled={loading}
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
            <p className="text-xs text-gray-500 mt-2">
              Password must be at least 8 characters, including an uppercase letter, a lowercase letter, a number, and a special character.
            </p>
          </div>

          <div className="mb-6 relative">
            <label className="text-sm font-medium mb-1 block" style={{ color: "#bc7265" }}>
              Confirm Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 bg-gray-50 border-b-2 rounded-lg focus:outline-none text-gray-800"
                style={{ borderColor: "#b8e0ec" }}
                placeholder="Confirm your new password"
                disabled={loading}
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
            className="w-full p-3 text-white rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50"
            style={{ background: `linear-gradient(to right, #bc7265, #d39c94)` }}
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;