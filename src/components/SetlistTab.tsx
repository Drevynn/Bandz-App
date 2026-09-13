import React, { useState } from 'react';
import { Song, Gig, Setlist, SetlistSong } from '../types';
import { Music, Plus, Trash2, ArrowUp, ArrowDown, ChevronRight, CheckCircle2, AlertTriangle, Sparkles, Loader2, Play, Circle, Disc, Sliders, ListPlus, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SetlistDurationChart from './SetlistDurationChart';

interface SetlistTabProps {
  songs: Song[];
  gigs: Gig[];
  setlists: Setlist[];
  selectedArtistId: string;
  onAddSong: (song: Song) => void;
  onDeleteSong: (songId: string) => void;
  onUpdateSetlist: (setlist: Setlist) => void;
}

export default function SetlistTab({
  songs,
  gigs,
  setlists,
  selectedArtistId,
  onAddSong,
  onDeleteSong,
  onUpdateSetlist
}: SetlistTabProps) {
  const [selectedGigId, setSelectedGigId] = useState<string>(gigs[0]?.id || '');
  const [songFormOpen, setSongFormOpen] = useState(false);

  // New Song Form State
  const [songTitle, setSongTitle] = useState('');
  const [songDuration, setSongDuration] = useState('210'); // in seconds
  const [songBpm, setSongBpm] = useState('120');
  const [songKey, setSongKey] = useState('A Minor');
  const [songIsOriginal, setSongIsOriginal] = useState(true);

  // AI Analyzer State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState('');
  const [aiError, setAiError] = useState('');

  // Filtering songs for active band
  const availableSongs = songs.filter(s => selectedArtistId === 'all' || s.artistId === selectedArtistId);
  const availableGigs = gigs.filter(g => selectedArtistId === 'all' || g.artistId === selectedArtistId);

  // Get active setlist
  const activeGig = availableGigs.find(g => g.id === selectedGigId) || availableGigs[0];
  const activeSetlist = setlists.find(s => s.gigId === activeGig?.id) || { id: `set-${Date.now()}`, gigId: activeGig?.id || '', songs: [] };

  // Calculate setlist properties
  const setlistSongsMapped = activeSetlist.songs
    .map(ss => {
      const s = songs.find(song => song.id === ss.songId);
      return s ? { ...s, order: ss.order } : null;
    })
    .filter((s): s is (Song & { order: number }) => s !== null)
    .sort((a, b) => a.order - b.order);

  const totalPlayingSec = setlistSongsMapped.reduce((acc, s) => acc + s.durationSec, 0);
  const totalPlayingMin = Math.floor(totalPlayingSec / 60);
  const totalPlayingRemainingSec = totalPlayingSec % 60;

  const targetDurationMin = activeGig?.durationMinutes || 60;
  const timeUsagePct = Math.min(Math.round((totalPlayingSec / (targetDurationMin * 60)) * 100), 100);
  const isOvertime = totalPlayingSec > (targetDurationMin * 60);

  // Reorder Setlist
  const handleMoveSong = (index: number, direction: 'up' | 'down') => {
    const updatedSongs = [...activeSetlist.songs];
    if (direction === 'up' && index > 0) {
      const temp = updatedSongs[index];
      updatedSongs[index] = updatedSongs[index - 1];
      updatedSongs[index - 1] = temp;
    } else if (direction === 'down' && index < updatedSongs.length - 1) {
      const temp = updatedSongs[index];
      updatedSongs[index] = updatedSongs[index + 1];
      updatedSongs[index + 1] = temp;
    }

    // Re-index orders
    const newlyOrdered = updatedSongs.map((s, idx) => ({ ...s, order: idx + 1 }));
    onUpdateSetlist({ ...activeSetlist, songs: newlyOrdered });
  };

  const handleRemoveFromSetlist = (songId: string) => {
    const updatedSongs = activeSetlist.songs.filter(s => s.songId !== songId);
    const newlyOrdered = updatedSongs.map((s, idx) => ({ ...s, order: idx + 1 }));
    onUpdateSetlist({ ...activeSetlist, songs: newlyOrdered });
    setAiFeedback(''); // Reset old analysis
  };

  const handleAddToSetlist = (songId: string) => {
    if (activeSetlist.songs.some(s => s.songId === songId)) return; // Avoid duplicates

    const nextOrder = activeSetlist.songs.length + 1;
    const updatedSongs = [...activeSetlist.songs, { songId, order: nextOrder }];
    onUpdateSetlist({ ...activeSetlist, songs: updatedSongs });
    setAiFeedback(''); // Reset old analysis
  };

  const handleCreateSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!songTitle) return;

    const artistId = selectedArtistId === 'all' ? (gigs[0]?.artistId || 'artist-1') : selectedArtistId;

    const newSong: Song = {
      id: `song-${Date.now()}`,
      title: songTitle,
      artistId,
      durationSec: parseInt(songDuration) || 180,
      bpm: parseInt(songBpm) || 120,
      key: songKey,
      isOriginal: songIsOriginal,
      status: 'ready'
    };

    onAddSong(newSong);
    setSongTitle('');
    setSongDuration('210');
    setSongBpm('120');
    setSongKey('A Minor');
    setSongIsOriginal(true);
    setSongFormOpen(false);
  };

  // AI Pacing Optimization Call
  const handleAnalyzePacing = async () => {
    if (setlistSongsMapped.length === 0) {
      setAiError('Please add songs to your setlist first to run pacing optimization.');
      return;
    }

    setAiLoading(true);
    setAiError('');
    setAiFeedback('');

    try {
      const res = await fetch('/api/optimize-setlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songs: setlistSongsMapped,
          gigTitle: activeGig?.title,
          durationMinutes: targetDurationMin
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Setlist optimization error');
      setAiFeedback(data.content);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Error executing AI setlist audit. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="setlist-tab-root">
      {/* Gig Selector & Current Setlist Editor */}
      <div className="xl:col-span-7 space-y-4">
        {/* Gig Picker Header */}
        <div className="relative overflow-hidden bg-slate-900/80 backdrop-blur-md border border-purple-500/20 rounded-xl p-5 flex flex-col sm:flex-row gap-5 justify-between items-center shadow-xl">
          <div className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none" style={{ backgroundImage: "url('/src/assets/images/gold_pick_1783213481183.jpg')" }} />
          <div className="relative z-10 flex items-center gap-4 w-full sm:w-auto">
            <Sliders size={22} className="text-amber-500 shrink-0" />
            <span className="text-sm font-semibold text-slate-300">Active Gig:</span>
            {availableGigs.length === 0 ? (
              <span className="text-xs text-slate-500">No gigs scheduled yet</span>
            ) : (
              <select
                value={selectedGigId}
                onChange={(e) => {
                  setSelectedGigId(e.target.value);
                  setAiFeedback('');
                  setAiError('');
                }}
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 flex-1 sm:flex-initial"
              >
                {availableGigs.map(g => (
                  <option key={g.id} value={g.id}>{g.title} ({g.venueName})</option>
                ))}
              </select>
            )}
          </div>

          {activeGig && (
            <div className="relative z-10 text-sm text-slate-300 font-medium">
              Target length: <span className="text-amber-400 font-bold font-mono">{targetDurationMin} mins</span>
            </div>
          )}
        </div>

        {/* Current Setlist Organizer */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-200 flex items-center gap-3">
                <Music size={20} className="text-amber-500" />
                <span>Gig Setlist Flow ({setlistSongsMapped.length} tracks)</span>
              </h3>
              <p className="text-slate-500 text-xs mt-1">Order of scheduled tracks. Maintain pacing and key transitions.</p>
            </div>

            <button
              onClick={handleAnalyzePacing}
              disabled={aiLoading || setlistSongsMapped.length === 0}
              className="bg-slate-950 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500/20 disabled:opacity-50 disabled:pointer-events-none text-amber-500 text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
            >
              {aiLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} className="fill-amber-500/10" />
                  <span>Audit with the Manager</span>
                </>
              )}
            </button>
          </div>

          {/* Timing indicators */}
          {activeGig && (
            <SetlistDurationChart songs={setlistSongsMapped} targetDurationMin={targetDurationMin} />
          )}

          {/* Interactive Setlist Items */}
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {setlistSongsMapped.length === 0 ? (
              <div className="p-8 border border-slate-800/80 border-dashed rounded-xl text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                <ListPlus size={28} className="text-slate-700" />
                <p className="text-xs">Your setlist is currently empty.</p>
                <p className="text-[10px] text-slate-600 max-w-xs">Add tracks from your Song Library on the right sidebar to start constructing your set performance flow.</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {setlistSongsMapped.map((song, index) => (
                  <motion.div
                    key={song.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="bg-slate-950/60 hover:bg-slate-950 border border-slate-800 p-3 rounded-lg flex items-center justify-between gap-3 group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-slate-500 w-5">
                        {index + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-200">{song.title}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${song.isOriginal ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                            {song.isOriginal ? 'Original' : 'Cover'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-slate-500">
                          <span>{Math.floor(song.durationSec / 60)}m {song.durationSec % 60}s</span>
                          <span>•</span>
                          <span>{song.bpm ? `${song.bpm} BPM` : 'No BPM'}</span>
                          <span>•</span>
                          <span className="text-slate-400 font-bold">{song.key || 'N/A Key'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      {/* Movement buttons */}
                      <button
                        onClick={() => handleMoveSong(index, 'up')}
                        disabled={index === 0}
                        className="p-1 hover:bg-slate-800 text-slate-400 disabled:opacity-20 rounded cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => handleMoveSong(index, 'down')}
                        disabled={index === setlistSongsMapped.length - 1}
                        className="p-1 hover:bg-slate-800 text-slate-400 disabled:opacity-20 rounded cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown size={14} />
                      </button>
                      {/* Remove button */}
                      <button
                        onClick={() => handleRemoveFromSetlist(song.id)}
                        className="p-1 hover:bg-red-500/10 hover:text-red-400 text-slate-500 rounded cursor-pointer ml-1"
                        title="Remove track"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Manager's Advisory Panel */}
        <AnimatePresence>
          {(aiLoading || aiFeedback || aiError) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-slate-900/60 border border-slate-800 rounded-xl p-5"
            >
              <h4 className="text-xs font-bold text-amber-500 flex items-center gap-1.5 uppercase tracking-wider mb-3">
                <Sparkles size={14} className="fill-amber-500/10" />
                <span>Manager's Setlist Flow Analysis</span>
              </h4>

              {aiLoading ? (
                <div className="py-8 flex flex-col items-center justify-center gap-3 text-slate-500">
                  <Loader2 size={24} className="animate-spin text-amber-500" />
                  <p className="text-xs">Analyzing pacing curves, BPM shifts, and song-to-song key transitions...</p>
                </div>
              ) : aiError ? (
                <p className="text-xs text-red-400">{aiError}</p>
              ) : (
                <div className="text-xs text-slate-300 leading-relaxed space-y-2 whitespace-pre-wrap font-sans bg-slate-950 p-4 rounded-lg border border-slate-800/60">
                  {aiFeedback}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Song Library & Add Songs Section */}
      <div className="xl:col-span-5 space-y-4">
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Disc size={15} className="text-amber-500" />
                <span>Song Library ({availableSongs.length} items)</span>
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">Master catalog of songs ready for setlist allocation.</p>
            </div>

            <button
              onClick={() => setSongFormOpen(!songFormOpen)}
              className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs flex items-center gap-1 cursor-pointer font-semibold transition-all"
            >
              <Plus size={14} />
              <span>{songFormOpen ? 'Cancel' : 'New Song'}</span>
            </button>
          </div>

          {/* New Song Collapsible Input Form */}
          <AnimatePresence>
            {songFormOpen && (
              <motion.form
                onSubmit={handleCreateSong}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3.5"
              >
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Song Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Midnight Whispers"
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Duration (seconds)</label>
                    <input
                      type="number"
                      placeholder="e.g., 210"
                      value={songDuration}
                      onChange={(e) => setSongDuration(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">BPM (Tempo)</label>
                    <input
                      type="number"
                      placeholder="e.g., 120"
                      value={songBpm}
                      onChange={(e) => setSongBpm(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Key signature</label>
                    <input
                      type="text"
                      placeholder="e.g., E Minor, G Major"
                      value={songKey}
                      onChange={(e) => setSongKey(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={songIsOriginal}
                        onChange={(e) => setSongIsOriginal(e.target.checked)}
                        className="rounded border-slate-800 bg-slate-900 text-amber-500 focus:ring-amber-500/20"
                      />
                      <span className="text-[11px] font-medium text-slate-300">Original Song</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-1.5 rounded text-xs cursor-pointer"
                >
                  Add to Master Library
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Master Song Catalog Listing */}
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {availableSongs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No songs registered for this band.</p>
            ) : (
              availableSongs.map((song) => {
                const isSelectedInSet = activeSetlist.songs.some(s => s.songId === song.id);
                return (
                  <div
                    key={song.id}
                    className="bg-slate-950/40 hover:bg-slate-950/80 border border-slate-850 p-2.5 rounded-lg flex items-center justify-between gap-2.5 group transition-all"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200 truncate">{song.title}</span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${song.isOriginal ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                          {song.isOriginal ? 'Orig' : 'Cov'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 font-mono text-[9px] text-slate-500">
                        <span>{Math.floor(song.durationSec / 60)}m {song.durationSec % 60}s</span>
                        <span>•</span>
                        <span>{song.bpm ? `${song.bpm} BPM` : 'No BPM'}</span>
                        <span>•</span>
                        <span className="text-slate-400">{song.key || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isSelectedInSet ? (
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-1 rounded border border-emerald-500/20">
                          Added
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddToSetlist(song.id)}
                          className="p-1 bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-slate-400 border border-slate-800 hover:border-amber-500 rounded text-[10px] font-bold px-2 py-1 flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Plus size={10} />
                          <span>Add</span>
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteSong(song.id)}
                        title="Delete Song from Library"
                        className="p-1 text-slate-600 hover:text-red-400 rounded cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
