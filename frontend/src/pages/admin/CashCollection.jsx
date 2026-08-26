import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000/api";

export default function CashCollection() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settlingId, setSettlingId] = useState(null);

  const fetchCollections = async () => {
    try {
      const { data } = await axios.get(`${API}/admin/cash-collections`);
      setCollections(data?.collections || []);
    } catch (error) {
      console.error("Unable to load cash collections:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCollections(); }, []);

  const settleCollection = async (deliveryId) => {
    setSettlingId(deliveryId);
    try {
      const { data } = await axios.patch(`${API}/admin/cash-collections/${deliveryId}/settle`);
      setCollections((previous) => previous.map((collection) => collection.delivery_id === deliveryId ? data.collection : collection));
    } catch (error) {
      console.error("Unable to settle cash collection:", error);
      alert("Unable to mark this collection as settled.");
    } finally {
      setSettlingId(null);
    }
  };

  const money = (amount) => `৳${Number(amount || 0).toLocaleString()}`;

  return <div className="p-8 bg-gray-50/50 min-h-screen space-y-6">
    <div><h1 className="text-2xl font-bold text-gray-800">Cash Collection</h1><p className="text-sm text-gray-500 mt-1">COD payments collected by delivery riders.</p></div>
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 overflow-x-auto">
      {loading ? <p className="text-center text-gray-500 py-6">Loading cash collections...</p> : <table className="w-full min-w-[1050px] text-left border-collapse">
        <thead><tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider"><th className="pb-4">Rider</th><th className="pb-4">Order ID</th><th className="pb-4">Customer</th><th className="pb-4">COD Collected</th><th className="pb-4">Collection Date</th><th className="pb-4">Settlement</th><th className="pb-4 text-right">Action</th></tr></thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          {collections.length ? collections.map((collection) => {
            const order = collection.order || {}; const customer = order.customer || {};
            const settled = collection.settlement_status === "settled";
            return <tr key={collection.delivery_id} className="hover:bg-gray-50/50"><td className="py-4 font-semibold text-gray-800">{collection.delivery_person?.name || "Unassigned"}</td><td className="py-4 font-bold text-emerald-600">{order.order_number || `#${order.order_id}`}</td><td className="py-4"><p className="font-medium text-gray-800">{order.delivery_name || customer.name || "Guest Customer"}</p><p className="text-xs text-gray-400">{order.delivery_phone || customer.phone || "No phone"}</p></td><td className="py-4 font-bold text-gray-900">{money(collection.cash_collected)}</td><td className="py-4 text-gray-500">{collection.collected_at ? new Date(collection.collected_at).toLocaleDateString() : "N/A"}</td><td className="py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${settled ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{settled ? "Settled" : "Pending"}</span></td><td className="py-4 text-right">{settled ? <span className="text-xs font-semibold text-gray-400">Received</span> : <button onClick={() => settleCollection(collection.delivery_id)} disabled={settlingId === collection.delivery_id} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white rounded-lg text-xs font-bold">{settlingId === collection.delivery_id ? "Saving..." : "Receive Cash"}</button>}</td></tr>;
          }) : <tr><td colSpan="7" className="py-8 text-center text-gray-500">No delivered COD orders found.</td></tr>}
        </tbody>
      </table>}
    </div>
  </div>;
}
