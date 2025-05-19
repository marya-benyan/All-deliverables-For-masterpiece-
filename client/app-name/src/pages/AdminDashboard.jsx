import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";

const AdminDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 ml-64 p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;