import React, { useState } from "react";
import { addCustomProduct } from "../services/api";
import { toast } from "react-toastify";

const CreateCustomProduct = () => {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [giftType, setGiftType] = useState("");
  const [messageType, setMessageType] = useState("text");
  const [textMessage, setTextMessage] = useState("");
  const [audioMessage, setAudioMessage] = useState(null);
  const [videoMessage, setVideoMessage] = useState(null);
  const [audioPreview, setAudioPreview] = useState("");
  const [videoPreview, setVideoPreview] = useState("");
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviewImages(files.map((file) => URL.createObjectURL(file)));
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioMessage(file);
      setAudioPreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoMessage(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!productName || !description) {
        throw new Error("Please fill all required fields: name, description");
      }

      const formData = new FormData();
      formData.append("name", productName);
      formData.append("designDescription", description);
      if (giftType) formData.append("giftType", giftType);
      formData.append("messageType", messageType);

      if (messageType === "text") {
        formData.append("textMessage", textMessage);
      } else if (messageType === "audio" && audioMessage) {
        formData.append("audioMessage", audioMessage);
      } else if (messageType === "video" && videoMessage) {
        formData.append("videoMessage", videoMessage);
      }

      images.forEach((image) => {
        formData.append("images", image);
      });

      await addCustomProduct(formData);

      toast.success(
        "✅ Your custom request has been submitted successfully! It will be reviewed soon.",
        {
          position: "top-right",
          autoClose: 5000,
        }
      );

      // Reset all fields after successful submission
      setProductName("");
      setDescription("");
      setGiftType("");
      setMessageType("text");
      setTextMessage("");
      setAudioMessage(null);
      setVideoMessage(null);
      setAudioPreview("");
      setVideoPreview("");
      setImages([]);
      setPreviewImages([]);
    } catch (error) {
      console.error("Error creating custom product:", error);
      const errorMessage =
        error.response?.data?.error || error.message || "An unknown error occurred";
      toast.error("Error creating request: " + errorMessage, {
        position: "top-right",
      });
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 bg-gray-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-[]"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[] "></div>
      <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-[#d39c94] bg-opacity-10 filter blur-3xl"></div>

      <div className="max-w-3xl mx-auto">
        {/* Card header with decorative line */}
        <div className="h-2 bg-[#d39c94] rounded-t-xl"></div>
        
        {/* Main content card */}
        <div className="bg-white rounded-b-xl shadow-xl p-8 sm:p-10 relative z-10">
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white w-20 h-20 rounded-full flex items-center justify-center shadow-lg border-4 border-[#d39c94]">
            <svg className="w-10 h-10 text-[#d39c94]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-center mt-6 mb-8 text-gray-800">
            Design Your <span className="text-[#d39c94]">Custom Product</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Product Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Product Name *</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  required
                  className="focus:ring-[#d39c94] focus:border-[#d39c94] block w-full pl-10 pr-3 py-3 sm:text-sm border-gray-300 rounded-lg shadow-sm"
                  placeholder="Example: Family Portrait"
                />
              </div>
            </div>

            {/* Design Description Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Design Description *</label>
              <div className="mt-1">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  className="shadow-sm focus:ring-[#d39c94] focus:border-[#d39c94] block w-full sm:text-sm border-gray-300 rounded-lg"
                  placeholder="Describe your design in detail (colors, sizes, specific elements, etc.)"
                />
              </div>
            </div>

            {/* Gift Type Selection Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Gift Type (Optional)</label>
              <div className="mt-1 relative">
                <select
                  value={giftType}
                  onChange={(e) => setGiftType(e.target.value)}
                  className="mt-1 block w-full py-3 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-[#d39c94] focus:border-[#d39c94] sm:text-sm"
                >
                  <option value="Paintings">Paintings</option>
                        <option value="Candles">Candles</option>
                        <option value="Resin">Resin</option>
                        <option value="Office Supplies">Office Supplies</option>
                        <option value="Printed Clothing">Printed Clothing</option>
                        <option value="Beauty Products">Beauty Products</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Reference Images Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Reference Images (Optional)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-[#d39c94] transition-colors duration-200">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#d39c94] hover:text-[#bc7265] focus-within:outline-none">
                      <span>Upload images</span>
                      <input 
                        id="file-upload" 
                        name="file-upload" 
                        type="file" 
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="sr-only" 
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>

              {/* Preview Images */}
              {previewImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {previewImages.map((src, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={src}
                        alt={`Preview ${index + 1}`}
                        className="h-24 w-full object-cover rounded-lg shadow-sm border border-gray-200"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                        <button 
                          type="button" 
                          className="p-1 bg-[#d39c94] text-white rounded-full hover:bg-[#bc7265]"
                          onClick={() => {
                            const updatedPreviews = [...previewImages];
                            const updatedImages = [...images];
                            updatedPreviews.splice(index, 1);
                            updatedImages.splice(index, 1);
                            setPreviewImages(updatedPreviews);
                            setImages(updatedImages);
                          }}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Message Section */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Additional Message (Optional)</label>
              
              {/* Message Type Tabs */}
              <div className="flex p-1 space-x-1 bg-gray-100 rounded-lg w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setMessageType("text")}
                  className={`px-4 py-2 text-sm font-medium rounded-md flex items-center justify-center ${
                    messageType === "text"
                      ? "bg-[#d39c94] text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  } transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d39c94]`}
                >
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Text
                </button>
                <button
                  type="button"
                  onClick={() => setMessageType("audio")}
                  className={`px-4 py-2 text-sm font-medium rounded-md flex items-center justify-center ${
                    messageType === "audio"
                      ? "bg-[#d39c94] text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  } transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d39c94]`}
                >
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Audio
                </button>
                <button
                  type="button"
                  onClick={() => setMessageType("video")}
                  className={`px-4 py-2 text-sm font-medium rounded-md flex items-center justify-center ${
                    messageType === "video"
                      ? "bg-[#d39c94] text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  } transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d39c94]`}
                >
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Video
                </button>
              </div>

              {/* Message Content Based on Type */}
              {messageType === "text" && (
                <textarea
                  value={textMessage}
                  onChange={(e) => setTextMessage(e.target.value)}
                  rows={3}
                  className="shadow-sm focus:ring-[#d39c94] focus:border-[#d39c94] block w-full sm:text-sm border-gray-300 rounded-lg"
                  placeholder="Add comments or special requests"
                />
              )}

              {messageType === "audio" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="audio-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                        </svg>
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload audio</span> or drag and drop</p>
                        <p className="text-xs text-gray-500">MP3, WAV, AAC (MAX. 10mb)</p>
                      </div>
                      <input 
                        id="audio-upload" 
                        type="file" 
                        accept="audio/*" 
                        className="hidden" 
                        onChange={handleAudioChange} 
                      />
                    </label>
                  </div>

                  {audioPreview && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <audio controls className="w-full">
                        <source src={audioPreview} />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                </div>
              )}

              {messageType === "video" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="video-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload video</span> or drag and drop</p>
                        <p className="text-xs text-gray-500">MP4, MOV, AVI (MAX. 50mb)</p>
                      </div>
                      <input 
                        id="video-upload" 
                        type="file" 
                        accept="video/*" 
                        className="hidden" 
                        onChange={handleVideoChange} 
                      />
                    </label>
                  </div>

                  {videoPreview && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <video controls className="w-full rounded-lg shadow-sm">
                        <source src={videoPreview} />
                        Your browser does not support the video element.
                      </video>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-5">
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-white py-3 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d39c94]"
                >
                  Save Draft
                </button>
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#d39c94] hover:bg-[#bc7265] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d39c94]"
                >
                  Submit Design Request
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCustomProduct;