import React from 'react';

const FeaturesSection = () => {
  const features = [
    {
      id: 1,
      title: 'Quality Product',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 2,
      title: 'Free Shipping',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#c37c73]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path fillRule="evenodd" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a3 3 0 01-3 3H9m4-3h6m-6 0a3 3 0 01-3-3V7m3 10a3 3 0 002-2.83V17m0 0a2 2 0 002 2h2a2 2 0 002-2v-5a2 2 0 00-2-2h-2a2 2 0 00-1.94 1.5" clipRule="evenodd" />
        </svg>
      )
    },
    {
      id: 3,
      title: '14-Day Return',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      )
    },
    {
      id: 4,
      title: '24/7 Support',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      )
    }
  ];

  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div key={feature.id} className="flex items-center p-6 bg-white border-2 border-gray-200 hover:border-[#c37c73] hover:shadow-xl transition duration-300">
              <div className="text-[#c37c73] mr-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-medium text-gray-800">{feature.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;