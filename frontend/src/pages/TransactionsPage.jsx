import { useState, useEffect } from 'react';
import api from '../api/axios';
import { formatCurrency, formatDate, formatDateForInput } from '../lib/utils';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { PAYMENT_METHODS } from '../constants/paymentMethods';
import { Download, Plus, Filter, Search, Edit2, Trash2, Receipt, ArrowUpRight, ArrowDownRight, Pencil, ChevronLeft, ChevronRight, FileText, ChevronDown, SlidersHorizontal } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import toast from 'react-hot-toast';

import { useSearchParams } from 'react-router-dom';
import TransactionForm from '../components/common/TransactionForm';
import EmptyState from '../components/common/EmptyState';
import DateRangePicker from '../components/common/DateRangePicker';
import TableSkeleton from '../components/common/TableSkeleton';

const TransactionsPage = () => {
  const [searchParams] = useSearchParams();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Filters - default to URL params if present
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filterType, setFilterType] = useState(searchParams.get('type') || '');
  const [filterCategory, setFilterCategory] = useState(searchParams.get('categoryId') || '');
  const [filterPayment, setFilterPayment] = useState(searchParams.get('paymentMethod') || '');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [showFilters, setShowFilters] = useState(!!(searchParams.get('type') || searchParams.get('categoryId') || searchParams.get('paymentMethod')));

  const filters = { filterType, filterCategory, filterPayment, startDate: dateRange.start, endDate: dateRange.end };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [search, filterType, filterCategory, filterPayment, dateRange, pagination.page]);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data.data);
    } catch (error) {
      // Categories may not exist yet
    }
  };

  const fetchTransactions = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterType) params.append('type', filterType);
      if (filterCategory) params.append('categoryId', filterCategory);
      if (filterPayment) params.append('paymentMethod', filterPayment);
      if (dateRange.start) params.append('startDate', dateRange.start.toISOString());
      if (dateRange.end) params.append('endDate', dateRange.end.toISOString());
      params.append('page', pagination.page);
      params.append('limit', '15');

      const { data } = await api.get(`/transactions?${params}`);
      setTransactions(data.data);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    setShowForm(false);
    
    // Optimistic Update
    const optId = 'temp-' + Date.now();
    const optimisticTx = {
      ...formData,
      _id: optId,
      amount: Number(formData.amount),
      categoryId: categories.find(c => c._id === formData.categoryId) || null,
      createdAt: new Date().toISOString()
    };
    setTransactions(prev => [optimisticTx, ...prev]);

    try {
      await api.post('/transactions', formData);
      fetchTransactions(true); // silent sync
      fetchCategories();
      toast.success('Transaction added!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add transaction. Reverting.');
      fetchTransactions(true); // revert
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await api.put(`/transactions/${editingTx._id}`, formData);
      setEditingTx(null);
      fetchTransactions();
      fetchCategories();
      toast.success('Transaction updated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update transaction');
    }
  };

  const handleDelete = async (id) => {
    setDeleteConfirm(null);
    const previousTransactions = [...transactions];
    setTransactions(prev => prev.filter(t => t._id !== id)); // Optimistic delete
    
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions(true);
      fetchCategories();
      toast.success('Transaction deleted');
    } catch (error) {
      toast.error('Failed to delete transaction. Reverting.');
      setTransactions(previousTransactions); // Revert manually if API fails
    }
  };

  const handleExportCSV = () => {
    if (!transactions.length) return toast.error('No transactions to export');
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Payment Method'];
    const csvRows = [headers.join(',')];
    
    transactions.forEach(tx => {
      const row = [
        formatDateForInput(tx.date),
        tx.type,
        tx.categoryId?.name || tx.description || 'Uncategorized',
        `"${tx.description.replace(/"/g, '""')}"`,
        tx.amount,
        tx.paymentMethod
      ];
      csvRows.push(row.join(','));
    });
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('CSV Exported!');
  };

  const handleExportPDF = () => {
    if (!transactions.length) return toast.error('No transactions to export');
    const doc = new jsPDF();
    doc.text('FinanceFlow - Transactions Report', 14, 15);
    
    const tableColumn = ["Date", "Type", "Category", "Description", "Amount", "Method"];
    const tableRows = [];
    
    transactions.forEach(tx => {
      const txData = [
        formatDateForInput(tx.date),
        tx.type,
        tx.categoryId?.name || '-',
        tx.description,
        formatCurrency(tx.amount),
        tx.paymentMethod
      ];
      tableRows.push(txData);
    });
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    
    doc.save('transactions_report.pdf');
    toast.success('PDF Exported!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
        <div>
          <h2 className="text-[28px] font-bold tracking-tight text-[#F8FAFC]">Transactions</h2>
          <p className="text-sm text-[#94A3B8] mt-1">
            Overview of your financial flows ({pagination.total} total transactions)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#0B1022] border border-white/[0.08] hover:border-white/[0.15] text-[#94A3B8] hover:text-[#18C99A] transition-all duration-200"
            title="Export CSV"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#0B1022] border border-white/[0.08] hover:border-white/[0.15] text-[#94A3B8] hover:text-[#18C99A] transition-all duration-200"
            title="Export PDF"
          >
            <FileText className="w-5 h-5" />
          </button>
          <button
            id="add-transaction-btn"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 h-11 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#18C99A] to-[#0EA5E9] shadow-[0_10px_25px_rgba(24,201,154,0.20)] hover:shadow-[0_12px_30px_rgba(24,201,154,0.30)] hover:-translate-y-[1px] transition-all duration-300 shrink-0 ml-2"
          >
            <Plus className="w-4.5 h-4.5" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 flex items-center bg-[#080D1C] border border-[#263247] rounded-xl hover:border-[#3A475E] focus-within:border-[#18C99A] focus-within:ring-4 focus-within:ring-[#18C99A]/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] transition-all duration-200 h-[54px] relative group">
            <Search className="ml-4 w-[18px] h-[18px] text-[#64748B] group-focus-within:text-[#18C99A] transition-colors duration-200 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPagination(p => ({...p, page: 1})); }}
              placeholder="Search transactions..."
              className="w-full h-full pl-3 pr-4 bg-transparent text-[#F8FAFC] text-[15px] outline-none placeholder:text-[#64748B]"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 h-[54px] rounded-xl text-sm font-bold border transition-all duration-300 shrink-0 ${
              showFilters 
                ? 'bg-[#18C99A]/10 text-[#18C99A] border-[#18C99A]/30 shadow-[0_0_15px_rgba(24,201,154,0.1)]' 
                : 'bg-[#0B1022] text-[#94A3B8] border-[#263247] hover:border-[#3A475E] shadow-[0_10px_35px_rgba(0,0,0,0.15)]'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {showFilters && (
  <div className="mt-3 p-3 sm:p-4 rounded-2xl bg-[#0A0F20] border border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.18)] animate-slide-up relative z-20">

    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

      {/* Filter label */}
      <div className="flex items-center gap-2 shrink-0 px-1">
        <div className="w-8 h-8 rounded-lg bg-[#18C99A]/10 border border-[#18C99A]/15 flex items-center justify-center">
          <SlidersHorizontal className="w-4 h-4 text-[#18C99A]" />
        </div>

        <div>
          <p className="text-sm font-semibold text-[#E2E8F0]">
            Filters
          </p>
          <p className="hidden sm:block text-[11px] text-[#64748B]">
            Refine transactions
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden lg:block w-px h-9 bg-white/[0.08]" />

      {/* Filter controls */}
      <div className="flex flex-wrap gap-2.5 flex-1">
        
        {/* Date Range Picker */}
        <div className="relative">
          <DateRangePicker 
            value={dateRange}
            onChange={(range) => {
              setDateRange({ start: range.startDate, end: range.endDate });
              setPagination(p => ({ ...p, page: 1 }));
            }}
          />
        </div>

        {/* Type */}
        <div className="relative flex-1 min-w-[120px] max-w-[180px]">
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setPagination(p => ({ ...p, page: 1 }));
            }}
            className="
              w-full
              h-[44px]
              pl-4
              pr-10
              rounded-xl
              text-sm
              font-medium
              outline-none
              bg-[#080D1C]
              border border-[#263247]
              text-[#CBD5E1]
              hover:border-[#3A475E]
              focus:border-[#18C99A]
              focus:ring-4
              focus:ring-[#18C99A]/10
              transition-all
              duration-200
              appearance-none
              cursor-pointer
            "
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
        </div>

        {/* Category */}
        <div className="relative flex-1 min-w-[160px] max-w-[210px]">
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setPagination(p => ({ ...p, page: 1 }));
            }}
            className="
              w-full
              h-[44px]
              pl-4
              pr-10
              rounded-xl
              text-sm
              font-medium
              outline-none
              bg-[#080D1C]
              border border-[#263247]
              text-[#CBD5E1]
              hover:border-[#3A475E]
              focus:border-[#18C99A]
              focus:ring-4
              focus:ring-[#18C99A]/10
              transition-all
              duration-200
              appearance-none
              cursor-pointer
            "
          >
            <option value="">All Categories</option>

            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
        </div>

        {/* Payment Method */}
        <div className="relative flex-1 min-w-[180px] max-w-[220px]">
          <select
            value={filterPayment}
            onChange={(e) => {
              setFilterPayment(e.target.value);
              setPagination(p => ({ ...p, page: 1 }));
            }}
            className="
              w-full
              h-[44px]
              pl-4
              pr-10
              rounded-xl
              text-sm
              font-medium
              outline-none
              bg-[#080D1C]
              border border-[#263247]
              text-[#CBD5E1]
              hover:border-[#3A475E]
              focus:border-[#18C99A]
              focus:ring-4
              focus:ring-[#18C99A]/10
              transition-all
              duration-200
              appearance-none
              cursor-pointer
            "
          >
            <option value="">All Payment Methods</option>

            {PAYMENT_METHODS.map((pm) => (
              <option key={pm.value} value={pm.value}>
                {pm.label}
              </option>
            ))}
          </select>

          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
        </div>
      </div>

      {/* Clear */}
      {(filterType || filterCategory || filterPayment) && (
        <button
          onClick={() => {
            setFilterType('');
            setFilterCategory('');
            setFilterPayment('');
            setDateRange({ start: null, end: null });
            setPagination(p => ({ ...p, page: 1 }));
          }}
          className="
            h-[44px]
            px-4
            rounded-xl
            shrink-0
            inline-flex
            items-center
            justify-center
            gap-2
            text-sm
            font-semibold
            text-[#F87171]
            bg-[#F87171]/5
            border border-[#F87171]/15
            hover:bg-[#F87171]/10
            hover:border-[#F87171]/25
            transition-all
            duration-200
            cursor-pointer
          "
        >
          Clear
        </button>
      )}
    </div>
  </div>
)}
      </div>

      {/* Transaction list */}
      <div
        className="rounded-2xl border border-white/[0.08] bg-[#0B1022] shadow-[0_25px_80px_rgba(0,0,0,0.45)] p-4 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-transparent to-[var(--color-surface)] pointer-events-none"></div>
        <div className="relative z-10">
        {loading ? (
          <TableSkeleton />
        ) : transactions.length > 0 ? (
          <div className="space-y-1">
            {transactions.map((tx, i) => (
              <div
                key={tx._id}
                className="flex items-center justify-between px-6 py-4 transition-all duration-200 hover:bg-white/[0.03] rounded-2xl animate-slide-up"
                style={{
                  animationDelay: `${i * 30}ms`,
                }}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{
                      background: tx.type === 'income' ? '#18C99A12' : '#EF444412',
                      borderColor: tx.type === 'income' ? '#18C99A25' : '#EF444425',
                      color: tx.type === 'income' ? '#18C99A' : '#EF4444',
                    }}
                  >
                    {tx.type === 'income' ? <ArrowUpRight className="w-5.5 h-5.5" /> : <ArrowDownRight className="w-5.5 h-5.5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-bold text-[#F8FAFC] truncate">
                      {tx.description}
                    </p>
                    
                    <p className="text-xs mt-1.5 text-[#64748B] flex items-center flex-wrap gap-1.5">
                      <span>{formatDate(tx.date)}</span>
                      <span className="w-1 h-1 rounded-full bg-white/10" />
                      <span 
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase border"
                        style={{
                          background: tx.categoryId?.color ? `${tx.categoryId.color}12` : 'rgba(255,255,255,0.03)',
                          borderColor: tx.categoryId?.color ? `${tx.categoryId.color}25` : 'rgba(255,255,255,0.06)',
                          color: tx.categoryId?.color || '#94A3B8'
                        }}
                      >
                        {tx.categoryId?.name || tx.description || 'Uncategorized'}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-white/10" />
                      <span className="text-[#94A3B8] font-medium">{tx.paymentMethod}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 ml-4 shrink-0">
                  <span
                    className="text-[16px] font-black whitespace-nowrap"
                    style={{ color: tx.type === 'income' ? '#18C99A' : '#EF4444' }}
                  >
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingTx(tx)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-[#18C99A] transition-colors"
                      title="Edit Transaction"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(tx._id)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-red-400 transition-colors"
                      title="Delete Transaction"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={Receipt}
            title={Object.values(filters).some(Boolean) || search ? "No Results Found" : "No Transactions Yet"}
            message={Object.values(filters).some(Boolean) || search 
              ? "Try adjusting your filters or search term to find what you're looking for."
              : "Start tracking your spending and income by adding your very first transaction."}
            actionLabel={!(Object.values(filters).some(Boolean) || search) ? "Add Transaction" : null}
            onAction={() => setShowForm(true)}
          />
        )}
      </div>
    </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
          <p className="text-sm text-[#64748B]">
            Page {pagination.page} of {pagination.pages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              disabled={pagination.page <= 1}
              className="w-12 h-12 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-[#0B1022] border border-white/[0.08] hover:border-white/[0.15] text-[#94A3B8] disabled:opacity-30 disabled:hover:border-white/[0.08] transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              disabled={pagination.page >= pagination.pages}
              className="w-12 h-12 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-[#0B1022] border border-white/[0.08] hover:border-white/[0.15] text-[#94A3B8] disabled:opacity-30 disabled:hover:border-white/[0.08] transition-all duration-200"
            >
              <ChevronRight className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Form modal */}
      {(showForm || editingTx) && (
        <TransactionForm
          transaction={editingTx}
          categories={categories}
          onSubmit={editingTx ? handleUpdate : handleCreate}
          onClose={() => { setShowForm(false); setEditingTx(null); }}
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
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Delete Transaction?</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              This action cannot be undone. The category budget will be recalculated.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-white/5"
                style={{ color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors hover:opacity-90"
                style={{ background: 'var(--color-danger)' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
