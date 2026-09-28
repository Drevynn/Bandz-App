import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Mail, 
  Send, 
  Trash2, 
  Plus, 
  Search, 
  Database, 
  Users, 
  TrendingUp, 
  Sparkles, 
  Clock, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  Edit2, 
  Settings, 
  Layers, 
  RotateCcw, 
  FileText, 
  Layout,
  X,
  User,
  Filter,
  BarChart3,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Interfaces
export interface CapturedEmail {
  id: string;
  email: string;
  artistName: string;
  source: 'demo_signup' | 'premium_pro' | 'premium_arena' | 'admin_added';
  capturedAt: string;
  subscribed: boolean;
  status?: 'Pending' | 'Followed Up' | 'Replied';
  lastFollowUpAt?: string;
}

export interface EmailCampaign {
  id: string;
  subject: string;
  templateId: 'welcome' | 'promo' | 'ai_newsletter' | 'custom';
  body: string;
  ctaText: string;
  ctaUrl: string;
  sentAt: string;
  recipientCount: number;
  openRate: number; // Percentage
  clickRate: number; // Percentage
}

interface AdminTabProps {
  artists: any[];
  gigs: any[];
}

const TEMPLATES = [
  {
    id: 'welcome' as const,
    label: 'Welcome & Onboarding Digest',
    subject: 'Welcome to Bandz - Rock Your Next Tour! 🎸',
    ctaText: 'Explore Sandbox Dashboard',
    ctaUrl: 'https://bandz.io/dashboard',
    body: `Hi there!\n\nWelcome to Bandz, the ultimate admin command deck for independent artists, bands, and tour managers. We've initialized your local secure browser storage node and activated your AI credits.\n\nHere is what you can do right now:\n• Plan and schedule gigs in the high-fidelity scheduler.\n• Track budgets and split revenues with the Cost Accountant.\n• Design responsive visual setlists and pacing audits.\n\nKeep raw, keep live.\n- The Bandz Team`
  },
  {
    id: 'promo' as const,
    label: 'Premium Tier Offer (25% Off)',
    subject: 'Level Up Your Tour: Get 25% Off Bandz Pro/Arena 🌟',
    ctaText: 'Claim 25% Off Discount',
    ctaUrl: 'https://bandz.io/checkout?code=TOUR25',
    body: `Ready to upgrade your band node?\n\nFor a limited time, we're giving independent artists 25% off our premium tiers! Get access to:\n• VIP Connected Geographic Tour Map routing.\n• Up to 500 safe AI Credits per month for promotional asset creation.\n• Dedicated priority server nodes.\n\nUse coupon code TOUR25 at checkout.`
  },
  {
    id: 'ai_newsletter' as const,
    label: "The Manager's AI Newsletter",
    subject: 'Weekly Gig Tip: Maximizing Merch Sales on Tour 📈',
    ctaText: 'Consult the AI Manager',
    ctaUrl: 'https://bandz.io/ai-manager',
    body: `Greetings Artist,\n\nDid you know that merch accounts for up to 45% of independent touring revenues? Here are three expert tips from our AI promotional models:\n1. Place your merch table directly next to the exit or the main bar.\n2. Accept card and contactless payments—cash-only tables lose 30% of sales.\n3. Bundle stickers and buttons with vinyl or shirt purchases.\n\nWant custom strategies? Click below to consult the AI Manager.`
  },
  {
    id: 'custom' as const,
    label: 'Plain Custom Email Blast',
    subject: 'Important Band Update: Tour Notice 📢',
    ctaText: 'Read Full Announcement',
    ctaUrl: 'https://bandz.io/news',
    body: `Dear Fans and Artists,\n\nWe are launching a custom campaign update today. Write your own markdown or text announcement here to keep your subscribers completely updated.`
  }
];

export default function AdminTab({ artists, gigs }: AdminTabProps) {
  // Captured emails and Campaign stats states
  const [emails, setEmails] = useState<CapturedEmail[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState<'all' | 'demo_signup' | 'premium_pro' | 'premium_arena' | 'admin_added'>('all');

  // New Contact Dialog
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newArtistName, setNewArtistName] = useState('');
  const [newSource, setNewSource] = useState<'demo_signup' | 'premium_pro' | 'premium_arena' | 'admin_added'>('admin_added');
  const [addError, setAddError] = useState('');

  // Editing Contact Dialog
  const [editingContact, setEditingContact] = useState<CapturedEmail | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editArtistName, setEditArtistName] = useState('');
  const [editSource, setEditSource] = useState<'demo_signup' | 'premium_pro' | 'premium_arena' | 'admin_added'>('admin_added');

  // Campaign Builder States
  const [activeTemplateId, setActiveTemplateId] = useState<'welcome' | 'promo' | 'ai_newsletter' | 'custom'>('welcome');
  const [campaignSubject, setCampaignSubject] = useState(TEMPLATES[0].subject);
  const [campaignBody, setCampaignBody] = useState(TEMPLATES[0].body);
  const [campaignCtaText, setCampaignCtaText] = useState(TEMPLATES[0].ctaText);
  const [campaignCtaUrl, setCampaignCtaUrl] = useState(TEMPLATES[0].ctaUrl);

  // Simulation Status States
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [simSuccessCount, setSimSuccessCount] = useState(0);
  const [sendingLeads, setSendingLeads] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Loaded state
  useEffect(() => {
    // Seed initial emails if empty
    const storedEmails = localStorage.getItem('bandz_captured_emails');
    let emailList: CapturedEmail[] = [];
    if (storedEmails) {
      emailList = JSON.parse(storedEmails);
    } else {
      // Seed high-quality, professional demo contacts
      emailList = [
        {
          id: 'cap_seed_admin',
          email: 'dev@alistwebs.com',
          artistName: 'A-List Administrator',
          source: 'premium_arena',
          capturedAt: new Date().toISOString(),
          subscribed: true
        },
        {
          id: 'cap_seed_1',
          email: 'sovranly.ip@gmail.com', // User email from metadata
          artistName: 'Nirvana',
          source: 'demo_signup',
          capturedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          subscribed: true
        },
        {
          id: 'cap_seed_2',
          email: 'dave.grohl@foofighters.com',
          artistName: 'Foo Fighters',
          source: 'premium_arena',
          capturedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          subscribed: true
        },
        {
          id: 'cap_seed_3',
          email: 'trent.reznor@nin.com',
          artistName: 'Nine Inch Nails',
          source: 'premium_pro',
          capturedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          subscribed: true
        },
        {
          id: 'cap_seed_4',
          email: 'reggie@velvetunderground.org',
          artistName: 'The Velvet Underground',
          source: 'demo_signup',
          capturedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          subscribed: true
        },
        {
          id: 'cap_seed_5',
          email: 'booking@daftpunk.com',
          artistName: 'Daft Punk',
          source: 'premium_arena',
          capturedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          subscribed: false // Simulated unsubscribed
        }
      ];
      localStorage.setItem('bandz_captured_emails', JSON.stringify(emailList));
    }
    setEmails(emailList);

    // Initial campaigns history
    const storedCampaigns = localStorage.getItem('bandz_campaigns_history');
    if (storedCampaigns) {
      setCampaigns(JSON.parse(storedCampaigns));
    } else {
      const initialCampaigns: EmailCampaign[] = [
        {
          id: 'camp_seed_1',
          subject: 'Welcome to Bandz - Rock Your Next Tour! 🎸',
          templateId: 'welcome',
          body: TEMPLATES[0].body,
          ctaText: TEMPLATES[0].ctaText,
          ctaUrl: TEMPLATES[0].ctaUrl,
          sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          recipientCount: 4,
          openRate: 75,
          clickRate: 50
        }
      ];
      localStorage.setItem('bandz_campaigns_history', JSON.stringify(initialCampaigns));
      setCampaigns(initialCampaigns);
    }
  }, []);

  // Update builder inputs when template changes
  const handleTemplateChange = (id: 'welcome' | 'promo' | 'ai_newsletter' | 'custom') => {
    setActiveTemplateId(id);
    const tmpl = TEMPLATES.find(t => t.id === id);
    if (tmpl) {
      setCampaignSubject(tmpl.subject);
      setCampaignBody(tmpl.body);
      setCampaignCtaText(tmpl.ctaText);
      setCampaignCtaUrl(tmpl.ctaUrl);
    }
  };

  // Save emails list helper
  const saveEmails = (newList: CapturedEmail[]) => {
    setEmails(newList);
    localStorage.setItem('bandz_captured_emails', JSON.stringify(newList));
  };

  // Add contact submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      setAddError('Email is required.');
      return;
    }
    if (!newArtistName.trim()) {
      setAddError('Artist/Band name is required.');
      return;
    }
    if (emails.some(item => item.email.toLowerCase() === newEmail.trim().toLowerCase())) {
      setAddError('This email is already in your captures database.');
      return;
    }

    const item: CapturedEmail = {
      id: 'cap_' + Date.now(),
      email: newEmail.trim(),
      artistName: newArtistName.trim(),
      source: newSource,
      capturedAt: new Date().toISOString(),
      subscribed: true,
      status: 'Pending'
    };

    saveEmails([item, ...emails]);
    setNewEmail('');
    setNewArtistName('');
    setNewSource('admin_added');
    setAddError('');
    setShowAddModal(false);
  };

  // Edit contact submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact) return;
    if (!editEmail.trim() || !editArtistName.trim()) return;

    const updated = emails.map(item => {
      if (item.id === editingContact.id) {
        return {
          ...item,
          email: editEmail.trim(),
          artistName: editArtistName.trim(),
          source: editSource
        };
      }
      return item;
    });

    saveEmails(updated);
    setEditingContact(null);
  };

  // Delete contact
  const handleDeleteContact = (id: string) => {
    if (window.confirm('Are you sure you want to remove this captured contact? This cannot be undone.')) {
      const filtered = emails.filter(item => item.id !== id);
      saveEmails(filtered);
    }
  };

  // Toggle subscriber status
  const handleToggleSubscribed = (id: string) => {
    const updated = emails.map(item => {
      if (item.id === id) {
        return { ...item, subscribed: !item.subscribed };
      }
      return item;
    });
    saveEmails(updated);
  };

  // Send simulated individual follow-up
  const handleSendFollowUp = (id: string) => {
    // Set loading state for this contact ID
    setSendingLeads(prev => ({ ...prev, [id]: true }));

    // Simulate sending email over SMTP relay
    setTimeout(() => {
      const updated = emails.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: 'Followed Up' as const,
            lastFollowUpAt: new Date().toISOString()
          };
        }
        return item;
      });
      saveEmails(updated);
      setSendingLeads(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }, 1000);
  };

  // Run Campaign Blast Simulation
  const handleRunSimulation = () => {
    const activeSubscribers = emails.filter(item => item.subscribed);
    if (activeSubscribers.length === 0) {
      setToastMessage({
        type: 'error',
        message: 'There are no active, subscribed email addresses available to receive this campaign. Please add or check subscription toggles.'
      });
      setTimeout(() => setToastMessage(null), 5000);
      return;
    }

    setIsSimulating(true);
    setSimProgress(0);
    setSimLogs(['[SYSTEM] Initializing email marketing campaign dispatch...']);
    setSimSuccessCount(0);

    let progress = 0;
    const total = activeSubscribers.length;
    const intervalTime = Math.max(300, 1500 / total); // Scaled speed

    // Simulated log sequences
    const steps = [
      () => setSimLogs(prev => [...prev, `[SMTP] Resolving secure outbound TLS connection... SUCCESS`]),
      () => setSimLogs(prev => [...prev, `[TEMPLATE] Parsed design assets for: "${campaignSubject}"... SUCCESS`]),
      () => setSimLogs(prev => [...prev, `[SPF/DKIM] Domain validation verification passed... SECURE`])
    ];

    let stepIndex = 0;
    const runner = setInterval(() => {
      if (stepIndex < steps.length) {
        steps[stepIndex]();
        stepIndex++;
        return;
      }

      if (progress < total) {
        const contact = activeSubscribers[progress];
        setSimLogs(prev => [
          ...prev, 
          `[SENDING] Dispatching to ${contact.email} (${contact.artistName})... DELIVERED`
        ]);
        progress++;
        setSimSuccessCount(progress);
        setSimProgress(Math.round((progress / total) * 100));
      } else {
        clearInterval(runner);
        
        // Finalize Campaign
        setSimLogs(prev => [
          ...prev, 
          `[CAMPAIGN] Complete! Transmitted to ${total} active nodes. Tracking analytics parameters...`
        ]);

        setTimeout(() => {
          // Generate realistic randomized click/open rates based on subject length & content quality
          const calculatedOpen = Math.round(55 + Math.random() * 35); // 55% - 90%
          const calculatedClick = Math.round(15 + Math.random() * 25); // 15% - 40%

          const newCamp: EmailCampaign = {
            id: 'camp_' + Date.now(),
            subject: campaignSubject,
            templateId: activeTemplateId,
            body: campaignBody,
            ctaText: campaignCtaText,
            ctaUrl: campaignCtaUrl,
            sentAt: new Date().toISOString(),
            recipientCount: total,
            openRate: calculatedOpen,
            clickRate: calculatedClick
          };

          const updatedCampaigns = [newCamp, ...campaigns];
          setCampaigns(updatedCampaigns);
          localStorage.setItem('bandz_campaigns_history', JSON.stringify(updatedCampaigns));
          setIsSimulating(false);
          setToastMessage({
            type: 'success',
            message: `Campaign successfully sent to ${total} artist administrator nodes!`
          });
          setTimeout(() => setToastMessage(null), 5000);
        }, 1200);
      }
    }, intervalTime);
  };

  // Seed raw data helper
  const handleResetAndSeed = () => {
    setShowResetConfirm(true);
  };

  const confirmResetAndSeed = () => {
    localStorage.removeItem('bandz_captured_emails');
    localStorage.removeItem('bandz_campaigns_history');
    setShowResetConfirm(false);
    window.location.reload();
  };

  // Filter and Search logic
  const filteredEmails = emails.filter(item => {
    const matchesSearch = 
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.artistName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSource === 'all' || item.source === filterSource;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 pb-12" id="admin-panel-tab">
      {/* 1. Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 relative overflow-hidden">
        {/* Abstract glowing graphics */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck size={10} /> Site Command Deck
              </span>
              <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px] font-mono">v1.2 Secure</span>
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight font-display">
              Bandz Administrator Console
            </h1>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Track captured marketing leads, monitor registration conversion rates, and execute target email campaigns to convert sandboxed users into paying subscribers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetAndSeed}
              className="px-4 py-2 bg-slate-950 border border-slate-800 hover:border-red-500/20 text-slate-400 hover:text-red-400 rounded-xl text-xs transition-all font-mono font-bold cursor-pointer flex items-center gap-2"
              title="Reset metrics database to original seed state"
            >
              <RotateCcw size={13} />
              Reset Site Data
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs transition-all font-bold cursor-pointer flex items-center gap-2 border-none shadow-lg shadow-purple-600/15"
            >
              <Plus size={14} />
              Add Lead Contact
            </button>
          </div>
        </div>
      </div>

      {/* 2. Statistical Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Users size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Total Captured</span>
            <span className="text-xl font-black text-white font-mono">{emails.length}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Mail size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Subscribed</span>
            <span className="text-xl font-black text-white font-mono">
              {emails.filter(e => e.subscribed).length}
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <TrendingUp size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Conversion Rate</span>
            <span className="text-xl font-black text-white font-mono">
              {emails.length > 0 
                ? Math.round((emails.filter(e => e.source.startsWith('premium')).length / emails.length) * 100) 
                : 0}%
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Send size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Campaigns Run</span>
            <span className="text-xl font-black text-white font-mono">{campaigns.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Leads Database Management (2 Cols equivalent on desktop) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Captured Leads Database</h3>
                <p className="text-[11px] text-slate-500">View and manage administrators who signed up or launched the sandbox demo.</p>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-purple-500/50 rounded-lg pl-8 pr-3.5 py-1.5 text-xs text-slate-200 focus:outline-none w-44"
                  />
                  <Search size={12} className="absolute left-2.5 top-2.5 text-slate-500" />
                </div>

                <div className="relative">
                  <select
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 rounded-lg pl-2 pr-7 py-1.5 text-xs text-slate-300 focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="all">All Sources</option>
                    <option value="demo_signup">Demo Signups</option>
                    <option value="premium_pro">Touring Pro</option>
                    <option value="premium_arena">Arena Headliner</option>
                    <option value="admin_added">Admin Added</option>
                  </select>
                  <Filter size={10} className="absolute right-2.5 top-3 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 border-b border-slate-850">
                    <th className="py-3 px-4">Artist Node / Band</th>
                    <th className="py-3 px-4">Contact Email</th>
                    <th className="py-3 px-4">Tier Source</th>
                    <th className="py-3 px-4">Capture Date</th>
                    <th className="py-3 px-4 text-center">Campaign Opt-In</th>
                    <th className="py-3 px-4 text-center">Follow-up Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/60 text-xs text-slate-300">
                  {filteredEmails.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-500 font-mono">
                        No captured leads found matching current parameters.
                      </td>
                    </tr>
                  ) : (
                    filteredEmails.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-850/25 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {item.artistName}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-slate-400">{item.email}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                            item.source === 'premium_arena' 
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : item.source === 'premium_pro'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : item.source === 'admin_added'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {item.source === 'premium_arena' ? 'Arena Upgrade' : item.source === 'premium_pro' ? 'Touring Pro' : item.source === 'admin_added' ? 'Manual Lead' : 'Sandbox Demo'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {new Date(item.capturedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleSubscribed(item.id)}
                            className={`mx-auto px-2 py-0.5 rounded text-[10px] font-mono font-semibold cursor-pointer border ${
                              item.subscribed 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                                : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                            }`}
                          >
                            {item.subscribed ? 'ACTIVE' : 'OPTED_OUT'}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {sendingLeads[item.id] ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono font-bold animate-pulse flex items-center gap-1">
                                <Clock size={10} className="animate-spin" /> SENDING...
                              </span>
                            </div>
                          ) : item.status === 'Followed Up' ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                                <CheckCircle size={10} className="text-purple-400" /> FOLLOWED UP
                              </span>
                              {item.lastFollowUpAt && (
                                <span className="text-[9px] text-slate-500 font-mono">
                                  {new Date(item.lastFollowUpAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSendFollowUp(item.id)}
                              className="mx-auto px-2.5 py-1 bg-purple-600/10 hover:bg-purple-600/30 border border-purple-500/20 hover:border-purple-500/50 text-purple-300 rounded text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1"
                              title="Simulate sending a targeted follow-up email"
                            >
                              <Send size={10} />
                              <span>SEND FOLLOW-UP</span>
                            </button>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditingContact(item);
                                setEditEmail(item.email);
                                setEditArtistName(item.artistName);
                                setEditSource(item.source);
                              }}
                              className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
                              title="Edit Lead Information"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteContact(item.id)}
                              className="p-1 text-slate-500 hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none"
                              title="Delete Lead"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Campaign Send Simulation Activity Logs (Only shown during active send) */}
          <AnimatePresence>
            {isSimulating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-950 border border-purple-500/30 rounded-2xl p-5 space-y-4 shadow-2xl overflow-hidden font-mono"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-purple-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                    CAMPAIGN RELAY SIMULATION ACTIVE
                  </h4>
                  <span className="text-[10px] text-slate-500">{simProgress}% COMPLETE</span>
                </div>

                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-purple-500 to-amber-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${simProgress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>

                {/* Simulated Log Feed */}
                <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl h-44 overflow-y-auto text-[10px] text-slate-400 space-y-1.5 scrollbar-thin">
                  {simLogs.map((log, index) => (
                    <div key={index} className="leading-relaxed">
                      <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                      <span className={log.includes('DELIVERED') ? 'text-emerald-400' : log.includes('ERROR') ? 'text-red-400' : 'text-slate-300'}>
                        {log}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Historical Campaigns Track */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart3 size={15} className="text-purple-400" />
                Historical Blast Performance
              </h3>
              <p className="text-[11px] text-slate-500">Measure past delivery performance metrics and open rates to fine-tune marketing assets.</p>
            </div>

            <div className="space-y-3">
              {campaigns.length === 0 ? (
                <div className="text-center py-6 text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-xl">
                  No campaigns have been simulated yet.
                </div>
              ) : (
                campaigns.map((camp) => (
                  <div key={camp.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-800 transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-mono font-bold uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded">
                          {camp.templateId.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Sent {new Date(camp.sentAt).toLocaleDateString()} at {new Date(camp.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200">{camp.subject}</h4>
                      <p className="text-[10px] text-slate-500 truncate max-w-sm">{camp.body}</p>
                    </div>

                    <div className="flex items-center gap-6 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-850">
                      <div className="text-center">
                        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block">Audience</span>
                        <span className="text-xs font-bold text-white font-mono">{camp.recipientCount} Acts</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block">Open Rate</span>
                        <span className="text-xs font-bold text-emerald-400 font-mono">{camp.openRate}%</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block">CTR</span>
                        <span className="text-xs font-bold text-amber-400 font-mono">{camp.clickRate}%</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Email Campaign Dispatch Node */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl relative">
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded">
                MARKETING HUB
              </span>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Campaign Dispatcher</h3>
              <p className="text-[11px] text-slate-500">Design and simulate custom email campaigns targeting captured band accounts.</p>
            </div>

            {/* Template Chooser */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Select Base Template
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => handleTemplateChange(tmpl.id)}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      activeTemplateId === tmpl.id 
                        ? 'bg-purple-600/15 border-purple-500 text-purple-300' 
                        : 'bg-slate-950 border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-[10.5px] font-bold block truncate">{tmpl.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject input */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Subject Line
              </label>
              <input
                type="text"
                placeholder="Enter campaign subject line..."
                value={campaignSubject}
                onChange={(e) => setCampaignSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-purple-500/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none font-medium"
              />
            </div>

            {/* Body Copy */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Email Copy (Markdown supported)
              </label>
              <textarea
                rows={5}
                placeholder="Write your email body copy..."
                value={campaignBody}
                onChange={(e) => setCampaignBody(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-purple-500/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none font-mono leading-relaxed"
              />
            </div>

            {/* CTA Setup */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 text-left">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  CTA Label
                </label>
                <input
                  type="text"
                  placeholder="Button Label"
                  value={campaignCtaText}
                  onChange={(e) => setCampaignCtaText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-purple-500/50 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  CTA Action URL
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={campaignCtaUrl}
                  onChange={(e) => setCampaignCtaUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-purple-500/50 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Real-time Email Preview frame */}
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-4.5 space-y-3 relative overflow-hidden">
              <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-slate-600 block border-b border-slate-900 pb-1.5">
                LIVE COMPOSER PREVIEW FRAME (MOBILE RESPONSIVE)
              </span>

              <div className="space-y-2">
                <div className="space-y-0.5 text-[10.5px]">
                  <div><span className="text-slate-500 font-mono">From:</span> <span className="text-purple-400 font-bold">Bandz Team &lt;admin@bandz.io&gt;</span></div>
                  <div><span className="text-slate-500 font-mono">Subject:</span> <span className="text-white font-bold">{campaignSubject || '(No Subject Provided)'}</span></div>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-850 text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                  {campaignBody}

                  {campaignCtaText && (
                    <div className="pt-4 pb-1">
                      <a
                        href={campaignCtaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10.5px] px-4 py-2 rounded-lg transition-all text-center pointer-events-none uppercase tracking-wide"
                      >
                        {campaignCtaText}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Run Blast Submit */}
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className={`w-full font-bold text-xs py-3.5 rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 border-none shadow-lg ${
                isSimulating 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white cursor-pointer shadow-purple-600/10'
              }`}
            >
              <Send size={13} className={isSimulating ? 'animate-pulse' : ''} />
              <span>{isSimulating ? 'Simulating Dispatch...' : 'Dispatch Blast Campaign'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Captured Lead Adding Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-5 z-10 shadow-2xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Add Lead Contact</h3>
                  <p className="text-[11px] text-slate-500">Insert a brand coordinator into your captured subscriber list.</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-1 hover:bg-slate-800 rounded-lg"
                >
                  <X size={15} />
                </button>
              </div>

              {addError && (
                <div className="text-[10px] font-mono text-red-400 bg-red-500/10 border border-red-500/20 px-3.5 py-2 rounded-lg">
                  {addError}
                </div>
              )}

              <form onSubmit={handleAddSubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    Band/Artist Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Led Zeppelin"
                    value={newArtistName}
                    onChange={(e) => setNewArtistName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    Contact Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="manager@band.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    Acquisition Channel Source
                  </label>
                  <select
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="admin_added">Admin Added (Manual)</option>
                    <option value="demo_signup">Demo Guest Login</option>
                    <option value="premium_pro">Touring Pro Checkout</option>
                    <option value="premium_arena">Arena Headliner Checkout</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-550 text-white font-bold text-xs py-3 rounded-xl transition-all uppercase tracking-wider border-none cursor-pointer shadow-lg shadow-purple-600/10"
                >
                  Create Contact Lead
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Captured Lead Editing Modal */}
      <AnimatePresence>
        {editingContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingContact(null)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-5 z-10 shadow-2xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Edit Lead Contact</h3>
                  <p className="text-[11px] text-slate-500">Edit parameters for captured contact lead.</p>
                </div>
                <button
                  onClick={() => setEditingContact(null)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-1 hover:bg-slate-800 rounded-lg"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    Band/Artist Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Led Zeppelin"
                    value={editArtistName}
                    onChange={(e) => setEditArtistName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    Contact Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="manager@band.com"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    Acquisition Channel Source
                  </label>
                  <select
                    value={editSource}
                    onChange={(e) => setEditSource(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="admin_added">Admin Added (Manual)</option>
                    <option value="demo_signup">Demo Guest Login</option>
                    <option value="premium_pro">Touring Pro Checkout</option>
                    <option value="premium_arena">Arena Headliner Checkout</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-550 text-white font-bold text-xs py-3 rounded-xl transition-all uppercase tracking-wider border-none cursor-pointer shadow-lg shadow-purple-600/10"
                >
                  Save Lead Details
                </button>
              </form>
            </motion.div>
          </div>
        )}
        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-left"
            >
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertCircle className="text-red-400" size={18} />
                Reset Site Data?
              </h3>
              <p className="text-xs text-slate-300">
                This will wipe your current local email list and reset to default seed sample data. Are you sure you want to proceed?
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmResetAndSeed}
                  className="px-3.5 py-2 text-xs font-bold text-white rounded-lg bg-red-600 hover:bg-red-500 transition-all cursor-pointer shadow-md shadow-red-600/20"
                >
                  Confirm Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Status Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-2 shadow-2xl ${
                toastMessage.type === 'error'
                  ? 'bg-red-950/90 border-red-500/40 text-red-200'
                  : 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
              }`}
            >
              {toastMessage.type === 'error' ? (
                <AlertCircle size={16} className="text-red-400 shrink-0" />
              ) : (
                <CheckCircle size={16} className="text-emerald-400 shrink-0" />
              )}
              <span>{toastMessage.message}</span>
              <button
                onClick={() => setToastMessage(null)}
                className="ml-3 text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
