import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiDollarSign, FiShoppingBag, FiTrendingUp, FiUsers } from "react-icons/fi";

const emptyReport = {
  metrics: { total_revenue: 0, total_completed_orders: 0, active_customers: 0 },
  ai_predictions: [],
};
const asArray = (value) => Array.isArray(value) ? value : [];
const numeric = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
const money = (value) => `৳${numeric(value).toLocaleString()}`;

export default function Reports() {
  const [reportData, setReportData] = useState(emptyReport);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const fetchReports = async () => {
      try {
        const { data } = await axios.get("http://127.0.0.1:8000/api/admin/reports", { signal: controller.signal });
        const report = data?.data ?? emptyReport;
        const metrics = report.metrics ?? {};
        setReportData({
          metrics: {
            total_revenue: numeric(metrics.total_revenue),
            total_completed_orders: numeric(metrics.total_completed_orders),
            active_customers: numeric(metrics.active_customers),
          },
          ai_predictions: asArray(report.ai_predictions).map((item) => ({
            name: item?.name || "Unnamed product",
            growth_percentage: item?.growth_percentage || "+0.0%",
            insight_reason: item?.insight_reason || "Stable demand monitoring",
            predicted_next_week_demand: numeric(item?.predicted_next_week_demand),
            predicted_next_month_demand: numeric(item?.predicted_next_month_demand),
          })),
        });
        setError(data?.success === false ? "Some report data is unavailable; zero-value fallbacks are shown." : "");
      } catch (requestError) {
        if (!axios.isCancel(requestError)) {
          setReportData(emptyReport);
          setError("Reports are temporarily unavailable. Showing default values.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
    return () => controller.abort();
  }, []);

  const cards = [
    ["Total Revenue", money(reportData.metrics.total_revenue), FiDollarSign, "bg-emerald-50 text-emerald-600"],
    ["Total Completed Orders", reportData.metrics.total_completed_orders, FiShoppingBag, "bg-blue-50 text-blue-600"],
    ["Active Customers", reportData.metrics.active_customers, FiUsers, "bg-purple-50 text-purple-600"],
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Sales & AI Analytics Reports</h1>
        <p className="text-sm text-gray-500">Paid and delivered order performance with 30-day demand forecasts</p>
      </div>
      {loading && <div className="mb-6 flex items-center gap-2 text-sm text-gray-500"><span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" /> Loading live reports...</div>}
      {error && <div role="alert" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div>}

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {cards.map(([label, value, Icon, color]) => <div key={label} className="flex items-center gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"><div className={`rounded-2xl p-4 ${color}`}><Icon size={24} /></div><div><p className="text-xs font-semibold uppercase text-gray-400">{label}</p><h3 className="text-2xl font-bold text-gray-800">{value}</h3></div></div>)}
      </div>

      <section className="w-full rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2"><FiTrendingUp className="text-indigo-600" size={20} /><h2 className="text-lg font-bold text-gray-800">AI Product Predictions</h2></div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {reportData.ai_predictions.length ? reportData.ai_predictions.map((item, index) => <article key={`${item.name}-${index}`} className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5"><h3 className="mb-1 font-bold text-gray-800">{item.name}</h3><span className="mb-2 block text-2xl font-extrabold text-emerald-500">{item.growth_percentage}</span><p className="text-xs font-medium text-gray-600">{item.insight_reason}</p><div className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800"><strong className="block">Suggested restock</strong><span className="block">Order {item.predicted_next_week_demand} units for the next 7 days.</span><span className="block">Plan {item.predicted_next_month_demand} units for the next 30 days.</span></div></article>) : <p className="text-sm text-gray-400">No delivered product history is available yet.</p>}
        </div>
      </section>
    </div>
  );
}
