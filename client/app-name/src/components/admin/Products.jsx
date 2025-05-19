import React, { useState, useEffect } from 'react';
import { getProducts, addProduct, getCategories, deleteProduct, updateProduct, getCurrentUser } from '../../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    stock: '',
    images: [],
  });
  const [fileNames, setFileNames] = useState('');
  const [editProduct, setEditProduct] = useState(null);
  const [editFileNames, setEditFileNames] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        console.log('User from localStorage:', user);
        if (!user || !user.email) {
          console.warn('No user in localStorage, fetching from backend');
          const response = await getCurrentUser();
          console.log('getCurrentUser response:', response.data);
          if (response.data && response.data.role === 'admin') {
            localStorage.setItem('user', JSON.stringify(response.data));
          } else {
            throw new Error('User is not an admin');
          }
        } else if (user.role !== 'admin') {
          throw new Error('User is not an admin');
        }
      } catch (error) {
        console.error('Admin check error:', error.response?.data || error.message);
        toast.error('Access Denied: Admin privileges required', { position: 'top-right' });
        navigate('/login');
      }
    };
    checkAdmin();
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const productsResponse = await getProducts({ page: currentPage, limit: 6 });
      console.log('Products Response:', productsResponse.data);
      const fetchedProducts = Array.isArray(productsResponse.data.products) ? productsResponse.data.products : [];
      setProducts(fetchedProducts);
      setTotalPages(productsResponse.data.totalPages || 1);

      const categoriesResponse = await getCategories();
      console.log('Categories Response:', categoriesResponse.data);
      setCategories(Array.isArray(categoriesResponse.data) ? categoriesResponse.data : []);
    } catch (error) {
      console.error('Error fetching data:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'Failed to fetch data');
      toast.error(`Error: ${error.response?.data?.error || 'Failed to fetch data'}`, { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      console.log('New Product before sending:', newProduct);
      if (!newProduct.name || !newProduct.price || newProduct.stock === '') {
        toast.error('Please fill in the required fields: Name, Price, and Stock', { position: 'top-right' });
        return;
      }
      const stockValue = parseInt(newProduct.stock, 10);
      if (isNaN(stockValue) || stockValue < 0) {
        toast.error('Stock must be a non-negative integer', { position: 'top-right' });
        return;
      }
      const priceValue = parseFloat(newProduct.price);
      if (isNaN(priceValue) || priceValue <= 0) {
        toast.error('Price must be a positive number', { position: 'top-right' });
        return;
      }
      const formData = new FormData();
      Object.keys(newProduct).forEach((key) => {
        if (key === 'images') {
          newProduct.images.forEach((image) => formData.append('images', image));
        } else {
          formData.append(key, newProduct[key]);
        }
      });
      console.log('Add Product FormData:', Object.fromEntries(formData));
      const response = await addProduct(formData);
      console.log('Add Product Response:', response.data);
      setCurrentPage(1);
      fetchData();
      setNewProduct({ name: '', description: '', price: '', category_id: '', stock: '', images: [] });
      setFileNames('');
      toast.success('Product added successfully', { position: 'top-right' });
    } catch (error) {
      console.error('Error adding product:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.error || error.message;
      toast.error(`Error adding product: ${errorMessage}`, { position: 'top-right' });
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      console.log('Deleting product ID:', productId);
      const response = await deleteProduct(productId);
      console.log('Delete Product Response:', response.data);
      fetchData();
      toast.success('Product deleted successfully', { position: 'top-right' });
    } catch (error) {
      console.error('Error deleting product:', error.response?.data || error.message);
      const errorMessage = error.response?.status === 404
        ? 'Product not found or invalid link'
        : error.response?.data?.error || error.message;
      toast.error(`Error deleting product: ${errorMessage}`, { position: 'top-right' });
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      console.log('Editing product:', editProduct);
      const formData = new FormData();
      Object.keys(editProduct).forEach((key) => {
        if (key === 'images') {
          editProduct.images.forEach((image) => formData.append('images', image));
        } else if (key !== '_id') {
          formData.append(key, editProduct[key]);
        }
      });
      console.log('Edit Product FormData:', Object.fromEntries(formData));
      if (!editProduct.name || !editProduct.price || !editProduct.category_id || !editProduct.stock) {
        throw new Error('Please fill in all required fields');
      }
      const stockValue = parseInt(editProduct.stock, 10);
      if (isNaN(stockValue) || stockValue < 0) {
        throw new Error('Stock must be a non-negative integer');
      }
      const response = await updateProduct(editProduct._id, formData);
      console.log('Update Product Response:', response.data);
      setIsEditModalOpen(false);
      fetchData();
      toast.success('Product updated successfully', { position: 'top-right' });
    } catch (error) {
      console.error('Error updating product:', error.response?.data || error.message);
      const errorMessage = error.response?.status === 404
        ? 'Product not found or invalid link'
        : error.response?.data?.error || error.message;
      toast.error(`Error updating product: ${errorMessage}`, { position: 'top-right' });
    }
  };

  const openEditModal = (product) => {
    setEditProduct({
      _id: product._id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      category_id: product.category_id?._id || '',
      stock: product.stock || 0,
      images: [],
    });
    setEditFileNames('');
    setIsEditModalOpen(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewProduct({ ...newProduct, images: files });
    if (files.length > 0) {
      const names = files.length <= 2
        ? files.map(f => f.name).join(', ')
        : `${files.length} files selected`;
      setFileNames(names);
    } else {
      setFileNames('');
    }
  };

  const handleEditImageChange = (e) => {
    const files = Array.from(e.target.files);
    setEditProduct({ ...editProduct, images: files });
    if (files.length > 0) {
      const names = files.length <= 2
        ? files.map(f => f.name).join(', ')
        : `${files.length} files selected`;
      setEditFileNames(names);
    } else {
      setEditFileNames('');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setLoading(true);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-[#d39c94] text-lg sm:text-xl font-medium">Loading...</div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 p-3 sm:p-4 rounded-lg text-red-600 border border-red-200">
      Error: {error}
    </div>
  );

  return (
    <section className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md border border-[#ecf4fc] w-full max-w-7xl mx-auto">
      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#bc7265] mb-4 pb-2 border-b-2 border-[#d39c94]">
        Products
      </h2>

      <form
        onSubmit={handleAddProduct}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 bg-[#ecf4fc] p-3 sm:p-4 md:p-6 rounded-lg max-w-7xl mx-auto"
      >
        <input
          type="text"
          placeholder="Product Name"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          className="p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d39c94] w-full text-sm sm:text-base"
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={newProduct.description}
          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
          className="p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d39c94] w-full text-sm sm:text-base"
        />
        <input
          type="number"
          placeholder="Price"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          className="p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d39c94] w-full text-sm sm:text-base"
          required
        />
        <select
          value={newProduct.category_id}
          onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
          className="p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d39c94] w-full text-sm sm:text-base"
          required
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Stock"
          value={newProduct.stock}
          onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
          className="p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d39c94] w-full text-sm sm:text-base"
          required
          min="0"
        />
        <div className="relative">
          <label className="flex items-center justify-center cursor-pointer bg-white text-[#bc7265] p-2 sm:p-3 rounded-lg border border-[#d39c94] hover:bg-[#ecf4fc] transition duration-200 truncate text-sm sm:text-base">
            <span className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 sm:h-5 w-4 sm:w-5 mr-1 sm:mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="truncate">{fileNames || 'Upload Images'}</span>
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          {newProduct.images.length > 0 && (
            <p className="text-xs text-gray-500 mt-1 ml-1">
              {newProduct.images.length} {newProduct.images.length === 1 ? 'file' : 'files'} selected
            </p>
          )}
        </div>
        <button
          type="submit"
          className="sm:col-span-2 lg:col-span-3 bg-[#d39c94] text-white p-2 sm:p-3 rounded-lg hover:bg-[#bc7265] transition duration-300 text-sm sm:text-base"
        >
          Add Product
        </button>
      </form>

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2 sm:px-4">
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-lg w-full max-w-lg sm:max-w-xl">
            <h3 className="text-lg sm:text-xl font-semibold text-[#bc7265] mb-4">Edit Product</h3>
            {editProduct._id && products.find(p => p._id === editProduct._id)?.images?.length > 0 && (
              <div className="mb-4">
                <p className="text-gray-700 font-semibold text-sm sm:text-base">Current Images:</p>
                <div className="flex space-x-2 overflow-x-auto">
                  {products.find(p => p._id === editProduct._id).images.map((img, index) => (
                    <img
                      key={index}
                      src={`http://localhost:5000/${img}`}
                      alt="Current"
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            )}
            <form onSubmit={handleEditProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <input
                type="text"
                placeholder="Product Name"
                value={editProduct.name}
                onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                className="p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d39c94] w-full text-sm sm:text-base"
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={editProduct.description}
                onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                className="p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d39c94] w-full text-sm sm:text-base"
              />
              <input
                type="number"
                placeholder="Price"
                value={editProduct.price}
                onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                className="p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d39c94] w-full text-sm sm:text-base"
                required
              />
              <select
                value={editProduct.category_id}
                onChange={(e) => setEditProduct({ ...editProduct, category_id: e.target.value })}
                className="p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d39c94] w-full text-sm sm:text-base"
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Stock"
                value={editProduct.stock}
                onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })}
                className="p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d39c94] w-full text-sm sm:text-base"
                required
                min="0"
              />
              <div className="relative">
                <label className="flex items-center justify-center cursor-pointer bg-white text-[#bc7265] p-2 sm:p-3 rounded-lg border border-[#d39c94] hover:bg-[#ecf4fc] transition duration-200 truncate text-sm sm:text-base">
                  <span className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 sm:h-5 w-4 sm:w-5 mr-1 sm:mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="truncate">{editFileNames || 'Upload New Images'}</span>
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleEditImageChange}
                    className="hidden"
                  />
                </label>
                {editProduct.images.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1 ml-1">
                    {editProduct.images.length} {editProduct.images.length === 1 ? 'file' : 'files'} selected
                  </p>
                )}
              </div>
              <div className="sm:col-span-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 sm:px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-300 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 sm:px-4 py-2 bg-[#d39c94] text-white rounded-lg hover:bg-[#bc7265] transition duration-300 text-sm sm:text-base"
                >
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mt-4">
        {/* Table for md and larger */}
        <table className="min-w-full table-auto hidden md:table">
          <thead>
            <tr className="bg-[#ecf4fc] text-[#bc7265] uppercase text-xs">
              <th className="py-2 px-4 text-left rounded-tl-lg">Image</th>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Price</th>
              <th className="py-2 px-4 text-left">Category</th>
              <th className="py-2 px-4 text-left">Stock</th>
              <th className="py-2 px-4 text-left rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-3 px-4 text-center text-sm">
                  No products available.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product._id}
                  className="border-b border-[#ecf4fc] hover:bg-[#b8e0ec] transition duration-200"
                >
                  <td className="py-2 px-4">
                    {product.images?.length > 0 ? (
                      <img
                        src={`http://localhost:5000/${product.images[0]}`}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded shadow-sm"
                        onError={(e) => console.error('Image load error:', e)}
                      />
                    ) : (
                      'No Image'
                    )}
                  </td>
                  <td className="py-2 px-4 text-sm">{product.name}</td>
                  <td className="py-2 px-4 text-sm">${product.price}</td>
                  <td className="py-2 px-4 text-sm">{product.category_id?.name || 'Uncategorized'}</td>
                  <td className="py-2 px-4 text-sm">{product.stock !== undefined ? product.stock : 'N/A'}</td>
                  <td className="py-2 px-4 flex space-x-2">
                    <button
                      onClick={() => openEditModal(product)}
                      className="p-2 bg-[#d39c94] text-white rounded-lg hover:bg-[#bc7265] transition duration-300"
                      title="Edit"
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15.828l-2.828.586.586-2.828L16.414 6.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
                      title="Delete"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M4 7h16"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Card layout for mobile (below md) */}
        <div className="md:hidden flex flex-col gap-4">
          {products.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-600">
              No products available.
            </div>
          ) : (
            products.map((product) => (
              <div
                key={product._id}
                className="border border-[#ecf4fc] rounded-lg p-3 bg-white shadow-sm hover:bg-[#b8e0ec] transition duration-200"
              >
                <div className="flex items-start gap-3">
                  {product.images?.length > 0 ? (
                    <img
                      src={`http://localhost:5000/${product.images[0]}`}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => console.error('Image load error:', e)}
                    />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center text-gray-500 text-xs">
                      No Image
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-800">{product.name}</h4>
                    <p className="text-xs text-gray-600">Price: ${product.price}</p>
                    <p className="text-xs text-gray-600">
                      Category: {product.category_id?.name || 'Uncategorized'}
                    </p>
                    <p className="text-xs text-gray-600">
                      Stock: {product.stock !== undefined ? product.stock : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    onClick={() => openEditModal(product)}
                    className="p-2 bg-[#d39c94] text-white rounded-lg hover:bg-[#bc7265] transition duration-300"
                    title="Edit"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15.828l-2.828.586.586-2.828L16.414 6.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
                    title="Delete"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-[#ecf4fc] text-[#bc7265] rounded hover:bg-[#b8e0ec] disabled:opacity-50 transition duration-200 text-sm"
          >
            Previous
          </button>
          <span className="px-3 py-2 bg-[#d39c94] text-white rounded text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-[#ecf4fc] text-[#bc7265] rounded hover:bg-[#b8e0ec] disabled:opacity-50 transition duration-200 text-sm"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default Products;