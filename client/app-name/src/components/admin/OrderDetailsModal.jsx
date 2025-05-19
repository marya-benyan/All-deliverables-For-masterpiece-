import React from 'react';

const OrderDetailsModal = ({ order, onClose, onStatusChange, statusOptions }) => {
  if (!order) return null;

  // Calculate subtotal
  const subtotal = order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-3 sm:p-4 md:p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Order Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Order Information</h3>
              <div className="space-y-2 text-xs sm:text-sm">
                <p>
                  <span className="font-medium">Order ID:</span> {order._id}
                </p>
                <p>
                  <span className="font-medium">Date & Time:</span>{' '}
                  {new Date(order.createdAt).toLocaleString('en-US')}
                </p>
                <p>
                  <span className="font-medium">Status:</span>
                  <span
                    className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                      statusOptions[order.status]?.color || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {statusOptions[order.status]?.label || order.status}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Payment Method:</span>{' '}
                  {order.paymentMethod || 'Not specified'}
                </p>
                <p>
                  <span className="font-medium">Payment Status:</span>{' '}
                  {order.isPaid ? 'Paid' : 'Not Paid'}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Customer Information</h3>
              <div className="space-y-2 text-xs sm:text-sm">
                <p>
                  <span className="font-medium">Name:</span>{' '}
                  {order.user?.name || order.shippingAddress?.name || 'Guest'}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {order.user?.email || 'Not available'}
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{' '}
                  {order.shippingAddress?.phone || order.user?.phone || 'Not available'}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Shipping Address</h3>
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg text-xs sm:text-sm">
              {order.shippingAddress ? (
                <>
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}
                  </p>
                  <p>
                    {order.shippingAddress.country}, {order.shippingAddress.zipCode}
                  </p>
                </>
              ) : (
                <p>No shipping address specified</p>
              )}
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Order Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                          <img
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded"
                            src={item.product?.image || '/images/placeholder-product.png'}
                            alt={item.product?.name}
                            onError={(e) => {
                              e.target.src = '/images/placeholder-product.png';
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm font-medium text-gray-900">
                          {item.product?.name}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          {item.product?.category}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        ${item.price?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-end">
              <div className="w-full sm:w-1/2 md:w-1/3">
                <div className="flex justify-between py-2 text-xs sm:text-sm">
                  <span className="font-medium">Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {order.discountApplied > 0 && (
                  <div className="flex justify-between py-2 text-xs sm:text-sm">
                    <span className="font-medium">Discount:</span>
                    <span className="text-green-600">-{order.discountApplied}%</span>
                  </div>
                )}
                <div className="flex justify-between py-2 text-xs sm:text-sm">
                  <span className="font-medium">Shipping Cost:</span>
                  <span>${order.shippingPrice?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-200 mt-2 text-sm sm:text-base">
                  <span className="font-medium">Total:</span>
                  <span className="font-medium">${order.totalAmount?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 sm:mt-6 gap-3">
            <div className="w-full sm:w-1/3">
              <label
                htmlFor="status"
                className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
              >
                Change Order Status
              </label>
              <select
                id="status"
                value={order.status}
                onChange={(e) => {
                  onStatusChange(order._id, order.status, e.target.value);
                  onClose();
                }}
                className="block w-full p-1 sm:p-2 text-xs sm:text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#d39c94] focus:border-[#d39c94] rounded-md"
              >
                <option value={order.status} disabled>
                  Select new status
                </option>
                {statusOptions[order.status]?.next.map((nextStatus) => (
                  <option key={nextStatus} value={nextStatus}>
                    Change to {statusOptions[nextStatus]?.label || nextStatus}
                  </option>
                ))}
                {order.status !== 'cancelled' && (
                  <option value="cancelled">Cancel Order</option>
                )}
              </select>
            </div>
            <button
              onClick={onClose}
              className="px-3 sm:px-4 py-1 sm:py-2 bg-[#d39c94] text-white rounded-md hover:bg-[#c58b82] transition text-xs sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;