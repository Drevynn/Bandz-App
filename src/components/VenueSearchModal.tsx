import React, { useState, useEffect } from 'react';
import { VenueSearchData, GroundingSource } from '../types';
import {
  Search,
  Sparkles,
  MapPin,
  Users,
  Mail,
  Phone,
  Globe,
  Sliders,
  Volume2,
  Music,
  Clock,
  ShieldAlert,
  ShoppingBag,
  ExternalLink,
  Check,
  Copy,
  ArrowRight,
  AlertCircle,
  X,
  RefreshCw,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VenueSearchModalProps {
  initialVenueName?: string;
  initialLocationContext?: string;
  isOpen: boolean;
  onClose: () => void;
  onApplyVenueData: (data: {
    venueName?: string;
    address?: string;
    notesToAppend?: string;
    fullVenueData?: VenueSearchData;
  }) => void;
}

export default function VenueSearchModal({
  initialVenueName = '',
  initialLocationContext = 'Seattle, WA',
  isOpen,
  onClose,
  onApplyVenueData,
}: VenueSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState(initialVenueName);
  const [locationContext, setLocationContext] = useState(initialLocationContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [venueResult, setVenueResult] = useState<VenueSearchData | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm(initialVenueName);
      setError(null);
      setAppliedSuccess(false);
      if (initialVenueName.trim().length > 1 && !venueResult) {
        performSearch(initialVenueName, initialLocationContext);
      }
    }
  }, [isOpen, initialVenueName]);

  const performSearch = async (query: string, location: string) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setAppliedSuccess(false);

    try {
      const response = await fetch('/api/venue-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueName: query.trim(),
          locationContext: location.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data: VenueSearchData = await response.json();
      setVenueResult(data);
    } catch (err: any) {
      console.error('Error fetching venue specs:', err);
      setError(err.message || 'Failed to retrieve venue data via Google Search grounding.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchTerm, locationContext);
  };

  const handleCopyText = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatNotesForGig = (data: VenueSearchData): string => {
    const lines: string[] = [];
    lines.push(`🏛️ VENUE: ${data.venueName} | Capacity: ${data.capacity || 'N/A'}`);
    if (data.address) lines.push(`📍 Address: ${data.address}`);
    
    if (data.contactInfo?.email || data.contactInfo?.phone) {
      lines.push(`📞 Contact: ${[data.contactInfo.email, data.contactInfo.phone].filter(Boolean).join(' | ')}`);
    }

    if (data.backlineSpecs) {
      const specs = data.backlineSpecs;
      lines.push(`🎛️ BACKLINE & TECH SPECS:`);
      if (specs.paSoundSystem) lines.push(` • PA/FOH: ${specs.paSoundSystem}`);
      if (specs.drumKit) lines.push(` • Drums: ${specs.drumKit}`);
      if (specs.guitarBassAmps) lines.push(` • Amps/Cabs: ${specs.guitarBassAmps}`);
      if (specs.microphonesDi) lines.push(` • Mics/DIs: ${specs.microphonesDi}`);
      if (specs.stageDimensions) lines.push(` • Stage: ${specs.stageDimensions}`);
    }

    if (data.logistics) {
      const log = data.logistics;
      lines.push(`📋 LOGISTICS & RULES:`);
      if (log.ageRestriction) lines.push(` • Age: ${log.ageRestriction}`);
      if (log.loadInInstructions) lines.push(` • Load-in: ${log.loadInInstructions}`);
      if (log.curfew) lines.push(` • Curfew: ${log.curfew}`);
      if (log.merchPolicy) lines.push(` • Merch: ${log.merchPolicy}`);
    }

    return lines.join('\n');
  };

  const handleApplyAddressOnly = () => {
    if (!venueResult) return;
    onApplyVenueData({
      venueName: venueResult.venueName || searchTerm,
      address: venueResult.address || '',
      fullVenueData: venueResult,
    });
    setAppliedSuccess(true);
    setTimeout(() => onClose(), 800);
  };

  const handleApplyAll = () => {
    if (!venueResult) return;
    const formattedNotes = formatNotesForGig(venueResult);
    onApplyVenueData({
      venueName: venueResult.venueName || searchTerm,
      address: venueResult.address || '',
      notesToAppend: formattedNotes,
      fullVenueData: venueResult,
    });
    setAppliedSuccess(true);
    setTimeout(() => onClose(), 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative my-8 text-slate-200 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30">
              <Sparkles size={22} className="text-purple-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                  <Globe size={11} /> Google Search Grounding
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                  Gemini 3.7 Live Intelligence
                </span>
              </div>
              <h3 className="text-xl font-bold font-display text-slate-100 mt-1">
                Venue Intelligence & Backline Scout
              </h3>
              <p className="text-xs text-slate-400">
                Search verified live music venue specs, room capacity, booking contacts, and backline sound gear.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSearchSubmit} className="pt-4 pb-3 grid grid-cols-1 sm:grid-cols-12 gap-2.5 shrink-0">
          <div className="sm:col-span-6 relative">
            <Search size={15} className="absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              required
              placeholder="Venue name (e.g., The Crocodile, Neumos, Troubadour)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500/60 font-medium"
            />
          </div>

          <div className="sm:col-span-4 relative">
            <MapPin size={15} className="absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="City / Region (e.g. Seattle, WA)"
              value={locationContext}
              onChange={(e) => setLocationContext(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500/60"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading || !searchTerm.trim()}
              className="w-full h-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-600/20 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  <span>Search</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Venue Search Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 text-[11px] text-slate-400 shrink-0">
          <span className="shrink-0 text-slate-500 font-semibold">Popular:</span>
          {['The Crocodile (Seattle)', 'Neumos (Seattle)', 'The Showbox (Seattle)', 'Troubadour (LA)', 'Bowery Ballroom (NYC)', 'First Avenue (Minneapolis)'].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                const parts = preset.split(' (');
                const vName = parts[0];
                const loc = parts[1]?.replace(')', '') || '';
                setSearchTerm(vName);
                setLocationContext(loc);
                performSearch(vName, loc);
              }}
              className="shrink-0 px-2 py-0.5 rounded-full bg-slate-950 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/40 text-slate-300 transition-colors cursor-pointer"
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Results Container (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 py-2">
          {loading && (
            <div className="py-16 text-center space-y-3">
              <div className="inline-flex p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-purple-400 animate-pulse">
                <Globe size={32} className="animate-spin" />
              </div>
              <h4 className="text-sm font-bold text-slate-200">Querying Google Search Grounding for Live Venue Data...</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Retrieving verified contact emails, room capacity, backline equipment specifications, and venue house rules for <span className="text-purple-300 font-semibold">"{searchTerm}"</span>.
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs flex items-start gap-3">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-400" />
              <div className="space-y-1">
                <span className="font-bold block">Search Request Failed</span>
                <p className="text-slate-300">{error}</p>
                <button
                  type="button"
                  onClick={() => performSearch(searchTerm, locationContext)}
                  className="mt-2 text-xs font-semibold text-purple-300 hover:text-purple-200 underline cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {venueResult && !loading && (
            <div className="space-y-4">
              {/* Primary Venue Card */}
              <div className="bg-slate-950/80 rounded-xl p-4 border border-purple-500/30 shadow-md space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                      Verified Venue Record
                    </span>
                    <h4 className="text-lg font-bold font-display text-slate-100 flex items-center gap-2">
                      <span>{venueResult.venueName}</span>
                      {venueResult.isDemo && (
                        <span className="px-2 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-sans">
                          Demo Mode
                        </span>
                      )}
                    </h4>
                  </div>

                  {venueResult.capacity && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold shrink-0">
                      <Users size={13} />
                      <span>Capacity: {venueResult.capacity}</span>
                    </div>
                  )}
                </div>

                {/* Address & Quick Copy */}
                {venueResult.address && (
                  <div className="flex items-center justify-between gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin size={14} className="text-purple-400 shrink-0" />
                      <span className="text-slate-300 font-medium truncate">{venueResult.address}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyText(venueResult.address || '', 'address')}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Copy address"
                      >
                        {copiedField === 'address' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        <span>{copiedField === 'address' ? 'Copied' : 'Copy'}</span>
                      </button>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueResult.venueName + ' ' + (venueResult.address || ''))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 text-purple-300 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>Maps</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                )}

                {/* Booking & Contact Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {venueResult.contactInfo?.email && (
                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between gap-1">
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Booking Email</span>
                        <a
                          href={`mailto:${venueResult.contactInfo.email}`}
                          className="text-purple-400 hover:underline truncate block font-medium"
                        >
                          {venueResult.contactInfo.email}
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyText(venueResult.contactInfo?.email || '', 'email')}
                        className="p-1 text-slate-400 hover:text-slate-200"
                        title="Copy Email"
                      >
                        {copiedField === 'email' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    </div>
                  )}

                  {venueResult.contactInfo?.phone && (
                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between gap-1">
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Phone / Office</span>
                        <span className="text-slate-300 font-medium truncate block">{venueResult.contactInfo.phone}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyText(venueResult.contactInfo?.phone || '', 'phone')}
                        className="p-1 text-slate-400 hover:text-slate-200"
                        title="Copy Phone"
                      >
                        {copiedField === 'phone' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    </div>
                  )}

                  {venueResult.contactInfo?.website && (
                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between gap-1">
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Official Website</span>
                        <a
                          href={venueResult.contactInfo.website.startsWith('http') ? venueResult.contactInfo.website : `https://${venueResult.contactInfo.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:underline truncate block font-medium flex items-center gap-1"
                        >
                          <span>Visit Site</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Backline & Technical Audio Specifications Grid */}
              <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders size={16} className="text-purple-400" />
                    <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      House Backline & Technical Audio Specs
                    </h5>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Audio Engineering Rider</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5 mb-1">
                      <Volume2 size={13} className="text-purple-400" />
                      PA Sound System & FOH Console
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {venueResult.backlineSpecs?.paSoundSystem || 'Standard house PA system and multi-channel console provided. Advance with FOH engineer.'}
                    </p>
                  </div>

                  <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5 mb-1">
                      <Music size={13} className="text-emerald-400" />
                      House Drum Kit & Shells
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {venueResult.backlineSpecs?.drumKit || 'Standard 4-5 piece shell pack (Bands bring cymbals, snare, kick pedal, and hardware).'}
                    </p>
                  </div>

                  <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5 mb-1">
                      <Sliders size={13} className="text-blue-400" />
                      Guitar & Bass Amps / Cabs
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {venueResult.backlineSpecs?.guitarBassAmps || 'House guitar amps and bass cabinet available upon advance request.'}
                    </p>
                  </div>

                  <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5 mb-1">
                      <Volume2 size={13} className="text-amber-400" />
                      Microphones & DI Channels
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {venueResult.backlineSpecs?.microphonesDi || 'Industry standard dynamic microphones (SM58/57) and passive/active DIs.'}
                    </p>
                  </div>
                </div>

                {/* Stage Dimensions & Lighting */}
                {(venueResult.backlineSpecs?.stageDimensions || venueResult.backlineSpecs?.lightingMonitors) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    {venueResult.backlineSpecs.stageDimensions && (
                      <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80 text-[11px]">
                        <span className="font-bold text-slate-400 block mb-0.5">Stage Dimensions:</span>
                        <span className="text-slate-300">{venueResult.backlineSpecs.stageDimensions}</span>
                      </div>
                    )}
                    {venueResult.backlineSpecs.lightingMonitors && (
                      <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80 text-[11px]">
                        <span className="font-bold text-slate-400 block mb-0.5">Lighting & Monitors:</span>
                        <span className="text-slate-300">{venueResult.backlineSpecs.lightingMonitors}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Venue Logistics & House Policies */}
              {venueResult.logistics && (
                <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Clock size={15} className="text-amber-400" />
                    <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Touring Logistics & Venue Policies
                    </h5>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                    {venueResult.logistics.ageRestriction && (
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                        <ShieldAlert size={14} className="text-purple-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-300 block">Age Policy:</span>
                          <span className="text-slate-400">{venueResult.logistics.ageRestriction}</span>
                        </div>
                      </div>
                    )}

                    {venueResult.logistics.loadInInstructions && (
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                        <MapPin size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-300 block">Load-in Access:</span>
                          <span className="text-slate-400">{venueResult.logistics.loadInInstructions}</span>
                        </div>
                      </div>
                    )}

                    {venueResult.logistics.curfew && (
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                        <Clock size={14} className="text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-300 block">Curfew:</span>
                          <span className="text-slate-400">{venueResult.logistics.curfew}</span>
                        </div>
                      </div>
                    )}

                    {venueResult.logistics.merchPolicy && (
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                        <ShoppingBag size={14} className="text-blue-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-300 block">Merch Policy:</span>
                          <span className="text-slate-400">{venueResult.logistics.merchPolicy}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Grounding Web Sources / Citations */}
              {venueResult.sources && venueResult.sources.length > 0 && (
                <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/80 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <Globe size={12} className="text-blue-400" />
                    <span>Google Search Grounded Web Sources ({venueResult.sources.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {venueResult.sources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 text-blue-300 text-[11px] transition-colors max-w-xs truncate"
                        title={source.uri}
                      >
                        <ExternalLink size={10} className="shrink-0" />
                        <span className="truncate">{source.title || source.uri}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {appliedSuccess ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                <Check size={14} /> Venue specs applied to gig form!
              </span>
            ) : (
              <span className="text-slate-500 flex items-center gap-1">
                <Info size={13} /> Auto-fill address and backline specs directly into your gig form.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 font-semibold px-3.5 py-2 rounded-xl text-xs cursor-pointer transition-colors"
            >
              Close
            </button>

            {venueResult && (
              <>
                <button
                  type="button"
                  onClick={handleApplyAddressOnly}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Apply only verified street address to the form"
                >
                  <MapPin size={13} className="text-purple-400" />
                  <span>Apply Address Only</span>
                </button>

                <button
                  type="button"
                  onClick={handleApplyAll}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-600/20 border border-purple-500/30 transition-all active:translate-y-0.5"
                  title="Apply address and append all backline & contact specs to internal notes"
                >
                  <Sparkles size={13} />
                  <span>Apply All (Address + Backline Notes)</span>
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
