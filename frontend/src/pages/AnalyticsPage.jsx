import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '../lib/utils';
import { Loader2, TrendingUp, TrendingDown, Target, Wallet } from 'lucide-react';
import PageSkeleton from '../components/common/PageSkeleton';
import DateRangePicker from '../components/common/DateRangePicker';

const COLORS = ['#3B82F6', '#10B981', '#F97316', '#8B5CF6', '#EC4899', '#06B6D4', '#EAB308'];

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
          stroke="url(#orange-glow-analytics)"
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
        />
        <defs>
          <linearGradient id="orange-glow-analytics" x1="0%" y1="0%" x2="100%" y2="0%">
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
          <span className="font-bold text-white">{typeof entry.value === 'number' ? formatCurrency(entry.value) : entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color, sparklineData }) => (
  <div
    className="rounded-2xl p-[18px] relative group overflow-hidden transition-transform duration-300 hover:-translate-y-0.5 flex flex-col justify-between"
    style={{ ...baseCardStyle, minHeight: '120px' }}
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
    <div className="flex items-center justify-between mb-3 relative z-10">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center relative shrink-0"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <Icon className="w-5 h-5 relative z-10" style={{ color }} />
      </div>
    </div>
    <div className="relative z-10">
      <p className="text-[28px] font-bold tracking-tight text-white leading-none mb-1.5 drop-shadow-md">
        {typeof value === 'number' ? formatCurrency(value) : value}
      </p>
      <p className="text-[13px] font-medium drop-shadow-sm" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
    </div>
  </div>
);

import { useNavigate } from 'react-router-dom';

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const currencySymbol = localStorage.getItem('currency') || '₹';
  const [data, setData] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      let url = '/analytics?filter=This Month';
      if (dateRange.start && dateRange.end) {
        url = `/analytics?filter=Custom Range&customStart=${dateRange.start.toISOString()}&customEnd=${dateRange.end.toISOString()}`;
      }
      const res = await api.get(url);
      setData(res.data?.data || {});
      const healthRes = await api.get('/analytics/health');
      setHealth(healthRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  if (loading && !data) {
    return <PageSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4 w-full min-w-0 animate-fade-in font-sans pb-10">

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-[24px] sm:text-[28px] font-bold text-white tracking-tight leading-tight mb-1">Analytics</h1>
          <p className="text-[13px] sm:text-[14px]" style={{ color: '#94A3B8' }}>Deep dive into your financial health</p>
        </div>

        <div className="relative z-50">
          <DateRangePicker 
            value={dateRange}
            onChange={(range) => setDateRange({ start: range.startDate, end: range.endDate })}
            placeholder="Select date range"
          />
        </div>
      </div>

      {health && (
        <div className="rounded-2xl p-[20px] sm:p-[24px] flex flex-col md:flex-row md:items-center justify-between gap-6"
          style={baseCardStyle}>

          <div className="max-w-2xl">
            <h2 className="text-[18px] sm:text-[20px] font-bold text-white mb-2">Financial Health Score</h2>
            <p className="text-[13px] leading-relaxed" style={{ color: '#94A3B8' }}>{health.explanation}</p>
          </div>

          <div className="flex items-center gap-6 shrink-0 bg-white/[0.02] p-4 rounded-2xl border border-white/[0.05]">
            <CircularProgress score={health.score} />
            <div className="flex flex-col">
              <div className="text-[18px] sm:text-[20px] font-bold tracking-wider mb-1" style={{ color: 'var(--color-accent)' }}>
                {health.status.toUpperCase()}
              </div>
              <div className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>Overall Score</div>
            </div>
          </div>
        </div>
      )}

      {data && (
        <>
          {/* Summary Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full min-w-0">
            {[
              { label: 'Total Income', value: data.totalIncome, icon: TrendingUp, color: 'var(--color-success)', trend: 1 },
              { label: 'Total Expenses', value: data.totalExpenses, icon: TrendingDown, color: 'var(--color-danger)', trend: -1 },
              { label: 'Savings Rate', value: `${data.savingsRate.toFixed(1)}%`, icon: Target, color: 'var(--color-primary)', trend: 1 },
              { label: 'Avg Daily Spend', value: data.averageDailySpending, icon: Wallet, color: 'var(--color-blue)', trend: -1 },
            ].map((stat, i) => (
              <StatCard key={i} label={stat.label} value={stat.value} icon={stat.icon} color={stat.color} sparklineData={getMockSparkline(stat.trend)} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full min-w-0">
            {/* Monthly Trend Chart */}
            <div className="rounded-2xl p-[20px] flex flex-col w-full min-w-0" style={{ ...baseCardStyle, minHeight: '280px' }}>
              <h3 className="text-[16px] sm:text-[18px] font-bold text-white mb-4">Income vs Expense Trend</h3>
              <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.charts.monthlyTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} barGap={4}>
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} dy={8} />
                    <YAxis stroke="#94A3B8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} tickFormatter={(val) => `${currencySymbol}${val / 1000}k`} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                    <Bar dataKey="income" name="Income" radius={[4, 4, 0, 0]} maxBarSize={28}>
                      {data.charts.monthlyTrend.map((entry, index) => (
                        <Cell 
                          key={`cell-inc-${index}`} 
                          fill="url(#colorIncomeA)" 
                          onClick={() => navigate('/transactions?type=income')}
                          style={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Bar>
                    <Bar dataKey="expense" name="Expense" radius={[4, 4, 0, 0]} maxBarSize={28}>
                      {data.charts.monthlyTrend.map((entry, index) => (
                        <Cell 
                          key={`cell-exp-${index}`} 
                          fill="url(#colorExpenseA)" 
                          onClick={() => navigate('/transactions?type=expense')}
                          style={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Bar>
                    <defs>
                      <linearGradient id="colorIncomeA" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0.4} />
                      </linearGradient>
                      <linearGradient id="colorExpenseA" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Spending Chart */}
            <div className="rounded-2xl p-[20px] flex flex-col w-full min-w-0" style={{ ...baseCardStyle, minHeight: '280px' }}>
              <h3 className="text-[16px] sm:text-[18px] font-bold text-white mb-4">Category Breakdown</h3>
              <div className="flex-1 w-full min-h-[200px] flex items-center justify-center">
                {data.charts.categorySpending.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.charts.categorySpending}
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {data.charts.categorySpending.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color || COLORS[index % COLORS.length]} 
                            onClick={() => {
                              // If entry has a categoryId, we can filter. The backend needs to provide this.
                              if (entry.categoryId) {
                                navigate(`/transactions?categoryId=${entry.categoryId}`);
                              } else {
                                navigate(`/transactions?search=${encodeURIComponent(entry.name)}`);
                              }
                            }}
                            style={{ cursor: 'pointer' }}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-[13px] font-medium" style={{ color: '#94A3B8' }}>No expense data available</p>
                )}
              </div>
            </div>

            {/* Daily Spending Trend */}
            <div className="rounded-2xl p-[20px] flex flex-col lg:col-span-2 w-full min-w-0" style={{ ...baseCardStyle, minHeight: '300px' }}>
              <h3 className="text-[16px] sm:text-[18px] font-bold text-white mb-4">Daily Spending</h3>
              <div className="flex-1 w-full min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.charts.dailySpending} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} tickFormatter={(val) => val.slice(5)} dy={8} />
                    <YAxis stroke="#94A3B8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} tickFormatter={(val) => `${currencySymbol}${(val / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 2 }} />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      name="Spent"
                      stroke="var(--color-blue)"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: 'var(--color-blue)', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
