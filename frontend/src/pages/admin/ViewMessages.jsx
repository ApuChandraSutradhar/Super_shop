import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiSearch } from "react-icons/fi";

const API = "http://127.0.0.1:8000/api";

export default function ViewMessages() {
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API}/admin/messages`, {
          signal: controller.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setMessages(Array.isArray(data?.messages) ? data.messages : []);
      } catch (requestError) {
        if (!axios.isCancel(requestError)) {
          setError(requestError.response?.status === 401 ? "Your admin session has expired. Please sign in again." : "Unable to load customer messages.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    return () => controller.abort();
  }, []);

  const filteredMessages = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return messages;
    return messages.filter((message) => [message.name, message.email, message.message].some((value) => String(value || "").toLowerCase().includes(normalized)));
  }, [messages, query]);

  const formatDate = (value) => value ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";

  return <div className="min-h-screen space-y-6 bg-gray-50/50 p-8">
    <div><h1 className="text-2xl font-bold text-gray-800">Customer Support Messages</h1><p className="mt-1 text-sm text-gray-500">Messages submitted through the Contact FreshMart page.</p></div>
    <div className="relative max-w-md"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, or message" className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-600" /></div>
    {error && <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
    <div className="overflow-x-auto rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      {loading ? <div className="space-y-3 py-2">{[1, 2, 3, 4].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-gray-100" />)}</div> : <table className="w-full min-w-[900px] border-collapse text-left"><thead><tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-400"><th className="pb-4"># ID</th><th className="pb-4">Customer Name</th><th className="pb-4">Email</th><th className="pb-4">Message Content</th><th className="pb-4">Date Submitted</th></tr></thead><tbody className="divide-y divide-gray-100 text-sm">{filteredMessages.length ? filteredMessages.map((message) => <tr key={message.id} className="hover:bg-gray-50/60"><td className="py-4 font-bold text-emerald-700">#{message.id}</td><td className="py-4 font-semibold text-gray-800">{message.name}</td><td className="py-4 text-gray-600"><a href={`mailto:${message.email}`} className="hover:text-emerald-700 hover:underline">{message.email}</a></td><td className="max-w-xl py-4 whitespace-pre-wrap text-gray-600">{message.message}</td><td className="py-4 whitespace-nowrap text-gray-500">{formatDate(message.created_at)}</td></tr>) : <tr><td colSpan="5" className="py-12 text-center text-sm text-gray-500">{query ? "No messages match your search." : "No customer messages have been submitted yet."}</td></tr>}</tbody></table>}
    </div>
  </div>;
}
