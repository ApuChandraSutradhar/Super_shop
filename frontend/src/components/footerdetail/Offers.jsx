import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../product/ProductCard";
import { useCart } from "../../context/CartContext";
import staticProducts from "../../data/products";

export default function Offers() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    axios.get("http://127.0.0.1:8000/api/products", { signal: controller.signal })
      .then((response) => {
        const databaseProducts = Array.isArray(response.data) ? response.data : [];
        const catalog = Array.from(new Map([...staticProducts, ...databaseProducts].map((product) => [product.id, product])).values());
        setProducts(catalog.filter((product) => Number(product.discount) > 0));
      })
      .catch((requestError) => {
        if (!axios.isCancel(requestError)) {
          setProducts(staticProducts.filter((product) => Number(product.discount) > 0));
          setError("Live offers could not be loaded; showing available store offers instead.");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">Limited-time savings</p>
      <h1 className="mt-2 text-3xl font-extrabold text-gray-800">Current offers</h1>
      <p className="mt-2 text-gray-500">Shop products that are currently discounted in FreshMart.</p>
      {loading ? <p className="py-12 text-center text-gray-500">Loading offers...</p> : <>{error && <p className="mt-8 rounded-xl bg-amber-50 p-4 text-amber-700">{error}</p>}{products.length ? <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} onAddToCart={() => addToCart(product.id)} />)}</div> : <p className="mt-8 rounded-xl bg-gray-50 p-8 text-center text-gray-500">There are no discounted products at the moment. Please check back soon.</p>}</>}
    </section>
  );
}
