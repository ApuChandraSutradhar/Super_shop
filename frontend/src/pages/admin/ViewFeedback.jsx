import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiSearch, FiStar } from "react-icons/fi";

const API = "http://127.0.0.1:8000/api";
const asArray = (value) => Array.isArray(value) ? value : [];

function Stars({ rating }) {
  const score = Math.max(0, Math.min(5, Number(rating) || 0));
  return <span aria-label={`${score} out of 5 stars`} className="inline-flex gap-0.5 text-amber-400">{[1, 2, 3, 4, 5].map((star) => <FiStar key={star} className={star <= score ? "fill-current" : "text-gray-200"} />)}</span>;
}

export default function ViewFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const fetchFeedbacks = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API}/admin/feedbacks`, {
          signal: controller.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setFeedbacks(asArray(data?.feedbacks));
        setError("");
      } catch (requestError) {
        if (!axios.isCancel(requestError)) {
          setFeedbacks([]);
          setError(requestError.response?.status === 401 ? "Your admin session has expired. Please sign in again." : (requestError.response?.data?.message || "Unable to load customer feedback."));
        }
      } finally { setLoading(false); }
    };
    fetchFeedbacks();
    return () => controller.abort();
  }, []);

  const filteredFeedbacks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return feedbacks;
    return feedbacks.filter((feedback) => [feedback.customer_name, feedback.product_name].some((value) => String(value || "").toLowerCase().includes(normalized)));
  }, [feedbacks, query]);

  const formatDate = (value) => value ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";

  return <div className="min-h-screen space-y-6 bg-gray-50/50 p-8">
    <div><h1 className="text-2xl font-bold text-gray-800">Customer Feedbacks & Product Reviews</h1><p className="mt-1 text-sm text-gray-500">All customer ratings and reviews submitted for delivered products.</p></div>
    <div className="relative max-w-md"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customer or product" className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-600" /></div>
    {error && <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
    <div className="overflow-x-auto rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      {loading ? <div className="space-y-3 py-2">{[1, 2, 3, 4].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-gray-100" />)}</div> : <table className="w-full min-w-[1050px] border-collapse text-left"><thead><tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-400"><th className="pb-4">Review / Order</th><th className="pb-4">Product</th><th className="pb-4">Customer</th><th className="pb-4">Rating</th><th className="pb-4">Comment</th><th className="pb-4">Date & Time</th></tr></thead><tbody className="divide-y divide-gray-100 text-sm">{filteredFeedbacks.length ? filteredFeedbacks.map((feedback) => <tr key={feedback.review_id} className="hover:bg-gray-50/60"><td className="py-4"><p className="font-bold text-emerald-700">#{feedback.review_id}</p><p className="text-xs text-gray-400">Order {feedback.order_number || `#${feedback.order_id}`}</p></td><td className="py-4"><div className="flex items-center gap-3">{feedback.product_image ? <img src={feedback.product_image} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">N/A</div>}<span className="max-w-48 font-semibold text-gray-800">{feedback.product_name}</span></div></td><td className="py-4 font-medium text-gray-700">{feedback.customer_name}</td><td className="py-4"><Stars rating={feedback.rating_stars} /><span className="ml-2 text-xs text-gray-400">{feedback.rating_stars}/5</span></td><td className="max-w-xs py-4 text-gray-600">{feedback.comment || <span className="text-gray-400">No written review</span>}</td><td className="py-4 whitespace-nowrap text-gray-500">{formatDate(feedback.created_at)}</td></tr>) : <tr><td colSpan="6" className="py-12 text-center text-sm text-gray-500">{query ? "No feedback matches your search." : "No customer feedback has been submitted yet."}</td></tr>}</tbody></table>}
    </div>
  </div>;
}
