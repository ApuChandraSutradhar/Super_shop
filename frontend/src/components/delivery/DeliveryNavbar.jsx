import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiBell, FiCheck, FiChevronDown, FiLogOut, FiPackage, FiTruck, FiUser } from "react-icons/fi";

const API = "http://127.0.0.1:8000/api";

const getStoredRider = () => {
  try {
    return JSON.parse(localStorage.getItem("deliveryUser")) || {};
  } catch {
    return {};
  }
};

const getRiderName = (rider) =>
  rider.full_name || rider.name || rider.fullName || rider.username || "Delivery Rider";

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "Just now";
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

export default function DeliveryNavbar() {
  const menuRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [riderName, setRiderName] = useState(() => getRiderName(getStoredRider()));
  const [riderId, setRiderId] = useState(() => getStoredRider().id);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const navigate = useNavigate();

  const loadNotifications = useCallback(async () => {
    if (!riderId) return;
    try {
      const response = await axios.get(`${API}/delivery/notifications`, { params: { delivery_person_id: riderId } });
      const items = response.data?.notifications || [];
      setNotifications(items);
      setUnreadCount(response.data?.unread_count ?? items.filter((item) => !item.is_read).length);
    } catch (error) {
      console.error("Unable to load delivery notifications:", error);
    }
  }, [riderId]);

  useEffect(() => {
    const updateRider = () => {
      const rider = getStoredRider();
      setRiderName(getRiderName(rider));
      setRiderId(rider.id);
    };
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

  useEffect(() => {
    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 30000);
    return () => window.clearInterval(intervalId);
  }, [loadNotifications]);

  const markAsRead = async (notification) => {
    if (notification.is_read || !riderId) return;
    setNotifications((previous) => previous.map((item) => item.id === notification.id ? { ...item, is_read: true } : item));
    setUnreadCount((previous) => Math.max(0, previous - 1));
    try {
      await axios.patch(`${API}/delivery/notifications/${notification.id}/read`, { delivery_person_id: riderId });
    } catch (error) {
      console.error("Unable to mark delivery notification as read:", error);
      loadNotifications();
    }
  };

  const openNotification = async (notification) => {
    await markAsRead(notification);
    setIsNotificationsOpen(false);
    if (notification.link) navigate(notification.link);
  };

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

      <div className="relative flex items-center gap-3" ref={menuRef}>
        <div className="relative">
          <button type="button" onClick={() => { setIsNotificationsOpen((open) => !open); setIsMenuOpen(false); }} className="relative rounded-full bg-gray-50 p-2 text-gray-600 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`} aria-expanded={isNotificationsOpen}>
            <FiBell size={20} />
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 z-40 mt-3 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/70">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4"><div><h2 className="text-sm font-bold text-gray-800">Notifications</h2><p className="mt-0.5 text-xs text-gray-400">{unreadCount ? `${unreadCount} unread` : "You're all caught up"}</p></div><FiBell className="text-emerald-600" size={18} /></div>
              <div className="max-h-[26rem] divide-y divide-gray-100 overflow-y-auto">
                {notifications.length ? notifications.map((notification) => (
                  <div key={notification.id} className={`flex gap-3 px-4 py-3.5 transition hover:bg-gray-50 ${notification.is_read ? "" : "bg-emerald-50/50"}`}>
                    <button type="button" onClick={() => openNotification(notification)} className="flex min-w-0 flex-1 gap-3 text-left">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">{notification.type === "order_assigned" ? <FiPackage size={17} /> : <FiTruck size={17} />}</span>
                      <span className="min-w-0"><span className="block text-sm font-semibold text-gray-800">{notification.title}</span><span className="mt-0.5 block text-xs leading-5 text-gray-500">{notification.message}</span><span className="mt-1 block text-[11px] font-medium text-gray-400">{formatTimestamp(notification.created_at)}</span></span>
                    </button>
                    {!notification.is_read && <button type="button" onClick={() => markAsRead(notification)} className="self-start rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-100" aria-label={`Mark ${notification.title} as read`} title="Mark as read"><FiCheck size={16} /></button>}
                  </div>
                )) : <div className="px-5 py-10 text-center text-sm text-gray-400">No notifications yet.</div>}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => { setIsMenuOpen((open) => !open); setIsNotificationsOpen(false); }}
            className="flex items-center gap-2 rounded-xl p-1.5 text-left transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-800 text-sm font-bold text-white">{riderName.charAt(0).toUpperCase()}</span>
            <span className="hidden sm:block"><span className="block max-w-40 truncate text-sm font-semibold text-gray-800">{riderName}</span><span className="block text-xs text-gray-500">Delivery Rider</span></span>
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
      </div>
    </header>
  );
}
