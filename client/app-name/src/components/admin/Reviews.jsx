import React, { useState, useEffect } from 'react';
import { getReviews, deleteReview } from '../../services/api';
import { toast } from 'react-toastify';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(5);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await getReviews();
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Error fetching reviews. Please try again later.', { 
        position: 'top-right',
        autoClose: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      setDeletingId(reviewId);
      await deleteReview(reviewId);
      
      // Optimistic UI update
      setReviews(prev => prev.filter(review => review._id !== reviewId));
      
      toast.success('Review deleted successfully', { 
        position: 'top-right',
        autoClose: 2000
      });
    } catch (error) {
      console.error('Delete error:', error);
      
      let errorMessage = 'Failed to delete review';
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Review not found (may have been deleted already)';
        } else if (error.response.status === 403) {
          errorMessage = 'You are not authorized to delete reviews';
        }
      }
      
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000
      });
      
      // Refresh data if deletion failed
      await fetchReviews();
    } finally {
      setDeletingId(null);
    }
  };

  // Pagination logic
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const goToNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const goToPrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <span 
            key={i} 
            className={`text-sm ${i < rating ? 'text-yellow-500' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
        <span className="ml-1 text-gray-700 text-xs">({rating})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d39c94]"></div>
      </div>
    );
  }

  return (
    <section className="bg-white p-4 sm:p-6 rounded-lg shadow-md max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-700">Customer Reviews</h2>
        <div className="text-sm text-gray-500">
          {reviews.length} total reviews
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No reviews found. Check back later!
        </div>
      ) : (
        <>
          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto mb-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#ecf4fc]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Comment</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentReviews.map((review) => (
                  <tr key={review._id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {review.product?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {review.user?.name || 'Anonymous'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStars(review.rating)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      <div className="line-clamp-2">{review.comment}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(review._id)}
                        disabled={deletingId === review._id}
                        className={`text-red-600 hover:text-red-900 mr-3 ${
                          deletingId === review._id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {deletingId === review._id ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Deleting
                          </span>
                        ) : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-4">
            {currentReviews.map((review) => (
              <div key={review._id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition duration-150">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">
                      {review.product?.name || 'N/A'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      By {review.user?.name || 'Anonymous'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(review._id)}
                    disabled={deletingId === review._id}
                    className={`text-xs px-2 py-1 rounded ${
                      deletingId === review._id 
                        ? 'bg-gray-100 text-gray-400' 
                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                    }`}
                  >
                    {deletingId === review._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
                
                <div className="mt-3">
                  {renderStars(review.rating)}
                </div>
                
                <div className="mt-2">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {review.comment}
                  </p>
                </div>
                
                <div className="mt-3 text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {reviews.length > reviewsPerPage && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstReview + 1} to {Math.min(indexOfLastReview, reviews.length)} of {reviews.length} reviews
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md text-sm ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-[#ecf4fc] text-gray-700 hover:bg-[#d39c94] hover:text-white transition'
                  }`}
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`w-8 h-8 rounded-md flex items-center justify-center text-sm ${
                      currentPage === number
                        ? 'bg-[#d39c94] text-white'
                        : 'bg-[#ecf4fc] text-gray-700 hover:bg-[#b8e0ec] transition'
                    }`}
                  >
                    {number}
                  </button>
                ))}

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md text-sm ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-[#ecf4fc] text-gray-700 hover:bg-[#d39c94] hover:text-white transition'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default Reviews;