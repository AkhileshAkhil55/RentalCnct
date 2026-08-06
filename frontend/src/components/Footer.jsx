import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';

const Footer = () => {
  const { showToast } = useNotifications();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    showToast('Subscribed successfully! Thank you for joining our newsletter.', 'success');
    setEmail('');
  };

  return (
    <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200/50 dark:border-slate-800/50 transition-colors duration-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-1 text-left">
            <span className="flex items-center gap-2 text-xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              <img src="/logo.png" alt="logo" className="w-6 h-6 rounded-md object-cover shadow-sm" />
              RentalCnct
            </span>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              The premium peer-to-peer rental marketplace. Share your high-quality gear, support the circular economy, and earn rewards locally.
            </p>
          </div>

          {/* Links 1 */}
          <div className="text-left md:pl-8">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Explore</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a href="#browse" className="text-sm text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Product Listings
                </a>
              </li>
              <li>
                <a href="#how" className="text-sm text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  How it Works
                </a>
              </li>
              <li>
                <a href="#categories" className="text-sm text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Popular Categories
                </a>
              </li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="text-left">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Support</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a href="#faq" className="text-sm text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  FAQ Center
                </a>
              </li>
              <li>
                <a href="#trust" className="text-sm text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Trust & Safety
                </a>
              </li>
              <li>
                <a href="#terms" className="text-sm text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Rental Policies
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="text-left">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stay Connected</h3>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Subscribe to get updates on featured listings, discounts, and tips.
            </p>
            <form onSubmit={handleSubscribe} className="mt-4 flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow hover:shadow-lg transition-all"
              >
                Join
              </button>
            </form>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-slate-200/40 dark:border-slate-800/40 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} RentalCnct Inc. All rights reserved. Peer-to-peer rental marketplace mockup.
          </p>
          <div className="flex space-x-4">
            <span className="text-xs text-slate-400 hover:text-primary-500 cursor-pointer">Twitter</span>
            <span className="text-xs text-slate-400 hover:text-primary-500 cursor-pointer">Instagram</span>
            <span className="text-xs text-slate-400 hover:text-primary-500 cursor-pointer">LinkedIn</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
