import React, { useState, useEffect } from "react";
import axios from "axios";

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyTexts, setReplyTexts] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [messagesPerPage] = useState(5);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/contact/admin/contact-messages", {
          withCredentials: true,
        });
        setMessages(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load messages");
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const handleReplyChange = (messageId, value) => {
    setReplyTexts(prev => ({
      ...prev,
      [messageId]: value
    }));
  };

  const handleReply = async (messageId) => {
    const reply = replyTexts[messageId];
    if (!reply) {
      alert("Please enter a reply");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/contact/admin/contact-messages/${messageId}/reply`,
        { reply },
        { withCredentials: true }
      );
      const updatedMessage = response.data.data;
      setMessages((prev) =>
        prev.map((msg) => (msg._id === updatedMessage._id ? updatedMessage : msg))
      );
      
      setReplyTexts(prev => {
        const newReplyTexts = {...prev};
        delete newReplyTexts[messageId];
        return newReplyTexts;
      });
      
      alert("Reply sent successfully");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send reply");
    }
  };

  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = messages.slice(indexOfFirstMessage, indexOfLastMessage);
  const totalPages = Math.ceil(messages.length / messagesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "replied":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d39c94]"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4">Contact Messages</h2>
      
      {messages.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No messages found</div>
      ) : (
        <>
          <ul className="space-y-4 mb-4">
            {currentMessages.map((msg) => (
              <li key={msg._id} className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200 hover:bg-[#b8e0ec]/10 transition duration-200">
                <div className="flex flex-col sm:flex-row justify-between items-start">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center mb-2">
                      <h3 className="font-medium text-base sm:text-lg text-gray-800">{msg.subject}</h3>
                      <span className={`mt-2 sm:mt-0 sm:ml-3 px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadgeClass(msg.status)}`}>
                        {msg.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-gray-800">From:</span> {msg.sender_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-gray-800">Email:</span> {msg.sender_email}
                      </p>
                    </div>
                    
                    <div className="bg-white p-3 rounded border border-gray-200 mb-3">
                      <p className="text-gray-700 whitespace-pre-line text-sm sm:text-base">{msg.message}</p>
                    </div>
                    
                    {msg.reply && (
                      <div className="bg-[#ecf4fc] p-3 rounded border border-[#b8e0ec] mt-3">
                        <p className="text-sm font-medium text-gray-800 mb-1">Your Reply:</p>
                        <p className="text-gray-700 whitespace-pre-line text-sm sm:text-base">{msg.reply}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {msg.status === "pending" && (
                  <div className="mt-4 bg-white p-3 rounded border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reply to this message:
                    </label>
                    <textarea
                      value={replyTexts[msg._id] || ""}
                      onChange={(e) => handleReplyChange(msg._id, e.target.value)}
                      placeholder="Type your reply here"
                      className="w-full p-3 border border-gray-300 rounded focus:ring-[#d39c94] focus:border-[#d39c94] transition duration-200"
                      rows={4}
                    />
                    <button
                      onClick={() => handleReply(msg._id)}
                      className="mt-2 px-4 py-2 bg-[#d39c94] text-white rounded hover:bg-[#bc7265] transition duration-300 focus:outline-none focus:ring-2 focus:ring-[#d39c94] focus:ring-opacity-50"
                    >
                      Send Reply
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-600">
              Showing {indexOfFirstMessage + 1} to {indexOfLastMessage > messages.length ? messages.length : indexOfLastMessage} of {messages.length} messages
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded text-sm sm:text-base ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#ecf4fc] text-gray-700 hover:bg-[#b8e0ec] transition duration-300'
                }`}
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`w-8 h-8 rounded flex items-center justify-center text-sm sm:text-base transition duration-300 ${
                    currentPage === number
                      ? 'bg-[#d39c94] text-white'
                      : 'bg-[#ecf4fc] text-gray-700 hover:bg-[#b8e0ec]'
                  }`}
                >
                  {number}
                </button>
              ))}
              
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded text-sm sm:text-base ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#ecf4fc] text-gray-700 hover:bg-[#b8e0ec] transition duration-300'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default ContactMessages;