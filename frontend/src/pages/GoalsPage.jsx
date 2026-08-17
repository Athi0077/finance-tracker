import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Target, Trash2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import PageSkeleton from '../components/common/PageSkeleton';

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', targetAmount: '', currentAmount: '', targetDate: '' });

  const fetchGoals = async () => {
    try {
      const res = await api.get('/goals');
      setGoals(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/goals', formData);
      setShowForm(false);
      setFormData({ name: '', targetAmount: '', currentAmount: '', targetDate: '' });
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      try {
        await api.delete(`/goals/${id}`);
        fetchGoals();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleContribute = async (id, amount) => {
    const contribution = prompt('Enter contribution amount:');
    if (contribution && !isNaN(contribution)) {
      try {
        await api.post(`/goals/${id}/contributions`, { amount: Number(contribution) });
        fetchGoals();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Financial Goals</h1>
          <p className="text-sm font-medium mt-1" style={{ color: 'var(--color-text-secondary)' }}>Track and manage your savings goals</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl p-6 lg:p-8 relative overflow-hidden shadow-[var(--shadow-lg)]" style={{ background: 'var(--color-card-gradient)', border: '1px solid var(--color-border)' }}>
          <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-transparent to-[var(--color-surface)] pointer-events-none"></div>
          <h3 className="text-xl font-bold mb-6 text-white relative z-10">Create New Goal</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Goal Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--color-primary)] placeholder-[var(--color-text-muted)]" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white' }} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Target Amount</label>
              <input type="number" required min="1" value={formData.targetAmount} onChange={e => setFormData({...formData, targetAmount: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--color-primary)] placeholder-[var(--color-text-muted)]" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white' }} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Current Amount (Optional)</label>
              <input type="number" min="0" value={formData.currentAmount} onChange={e => setFormData({...formData, currentAmount: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--color-primary)] placeholder-[var(--color-text-muted)]" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white' }} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Target Date</label>
              <input type="date" required value={formData.targetDate} onChange={e => setFormData({...formData, targetDate: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--color-primary)] placeholder-[var(--color-text-muted)]" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white' }} />
            </div>
            <div className="md:col-span-2 flex gap-3 mt-4">
              <button type="submit" className="btn-primary">Save Goal</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => {
          const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
          const cappedProgress = Math.min(progress, 100);
          
          return (
            <div key={goal._id} className="rounded-2xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 shadow-[var(--shadow-lg)]" style={{ background: 'var(--color-card-gradient)', border: '1px solid var(--color-border)' }}>
              <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-transparent to-[var(--color-surface)] pointer-events-none"></div>
              
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button onClick={() => handleDelete(goal._id)} className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 border border-red-500/20"><Trash2 className="w-4 h-4" /></button>
              </div>
              
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 relative z-10 border border-white/5 shadow-[0_0_15px_rgba(251,146,60,0.2)]" style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(249,115,22,0.05))' }}>
                <Target className="w-6 h-6 text-[var(--color-primary)]" style={{ filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.6))' }} />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-1 relative z-10">{goal.name}</h3>
              <p className="text-xs font-medium mb-5 relative z-10" style={{ color: 'var(--color-text-muted)' }}>Target: {new Date(goal.targetDate).toLocaleDateString()}</p>
              
              <div className="flex justify-between items-baseline mb-2 relative z-10">
                <span className="text-2xl font-bold text-white tracking-tight">{formatCurrency(goal.currentAmount)}</span>
                <span className="text-sm font-bold" style={{ color: 'var(--color-text-muted)' }}>/ {formatCurrency(goal.targetAmount)}</span>
              </div>
              
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-3 relative z-10">
                <div className="h-full rounded-full transition-all duration-500 relative" style={{ width: `${cappedProgress}%`, background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))', boxShadow: '0 0 10px rgba(249,115,22,0.6)' }}>
                  <div className="absolute inset-0 bg-white/20 rounded-full w-full h-full"></div>
                </div>
              </div>
              
              <div className="flex justify-between items-center relative z-10 mt-4">
                <span className="text-xs font-bold" style={{ color: 'var(--color-text-secondary)' }}>{cappedProgress.toFixed(1)}% completed</span>
                <button onClick={() => handleContribute(goal._id)} className="text-sm font-bold transition-colors" style={{ color: 'var(--color-primary)', textShadow: '0 0 10px rgba(249,115,22,0.4)' }}>Add Funds</button>
              </div>
            </div>
          );
        })}
        
        {goals.length === 0 && !showForm && (
          <div className="col-span-full py-16 text-center rounded-2xl relative overflow-hidden" style={{ background: 'var(--color-card-gradient)', border: '1px dashed var(--color-border)' }}>
            <div className="absolute inset-0 opacity-5 bg-[var(--color-primary)] pointer-events-none"></div>
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-white/5 mx-auto mb-5 border border-white/5">
              <Target className="w-10 h-10 opacity-30 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 relative z-10">No goals yet</h3>
            <p className="text-sm font-medium mb-6 relative z-10" style={{ color: 'var(--color-text-muted)' }}>Set a target and start saving towards it.</p>
            <button onClick={() => setShowForm(true)} className="btn-primary relative z-10">Create First Goal</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalsPage;
