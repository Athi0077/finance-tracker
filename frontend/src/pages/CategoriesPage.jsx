import { useState, useEffect } from 'react';
import api from '../api/axios';
import { formatCurrency, getBudgetStatus } from '../lib/utils';
import BudgetProgress from '../components/common/BudgetProgress';
import PageSkeleton from '../components/common/PageSkeleton';
import CategoryForm from '../components/categories/CategoryForm';
import GPayModal from '../components/categories/GPayModal';
import GPaySuccessModal from '../components/categories/GPaySuccessModal';
import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../components/common/EmptyState';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // GPay state
  const [selectedGPayCategory, setSelectedGPayCategory] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data.data);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    try {
      const { data } = await api.post('/categories', formData);
      setCategories([...categories, data.data]);
      setShowForm(false);
      toast.success('Category created!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create category');
    }
  };

  const handleUpdate = async (formData) => {
    try {
      const { data } = await api.put(`/categories/${editingCategory._id}`, formData);
      setCategories(categories.map((c) => (c._id === editingCategory._id ? data.data : c)));
      setEditingCategory(null);
      toast.success('Category updated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update category');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      setCategories(categories.filter((c) => c._id !== id));
      setDeleteConfirm(null);
      toast.success('Category deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleGPaySuccess = (data) => {
    setSelectedGPayCategory(null);
    setPaymentData(data);
  };

  const handleAddGPayTransaction = async (data) => {
    try {
      const txData = {
        amount: data.amount,
        type: 'expense',
        categoryId: data.categoryId,
        description: 'Payment via GPay',
        date: new Date().toISOString(),
        paymentMethod: 'UPI'
      };

      const res = await api.post('/transactions', txData);
      
      // The backend returns updatedCategory in res.data.updatedCategory if it enriches it,
      // but standard createTransaction in transactionController just returns:
      // { success: true, data: result.transaction, updatedCategory: result.updatedCategory }
      
      const updatedCat = res.data.updatedCategory;
      
      if (updatedCat) {
        setCategories(categories.map(c => c._id === updatedCat._id ? updatedCat : c));
      } else {
        // Fallback: manually update if updatedCategory is not returned
        setCategories(categories.map(c => {
          if (c._id === data.categoryId) {
            return {
              ...c,
              spent: (c.spent || 0) + data.amount
            };
          }
          return c;
        }));
      }

      setPaymentData(null);
      toast.success('Transaction added successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add transaction');
    }
  };

  const getIconComponent = (iconName) => {
    const formatted = iconName
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    return LucideIcons[formatted] || LucideIcons.Circle;
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/[0.06]">
        <div>
          <h2 className="text-[28px] font-bold tracking-tight text-[#F8FAFC]">
            My Categories
          </h2>
          <p className="text-sm text-[#94A3B8] mt-1">
            Manage your budget allocations across {categories.length} {categories.length === 1 ? 'category' : 'categories'}
          </p>
        </div>
        <button
          id="create-category-btn"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#18C99A] to-[#0EA5E9] shadow-[0_10px_25px_rgba(24,201,154,0.20)] hover:shadow-[0_12px_30px_rgba(24,201,154,0.30)] hover:-translate-y-[1px] transition-all duration-300 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Category
        </button>
      </div>

      {/* Category grid */}
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => {
            const IconComponent = getIconComponent(cat.icon);
            const percentage = cat.monthlyBudget > 0 ? Math.round(((cat.spent || 0) / cat.monthlyBudget) * 100) : 0;
            const balance = cat.monthlyBudget - (cat.spent || 0);
            const status = getBudgetStatus(percentage);

            return (
              <div
                key={cat._id}
                className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1022] hover:border-white/[0.15] p-6 pb-8 shadow-[0_15px_40px_rgba(0,0,0,0.35)] group transition-all duration-300 hover:-translate-y-1"
                style={{
                  animationDelay: `${i * 50}ms`,
                }}
              >
                {/* Hover Background Glow based on category's color */}
                <div 
                  className="absolute -right-16 -top-16 w-32 h-32 rounded-full blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
                  style={{ backgroundColor: cat.color || '#18C99A' }}
                />

                {/* Header */}
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center relative shrink-0"
                      style={{ 
                        background: `${cat.color}15`, 
                        border: `1px solid ${cat.color}30` 
                      }}
                    >
                      {/* Inner glow */}
                      <div className="absolute inset-0 rounded-2xl blur-md opacity-25" style={{ background: cat.color }}></div>
                      <IconComponent className="w-5.5 h-5.5 relative z-10" style={{ color: cat.color || '#18C99A' }} />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-[#F8FAFC]">
                        {cat.name}
                      </h3>
                      {cat.description ? (
                        <p className="text-xs text-[#94A3B8] mt-0.5 line-clamp-1">
                          {cat.description}
                        </p>
                      ) : (
                        <p className="text-xs text-[#64748B] mt-0.5">
                          Personal budget
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 mr-2 relative z-10">
                    <button
                      onClick={() => setEditingCategory(cat)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-[#18C99A] transition-colors"
                      title="Edit Category"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(cat._id)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-red-400 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Spent info */}
                <div className="mb-4 relative z-10">
                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <span className="text-2xl font-black text-[#F8FAFC] tracking-tight">
                        {formatCurrency(cat.spent || 0)}
                      </span>
                      <span className="text-xs font-semibold text-[#64748B] ml-1.5">
                        spent
                      </span>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="text-xs font-bold text-[#94A3B8]">
                        {percentage}%
                      </span>
                      <span className={`text-[11px] font-semibold mt-0.5 ${balance >= 0 ? 'text-[#64748B]' : 'text-red-400'}`}>
                        {balance >= 0 ? `${formatCurrency(balance)} left` : `${formatCurrency(Math.abs(balance))} over`}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar (Custom sleek inline styled so we don't duplicate labels) */}
                  <div className="w-full h-2 rounded-full bg-white/[0.04] overflow-hidden relative">
                    <div 
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{ 
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: cat.color || '#18C99A',
                        boxShadow: `0 0 10px ${cat.color}50`
                      }}
                    />
                  </div>
                </div>

                {/* Footer status / limit */}
                <div className="flex items-center justify-between mt-4 pt-4 px-2 border-t border-white/[0.04] relative z-10">
                  <span className="text-xs font-semibold text-[#64748B] ml-3">
                    Limit: {formatCurrency(cat.monthlyBudget)}
                  </span>

                  {/* Status Badge */}
                  <span
                    className="text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                    style={{
                      background: `${status.color}15`,
                      color: status.color,
                      border: `1px solid ${status.color}25`
                    }}
                  >
                    {status.emoji} {status.label}
                  </span>
                </div>

                {/* GPay Button */}
                <div className="mt-4 pt-4 border-t border-white/[0.04] relative z-10">
                  <button
                    onClick={() => setSelectedGPayCategory(cat)}
                    disabled={balance <= 0}
                    className="w-full py-2.5 rounded-xl font-bold text-white bg-[#131B31] border border-white/[0.08] hover:bg-white/[0.05] hover:border-[#18C99A]/50 transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-sm">{balance <= 0 ? 'Limit Reached' : 'Pay with GPay'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState 
          icon={FolderOpen}
          title="No Categories Yet"
          message="Organize your finances by creating custom categories for your income and expenses."
          actionLabel="Create Category"
          onAction={() => setShowForm(true)}
        />
      )}

      {/* Create/Edit form modal */}
      {(showForm || editingCategory) && (
        <CategoryForm
          category={editingCategory}
          onSubmit={editingCategory ? handleUpdate : handleCreate}
          onClose={() => {
            setShowForm(false);
            setEditingCategory(null);
          }}
        />
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDeleteConfirm(null)} />
          <div
            className="relative rounded-2xl p-6 max-w-sm w-full animate-scale-in"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
              Delete Category?
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              This will remove the category and unlink all associated transactions. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="btn-danger text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GPay Modals */}
      <GPayModal
        isOpen={!!selectedGPayCategory}
        category={selectedGPayCategory}
        onClose={() => setSelectedGPayCategory(null)}
        onSuccess={handleGPaySuccess}
      />

      <GPaySuccessModal
        isOpen={!!paymentData}
        paymentData={paymentData}
        onClose={() => {
          setPaymentData(null);
          toast('Payment not added to tracker', { icon: 'ℹ️' });
        }}
        onAddTransaction={handleAddGPayTransaction}
      />
    </div>
  );
};

export default CategoriesPage;
