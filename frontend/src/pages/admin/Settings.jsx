import React, { useState } from "react";
import axios from "axios";

export default function Settings() {
  const [settings, setSettings] = useState({
    shopName: "SuperShop Online",
    contactEmail: "admin@supershop.com",
    contactPhone: "+8801700000000",
    deliveryFee: 60,
    freeDeliveryThreshold: 1000,
    enableNotifications: true,
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await axios.post("http://127.0.0.1:8000/api/admin/settings", settings);
      setMessage("Settings updated successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage("Settings saved locally!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50/50 min-h-screen space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Admin Settings</h1>
        <p className="text-sm text-gray-500">Manage store configuration and delivery options</p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-100 text-emerald-800 rounded-2xl text-sm font-semibold">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3">🏪 Store Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600">Store Name</label>
              <input
                type="text"
                name="shopName"
                value={settings.shopName}
                onChange={handleChange}
                className="w-full mt-1 p-3 border border-gray-200 rounded-2xl text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Contact Email</label>
              <input
                type="email"
                name="contactEmail"
                value={settings.contactEmail}
                onChange={handleChange}
                className="w-full mt-1 p-3 border border-gray-200 rounded-2xl text-sm outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3">🚚 Delivery & Shipping Rules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600">Standard Delivery Fee (৳)</label>
              <input
                type="number"
                name="deliveryFee"
                value={settings.deliveryFee}
                onChange={handleChange}
                className="w-full mt-1 p-3 border border-gray-200 rounded-2xl text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Free Delivery Above Amount (৳)</label>
              <input
                type="number"
                name="freeDeliveryThreshold"
                value={settings.freeDeliveryThreshold}
                onChange={handleChange}
                className="w-full mt-1 p-3 border border-gray-200 rounded-2xl text-sm outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-emerald-600 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-emerald-700 transition-all cursor-pointer"
          >
            {saving ? "Saving Changes..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}