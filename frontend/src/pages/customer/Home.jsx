import React, { useEffect, useState } from "react";
import CategorySidebar from "../../components/category/CategorySidebar";
import HeroBanner from "../../components/home/HeroBanner";
import FeatureCards from "../../components/home/FeatureCards";
import ProductGrid from "../../components/product/ProductGrid";
import RecommendedProducts from "../../components/product/RecommendedProducts";
import TrendingProducts from "../../components/product/TrendingProducts";

export default function Home({ searchQuery }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem("token")));

  useEffect(() => {
    const handleAuthChange = () => setIsAuthenticated(Boolean(localStorage.getItem("token")));
    window.addEventListener("auth-changed", handleAuthChange);

    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto mt-6 px-6">
      <div className={`grid grid-cols-12 gap-x-6 ${isAuthenticated ? "gap-y-6" : "gap-y-2"}`}>
        <div className="col-span-3">
          <CategorySidebar />
        </div>

        <div className="col-span-9">
          <HeroBanner />
        </div>

        <div className="col-span-12">
          <FeatureCards />
        </div>

        {isAuthenticated && (
          <div className="col-span-12">
            <RecommendedProducts />
          </div>
        )}

        <div className="col-span-12">
          <TrendingProducts isAuthenticated={isAuthenticated} />
        </div>

        <div className="col-span-12">
          <ProductGrid />
        </div>
      </div>
    </div>
  );
}
