import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const currentUserId = user?.id || user?.user_id || 1;

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/coupons?user_id=${currentUserId}`
      );
      setCoupons(response.data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#004225]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            🎟️ My Coupons & Offers
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Apply these coupons at checkout to get exciting discounts!
          </p>
        </div>

        {/* Coupons List */}
        {coupons.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center shadow-sm border border-gray-100">
            <div className="text-4xl mb-3">🎁</div>
            <h3 className="text-lg font-semibold text-gray-700">No Coupons Available</h3>
            <p className="text-gray-400 text-sm mt-1">
              Shop for ৳2000 or more to unlock exclusive discount coupons!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coupons.map((coupon) => {
              const isUsed = Number(coupon.is_used) === 1;

              return (
                <div
                  key={coupon.coupon_id}
                  className={`relative bg-white rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${
                    isUsed ? "opacity-70 bg-gray-50 border-gray-200" : "border-emerald-200"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                        ৳{parseFloat(coupon.discount_amount || 0).toFixed(0)} OFF
                      </span>
                      <h3 className="text-xl font-bold text-gray-800 mt-2 tracking-wide font-mono">
                        {coupon.coupon_code}
                      </h3>
                    </div>

                    {/* Status Badge */}
                    {isUsed ? (
                      <span className="bg-gray-200 text-gray-600 text-xs px-2.5 py-1 rounded-full font-medium">
                        Used
                      </span>
                    ) : (
                      <span className="bg-emerald-500 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="mt-4 pt-3 border-t border-dashed border-gray-200 space-y-1 text-xs text-gray-500">
                    <p>
                      • Minimum Order:{" "}
                      <span className="font-semibold text-gray-700">
                        ৳{parseFloat(coupon.min_purchase_amount || 0).toFixed(0)}
                      </span>
                    </p>
                    <p>
                      • Valid Until:{" "}
                      <span className="font-semibold text-gray-700">
                        {coupon.valid_until
                          ? new Date(coupon.valid_until).toLocaleDateString("en-GB")
                          : "N/A"}
                      </span>
                    </p>
                  </div>

                  {/* Copy Button */}
                  {!isUsed && (
                    <button
                      onClick={() => handleCopyCode(coupon.coupon_code)}
                      className="mt-4 w-full py-2 px-4 bg-[#004225] hover:bg-[#00331c] text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 active:scale-95"
                    >
                      {copiedCode === coupon.coupon_code ? (
                        <>✓ Copied to Clipboard</>
                      ) : (
                        <>📋 Copy Code</>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}