import React from 'react';

const AboutUs = () => {
  return (
    <div className="bg-[#f8f8f8] py-16">
      <div className="container mx-auto px-4">
        {/* العنوان الرئيسي */}
        <h1 className="text-4xl font-bold text-[#d39c94] text-center mb-4">
          ABOUT US
        </h1>
        <p className="text-lg text-[#d39c94] text-center mb-12">
          Home - About Us
        </p>

        {/* القسم الرئيسي */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* النص */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#d39c94]">
              — Our Story —
            </h2>
            <p className="text-lg text-black">
              At <strong>ELORA MARYA</strong>, we believe in empowering young talents and showcasing the beauty of handcrafted art. Our journey began with a simple mission: to create opportunities for young artisans to share their creativity with the world while supporting their livelihoods.
            </p>
            <p className="text-lg text-black">
              We are passionate about preserving the charm of handmade crafts, whether it’s paintings, candles, resin art, or printed clothing. By connecting skilled artisans with customers, we not only celebrate creativity but also promote sustainable and ethical trade.
            </p>
            <p className="text-lg text-black">
              Every product you find on our platform is crafted with care and tells a unique story. By shopping with us, you are not just purchasing an item but supporting a dream and contributing to a brighter future for talented youth.
            </p>
          </div>

          {/* الصورة */}
          <div className="h-96 rounded-lg overflow-hidden">
            <img
              src="src\assets\worcshops.jpg"
              alt="ELORA MARYA Artisans at Work"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* قسم لماذا تختارنا */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-[#d39c94] mb-6">
            Why Choose Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-[#d39c94] mb-4">
                Handcrafted Excellence
              </h3>
              <p className="text-lg text-black">
                Each product is made with precision and passion, ensuring the highest quality.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-[#d39c94] mb-4">
                Support for Artisans
              </h3>
              <p className="text-lg text-black">
                Your purchase directly supports talented artisans and their communities.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-[#d39c94] mb-4">
                Sustainable Practices
              </h3>
              <p className="text-lg text-black">
                We are committed to eco-friendly and ethical production methods.
              </p>
            </div>
          </div>
        </div>

        {/* قسم جديد: مهمتنا وتأثيرنا */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-[#d39c94] mb-6">
            Our Mission and Impact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#f1e9e8] p-4 border border-[#d39c94] rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mx-auto mb-4 text-[#d39c94]"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              <h3 className="text-xl font-bold text-[#d39c94] mb-2">
                Empowering Youth
              </h3>
              <p className="text-lg text-black">
                Our platform aims to employ young men and women, providing them with opportunities to showcase their talents and build sustainable careers in the arts.
              </p>
            </div>
            <div className="bg-[#f1e9e8] p-4 border border-[#d39c94] rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mx-auto mb-4 text-[#d39c94]"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h1.17A3 3 0 015 5zm6 5a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
              </svg>
              <h3 className="text-xl font-bold text-[#d39c94] mb-2">
                Eco-Friendly Practices
              </h3>
              <p className="text-lg text-black">
                We use environmentally friendly products and packaging methods to minimize our ecological footprint and promote a greener future.
              </p>
            </div>
            <div className="bg-[#f1e9e8] p-4 border border-[#d39c94] rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mx-auto mb-4 text-[#d39c94]"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
              <h3 className="text-xl font-bold text-[#d39c94] mb-2">
                Training Courses
              </h3>
              <p className="text-lg text-black">
                We offer training courses in various handmade crafts, equipping youth with the skills to excel in their creative journeys.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;