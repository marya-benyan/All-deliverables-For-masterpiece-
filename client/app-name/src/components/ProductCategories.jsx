import React from 'react';

const ProductCategories = () => {
  const categories = [
    {
      id: 1,
      name: 'Candles',
      image: 'src/assets/images (2).jpg',
      alt: 'Paintings collection',
      slug: 'paintings',
    },
    {
      id: 2,
      name: 'Paintings',
      image: 'src/assets/image2.jpg',
      alt: 'Candles collection',
      slug: 'candles',
    },
    {
      id: 3,
      name: 'Resin',
      image: 'src/assets/images (1).jpg',
      alt: 'Resin collection',
      slug: 'resin',
    },
    {
      id: 4,
      name: 'Office Supplies',
      image: 'src/assets/YAFRI-Read-Pink.jpg',
      alt: 'Office supplies collection',
      slug: 'office-supplies',
    },
    {
      id: 5,
      name: 'Beauty Products',
      image: 'src/assets/images.jpg',
      alt: 'Printed clothing collection',
      slug: 'printed-clothing',
    },
    {
      id: 6,
      name: 'Printed Clothing',
      image: 'src/assets/clothes.jpg',
      alt: 'Beauty products collection',
      slug: 'beauty-products',
    },
  ];

  return (
    <div className="py-20 bg-gradient-to-b from-[#ecf4fc]/30 to-white">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <span className="inline-block px-4 py-1 rounded-full bg-[#d39c94]/20 text-[#bc7265] text-sm font-medium mb-4">OUR COLLECTIONS</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#bc7265] mb-3">Shop By Category</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Discover our premium selection of products designed with quality and style in mind</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="group relative rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <a href={`/shop?category=${category.slug}`} className="block">
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.alt}
                    className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#bc7265]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Hover effect with icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <svg className="w-5 h-5 text-[#bc7265]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-[#c37c73]">{category.name}</h3>
                    <span className="text-[#bc7265] text-sm font-medium">View All</span>
                  </div>
                  
                  <div className="mt-3 h-0.5 w-full bg-gray-100 relative">
                    <div className="h-0.5 bg-[#d39c94] w-0 group-hover:w-full transition-all duration-500 ease-out"></div>
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCategories;