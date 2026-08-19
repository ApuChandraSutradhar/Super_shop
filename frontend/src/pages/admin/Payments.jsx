import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiSearch } from "react-icons/fi";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/payments");
      if (response.data && response.data.payments) {
        setPayments(response.data.payments);
      } else {
        setPayments([]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching payments:", error);
      setPayments([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((p) =>
    (p.payment_method || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.transaction_id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(p.order_id || "").includes(searchQuery)
  );

  return (
    <div className="p-8 bg-gray-50/50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
        <div className="relative">
          <FiSearch className="absolute left-3.5 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by Order ID, Transaction ID or Method..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm outline-none w-80 shadow-sm focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Payment Transactions</h2>

        {loading ? (
          <p className="text-center text-gray-500 py-6">Loading payments...</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="pb-4">PAYMENT ID</th>
                <th className="pb-4">ORDER ID</th>
                <th className="pb-4">METHOD</th>
                <th className="pb-4">TRANSACTION ID</th>
                <th className="pb-4">AMOUNT</th>
                <th className="pb-4">DATE</th>
                <th className="pb-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((item) => (
                  <tr key={item.payment_id} className="hover:bg-gray-50/50">
                    <td className="py-4 font-bold text-gray-800">#{item.payment_id}</td>
                    <td className="py-4 text-gray-600">#{item.order_id}</td>
                    <td className="py-4 font-medium text-gray-800">{item.payment_method}</td>
                    <td className="py-4 text-gray-500">{item.transaction_id || "N/A"}</td>
                    <td className="py-4 font-bold text-gray-800">৳{item.amount}</td>
                    <td className="py-4 text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          item.payment_status === "paid"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {item.payment_status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-gray-500 py-6">
                    No payment records found.
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