import React from "react";
import {
  FiHeart,
  FiStar,
  FiPlus,
} from "react-icons/fi";

export default function ProductCard({ product }) {
  return (
    <div className="group relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between">

      <div>
        {/* Discount Badge */}
        {product?.discount > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              -{product.discount}%
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
            src={product?.image}
            alt={product?.name}
            className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
          />
        </div>

        {/* Content */}
        <div className="p-4">

          {/* Category */}
          <p className="text-xs text-gray-400 font-medium">
            {product?.category}
          </p>

          {/* Name */}
          <h3 className="font-bold text-base mt-1 text-gray-800 truncate group-hover:text-emerald-600 transition">
            {product?.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-2">
            <FiStar className="text-yellow-400 fill-yellow-400" size={15} />

            <span className="font-bold text-sm text-gray-800">
              {product?.rating}
            </span>

            <span className="text-gray-400 text-xs">
              ({product?.review})
            </span>
          </div>

        </div>
      </div>

      {/* Price & Cart Section */}
      <div className="p-4 pt-0">

        {/* Price (Bangladeshi Taka Standard) */}
        <div className="flex items-baseline gap-2 mt-2">
          <h2 className="text-xl font-extrabold text-emerald-600">
            ৳{product?.price}
          </h2>

          {product?.oldPrice && (
            <del className="text-gray-400 text-xs">
              ৳{product.oldPrice}
            </del>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-50">
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
            In Stock
          </span>

          <button 
            aria-label="Add to Cart"
            className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition"
          >
            <FiPlus size={18} />
          </button>
        </div>

      </div>

    </div>
  );
}