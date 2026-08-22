import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  FiGrid, 
  FiPlusCircle, 
  FiShoppingBag, 
  FiBox, 
  FiUsers, 
  FiTruck, 
  FiCreditCard,
  FiBarChart2,
  FiHome,
  FiSettings,
  FiLogOut
} from "react-icons/fi";

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Check if link is active
  const isActive = (path) => location.pathname === path;

  // Admin logout handler
  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    localStorage.removeItem("token");
    navigate("/admin");
  };

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <FiGrid size={18} /> },
    { name: "Add Product", path: "/admin/add-product", icon: <FiPlusCircle size={18} /> },
    { name: "All Products", path: "/admin/products", icon: <FiBox size={18} /> },
    { name: "Orders", path: "/admin/orders", icon: <FiShoppingBag size={18} /> },
    { name: "Customers", path: "/admin/customers", icon: <FiUsers size={18} /> },
    { name: "Delivery Riders", path: "/admin/delivery-riders", icon: <FiTruck size={18} /> },
    { name: "Payments", path: "/admin/payments", icon: <FiCreditCard size={18} /> },
    { name: "Reports", path: "/admin/reports", icon: <FiBarChart2 size={18} /> },
    { name: "Settings", path: "/admin/settings", icon: <FiSettings size={18} /> },
  ];

  return (
    <div className="w-64 bg-[#064e3b] min-h-screen text-white p-5 flex flex-col justify-between sticky top-0">
      <div>
        {/* Header Logo & Title */}
        <div className="flex items-center gap-3 mb-8 border-b border-emerald-700 pb-4">
          <h2 className="text-2xl font-bold tracking-wide">
            FreshMart <span className="text-xs font-normal bg-emerald-700 px-2 py-0.5 rounded-full text-emerald-200">Admin</span>
          </h2>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  active
                    ? "bg-emerald-700 text-white shadow-md font-semibold"
                    : "text-emerald-100 hover:bg-emerald-800/60 hover:text-white"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-emerald-700/60 flex flex-col gap-2">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-sm"
        >
          <FiHome size={18} />
          <span>Back to Shop</span>
        </Link>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 bg-red-600/80 hover:bg-red-600 text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-sm w-full text-left cursor-pointer"
        >
          <FiLogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}