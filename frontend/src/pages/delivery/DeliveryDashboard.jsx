import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FiCheckCircle, FiClock, FiDollarSign, FiPackage } from "react-icons/fi";

const API = "http://127.0.0.1:8000/api";

const getRider = () => {
  try { return JSON.parse(localStorage.getItem("deliveryUser")); } catch { return null; }
};

const StatCard = ({ icon, label, value, color }) => <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>{icon}</div><p className="text-sm font-semibold text-gray-500">{label}</p><p className="mt-1 text-3xl font-bold text-gray-800">{value}</p></div>;

export default function DeliveryDashboard() {
  const [stats, setStats] = useState({ today_deliveries: 0, completed: 0, pending: 0, cash_collected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const rider = getRider();

  const fetchStats = useCallback(async () => {
    if (!rider?.id) { setLoading(false); setError("Please log in as a delivery rider."); return; }
    try {
      const response = await axios.get(`${API}/delivery/dashboard`, { params: { delivery_person_id: rider.id } });
      setStats(response.data?.stats || {});
      setError("");
    } catch (requestError) {
      console.error("Unable to load delivery dashboard:", requestError);
      setError(requestError.response?.data?.message || "Unable to load dashboard data.");
    } finally { setLoading(false); }
  }, [rider?.id]);

  useEffect(() => {
    fetchStats();
    const refresh = window.setInterval(fetchStats, 20000);
    return () => window.clearInterval(refresh);
  }, [fetchStats]);

  return <><div className="mb-8"><h1 className="text-3xl font-bold text-gray-800">Delivery Dashboard</h1><p className="mt-1 text-sm text-gray-500">Today’s assigned delivery activity, updated automatically.</p></div>{error && <div className="mb-5 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">{error}</div>}{loading ? <div className="rounded-2xl bg-white p-10 text-center text-gray-500 shadow-sm">Loading live delivery statistics...</div> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"><StatCard icon={<FiPackage />} label="Today's Deliveries" value={stats.today_deliveries || 0} color="bg-emerald-100 text-emerald-700" /><StatCard icon={<FiCheckCircle />} label="Completed" value={stats.completed || 0} color="bg-green-100 text-green-700" /><StatCard icon={<FiClock />} label="Pending / Active" value={stats.pending || 0} color="bg-amber-100 text-amber-700" /><StatCard icon={<FiDollarSign />} label="Cash Collected (COD)" value={`৳${Number(stats.cash_collected || 0).toLocaleString()}`} color="bg-blue-100 text-blue-700" /></div>}</>;
}
