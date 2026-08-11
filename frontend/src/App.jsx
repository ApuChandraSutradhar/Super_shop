import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CustomerLayout from "./layouts/CustomerLayout";
import Home from "./pages/customer/Home";
import { SearchProvider } from "./context/SearchContext";

import Dashboard from "./pages/admin/Dashboard";
import AddProduct from "./pages/admin/AddProduct";

import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";

export default function App() {
  return (
    <SearchProvider>
      <Router>
        <Routes>
          {/* Customer Panel */}
          <Route
            path="/"
            element={
              <CustomerLayout>
                <Home />
              </CustomerLayout>
            }
          />

          {/* Admin Panel */}
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/add-product" element={<AddProduct />} />

          {/* Delivery Panel */}
          <Route path="/delivery" element={<DeliveryDashboard />} />
        </Routes>
      </Router>
    </SearchProvider>
  );
}