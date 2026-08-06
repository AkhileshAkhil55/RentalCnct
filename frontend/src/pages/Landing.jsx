import React, { useEffect, useState } from 'react';
import api from '../services/api';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/LoadingSkeleton';
import { useNotifications } from '../context/NotificationContext';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';

const CategoryIcon = ({ name, className }) => {
  const IconComponent = Icons[name] || Icons.HelpCircle;
  return <IconComponent className={className} />;
};

const Landing = () => {
  const { showToast } = useNotifications();
  
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState(null);

  // FAQ states
  const [faqOpen, setFaqOpen] = useState(null);

  const fetchProducts = async (filters = {}) => {
    setLoading(true);
    try {
      let url = '/api/products';
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.location) params.append('location', filters.location);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const res = await api.get(url);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch product listings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    // Only fetch if token is available
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await api.get('/api/wishlist');
      setWishlistIds(res.data.map(p => p.id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const catRes = await api.get('/api/categories');
        setCategories(catRes.data);
      } catch (err) {
        console.error(err);
      }
      await fetchProducts();
      await fetchWishlist();
    };
    init();
  }, []);

  const handleCategorySelect = (catId) => {
    const newCat = selectedCat === catId ? null : catId;
    setSelectedCat(newCat);
    fetchProducts({ categoryId: newCat });
  };

  const handleSearch = (filters) => {
    setSelectedCat(filters.categoryId);
    fetchProducts(filters);
  };

  const handleWishlistToggle = (productId, isWish) => {
    setWishlistIds(prev => 
      isWish ? [...prev, productId] : prev.filter(id => id !== productId)
    );
  };

  const faqData = [
    {
      q: "How does the security deposit work?",
      a: "The owner lists a security deposit fee for each product. When you make a booking, the security deposit is paid upfront. Upon return of the product in its original condition, the owner verifies the return, and the security deposit is fully refunded immediately."
    },
    {
      q: "Can I cancel my rental booking?",
      a: "Yes! You can cancel any booking before the start date directly from your Renter Dashboard. A full refund of the rental fees and security deposit will be processed immediately."
    },
    {
      q: "What happens if I return the item late?",
      a: "Late returns impact other renters. You should coordinate with the product owner in advance or request a rental extension from your dashboard. Overdue returns are charged at double the daily rate."
    },
    {
      q: "Is there delivery available?",
      a: "Owners can choose to enable delivery or state that it is pickup-only. This is marked on each product listing. Shipping or delivery fees (if any) can be settled directly in cash or as agreed during pickup."
    }
  ];

  return (
    <div className="space-y-16 pb-20 relative overflow-hidden">
      
      {/* Decorative Blur Spheres */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/10 rounded-full blur-[120px] -z-10 animate-pulse-glow"></div>
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <span className="px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider border border-blue-100 dark:border-blue-800">
            🔄 Peer-to-Peer Rental Marketplace
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto">
            Rent <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-amber-500 bg-clip-text text-transparent">Anything</span>, Anywhere.
          </h1>
          <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Airbnb for gear. Access high-quality DSLR cameras, gaming consoles, bikes, power tools, and musical instruments near you.
          </p>
        </motion.div>

        {/* Floating Search Bar */}
        <div className="mt-10">
          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      {/* Categories Slider/Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Featured Categories</h2>
          <span className="text-xs text-slate-400">Swipe to view</span>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`flex flex-col items-center justify-center p-5 rounded-3xl min-w-[120px] h-[120px] transition-all cursor-pointer ${
                selectedCat === cat.id
                  ? 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20 scale-105 border-transparent'
                  : 'glass-card bg-white/40 dark:bg-slate-900/20 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/50 dark:border-slate-800/40'
              }`}
            >
              <CategoryIcon 
                name={cat.icon} 
                className={`w-6 h-6 ${selectedCat === cat.id ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} 
              />
              <span className="text-xs font-bold mt-3 text-center">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Main Listings Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left" id="browse">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Trending Rentals</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Top rated gear listed by verified owners near you.
            </p>
          </div>
          {selectedCat && (
            <button 
              onClick={() => { setSelectedCat(null); fetchProducts(); }}
              className="text-xs text-primary-600 font-bold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : products.length === 0 ? (
          <div className="text-center py-20 p-8 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl">
            <p className="text-base text-slate-500 dark:text-slate-400 font-medium">No items found matching your filters.</p>
            <button 
              onClick={() => { setSelectedCat(null); fetchProducts(); }}
              className="mt-4 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-xl text-xs font-bold"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                wishlisted={wishlistIds.includes(product.id)}
                onWishlistToggle={handleWishlistToggle}
              />
            ))}
          </div>
        )}
      </section>

      {/* How it Works Section */}
      <section className="bg-slate-100 dark:bg-slate-900/50 py-16 transition-colors duration-300" id="how">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">How RentalCnct Works</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
            Book equipment in three easy steps, backed by security deposit protection.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            
            {/* Step 1 */}
            <div className="glass-card bg-white/50 dark:bg-slate-900/30 p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-xl font-extrabold">1</div>
              <h3 className="text-lg font-bold mt-6">Browse & Date Selection</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Search gear and pick your lease dates. Check active availability calendars and confirm pricing.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-card bg-white/50 dark:bg-slate-900/30 p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center text-xl font-extrabold">2</div>
              <h3 className="text-lg font-bold mt-6">Secure Escrow & Pickup</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Pay deposit securely. Meet the owner at their designated location, inspect the item, and unlock the lease.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-card bg-white/50 dark:bg-slate-900/30 p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-xl font-extrabold">3</div>
              <h3 className="text-lg font-bold mt-6">Return & Refund</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Bring the item back on the final date. The owner verifies return checklist, and your security deposit is fully refunded.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight">Loved by Renter Communities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          
          <div className="p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/30 dark:bg-slate-900/20 text-left space-y-4">
            <div className="flex items-center gap-1.5 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => <Icons.Star key={i} className="w-4 h-4 fill-amber-400" />)}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
              "Renting the Sony camera for my wedding shoot was painless. Alex was fantastic and showed me how autofocus worked. Save me $2,000 on camera body buying!"
            </p>
            <div className="flex items-center gap-3">
              <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=emma" alt="" className="w-10 h-10 rounded-full bg-slate-200" />
              <div>
                <h4 className="text-sm font-bold">Emma Watson</h4>
                <span className="text-[10px] text-slate-400">Renter since 2024</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/30 dark:bg-slate-900/20 text-left space-y-4">
            <div className="flex items-center gap-1.5 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => <Icons.Star key={i} className="w-4 h-4 fill-amber-400" />)}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
              "I list my camping tents and cycles on RentalCnct. Sarah's items are always in high demand. Generating about $400/month extra on unused gear."
            </p>
            <div className="flex items-center gap-3">
              <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=robert" alt="" className="w-10 h-10 rounded-full bg-slate-200" />
              <div>
                <h4 className="text-sm font-bold">Robert Chen</h4>
                <span className="text-[10px] text-slate-400">Owner since 2025</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/30 dark:bg-slate-900/20 text-left space-y-4">
            <div className="flex items-center gap-1.5 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => <Icons.Star key={i} className="w-4 h-4 fill-amber-400" />)}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
              "Super secure checkout. The UPI payment interface was extremely slick, and the security deposit refund hit my bank within 5 minutes of verification."
            </p>
            <div className="flex items-center gap-3">
              <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=mary" alt="" className="w-10 h-10 rounded-full bg-slate-200" />
              <div>
                <h4 className="text-sm font-bold">Maria Lopez</h4>
                <span className="text-[10px] text-slate-400">Renter since 2023</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FAQ Center */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left" id="faq">
        <h2 className="text-3xl font-extrabold tracking-tight text-center mb-8">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div 
              key={index}
              className="border border-slate-200/50 dark:border-slate-800/40 rounded-2xl overflow-hidden bg-white/30 dark:bg-slate-900/20"
            >
              <button
                onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                className="w-full px-5 py-4 text-left font-bold text-sm text-slate-900 dark:text-white flex justify-between items-center hover:bg-slate-100/40 dark:hover:bg-slate-850/40 transition-colors"
              >
                <span>{faq.q}</span>
                <span>{faqOpen === index ? '−' : '+'}</span>
              </button>
              {faqOpen === index && (
                <div className="px-5 pb-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/30 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Landing;
