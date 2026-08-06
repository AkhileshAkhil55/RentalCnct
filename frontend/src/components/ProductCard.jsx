import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';

const ProductCard = ({ product, wishlisted = false, onWishlistToggle }) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [isWish, setIsWish] = useState(wishlisted);

  useEffect(() => {
    setIsWish(wishlisted);
  }, [wishlisted]);

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleWishToggle = async (e) => {
    e.stopPropagation(); // prevent card detail click navigation
    if (!user) {
      showToast('Please sign in to add items to your wishlist.', 'warning');
      navigate('/login');
      return;
    }

    try {
      if (isWish) {
        await api.delete(`/api/wishlist/${product.id}`);
        setIsWish(false);
        showToast('Removed from wishlist.', 'success');
      } else {
        await api.post(`/api/wishlist/${product.id}`);
        setIsWish(true);
        showToast('Added to wishlist!', 'success');
      }
      if (onWishlistToggle) {
        onWishlistToggle(product.id, !isWish);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update wishlist.', 'error');
    }
  };

  const firstImage = product.imageUrls && product.imageUrls.length > 0 
    ? product.imageUrls[0] 
    : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800';

  return (
    <motion.div 
      whileHover={{ y: -6 }}
      onClick={handleCardClick}
      className="glass-card flex flex-col h-[350px] w-full rounded-3xl overflow-hidden shadow-glass hover:shadow-lg border border-slate-200/50 dark:border-slate-800/40 cursor-pointer relative bg-white/40 dark:bg-slate-900/30 group"
    >
      {/* Product Image */}
      <div className="h-44 w-full overflow-hidden relative bg-slate-100 dark:bg-slate-800">
        <img 
          src={firstImage} 
          alt={product.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        
        {/* Wishlist Icon */}
        <button 
          onClick={handleWishToggle}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow hover:scale-110 active:scale-95 transition-all text-slate-700 dark:text-slate-200"
        >
          <Heart 
            className={`w-4.5 h-4.5 transition-colors ${
              isWish ? 'fill-rose-500 text-rose-500' : 'text-slate-400 dark:text-slate-300'
            }`} 
          />
        </button>

        {/* Condition Tag */}
        <span className="absolute bottom-3 left-3 px-2 py-0.5 text-[10px] font-bold tracking-wide rounded-md bg-slate-900/80 dark:bg-slate-950/80 text-white backdrop-blur-sm uppercase">
          {product.itemCondition}
        </span>
      </div>

      {/* Info Content */}
      <div className="p-4 flex flex-col justify-between flex-grow text-left">
        <div>
          {/* Category & Rating */}
          <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500 font-medium">
            <span className="text-primary-600 dark:text-primary-400 font-semibold uppercase tracking-wider text-[10px]">
              {product.categoryName}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {product.averageRating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="mt-2 text-sm font-bold text-slate-950 dark:text-white line-clamp-2 leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {product.title}
          </h3>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">
            📍 {product.pickupLocation}
          </p>
        </div>

        {/* Price Tag */}
        <div className="flex items-baseline justify-between border-t border-slate-100 dark:border-slate-800/40 pt-3 mt-3">
          <span className="text-xs text-slate-400 dark:text-slate-500">Daily rate</span>
          <p className="text-base font-extrabold text-slate-950 dark:text-white">
            ${product.pricePerDay}
            <span className="text-xs font-normal text-slate-500">/day</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
