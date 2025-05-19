import React, { useState, useEffect } from 'react';
import { getCustomOrders, updateCustomOrder } from '../../services/api';
import { toast } from 'react-toastify';

const CustomOrders = () => {
  const [customOrders, setCustomOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);

  useEffect(() => {
    fetchCustomOrders();
  }, []);

  const fetchCustomOrders = async () => {
    try {
      setLoading(true);
      const response = await getCustomOrders();
      setCustomOrders(response.data);
    } catch (error) {
      console.error('Error fetching custom orders:', error.response?.data);
      toast.error('Error fetching custom orders', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateCustomOrder(orderId, { status: newStatus });
      toast.success('Order status updated', { position: 'top-right' });
      fetchCustomOrders();
    } catch (error) {
      console.error('Error updating status:', error.response?.data);
      toast.error('Error updating status', { position: 'top-right' });
    }
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = customOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(customOrders.length / ordersPerPage);

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
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'canceled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-[#d39c94]"></div>
      </div>
    );
  }

  return (
    <section className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md w-full max-w-7xl mx-auto">
      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-[#d39c94]">
        Custom Orders
      </h2>

      {customOrders.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm sm:text-base">No custom orders found</div>
      ) : (
        <>
          <div className="mb-4">
            {/* Table for md and larger */}
            <table className="min-w-full table-auto border-collapse hidden md:table">
              <thead>
                <tr className="bg-[#ecf4fc] text-gray-700 uppercase text-xs">
                  <th className="py-2 px-4 text-left rounded-tl-lg">Name</th>
                  <th className="py-2 px-4 text-left">User</th>
                  <th className="py-2 px-4 text-left">Description</th>
                  <th className="py-2 px-4 text-left">Images</th>
                  <th className="py-2 px-4 text-left">Price Range</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order, index) => (
                  <tr
                    key={order._id}
                    className={`border-b border-gray-200 hover:bg-[#b8e0ec]/10 transition duration-150 ${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    }`}
                  >
                    <td className="py-2 px-4 text-sm">{order.name}</td>
                    <td className="py-2 px-4 text-sm">{order.user?.name || 'N/A'}</td>
                    <td className="py-2 px-4">
                      <div className="max-w-xs truncate text-sm">{order.designDescription}</div>
                    </td>
                    <td className="py-2 px-4">
                      {order.images && order.images.length > 0 ? (
                        <div className="flex gap-2 overflow-x-auto">
                          {order.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={`http://localhost:5000/${img}`}
                              alt="Custom Order"
                              className="w-12 h-12 object-cover rounded border border-gray-200"
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 italic text-sm">No Images</span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-sm">
                      ${order.priceRange?.min || 0} - ${order.priceRange?.max || 0}
                    </td>
                    <td className="py-2 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                          order.status
                        )}`}
                      >
                        {order.status === 'قيد التنفيذ' ? 'pending' : order.status === 'مكتمل' ? 'completed' : order.status === 'ملغى' ? 'canceled' : order.status}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(
                            order._id,
                            e.target.value === 'قيد التنفيذ'
                              ? 'pending'
                              : e.target.value === 'مكتمل'
                              ? 'completed'
                              : 'canceled'
                          )
                        }
                        className="p-2 border rounded text-sm border-[#d39c94] bg-white hover:bg-[#ecf4fc] focus:outline-none focus:ring-2 focus:ring-[#d39c94] focus:border-transparent transition-colors duration-200 w-full"
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="canceled">Canceled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Card layout for mobile (below md) */}
            <div className="md:hidden flex flex-col gap-4">
              {currentOrders.map((order) => (
                <div
                  key={order._id}
                  className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm hover:bg-[#b8e0ec]/10 transition duration-150"
                >
                  <div className="flex flex-col gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800">{order.name}</h4>
                      <p className="text-xs text-gray-600">User: {order.user?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 truncate">Description: {order.designDescription}</p>
                    </div>
                    <div>
                      {order.images && order.images.length > 0 ? (
                        <div className="flex gap-2 overflow-x-auto">
                          {order.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={`http://localhost:5000/${img}`}
                              alt="Custom Order"
                              className="w-10 h-10 object-cover rounded border border-gray-200"
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 italic text-xs">No Images</span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">
                        Price Range: ${order.priceRange?.min || 0} - ${order.priceRange?.max || 0}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                          order.status
                        )}`}
                      >
                        {order.status === 'قيد التنفيذ' ? 'pending' : order.status === 'مكتمل' ? 'completed' : order.status === 'ملغى' ? 'canceled' : order.status}
                      </span>
                    </div>
                    <div>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(
                            order._id,
                            e.target.value === 'قيد التنفيذ'
                              ? 'pending'
                              : e.target.value === 'مكتمل'
                              ? 'completed'
                              : 'canceled'
                          )
                        }
                        className="p-1 border rounded text-xs border-[#d39c94] bg-white hover:bg-[#ecf4fc] focus:outline-none focus:ring-2 focus:ring-[#d39c94] focus:border-transparent transition-colors duration-200 w-full"
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="canceled">Canceled</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 space-y-4 sm:space-y-0">
            <div className="text-xs sm:text-sm text-gray-600">
              Showing {indexOfFirstOrder + 1} to{' '}
              {indexOfLastOrder > customOrders.length ? customOrders.length : indexOfLastOrder} of{' '}
              {customOrders.length} entries
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className={`px-2 py-1 rounded text-xs sm:text-sm ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#ecf4fc] text-gray-700 hover:bg-[#b8e0ec] transition duration-300'
                }`}
              >
                Previous
              </button>

              {totalPages <= 5 ? (
                Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-xs sm:text-sm transition duration-300 ${
                      currentPage === number
                        ? 'bg-[#d39c94] text-white'
                        : 'bg-[#ecf4fc] text-gray-700 hover:bg-[#b8e0ec]'
                    }`}
                  >
                    {number}
                  </button>
                ))
              ) : (
                <>
                  <button
                    onClick={() => paginate(1)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-xs sm:text-sm transition duration-300 ${
                      currentPage === 1
                        ? 'bg-[#d39c94] text-white'
                        : 'bg-[#ecf4fc] text-gray-700 hover:bg-[#b8e0ec]'
                    }`}
                  >
                    1
                  </button>
                  {currentPage > 3 && <span className="text-xs sm:text-sm">...</span>}
                  {Array.from(
                    { length: 3 },
                    (_, i) => currentPage - 1 + i
                  )
                    .filter((num) => num > 1 && num < totalPages)
                    .map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-xs sm:text-sm transition duration-300 ${
                          currentPage === number
                            ? 'bg-[#d39c94] text-white'
                            : 'bg-[#ecf4fc] text-gray-700 hover:bg-[#b8e0ec]'
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                  {currentPage < totalPages - 2 && <span className="text-xs sm:text-sm">...</span>}
                  <button
                    onClick={() => paginate(totalPages)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-xs sm:text-sm transition duration-300 ${
                      currentPage === totalPages
                        ? 'bg-[#d39c94] text-white'
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
                className={`px-2 py-1 rounded text-xs sm:text-sm ${
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

export default CustomOrders;