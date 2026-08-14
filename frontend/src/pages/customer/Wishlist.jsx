import React from "react";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { FiTrash2, FiShoppingCart } from "react-icons/fi";

// Ensure 'export default' is present here
export default function Wishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-80px)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Wishlist Page Title */}
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-8">
          <span className="text-red-500">❤️</span> My Wishlist{" "}
          <span className="text-gray-400 text-2xl font-normal">
            ({wishlistItems?.length || 0})
          </span>
        </h1>

        {/* Empty State */}
        {!wishlistItems || wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100">
            <div className="text-7xl mb-4">💔</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-500 mb-8 max-w-sm">
              Save items you love to your wishlist.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-[#064e3b] hover:bg-emerald-900 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-md cursor-pointer"
            >
              Explore Products
            </button>
          </div>
        ) : (
          /* Wishlist Product Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((product) => {
              const originalPrice = Number(product?.price) || 0;
              const discountPercent = Number(product?.discount) || 0;
              const finalPrice =
                discountPercent > 0
                  ? originalPrice - (originalPrice * discountPercent) / 100
                  : originalPrice;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs relative flex flex-col justify-between"
                >
                  {/* Remove Item Button */}
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-2 rounded-full cursor-pointer z-10"
                    title="Remove item"
                  >
                    <FiTrash2 size={16} />
                  </button>

                  {/* Product Image */}
                  <div className="w-full h-48 flex items-center justify-center p-2 mb-4">
                    <img
                      src={
                        product.image_url ||
                        product.image ||
                        "https://via.placeholder.com/150"
                      }
                      alt={product.name || "Product"}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  {/* Details */}
                  <div>
                    <h3 className="font-bold text-gray-800 text-base line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 mb-4">
                      <span className="text-emerald-700 font-bold text-lg">
                        ৳{finalPrice.toFixed(0)}
                      </span>
                      {discountPercent > 0 && (
                        <span className="text-xs text-gray-400 line-through">
                          ৳{originalPrice.toFixed(0)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full bg-[#064e3b] hover:bg-emerald-900 text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FiShoppingCart size={18} /> Add to Cart
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}