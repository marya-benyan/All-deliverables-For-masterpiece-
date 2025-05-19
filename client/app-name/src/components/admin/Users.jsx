import React, { useState, useEffect } from 'react';
import { getUsers } from '../../services/api';
import { toast } from 'react-toastify';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchTerm, sortConfig]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error.response?.data);
      toast.error('Error fetching users', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortUsers = () => {
    let result = [...users];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term)
      );
    }
    
    // Sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredUsers(result);
    setCurrentPage(1); // Reset to first page when filtering/sorting
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Get current users for pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Go to next or previous page
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

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Users</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-100 rounded-md"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="bg-white p-4 md:p-6 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-700">Users</h2>
        
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d39c94] focus:border-[#d39c94] transition duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
      </div>
      
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            ></path>
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-700">
            {searchTerm ? 'No matching users found' : 'No users available'}
          </h3>
          <p className="mt-1 text-gray-500">
            {searchTerm ? 'Try a different search term' : 'Check back later or refresh the page'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 px-4 py-2 bg-[#d39c94] text-white rounded-md hover:bg-[#c58b82] transition duration-200"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto mb-6 rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#ecf4fc]">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('name')}
                  >
                    <div className="flex items-center">
                      Name
                      <span className="ml-1">{getSortIndicator('name')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('email')}
                  >
                    <div className="flex items-center">
                      Email
                      <span className="ml-1">{getSortIndicator('email')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('createdAt')}
                  >
                    <div className="flex items-center">
                      Joined
                      <span className="ml-1">{getSortIndicator('createdAt')}</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.map((user) => (
                  <tr 
                    key={user._id} 
                    className="hover:bg-[#f8fafc] transition duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#d39c94] flex items-center justify-center text-white font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col xs:flex-row items-center justify-between gap-4 mt-4">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{' '}
              <span className="font-medium">
                {indexOfLastUser > filteredUsers.length ? filteredUsers.length : indexOfLastUser}
              </span>{' '}
              of <span className="font-medium">{filteredUsers.length}</span> results
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#ecf4fc] text-gray-700 hover:bg-[#b8e0ec] transition duration-200'
                }`}
                aria-label="Previous page"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Show first page, current page with neighbors, and last page */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => {
                // Show only first, last, and pages around current
                if (
                  number === 1 ||
                  number === totalPages ||
                  (number >= currentPage - 1 && number <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`w-8 h-8 rounded-md flex items-center justify-center transition duration-200 text-sm ${
                        currentPage === number
                          ? 'bg-[#d39c94] text-white font-medium'
                          : 'bg-[#ecf4fc] text-gray-700 hover:bg-[#b8e0ec]'
                      }`}
                    >
                      {number}
                    </button>
                  );
                }
                
                // Show ellipsis for gaps
                if (
                  (number === currentPage - 2 && currentPage > 3) ||
                  (number === currentPage + 2 && currentPage < totalPages - 2)
                ) {
                  return (
                    <span key={`ellipsis-${number}`} className="px-2 text-gray-500">
                      ...
                    </span>
                  );
                }
                
                return null;
              })}
              
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#ecf4fc] text-gray-700 hover:bg-[#b8e0ec] transition duration-200'
                }`}
                aria-label="Next page"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default Users;