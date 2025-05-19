import React, { useState, useEffect } from 'react';
import { getCategories, addCategory, updateCategory, deleteCategory, getCurrentUser } from '../../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editCategory, setEditCategory] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const navigate = useNavigate();

  // Check if user is admin
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
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories();
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching categories:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'Failed to fetch categories');
      toast.error(`Error: ${error.response?.data?.error || 'Failed to fetch categories'}`, { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      console.log('New Category:', newCategory);
      await addCategory(newCategory);
      toast.success('Category added successfully', { position: 'top-right' });
      setNewCategory({ name: '', description: '' });
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error.response?.data || error.message);
      toast.error(`Error adding category: ${error.response?.data?.error || error.message}`, {
        position: 'top-right',
      });
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    try {
      console.log('Editing category:', editCategory);
      await updateCategory(editCategory._id, {
        name: editCategory.name,
        description: editCategory.description,
      });
      toast.success('Category updated successfully', { position: 'top-right' });
      setIsEditModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error.response?.data || error.message);
      const errorMessage = error.response?.status === 404
        ? 'Category not found or invalid link'
        : error.response?.data?.error || error.message;
      toast.error(`Error updating category: ${errorMessage}`, { position: 'top-right' });
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      console.log('Deleting category ID:', categoryId);
      await deleteCategory(categoryId);
      toast.success('Category deleted successfully', { position: 'top-right' });
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error.response?.data || error.message);
      const errorMessage = error.response?.status === 404
        ? 'Category not found or invalid link'
        : error.response?.data?.error || error.message;
      toast.error(`Error deleting category: ${errorMessage}`, { position: 'top-right' });
    }
  };

  const openEditModal = (category) => {
    setEditCategory({
      _id: category._id,
      name: category.name,
      description: category.description || '',
    });
    setIsEditModalOpen(true);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-[#d39c94] text-xl font-medium">Loading...</div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 p-4 rounded-lg text-red-600 border border-red-200">
      Error: {error}
    </div>
  );

  return (
    <section className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-[#ecf4fc] w-full">
      <h2 className="text-xl sm:text-2xl font-semibold text-[#bc7265] mb-4 sm:mb-6 pb-2 border-b-2 border-[#d39c94]">Categories</h2>

      <form onSubmit={handleAddCategory} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 sm:mb-8 bg-[#ecf4fc] p-4 sm:p-6 rounded-lg">
        <div className="relative">
          <input
            type="text"
            placeholder="Category Name"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            className="p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#d39c94]"
            required
          />
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Description"
            value={newCategory.description}
            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
            className="p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#d39c94]"
          />
        </div>
        <button
          type="submit"
          className="sm:col-span-2 bg-[#d39c94] text-white p-3 rounded-lg hover:bg-[#bc7265] transition duration-300"
        >
          Add Category
        </button>
      </form>

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h3 className="text-lg sm:text-xl font-semibold text-[#bc7265] mb-4">Edit Category</h3>
            <form onSubmit={handleEditCategory} className="grid grid-cols-1 gap-4">
              <input
                type="text"
                placeholder="Category Name"
                value={editCategory.name}
                onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d39c94] w-full"
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={editCategory.description}
                onChange={(e) => setEditCategory({ ...editCategory, description: e.target.value })}
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d39c94] w-full"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#d39c94] text-white rounded-lg hover:bg-[#bc7265] transition duration-300"
                >
                  Update Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-[#ecf4fc] text-[#bc7265] uppercase text-xs sm:text-sm">
              <th className="py-2 sm:py-3 px-2 sm:px-6 text-left rounded-tl-lg">Name</th>
              <th className="py-2 sm:py-3 px-2 sm:px-6 text-left">Description</th>
              <th className="py-2 sm:py-3 px-2 sm:px-6 text-left rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="3" className="py-3 px-6 text-center text-gray-500">
                  No categories available.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category._id} className="border-b border-[#ecf4fc] hover:bg-[#b8e0ec] transition duration-200">
                  <td className="py-2 sm:py-3 px-2 sm:px-6 font-medium text-[#bc7265] text-sm sm:text-base">{category.name}</td>
                  <td className="py-2 sm:py-3 px-2 sm:px-6 text-sm sm:text-base">{category.description || 'N/A'}</td>
                  <td className="py-2 sm:py-3 px-2 sm:px-6 flex space-x-2">
                    <button
                      onClick={() => openEditModal(category)}
                      className="p-2 bg-[#d39c94] text-white rounded-lg hover:bg-[#bc7265] transition duration-300"
                      title="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15.828l-2.828.586.586-2.828L16.414 6.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category._id)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
                      title="Delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      {categories.length > 0 && (
        <div className="mt-4 text-sm text-gray-500 text-right">
          Total: {categories.length} {categories.length === 1 ? 'category' : 'categories'}
        </div>
      )}
    </section>
  );
};

export default Categories;