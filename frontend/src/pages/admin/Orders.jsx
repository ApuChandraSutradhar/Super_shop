import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/admin/orders");
      if (response.data && response.data.orders) {
        setOrders(response.data.orders);
      } else {
        setOrders(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(`http://127.0.0.1:8000/api/admin/orders/${orderId}/status`, {
        order_status: newStatus,
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.order_id === orderId || o.id === orderId
            ? { ...o, order_status: newStatus }
            : o
        )
      );
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const customerName = o.customer?.name || o.customer_name || "";
    const orderIdStr = String(o.order_id || o.id || "");

    const matchesSearch =
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orderIdStr.includes(searchQuery);

    const matchesTab =
      activeTab === "All" ||
      (o.order_status || "").toLowerCase() === activeTab.toLowerCase();

    return matchesSearch && matchesTab;
  });

  return (
    <div className="p-8 bg-gray-50/50 min-h-screen space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
        <input
          type="text"
          placeholder="Search by customer or order ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm outline-none w-72 shadow-sm focus:border-emerald-500"
        />
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2">
        {["All", "Pending", "Confirmed", "Packing", "Shipping"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab
                ? "bg-emerald-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        {loading ? (
          <p className="text-center text-gray-500 py-6">Loading orders...</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase">
                <th className="pb-4">ORDER ID</th>
                <th className="pb-4">CUSTOMER</th>
                <th className="pb-4">DATE</th>
                <th className="pb-4">ITEMS</th>
                <th className="pb-4">TOTAL</th>
                <th className="pb-4">PAYMENT</th>
                <th className="pb-4 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const currentId = order.order_id || order.id;
                  return (
                    <tr key={currentId} className="hover:bg-gray-50/50">
                      <td className="py-4 font-bold text-emerald-600">
                        {order.order_number || `#${currentId}`}
                      </td>
                      <td className="py-4 font-semibold text-gray-800">
                        {order.customer?.name || "Guest Customer"}
                      </td>
                      <td className="py-4 text-xs text-gray-500">
                        {order.created_at ? order.created_at.slice(0, 10) : "N/A"}
                      </td>
                      <td className="py-4 text-gray-600">
                        {order.order_items?.length || 1} items
                      </td>
                      <td className="py-4 font-bold text-gray-900">
                        ৳{order.payable_amount || order.total_amount || 0}
                      </td>
                      <td className="py-4">
                        <span className="px-2.5 py-1 rounded-md bg-gray-100 text-xs font-semibold text-gray-700">
                          {order.payment?.payment_method || "COD"}
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <select
                          value={order.order_status || "pending"}
                          onChange={(e) =>
                            handleStatusChange(currentId, e.target.value)
                          }
                          className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border-none outline-none cursor-pointer capitalize"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="packing">Packing</option>
                          <option value="shipping">Shipping</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-gray-500 py-6">
                    No orders found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}