import React from 'react';

const ReturnPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-emerald-600 border-b pb-3">
        Return & Refund Policy - FreshMart
      </h1>
      
      <p className="mb-4 text-sm text-gray-600">
        Last updated: August 25, 2026
      </p>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-700">1. Order Cancellation & Refund Eligibility</h2>
          <p className="leading-relaxed">
            Customers can cancel their order from the Order Confirmation page or My Orders dashboard before delivery. Refund amounts depend on the current processing status of the order at the time of cancellation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-700">2. Refund Deduction Rules</h2>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Pending Status:</strong> 100% full refund (0% deduction).
              </li>
              <li>
                <strong>Confirmed Status:</strong> 5% deduction from the total product price.
              </li>
              <li>
                <strong>Processing / Packing Status:</strong> 10% deduction from the total product price.
              </li>
              <li>
                <strong>Shipping Status:</strong> 10% deduction from the total product price plus non-refundable delivery charge (Inside Dhaka: ৳60 / Outside Dhaka: ৳120).
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-700">3. Refund Request Process</h2>
          <p className="leading-relaxed mb-2">
            To request a cancellation and refund:
          </p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Click on the <strong>Order Cancel</strong> button from your order details page.</li>
            <li>Fill in the cancellation reason in the form provided and submit.</li>
            <li>Our Admin panel team will review your request. Upon approval, your refund will be processed back to your original payment method (bKash, Nagad, or Bank Account).</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-700">4. Processing Time</h2>
          <p className="leading-relaxed">
            Approved refunds are usually processed within 3-7 business days depending on your payment service provider.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-700">5. Contact Support</h2>
          <p className="leading-relaxed">
            If you have any questions about our Return Policy, please contact our support team via our Contact page or call our helpline.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ReturnPolicy;