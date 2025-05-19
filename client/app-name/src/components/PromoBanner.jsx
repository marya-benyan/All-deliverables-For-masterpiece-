import React from 'react';

const PromoBanner = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Birthday Promo Card */}
        <div className="bg-[#ecf4fc] rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-4xl font-bold text-[#d39c94] mb-4">20% OFF THE ALL ORDER</h2>
          <p className="text-lg text-[#d39c94] mb-6">for your Special occasions</p>
          <a
            href="/shop"
            className="bg-[#d39c94] text-[#e3d6d8] px-8 py-3 rounded-full font-semibold hover:bg-[#b77c75] transition duration-300"
          >
            Shop Now
          </a>
        </div>

        {/* Eid Promo Card */}
        <div className="bg-[#ecf4fc] rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-4xl font-bold text-[#d39c94] mb-4">20% OFF THE ALL ORDER</h2>
          <p className="text-lg text-[#d39c94] mb-6">Eid collection</p>
          <a
            href="/shop"
            className="bg-[#d39c94] text-[#e3d6d8] px-8 py-3 rounded-full font-semibold hover:bg-[#b77c75] transition duration-300"
          >
            Shop Now
          </a>
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;
