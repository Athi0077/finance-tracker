import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { formatDate } from '../lib/utils';
import { User, Mail, Calendar, Shield, Loader2, Award, Flame, Footprints, Palette, CalendarHeart, PiggyBank } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { accentColor, setAccentColor } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [currency, setCurrency] = useState(user?.currency || localStorage.getItem('currency') || '₹');
  const [loading, setLoading] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({ name, email, avatar, currency });
      localStorage.setItem('currency', currency);
      window.dispatchEvent(new Event('storage')); // Trigger re-render if needed
      toast.success('Profile updated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Current password is required');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setPasswordLoading(true);
    try {
      await updateProfile({ currentPassword, password: newPassword });
      toast.success('Password changed!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-10">
      
      {/* Profile Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
          <p className="text-sm font-medium mt-1" style={{ color: 'var(--color-text-secondary)' }}>Manage your personal information and preferences</p>
        </div>
      </div>

      {/* Profile card */}
      <div className="rounded-3xl p-6 lg:p-8 relative overflow-hidden shadow-[var(--shadow-lg)]" style={{ background: 'var(--color-card-gradient)', border: '1px solid var(--color-border)' }}>
        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-transparent to-[var(--color-surface)] pointer-events-none"></div>
        
        {/* User info header */}
        <div className="flex items-center gap-5 mb-8 pb-8 relative z-10" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] border border-orange-500/30"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
            <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Calendar className="w-4 h-4 text-[var(--color-primary)]" />
              <span className="text-xs font-bold" style={{ color: 'var(--color-text-muted)' }}>
                Member since {formatDate(user?.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <form onSubmit={handleUpdateProfile} className="space-y-5 relative z-10">
          <h3 className="text-lg font-bold text-white">Edit Profile</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                <User className="inline w-4 h-4 mr-2 text-[var(--color-primary)]" />
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--color-primary)] placeholder-[var(--color-text-muted)]"
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white' }}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                <Mail className="inline w-4 h-4 mr-2 text-[var(--color-primary)]" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--color-primary)] placeholder-[var(--color-text-muted)]"
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white' }}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                Preferred Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--color-primary)]"
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white' }}
              >
                <option value="₹" className="bg-[#0f0f16]">₹ (INR)</option>
                <option value="$" className="bg-[#0f0f16]">$ (USD)</option>
                <option value="€" className="bg-[#0f0f16]">€ (EUR)</option>
                <option value="£" className="bg-[#0f0f16]">£ (GBP)</option>
                <option value="¥" className="bg-[#0f0f16]">¥ (JPY)</option>
              </select>
            </div>

            <div className="md:col-span-2 mt-2">
              <label className="block text-sm font-bold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                <Palette className="inline w-4 h-4 mr-2 text-[var(--color-primary)]" />
                Theme Accent Color
              </label>
              <div className="flex flex-wrap gap-4">
                {[
                  { id: 'orange', name: 'Neon Orange', color: '#F97316' },
                  { id: 'blue', name: 'Electric Blue', color: '#3B82F6' },
                  { id: 'green', name: 'Emerald Green', color: '#10B981' },
                  { id: 'purple', name: 'Cyberpunk Purple', color: '#8B5CF6' }
                ].map((themeOpt) => (
                  <button
                    key={themeOpt.id}
                    type="button"
                    onClick={() => setAccentColor(themeOpt.id)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 border"
                    style={{
                      background: accentColor === themeOpt.id ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.2)',
                      borderColor: accentColor === themeOpt.id ? themeOpt.color : 'rgba(255,255,255,0.05)',
                      boxShadow: accentColor === themeOpt.id ? `0 0 15px ${themeOpt.color}40` : 'none'
                    }}
                  >
                    <div className="w-5 h-5 rounded-full shadow-sm" style={{ background: themeOpt.color, boxShadow: `0 0 10px ${themeOpt.color}80` }}></div>
                    <span className={`text-sm font-bold ${accentColor === themeOpt.id ? 'text-white' : 'text-slate-400'}`}>
                      {themeOpt.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-6 py-3 text-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        {/* Change password */}
        <div className="rounded-3xl p-6 lg:p-8 relative overflow-hidden shadow-[var(--shadow-lg)]" style={{ background: 'var(--color-card-gradient)', border: '1px solid var(--color-border)' }}>
          <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-transparent to-[var(--color-surface)] pointer-events-none"></div>
          
          <form onSubmit={handleChangePassword} className="space-y-5 relative z-10">
            <h3 className="text-lg font-bold flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/5">
                <Shield className="w-4 h-4 text-[var(--color-primary)]" />
              </div>
              Change Password
            </h3>

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--color-primary)] placeholder-[var(--color-text-muted)]"
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white' }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-secondary)' }}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--color-primary)] placeholder-[var(--color-text-muted)]"
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white' }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--color-primary)] placeholder-[var(--color-text-muted)]"
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white' }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
              className="btn-primary w-full py-3 text-sm"
            >
              {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Badges & Achievements */}
        <div className="rounded-3xl p-6 lg:p-8 relative overflow-hidden shadow-[var(--shadow-lg)]" style={{ background: 'var(--color-card-gradient)', border: '1px solid var(--color-border)' }}>
          <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-transparent to-[var(--color-surface)] pointer-events-none"></div>
          
          <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-white relative z-10">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/5 shadow-[0_0_10px_rgba(251,146,60,0.15)]">
              <Award className="w-4 h-4 text-[var(--color-primary)]" />
            </div>
            Badges & Achievements
          </h3>
          
          <div className="relative z-10 h-full">
            {user?.badges?.length > 0 ? (
              <div className="space-y-4">
                {user.badges.map((badge, idx) => {
                  const icons = {
                    Flame: Flame,
                    Footprints: Footprints,
                    CalendarHeart: CalendarHeart,
                    PiggyBank: PiggyBank
                  };
                  const Icon = icons[badge.icon] || Award;
                  
                  return (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors group">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-[var(--color-primary)]/20 shadow-[0_0_15px_rgba(249,115,22,0.15)] group-hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-shadow" style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(249,115,22,0.05))' }}>
                        <Icon className="w-6 h-6 text-[var(--color-primary)]" style={{ filter: 'drop-shadow(0 0 5px rgba(249,115,22,0.4))' }} />
                      </div>
                      <div>
                        <p className="text-base font-bold text-white">{badge.name}</p>
                        <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{badge.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 flex flex-col items-center justify-center h-[calc(100%-40px)] border border-dashed border-white/10 rounded-2xl">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/5 mb-4 border border-white/5">
                  <Award className="w-8 h-8 opacity-40 text-white" />
                </div>
                <p className="text-sm font-bold text-white mb-1">No Badges Yet</p>
                <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Start tracking your finances to earn rewards!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
