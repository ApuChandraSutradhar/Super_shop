import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiSearch, FiX } from "react-icons/fi";

export default function DeliveryRiders() {
  const [riders, setRiders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRider, setSelectedRider] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Delivery Riders from API
  const fetchRiders = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/delivery-riders");
      
      // API Response Validation
      if (response.data && response.data.riders) {
        setRiders(response.data.riders);
      } else if (Array.isArray(response.data)) {
        setRiders(response.data);
      } else {
        setRiders([]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching delivery riders:", error);
      setRiders([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  // Handle Block / Active Status Toggle
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    try {
      await axios.patch(`http://127.0.0.1:8000/api/admin/delivery-riders/${id}/status`, {
        is_approved: newStatus,
      });
      setRiders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_approved: newStatus } : r))
      );
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  // Filter riders safely
  const riderList = Array.isArray(riders) ? riders : [];
  const filteredRiders = riderList.filter(
    (r) =>
      (r.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.phone || "").includes(searchQuery)
  );

  return (
    <div className="p-8 bg-gray-50/50 min-h-screen">
      {/* Top Header & Search */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Delivery Riders</h1>
        <div className="relative">
          <FiSearch className="absolute left-3.5 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search rider by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm outline-none w-72 shadow-sm focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Rider Directory</h2>

        {loading ? (
          <p className="text-center text-gray-500 py-6">Loading delivery riders...</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="pb-4">RIDER NAME</th>
                <th className="pb-4">CONTACT INFO</th>
                <th className="pb-4">TOTAL DELIVERIES</th>
                <th className="pb-4">STATUS</th>
                <th className="pb-4 text-right pr-6">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredRiders.length > 0 ? (
                filteredRiders.map((rider) => {
                  const isBlocked = rider.is_approved === 0;
                  return (
                    <tr key={rider.id} className="hover:bg-gray-50/50">
                      <td className="py-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-base">
                          {rider.name ? rider.name.charAt(0).toUpperCase() : "R"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{rider.name}</p>
                          <p className="text-xs text-gray-400">{rider.vehicle_type || "N/A"}</p>
                        </div>
                      </td>
                      <td className="py-4 text-gray-600">
                        <p>{rider.phone || "N/A"}</p>
                        <p className="text-xs text-gray-400">{rider.email || ""}</p>
                      </td>
                      <td className="py-4 font-bold text-gray-800">
                        {rider.deliveries_count || 0}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            isBlocked
                              ? "bg-red-100 text-red-500"
                              : "bg-emerald-100 text-emerald-600"
                          }`}
                        >
                          {isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td className="py-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-3 font-semibold text-xs">
                          <button
                            onClick={() => setSelectedRider(rider)}
                            className="text-blue-600 hover:underline cursor-pointer"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleToggleStatus(rider.id, rider.is_approved)}
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
                    No delivery riders found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Details Modal */}
      {selectedRider && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md relative shadow-2xl">
            <button
              onClick={() => setSelectedRider(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <FiX size={20} />
            </button>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Rider Information</h3>
            <div className="space-y-3 text-sm">
              <p><span className="font-semibold text-gray-600">Name:</span> {selectedRider.name}</p>
              <p><span className="font-semibold text-gray-600">Phone:</span> {selectedRider.phone || "N/A"}</p>
              <p><span className="font-semibold text-gray-600">Email:</span> {selectedRider.email || "N/A"}</p>
              <p><span className="font-semibold text-gray-600">Total Deliveries:</span> {selectedRider.deliveries_count || 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}