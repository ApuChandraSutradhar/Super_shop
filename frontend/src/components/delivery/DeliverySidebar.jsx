import React from "react";
import { Link } from "react-router-dom";
import { FiTruck, FiCheckCircle, FiHome } from "react-icons/fi";

export default function DeliverySidebar() {
  return (
    <div className="w-64 bg-emerald-900 min-h-screen text-white p-5 flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold mb-8 border-b border-emerald-700 pb-4">
          Rider Panel
        </h2>
        <nav className="flex flex-col gap-3">
          <Link to="/delivery" className="flex items-center gap-3 p-3 hover:bg-emerald-800 rounded-xl transition-all">
            <FiTruck /> Assigned Orders
          </Link>
        </nav>
      </div>
      <Link to="/" className="flex items-center gap-3 p-3 bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-all">
        <FiHome /> Back to Home
      </Link>
    </div>
  );
}