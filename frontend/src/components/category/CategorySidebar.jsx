import {
  FaAppleAlt,
  FaCarrot,
  FaFish,
  FaDrumstickBite,
  FaShoppingBasket,
  FaBreadSlice,
  FaWineBottle,
  FaCheese,
  FaSnowflake,
  FaGift,
  FaLaptop,
  FaBaby,
} from "react-icons/fa";

import { FiMenu, FiChevronRight } from "react-icons/fi";

const categories = [
  {
    name: "All Categories",
    items: 240,
    icon: <FaShoppingBasket />,
    active: true,
  },
  {
    name: "Fresh Fruits",
    items: 34,
    icon: <FaAppleAlt />,
  },
  {
    name: "Fresh Vegetables",
    items: 42,
    icon: <FaCarrot />,
  },
  {
    name: "Fish",
    items: 18,
    icon: <FaFish />,
  },
  {
    name: "Meat",
    items: 22,
    icon: <FaDrumstickBite />,
  },
  {
    name: "Grocery",
    items: 55,
    icon: <FaShoppingBasket />,
  },
  {
    name: "Bakery",
    items: 28,
    icon: <FaBreadSlice />,
  },
  {
    name: "Drinks",
    items: 36,
    icon: <FaWineBottle />,
  },
  {
    name: "Dairy",
    items: 24,
    icon: <FaCheese />,
  },
  {
    name: "Frozen Foods",
    items: 15,
    icon: <FaSnowflake />,
  },
  {
    name: "Beauty",
    items: 26,
    icon: <FaGift />,
  },
  {
    name: "Electronics",
    items: 12,
    icon: <FaLaptop />,
  },
  {
    name: "Baby Care",
    items: 20,
    icon: <FaBaby />,
  },
];

export default function CategorySidebar() {
  return (
    <div className="bg-white rounded-3xl shadow-md overflow-hidden border border-emerald-100/60">

      {/* Header - Deep Forest Green (Sober & Premium) */}
      <div className="bg-[#064e3b] text-white p-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-800/80 text-white flex items-center justify-center border border-emerald-600/40">
          <FiMenu size={22} />
        </div>
        <h2 className="text-xl font-bold tracking-wide">
          Categories
        </h2>
      </div>

      {/* Category List */}
      <div className="max-h-[690px] overflow-y-auto">
        {categories.map((category, index) => (
          <div
            key={index}
            className={`flex items-center justify-between px-5 py-4 cursor-pointer transition-all duration-300 border-l-4
            ${
              category.active
                ? "bg-emerald-50/80 border-emerald-700"
                : "border-transparent hover:bg-emerald-50/40"
            }`}
          >
            <div className="flex items-center gap-4">

              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-colors
                ${
                  category.active
                    ? "bg-[#064e3b] text-white shadow-sm"
                    : "bg-emerald-50 text-emerald-800"
                }`}
              >
                {category.icon}
              </div>

              <div>
                <h3
                  className={`font-semibold text-sm md:text-base
                  ${
                    category.active
                      ? "text-[#064e3b] font-bold"
                      : "text-gray-700"
                  }`}
                >
                  {category.name}
                </h3>

                <p className="text-xs text-gray-400 mt-0.5">
                  {category.items} Items
                </p>
              </div>

            </div>

            <FiChevronRight
              className={`text-xl transition-colors
              ${
                category.active
                  ? "text-[#064e3b]"
                  : "text-gray-400"
              }`}
            />
          </div>
        ))}
      </div>

    </div>
  );
}