import { Link } from "react-router-dom";
import { useState } from "react";
import CancellationRequestModal from "./CancellationRequestModal";

export default function OrderConfirmation({ orderId, orderDatabaseId, customerId, formData, paymentMethod, grandTotal, items = [] }) {
  const handlePrint = () => window.print();
  const [showCancellation, setShowCancellation] = useState(false);

  return (
    <>
      <style>{`
        .print-brand { display: none; }
        @media print {
          @page { margin: 14mm; }
          body * { visibility: hidden !important; }
          #order-invoice, #order-invoice * { visibility: visible !important; }
          #order-invoice {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            max-width: none;
            padding: 0;
            border: 0;
            border-radius: 0;
            box-shadow: none;
            color: #111827;
          }
          #order-invoice .print-brand {
            display: block;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 2px solid #064e3b;
            text-align: center;
            color: #064e3b;
          }
          #order-invoice .print-brand h1 { margin: 0; font-size: 26px; }
          #order-invoice .print-brand p { margin: 3px 0 0; font-size: 12px; font-weight: 700; letter-spacing: 2px; }
          #order-invoice .no-print { display: none !important; }
          #order-invoice .bg-gray-50 { background: #fff !important; }
          #order-invoice .text-gray-500, #order-invoice .text-gray-600 { color: #1f2937 !important; }
        }
      `}</style>
      <div id="order-invoice" className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-lg mx-auto border border-gray-100">
      <div className="print-brand">
        <h1>FreshMart</h1>
        <p>SUPER SHOP</p>
      </div>
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl font-bold">✓</div>
      <h2 className="text-2xl font-bold text-gray-800">Order Placed Successfully!</h2>
      <p className="text-gray-500 mt-2">Thank you for shopping with FreshMart. Your order ID is: <strong className="text-emerald-600">{orderId}</strong></p>

      <div className="bg-gray-50 p-4 rounded-xl my-6 text-left text-sm space-y-2 border border-gray-100">
        <p><strong>Customer:</strong> {formData.fullName}</p>
        <p><strong>Phone:</strong> {formData.phone}</p>
        <p><strong>Payment Method:</strong> {paymentMethod.toUpperCase()}</p>
        <div className="border-t border-gray-200 pt-3 mt-3">
          <p className="font-bold text-gray-700 mb-2">Ordered Products</p>
          {items.map((item, index) => (
            <div key={item.product_id || index} className="flex justify-between gap-4 py-1 text-gray-600">
              <span>{item.product_name || item.name} x{item.quantity}</span>
              <span className="font-semibold">৳{(Number(item.unit_price ?? item.price ?? 0) * Number(item.quantity || 1)).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 pt-3 mt-3">
          <p className="font-bold text-gray-700">Full Delivery Address</p>
          <p>{formData.address}, {formData.city}</p>
          {formData.notes && <p className="mt-1 text-gray-500"><strong>Delivery note:</strong> {formData.notes}</p>}
        </div>
        <p><strong>Total Amount:</strong> ৳{grandTotal.toFixed(2)}</p>
      </div>

      <div className="no-print flex flex-wrap justify-center gap-3">
        <button type="button" onClick={handlePrint} className="bg-gray-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-700 transition shadow-md cursor-pointer">Print Receipt / Invoice</button>
        <Link to="/" className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-md">Back to Home</Link>
        {orderDatabaseId && <button type="button" onClick={() => setShowCancellation(true)} className="w-full bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-md">Order Cancel</button>}
      </div>
      </div>
      {showCancellation && <CancellationRequestModal order={{ order_id: orderDatabaseId, order_number: orderId }} customerId={customerId} onClose={() => setShowCancellation(false)} />}
    </>
  );
}
