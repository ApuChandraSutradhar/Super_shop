import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import { useSearch } from "../../context/SearchContext";
import { useCart } from "../../context/CartContext";

export default function ProductGrid() {
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useSearch();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [suggestion, setSuggestion] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

  const sectionRef = useRef(null);
  const previousFilters = useRef("");
  const normalizedSearch = (searchQuery || "").trim();
  const filterKey = `${selectedCategory || "All"}|${normalizedSearch}`;

  useEffect(() => {
    // A changed search/category always starts from page one. Skipping the
    // request here prevents loading a stale page for the new filter.
    if (previousFilters.current !== filterKey) {
      previousFilters.current = filterKey;
      if (page !== 1) {
        setPage(1);
        return undefined;
      }
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError("");
        setSuggestion(null);
        const response = await axios.get("http://127.0.0.1:8000/api/products", {
          params: {
            paginate: 1,
            per_page: 12,
            page,
            ...(selectedCategory && selectedCategory !== "All" ? { category: selectedCategory } : {}),
            ...(normalizedSearch ? { search: normalizedSearch } : {}),
          },
          signal: controller.signal,
        });

        setProducts(Array.isArray(response.data?.data) ? response.data.data : []);
        setPagination({
          current_page: response.data?.current_page || 1,
          last_page: response.data?.last_page || 1,
          total: response.data?.total || 0,
        });
        setSuggestion(response.data?.suggestion || null);
      } catch (requestError) {
        if (!axios.isCancel(requestError)) {
          console.error("Error fetching products from database:", requestError);
          setProducts([]);
          setSuggestion(null);
          setError("Unable to load products. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [filterKey, normalizedSearch, page, selectedCategory]);

  useEffect(() => {
    if (selectedCategory) {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedCategory]);

  // Reset filters and scroll to top
  const handleBackToHome = () => {
    if (setSearchQuery) setSearchQuery("");
    if (setSelectedCategory) setSelectedCategory("All");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSuggestionClick = () => {
    if (suggestion && setSearchQuery) setSearchQuery(suggestion);
  };

  const pageNumbers = useMemo(() => {
    const start = Math.max(1, pagination.current_page - 2);
    const end = Math.min(pagination.last_page, start + 4);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [pagination]);

  const changePage = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.last_page || nextPage === page) return;
    setPage(nextPage);
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="products" ref={sectionRef} className="mt-2 lg:mt-3 px-4 scroll-mt-24 relative z-10">
      {/* Title Section */}
      <div className="flex flex-col items-center text-center mb-6 relative">
        <h2 className="text-3xl font-bold text-gray-800">
          {searchQuery
            ? `Search Results for "${searchQuery}"`
            : selectedCategory && selectedCategory !== "All"
            ? selectedCategory
            : "All Products"}
        </h2>
        <p className="text-gray-500 mt-2">
            {error || (!suggestion && (searchQuery
            ? `${pagination.total} products in ${selectedCategory}`
            : `${products.length > 0 ? "Products" : "No products"} found in "${selectedCategory}".`))}
        </p>

        {/* Back to Home button on active search */}
        {searchQuery && (
          <button
            onClick={handleBackToHome}
            className="mt-4 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm rounded-full transition-all duration-300 shadow-sm flex items-center gap-2"
          >
            ← Back to Home Page
          </button>
        )}
      </div>

      {/* Product List Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" aria-label="Loading products">
          {Array.from({ length: 8 }, (_, index) => <div key={index} className="h-80 animate-pulse rounded-3xl bg-gray-100" />)}
        </div>
      ) : products.length > 0 ? (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => addToCart(product.id)}
            />
          ))}
        </div>
        {pagination.last_page > 1 && (
          <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Product pagination">
            <button type="button" onClick={() => changePage(page - 1)} disabled={page === 1} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition hover:border-emerald-600 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
            {pageNumbers.map((pageNumber) => <button key={pageNumber} type="button" onClick={() => changePage(pageNumber)} aria-current={pageNumber === page ? "page" : undefined} className={`h-10 min-w-10 rounded-lg px-3 text-sm font-bold transition ${pageNumber === page ? "bg-emerald-600 text-white" : "border border-gray-200 text-gray-600 hover:border-emerald-600 hover:text-emerald-700"}`}>{pageNumber}</button>)}
            <button type="button" onClick={() => changePage(page + 1)} disabled={page === pagination.last_page} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition hover:border-emerald-600 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
          </nav>
        )}
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          {searchQuery && suggestion && !error && (
            <p className="text-gray-600 text-lg font-medium mb-2">
              No products found for &apos;{searchQuery}&apos;. Did you mean{" "}
              <button
                type="button"
                onClick={handleSuggestionClick}
                className="font-bold text-emerald-700 underline decoration-2 underline-offset-2 hover:text-emerald-900"
              >
                {suggestion}
              </button>
              ?
            </p>
          )}
          {!suggestion && (
            <p className="text-gray-500 text-lg font-medium">
              {error || (searchQuery
                ? `No products found matching "${searchQuery}".`
                : `No products found in "${selectedCategory}".`)}
            </p>
          )}
          {searchQuery && (
            <button
              onClick={handleBackToHome}
              className="mt-4 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm rounded-full transition-all duration-300 inline-block"
            >
              Back to Home Page
            </button>
          )}
        </div>
      )}
    </section>
  );
}
