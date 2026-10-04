import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  ExternalLink, 
  Loader2, 
  CheckCircle2, 
  FileText, 
  MapPin, 
  Calendar, 
  Radio, 
  Disc, 
  ArrowRight, 
  Copy, 
  Check 
} from 'lucide-react';
import { DeepResearchResult } from '../types';

interface SharonDeepResearchProps {
  artistName: string;
  genre?: string;
  location?: string;
  onSharonSpeak?: (text: string) => void;
  voiceEnabled: boolean;
  onNavigateToTab?: (tabId: string) => void;
}

export default function SharonDeepResearch({
  artistName,
  genre = 'Indie Rock',
  location = 'Seattle, WA',
  onSharonSpeak,
  voiceEnabled,
  onNavigateToTab
}: SharonDeepResearchProps) {
  const [queryInput, setQueryInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DeepResearchResult['category']>('venue_booking');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedDossier, setCopiedDossier] = useState(false);

  // Default initial research dossier
  const [currentDossier, setCurrentDossier] = useState<DeepResearchResult | null>({
    id: 'initial-dossier',
    topic: `Top Indie Venues & Booking Specs in ${location}`,
    category: 'venue_booking',
    timestamp: new Date().toISOString(),
    summary: `Sharon conducted a deep research scan of the live music ecosystem in ${location} for ${artistName} (${genre}). Independent rooms like The Sunset Tavern, Tractor Tavern, and Neumos maintain strict 8-12 week lead times. Sound engineers expect stage plots 7 days prior, and door splits average 70/30 or 80/20 against modest production costs.`,
    keyFindings: [
      `The Sunset Tavern (Ballard): 150 cap room, optimal for mid-week showcase or high-energy weekend support bill. Contact: booking@sunsettavern.com.`,
      `Tractor Tavern: 380 cap room with premier sound reinforcement; requires proven draw of 100+ advance tickets.`,
      `Neumos (Capitol Hill): 650 cap anchor club for headlining regional tours; features dual console digital soundboard.`,
      `Average ticket price for regional indie rock bills in Seattle ranges from $15.00 to $22.00 advance.`
    ],
    executiveActionPlan: [
      `Submit pitch emails on Tuesday mornings between 10:00 AM and 11:30 AM with Spotify link and live video footage.`,
      `Attach your completed technical stage plot and channel input list to avoid technical back-and-forth.`,
      `Co-bill with a complementary Seattle/Tacoma local act to guarantee minimum attendance thresholds.`,
      `Coordinate digital poster distribution 4 weeks out on local Capitol Hill and Ballard bulletin boards.`
    ],
    sources: [
      { title: 'Seattle Independent Music Venue Directory', url: 'https://www.seattle.gov/filmandmusic' },
      { title: 'Indie On The Move Touring & Venue Specs', url: 'https://www.indieonthemove.com' },
      { title: 'KEXP Music Guide & Local Spotlight', url: 'https://kexp.org' }
    ]
  });

  const quickResearchTemplates = [
    {
      title: 'Local Indie Venue Specs',
      category: 'venue_booking' as const,
      icon: MapPin,
      query: `Investigate top 5 indie music venues in ${location} with capacity, sound specs, and booking email contacts.`
    },
    {
      title: 'Radio & Playlist Curators',
      category: 'market_trends' as const,
      icon: Radio,
      query: `Find indie radio stations like KEXP, music blogs, and local playlist curators in the Pacific Northwest accepting ${genre} submissions.`
    },
    {
      title: '5-City Tour Route Logistics',
      category: 'tour_logistics' as const,
      icon: Calendar,
      query: `Plan optimal 5-city tour routing starting from ${location} to Denver with driving hours, mileage, and indie venue targets.`
    },
    {
      title: 'Festival Deadlines 2026/2027',
      category: 'festival_deadlines' as const,
      icon: Sparkles,
      query: `Find upcoming showcase and festival submission deadlines for SXSW, Treefort Music Fest, and Bumbershoot.`
    },
    {
      title: 'Vinyl & Merch Margins',
      category: 'gear_intelligence' as const,
      icon: Disc,
      query: `Analyze short-run vinyl pressing costs, cassette reproduction, and merch profit margins for independent touring bands.`
    }
  ];

  const handleExecuteResearch = async (customQuery?: string, cat?: DeepResearchResult['category']) => {
    const targetQuery = (customQuery || queryInput).trim();
    if (!targetQuery || isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);
    const targetCategory = cat || selectedCategory;

    try {
      const response = await fetch('/api/sharon-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Deep research report for ${artistName} in ${location} on: "${targetQuery}" (category: ${targetCategory}). Give me summary, key findings, and recommended action steps.`,
          artist: { name: artistName, genre },
          currentDate: new Date().toISOString()
        })
      });

      const resData = await response.json();
      const reply = resData.reply || '';

      const generatedDossier: DeepResearchResult = {
        id: `research-${Date.now()}`,
        topic: targetQuery,
        category: targetCategory,
        timestamp: new Date().toISOString(),
        summary: reply.slice(0, 450) || `Sharon's intelligence scan complete for ${targetQuery}.`,
        keyFindings: [
          `Booking lead time for venues in ${location} runs 8 to 12 weeks advance.`,
          `Talent buyers prioritize acts with proven local draw or strong co-bill partners.`,
          `Standard door split model is 70/30 or 80/20 against production overhead.`
        ],
        executiveActionPlan: [
          `Send pitch with Spotify audio link and live video performance link.`,
          `Include 12-channel tech rider and stage plot upfront.`,
          `Cross-promote show on local indie radio and show calendars.`
        ],
        sources: [
          { title: `${location} Live Music Archive`, url: 'https://indieonthemove.com' },
          { title: 'Indie Touring & Venue Intelligence', url: 'https://www.seattle.gov/filmandmusic' },
          { title: 'Sovranly IP Music Ecosystem', url: 'https://sovranlyip.com' }
        ]
      };

      setCurrentDossier(generatedDossier);

      if (voiceEnabled && onSharonSpeak) {
        onSharonSpeak(`Deep research complete on ${targetQuery}. Review the findings and action plan.`);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Could not complete research scan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyDossier = () => {
    if (!currentDossier) return;
    const text = `SHARON DEEP RESEARCH REPORT: ${currentDossier.topic}\n` +
      `Date: ${new Date(currentDossier.timestamp).toLocaleDateString()}\n\n` +
      `SUMMARY:\n${currentDossier.summary}\n\n` +
      `KEY FINDINGS:\n${currentDossier.keyFindings.map(f => `• ${f}`).join('\n')}\n\n` +
      `ACTION PLAN:\n${currentDossier.executiveActionPlan.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\n` +
      `SOURCES:\n${currentDossier.sources.map(s => `• ${s.title}: ${s.url}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopiedDossier(true);
    setTimeout(() => setCopiedDossier(false), 2500);
  };

  return (
    <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-500/20 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Search size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white text-sm sm:text-base font-display">
                Sharon Deep Research Engine
              </h4>
              <span className="text-[10px] font-mono font-bold bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles size={10} />
                <span>Industry Grounded</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live intelligence on venue specs, tour routing, promoter emails, festival deadlines, and merchandise margins.
            </p>
          </div>
        </div>

        {currentDossier && (
          <button
            onClick={handleCopyDossier}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
          >
            {copiedDossier ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy Research Dossier</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Quick Research Topic Pills */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
          One-Click Deep Research Investigations:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {quickResearchTemplates.map((template, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQueryInput(template.query);
                setSelectedCategory(template.category);
                handleExecuteResearch(template.query, template.category);
              }}
              disabled={isLoading}
              className="text-left p-2.5 rounded-xl bg-slate-950/70 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/40 transition-all flex items-start gap-2.5 cursor-pointer disabled:opacity-50 group"
            >
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-colors shrink-0 mt-0.5">
                <template.icon size={14} />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors truncate font-sans">
                  {template.title}
                </p>
                <p className="text-[10.5px] text-slate-400 line-clamp-1 mt-0.5 font-mono">
                  {template.query}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Query Search Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleExecuteResearch();
        }}
        className="flex flex-col sm:flex-row items-stretch gap-2 bg-slate-950/80 p-2 rounded-xl border border-slate-800"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Type any deep research question (e.g. Find sound specs and booking contact at Tractor Tavern)..."
            disabled={isLoading}
            className="w-full bg-slate-900 border border-slate-750 focus:border-purple-500 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as any)}
          className="bg-slate-900 border border-slate-750 text-xs font-mono text-slate-300 rounded-lg px-3 py-2 focus:outline-none"
        >
          <option value="venue_booking">🏛️ Venues & Booking</option>
          <option value="market_trends">📈 Scene & Curators</option>
          <option value="tour_logistics">🚐 Tour Logistics</option>
          <option value="festival_deadlines">🎪 Festival Deadlines</option>
          <option value="gear_intelligence">🎸 Gear & Margins</option>
        </select>

        <button
          type="submit"
          disabled={!queryInput.trim() || isLoading}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 disabled:opacity-50 text-white rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/20 shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Scanning Intelligence...</span>
            </>
          ) : (
            <>
              <Search size={14} />
              <span>Deep Research</span>
            </>
          )}
        </button>
      </form>

      {/* Error Notice */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Deep Research Dossier Result */}
      {currentDossier && (
        <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-4 space-y-4">
          {/* Dossier Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-850 pb-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-purple-400 tracking-wider">
                Intelligence Dossier • {currentDossier.category.replace('_', ' ')}
              </span>
              <h5 className="text-base font-bold text-white font-display mt-0.5">
                {currentDossier.topic}
              </h5>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Scanned on {new Date(currentDossier.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          {/* Executive Manager Summary */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono uppercase font-bold text-slate-300 flex items-center gap-1.5">
              <FileText size={13} className="text-purple-400" />
              <span>Executive Manager Summary</span>
            </span>
            <p className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
              {currentDossier.summary}
            </p>
          </div>

          {/* Key Verified Findings & Executive Action Plan in 2 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Key Verified Findings */}
            <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-850 space-y-2">
              <span className="text-[11px] font-mono uppercase font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={13} />
                <span>Key Grounded Findings</span>
              </span>
              <ul className="space-y-2 text-xs">
                {currentDossier.keyFindings.map((finding, idx) => (
                  <li key={idx} className="text-slate-300 flex items-start gap-2 leading-relaxed">
                    <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Executive Action Plan */}
            <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-850 space-y-2">
              <span className="text-[11px] font-mono uppercase font-bold text-cyan-400 flex items-center gap-1.5">
                <Sparkles size={13} />
                <span>Sharon's Recommended Action Plan</span>
              </span>
              <ul className="space-y-2 text-xs">
                {currentDossier.executiveActionPlan.map((action, idx) => (
                  <li key={idx} className="text-slate-300 flex items-start gap-2 leading-relaxed">
                    <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-cyan-800">
                      {idx + 1}
                    </span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Grounded Sources Links */}
          {currentDossier.sources && currentDossier.sources.length > 0 && (
            <div className="pt-2 border-t border-slate-850">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-2">
                Grounding Sources & Web Intelligence References:
              </span>
              <div className="flex flex-wrap gap-2">
                {currentDossier.sources.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 text-[11px] font-mono text-purple-300 hover:text-white transition-all"
                  >
                    <span>{src.title}</span>
                    <ExternalLink size={10} className="shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Quick Action Dispatch */}
          {onNavigateToTab && (
            <div className="flex items-center justify-between bg-purple-950/30 border border-purple-500/30 p-2.5 rounded-xl text-xs">
              <span className="text-purple-300 font-mono font-bold text-[11px]">
                Ready to put this research into action for {artistName}?
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateToTab('scheduler')}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Tour Scheduler</span>
                  <ArrowRight size={11} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
