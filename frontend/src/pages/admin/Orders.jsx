import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [ordersResponse, ridersResponse] = await Promise.all([
        axios.get(`${API}/admin/orders`),
        axios.get(`${API}/delivery-riders`, { params: { approved: 1 } }),
      ]);
      setOrders(ordersResponse.data?.orders || ordersResponse.data || []);
      setRiders(ridersResponse.data?.riders || ridersResponse.data || []);
    } catch (error) {
      console.error("Error loading order management data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusChange = async (orderId, orderStatus) => {
    try {
      await axios.patch(`${API}/admin/orders/${orderId}/status`, { order_status: orderStatus });
      setOrders((previous) => previous.map((order) =>
        (order.order_id || order.id) === orderId ? { ...order, order_status: orderStatus } : order
      ));
    } catch (error) {
      console.error("Status update error:", error);
      alert("Unable to update the order status.");
    }
  };

  const handleRiderAssignment = async (orderId, riderId) => {
    try {
      const response = await axios.patch(`${API}/admin/orders/${orderId}/delivery-rider`, {
        delivery_person_id: riderId || null,
      });
      setOrders((previous) => previous.map((order) =>
        (order.order_id || order.id) === orderId
          ? { ...order, delivery_person_id: riderId || null, delivery_person: response.data?.order?.delivery_person || null }
          : order
      ));
    } catch (error) {
      console.error("Rider assignment error:", error);
      alert("Unable to assign this delivery rider.");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const customerName = order.customer?.name || order.delivery_name || "";
    const orderId = String(order.order_id || order.id || order.order_number || "");
    const matchesSearch = customerName.toLowerCase().includes(searchQuery.toLowerCase()) || orderId.includes(searchQuery);
    const matchesTab = activeTab === "All" || (order.order_status || "").toLowerCase() === activeTab.toLowerCase();
    return matchesSearch && matchesTab;
  });

  return (
    <div className="p-8 bg-gray-50/50 min-h-screen space-y-6">
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
        <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search by customer or order ID..." className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm outline-none w-72 shadow-sm focus:border-emerald-500" />
      </div>

      <div className="flex gap-2 flex-wrap">
        {["All", "Pending", "Confirmed", "Processing", "Packing", "Shipping", "Delivered"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${activeTab === tab ? "bg-emerald-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>{tab}</button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 overflow-x-auto">
        {loading ? <p className="text-center text-gray-500 py-6">Loading orders...</p> : (
          <table className="w-full min-w-[1300px] text-left border-collapse">
            <thead><tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase">
              <th className="pb-4">Order ID</th><th className="pb-4">Customer</th><th className="pb-4">Date</th><th className="pb-4">Customer Address</th><th className="pb-4">Ordered Products and Quantity</th><th className="pb-4">Total</th><th className="pb-4">Payment</th><th className="pb-4">Assigned Delivery Rider</th><th className="pb-4 text-center">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredOrders.length ? filteredOrders.map((order) => {
                const orderId = order.order_id || order.id;
                const items = order.order_items || order.items || order.order_items_summary || [];
                return <tr key={orderId} className="hover:bg-gray-50/50 align-top">
                  <td className="py-4 font-bold text-emerald-600">{order.order_number || `#${orderId}`}</td>
                  <td className="py-4 font-semibold text-gray-800">{order.delivery_name || order.customer?.name || "Guest Customer"}<span className="block text-xs font-normal text-gray-400">{order.delivery_phone || order.customer?.phone || ""}</span></td>
                  <td className="py-4 text-xs text-gray-500">{order.created_at ? order.created_at.slice(0, 10) : "N/A"}</td>
                  <td className="py-4 text-xs text-gray-600 max-w-48 whitespace-normal">{order.shipping_address || "Not provided"}{order.order_notes && <span className="block mt-1 text-gray-400">Note: {order.order_notes}</span>}</td>
                  <td className="py-4 max-w-64 whitespace-normal">{items.length ? <div className="space-y-2">{items.map((item, index) => {
                    const image = item.image_url || item.image || item.product?.image_url || item.product?.image;
                    const name = item.product?.name || item.name || "Product";
                    return <div key={item.order_item_id || item.product_id || index} className="flex items-center gap-2"><div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-gray-100">{image ? <><img src={image} alt="" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; event.currentTarget.nextElementSibling.style.display = "flex"; }} /><span className="hidden h-full w-full items-center justify-center text-[10px] font-bold text-gray-400">N/A</span></> : <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-gray-400">N/A</span>}</div><span className="text-xs font-medium text-gray-700">{name} <span className="font-bold text-emerald-700">×{item.quantity || 0}</span></span></div>;
                  })}</div> : <span className="text-xs text-gray-500">No item details</span>}</td>
                  <td className="py-4 font-bold text-gray-900">৳{order.payable_amount || order.total_amount || 0}</td>
                  <td className="py-4"><span className="px-2.5 py-1 rounded-md bg-gray-100 text-xs font-semibold text-gray-700">{order.payment?.payment_method || "COD"}</span></td>
                  <td className="py-4"><select value={order.delivery_person_id || ""} onChange={(event) => handleRiderAssignment(orderId, event.target.value)} className="max-w-40 bg-gray-50 border border-gray-200 text-xs px-2 py-1.5 rounded-lg outline-none"><option value="">Unassigned</option>{riders.map((rider) => <option key={rider.id} value={rider.id}>{rider.name} ({rider.phone})</option>)}</select></td>
                  <td className="py-4 text-center"><select value={order.order_status || "pending"} onChange={(event) => handleStatusChange(orderId, event.target.value)} className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border-none outline-none cursor-pointer capitalize"><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="processing">Processing</option><option value="packing">Packing</option><option value="shipping">Shipping</option><option value="delivered">Delivered</option></select></td>
                </tr>;
              }) : <tr><td colSpan="9" className="text-center text-gray-500 py-6">No orders found matching your search.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
