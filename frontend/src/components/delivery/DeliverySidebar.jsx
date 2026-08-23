import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiTruck, FiHome, FiLogOut } from "react-icons/fi";

export default function DeliverySidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    navigate("/delivery", { replace: true });
  };

  return (
    <div className="w-64 bg-emerald-900 min-h-screen text-white p-5 flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold mb-8 border-b border-emerald-700 pb-4">
          Rider Panel
        </h2>
        <nav className="flex flex-col gap-3">
          <Link
            to="/delivery/dashboard"
            className="flex items-center gap-3 p-3 hover:bg-emerald-800 rounded-xl transition-all"
          >
            <FiTruck /> Assigned Orders
          </Link>
        </nav>
      </div>

      <div className="flex flex-col gap-3">
        <Link
          to="/"
          className="flex items-center gap-3 p-3 bg-emerald-800 hover:bg-emerald-700 rounded-xl transition-all"
        >
          <FiHome /> Back to Home
        </Link>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          type="button"
          className="flex items-center gap-3 p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all w-full text-left font-medium cursor-pointer"
        >
          <FiLogOut /> Logout
        </button>
      </div>
    </div>
  );
}