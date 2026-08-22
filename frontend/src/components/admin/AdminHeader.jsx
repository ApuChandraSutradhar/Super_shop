import React, { useState, useEffect } from "react";
import { FiSearch, FiBell, FiMenu } from "react-icons/fi";

export default function AdminHeader({ title = "Dashboard Overview" }) {
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    const savedUser = localStorage.getItem("adminUser");
    if (savedUser) {
      try {
        const userObj = JSON.parse(savedUser);
        if (userObj.name) setAdminName(userObj.name);
      } catch (e) {
        console.error("Failed to parse admin user", e);
      }
    }
  }, []);

  return (
    <header className="flex items-center justify-between bg-white px-8 py-4 border-b border-gray-100 sticky top-0 z-10">
      {/* Title with Mobile Menu Icon */}
      <div className="flex items-center gap-4">
        <button className="text-gray-500 hover:text-gray-700 md:hidden">
          <FiMenu size={22} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      </div>

      {/* Right Section: Search Bar & Admin Profile */}
      <div className="flex items-center gap-6">
        {/* Search Input */}
        <div className="relative hidden sm:block w-72">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Notification Icon */}
        <div className="relative cursor-pointer p-2 bg-gray-50 rounded-full text-gray-600 hover:bg-gray-100 transition">
          <FiBell size={20} />
          <span className="absolute top-1 right-1 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
            5
          </span>
        </div>

        {/* Admin Avatar & Profile Info */}
        <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
          <div className="w-10 h-10 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-base shadow-sm">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden lg:block text-left">
            <h4 className="text-sm font-semibold text-gray-800 leading-none mb-1">{adminName}</h4>
            <span className="text-xs text-gray-400 font-medium">Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}