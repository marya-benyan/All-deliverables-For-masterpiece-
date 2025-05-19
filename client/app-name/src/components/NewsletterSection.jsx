import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email", {
        position: "top-right",
        className: "bg-red-500 text-white p-4 rounded-lg shadow-lg max-w-xs",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        ),
      });
      return;
    }

    // Simulate subscription (replace with API call if needed)
    toast.success("Subscribed successfully!", {
      position: "top-right",
      className: "bg-green-500 text-white p-4 rounded-lg shadow-lg max-w-xs",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      ),
    });

    // Clear input
    setEmail("");
  };

  return (
    <div className="bg-[#ecf4fc] py-16">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-black mb-4">
          — Stay Updated —
        </h2>
        <p className="text-lg text-black mb-8">
          Subscribe now to receive the latest news and exclusive offers directly to your inbox.
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row justify-center items-center gap-4"
        >
          <input
            type="email"
            placeholder="Email Goes Here"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full md:w-96 px-6 py-3 border border-black focus:outline-none focus:ring-2 focus:ring-black"
            required
            dir="ltr"
          />
          <button
            type="submit"
            className="bg-[#d39c94] text-white px-8 py-3 font-semibold hover:bg-[#b77c75] transition duration-300"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewsletterSection;