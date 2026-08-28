import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Context Providers Imports
import { SearchProvider } from "./context/SearchContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ToastProvider } from "./context/ToastContext";

// Layout & Customer Pages Imports
import CustomerLayout from "./layouts/CustomerLayout";
import Home from "./pages/customer/Home";
import ProfilePage from "./pages/customer/ProfilePage";
import OrdersPage from "./pages/customer/OrdersPage";
import RefundDetails from "./pages/customer/RefundDetails";
import Coupons from "./pages/customer/Coupons";

// Import Wishlist from components/layout/Wishlist
import Wishlist from "./components/layout/Wishlist";

// Global Layout Components Imports
import CartDrawer from "./components/layout/CartDrawer";
import Checkout from "./components/layout/Checkout";
import ReturnPolicy from "./components/footerdetail/ReturnPolicy";
import PrivacyPolicy from "./components/footerdetail/PrivacyPolicy";
import TermsOfService from "./components/footerdetail/TermsOfService";
import ScrollToTop from "./components/ScrollToTop";
import AboutUs from "./components/footerdetail/AboutUs";
import Offers from "./components/footerdetail/Offers";
import Contact from "./components/footerdetail/Contact";

// Admin Panel Imports
import AdminLayout from "./components/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import AddProduct from "./pages/admin/AddProduct";
import AllProducts from "./pages/admin/AllProducts";
import Orders from "./pages/admin/Orders";
import Customers from "./pages/admin/Customers";
import Payments from "./pages/admin/Payments";
import DeliveryRiders from "./pages/admin/DeliveryRiders";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";
import Refunds from "./pages/admin/Refunds";
import CashCollection from "./pages/admin/CashCollection";
import ViewFeedback from "./pages/admin/ViewFeedback";
import ViewMessages from "./pages/admin/ViewMessages";

// Protected Route Import
import AdminProtectedRoute from "./routes/AdminProtectedRoute";
import DeliveryProtectedRoute from "./routes/DeliveryProtectedRoute";

// Delivery Panel Imports
import DeliveryAuth from "./pages/delivery/DeliveryAuth";
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";
import DeliveryOrders from "./pages/delivery/DeliveryOrders";
import DeliveryLayout from "./components/delivery/DeliveryLayout";

export default function App() {
  return (
    <ToastProvider>
      <SearchProvider>
        <CartProvider>
          <WishlistProvider>
          <Router>
            <ScrollToTop />
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
                path="/my-orders"
                element={
                  <CustomerLayout>
                    <OrdersPage />
                  </CustomerLayout>
                }
              />

              <Route path="/my-orders/refund/:orderId" element={<CustomerLayout><RefundDetails /></CustomerLayout>} />

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

              <Route
                path="/return-policy"
                element={
                  <CustomerLayout>
                    <ReturnPolicy />
                  </CustomerLayout>
                }
              />

              <Route path="/privacy-policy" element={<CustomerLayout><PrivacyPolicy /></CustomerLayout>} />
              <Route path="/terms-of-service" element={<CustomerLayout><TermsOfService /></CustomerLayout>} />

              <Route path="/about-us" element={<CustomerLayout><AboutUs /></CustomerLayout>} />
              <Route path="/shop" element={<CustomerLayout><Home /></CustomerLayout>} />
              <Route path="/offers" element={<CustomerLayout><Offers /></CustomerLayout>} />
              <Route path="/contact" element={<CustomerLayout><Contact /></CustomerLayout>} />

              {/* Admin Panel Login (Without Layout) */}
              <Route path="/admin" element={<AdminLogin />} />

              {/* Protected Admin Panel Routes */}
              <Route element={<AdminProtectedRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="add-product" element={<AddProduct />} />
                  <Route path="products" element={<AllProducts />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="payments" element={<Payments />} />
                  <Route path="delivery-riders" element={<DeliveryRiders />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="refunds" element={<Refunds />} />
                  <Route path="cash-collection" element={<CashCollection />} />
                  <Route path="feedback" element={<ViewFeedback />} />
                  <Route path="messages" element={<ViewMessages />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Route>

              {/* Delivery Panel Routes */}
              <Route path="/delivery" element={<DeliveryAuth />} />
              <Route path="/login" element={<DeliveryAuth />} />
              <Route element={<DeliveryProtectedRoute />}>
                <Route path="/delivery" element={<DeliveryLayout />}>
                  <Route path="dashboard" element={<DeliveryDashboard />} />
                  <Route path="orders" element={<DeliveryOrders />} />
                  <Route path="assigned-orders" element={<DeliveryOrders />} />
                  <Route path="completed-orders" element={<DeliveryOrders completed />} />
                </Route>
              </Route>

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
    </ToastProvider>
  );
}
