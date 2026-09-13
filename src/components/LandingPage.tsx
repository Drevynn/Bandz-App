import React, { useState } from 'react';
import { 
  Calendar, 
  Sparkles, 
  Music, 
  DollarSign, 
  ArrowRight, 
  Check, 
  ShieldCheck, 
  Zap, 
  Users, 
  Link, 
  Lock,
  Globe,
  Database,
  User,
  Mail,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LandingPageProps {
  onEnterDemo: (email: string, artistName: string) => void;
  onEnterLogin: (preselectedTier?: string) => void;
}

export default function LandingPage({ onEnterDemo, onEnterLogin }: LandingPageProps) {
  const [isAnnual, setIsAnnual] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoEmail, setDemoEmail] = useState('');
  const [demoArtistName, setDemoArtistName] = useState('');
  const [demoError, setDemoError] = useState('');

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoEmail.trim()) {
      setDemoError('Please enter your administrator email address.');
      return;
    }
    if (!demoArtistName.trim()) {
      setDemoError('Please enter your Artist or Band Name.');
      return;
    }
    setDemoError('');
    onEnterDemo(demoEmail.trim(), demoArtistName.trim());
  };

  const plans = [
    {
      id: 'garage',
      name: '3-Month Free Trial',
      priceMonthly: 0,
      priceAnnual: 0,
      periodLabel: '/ 3 months',
      tag: 'SOUNDCHECK PASS',
      image: '/src/assets/images/gold_pick_1783213481183.jpg',
      desc: 'Standard console pass. Try our scheduling, accounting and press desk tools completely free for 90 days.',
      features: [
        'Full 3-Month Console Pass',
        'Up to 3 Registered Bands',
        'Interactive Gig Scheduler',
        '15 Safe AI credits/mo (Saves costs)',
        'Local browser storage persistence',
        'Anti-Abuse Verification Safeguard'
      ],
      cta: 'Claim 3-Month Trial',
      popular: false,
      accent: 'border-slate-800 hover:border-slate-700'
    },
    {
      id: 'weekly',
      name: 'Weekly Pass',
      priceMonthly: 7.75,
      priceAnnual: 6.20,
      periodLabel: '/ week',
      tag: 'SINGLE TOUR RUN',
      image: '/src/assets/images/concert_stage_header_1788820340861.jpg',
      desc: 'Flexible 7-day access pass with full Touring Pro features & 50 AI weekly credits.',
      features: [
        'Full 7-Day Unrestricted Access',
        'Unlimited Registered Bands',
        'Interactive Gig Scheduler',
        '50 AI credits per week',
        'Budget accounting & split ledgers',
        'Public LinkTree & Event portals'
      ],
      cta: 'Subscribe Weekly ($7.75/wk)',
      popular: false,
      accent: 'border-cyan-500/30 hover:border-cyan-400/50 bg-slate-900/40'
    },
    {
      id: 'pro',
      name: 'Touring Pro',
      priceMonthly: 19,
      priceAnnual: 15,
      periodLabel: '/ month',
      tag: 'ALL-ACCESS PASS',
      image: '/src/assets/images/venue_backstage_header_1788820358944.jpg',
      desc: 'Optimized for active gigging bands, touring ensembles, and booking agents.',
      features: [
        'Unlimited Registered Bands',
        'Interactive Gig Scheduler',
        '150 Safe AI credits/mo (Prevents upside-down cost)',
        'Budget accounting & split ledgers',
        'Public LinkTree & Event portals',
        'Dedicated secure backup node'
      ],
      cta: 'Subscribe Pro',
      popular: true,
      accent: 'border-purple-500/50 hover:border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.15)] bg-slate-900/60'
    },
    {
      id: 'arena',
      name: 'Arena Headliner',
      priceMonthly: 49,
      priceAnnual: 39,
      periodLabel: '/ month',
      tag: 'ARENA SYNDICATE',
      image: '/src/assets/images/vip_ticket_1783213501263.jpg',
      desc: 'Built for major label acts, festival managers, and professional agencies.',
      features: [
        'Everything in Touring Pro',
        'VIP Geographic Tour Mapping',
        '500 Safe AI credits/mo (Prevents runaway API usage)',
        'Secure Cloud VIP cryptographic handshake',
        'Priority 24/7 dedicated server node',
        'Custom domain integration for portals'
      ],
      cta: 'Subscribe Arena',
      popular: false,
      accent: 'border-amber-500/30 hover:border-amber-500/50'
    }
  ];

  const features = [
    {
      icon: Calendar,
      title: 'Gig Scheduler HUD',
      tag: 'DISPATCH & TIMELINE',
      image: '/src/assets/images/concert_stage_header_1788820340861.jpg',
      desc: 'Keep load-in, set times, addresses, and ticketing synchronized on a unified visual timetable.'
    },
    {
      icon: Sparkles,
      title: 'The AI Manager publicist',
      tag: 'AI PRESS OFFICER',
      image: '/src/assets/images/hero_banner_stage_1784716444784.jpg',
      desc: 'Instantly generate newsletter templates, Instagram captions, Twitter teasers, and formal press releases.'
    },
    {
      icon: Music,
      title: 'Tempo & Setlist Builder',
      tag: 'SETLIST COMPOSER',
      image: '/src/assets/images/gold_pick_1783213481183.jpg',
      desc: 'Sequence songs with real-time total duration tracking, automatic genre pacing audits, and key pairing guides.'
    },
    {
      icon: DollarSign,
      title: 'Cost Ledger Splitter',
      tag: 'FINANCIAL SPLITS',
      image: '/src/assets/images/vip_ticket_1783213501263.jpg',
      desc: 'Ditch the spreadsheets. Track expenses, food buy-outs, and share ticket revenues instantly across band members.'
    },
    {
      icon: Link,
      title: 'Dynamic Fan Portals',
      tag: 'FAN CHANNELS',
      image: '/src/assets/images/venue_backstage_header_1788820358944.jpg',
      desc: 'Construct sleek public LinkTree profiles and responsive ticket sales/event cards with automated maps references.'
    },
    {
      icon: Database,
      title: 'Secure Local Storage Node',
      tag: 'DATA SAFEGUARD',
      image: '/src/assets/images/concert_bg_1783213491029.jpg',
      desc: 'All artist data remains stored cryptographically inside your local browser node—completely secure.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden" id="landing-root">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-[500px] h-[500px] rounded-full bg-violet-600/5 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />

      {/* Top of Page Hero Stage Atmosphere */}
      <div 
        className="absolute top-0 left-0 right-0 h-[500px] bg-cover bg-top opacity-15 pointer-events-none"
        style={{ backgroundImage: "url('/src/assets/images/concert_stage_header_1788820340861.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/80 to-slate-950" />
      </div>

      {/* Landing Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 lg:px-12 py-4 flex items-center justify-between" id="landing-nav">
        <div className="flex items-center gap-3">
          <img 
            src="/assets/logo.png" 
            alt="Bandz Logo" 
            className="w-8 h-8 object-contain" 
          />
          <span className="text-sm font-black uppercase tracking-wider text-white font-display">Bandz</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowDemoModal(true)}
            className="text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer font-bold flex items-center gap-1.5"
          >
            <span>Book Demo</span>
          </button>
          <button 
            onClick={() => onEnterLogin()}
            className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer shadow-lg shadow-purple-600/15"
          >
            Launch Premium App
          </button>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="max-w-4xl mx-auto text-center px-6 pt-10 pb-12 relative z-10" id="landing-hero">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 flex flex-col items-center"
        >
          {/* Hero Emblem Showcase - Moved to top of page */}
          <div className="flex flex-col items-center justify-center relative pt-2 pb-2">
            <div className="relative group flex items-center justify-center">
              {/* Subtle ambient backglow */}
              <div className="absolute inset-0 rounded-full bg-purple-600/20 blur-3xl scale-125 pointer-events-none group-hover:bg-purple-600/35 transition-all duration-700" />
              
              <img 
                src="/assets/logo.png" 
                alt="Bandz Logo Hero Emblem" 
                referrerPolicy="no-referrer"
                className="relative z-10 w-52 sm:w-64 md:w-72 h-52 sm:h-64 md:h-72 object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.7)] group-hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Stage HUD Status Pill */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 px-4 py-1.5 rounded-full shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-white uppercase tracking-wider font-display">LIVE TOUR STAGE HUD ACTIVE</span>
              </div>
              <span className="hidden sm:inline text-slate-700">•</span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">Setlists, tempo pacing & cost splits</span>
              <span className="text-slate-700">•</span>
              <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-500/20 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                100% SECURE NODE
              </span>
            </div>
          </div>

          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full inline-block">
            STATION HEADQUARTERS FOR MUSICIANS
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-[1.1] font-display">
            The Ultimate Command Center <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-300 to-amber-400">
              for Independent Artists
            </span>
          </h1>
          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Construct gigs, program setlists with total timing precision, manage budgets splits, and consult your professional AI manager publicist—all inside a sleek, modular workspace.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onEnterLogin('pro')}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 group shadow-xl shadow-purple-600/20"
            >
              <span>Get Full Access</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setShowDemoModal(true)}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-bold text-sm px-6 py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Book Live Demo</span>
            </button>
          </div>
        </motion.div>
      </header>

      {/* Feature Showcase Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-12 relative z-10" id="landing-features">
        <div className="text-center mb-12">
          <h2 className="text-xs uppercase font-bold tracking-widest text-purple-400 mb-2">Engine Modules</h2>
          <p className="text-2xl font-bold text-slate-100">Engineered Specifically for Music Crews</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="group bg-slate-900/40 border border-slate-900 hover:border-purple-500/40 rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col"
              >
                {/* Header Image corresponding to feature title */}
                <div className="relative h-40 w-full overflow-hidden bg-slate-950">
                  <img
                    src={feat.image}
                    alt={feat.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-85 group-hover:brightness-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                  <span className="absolute top-3 left-3 text-[9px] font-mono font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md border border-purple-500/30 text-purple-300 px-2.5 py-1 rounded-md">
                    {feat.tag}
                  </span>
                  <div className="absolute bottom-3 left-3 bg-purple-600/90 backdrop-blur-sm p-2 rounded-xl text-white shadow-md">
                    <Icon size={18} />
                  </div>
                </div>

                <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-purple-300 transition-colors">{feat.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Interactive Pricing Toggle & Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 relative z-10" id="landing-pricing">
        <div className="text-center space-y-4 mb-10">
          <h2 className="text-xs uppercase font-bold tracking-widest text-purple-400">Honest, Predictable Pricing</h2>
          <p className="text-2xl font-black text-slate-100 uppercase">Select Your Operational Tier</p>
          
          {/* Billing Switcher */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <span className={`text-xs font-semibold ${!isAnnual ? 'text-white' : 'text-slate-500'}`}>Monthly Billing</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-11 h-6 bg-slate-900 rounded-full p-0.5 transition-colors focus:outline-none border border-slate-800 relative cursor-pointer"
            >
              <div 
                className={`w-4.5 h-4.5 bg-purple-500 rounded-full transition-transform duration-200 ${
                  isAnnual ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-semibold flex items-center gap-1.5 ${isAnnual ? 'text-white' : 'text-slate-500'}`}>
              <span>Annual Billing</span>
              <span className="text-[9px] bg-amber-500/10 border border-amber-500/30 text-amber-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase animate-pulse">Save 20%</span>
            </span>
          </div>
        </div>

        {/* 4-Tier Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan) => {
            const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={`group relative flex flex-col justify-between border rounded-3xl p-6 lg:p-7 backdrop-blur-md transition-all overflow-hidden ${plan.accent}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 right-6 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-mono font-bold text-[8px] tracking-widest uppercase px-3.5 py-1 rounded-full border border-purple-400/30 shadow-md z-20">
                    POPULAR HIGHWAY
                  </span>
                )}

                <div className="space-y-6">
                  {/* Plan Header Image Thumbnail */}
                  <div className="relative h-24 -mx-6 -mt-6 lg:-mx-7 lg:-mt-7 mb-4 overflow-hidden border-b border-slate-850/60 bg-slate-950">
                    <img
                      src={plan.image}
                      alt={plan.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center opacity-40 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                    <span className="absolute bottom-2 left-6 text-[9px] font-mono font-bold uppercase tracking-widest text-purple-300 bg-slate-950/70 border border-purple-500/30 px-2 py-0.5 rounded">
                      {plan.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-100 tracking-tight font-display uppercase">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{plan.desc}</p>
                  </div>

                  <div className="flex items-baseline gap-1 pt-2">
                    <span className="text-3xl lg:text-4xl font-mono font-black text-slate-100">${price}</span>
                    <span className="text-xs text-slate-500 font-medium">{plan.periodLabel || '/ month'}</span>
                  </div>

                  <hr className="border-slate-900" />

                  {/* Feature list */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Includes Features</span>
                    <ul className="space-y-2.5">
                      {plan.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-3.5 text-xs text-slate-300">
                          <Check size={14} className="text-purple-400 mt-0.5 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Pricing CTA */}
                <div className="pt-8">
                  <button
                    onClick={() => {
                      if (plan.id === 'garage') {
                        setShowDemoModal(true);
                      } else {
                        onEnterLogin(plan.id);
                      }
                    }}
                    className={`w-full font-bold text-xs py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      plan.popular
                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/15'
                        : 'bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200'
                    }`}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Trust & Shield details */}
      <section className="max-w-md mx-auto text-center px-6 py-8 text-slate-500 space-y-2 text-[10px] relative z-10 border-t border-slate-950">
        <div className="flex justify-center gap-1.5 items-center text-purple-400 font-bold uppercase tracking-wider font-mono mb-1">
          <ShieldCheck size={14} />
          <span>PROCESSED VIA SECURE SANDBOX HANDSHAKE</span>
        </div>
        <p>No real funds are captured during this preview simulation. Feel free to upgrade to any plan, test the secure payment flow, and instantly gain unrestricted premium app access.</p>
      </section>

      {/* Simple Footer */}
      <footer className="mt-auto bg-slate-950 border-t border-slate-900/60 py-6 text-center text-[10px] text-slate-600">
        <p>© 2026 Bandz. Constructed for Independent Artists & Band Managers.</p>
      </footer>

      {/* Demo Captured Form Modal */}
      <AnimatePresence>
        {showDemoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="demo-capture-modal">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDemoModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-2xl space-y-6 z-10 overflow-hidden"
            >
              {/* Subtle accent glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

              {/* Header */}
              <div className="flex items-start justify-between relative">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-full inline-block">
                    BOOK DEMO LEAD CAPTURE
                  </span>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight font-display">
                    Book Live Demo & Access Sandbox
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Enter your band and administrator contact details to secure your demo session and unlock the sandbox console.
                  </p>
                </div>
                <button
                  onClick={() => setShowDemoModal(false)}
                  className="text-slate-500 hover:text-white transition-colors p-1 hover:bg-slate-800/50 rounded-lg cursor-pointer border-none bg-transparent"
                >
                  <X size={16} />
                </button>
              </div>

              {demoError && (
                <div className="text-[11px] font-mono font-semibold bg-red-500/10 text-red-400 border border-red-500/20 px-3.5 py-2.5 rounded-xl flex items-center gap-2">
                  <span className="shrink-0 font-bold uppercase text-red-500">Error:</span>
                  <span>{demoError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleDemoSubmit} className="space-y-4 relative">
                <div className="space-y-1.5 text-left">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    Artist / Band Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nirvana, The Velvet Underground"
                      value={demoArtistName}
                      onChange={(e) => setDemoArtistName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-purple-500/50 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-200 focus:outline-none"
                    />
                    <User size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    Administrator Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="manager@yourband.com"
                      value={demoEmail}
                      onChange={(e) => setDemoEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-purple-500/50 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-200 focus:outline-none"
                    />
                    <Mail size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-xs py-3.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-purple-600/20 uppercase tracking-widest flex items-center justify-center gap-2 group border-none"
                  >
                    <span>Confirm Booking & Launch Demo</span>
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </form>

              <div className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1.5 font-mono">
                <ShieldCheck size={12} className="text-purple-500" />
                <span>DATA STORED LOCALLY • NO CREDIT CARD REQUIRED</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
