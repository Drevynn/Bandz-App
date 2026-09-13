import React, { useState } from 'react';
import { BudgetItem, Gig, BudgetItemCategory, BudgetItemType } from '../types';
import { DollarSign, Plus, Trash2, ArrowUpRight, ArrowDownRight, TrendingUp, Filter, AlertCircle, Briefcase, Calendar, PieChart, Users, Copy, Check, Sparkles, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface BudgetTabProps {
  budgets: BudgetItem[];
  gigs: Gig[];
  selectedArtistId: string;
  onAddBudgetItem: (item: BudgetItem) => void;
  onDeleteBudgetItem: (itemId: string) => void;
}

interface SplitMember {
  id: string;
  name: string;
  role: string;
  percentage: number;
}

export default function BudgetTab({
  budgets,
  gigs,
  selectedArtistId,
  onAddBudgetItem,
  onDeleteBudgetItem
}: BudgetTabProps) {
  const [selectedGigFilter, setSelectedGigFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSplitSheet, setShowSplitSheet] = useState(false);
  const [copiedSplitText, setCopiedSplitText] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formType, setFormType] = useState<BudgetItemType>('income');
  const [formCategory, setFormCategory] = useState<BudgetItemCategory>('guarantee');
  const [formGigId, setFormGigId] = useState<string>(gigs[0]?.id || '');

  // Filter Gigs relative to current artist
  const availableGigs = gigs.filter(g => selectedArtistId === 'all' || g.artistId === selectedArtistId);

  // Filter budget items
  const filteredBudgets = budgets.filter((b) => {
    // 1. Must match current artist's gigs
    const gig = gigs.find(g => g.id === b.gigId);
    if (!gig) return false;
    const matchesArtist = selectedArtistId === 'all' || gig.artistId === selectedArtistId;
    if (!matchesArtist) return false;

    // 2. Must match selected gig filter
    if (selectedGigFilter !== 'all' && b.gigId !== selectedGigFilter) return false;

    return true;
  });

  // Calculations
  const incomeItems = filteredBudgets.filter(b => b.type === 'income');
  const expenseItems = filteredBudgets.filter(b => b.type === 'expense');
  
  const totalIncome = incomeItems.reduce((acc, b) => acc + b.amount, 0);
  const totalExpense = expenseItems.reduce((acc, b) => acc + b.amount, 0);
  const netEarnings = totalIncome - totalExpense;

  // Split Sheet State
  const [splitGrossPool, setSplitGrossPool] = useState<number>(() => {
    return totalIncome > 0 ? totalIncome : 1200;
  });
  const [bandFundPercentage, setBandFundPercentage] = useState<number>(10);
  const [splitMembers, setSplitMembers] = useState<SplitMember[]>([
    { id: '1', name: 'Alex Rivera', role: 'Lead Vocalist / Guitar', percentage: 25 },
    { id: '2', name: 'Marcus Vance', role: 'Lead Guitarist', percentage: 25 },
    { id: '3', name: 'Chloe Chen', role: 'Bassist / Backing Vocals', percentage: 20 },
    { id: '4', name: 'Dave Brooks', role: 'Drums & Tech', percentage: 20 },
  ]);

  const categoryLabels: Record<BudgetItemCategory, string> = {
    guarantee: 'Gig Guarantee',
    door_split: 'Door Split / Ticket %',
    tips: 'Tips Jar',
    merch: 'Merchandise Sales',
    travel: 'Travel & Gasoline',
    food_drink: 'Food & Refreshments',
    commission: 'Agency / Sound Fees',
    promo_ads: 'Manager Promo Ads',
    gear_rental: 'Gear Rental',
    other: 'Other / Miscellaneous'
  };

  // Chart Data
  const chartData = (Object.keys(categoryLabels) as BudgetItemCategory[]).map(cat => {
    const items = filteredBudgets.filter(b => b.category === cat);
    return {
      name: categoryLabels[cat],
      income: items.filter(b => b.type === 'income').reduce((acc, b) => acc + b.amount, 0),
      expense: items.filter(b => b.type === 'expense').reduce((acc, b) => acc + b.amount, 0),
    };
  }).filter(d => d.income > 0 || d.expense > 0);

  // Average revenue per gig calculations
  const distinctGigIdsWithFinance = Array.from(new Set(filteredBudgets.map(b => b.gigId)));
  const avgProfitPerGig = distinctGigIdsWithFinance.length > 0 
    ? Math.round(netEarnings / distinctGigIdsWithFinance.length)
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formAmount || !formGigId) return;

    const newBudgetItem: BudgetItem = {
      id: `b-${Date.now()}`,
      gigId: formGigId,
      title: formTitle,
      amount: parseFloat(formAmount) || 0,
      type: formType,
      category: formCategory,
      date: new Date().toISOString().split('T')[0] // today's date
    };

    onAddBudgetItem(newBudgetItem);
    setFormTitle('');
    setFormAmount('');
    setShowAddForm(false);
  };

  // Split sheet calculation helpers
  const bandFundAmount = (splitGrossPool * (bandFundPercentage / 100));
  const distributablePool = splitGrossPool - bandFundAmount;
  const totalMemberPercentage = splitMembers.reduce((acc, m) => acc + m.percentage, 0);

  const handleUpdateMemberPercentage = (id: string, newPct: number) => {
    setSplitMembers(prev => prev.map(m => m.id === id ? { ...m, percentage: Math.max(0, Math.min(100, newPct)) } : m));
  };

  const handleCopySplitSheet = () => {
    const lines = [
      `🎸 BANDZ SPLIT SHEET PAYOUT SUMMARY`,
      `=======================================`,
      `Total Net Revenue Pool: $${splitGrossPool.toFixed(2)}`,
      `Band Equipment / Emergency Fund (${bandFundPercentage}%): $${bandFundAmount.toFixed(2)}`,
      `Distributable Member Pool: $${distributablePool.toFixed(2)}`,
      `---------------------------------------`,
      ...splitMembers.map(m => {
        const memberCut = (distributablePool * (m.percentage / 100)).toFixed(2);
        return `• ${m.name} (${m.role}) [${m.percentage}%]: $${memberCut}`;
      }),
      `=======================================`,
      `Generated by Bandz OS (${new Date().toLocaleDateString()})`
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedSplitText(true);
    setTimeout(() => setCopiedSplitText(false), 2500);
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="budget-tab-root">
      {/* Budget Top Header Banner with Corresponding Image */}
      <div className="lg:col-span-12 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-purple-500/20 p-6 rounded-2xl shadow-xl">
        <div className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none" style={{ backgroundImage: "url('/src/assets/images/vip_ticket_1783213501263.jpg')" }} />
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
              FINANCIAL DISPATCH & SPLITS
            </span>
            <span className="text-xs text-slate-400">{filteredBudgets.length} Ledger Items</span>
          </div>
          <h2 className="text-xl font-bold font-display text-slate-100 flex items-center gap-2.5">
            <DollarSign className="text-amber-400" size={24} />
            Tour Ledger & Split Accounting
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Track concert payouts, merchandise receipts, fuel, lodging, and automate band member cut percentages with instant split sheets.
          </p>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-4 gap-6">
        {/* Total revenue */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex justify-between items-center">
          <div>
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Total Earnings</span>
            <span className="text-2xl font-bold text-slate-100 block mt-2">${totalIncome.toLocaleString()}</span>
          </div>
          <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <ArrowUpRight size={22} />
          </div>
        </div>

        {/* Total expenses */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex justify-between items-center">
          <div>
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Total Outlays</span>
            <span className="text-2xl font-bold text-slate-100 block mt-2">${totalExpense.toLocaleString()}</span>
          </div>
          <div className="p-3.5 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
            <ArrowDownRight size={22} />
          </div>
        </div>

        {/* Net earnings */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex justify-between items-center">
          <div>
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Net Revenue</span>
            <span className={`text-2xl font-bold block mt-2 ${netEarnings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {netEarnings < 0 ? '-' : ''}${Math.abs(netEarnings).toLocaleString()}
            </span>
          </div>
          <div className={`p-3.5 rounded-xl border ${
            netEarnings >= 0
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            <TrendingUp size={22} />
          </div>
        </div>

        {/* Average revenue per gig */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex justify-between items-center">
          <div>
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Avg. Profit per Gig</span>
            <span className={`text-2xl font-bold block mt-2 ${avgProfitPerGig >= 0 ? 'text-slate-200' : 'text-red-400'}`}>
              {avgProfitPerGig < 0 ? '-' : ''}${Math.abs(avgProfitPerGig).toLocaleString()}
            </span>
          </div>
          <div className="p-3.5 bg-slate-950 text-slate-400 rounded-xl border border-slate-800">
            <Briefcase size={22} />
          </div>
        </div>
      </div>

      {/* Income vs Expenses Chart */}
      {chartData.length > 0 && (
        <div className="lg:col-span-12 bg-slate-900/40 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-200 mb-6">Income vs. Expenses by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="income" name="Income" fill="#10b981" />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Side Control panel */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        {/* Filters */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3 text-slate-300">
            <Filter size={18} className="text-amber-500" />
            <span className="text-sm font-semibold">Scope Financials:</span>
          </div>
          {availableGigs.length === 0 ? (
            <p className="text-xs text-slate-500">No scheduled gigs to filter by.</p>
          ) : (
            <select
              value={selectedGigFilter}
              onChange={(e) => setSelectedGigFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
            >
              <option value="all">All Scheduled Gigs (Consolidated)</option>
              {availableGigs.map(g => (
                <option key={g.id} value={g.id}>{g.title} ({g.venueName})</option>
              ))}
            </select>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                if (availableGigs.length === 0) {
                  alert('Please schedule an upcoming gig first to log budget transactions.');
                  return;
                }
                setShowAddForm(!showAddForm);
              }}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/15"
            >
              <Plus size={15} />
              <span>Log Transaction</span>
            </button>

            <button
              onClick={() => setShowSplitSheet(!showSplitSheet)}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-purple-600/20 border border-purple-400/30"
            >
              <PieChart size={15} />
              <span>Split Sheet Calculator</span>
            </button>
          </div>
        </div>

        {/* Interactive Split Sheet Calculator Card */}
        <AnimatePresence>
          {showSplitSheet && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-purple-950/30 border border-purple-500/30 rounded-xl p-5 space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
                    <PieChart size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      Band Split Sheet Payouts
                      <span className="text-[9px] font-mono bg-purple-500/30 text-purple-200 px-1.5 py-0.5 rounded">PRO-TIP</span>
                    </h4>
                    <p className="text-[10px] text-slate-400">Calculate net member take-home from guarantees & merch</p>
                  </div>
                </div>

                <button
                  onClick={handleCopySplitSheet}
                  className="px-2.5 py-1 rounded bg-purple-600/80 hover:bg-purple-600 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all shrink-0"
                >
                  {copiedSplitText ? <Check size={11} className="text-emerald-300" /> : <Copy size={11} />}
                  <span>{copiedSplitText ? 'Copied!' : 'Copy Summary'}</span>
                </button>
              </div>

              {/* Pool settings */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950/70 p-3 rounded-xl border border-purple-500/20 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Gross Pool Amount ($)</label>
                  <input
                    type="number"
                    value={splitGrossPool}
                    onChange={(e) => setSplitGrossPool(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Band Reserve Fund ({bandFundPercentage}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="5"
                    value={bandFundPercentage}
                    onChange={(e) => setBandFundPercentage(parseInt(e.target.value, 10))}
                    className="w-full accent-purple-500 cursor-pointer mt-1"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>Reserve: ${bandFundAmount.toFixed(0)}</span>
                    <span>Pool: ${distributablePool.toFixed(0)}</span>
                  </div>
                </div>
              </div>

              {/* Members percentage distribution */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                  <span>MEMBER SHARES ({totalMemberPercentage}%)</span>
                  {totalMemberPercentage !== 100 && (
                    <span className="text-amber-400">Must equal 100% (currently {totalMemberPercentage}%)</span>
                  )}
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {splitMembers.map((member) => {
                    const memberTakeHome = (distributablePool * (member.percentage / 100)).toFixed(2);
                    return (
                      <div key={member.id} className="bg-slate-950/50 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between gap-2 text-xs">
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-200 truncate">{member.name}</div>
                          <div className="text-[10px] text-slate-500 truncate">{member.role}</div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={member.percentage}
                              onChange={(e) => handleUpdateMemberPercentage(member.id, parseFloat(e.target.value) || 0)}
                              className="w-12 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-center text-xs font-mono font-bold text-purple-300 focus:outline-none"
                            />
                            <span className="text-[10px] text-slate-400">%</span>
                          </div>
                          <span className="font-mono font-bold text-emerald-400 w-16 text-right">${memberTakeHome}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Transaction Collapsible Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 overflow-hidden"
            >
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Log New Transaction</h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Select Gig Association</label>
                  <select
                    value={formGigId}
                    onChange={(e) => setFormGigId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    {availableGigs.map(g => (
                      <option key={g.id} value={g.id}>{g.title} ({g.venueName})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Transaction Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Merch sales cash, sound tech split..."
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Type</label>
                    <div className="flex bg-slate-950 p-1 rounded border border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setFormType('income');
                          setFormCategory('guarantee');
                        }}
                        className={`flex-1 text-center py-1 rounded text-[10px] font-bold ${
                          formType === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'
                        }`}
                      >
                        Income
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormType('expense');
                          setFormCategory('travel');
                        }}
                        className={`flex-1 text-center py-1 rounded text-[10px] font-bold ${
                          formType === 'expense' ? 'bg-red-500/20 text-red-400' : 'text-slate-400'
                        }`}
                      >
                        Expense
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Amount ($)</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      placeholder="e.g., 250"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Classification Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as BudgetItemCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    {formType === 'income' ? (
                      <>
                        <option value="guarantee">Gig Guarantee Fee</option>
                        <option value="door_split">Door Ticket % Split</option>
                        <option value="tips">Tips Jar Contributions</option>
                        <option value="merch">Band Merch Sales</option>
                      </>
                    ) : (
                      <>
                        <option value="travel">Travel, Gasoline & Parking</option>
                        <option value="food_drink">Band Catering & Meals</option>
                        <option value="commission">Commission & Booking/Sound Fees</option>
                        <option value="promo_ads">Promotional Flyers & Paid Ads</option>
                        <option value="gear_rental">Backline & Gear Rentals</option>
                        <option value="other">Other Incidentals</option>
                      </>
                    )}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-1.5 rounded text-xs cursor-pointer"
                >
                  Save Ledger Line
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Budget Ledger Transactions Table list */}
      <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col min-h-[300px]">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-4">
          <Calendar size={15} className="text-amber-500" />
          <span>Financial Ledger Ledger</span>
        </h3>

        <div className="flex-1 overflow-x-auto">
          {filteredBudgets.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2 py-12">
              <AlertCircle size={28} className="text-slate-700" />
              <p className="text-xs">No transaction logs recorded.</p>
              <p className="text-[10px] text-slate-600">Select another gig scope or log your first income/expense transaction to generate accounting records.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[10px] uppercase font-bold text-slate-500 bg-slate-950 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-2.5 rounded-l">Label</th>
                  <th className="px-4 py-2.5">Category</th>
                  <th className="px-4 py-2.5">Associated Gig</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                  <th className="px-4 py-2.5 rounded-r text-center w-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredBudgets.map((item) => {
                  const associatedGig = gigs.find(g => g.id === item.gigId);
                  const isIncome = item.type === 'income';

                  return (
                    <tr key={item.id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-200">
                        {item.title}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {categoryLabels[item.category] || item.category}
                      </td>
                      <td className="px-4 py-3 text-slate-500 max-w-[150px] truncate" title={associatedGig?.title}>
                        {associatedGig?.title || 'Unknown Gig'}
                      </td>
                      <td className={`px-4 py-3 text-right font-bold font-mono ${isIncome ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isIncome ? '+' : '-'}${item.amount.toLocaleString([], { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => onDeleteBudgetItem(item.id)}
                          title="Delete Item"
                          className="p-1 hover:bg-red-500/10 hover:text-red-400 text-slate-600 rounded cursor-pointer transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
