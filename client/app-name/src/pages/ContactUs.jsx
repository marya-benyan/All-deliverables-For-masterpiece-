import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    sender_name: '',
    sender_email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/contact/', formData, {
        withCredentials: true,
      });
      toast.success('Message sent successfully!', { position: 'top-right' });
      setFormData({ sender_name: '', sender_email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.', { position: 'top-right' });
      console.error('Error submitting message:', error);
    }
  };

  return (
    <div className="bg-[#f8f8f8] py-16">
      <div className="container mx-auto px-4">
        {/* Toast Container */}
        <ToastContainer />

        {/* العنوان */}
        <h1 className="text-4xl font-bold text-[#d39c94] text-center mb-8">
          CONTACT US
        </h1>
        <p className="text-lg text-[#d39c94] text-center mb-12">
          Home – Contact
        </p>

        {/* النموذج */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* النموذج */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-[#d39c94] mb-6">
              Contact For Any Queries
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <input
                  type="text"
                  name="sender_name"
                  placeholder="Your Name"
                  value={formData.sender_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#d39c94]"
                  required
                />
              </div>
              <div className="mb-6">
                <input
                  type="email"
                  name="sender_email"
                  placeholder="Your Email"
                  value={formData.sender_email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#d39c94]"
                  required
                />
              </div>
              <div className="mb-6">
                <input
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#d39c94]"
                  required
                />
              </div>
              <div className="mb-6">
                <textarea
                  name="message"
                  placeholder="Message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#d39c94]"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="bg-[#d39c94] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#bc7265] transition duration-300"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* معلومات الاتصال */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-[#d39c94] mb-6">
              Get In Touch
            </h2>
            <p className="text-lg text-[#d39c94] mb-6">
              Justo sed diam ut sed amet duo amet lorem amet stet sed ipsum, sed duo amet et. Est elitr dolor elitr erat sit sit. Dolor diam et erat eilta ipsum justo sed.
            </p>
            <div className="space-y-6">
              {/* Store 1 */}
              <div>
                <h3 className="text-xl font-bold text-[#d39c94] mb-2">Store 1</h3>
                <ul className="text-lg text-[#d39c94]">
                  <li>Jordan - Amman</li>
                  <li>info@example.com</li>
                  <li>+012 345 67890</li>
                </ul>
              </div>

              {/* Store 2 */}
              <div>
                <h3 className="text-xl font-bold text-[#d39c94] mb-2">Store 2</h3>
                <ul className="text-lg text-[#d39c94]">
                  <li>Jordan - Amman</li>
                  <li>info@example.com</li>
                  <li>+012 345 67890</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;