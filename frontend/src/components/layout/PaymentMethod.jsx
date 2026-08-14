import React, { useState } from "react";

export default function PaymentMethod({
  paymentMethod,
  setPaymentMethod,
  trxId,
  setTrxId,
  grandTotal,
  onBack,
  onConfirm,
}) {
  const [activeTab, setActiveTab] = useState("mobile"); 
  const [subMethod, setSubMethod] = useState("bkash"); 

  // Gateways Modals State
  const [showBkashModal, setShowBkashModal] = useState(false);
  const [showNagadModal, setShowNagadModal] = useState(false);

  // bKash Modal States
  const [bkashNumber, setBkashNumber] = useState("");
  const [bkashStep, setBkashStep] = useState(1); // 1: Number, 2: OTP, 3: PIN
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");

  // Nagad Modal States
  const [nagadNumber, setNagadNumber] = useState("");
  const [nagadPin, setNagadPin] = useState("");

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    if (tab === "cod") {
      setPaymentMethod("cod");
      setSubMethod("");
    } else if (tab === "mobile") {
      setPaymentMethod("bkash");
      setSubMethod("bkash");
    } else if (tab === "cards") {
      setPaymentMethod("card");
      setSubMethod("visa");
    }
  };

  const handleSubSelect = (method) => {
    setSubMethod(method);
    setPaymentMethod(method);
  };

  // Main Pay Button Click Handler
  const handleMainConfirm = () => {
    if (paymentMethod === "bkash") {
      setShowBkashModal(true);
    } else if (paymentMethod === "nagad") {
      setShowNagadModal(true);
    } else {
      onConfirm();
    }
  };

  // bKash Process Submission
  const handleBkashSubmit = () => {
    if (bkashStep === 1) {
      if (!bkashNumber || bkashNumber.length < 11) {
        alert("Please enter a valid bKash account number!");
        return;
      }
      setBkashStep(2);
    } else if (bkashStep === 2) {
      if (!otp) {
        alert("Please enter the verification code!");
        return;
      }
      setBkashStep(3);
    } else if (bkashStep === 3) {
      if (!pin) {
        alert("Please enter your PIN!");
        return;
      }
      const generatedTrx = "BK" + Math.floor(10000000 + Math.random() * 90000000);
      setTrxId(generatedTrx);
      setShowBkashModal(false);
      onConfirm(); // 👈 Order Confirm Step (Step 3)
    }
  };

  // Nagad Process Submission (Fixed Missing onConfirm)
  const handleNagadSubmit = () => {
    if (!nagadNumber || nagadNumber.length < 11) {
      alert("Please enter a valid Nagad account number!");
      return;
    }
    if (!nagadPin) {
      alert("Please enter your PIN!");
      return;
    }
    const generatedTrx = "NG" + Math.floor(10000000 + Math.random() * 90000000);
    setTrxId(generatedTrx);
    setShowNagadModal(false);
    onConfirm(); // 👈 Order Confirm Step (Step 3) - এখন ঠিকমতো কাজ করবে
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-bold text-gray-800">💳 Step 2: Payment Method</h2>
        <button
          onClick={onBack}
          className="text-xs text-emerald-600 font-semibold hover:underline cursor-pointer"
        >
          ← Edit Address
        </button>
      </div>

      {/* Select Payment Type Tabs */}
      <p className="text-xs font-semibold text-gray-700 mb-2">Select Payment Type</p>
      <div className="grid grid-cols-3 gap-2 mb-5">
        <button
          type="button"
          onClick={() => handleSelectTab("cod")}
          className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
            activeTab === "cod"
              ? "border-emerald-600 bg-emerald-50/40 text-emerald-800 font-bold shadow-xs"
              : "border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
        >
          <span className="text-lg">💵</span>
          <span className="text-xs">Cash on Delivery</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectTab("mobile")}
          className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
            activeTab === "mobile"
              ? "border-emerald-600 bg-emerald-50/40 text-emerald-800 font-bold shadow-xs"
              : "border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
        >
          <span className="text-lg">📱</span>
          <span className="text-xs">Mobile Banking</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectTab("cards")}
          className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
            activeTab === "cards"
              ? "border-emerald-600 bg-emerald-50/40 text-emerald-800 font-bold shadow-xs"
              : "border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
        >
          <span className="text-lg">💳</span>
          <span className="text-xs">Cards</span>
        </button>
      </div>

      {/* Tab Content Section */}
      <div className="bg-gray-50/60 p-4 rounded-xl border border-gray-100 mb-4">
        
        {/* COD Content */}
        {activeTab === "cod" && (
          <div className="text-xs text-gray-600 space-y-1">
            <p className="font-bold text-gray-800 text-sm">Cash on Delivery (COD)</p>
            <p>Pay with cash upon delivery of your items to your shipping address.</p>
          </div>
        )}

        {/* Mobile Banking Options */}
        {activeTab === "mobile" && (
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-3">Select Mobile Banking Partner</p>
            <div className="grid grid-cols-2 gap-3">
              
              {/* bKash Option */}
              <div
                onClick={() => handleSubSelect("bkash")}
                className={`p-3 rounded-xl border bg-white flex items-center justify-between cursor-pointer transition ${
                  subMethod === "bkash" ? "border-pink-500 ring-2 ring-pink-100" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#E2136E] flex items-center justify-center text-white font-black text-xs shadow-xs">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-xs text-gray-800">bKash</p>
                    <p className="text-[10px] text-gray-500">Fast Payment</p>
                  </div>
                </div>
                {subMethod === "bkash" && <span className="text-pink-600 text-xs font-bold">✓</span>}
              </div>

              {/* Nagad Option */}
              <div
                onClick={() => handleSubSelect("nagad")}
                className={`p-3 rounded-xl border bg-white flex items-center justify-between cursor-pointer transition ${
                  subMethod === "nagad" ? "border-orange-500 ring-2 ring-orange-100" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#F7921E] flex items-center justify-center text-white font-black text-xs shadow-xs">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-xs text-gray-800">Nagad</p>
                    <p className="text-[10px] text-gray-500">Mobile Wallet</p>
                  </div>
                </div>
                {subMethod === "nagad" && <span className="text-orange-600 text-xs font-bold">✓</span>}
              </div>

            </div>
          </div>
        )}

        {/* Cards Options */}
        {activeTab === "cards" && (
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-3">Select Card Type</p>
            <div className="grid grid-cols-3 gap-2">
              <div
                onClick={() => handleSubSelect("visa")}
                className={`p-2.5 rounded-xl border bg-white text-center cursor-pointer transition ${
                  subMethod === "visa" ? "border-blue-600 ring-2 ring-blue-100 font-bold" : "border-gray-200"
                }`}
              >
                <p className="text-xs text-blue-700 font-black tracking-wider">VISA</p>
              </div>

              <div
                onClick={() => handleSubSelect("mastercard")}
                className={`p-2.5 rounded-xl border bg-white text-center cursor-pointer transition ${
                  subMethod === "mastercard" ? "border-red-500 ring-2 ring-red-100 font-bold" : "border-gray-200"
                }`}
              >
                <p className="text-xs text-red-600 font-black tracking-wider">MasterCard</p>
              </div>

              <div
                onClick={() => handleSubSelect("dbbl")}
                className={`p-2.5 rounded-xl border bg-white text-center cursor-pointer transition ${
                  subMethod === "dbbl" ? "border-emerald-600 ring-2 ring-emerald-100 font-bold" : "border-gray-200"
                }`}
              >
                <p className="text-xs text-emerald-700 font-bold">DBBL Nexus</p>
              </div>
            </div>

            <div className="mt-3 space-y-2 bg-white p-3 rounded-lg border border-gray-200 text-xs">
              <input
                type="text"
                placeholder="Card Number"
                className="w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="p-2 border rounded-lg outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <input
                  type="password"
                  placeholder="CVC / CVV"
                  className="p-2 border rounded-lg outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Main Submit Button */}
      <button
        onClick={handleMainConfirm}
        className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl hover:bg-emerald-700 transition cursor-pointer text-xs shadow-sm"
      >
        Pay ৳{grandTotal.toFixed(2)} & Place Order
      </button>

      {/* bKash Gateway Modal */}
      {showBkashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-sm rounded-xl overflow-hidden shadow-2xl border border-gray-200">
            
            <div className="bg-[#E2136E] text-white p-4 flex justify-between items-center">
              <span className="font-extrabold text-lg tracking-wider">bKash</span>
              <button
                onClick={() => {
                  setShowBkashModal(false);
                  setBkashStep(1);
                }}
                className="text-white text-lg font-bold hover:opacity-80 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-gray-50 px-4 py-2 border-b flex justify-between text-xs text-gray-600">
              <span>Merchant: <strong>FreshMart</strong></span>
              <span className="font-bold text-gray-800">৳{grandTotal.toFixed(2)}</span>
            </div>

            <div className="p-6 text-center bg-[#E2136E] text-white py-8">
              {bkashStep === 1 && (
                <>
                  <p className="text-xs font-semibold mb-3 text-pink-100">Your bKash Account Number</p>
                  <input
                    type="text"
                    value={bkashNumber}
                    onChange={(e) => setBkashNumber(e.target.value)}
                    placeholder="e.g. 017XXXXXXXX"
                    className="w-full bg-white text-gray-800 text-center text-sm font-bold p-2.5 rounded-lg outline-none shadow-inner"
                  />
                  <p className="text-[10px] text-pink-200 mt-3">
                    Confirm and proceed, <span className="underline cursor-pointer">terms & conditions</span>
                  </p>
                </>
              )}

              {bkashStep === 2 && (
                <>
                  <p className="text-xs font-semibold mb-1 text-pink-100">Enter Verification Code (OTP)</p>
                  <p className="text-[10px] text-pink-200 mb-3">Sent to {bkashNumber}</p>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="e.g. 123456"
                    className="w-full bg-white text-gray-800 text-center text-sm font-bold p-2.5 rounded-lg outline-none shadow-inner"
                  />
                </>
              )}

              {bkashStep === 3 && (
                <>
                  <p className="text-xs font-semibold mb-3 text-pink-100">Enter 5-Digit bKash PIN</p>
                  <input
                    type="password"
                    maxLength={5}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="•••••"
                    className="w-full bg-white text-gray-800 text-center text-sm font-bold p-2.5 rounded-lg outline-none shadow-inner tracking-widest"
                  />
                </>
              )}
            </div>

            <div className="bg-gray-100 p-3 flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowBkashModal(false);
                  setBkashStep(1);
                }}
                className="w-1/2 bg-gray-300 text-gray-700 font-bold py-2 rounded-lg text-xs hover:bg-gray-400 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBkashSubmit}
                className="w-1/2 bg-[#E2136E] text-white font-bold py-2 rounded-lg text-xs hover:bg-pink-700 transition cursor-pointer"
              >
                {bkashStep === 3 ? "Confirm" : "Proceed"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Nagad Gateway Modal */}
      {showNagadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-sm rounded-xl overflow-hidden shadow-2xl border border-gray-200">
            
            <div className="bg-[#F7921E] text-white p-4 flex justify-between items-center">
              <span className="font-extrabold text-lg tracking-wider">Nagad</span>
              <button
                onClick={() => setShowNagadModal(false)}
                className="text-white text-lg font-bold hover:opacity-80 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-gray-50 px-4 py-2 border-b flex justify-between text-xs text-gray-600">
              <span>Merchant: <strong>FreshMart</strong></span>
              <span className="font-bold text-gray-800">৳{grandTotal.toFixed(2)}</span>
            </div>

            <div className="p-6 bg-[#F7921E] text-white space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-orange-100">Nagad Account Number</label>
                <input
                  type="text"
                  value={nagadNumber}
                  onChange={(e) => setNagadNumber(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full bg-white text-gray-800 text-sm font-bold p-2.5 rounded-lg outline-none shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-orange-100">PIN Number</label>
                <input
                  type="password"
                  maxLength={4}
                  value={nagadPin}
                  onChange={(e) => setNagadPin(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-white text-gray-800 text-sm font-bold p-2.5 rounded-lg outline-none shadow-inner tracking-widest"
                />
              </div>
            </div>

            <div className="bg-gray-100 p-3 flex space-x-2">
              <button
                type="button"
                onClick={() => setShowNagadModal(false)}
                className="w-1/2 bg-gray-300 text-gray-700 font-bold py-2 rounded-lg text-xs hover:bg-gray-400 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNagadSubmit}
                className="w-1/2 bg-[#F7921E] text-white font-bold py-2 rounded-lg text-xs hover:bg-orange-600 transition cursor-pointer"
              >
                Proceed
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}