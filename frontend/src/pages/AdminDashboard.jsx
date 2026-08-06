import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  ShieldAlert, Users, Package, ClipboardList, DollarSign, 
  Check, X, Trash2, ChartBar, Activity, ShieldCheck 
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.get('/api/admin/stats');
      setStats(statsRes.data);

      const usersRes = await api.get('/api/admin/users');
      setUsersList(usersRes.data);

      const prodRes = await api.get('/api/admin/products');
      setProductsList(prodRes.data);
    } catch (err) {
      console.error('Failed to load admin stats', err);
      showToast('You are not authorized to view this page.', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'ROLE_ADMIN') {
      showToast('Admin privilege required.', 'error');
      navigate('/');
      return;
    }
    fetchAdminData();
  }, [user]);

  const handleToggleUserRole = async (targetId, currentRole) => {
    const newRole = currentRole === 'ROLE_ADMIN' ? 'USER' : 'ADMIN';
    if (!window.confirm(`Update user role to ${newRole}?`)) return;
    try {
      await api.put(`/api/admin/users/${targetId}/role?role=${newRole}`);
      showToast('User privileges updated!', 'success');
      fetchAdminData();
    } catch (err) {
      showToast('Failed to toggle privileges.', 'error');
    }
  };

  const handleListingStatusUpdate = async (productId, status) => {
    if (!window.confirm(`Confirm listing update to ${status}?`)) return;
    try {
      await api.put(`/api/admin/products/${productId}/status?status=${status}`);
      showToast(`Listing status updated to ${status}.`, 'success');
      fetchAdminData();
    } catch (err) {
      showToast('Failed to update listing status.', 'error');
    }
  };

  if (loading || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-slate-500">Loading System Governance Panel...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      
      {/* Title */}
      <div className="flex gap-3 items-center mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">System Governance</h1>
          <p className="text-xs text-slate-500 mt-1">Platform management, listings curation, transaction overview, and user access levels.</p>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        {/* Users */}
        <div className="p-5 rounded-3xl glass-panel bg-white/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400">Total Users</span>
            <h3 className="text-xl font-extrabold mt-0.5">{stats.totalUsers} registered</h3>
          </div>
        </div>

        {/* Listings */}
        <div className="p-5 rounded-3xl glass-panel bg-white/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-500">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400">Total Listings</span>
            <h3 className="text-xl font-extrabold mt-0.5">{stats.totalProducts} items</h3>
          </div>
        </div>

        {/* Bookings */}
        <div className="p-5 rounded-3xl glass-panel bg-white/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400">Escrow Orders</span>
            <h3 className="text-xl font-extrabold mt-0.5">{stats.totalBookings} orders</h3>
          </div>
        </div>

        {/* Revenue */}
        <div className="p-5 rounded-3xl glass-panel bg-white/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400">Escrow Volume</span>
            <h3 className="text-xl font-extrabold mt-0.5">${stats.totalRevenue.toFixed(2)}</h3>
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 gap-4 overflow-x-auto no-scrollbar">
        {[
          { id: 'users', label: 'Manage Users', icon: Users },
          { id: 'approvals', label: 'Listing Approvals', icon: ClipboardList },
          { id: 'analytics', label: 'Platform Analytics', icon: ChartBar },
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
        
        {/* Manage Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">User Registrations</h2>
            <div className="border border-slate-200/50 dark:border-slate-850/50 rounded-2xl overflow-hidden bg-white/20 dark:bg-slate-900/10">
              <table className="min-w-full text-xs text-left divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold">
                  <tr>
                    <th className="px-4 py-3">User ID</th>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3">Full Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {usersList.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10">
                      <td className="px-4 py-3 font-semibold">#{u.id}</td>
                      <td className="px-4 py-3">{u.username}</td>
                      <td className="px-4 py-3 font-semibold">{u.fullName}</td>
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3">{u.phone || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${u.role === 'ROLE_ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                          {u.role.replace('ROLE_', '')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {u.username !== 'admin' && (
                          <button 
                            onClick={() => handleToggleUserRole(u.id, u.role)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-[10px] font-bold cursor-pointer ml-auto"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                            {u.role === 'ROLE_ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Listings Queue</h2>
            
            {productsList.length === 0 ? (
              <p className="text-xs text-slate-500">No active products listed on the platform.</p>
            ) : (
              <div className="border border-slate-200/50 dark:border-slate-850/50 rounded-2xl overflow-hidden bg-white/20 dark:bg-slate-900/10">
                <table className="min-w-full text-xs text-left divide-y divide-slate-200 dark:divide-slate-800">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Product Name</th>
                      <th className="px-4 py-3">Owner</th>
                      <th className="px-4 py-3">Daily Price</th>
                      <th className="px-4 py-3">Deposit</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Approve / Ban Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {productsList.map(prod => (
                      <tr key={prod.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10">
                        <td className="px-4 py-3 font-semibold">#{prod.id}</td>
                        <td className="px-4 py-3 font-bold line-clamp-1 max-w-[200px]">{prod.title}</td>
                        <td className="px-4 py-3">{prod.ownerName}</td>
                        <td className="px-4 py-3">${prod.pricePerDay}</td>
                        <td className="px-4 py-3">${prod.securityDeposit}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${prod.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : prod.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                            {prod.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-1">
                          {prod.status !== 'APPROVED' && (
                            <button 
                              onClick={() => handleListingStatusUpdate(prod.id, 'APPROVED')}
                              className="p-1 px-2.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold cursor-pointer inline-flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                          )}
                          {prod.status !== 'SUSPENDED' && (
                            <button 
                              onClick={() => handleListingStatusUpdate(prod.id, 'SUSPENDED')}
                              className="p-1 px-2.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold cursor-pointer inline-flex items-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" /> Suspend
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* Category breakdown */}
            <div className="p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/30">
              <h3 className="text-sm font-bold uppercase text-slate-400 mb-6">Listing Share by Category</h3>
              <div className="space-y-4">
                {Object.entries(stats.categoryDistribution || {}).map(([catName, count]) => {
                  const percentage = (count / stats.totalProducts) * 100;
                  return (
                    <div key={catName} className="space-y-1.5 text-xs text-left">
                      <div className="flex justify-between font-bold">
                        <span>{catName}</span>
                        <span>{count} items ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div 
                          style={{ width: `${percentage}%` }}
                          className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"
                        ></div>
                      </div>
                    </div>
                  );
                })}
                {Object.keys(stats.categoryDistribution || {}).length === 0 && (
                  <p className="text-xs text-slate-500">No categorizations loaded.</p>
                )}
              </div>
            </div>

            {/* Earnings Shares */}
            <div className="p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/30 text-left">
              <h3 className="text-sm font-bold uppercase text-slate-400 mb-6">Monthly Volume Share</h3>
              
              <div className="flex gap-4 items-end h-48 border-b border-l border-slate-200 dark:border-slate-800 pl-4 pb-2 relative">
                {Object.entries(stats.monthlyEarnings || {}).map(([month, val]) => {
                  const maxVal = Math.max(...Object.values(stats.monthlyEarnings));
                  const percentage = maxVal > 0 ? (val / maxVal) * 100 : 0;
                  return (
                    <div key={month} className="flex-1 flex flex-col items-center group relative z-10">
                      <span className="absolute -top-10 scale-0 group-hover:scale-100 bg-slate-900 text-white px-2 py-1 rounded-lg text-[9px] font-bold transition-all shadow">
                        ${val.toFixed(2)}
                      </span>
                      <div 
                        style={{ height: `${percentage}%` }}
                        className="w-full bg-gradient-to-t from-purple-600 to-indigo-500 rounded-t-lg group-hover:from-purple-700 transition-colors"
                      ></div>
                      <span className="text-[9px] text-slate-400 font-bold mt-2">{month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default AdminDashboard;
