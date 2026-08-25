import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000/api";
const money = (amount) => `Tk ${Number(amount || 0).toFixed(2)}`;

export default function Refunds() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadRefunds = async () => {
    try {
      const response = await axios.get(`${API}/admin/refunds`);
      setRefunds(response.data?.refunds || []);
    } catch (error) {
      console.error("Unable to load refund requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRefunds(); }, []);

  const review = async (refundId, cancellationStatus) => {
    const adminRemarks = cancellationStatus === "rejected"
      ? window.prompt("Add an optional rejection reason for the customer:")
      : null;
    if (cancellationStatus === "rejected" && adminRemarks === null) return;

    try {
      setUpdatingId(refundId);
      const response = await axios.patch(`${API}/admin/refunds/${refundId}/status`, {
        cancellation_status: cancellationStatus,
        admin_remarks: adminRemarks || null,
      });
      setRefunds((current) => current.map((refund) => refund.refund_id === refundId ? response.data.refund : refund));
    } catch (error) {
      alert(error.response?.data?.message || "Unable to update this cancellation request.");
    } finally {
      setUpdatingId(null);
    }
  };

  const statusClass = (status) => ({ approved: "bg-emerald-100 text-emerald-700", rejected: "bg-red-100 text-red-700" }[status] || "bg-amber-100 text-amber-700");

  return <div className="min-h-screen bg-gray-50/50 p-8">
    <div className="mb-8"><h1 className="text-2xl font-bold text-gray-800">Refunds Management</h1><p className="text-sm text-gray-500">Review cancellation reasons, original payment details, and server-calculated refund amounts.</p></div>
    <div className="overflow-x-auto rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      {loading ? <p className="py-6 text-center text-gray-500">Loading refund requests...</p> : <table className="w-full min-w-[1250px] text-left text-sm">
        <thead><tr className="border-b border-gray-100 text-xs font-semibold uppercase text-gray-400"><th className="pb-4">Order</th><th className="pb-4">Customer</th><th className="pb-4">Reason</th><th className="pb-4">Order status</th><th className="pb-4">Payment method</th><th className="pb-4">Total payable Tk</th><th className="pb-4">Refund</th><th className="pb-4">Deduction</th><th className="pb-4">Request</th><th className="pb-4">Status</th><th className="pb-4">Action</th></tr></thead>
        <tbody className="divide-y divide-gray-100">{refunds.length ? refunds.map((refund) => {
          const payment = refund.order?.payment || {};
          const method = refund.payment_method || payment.payment_method || "COD";
          const sender = refund.sender_number || payment.sender_number;
          const payable = refund.payable_amount ?? refund.order?.payable_amount ?? refund.order?.total_amount;
          return <tr key={refund.refund_id} className="align-top hover:bg-gray-50/50">
            <td className="py-4 font-bold text-emerald-600">{refund.order?.order_number || `#${refund.order_id}`}</td>
            <td className="py-4 font-semibold text-gray-700">{refund.customer?.name || "Customer"}<span className="block text-xs font-normal text-gray-400">{refund.customer?.phone || ""}</span></td>
            <td className="max-w-xs whitespace-normal py-4 text-gray-600">{refund.reason}</td>
            <td className="py-4 capitalize text-gray-600">{refund.order?.order_status || "—"}</td>
            <td className="py-4 font-semibold text-gray-700">{method}<span className="block text-xs font-normal text-gray-400">{sender || "No sender number"}</span></td>
            <td className="py-4 font-bold text-gray-800">{money(payable)}</td>
            <td className="py-4 font-bold text-emerald-700">{money(refund.calculated_refund_amount)}</td>
            <td className="py-4 text-red-600">{money(refund.deduction_amount)}</td>
            <td className="py-4 text-xs text-gray-500">{refund.requested_at ? new Date(refund.requested_at).toLocaleString() : "—"}</td>
            <td className="py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusClass(refund.cancellation_status)}`}>{refund.cancellation_status}</span></td>
            <td className="py-4">{refund.cancellation_status === "pending" ? <div className="flex gap-2"><button disabled={updatingId === refund.refund_id} onClick={() => review(refund.refund_id, "approved")} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60">Approve</button><button disabled={updatingId === refund.refund_id} onClick={() => review(refund.refund_id, "rejected")} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60">Reject</button></div> : "—"}</td>
          </tr>;
        }) : <tr><td colSpan="11" className="py-8 text-center text-gray-500">No cancellation requests yet.</td></tr>}</tbody>
      </table>}
    </div>
  </div>;
}
