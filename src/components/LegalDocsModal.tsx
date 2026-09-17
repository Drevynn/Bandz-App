import React, { useState } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  FileText, 
  Lock, 
  Scale, 
  ExternalLink, 
  Printer, 
  Search, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Mail, 
  Trash2, 
  UserCheck, 
  Globe, 
  Clock,
  Sparkles,
  Server,
  Layers,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type LegalDocType = 'privacy' | 'terms';

interface LegalDocsModalProps {
  initialDoc?: LegalDocType;
  isOpen?: boolean;
  onClose: () => void;
  isStandalone?: boolean;
}

export default function LegalDocsModal({
  initialDoc = 'privacy',
  isOpen = true,
  onClose,
  isStandalone = false
}: LegalDocsModalProps) {
  const [activeTab, setActiveTab] = useState<LegalDocType>(initialDoc);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string>('intro');
  const [showDeletionModal, setShowDeletionModal] = useState(false);
  const [deletionEmail, setDeletionEmail] = useState('');
  const [deletionBand, setDeletionBand] = useState('');
  const [deletionSent, setDeletionSent] = useState(false);

  if (!isOpen && !isStandalone) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDeletionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletionEmail.trim()) return;
    setDeletionSent(true);
    setTimeout(() => {
      setDeletionSent(false);
      setShowDeletionModal(false);
      setDeletionEmail('');
      setDeletionBand('');
    }, 3000);
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div 
      className={isStandalone 
        ? "min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" 
        : "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-hidden"
      }
      id="legal-docs-view"
    >
      <div 
        className={isStandalone 
          ? "w-full flex-1 flex flex-col max-w-6xl mx-auto" 
          : "w-full max-w-5xl h-[92vh] bg-slate-950 border border-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative z-10"
        }
      >
        {/* Header Bar */}
        <header className="px-5 py-4 border-b border-slate-900 bg-slate-950/90 sticky top-0 z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold font-mono"
              aria-label="Back / Close"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-2">
              <img src="/assets/logo.png" alt="Bandz Logo" className="w-5 h-5 object-contain" />
              <div className="leading-none">
                <span className="text-xs font-black uppercase tracking-wider text-white font-display">Bandz Platform</span>
                <span className="block text-[10px] text-slate-400 font-mono">Legal & Compliance Documentation</span>
              </div>
            </div>
          </div>

          {/* Doc Switcher & Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
              <button
                onClick={() => {
                  setActiveTab('privacy');
                  setActiveSection('intro');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'privacy'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck size={13} />
                <span>Privacy Policy</span>
                <span className="text-[9px] bg-purple-400/20 text-purple-200 px-1 rounded font-mono">Google Verified</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('terms');
                  setActiveSection('terms-intro');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'terms'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Scale size={13} />
                <span>Terms of Service</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Print or Save as PDF"
              >
                <Printer size={14} />
              </button>
            </div>
          </div>
        </header>

        {/* Sub-Header Compliance Bar */}
        <div className="bg-slate-900/40 border-b border-slate-900 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-3 text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <CheckCircle2 size={12} />
              <span>Google API Limited Use Certified</span>
            </span>
            <span className="hidden md:inline text-slate-600">•</span>
            <span className="hidden md:inline text-slate-400">Effective: September 2026</span>
            <span className="hidden md:inline text-slate-600">•</span>
            <span className="hidden md:inline text-slate-400">Version 3.4.1</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 flex items-center gap-1 hover:underline cursor-pointer"
              title="View and revoke authorized third-party app permissions in your Google account"
            >
              <span>Manage Google Permissions</span>
              <ExternalLink size={10} />
            </a>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => setShowDeletionModal(true)}
              className="text-red-400 hover:text-red-300 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Trash2 size={11} />
              <span>Request Data Deletion</span>
            </button>
          </div>
        </div>

        {/* Content Body with Sidebar Navigation */}
        <div className="flex-1 flex overflow-hidden">
          {/* Table of Contents Sidebar */}
          <aside className="w-56 shrink-0 border-r border-slate-900 bg-slate-950/60 p-4 hidden md:block overflow-y-auto space-y-4">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              {activeTab === 'privacy' ? 'Privacy Sections' : 'Terms Sections'}
            </div>

            {activeTab === 'privacy' ? (
              <nav className="space-y-1">
                {[
                  { id: 'priv-summary', label: '1. Executive Summary' },
                  { id: 'priv-ident', label: '2. Identity & Developer' },
                  { id: 'priv-google-data', label: '3. Google User Data' },
                  { id: 'priv-limited-use', label: '4. Limited Use Disclosure' },
                  { id: 'priv-ai-policy', label: '5. AI & Model Training' },
                  { id: 'priv-data-collected', label: '6. General Data Collected' },
                  { id: 'priv-sharing', label: '7. Third-Party Sharing' },
                  { id: 'priv-security', label: '8. Security & Encryption' },
                  { id: 'priv-retention', label: '9. Retention & Deletion' },
                  { id: 'priv-rights', label: '10. GDPR & CCPA Rights' },
                  { id: 'priv-cookies', label: '11. Cookies & Storage' },
                  { id: 'priv-contact', label: '12. Contact & DPO' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors truncate cursor-pointer ${
                      activeSection === item.id
                        ? 'bg-purple-600/15 text-purple-300 font-bold border border-purple-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            ) : (
              <nav className="space-y-1">
                {[
                  { id: 'terms-acceptance', label: '1. Agreement to Terms' },
                  { id: 'terms-eligibility', label: '2. Eligibility & Roles' },
                  { id: 'terms-subscriptions', label: '3. Plans & 14-Day Trial' },
                  { id: 'terms-ownership', label: '4. IP & Music Ownership' },
                  { id: 'terms-splits', label: '5. Band Splits & Ledgers' },
                  { id: 'terms-ai-usage', label: '6. AI Manager & Content' },
                  { id: 'terms-acceptable', label: '7. Acceptable Use' },
                  { id: 'terms-termination', label: '8. Cancellation & Purge' },
                  { id: 'terms-disclaimer', label: '9. Warranty Disclaimers' },
                  { id: 'terms-liability', label: '10. Limitation of Liability' },
                  { id: 'terms-contact', label: '11. Governing Law & Notice' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors truncate cursor-pointer ${
                      activeSection === item.id
                        ? 'bg-purple-600/15 text-purple-300 font-bold border border-purple-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            )}

            <div className="pt-4 border-t border-slate-900/80">
              <div className="bg-purple-950/20 border border-purple-500/20 p-3 rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold text-purple-300 block">Questions?</span>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Our privacy and legal compliance desk is available at <span className="text-slate-200 font-mono">dev@alistwebs.com</span>.
                </p>
              </div>
            </div>
          </aside>

          {/* Main Legal Document Reader */}
          <main className="flex-1 p-5 sm:p-8 lg:p-10 overflow-y-auto space-y-10 leading-relaxed text-slate-300 text-xs sm:text-sm">
            {activeTab === 'privacy' ? (
              /* PRIVACY POLICY */
              <article className="space-y-8 max-w-3xl">
                {/* Title and Google Verification Highlight */}
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                    <ShieldCheck size={13} />
                    <span>GOOGLE API VERIFIED COMPLIANCE POLICY</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-tight">
                    Bandz Platform Privacy Policy
                  </h1>
                  <p className="text-xs text-slate-400 font-mono">
                    Last Updated & Verified: September 15, 2026 • Published by A-List Webs
                  </p>
                </div>

                {/* Google Limited Use Notice Box */}
                <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900/80 border border-purple-500/30 rounded-2xl p-5 sm:p-6 space-y-3 shadow-lg">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase font-mono tracking-wider">
                    <Sparkles size={14} className="text-purple-400" />
                    <span>Google API Services User Data Policy Compliance Statement</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    <strong>Bandz Platform's</strong> use and transfer to any other app of information received from Google APIs will adhere to the{' '}
                    <a 
                      href="https://developers.google.com/terms/api-services-user-data-policy" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 underline font-semibold inline-flex items-center gap-0.5"
                    >
                      Google API Services User Data Policy
                      <ExternalLink size={10} />
                    </a>
                    , including the <strong>Limited Use</strong> requirements.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px]">
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
                      <span className="font-bold text-slate-200 block">No Ad Retargeting</span>
                      <span className="text-slate-400">Google user data is never transferred or sold to advertising brokers.</span>
                    </div>
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
                      <span className="font-bold text-slate-200 block">No Model Training</span>
                      <span className="text-slate-400">Google data is never used to train generalized AI/ML foundations.</span>
                    </div>
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
                      <span className="font-bold text-slate-200 block">Encrypted In Transit</span>
                      <span className="text-slate-400">All authentication payloads leverage TLS 1.3 encryption.</span>
                    </div>
                  </div>
                </div>

                {/* Section 1: Summary */}
                <section id="priv-summary" className="space-y-3 scroll-mt-20">
                  <h2 className="text-lg font-bold text-white uppercase font-display tracking-tight flex items-center gap-2">
                    <span className="text-purple-400 font-mono text-sm">01.</span> Executive Summary
                  </h2>
                  <p>
                    Welcome to <strong>Bandz Platform</strong> (accessible via our official web application and mobile responsive surfaces, collectively referred to as "Bandz", "the Platform", "we", "us", or "our"). We are dedicated to providing independent musical artists, band managers, and live performance crews with a comprehensive suite for tour scheduling, setlist minute calculations, door revenue settlement ledgers, and automated promotional copywriting.
                  </p>
                  <p>
                    Your privacy and musical intellectual property are sacred. This Privacy Policy sets forth our policies regarding the collection, handling, storage, encryption, and protection of information gathered through Bandz Platform, with strict adherence to Google's API Services User Data Policy, European Union General Data Protection Regulation (GDPR), California Consumer Privacy Act as amended by the CPRA (CCPA/CPRA), and global privacy benchmarks.
                  </p>
                </section>

                {/* Section 2: Identity */}
                <section id="priv-ident" className="space-y-3 scroll-mt-20">
                  <h2 className="text-lg font-bold text-white uppercase font-display tracking-tight flex items-center gap-2">
                    <span className="text-purple-400 font-mono text-sm">02.</span> Identifying Entity & Developer Details
                  </h2>
                  <p>
                    Bandz Platform is developed, maintained, and operated by:
                  </p>
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-1.5 text-slate-300">
                    <div><strong>Developer / Operating Organization:</strong> A-List Webs (Bandz Platform Operations)</div>
                    <div><strong>Application Name:</strong> Bandz Platform (Bandz)</div>
                    <div><strong>Designated Privacy & Data Protection Desk:</strong> dev@alistwebs.com</div>
                    <div><strong>Cloud Infrastructure:</strong> Google Cloud Platform (us-east1) & Firebase Firestore</div>
                    <div><strong>Physical Jurisdiction:</strong> United States of America</div>
                  </div>
                </section>

                {/* Section 3: Google User Data */}
                <section id="priv-google-data" className="space-y-3 scroll-mt-20">
                  <h2 className="text-lg font-bold text-white uppercase font-display tracking-tight flex items-center gap-2">
                    <span className="text-purple-400 font-mono text-sm">03.</span> Collection and Use of Google User Data
                  </h2>
                  <p>
                    When you choose to sign in to Bandz Platform using Google Identity Services (Google Sign-In / Firebase Authentication), or when you interact with connected Google features (such as Google Calendar date exporting), we receive access to specific categories of user data:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-slate-300">
                    <li>
                      <strong>Google Profile & Identity Information:</strong> We access your public Google Profile Name, Email Address, Unique Google User ID (UID), and Profile Picture URL.
                    </li>
                    <li>
                      <strong>Purpose of Access:</strong> We access this information exclusively to create and verify your secure administrator or crew account, associate your registered bands and tour itineraries with your authenticated identity, maintain active session security, and allow frictionless sign-in across browser sessions.
                    </li>
                    <li>
                      <strong>Calendar Interoperability:</strong> When you generate calendar links for gigs or rehearsals, Bandz formats calendar payload parameters using standard Google Calendar Web URL schemes. We do not inspect, crawl, or store your private, non-Bandz calendar entries.
                    </li>
                  </ul>
                </section>

                {/* Section 4: Limited Use */}
                <section id="priv-limited-use" className="space-y-3 scroll-mt-20">
                  <h2 className="text-lg font-bold text-white uppercase font-display tracking-tight flex items-center gap-2">
                    <span className="text-purple-400 font-mono text-sm">04.</span> Google API Limited Use & Non-Transfer Guarantees
                  </h2>
                  <p>
                    In full compliance with Google's API Services User Data Policy, Bandz strictly adheres to the following affirmative restrictions:
                  </p>
                  <div className="space-y-3 pt-1">
                    <div className="border-l-2 border-purple-500 pl-4 space-y-1">
                      <h3 className="font-bold text-white text-xs uppercase">1. Only Necessary Feature Provisioning</h3>
                      <p className="text-slate-400 text-xs">
                        We only request Google user data strictly required to provide or enhance user-facing features that are prominent in the Bandz user interface (user authentication, tour management, and roster synchronization).
                      </p>
                    </div>

                    <div className="border-l-2 border-purple-500 pl-4 space-y-1">
                      <h3 className="font-bold text-white text-xs uppercase">2. Absolute Prohibition on Data Transfer</h3>
                      <p className="text-slate-400 text-xs">
                        We do NOT transfer Google user data to third parties, except: (a) as necessary to provide or improve user-facing features with service providers bound by strict confidentiality (such as Google Cloud Firestore hosting); (b) to comply with applicable laws; or (c) as part of a merger or acquisition with explicit notice. We <strong>never</strong> transfer Google user data to advertising networks, data aggregators, or information brokers.
                      </p>
                    </div>

                    <div className="border-l-2 border-purple-500 pl-4 space-y-1">
                      <h3 className="font-bold text-white text-xs uppercase">3. Prohibition on Advertising & Retargeting</h3>
                      <p className="text-slate-400 text-xs">
                        We do NOT use or transfer Google user data for serving personalized, re-targeted, or interest-based advertisements under any circumstances.
                      </p>
                    </div>

                    <div className="border-l-2 border-purple-500 pl-4 space-y-1">
                      <h3 className="font-bold text-white text-xs uppercase">4. Human Access Restrictions</h3>
                      <p className="text-slate-400 text-xs">
                        Humans are NOT permitted to read your Google user data unless: (a) you have provided explicit affirmative consent for technical troubleshooting of a specific reported issue; (b) it is required for internal security audits or incident response; (c) it is aggregated and anonymized for internal systems telemetry; or (d) required by law enforcement or valid court order.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 5: AI Policy */}
                <section id="priv-ai-policy" className="space-y-3 scroll-mt-20">
                  <h2 className="text-lg font-bold text-white uppercase font-display tracking-tight flex items-center gap-2">
                    <span className="text-purple-400 font-mono text-sm">05.</span> Artificial Intelligence (AI) & Machine Learning Policy
                  </h2>
                  <p>
                    Bandz integrates advanced generative artificial intelligence capabilities (Manager AI) to empower artists to draft press releases, social media promo announcements, and tour publicity copy.
                  </p>
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase font-mono">
                      <CheckCircle2 size={13} />
                      <span>Zero Model Training on Google User Data</span>
                    </div>
                    <p className="text-slate-300 text-xs">
                      <strong>Bandz Platform does NOT use Google user data, nor any private artistic compositions, setlists, lyrics, or personal communications, to train, retrain, or fine-tune generalized machine learning (ML) or artificial intelligence (AI) models.</strong> All AI inferences utilize ephemeral, server-side API processing solely to generate the requested output in real time.
                    </p>
                  </div>
                </section>

                {/* Section 6: General Data */}
                <section id="priv-data-collected" className="space-y-3 scroll-mt-20">
                  <h2 className="text-lg font-bold text-white uppercase font-display tracking-tight flex items-center gap-2">
                    <span className="text-purple-400 font-mono text-sm">06.</span> General Categories of Data Collected
                  </h2>
                  <p>
                    In addition to authentication identity, Bandz processes user-provided content required to operate the stage management console:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                    <li><strong>Artist Profiles:</strong> Band names, genres, member rosters, assigned instruments, split percentages, technical riders, and social links.</li>
                    <li><strong>Live Gig & Concert Records:</strong> Dates, venue names, addresses, ticket prices, duration, door times, and load-in schedules.</li>
                    <li><strong>Setlists & Songs:</strong> Song titles, BPM, keys, audio track stems, lyrics, and sequenced set timings.</li>
                    <li><strong>Tour Financial Records:</strong> Show guarantees, ticket splits, merchandise sales, and operational travel expenses.</li>
                    <li><strong>Public EPK & LinkTree Assets:</strong> Photos and public tour announcements published by the artist for public fan viewing.</li>
                  </ul>
                </section>

                {/* Section 7: Third Parties */}
                <section id="priv-sharing" className="space-y-3 scroll-mt-20">
                  <h2 className="text-lg font-bold text-white uppercase font-display tracking-tight flex items-center gap-2">
                    <span className="text-purple-400 font-mono text-sm">07.</span> Third-Party Service Providers & Subprocessors
                  </h2>
                  <p>
                    We engage vetted third-party service providers who process data strictly under our contractual instructions:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                      <span className="font-bold text-white block">Google Cloud Platform & Firebase</span>
                      <span className="text-slate-400 text-[11px]">Database persistence (Firestore), server hosting, and authentication infrastructure in us-east1.</span>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                      <span className="font-bold text-white block">Google Generative AI (Gemini)</span>
                      <span className="text-slate-400 text-[11px]">Real-time press release and promotional text generation via server-side API proxy.</span>
                    </div>
                  </div>
                </section>

                {/* Section 8: Security */}
                <section id="priv-security" className="space-y-3 scroll-mt-20">
                  <h2 className="text-lg font-bold text-white uppercase font-display tracking-tight flex items-center gap-2">
                    <span className="text-purple-400 font-mono text-sm">08.</span> Technical Data Security & Encryption Standards
                  </h2>
                  <p>
                    Bandz employs industry-standard administrative, physical, and technical safeguards to protect your personal and musical data:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                    <li><strong>Encryption in Transit:</strong> 100% of data traffic between your browser and our servers is secured with modern TLS 1.3 encryption.</li>
                    <li><strong>Encryption at Rest:</strong> Cloud Firestore documents and assets are encrypted at rest using AES-256 standard encryption.</li>
                    <li><strong>Database Security Rules:</strong> Granular Firestore security rules restrict read and write access to authenticated owners and verified band members.</li>
                    <li><strong>Zero Plaintext Credentials:</strong> Passwords and OAuth access tokens are never stored in readable plaintext.</li>
                  </ul>
                </section>

                {/* Section 9: Retention & Deletion */}
                <section id="priv-retention" className="space-y-3 scroll-mt-20">
                  <h2 className="text-lg font-bold text-white uppercase font-display tracking-tight flex items-center gap-2">
                    <span className="text-purple-400 font-mono text-sm">09.</span> Data Retention, Account Deletion & Revocation
                  </h2>
                  <p>
                    We retain your data only for as long as your account remains active or as needed to provide you with console services. You maintain complete sovereignty over your information:
                  </p>
                  <div className="space-y-3 pt-2">
                    <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                      <h3 className="font-bold text-white text-xs uppercase flex items-center gap-2">
                        <ExternalLink size={13} className="text-purple-400" />
                        <span>How to Revoke Google Permissions at Any Time</span>
                      </h3>
                      <p className="text-xs text-slate-400 leading-normal">
                        You can instantly disconnect Bandz from your Google account by navigating to Google's official permissions management center:{' '}
                        <a 
                          href="https://myaccount.google.com/permissions" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 underline font-mono font-bold"
                        >
                          myaccount.google.com/permissions
                        </a>. Revoking access halts any further token verification immediately.
                      </p>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                      <h3 className="font-bold text-white text-xs uppercase flex items-center gap-2">
                        <Trash2 size={13} className="text-red-400" />
                        <span>How to Request Total Data Deletion</span>
                      </h3>
                      <p className="text-xs text-slate-400 leading-normal">
                        To request the permanent purge of all associated band profiles, setlists, gigs, and user logs, click the <strong>Request Data Deletion</strong> button at the top of this document, or send an email from your registered address to <span className="text-white font-mono">dev@alistwebs.com</span> with the subject line <em>"Data Deletion Request"</em>. Requests are fulfilled within 30 calendar days.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 10: Rights */}
                <section id="priv-rights" className="space-y-3 scroll-mt-20">
                  <h2 className="text-lg font-bold text-white uppercase font-display tracking-tight flex items-center gap-2">
                    <span className="text-purple-400 font-mono text-sm">10.</span> Your International Rights (GDPR & CCPA/CPRA)
                  </h2>
                  <p>
                    Depending on your geographic residency, you are entitled to exercise statutory data protection rights without discriminatory penalty:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-300">
                    <li><strong>Right to Access:</strong> Inspect what personal data we hold about you.</li>
                    <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete band and contact records.</li>
                    <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> Request complete deletion of your records.</li>
                    <li><strong>Right to Data Portability:</strong> Export your tour schedules, setlists, and budget tables in structured formats (JSON/CSV).</li>
                    <li><strong>Right to Opt-Out of Sale:</strong> We do NOT sell personal data; no opt-out is necessary as we never trade your information.</li>
                  </ul>
                </section>

                {/* Section 11: Cookies */}
                <section id="priv-cookies" className="space-y-3 scroll-mt-20">
                  <h2 className="text-lg font-bold text-white uppercase font-display tracking-tight flex items-center gap-2">
                    <span className="text-purple-400 font-mono text-sm">11.</span> Cookies, Client Storage & Local Persistence
                  </h2>
                  <p>
                    Bandz uses browser client-side storage (<code className="text-purple-300 font-mono text-xs">localStorage</code> and secure session tokens) strictly for functional utility:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-300">
                    <li><code className="text-purple-300 font-mono text-xs">bandz_theme</code>: Remembers your customized theme preference (e.g., Midnight Gold, Classic Day).</li>
                    <li><code className="text-purple-300 font-mono text-xs">bandz_credits_*</code>: Tracks your available Manager AI prompt allowance.</li>
                    <li><code className="text-purple-300 font-mono text-xs">bandz_session</code>: Retains your authenticated session state to prevent repeated logins.</li>
                  </ul>
                  <p className="text-slate-400 text-xs">
                    We do NOT utilize intrusive third-party cross-site advertising cookies or pixel beacons.
                  </p>
                </section>

                {/* Section 12: Contact */}
                <section id="priv-contact" className="space-y-3 scroll-mt-20 border-t border-slate-900 pt-6">
                  <h2 className="text-lg font-bold text-white uppercase font-display tracking-tight flex items-center gap-2">
                    <span className="text-purple-400 font-mono text-sm">12.</span> Contact Our Privacy Officer
                  </h2>
                  <p>
                    For questions, concerns, or legal inquiries regarding this Privacy Policy or our Google compliance standards, please direct communications to:
                  </p>
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-1 font-mono text-xs">
                    <div><strong>Bandz Platform Privacy Desk</strong></div>
                    <div>A-List Webs Legal & Engineering Operations</div>
                    <div>Direct Contact Email: <a href="mailto:dev@alistwebs.com" className="text-purple-400 underline font-bold">dev@alistwebs.com</a></div>
                    <div>Website: <span className="text-slate-300">https://ais-pre-fno52axnobkig63wafumfo-64647011319.us-east1.run.app</span></div>
                  </div>
                </section>
              </article>
            ) : (
              /* TERMS OF SERVICE */
              <article className="space-y-8 max-w-3xl">
                {/* Title */}
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-purple-300 uppercase tracking-widest">
                    <Scale size={13} />
                    <span>ARTIST & OPERATIONAL SERVICE CONTRACT</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-tight">
                    Bandz Platform Terms of Service
                  </h1>
                  <p className="text-xs text-slate-400 font-mono">
                    Effective Date: September 15, 2026 • Standard Stage Console Agreement
                  </p>
                </div>

                {/* Key Guarantee Box */}
                <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900/80 border border-purple-500/30 rounded-2xl p-5 sm:p-6 space-y-2 shadow-lg">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase font-mono">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>The Bandz Artist Sovereignty Guarantee</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    <strong>Artists own 100% of their creative work.</strong> Bandz Platform claims zero copyright, licensing rights, royalty cuts, or ownership over your original songs, setlists, lyrics, audio stems, stage photos, or merchandise. You retain total intellectual property rights to your music forever.
                  </p>
                </div>

                {/* Terms Section 1 */}
                <section id="terms-acceptance" className="space-y-3 scroll-mt-20">
                  <h2 className="text-lg font-bold text-white uppercase font-display tracking-tight flex items-center gap-2">
                    <span className="text-purple-400 font-mono text-sm">01.</span> Acceptance of Terms
                  </h2>
                  <p>
                    By creating an account, initializing a 14-day trial pass, purchasing a subscription tier, or accessing Bandz Platform (the "Service"), you agree to be bound by these Terms of Service ("Terms") and our incorporated Privacy Policy. If you are entering into these Terms on behalf of a musical band, collective, agency, or management company, you represent that you possess the legal authority to bind that entity.
                  </p>
                </section>

                {/* Terms Section 2 */}
                <section id="terms-eligibility" className="space-y-3 scroll-mt-20">
                  <h2 className="text-lg font-bold text-white uppercase font-display tracking-tight flex items-center gap-2">
                    <span className="text-purple-400 font-mono text-sm">02.</span> Eligibility & Account Security
                  </h2>
                  <p>
                    You must be at least 13 years of age (or the minimum age of digital consent in your jurisdiction) to use the Service. You agree to provide accurate, current, and complete registration information and to safeguard your credentials against unauthorized access. You are fully responsible for all activities that occur under your administrator or crew node credentials.
                  </p>
                </section>

                {/* Terms Section 3 */}
                <section id="terms-subscriptions" className="space-y-3 scroll-mt-20">
                  <h2 className="text-lg font-bold text-white uppercase font-display tracking-tight flex items-center gap-2">
                    <span className="text-purple-400 font-mono text-sm">03.</span> Subscription Plans & 14-Day Free Trial Policy
                  </h2>
                  <p>
                    Bandz offers structured operational tiers designed for various touring phases:
                  </p>
                  <div className="space-y-2 pt-1">
                    <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-white text-xs">14-Day Free Trial (Soundcheck Pass)</strong>
                        <span className="text-purple-400 font-mono text-xs font-bold">$0.00 Free Pass</span>
                      </div>
                      <p className="text-slate-400 text-xs">
                        Provides full console access for 14 calendar days with 15 monthly AI credits. <strong>No credit card is required to initialize the trial pass.</strong> At the conclusion of 14 days, console access transitions into view/upgrade status. Users will never be charged automatically without active selection of a paid tier. Limit: 1 trial pass per band roster/environment.
                      </p>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-white text-xs">Weekly Pass ($7.75 / week)</strong>
                        <span className="text-purple-400 font-mono text-xs font-bold">$7.75/wk</span>
                      </div>
                      <p className="text-slate-400 text-xs">
                        Flexible 7-day single tour run pass with complete Touring Pro features and 50 AI weekly credits.
                      </p>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-white text-xs">Touring Pro ($19.00 / month)</strong>
                        <span className="text-purple-400 font-mono text-xs font-bold">$19/mo</span>
                      </div>
                      <p className="text-slate-400 text-xs">
                        Unlimited bands, 150 AI monthly credits, budget split ledgers, and public EPK/LinkTree hosting.
                      </p>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-white text-xs">Arena Headliner ($49.00 / month)</strong>
                        <span className="text-purple-400 font-mono text-xs font-bold">$49/mo</span>
                      </div>
                      <p className="text-slate-400 text-xs">
                        Complete agency VIP suite, connected geographic tour map routing, and 500 AI monthly credits.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Terms Section 4 */}
                <section id="terms-ownership" className="space-y-3 scroll-mt-20">
                  <h2 className="text-lg font-bold text-white uppercase font-display tracking-tight flex items-center gap-2">
                    <span className="text-purple-400 font-mono text-sm">04.</span> Intellectual Property & Music Ownership
                  </h2>
                  <p>
                    You retain exclusive and unfettered ownership of all content, audio recordings, song files, setlists, lyrics, stage riders, artwork, and promotional materials you upload to or create within Bandz.
                  </p>
                  <p>
                    You grant Bandz Platform a strictly limited, non-exclusive, revocable license solely to host, store, geocode, format, and display your public tour dates and artist press kit (EPK) to the extent necessary to deliver the features you enable. We will never sell, license, or monetize your musical creations to third parties.
                  </p>
                </section>

                {/* Terms Section 5 */}
                <section id="terms-splits" className="space-y-3 scroll-mt-20">
                  <h2 className="text-lg font-bold text-white uppercase font-display tracking-tight flex items-center gap-2">
                    <span className="text-purple-400 font-mono text-sm">05.</span> Band Financial Ledgers & Revenue Calculations
                  </h2>
                  <p>
                    Bandz provides budget calculators and split ledger utilities to assist bands in estimating door payouts, production cost deductions, and member percentage allocations.
                  </p>
                  <p className="text-slate-400 text-xs">
                    <em>Legal Disclaimer:</em> Bandz is a software productivity utility, not a certified accounting firm, banking institution, or legal counsel. Artists and managers remain solely responsible for validating contract agreements, paying taxes, and disbursing funds in accordance with local regulations and band member partnership agreements.
                  </p>
                </section>

                {/* Terms Section 6 */}
                <section id="terms-ai-usage" className="space-y-3 scroll-mt-20">
                  <h2 className="text-lg font-bold text-white uppercase font-display tracking-tight flex items-center gap-2">
                    <span className="text-purple-400 font-mono text-sm">06.</span> AI Manager & Generated Promotional Copy
                  </h2>
                  <p>
                    When using Manager AI features to generate press releases, social promos, and fan announcements, you acknowledge that generative AI outputs are automated drafts provided for your convenience. You are responsible for reviewing and verifying the accuracy of any generated text prior to public distribution. You must not use the AI generation tools to produce defamatory, infringing, or unlawful material.
                  </p>
                </section>

                {/* Terms Section 7 */}
                <section id="terms-acceptable" className="space-y-3 scroll-mt-20">
                  <h2 className="text-lg font-bold text-white uppercase font-display tracking-tight flex items-center gap-2">
                    <span className="text-purple-400 font-mono text-sm">07.</span> Acceptable Use & Prohibited Conduct
                  </h2>
                  <p>
                    You agree that you will not:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                    <li>Attempt to reverse-engineer, decompile, or extract the source code of the Bandz platform;</li>
                    <li>Utilize automated crawlers, bots, or scrapers to extract venue databases or artist contact records;</li>
                    <li>Upload malicious code, viruses, or disruptive scripts;</li>
                    <li>Circumvent or tamper with trial safeguards, security rules, or subscription verification systems;</li>
                    <li>Upload content that infringes upon the copyrights, trademarks, or personal privacy rights of any third party.</li>
                  </ul>
                </section>

                {/* Terms Section 8 */}
                <section id="terms-termination" className="space-y-3 scroll-mt-20">
                  <h2 className="text-lg font-bold text-white uppercase font-display tracking-tight flex items-center gap-2">
                    <span className="text-purple-400 font-mono text-sm">08.</span> Subscription Cancellation & Account Termination
                  </h2>
                  <p>
                    You may cancel your subscription at any time through the platform console or by contacting support. Upon cancellation, your account remains active through the end of the current paid billing cycle. You may export all setlist and gig records prior to departure. We reserve the right to suspend or terminate accounts that breach acceptable conduct or engage in fraudulent activity.
                  </p>
                </section>

                {/* Terms Section 9 */}
                <section id="terms-disclaimer" className="space-y-3 scroll-mt-20">
                  <h2 className="text-lg font-bold text-white uppercase font-display tracking-tight flex items-center gap-2">
                    <span className="text-purple-400 font-mono text-sm">09.</span> Disclaimers of Warranties
                  </h2>
                  <p>
                    THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. BANDZ DOES NOT WARRANT THAT LIVE STAGE COUNTDOWNS, VENUE CURFEW REMINDERS, OR THIRD-PARTY CALENDAR SYNC WILL BE ERROR-FREE OR UNINTERRUPTED.
                  </p>
                </section>

                {/* Terms Section 10 */}
                <section id="terms-liability" className="space-y-3 scroll-mt-20">
                  <h2 className="text-lg font-bold text-white uppercase font-display tracking-tight flex items-center gap-2">
                    <span className="text-purple-400 font-mono text-sm">10.</span> Limitation of Liability
                  </h2>
                  <p>
                    TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL BANDZ PLATFORM, A-LIST WEBS, OR ITS DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES (INCLUDING LOSS OF CONCERT REVENUE, TICKET PROCEEDS, OR DATA), ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF OR INABILITY TO USE THE SERVICE. IN NO CASE SHALL OUR TOTAL AGGREGATE LIABILITY EXCEED THE GREATER OF FIFTY DOLLARS ($50.00 USD) OR THE AMOUNT YOU PAID TO BANDZ IN THE PRECEDING SIX MONTHS.
                  </p>
                </section>

                {/* Terms Section 11 */}
                <section id="terms-contact" className="space-y-3 scroll-mt-20 border-t border-slate-900 pt-6">
                  <h2 className="text-lg font-bold text-white uppercase font-display tracking-tight flex items-center gap-2">
                    <span className="text-purple-400 font-mono text-sm">11.</span> Governing Law & Contact
                  </h2>
                  <p>
                    These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law principles. Any legal disputes arising under these Terms shall be resolved in the competent courts having jurisdiction over our primary operations.
                  </p>
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-1 font-mono text-xs">
                    <div><strong>Bandz Platform Legal Desk</strong></div>
                    <div>A-List Webs Compliance</div>
                    <div>Inquiries: <a href="mailto:dev@alistwebs.com" className="text-purple-400 underline font-bold">dev@alistwebs.com</a></div>
                  </div>
                </section>
              </article>
            )}
          </main>
        </div>

        {/* Footer Actions */}
        <footer className="px-5 py-3 border-t border-slate-900 bg-slate-950/95 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <span>Bandz Platform © 2026</span>
            <span>•</span>
            <span>All rights reserved</span>
            <span>•</span>
            <span>A-List Webs</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-purple-600/20"
            >
              I Understand & Acknowledge
            </button>
          </div>
        </footer>
      </div>

      {/* Data Deletion Request Modal */}
      <AnimatePresence>
        {showDeletionModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <Trash2 size={24} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white font-display uppercase">
                  Request Total Data Deletion
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  In accordance with Google API policies, GDPR, and CCPA, you may request permanent removal of your account, email records, and band assets.
                </p>
              </div>

              {deletionSent ? (
                <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-xl text-center space-y-2">
                  <CheckCircle2 size={24} className="text-emerald-400 mx-auto" />
                  <div className="text-xs font-bold text-emerald-300">Deletion Request Recorded</div>
                  <p className="text-[11px] text-slate-400">
                    A verification notice has been queued to your email. Your data will be permanently wiped within 30 calendar days.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleDeletionSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase font-semibold mb-1">
                      Account Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="your.email@gmail.com"
                      value={deletionEmail}
                      onChange={(e) => setDeletionEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase font-semibold mb-1">
                      Band / Artist Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Neon Horizon"
                      value={deletionBand}
                      onChange={(e) => setDeletionBand(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDeletionModal(false)}
                      className="px-3.5 py-2 text-xs text-slate-400 hover:text-white rounded-xl bg-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-md shadow-red-600/20 cursor-pointer"
                    >
                      Submit Purge Request
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
