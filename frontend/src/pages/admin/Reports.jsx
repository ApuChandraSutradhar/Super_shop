import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiTrendingUp, FiShoppingBag, FiUsers, FiDollarSign } from "react-icons/fi";

export default function Reports() {
  const [reportData, setReportData] = useState({
    summary: {
      total_revenue: 125400,
      total_orders: 342,
      active_customers: 128,
    },
    predictions: [
      { name: "Fresh Red Apples", growth: "+35%", reason: "High demand season" },
      { name: "Atlantic Salmon", growth: "+18%", reason: "Weekend BBQ season trend" },
      { name: "Wireless Earbuds", growth: "+25%", reason: "New model launch nearby" },
    ],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchReports = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/admin/reports", {
          signal: controller.signal,
        });
        if (response.data && response.data.summary) {
          setReportData(response.data);
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.warn("API request failed, displaying default report data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReports();

    return () => {
      controller.abort();
    };
  }, []);

  if (loading) {
    return <div className="p-8 text-gray-500">Loading reports...</div>;
  }

  return (
    <div className="p-8 bg-gray-50/50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Sales & AI Analytics Reports</h1>
        <p className="text-gray-500 text-sm">Real-time store performance and AI-driven demand prediction</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <FiDollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Total Revenue</p>
            <h3 className="text-2xl font-bold text-gray-800">৳{reportData.summary.total_revenue}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <FiShoppingBag size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Total Completed Orders</p>
            <h3 className="text-2xl font-bold text-gray-800">{reportData.summary.total_orders}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
            <FiUsers size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Active Customers</p>
            <h3 className="text-2xl font-bold text-gray-800">{reportData.summary.active_customers}</h3>
          </div>
        </div>
      </div>

      {/* AI Predictions */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <FiTrendingUp className="text-indigo-600" size={20} />
          <h2 className="text-lg font-bold text-gray-800">AI Product Prediction</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reportData.predictions.map((item, index) => (
            <div key={index} className="p-5 bg-gray-50/60 rounded-2xl border border-gray-100">
              <h4 className="font-bold text-gray-800 mb-1">{item.name}</h4>
              <span className="text-2xl font-extrabold text-emerald-500 block mb-2">{item.growth}</span>
              <p className="text-xs text-gray-400">{item.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}