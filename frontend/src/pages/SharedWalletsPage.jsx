import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../lib/utils';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Plus, Users, UserPlus, Receipt, ArrowRight, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

const SharedWalletsPage = () => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState([]);
  const [selectedWalletId, setSelectedWalletId] = useState(null);
  const [walletDetails, setWalletDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Forms
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');

  const [showAddBillForm, setShowAddBillForm] = useState(false);
  const [newBillDesc, setNewBillDesc] = useState('');
  const [newBillAmount, setNewBillAmount] = useState('');

  useEffect(() => {
    fetchWallets();
  }, []);

  useEffect(() => {
    if (selectedWalletId) {
      fetchWalletDetails(selectedWalletId);
    } else {
      setWalletDetails(null);
    }
  }, [selectedWalletId]);

  const fetchWallets = async () => {
    try {
      const { data } = await api.get('/shared-wallets');
      setWallets(data.data);
      if (data.data.length > 0 && !selectedWalletId) {
        setSelectedWalletId(data.data[0]._id);
      }
    } catch (error) {
      toast.error('Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletDetails = async (id) => {
    try {
      const { data } = await api.get(`/shared-wallets/${id}`);
      setWalletDetails(data.data);
    } catch (error) {
      toast.error('Failed to load wallet details');
    }
  };

  const handleCreateWallet = async (e) => {
    e.preventDefault();
    if (!newWalletName) return;
    try {
      const { data } = await api.post('/shared-wallets', { name: newWalletName });
      toast.success('Wallet created!');
      setShowCreateForm(false);
      setNewWalletName('');
      fetchWallets();
      setSelectedWalletId(data.data._id);
    } catch (error) {
      toast.error('Failed to create wallet');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUserEmail) return;
    try {
      await api.post(`/shared-wallets/${selectedWalletId}/add-user`, { email: newUserEmail });
      toast.success('User added to wallet!');
      setShowAddUserForm(false);
      setNewUserEmail('');
      fetchWalletDetails(selectedWalletId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add user');
    }
  };

  const handleAddBill = async (e) => {
    e.preventDefault();
    if (!newBillDesc || !newBillAmount) return;
    try {
      await api.post(`/shared-wallets/${selectedWalletId}/bills`, {
        description: newBillDesc,
        amount: Number(newBillAmount)
      });
      toast.success('Bill added and split!');
      setShowAddBillForm(false);
      setNewBillDesc('');
      setNewBillAmount('');
      fetchWalletDetails(selectedWalletId);
    } catch (error) {
      toast.error('Failed to add bill');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-190px)] lg:overflow-hidden">
      <div className="w-full lg:w-72 flex flex-col gap-4 shrink-0">
        <div className="flex items-center justify-between shrink-0">
          <h2 className="text-2xl font-bold text-white">My Wallets</h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors shadow-[0_0_10px_rgba(255,255,255,0.05)] border border-white/5"
          >
            <Plus className="w-5 h-5 text-[var(--color-primary)]" />
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateWallet} className="p-4 rounded-2xl animate-slide-up shadow-[var(--shadow-lg)] relative overflow-hidden" style={{ background: 'var(--color-card-gradient)', border: '1px solid var(--color-border)' }}>
            <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-transparent to-[var(--color-surface)] pointer-events-none"></div>
            <input
              type="text"
              placeholder="Wallet Name (e.g. Roommates)"
              value={newWalletName}
              onChange={e => setNewWalletName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-4 relative z-10 focus:ring-2 focus:ring-[var(--color-primary)] placeholder-[var(--color-text-muted)]"
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white' }}
              autoFocus
            />
            <div className="flex gap-3 relative z-10">
              <button type="button" onClick={() => setShowCreateForm(false)} className="flex-1 btn-secondary text-xs">Cancel</button>
              <button type="submit" className="flex-1 btn-primary text-xs">Create</button>
            </div>
          </form>
        )}

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {wallets.length === 0 && !showCreateForm ? (
            <p className="text-sm text-center py-4 font-medium" style={{ color: 'var(--color-text-muted)' }}>No shared wallets yet.</p>
          ) : (
            wallets.map(wallet => (
              <button
                key={wallet._id}
                onClick={() => setSelectedWalletId(wallet._id)}
                className={`w-full flex items-center justify-between py-4 px-5 min-h-[76px] rounded-2xl transition-all duration-300 text-left relative overflow-hidden group hover:-translate-y-0.5`}
                style={{
                  background: selectedWalletId === wallet._id ? 'linear-gradient(90deg, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0.05) 100%)' : 'var(--color-card-gradient)',
                  border: selectedWalletId === wallet._id ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                  boxShadow: selectedWalletId === wallet._id ? '0 0 20px rgba(249,115,22,0.15)' : 'var(--shadow-sm)',
                }}
              >
                {selectedWalletId === wallet._id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-primary)] shadow-[0_0_10px_rgba(249,115,22,0.8)]"></div>}
                <div className="relative z-10">
                  <p className="font-bold text-base" style={{ color: selectedWalletId === wallet._id ? 'var(--color-primary)' : 'white' }}>{wallet.name}</p>
                  <p className="text-xs font-medium mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    {wallet.members ? wallet.members.length : 1} {wallet.members?.length === 1 ? 'member' : 'members'}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center relative z-10 transition-colors ${selectedWalletId === wallet._id ? 'bg-[var(--color-primary)]/10' : 'bg-white/5'}`}>
                  <Wallet className="w-5 h-5" style={{ color: selectedWalletId === wallet._id ? 'var(--color-primary)' : 'var(--color-text-muted)', filter: selectedWalletId === wallet._id ? 'drop-shadow(0 0 5px rgba(249,115,22,0.5))' : 'none' }} />
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {!walletDetails ? (
          <div className="flex-1 flex flex-col items-center justify-center rounded-2xl shadow-[var(--shadow-lg)] relative overflow-hidden" style={{ background: 'var(--color-card-gradient)', border: '1px solid var(--color-border)' }}>
            <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-transparent to-[var(--color-surface)] pointer-events-none"></div>
            <div className="w-24 h-24 rounded-full flex items-center justify-center bg-white/5 mb-6 relative z-10 border border-white/5 shadow-[0_0_30px_rgba(255,255,255,0.02)]">
              <Users className="w-10 h-10 opacity-40 text-white" />
            </div>
            <p className="text-lg font-bold text-white relative z-10 tracking-wide">Select a wallet to view details</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
            {/* Middle Column - Bills */}
            <div className="flex-1 flex flex-col rounded-2xl shadow-[var(--shadow-lg)] relative overflow-hidden" style={{ background: 'var(--color-card-gradient)', border: '1px solid var(--color-border)' }}>
              <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-transparent to-[var(--color-surface)] pointer-events-none"></div>
              
              <div className="p-6 border-b relative z-10 bg-black/20 shrink-0" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">{walletDetails.wallet.name} • <span style={{ color: 'var(--color-text-secondary)' }}>Expenses</span></h3>
                  <button
                    onClick={() => setShowAddBillForm(true)}
                    className="btn-primary py-2 px-4 text-xs sm:text-sm"
                  >
                    <Plus className="w-4 h-4" /> Add Bill
                  </button>
                </div>
              </div>

              {showAddBillForm && (
                <form onSubmit={handleAddBill} className="p-6 border-b relative z-10" style={{ borderColor: 'var(--color-border)', background: 'rgba(0,0,0,0.3)' }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                    <input type="text" placeholder="Description (e.g. Dinner)" value={newBillDesc} onChange={e => setNewBillDesc(e.target.value)} className="px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] placeholder-[var(--color-text-muted)]" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'white' }} required />
                    <input type="number" placeholder="Amount" value={newBillAmount} onChange={e => setNewBillAmount(e.target.value)} className="px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] placeholder-[var(--color-text-muted)]" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'white' }} required />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button type="button" onClick={() => setShowAddBillForm(false)} className="btn-secondary text-sm">Cancel</button>
                    <button type="submit" className="btn-primary text-sm">Split Equally</button>
                  </div>
                </form>
              )}

              <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10">
                {walletDetails.bills.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center bg-white/5 mx-auto mb-4 border border-white/5">
                      <Receipt className="w-8 h-8 opacity-40 text-white" />
                    </div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>No expenses yet. Add a bill to split it with the group!</p>
                  </div>
                ) : (
                  walletDetails.bills.map((bill, i) => (
                    <div key={bill._id} className="p-5 rounded-2xl flex items-center justify-between transition-all hover:bg-white/[0.04] group animate-slide-up" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', animationDelay: `${i * 30}ms` }}>
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-blue-500/30" style={{ background: 'linear-gradient(135deg, #102653, #3B82F6)' }}>
                          {bill.paidBy.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-base text-white">{bill.description}</p>
                          <p className="text-xs font-medium mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                            <span className="text-[var(--color-primary)] font-bold">{bill.paidBy.name}</span> paid {formatCurrency(bill.amount)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-white tracking-wide">{formatCurrency(bill.amount)}</p>
                        <p className="text-xs font-medium mt-1" style={{ color: 'var(--color-text-secondary)' }}>{formatDate(bill.date)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column - Settlements & Members */}
            <div className="w-full lg:w-80 flex flex-col gap-6">
              {/* Settlements */}
              <div className="rounded-2xl p-6 shadow-[var(--shadow-lg)] relative overflow-hidden" style={{ background: 'var(--color-card-gradient)', border: '1px solid var(--color-border)' }}>
                <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-transparent to-[var(--color-surface)] pointer-events-none"></div>
                <h3 className="text-lg font-bold text-white mb-5 relative z-10">Balances</h3>
                <div className="relative z-10">
                  {walletDetails.settlements.length === 0 ? (
                    <div className="py-6 text-center rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-sm font-bold text-[var(--color-success)] tracking-wide">All settled up! 🎉</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {walletDetails.settlements.map((s, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm p-3 rounded-xl bg-black/20 border border-white/5">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-[var(--color-danger)] filter drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">{s.from.name.split(' ')[0]}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                            <span className="font-bold text-[var(--color-success)] filter drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">{s.to.name.split(' ')[0]}</span>
                          </div>
                          <span className="font-bold text-white tracking-wide">{formatCurrency(s.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Members */}
              <div className="rounded-2xl p-6 flex-1 flex flex-col shadow-[var(--shadow-lg)] relative overflow-hidden" style={{ background: 'var(--color-card-gradient)', border: '1px solid var(--color-border)' }}>
                <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-transparent to-[var(--color-surface)] pointer-events-none"></div>
                <div className="flex items-center justify-between mb-6 relative z-10 shrink-0">
                  <h3 className="text-lg font-bold text-white">Members</h3>
                  <button onClick={() => setShowAddUserForm(!showAddUserForm)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 shadow-[0_0_10px_rgba(255,255,255,0.05)]">
                    <UserPlus className="w-4 h-4 text-[var(--color-primary)]" />
                  </button>
                </div>

                {showAddUserForm && (
                  <form onSubmit={handleAddUser} className="mb-5 flex gap-2 relative z-10 animate-slide-up p-3 rounded-2xl bg-black/20 border border-white/5">
                    <input type="email" placeholder="Email address" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="flex-1 px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] placeholder-[var(--color-text-muted)]" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', color: 'white' }} required />
                    <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-500 hover:scale-[1.02] shadow-[0_0_10px_rgba(59,130,246,0.2)]">Add</button>
                  </form>
                )}

                <div className="space-y-4 relative z-10 overflow-y-auto flex-1 pr-1">
                  {walletDetails.wallet.members.map(m => (
                    <div key={m._id} className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5 transition-colors hover:bg-white/[0.04]">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-[0_0_15px_rgba(251,146,60,0.3)] border border-orange-500/30" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}>
                        {m.name.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-white tracking-wide">{m.name} {m._id === user?._id && <span className="text-[var(--color-text-muted)] font-medium ml-1">(You)</span>}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedWalletsPage;
