import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiBell, FiCheck, FiMenu, FiPackage, FiTruck, FiUserPlus } from "react-icons/fi";

const API = "http://127.0.0.1:8000/api";
const iconByType = { delivery_registration: FiTruck, customer_registration: FiUserPlus, new_order: FiPackage, delivery_status: FiTruck };

function formatTimestamp(timestamp) {
  if (!timestamp) return "Just now";
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function AdminHeader({ title = "Dashboard Overview" }) {
  const [adminName, setAdminName] = useState("Admin");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationMenuRef = useRef(null);
  const navigate = useNavigate();

  const loadNotifications = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/notifications`);
      const items = response.data?.notifications || [];
      setNotifications(items);
      setUnreadCount(response.data?.unread_count ?? items.filter((item) => !item.is_read).length);
    } catch (error) {
      console.error("Unable to load admin notifications:", error);
    }
  }, []);

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

  useEffect(() => {
    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 30000);
    return () => window.clearInterval(intervalId);
  }, [loadNotifications]);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!notificationMenuRef.current?.contains(event.target)) setIsNotificationsOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const markAsRead = async (notification) => {
    if (notification.is_read) return;
    setNotifications((previous) => previous.map((item) => item.id === notification.id ? { ...item, is_read: true } : item));
    setUnreadCount((previous) => Math.max(0, previous - 1));
    try {
      await axios.patch(`${API}/admin/notifications/${notification.id}/read`);
    } catch (error) {
      console.error("Unable to mark notification as read:", error);
      loadNotifications();
    }
  };

  const openNotification = async (notification) => {
    await markAsRead(notification);
    setIsNotificationsOpen(false);
    if (notification.link) navigate(notification.link);
  };

  return (
    <header className="flex items-center justify-between bg-white px-8 py-4 border-b border-gray-100 sticky top-0 z-10">
      {/* Title with Mobile Menu Icon */}
      <div className="flex items-center gap-4">
        <button className="text-gray-500 hover:text-gray-700 md:hidden">
          <FiMenu size={22} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative" ref={notificationMenuRef}>
          <button type="button" onClick={() => setIsNotificationsOpen((open) => !open)} className="relative p-2 bg-gray-50 rounded-full text-gray-600 hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-emerald-500/30" aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`} aria-expanded={isNotificationsOpen}>
            <FiBell size={20} />
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">{unreadCount > 99 ? "99+" : unreadCount}</span>}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/70 z-30">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div><h2 className="text-sm font-bold text-gray-800">Notifications</h2><p className="text-xs text-gray-400 mt-0.5">{unreadCount ? `${unreadCount} unread` : "You're all caught up"}</p></div>
                <FiBell className="text-emerald-600" size={18} />
              </div>
              <div className="max-h-[26rem] overflow-y-auto divide-y divide-gray-100">
                {notifications.length ? notifications.map((notification) => {
                  const Icon = iconByType[notification.type] || FiBell;
                  return <div key={notification.id} className={`flex gap-3 px-4 py-3.5 transition hover:bg-gray-50 ${notification.is_read ? "" : "bg-emerald-50/50"}`}>
                    <button type="button" onClick={() => openNotification(notification)} className="flex min-w-0 flex-1 gap-3 text-left">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Icon size={17} /></span>
                      <span className="min-w-0"><span className="block text-sm font-semibold text-gray-800">{notification.title}</span><span className="mt-0.5 block text-xs leading-5 text-gray-500">{notification.message}</span><span className="mt-1 block text-[11px] font-medium text-gray-400">{formatTimestamp(notification.created_at)}</span></span>
                    </button>
                    {!notification.is_read && <button type="button" onClick={() => markAsRead(notification)} className="self-start rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-100" aria-label={`Mark ${notification.title} as read`} title="Mark as read"><FiCheck size={16} /></button>}
                  </div>;
                }) : <div className="px-5 py-10 text-center text-sm text-gray-400">No notifications yet.</div>}
              </div>
            </div>
          )}
        </div>

        {/* Admin Avatar & Profile Info */}
        <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
          <div className="w-10 h-10 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-base shadow-sm">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden lg:block text-left">
            <h4 className="text-sm font-semibold text-gray-800 leading-none mb-1">{adminName}</h4>
            <span className="text-xs text-gray-400 font-medium">Admin Panel</span>
          </div>
        </div>
      </div>
    </header>
  );
}
