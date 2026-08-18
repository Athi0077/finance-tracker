import { useState } from 'react';
import { formatCurrency } from '../../lib/utils';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const GPayModal = ({ category, isOpen, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const currencySymbol = localStorage.getItem('currency') || '₹';

  if (!isOpen || !category) return null;

  const budget = category.monthlyBudget;
  const spent = category.spent || 0;
  const remaining = budget - spent;

  const handleAmountChange = (e) => {
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setAmount(val);
      setError('');
    }
  };

  const handleAddData = () => {
    const numAmount = parseFloat(amount);
    
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (numAmount > remaining) {
      setError('Amount exceeds the remaining budget limit');
      return;
    }

    setLoading(true);
    // Add a small delay to simulate processing, then return success
    setTimeout(() => {
      onSuccess({
        amount: numAmount,
        referenceId: `PAY_MANUAL_${Date.now()}`,
        categoryId: category._id,
        categoryName: category.name
      });
      setLoading(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />
      
      <div className="relative rounded-2xl p-6 max-w-sm w-full animate-scale-in bg-[#0B1022] border border-white/[0.08] shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
        <h3 className="text-xl font-bold mb-4 text-[#F8FAFC]">
          Record GPay Transaction
        </h3>
        <p className="text-[#94A3B8] text-sm mb-6">
          Enter the amount you just paid in your GPay app to record it in your tracker.
        </p>
        
        <div className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <h4 className="font-semibold text-[#E2E8F0] mb-2">{category.name}</h4>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-[#94A3B8]">Budget:</span>
            <span className="text-[#F8FAFC]">{formatCurrency(budget)}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-[#94A3B8]">Spent:</span>
            <span className="text-[#F8FAFC]">{formatCurrency(spent)}</span>
          </div>
          <div className="flex justify-between text-sm mt-2 pt-2 border-t border-white/[0.04]">
            <span className="font-semibold text-[#94A3B8]">Remaining:</span>
            <span className={`font-bold ${remaining >= 0 ? 'text-[#18C99A]' : 'text-red-400'}`}>
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#94A3B8] mb-2">
            Amount Paid
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] font-bold">
              {currencySymbol}
            </span>
            <input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              disabled={loading}
              className="w-full bg-[#131B31] border border-white/[0.1] rounded-xl py-3 pl-8 pr-4 text-[#F8FAFC] focus:outline-none focus:border-[#0EA5E9] transition-colors"
              placeholder="0.00"
            />
          </div>
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 rounded-xl font-semibold text-[#94A3B8] bg-white/[0.02] hover:bg-white/[0.05] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAddData}
            disabled={loading || !amount}
            className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#18C99A] to-[#0EA5E9] shadow-[0_4px_15px_rgba(24,201,154,0.2)] hover:shadow-[0_6px_20px_rgba(24,201,154,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '+ Add Data'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GPayModal;
