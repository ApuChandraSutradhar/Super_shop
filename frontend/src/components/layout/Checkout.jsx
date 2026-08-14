import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import DeliveryAddress from "./DeliveryAddress";
import PaymentMethod from "./PaymentMethod";
import OrderConfirmation from "./OrderConfirmation";

export default function Checkout() {
  const { cartItems, subtotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

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

  // LocalStorage থেকে লগইন ইউজারের তথ্য লোড করা
  const [userId, setUserId] = useState(1); // ডিফল্ট ১ fallback

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.id || user.user_id) {
          setUserId(user.id || user.user_id);
        }
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

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [trxId, setTrxId] = useState("");
  const [orderId, setOrderId] = useState("");

  const deliveryFee = formData.city === "Dhaka" ? 60 : formData.city === "Outside Dhaka" ? 120 : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Helper Function: LocalStorage ও React Context-এর কার্ট সাথে সাথে খালি করার জন্য
  const forceClearCart = () => {
    // ১. LocalStorage থেকে কার্ট ডাটা রিমুভ
    localStorage.removeItem("cartItems");
    localStorage.removeItem("cart");

    // ২. CartContext এর clearCart ফাংশনটি দিয়ে React State খালি করা
    if (clearCart) {
      clearCart();
    }
  };

  // ✅ Laravel API integration with LocalStorage fallback/sync
  const handleConfirmOrder = async () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    setLoading(true);

    // ১. ব্যাকএন্ড API এর জন্য payload তৈরি
    const orderPayload = {
      customer_id: userId,
      total_amount: subtotal,
      discount_amount: 0.00,
      payable_amount: grandTotal,
      payment_method: paymentMethod,
      transaction_id: paymentMethod !== "COD" ? trxId : null,
      items: cartItems.map((item) => {
        const product = item?.product || item;
        const originalPrice = Number(product?.price) || 0;
        const discountPercent = Number(product?.discount) || 0;
        const finalPrice = discountPercent > 0 ? originalPrice - (originalPrice * discountPercent) / 100 : originalPrice;

        return {
          product_id: product?.id || item?.id,
          quantity: item?.quantity || 1,
          unit_price: finalPrice,
        };
      }),
    };

    try {
      // 🚀 Laravel Backend এ API Request পাঠানো
      const response = await axios.post("http://127.0.0.1:8000/api/place-order", orderPayload);

      let generatedOrderId = "";
      if (response.data && response.data.success) {
        generatedOrderId = response.data.order_number;
      } else {
        generatedOrderId = "FM-" + Math.floor(100000 + Math.random() * 900000);
      }

      setOrderId(generatedOrderId);

      // ২. LocalStorage এ সেভ করা (আপনার আগের লজিক অপরিবর্তিত)
      const newOrder = {
        id: generatedOrderId,
        date: new Date().toLocaleDateString("en-GB"),
        items: cartItems.map((item) => {
          const product = item?.product || item;
          const originalPrice = Number(product?.price) || 0;
          const discountPercent = Number(product?.discount) || 0;
          const finalPrice = discountPercent > 0 ? originalPrice - (originalPrice * discountPercent) / 100 : originalPrice;

          return {
            name: product?.name || "Product Item",
            quantity: item?.quantity || 1,
            price: finalPrice,
          };
        }),
        totalAmount: grandTotal.toFixed(2),
        status: "Pending",
        address: `${formData.address}, ${formData.city}`,
        paymentMethod: paymentMethod,
      };

      const existingOrders = JSON.parse(localStorage.getItem("user_orders")) || [];
      localStorage.setItem("user_orders", JSON.stringify([newOrder, ...existingOrders]));

      // 🔴 কার্ট সঙ্গে সঙ্গে খালি করা (No reload required)
      forceClearCart();

      setStep(3); // Go to Order Confirmation Step

    } catch (error) {
      console.error("API Order placement failed, attempting fallback save...", error);

      // ব্যাকএন্ডে কোনো সমস্যা হলে ক্লায়েন্ট সাইড যেন আটকে না থাকে
      const fallbackOrderId = "FM-" + Math.floor(100000 + Math.random() * 900000);
      setOrderId(fallbackOrderId);

      const newOrder = {
        id: fallbackOrderId,
        date: new Date().toLocaleDateString("en-GB"),
        items: cartItems.map((item) => {
          const product = item?.product || item;
          const originalPrice = Number(product?.price) || 0;
          const discountPercent = Number(product?.discount) || 0;
          const finalPrice = discountPercent > 0 ? originalPrice - (originalPrice * discountPercent) / 100 : originalPrice;

          return {
            name: product?.name || "Product Item",
            quantity: item?.quantity || 1,
            price: finalPrice,
          };
        }),
        totalAmount: grandTotal.toFixed(2),
        status: "Pending",
        address: `${formData.address}, ${formData.city}`,
        paymentMethod: paymentMethod,
      };

      const existingOrders = JSON.parse(localStorage.getItem("user_orders")) || [];
      localStorage.setItem("user_orders", JSON.stringify([newOrder, ...existingOrders]));

      // 🔴 কার্ট সঙ্গে সঙ্গে খালি করা (No reload required)
      forceClearCart();

      setStep(3);
    } finally {
      setLoading(false);
    }
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
                  loading={loading}
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
                  const product = item?.product || item;
                  const originalPrice = Number(product?.price) || 0;
                  const discountPercent = Number(product?.discount) || 0;
                  const finalPrice = discountPercent > 0 ? originalPrice - (originalPrice * discountPercent) / 100 : originalPrice;

                  return (
                    <div key={item?.cart_item_id || item?.id || idx} className="flex justify-between items-center text-xs">
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