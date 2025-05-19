import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

axios.defaults.withCredentials = true;

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [tempUser, setTempUser] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    photo: "",
  });
  const [error, setError] = useState("");
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    location: "",
    type: "",
  });
  const [showEventForm, setShowEventForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users/me");
        const userData = response.data;
        console.log("User Data from API:", userData);
        setUser(userData);
        setTempUser({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          address: userData.address || "",
          bio: userData.bio || "",
          photo: userData.photo || "",
        });
        setEvents(userData.events || []);
      } catch (error) {
        console.error("Error fetching user data:", error.response?.data || error.message);
        setError("Failed to fetch user data. Please try again later.");
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleSave = async () => {
    try {
      const response = await axios.put("http://localhost:5000/api/users/me", tempUser);
      setUser(response.data.user);
      setIsEditing(false);
      setError("");
    } catch (error) {
      console.error("Error updating user data:", error.response?.data || error.message);
      setError("Failed to update user data. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/users/logout");
      console.log("Logout successful");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error.response?.data || error.message);
      setError("Failed to log out. Please try again.");
    }
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setTempUser({ ...user });
    setIsEditing(false);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempUser((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempUser((prev) => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEventChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.location || !newEvent.type) {
      setError("Please fill in all event fields.");
      return;
    }
    setEvents((prev) => [...prev, { ...newEvent, id: Date.now() }]);
    setNewEvent({ title: "", date: "", location: "", type: "" });
    setError("");
    setShowEventForm(false);
  };

  const handleDeleteEvent = (id) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
  };

  const calculateDaysRemaining = (eventDate) => {
    const today = new Date();
    const eventDay = new Date(eventDate);
    const diffTime = eventDay - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString) => {
    const options = { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <p className="text-red-600 text-center font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 w-full px-4 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-colors flex items-center justify-center"
            style={{ backgroundColor: "#d39c94" }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-[#d39c94] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-12 px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-6xl mx-auto border" style={{ borderColor: "#ecf4fc" }}>
          {/* Header */}
          <div className="h-40" style={{ backgroundColor: "#d39c94" }}></div>

          {/* Profile Section */}
          <div className="relative px-6 sm:px-8 lg:px-12 py-8">
            <div className="flex flex-col md:flex-row md:items-end">
              <div className="absolute -top-20 flex justify-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden group-hover:opacity-90 transition-opacity">
                    <img
                      src={tempUser.photo || "https://via.placeholder.com/150"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                    {isEditing && (
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-16 md:mt-0 md:ml-40 flex-grow">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={tempUser.name}
                        onChange={handleChange}
                        className="text-3xl font-bold text-gray-800 border-b-2 border-[#d39c94] px-1 focus:outline-none"
                      />
                    ) : (
                      <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
                    )}
                    <p className="text-sm text-gray-500 mt-1">Member since March 2025</p>
                  </div>

                  <div className="mt-4 md:mt-0 flex space-x-3">
                    {!isEditing ? (
                      <button
                        onClick={handleEdit}
                        className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors shadow-sm"
                        style={{ backgroundColor: "#d39c94" }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        <span>Edit Profile</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleSave}
                          className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors shadow-sm"
                          style={{ backgroundColor: "#c37c73" }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>Save</span>
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-sm"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                          <span>Cancel</span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors shadow-sm"
                      style={{ backgroundColor: "#e53e3e" }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-6 px-6 py-4 bg-red-50 border-l-4 border-red-500 rounded-md">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p className="ml-3 text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* User Details Section */}
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 flex flex-col">
                <div className="bg-[#ecf4fc] rounded-xl p-6 border flex-grow" style={{ borderColor: "#d39c94" }}>
                  <h3 className="font-medium mb-4 flex items-center" style={{ color: "#c37c73" }}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Personal Info
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Bio</div>
                      {isEditing ? (
                        <textarea
                          name="bio"
                          value={tempUser.bio}
                          onChange={handleChange}
                          className="w-full rounded-lg border-gray-300 border p-3 focus:border-[#d39c94] focus:ring focus:ring-[#d39c94] focus:ring-opacity-50 resize-none"
                          rows="5"
                        />
                      ) : (
                        <p className="text-gray-700 leading-relaxed">
                          {user.bio || "No bio available"}
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Member Status</div>
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-gray-700">Active Member</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Member Since</div>
                      <div className="text-gray-700">March 2025</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl p-6 shadow-sm border" style={{ borderColor: "#ecf4fc" }}>
                  <h3 className="font-medium mb-6 flex items-center" style={{ color: "#c37c73" }}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                    </svg>
                    Contact Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</div>
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={tempUser.email}
                          onChange={handleChange}
                          className="w-full rounded-lg border-gray-300 border p-3 focus:border-[#d39c94] focus:ring focus:ring-[#d39c94] focus:ring-opacity-50"
                        />
                      ) : (
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                          </svg>
                          <p className="text-gray-700">{user.email}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Phone</div>
                      {isEditing ? (
                        <input
                          type="text"
                          name="phone"
                          value={tempUser.phone}
                          onChange={handleChange}
                          className="w-full rounded-lg border-gray-300 border p-3 focus:border-[#d39c94] focus:ring focus:ring-[#d39c94] focus:ring-opacity-50"
                        />
                      ) : (
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                          </svg>
                          <p className="text-gray-700">{user.phone || "No phone number"}</p>
                        </div>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Address</div>
                      {isEditing ? (
                        <input
                          type="text"
                          name="address"
                          value={tempUser.address}
                          onChange={handleChange}
                          className="w-full rounded-lg border-gray-300 border p-3 focus:border-[#d39c94] focus:ring focus:ring-[#d39c94] focus:ring-opacity-50"
                        />
                      ) : (
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          </svg>
                          <p className="text-gray-700">{user.address || "No address"}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Events Section */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <svg className="w-6 h-6 mr-2" style={{ color: "#c37c73" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Upcoming Events
                </h2>
                <button
                  onClick={() => setShowEventForm(!showEventForm)}
                  className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors shadow-sm flex items-center"
                  style={{ backgroundColor: "#d39c94" }}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  {showEventForm ? "Cancel" : "Add Event"}
                </button>
              </div>

              {showEventForm && (
                <div className="bg-white rounded-xl p-6 shadow-md border mb-8" style={{ borderColor: "#ecf4fc" }}>
                  <h3 className="text-lg font-medium mb-4" style={{ color: "#c37c73" }}>Add New Event</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                      <input
                        type="text"
                        name="title"
                        value={newEvent.title}
                        onChange={handleEventChange}
                        placeholder="Enter event title"
                        className="w-full rounded-lg border-gray-300 border p-3 focus:border-[#d39c94] focus:ring focus:ring-[#d39c94] focus:ring-opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                      <select
                        name="type"
                        value={newEvent.type}
                        onChange={handleEventChange}
                        className="w-full rounded-lg border-gray-300 border p-3 focus:border-[#d39c94] focus:ring focus:ring-[#d39c94] focus:ring-opacity-50"
                      >
                        <option value="">Select Event Type</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Class">Class</option>
                        <option value="Event">Event</option>
                        <option value="Delivery">Delivery</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                      <input
                        type="datetime-local"
                        name="date"
                        value={newEvent.date}
                        onChange={handleEventChange}
                        className="w-full rounded-lg border-gray-300 border p-3 focus:border-[#d39c94] focus:ring focus:ring-[#d39c94] focus:ring-opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={newEvent.location}
                        onChange={handleEventChange}
                        placeholder="Enter location"
                        className="w-full rounded-lg border-gray-300 border p-3 focus:border-[#d39c94] focus:ring focus:ring-[#d39c94] focus:ring-opacity-50"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <button
                        onClick={handleAddEvent}
                        className="w-full py-3 text-white rounded-lg font-medium hover:opacity-90 transition-colors shadow-sm flex items-center justify-center"
                        style={{ backgroundColor: "#d39c94" }}
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Add Event
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {events.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-12 flex flex-col items-center justify-center border" style={{ borderColor: "#ecf4fc" }}>
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <p className="mt-4 text-gray-600">No upcoming events</p>
                  <button
                    onClick={() => setShowEventForm(true)}
                    className="mt-4 px-4 py-2 border rounded-lg hover:bg-[#ecf4fc] transition-colors"
                    style={{ color: "#c37c73", borderColor: "#d39c94" }}
                  >
                    Schedule your first event
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => {
                    const daysRemaining = calculateDaysRemaining(event.date);
                    return (
                      <div key={event.id} className="bg-white rounded-xl overflow-hidden shadow-sm border hover:shadow-md transition-shadow" style={{ borderColor: "#ecf4fc" }}>
                        <div className="flex flex-col sm:flex-row">
                          <div className={`w-full sm:w-24 p-4 flex items-center justify-center ${
                            daysRemaining <= 3 ? 'bg-red-500' : daysRemaining <= 7 ? 'bg-amber-500' : 'bg-[#d39c94]'
                          } text-white`}>
                            <div className="text-center">
                              <div className="text-3xl font-bold">
                                {event.type === "Workshop" && (
                                  <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                  </svg>
                                )}
                                {event.type === "Class" && (
                                  <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                                  </svg>
                                )}
                                {event.type === "Event" && (
                                  <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                                  </svg>
                                )}
                                {event.type === "Delivery" && (
                                  <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                  </svg>
                                )}
                                {!["Workshop", "Class", "Event", "Delivery"].includes(event.type) && (
                                  <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                  </svg>
                                )}
                              </div>
                              <div className="text-xs mt-1 font-medium uppercase">{event.type}</div>
                            </div>
                          </div>

                          <div className="flex-grow p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                              <div>
                                <h4 className="text-lg font-medium text-gray-800">{event.title}</h4>
                                <div className="flex items-center mt-2 text-gray-600">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                  </svg>
                                  <span className="text-sm">{formatDate(event.date)}</span>
                                </div>
                                <div className="flex items-center mt-1 text-gray-600">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                  </svg>
                                  <span className="text-sm">{event.location}</span>
                                </div>
                              </div>

                              <div className="mt-4 sm:mt-0 flex items-center">
                                <div className={`
                                  px-3 py-1 rounded-full text-sm font-medium
                                  ${daysRemaining <= 3 ? 'bg-red-100 text-red-800' : 
                                    daysRemaining <= 7 ? 'bg-amber-100 text-amber-800' : 
                                    'bg-[#ecf4fc] text-[#c37c73]'}
                                `}>
                                  {daysRemaining === 0 ? "Today" : 
                                   daysRemaining === 1 ? "Tomorrow" : 
                                   `${daysRemaining} days left`}
                                </div>
                                <div className="ml-4 flex space-x-2">
                                  <button className="p-2 text-gray-500 hover:text-[#c37c73] hover:bg-[#ecf4fc] rounded-full transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                                    </svg>
                                  </button>
                                  <button className="p-2 text-gray-500 hover:text-[#c37c73] hover:bg-[#ecf4fc] rounded-full transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                                    </svg>
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteEvent(event.id)}
                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6">
        <button
          className="w-12 h-12 flex items-center justify-center text-white p-3 rounded-full hover:opacity-90 transition shadow-lg"
          style={{ backgroundColor: "#c37c73" }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ↑
        </button>
      </div>
    </div>
  );
};

export default Profile;