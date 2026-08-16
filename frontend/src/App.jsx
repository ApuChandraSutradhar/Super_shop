import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Context Providers Imports
import { SearchProvider } from "./context/SearchContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

// Layout & Customer Pages Imports
import CustomerLayout from "./layouts/CustomerLayout";
import Home from "./pages/customer/Home";
import ProfilePage from "./pages/customer/ProfilePage";
import OrdersPage from "./pages/customer/OrdersPage";

// Import Wishlist from components/layout/Wishlist
import Wishlist from "./components/layout/Wishlist";

// Global Layout Components Imports
import CartDrawer from "./components/layout/CartDrawer";
import Checkout from "./components/layout/Checkout";

// Admin Panel Imports
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import AddProduct from "./pages/admin/AddProduct";

// Delivery Panel Imports
import DeliveryAuth from "./pages/delivery/DeliveryAuth";
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";

export default function App() {
  return (
    <SearchProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            {/* Global Cart Drawer */}
            <CartDrawer />

            <Routes>
              {/* Customer Routes */}
              <Route
                path="/"
                element={
                  <CustomerLayout>
                    <Home />
                  </CustomerLayout>
                }
              />

              <Route
                path="/profile"
                element={
                  <CustomerLayout>
                    <ProfilePage />
                  </CustomerLayout>
                }
              />

              <Route
                path="/orders"
                element={
                  <CustomerLayout>
                    <OrdersPage />
                  </CustomerLayout>
                }
              />

              <Route
                path="/wishlist"
                element={
                  <CustomerLayout>
                    <Wishlist />
                  </CustomerLayout>
                }
              />

              <Route
                path="/checkout"
                element={
                  <CustomerLayout>
                    <Checkout />
                  </CustomerLayout>
                }
              />

              {/* Admin Panel Routes */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/add-product" element={<AddProduct />} />

              {/* Delivery Panel Routes */}
              <Route path="/delivery" element={<DeliveryAuth />} />
              <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />

              {/* Catch-All 404 Route */}
              <Route
                path="*"
                element={
                  <div className="text-center py-20 text-xl text-gray-600 font-semibold">
                    404 | Page Not Found
                  </div>
                }
              />
            </Routes>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </SearchProvider>
  );
}