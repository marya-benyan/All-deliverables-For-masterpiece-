import React, { useState, useEffect } from "react";
import { getUsers, getProducts } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const DashboardContent = () => {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await getUsers();
        const productsResponse = await getProducts({ page: 1, limit: 100 });
        setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
        setProducts(Array.isArray(productsResponse.data.products) ? productsResponse.data.products : []);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare data for charts
  const userJoinData = users.reduce((acc, user) => {
    const date = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  const userChartData = Object.keys(userJoinData).map((date) => ({
    date,
    count: userJoinData[date],
  }));

  const productCategoryData = products.reduce((acc, product) => {
    const category = product.category_id?.name || "Uncategorized";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  const productPieData = Object.keys(productCategoryData).map((category) => ({
    name: category,
    value: productCategoryData[category],
  }));

  // Updated color palette to match the site theme
  const COLORS = ['#d39c94', '#bc7265', '#b8e0ec', '#ecf4fc', '#a5d7e8'];

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
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4 text-[#bc7265]">Admin Dashboard</h1>
      <p className="text-lg mb-6 text-gray-600">Welcome, Admin! View key statistics and manage your platform here.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-[#ecf4fc]">
          <h2 className="text-xl font-semibold mb-4 text-[#bc7265] pb-2 border-b border-[#ecf4fc]">User Registrations</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ecf4fc" />
              <XAxis dataKey="date" tick={{ fill: '#bc7265' }} />
              <YAxis tick={{ fill: '#bc7265' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  borderColor: '#d39c94',
                  borderRadius: '8px' 
                }} 
              />
              <Legend wrapperStyle={{ color: '#bc7265' }} />
              <Bar dataKey="count" fill="#d39c94" name="New Users" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-[#ecf4fc]">
          <h2 className="text-xl font-semibold mb-4 text-[#bc7265] pb-2 border-b border-[#ecf4fc]">Products by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={productPieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#d39c94"
                dataKey="value"
                label
              >
                {productPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  borderColor: '#d39c94',
                  borderRadius: '8px' 
                }} 
              />
              <Legend 
                formatter={(value) => <span style={{ color: '#bc7265' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-[#ecf4fc]">
        <h2 className="text-xl font-semibold mb-4 text-[#bc7265] pb-2 border-b border-[#ecf4fc]">Quick Stats</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 bg-[#ecf4fc] rounded-lg shadow-sm border border-[#b8e0ec] transition duration-300 hover:shadow">
            <p className="text-lg font-semibold text-[#bc7265]">Total Users</p>
            <p className="text-3xl font-bold text-[#d39c94] mt-2">{users.length}</p>
          </div>
          <div className="p-6 bg-[#ecf4fc] rounded-lg shadow-sm border border-[#b8e0ec] transition duration-300 hover:shadow">
            <p className="text-lg font-semibold text-[#bc7265]">Total Products</p>
            <p className="text-3xl font-bold text-[#d39c94] mt-2">{products.length}</p>
          </div>
          <div className="p-6 bg-[#ecf4fc] rounded-lg shadow-sm border border-[#b8e0ec] transition duration-300 hover:shadow">
            <p className="text-lg font-semibold text-[#bc7265]">Categories</p>
            <p className="text-3xl font-bold text-[#d39c94] mt-2">{productPieData.length}</p>
          </div>
          <div className="p-6 bg-[#ecf4fc] rounded-lg shadow-sm border border-[#b8e0ec] transition duration-300 hover:shadow">
            <p className="text-lg font-semibold text-[#bc7265]">Latest User</p>
            <p className="text-xl font-medium text-[#d39c94] mt-2 truncate">
              {users.length > 0 ? users[users.length - 1].username || "New User" : "None"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-md border border-[#ecf4fc]">
        <h2 className="text-xl font-semibold mb-4 text-[#bc7265] pb-2 border-b border-[#ecf4fc]">Activity Overview</h2>
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1 p-4 bg-[#ecf4fc] rounded-lg">
            <h3 className="text-lg font-medium text-[#bc7265] mb-2">Recent Activity</h3>
            <ul className="space-y-2">
              <li className="p-2 bg-white rounded border-l-4 border-[#d39c94]">New user registration</li>
              <li className="p-2 bg-white rounded border-l-4 border-[#d39c94]">Product added to inventory</li>
              <li className="p-2 bg-white rounded border-l-4 border-[#d39c94]">Category updated</li>
            </ul>
          </div>
          <div className="flex-1 p-4 bg-[#ecf4fc] rounded-lg">
            <h3 className="text-lg font-medium text-[#bc7265] mb-2">System Health</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-[#bc7265]">Server Load</span>
                  <span className="text-sm font-medium text-[#bc7265]">28%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#d39c94] h-2 rounded-full" style={{ width: '28%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-[#bc7265]">Database</span>
                  <span className="text-sm font-medium text-[#bc7265]">65%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#d39c94] h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-[#bc7265]">Storage</span>
                  <span className="text-sm font-medium text-[#bc7265]">42%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#d39c94] h-2 rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;