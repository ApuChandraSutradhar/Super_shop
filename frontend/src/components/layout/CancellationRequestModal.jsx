import { useState } from "react";
import axios from "axios";
import { FiX } from "react-icons/fi";

const API = "http://127.0.0.1:8000/api";

export default function CancellationRequestModal({ order, customerId, onClose, onSubmitted }) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const orderId = order?.order_id || order?.id;

  const submit = async (event) => {
    event.preventDefault();
    if (!reason.trim()) { setError("Please tell us why you want to cancel this order."); return; }
    try {
      setSubmitting(true); setError("");
      const response = await axios.post(`${API}/refunds`, { order_id: orderId, customer_id: customerId, reason: reason.trim() });
      onSubmitted?.(response.data.refund);
      onClose();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to submit your cancellation request.");
    } finally { setSubmitting(false); }
  };

  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4">
    <form onSubmit={submit} className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
      <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100"><FiX /></button>
      <h2 className="text-xl font-bold text-[#064e3b]">Cancel order</h2>
      <p className="mt-1 text-sm text-gray-500">Submit a reason for order #{order?.order_number || orderId}. The refund amount is calculated from its current status.</p>
      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      <label className="mt-5 block text-sm font-bold text-gray-700">Cancellation reason
        <textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength="2000" required placeholder="Please describe why you need to cancel" className="mt-1.5 min-h-28 w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-emerald-600" />
      </label>
      <button disabled={submitting || !orderId || !customerId} className="mt-5 w-full rounded-xl bg-red-600 py-3 font-bold text-white hover:bg-red-700 disabled:opacity-60">{submitting ? "Submitting..." : "Submit cancellation request"}</button>
    </form>
  </div>;
}
