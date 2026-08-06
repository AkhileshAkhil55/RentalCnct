import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import ProductCard from '../components/ProductCard';
import { 
  History, Calendar, Heart, MapPin, Settings, User as UserIcon, 
  Trash2, Plus, Receipt, XCircle, ArrowUpRight, HelpCircle 
} from 'lucide-react';

const UserDashboard = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('rentals');
  
  // States
  const [rentals, setRentals] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addresses, setAddresses] = useState([]);
  
  // Address form
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('USA');
  const [isDefault, setIsDefault] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Profile Form
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Extension Modal
  const [selectedRental, setSelectedRental] = useState(null);
  const [newEndDate, setNewEndDate] = useState('');
  const [extending, setExtending] = useState(false);

  const fetchRentals = async () => {
    try {
      const res = await api.get('/api/bookings/my-rentals');
      setRentals(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/api/wishlist');
      setWishlist(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/api/users/addresses');
      setAddresses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchRentals();
    fetchWishlist();
    fetchAddresses();
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ fullName, phone, avatar });
      showToast('Profile settings updated!', 'success');
    } catch (err) {
      showToast('Failed to update profile settings.', 'error');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/users/addresses', { street, city, state, zipCode, country, isDefault });
      showToast('New address saved!', 'success');
      
      // Clear inputs
      setStreet(''); setCity(''); setState(''); setZipCode(''); setIsDefault(false);
      setShowAddressForm(false);
      fetchAddresses();
    } catch (err) {
      showToast('Failed to save address.', 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.delete(`/api/users/addresses/${id}`);
      showToast('Address deleted.', 'success');
      fetchAddresses();
    } catch (err) {
      showToast('Failed to delete address.', 'error');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.put(`/api/bookings/${bookingId}/status?status=CANCELLED`);
      showToast('Booking cancelled successfully. Deposit refunded.', 'success');
      fetchRentals();
    } catch (err) {
      showToast('Failed to cancel booking.', 'error');
    }
  };

  const handleExtendRental = async (e) => {
    e.preventDefault();
    if (!newEndDate) return;
    setExtending(true);
    try {
      await api.put(`/api/bookings/${selectedRental.id}/extend?newEndDate=${newEndDate}`);
      showToast('Rental extended successfully!', 'success');
      setSelectedRental(null);
      setNewEndDate('');
      fetchRentals();
    } catch (err) {
      showToast(err || 'Failed to extend rental. Overlaps with another booking.', 'error');
    } finally {
      setExtending(false);
    }
  };

  const handlePrintInvoice = (booking) => {
    const invoiceWindow = window.open('', '_blank');
    const grandTotal = booking.totalPrice + booking.securityDeposit;
    invoiceWindow.document.write(`
      <html>
        <head>
          <title>Invoice RC-${booking.id}</title>
          <style>
            body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: 800; color: #2563eb; }
            .title { font-size: 28px; font-weight: 700; margin: 30px 0; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; font-size: 14px; }
            th { background: #f8fafc; font-weight: 600; }
            .total-box { margin-top: 30px; text-align: right; font-size: 18px; font-weight: 800; border-top: 2px solid #e2e8f0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🔄 RentalCnct</div>
            <div>Invoice Date: ${new Date().toLocaleDateString()}</div>
          </div>
          <div class="title">INVOICE</div>
          <div class="grid">
            <div>
              <strong>Billed To:</strong><br>
              ${user.fullName}<br>
              Email: ${user.email}<br>
              Phone: ${user.phone || 'N/A'}
            </div>
            <div>
              <strong>Rental Details:</strong><br>
              Booking Reference: RC-BK-${booking.id}<br>
              Lease Duration: ${booking.startDate} to ${booking.endDate}<br>
              Payment Method: ${booking.paymentMethod}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Rate / Day</th>
                <th>Security Deposit</th>
                <th>Total Rental Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${booking.productTitle} (${booking.productBrand} ${booking.productModel})</td>
                <td>$${booking.productPrice}/day</td>
                <td>$${booking.securityDeposit} (Refunded on Return)</td>
                <td>$${booking.totalPrice}</td>
              </tr>
            </tbody>
          </table>
          <div class="total-box">
            Total Billed (Escrow): $${grandTotal.toFixed(2)}
          </div>
        </body>
      </html>
    `);
    invoiceWindow.document.close();
    invoiceWindow.print();
  };

  const currentRentalsList = rentals.filter(r => ['PENDING', 'CONFIRMED', 'ACTIVE'].includes(r.status));
  const rentalHistoryList = rentals.filter(r => ['RETURNED', 'CANCELLED'].includes(r.status));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between p-6 rounded-3xl glass-panel bg-white/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/40 mb-10 shadow-glass">
        <div className="flex items-center gap-4 text-left w-full">
          <img src={user?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=user'} alt="" className="w-16 h-16 rounded-full bg-slate-100 object-cover border-2 border-primary-500" />
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-950 dark:text-white">Hello, {user?.fullName}!</h1>
            <p className="text-xs text-slate-500 mt-1">Renter Dashboard &bull; Manage your active bookings, items checklist, and saved addresses.</p>
          </div>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 gap-4 overflow-x-auto no-scrollbar">
        {[
          { id: 'rentals', label: 'Current Rentals', icon: Calendar },
          { id: 'history', label: 'Rental History', icon: History },
          { id: 'wishlist', label: 'My Wishlist', icon: Heart },
          { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
          { id: 'profile', label: 'Profile Settings', icon: Settings },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 pb-4 text-sm font-semibold border-b-2 px-1 transition-all shrink-0 cursor-pointer ${activeTab === tab.id ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-bold' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        
        {/* Current Rentals */}
        {activeTab === 'rentals' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Active Bookings</h2>
            
            {currentRentalsList.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                <p className="text-sm text-slate-400">You don't have any active rentals right now.</p>
                <Link to="/" className="mt-4 inline-block px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow transition-all">
                  Browse Marketplace
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentRentalsList.map(booking => (
                  <div key={booking.id} className="p-5 rounded-3xl glass-panel bg-white/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex gap-4 text-left relative group">
                    <img src={booking.firstImageUrl} alt="" className="w-24 h-24 rounded-2xl object-cover bg-slate-100 shrink-0" />
                    <div className="flex flex-col justify-between flex-grow">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${booking.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                            {booking.status === 'ACTIVE' ? 'Active Handover' : 'Confirmed'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">ID: #{booking.id}</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-950 dark:text-white mt-1.5 line-clamp-1">{booking.productTitle}</h3>
                        <p className="text-[10px] text-slate-500 mt-1">📅 {booking.startDate} to {booking.endDate}</p>
                        <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-1">Paid: ${booking.totalPrice} + ${booking.securityDeposit} deposit</p>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-850">
                        {booking.status === 'CONFIRMED' && (
                          <button 
                            onClick={() => handleCancelBooking(booking.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        <button 
                          onClick={() => { setSelectedRental(booking); setNewEndDate(booking.endDate); }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-bold transition-colors cursor-pointer text-slate-700 dark:text-slate-200"
                        >
                          Extend
                        </button>
                        <button 
                          onClick={() => handlePrintInvoice(booking)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 text-[10px] font-bold transition-colors cursor-pointer ml-auto"
                        >
                          <Receipt className="w-3.5 h-3.5" /> Invoice
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rental History */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Past Bookings</h2>
            
            {rentalHistoryList.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-slate-400 text-sm">
                No booking history.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rentalHistoryList.map(booking => (
                  <div key={booking.id} className="p-4 rounded-3xl border border-slate-200/40 dark:border-slate-850/40 bg-white/20 dark:bg-slate-900/10 flex gap-4 text-left relative">
                    <img src={booking.firstImageUrl} alt="" className="w-20 h-20 rounded-xl object-cover bg-slate-100 shrink-0" />
                    <div className="flex flex-col justify-between flex-grow">
                      <div>
                        <div className="flex justify-between items-center">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${booking.status === 'RETURNED' ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-650'}`}>
                            {booking.status === 'RETURNED' ? 'Returned' : 'Cancelled'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">#{booking.id}</span>
                        </div>
                        <h3 className="text-xs font-bold mt-2 line-clamp-1">{booking.productTitle}</h3>
                        <p className="text-[10px] text-slate-400 mt-1">{booking.startDate} to {booking.endDate}</p>
                        <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mt-1">Paid: ${booking.totalPrice} {booking.status === 'RETURNED' && ' (Deposit refunded)'}</p>
                      </div>
                      
                      <button 
                        onClick={() => handlePrintInvoice(booking)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-[9px] font-bold transition-colors cursor-pointer w-fit mt-3"
                      >
                        <Receipt className="w-3 h-3 text-slate-400" /> Invoice PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Wishlist */}
        {activeTab === 'wishlist' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Saved Wishlist</h2>
            
            {wishlist.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-slate-400 text-sm">
                Your wishlist is empty. Save products to track them here!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {wishlist.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    wishlisted={true}
                    onWishlistToggle={fetchWishlist}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Addresses */}
        {activeTab === 'addresses' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Saved Addresses</h2>
                {!showAddressForm && (
                  <button 
                    onClick={() => setShowAddressForm(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New
                  </button>
                )}
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-slate-400 text-sm">
                  No saved addresses found.
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map(addr => (
                    <div key={addr.id} className="p-4 rounded-2xl border border-slate-200/50 dark:border-slate-850/50 bg-white/20 dark:bg-slate-900/10 flex justify-between items-center text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 dark:text-slate-100">{addr.street}</span>
                          {addr.default && (
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 mt-1">{addr.city}, {addr.state} {addr.zipCode}, {addr.country}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Address Form */}
            {showAddressForm && (
              <div className="lg:col-span-5 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/30 dark:bg-slate-900/20">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold uppercase text-slate-400">Add Address</h3>
                  <button onClick={() => setShowAddressForm(false)} className="text-xs text-slate-400 hover:text-slate-900 dark:hover:text-white">Cancel</button>
                </div>
                <form onSubmit={handleAddAddress} className="space-y-4 text-xs">
                  <div className="text-left">
                    <label className="font-bold text-slate-400 uppercase tracking-wide block mb-1">Street Address</label>
                    <input type="text" required value={street} onChange={(e) => setStreet(e.target.value)} placeholder="123 Main St" className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div>
                      <label className="font-bold text-slate-400 uppercase tracking-wide block mb-1">City</label>
                      <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} placeholder="New York" className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-400 uppercase tracking-wide block mb-1">State / Prov</label>
                      <input type="text" required value={state} onChange={(e) => setState(e.target.value)} placeholder="NY" className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div>
                      <label className="font-bold text-slate-400 uppercase tracking-wide block mb-1">Zip Code</label>
                      <input type="text" required value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="10001" className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-400 uppercase tracking-wide block mb-1">Country</label>
                      <input type="text" required value={country} onChange={(e) => setCountry(e.target.value)} placeholder="USA" className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850" />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 p-1 cursor-pointer">
                    <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="rounded text-primary-600 focus:ring-transparent" />
                    <span className="font-bold text-slate-600 dark:text-slate-400">Set as default address</span>
                  </label>
                  <button type="submit" className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold tracking-wide">
                    Save Address
                  </button>
                </form>
              </div>
            )}

          </div>
        )}

        {/* Profile Settings */}
        {activeTab === 'profile' && (
          <div className="max-w-xl p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/30 text-left">
            <h2 className="text-lg font-bold mb-4">Edit Profile</h2>
            <form onSubmit={handleProfileUpdate} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-400 uppercase tracking-wide block mb-1">Full Name</label>
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 text-sm font-semibold" />
              </div>
              <div>
                <label className="font-bold text-slate-400 uppercase tracking-wide block mb-1">Phone Number</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 text-sm font-semibold" />
              </div>
              <div>
                <label className="font-bold text-slate-400 uppercase tracking-wide block mb-1">Avatar Image URL</label>
                <input type="text" value={avatar} onChange={(e) => setAvatar(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 text-sm font-semibold" />
              </div>
              <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer">
                Save Profile settings
              </button>
            </form>
          </div>
        )}

      </div>

      {/* Extension Dialog modal */}
      {selectedRental && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-sm">Request Rental Extension</h3>
              <button onClick={() => setSelectedRental(null)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
            </div>
            <form onSubmit={handleExtendRental} className="p-6 space-y-4 text-xs text-left">
              <p className="text-slate-500">Extend your lease period for <strong>{selectedRental.productTitle}</strong>. Extra days will automatically bill at the daily rate of <strong>${selectedRental.productPrice}/day</strong>.</p>
              
              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase block">Current End Date</label>
                <input type="text" disabled value={selectedRental.endDate} className="w-full p-2.5 rounded-xl border border-slate-250 bg-slate-50 dark:bg-slate-800 opacity-60 font-semibold" />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase block">New End Date</label>
                <input 
                  type="date"
                  required
                  min={selectedRental.endDate}
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 font-semibold focus:outline-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={extending}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {extending ? 'Updating Escrow...' : 'Extend Lease & Pay'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserDashboard;
