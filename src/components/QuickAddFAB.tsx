import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Calendar, 
  Music, 
  DollarSign, 
  X, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown,
  Sparkles
} from 'lucide-react';
import { Artist, Gig, Song, BudgetItem, BudgetItemCategory, BudgetItemType } from '../types';

interface QuickAddFABProps {
  artists: Artist[];
  gigs: Gig[];
  onAddGig: (gig: Gig) => void;
  onAddSong: (song: Song) => void;
  onAddBudgetItem: (item: BudgetItem) => void;
  onNavigateToTab: (tabId: string) => void;
}

export default function QuickAddFAB({ 
  artists, 
  gigs, 
  onAddGig, 
  onAddSong, 
  onAddBudgetItem,
  onNavigateToTab
}: QuickAddFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'gig' | 'song' | 'budget' | null>(null);

  // Gig Form State
  const [gigTitle, setGigTitle] = useState('');
  const [gigArtistId, setGigArtistId] = useState(artists[0]?.id || '');
  const [gigVenue, setGigVenue] = useState('');
  const [gigAddress, setGigAddress] = useState('');
  const [gigDateTime, setGigDateTime] = useState('');
  const [gigDuration, setGigDuration] = useState('60');
  const [gigPrice, setGigPrice] = useState('15');
  const [gigUrl, setGigUrl] = useState('');
  const [gigDesc, setGigDesc] = useState('');

  // Song Form State
  const [songTitle, setSongTitle] = useState('');
  const [songArtistId, setSongArtistId] = useState(artists[0]?.id || '');
  const [songDurationMin, setSongDurationMin] = useState('3');
  const [songDurationSec, setSongDurationSec] = useState('30');
  const [songBpm, setSongBpm] = useState('120');
  const [songKey, setSongKey] = useState('A Minor');
  const [songIsOriginal, setSongIsOriginal] = useState(true);

  // Budget Form State
  const [budgetTitle, setBudgetTitle] = useState('');
  const [budgetGigId, setBudgetGigId] = useState(gigs[0]?.id || '');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetType, setBudgetType] = useState<BudgetItemType>('expense');
  const [budgetCategory, setBudgetCategory] = useState<BudgetItemCategory>('travel');

  const handleGigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gigTitle || !gigVenue || !gigDateTime) return;

    const newGig: Gig = {
      id: `gig-${Date.now()}`,
      title: gigTitle,
      artistId: gigArtistId,
      venueName: gigVenue,
      venueAddress: gigAddress,
      dateTime: gigDateTime,
      durationMinutes: Number(gigDuration) || 60,
      ticketPrice: Number(gigPrice) || 0,
      ticketUrl: gigUrl || undefined,
      description: gigDesc,
      status: 'confirmed',
      notes: '',
      promoChecklist: {
        pressRelease: false,
        socialPost: false,
        flyerDistributed: false,
        outreachCompleted: false,
        ticketsLive: false,
      }
    };

    onAddGig(newGig);
    setActiveModal(null);
    setIsOpen(false);
    onNavigateToTab('scheduler');

    // Reset Form
    setGigTitle('');
    setGigVenue('');
    setGigAddress('');
    setGigDateTime('');
    setGigDesc('');
  };

  const handleSongSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!songTitle) return;

    const totalSeconds = (Number(songDurationMin) * 60) + Number(songDurationSec);

    const newSong: Song = {
      id: `song-${Date.now()}`,
      title: songTitle,
      artistId: songArtistId,
      durationSec: totalSeconds || 210,
      bpm: Number(songBpm) || undefined,
      key: songKey || undefined,
      isOriginal: songIsOriginal,
      status: 'ready'
    };

    onAddSong(newSong);
    setActiveModal(null);
    setIsOpen(false);
    onNavigateToTab('setlist');

    // Reset Form
    setSongTitle('');
    setSongBpm('120');
    setSongKey('A Minor');
  };

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetTitle || !budgetAmount || !budgetGigId) return;

    const newItem: BudgetItem = {
      id: `b-${Date.now()}`,
      gigId: budgetGigId,
      title: budgetTitle,
      amount: Number(budgetAmount) || 0,
      type: budgetType,
      category: budgetCategory,
      date: new Date().toISOString().split('T')[0]
    };

    onAddBudgetItem(newItem);
    setActiveModal(null);
    setIsOpen(false);
    onNavigateToTab('budgets');

    // Reset Form
    setBudgetTitle('');
    setBudgetAmount('');
  };

  return (
    <>
      {/* Overlay backdrop when menu is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-950 z-40 backdrop-blur-xs"
          />
        )}
      </AnimatePresence>

      {/* Quick Add Floating Menu Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end" id="quick-add-container">
        
        {/* Floating Menu Action Options */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="mb-4 bg-slate-900/95 border border-slate-800/80 rounded-2xl p-3 shadow-2xl w-56 flex flex-col gap-1.5 backdrop-blur-md"
            >
              <div className="px-2.5 py-1.5 border-b border-slate-800/60 mb-1">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest font-mono">
                  Quick Actions
                </span>
              </div>

              {/* Action 1: Add Gig */}
              <button
                onClick={() => {
                  setGigArtistId(artists[0]?.id || '');
                  setActiveModal('gig');
                }}
                className="w-full flex items-center justify-between p-2.5 text-xs text-slate-200 hover:text-amber-400 hover:bg-slate-850 rounded-xl transition-all font-medium cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Calendar size={15} />
                  </div>
                  <span>Log New Gig</span>
                </div>
                <ChevronRight size={14} className="opacity-40" />
              </button>

              {/* Action 2: Add Song */}
              <button
                onClick={() => {
                  setSongArtistId(artists[0]?.id || '');
                  setActiveModal('song');
                }}
                className="w-full flex items-center justify-between p-2.5 text-xs text-slate-200 hover:text-amber-400 hover:bg-slate-850 rounded-xl transition-all font-medium cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Music size={15} />
                  </div>
                  <span>Add Song to Library</span>
                </div>
                <ChevronRight size={14} className="opacity-40" />
              </button>

              {/* Action 3: Add Budget Record */}
              <button
                disabled={gigs.length === 0}
                onClick={() => {
                  setBudgetGigId(gigs[0]?.id || '');
                  setActiveModal('budget');
                }}
                className="w-full flex items-center justify-between p-2.5 text-xs text-slate-200 hover:text-amber-400 hover:bg-slate-850 rounded-xl transition-all font-medium disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <DollarSign size={15} />
                  </div>
                  <span>Record Transaction</span>
                </div>
                <ChevronRight size={14} className="opacity-40" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Core Floating Action Button */}
        <motion.button
          id="quick-add-fab"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/15 cursor-pointer border border-amber-600/20 relative group overflow-hidden"
        >
          {/* Subtle rotation on opening */}
          <motion.div
            animate={{ rotate: isOpen ? 135 : 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <Plus size={24} strokeWidth={2.5} />
          </motion.div>
        </motion.button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* GIG CREATION MODAL */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {activeModal === 'gig' && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-[60] overflow-y-auto">
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 10 }}
              className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 shadow-2xl relative my-8"
            >
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2 mb-1">
                <Calendar className="text-amber-500" size={18} />
                <h3 className="text-base font-bold font-display text-slate-100">Log Scheduled Gig Event</h3>
              </div>
              <p className="text-xs text-slate-400 mb-5">
                Register a new calendar schedule. This auto-activates pricing trackers and prompt generators.
              </p>

              <form onSubmit={handleGigSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Gig Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Summer Brewfest, Electric Lounge Concert"
                      value={gigTitle}
                      onChange={(e) => setGigTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assigned Band *</label>
                    <select
                      value={gigArtistId}
                      onChange={(e) => setGigArtistId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                    >
                      {artists.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Venue Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Century Ballroom"
                      value={gigVenue}
                      onChange={(e) => setGigVenue(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Venue Address</label>
                    <input
                      type="text"
                      placeholder="e.g., 915 E Pine St, Seattle, WA"
                      value={gigAddress}
                      onChange={(e) => setGigAddress(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date & Start Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={gigDateTime}
                      onChange={(e) => setGigDateTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Duration (min)</label>
                      <input
                        type="number"
                        min="1"
                        value={gigDuration}
                        onChange={(e) => setGigDuration(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ticket Price ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={gigPrice}
                        onChange={(e) => setGigPrice(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ticket URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://gigs.com/tickets/101"
                      value={gigUrl}
                      onChange={(e) => setGigUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Short Description</label>
                    <textarea
                      placeholder="Add simple promotional notes, dress code parameters, or lineup schedules..."
                      value={gigDesc}
                      onChange={(e) => setGigDesc(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 resize-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-xs font-bold cursor-pointer transition-colors"
                  >
                    Confirm & Schedule
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------- */}
      {/* SONG CREATION MODAL */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {activeModal === 'song' && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-[60] overflow-y-auto">
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 10 }}
              className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl relative"
            >
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2 mb-1">
                <Music className="text-amber-500" size={18} />
                <h3 className="text-base font-bold font-display text-slate-100">Add New Song to Library</h3>
              </div>
              <p className="text-xs text-slate-400 mb-5">
                Populate your master song library to instantly map timelines in the setlist designer.
              </p>

              <form onSubmit={handleSongSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Song Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Midnight Horizon, Neon Shadows"
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Originating Artist *</label>
                  <select
                    value={songArtistId}
                    onChange={(e) => setSongArtistId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                  >
                    {artists.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Minutes</label>
                    <input
                      type="number"
                      min="0"
                      value={songDurationMin}
                      onChange={(e) => setSongDurationMin(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Seconds</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={songDurationSec}
                      onChange={(e) => setSongDurationSec(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">BPM (Tempo)</label>
                    <input
                      type="number"
                      placeholder="e.g., 120"
                      value={songBpm}
                      onChange={(e) => setSongBpm(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Key Signature</label>
                    <input
                      type="text"
                      placeholder="e.g., G Minor, C# Major"
                      value={songKey}
                      onChange={(e) => setSongKey(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 py-1.5 select-none">
                  <input
                    type="checkbox"
                    id="fab-song-original"
                    checked={songIsOriginal}
                    onChange={(e) => setSongIsOriginal(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-amber-500/20"
                  />
                  <label htmlFor="fab-song-original" className="text-xs text-slate-300 font-medium cursor-pointer">
                    This is an original song track
                  </label>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-xs font-bold cursor-pointer transition-colors"
                  >
                    Add Song Track
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------- */}
      {/* BUDGET TRANSACTION CREATION MODAL */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {activeModal === 'budget' && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-[60] overflow-y-auto">
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 10 }}
              className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl relative"
            >
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="text-amber-500" size={18} />
                <h3 className="text-base font-bold font-display text-slate-100">Record Financial Transaction</h3>
              </div>
              <p className="text-xs text-slate-400 mb-5">
                Log a revenue split or expenses immediately into your central budget sheets.
              </p>

              <form onSubmit={handleBudgetSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800/80 rounded-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setBudgetType('expense');
                      setBudgetCategory('travel');
                    }}
                    className={`py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      budgetType === 'expense' 
                        ? 'bg-red-500/10 border border-red-500/20 text-red-400' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <TrendingDown size={14} />
                    <span>Expense Outlay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBudgetType('income');
                      setBudgetCategory('guarantee');
                    }}
                    className={`py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      budgetType === 'income' 
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <TrendingUp size={14} />
                    <span>Income / Inward</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Linked Gig *</label>
                  <select
                    value={budgetGigId}
                    onChange={(e) => setBudgetGigId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                  >
                    {gigs.map(g => (
                      <option key={g.id} value={g.id}>{g.title} ({new Date(g.dateTime).toLocaleDateString([], { month: 'short', day: 'numeric' })})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Item Title / Description *</label>
                  <input
                    type="text"
                    required
                    placeholder={budgetType === 'expense' ? 'e.g., Premium fuel, Poster prints' : 'e.g., Merch sales, Cash tips'}
                    value={budgetTitle}
                    onChange={(e) => setBudgetTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Amount ($) *</label>
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      value={budgetAmount}
                      onChange={(e) => setBudgetAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                    <select
                      value={budgetCategory}
                      onChange={(e) => setBudgetCategory(e.target.value as BudgetItemCategory)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                    >
                      {budgetType === 'income' ? (
                        <>
                          <option value="guarantee">Gig Guarantee</option>
                          <option value="door_split">Door Split</option>
                          <option value="tips">Tips</option>
                          <option value="merch">Merchandise</option>
                          <option value="other">Other Inward</option>
                        </>
                      ) : (
                        <>
                          <option value="travel">Travel & Fuel</option>
                          <option value="food_drink">Food & Beverages</option>
                          <option value="commission">Agent Commission</option>
                          <option value="promo_ads">Ad & Print Promo</option>
                          <option value="gear_rental">Backline & Gear Rental</option>
                          <option value="other">Other Expenses</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-xs font-bold cursor-pointer transition-colors"
                  >
                    Record Item
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
