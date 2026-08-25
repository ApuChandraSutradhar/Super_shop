import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FiPackage, FiClock, FiCheckCircle, FiTruck, FiShoppingBag, FiStar, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import CancellationRequestModal from "../../components/layout/CancellationRequestModal";

const ORDERS_URL = "http://127.0.0.1:8000/api/orders";

const readStoredJson = (key) => {
  const value = localStorage.getItem(key);
  if (!value) return null;
  try { return JSON.parse(value); } catch (error) {
    console.warn(`Unable to parse localStorage item: ${key}`, error);
    return null;
  }
};

const getCurrentCustomer = () => {
  const user = readStoredJson("user") || readStoredJson("customerUser");
  const id = user?.id ?? user?.user_id ?? user?.userId ?? localStorage.getItem("userId");
  return {
    id: id === null || id === undefined || id === "" ? null : String(id),
    phone: user?.phone ?? user?.mobile ?? user?.phone_number ?? localStorage.getItem("phone") ?? null,
  };
};

const getOrdersFromResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.orders)) return data.orders;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackOrder, setFeedbackOrder] = useState(null);
  const [cancellationOrder, setCancellationOrder] = useState(null);
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    const currentCustomer = getCurrentCustomer();
    if (!currentCustomer.id) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(ORDERS_URL, {
        params: { customer_id: currentCustomer.id },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      // Retain strict client filtering even though the API also scopes the query.
      const customerOrders = getOrdersFromResponse(response.data).filter(
        (order) => String(order?.customer_id ?? order?.user_id ?? "") === currentCustomer.id
      );
      setOrders(customerOrders);
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialFetch = window.setTimeout(fetchOrders, 0);
    const statusRefresh = window.setInterval(fetchOrders, 20000);
    window.addEventListener("focus", fetchOrders);
    return () => {
      window.clearTimeout(initialFetch);
      window.clearInterval(statusRefresh);
      window.removeEventListener("focus", fetchOrders);
    };
  }, [fetchOrders]);

  const getStatusBadge = (status) => {
    switch (String(status || "pending").toLowerCase()) {
      case "delivered":
        return <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold"><FiCheckCircle /> Delivered</span>;
      case "processing":
      case "confirmed":
        return <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold"><FiCheckCircle /> Confirmed</span>;
      case "shipping":
      case "shipped":
        return <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold"><FiTruck /> Shipping</span>;
      case "packing":
        return <span className="flex items-center gap-1 bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-xs font-bold"><FiPackage /> Packing</span>;
      default:
        return <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold"><FiClock /> Pending</span>;
    }
  };

  const getRefundBadge = (refund) => {
    const status = String(refund?.cancellation_status || "").toLowerCase();
    if (status === "approved") return <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">Refund Approved</span>;
    if (status === "rejected") return <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">Refund Rejected</span>;
    return <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">Cancellation Requested</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><FiPackage className="text-[#064e3b]" /> My Orders</h1>
            <p className="text-sm text-gray-400 mt-1">Track and manage all your placed grocery orders</p>
          </div>
          <span className="bg-emerald-50 text-[#064e3b] px-4 py-2 rounded-xl text-sm font-bold border border-emerald-100">Total Orders: {orders.length}</span>
        </div>

        {loading ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm text-sm text-gray-500">Loading your orders...</div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const items = order.order_items || order.items || [];
              const orderId = order.order_id || order.id || order.order_number;
              const total = order.payable_amount ?? order.total_amount ?? order.totalAmount ?? order.total ?? 0;
              const status = String(order.order_status || order.status || "pending").toLowerCase();
              const refund = order.refund;
              const canCancel = ["pending", "confirmed", "processing", "packing", "shipping", "shipped"].includes(status) && !refund;
              return (
                <div key={orderId || index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
                    <div><span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Order ID</span><p className="text-base font-bold text-gray-800">#{order.order_number || orderId || `ORD-${1000 + index}`}</p></div>
                    <div><span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Date</span><p className="text-sm font-semibold text-gray-600">{order.created_at ? new Date(order.created_at).toLocaleDateString() : order.date || "N/A"}</p></div>
                    <div><span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Status</span><div className="mt-0.5">{getStatusBadge(order.order_status || order.status)}</div></div>
                    {refund && <div><span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Refund Status</span><div className="mt-0.5">{getRefundBadge(refund)}</div></div>}
                    <div><span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Feedback</span><button disabled={String(order.order_status || order.status).toLowerCase() !== "delivered"} onClick={() => setFeedbackOrder(order)} className="mt-1 flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"><FiStar /> Feedback</button></div>
                    <div><span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Cancellation</span><button disabled={!canCancel} onClick={() => setCancellationOrder(order)} className="mt-1 flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400">Order Cancel</button></div>
                    {refund && <div><span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Refund Details</span><button onClick={() => navigate(`/my-orders/refund/${orderId}`)} className="mt-1 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-sky-700">View Refund Details</button></div>}
                    <div><span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Amount</span><p className="text-lg font-bold text-[#064e3b]">৳{total}</p></div>
                  </div>
                  <div className="py-4 space-y-3">
                    {items.length > 0 ? items.map((item, idx) => {
                      const quantity = item.quantity || 1;
                      const price = item.unit_price ?? item.price ?? item.product?.price ?? 0;
                      return <div key={item.order_item_id || item.id || idx} className="flex items-center justify-between text-sm py-1"><div className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-[#064e3b]"></span><span className="font-semibold text-gray-700">{item.product?.name || item.name || "Product Item"}</span><span className="text-xs bg-gray-100 px-2 py-0.5 rounded-md font-bold text-gray-500">x{quantity}</span></div><span className="font-bold text-gray-600">৳{Number(price) * Number(quantity)}</span></div>;
                    }) : <p className="text-sm text-gray-500 italic">Grocery Items Order</p>}
                  </div>
                  {(order.shipping_address || order.address || order.delivery_address) && <div className="pt-3 border-t border-gray-50 text-xs text-gray-400"><span className="font-bold text-gray-500">Deliver To:</span>{" "}{order.shipping_address || order.address || order.delivery_address}</div>}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="w-20 h-20 bg-emerald-50 text-[#064e3b] rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner"><FiShoppingBag /></div>
            <h3 className="text-xl font-bold text-gray-800">No Orders Placed Yet!</h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto">Looks like you haven't placed any grocery order yet. Start shopping now to fill up your bag!</p>
            <button onClick={() => navigate("/")} className="mt-2 bg-[#064e3b] hover:bg-emerald-900 text-white font-bold px-6 py-3 rounded-xl transition cursor-pointer shadow-sm active:scale-95">Start Shopping</button>
          </div>
        )}
        {feedbackOrder && <FeedbackModal order={feedbackOrder} onClose={() => setFeedbackOrder(null)} />}
        {cancellationOrder && <CancellationRequestModal order={cancellationOrder} customerId={getCurrentCustomer().id} onClose={() => setCancellationOrder(null)} onSubmitted={fetchOrders} />}
      </div>
    </div>
  );
}

function FeedbackModal({ order, onClose }) {
  const customer = getCurrentCustomer();
  const items = order.order_items || order.items || [];
  const [productId, setProductId] = useState(items[0]?.product_id || items[0]?.product?.id || "");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submitFeedback = async (event) => {
    event.preventDefault();
    if (!productId) { setError("Select a product to review."); return; }
    try {
      setSubmitting(true); setError("");
      await axios.post("http://127.0.0.1:8000/api/feedback", { order_id: order.order_id || order.id, customer_id: customer.id, product_id: productId, rating_stars: rating, comment });
      onClose();
    } catch (requestError) { setError(requestError.response?.data?.message || "Unable to save feedback. Please try again."); }
    finally { setSubmitting(false); }
  };

  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4"><form onSubmit={submitFeedback} className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100"><FiX /></button><h2 className="text-xl font-bold text-[#064e3b]">Rate your order</h2><p className="mt-1 text-sm text-gray-500">Your feedback helps FreshMart improve.</p>{error && <p className="mt-4 rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}<label className="mt-5 block text-sm font-bold text-gray-700">Product<select value={productId} onChange={(event) => setProductId(event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-emerald-600">{items.map((item, index) => <option key={item.order_item_id || index} value={item.product_id || item.product?.id}>{item.product?.name || item.name || "Product"}</option>)}</select></label><div className="mt-5"><p className="text-sm font-bold text-gray-700">Rating</p><div className="mt-2 flex gap-2">{[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" onClick={() => setRating(star)} aria-label={`${star} stars`} className={star <= rating ? "text-amber-400" : "text-gray-300"}><FiStar className="fill-current text-2xl" /></button>)}</div></div><label className="mt-5 block text-sm font-bold text-gray-700">Comment<textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength="1000" placeholder="Tell us about your experience (optional)" className="mt-1.5 min-h-28 w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-emerald-600" /></label><button disabled={submitting} className="mt-5 w-full rounded-xl bg-[#064e3b] py-3 font-bold text-white hover:bg-emerald-800 disabled:opacity-60">{submitting ? "Submitting..." : "Submit feedback"}</button></form></div>;
}
