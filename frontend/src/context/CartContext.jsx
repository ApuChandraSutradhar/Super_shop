import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ১. LocalStorage থেকে ডায়নামিক ভাবে লগইন করা ইউজারের ID নেওয়া
  const getCurrentUserId = () => {
    const storedUser = localStorage.getItem("user"); // আপনার লগইনের সময় saved user object
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        return parsedUser.id || localStorage.getItem("userId") || null;
      } catch (e) {
        return localStorage.getItem("userId") || null;
      }
    }
    return localStorage.getItem("userId") || null;
  };

  const currentUserId = getCurrentUserId();

  // Fetch cart items for specific logged-in user
  const fetchCart = async () => {
    const userId = getCurrentUserId();
    
    // ইউজার লগইন না থাকলে কার্ট খালি দেখাবে
    if (!userId) {
      setCartItems([]);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`http://127.0.0.1:8000/api/cart/${userId}`);
      
      if (response.data && Array.isArray(response.data.items)) {
        setCartItems(response.data.items);
      } else if (Array.isArray(response.data)) {
        setCartItems(response.data);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // ইউজার চেঞ্জ হলে (Login/Logout) অটোমেটিক কার্ট ডাটা আপডেট হবে
  useEffect(() => {
    fetchCart();
  }, [currentUserId]);

  // Add item to database cart
  const addToCart = async (productId) => {
    const userId = getCurrentUserId();
    
    if (!userId) {
      alert("Please log in to add items to your cart!");
      return;
    }

    try {
      await axios.post("http://127.0.0.1:8000/api/cart/add", {
        user_id: userId,
        product_id: productId,
        quantity: 1,
      });

      await fetchCart(); // Sync Database
      setIsCartOpen(true);
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

  // Update product quantity
  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      await removeItem(cartItemId);
      return;
    }

    setCartItems((prevItems) =>
      (prevItems || []).map((item) =>
        item.cart_item_id === cartItemId ? { ...item, quantity: newQuantity } : item
      )
    );

    try {
      await axios.put("http://127.0.0.1:8000/api/cart/update", {
        cart_item_id: cartItemId,
        quantity: newQuantity,
      });
      await fetchCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
      fetchCart();
    }
  };

  // Remove single item
  const removeItem = async (cartItemId) => {
    setCartItems((prevItems) =>
      (prevItems || []).filter((item) => item.cart_item_id !== cartItemId)
    );

    try {
      await axios.delete(`http://127.0.0.1:8000/api/cart/remove/${cartItemId}`);
      await fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);
      fetchCart();
    }
  };

  // Calculate Subtotal with Discount
  const subtotal = (Array.isArray(cartItems) ? cartItems : []).reduce((acc, item) => {
    const product = item?.product || {};
    const originalPrice = Number(product?.price) || 0;
    const discountPercent = Number(product?.discount) || 0;

    const finalPrice =
      discountPercent > 0
        ? originalPrice - (originalPrice * discountPercent) / 100
        : originalPrice;

    return acc + finalPrice * (item?.quantity || 1);
  }, 0);

  const totalItemCount = (Array.isArray(cartItems) ? cartItems : []).reduce(
    (acc, item) => acc + (item?.quantity || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems: Array.isArray(cartItems) ? cartItems : [],
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeItem,
        subtotal,
        totalItemCount,
        loading,
        fetchCart, // লগইন করার সাথে সাথে কল করার জন্য
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);