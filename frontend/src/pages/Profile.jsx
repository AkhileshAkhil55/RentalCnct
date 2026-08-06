import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { User, Mail, Phone, Shield, ShieldCheck, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await updateProfile({ fullName, phone, avatar });
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to save profile changes.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left relative">
      <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full bg-cyan-500/10 blur-[100px] animate-pulse-glow -z-10"></div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Profile Card left */}
        <div className="md:col-span-4 p-6 rounded-3xl glass-panel bg-white/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/40 text-center shadow-glass space-y-4">
          <div className="relative inline-block mx-auto">
            <img 
              src={avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=user'} 
              alt="avatar" 
              className="w-24 h-24 rounded-full bg-slate-100 object-cover border-4 border-primary-500 shadow-md"
            />
            <span className="absolute bottom-1 right-1 bg-emerald-500 text-white p-1 rounded-full text-xs shadow-md" title="Verified Member">
              <CheckCircle className="w-4 h-4 fill-emerald-500 text-white" />
            </span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">{user?.fullName}</h2>
            <p className="text-xs text-slate-400 mt-0.5">@{user?.username}</p>
          </div>
          
          <div className="pt-4 border-t border-slate-100 dark:border-slate-850 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-500">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Shield className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Role: {user?.role.replace('ROLE_', '')}</span>
            </div>
          </div>
        </div>

        {/* Edit Details right */}
        <div className="md:col-span-8 p-8 rounded-3xl glass-panel bg-white/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/40 shadow-glass">
          <h2 className="text-lg font-bold mb-6">Personal Account Information</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="text-left">
                <label className="font-bold text-slate-400 uppercase tracking-wide block mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-350 bg-white dark:bg-slate-850 font-semibold"
                  />
                </div>
              </div>

              {/* Email (Readonly) */}
              <div className="text-left">
                <label className="font-bold text-slate-400 uppercase tracking-wide block mb-1">Email Address (Primary)</label>
                <div className="relative opacity-60">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-250 bg-slate-100 dark:bg-slate-800 font-semibold cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone */}
              <div className="text-left">
                <label className="font-bold text-slate-400 uppercase tracking-wide block mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-350 bg-white dark:bg-slate-850 font-semibold"
                  />
                </div>
              </div>

              {/* Avatar URL */}
              <div className="text-left">
                <label className="font-bold text-slate-400 uppercase tracking-wide block mb-1">Avatar SVG/Image URL</label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-350 bg-white dark:bg-slate-850 font-semibold"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center gap-2">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 leading-none">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Security logs and session tokens are encrypted</span>
              </div>
              <button
                type="submit"
                disabled={updating}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-xs shadow cursor-pointer disabled:opacity-50"
              >
                {updating ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
