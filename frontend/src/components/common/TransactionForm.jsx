import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { formatDateForInput } from '../../lib/utils';
import { PAYMENT_METHODS } from '../../constants/paymentMethods';
import { useTheme } from '../../context/ThemeContext';

const TransactionForm = ({ transaction, categories, onSubmit, onClose, initialType = 'expense' }) => {
  const [amount, setAmount] = useState(transaction?.amount || '');
  const [type, setType] = useState(transaction?.type || initialType);
  const [categoryId, setCategoryId] = useState(transaction?.categoryId?._id || transaction?.categoryId || '');
  const [description, setDescription] = useState(transaction?.description || '');
  const [paymentMethod, setPaymentMethod] = useState(transaction?.paymentMethod || 'Cash');
  const [date, setDate] = useState(formatDateForInput(transaction?.date || new Date()));
  const [notes, setNotes] = useState(transaction?.notes || '');
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !description) return;
    setLoading(true);
    try {
      await onSubmit({
        amount: parseFloat(amount),
        type,
        categoryId: type === 'expense' ? categoryId : null,
        description,
        paymentMethod,
        date,
        notes,
      });
    } finally {
      setLoading(false);
    }
  };

  const modalStyle = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--color-card-shadow)',
    borderRadius: '20px',
    width: '520px',
    maxWidth: 'calc(100vw - 32px)',
    maxHeight: 'calc(100vh - 40px)',
  };

  const overlayStyle = {
    background: 'rgba(2, 6, 23, 0.72)',
    backdropFilter: 'blur(5px)',
    WebkitBackdropFilter: 'blur(5px)',
  };

  const inputStyle = {
    height: '44px',
    padding: '0 13px',
    borderRadius: '11px',
    background: 'var(--color-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
    transition: 'all 0.2s ease',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--color-text-secondary)',
    marginBottom: '7px',
  };

  const selectBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394A3B8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={overlayStyle}>
      <div className="absolute inset-0" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        className="relative flex flex-col overflow-hidden animate-scale-in"
        style={modalStyle}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-[20px] pb-0">
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text)', lineHeight: '1.2' }}>
              {transaction ? 'Edit Transaction' : 'Add Transaction'}
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Record your income or expense
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-full transition-colors group"
            style={{ width: '34px', height: '34px', color: 'var(--color-text-secondary)' }}
            title="Close"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-border-light)';
              e.currentTarget.style.color = 'var(--color-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            <X className="w-5 h-5 transition-colors" style={{ color: 'inherit' }} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-[20px] py-[18px]">
          {/* Type Selector */}
          <div className="flex w-full mb-[18px]" style={{ height: '44px', borderRadius: '12px', background: 'var(--color-background)', border: '1px solid var(--color-border)', padding: '2px' }}>
            <button
              onClick={() => setType('expense')}
              className="flex-1 rounded-[10px] text-[13px] font-bold transition-all"
              style={{
                background: type === 'expense' ? 'rgba(239,68,68,0.12)' : 'transparent',
                border: type === 'expense' ? '1px solid rgba(239,68,68,0.45)' : '1px solid transparent',
                color: type === 'expense' ? '#EF4444' : 'var(--color-text-secondary)'
              }}
            >
              ↓ Expense
            </button>
            <button
              onClick={() => setType('income')}
              className="flex-1 rounded-[10px] text-[13px] font-bold transition-all"
              style={{
                background: type === 'income' ? 'rgba(16,185,129,0.12)' : 'transparent',
                border: type === 'income' ? '1px solid rgba(16,185,129,0.45)' : '1px solid transparent',
                color: type === 'income' ? '#10B981' : 'var(--color-text-secondary)'
              }}
            >
              ↑ Income
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[14px]">
            {/* Amount + Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
              <div>
                <label style={labelStyle}>Amount (₹) <span className="text-orange-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-[13px] top-1/2 -translate-y-1/2 text-[#64748B] font-semibold text-[16px]">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    style={{ ...inputStyle, paddingLeft: '32px', fontSize: '16px', fontWeight: '600' }}
                    className="focus:border-[var(--color-primary)] focus:ring-[3px] focus:ring-[var(--color-primary-glow)] placeholder-[#64748B]"
                    required
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Date <span className="text-orange-500">*</span></label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{ ...inputStyle, colorScheme: isLight ? 'light' : 'dark' }}
                  className="focus:border-[var(--color-primary)] focus:ring-[3px] focus:ring-[var(--color-primary-glow)]"
                  required
                />
              </div>
            </div>

            {/* Payment + Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
              <div>
                <label style={labelStyle}>Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ ...inputStyle, backgroundImage: selectBg, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 13px center', backgroundSize: '16px' }}
                  className="appearance-none focus:border-[var(--color-primary)] focus:ring-[3px] focus:ring-[var(--color-primary-glow)]"
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm.value} value={pm.value} style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}>{pm.label}</option>
                  ))}
                </select>
              </div>
              {type === 'expense' ? (
                <div>
                  <label style={labelStyle}>Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    style={{ ...inputStyle, backgroundImage: selectBg, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 13px center', backgroundSize: '16px' }}
                    className="appearance-none focus:border-[var(--color-primary)] focus:ring-[3px] focus:ring-[var(--color-primary-glow)]"
                  >
                    <option value="" disabled style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)' }}>Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id} style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="hidden sm:block" /> /* Empty cell for grid layout */
              )}
            </div>

            {/* Description */}
            <div>
              <label style={labelStyle}>Description <span className="text-orange-500">*</span></label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Lunch at restaurant or Salary"
                style={inputStyle}
                className="focus:border-[var(--color-primary)] focus:ring-[3px] focus:ring-[var(--color-primary-glow)] placeholder-[#64748B]"
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label style={labelStyle}>Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes..."
                style={{ ...inputStyle, minHeight: '80px', maxHeight: '160px', padding: '10px 13px', resize: 'vertical', height: 'auto' }}
                className="focus:border-[var(--color-primary)] focus:ring-[3px] focus:ring-[var(--color-primary-glow)] placeholder-[#64748B]"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-[16px] mt-[6px]">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !amount || !description}
                className="flex-1 btn-primary"
              >
                {loading ? 'Saving...' : transaction ? 'Update' : '+ Add Transaction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;
