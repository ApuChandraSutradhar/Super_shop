import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";

export default function RecommendedProducts() {
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  useEffect(() => {
    const handleAuthChange = () => setToken(localStorage.getItem("token"));
    window.addEventListener("auth-changed", handleAuthChange);

    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, []);

  useEffect(() => {
    if (!token) {
      setProducts([]);
      return undefined;
    }

    const controller = new AbortController();

    axios.get("http://127.0.0.1:8000/api/products/recommended", {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    }).then((response) => {
      setProducts(Array.isArray(response.data) ? response.data : []);
    }).catch((error) => {
      if (!axios.isCancel(error)) setProducts([]);
    });

    return () => controller.abort();
  }, [token]);

  if (!token || products.length === 0) return null;

  return (
    <section className="-mt-6 px-4 max-w-7xl mx-auto">
      <div className="mb-10 flex flex-col items-center text-center">
        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
          FOR YOU
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2">
          Recommended for You
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Picks based on your shopping interests
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}