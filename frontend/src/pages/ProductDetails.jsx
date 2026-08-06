import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import GoogleMapMock from '../components/GoogleMapMock';
import { ProductDetailSkeleton } from '../components/LoadingSkeleton';
import { 
  Star, MapPin, Calendar, Truck, ArrowLeft, MessageSquare, Shield, CheckCircle, AlertTriangle 
} from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Gallery
  const [activeImage, setActiveImage] = useState('');

  // Date selections
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Checkout modal
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('STRIPE');
  const [processing, setProcessing] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [newBooking, setNewBooking] = useState(null);

  // Review Form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const prodRes = await api.get(`/api/products/${id}`);
        setProduct(prodRes.data);
        setActiveImage(prodRes.data.imageUrls?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800');

        const revRes = await api.get(`/api/products/${id}/reviews`);
        setReviews(revRes.data);

        // Fetch product bookings to know unavailable dates
        const bookingsRes = await api.get(`/api/bookings/product/${id}`);
        setBookedDates(bookingsRes.data);
      } catch (err) {
        console.error(err);
        showToast('Error loading listing details.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-slate-500">Listing not found.</p>
        <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl">Go Home</button>
      </div>
    );
  }

  // Calculate pricing
  let rentalDays = 0;
  let baseCost = 0;
  let totalCost = 0;
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    rentalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    baseCost = rentalDays * product.pricePerDay;
    totalCost = baseCost + product.securityDeposit;
  }

  // Specifications
  let specs = {};
  try {
    if (product.specifications) {
      specs = JSON.parse(product.specifications);
    }
  } catch (err) {
    console.error('Failed to parse specs', err);
  }

  // Date validations
  const isDateBooked = (dateStr) => {
    if (!dateStr) return false;
    const testDate = new Date(dateStr);
    for (const b of bookedDates) {
      if (b.status !== 'CANCELLED' && b.status !== 'RETURNED') {
        const start = new Date(b.startDate);
        const end = new Date(b.endDate);
        if (testDate >= start && testDate <= end) {
          return true;
        }
      }
    }
    return false;
  };

  const handleStartChange = (e) => {
    const date = e.target.value;
    if (isDateBooked(date)) {
      showToast('The selected start date conflicts with an existing booking.', 'warning');
      setStartDate('');
      return;
    }
    setStartDate(date);
  };

  const handleEndChange = (e) => {
    const date = e.target.value;
    if (isDateBooked(date)) {
      showToast('The selected end date conflicts with an existing booking.', 'warning');
      setEndDate('');
      return;
    }
    setEndDate(date);
  };

  const handleReserve = () => {
    if (!user) {
      showToast('Please log in to book items.', 'warning');
      navigate('/login', { state: { from: { pathname: `/product/${product.id}` } } });
      return;
    }

    if (!startDate || !endDate) {
      showToast('Please select rental start and end dates.', 'warning');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      showToast('End date cannot be earlier than start date.', 'warning');
      return;
    }

    // Check conflict ranges
    for (const b of bookedDates) {
      if (b.status !== 'CANCELLED' && b.status !== 'RETURNED') {
        const bStart = new Date(b.startDate);
        const bEnd = new Date(b.endDate);
        // Overlap condition
        if (!(end < bStart || start > bEnd)) {
          showToast('Selected date range overlaps with an existing booking!', 'error');
          return;
        }
      }
    }

    setShowCheckout(true);
  };

  const handleConfirmCheckout = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const payload = {
        productId: product.id,
        startDate: startDate,
        endDate: endDate,
        paymentMethod: paymentMethod,
      };

      const res = await api.post('/api/bookings', payload);
      setNewBooking(res.data);
      
      // Simulate payment delay
      setTimeout(() => {
        setProcessing(false);
        setBookingSuccess(true);
        showToast('Booking placed successfully!', 'success');
      }, 2000);

    } catch (err) {
      setProcessing(false);
      showToast(typeof err === 'string' ? err : 'Checkout failed.', 'error');
    }
  };

  const handleStartChat = async () => {
    if (!user) {
      showToast('Please log in to chat with owners.', 'warning');
      navigate('/login');
      return;
    }

    try {
      const res = await api.post(`/api/chats?productId=${product.id}`);
      navigate('/chat', { state: { activeChatId: res.data.id } });
    } catch (err) {
      showToast('Failed to open chat conversation.', 'error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Log in to leave reviews.', 'warning');
      return;
    }
    try {
      await api.post(`/api/products/${product.id}/reviews`, { rating, comment });
      showToast('Review submitted!', 'success');
      setComment('');
      
      // Reload reviews
      const revRes = await api.get(`/api/products/${product.id}/reviews`);
      setReviews(revRes.data);
      
      // Reload product rating
      const prodRes = await api.get(`/api/products/${product.id}`);
      setProduct(prodRes.data);
    } catch (err) {
      showToast('Failed to submit review.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left relative">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Gallery & Description */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Gallery Block */}
          <div className="space-y-4">
            <div className="h-[400px] w-full rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-800/40 bg-slate-100 dark:bg-slate-900 shadow-sm relative">
              <img 
                src={activeImage} 
                alt="active preview" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {product.imageUrls?.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-16 rounded-xl overflow-hidden border-2 bg-slate-100 shrink-0 ${activeImage === img ? 'border-primary-500 scale-95 shadow-md' : 'border-transparent opacity-80 hover:opacity-100'}`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details Tabs */}
          <div className="space-y-6">
            <div>
              <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                {product.categoryName}
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white mt-3">
                {product.title}
              </h1>
              <p className="text-sm text-slate-400 mt-1">Brand: <span className="font-semibold text-slate-600 dark:text-slate-200">{product.brand}</span> | Model: <span className="font-semibold text-slate-600 dark:text-slate-200">{product.model}</span></p>
            </div>

            {/* Owner Section */}
            <div className="p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-lg">
                  👤
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Product Owner</h4>
                  <p className="text-sm font-bold text-slate-950 dark:text-white mt-0.5">{product.ownerName}</p>
                </div>
              </div>
              <button 
                onClick={handleStartChat}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-cyan-500" /> Chat Owner
              </button>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-base font-bold">About this item</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Specifications */}
            {Object.keys(specs).length > 0 && (
              <div className="space-y-3">
                <h3 className="text-base font-bold">Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="p-3 rounded-xl border border-slate-200/40 dark:border-slate-800/40 bg-white/20 dark:bg-slate-900/10 flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">{key}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map Area */}
            <div className="space-y-3">
              <h3 className="text-base font-bold">Pickup Base Location</h3>
              <GoogleMapMock locationName={product.pickupLocation} price={product.pricePerDay} />
            </div>

          </div>

        </div>

        {/* Right Column: Checkout Pricing Card */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="p-6 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl bg-white/40 dark:bg-slate-900/30 shadow-glass backdrop-blur-md sticky top-24">
            
            <div className="flex justify-between items-baseline mb-6">
              <p className="text-2xl font-extrabold text-slate-950 dark:text-white">
                ${product.pricePerDay}
                <span className="text-xs font-normal text-slate-500">/day</span>
              </p>
              <div className="flex items-center gap-1 text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-slate-800 dark:text-slate-100">{product.averageRating.toFixed(1)}</span>
                <span className="text-slate-400">({reviews.length} reviews)</span>
              </div>
            </div>

            {/* Date Pickers */}
            <div className="space-y-4 border-t border-slate-100 dark:border-slate-800/40 pt-4">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex flex-col text-left">
                  <label className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={startDate}
                      onChange={handleStartChange}
                      className="w-full pl-9 pr-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col text-left">
                  <label className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 pl-1">End Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="date"
                      required
                      min={startDate || new Date().toISOString().split('T')[0]}
                      value={endDate}
                      onChange={handleEndChange}
                      className="w-full pl-9 pr-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery option */}
              <div className="flex justify-between items-center text-xs p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-850/40">
                <div className="flex items-center gap-2">
                  <Truck className="w-4.5 h-4.5 text-primary-500" />
                  <div>
                    <span className="font-bold">Delivery Available</span>
                    <p className="text-[10px] text-slate-400">{product.deliveryAvailable ? 'Home shipping available' : 'Self-pickup only'}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase ${product.deliveryAvailable ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                  {product.deliveryAvailable ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            {/* Calculations Panel */}
            {startDate && endDate && (
              <div className="mt-6 space-y-2 text-xs border-t border-slate-100 dark:border-slate-800/40 pt-4 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>${product.pricePerDay} × {rentalDays} days</span>
                  <span className="font-bold text-slate-900 dark:text-white">${baseCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Security Deposit (Refundable)</span>
                  <span className="font-bold text-slate-900 dark:text-white">${product.securityDeposit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-2 text-sm font-extrabold text-slate-900 dark:text-white mt-2">
                  <span>Total (Payable)</span>
                  <span>${totalCost.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Reserve Button */}
            <button
              onClick={handleReserve}
              className="w-full mt-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-sm tracking-wide shadow-md shadow-blue-500/15 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              Request Reservation
            </button>

            <div className="mt-4 flex items-center gap-1.5 justify-center text-[10px] text-slate-400">
              <Shield className="w-3.5 h-3.5 text-blue-500" />
              <span>Rental secure deposit refund protection active</span>
            </div>

          </div>

          {/* Product Reviews Feed */}
          <div className="p-6 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl bg-white/40 dark:bg-slate-900/30 text-left">
            <h3 className="text-base font-bold mb-4">Renter Reviews ({reviews.length})</h3>

            {/* Write Review Form */}
            {user && (
              <form onSubmit={handleReviewSubmit} className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800/40 space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-400">Leave a Review</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">Rating:</span>
                  <select 
                    value={rating} 
                    onChange={(e) => setRating(parseInt(e.target.value))}
                    className="p-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  >
                    {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} ★</option>)}
                  </select>
                </div>
                <textarea
                  required
                  rows="2"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience renting this item..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                />
                <button type="submit" className="px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[10px] font-bold">
                  Submit Review
                </button>
              </form>
            )}

            <div className="space-y-4 max-h-60 overflow-y-auto no-scrollbar pr-1">
              {reviews.length === 0 ? (
                <p className="text-xs text-slate-500">No reviews yet. Be the first to rent and write!</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <img src={rev.reviewerAvatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=user'} alt="" className="w-6 h-6 rounded-full bg-slate-100 object-cover" />
                        <span className="font-bold">{rev.reviewerName}</span>
                      </div>
                      <div className="flex gap-0.5 text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400" />)}
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 pl-8 leading-relaxed">{rev.comment}</p>
                    <span className="text-[9px] text-slate-400 block pl-8">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Checkout Simulated Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative">
            
            {/* Modal Head */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-sm">Secure Checkout Escrow</h3>
              <button 
                onClick={() => !processing && setShowCheckout(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {!bookingSuccess ? (
                <form onSubmit={handleConfirmCheckout} className="space-y-6">
                  
                  {/* Bill Summary */}
                  <div className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/10 border border-blue-100/30 text-xs space-y-2">
                    <h4 className="font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wide">Rental Summary</h4>
                    <div className="flex justify-between mt-1 text-slate-600 dark:text-slate-300">
                      <span>Item:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{product.title}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Lease Dates:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{startDate} to {endDate} ({rentalDays} days)</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-2 text-sm font-extrabold text-slate-900 dark:text-white">
                      <span>Amount Due:</span>
                      <span>${totalCost.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Payment Selectors */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase">Payment Method</label>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {['STRIPE', 'RAZORPAY', 'UPI', 'CASH'].map((method) => (
                        <label 
                          key={method}
                          className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 ${paymentMethod === method ? 'border-primary-500 bg-blue-50/20 dark:bg-blue-950/10' : 'border-slate-200 dark:border-slate-800'}`}
                        >
                          <input 
                            type="radio" 
                            name="payMethod"
                            checked={paymentMethod === method}
                            onChange={() => setPaymentMethod(method)}
                            className="text-primary-600 focus:ring-transparent"
                          />
                          <span className="font-bold">{method === 'CASH' ? 'Cash on Pickup' : method}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic inputs */}
                  {paymentMethod === 'STRIPE' && (
                    <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                      <div className="text-left text-xs space-y-2">
                        <label className="font-bold text-slate-400">Credit Card Details</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Card Number: 4111 2222 3333 4444" 
                          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" required placeholder="MM / YY" className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 text-center" />
                          <input type="password" required placeholder="CVC" className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 text-center" />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'UPI' && (
                    <div className="flex flex-col items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                      <span className="text-[10px] font-bold text-slate-400">Scan QR to pay securely</span>
                      <div className="w-32 h-32 bg-white p-2 border border-slate-200 rounded-xl flex items-center justify-center shadow">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=rentalcnct@upi%26pn=RentalCnct%26am=${totalCost}%26cu=USD`} 
                          alt="upi qr code" 
                          className="w-full h-full"
                        />
                      </div>
                      <span className="text-[9px] text-slate-400 animate-pulse">Waiting for UPI response...</span>
                    </div>
                  )}

                  {paymentMethod === 'RAZORPAY' && (
                    <div className="text-center p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs text-slate-500">
                      🔗 Razorpay redirection overlay will trigger in checkout.
                    </div>
                  )}

                  {paymentMethod === 'CASH' && (
                    <div className="text-left flex items-start gap-2 p-3 rounded-xl border border-amber-200/50 bg-amber-500/10 text-[11px] text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                      <span>Security deposit must still be verified by owner during handover. No immediate digital charges.</span>
                    </div>
                  )}

                  {/* Actions */}
                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {processing ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Processing Payment Escrow...
                      </>
                    ) : (
                      'Pay & Confirm Booking'
                    )}
                  </button>

                </form>
              ) : (
                <div className="flex flex-col items-center text-center py-6 space-y-4">
                  <CheckCircle className="w-16 h-16 text-emerald-500 animate-bounce" />
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Booking Confirmed!</h3>
                    <p className="text-xs text-slate-500 mt-1">Transaction Ref: <code className="font-mono text-primary-500">{newBooking?.id ? `RC_BK_${newBooking.id}` : 'RC_BK_SUCCESS'}</code></p>
                  </div>
                  <div className="w-full border-t border-slate-100 dark:border-slate-800 pt-4 text-xs space-y-2 text-left">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Renter Name:</span>
                      <span className="font-semibold">{user.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Daily rate:</span>
                      <span className="font-semibold">${product.pricePerDay}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Amount paid:</span>
                      <span className="font-semibold text-emerald-500">${totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setShowCheckout(false); navigate('/dashboard'); }}
                    className="w-full mt-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-xs rounded-xl shadow cursor-pointer"
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetails;
