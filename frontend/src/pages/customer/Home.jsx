import React from "react";
import CategorySidebar from "../../components/category/CategorySidebar";
import HeroBanner from "../../components/home/HeroBanner";
import FeatureCards from "../../components/home/FeatureCards";
import ProductGrid from "../../components/product/ProductGrid";
import TrendingProducts from "../../components/product/TrendingProducts";
import CartDrawer from "../../components/layout/CartDrawer"; // CartDrawer Import করা হলো

export default function Home({ searchQuery }) {
  return (
    <div className="max-w-[1600px] mx-auto mt-6 px-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <CategorySidebar />
        </div>

        <div className="col-span-9">
          <HeroBanner />
        </div>

        <div className="col-span-12">
          <FeatureCards />
        </div>

        <div className="col-span-12">
          <ProductGrid />
        </div>

        <div className="col-span-12">
          <TrendingProducts />
        </div>
      </div>

      {/* কাস্টমার '+' ক্লিক করলে কার্ট স্লাইডবার শো করার জন্য */}
      <CartDrawer />
    </div>
  );
}