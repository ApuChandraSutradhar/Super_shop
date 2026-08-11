import React, { useState, useEffect } from "react";
import { useSearch } from "../../context/SearchContext";
import AuthModal from "./AuthModal";
import {
  FiMenu,
  FiHeart,
  FiBell,
  FiShoppingCart,
  FiUser,
  FiMapPin,
  FiSearch,
  FiLogOut,
} from "react-icons/fi";

export default function Navbar() {
  const { setSearchQuery } = useSearch();
  const [term, setTerm] = useState("");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);

  // ১. পেজ লোড হলে localStorage থেকে ইউজার চেক করা
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, []);

  // ২. লগআউট হ্যান্ডেলার
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.reload();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(term);
    const productSection = document.getElementById("products");
    if (productSection) {
      productSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Left Section */}
        <div className="flex items-center gap-5">
          <button className="text-3xl text-gray-700 hover:text-[#064e3b]">
            <FiMenu />
          </button>
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-[#064e3b] flex items-center justify-center text-white text-2xl shadow-sm">
              🛒
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                <span className="text-[#064e3b]">Fresh</span>
                <span className="text-gray-800">Mart</span>
              </h1>
              <p className="text-xs text-gray-400 tracking-widest font-semibold">
                SUPER SHOP
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden lg:flex flex-1 mx-12">
          <form
            onSubmit={handleSearch}
            className="flex w-full bg-white rounded-full border border-gray-200 shadow-sm overflow-hidden focus-within:border-[#064e3b] transition-all"
          >
            <input
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search groceries, fruits, vegetables..."
              className="flex-1 px-6 py-4 outline-none text-gray-700 placeholder-gray-400"
            />
            <button
              type="submit"
              className="bg-[#064e3b] hover:bg-emerald-900 text-white px-10 text-lg font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <FiSearch />
              Search
            </button>
          </form>
        </div>

        {/* Right Section Icons */}
        <div className="flex items-center gap-6">
          <div className="hidden xl:flex items-center gap-2 text-gray-700 cursor-pointer">
            <FiMapPin className="text-[#064e3b] text-xl" />
            <div>
              <p className="text-xs text-gray-400">Deliver To</p>
              <p className="font-semibold text-gray-800">Dhaka</p>
            </div>
          </div>
          <button className="relative text-2xl text-gray-700 hover:text-[#064e3b]">
            <FiHeart />
          </button>
          <button className="relative text-2xl text-gray-700 hover:text-[#064e3b]">
            <FiBell />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
          <button className="bg-[#064e3b] text-white rounded-xl px-5 py-3 flex items-center gap-2 hover:bg-emerald-900 shadow-sm font-medium">
            <FiShoppingCart /> Cart
          </button>

          {/* ৩. ইউজার লগইন থাকলে নাম দেখাবে, না থাকলে Login বাটন দেখাবে */}
          {user ? (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">
              <div className="flex items-center gap-2 text-[#064e3b] font-semibold">
                <FiUser className="text-lg" />
                <span>{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="text-gray-500 hover:text-red-600 transition-colors ml-2 cursor-pointer"
              >
                <FiLogOut className="text-lg" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="border border-gray-200 rounded-xl px-5 py-3 flex items-center gap-2 text-gray-700 hover:bg-gray-50 font-medium cursor-pointer"
            >
              <FiUser /> Login
            </button>
          )}
        </div>

      </div>

      {isAuthOpen && <AuthModal closeModal={() => setIsAuthOpen(false)} />}
    </nav>
  );
}