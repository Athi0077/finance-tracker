import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../api/axios';
import { Lightbulb, AlertTriangle, TrendingUp, Target, CreditCard, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

const InsightsPage = () => {
    const currencySymbol = localStorage.getItem('currency') || '₹';
    const [insights, setInsights] = useState([]);
    const [anomalies, setAnomalies] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aiSummary, setAiSummary] = useState(null);
    const [aiSummaryLoading, setAiSummaryLoading] = useState(false);

    useEffect(() => {
        const loadAiSummary = async () => {
            const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
            const stored = localStorage.getItem('finance_ai_summary');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (parsed.month === currentMonth) {
                        setAiSummary(parsed.data);
                        return; // Valid cached data for this month
                    }
                } catch (e) {
                    console.error("Failed to parse cached ai summary");
                }
            }

            // Fetch new summary
            setAiSummaryLoading(true);
            try {
                const res = await api.post('/ai/summary');
                const newSummary = res.data?.data;
                if (newSummary) {
                    setAiSummary(newSummary);
                    localStorage.setItem('finance_ai_summary', JSON.stringify({
                        month: currentMonth,
                        data: newSummary
                    }));
                }
            } catch (e) {
                console.error("Failed to fetch ai summary", e);
            } finally {
                setAiSummaryLoading(false);
            }
        };

        const fetchAll = async () => {
            try {
                const [iRes, aRes, pRes, rRes] = await Promise.all([
                    api.get('/insights'),
                    api.get('/analytics/anomalies'),
                    api.get('/analytics/predictions'),
                    api.get('/analytics/recommendations')
                ]);
                
                setInsights(iRes.data?.data || []);
                setAnomalies(aRes.data?.data || []);
                setPredictions(pRes.data?.data || []);
                setRecommendations(rRes.data?.data || []);
            } catch(e) {
                console.error(e);
                // Ensure arrays stay valid on error
                setInsights([]);
                setAnomalies([]);
                setPredictions([]);
                setRecommendations([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
        loadAiSummary();
    }, []);

    const handleReviewAnomaly = async (id, status) => {
        // Mock update - would hit an endpoint in real app
        setAnomalies(prev => prev.map(a => a._id === id ? { ...a, status } : a));
    };

    if (loading) {
        return <div className="p-8 text-center text-[var(--color-text-muted)]">Loading insights...</div>;
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-[var(--color-text)]">Insight Center</h1>
                <p className="text-[var(--color-text-muted)] mt-1">AI-powered analysis of your financial health</p>
            </div>

            {/* AI Summary / Prediction Section */}
            <section className="mb-8">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--color-text)]">
                    <Sparkles className="w-5 h-5 text-indigo-400" /> AI Financial Summary & Prediction
                </h2>
                <div className="bg-[var(--color-surface)] border border-indigo-500/30 rounded-2xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(99,102,241,0.05)]">
                    {aiSummaryLoading ? (
                        <div className="flex items-center gap-3 text-indigo-400">
                            <div className="w-5 h-5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin"></div>
                            <span className="text-sm font-medium">Generating your personalized AI insight...</span>
                        </div>
                    ) : aiSummary ? (
                        <div className="text-sm leading-relaxed text-[var(--color-text)] [&>p]:mb-2 [&>h3]:font-bold [&>h3]:mt-3 [&>ul]:list-disc [&>ul]:pl-5 [&_strong]:text-indigo-400">
                            <ReactMarkdown>{aiSummary}</ReactMarkdown>
                        </div>
                    ) : (
                        <p className="text-sm text-[var(--color-text-muted)]">Could not generate AI summary at this time.</p>
                    )}
                </div>
            </section>

            {/* Recommendations Section */}
            {recommendations.length > 0 && (
                <section>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--color-text)]">
                        <Target className="w-5 h-5 text-blue-500" /> Personalized Recommendations
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendations.map(r => (
                            <div key={r._id} className="bg-[var(--color-surface)] border border-blue-500/30 rounded-2xl p-5">
                                <h3 className="font-semibold text-[var(--color-text)] mb-2">{r.title}</h3>
                                <p className="text-sm text-[var(--color-text-secondary)] mb-4">{r.explanation}</p>
                                <div className="flex gap-2">
                                    <button className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 font-medium hover:bg-blue-500/20">Review</button>
                                    <button className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-[var(--color-text-muted)] hover:bg-white/10">Dismiss</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Anomalies Section */}
            {anomalies.filter(a => a.status === 'unresolved').length > 0 && (
                <section>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--color-text)]">
                        <AlertTriangle className="w-5 h-5 text-red-500" /> Unusual Activity
                    </h2>
                    <div className="space-y-4">
                        {anomalies.filter(a => a.status === 'unresolved').map(a => (
                            <div key={a._id} className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold uppercase tracking-wider text-red-500 bg-red-500/10 px-2 py-0.5 rounded">Alert</span>
                                        <span className="text-sm text-[var(--color-text-muted)]">{new Date(a.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm font-medium text-[var(--color-text)] mt-2">{a.reason}</p>
                                    <p className="text-xs text-[var(--color-text-muted)] mt-1">Expected Range: {currencySymbol}{a.expectedRangeMin} - {currencySymbol}{a.expectedRangeMax}</p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button onClick={() => handleReviewAnomaly(a._id, 'reviewed')} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20"><CheckCircle2 className="w-3 h-3"/> Verify</button>
                                    <button onClick={() => handleReviewAnomaly(a._id, 'reviewed')} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-white/5 text-[var(--color-text-secondary)] rounded-lg hover:bg-white/10"><XCircle className="w-3 h-3"/> Ignore</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Predictions Section */}
                <section>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--color-text)]">
                        <TrendingUp className="w-5 h-5 text-purple-500" /> Expense Predictions
                    </h2>
                    <div className="space-y-3">
                        {predictions.map(p => (
                            <div key={p._id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-medium text-[var(--color-text)]">{p.type === 'total_expense' ? 'Total Expenses' : p.categoryId?.name}</span>
                                    <span className="text-sm font-bold text-purple-400">~{currencySymbol}{p.predictedAmount}</span>
                                </div>
                                <p className="text-xs text-[var(--color-text-muted)] mb-2">{p.explanation}</p>
                                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] mt-3 pt-3 border-t border-[var(--color-border)]">
                                    <span>Range: {currencySymbol}{p.rangeMin} - {currencySymbol}{p.rangeMax}</span>
                                    <span>Confidence: {p.confidence}</span>
                                </div>
                            </div>
                        ))}
                        {predictions.length === 0 && <p className="text-sm text-[var(--color-text-muted)]">Not enough historical data to generate predictions.</p>}
                    </div>
                </section>

                {/* General Insights Section */}
                <section>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--color-text)]">
                        <Lightbulb className="w-5 h-5 text-yellow-500" /> Spending Patterns
                    </h2>
                    <div className="space-y-3">
                        {insights.map(i => (
                            <div key={i._id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex gap-3">
                                <Lightbulb className={`w-4 h-4 shrink-0 mt-0.5 ${i.type === 'trend' ? 'text-green-500' : 'text-yellow-500'}`} />
                                <p className="text-sm text-[var(--color-text)]">{i.message}</p>
                            </div>
                        ))}
                        {insights.length === 0 && <p className="text-sm text-[var(--color-text-muted)]">No active insights right now.</p>}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default InsightsPage;
