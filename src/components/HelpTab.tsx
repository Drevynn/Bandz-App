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
  Lightbulb,
  Scale,
  ExternalLink,
  Phone,
  Mail,
  Clock,
  Send,
  Check,
  Copy,
  AlertTriangle,
  Radio,
  FileCode,
  DollarSign,
  Briefcase,
  Mic2,
  Share2,
  Terminal,
  Info,
  LifeBuoy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HelpTabProps {
  onNavigateToTab?: (tabId: string) => void;
  onOpenLegal?: (doc: 'privacy' | 'terms') => void;
  isModal?: boolean;
  onClose?: () => void;
  userEmail?: string;
  artistName?: string;
}

interface SupportTicket {
  id: string;
  name: string;
  email: string;
  phone: string;
  bandName: string;
  category: string;
  priority: 'urgent' | 'high' | 'normal';
  subject: string;
  message: string;
  timestamp: string;
  status: 'received' | 'investigating' | 'resolved';
}

type MainViewMode = 'all' | 'support' | 'howto' | 'wiki' | 'faq';

export default function HelpTab({ 
  onNavigateToTab, 
  onOpenLegal,
  isModal = false,
  onClose,
  userEmail = '',
  artistName = ''
}: HelpTabProps) {
  const [viewMode, setViewMode] = useState<MainViewMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeHowToId, setActiveHowToId] = useState<string | null>('howto_gigs');
  const [activeWikiId, setActiveWikiId] = useState<string | null>('wiki_arch');
  const [openFaqId, setOpenFaqId] = useState<string | null>('getting_started_1');

  // Contact / Ticket Form State
  const [ticketName, setTicketName] = useState('');
  const [ticketEmail, setTicketEmail] = useState(userEmail || '');
  const [ticketPhone, setTicketPhone] = useState('');
  const [ticketBand, setTicketBand] = useState(artistName || '');
  const [ticketCategory, setTicketCategory] = useState('Gig Emergency / Show Tonight');
  const [ticketPriority, setTicketPriority] = useState<'urgent' | 'high' | 'normal'>('high');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<SupportTicket | null>(null);
  const [copiedContact, setCopiedContact] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedContact(label);
    setTimeout(() => setCopiedContact(null), 2500);
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketEmail.trim() || !ticketMessage.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newTicket: SupportTicket = {
        id: `TK-${Math.floor(10000 + Math.random() * 90000)}`,
        name: ticketName.trim() || 'Band Manager',
        email: ticketEmail.trim(),
        phone: ticketPhone.trim() || 'Not specified',
        bandName: ticketBand.trim() || 'Independent Artist',
        category: ticketCategory,
        priority: ticketPriority,
        subject: ticketSubject.trim() || `${ticketCategory} Request`,
        message: ticketMessage.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'received'
      };

      setSubmittedTicket(newTicket);
      setIsSubmitting(false);
      setTicketSubject('');
      setTicketMessage('');
    }, 600);
  };

  // -------------------------------------------------------------
  // THOROUGH HOW-TO GUIDES (Step-by-step workflow manuals)
  // -------------------------------------------------------------
  const howToGuides = [
    {
      id: 'howto_gigs',
      title: 'How to Book, Schedule & Tour-Route Live Gigs',
      category: 'Gigs & Logistics',
      icon: Calendar,
      accentColor: 'text-purple-400',
      tag: 'Core Operational Workflow',
      summary: 'A complete walkthrough on entering gigs, calculating soundcheck travel buffers, configuring door splits, and synchronizing Google Calendar.',
      steps: [
        {
          num: '01',
          heading: 'Create a New Show or Tour Stop',
          body: 'Navigate to the "Gig Scheduler" tab or click the quick-add "+" FAB at the bottom right. Enter your Event Title (e.g. "Seattle Headline Showcase"), select the date, set your load-in and soundcheck call times, and specify the scheduled set start.'
        },
        {
          num: '02',
          heading: 'Associate Venue & Technical Specifications',
          body: 'Attach an existing venue from your saved Venue Database or create a new venue entry. Ensure you include the capacity, venue talent buyer contact, sound engineer email, and front-of-house PA specs for your tech rider.'
        },
        {
          num: '03',
          heading: 'Log Guarantee & Ticket Splits',
          body: 'Enter your financial terms: Show Guarantee (fixed fee), Door Split percentage, expected attendance, and ticket pricing. This instantly feeds your Tour Cost Accountant and projected net earnings.'
        },
        {
          num: '04',
          heading: 'Geographic Tour Map & Soundcheck Routing',
          body: 'Open the "Tour Map" tab to inspect your driving legs. Bandz automatically computes mileage, estimated highway transit times, and introduces a mandatory 2-hour soundcheck buffer between back-to-back tour dates.'
        },
        {
          num: '05',
          heading: 'Calendar Export & Synchronization',
          body: 'Click "Export .ICS" to download standard iCal files that import into Google Calendar, Apple Calendar, or Outlook with all load-in, parking, and stage curfew times preserved.'
        }
      ],
      actionTab: 'scheduler',
      actionLabel: 'Open Gig Scheduler'
    },
    {
      id: 'howto_setlist',
      title: 'How to Build Dynamic Setlists & Use Stage Teleprompter',
      category: 'Repertoire & Stage',
      icon: Music,
      accentColor: 'text-amber-400',
      tag: 'Stage Performance Protocol',
      summary: 'Master song cataloging, harmonic key sequencing, set duration analytics with transition padding, and live teleprompter display.',
      steps: [
        {
          num: '01',
          heading: 'Catalog Songs in your Repertoire Library',
          body: 'Under "Setlist Builder", open the Song Library section. Add each track with Title, Tempo (BPM), Key (e.g., A Minor, Eb), exact Duration (minutes & seconds), Lead Vocalist, and Original/Cover designation.'
        },
        {
          num: '02',
          heading: 'Embed Chords, Lyrics & Arrangement Cues',
          body: 'Open any song card to store lyrics, verse/chorus chord charts, guitar tunings (e.g. Drop D, Capo 3rd fret), and arrangement cues (e.g. "4-bar drum intro", "Vocal harmonies on chorus 2").'
        },
        {
          num: '03',
          heading: 'Assemble Setlists & Optimize Energy Pacing',
          body: 'Create a setlist for your upcoming gig. Drag and drop songs to organize the flow. Monitor the BPM curve to ensure energetic openers, emotional valleys, and high-impact climax songs.'
        },
        {
          num: '04',
          heading: 'Analyze Running Time with Transition Buffering',
          body: 'Check the automated Set Duration Analyzer. Bandz automatically injects 45-second stage banter and tuning buffers between songs, alerting you if your set risks exceeding venue curfews.'
        },
        {
          num: '05',
          heading: 'Activate Stage View Teleprompter on Stage Devices',
          body: 'Toggle "Stage View" on your stage tablet or smartphone. Enjoy an ultra-high-contrast, giant-font display showing upcoming song keys, BPM flashing tempo indicators, and chord changes visible under dark stage lighting.'
        }
      ],
      actionTab: 'setlist',
      actionLabel: 'Open Setlist Builder'
    },
    {
      id: 'howto_sharon',
      title: 'How to Automate Management with Sharon AI & "The Manager"',
      category: 'AI Band Management',
      icon: Sparkles,
      accentColor: 'text-cyan-400',
      tag: 'Autonomous AI Manager',
      summary: 'Leverage Sharon AI voice/text commands to draft venue booking pitches, generate viral social media blurbs, and automate day-to-day admin tasks.',
      steps: [
        {
          num: '01',
          heading: 'Launch Sharon AI Manager',
          body: 'Click Sharon in the top header or navigate to "The Manager" tab. Sharon is your 24/7 autonomous band manager powered by Google Gemini AI.'
        },
        {
          num: '02',
          heading: 'Use Natural Voice & Text Commands',
          body: 'Issue everyday management commands such as "Sharon add the RINO room gig Dec 1 2026", "Sharon log $250 expense for replacement drum heads", or "Sharon add Sarah as our new keyboardist".'
        },
        {
          num: '03',
          heading: 'Generate Professional Venue Booking Pitches',
          body: 'Select any targeted venue and prompt Sharon to write a tailored talent buyer outreach pitch containing your streaming metrics, past draw statistics, and EPK links.'
        },
        {
          num: '04',
          heading: 'Generate Multi-Platform Social Media Campaigns',
          body: 'Generate formatted Instagram captions, Facebook announcements, and tweet announcements featuring custom band personality tones, venue tags, ticket URLs, and relevant hashtags.'
        },
        {
          num: '05',
          heading: 'Auto-Sequence Setlists by Venue Energy',
          body: 'Let Sharon optimize song sequencing based on venue acoustics, show length, and desired crowd energy curve.'
        }
      ],
      actionTab: 'promo',
      actionLabel: 'Open The Manager'
    },
    {
      id: 'howto_budget',
      title: 'How to Track Tour Budgets, Payout Splits & Tax CSVs',
      category: 'Finance & Accounting',
      icon: DollarSign,
      accentColor: 'text-emerald-400',
      tag: 'Financial Discipline',
      summary: 'Keep complete financial control over venue guarantees, merchandise profits, fuel expenses, and member payout split ledgers.',
      steps: [
        {
          num: '01',
          heading: 'Record Revenues (Guarantees, Tickets & Merch)',
          body: 'In "Cost Accountant", add income line items linked to specific tour dates. Track fixed show guarantees, percentage-of-door earnings, physical merch table sales, and tip jar receipts.'
        },
        {
          num: '02',
          heading: 'Log Touring & Production Expenses',
          body: 'Enter travel expenses: vehicle fuel, hotel accommodations, road tolls, FOH sound engineer pay, rehearsal studio rentals, and instrument string/drumhead replacements.'
        },
        {
          num: '03',
          heading: 'Audit Net Profit & Split Ledgers',
          body: 'Monitor the live Net Tour Budget meter. The system calculates true net margins after expenses and automatically calculates fair member distribution cuts.'
        },
        {
          num: '04',
          heading: 'Export CSV Audit Ledger for Tax Filing',
          body: 'Click "Export Financial CSV" to obtain clean spreadsheets ready for your accountant, tax filings (Schedule C / 1099 reporting), or band banking records.'
        }
      ],
      actionTab: 'budgets',
      actionLabel: 'Open Cost Accountant'
    },
    {
      id: 'howto_collab',
      title: 'How to Post & Respond in the Collaboration Marketplace',
      category: 'Talent & Community',
      icon: Users,
      accentColor: 'text-pink-400',
      tag: 'Band Member & Musician Network',
      summary: 'Find session musicians, touring sound engineers, lighting techs, and poster artists, or pitch your skills to other active bands.',
      steps: [
        {
          num: '01',
          heading: 'Publish an Open Talent Request',
          body: 'In "Collab Market", click "Post Collaboration Request". Specify the role needed (e.g., Session Drummer, Bassist, Tour Poster Designer, Live Sound Tech).'
        },
        {
          num: '02',
          heading: 'Set Compensation & Skill Requirements',
          body: 'Define required skills (e.g., "In-Ear Monitors", "Backing Vocals", "Adobe Illustrator"), location requirements (or toggle "Remote Allowed"), and compensation terms (flat show fee, door split, or pro-bono).'
        },
        {
          num: '03',
          heading: 'Review Pitches & Auditions',
          body: 'View incoming pitches from candidate musicians or crew. Review their past experience, portfolio links, and audio samples.'
        },
        {
          num: '04',
          heading: 'Shortlist, Accept & Form Contracts',
          body: 'Mark responses as "Shortlisted", "Accepted", or "Declined". Contact accepted candidates directly via email or phone to confirm rehearsal and call times.'
        }
      ],
      actionTab: 'collaborate',
      actionLabel: 'Open Collab Market'
    },
    {
      id: 'howto_artists',
      title: 'How to Configure Band Profiles, Roster & Gear Plots',
      category: 'Profiles & Roster',
      icon: Users,
      accentColor: 'text-indigo-400',
      tag: 'Entity & Roster Architecture',
      summary: 'Set up multi-band entities, assign instrumental roles, map wireless frequencies, and configure public streaming Link Trees.',
      steps: [
        {
          num: '01',
          heading: 'Add Band Profile & EPK Bio',
          body: 'In "Band Profiles", create or edit your artist identity. Upload high-resolution promotional photos, define your musical genre, and write an authoritative EPK biography.'
        },
        {
          num: '02',
          heading: 'Assign Member Roles & Technical Gear',
          body: 'Add band members, assign specific instrument duties, and record their on-stage gear setups (e.g. tube amps, wireless microphone frequencies, pedalboards, DI requirements).'
        },
        {
          num: '03',
          heading: 'Publish Unified Streaming Link Tree',
          body: 'Open "Link Tree" to configure a single, high-conversion mobile bio landing page showcasing Spotify, Apple Music, Bandcamp, social media handles, and tour tickets.'
        }
      ],
      actionTab: 'artists',
      actionLabel: 'Open Band Profiles'
    }
  ];

  // -------------------------------------------------------------
  // THOROUGH KNOWLEDGE WIKI (Encyclopedic specs & reference)
  // -------------------------------------------------------------
  const wikiArticles = [
    {
      id: 'wiki_arch',
      title: 'Bandz Local-First Architecture & Cloud Sync Protocol',
      category: 'System Architecture',
      icon: Cpu,
      accentColor: 'text-purple-400',
      summary: 'Technical specifications on how Bandz handles offline-first caching, Firebase Firestore reactive sync, and zero-loss local storage.',
      content: `### 1. Dual-Tier Storage Topology
Bandz is engineered specifically for gigging musicians who frequently encounter zero-connectivity backstage green rooms, basement rehearsal spaces, and remote festival stages.

* **Client-Side Cache:** All scheduled gigs, song repertoire, setlists, and budget entries are persisted immediately to local storage and browser cache via reactive state handlers. Edits are non-blocking and execute with sub-millisecond latency.
* **Cloud Persistence (Firebase Firestore):** When an active internet connection is available and the user is authenticated, local records synchronize with Google Cloud's Firebase Firestore database in the US-Central region.
* **Conflict Resolution:** Sync uses an ISO 8601 millisecond-precision timestamp model. When conflicting edits occur across devices, the most recent verified timestamp prevails.
* **Cold Starts & Offline Resilience:** If you launch Bandz on a tablet in airplane mode on stage, your setlist, lyrics, and song BPM metadata load instantly from local storage without network dependencies.`
    },
    {
      id: 'wiki_music_specs',
      title: 'Musical Standards: BPM Curves, Keys & Stage Tunings',
      category: 'Audio & Music Theory',
      icon: Music,
      accentColor: 'text-amber-400',
      summary: 'Guidelines on tempo curves, harmonic key transitions, Camelot wheel compatibility, and standard instrument tunings.',
      content: `### 1. BPM Tempo Classifications
Bandz supports tempos from 40 BPM (Grave/Largo) to 260 BPM (Presto/Prestissimo):
* **Ballads & Downtempo (50 - 85 BPM):** Emotional reset tracks, ideal for midpoint acoustic intervals.
* **Mid-Tempo Grooves (86 - 115 BPM):** R&B, hip-hop, funk, and steady indie rock pocket grooves.
* **High-Energy Stage Drivers (116 - 140 BPM):** Classic rock anthems, disco, pop-punk, and high-intensity dance-rock.
* **Speed / Punk / Thrash (141 - 220+ BPM):** High-velocity openers and encore climax tracks.

### 2. Harmonic Key Sequencing (Camelot Mixing for Live Sets)
Transitioning between songs in relative musical keys (e.g. A Minor to C Major, or A Minor to D Minor) prevents jarring sonic dissonance on stage. Bandz setlist pacing analytics highlight key changes and recommend smooth harmonic transitions.

### 3. Standard Guitar & Bass Stage Tunings Reference
* **Standard E:** E2-A2-D3-G3-B3-E4 (Standard 440 Hz reference)
* **Drop D:** D2-A2-D3-G3-B3-E4 (Allows single-finger power chords and deeper low-end response)
* **Half-Step Down (Eb Standard):** Eb2-Ab2-Db3-Gb3-Bb3-Eb4 (Reduces vocal strain for high tenor rock vocals)
* **Drop C:** C2-G2-C3-F3-A3-D4 (Heavy rock/metal standard)
* **DADGAD (Celtic / Open Modal):** Popular for ambient acoustic folk and droning fingerstyle guitar.`
    },
    {
      id: 'wiki_stage_glossary',
      title: 'Live Audio & Stage Production Terminology Glossary',
      category: 'Live Stage Operations',
      icon: Radio,
      accentColor: 'text-cyan-400',
      summary: 'A complete reference manual of technical audio terms, stage cabling, monitor setups, and venue contract jargon.',
      content: `### 1. Audio & Technical Venue Terms
* **FOH (Front of House):** The main sound mixing desk positioned in the audience area, controlling what the ticket-buying crowd hears.
* **Monitor Desk:** The auxiliary mixing console located stage-left or stage-right, controlling the audio sent to musicians' in-ear monitors or floor wedges.
* **Stage Plot:** A visual floorplan diagram illustrating where each band member stands, where amplifiers and drum kits are placed, and where AC power drops are needed.
* **Tech Rider:** A binding specification sheet detailing required microphones, DI boxes, drum risers, vocal channel counts, and monitor mix sends.
* **Hospitality Rider:** Specifics for backstage dressing rooms, including green room meal buyouts, water, towels, and dietary requirements.
* **DI (Direct Injection) Box:** A transformer device that converts an unbalanced, high-impedance instrument signal (such as acoustic guitars, keyboards, or active bass) into a balanced low-impedance mic-level XLR signal.
* **Phantom Power (+48V):** Direct DC electrical voltage sent through an XLR cable to power active condenser microphones or active DI boxes.
* **IEM (In-Ear Monitors):** Custom-molded or universal earphones that isolate stage bleed and provide personalized stereo mixes to each musician.

### 2. Financial & Contract Terms
* **Show Guarantee:** A fixed financial amount guaranteed to the artist by the venue/promoter regardless of ticket sales.
* **Door Split:** A compensation deal where the artist receives a percentage (typically 70% - 90%) of gate receipts after pre-agreed venue production costs are recouped.
* **Versus Deal ($500 vs. 80%):** The artist is paid whichever amount is higher between the flat guarantee or the door split percentage.
* **Merch Cut:** A percentage (often 10% - 20%) that large venues or clubs withhold from artist merchandise sales for providing a dedicated table or concession seller.`
    },
    {
      id: 'wiki_tiers_permissions',
      title: 'Roles, Permissions & Subscription Tiers Matrix',
      category: 'Account & Subscriptions',
      icon: ShieldCheck,
      accentColor: 'text-emerald-400',
      summary: 'Comprehensive breakdown of Bandz subscription packages, AI credit limits, and member permission levels.',
      content: `### 1. Subscription Tiers Comparison
* **14-Day Free Trial (Garage Pass):** 
  * $0 due today; unrestricted console access for 14 days.
  * 15 Sharon AI generation credits.
  * Unlimited bands, setlists, and song library records.
* **Weekly Tour Pass ($7.75 / week):**
  * Flexible 7-day tour run pass for bands on single weekend or 1-week road trips.
  * Full Touring Pro capabilities + 50 Sharon AI weekly credits.
  * Cancel anytime with zero long-term commitment.
* **Touring Pro ($19.00 / month - Most Popular):**
  * Built for active gigging bands, booking managers, and touring acts.
  * 150 Sharon AI monthly generation credits.
  * Budget split ledgers, public link tree pages, and CSV accounting exports.
* **Arena Headliner ($49.00 / month):**
  * 500 Sharon AI monthly credits.
  * Interactive Geographic Tour Map routing with automated soundcheck travel buffers.
  * Dedicated VIP hotline priority support at (951) 594-5105.

### 2. Member Permissions
* **Band Owner / Admin:** Full edit access across budgets, payment methods, venue bookings, and AI prompt execution.
* **Band Member / Musician:** Read & edit access to repertoire, setlists, gig calendar, and Stage View teleprompter.`
    },
    {
      id: 'wiki_compliance',
      title: 'Google API Limited Use & Privacy Policy Specifications',
      category: 'Legal & Security',
      icon: Scale,
      accentColor: 'text-rose-400',
      summary: 'Official disclosures on Google API Services User Data Policy, Limited Use adherence, data sovereignty, and security encryptions.',
      content: `### 1. Google API Services User Data Policy Adherence
Bandz Platform complies strictly with the Google API Services User Data Policy, including the Limited Use requirements:

1. **Specific & Legitimate Purpose:** Google user profile data (name, email address, avatar) is collected solely for account authentication, band roster linking, and user security.
2. **Zero AI Model Training:** Google user data is NEVER used to train, retrain, or fine-tune generalized artificial intelligence or machine learning models (including Google Gemini models).
3. **Zero Advertising Sales:** We never transfer, monetize, or sell Google user data to third-party ad networks, data brokers, or marketing platforms.
4. **Strict Human Access Prohibition:** No employee, engineer, or contractor reads Google user data except with your affirmative, documented consent for technical troubleshooting or under valid court subpoena.
5. **Encryption at Rest & Transit:** All client-server communications operate over TLS 1.3 encryption; cloud databases are encrypted at rest with AES-256 standard encryption.

### 2. Account & Data Deletion
Users retain sovereign ownership over their data. You may revoke Google permissions anytime at https://myaccount.google.com/permissions or submit a full data purge request to support@alistwebs.com.`
    },
    {
      id: 'wiki_sharon_syntax',
      title: 'Sharon AI Command Syntax & Natural Language Cheatsheet',
      category: 'AI Assistant',
      icon: Terminal,
      accentColor: 'text-indigo-400',
      summary: 'Exact phrasing patterns, supported variables, and parameter extraction syntax for Sharon AI Band Manager.',
      content: `### 1. Gig Scheduling Patterns
* \`"Sharon add gig [Venue Name] on [Date] at [Time]"\`
  * Example: *"Sharon add the RINO room gig Dec 1 2026"*
  * Example: *"Sharon schedule rehearsal this Thursday at 7pm"*
* Extracted Parameters: Title, Venue Name, ISO DateTime string, Status (Confirmed or Draft/Rehearsal).

### 2. Song & Repertoire Patterns
* \`"Sharon add song [Title] [Duration] in [Key] at [BPM] BPM"\`
  * Example: *"Sharon add song 'Midnight Echoes' 3m 45s in Em at 124 BPM"*
* Extracted Parameters: Title, Duration in seconds, Musical Key, BPM tempo.

### 3. Cost & Budget Accounting Patterns
* \`"Sharon log $[Amount] [expense|income] for [Category / Item]"\`
  * Example: *"Sharon log $200 expense for new drum heads"*
  * Example: *"Sharon log $850 income for merch sales"*
* Extracted Parameters: Amount (number), Type (income/expense), Category, Description.

### 4. Collaboration & Musician Hiring Patterns
* \`"Sharon find a [Instrument / Role] for [Show or Project]"\`
  * Example: *"Sharon find a drummer for our RINO Room gig"*
  * Example: *"Sharon post request for graphic designer for tour poster"*`
    }
  ];

  // -------------------------------------------------------------
  // DIAGNOSTIC FAQS
  // -------------------------------------------------------------
  const faqCategories = [
    {
      id: 'faq_troubleshooting',
      title: 'Diagnostic Troubleshooting & System FAQs',
      subtitle: 'Solutions for offline mode, audio lag, calendar sync, and permission issues',
      icon: AlertTriangle,
      items: [
        {
          id: 'faq_1',
          question: 'How do I recover unsynced data after rehearsing without Wi-Fi?',
          answer: 'Bandz is built local-first. All entries made while offline remain stored safely in your device\'s local storage cache. Once your phone or laptop reconnects to Wi-Fi or cellular data, simply keep the app open for 3-5 seconds. Bandz will automatically detect connection restoration and stream pending records to your Firestore cloud database.',
          actionTab: 'scheduler',
          actionLabel: 'Check Scheduler Sync',
          tags: ['Offline', 'Database', 'Sync', 'Troubleshooting']
        },
        {
          id: 'faq_2',
          question: 'How do I connect and synchronize my gigs with Google Calendar?',
          answer: 'Navigate to the Gig Scheduler tab and locate the "Export Calendar (.ICS)" button at the top right of the show list. This generates a standardized RFC 5545 calendar feed file containing soundcheck times, venue street addresses, and set lengths. Double click the downloaded file to auto-import into Google Calendar or Apple Calendar.',
          actionTab: 'scheduler',
          actionLabel: 'Export iCal (.ICS)',
          tags: ['Google Calendar', 'Export', 'Sync', 'iCal']
        },
        {
          id: 'faq_3',
          question: 'Why does the Stage View teleprompter stay awake on mobile devices?',
          answer: 'Stage View requests a browser Screen Wake Lock API token to prevent your tablet or phone screen from dimming or locking mid-song during a live set. For best performance, ensure your device battery saver mode is disabled and set screen brightness according to stage lighting.',
          actionTab: 'setlist',
          actionLabel: 'Test Stage View Mode',
          tags: ['Stage View', 'Teleprompter', 'Screen Lock', 'Live Show']
        },
        {
          id: 'faq_4',
          question: 'How do I revoke Bandz Google permissions or request complete data deletion?',
          answer: 'You can immediately revoke third-party permissions at any time via https://myaccount.google.com/permissions. To request a permanent purge of all artist profiles, songs, setlists, and budget logs, open the Privacy Policy in Bandz and click "Request Total Data Deletion" or email support@alistwebs.com with the subject "Data Deletion Request". All database entries are irreversibly wiped within 30 days.',
          tags: ['Privacy', 'Google Account', 'Data Deletion', 'Security']
        },
        {
          id: 'faq_5',
          question: 'What is the Emergency Gig Night Hotline and who can use it?',
          answer: 'We provide a direct telephone hotline at (951) 594-5105 specifically for active touring bands and venue sound engineers experiencing emergency technical hurdles on show nights. If you are experiencing an urgent stage or setlist issue during load-in or soundcheck, call (951) 594-5105 immediately for priority dispatch.',
          tags: ['Emergency', 'Hotline', 'Phone Support', 'Live Gig']
        }
      ]
    }
  ];

  // Search filtering across all content
  const q = searchQuery.toLowerCase().trim();

  const filteredHowTos = howToGuides.filter(h => {
    if (!q) return true;
    return (
      h.title.toLowerCase().includes(q) ||
      h.summary.toLowerCase().includes(q) ||
      h.category.toLowerCase().includes(q) ||
      h.steps.some(s => s.heading.toLowerCase().includes(q) || s.body.toLowerCase().includes(q))
    );
  });

  const filteredWikis = wikiArticles.filter(w => {
    if (!q) return true;
    return (
      w.title.toLowerCase().includes(q) ||
      w.category.toLowerCase().includes(q) ||
      w.summary.toLowerCase().includes(q) ||
      w.content.toLowerCase().includes(q)
    );
  });

  const filteredFaqs = faqCategories[0].items.filter(f => {
    if (!q) return true;
    return (
      f.question.toLowerCase().includes(q) ||
      f.answer.toLowerCase().includes(q) ||
      f.tags.some(t => t.toLowerCase().includes(q))
    );
  });

  const totalResults = filteredHowTos.length + filteredWikis.length + filteredFaqs.length;

  return (
    <div className={`max-w-6xl mx-auto space-y-8 pb-16 ${isModal ? 'p-4 sm:p-6' : ''}`} id="support-tab-root">
      
      {/* Top Header Hero Banner with Direct Contact Spotlight */}
      <div className="bg-slate-900/80 border border-purple-500/20 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -top-12 w-60 h-60 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold uppercase tracking-wider">
              <LifeBuoy size={13} className="text-purple-400" />
              <span>Official Bandz Support, How-To Manual & Knowledge Wiki</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-slate-100 tracking-tight leading-tight">
              Support Center & Operations Wiki
            </h1>
            
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Step-by-step how-to walkthroughs, comprehensive technical audio wiki specifications, and direct human operator support for working independent bands.
            </p>
          </div>

          {/* Direct Support Hotline & Email Contact Card */}
          <div className="w-full md:w-auto bg-slate-950/80 border border-purple-500/30 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3 shrink-0">
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Live Support Desk</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                A-List Webs HQ
              </span>
            </div>

            {/* Direct Phone Contact */}
            <div className="flex items-center justify-between gap-3 p-2 bg-slate-900/60 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Phone size={15} />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block uppercase">Hotline & SMS</span>
                  <a 
                    href="tel:9515945105" 
                    className="text-sm font-bold text-slate-100 hover:text-emerald-400 font-mono transition-colors"
                  >
                    (951) 594-5105
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <a
                  href="tel:9515945105"
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold font-mono transition-colors flex items-center gap-1"
                  title="Call Phone Hotline"
                >
                  <span>Call</span>
                </a>
                <button
                  onClick={() => copyToClipboard('9515945105', 'phone')}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Copy Phone Number"
                >
                  {copiedContact === 'phone' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Direct Email Contact */}
            <div className="flex items-center justify-between gap-3 p-2 bg-slate-900/60 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Mail size={15} />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block uppercase">Email Desk</span>
                  <a 
                    href="mailto:support@alistwebs.com" 
                    className="text-xs font-bold text-slate-100 hover:text-purple-400 font-mono transition-colors"
                  >
                    support@alistwebs.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <a
                  href="mailto:support@alistwebs.com"
                  className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold font-mono transition-colors flex items-center gap-1"
                  title="Send Email"
                >
                  <span>Email</span>
                </a>
                <button
                  onClick={() => copyToClipboard('support@alistwebs.com', 'email')}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Copy Email Address"
                >
                  {copiedContact === 'email' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 flex items-center justify-between font-mono pt-1">
              <span>Show Night Hotline: 24/7 Priority</span>
              <span className="text-emerald-400 font-bold">● ONLINE</span>
            </div>
          </div>
        </div>

        {/* Global Instant Search Bar */}
        <div className="relative max-w-2xl mt-6 pt-2">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search across How-To guides, Wiki manual, audio specs, or FAQs (e.g. Setlists, Stage View, BPM, Sync, Phone)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/90 border border-slate-700/80 rounded-2xl pl-11 pr-24 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors shadow-inner"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-purple-400 hover:text-purple-300 font-mono bg-purple-500/10 px-2.5 py-1 rounded-lg"
            >
              Clear Search
            </button>
          )}
        </div>
      </div>

      {/* Navigation View Switcher Tabs */}
      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Resources', count: howToGuides.length + wikiArticles.length + faqCategories[0].items.length },
            { id: 'support', label: 'Contact & Support Desk', icon: LifeBuoy, highlight: true },
            { id: 'howto', label: 'How-To Guides (Step-by-Step)', icon: BookOpen, count: howToGuides.length },
            { id: 'wiki', label: 'Bandz Knowledge Wiki', icon: Cpu, count: wikiArticles.length },
            { id: 'faq', label: 'Diagnostic FAQs', icon: AlertTriangle, count: faqCategories[0].items.length }
          ].map((tab) => {
            const isSelected = viewMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id as MainViewMode)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-slate-900/70 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {tab.highlight && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-purple-800 text-purple-200' : 'bg-slate-800 text-slate-400'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Google Compliance Quick Tag */}
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span className="hidden sm:inline">Google API Verified</span>
          {onOpenLegal && (
            <button
              onClick={() => onOpenLegal('privacy')}
              className="text-purple-400 hover:underline font-bold"
            >
              Privacy Policy
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: DIRECT SUPPORT & INQUIRY / TICKET SUBMITTER       */}
      {/* ------------------------------------------------------------- */}
      {(viewMode === 'all' || viewMode === 'support') && !searchQuery && (
        <div className="bg-slate-900/60 border border-purple-500/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2 text-purple-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
                <LifeBuoy size={14} />
                <span>Dedicated Operator & Show Support</span>
              </div>
              <h2 className="text-2xl font-black font-display text-slate-100">
                Contact A-List Webs Support
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Need immediate help with a gig setlist, tour map routing, billing, or technical sync? Reach our team directly via phone, email, or priority ticket.
              </p>
            </div>

            {/* Quick Contact Chips */}
            <div className="flex flex-wrap gap-2">
              <a
                href="tel:9515945105"
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold font-mono transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <Phone size={14} />
                <span>Call (951) 594-5105</span>
              </a>
              <a
                href="mailto:support@alistwebs.com"
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold font-mono transition-all shadow-md shadow-purple-600/20 cursor-pointer"
              >
                <Mail size={14} />
                <span>support@alistwebs.com</span>
              </a>
            </div>
          </div>

          {/* Two-Column Support Layout: Contact Info & Interactive Ticket Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Direct Service Level Guarantees */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-200 font-display uppercase tracking-wider flex items-center gap-2">
                  <Clock size={16} className="text-purple-400" />
                  <span>Support Hours & Response SLAs</span>
                </h3>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100 block">General Inquiries:</strong>
                      Monday – Friday: 8:00 AM – 8:00 PM PST (Within 2 Hours)
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100 block">Emergency Show Night Hotline:</strong>
                      Active 24/7 for live performance, venue PA, and setlist outages. Call <strong className="text-emerald-400 font-mono">(951) 594-5105</strong>.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100 block">Account & Data Purge SLA:</strong>
                      Processed strictly within 30 days under GDPR and CCPA standards.
                    </div>
                  </li>
                </ul>

                <div className="p-3 bg-purple-950/30 border border-purple-500/20 rounded-xl text-[11px] text-purple-300 space-y-1">
                  <span className="font-bold block uppercase font-mono">Headquarters Location</span>
                  <p className="text-slate-400">
                    A-List Webs Digital Productions • California, USA
                  </p>
                  <p className="text-slate-400">
                    Direct inquiries: <a href="mailto:support@alistwebs.com" className="text-purple-400 underline">support@alistwebs.com</a>
                  </p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Bandz Infrastructure</span>
                    <span className="text-[10px] text-slate-400 font-mono">Firestore Cloud Nodes & AI APIs Online</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md">
                  100% OPERATIONAL
                </span>
              </div>
            </div>

            {/* Right Column: Support Ticket Form */}
            <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Send size={16} className="text-purple-400" />
                  <h3 className="text-sm font-bold text-slate-100 font-display uppercase tracking-wider">
                    Submit a Priority Ticket / Callback Request
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Direct to Engineering & Support Desk
                </span>
              </div>

              {submittedTicket ? (
                <div className="p-6 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl space-y-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                    <Check size={24} />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                      Ticket Dispatched Successfully
                    </span>
                    <h4 className="text-lg font-black text-slate-100 mt-1">
                      Tracking Reference: #{submittedTicket.id}
                    </h4>
                    <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto">
                      A copy of your inquiry has been received at <strong className="text-white">{submittedTicket.email}</strong>. Our operations desk will respond shortly.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl text-left font-mono text-xs text-slate-300 border border-slate-800 max-w-md mx-auto space-y-1">
                    <div><span className="text-slate-500">Category:</span> {submittedTicket.category}</div>
                    <div><span className="text-slate-500">Priority:</span> <span className="uppercase text-amber-400 font-bold">{submittedTicket.priority}</span></div>
                    <div><span className="text-slate-500">Emergency Hotline:</span> (951) 594-5105</div>
                  </div>

                  <button
                    onClick={() => setSubmittedTicket(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold font-mono rounded-xl transition-colors cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTicketSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Alex Turner"
                        value={ticketName}
                        onChange={(e) => setTicketName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                        Band / Artist Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Arctic Monkeys"
                        value={ticketBand}
                        onChange={(e) => setTicketBand(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                        Email Address <span className="text-purple-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="manager@yourband.com"
                        value={ticketEmail}
                        onChange={(e) => setTicketEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                        Phone / SMS Contact (For Callback)
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. (951) 594-5105"
                        value={ticketPhone}
                        onChange={(e) => setTicketPhone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                        Inquiry Category
                      </label>
                      <select
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                      >
                        <option value="Gig Emergency / Show Tonight">🚨 Gig Emergency / Show Tonight</option>
                        <option value="Setlists & Stage View Teleprompter">Setlists & Stage View Teleprompter</option>
                        <option value="Gig Scheduler & Google Calendar Sync">Gig Scheduler & Google Calendar Sync</option>
                        <option value="Tour Cost Accounting & Payouts">Tour Cost Accounting & Payouts</option>
                        <option value="Sharon AI Manager Queries">Sharon AI Manager Queries</option>
                        <option value="Collab Marketplace & Auditions">Collab Marketplace & Auditions</option>
                        <option value="Billing & Subscriptions">Billing & Subscriptions</option>
                        <option value="Feature Request / Feedback">Feature Request / Feedback</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                        Priority Level
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'normal', label: 'Standard', color: 'text-slate-300' },
                          { id: 'high', label: 'High', color: 'text-amber-400' },
                          { id: 'urgent', label: 'Emergency', color: 'text-rose-400' }
                        ].map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setTicketPriority(p.id as any)}
                            className={`py-2 text-[10px] font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                              ticketPriority === p.id 
                                ? 'bg-purple-600 border-purple-500 text-white' 
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                      Subject / Short Summary
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Setlist timing buffer question before soundcheck"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                      Detailed Message <span className="text-purple-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Describe what you need assistance with. For gig emergencies, please provide your venue name and stage call time."
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <ShieldCheck size={12} className="text-emerald-400" />
                      Encrypted transmission via TLS 1.3
                    </span>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-xs font-bold font-mono rounded-xl transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Transmitting Ticket...</span>
                      ) : (
                        <>
                          <Send size={13} />
                          <span>Dispatch Priority Ticket</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: THOROUGH & COMPLETE HOW-TO GUIDES                  */}
      {/* ------------------------------------------------------------- */}
      {(viewMode === 'all' || viewMode === 'howto') && (
        <section className="space-y-4" id="section-howto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <BookOpen size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black font-display text-slate-100">
                  Step-by-Step How-To Guides
                </h2>
                <p className="text-xs text-slate-400">
                  Actionable operational manuals for every system inside the Bandz command center
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
              {filteredHowTos.length} Guides Available
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredHowTos.map((guide) => {
              const Icon = guide.icon;
              const isOpen = activeHowToId === guide.id;

              return (
                <div
                  key={guide.id}
                  className={`border rounded-2xl transition-all overflow-hidden ${
                    isOpen 
                      ? 'bg-slate-900/90 border-purple-500/50 shadow-xl shadow-purple-900/10' 
                      : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <button
                    onClick={() => setActiveHowToId(isOpen ? null : guide.id)}
                    className="w-full flex items-start justify-between p-4 sm:p-5 text-left cursor-pointer group"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`p-2.5 rounded-xl bg-slate-950 border border-slate-800 ${guide.accentColor} shrink-0 mt-0.5`}>
                        <Icon size={18} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                            {guide.category}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {guide.tag}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-purple-200 transition-colors">
                          {guide.title}
                        </h3>
                        <p className="text-xs text-slate-400 max-w-3xl">
                          {guide.summary}
                        </p>
                      </div>
                    </div>

                    <div className="ml-4 shrink-0 p-1.5 rounded-xl bg-slate-800/60 text-slate-400 group-hover:text-slate-200 transition-colors">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-slate-800/80 px-4 sm:px-6 pb-6 pt-4 space-y-6 bg-slate-950/50"
                      >
                        {/* Step-by-Step Flow */}
                        <div className="space-y-3">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                            EXECUTION PROCEDURE:
                          </span>
                          <div className="grid grid-cols-1 gap-3">
                            {guide.steps.map((step, sIdx) => (
                              <div 
                                key={sIdx}
                                className="flex items-start gap-3.5 p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80"
                              >
                                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 font-mono font-bold text-purple-300 text-xs flex items-center justify-center shrink-0">
                                  {step.num}
                                </div>
                                <div className="space-y-1">
                                  <h4 className="text-xs sm:text-sm font-bold text-slate-100 font-sans">
                                    {step.heading}
                                  </h4>
                                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                                    {step.body}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action Link to Jump to Feature */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                          <span className="text-xs text-slate-400 font-mono">
                            Ready to try this in your workspace?
                          </span>
                          {onNavigateToTab && (
                            <button
                              onClick={() => onNavigateToTab(guide.actionTab)}
                              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold font-mono transition-all shadow-md shadow-purple-600/20 cursor-pointer"
                            >
                              <span>{guide.actionLabel}</span>
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
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 3: THOROUGH & COMPLETE KNOWLEDGE WIKI ENCYCLOPEDIA     */}
      {/* ------------------------------------------------------------- */}
      {(viewMode === 'all' || viewMode === 'wiki') && (
        <section className="space-y-4" id="section-wiki">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Cpu size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black font-display text-slate-100">
                  Bandz Technical Knowledge Wiki
                </h2>
                <p className="text-xs text-slate-400">
                  Encyclopedic reference covering audio standards, offline sync architecture, stage glossaries, and Google API compliance
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
              {filteredWikis.length} Reference Articles
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredWikis.map((article) => {
              const Icon = article.icon;
              const isOpen = activeWikiId === article.id;

              return (
                <div
                  key={article.id}
                  className={`border rounded-2xl transition-all overflow-hidden ${
                    isOpen 
                      ? 'bg-slate-900/90 border-cyan-500/50 shadow-xl shadow-cyan-900/10' 
                      : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <button
                    onClick={() => setActiveWikiId(isOpen ? null : article.id)}
                    className="w-full flex items-start justify-between p-4 sm:p-5 text-left cursor-pointer group"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`p-2.5 rounded-xl bg-slate-950 border border-slate-800 ${article.accentColor} shrink-0 mt-0.5`}>
                        <Icon size={18} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
                            {article.category}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            Encyclopedic Specification
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-cyan-200 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-xs text-slate-400 max-w-3xl">
                          {article.summary}
                        </p>
                      </div>
                    </div>

                    <div className="ml-4 shrink-0 p-1.5 rounded-xl bg-slate-800/60 text-slate-400 group-hover:text-slate-200 transition-colors">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-slate-800/80 px-4 sm:px-6 pb-6 pt-5 space-y-4 bg-slate-950/60"
                      >
                        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed font-sans space-y-3 whitespace-pre-line">
                          {article.content}
                        </div>

                        {article.id === 'wiki_compliance' && onOpenLegal && (
                          <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
                            <button
                              onClick={() => onOpenLegal('privacy')}
                              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <FileText size={13} className="text-purple-400" />
                              <span>Read Verified Privacy Policy</span>
                            </button>
                            <button
                              onClick={() => onOpenLegal('terms')}
                              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <Scale size={13} className="text-slate-400" />
                              <span>Read Terms of Service</span>
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 4: DIAGNOSTIC TROUBLESHOOTING & FAQS                  */}
      {/* ------------------------------------------------------------- */}
      {(viewMode === 'all' || viewMode === 'faq') && (
        <section className="space-y-4" id="section-faq">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black font-display text-slate-100">
                  Diagnostic Solutions & Frequently Asked Questions
                </h2>
                <p className="text-xs text-slate-400">
                  Immediate answers to technical hurdles, offline cache recovery, screen teleprompters, and Google permissions
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              {filteredFaqs.length} FAQs
            </span>
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;

              return (
                <div
                  key={faq.id}
                  className={`border rounded-2xl transition-all overflow-hidden ${
                    isOpen 
                      ? 'bg-slate-900/80 border-amber-500/40 shadow-lg shadow-amber-900/10' 
                      : 'bg-slate-900/30 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <HelpCircle className={`mt-0.5 shrink-0 ${isOpen ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-400'}`} size={18} />
                      <span className={`text-sm sm:text-base font-bold transition-colors ${isOpen ? 'text-amber-200' : 'text-slate-200 group-hover:text-white'}`}>
                        {faq.question}
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
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                          {faq.answer}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {faq.tags.map(tag => (
                              <span key={tag} className="text-[10px] font-mono bg-slate-800/80 text-slate-400 px-2 py-0.5 rounded-md border border-slate-700/50">
                                #{tag}
                              </span>
                            ))}
                          </div>

                          {faq.actionTab && onNavigateToTab && (
                            <button
                              onClick={() => onNavigateToTab(faq.actionTab!)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors shadow-md shadow-amber-600/20 cursor-pointer"
                            >
                              <span>{faq.actionLabel || 'Jump to feature'}</span>
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
      )}

      {/* No results fallback */}
      {totalResults === 0 && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <HelpCircle className="mx-auto text-slate-600" size={32} />
          <h3 className="text-lg font-bold text-slate-300">No matching help or wiki topics found</h3>
          <p className="text-xs text-slate-500">
            Try searching for terms like "Setlist", "Sharon", "BPM", "Audio", "Sync", "Phone", or "Hotline".
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => { setSearchQuery(''); setViewMode('all'); }}
              className="text-xs text-purple-400 hover:underline font-bold"
            >
              Reset Search Filter
            </button>
            <span>•</span>
            <a
              href="tel:9515945105"
              className="text-xs text-emerald-400 hover:underline font-bold"
            >
              Call Direct Support: (951) 594-5105
            </a>
          </div>
        </div>
      )}

      {/* Bottom Sticky Direct Help Line Banner */}
      <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-emerald-950/40 border border-purple-500/30 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-400 font-mono text-xs font-bold uppercase">
            <Phone size={14} />
            <span>Need Immediate Human Assistance?</span>
          </div>
          <p className="text-xs text-slate-300">
            Our engineering desk at A-List Webs is available by phone at <strong className="text-white font-mono">(951) 594-5105</strong> and email at <strong className="text-white font-mono">support@alistwebs.com</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <a
            href="tel:9515945105"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            <Phone size={14} />
            <span>Call (951) 594-5105</span>
          </a>
          <a
            href="mailto:support@alistwebs.com"
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 shadow-lg shadow-purple-600/20"
          >
            <Mail size={14} />
            <span>support@alistwebs.com</span>
          </a>
        </div>
      </div>

    </div>
  );
}
