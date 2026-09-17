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
  X,
  Menu,
  Clock,
  Layers,
  CheckCircle2,
  ListOrdered,
  Mic2,
  Radio,
  Scale,
  FileText,
  Phone,
  LifeBuoy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LegalDocsModal, { LegalDocType } from './LegalDocsModal';
import HelpTab from './HelpTab';

interface LandingPageProps {
  onEnterDemo: (email: string, artistName: string) => void;
  onEnterLogin: (preselectedTier?: string) => void;
}

export default function LandingPage({ onEnterDemo, onEnterLogin }: LandingPageProps) {
  const [isAnnual, setIsAnnual] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [demoEmail, setDemoEmail] = useState('');
  const [demoArtistName, setDemoArtistName] = useState('');
  const [demoError, setDemoError] = useState('');
  const [legalDoc, setLegalDoc] = useState<LegalDocType | null>(null);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const scrollToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
      id: 'weekly',
      name: 'Weekly Pass',
      priceMonthly: 7.75,
      priceAnnual: 6.20,
      periodLabel: '/ week',
      tag: 'SINGLE TOUR RUN',
      image: '/src/assets/images/concert_stage_header_1788820340861.jpg',
      desc: 'Flexible access pass with full Touring Pro features & 50 Sharon AI weekly credits.',
      features: [
        '🎁 14-Day Free Trial ($0 Due Today)',
        'Full Unrestricted Console Access',
        'Unlimited Registered Bands',
        'Interactive Gig & Tour Scheduler',
        '50 Sharon AI credits per week',
        'Budget accounting & split ledgers',
        'Public LinkTree & Event portals'
      ],
      cta: 'Start 14-Day Free Trial',
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
        '🎁 14-Day Free Trial ($0 Due Today)',
        'Unlimited Registered Bands',
        'Interactive Gig & Tour Scheduler',
        '150 Safe Sharon AI credits/mo',
        'Budget accounting & split ledgers',
        'Public LinkTree & Event portals',
        'Dedicated secure backup node'
      ],
      cta: 'Start 14-Day Free Trial',
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
        '🎁 14-Day Free Trial ($0 Due Today)',
        'Everything in Touring Pro',
        'VIP Geographic Tour Mapping',
        '500 Safe Sharon AI credits/mo',
        'Secure Cloud VIP cryptographic handshake',
        'Priority 24/7 dedicated server node',
        'Custom domain integration for portals'
      ],
      cta: 'Start 14-Day Free Trial',
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
      <nav className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-900 px-6 lg:px-12 py-3.5" id="landing-nav">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img 
              src="/assets/logo.png" 
              alt="Bandz Logo" 
              className="w-8 h-8 object-contain transition-transform group-hover:scale-105" 
            />
            <span className="text-sm font-black uppercase tracking-wider text-white font-display">Bandz</span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('landing-how-it-works')}
              className="text-xs font-bold text-slate-300 hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-2 group"
            >
              <span>How It Works</span>
              <span className="text-[9px] bg-purple-500/15 border border-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full font-mono font-bold group-hover:bg-purple-500/25 transition-colors">
                4 Steps
              </span>
            </button>
            <button 
              onClick={() => scrollToSection('landing-pricing')}
              className="text-xs font-bold text-slate-300 hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Pricing</span>
              <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-mono font-bold">
                14-Day Free
              </span>
            </button>
            <button 
              onClick={() => scrollToSection('landing-features')}
              className="text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Features
            </button>
            <button 
              onClick={() => setLegalDoc('privacy')}
              className="text-xs font-bold text-slate-400 hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1"
              title="View Google-Verified Privacy Policy"
            >
              <span>Privacy</span>
              <span className="text-[8.5px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-1 py-0.2 rounded font-mono font-bold">
                Google
              </span>
            </button>
            <button 
              onClick={() => setLegalDoc('terms')}
              className="text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Terms
            </button>
            <button 
              onClick={() => setShowSupportModal(true)}
              className="text-xs font-bold text-slate-300 hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Support Hotline (951) 594-5105 & Operations Wiki"
            >
              <LifeBuoy size={13} className="text-emerald-400" />
              <span>Support & Wiki</span>
            </button>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowDemoModal(true)}
              className="hidden sm:flex text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer font-bold items-center gap-1.5"
            >
              <span>Book Demo</span>
            </button>
            <button 
              onClick={() => onEnterLogin()}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer shadow-lg shadow-purple-600/15"
            >
              Launch App
            </button>
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pt-3 pb-2 border-t border-slate-900/80 mt-3 space-y-1.5"
            >
              <button
                onClick={() => scrollToSection('landing-how-it-works')}
                className="w-full text-left px-3 py-2 text-xs font-bold text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>How It Works</span>
                <span className="text-[9px] bg-purple-500/20 px-2 py-0.5 rounded-full font-mono">4 Steps</span>
              </button>
              <button
                onClick={() => scrollToSection('landing-pricing')}
                className="w-full text-left px-3 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>Pricing & Plans</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono">Free Trial</span>
              </button>
              <button
                onClick={() => scrollToSection('landing-features')}
                className="w-full text-left px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-900 rounded-lg transition-colors"
              >
                Platform Features
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setShowSupportModal(true);
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-1.5">
                  <Phone size={13} className="text-emerald-400" />
                  <span>Support Hotline & Wiki</span>
                </div>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono font-bold">(951) 594-5105</span>
              </button>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-900/60">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setLegalDoc('privacy');
                  }}
                  className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-purple-300 bg-slate-900/40 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck size={13} className="text-emerald-400" />
                  <span>Privacy Policy</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setLegalDoc('terms');
                  }}
                  className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900/40 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Scale size={13} className="text-slate-400" />
                  <span>Terms of Service</span>
                </button>
              </div>
              <div className="pt-2 border-t border-slate-900 flex gap-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowDemoModal(true);
                  }}
                  className="flex-1 text-center py-2 text-xs font-bold text-purple-300 bg-purple-500/10 border border-purple-500/20 rounded-lg"
                >
                  Book Demo
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onEnterLogin();
                  }}
                  className="flex-1 text-center py-2 text-xs font-bold text-white bg-purple-600 rounded-lg shadow-md shadow-purple-600/20"
                >
                  Launch App
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-12 relative z-10 scroll-mt-24" id="landing-features">
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

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 relative z-10 scroll-mt-24" id="landing-how-it-works">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/25 px-3 py-1 rounded-full">
            <ListOrdered size={13} className="text-purple-400" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-300">
              OPERATIONAL WORKFLOW
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight font-display">
            How Bandz Works
          </h2>
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
            From your first rehearsal to packed venue tours, Bandz unifies scheduling, setlist timing, AI publicity, and door settlements into one frictionless operational flow.
          </p>
        </div>

        {/* 4 Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Step 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="bg-slate-900/40 border border-slate-900 hover:border-purple-500/40 rounded-2xl p-6 relative flex flex-col justify-between transition-all group hover:bg-slate-900/60 shadow-lg"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg">
                  STEP 01
                </span>
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <Users size={18} />
                </div>
              </div>

              <div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  ONBOARDING & ROSTER
                </span>
                <h3 className="text-base font-bold text-slate-100 group-hover:text-purple-300 transition-colors font-display">
                  Set Up Band & Crew
                </h3>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Register your artist profiles, member roles, instruments, and agreed-upon financial split ratios. Store technical backline riders and hospitality requirements in one secure local node.
              </p>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center gap-2 text-[10px] text-purple-300 font-mono">
              <CheckCircle2 size={13} className="text-purple-400 shrink-0" />
              <span>Band roster & split percentages</span>
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="bg-slate-900/40 border border-slate-900 hover:border-emerald-500/40 rounded-2xl p-6 relative flex flex-col justify-between transition-all group hover:bg-slate-900/60 shadow-lg"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                  STEP 02
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Calendar size={18} />
                </div>
              </div>

              <div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  CALENDAR DISPATCH
                </span>
                <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-300 transition-colors font-display">
                  Schedule Any Event
                </h3>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Unify all band timelines in one master calendar. Dispatch live concert dates with venue contacts and door times, book lockout rehearsal studios, track recording sessions, or run sync meetings.
              </p>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center gap-2 text-[10px] text-emerald-300 font-mono">
              <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
              <span>Gigs • Rehearsals • Studio • Sync</span>
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.16 }}
            className="bg-slate-900/40 border border-slate-900 hover:border-violet-500/40 rounded-2xl p-6 relative flex flex-col justify-between transition-all group hover:bg-slate-900/60 shadow-lg"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-lg">
                  STEP 03
                </span>
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                  <Sparkles size={18} />
                </div>
              </div>

              <div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  TIMING & PROMOTION
                </span>
                <h3 className="text-base font-bold text-slate-100 group-hover:text-violet-300 transition-colors font-display">
                  Build Sets & AI Press
                </h3>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Sequence songs with real-time total duration tracking and tempo audits to hit venue curfews cleanly. Let your built-in AI Manager publicist draft press releases, social promos, and fan announcements.
              </p>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center gap-2 text-[10px] text-violet-300 font-mono">
              <CheckCircle2 size={13} className="text-violet-400 shrink-0" />
              <span>Minute calculations & press copy</span>
            </div>
          </motion.div>

          {/* Step 4 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.24 }}
            className="bg-slate-900/40 border border-slate-900 hover:border-amber-500/40 rounded-2xl p-6 relative flex flex-col justify-between transition-all group hover:bg-slate-900/60 shadow-lg"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                  STEP 04
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <DollarSign size={18} />
                </div>
              </div>

              <div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  TICKETS & SETTLEMENT
                </span>
                <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors font-display">
                  Sell Tickets & Split Pay
                </h3>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Publish high-converting LinkTree portals for fans to browse upcoming concerts and purchase tickets. Settle door guarantees, subtract production costs, and divide net income automatically among members.
              </p>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center gap-2 text-[10px] text-amber-300 font-mono">
              <CheckCircle2 size={13} className="text-amber-400 shrink-0" />
              <span>Automated pay distributions</span>
            </div>
          </motion.div>
        </div>

        {/* Action Callout Banner inside How It Works */}
        <div className="mt-12 bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900/80 border border-purple-500/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-bold text-white font-display">
              Ready to streamline your band's operations?
            </h3>
            <p className="text-xs text-slate-400">
              Start with our full-featured 14-day trial or test drive with an interactive live sandbox.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => scrollToSection('landing-pricing')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>View Pricing Plans</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => setShowDemoModal(true)}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-purple-600/20"
            >
              Claim 14-Day Trial
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Pricing Toggle & Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 relative z-10 scroll-mt-24" id="landing-pricing">
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

        {/* 3-Tier Grid with Free Trial at the beginning of each tier */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
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

                  {/* 14-Day Free Trial Callout at beginning of tier */}
                  <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-2.5 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      14-Day Free Trial
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                      $0 TODAY
                    </span>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1 pt-1">
                      <span className="text-3xl lg:text-4xl font-mono font-black text-slate-100">${price}</span>
                      <span className="text-xs text-slate-500 font-medium">{plan.periodLabel || '/ month'}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold block mt-1">
                      Starts with 14-Day Free Trial • Cancel anytime
                    </span>
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
                    onClick={() => onEnterLogin(plan.id)}
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

      {/* Footer with Navigation & Compliance */}
      <footer className="mt-auto bg-slate-950 border-t border-slate-900/80 py-10 px-6 lg:px-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <img src="/assets/logo.png" alt="Bandz Logo" className="w-5 h-5 object-contain opacity-70" />
              <span className="font-bold text-slate-300 uppercase tracking-wider text-xs font-display">Bandz Platform</span>
              <span className="text-slate-700">•</span>
              <span className="text-[11px] text-slate-500">The Independent Band Command Center</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5 text-[11px] font-medium">
              <button 
                onClick={() => scrollToSection('landing-how-it-works')}
                className="text-slate-400 hover:text-purple-300 transition-colors cursor-pointer"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection('landing-pricing')}
                className="text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                Pricing & Plans
              </button>
              <button 
                onClick={() => setShowSupportModal(true)}
                className="text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1 font-semibold"
              >
                <Phone size={12} className="text-emerald-400" />
                <span>Support: (951) 594-5105</span>
              </button>
              <button 
                onClick={() => setShowSupportModal(true)}
                className="text-slate-400 hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1 font-semibold"
              >
                <LifeBuoy size={12} className="text-purple-400" />
                <span>How-To & Wiki</span>
              </button>
              <button 
                onClick={() => setLegalDoc('privacy')}
                className="text-slate-400 hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1 font-semibold"
              >
                <ShieldCheck size={12} className="text-emerald-400" />
                <span>Privacy Policy</span>
              </button>
              <button 
                onClick={() => setLegalDoc('terms')}
                className="text-slate-400 hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1 font-semibold"
              >
                <Scale size={12} className="text-slate-400" />
                <span>Terms of Service</span>
              </button>
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                Back to Top ↑
              </button>
            </div>
          </div>

          {/* Google Compliance & Developer Identity Block */}
          <div className="pt-6 border-t border-slate-900/60 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-slate-600">
            <p className="max-w-2xl leading-relaxed text-center md:text-left">
              <strong className="text-slate-400">Google API Services User Data Policy Compliance:</strong> Bandz Platform's use and transfer to any other app of information received from Google APIs adheres to the{' '}
              <a 
                href="https://developers.google.com/terms/api-services-user-data-policy" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-purple-400 hover:text-purple-300 underline"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements. Google user data is never transferred, sold, or used to train AI models.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 shrink-0 font-mono text-[10px] text-slate-500">
              <span>Operated by A-List Webs</span>
              <span className="hidden sm:inline">•</span>
              <a href="mailto:support@alistwebs.com" className="text-purple-400 hover:underline">support@alistwebs.com</a>
              <span className="hidden sm:inline">•</span>
              <a href="tel:9515945105" className="text-emerald-400 hover:underline">(951) 594-5105</a>
              <span className="hidden sm:inline">•</span>
              <span>© 2026 Bandz Platform</span>
            </div>
          </div>
        </div>
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

      {/* Legal Documentation Modal (Privacy Policy & TOS) */}
      <AnimatePresence>
        {legalDoc !== null && (
          <LegalDocsModal
            isOpen={true}
            initialDoc={legalDoc}
            onClose={() => setLegalDoc(null)}
          />
        )}
      </AnimatePresence>

      {/* Support Center, How-To Manual & Wiki Modal */}
      <AnimatePresence>
        {showSupportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" id="support-wiki-landing-modal">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSupportModal(false)}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-5xl max-h-[92vh] bg-slate-950 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl z-10 overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 sticky top-0 bg-slate-950/95 backdrop-blur z-20">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <LifeBuoy size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 font-display uppercase tracking-wider">
                      Bandz Official Support Center, How-To Manual & Wiki
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Direct Hotline: (951) 594-5105 • Email: support@alistwebs.com
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowSupportModal(false)}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Close Modal"
                >
                  <X size={18} />
                </button>
              </div>

              <HelpTab 
                isModal={true}
                onClose={() => setShowSupportModal(false)}
                onOpenLegal={(doc) => {
                  setShowSupportModal(false);
                  setLegalDoc(doc);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
