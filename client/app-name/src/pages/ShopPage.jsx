import React, { useState } from "react";
import { Link } from "react-router-dom";
import ShopSidebar from "../components/ShopSidebar";
import ShopProduct from "../components/ShopProduct";

const ShopPage = () => {
  const [filters, setFilters] = useState({
    category: "all",
    price: "price-all",
  });

  const handleFilterChange = (filterType, value) => {
    console.log(`Filter ${filterType} changed to:`, value);
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: value,
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap -mx-4">
        <div className="w-full md:w-1/4 px-4 mb-8 md:mb-0">
          <ShopSidebar onFilterChange={handleFilterChange} />
        </div>
        <div className="w-full md:w-3/4 px-4">
          <ShopProduct
            categoryFilter={filters.category}
            priceFilter={filters.price}
          />
        </div>
      </div>
    </div>
  );
};

export default ShopPage;