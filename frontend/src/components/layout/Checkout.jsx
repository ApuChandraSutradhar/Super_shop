import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import DeliveryAddress from "./DeliveryAddress";
import PaymentMethod from "./PaymentMethod";
import OrderConfirmation from "./OrderConfirmation";

export default function Checkout() {
  const { cartItems, subtotal } = useCart();
  const [step, setStep] = useState(1);

  // পেজে ঢোকা মাত্রই স্ক্রিন একদম উপরে নিয়ে যাবে
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setFormData((prev) => ({
          ...prev,
          fullName: user.name || user.fullName || "",
          phone: user.phone || user.mobile || user.phone_number || "",
          address: user.address || "",
        }));
      } catch (err) {
        console.error("Error loading user profile:", err);
      }
    }
  }, []);

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [trxId, setTrxId] = useState("");
  const [orderId, setOrderId] = useState("");

  const deliveryFee = formData.city === "Dhaka" ? 60 : formData.city === "Outside Dhaka" ? 120 : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Fixed handleConfirmOrder (Removed premature trxId check)
  const handleConfirmOrder = () => {
    const generatedOrderId = "FM-" + Math.floor(100000 + Math.random() * 900000);
    setOrderId(generatedOrderId);
    setStep(3); // Go to Order Confirmation
  };

  return (
    <div className="bg-gray-50 py-4 px-3 sm:px-6 min-h-[calc(100vh-80px)]">
      <div className="max-w-5xl mx-auto">
        
        {/* Step Progress Tracker - Compact */}
        <div className="flex justify-center items-center mb-4">
          <div className="flex items-center space-x-3 text-xs sm:text-sm">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${step >= 1 ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-600"}`}>1</div>
            <span className={`font-semibold ${step >= 1 ? "text-emerald-700" : "text-gray-400"}`}>Delivery</span>
            
            <div className={`w-8 h-0.5 ${step >= 2 ? "bg-emerald-600" : "bg-gray-200"}`}></div>

            <div className={`flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${step >= 2 ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-600"}`}>2</div>
            <span className={`font-semibold ${step >= 2 ? "text-emerald-700" : "text-gray-400"}`}>Payment</span>

            <div className={`w-8 h-0.5 ${step >= 3 ? "bg-emerald-600" : "bg-gray-200"}`}></div>

            <div className={`flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${step === 3 ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-600"}`}>3</div>
            <span className={`font-semibold ${step === 3 ? "text-emerald-700" : "text-gray-400"}`}>Confirmation</span>
          </div>
        </div>

        {/* STEP 3: SUCCESS */}
        {step === 3 ? (
          <OrderConfirmation
            orderId={orderId}
            formData={formData}
            paymentMethod={paymentMethod}
            grandTotal={grandTotal}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
            
            {/* Left Column: Form */}
            <div className="lg:col-span-2">
              {step === 1 && (
                <DeliveryAddress
                  formData={formData}
                  handleInputChange={handleInputChange}
                  onNext={() => setStep(2)}
                />
              )}

              {step === 2 && (
                <PaymentMethod
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  trxId={trxId}
                  setTrxId={setTrxId}
                  grandTotal={grandTotal}
                  onBack={() => setStep(1)}
                  onConfirm={handleConfirmOrder}
                />
              )}
            </div>

            {/* Right Column: Compact Order Summary */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-4">
              <h3 className="text-base font-bold text-gray-800 mb-2 border-b pb-2">Order Summary</h3>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {cartItems.map((item, idx) => {
                  const product = item?.product || {};
                  const originalPrice = Number(product?.price) || 0;
                  const discountPercent = Number(product?.discount) || 0;
                  const finalPrice = discountPercent > 0 ? originalPrice - (originalPrice * discountPercent) / 100 : originalPrice;

                  return (
                    <div key={item?.cart_item_id || idx} className="flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-gray-800 line-clamp-1">{product?.name || "Product"}</p>
                        <p className="text-gray-500">Qty: {item?.quantity} × ৳{finalPrice.toFixed(2)}</p>
                      </div>
                      <span className="font-bold text-gray-700 ml-2">৳{(finalPrice * item?.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t my-2 pt-2 space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-800">৳{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-gray-800">৳{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-emerald-700 border-t pt-1.5 mt-1">
                  <span>Grand Total</span>
                  <span>৳{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}