import React from "react";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext"; // আপনার ফোল্ডার স্ট্রাকচার অনুযায়ী পাথ ঠিক রাখুন
import { useCart } from "../../context/CartContext";
import { FiTrash2, FiShoppingCart } from "react-icons/fi";

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // সেফটি সহ কার্টে এড করার হ্যান্ডলার
  const handleAddToCart = (product) => {
    if (!product) return;
    
    // ব্যাকএন্ডের জন্য সঠিক আইডি বের করা (id, product_id বা _id)
    const targetId = product.id || product.product_id || product._id;
    
    if (!targetId) {
      console.error("Product ID not found in item:", product);
      return;
    }

    // ব্যাকএন্ডে শুধু ID পাঠানো নিশ্চিত করা
    addToCart(targetId);
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-80px)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-8">
          <span className="text-red-500">❤️</span> My Wishlist{" "}
          <span className="text-gray-400 text-2xl font-normal">
            ({Array.isArray(wishlistItems) ? wishlistItems.length : 0})
          </span>
        </h1>

        {!Array.isArray(wishlistItems) || wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-xs">
            <div className="text-7xl mb-4">💔</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Your wishlist is empty
            </h2>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="bg-[#064e3b] hover:bg-emerald-900 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-md cursor-pointer mt-4"
            >
              Explore Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item, index) => {
              // Item যদি অবজেক্ট না হয়ে আইডি আকারে থাকে বা nested product থাকে
              const product = item?.product || item;
              const productId = product?.id || product?.product_id || product?._id || index;

              const originalPrice = Number(product?.price) || 0;
              const discountPercent = Number(product?.discount) || 0;
              const finalPrice =
                discountPercent > 0
                  ? Math.round(originalPrice - (originalPrice * discountPercent) / 100)
                  : originalPrice;

              return (
                <div
                  key={productId}
                  className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm relative flex flex-col justify-between"
                >
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(productId)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-2 rounded-full cursor-pointer z-10 transition-colors"
                  >
                    <FiTrash2 size={16} />
                  </button>

                  <div className="w-full h-48 flex items-center justify-center p-2 mb-4">
                    <img
                      src={product?.image || product?.image_url || "https://via.placeholder.com/150"}
                      alt={product?.name || "Product"}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-800 text-base line-clamp-1">
                      {product?.name || "Unnamed Product"}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 mb-4">
                      <span className="text-emerald-700 font-bold text-lg">
                        ৳{finalPrice}
                      </span>
                      {discountPercent > 0 && (
                        <span className="text-xs text-gray-400 line-through">
                          ৳{originalPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-[#064e3b] hover:bg-emerald-900 text-white font-medium py-3 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-95 shadow-xs"
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