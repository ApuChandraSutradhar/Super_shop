import React from "react";
import { useNavigate } from "react-router-dom";

export default function SidebarDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Local Storage 
  const user = JSON.parse(localStorage.getItem("user"));

  const handleNavigation = (path) => {
    onClose(); 
    navigate(path);
  };

  const menuItems = [
    {
      id: "profile",
      label: "My Profile",
      icon: "👤",
      bgColor: "bg-purple-100 text-purple-600",
      path: "/profile",
    },
    {
      id: "orders",
      label: "My Orders",
      icon: "📦",
      bgColor: "bg-amber-100 text-amber-700",
      path: "/orders",
    },
    {
      id: "wishlist",
      label: "Wishlist",
      icon: "❤️",
      bgColor: "bg-pink-100 text-pink-600",
      path: "/wishlist",
    },
    {
      id: "coupons",
      label: "Coupons & Offers",
      icon: "🎟️",
      bgColor: "bg-rose-100 text-rose-600",
      path: "/coupons",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* (Backdrop) */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <div className="w-80 bg-white shadow-2xl flex flex-col justify-between transition-all transform duration-300">
          
          <div>
            {/* Navbar-এর ব্যাকগ্রাউন্ড কালারের সাথে সামঞ্জস্য রেখে #004225 কালার কোড ব্যবহার করা হয়েছে */}
            <div className="bg-[#004225] text-white p-6 relative rounded-b-3xl shadow-md">
            
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>

              <h2 className="text-xl font-bold flex items-center gap-2">
                Welcome! 👋
              </h2>

              {user ? (
                <div className="mt-2">
                  <p className="text-sm font-semibold text-emerald-100">
                    {user.name || user.email || "Valued Customer"}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem("user");
                      window.location.reload();
                    }}
                    className="mt-3 bg-red-500/80 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs text-emerald-100 mt-1">
                    Sign in to access your account
                  </p>
                </>
              )}
            </div>

            <div className="p-4 mt-3 space-y-1">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition active:scale-[0.98] group"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold ${item.bgColor}`}
                    >
                      {item.icon}
                    </div>
                    <span className="font-semibold text-gray-700 group-hover:text-[#004225] transition">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-gray-300 group-hover:text-[#004225] group-hover:translate-x-1 transition text-sm font-bold">
                    ❯
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 text-center border-t border-gray-100">
            <p className="text-xs text-gray-400 font-medium">
              FreshMart v2.0 © 2026
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}