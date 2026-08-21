import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, getGreeting, formatDate } from '../lib/utils';
import DashboardSkeleton from '../components/common/DashboardSkeleton';
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank,
  ArrowUpRight, ArrowDownRight, Target, CreditCard,
  Lightbulb, AlertCircle, Plus, ChevronRight,
  Settings2, GripVertical, Eye, EyeOff, X, Sparkles
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line
} from 'recharts';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import TransactionForm from '../components/common/TransactionForm';
// ── Animated count-up hook ──────────────────────────────────────────────────
const useCountUp = (target, duration = 800) => {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);
  const rafRef = useRef(null);

  useEffect(() => {
    const from = prevRef.current;
    const to = target;
    if (from === to) return;
    prevRef.current = to;

    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (to - from) * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display;
};
// ───────────────────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const calculateTrends = (summary) => {
  if (!summary || !summary.incomeVsExpense || summary.incomeVsExpense.length < 2) {
    return {
      income: { trend: 0, sparkline: [] },
      expense: { trend: 0, sparkline: [] },
      savings: { trend: 0, sparkline: [] },
      balance: { trend: 0, sparkline: [] }
    };
  }

  const data = summary.incomeVsExpense;
  const current = data[data.length - 1];
  const previous = data[data.length - 2];

  const calcTrend = (curr, prev) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / Math.abs(prev)) * 100;
  };

  const incomeTrend = calcTrend(current.income, previous.income);
  const expenseTrend = calcTrend(current.expense, previous.expense);
  const currentSavings = current.income - current.expense;
  const prevSavings = previous.income - previous.expense;
  const savingsTrend = calcTrend(currentSavings, prevSavings);

  const historicalBalances = [];
  let currentBal = summary.totalBalance;
  for (let i = data.length - 1; i >= 0; i--) {
    historicalBalances.unshift({ v: currentBal });
    const monthSavings = data[i].income - data[i].expense;
    currentBal -= monthSavings;
  }
  const prevBalance = historicalBalances.length > 1 ? historicalBalances[historicalBalances.length - 2].v : 0;
  const balanceTrend = calcTrend(summary.totalBalance, prevBalance);

  return {
    income: { trend: incomeTrend, sparkline: data.map(d => ({ v: d.income })) },
    expense: { trend: expenseTrend, sparkline: data.map(d => ({ v: d.expense })) },
    savings: { trend: savingsTrend, sparkline: data.map(d => ({ v: d.income - d.expense })) },
    balance: { trend: balanceTrend, sparkline: historicalBalances }
  };
};

const formatTrendLabel = (val) => {
  if (val > 0) return `+${val.toFixed(1)}%`;
  return `${val.toFixed(1)}%`;
};

const baseCardStyle = {
  background: 'var(--color-card-gradient)',
  border: '1px solid var(--color-card-border)',
  boxShadow: 'var(--color-card-shadow)'
};

const StatCard = ({ title, value, icon: Icon, trend, trendLabel, color, onClick, sparklineData }) => {
  const animatedValue = useCountUp(value ?? 0);
  return (
    <motion.div
      variants={itemVariants}
      whileHover={onClick ? { y: -4, scale: 1.02 } : { y: -1 }}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`rounded-2xl relative group overflow-hidden ${onClick ? 'cursor-pointer select-none' : ''}`}
      style={{ ...baseCardStyle, minHeight: '130px' }}
    >
      {sparklineData && (
        <div className="absolute inset-x-0 bottom-0 h-16 opacity-20 pointer-events-none z-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line type="monotone" dataKey="v" stroke={color} strokeWidth={3} dot={false} isAnimationActive={true} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      
      <div className="p-4 sm:p-5 lg:p-6 relative z-10 flex flex-col justify-between h-full min-h-[130px]">
        <div className="flex items-center justify-between mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center relative shrink-0"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <Icon className="w-5 h-5 relative z-10" style={{ color }} />
          </div>
          
          <div className="flex items-center gap-2">
            {trend !== undefined && (
              <span className="flex items-center gap-0.5 text-[12px] font-bold px-2 py-0.5 rounded-[8px] border"
                style={{ 
                  color: trend >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                  background: trend >= 0 ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                  borderColor: trend >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'
                }}>
                {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {trendLabel}
              </span>
            )}
          </div>
        </div>
        <div>
          <p className="text-[20px] sm:text-[28px] font-bold tracking-tight text-white leading-none mb-1.5 drop-shadow-md">
            {formatCurrency(animatedValue)}
          </p>
          <p className="text-[13px] font-medium drop-shadow-sm" style={{ color: 'var(--color-text-secondary)' }}>{title}</p>
        </div>
      </div>
    </motion.div>
  );
};

const CircularProgress = ({ score }) => {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
      <svg className="transform -rotate-90 w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
        <circle cx="48" cy="48" r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="none" />
        <circle
          cx="48" cy="48" r={radius}
          stroke="url(#orange-glow)"
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
        />
        <defs>
          <linearGradient id="orange-glow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-accent)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-[28px] font-bold text-white leading-none">{score}</span>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[12px] p-3 shadow-xl" style={{ background: '#0B1733', border: '1px solid rgba(255,255,255,0.1)' }}>
      <p className="text-[13px] font-bold mb-1.5 text-white">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-[12px] mb-1">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: entry.color }}></div>
          <span style={{ color: 'var(--color-text-secondary)' }}>{entry.name}:</span>
          <span className="font-bold text-white">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

const DEFAULT_LAYOUT = [
  { id: 'summary', title: 'Summary Stats', visible: true },
  { id: 'health', title: 'Health & Spending', visible: true },
  { id: 'insights', title: 'Categories & Insights', visible: true }
];

const CustomizeModal = ({ layout, setLayout, onClose }) => {
  const [localLayout, setLocalLayout] = useState(layout);

  const moveItem = (index, direction) => {
    const newLayout = [...localLayout];
    if (direction === 'up' && index > 0) {
      [newLayout[index - 1], newLayout[index]] = [newLayout[index], newLayout[index - 1]];
    } else if (direction === 'down' && index < newLayout.length - 1) {
      [newLayout[index + 1], newLayout[index]] = [newLayout[index], newLayout[index + 1]];
    }
    setLocalLayout(newLayout);
  };

  const toggleVisible = (index) => {
    const newLayout = [...localLayout];
    newLayout[index].visible = !newLayout[index].visible;
    setLocalLayout(newLayout);
  };

  const handleSave = () => {
    setLayout(localLayout);
    localStorage.setItem('dashboard_layout', JSON.stringify(localLayout));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[#0B1022] border border-white/10 rounded-2xl p-5 shadow-2xl animate-scale-in">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-white">Customize Layout</h2>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-white"><X className="w-5 h-5"/></button>
        </div>
        
        <div className="space-y-2 mb-6">
          {localLayout.map((item, index) => (
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex flex-col gap-1">
                <button onClick={() => moveItem(index, 'up')} disabled={index === 0} className="text-[#64748B] hover:text-white disabled:opacity-30">▲</button>
                <button onClick={() => moveItem(index, 'down')} disabled={index === localLayout.length - 1} className="text-[#64748B] hover:text-white disabled:opacity-30">▼</button>
              </div>
              <span className="flex-1 text-sm font-medium text-white">{item.title}</span>
              <button onClick={() => toggleVisible(index)} className="text-[#94A3B8] hover:text-white">
                {item.visible ? <Eye className="w-5 h-5 text-[#18C99A]" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          ))}
        </div>

        <button onClick={handleSave} className="w-full btn-primary h-11">Save Layout</button>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const currencySymbol = localStorage.getItem('currency') || '₹';
  const navigate = useNavigate();
  const [data, setData] = useState({ summary: null, health: null, insights: [], goals: [], subscriptions: [] });
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [formType, setFormType] = useState('expense');
  const [aiSummary, setAiSummary] = useState(null);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [layout, setLayout] = useState(() => {
    const saved = localStorage.getItem('dashboard_layout');
    return saved ? JSON.parse(saved) : DEFAULT_LAYOUT;
  });

  useEffect(() => {
    fetchDashboardData();
    fetchCategories();
    fetchAiSummary();
  }, []);

  const fetchAiSummary = async () => {
    try {
      const currentMonthStr = new Date().toISOString().slice(0, 7);
      const cachedData = localStorage.getItem('finance_ai_summary');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        if (parsed.month === currentMonthStr && (parsed.data || parsed.summary)) {
          setAiSummary(parsed.data || parsed.summary);
          return;
        }
      }

      setAiSummaryLoading(true);
      const { data } = await api.post('/ai/summary');
      const newSummary = data?.data;
      if (newSummary) {
        setAiSummary(newSummary);
        localStorage.setItem('finance_ai_summary', JSON.stringify({
          month: currentMonthStr,
          data: newSummary
        }));
      }
    } catch (error) {
      console.error('Failed to fetch AI summary', error);
    } finally {
      setAiSummaryLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data.data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, healthRes, insightsRes, goalsRes, subsRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/analytics/health'),
        api.get('/insights'),
        api.get('/goals'),
        api.get('/subscriptions')
      ]);

      setData({
        summary: summaryRes.data.data,
        health: healthRes.data.data,
        insights: insightsRes.data.data.slice(0, 3),
        goals: goalsRes.data.data.slice(0, 2),
        subscriptions: subsRes.data.data.filter(s => new Date(s.nextBillingDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).slice(0, 3)
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async (formData) => {
    // 1. Close form immediately
    setShowForm(false);

    // 2. Optimistic State Update
    const amount = Number(formData.amount);
    const type = formData.type;

    setData(prev => {
      if (!prev.summary) return prev;
      const newSummary = { ...prev.summary };
      if (type === 'income') {
        newSummary.monthlyIncome += amount;
        newSummary.totalBalance += amount;
      } else if (type === 'expense') {
        newSummary.monthlyExpenses += amount;
        newSummary.totalBalance -= amount;
      }
      return { ...prev, summary: newSummary };
    });

    // 3. Background Sync
    try {
      await api.post('/transactions', formData);
      fetchDashboardData(); // Silent background refresh
      toast.success('Transaction added successfully!');
    } catch (error) {
      toast.error('Failed to add transaction. Reverting.');
      fetchDashboardData(); // Revert on failure
    }
  };

  if (loading) return <DashboardSkeleton />;
  if (!data.summary) return <p style={{ color: 'var(--color-text-secondary)' }}>Failed to load dashboard data.</p>;

  const { summary, health, insights } = data;
  const trendsData = calculateTrends(summary);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-5 lg:gap-6 w-full min-w-0 font-sans"
    >

      {/* Welcome Card */}
      <motion.div variants={itemVariants} className="rounded-2xl p-4 sm:p-5 lg:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={baseCardStyle}>
        <div>
          <h1 className="text-[24px] sm:text-[28px] font-bold text-white tracking-tight leading-tight mb-1">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Athi'}
          </h1>
          <p className="text-[13px] sm:text-[14px]" style={{ color: '#94A3B8' }}>
            Here's your financial overview for {summary.currentMonth}
          </p>
        </div>

        {summary.streak?.current > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border bg-orange-500/10 shrink-0" style={{ borderColor: 'rgba(249,115,22,0.2)' }}>
            <span className="text-lg">🔥</span>
            <span className="text-[13px] font-bold text-orange-400 tracking-wide">{summary.streak.current} Day Streak!</span>
          </div>
        )}
        <button
          onClick={() => setShowCustomize(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm font-medium text-white ml-auto sm:ml-4"
        >
          <Settings2 className="w-4 h-4" />
          Customize
        </button>
      </motion.div>

      {/* Render based on layout */}
      {layout.filter(l => l.visible).map((section) => {
        if (section.id === 'summary') {
          return (
            <div key="summary" className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 w-full min-w-0">
              <StatCard title="Total Balance" value={summary.totalBalance} icon={Wallet} color="var(--color-blue)" trend={trendsData.balance.trend} trendLabel={formatTrendLabel(trendsData.balance.trend)} sparklineData={trendsData.balance.sparkline} />
              <StatCard title="Income" value={summary.monthlyIncome} icon={TrendingUp} color="var(--color-success)" trend={trendsData.income.trend} trendLabel={formatTrendLabel(trendsData.income.trend)} onClick={() => { setFormType('income'); setShowForm(true); }} sparklineData={trendsData.income.sparkline} />
              <StatCard title="Expenses" value={summary.monthlyExpenses} icon={TrendingDown} color="var(--color-danger)" trend={trendsData.expense.trend} trendLabel={formatTrendLabel(trendsData.expense.trend)} onClick={() => { setFormType('expense'); setShowForm(true); }} sparklineData={trendsData.expense.sparkline} />
              <StatCard title="Savings" value={summary.monthlySavings} icon={PiggyBank} color="var(--color-primary)" trend={trendsData.savings.trend} trendLabel={formatTrendLabel(trendsData.savings.trend)} sparklineData={trendsData.savings.sparkline} />
            </div>
          );
        }
        
        if (section.id === 'health') {
          return (
            <div key="health" className="grid grid-cols-1 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.8fr)] gap-5 lg:gap-6 w-full min-w-0">
              {health && (
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-2xl p-5 lg:p-6 flex flex-col justify-between cursor-pointer hover:bg-white/[0.02] transition-colors duration-300"
            style={{ ...baseCardStyle, minHeight: '290px' }}
            onClick={() => navigate('/analytics')}>

            <h3 className="text-[16px] sm:text-[18px] font-bold text-white mb-6">Financial Health</h3>

            <div className="flex items-center gap-6 mb-6">
              <CircularProgress score={health.score} />
              <div className="flex flex-col">
                <div className="text-[18px] sm:text-[20px] font-bold tracking-wider mb-1" style={{ color: 'var(--color-accent)' }}>
                  {health.status.toUpperCase()}
                </div>
                <div className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>Overall Score</div>
              </div>
            </div>

            <p className="text-[13px] leading-relaxed" style={{ color: '#94A3B8' }}>{health.explanation}</p>
          </motion.div>
        )}

        {/* Spending Overview Chart */}
        <motion.div variants={itemVariants} className="rounded-2xl p-5 lg:p-6 flex flex-col w-full min-w-0"
          style={{ ...baseCardStyle, minHeight: '290px' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[16px] sm:text-[18px] font-bold text-white">Spending Overview</h3>
            <button onClick={() => navigate('/analytics')} className="flex items-center gap-1 text-[13px] font-bold transition-colors hover:text-white" style={{ color: 'var(--color-blue)' }}>
              Analytics <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 w-full min-h-[200px]">
            {summary.incomeVsExpense?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.incomeVsExpense} barGap={4} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} dy={8} />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${currencySymbol}${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Bar dataKey="income" name="Income" radius={[4, 4, 0, 0]} maxBarSize={28}>
                    {summary.incomeVsExpense.map((entry, index) => (
                      <Cell key={`cell-inc-${index}`} fill="url(#colorIncome)" />
                    ))}
                  </Bar>
                  <Bar dataKey="expense" name="Expense" radius={[4, 4, 0, 0]} maxBarSize={28}>
                    {summary.incomeVsExpense.map((entry, index) => (
                      <Cell key={`cell-exp-${index}`} fill="url(#colorExpense)" />
                    ))}
                  </Bar>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0.4} />
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full" style={{ color: '#94A3B8' }}>
                <p className="text-[13px] font-medium">No data yet.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
          );
        }

        if (section.id === 'insights') {
          return (
            <div key="insights" className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 w-full min-w-0">
        {/* Categories Card */}
        <motion.div variants={itemVariants} className="rounded-2xl p-5 lg:p-6 flex flex-col" style={baseCardStyle}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[16px] sm:text-[18px] font-bold text-white">My Categories</h3>
            <button onClick={() => navigate('/categories')} className="flex items-center gap-1 text-[13px] font-bold transition-colors hover:text-white" style={{ color: 'var(--color-blue)' }}>
              Manage <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {summary.categorySpending?.length > 0 ? (
            <div className="space-y-4">
              {summary.categorySpending.slice(0, 4).map((cat) => {
                const percent = cat.budget > 0 ? (cat.spent / cat.budget) * 100 : 0;
                const isOver = percent > 100;
                const isWarning = percent > 85 && !isOver;
                const barColor = isOver ? 'var(--color-danger)' : isWarning ? 'var(--color-primary)' : 'var(--color-success)';

                return (
                  <div key={cat._id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-white">{cat.name}</span>
                        {isOver && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                      </div>
                      <div className="text-right">
                        <span className="text-[14px] font-bold text-white">{formatCurrency(cat.spent)}</span>
                        <span className="text-[12px] font-medium ml-1" style={{ color: 'var(--color-text-secondary)' }}>/ {formatCurrency(cat.budget)}</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/5">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(percent, 100)}%`, background: barColor }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[13px] py-4 text-center" style={{ color: '#94A3B8' }}>No categories yet</p>
          )}
        </motion.div>

        {/* Recent Income Card */}
        <motion.div variants={itemVariants} className="rounded-2xl p-5 lg:p-6 flex flex-col" style={baseCardStyle}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[16px] sm:text-[18px] font-bold text-white">Recent Income</h3>
            <button onClick={() => navigate('/transactions')} className="flex items-center gap-1 text-[13px] font-bold transition-colors hover:text-white" style={{ color: 'var(--color-blue)' }}>
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {summary.recentIncome?.length > 0 ? (
            <div className="space-y-4">
              {summary.recentIncome.map((tx) => (
                <div key={tx._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{
                        background: '#18C99A12',
                        borderColor: '#18C99A25',
                        color: '#18C99A',
                      }}>
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold text-white truncate">{tx.description}</p>
                      <p className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                        {formatDate(tx.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-[14px] font-bold" style={{ color: 'var(--color-success)' }}>
                      +{formatCurrency(tx.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center flex-1 py-8">
               <p className="text-[13px] text-center" style={{ color: '#94A3B8' }}>No recent income</p>
             </div>
          )}
        </motion.div>

        {/* Recent Expenses Card */}
        <motion.div variants={itemVariants} className="rounded-2xl p-5 lg:p-6 flex flex-col" style={baseCardStyle}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[16px] sm:text-[18px] font-bold text-white">Recent Expenses</h3>
            <button onClick={() => navigate('/transactions')} className="flex items-center gap-1 text-[13px] font-bold transition-colors hover:text-white" style={{ color: 'var(--color-blue)' }}>
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {summary.recentExpenses?.length > 0 ? (
            <div className="space-y-4">
              {summary.recentExpenses.map((tx) => (
                <div key={tx._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{
                        background: '#EF444412',
                        borderColor: '#EF444425',
                        color: '#EF4444',
                      }}>
                      <ArrowDownRight className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold text-white truncate">{tx.description}</p>
                      <p className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                        {formatDate(tx.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-[14px] font-bold" style={{ color: 'var(--color-danger)' }}>
                      -{formatCurrency(tx.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center flex-1 py-8">
               <p className="text-[13px] text-center" style={{ color: '#94A3B8' }}>No recent expenses</p>
             </div>
          )}
        </motion.div>
      </div>
          );
        }
        return null;
      })}

      {/* Transaction Form Modal */}
      {showForm && (
        <TransactionForm
          categories={categories}
          initialType={formType}
          onSubmit={handleCreateTransaction}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Customize Layout Modal */}
      {showCustomize && (
        <CustomizeModal 
          layout={layout}
          setLayout={setLayout}
          onClose={() => setShowCustomize(false)}
        />
      )}

      {/* Sticky AI Advisor Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/ai-advisor')}
        className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 z-50 p-4 rounded-full flex items-center justify-center shadow-lg group overflow-hidden"
        style={{ 
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)'
        }}
      >
        <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors duration-300" />
        <Sparkles className="w-6 h-6 text-white relative z-10" />
      </motion.button>
    </motion.div>
  );
};

export default DashboardPage;
