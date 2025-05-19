import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ShopSidebar = ({ onFilterChange }) => {
  const [categories, setCategories] = useState([]);
  const [categoryChecked, setCategoryChecked] = useState('all');
  const [priceChecked, setPriceChecked] = useState('price-all');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categories');
        console.log('Categories fetched:', response.data); // للتحقق
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error.response?.data || error.message);
      }
    };
    fetchCategories();
  }, []);

  const handleCheckboxChange = (filterType, id) => {
    if (filterType === 'category') {
      setCategoryChecked(id);
      console.log('Category filter changed to:', id); // للتحقق
      onFilterChange('category', id);
    } else if (filterType === 'price') {
      setPriceChecked(id);
      const priceRange = id === 'price-all' ? 'price-all' : getPriceRange(id);
      console.log('Price filter changed to:', priceRange); // للتحقق
      onFilterChange('price', priceRange);
    }
  };

  const getPriceRange = (id) => {
    switch (id) {
      case 'price-1': return '0-100';
      case 'price-2': return '100-200';
      case 'price-3': return '200-300';
      case 'price-4': return '300-400';
      case 'price-5': return '400-500';
      default: return 'price-all';
    }
  };

  return (
    <div className="w-full">
      {/* Category Filter */}
      <div className="mb-8 pb-5 border-b border-gray-200">
        <h5 className="text-lg font-normal mb-4 lowercase">category</h5>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="category-all"
                checked={categoryChecked === 'all'}
                onChange={() => handleCheckboxChange('category', 'all')}
                className="w-4 h-4 rounded border-gray-300 focus:ring-pink-300"
                style={{ accentColor: '#d39c94' }}
              />
              <label htmlFor="category-all" className="ml-2 text-sm text-gray-700">All Categories</label>
            </div>
          </div>
          {categories.map((category) => (
            <div key={category._id} className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`category-${category._id}`}
                  checked={categoryChecked === category._id}
                  onChange={() => handleCheckboxChange('category', category._id)}
                  className="w-4 h-4 rounded border-gray-300 focus:ring-pink-300"
                  style={{ accentColor: '#d39c94' }}
                />
                <label htmlFor={`category-${category._id}`} className="ml-2 text-sm text-gray-700">
                  {category.name}
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="mb-8 pb-5 border-b border-gray-200">
        <h5 className="text-lg font-normal mb-4 lowercase">price</h5>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="price-all"
                checked={priceChecked === 'price-all'}
                onChange={() => handleCheckboxChange('price', 'price-all')}
                className="w-4 h-4 rounded border-gray-300 focus:ring-pink-300"
                style={{ accentColor: '#d39c94' }}
              />
              <label htmlFor="price-all" className="ml-2 text-sm text-gray-700">All Price</label>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="price-1"
                checked={priceChecked === 'price-1'}
                onChange={() => handleCheckboxChange('price', 'price-1')}
                className="w-4 h-4 rounded border-gray-300 focus:ring-pink-300"
                style={{ accentColor: '#d39c94' }}
              />
              <label htmlFor="price-1" className="ml-2 text-sm text-gray-700">$0 - $100</label>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="price-2"
                checked={priceChecked === 'price-2'}
                onChange={() => handleCheckboxChange('price', 'price-2')}
                className="w-4 h-4 rounded border-gray-300 focus:ring-pink-300"
                style={{ accentColor: '#d39c94' }}
              />
              <label htmlFor="price-2" className="ml-2 text-sm text-gray-700">$100 - $200</label>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="price-3"
                checked={priceChecked === 'price-3'}
                onChange={() => handleCheckboxChange('price', 'price-3')}
                className="w-4 h-4 rounded border-gray-300 focus:ring-pink-300"
                style={{ accentColor: '#d39c94' }}
              />
              <label htmlFor="price-3" className="ml-2 text-sm text-gray-700">$200 - $300</label>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="price-4"
                checked={priceChecked === 'price-4'}
                onChange={() => handleCheckboxChange('price', 'price-4')}
                className="w-4 h-4 rounded border-gray-300 focus:ring-pink-300"
                style={{ accentColor: '#d39c94' }}
              />
              <label htmlFor="price-4" className="ml-2 text-sm text-gray-700">$300 - $400</label>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="price-5"
                checked={priceChecked === 'price-5'}
                onChange={() => handleCheckboxChange('price', 'price-5')}
                className="w-4 h-4 rounded border-gray-300 focus:ring-pink-300"
                style={{ accentColor: '#d39c94' }}
              />
              <label htmlFor="price-5" className="ml-2 text-sm text-gray-700">$400 - $500</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopSidebar;