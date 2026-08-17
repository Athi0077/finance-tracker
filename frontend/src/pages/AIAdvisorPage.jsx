import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { Sparkles, Send, Bot, User, Loader2, AlertCircle, TrendingUp, Utensils, PiggyBank, Wallet } from 'lucide-react';

const AIAdvisorPage = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    // Initial greeting
    useEffect(() => {
        setMessages([{
            _id: 'initial',
            role: 'model',
            content: 'Hello! I am your AI Financial Advisor. You can ask me questions about your spending, budget, or get advice on how to save more. How can I help you today?'
        }]);
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setInput('');
        
        // Optimistic UI
        const tempId = Date.now().toString();
        setMessages(prev => [...prev, { _id: tempId, role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const res = await api.post('/ai/chat', {
                message: userMsg,
                conversationId: conversationId
            });

            if (res.data.success) {
                setConversationId(res.data.data.conversationId);
                setMessages(prev => [...prev, res.data.data.message]);
            }
        } catch (err) {
            console.error('Chat error:', err);
            setMessages(prev => [...prev, {
                _id: 'error-' + Date.now(),
                role: 'model',
                content: 'Sorry, I am having trouble connecting to my servers right now. Please try again later.',
                isError: true
            }]);
        } finally {
            setLoading(false);
        }
    };

    const suggestedQuestions = [
        { text: "Where am I overspending?", icon: TrendingUp, color: '#A855F7' },
        { text: "How much did I spend on Food?", icon: Utensils, color: '#3B82F6' },
        { text: "How can I save more next month?", icon: PiggyBank, color: '#A855F7' },
        { text: "What are my biggest expenses?", icon: Wallet, color: '#3B82F6' }
    ];

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col max-w-4xl mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-lg animate-fade-in">
            {/* Header */}
            <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}>
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-[var(--color-text)]">AI Financial Advisor</h2>
                        <p className="text-xs text-[var(--color-text-muted)]">Powered by GPT-4o</p>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((msg, i) => (
                    <div key={msg._id || i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1" 
                            style={{ 
                                background: msg.role === 'user' ? 'var(--color-primary-muted)' : 'var(--color-accent-muted)',
                                color: msg.role === 'user' ? 'var(--color-primary)' : 'var(--color-accent)'
                            }}>
                            {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-[var(--color-primary)] text-white rounded-tr-sm' : msg.isError ? 'bg-red-500/10 text-red-500 border border-red-500/20 rounded-tl-sm' : 'bg-white/5 text-[var(--color-text)] border border-[var(--color-border)] rounded-tl-sm'}`}>
                            {msg.isError && <AlertCircle className="w-4 h-4 inline-block mr-2 mb-0.5" />}
                            <div className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: msg.role === 'user' ? '#fff' : 'inherit' }}>
                                {msg.content}
                            </div>
                        </div>
                    </div>
                ))}
                
                {loading && (
                    <div className="flex gap-4">
                        <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
                            <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-white/5 border border-[var(--color-border)] rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-[var(--color-border)] bg-[#070C1C]/40">
                {messages.length === 1 && (
                    <div className="flex flex-wrap gap-2.5 mb-4">
                        {suggestedQuestions.map((q, i) => {
                            const IconComponent = q.icon;
                            return (
                                <button
                                    key={i}
                                    onClick={() => setInput(q.text)}
                                    className="flex items-center gap-2 text-xs px-4 py-2 rounded-xl border border-white/[0.06] bg-[#0D1226]/50 hover:bg-[#1E254B]/50 hover:border-white/[0.12] transition-all text-slate-300 font-medium cursor-pointer"
                                >
                                    <IconComponent className="w-3.5 h-3.5" style={{ color: q.color }} />
                                    <span>{q.text}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
                
                <form onSubmit={handleSend}>
                    <div className="relative flex items-center bg-[#050914] border border-[#1E293B] rounded-2xl p-1.5 focus-within:border-[#6366F1]/50 focus-within:ring-2 focus-within:ring-[#6366F1]/10 shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all duration-300">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about your finances..."
                            disabled={loading}
                            className="flex-1 bg-transparent border-none text-sm text-white placeholder-slate-500 focus:outline-none pl-3 pr-2 py-2 disabled:opacity-50"
                        />
                        
                        <div className="flex items-center">
                            <button
                                type="button"
                                className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] transition-colors border border-white/[0.05] mr-2 flex items-center justify-center cursor-pointer text-indigo-400"
                                onClick={() => setInput("Give me a summary of my financial health")}
                                title="AI Insights"
                            >
                                <Sparkles className="w-4 h-4 animate-pulse" />
                            </button>
                            
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="btn-primary py-2 px-5 text-sm flex items-center gap-2 cursor-pointer"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        <span>Send</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
                
                <p className="text-center text-[11px] text-slate-500 mt-3 font-medium">
                    AI insights are generated and may not always be accurate. Please verify important financial decisions.
                </p>
            </div>
        </div>
    );
};

export default AIAdvisorPage;
