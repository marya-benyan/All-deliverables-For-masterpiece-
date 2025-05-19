import React from "react";
import { Link } from "react-router-dom";
import HeroSection from '../assets/HERO.jpg';

const HeroBanner = () => {
  return (
    <div className="relative w-full max-w-full h-[680px] overflow-hidden">
      <img
        src={HeroSection}
        alt="Hero Background"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
        <h4 className="text-lg uppercase font-medium mb-3">
          10% Off Your First Order
        </h4>
        <h3 className="text-4xl font-bold mb-4">New Arrivals</h3>
        <div className="flex flex-col space-y-3">
          <Link
            to="/shop"
            className="bg-white text-black py-2 px-4 rounded-md shadow-md hover:bg-gray-200 transition duration-300"
          >
            Shop Now
          </Link>
          <Link
            to="/custom-product"
            className="bg-[#d39c94] text-white py-2 px-4 rounded-md shadow-md hover:bg-[#bc7265] transition duration-300"
          >
            Design Your Own Product
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;