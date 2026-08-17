import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Loader2, Plus, CreditCard, Trash2, Calendar, Edit2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

const baseCardStyle = {
  background: 'var(--color-card-gradient)',
  border: '1px solid var(--color-card-border)',
  boxShadow: 'var(--color-card-shadow)'
};

const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', amount: '', billingCycle: 'Monthly', categoryId: '', nextBillingDate: '', paymentMethod: 'Card' });

  const fetchData = async () => {
    try {
      const [subsRes, catsRes] = await Promise.all([
        api.get('/subscriptions'),
        api.get('/categories')
      ]);
      setSubscriptions(subsRes.data.data);
      setCategories(catsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/subscriptions', formData);
      setShowForm(false);
      setFormData({ name: '', amount: '', billingCycle: 'Monthly', categoryId: categories[0]?._id || '', nextBillingDate: '', paymentMethod: 'Card' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this subscription?')) {
      try {
        await api.delete(`/subscriptions/${id}`);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const calculateMonthlyCost = () => {
    return subscriptions.reduce((total, sub) => {
      let monthlyAmount = sub.amount;
      if (sub.billingCycle === 'Yearly') monthlyAmount = sub.amount / 12;
      if (sub.billingCycle === 'Weekly') monthlyAmount = sub.amount * 4.33;
      return total + monthlyAmount;
    }, 0);
  };

  const monthlyCost = calculateMonthlyCost();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full min-w-0 animate-fade-in font-sans pb-10">

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-[24px] sm:text-[28px] font-bold text-white tracking-tight leading-tight mb-1">Subscriptions</h1>
          <p className="text-[13px] sm:text-[14px]" style={{ color: '#94A3B8' }}>Manage your recurring payments</p>
        </div>
        <button
          onClick={() => {
            if (categories.length === 0) {
              alert('Please create a category first');
              return;
            }
            if (!formData.categoryId) setFormData(f => ({ ...f, categoryId: categories[0]._id }));
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-[13px] font-bold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, var(--color-primary), #EA580C)' }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Subscription</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full min-w-0">
        <div className="rounded-2xl p-[20px] flex flex-col justify-center" style={{ ...baseCardStyle, minHeight: '120px' }}>
          <div className="text-[13px] font-bold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Total Monthly Cost</div>
          <div className="text-[28px] font-bold text-white tracking-tight leading-none">{formatCurrency(monthlyCost)}</div>
        </div>
        <div className="rounded-2xl p-[20px] flex flex-col justify-center" style={{ ...baseCardStyle, minHeight: '120px' }}>
          <div className="text-[13px] font-bold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Estimated Annual Cost</div>
          <div className="text-[28px] font-bold text-white tracking-tight leading-none">{formatCurrency(monthlyCost * 12)}</div>
        </div>
      </div>

      {showForm && (
        <div className="rounded-2xl p-[20px] sm:p-[24px] w-full min-w-0" style={baseCardStyle}>
          <h3 className="text-[18px] font-bold mb-6 text-white">New Subscription</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-[13px] font-bold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-[12px] text-[13px] outline-none transition-colors focus:ring-2 focus:ring-[var(--color-primary)] placeholder-[var(--color-text-muted)]" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} placeholder="e.g. Netflix" />
            </div>
            <div>
              <label className="block text-[13px] font-bold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Amount</label>
              <input type="number" required min="1" step="0.01" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="w-full px-4 py-3 rounded-[12px] text-[13px] outline-none transition-colors focus:ring-2 focus:ring-[var(--color-primary)] placeholder-[var(--color-text-muted)]" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            </div>
            <div>
              <label className="block text-[13px] font-bold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Billing Cycle</label>
              <select value={formData.billingCycle} onChange={e => setFormData({ ...formData, billingCycle: e.target.value })} className="w-full px-4 py-3 rounded-[12px] text-[13px] outline-none transition-colors focus:ring-2 focus:ring-[var(--color-primary)]" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                <option value="Monthly" className="bg-[#0f0f16]">Monthly</option>
                <option value="Yearly" className="bg-[#0f0f16]">Yearly</option>
                <option value="Weekly" className="bg-[#0f0f16]">Weekly</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-bold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Category</label>
              <select required value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} className="w-full px-4 py-3 rounded-[12px] text-[13px] outline-none transition-colors focus:ring-2 focus:ring-[var(--color-primary)]" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                <option value="" disabled className="bg-[#0f0f16]">Select category</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id} className="bg-[#0f0f16]">{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-bold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Next Billing Date</label>
              <input type="date" required value={formData.nextBillingDate} onChange={e => setFormData({ ...formData, nextBillingDate: e.target.value })} className="w-full px-4 py-3 rounded-[12px] text-[13px] outline-none transition-colors focus:ring-2 focus:ring-[var(--color-primary)] placeholder-[var(--color-text-muted)]" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            </div>
            <div>
              <label className="block text-[13px] font-bold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Payment Method</label>
              <input type="text" value={formData.paymentMethod} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })} className="w-full px-4 py-3 rounded-[12px] text-[13px] outline-none transition-colors focus:ring-2 focus:ring-[var(--color-primary)] placeholder-[var(--color-text-muted)]" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} placeholder="e.g. Credit Card" />
            </div>
            <div className="md:col-span-3 flex gap-3 mt-2">
              <button type="submit" className="btn-primary">Save Subscription</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-2xl overflow-hidden w-full min-w-0" style={baseCardStyle}>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b bg-black/20" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <th className="p-4 sm:p-5 text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Name</th>
                <th className="p-4 sm:p-5 text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Amount</th>
                <th className="p-4 sm:p-5 text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Cycle</th>
                <th className="p-4 sm:p-5 text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Next Billing</th>
                <th className="p-4 sm:p-5 text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Status</th>
                <th className="p-4 sm:p-5 text-[12px] font-bold uppercase tracking-wider text-right" style={{ color: 'var(--color-text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub, i) => {
                const isUpcoming = new Date(sub.nextBillingDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // within 7 days

                return (
                  <tr key={sub._id} className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: i === subscriptions.length - 1 ? 'transparent' : 'rgba(255,255,255,0.05)' }}>
                    <td className="p-4 sm:p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/5" style={{ background: 'rgba(249,115,22,0.1)' }}>
                          <CreditCard className="w-5 h-5 text-[var(--color-primary)]" />
                        </div>
                        <div>
                          <p className="font-bold text-[14px] text-white">{sub.name}</p>
                          <p className="text-[12px] font-medium mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{sub.paymentMethod}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 sm:p-5 font-bold text-white text-[15px]">{formatCurrency(sub.amount)}</td>
                    <td className="p-4 sm:p-5 font-medium text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>{sub.billingCycle}</td>
                    <td className="p-4 sm:p-5">
                      <div className={`flex items-center gap-2 font-bold text-[13px] ${isUpcoming ? 'text-red-400' : 'text-[var(--color-text-secondary)]'}`}>
                        <Calendar className="w-4 h-4" />
                        {new Date(sub.nextBillingDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 sm:p-5">
                      <span className={`px-2.5 py-1 rounded-[8px] text-[11px] font-bold border ${sub.status === 'Active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-4 sm:p-5 text-right">
                      <button onClick={() => handleDelete(sub._id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {subscriptions.length === 0 && !showForm && (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                    <p className="text-[13px] font-medium" style={{ color: 'var(--color-text-muted)' }}>No subscriptions added yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsPage;
