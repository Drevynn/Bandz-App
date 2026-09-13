import React, { useState } from 'react';
import { Gig, Artist, PromoMaterial } from '../types';
import { Sparkles, Instagram, Facebook, Mail, FileText, Send, Copy, Check, Loader2, AlertCircle, Calendar, MapPin, Building, Globe, ExternalLink, Link, Eye, Twitter, Share2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PublicEventPage } from './PublicPages';

interface PromoTabProps {
  gigs: Gig[];
  artists: Artist[];
  selectedArtistId: string;
  aiCredits: number;
  maxCredits: number;
  onDecrementAiCredits: () => void;
}

type PromoPlatform = 'twitter' | 'instagram' | 'facebook' | 'newsletter' | 'press_release' | 'booking_outreach';

export default function PromoTab({ gigs, artists, selectedArtistId, aiCredits, maxCredits, onDecrementAiCredits }: PromoTabProps) {
  // Navigation within Promo Tab: 'ai_copier' or 'event_pages'
  const [promoTabMode, setPromoTabMode] = useState<'ai_copier' | 'event_pages'>('event_pages');
  
  const [selectedGigId, setSelectedGigId] = useState<string>(gigs[0]?.id || '');
  const [platform, setPlatform] = useState<PromoPlatform>('twitter');
  const [customInstruction, setCustomInstruction] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedResult, setGeneratedResult] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Live simulated preview overlay of public event page
  const [activePreviewGig, setActivePreviewGig] = useState<Gig | null>(null);

  // Booking outreach extra state
  const [targetVenue, setTargetVenue] = useState<string>('');
  const [targetMonth, setTargetMonth] = useState<string>('September 2026');

  // Filter gigs relative to selected band
  const availableGigs = gigs.filter(g => selectedArtistId === 'all' || g.artistId === selectedArtistId);
  const activeArtist = artists.find(a => selectedArtistId === 'all' ? a.id === gigs[0]?.artistId : a.id === selectedArtistId) || artists[0];

  // Quick social post edit states
  const [twitterPostText, setTwitterPostText] = useState('');
  const [facebookPostText, setFacebookPostText] = useState('');
  const [activeDraftGigId, setActiveDraftGigId] = useState<string>('');

  // Pre-populate standard post templates when user selects a gig
  React.useEffect(() => {
    const gig = availableGigs.find(g => g.id === selectedGigId) || availableGigs[0];
    if (gig) {
      setActiveDraftGigId(gig.id);
      
      const dateStr = new Date(gig.dateTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      const timeStr = new Date(gig.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const tixInfo = gig.ticketPrice > 0 ? `$${gig.ticketPrice} tix` : 'FREE show';
      
      setTwitterPostText(
        `🎸 LIVE MUSIC ALERT! We are hitting the stage at ${gig.venueName} on ${dateStr} at ${timeStr}! Can't wait to play our favorite songs live. Grab your tickets before they sell out! 🎟️✨\n\nGet yours: ${gig.ticketUrl || 'Link in bio'} (${tixInfo})\n\n#LiveMusic #SeattleMusic`
      );

      setFacebookPostText(
        `🚨 WE'RE PLAYING A SHOW! 🚨\n\nHey everyone, we're extremely excited to announce that we are performing live at ${gig.venueName} in ${gig.venueAddress}!\n\n📅 Date: ${dateStr}\n⏰ Time: ${timeStr}\n🎟️ Tickets: ${gig.ticketPrice > 0 ? `$${gig.ticketPrice}` : 'Free Entry'}\n\nWe will be playing a full set of original tunes and some special surprises. Bring your friends and support local music! RSVP and grab your tickets here: ${gig.ticketUrl || 'Link in Bio'}\n\nSee you in the crowd! 🙌`
      );
    }
  }, [selectedGigId, selectedArtistId]);

  const handleCopy = (text: string, type: 'draft' | 'link') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === 'draft') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopiedLink(text);
      setTimeout(() => setCopiedLink(null), 2000);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMsg('');
    setGeneratedResult('');

    if (aiCredits <= 0) {
      setErrorMsg(`🚫 AI CREDIT CAP REACHED: You have consumed your current plan's monthly allocation (${maxCredits} credits). Upgrade your plan or contact Band Aide Billing nodes to re-activate unlimited/extended generation limits.`);
      setLoading(false);
      return;
    }

    const activeGig = availableGigs.find(g => g.id === selectedGigId) || availableGigs[0];

    try {
      if (platform === 'booking_outreach') {
        if (!targetVenue) {
          throw new Error('Please specify a target music venue name.');
        }

        const res = await fetch('/api/generate-outreach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            artist: activeArtist,
            venueName: targetVenue,
            targetMonth: targetMonth,
            customDetails: customInstruction
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Server error generating outreach email');
        setGeneratedResult(data.content);
        onDecrementAiCredits();
      } else {
        if (!activeGig) {
          throw new Error('Please select or create an upcoming gig event to generate promotions for.');
        }

        const res = await fetch('/api/generate-promo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gig: activeGig,
            artist: activeArtist,
            platform: platform,
            customInstruction: customInstruction
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Server error generating campaign material');
        setGeneratedResult(data.content);
        onDecrementAiCredits();
        
        // Update local editable social draft state if applicable
        if (platform === 'twitter') {
          setTwitterPostText(data.content);
        } else if (platform === 'facebook') {
          setFacebookPostText(data.content);
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An unexpected server error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If live preview is active, render the fullscreen simulated fan portal
  if (activePreviewGig) {
    return (
      <PublicEventPage 
        gig={activePreviewGig} 
        artist={activeArtist} 
        onBackToApp={() => setActivePreviewGig(null)} 
      />
    );
  }

  return (
    <div className="space-y-6" id="promo-root-container">
      
      {/* Promoter Header with Navigation */}
      <div className="relative overflow-hidden flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-5 rounded-2xl border border-purple-500/20 bg-slate-900/80 shadow-xl">
        <div className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none" style={{ backgroundImage: "url('/src/assets/images/hero_banner_stage_1784716444784.jpg')" }} />
        <div className="relative z-10 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
            PROMOTION ENGINE & THE MANAGER
          </span>
          <h2 className="text-lg font-black font-display text-slate-100 uppercase tracking-tight flex items-center gap-2 mt-1">
            <Sparkles className="text-purple-400 animate-pulse" size={18} />
            <span>Event Promoter & The Manager</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-normal max-w-xl">
            Distribute shareable fan pages for your concert dates and automatically draft high-engagement promotion logs.
          </p>
        </div>

        {/* Sub-tab Selection Bar */}
        <div className="relative z-10 flex bg-slate-950/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setPromoTabMode('event_pages')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              promoTabMode === 'event_pages' 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Shareable Event Pages
          </button>
          <button
            onClick={() => setPromoTabMode('ai_copier')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              promoTabMode === 'ai_copier' 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AI Copy Suite
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* VIEW 1: SHAREABLE EVENT PAGES (Core Requirement) */}
        {promoTabMode === 'event_pages' && (
          <motion.div
            key="event_pages"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left Column: List of event share panels */}
            <div className="lg:col-span-6 space-y-4">
              <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider font-mono">YOUR ACTIVE TOUR DATE PATHS</span>

              {availableGigs.length === 0 ? (
                <div className="bg-slate-900/10 border-2 border-slate-900 border-dashed rounded-2xl p-10 text-center text-slate-500">
                  <Calendar size={32} className="mx-auto text-slate-700 mb-2" />
                  <p className="text-xs">No upcoming dates scheduled for this band focus. Please add a gig date in the Scheduler.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {availableGigs.map((gig) => {
                    const shareUrl = `${window.location.origin}/event/${gig.id}`;
                    const isSelected = selectedGigId === gig.id;
                    const gigDate = new Date(gig.dateTime);
                    
                    return (
                      <div
                        key={gig.id}
                        onClick={() => setSelectedGigId(gig.id)}
                        className={`bg-slate-900/30 border p-5 rounded-2xl flex flex-col gap-4 transition-all relative cursor-pointer ${
                          isSelected ? 'border-purple-500/30 bg-purple-500/[0.02] shadow-[0_0_15px_rgba(157,78,221,0.05)]' : 'border-slate-900/60 hover:border-slate-800'
                        }`}
                      >
                        {/* Selector indicator */}
                        {isSelected && <div className="absolute left-0 top-6 bottom-6 w-1 bg-purple-500 rounded-r-lg shadow-[0_0_8px_rgba(157,78,221,0.8)]" />}

                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[9px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                              {gigDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-tight mt-1 leading-snug">
                              {gig.title}
                            </h3>
                            <span className="text-[10px] text-purple-400/95 font-mono mt-0.5 block">
                              @{gig.venueName} • {gig.venueAddress}
                            </span>
                          </div>

                          <div className="flex gap-1.5 shrink-0 relative z-20">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(shareUrl, 'link');
                              }}
                              className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
                              title="Copy Share Link"
                            >
                              {copiedLink === shareUrl ? <Check size={12} className="text-emerald-400" /> : <Link size={12} />}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActivePreviewGig(gig);
                              }}
                              className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl text-slate-400 hover:text-slate-200 transition-all flex items-center gap-1.5 text-[10px] font-bold font-mono"
                              title="Preview Public Landing Page"
                            >
                              <Eye size={12} className="text-purple-400" />
                              <span>Live EPK</span>
                            </button>
                          </div>
                        </div>

                        {/* Summary Block */}
                        <p className="text-[11px] text-slate-400 bg-slate-950/40 p-3 rounded-lg border border-slate-850/40 leading-relaxed whitespace-pre-wrap line-clamp-2">
                          {gig.description || 'Live concert event detail listing.'}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-3 border-t border-slate-900">
                          <span className="font-mono text-slate-400">
                            Admission: {gig.ticketPrice > 0 ? `$${gig.ticketPrice}` : 'FREE'}
                          </span>
                          <span className="text-[9px] font-mono italic truncate max-w-[200px]" title={shareUrl}>
                            {shareUrl}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Social Media Auto-Generators (Core Requirement) */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider block font-mono">AUTOMATED SOCIAL PLUGINS</span>

              {availableGigs.length === 0 ? (
                <div className="bg-slate-900/10 border border-slate-900 rounded-2xl p-6 text-center text-slate-600">
                  <Eye size={20} className="mx-auto mb-1 text-slate-800" />
                  <p className="text-[11px] italic">Please schedule an event date to draft instant Facebook and Twitter copies.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Twitter Simulation Post Box */}
                  <div className="bg-[#15202B] border border-slate-800 rounded-2xl p-4 space-y-3.5 relative shadow-xl text-slate-100">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Twitter size={14} className="text-[#1DA1F2] fill-[#1DA1F2]" />
                        <span className="text-[10px] font-bold tracking-wider font-mono text-[#1DA1F2]">TWITTER (X) INSTA-POST</span>
                      </div>
                      <button
                        onClick={() => handleCopy(twitterPostText, 'draft')}
                        className="text-[9px] bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-300 hover:text-slate-100 font-mono transition-all flex items-center gap-1"
                      >
                        {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                        <span>{copied ? 'Copied' : 'Copy Twitter Post'}</span>
                      </button>
                    </div>

                    <div className="flex gap-3">
                      {/* Avatar Mock */}
                      <div className="w-8 h-8 rounded-full bg-slate-800 shrink-0 border border-slate-700 font-bold text-xs text-purple-400 flex items-center justify-center">
                        {activeArtist?.name[0]}
                      </div>
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold leading-none">{activeArtist?.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono leading-none">@{activeArtist?.name.replace(/\s+/g, '').toLowerCase()}</span>
                        </div>
                        
                        <textarea
                          rows={4}
                          value={twitterPostText}
                          onChange={(e) => setTwitterPostText(e.target.value)}
                          className="w-full bg-transparent text-xs text-slate-200 focus:outline-none resize-none leading-relaxed font-sans"
                          placeholder="Drafting Twitter alert..."
                        />

                        {/* Character count and helper */}
                        <div className="flex justify-between items-center pt-2 border-t border-slate-800/60 text-[9px] text-slate-500 font-mono">
                          <span className={twitterPostText.length > 280 ? 'text-red-400 font-bold' : ''}>
                            {twitterPostText.length} / 280 chars
                          </span>
                          <span className="text-[8px] italic text-slate-600">Max limit meter (280)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Facebook Simulation Post Box */}
                  <div className="bg-[#1877F2]/5 border-2 border-[#1877F2]/20 rounded-2xl p-4 space-y-3.5 relative shadow-xl">
                    <div className="flex justify-between items-center border-b border-[#1877F2]/10 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Facebook size={14} className="text-[#1877F2] fill-[#1877F2]" />
                        <span className="text-[10px] font-bold tracking-wider font-mono text-[#1877F2]">FACEBOOK OUTREACH POST</span>
                      </div>
                      <button
                        onClick={() => handleCopy(facebookPostText, 'draft')}
                        className="text-[9px] bg-slate-950 border border-slate-900 px-2 py-1 rounded text-slate-300 hover:text-slate-100 font-mono transition-all flex items-center gap-1"
                      >
                        {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                        <span>{copied ? 'Copied' : 'Copy Facebook Post'}</span>
                      </button>
                    </div>

                    <div className="flex gap-3">
                      {/* Avatar Mock */}
                      <div className="w-8 h-8 rounded-full bg-slate-950 shrink-0 border border-slate-900 font-bold text-xs text-purple-400 flex items-center justify-center">
                        {activeArtist?.name[0]}
                      </div>
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold leading-none text-slate-200">{activeArtist?.name}</span>
                          <span className="text-[10px] text-slate-500">Sponsored Live Promo</span>
                        </div>

                        <textarea
                          rows={6}
                          value={facebookPostText}
                          onChange={(e) => setFacebookPostText(e.target.value)}
                          className="w-full bg-transparent text-xs text-slate-300 focus:outline-none resize-none leading-relaxed font-sans"
                          placeholder="Drafting Facebook post..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* AI Refiner Trigger banner */}
                  <div className="bg-slate-900/40 p-4 rounded-xl border border-purple-500/10 text-[10px] text-slate-400 leading-snug flex items-center justify-between gap-4">
                    <div className="flex gap-2.5 items-start">
                      <Sparkles size={14} className="text-purple-400 shrink-0 mt-0.5 animate-bounce" />
                      <div>
                        <span className="text-slate-200 font-bold block mb-0.5">Need customized AI copy versions?</span>
                        Use the **AI Copy Suite** sub-tab to tailor tone rules, insert emojis, or pitch custom angles.
                      </div>
                    </div>
                    <button
                      onClick={() => setPromoTabMode('ai_copier')}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-1.5 rounded-lg text-[9px] shrink-0 font-mono transition-all cursor-pointer border border-purple-500/20 shadow-md shadow-purple-600/10"
                    >
                      AI Suite
                    </button>
                  </div>

                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* VIEW 2: AI COPY SUITE (The existing campaign copier, polished) */}
        {promoTabMode === 'ai_copier' && (
          <motion.div
            key="ai_copier"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Parameter Control Panel */}
            <div className="lg:col-span-5 bg-slate-900/30 border border-slate-900 rounded-2xl p-5 flex flex-col gap-5">
              <div>
                <h3 className="text-sm font-black font-display text-slate-100 uppercase tracking-tight flex items-center gap-2">
                  <Sparkles className="text-amber-500" size={16} />
                  <span>The AI Press Desk</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Draft polished copy blocks for newsletters, press releases, social channels, or booking pitches instantly.
                </p>
              </div>

              {/* AI Credit Quota Tracker */}
              <div className="bg-slate-950 p-4 border border-slate-900 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-slate-400 uppercase font-bold flex items-center gap-1.5">
                    <Sparkles size={11} className="text-amber-500 animate-pulse" />
                    AI Credit Quota
                  </span>
                  <span className="text-slate-200 font-bold">{aiCredits} / {maxCredits} left</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      aiCredits === 0 
                        ? 'bg-red-500' 
                        : aiCredits < (maxCredits * 0.25) 
                          ? 'bg-amber-500' 
                          : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.max(0, Math.min(100, (aiCredits / maxCredits) * 100))}%` }}
                  />
                </div>
                <span className="text-[9px] text-slate-500 leading-normal block font-sans">
                  Fair-use quota cap to keep API costs sustainable and prevent runaway billing.
                </span>
              </div>

              {/* Platform Selector Tabs */}
              <div className="space-y-2 text-left">
                <label className="block text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">Select Promo Outlet</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-950 p-2 rounded-xl border border-slate-900">
                  {[
                    { id: 'twitter', icon: Twitter, label: 'Twitter (X)' },
                    { id: 'instagram', icon: Instagram, label: 'Instagram' },
                    { id: 'facebook', icon: Facebook, label: 'Facebook' },
                    { id: 'newsletter', icon: Mail, label: 'Newsletter' },
                    { id: 'press_release', icon: FileText, label: 'Press Rel' },
                    { id: 'booking_outreach', icon: Globe, label: 'Venue Pitch' },
                  ].map((p) => {
                    const Icon = p.icon;
                    const isSelected = platform === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          setPlatform(p.id as PromoPlatform);
                          setErrorMsg('');
                          setGeneratedResult('');
                        }}
                        className={`flex flex-col items-center justify-center py-2.5 px-1.5 rounded-lg transition-all text-[10px] font-bold cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 font-black'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                        }`}
                        title={p.id.replace('_', ' ').toUpperCase()}
                      >
                        <Icon size={14} className="mb-1 shrink-0" />
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-900/60">
                {platform === 'booking_outreach' ? (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Target Venue *</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-2.5 text-slate-500" size={14} />
                        <input
                          type="text"
                          placeholder="e.g., Neumos, Barboza, Tractor Tavern"
                          value={targetVenue}
                          onChange={(e) => setTargetVenue(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/30"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Target Timeframe</label>
                      <input
                        type="text"
                        placeholder="e.g., late September 2026"
                        value={targetMonth}
                        onChange={(e) => setTargetMonth(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Select Event to Promote</label>
                    {availableGigs.length === 0 ? (
                      <div className="p-3.5 bg-slate-950 border border-slate-900 rounded-xl text-xs text-slate-500 text-center flex items-center justify-center gap-2">
                        <AlertCircle size={14} className="text-slate-600" />
                        <span>No scheduled gigs. Please add a gig first.</span>
                      </div>
                    ) : (
                      <select
                        value={selectedGigId}
                        onChange={(e) => {
                          setSelectedGigId(e.target.value);
                          setGeneratedResult('');
                        }}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none"
                      >
                        {availableGigs.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.title} @ {g.venueName} ({new Date(g.dateTime).toLocaleDateString()})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Custom Tone Directions (Optional)</label>
                  <textarea
                    rows={4}
                    placeholder={
                      platform === 'booking_outreach'
                        ? 'e.g., Mention our upcoming EP, offer supporting other bands, propose specific weekend dates...'
                        : 'e.g., Focus heavily on the vinyl pre-order, emphasize our supporting acts, write in a nostalgic/mysterious tone...'
                    }
                    value={customInstruction}
                    onChange={(e) => setCustomInstruction(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500/30 resize-none leading-relaxed font-sans"
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loading || (platform !== 'booking_outreach' && availableGigs.length === 0)}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:pointer-events-none active:translate-y-0.5 text-slate-950 font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Drafting Copy...</span>
                    </>
                  ) : (
                    <>
                      <Send size={12} />
                      <span>Generate AI Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Campaign Result Display Output Panel */}
            <div className="lg:col-span-7 bg-slate-900/30 border border-slate-900 rounded-2xl p-5 flex flex-col min-h-[460px]">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3">
                  <Loader2 size={24} className="text-amber-500 animate-spin" />
                  <div className="text-center space-y-1">
                    <p className="text-xs font-semibold text-slate-300">Consulting the Press Desk...</p>
                    <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed mx-auto">
                      Structuring calendar markers, hashtags, and ticket links into professional promotional text blocks.
                    </p>
                  </div>
                </div>
              ) : errorMsg ? (
                <div className="flex-1 flex flex-col items-center justify-center text-red-400 p-6 text-center gap-2">
                  <AlertCircle size={24} className="text-red-500/80" />
                  <div>
                    <p className="text-xs font-semibold">AI Draft Synthesis Failed</p>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-sm leading-relaxed">{errorMsg}</p>
                    <button
                      onClick={handleGenerate}
                      className="mt-3 text-[10px] font-bold text-amber-500 border border-amber-500/30 hover:bg-amber-500/10 px-3 py-1 rounded-lg font-mono"
                    >
                      Retry Block
                    </button>
                  </div>
                </div>
              ) : generatedResult ? (
                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider font-mono">
                        AI Draft Output
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(generatedResult, 'draft')}
                      className="flex items-center gap-1 bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-900 px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-all"
                    >
                      {copied ? (
                        <>
                          <Check size={12} className="text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy Draft</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto max-h-[350px] pr-1">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans shadow-inner">
                      {generatedResult}
                    </div>
                  </div>

                  <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl text-[10px] text-slate-500 leading-normal flex items-start gap-2">
                    <Sparkles size={12} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      This copy has been optimized based on the selected platform guidelines. You can copy it directly to your clipboard or edit it as needed.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center py-16 gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center border border-slate-900 text-slate-600">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">Desk Board Empty</p>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-xs leading-normal">
                      Configure your prompt parameters and click **Generate AI Copy** to construct professional text campaigns.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
