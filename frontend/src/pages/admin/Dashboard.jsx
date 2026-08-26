import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiTrendingUp, FiAlertTriangle } from "react-icons/fi";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const emptyStats = { totalRevenue: 0, totalOrders: 0, activeCustomers: 0, productsListed: 0, revenueGrowth: 0, ordersGrowth: 0 };
const asArray = (value) => Array.isArray(value) ? value : [];
const numberOrZero = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;

export default function Dashboard() {
  // 1. Stat Box Data
  const [stats, setStats] = useState(emptyStats);

  // 2. Sales & Revenue Area Chart Data
  const [salesRevenueData, setSalesRevenueData] = useState([]);

  // 3. Category Sales Donut Chart Data
  const [categoryData, setCategoryData] = useState([]);

  // 4. Monthly Orders Bar Chart Data
  const [monthlyOrdersData, setMonthlyOrdersData] = useState([]);

  // 5. Recent Orders List
  const [recentOrders, setRecentOrders] = useState([
    { id: "ORD-001", date: "2026-07-28", status: "Delivered", price: "৳1240" },
    { id: "ORD-002", date: "2026-07-30", status: "Shipping", price: "৳680" },
    { id: "ORD-003", date: "2026-08-01", status: "Packing", price: "৳2150" },
    { id: "ORD-004", date: "2026-08-02", status: "Confirmed", price: "৳450" },
  ]);

  // 6. Low Stock Alert List
  const [lowStockProducts, setLowStockProducts] = useState([
    { name: "Atlantic Salmon Fillet", weight: "500 g", stockLeft: "15 left" },
    { name: "Tiger Prawns", weight: "500 g", stockLeft: "20 left" },
    { name: "Hilsa Fish", weight: "1 kg", stockLeft: "10 left" },
    { name: "Catla Fish Whole", weight: "1 kg", stockLeft: "18 left" },
  ]);
  const [pendingCash, setPendingCash] = useState({ total: 0, riders: [] });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Backend API Cconnected useEffect
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await axios.get("http://127.0.0.1:8000/api/admin/dashboard");
        const dashboard = data?.data ?? {};
        const apiStats = dashboard.stats ?? {};
        setStats({ totalRevenue: numberOrZero(apiStats.total_revenue), totalOrders: numberOrZero(apiStats.total_orders), activeCustomers: numberOrZero(apiStats.active_customers), productsListed: numberOrZero(apiStats.products_listed), revenueGrowth: numberOrZero(apiStats.revenue_growth), ordersGrowth: numberOrZero(apiStats.orders_growth) });
        setSalesRevenueData(asArray(dashboard.sales_revenue).map((item) => ({ month: item?.month || "", revenue: numberOrZero(item?.revenue), sales: numberOrZero(item?.sales) })));
        setMonthlyOrdersData(asArray(dashboard.monthly_orders).map((item) => ({ month: item?.month || "", orders: numberOrZero(item?.orders) })));
        setCategoryData(asArray(dashboard.category_sales).map((item, index) => ({ name: item?.name || "Others", value: numberOrZero(item?.value), amount: numberOrZero(item?.amount), color: item?.color || ["#10b981", "#f97316", "#3b82f6"][index % 3] })));
        setRecentOrders(asArray(dashboard.recent_orders).map((order) => ({ id: order?.order_number || `#${order?.order_id ?? "-"}`, date: order?.created_at || "—", status: order?.order_status || "Unknown", price: numberOrZero(order?.payable_amount) })));
        setLowStockProducts(asArray(dashboard.low_stock_products).map((product) => ({ name: product?.name || "Unnamed product", weight: "", stockLeft: `${numberOrZero(product?.stock)} left` })));
        const cash = dashboard.pending_cod_cash ?? {};
        setPendingCash({ total: numberOrZero(cash.total), riders: asArray(cash.riders) });
        setLoadError("");
      } catch (err) {
        console.error("Dashboard API Error:", err);
        setLoadError("Dashboard data is temporarily unavailable. Showing default values.");
        setStats(emptyStats); setSalesRevenueData([]); setMonthlyOrdersData([]); setCategoryData([]); setRecentOrders([]); setLowStockProducts([]); setPendingCash({ total: 0, riders: [] });
      } finally { setLoading(false); }
    };
    fetchDashboardData();
  }, []);

  const money = (value) => `৳${Number(value || 0).toLocaleString()}`;

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered": return "bg-emerald-100 text-emerald-700";
      case "Shipping": return "bg-orange-100 text-orange-700";
      case "Packing": return "bg-purple-100 text-purple-700";
      case "Confirmed": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-8">
      {loadError && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{loadError}</div>}
      {loading && <p className="text-sm text-gray-400">Loading dashboard data…</p>}
      {/* 📊 Top 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">💰</div>
          <div className="mt-4">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-800">৳{stats.totalRevenue}</h2>
            <p className="text-xs font-semibold text-gray-400 mt-1">Total Revenue</p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-2"><FiTrendingUp /> {stats.revenueGrowth >= 0 ? "↑" : "↓"} {Math.abs(stats.revenueGrowth)}% this month</span>
            <span className="hidden">
              <FiTrendingUp /> ↑ 18% this month
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl">🛒</div>
          <div className="mt-4">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-800">{stats.totalOrders}</h2>
            <p className="text-xs font-semibold text-gray-400 mt-1">Total Orders</p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-2"><FiTrendingUp /> {stats.ordersGrowth >= 0 ? "↑" : "↓"} {Math.abs(stats.ordersGrowth)}% this week</span>
            <span className="hidden">
              <FiTrendingUp /> ↑ 12% this week
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xl">👥</div>
          <div className="mt-4">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-800">{stats.activeCustomers}</h2>
            <p className="text-xs font-semibold text-gray-400 mt-1">Active Customers</p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-2">
              <FiTrendingUp /> ↑ 5% this month
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center text-xl">📦</div>
          <div className="mt-4">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-800">{stats.productsListed}</h2>
            <p className="text-xs font-semibold text-gray-400 mt-1">Products Listed</p>
          </div>
        </div>
      </div>

      {/* 📈 Charts Row: Sales & Revenue Area Chart + Category Sales Pie Chart */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div><h3 className="text-lg font-bold text-gray-800">Pending COD Cash Collection</h3><p className="text-xs text-gray-400 mt-1">Cash collected by riders awaiting settlement</p></div>
          <span className="text-xl font-extrabold text-emerald-600">{money(pendingCash.total)}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {asArray(pendingCash.riders).length ? asArray(pendingCash.riders).map((rider, index) => <div key={rider?.rider_name || index} className="rounded-xl bg-emerald-50 px-4 py-3"><p className="text-sm font-bold text-gray-800">{rider?.rider_name || "Unassigned rider"}</p><p className="text-sm font-semibold text-emerald-600">{money(rider?.amount)}</p></div>) : <p className="text-sm text-gray-400">No pending COD cash collections.</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales & Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Sales & Revenue</h3>
            <select className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-600 px-3 py-1.5 rounded-lg outline-none">
              <option>Last 7 months</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `৳${v / 1000}k`} />
                <Tooltip formatter={(value) => [`৳${value.toLocaleString()}`, ""]} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="sales" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Sales Donut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Category Sales</h3>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`${val}%`, "Share"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend List */}
          <div className="space-y-2 mt-4 border-t border-gray-100 pt-3">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                  <span className="text-gray-600">{cat.name}</span>
                </div>
                <span className="font-bold text-gray-800">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 📊 Monthly Orders Bar Chart */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Monthly Orders</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyOrdersData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="orders" fill="#10b981" radius={[8, 8, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables Row: Recent Orders & Low Stock Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-5">Recent Orders</h3>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition">
                <div>
                  <span className="font-bold text-emerald-700 text-sm">{order.id}</span>
                  <p className="text-xs text-gray-400">{order.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="font-bold text-gray-800 text-sm">{order.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <FiAlertTriangle className="text-amber-500" size={20} />
            <h3 className="text-lg font-bold text-gray-800">Low Stock Alert</h3>
          </div>
          <div className="space-y-4">
            {lowStockProducts.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition">
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">{item.name}</h4>
                  <p className="text-xs text-gray-400">{item.weight}</p>
                </div>
                <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold border border-orange-100">
                  {item.stockLeft}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
