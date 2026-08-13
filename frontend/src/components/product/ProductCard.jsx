import React from "react";
import { FiHeart, FiStar, FiPlus } from "react-icons/fi";

export default function ProductCard({ product, onAddToCart }) {
  const fallbackImage =
    "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=400";

  const originalPrice = Number(product?.price || 0);
  const discountPercent = Number(product?.discount || 0);
  const stockQty = Number(product?.stock || 0);

  // অটোমেটিক ডিসকাউন্ট প্রাইস হিসাব
  const finalPrice =
    discountPercent > 0
      ? Math.round(originalPrice - (originalPrice * discountPercent) / 100)
      : originalPrice;

  const isAvailable = stockQty > 0;

  return (
    <div className="group relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between">
      <div>
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              -{discountPercent}%
            </span>
          </div>
        )}

        {/* Wishlist */}
        <button
          aria-label="Add to Wishlist"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:bg-red-500 hover:text-white transition"
        >
          <FiHeart size={18} />
        </button>

        {/* Product Image */}
        <div className="bg-gray-50/80 h-48 w-full flex items-center justify-center p-4 relative overflow-hidden">
          <img
            src={product?.image || fallbackImage}
            alt={product?.name || "Product Image"}
            className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = fallbackImage;
            }}
          />
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-xs text-gray-400 font-medium">
            {product?.category}
          </p>

          <h3 className="font-bold text-base mt-1 text-gray-800 truncate group-hover:text-emerald-600 transition">
            {product?.name}
          </h3>

          <div className="flex items-center gap-1 mt-2">
            <FiStar className="text-yellow-400 fill-yellow-400" size={15} />
            <span className="font-bold text-sm text-gray-800">
              {product?.rating || "4.5"}
            </span>
            <span className="text-gray-400 text-xs">
              ({product?.review || "10"})
            </span>
          </div>
        </div>
      </div>

      {/* Price & Cart Section */}
      <div className="p-4 pt-0">
        <div className="flex items-baseline gap-2 mt-2">
          <h2 className="text-xl font-extrabold text-emerald-600">
            ৳{finalPrice}
          </h2>
          {discountPercent > 0 && (
            <del className="text-gray-400 text-xs">৳{originalPrice}</del>
          )}
        </div>

        {/* Dynamic Stock Badge */}
        <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-50">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              isAvailable
                ? "text-emerald-700 bg-emerald-50"
                : "text-red-600 bg-red-50"
            }`}
          >
            {isAvailable ? `In Stock (${stockQty})` : "Out of Stock"}
          </span>

          <button
            disabled={!isAvailable}
            onClick={() => onAddToCart && onAddToCart(product.id)}
            aria-label="Add to Cart"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
              isAvailable
                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md active:scale-95"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <FiPlus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}