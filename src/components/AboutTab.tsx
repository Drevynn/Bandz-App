import React, { useState } from 'react';
import { 
  Info, 
  Target, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  DollarSign, 
  PieChart, 
  Calendar, 
  Music, 
  Radio, 
  Users, 
  Compass, 
  Rocket, 
  CheckCircle2, 
  Copy, 
  Check, 
  ArrowRight,
  Flame,
  Layers,
  ChevronRight,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AboutTabProps {
  onNavigateToTab?: (tabId: string) => void;
}

export default function AboutTab({ onNavigateToTab }: AboutTabProps) {
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [activePillarTab, setActivePillarTab] = useState<'all' | 'ops' | 'creative' | 'market' | 'engagement'>('all');
  
  // Interactive Split Sheet demo state in Founders Kit
  const [splitGigPayout, setSplitGigPayout] = useState<number>(1200);
  const [memberSplits, setMemberSplits] = useState([
    { role: 'Lead Vocalist / Guitar', share: 25 },
    { role: 'Lead Guitar / BG Vocals', share: 25 },
    { role: 'Bass Guitar', share: 20 },
    { role: 'Drums & Percussion', share: 20 },
    { role: 'Sound Engineer / Manager', share: 10 },
  ]);

  const elevatorPitchText = `Band Aide is the central operating system for independent artists and band managers. Instead of juggling 10 disconnected tools for gig scheduling, budget splits, merchandise stock, and fan booking, Band Aide unifies operations, automated split-sheet finances, and press outreach into one high-performance command center powered by "The Manager" AI assistant. We give independent creators enterprise-grade business management so they spend less time on spreadsheets and more time making music.`;

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(elevatorPitchText);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2500);
  };

  const pillars = [
    {
      id: 'ops',
      name: 'Business Ops',
      icon: DollarSign,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      features: [
        'Real-time Finances & Net Tour Budget Ledger',
        'Automated Member Split Sheets & Payout Breakdown',
        'Merchandise Inventory & Stocking Alerts',
        'Gig Guarantees, Door Splits, Tips & Incidentals Tracking'
      ]
    },
    {
      id: 'creative',
      name: 'Creative Assets',
      icon: Music,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
      features: [
        'Central Song List Repository with Key & BPM metadata',
        'Lyrics, Chords & Live Transpose Cues',
        'Dynamic Setlist Pacing & Running Duration Analyzer',
        'High-Contrast Stage View Teleprompter'
      ]
    },
    {
      id: 'market',
      name: 'Market Reach',
      icon: Radio,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/30',
      features: [
        'Band Merch Store supply links & vendor order prompts',
        'Automated Press Kit (EPK) generation',
        'Streaming link hubs (Spotify, Apple Music, Bandcamp)',
        'Public Web Landing Pages & Tour Dates Portal'
      ]
    },
    {
      id: 'engagement',
      name: 'Engagement',
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/30',
      features: [
        'Key Contacts Notepad for talent buyers & sound engineers',
        'Opportunities Board with follow-up deal tracking',
        'Social Media Hype Copy Generator',
        'Fan Link Tree & Booking Inquiries Hub'
      ]
    }
  ];

  const roadmapMilestones = [
    {
      quarter: 'Month 1 - 2',
      title: 'Foundational Ops & Touring Engine',
      status: 'Live & Shipped',
      items: [
        'Unified Gig & Rehearsal Calendar with multi-artist filters',
        'Repertoire Library with chords & live duration analyzer',
        'Exportable Accounting CSV ledger & Net profit meters',
        'Multi-theme custom UI (Midnight Gold, Cyberpunk, Day)'
      ]
    },
    {
      quarter: 'Month 3 - 4',
      title: 'Automated Split Sheets & Mobile Sync',
      status: 'Current Phase',
      items: [
        'Dynamic payout calculation with direct ledger sync',
        'Merch inventory restock reminders with one-click vendor links',
        'Offline-first Firestore cloud database synchronization',
        'Interactive Contacts Notepad with status pipelines'
      ]
    },
    {
      quarter: 'Month 5 - 6',
      title: 'AI Multi-Agent & Touring Expansion',
      status: 'Next Roadmap',
      items: [
        'Live Geographic Tour Routing with smart fuel & buffer calculation',
        'AI Booking Agent with automated email draft generation',
        'Fanbase CRM integration with SMS / Email broadcast drops',
        'Multi-member permissions & agency shared management portals'
      ]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16" id="about-tab-root">
      {/* Header Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 backdrop-blur-md relative overflow-hidden shadow-2xl">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles size={13} className="text-purple-400" />
            Official Founders Kit & Company Overview
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-slate-100 tracking-tight">
            🎸 Band Aide: Founders Kit
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-3xl leading-relaxed">
            The all-in-one management ecosystem designed to empower independent musicians, band leaders, and artist managers to build sustainable, high-revenue music careers.
          </p>
          
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('scheduler')}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/25 flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Live Dashboard</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('budgets')}
              className="px-5 py-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <DollarSign size={14} className="text-emerald-400" />
              <span>View Finances & Splits</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. Executive Summary */}
      <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20">
            01
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-100">Executive Summary</h2>
        </div>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          <strong className="text-white">Band Aide</strong> is an all-in-one management ecosystem designed to empower independent musicians and band managers. By consolidating fragmented workflows—like financial tracking, merchandise management, and digital distribution—into a single intuitive dashboard, we allow creators to spend less time on spreadsheets and more time on their art.
        </p>
      </section>

      {/* 2. The Problem & Solution */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20">
            02
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-100">The Problem & Solution</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 space-y-4 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                <Target size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-100">The Problem</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              The <strong className="text-white">"DIY" music era</strong> has forced artists to juggle 10+ different apps for messaging, booking, royalty tracking, and fan engagement. This leads to severe data silos, missed opportunities, payout disputes, and creator burnout.
            </p>
            <div className="space-y-2 pt-2 border-t border-red-500/10 text-xs text-red-300/80">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span>Fragmented spreadsheet accounting & lost receipts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span>Disorganized setlists and forgotten arrangement cues</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span>Uncontacted venue leads and forgotten key contacts</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 space-y-4 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Zap size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-100">The Solution</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              A <strong className="text-white">centralized command center</strong>. Band Aide integrates every crucial vertical of the music business into one unified, offline-capable environment:
            </p>
            <div className="space-y-2.5 pt-2 border-t border-emerald-500/10 text-xs text-emerald-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Operations:</strong> Schedule, Inventory, Stage View & Song Lists.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Revenue:</strong> Finances, Split Sheets, Merch Supply & Distribution.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Growth:</strong> Fan CRM, Opportunities Notepad & Press Kit Builder.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Feature Pillars */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20">
              03
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-100">Core Feature Pillars</h2>
          </div>
          
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setActivePillarTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activePillarTab === 'all' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              All Pillars
            </button>
            {pillars.map(p => (
              <button
                key={p.id}
                onClick={() => setActivePillarTab(p.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  activePillarTab === p.id 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {pillars
            .filter(p => activePillarTab === 'all' || p.id === activePillarTab)
            .map(pillar => {
              const Icon = pillar.icon;
              return (
                <div key={pillar.id} className="bg-slate-900/50 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 space-y-4 transition-all shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl border ${pillar.bg} ${pillar.color}`}>
                        <Icon size={20} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-100">{pillar.name}</h3>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">PILLAR</span>
                  </div>

                  <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                    {pillar.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ChevronRight size={14} className="text-purple-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
        </div>
      </section>

      {/* 4. Competitive Advantage: The AI Assistant */}
      <section className="bg-gradient-to-br from-purple-950/40 via-slate-900/60 to-slate-900/40 border border-purple-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/20 px-2.5 py-1 rounded-md border border-purple-500/30">
            04
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-100 flex items-center gap-2.5">
            <Sparkles className="text-purple-400" size={24} />
            Competitive Advantage: The "AI Assistant"
          </h2>
        </div>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Unlike traditional, static CRMs, Band Aide features a built-in <strong className="text-purple-300">AI Assistant ("The Manager")</strong>. This allows founders and artists to automate mundane administrative tasks and focus entirely on high-leverage creative work:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-purple-500/20 space-y-2">
            <h4 className="font-bold text-purple-300 text-sm">Outreach Automation</h4>
            <p className="text-slate-400">Generates personalized pitch emails for venue talent buyers and festival curators tailored to your genre.</p>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-xl border border-purple-500/20 space-y-2">
            <h4 className="font-bold text-purple-300 text-sm">Financial Insights</h4>
            <p className="text-slate-400">Analyzes financial trends, gas/mileage breakevens, and calculates net profitability across gig guarantees.</p>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-xl border border-purple-500/20 space-y-2">
            <h4 className="font-bold text-purple-300 text-sm">Setlist Optimizer</h4>
            <p className="text-slate-400">Structures dynamic setlists based on energy curves, BPM transitions, and target venue set durations.</p>
          </div>
        </div>

        {onNavigateToTab && (
          <div className="pt-2">
            <button
              onClick={() => onNavigateToTab('promo')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/30 flex items-center gap-2 cursor-pointer"
            >
              <span>Consult The Manager AI</span>
              <ArrowRight size={13} />
            </button>
          </div>
        )}
      </section>

      {/* 5. Brand Identity */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20">
            05
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-100">Brand Identity</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-2">
            <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider block">MISSION</span>
            <h4 className="text-base font-bold text-slate-100">Democratize Artist Management</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              To democratize professional-grade artist management so any DIY band or indie manager can operate like a major label powerhouse.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-2">
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">VISION</span>
            <h4 className="text-base font-bold text-slate-100">The Modern Music OS</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              To become the operating system for the next million independent creators, touring ensembles, and independent record labels worldwide.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-2">
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">BRAND TONE</span>
            <h4 className="text-base font-bold text-slate-100">Professional & Gritty</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Professional, gritty (unapologetic rock & roll spirit), and obsessively efficient. Built by musicians, for musicians.
            </p>
          </div>
        </div>
      </section>

      {/* 💡 PRO-TIP FOR FINANCES: Interactive Split Sheet Calculator & Investor Pitch */}
      <section className="bg-emerald-950/20 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <PieChart size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded">
                  FOUNDERS PRO-TIP
                </span>
                <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                  <Flame size={12} /> Investor Killer Feature
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-100 mt-1">
                Automated Split Sheets & Member Payouts
              </h3>
            </div>
          </div>

          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab('budgets')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <span>Go to Finances Page</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          In the modern music industry, being able to <strong className="text-emerald-300">automatically calculate who gets what percentage of a gig guarantee or merch payout</strong> prevents band conflict and eliminates hours of spreadsheet math. Here is a live simulation of the Band Aide Split Sheet engine:
        </p>

        {/* Live Split Sheet Simulator */}
        <div className="bg-slate-950/80 border border-emerald-500/20 rounded-2xl p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-slate-300 block">Sample Gig Net Guarantee</span>
              <span className="text-[11px] text-slate-500">Adjust the amount to preview real-time member shares</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-400">$</span>
              <input
                type="number"
                value={splitGigPayout}
                onChange={(e) => setSplitGigPayout(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-32 bg-slate-900 border border-emerald-500/40 rounded-xl px-3 py-1.5 text-sm font-mono font-bold text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {memberSplits.map((item, idx) => {
              const payout = (splitGigPayout * (item.share / 100)).toFixed(2);
              return (
                <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold truncate" title={item.role}>{item.role}</span>
                    <span className="text-emerald-400 font-mono font-bold">{item.share}%</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-[10px] text-slate-500">Take-home</span>
                    <span className="text-base font-bold font-mono text-white">${payout}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 1-Minute Elevator Pitch */}
      <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Rocket className="text-purple-400" size={20} />
            <h3 className="text-lg sm:text-xl font-bold font-display text-slate-100">1-Minute Elevator Pitch</h3>
          </div>
          <button
            onClick={handleCopyPitch}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer border border-slate-700"
          >
            {copiedPitch ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copiedPitch ? 'Copied Pitch!' : 'Copy Elevator Pitch'}</span>
          </button>
        </div>

        <blockquote className="border-l-4 border-purple-500 pl-4 py-2 text-sm sm:text-base text-slate-300 italic leading-relaxed bg-purple-500/5 rounded-r-xl">
          "{elevatorPitchText}"
        </blockquote>
      </section>

      {/* 6-Month Strategic Roadmap */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5">
          <Calendar className="text-purple-400" size={20} />
          <h3 className="text-lg sm:text-xl font-bold font-display text-slate-100">6-Month Strategic Product Roadmap</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {roadmapMilestones.map((m, idx) => (
            <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider">{m.quarter}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    m.status === 'Live & Shipped' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : m.status === 'Current Phase'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                  }`}>
                    {m.status}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-100 mb-3">{m.title}</h4>
                <ul className="space-y-2 text-xs text-slate-400">
                  {m.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={13} className="text-purple-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Partner & Ecosystem Spotlight */}
      <section className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-purple-950/40 border border-amber-500/30 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase">
              Featured Partner
            </span>
          </div>
          <h4 className="text-base font-bold text-white font-display mt-1">
            Sovranly IP Creative & Technology Network
          </h4>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Proudly connected with Sovranly IP to empower live music producers, independent artists, and digital creators with modern web ecosystems.
          </p>
        </div>

        <a
          href="https://sovranlyip.com"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer shrink-0"
        >
          <span>Visit SovranlyIP.com</span>
          <ExternalLink size={13} />
        </a>
      </section>
    </div>
  );
}

