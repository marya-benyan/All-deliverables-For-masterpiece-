import React, { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_KEY || "AIzaSyALZx9dbdu1eRJZGmKxUQzSUd6KZMxJhLw");

const Footer = () => {
  const [showChatbot, setShowChatbot] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(input);
      const aiReply =
        result.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I'm sorry, I couldn't generate a response.";
      setMessages([...newMessages, { role: "assistant", content: aiReply }]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      toast.error("Failed to fetch AI response. Please try again.");
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Error: Unable to fetch response." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    scrollToTop();
  };

  return (
    <footer className="bg-gradient-to-b from-[#f8fafc] to-[#e2e8f0] text-gray-800 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold flex items-center">
              <span className="bg-gradient-to-r from-[#f0e6e6] to-[#e6d6d6] text-[#d39c94] px-3 py-1 rounded-lg text-xl font-bold mr-2 shadow-sm">
                E
              </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">LORA MARYA</span>
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
              Discover premium products crafted with care. We’re dedicated to delivering an exceptional shopping experience tailored to your needs.
            </p>
            <div className="space-y-3">
              <p className="text-sm flex items-center group hover:text-[#d39c94] transition-colors duration-300">
                <FaMapMarkerAlt className="mr-2 text-[#d39c94] group-hover:scale-110 transition-transform" /> Jordan - Amman
              </p>
              <p className="text-sm flex items-center group hover:text-[#d39c94] transition-colors duration-300">
                <FaEnvelope className="mr-2 text-[#d39c94] group-hover:scale-110 transition-transform" /> info@example.com
              </p>
              <p className="text-sm flex items-center group hover:text-[#d39c94] transition-colors duration-300">
                <FaPhone className="mr-2 text-[#d39c94] group-hover:scale-110 transition-transform" /> +012 345 67890
              </p>
            </div>
            <div className="flex space-x-3">
              {[
                { href: "https://facebook.com", icon: <FaFacebookF /> },
                { href: "https://twitter.com", icon: <FaTwitter /> },
                { href: "https://instagram.com", icon: <FaInstagram /> },
                { href: "https://linkedin.com", icon: <FaLinkedinIn /> },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-[#d39c94] to-[#c38a83] text-white p-2 rounded-full hover:from-[#b77c75] hover:to-[#a66c65] transition-all duration-300 shadow-md transform hover:scale-105"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200 flex items-center">
              <span className="w-1 h-6 bg-[#d39c94] mr-2 rounded"></span>
              Quick Links
            </h3>
            <ul className="text-sm space-y-3">
              {[
                { name: "Home", path: "/" },
                { name: "Shop", path: "/shop" },
                { name: "About Us", path: "/about" },
                { name: "Contact Us", path: "/contact" },
              ].map((link, index) => (
                <li key={index} className="flex items-center group">
                  <span className="mr-2 text-[#d39c94] transform group-hover:translate-x-1 transition-transform duration-300">›</span>
                  <button
                    onClick={() => handleNavigation(link.path)}
                    className="hover:text-[#d39c94] transition-colors duration-300 focus:outline-none"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200 flex items-center">
              <span className="w-1 h-6 bg-[#d39c94] mr-2 rounded"></span>
              Support
            </h3>
            <ul className="text-sm space-y-3">
              {[
                { name: "FAQ", path: "/faq" },
                { name: "Privacy Policy", path: "/privacy" },
                { name: "Terms of Service", path: "/terms" },
              ].map((link, index) => (
                <li key={index} className="flex items-center group">
                  <span className="mr-2 text-[#d39c94] transform group-hover:translate-x-1 transition-transform duration-300">›</span>
                  <button
                    onClick={() => handleNavigation(link.path)}
                    className="hover:text-[#d39c94] transition-colors duration-300 focus:outline-none"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="text-center mt-12 pt-6 border-t border-gray-200 text-sm">
          <p>
            © <span className="font-semibold">ELORA MARYA</span> {new Date().getFullYear()}. All Rights Reserved. Designed by{" "}
            <span className="text-[#d39c94] font-medium">MARYA</span>
          </p>
        </div>
      </div>
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 bg-white text-[#d39c94] p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
        aria-label="Back to Top"
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
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>
      <button
        onClick={toggleChatbot}
        className="fixed bottom-24 right-8 bg-gradient-to-r from-[#d39c94] to-[#c38a83] text-white p-3 rounded-full shadow-lg hover:from-[#b77c75] hover:to-[#a66c65] transition-all duration-300 transform hover:scale-105"
        aria-label={showChatbot ? "Close Chat" : "Open Chat"}
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
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </button>
      {showChatbot && (
        <div className="fixed bottom-28 right-8 bg-white rounded-xl shadow-2xl w-80 max-w-full overflow-hidden transition-all duration-300 transform translate-y-0 scale-100 opacity-100">
          <div className="bg-gradient-to-r from-[#d39c94] to-[#c38a83] text-white p-4 flex justify-between items-center">
            <h3 className="text-lg font-bold">Smart Assistant</h3>
            <button
              onClick={() => setShowChatbot(false)}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close Chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <div ref={chatContainerRef} className="h-64 overflow-y-auto p-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg shadow-sm ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-[#d39c94] to-[#c38a83] text-white rounded-tr-none"
                      : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start mb-3">
                <div className="bg-white border border-gray-200 text-gray-500 p-3 rounded-lg rounded-tl-none max-w-[80%] shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <form onSubmit={handleChatSubmit} className="p-3 border-t border-gray-200">
            <div className="flex bg-gray-100 rounded-lg overflow-hidden">
              <input
                type="text"
                placeholder="Type your message here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full px-4 py-2 bg-transparent border-none focus:outline-none text-gray-800"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-[#d39c94] to-[#c38a83] text-white px-4 py-2 hover:from-[#b77c75] hover:to-[#a66c65] transition-all duration-300 disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </form>
          <div className="p-2 text-center text-xs text-gray-500 bg-gray-50 border-t border-gray-200">
            Powered by <span className="font-medium">Gemini AI</span>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;