import React, { useState, useEffect } from "react";
import { FiPackage, FiClock, FiCheckCircle, FiTruck, FiShoppingBag } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // LocalStorage থেকে ইউজারের অর্ডার ডাটা লোড করা
    const savedOrders = localStorage.getItem("user_orders");
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (e) {
        console.error("Error parsing orders data", e);
      }
    }
  }, []);

  // স্ট্যাটাস অনুযায়ী ব্যাজের কালার ও আইকন
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return (
          <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
            <FiCheckCircle /> Delivered
          </span>
        );
      case "processing":
      case "confirmed":
        return (
          <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
            <FiTruck /> Processing
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
            <FiClock /> Pending
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FiPackage className="text-[#064e3b]" /> My Orders
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Track and manage all your placed grocery orders
            </p>
          </div>
          <span className="bg-emerald-50 text-[#064e3b] px-4 py-2 rounded-xl text-sm font-bold border border-emerald-100">
            Total Orders: {orders.length}
          </span>
        </div>

        {/* Orders List */}
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <div
                key={order.id || index}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition"
              >
                {/* Top Info Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                      Order ID
                    </span>
                    <p className="text-base font-bold text-gray-800">
                      #{order.id || `ORD-${1000 + index}`}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                      Date
                    </span>
                    <p className="text-sm font-semibold text-gray-600">
                      {order.date || new Date().toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                      Status
                    </span>
                    <div className="mt-0.5">
                      {getStatusBadge(order.status || "Pending")}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                      Total Amount
                    </span>
                    <p className="text-lg font-bold text-[#064e3b]">
                      ৳{order.totalAmount || order.total || 0}
                    </p>
                  </div>
                </div>

                {/* Items List */}
                <div className="py-4 space-y-3">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm py-1"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-[#064e3b]"></span>
                          <span className="font-semibold text-gray-700">
                            {item.name || item.product?.name || "Product Item"}
                          </span>
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-md font-bold text-gray-500">
                            x{item.quantity || 1}
                          </span>
                        </div>
                        <span className="font-bold text-gray-600">
                          ৳{(item.price || 0) * (item.quantity || 1)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      Grocery Items Order
                    </p>
                  )}
                </div>

                {/* Shipping Address Footer */}
                {order.address && (
                  <div className="pt-3 border-t border-gray-50 text-xs text-gray-400">
                    <span className="font-bold text-gray-500">Deliver To:</span>{" "}
                    {order.address}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Empty Orders State */
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="w-20 h-20 bg-emerald-50 text-[#064e3b] rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner">
              <FiShoppingBag />
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              No Orders Placed Yet!
            </h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              Looks like you haven't placed any grocery order yet. Start shopping now to fill up your bag!
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-2 bg-[#064e3b] hover:bg-emerald-900 text-white font-bold px-6 py-3 rounded-xl transition cursor-pointer shadow-sm active:scale-95"
            >
              Start Shopping
            </button>
          </div>
        )}

      </div>
    </div>
  );
}