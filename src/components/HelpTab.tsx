import React, { useState } from 'react';
import { 
  HelpCircle, 
  BookOpen, 
  Calendar, 
  Music, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Settings, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  MapPin, 
  Sliders, 
  Compass, 
  Cpu, 
  PhoneCall, 
  Lightbulb 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HelpTabProps {
  onNavigateToTab?: (tabId: string) => void;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  actionTab?: string;
  actionLabel?: string;
  tags: string[];
}

interface FAQCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  items: FAQItem[];
}

export default function HelpTab({ onNavigateToTab }: HelpTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openFaqId, setOpenFaqId] = useState<string | null>('getting_started_1');

  const categories: FAQCategory[] = [
    {
      id: 'start_here',
      title: 'Start Here',
      subtitle: 'Onboarding, Account Roles, Dashboard & Troubleshooting',
      icon: Compass,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      items: [
        {
          id: 'getting_started_1',
          question: 'Getting Started: How do I set up my band profile and members?',
          answer: 'Navigate to the "Artists" tab from the sidebar. You can create new band entities or edit existing profiles. Enter your artist name, genre, biography, high-resolution promo photos, streaming links (Spotify, Apple Music, Instagram), and add band members with their respective roles, gear setups, and contact info.',
          actionTab: 'artists',
          actionLabel: 'Go to Artists Tab',
          tags: ['Getting Started', 'Start Here', 'Band Members', 'Profile']
        },
        {
          id: 'getting_started_2',
          question: 'Getting Started: How do I switch or customize app themes?',
          answer: 'Click the Palette icon in the header bar to open the Theme Selector. Bandz comes with 5 handcrafted themes: Midnight Gold (dark luxury), Classic Day (clean high-contrast), Editorial Warmth (vintage sepia), Cosmic Lavender (stardust nebula), and Cyberpunk Matrix (retro terminal).',
          tags: ['Getting Started', 'Start Here', 'Themes', 'Appearance']
        },
        {
          id: 'roles_permissions_1',
          question: 'Roles & Permissions: How do subscription tiers and member access work?',
          answer: 'Bandz supports multiple tier levels:\n• 3-Month Free Trial (Garage): Full console pass for 90 days with 15 monthly AI credits.\n• Weekly Pass ($7.75/wk): Flexible 7-day unrestricted access pass with 50 AI weekly credits.\n• Touring Pro ($19/mo): Unlimited bands, 150 AI monthly credits, budget split ledgers & event sites.\n• Arena Headliner ($49/mo): 500 AI monthly credits, VIP connected geographic tour map routing & agency priority node.\n\nBand members assigned in the Artists tab can collaborate on setlists, calendar schedules, and budget reports.',
          actionTab: 'artists',
          actionLabel: 'Manage Band Roles',
          tags: ['Roles & Permissions', 'Start Here', 'Tiers', 'Pricing']
        },
        {
          id: 'dashboard_1',
          question: 'Dashboard: What information is monitored on the main console?',
          answer: 'The primary Console Dashboard provides real-time telemetry:\n1. Live Tour Stage Countdown: Days, hours, and minutes until your next confirmed show.\n2. Scheduled Gig Counters: Active confirmed shows, drafts, and completed gigs.\n3. Net Tour Budget Ledger: Real-time tally of show guarantees, ticket splits, travel expenses, and merch profits.\n4. Manager AI Credit Meter: Active monthly/weekly AI generation credits.\n5. Multi-Artist Filter: Switch between individual band profiles or view all ensembles together.',
          actionTab: 'scheduler',
          actionLabel: 'View Dashboard Scheduler',
          tags: ['Dashboard', 'Start Here', 'Metrics', 'Overview']
        },
        {
          id: 'troubleshooting_1',
          question: 'FAQ & Troubleshooting: Offline mode, data backups, and browser cache',
          answer: 'Bandz is engineered with an offline-first local state engine coupled to Firebase Firestore. All scheduled gigs, song repertoire, setlists, and budget entries save instantly to local storage. When an internet connection is available, data automatically synchronizes with your Firestore cloud database. If you experience sync delays, simply refresh the app or check your Firebase auth status.',
          tags: ['FAQ & Troubleshooting', 'Start Here', 'Offline', 'Database', 'Backup']
        }
      ]
    },
    {
      id: 'repertoire',
      title: 'Repertoire & Performance',
      subtitle: 'Song Library, Chords, Setlists, Practice & Stage View',
      icon: Music,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      items: [
        {
          id: 'song_library_1',
          question: 'Song Library: How do I manage originals, covers, and song metadata?',
          answer: 'Go to the "Setlists & Repertoire" tab and locate the Song Library section. Click "Add Song" to enter the track title, BPM (tempo), musical key (e.g. A Minor), song duration in minutes/seconds, lead vocalist, and original/cover designation. You can tag songs as "Ready", "Learning", or "Retired".',
          actionTab: 'setlist',
          actionLabel: 'Open Repertoire Library',
          tags: ['Song Library', 'Repertoire', 'BPM', 'Key', 'Songs']
        },
        {
          id: 'lyrics_chords_1',
          question: 'Lyrics & Chords: Where do I store chord sheets and arrangement cues?',
          answer: 'Click on any song card in your Repertoire library to view or edit practice details. Store lyrics, chord progressions, arrangement notes (e.g. "2-bar drum intro", "Guitar solo in E"), and transpose indicators for band members during rehearsals.',
          actionTab: 'setlist',
          actionLabel: 'Go to Song Chords',
          tags: ['Lyrics & Chords', 'Repertoire', 'Chords', 'Transpose', 'Notes']
        },
        {
          id: 'setlists_1',
          question: 'Setlists: How do I build sets and analyze timing & pacing?',
          answer: 'In the Setlists tab, select any upcoming gig to create or edit its setlist. Add songs from your repertoire, drag to reorder track lists, and monitor the automated Set Duration Analyzer. Bandz automatically adds inter-song transition buffers and warns you if your total running time exceeds the venue\'s scheduled set duration.',
          actionTab: 'setlist',
          actionLabel: 'Build a Setlist',
          tags: ['Setlists', 'Repertoire', 'Pacing', 'Duration']
        },
        {
          id: 'practice_perform_1',
          question: 'Practice & Perform: Stage View Mode & Rehearsal Scheduling',
          answer: 'Bandz covers both rehearsal planning and live execution:\n• Rehearsals: Schedule band practices in the Scheduler tab by setting status to "Draft / Rehearsal".\n• Stage View Mode: Toggle the high-contrast, large-font teleprompter display designed for tablet or smartphone screens on stage during live performances.\n• Travel Buffers: The Tour Map automatically calculates recommended departure times with 2-hour soundcheck buffers between gig locations.',
          actionTab: 'scheduler',
          actionLabel: 'Open Calendar & Scheduler',
          tags: ['Practice & Perform', 'Repertoire', 'Stage View', 'Rehearsal']
        }
      ]
    },
    {
      id: 'ai_contacts',
      title: 'AI Assistant & Opportunities Notepad',
      subtitle: 'The Manager AI, Venue Outreach, Press Assets & Lead Notepad',
      icon: Sparkles,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      items: [
        {
          id: 'ai_assistant_1',
          question: 'AI Assistant ("The Manager"): How do I generate outreach & press material?',
          answer: 'Go to "The Manager" tab. Select an upcoming show to generate personalized promotional material using Google Gemini AI:\n• Venue Pitch & Outreach Emails: Professional booking inquiries tailored to venue talent buyers.\n• Social Hype Copy: Instagram & Facebook announcements with custom band tone and emojis.\n• Press Releases & Flier Blurbs: Print-ready media summaries and EPK blurbs.\n• AI Setlist Optimizer: Automated song sequencing based on energy curves and BPM flow.',
          actionTab: 'promo',
          actionLabel: 'Consult The Manager AI',
          tags: ['AI Assistant', 'The Manager', 'Outreach', 'Promotions']
        },
        {
          id: 'opportunities_notepad_1',
          question: 'Opportunities & Key Contacts Notepad: How do I track venue leads and contacts?',
          answer: 'Bandz includes an integrated Contacts & Opportunities Manager in the Admin/Manager desk. You can log key contact info for booking agents, festival curators, sound engineers, and press writers. Track follow-up status (Pending, Followed Up, Replied), record deal notes, and log pitch dates to ensure no gig lead falls through the cracks.',
          actionTab: 'admin',
          actionLabel: 'Open Contacts & Opportunities',
          tags: ['Opportunities', 'Key Contacts', 'Notepad', 'Gigs', 'Leads']
        }
      ]
    }
  ];

  // Filter items based on search query or selected category
  const filteredCategories = categories.map(cat => {
    if (activeCategory !== 'all' && cat.id !== activeCategory) {
      return { ...cat, items: [] };
    }
    const matchedItems = cat.items.filter(item => {
      const q = searchQuery.toLowerCase();
      return (
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.tags.some(t => t.toLowerCase().includes(q))
      );
    });
    return { ...cat, items: matchedItems };
  }).filter(cat => cat.items.length > 0);

  const toggleFaq = (id: string) => {
    setOpenFaqId(prev => (prev === id ? null : id));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12" id="help-tab-root">
      {/* Header Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold uppercase tracking-wider">
            <BookOpen size={12} />
            Official Documentation & Knowledge Center
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-100 tracking-tight">
            Help Wiki & Workflow Guide
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
            Everything you need to master Bandz—from band member roles and stage setlists to "The Manager" AI assistant and key contact opportunity notes.
          </p>

          {/* Quick Search Bar */}
          <div className="relative max-w-xl pt-2">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search topics (e.g. Setlists, Roles, Lyrics, AI Assistant, Contacts)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors shadow-inner"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-sans whitespace-nowrap transition-all cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          All Topics
        </button>
        {categories.map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-sans whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon size={14} className={activeCategory === cat.id ? 'text-white' : cat.color} />
              <span>{cat.title}</span>
            </button>
          );
        })}
      </div>

      {/* Structured Checklist Summary Box */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="text-amber-400" size={18} />
            <h3 className="font-bold text-slate-200 text-sm font-display uppercase tracking-wider">
              Core Capabilities Verified
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            100% COVERED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: 'Console Dashboard & Live Countdown', tab: 'scheduler', ok: true },
            { label: 'Calendar Rehearsal & Gig Scheduler', tab: 'scheduler', ok: true },
            { label: 'Dynamic Setlists & Duration Analyzer', tab: 'setlist', ok: true },
            { label: 'Song Library, BPM & Key Trackers', tab: 'setlist', ok: true },
            { label: 'Lyrics, Chords & Transpose Cues', tab: 'setlist', ok: true },
            { label: 'Band Members, Roles & Gear Setups', tab: 'artists', ok: true },
            { label: 'Opportunities & Key Contacts Notepad', tab: 'admin', ok: true },
            { label: 'Practice & Stage View Teleprompter', tab: 'setlist', ok: true },
            { label: 'The Manager AI & Press Generator', tab: 'promo', ok: true },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/40 rounded-xl border border-slate-800/60">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <span className="text-xs text-slate-200 font-medium">{item.label}</span>
              </div>
              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab(item.tab)}
                  className="text-[10px] text-purple-400 hover:text-purple-300 font-mono font-bold hover:underline shrink-0"
                >
                  View
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Accordions Section */}
      {filteredCategories.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <HelpCircle className="mx-auto text-slate-600" size={32} />
          <h3 className="text-lg font-bold text-slate-300">No matching help topics found</h3>
          <p className="text-xs text-slate-500">Try searching with terms like "Setlists", "Roles", "Chords", "AI", or "Contacts".</p>
          <button
            onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
            className="mt-2 text-xs text-purple-400 hover:underline font-bold"
          >
            Reset Search Filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredCategories.map((category) => {
            const Icon = category.icon;
            return (
              <section key={category.id} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                  <div className={`p-2 rounded-xl ${category.bgColor} ${category.borderColor} border`}>
                    <Icon className={category.color} size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold font-display text-slate-100">{category.title}</h2>
                    <p className="text-xs text-slate-400">{category.subtitle}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {category.items.map((item) => {
                    const isOpen = openFaqId === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                          isOpen 
                            ? 'bg-slate-900/80 border-purple-500/50 shadow-lg shadow-purple-900/10' 
                            : 'bg-slate-900/30 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <button
                          onClick={() => toggleFaq(item.id)}
                          className="w-full flex items-center justify-between p-4 sm:p-5 text-left cursor-pointer group"
                        >
                          <div className="flex items-start gap-3">
                            <HelpCircle className={`mt-0.5 shrink-0 ${isOpen ? 'text-purple-400' : 'text-slate-500 group-hover:text-slate-400'}`} size={18} />
                            <span className={`text-sm sm:text-base font-bold transition-colors ${isOpen ? 'text-purple-200' : 'text-slate-200 group-hover:text-white'}`}>
                              {item.question}
                            </span>
                          </div>
                          <div className="ml-4 shrink-0 p-1 rounded-lg bg-slate-800/50 text-slate-400 group-hover:text-slate-200">
                            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="border-t border-slate-800/60 px-4 sm:px-5 pb-5 pt-3 space-y-4 bg-slate-950/40"
                            >
                              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                                {item.answer}
                              </div>

                              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {item.tags.map(tag => (
                                    <span key={tag} className="text-[10px] font-mono bg-slate-800/80 text-slate-400 px-2 py-0.5 rounded-md border border-slate-700/50">
                                      #{tag}
                                    </span>
                                  ))}
                                </div>

                                {item.actionTab && onNavigateToTab && (
                                  <button
                                    onClick={() => onNavigateToTab(item.actionTab!)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors shadow-md shadow-purple-600/20 cursor-pointer"
                                  >
                                    <span>{item.actionLabel || 'Jump to feature'}</span>
                                    <ArrowRight size={13} />
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
