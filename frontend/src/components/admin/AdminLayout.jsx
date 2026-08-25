import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout() {
  const location = useLocation();
  const getPageTitle = (pathname) => {
    switch (pathname) {
      case "/admin/dashboard":
        return "Dashboard Overview";
      case "/admin/add-product":
        return "Add New Product";
      case "/admin/products":
        return "All Products";
      case "/admin/orders":
        return "Order Management";
      case "/admin/customers":
        return "Customer List";
      case "/admin/delivery-riders":
        return "Delivery Riders";
      case "/admin/settings":
        return "Admin Settings";
      case "/admin/refunds":
        return "Refunds Management";
      default:
        return "Admin Portal";
    }
  };

  return (
    <div className="flex bg-[#f8fafc] min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader title={getPageTitle(location.pathname)} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
