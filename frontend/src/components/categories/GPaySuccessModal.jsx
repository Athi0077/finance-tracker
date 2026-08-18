import { CheckCircle2, Loader2 } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { useState } from 'react';

const GPaySuccessModal = ({ isOpen, paymentData, onClose, onAddTransaction }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !paymentData) return null;

  const handleAdd = async () => {
    setIsSubmitting(true);
    await onAddTransaction(paymentData);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!isSubmitting ? onClose : undefined} />
      
      <div className="relative rounded-2xl p-6 max-w-sm w-full animate-scale-in bg-[#0B1022] border border-white/[0.08] shadow-[0_15px_40px_rgba(0,0,0,0.5)] text-center">
        
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-[#18C99A]/10 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-[#18C99A]" />
          </div>
        </div>
        
        <h3 className="text-xl font-bold mb-2 text-[#F8FAFC]">
          Payment Successful
        </h3>
        
        <div className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-left">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[#94A3B8]">Category:</span>
            <span className="text-[#F8FAFC] font-medium">{paymentData.categoryName}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[#94A3B8]">Amount:</span>
            <span className="text-[#F8FAFC] font-bold">{formatCurrency(paymentData.amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#94A3B8]">Method:</span>
            <span className="text-[#F8FAFC]">Google Pay / UPI</span>
          </div>
        </div>

        <p className="text-sm text-[#94A3B8] mb-6">
          Do you want to add this payment to your expense transactions?
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl font-semibold text-[#94A3B8] bg-white/[0.02] hover:bg-white/[0.05] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#18C99A] to-[#0EA5E9] shadow-[0_4px_15px_rgba(24,201,154,0.2)] hover:shadow-[0_6px_20px_rgba(24,201,154,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add Transaction'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GPaySuccessModal;
