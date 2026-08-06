import React, { useState, useEffect } from 'react';
import { Search, MapPin, Tag } from 'lucide-react';
import api from '../services/api';

const SearchBar = ({ onSearch }) => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/api/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCats();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ search, categoryId: categoryId || null, location });
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto glass-panel bg-white/70 dark:bg-slate-900/60 p-2 rounded-2xl md:rounded-full border border-slate-200/50 dark:border-slate-800/40 shadow-xl flex flex-col md:flex-row gap-2 md:items-center relative z-20"
    >
      {/* Text Search */}
      <div className="flex-1 flex items-center gap-3 px-4 py-2 border-b md:border-b-0 md:border-r border-slate-200/50 dark:border-slate-800/50">
        <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
        <div className="flex flex-col w-full text-left">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Product</label>
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cameras, consoles, power tools..." 
            className="w-full text-sm font-semibold bg-transparent border-none outline-none placeholder-slate-400 text-slate-900 dark:text-white mt-0.5"
          />
        </div>
      </div>

      {/* Category Dropdown */}
      <div className="flex-1 flex items-center gap-3 px-4 py-2 border-b md:border-b-0 md:border-r border-slate-200/50 dark:border-slate-800/50">
        <Tag className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
        <div className="flex flex-col w-full text-left">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Category</label>
          <select 
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full text-sm font-semibold bg-transparent border-none outline-none text-slate-900 dark:text-white mt-0.5 cursor-pointer appearance-none"
          >
            <option value="" className="dark:bg-slate-950">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} className="dark:bg-slate-950">
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Location */}
      <div className="flex-1 flex items-center gap-3 px-4 py-2">
        <MapPin className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
        <div className="flex flex-col w-full text-left">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Location</label>
          <input 
            type="text" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City or district..." 
            className="w-full text-sm font-semibold bg-transparent border-none outline-none placeholder-slate-400 text-slate-900 dark:text-white mt-0.5"
          />
        </div>
      </div>

      {/* Search Button */}
      <button 
        type="submit"
        className="px-6 py-3.5 md:py-3 rounded-xl md:rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-sm tracking-wide shadow-md shadow-blue-500/20 hover:shadow-lg flex items-center justify-center gap-2 transition-all shrink-0 hover:scale-105 active:scale-95 cursor-pointer"
      >
        <Search className="w-4.5 h-4.5" />
        Search
      </button>

    </form>
  );
};

export default SearchBar;
