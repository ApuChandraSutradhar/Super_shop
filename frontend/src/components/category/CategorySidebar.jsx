import React from "react";
import {
  FaAppleAlt,
  FaCarrot,
  FaFish,
  FaDrumstickBite,
  FaShoppingBasket,
  FaBreadSlice,
  FaWineBottle,
  FaGift,
  FaLaptop,
  FaBaby,
} from "react-icons/fa";
import { FiMenu, FiChevronRight } from "react-icons/fi";
import { useSearch } from "../../context/SearchContext";

const categories = [
  { name: "All Categories", value: "All", icon: <FaShoppingBasket /> },
  { name: "Fresh Fruits", value: "Fresh Fruits", icon: <FaAppleAlt /> },
  { name: "Fresh Vegetables", value: "Fresh Vegetables", icon: <FaCarrot /> },
  { name: "Fish", value: "Fish", icon: <FaFish /> },
  { name: "Meat", value: "Meat", icon: <FaDrumstickBite /> },
  { name: "Grocery", value: "Grocery", icon: <FaShoppingBasket /> },
  { name: "Bakery", value: "Bakery", icon: <FaBreadSlice /> },
  { name: "Drinks", value: "Drinks", icon: <FaWineBottle /> },
  { name: "Beauty", value: "Beauty", icon: <FaGift /> },
  { name: "Electronics", value: "Electronics", icon: <FaLaptop /> },
  { name: "Baby Care", value: "Baby Care", icon: <FaBaby /> },
];

export default function CategorySidebar() {
  const { selectedCategory, setSelectedCategory } = useSearch() || {};

  return (
    <div className="bg-white rounded-3xl shadow-md overflow-hidden border border-emerald-100/60">
      {/* Header */}
      <div className="bg-[#064e3b] text-white p-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-800/80 text-white flex items-center justify-center border border-emerald-600/40">
          <FiMenu size={22} />
        </div>
        <h2 className="text-xl font-bold tracking-wide">Categories</h2>
      </div>

      {/* Category List */}
      <div className="max-h-[690px] overflow-y-auto">
        {categories.map((category, index) => {
          const isActive =
            selectedCategory === category.value ||
            (!selectedCategory && category.value === "All") ||
            (selectedCategory === "All" && category.value === "All");

          return (
            <div
              key={index}
              onClick={() => setSelectedCategory && setSelectedCategory(category.value)}
              className={`flex items-center justify-between px-5 py-4 cursor-pointer transition-all duration-300 border-l-4 ${
                isActive
                  ? "bg-emerald-50/80 border-emerald-700"
                  : "border-transparent hover:bg-emerald-50/40"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-colors ${
                    isActive
                      ? "bg-[#064e3b] text-white shadow-sm"
                      : "bg-emerald-50 text-emerald-800"
                  }`}
                >
                  {category.icon}
                </div>

                <div>
                  <h3
                    className={`font-semibold text-sm md:text-base ${
                      isActive ? "text-[#064e3b] font-bold" : "text-gray-700"
                    }`}
                  >
                    {category.name}
                  </h3>
                </div>
              </div>

              <FiChevronRight
                className={`text-xl transition-colors ${
                  isActive ? "text-[#064e3b]" : "text-gray-400"
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}