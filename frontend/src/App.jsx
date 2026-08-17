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
import Coupons from "./pages/customer/Coupons"; // <-- Added Coupons Import

// Import Wishlist from components/layout/Wishlist
import Wishlist from "./components/layout/Wishlist";

// Global Layout Components Imports
import CartDrawer from "./components/layout/CartDrawer";
import Checkout from "./components/layout/Checkout";

// Admin Panel Imports
import AdminLayout from "./components/admin/AdminLayout"; // Layout Component
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import AddProduct from "./pages/admin/AddProduct";
import AllProducts from "./pages/admin/AllProducts"; // <-- AllProducts Import

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

              {/* Coupons & Offers Route */}
              <Route
                path="/coupons"
                element={
                  <CustomerLayout>
                    <Coupons />
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

              {/* Admin Panel Login (Without Layout) */}
              <Route path="/admin" element={<AdminLogin />} />

              {/* Admin Panel Routes (With Layout: Sidebar & Top Header) */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="add-product" element={<AddProduct />} />
                <Route path="products" element={<AllProducts />} /> {/* <-- AllProducts Route */}
              </Route>

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