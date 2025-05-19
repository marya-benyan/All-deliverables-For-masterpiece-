import React, { useState, useEffect } from 'react';
import { getOrders, getCurrentUser, updateOrderStatus, getOrderDetails } from '../../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import OrderDetailsModal from './OrderDetailsModal';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const navigate = useNavigate();

  // Status configuration
  const statusOptions = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', next: ['processing', 'cancelled'] },
    processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800', next: ['shipped', 'cancelled'] },
    shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-800', next: ['delivered'] },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', next: [] },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', next: [] },
  };

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.email) {
          console.log('Orders: No user in localStorage, fetching current user');
          const response = await getCurrentUser();
          if (response.data && response.data.role === 'admin') {
            localStorage.setItem('user', JSON.stringify(response.data));
          } else {
            throw new Error('User is not an admin');
          }
        } else if (user.role !== 'admin') {
          throw new Error('User is not an admin');
        }
        fetchOrders();
      } catch (error) {
        console.error('Orders: Admin check error:', error.message);
        toast.error('Access Denied: Admin privileges required', { position: 'top-right' });
        document.cookie = `token=;expires=${new Date(0).toUTCString()};path=/;SameSite=Strict;domain=${window.location.hostname}`;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
      }
    };
    checkAdmin();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('Orders: Fetching orders, token in localStorage:', !!localStorage.getItem('token'));
      const response = await getOrders();
      setOrders(Array.isArray(response.data) ? response.data : []);
      console.log('Orders: Orders fetched successfully:', response.data.length);
    } catch (error) {
      console.error('Orders: Fetch orders error:', error.message, error.isAuthError ? '(Auth Error)' : '');
      toast.error(error.message || 'Failed to fetch orders', { position: 'top-right' });
      if (error.isAuthError || error.message.includes('No authentication token found')) {
        document.cookie = `token=;expires=${new Date(0).toUTCString()};path=/;SameSite=Strict;domain=${window.location.hostname}`;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId, currentStatus, newStatus) => {
    try {
      console.log('Orders: Updating status for order:', orderId, 'to:', newStatus);
      await updateOrderStatus(orderId, { status: newStatus });
      toast.success(`Order status updated to ${statusOptions[newStatus].label}`, {
        position: 'top-right',
      });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error('Orders: Update status error:', error.message);
      toast.error(error.message || 'Failed to update order status', { position: 'top-right' });
      if (error.isAuthError) {
        document.cookie = `token=;expires=${new Date(0).toUTCString()};path=/;SameSite=Strict;domain=${window.location.hostname}`;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      console.log('Orders: Fetching details for order:', orderId);
      const response = await getOrderDetails(orderId);
      setSelectedOrder(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Orders: Error fetching order details:', error.message);
      toast.error('Failed to load order details', { position: 'top-right' });
      if (error.isAuthError) {
        document.cookie = `token=;expires=${new Date(0).toUTCString()};path=/;SameSite=Strict;domain=${window.location.hostname}`;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  // Filter and paginate orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const goToPrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-[#d39c94]"></div>
      </div>
    );
  }

  return (
    <section className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">Orders Management</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d39c94] focus:border-[#d39c94] transition text-sm sm:text-base"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <svg
              className="absolute left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d39c94] focus:border-[#d39c94] transition text-sm sm:text-base"
          >
            <option value="all">All Statuses</option>
            {Object.entries(statusOptions).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto mb-6 rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentOrders.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-4 text-center text-sm text-gray-500">
                  No orders found matching your criteria
                </td>
              </tr>
            ) : (
              currentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order._id.slice(-8)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.user?.email || 'Guest'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.totalAmount?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        statusOptions[order.status]?.color || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {statusOptions[order.status]?.label || order.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, order.status, e.target.value)}
                        className="block w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#d39c94] focus:border-[#d39c94]"
                      >
                        <option value={order.status} disabled>
                          Update status
                        </option>
                        {statusOptions[order.status]?.next.map((nextStatus) => (
                          <option key={nextStatus} value={nextStatus}>
                            Mark as {statusOptions[nextStatus]?.label || nextStatus}
                          </option>
                        ))}
                        {order.status !== 'cancelled' && (
                          <option value="cancelled">Cancel Order</option>
                        )}
                      </select>
                      <button
                        onClick={() => handleViewOrder(order._id)}
                        className="text-[#d39c94] hover:text-[#bc7265] transition p-2"
                        title="View details"
                      >
                        <svg
                          className="h-4 w-4 sm:h-5 sm:w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4 mb-6">
        {currentOrders.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
            <p className="mt-1 text-sm text-gray-500">No orders found matching your criteria</p>
          </div>
        ) : (
          currentOrders.map((order) => (
            <div
              key={order._id}
              className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Order #{order._id.slice(-8)}
                  </h3>
                  <p className="text-xs text-gray-500">{order.user?.email || 'Guest'}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    statusOptions[order.status]?.color || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {statusOptions[order.status]?.label || order.status}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:text-sm">
                <div>
                  <p className="text-gray-500">Amount</p>
                  <p className="font-medium">${order.totalAmount?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="mt-3 flex space-x-2">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, order.status, e.target.value)}
                  className="flex-1 p-1 sm:p-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-2 focus:ring-[#d39c94] focus:border-[#d39c94]"
                >
                  <option value={order.status} disabled>
                    Update status
                  </option>
                  {statusOptions[order.status]?.next.map((nextStatus) => (
                    <option key={nextStatus} value={nextStatus}>
                      Mark as {statusOptions[nextStatus]?.label || nextStatus}
                    </option>
                  ))}
                  {order.status !== 'cancelled' && (
                    <option value="cancelled">Cancel Order</option>
                  )}
                </select>
                <button
                  onClick={() => handleViewOrder(order._id)}
                  className="p-1 sm:p-2 text-[#d39c94] hover:text-[#bc7265] transition rounded-md border border-gray-300"
                  title="View details"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredOrders.length > ordersPerPage && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
          <div className="text-xs sm:text-sm text-gray-600">
            Showing <span className="font-medium">{indexOfFirstOrder + 1}</span> to{' '}
            <span className="font-medium">{Math.min(indexOfLastOrder, filteredOrders.length)}</span> of{' '}
            <span className="font-medium">{filteredOrders.length}</span> orders
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#ecf4fc] text-gray-700 hover:bg-[#b8e0ec] transition'
              }`}
            >
              Previous
            </button>
            {totalPages <= 5 ? (
              Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => paginate(pageNum)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center text-xs sm:text-sm ${
                    currentPage === pageNum
                      ? 'bg-[#d39c94] text-white font-medium'
                      : 'bg-[#ecf4fc] text-gray-700 hover:bg-[#b8e0ec]'
                  }`}
                >
                  {pageNum}
                </button>
              ))
            ) : (
              <>
                <button
                  onClick={() => paginate(1)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center text-xs sm:text-sm ${
                    currentPage === 1
                      ? 'bg-[#d39c94] text-white font-medium'
                      : 'bg-[#ecf4fc] text-gray-700 hover:bg-[#b8e0ec]'
                  }`}
                >
                  1
                </button>
                {currentPage > 3 && (
                  <span className="px-1 flex items-end text-gray-500 text-xs sm:text-sm">...</span>
                )}
                {Array.from({ length: 3 }, (_, i) => currentPage - 1 + i)
                  .filter((num) => num > 1 && num < totalPages)
                  .map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => paginate(pageNum)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center text-xs sm:text-sm ${
                        currentPage === pageNum
                          ? 'bg-[#d39c94] text-white font-medium'
                          : 'bg-[#ecf4fc] text-gray-700 hover:bg-[#b8e0ec]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                {currentPage < totalPages - 2 && (
                  <span className="px-1 flex items-end text-gray-500 text-xs sm:text-sm">...</span>
                )}
                <button
                  onClick={() => paginate(totalPages)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center text-xs sm:text-sm ${
                    currentPage === totalPages
                      ? 'bg-[#d39c94] text-white font-medium'
                      : 'bg-[#ecf4fc] text-gray-700 hover:bg-[#b8e0ec]'
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#ecf4fc] text-gray-700 hover:bg-[#b8e0ec] transition'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setShowDetailsModal(false)}
          onStatusChange={handleStatusChange}
          statusOptions={statusOptions}
        />
      )}
    </section>
  );
};

export default Orders;