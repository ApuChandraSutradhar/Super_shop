import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    subtotal,
  } = useCart();

  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate("/checkout");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Semi-transparent Overlay */}
      <div
        className="fixed inset-0 transition-opacity backdrop-blur-[2px]"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Cart Side Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b flex justify-between items-center bg-emerald-700 text-white">
            <h2 className="text-xl font-bold">Shopping Cart</h2>
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="text-white hover:text-gray-200 text-2xl font-bold transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Cart Items List */}
          <div className="p-6 flex-1 overflow-y-auto space-y-4">
            {(!cartItems || cartItems.length === 0) ? (
              <div className="text-center py-12 text-gray-500 font-medium">
                Your cart is currently empty.
              </div>
            ) : (
              cartItems.map((item, index) => {
                const itemId = item?.cart_item_id || index;
                const product = item?.product || {};
                const imageUrl = product?.image_url || product?.image || "https://via.placeholder.com/80";

                // Discount & Final Price Calculation
                const originalPrice = Number(product?.price) || 0;
                const discountPercent = Number(product?.discount) || 0;

                const finalPrice = discountPercent > 0 
                  ? originalPrice - (originalPrice * discountPercent) / 100 
                  : originalPrice;

                return (
                  <div
                    key={itemId}
                    className="flex items-center justify-between border-b pb-4"
                  >
                    <img
                      src={imageUrl}
                      alt={product?.name || "Product"}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />

                    <div className="flex-1 ml-4">
                      <h3 className="font-semibold text-gray-800">
                        {product?.name || "Product Item"}
                      </h3>

                      {/* Discount Price Display */}
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-emerald-600 font-bold">
                          ৳{finalPrice.toFixed(2)}
                        </span>
                        {discountPercent > 0 && (
                          <span className="text-xs text-gray-400 line-through">
                            ৳{originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(itemId, (item?.quantity || 1) - 1)}
                          className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300 font-bold cursor-pointer active:scale-90 transition"
                        >
                          -
                        </button>
                        <span className="font-semibold text-sm px-3 py-1 bg-gray-50 border rounded">
                          {item?.quantity || 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(itemId, (item?.quantity || 1) + 1)}
                          className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300 font-bold cursor-pointer active:scale-90 transition"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Delete Item Button */}
                    <button
                      type="button"
                      onClick={() => removeItem(itemId)}
                      className="text-red-500 hover:text-red-700 ml-4 font-bold text-lg p-2 cursor-pointer transition active:scale-90"
                      title="Remove Item"
                    >
                      🗑
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {cartItems && cartItems.length > 0 && (
            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-between text-lg font-bold text-gray-800 mb-4">
                <span>Subtotal:</span>
                <span className="text-emerald-700">৳{subtotal.toFixed(2)}</span>
              </div>
              <button
                type="button"
                onClick={handleCheckout}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg cursor-pointer"
              >
                Checkout Now
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}