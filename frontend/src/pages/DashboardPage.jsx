import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, getGreeting } from '../lib/utils';
import DashboardSkeleton from '../components/common/DashboardSkeleton';
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank,
  ArrowUpRight, ArrowDownRight, Target, CreditCard,
  Lightbulb, AlertCircle, Plus, ChevronRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line
} from 'recharts';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import TransactionForm from '../components/common/TransactionForm';

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

const getMockSparkline = (trend) => {
  if (trend > 0) return [{ v: 20 }, { v: 30 }, { v: 25 }, { v: 45 }, { v: 60 }];
  if (trend < 0) return [{ v: 60 }, { v: 45 }, { v: 50 }, { v: 30 }, { v: 20 }];
  return [{ v: 30 }, { v: 40 }, { v: 35 }, { v: 45 }, { v: 50 }];
};

const baseCardStyle = {
  background: 'var(--color-card-gradient)',
  border: '1px solid var(--color-card-border)',
  boxShadow: 'var(--color-card-shadow)'
};

const StatCard = ({ title, value, icon: Icon, trend, trendLabel, color, onClick, sparklineData }) => (
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
          {formatCurrency(value)}
        </p>
        <p className="text-[13px] font-medium drop-shadow-sm" style={{ color: 'var(--color-text-secondary)' }}>{title}</p>
      </div>
    </div>
  </motion.div>
);

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

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ summary: null, health: null, insights: [], goals: [], subscriptions: [] });
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('expense');

  useEffect(() => {
    fetchDashboardData();
    fetchCategories();
  }, []);

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
    try {
      await api.post('/transactions', formData);
      setShowForm(false);
      fetchDashboardData();
      toast.success('Transaction added successfully!');
    } catch (error) {
      toast.error('Failed to add transaction');
    }
  };

  if (loading) return <DashboardSkeleton />;
  if (!data.summary) return <p style={{ color: 'var(--color-text-secondary)' }}>Failed to load dashboard data.</p>;

  const { summary, health, insights } = data;

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
      </motion.div>

      {/* Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 w-full min-w-0">
        <StatCard title="Total Balance" value={summary.totalBalance} icon={Wallet} color="var(--color-blue)" trend={5.2} trendLabel="+5.2%" sparklineData={getMockSparkline(5.2)} />
        <StatCard title="Income" value={summary.monthlyIncome} icon={TrendingUp} color="var(--color-success)" trend={8.1} trendLabel="+8.1%" onClick={() => { setFormType('income'); setShowForm(true); }} sparklineData={getMockSparkline(8.1)} />
        <StatCard title="Expenses" value={summary.monthlyExpenses} icon={TrendingDown} color="var(--color-danger)" trend={-2.4} trendLabel="-2.4%" onClick={() => { setFormType('expense'); setShowForm(true); }} sparklineData={getMockSparkline(-2.4)} />
        <StatCard title="Savings" value={summary.monthlySavings} icon={PiggyBank} color="var(--color-primary)" trend={12.5} trendLabel="+12.5%" sparklineData={getMockSparkline(12.5)} />
      </div>

      {/* Main Grid: Financial Health & Spending Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.8fr)] gap-5 lg:gap-6 w-full min-w-0">

        {/* Financial Health */}
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
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
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

      {/* Bottom Grid: Categories & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-5 lg:gap-6 w-full min-w-0">

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

        {/* Insights Card */}
        <motion.div variants={itemVariants} className="rounded-2xl p-5 lg:p-6 flex flex-col" style={baseCardStyle}>
          <h3 className="text-[16px] sm:text-[18px] font-bold text-white mb-5">Financial Insights</h3>

          {insights.length > 0 ? (
            <div className="space-y-3 flex-1">
              {insights.map(insight => (
                <div key={insight._id} className="flex gap-3 items-start p-3.5 rounded-[16px] bg-white/[0.02] border border-white/[0.03]">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-blue-500/10 border border-blue-500/20">
                    <Lightbulb className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-[13px] font-medium leading-relaxed text-white/90">{insight.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 py-8">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 border border-white/5">
                <Lightbulb className="w-5 h-5" style={{ color: '#94A3B8' }} />
              </div>
              <p className="text-[13px] font-medium text-center" style={{ color: '#94A3B8' }}>
                Not enough data for insights yet.<br />Keep tracking!
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Transaction Form Modal */}
      {showForm && (
        <TransactionForm
          categories={categories}
          initialType={formType}
          onSubmit={handleCreateTransaction}
          onClose={() => setShowForm(false)}
        />
      )}
    </motion.div>
  );
};

export default DashboardPage;
