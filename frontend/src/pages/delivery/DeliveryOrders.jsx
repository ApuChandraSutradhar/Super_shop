import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FiCheckCircle, FiClock, FiMapPin, FiPackage, FiTruck } from "react-icons/fi";

const API = "http://127.0.0.1:8000/api";
const STATUS_OPTIONS = ["pending", "confirmed", "processing", "packing", "shipping", "delivered"];

const getRider = () => {
  try {
    return JSON.parse(localStorage.getItem("deliveryUser"));
  } catch {
    return null;
  }
};

const getStatus = (status) => String(status || "pending").toLowerCase();

const statusStyles = {
  pending: "bg-amber-100 text-amber-700 ring-amber-200",
  confirmed: "bg-sky-100 text-sky-700 ring-sky-200",
  processing: "bg-blue-100 text-blue-700 ring-blue-200",
  packing: "bg-indigo-100 text-indigo-700 ring-indigo-200",
  shipping: "bg-purple-100 text-purple-700 ring-purple-200",
  delivered: "bg-green-100 text-green-700 ring-green-200",
};

function StatusBadge({ status }) {
  const normalizedStatus = getStatus(status);
  const icon = normalizedStatus === "delivered"
    ? <FiCheckCircle />
    : normalizedStatus === "shipping"
      ? <FiTruck />
      : <FiClock />;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${statusStyles[normalizedStatus] || "bg-gray-100 text-gray-700 ring-gray-200"}`}>
      {icon} {normalizedStatus}
    </span>
  );
}

export default function DeliveryOrders({ completed = false }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const rider = getRider();

  const fetchOrders = useCallback(async () => {
    if (!rider?.id) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API}/delivery/orders`, {
        params: {
          delivery_person_id: rider.id,
          scope: completed ? "completed" : "active",
        },
      });
      setOrders(response.data?.orders || []);
      setMessage("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }, [completed, rider?.id]);

  useEffect(() => {
    fetchOrders();
    const refresh = window.setInterval(fetchOrders, 20000);
    return () => window.clearInterval(refresh);
  }, [fetchOrders]);

  const updateOrderStatus = async (order, nextStatus) => {
    const orderStatus = getStatus(nextStatus);
    if (orderStatus === getStatus(order.order_status) || !rider?.id) return;

    let cashCollected;
    if (orderStatus === "delivered" && order.payment?.payment_method === "COD") {
      const enteredCash = window.prompt("Cash collected (৳):", order.total_amount);
      if (enteredCash === null) return;

      cashCollected = Number(enteredCash);
      if (!Number.isFinite(cashCollected) || cashCollected < 0) {
        setMessage("Enter a valid cash amount before marking this order as delivered.");
        return;
      }
    }

    setUpdatingOrderId(order.order_id);
    setMessage("");

    try {
      const response = await axios.patch(`${API}/delivery/orders/${order.order_id}/status`, {
        delivery_person_id: rider.id,
        order_status: orderStatus,
        ...(cashCollected !== undefined ? { cash_collected: cashCollected } : {}),
      });

      const updatedOrder = response.data?.order || { order_status: orderStatus };
      // The API returns rider-scoped metrics, so the overview can update without waiting for polling.
      window.dispatchEvent(new CustomEvent("delivery-dashboard-updated", { detail: response.data?.stats }));
      setOrders((currentOrders) => currentOrders.map((currentOrder) => (
        currentOrder.order_id === order.order_id
          ? { ...currentOrder, ...updatedOrder, delivery: updatedOrder.delivery || currentOrder.delivery }
          : currentOrder
      )));
      setMessage(
        orderStatus === "delivered"
          ? "Order marked as delivered and delivery details saved."
          : `Order status updated to ${orderStatus}.`,
      );
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to update this order.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
            <FiTruck className="text-[#064e3b]" /> {completed ? "Completed Deliveries" : "Assigned Orders"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {completed ? "Your completed delivery history." : "Change each assigned order's status directly from the table."}
          </p>
        </div>
        <span className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-bold text-[#064e3b]">
          {orders.length} {completed ? "completed" : "active"}
        </span>
      </div>

      {message && <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-[#064e3b]">{message}</div>}

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer / Address</th>
              <th className="p-4">Date</th>
              <th className="p-4">Ordered Items</th>
              <th className="p-4">Total / Payment</th>
              <th className="p-4">Status</th>
              {!completed && <th className="p-4">Update Status</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={completed ? 6 : 7} className="p-10 text-center text-gray-500">Loading orders...</td></tr>
            ) : orders.length ? orders.map((order) => {
              const status = getStatus(order.order_status);
              const isUpdating = updatingOrderId === order.order_id;

              return (
                <tr key={order.order_id} className="align-top hover:bg-gray-50/70">
                  <td className="p-4 font-bold text-emerald-700">{order.order_number || `#${order.order_id}`}</td>
                  <td className="p-4"><p className="font-semibold text-gray-800">{order.delivery_name || order.customer?.name || "Customer"}</p><p className="mt-1 flex max-w-64 gap-1 text-xs text-gray-500"><FiMapPin className="mt-0.5 shrink-0" />{order.shipping_address || "No address supplied"}</p></td>
                  <td className="p-4 text-xs text-gray-500">{order.created_at ? new Date(order.created_at).toLocaleDateString() : "—"}</td>
                  <td className="p-4 text-xs text-gray-600">{(order.order_items || []).map((item, index) => <p key={item.order_item_id || index}>{item.product?.name || "Product"} × {item.quantity}</p>)}</td>
                  <td className="p-4"><p className="font-bold text-gray-800">৳{order.total_amount}</p><p className="mt-1 text-xs text-gray-500">{order.payment?.payment_method || "COD"}</p></td>
                  <td className="p-4"><StatusBadge status={status} /></td>
                  {!completed && (
                    <td className="p-4">
                      <select
                        value={status}
                        disabled={isUpdating}
                        onChange={(event) => updateOrderStatus(order, event.target.value)}
                        className={`cursor-pointer rounded-full px-3 py-2 text-xs font-bold capitalize ring-1 outline-none transition focus:ring-2 focus:ring-emerald-500 disabled:cursor-wait disabled:opacity-60 ${statusStyles[status] || "bg-gray-100 text-gray-700 ring-gray-200"}`}
                        aria-label={`Update status for ${order.order_number || `order ${order.order_id}`}`}
                      >
                        {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                      {isUpdating && <p className="mt-1 text-xs text-gray-400">Saving…</p>}
                    </td>
                  )}
                </tr>
              );
            }) : (
              <tr><td colSpan={completed ? 6 : 7} className="p-10 text-center text-gray-500"><FiPackage className="mx-auto mb-2 text-2xl text-gray-300" />No {completed ? "completed deliveries" : "assigned orders"} found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
