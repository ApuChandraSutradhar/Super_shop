import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiLogOut, FiUser } from "react-icons/fi";

const getStoredRider = () => {
  try {
    return JSON.parse(localStorage.getItem("deliveryUser")) || {};
  } catch {
    return {};
  }
};

const getRiderName = (rider) =>
  rider.full_name || rider.name || rider.fullName || rider.username || "Delivery Rider";

export default function DeliveryNavbar() {
  const menuRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [riderName, setRiderName] = useState(() => getRiderName(getStoredRider()));

  useEffect(() => {
    const updateRider = () => setRiderName(getRiderName(getStoredRider()));
    const closeMenu = (event) => {
      if (!menuRef.current?.contains(event.target)) setIsMenuOpen(false);
    };

    window.addEventListener("storage", updateRider);
    document.addEventListener("mousedown", closeMenu);
    return () => {
      window.removeEventListener("storage", updateRider);
      document.removeEventListener("mousedown", closeMenu);
    };
  }, []);

  const handleLogout = () => {
    ["token", "access_token", "user", "role", "deliveryUser"].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    window.location.replace("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-gray-100 bg-white/95 px-5 py-3 shadow-sm backdrop-blur sm:px-8">
      <div>
        <p className="text-lg font-bold text-[#064e3b] sm:text-xl">FreshMart Rider Panel</p>
        <p className="hidden text-xs text-gray-500 sm:block">Delivery partner workspace</p>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="flex items-center gap-2 rounded-xl p-1.5 text-left transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-800 text-sm font-bold text-white">
            {riderName.charAt(0).toUpperCase()}
          </span>
          <span className="hidden sm:block">
            <span className="block max-w-40 truncate text-sm font-semibold text-gray-800">{riderName}</span>
            <span className="block text-xs text-gray-500">Delivery Rider</span>
          </span>
          <FiChevronDown className={`text-gray-500 transition-transform ${isMenuOpen ? "rotate-180" : ""}`} />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg" role="menu">
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
              role="menuitem"
            >
              <FiUser /> Profile
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
              role="menuitem"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
