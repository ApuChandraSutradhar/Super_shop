import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiSearch, FiX } from "react-icons/fi";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/admin/customers");
      
      // API response validation
      if (response.data && response.data.customers) {
        setCustomers(response.data.customers);
      } else if (Array.isArray(response.data)) {
        setCustomers(response.data);
      } else {
        setCustomers([]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Handle Block / Unblock toggle
  const handleToggleBlock = async (id, currentApproval) => {
    const newStatus = currentApproval === 1 ? 0 : 1;
    try {
      await axios.patch(`http://127.0.0.1:8000/api/admin/customers/${id}/status`, {
        is_approved: newStatus,
      });
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_approved: newStatus } : c))
      );
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  // Filter customers safely
  const customerList = Array.isArray(customers) ? customers : [];
  const filteredCustomers = customerList.filter(
    (c) =>
      (c.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone || "").includes(searchQuery)
  );

  return (
    <div className="p-8 bg-gray-50/50 min-h-screen">
      {/* Top Bar with Title and Search Input */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
        <div className="relative">
          <FiSearch className="absolute left-3.5 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm outline-none w-72 shadow-sm focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Customer Management</h2>

        {loading ? (
          <p className="text-center text-gray-500 py-6">Loading customers...</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="pb-4">CUSTOMER</th>
                <th className="pb-4">ORDERS</th>
                <th className="pb-4">TOTAL SPENT</th>
                <th className="pb-4">STATUS</th>
                <th className="pb-4 text-right pr-6">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => {
                  const isBlocked = customer.is_approved === 0;
                  return (
                    <tr key={customer.id} className="hover:bg-gray-50/50">
                      <td className="py-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-base">
                          {customer.name ? customer.name.charAt(0).toUpperCase() : "C"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{customer.name}</p>
                          <p className="text-xs text-gray-400">
                            {customer.email || customer.phone}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 font-bold text-gray-800">
                        {customer.orders_count || 0}
                      </td>
                      <td className="py-4 font-bold text-emerald-600">
                        ৳{customer.total_spent || 0}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            isBlocked
                              ? "bg-red-100 text-red-500"
                              : "bg-emerald-100 text-emerald-600"
                          }`}
                        >
                          {isBlocked ? "blocked" : "active"}
                        </span>
                      </td>
                      <td className="py-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-3 font-semibold text-xs">
                          <button
                            onClick={() => setSelectedCustomer(customer)}
                            className="text-blue-600 hover:underline cursor-pointer"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleToggleBlock(customer.id, customer.is_approved)}
                            className={`${
                              isBlocked ? "text-emerald-600" : "text-red-500"
                            } hover:underline cursor-pointer`}
                          >
                            {isBlocked ? "Unblock" : "Block"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-6">
                    No customers found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* View Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md relative shadow-2xl">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <FiX size={20} />
            </button>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Customer Info</h3>
            <div className="space-y-3 text-sm">
              <p><span className="font-semibold text-gray-600">Name:</span> {selectedCustomer.name}</p>
              <p><span className="font-semibold text-gray-600">Phone:</span> {selectedCustomer.phone || "N/A"}</p>
              <p><span className="font-semibold text-gray-600">Email:</span> {selectedCustomer.email || "N/A"}</p>
              <p><span className="font-semibold text-gray-600">Total Orders:</span> {selectedCustomer.orders_count || 0}</p>
              <p><span className="font-semibold text-gray-600">Total Spent:</span> ৳{selectedCustomer.total_spent || 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}