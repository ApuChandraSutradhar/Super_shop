import React from "react";

export default function DeliveryAddress({ formData, handleInputChange, onNext }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.address) {
      alert("Please fill in all required fields!");
      return;
    }
    if (!formData.city) {
      alert("Please select your Delivery Area (Inside or Outside Dhaka)!");
      return;
    }
    onNext();
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center">
        📍 Step 1: Delivery Address
      </h2>

      <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
        <div>
          <label className="block font-medium text-gray-700 mb-1">Full Name *</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            required
            placeholder="e.g. John Doe"
            className="w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 bg-gray-50/50 text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Mobile Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              placeholder="017XXXXXXXX"
              className="w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 bg-gray-50/50 text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">City / District *</label>
            <select
              name="city"
              value={formData.city || ""}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 bg-white text-xs"
            >
              <option value="" disabled hidden>
                -- Select Area --
              </option>
              <option value="Dhaka">Inside Dhaka (৳60)</option>
              <option value="Outside Dhaka">Outside Dhaka (৳120)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-1">Full Address *</label>
          <textarea
            name="address"
            rows="2"
            value={formData.address}
            onChange={handleInputChange}
            required
            placeholder="House no, Road no, Area..."
            className="w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 text-xs resize-none"
          ></textarea>
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-1">Order Notes (Optional)</label>
          <input
            type="text"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Special instructions for delivery..."
            className="w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-lg hover:bg-emerald-700 transition mt-2 cursor-pointer text-xs shadow-sm"
        >
          Continue to Payment →
        </button>
      </form>
    </div>
  );
}