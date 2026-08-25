import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FiArrowLeft, FiCheckCircle, FiClock, FiCreditCard, FiXCircle } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

const API = "http://127.0.0.1:8000/api";
const money = (value) => `Tk ${Number(value || 0).toFixed(2)}`;

const currentCustomerId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || localStorage.getItem("customerUser") || "null");
    return user?.id ?? user?.user_id ?? user?.userId ?? localStorage.getItem("userId") ?? null;
  } catch {
    return localStorage.getItem("userId");
  }
};

const statusStyle = (status) => ({
  approved: { label: "Refund Approved", className: "bg-emerald-100 text-emerald-700", Icon: FiCheckCircle },
  rejected: { label: "Refund Rejected", className: "bg-red-100 text-red-700", Icon: FiXCircle },
}[String(status).toLowerCase()] || { label: "Cancellation Requested", className: "bg-amber-100 text-amber-700", Icon: FiClock });

export default function RefundDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [refund, setRefund] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRefund = useCallback(async () => {
    const customerId = currentCustomerId();
    if (!customerId) {
      setError("Please sign in to view your refund details.");
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`${API}/refunds/${orderId}`, { params: { customer_id: customerId } });
      setRefund(response.data?.refund || null);
      setError("");
    } catch (requestError) {
      setRefund(null);
      setError(requestError.response?.status === 404 ? "No cancellation request was found for this order." : "Unable to load refund details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadRefund();
    const timer = window.setInterval(loadRefund, 15000);
    window.addEventListener("focus", loadRefund);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", loadRefund); };
  }, [loadRefund]);

  if (loading) return <main className="min-h-screen bg-gray-50/50 p-8"><div className="mx-auto max-w-3xl rounded-2xl bg-white p-10 text-center text-sm text-gray-500 shadow-sm">Loading refund details...</div></main>;
  if (error || !refund) return <main className="min-h-screen bg-gray-50/50 p-8"><div className="mx-auto max-w-3xl rounded-2xl bg-white p-10 text-center shadow-sm"><p className="text-sm text-red-600">{error || "Refund details are unavailable."}</p><button onClick={() => navigate("/my-orders")} className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white">Back to My Orders</button></div></main>;

  const state = statusStyle(refund.cancellation_status);
  const StatusIcon = state.Icon;
  const payment = refund.order?.payment || {};
  const payoutMethod = refund.payment_method || payment.payment_method || "Original payment method";
  const accountNumber = refund.sender_number || payment.sender_number || payment.transaction_id || "Not available";
  const original = refund.original_amount ?? refund.order?.total_amount ?? 0;
  const remarks = refund.admin_remarks || (refund.cancellation_status === "rejected" ? "Your cancellation request was rejected by the admin." : "No additional remarks from the admin.");

  return <main className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6"><div className="mx-auto max-w-3xl">
    <button onClick={() => navigate("/my-orders")} className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-900"><FiArrowLeft /> Back to My Orders</button>
    <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      <div className="bg-emerald-950 p-6 text-white sm:p-8"><p className="text-xs font-bold uppercase tracking-widest text-emerald-200">Refund details</p><div className="mt-3 flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-bold">Order #{refund.order?.order_number || refund.order_id}</h1><p className="mt-1 text-sm text-emerald-100">Cancellation requested {refund.cancellation_date ? new Date(refund.cancellation_date).toLocaleString() : "—"}</p></div><span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${state.className}`}><StatusIcon /> {state.label}</span></div></div>
      <div className="space-y-7 p-6 sm:p-8">
        <section><h2 className="text-base font-bold text-gray-800">Deduction breakdown</h2><div className="mt-3 grid gap-3 sm:grid-cols-3"><Info label="Original amount" value={money(original)} /><Info label="Deduction percentage" value={`${Number(refund.deduction_percentage || 0).toFixed(2)}%`} /><Info label="Deduction Tk" value={money(refund.deduction_amount)} danger /></div><div className="mt-3 rounded-2xl bg-emerald-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Final refundable amount</p><p className="mt-1 text-2xl font-black text-emerald-800">{money(refund.calculated_refund_amount)}</p><p className="mt-1 text-xs text-emerald-700">Calculated at the {refund.order_status_at_request || "current"} order stage.</p></div></section>
        <section className="border-t border-gray-100 pt-6"><h2 className="flex items-center gap-2 text-base font-bold text-gray-800"><FiCreditCard className="text-emerald-700" /> Payment / payout details</h2><div className="mt-3 grid gap-3 sm:grid-cols-2"><Info label="Payout method" value={payoutMethod} /><Info label="Account number" value={accountNumber} /></div></section>
        <section className="border-t border-gray-100 pt-6"><h2 className="text-base font-bold text-gray-800">Admin remarks</h2><p className={`mt-3 rounded-2xl p-4 text-sm ${refund.cancellation_status === "rejected" ? "bg-red-50 text-red-700" : "bg-gray-50 text-gray-600"}`}>{remarks}</p></section>
      </div>
    </section>
  </div></main>;
}

function Info({ label, value, danger = false }) {
  return <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-gray-400">{label}</p><p className={`mt-1 text-sm font-bold ${danger ? "text-red-600" : "text-gray-800"}`}>{value}</p></div>;
}
