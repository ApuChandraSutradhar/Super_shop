import React, { useState } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer"; 

export default function CustomerLayout({ children }) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (term) => {
    setSearchQuery(term);

    const productSection = document.getElementById("products");
    if (productSection) {
      productSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div>
      <Navbar onSearch={handleSearch} />

      <main>
        {React.Children.map(children, (child) =>
          React.cloneElement(child, { searchQuery })
        )}
      </main>
      <Footer />
    </div>
  );
}