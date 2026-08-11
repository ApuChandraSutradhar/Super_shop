import React from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";

export default function Dashboard() {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Total Orders</p>
            <h2 className="text-3xl font-bold text-[#064e3b]">124</h2>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Total Products</p>
            <h2 className="text-3xl font-bold text-[#064e3b]">45</h2>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Total Revenue</p>
            <h2 className="text-3xl font-bold text-[#064e3b]">৳ 45,200</h2>
          </div>
        </div>
      </div>
    </div>
  );
}