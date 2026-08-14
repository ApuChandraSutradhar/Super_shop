import React from "react";
import { Link } from "react-router-dom";

export default function OrderConfirmation({ orderId, formData, paymentMethod, grandTotal }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-lg mx-auto border border-gray-100">
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl font-bold">
        ✓
      </div>
      <h2 className="text-2xl font-bold text-gray-800">Order Placed Successfully!</h2>
      <p className="text-gray-500 mt-2">
        Thank you for shopping with FreshMart. Your order ID is:{" "}
        <strong className="text-emerald-600">{orderId}</strong>
      </p>

      <div className="bg-gray-50 p-4 rounded-xl my-6 text-left text-sm space-y-2 border border-gray-100">
        <p><strong>Customer:</strong> {formData.fullName}</p>
        <p><strong>Phone:</strong> {formData.phone}</p>
        <p><strong>Address:</strong> {formData.address}, {formData.city}</p>
        <p><strong>Payment Method:</strong> {paymentMethod.toUpperCase()}</p>
        <p><strong>Total Amount:</strong> ৳{grandTotal.toFixed(2)}</p>
      </div>

      <Link
        to="/"
        className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-md"
      >
        Back to Home
      </Link>
    </div>
  );
}