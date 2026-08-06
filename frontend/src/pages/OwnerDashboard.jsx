import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  DollarSign, Package, Calendar, Clock, Plus, Edit3, Trash2, 
  Check, X, RefreshCw, ChevronRight, Truck, Info 
} from 'lucide-react';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('inventory');
  
  // Dashboard statistics
  const [earnings, setEarnings] = useState(0);
  const [listingsCount, setListingsCount] = useState(0);
  const [requests, setRequests] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Product Add/Edit Form states
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [targetProdId, setTargetProdId] = useState(null);
  
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [itemCondition, setItemCondition] = useState('Excellent');
  const [description, setDescription] = useState('');
  const [specsText, setSpecsText] = useState('{}'); // JSON string specs
  const [imageUrls, setImageUrls] = useState(['']); // array of URLs

  const fetchDashboardData = async () => {
    try {
      // Fetch categories
      const catRes = await api.get('/api/categories');
      setCategories(catRes.data);

      // Fetch owner's listings
      const prodRes = await api.get('/api/products/my-listings');
      setMyProducts(prodRes.data);
      setListingsCount(prodRes.data.length);

      // Fetch owner's bookings requests
      const bookRes = await api.get('/api/bookings/owner-rentals');
      setRequests(bookRes.data);

      // Calculate total earnings
      const totalEarned = bookRes.data
        .filter(b => ['ACTIVE', 'RETURNED'].includes(b.status))
        .reduce((sum, current) => sum + current.totalPrice, 0);
      setEarnings(totalEarned);

    } catch (err) {
      console.error('Failed to load owner details', err);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [user]);

  const handleOpenAddForm = () => {
    setEditMode(false);
    setTitle(''); setBrand(''); setModel(''); setCategoryId('');
    setPricePerDay(''); setSecurityDeposit(''); setPickupLocation('');
    setDeliveryAvailable(false); setItemCondition('Excellent');
    setDescription(''); setSpecsText('{\n  "Condition": "Like New",\n  "Color": "Black"\n}');
    setImageUrls(['']);
    setShowForm(true);
  };

  const handleOpenEditForm = (prod) => {
    setEditMode(true);
    setTargetProdId(prod.id);
    setTitle(prod.title);
    setBrand(prod.brand);
    setModel(prod.model);
    setCategoryId(prod.categoryId);
    setPricePerDay(prod.pricePerDay);
    setSecurityDeposit(prod.securityDeposit);
    setPickupLocation(prod.pickupLocation);
    setDeliveryAvailable(prod.deliveryAvailable);
    setItemCondition(prod.itemCondition);
    setDescription(prod.description);
    
    // Format JSON prettily
    try {
      setSpecsText(JSON.stringify(JSON.parse(prod.specifications), null, 2));
    } catch {
      setSpecsText(prod.specifications || '{}');
    }

    setImageUrls(prod.imageUrls && prod.imageUrls.length > 0 ? prod.imageUrls : ['']);
    setShowForm(true);
  };

  const handleAddImageUrlField = () => {
    setImageUrls([...imageUrls, '']);
  };

  const handleImageUrlChange = (index, value) => {
    const updated = [...imageUrls];
    updated[index] = value;
    setImageUrls(updated);
  };

  const handleRemoveImageUrlField = (index) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!categoryId) {
      showToast('Please select a product category.', 'warning');
      return;
    }

    // Filter empty image URLs
    const filteredImages = imageUrls.filter(url => url.trim() !== '');

    // Validate Specifications JSON format
    try {
      JSON.parse(specsText);
    } catch {
      showToast('Specifications must be a valid JSON key-value format.', 'error');
      return;
    }

    const payload = {
      title,
      brand,
      model,
      categoryId: parseInt(categoryId),
      pricePerDay: parseFloat(pricePerDay),
      securityDeposit: parseFloat(securityDeposit),
      pickupLocation,
      deliveryAvailable,
      itemCondition,
      description,
      specifications: specsText,
      imageUrls: filteredImages,
    };

    try {
      if (editMode) {
        await api.put(`/api/products/${targetProdId}`, payload);
        showToast('Listing updated successfully!', 'success');
      } else {
        await api.post('/api/products', payload);
        showToast('New product listed successfully!', 'success');
      }
      setShowForm(false);
      fetchDashboardData();
    } catch (err) {
      showToast('Failed to save listing.', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing permanently?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      showToast('Listing deleted successfully.', 'success');
      fetchDashboardData();
    } catch (err) {
      showToast('Failed to delete listing. It might have active bookings associated with it.', 'error');
    }
  };

  const handleUpdateBookingStatus = async (id, status) => {
    let confirmMsg = `Do you want to confirm this action?`;
    if (status === 'ACTIVE') confirmMsg = 'Confirm product handover to Renter?';
    if (status === 'RETURNED') confirmMsg = 'Confirm return and authorize security deposit refund?';
    if (status === 'CANCELLED') confirmMsg = 'Reject this reservation request?';

    if (!window.confirm(confirmMsg)) return;

    try {
      await api.put(`/api/bookings/${id}/status?status=${status}`);
      showToast(`Booking updated successfully.`, 'success');
      fetchDashboardData();
    } catch (err) {
      showToast('Failed to update booking status.', 'error');
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const activeRentals = requests.filter(r => r.status === 'ACTIVE');
  const upcomingBookings = requests.filter(r => r.status === 'CONFIRMED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      
      {/* Title */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Owner Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your listing catalog, earnings statistics, and rental handovers.</p>
        </div>
        <button
          onClick={handleOpenAddForm}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer hover:scale-[1.02]"
        >
          <Plus className="w-4.5 h-4.5" /> List New Product
        </button>
      </div>

      {/* Stats Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        {/* Earnings */}
        <div className="p-5 rounded-3xl glass-panel bg-white/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400">Total Earnings</span>
            <h3 className="text-xl font-extrabold mt-0.5">${earnings.toFixed(2)}</h3>
          </div>
        </div>

        {/* Listings count */}
        <div className="p-5 rounded-3xl glass-panel bg-white/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400">Active Listings</span>
            <h3 className="text-xl font-extrabold mt-0.5">{listingsCount} items</h3>
          </div>
        </div>

        {/* Active handovers */}
        <div className="p-5 rounded-3xl glass-panel bg-white/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400">Active Handovers</span>
            <h3 className="text-xl font-extrabold mt-0.5">{activeRentals.length} active</h3>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="p-5 rounded-3xl glass-panel bg-white/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400">Upcoming Orders</span>
            <h3 className="text-xl font-extrabold mt-0.5">{upcomingBookings.length} orders</h3>
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 gap-4 overflow-x-auto no-scrollbar">
        {[
          { id: 'inventory', label: 'My Inventory', icon: Package },
          { id: 'requests', label: 'Rental Requests', icon: Calendar },
          { id: 'analytics', label: 'Revenue Analytics', icon: DollarSign },
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

      {/* Tab Content */}
      <div className="space-y-6">
        
        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Manage Listing Catalog</h2>
            {myProducts.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-850 rounded-3xl p-6 text-slate-400">
                You haven't listed any products yet. Click "List New Product" to start earning.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myProducts.map(prod => (
                  <div key={prod.id} className="p-4 rounded-3xl border border-slate-200/50 dark:border-slate-850/40 bg-white/20 dark:bg-slate-900/10 flex gap-4 text-left relative group">
                    <img src={prod.imageUrls?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'} alt="" className="w-20 h-20 rounded-2xl object-cover bg-slate-100 shrink-0" />
                    <div className="flex flex-col justify-between flex-grow">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${prod.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/35' : 'bg-amber-50 text-amber-700'}`}>
                            {prod.status}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">#{prod.id}</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-950 dark:text-white mt-1.5 line-clamp-1">{prod.title}</h3>
                        <p className="text-xs font-extrabold text-slate-900 dark:text-slate-350 mt-1">${prod.pricePerDay}/day &bull; ${prod.securityDeposit} dep</p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2 mt-3 justify-end border-t border-slate-100 dark:border-slate-850 pt-2">
                        <button 
                          onClick={() => handleOpenEditForm(prod)}
                          className="p-1 rounded text-slate-500 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-850"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            
            {/* Handovers in progress */}
            <div className="space-y-4">
              <h2 className="text-base font-bold">Active Handovers & Returns ({activeRentals.length + upcomingBookings.length})</h2>
              {activeRentals.length === 0 && upcomingBookings.length === 0 ? (
                <p className="text-xs text-slate-400 pl-1">No active handovers or confirmed rentals today.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Confirmed rentals waiting for handover */}
                  {upcomingBookings.map(b => (
                    <div key={b.id} className="p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/20 dark:bg-slate-900/10 text-xs text-left relative flex gap-4">
                      <img src={b.firstImageUrl} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                      <div className="flex-grow space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[8px] font-extrabold uppercase">Waiting Handover</span>
                          <span className="font-mono text-[9px] text-slate-400">Order Ref: #{b.id}</span>
                        </div>
                        <h4 className="font-bold line-clamp-1">{b.productTitle}</h4>
                        <p className="text-slate-400">Renter: <span className="font-bold text-slate-600 dark:text-slate-200">{b.renterName}</span></p>
                        <p className="text-slate-400">Dates: {b.startDate} to {b.endDate}</p>
                        <button 
                          onClick={() => handleUpdateBookingStatus(b.id, 'ACTIVE')}
                          className="mt-3 px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-[10px] cursor-pointer"
                        >
                          Handover Product (Start Lease)
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Active rentals waiting for return */}
                  {activeRentals.map(b => (
                    <div key={b.id} className="p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/20 dark:bg-slate-900/10 text-xs text-left relative flex gap-4">
                      <img src={b.firstImageUrl} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                      <div className="flex-grow space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[8px] font-extrabold uppercase">Lease Active</span>
                          <span className="font-mono text-[9px] text-slate-400">Order Ref: #{b.id}</span>
                        </div>
                        <h4 className="font-bold line-clamp-1">{b.productTitle}</h4>
                        <p className="text-slate-400">Renter: <span className="font-bold text-slate-600 dark:text-slate-200">{b.renterName}</span></p>
                        <p className="text-slate-400">Return Date: {b.endDate}</p>
                        <button 
                          onClick={() => handleUpdateBookingStatus(b.id, 'RETURNED')}
                          className="mt-3 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-[10px] cursor-pointer"
                        >
                          Verify Return & Refund Deposit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* General Requests logs */}
            <div className="space-y-4 border-t border-slate-100 dark:border-slate-850 pt-6">
              <h2 className="text-base font-bold">Completed & Cancelled Requests</h2>
              <div className="max-h-60 overflow-y-auto no-scrollbar border border-slate-200/50 dark:border-slate-850/50 rounded-2xl">
                {requests.filter(r => ['RETURNED', 'CANCELLED'].includes(r.status)).length === 0 ? (
                  <p className="p-4 text-xs text-slate-500 text-center">No completed requests yet.</p>
                ) : (
                  <table className="min-w-full text-xs text-left divide-y divide-slate-100 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-900 font-bold text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Order Ref</th>
                        <th className="px-4 py-3">Renter</th>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3">Dates</th>
                        <th className="px-4 py-3">Rental Fee</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                      {requests.filter(r => ['RETURNED', 'CANCELLED'].includes(r.status)).map(b => (
                        <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10">
                          <td className="px-4 py-3 font-semibold font-mono">#{b.id}</td>
                          <td className="px-4 py-3">{b.renterName}</td>
                          <td className="px-4 py-3 font-semibold line-clamp-1 max-w-[150px]">{b.productTitle}</td>
                          <td className="px-4 py-3">{b.startDate} to {b.endDate}</td>
                          <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">${b.totalPrice}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${b.status === 'RETURNED' ? 'bg-slate-100 text-slate-600' : 'bg-rose-100 text-rose-700'}`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold">Earnings Statistics</h2>
            
            {/* Pure CSS/SVG Bar Chart mockup */}
            <div className="p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/30 text-left">
              <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wide mb-6">Monthly Revenue Share (Current Year)</h3>
              
              <div className="flex gap-4 items-end h-64 border-b border-l border-slate-200 dark:border-slate-800 pl-4 pb-2 relative">
                
                {/* Horizontal gridlines */}
                <div className="absolute left-0 right-0 top-1/4 border-t border-dashed border-slate-100 dark:border-slate-850"></div>
                <div className="absolute left-0 right-0 top-2/4 border-t border-dashed border-slate-100 dark:border-slate-850"></div>
                <div className="absolute left-0 right-0 top-3/4 border-t border-dashed border-slate-100 dark:border-slate-850"></div>

                {[
                  { month: 'Jan', val: earnings * 0.08, height: '12%' },
                  { month: 'Feb', val: earnings * 0.12, height: '22%' },
                  { month: 'Mar', val: earnings * 0.18, height: '36%' },
                  { month: 'Apr', val: earnings * 0.22, height: '48%' },
                  { month: 'May', val: earnings * 0.15, height: '30%' },
                  { month: 'Jun', val: earnings * 0.25, height: '62%' },
                  { month: 'Jul', val: earnings * 0.35, height: '85%' },
                ].map(item => (
                  <div key={item.month} className="flex-1 flex flex-col items-center group relative z-10">
                    {/* Tooltip on hover */}
                    <span className="absolute -top-10 scale-0 group-hover:scale-100 bg-slate-900 text-white dark:bg-white dark:text-slate-950 px-2 py-1 rounded-lg text-[9px] font-bold transition-all shadow-md">
                      ${item.val.toFixed(2)}
                    </span>
                    {/* Vertical Bar */}
                    <div 
                      style={{ height: item.height }}
                      className="w-8 sm:w-12 bg-gradient-to-t from-blue-600 to-cyan-500 rounded-t-xl group-hover:from-blue-700 group-hover:to-cyan-600 transition-colors shadow-sm"
                    ></div>
                    <span className="text-[10px] text-slate-400 font-bold mt-2">{item.month}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-1.5 text-[10px] text-slate-400">
                <Info className="w-3.5 h-3.5 text-blue-500" />
                <span>Escrow revenue is finalized immediately upon rental activation. Refunds due to cancellations deduct immediately.</span>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Listing Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-sm">{editMode ? 'Edit Rental Listing' : 'List a Product for Rent'}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar text-xs text-left">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <label className="font-bold text-slate-400 uppercase tracking-wide block mb-1">Product Title *</label>
                  <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sony Alpha 7 IV Mirrorless" className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850" />
                </div>
                {/* Category */}
                <div>
                  <label className="font-bold text-slate-400 uppercase tracking-wide block mb-1">Category *</label>
                  <select 
                    required 
                    value={categoryId} 
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 cursor-pointer"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Brand */}
                <div>
                  <label className="font-bold text-slate-400 uppercase tracking-wide block mb-1">Brand</label>
                  <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Sony" className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850" />
                </div>
                {/* Model */}
                <div>
                  <label className="font-bold text-slate-400 uppercase tracking-wide block mb-1">Model</label>
                  <input type="text" value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. A7 IV" className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850" />
                </div>
                {/* Condition */}
                <div>
                  <label className="font-bold text-slate-400 uppercase tracking-wide block mb-1">Condition *</label>
                  <select required value={itemCondition} onChange={(e) => setItemCondition(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 cursor-pointer">
                    <option value="Excellent">Excellent (Like New)</option>
                    <option value="Good">Good (Working fine)</option>
                    <option value="Fair">Fair (Scratch / Wear)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Price */}
                <div>
                  <label className="font-bold text-slate-400 uppercase tracking-wide block mb-1">Rental Price / Day ($) *</label>
                  <input type="number" step="0.01" required value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} placeholder="45.00" className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850" />
                </div>
                {/* Security Deposit */}
                <div>
                  <label className="font-bold text-slate-400 uppercase tracking-wide block mb-1">Security Deposit ($) *</label>
                  <input type="number" step="0.01" required value={securityDeposit} onChange={(e) => setSecurityDeposit(e.target.value)} placeholder="300.00" className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850" />
                </div>
                {/* Location */}
                <div>
                  <label className="font-bold text-slate-400 uppercase tracking-wide block mb-1">Pickup Location *</label>
                  <input type="text" required value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} placeholder="Downtown New York" className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850" />
                </div>
              </div>

              {/* Delivery Checkbox */}
              <label className="flex items-center gap-2 p-1 cursor-pointer">
                <input type="checkbox" checked={deliveryAvailable} onChange={(e) => setDeliveryAvailable(e.target.checked)} className="rounded text-primary-600 focus:ring-transparent" />
                <span className="font-bold text-slate-700 dark:text-slate-300">Delivery shipping option available for renters</span>
              </label>

              {/* Description */}
              <div>
                <label className="font-bold text-slate-400 uppercase block mb-1">Description *</label>
                <textarea required rows="3" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide details about specs, condition, and what is included in the box..." className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 outline-none" />
              </div>

              {/* Specifications JSON text */}
              <div>
                <label className="font-bold text-slate-400 uppercase block mb-1">Specifications (JSON Format) *</label>
                <textarea required rows="4" value={specsText} onChange={(e) => setSpecsText(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 font-mono outline-none" />
                <span className="text-[10px] text-slate-400">Provide key-value specifications. Example: {`{"Sensor":"Full-Frame","AF":"759-Point"}`}</span>
              </div>

              {/* Image URL Inputs */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-400 uppercase block">Product Image URLs</label>
                  <button type="button" onClick={handleAddImageUrlField} className="text-primary-600 font-bold hover:underline">Add URL Field</button>
                </div>
                {imageUrls.map((url, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      value={url} 
                      onChange={(e) => handleImageUrlChange(index, e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..." 
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850"
                    />
                    {imageUrls.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveImageUrlField(index)}
                        className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Submit */}
              <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer">
                {editMode ? 'Save Changes' : 'Publish Listing'}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OwnerDashboard;
