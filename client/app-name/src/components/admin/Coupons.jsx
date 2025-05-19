import React, { useState, useEffect } from 'react';
import { getCoupons, addCoupon, updateCoupon, deleteCoupon, getCurrentUser } from '../../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCoupon, setNewCoupon] = useState({ 
    code: '', 
    discount: '', 
    expiryDate: '',
    isActive: true 
  });
  const [editCoupon, setEditCoupon] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [couponsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.email) {
          const response = await getCurrentUser();
          if (response.data && response.data.role === 'admin') {
            localStorage.setItem('user', JSON.stringify(response.data));
          } else {
            throw new Error('User is not an admin');
          }
        } else if (user.role !== 'admin') {
          throw new Error('User is not an admin');
        }
      } catch (error) {
        toast.error('Access Denied: Admin privileges required', { position: 'top-right' });
        navigate('/login');
      }
      fetchCoupons();
    };
    checkAdmin();
  }, [navigate]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await getCoupons();
      setCoupons(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error(`Error: ${error.response?.data?.error || 'Failed to fetch coupons'}`, { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      await addCoupon({
        ...newCoupon,
        discount: parseFloat(newCoupon.discount),
        expiryDate: new Date(newCoupon.expiryDate).toISOString(),
      });
      toast.success('Coupon added successfully', { position: 'top-right' });
      setNewCoupon({ code: '', discount: '', expiryDate: '', isActive: true });
      fetchCoupons();
    } catch (error) {
      toast.error(`Error adding coupon: ${error.response?.data?.error || error.message}`, {
        position: 'top-right',
      });
    }
  };

  const handleEditCoupon = async (e) => {
    e.preventDefault();
    try {
      await updateCoupon(editCoupon._id, {
        ...editCoupon,
        discount: parseFloat(editCoupon.discount),
        expiryDate: new Date(editCoupon.expiryDate).toISOString(),
      });
      toast.success('Coupon updated successfully', { position: 'top-right' });
      setIsEditModalOpen(false);
      fetchCoupons();
    } catch (error) {
      toast.error(`Error updating coupon: ${error.response?.data?.error || error.message}`, {
        position: 'top-right',
      });
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await deleteCoupon(couponId);
      toast.success('Coupon deleted successfully', { position: 'top-right' });
      fetchCoupons();
    } catch (error) {
      toast.error(`Error deleting coupon: ${error.response?.data?.error || error.message}`, {
        position: 'top-right',
      });
    }
  };

  const openEditModal = (coupon) => {
    setEditCoupon({
      _id: coupon._id,
      code: coupon.code,
      discount: coupon.discount,
      expiryDate: coupon.expiryDate.split('T')[0],
      isActive: coupon.isActive,
    });
    setIsEditModalOpen(true);
  };

  // Pagination logic
  const indexOfLastCoupon = currentPage * couponsPerPage;
  const indexOfFirstCoupon = indexOfLastCoupon - couponsPerPage;
  const currentCoupons = coupons.slice(indexOfFirstCoupon, indexOfLastCoupon);
  const totalPages = Math.ceil(coupons.length / couponsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d39c94]"></div>
      </div>
    );
  }

  return (
    <section className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-[#ecf4fc] max-w-7xl mx-auto">
      <h2 className="text-lg sm:text-2xl font-semibold text-[#bc7265] mb-4 sm:mb-6 pb-2 border-b-2 border-[#d39c94]">
        Coupons Management
      </h2>

      {/* Add Coupon Form */}
      <form onSubmit={handleAddCoupon} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 bg-[#ecf4fc] p-4 sm:p-6 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
          <input
            type="text"
            placeholder="SUMMER20"
            value={newCoupon.code}
            onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d39c94] w-full text-sm sm:text-base"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
          <input
            type="number"
            placeholder="10"
            value={newCoupon.discount}
            onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d39c94] w-full text-sm sm:text-base"
            required
            min="1"
            max="100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
          <input
            type="date"
            value={newCoupon.expiryDate}
            onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d39c94] w-full text-sm sm:text-base"
            required
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full bg-[#d39c94] text-white p-2 rounded-lg hover:bg-[#bc7265] transition duration-300 text-sm sm:text-base"
          >
            Add Coupon
          </button>
        </div>
      </form>

      {/* Edit Coupon Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 sm:px-0">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-xl font-semibold text-[#bc7265]">Edit Coupon</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditCoupon} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input
                  type="text"
                  value={editCoupon.code}
                  onChange={(e) => setEditCoupon({ ...editCoupon, code: e.target.value })}
                  className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d39c94] w-full text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                <input
                  type="number"
                  value={editCoupon.discount}
                  onChange={(e) => setEditCoupon({ ...editCoupon, discount: e.target.value })}
                  className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d39c94] w-full text-sm sm:text-base"
                  required
                  min="1"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={editCoupon.expiryDate}
                  onChange={(e) => setEditCoupon({ ...editCoupon, expiryDate: e.target.value })}
                  className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d39c94] w-full text-sm sm:text-base"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editCoupon.isActive}
                  onChange={(e) => setEditCoupon({ ...editCoupon, isActive: e.target.checked })}
                  className="h-4 w-4 text-[#d39c94] focus:ring-[#d39c94] border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Active Coupon
                </label>
              </div>
              <div className="flex justify-end space-x-2 sm:space-x-3 pt-3 sm:pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#d39c94] text-white rounded-lg hover:bg-[#bc7265] transition text-sm sm:text-base"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupons Display */}
      <div className="mb-4">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#ecf4fc]">
              <tr>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-[#bc7265] uppercase tracking-wider">
                  Code
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-[#bc7265] uppercase tracking-wider">
                  Discount
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-[#bc7265] uppercase tracking-wider">
                  Expiry Date
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-[#bc7265] uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-right text-xs sm:text-sm font-medium text-[#bc7265] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentCoupons.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 sm:px-6 py-4 text-center text-sm text-gray-500">
                    No coupons found
                  </td>
                </tr>
              ) : (
                currentCoupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {coupon.code}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {coupon.discount}%
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(coupon.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        coupon.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(coupon)}
                        className="mr-2 sm:mr-3 text-[#d39c94] hover:text-[#bc7265]"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15.828l-2.828.586.586-2.828L16.414 6.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon._id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {currentCoupons.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">No coupons found</div>
          ) : (
            currentCoupons.map((coupon) => (
              <div
                key={coupon._id}
                className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition duration-150"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{coupon.code}</h3>
                    <p className="text-xs text-gray-500">Discount: {coupon.discount}%</p>
                    <p className="text-xs text-gray-500">
                      Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(coupon)}
                      className="text-[#d39c94] hover:text-[#bc7265]"
                      title="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15.828l-2.828.586.586-2.828L16.414 6.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteCoupon(coupon._id)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    coupon.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {coupons.length > couponsPerPage && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 sm:gap-4">
          <div className="text-xs sm:text-sm text-gray-600">
            Showing {indexOfFirstCoupon + 1} to {Math.min(indexOfLastCoupon, coupons.length)} of {coupons.length} coupons
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm ${
                currentPage === 1 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-[#ecf4fc] text-gray-700 hover:bg-[#b8e0ec] transition'
              }`}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-xs sm:text-sm transition ${
                  currentPage === number 
                    ? 'bg-[#d39c94] text-white' 
                    : 'bg-[#ecf4fc] text-gray-700 hover:bg-[#b8e0ec]'
                }`}
              >
                {number}
              </button>
            ))}
            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm ${
                currentPage === totalPages 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-[#ecf4fc] text-gray-700 hover:bg-[#b8e0ec] transition'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Coupons;