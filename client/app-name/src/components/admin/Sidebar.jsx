import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';

axios.defaults.withCredentials = true;

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/users/logout");
      console.log("Logout successful");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error.response?.data || error.message);
      alert(error.response?.data?.error || "فشل في تسجيل الخروج. حاول مرة أخرى.");
    }
  };

  return (
    <div className="fixed top-0 left-0 h-full w-64 bg-[#d39c94] text-white shadow-lg">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-8">Admin Dashboard</h2>
        <nav className="space-y-4">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              isActive
                ? 'block py-2 px-4 bg-[#bc7265] rounded-lg'
                : 'block py-2 px-4 hover:bg-[#bc7265] rounded-lg transition duration-300'
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              isActive
                ? 'block py-2 px-4 bg-[#bc7265] rounded-lg'
                : 'block py-2 px-4 hover:bg-[#bc7265] rounded-lg transition duration-300'
            }
          >
            Products
          </NavLink>
          <NavLink
            to="/admin/custom-orders"
            className={({ isActive }) =>
              isActive
                ? 'block py-2 px-4 bg-[#bc7265] rounded-lg'
                : 'block py-2 px-4 hover:bg-[#bc7265] rounded-lg transition duration-300'
            }
          >
            Custom Orders
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              isActive
                ? 'block py-2 px-4 bg-[#bc7265] rounded-lg'
                : 'block py-2 px-4 hover:bg-[#bc7265] rounded-lg transition duration-300'
            }
          >
            Users
          </NavLink>
          <NavLink
            to="/admin/reviews"
            className={({ isActive }) =>
              isActive
                ? 'block py-2 px-4 bg-[#bc7265] rounded-lg'
                : 'block py-2 px-4 hover:bg-[#bc7265] rounded-lg transition duration-300'
            }
          >
            Reviews
          </NavLink>
          <NavLink
            to="/admin/categories"
            className={({ isActive }) =>
              isActive
                ? 'block py-2 px-4 bg-[#bc7265] rounded-lg'
                : 'block py-2 px-4 hover:bg-[#bc7265] rounded-lg transition duration-300'
            }
          >
            Categories
          </NavLink>
          <NavLink
            to="/admin/contact-messages"
            className={({ isActive }) =>
              isActive
                ? 'block py-2 px-4 bg-[#bc7265] rounded-lg'
                : 'block py-2 px-4 hover:bg-[#bc7265] rounded-lg transition duration-300'
            }
          >
            Contact Messages
          </NavLink>
          <NavLink
            to="/admin/coupons"
            className={({ isActive }) =>
              isActive
                ? 'block py-2 px-4 bg-[#bc7265] rounded-lg'
                : 'block py-2 px-4 hover:bg-[#bc7265] rounded-lg transition duration-300'
            }
          >
            Coupons
          </NavLink>
          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              isActive
                ? 'block py-2 px-4 bg-[#bc7265] rounded-lg'
                : 'block py-2 px-4 hover:bg-[#bc7265] rounded-lg transition duration-300'
            }
          >
            Orders
          </NavLink>
          <button
            onClick={handleLogout}
            className="block w-full py-2 px-4 bg-[#bc7265] text-white rounded-lg hover:bg-[#bc7265] hover:opacity-90 transition duration-300 flex items-center gap-1"
          >
            <span>🚪</span> Logout
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;