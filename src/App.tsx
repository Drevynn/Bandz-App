import { useState, useEffect, useRef } from 'react';
import { Artist, Gig, Song, Setlist, BudgetItem, Venue, GigOpportunity, GigApplication, Message, FanProfile, FanNotification, CollaborationRequest, CollaborationResponse } from './types';
import {
  INITIAL_ARTISTS,
  INITIAL_GIGS,
  INITIAL_SONGS,
  INITIAL_SETLISTS,
  INITIAL_BUDGETS,
  INITIAL_VENUES,
  INITIAL_OPPORTUNITIES,
  INITIAL_APPLICATIONS,
  INITIAL_MESSAGES,
  INITIAL_FAN_PROFILES,
  INITIAL_FAN_NOTIFICATIONS,
  INITIAL_COLLABORATION_REQUESTS
} from './data';

// Modular Component Tabs
import GigsTab from './components/GigsTab';
import PromoTab from './components/PromoTab';
import SetlistTab from './components/SetlistTab';
import BudgetTab from './components/BudgetTab';
import ArtistTab from './components/ArtistTab';
import LinkTreeTab from './components/LinkTreeTab';
import AboutTab from './components/AboutTab';
import HelpTab from './components/HelpTab';
import VenuesTab from './components/VenuesTab';
import VenuePortalTab from './components/VenuePortalTab';
import FanPortalTab from './components/FanPortalTab';
import { CollaborateTab } from './components/CollaborateTab';
import QuickAddFAB from './components/QuickAddFAB';
import { PublicEventPage, PublicArtistProfile } from './components/PublicPages';
import LandingPage from './components/LandingPage';
import PaywallLogin from './components/PaywallLogin';
import TourMap from './components/TourMap';
import AdminTab from './components/AdminTab';
import LegalDocsModal, { LegalDocType } from './components/LegalDocsModal';
import SharonAssistant from './components/SharonAssistant';

// Lucide Icons
import {
  Calendar,
  Sparkles,
  Music,
  DollarSign,
  Users,
  Compass,
  Clock,
  MapPin,
  TrendingUp,
  AlertCircle,
  Menu,
  X,
  Info,
  HelpCircle,
  Link,
  Sun,
  Moon,
  Palette,
  Check,
  Wallet,
  Cpu,
  Database,
  Activity,
  Wifi,
  ShieldCheck,
  ExternalLink,
  Building2,
  Briefcase,
  Heart,
  Bell,
  Bot,
  Mic,
  LifeBuoy,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';

type TabId = 'scheduler' | 'venues' | 'venue_portal' | 'fan_portal' | 'promo' | 'setlist' | 'budgets' | 'artists' | 'linktree' | 'tour_map' | 'about' | 'help' | 'admin' | 'collaborate';

const TAB_HEADER_CONFIG: Record<TabId, {
  badge: string;
  title: string;
  desc: string;
  image: string;
}> = {
  scheduler: {
    badge: 'GIG SCHEDULER & TIMETABLE DISPATCH',
    title: 'Live Tour & Concert Dates',
    desc: 'Keep load-in, soundcheck, and stage timing synchronized with automated address geocoding and ticket tracking.',
    image: '/src/assets/images/concert_stage_header_1788820340861.jpg'
  },
  venues: {
    badge: 'VENUE ARCHIVE & TECHNICAL RIDERS',
    title: 'Venues, Backline & Sound Specs',
    desc: 'Manage technical equipment riders, monitor requirements, backline specs, and direct booking contacts.',
    image: '/src/assets/images/venue_backstage_header_1788820358944.jpg'
  },
  venue_portal: {
    badge: 'VENUE BOOKING & MESSAGING EXCHANGE',
    title: 'Venue Marketplace & Direct Chat',
    desc: 'Coordinate gig opportunities, review artist pitch applications, and negotiate direct contracts with venue managers.',
    image: '/src/assets/images/venue_backstage_header_1788820358944.jpg'
  },
  fan_portal: {
    badge: 'FAN COMMUNITY & CONCERT NOTIFICATIONS',
    title: 'Fan Hub & Ticket Alerts',
    desc: 'Engage loyal listeners, distribute automated SMS/email tour notices, and track ticket conversions.',
    image: '/src/assets/images/concert_bg_1783213491029.jpg'
  },
  promo: {
    badge: 'AI PROMOTER & PUBLICIST CONSOLE',
    title: 'The Manager & Campaign Lab',
    desc: 'Generate high-impact press releases, social campaigns, and newsletter copy grounded in your show details.',
    image: '/src/assets/images/hero_banner_stage_1784716444784.jpg'
  },
  tour_map: {
    badge: 'GEOGRAPHIC TOUR NAVIGATION HUD',
    title: 'Tour Route Logistics & Map',
    desc: 'Visualize tour stops on a nationwide interactive roadmap with drive times, mileage, and venue pins.',
    image: '/src/assets/images/concert_stage_header_1788820340861.jpg'
  },
  setlist: {
    badge: 'SETLIST COMPOSER & TEMPO ENGINE',
    title: 'Setlist Builder & Audio Pacing',
    desc: 'Sequence original tracks and covers with real-time minute-by-minute timing audits and key transition helpers.',
    image: '/src/assets/images/gold_pick_1783213481183.jpg'
  },
  budgets: {
    badge: 'FINANCIAL REVENUE & COST ACCOUNTANT',
    title: 'Tour Ledger & Split Accounting',
    desc: 'Log ticket sales, merch income, gas, lodging, and calculate net payouts per musician with 1-click splits.',
    image: '/src/assets/images/vip_ticket_1783213501263.jpg'
  },
  artists: {
    badge: 'BAND ROSTER & MUSICIAN PROFILES',
    title: 'Band Profiles & Member Roster',
    desc: 'Manage band bios, member contacts, instrument roles, and stage positioning charts for each active act.',
    image: '/src/assets/images/hero_banner_stage_1784716444784.jpg'
  },
  collaborate: {
    badge: 'ROAD CREW STAGE ROOM',
    title: 'Band Collaboration & Crew Chat',
    desc: 'Real-time road room for tour managers, musicians, and stage crew to communicate notes and set changes.',
    image: '/src/assets/images/concert_bg_1783213491029.jpg'
  },
  linktree: {
    badge: 'SMART BIO LINKS & FAN GATEWAY',
    title: 'Link Tree & Streaming Hub',
    desc: 'Publish a unified mobile bio page linking Spotify, Apple Music, Bandcamp, social profiles, and merch.',
    image: '/src/assets/images/vip_ticket_1783213501263.jpg'
  },
  admin: {
    badge: 'HQ PLATFORM OPERATIONS',
    title: 'Site Administration & Lead Center',
    desc: 'Review demo requests, oversee cloud database health, and manage system announcements across the network.',
    image: '/src/assets/images/venue_backstage_header_1788820358944.jpg'
  },
  about: {
    badge: 'PLATFORM MISSION & MANIFESTO',
    title: 'About Bandz Architecture',
    desc: 'Built specifically for independent working bands who need high-velocity tour, setlist, and budget discipline.',
    image: '/src/assets/images/concert_stage_header_1788820340861.jpg'
  },
  help: {
    badge: 'SUPPORT, HOW-TO & WIKI FIELD MANUAL',
    title: 'Support Center, How-To & Knowledge Wiki',
    desc: 'Comprehensive step-by-step guides, complete operational wiki encyclopedia, and direct support hotline at (951) 594-5105 & support@alistwebs.com.',
    image: '/src/assets/images/venue_backstage_header_1788820358944.jpg'
  }
};

const THEME_PRESETS = [
  { id: 'dark', label: 'Midnight Gold', theme: 'dark' as const, accent: 'amber' as const, desc: 'Sleek dark mode with amber gold highlights' },
  { id: 'light', label: 'Classic Day', theme: 'light' as const, accent: 'indigo' as const, desc: 'Clean, high-contrast day mode' },
  { id: 'sepia', label: 'Editorial Warmth', theme: 'sepia' as const, accent: 'rose' as const, desc: 'Warm vintage bookish sepia parchment' },
  { id: 'cosmic', label: 'Cosmic Lavender', theme: 'cosmic' as const, accent: 'violet' as const, desc: 'Stardust nebula vibes & lavender haze' },
  { id: 'cyber', label: 'Cyberpunk Matrix', theme: 'cyber' as const, accent: 'emerald' as const, desc: 'Classic retro terminal command deck' }
];

export default function App() {
  // ------------------------------------------
  // STATE DEFINITIONS & LOCALSTORAGE COUPLING
  // ------------------------------------------
  const [artists, setArtists] = useState<Artist[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [opportunities, setOpportunities] = useState<GigOpportunity[]>([]);
  const [applications, setApplications] = useState<GigApplication[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [fanProfiles, setFanProfiles] = useState<FanProfile[]>([]);
  const [fanNotifications, setFanNotifications] = useState<FanNotification[]>([]);
  const [collaborationRequests, setCollaborationRequests] = useState<CollaborationRequest[]>([]);
  const [prefillVenue, setPrefillVenue] = useState<Venue | null>(null);
  const hasSyncedRef = useRef(false);

  const saveCollaborationRequests = (updated: CollaborationRequest[]) => {
    setCollaborationRequests(updated);
    localStorage.setItem('bandz_collaboration_requests', JSON.stringify(updated));
  };
  const handleAddCollaborationRequest = (req: CollaborationRequest) => {
    saveCollaborationRequests([req, ...collaborationRequests]);
  };
  const handleUpdateCollaborationRequest = (req: CollaborationRequest) => {
    saveCollaborationRequests(collaborationRequests.map(r => r.id === req.id ? req : r));
  };
  const handleDeleteCollaborationRequest = (id: string) => {
    saveCollaborationRequests(collaborationRequests.filter(r => r.id !== id));
  };
  const handleAddCollaborationResponse = (requestId: string, response: CollaborationResponse) => {
    const target = collaborationRequests.find(r => r.id === requestId);
    if (!target) return;
    const updated = {
      ...target,
      responses: [...(target.responses || []), response]
    };
    handleUpdateCollaborationRequest(updated);
  };
  const handleUpdateCollaborationResponseStatus = (requestId: string, responseId: string, status: 'pending' | 'accepted' | 'declined' | 'shortlisted') => {
    const target = collaborationRequests.find(r => r.id === requestId);
    if (!target) return;
    const updatedResponses = (target.responses || []).map(r => r.id === responseId ? { ...r, status } : r);
    const updated = {
      ...target,
      status: status === 'accepted' ? 'in_discussion' : target.status,
      responses: updatedResponses
    };
    handleUpdateCollaborationRequest(updated as CollaborationRequest);
  };

  const saveVenues = (updated: Venue[]) => {
    setVenues(updated);
    localStorage.setItem('bandz_venues', JSON.stringify(updated));
  };
  const handleAddVenue = (venue: Venue) => saveVenues([...venues, venue]);
  const handleUpdateVenue = (venue: Venue) => saveVenues(venues.map(v => v.id === venue.id ? venue : v));
  const handleDeleteVenue = (venueId: string) => saveVenues(venues.filter(v => v.id !== venueId));

  const saveOpportunities = (updated: GigOpportunity[]) => {
    setOpportunities(updated);
    localStorage.setItem('bandz_opportunities', JSON.stringify(updated));
  };
  const saveApplications = (updated: GigApplication[]) => {
    setApplications(updated);
    localStorage.setItem('bandz_applications', JSON.stringify(updated));
  };
  const saveMessages = (updated: Message[]) => {
    setMessages(updated);
    localStorage.setItem('bandz_messages', JSON.stringify(updated));
  };
  const saveFanProfiles = (updated: FanProfile[]) => {
    setFanProfiles(updated);
    localStorage.setItem('bandz_fan_profiles', JSON.stringify(updated));
  };
  const saveFanNotifications = (updated: FanNotification[]) => {
    setFanNotifications(updated);
    localStorage.setItem('bandz_fan_notifications', JSON.stringify(updated));
  };

  const handleUpdateFanProfile = (profile: FanProfile) => {
    saveFanProfiles(fanProfiles.map(f => f.id === profile.id ? profile : f));
  };
  const handleMarkNotificationRead = (notifId: string) => {
    saveFanNotifications(fanNotifications.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const handleAddOpportunity = (opp: GigOpportunity) => saveOpportunities([opp, ...opportunities]);
  const handleUpdateOpportunity = (opp: GigOpportunity) => saveOpportunities(opportunities.map(o => o.id === opp.id ? opp : o));
  const handleAddApplication = (app: GigApplication) => saveApplications([app, ...applications]);
  const handleUpdateApplication = (app: GigApplication) => saveApplications(applications.map(a => a.id === app.id ? app : a));
  const handleSendMessage = (msg: Message) => saveMessages([...messages, msg]);

  const handleAcceptApplicationToGig = (applicationId: string, opportunityId: string) => {
    const app = applications.find(a => a.id === applicationId);
    const opp = opportunities.find(o => o.id === opportunityId);
    if (!app || !opp) return;

    const updatedApps = applications.map(a => a.id === applicationId ? { ...a, status: 'accepted' as const } : a);
    saveApplications(updatedApps);

    const updatedOpps = opportunities.map(o => o.id === opportunityId ? { ...o, status: 'closed' as const } : o);
    saveOpportunities(updatedOpps);

    const newGig: Gig = {
      id: `gig-${Date.now()}`,
      title: `${app.artistName} @ ${opp.venueName} (${opp.title})`,
      artistId: app.artistId,
      venueName: opp.venueName,
      venueAddress: 'See Venue Profile',
      dateTime: opp.dateTime,
      durationMinutes: 45,
      ticketPrice: 15,
      description: `Booked via Venue Portal Opportunity: ${opp.title}. Pay: ${opp.pay}.`,
      status: 'confirmed',
      promoChecklist: { pressRelease: false, socialPost: false, flyerDistributed: false, outreachCompleted: false, ticketsLive: false }
    };
    handleAddGig(newGig);

    const confirmationMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: opp.venueId,
      senderName: opp.venueName,
      senderType: 'venue',
      recipientId: app.artistId,
      recipientName: app.artistName,
      recipientType: 'artist',
      opportunityId: opp.id,
      messageText: `Congratulations! Your application for "${opp.title}" has been accepted and booked into the schedule!`,
      timestamp: new Date().toISOString(),
      read: false
    };
    handleSendMessage(confirmationMsg);
  };

  const [selectedArtistId, setSelectedArtistId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<TabId>('scheduler');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isDbLoaded, setIsDbLoaded] = useState<boolean>(false);
  const [themeSelectorOpen, setThemeSelectorOpen] = useState<boolean>(false);
  const [legalModal, setLegalModal] = useState<LegalDocType | null>(null);
  const [showSharonModal, setShowSharonModal] = useState<boolean>(false);

  // Paywall & Session Navigation State
  const [sessionView, setSessionView] = useState<'landing' | 'app' | 'paywall_login'>('landing');
  const [selectedSignupTier, setSelectedSignupTier] = useState<string>('pro');
  const [userSession, setUserSession] = useState<{ email: string; tier: string; isPremium: boolean } | null>(null);

  // Trial & AI Credit Guard States (14-Day Free Trial applies across all 3 tiers)
  const [trialStartDate, setTrialStartDate] = useState<string | null>(() => {
    return localStorage.getItem('bandz_trial_start_date');
  });

  const [aiCredits, setAiCredits] = useState<number>(150); // Default placeholder

  const getMaxCreditsForTier = (tier: string) => {
    if (tier === 'arena') return 500;
    if (tier === 'pro') return 150;
    if (tier === 'weekly') return 50;
    return 150; // 14-day free trial on Pro features
  };

  // Sync / Load credits dynamically based on session
  useEffect(() => {
    if (userSession) {
      const stored = localStorage.getItem(`bandz_credits_${userSession.tier}_${userSession.email}`);
      if (stored !== null) {
        setAiCredits(parseInt(stored, 10));
      } else {
        const max = getMaxCreditsForTier(userSession.tier);
        setAiCredits(max);
        localStorage.setItem(`bandz_credits_${userSession.tier}_${userSession.email}`, max.toString());
      }

      // Initialize 14-day trial start date for user session
      let startDate = localStorage.getItem('bandz_trial_start_date');
      if (!startDate) {
        startDate = new Date().toISOString();
        localStorage.setItem('bandz_trial_start_date', startDate);
      }
      setTrialStartDate(startDate);
    }
  }, [userSession]);

  const handleDecrementAiCredits = () => {
    if (!userSession) return;
    setAiCredits(prev => {
      const next = Math.max(0, prev - 1);
      localStorage.setItem(`bandz_credits_${userSession.tier}_${userSession.email}`, next.toString());
      return next;
    });
  };

  const getTrialDaysRemaining = () => {
    if (!trialStartDate) return 14;
    const start = new Date(trialStartDate).getTime();
    const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
    const expiry = start + fourteenDaysMs;
    const diff = expiry - Date.now();
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
  };

  const daysRemaining = getTrialDaysRemaining();
  const isTrialExpired = Boolean(localStorage.getItem('bandz_simulated_expired') === 'true');

  // Theme & Accent Color State
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia' | 'cyber' | 'cosmic'>(() => {
    return (localStorage.getItem('bandz_theme') as 'light' | 'dark' | 'sepia' | 'cyber' | 'cosmic') || 'dark';
  });
  const [accentColor, setAccentColor] = useState<'amber' | 'emerald' | 'indigo' | 'violet' | 'rose'>(() => {
    return (localStorage.getItem('bandz_accent') as 'amber' | 'emerald' | 'indigo' | 'violet' | 'rose') || 'amber';
  });

  useEffect(() => {
    localStorage.setItem('bandz_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('bandz_accent', accentColor);
  }, [accentColor]);

  // Initialize DB from LocalStorage or Data Template
  useEffect(() => {
    try {
      const storedArtists = localStorage.getItem('bandz_artists');
      const storedGigs = localStorage.getItem('bandz_gigs');
      const storedSongs = localStorage.getItem('bandz_songs');
      const storedSetlists = localStorage.getItem('bandz_setlists');
      const storedBudgets = localStorage.getItem('bandz_budgets');
      const storedVenues = localStorage.getItem('bandz_venues');

      if (storedArtists) setArtists(JSON.parse(storedArtists));
      else {
        setArtists(INITIAL_ARTISTS);
        localStorage.setItem('bandz_artists', JSON.stringify(INITIAL_ARTISTS));
      }

      if (storedGigs) setGigs(JSON.parse(storedGigs));
      else {
        setGigs(INITIAL_GIGS);
        localStorage.setItem('bandz_gigs', JSON.stringify(INITIAL_GIGS));
      }

      if (storedSongs) setSongs(JSON.parse(storedSongs));
      else {
        setSongs(INITIAL_SONGS);
        localStorage.setItem('bandz_songs', JSON.stringify(INITIAL_SONGS));
      }

      if (storedSetlists) setSetlists(JSON.parse(storedSetlists));
      else {
        setSetlists(INITIAL_SETLISTS);
        localStorage.setItem('bandz_setlists', JSON.stringify(INITIAL_SETLISTS));
      }

      if (storedBudgets) setBudgets(JSON.parse(storedBudgets));
      else {
        setBudgets(INITIAL_BUDGETS);
        localStorage.setItem('bandz_budgets', JSON.stringify(INITIAL_BUDGETS));
      }

      if (storedVenues) setVenues(JSON.parse(storedVenues));
      else {
        setVenues(INITIAL_VENUES);
        localStorage.setItem('bandz_venues', JSON.stringify(INITIAL_VENUES));
      }

      const storedOpps = localStorage.getItem('bandz_opportunities');
      const storedApps = localStorage.getItem('bandz_applications');
      const storedMsgs = localStorage.getItem('bandz_messages');
      const storedFanProfs = localStorage.getItem('bandz_fan_profiles');
      const storedFanNotifs = localStorage.getItem('bandz_fan_notifications');

      if (storedOpps) setOpportunities(JSON.parse(storedOpps));
      else {
        setOpportunities(INITIAL_OPPORTUNITIES);
        localStorage.setItem('bandz_opportunities', JSON.stringify(INITIAL_OPPORTUNITIES));
      }

      if (storedApps) setApplications(JSON.parse(storedApps));
      else {
        setApplications(INITIAL_APPLICATIONS);
        localStorage.setItem('bandz_applications', JSON.stringify(INITIAL_APPLICATIONS));
      }

      if (storedMsgs) setMessages(JSON.parse(storedMsgs));
      else {
        setMessages(INITIAL_MESSAGES);
        localStorage.setItem('bandz_messages', JSON.stringify(INITIAL_MESSAGES));
      }

      if (storedFanProfs) setFanProfiles(JSON.parse(storedFanProfs));
      else {
        setFanProfiles(INITIAL_FAN_PROFILES);
        localStorage.setItem('bandz_fan_profiles', JSON.stringify(INITIAL_FAN_PROFILES));
      }

      if (storedFanNotifs) setFanNotifications(JSON.parse(storedFanNotifs));
      else {
        setFanNotifications(INITIAL_FAN_NOTIFICATIONS);
        localStorage.setItem('bandz_fan_notifications', JSON.stringify(INITIAL_FAN_NOTIFICATIONS));
      }

      const storedCollabs = localStorage.getItem('bandz_collaboration_requests');
      if (storedCollabs) {
        setCollaborationRequests(JSON.parse(storedCollabs));
      } else {
        setCollaborationRequests(INITIAL_COLLABORATION_REQUESTS);
        localStorage.setItem('bandz_collaboration_requests', JSON.stringify(INITIAL_COLLABORATION_REQUESTS));
      }

      // Default selected artist to first one available, or 'all'
      if (storedArtists) {
        const parsed = JSON.parse(storedArtists);
        if (parsed.length > 0) {
          setSelectedArtistId(parsed[0].id);
        }
      } else if (INITIAL_ARTISTS.length > 0) {
        setSelectedArtistId(INITIAL_ARTISTS[0].id);
      }

      setIsDbLoaded(true);
    } catch (e) {
      console.error('Failed to initialize local persistence layer:', e);
      // Fail-soft to memory structures
      setArtists(INITIAL_ARTISTS);
      setGigs(INITIAL_GIGS);
      setSongs(INITIAL_SONGS);
      setSetlists(INITIAL_SETLISTS);
      setBudgets(INITIAL_BUDGETS);
      setVenues(INITIAL_VENUES);
      setOpportunities(INITIAL_OPPORTUNITIES);
      setApplications(INITIAL_APPLICATIONS);
      setMessages(INITIAL_MESSAGES);
      setIsDbLoaded(true);
    }
  }, []);

  // Firebase Auth and Firestore Cloud Sync Engine
  useEffect(() => {
    if (!isDbLoaded || hasSyncedRef.current) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        hasSyncedRef.current = true;
        try {
          // Fetch user profile from Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          let tier = 'pro';
          if (userDocSnap.exists()) {
            tier = userDocSnap.data().tier || 'pro';
          } else {
            await setDoc(userDocRef, {
              email: user.email,
              tier: 'pro',
              createdAt: new Date().toISOString(),
              isPremium: true
            });
          }

          setUserSession({
            email: user.email || 'premium_member@bandz.io',
            tier: tier,
            isPremium: tier !== 'garage',
            uid: user.uid
          });
          setSessionView('app');

          const fetchUserCollection = async (collName: string) => {
            const q = query(collection(db, collName), where('userId', '==', user.uid));
            const snap = await getDocs(q);
            return snap.docs.map(d => d.data());
          };

          const cloudArtists = await fetchUserCollection('artists');
          const cloudGigs = await fetchUserCollection('gigs');
          const cloudSongs = await fetchUserCollection('songs');
          const cloudSetlists = await fetchUserCollection('setlists');
          const cloudBudgets = await fetchUserCollection('budgets');

          if (cloudArtists.length > 0) {
            setArtists(cloudArtists as any);
            localStorage.setItem('bandz_artists', JSON.stringify(cloudArtists));
          } else if (artists.length > 0) {
            for (const item of artists) {
              await setDoc(doc(db, 'artists', item.id), { ...item, userId: user.uid });
            }
          }

          if (cloudGigs.length > 0) {
            setGigs(cloudGigs as any);
            localStorage.setItem('bandz_gigs', JSON.stringify(cloudGigs));
          } else if (gigs.length > 0) {
            for (const item of gigs) {
              await setDoc(doc(db, 'gigs', item.id), { ...item, userId: user.uid });
            }
          }

          if (cloudSongs.length > 0) {
            setSongs(cloudSongs as any);
            localStorage.setItem('bandz_songs', JSON.stringify(cloudSongs));
          } else if (songs.length > 0) {
            for (const item of songs) {
              await setDoc(doc(db, 'songs', item.id), { ...item, userId: user.uid });
            }
          }

          if (cloudSetlists.length > 0) {
            setSetlists(cloudSetlists as any);
            localStorage.setItem('bandz_setlists', JSON.stringify(cloudSetlists));
          } else if (setlists.length > 0) {
            for (const item of setlists) {
              await setDoc(doc(db, 'setlists', item.id), { ...item, userId: user.uid });
            }
          }

          if (cloudBudgets.length > 0) {
            setBudgets(cloudBudgets as any);
            localStorage.setItem('bandz_budgets', JSON.stringify(cloudBudgets));
          } else if (budgets.length > 0) {
            for (const item of budgets) {
              await setDoc(doc(db, 'budgets', item.id), { ...item, userId: user.uid });
            }
          }

          if (cloudArtists.length > 0) {
            setSelectedArtistId(cloudArtists[0].id);
          } else if (artists.length > 0) {
            setSelectedArtistId(artists[0].id);
          }

        } catch (err) {
          console.error('Error syncing Firestore with local structures:', err);
        }
      }
    });

    return () => unsubscribe();
  }, [isDbLoaded, artists, gigs, songs, setlists, budgets]);

  // ------------------------------------------
  // STATE PERSISTENCE TRIGGER MUTATIONS
  // ------------------------------------------
  const saveArtists = async (newArtists: Artist[]) => {
    const deleted = artists.filter(old => !newArtists.some(n => n.id === old.id));
    setArtists(newArtists);
    localStorage.setItem('bandz_artists', JSON.stringify(newArtists));
    if (auth.currentUser) {
      try {
        for (const item of newArtists) {
          await setDoc(doc(db, 'artists', item.id), { ...item, userId: auth.currentUser.uid });
        }
        for (const item of deleted) {
          await deleteDoc(doc(db, 'artists', item.id));
        }
      } catch (e) {
        console.error('Failed to sync artist list to Firestore:', e);
      }
    }
  };

  const saveGigs = async (newGigs: Gig[]) => {
    const deleted = gigs.filter(old => !newGigs.some(n => n.id === old.id));
    setGigs(newGigs);
    localStorage.setItem('bandz_gigs', JSON.stringify(newGigs));
    if (auth.currentUser) {
      try {
        for (const item of newGigs) {
          await setDoc(doc(db, 'gigs', item.id), { ...item, userId: auth.currentUser.uid });
        }
        for (const item of deleted) {
          await deleteDoc(doc(db, 'gigs', item.id));
        }
      } catch (e) {
        console.error('Failed to sync gigs to Firestore:', e);
      }
    }
  };

  const saveSongs = async (newSongs: Song[]) => {
    const deleted = songs.filter(old => !newSongs.some(n => n.id === old.id));
    setSongs(newSongs);
    localStorage.setItem('bandz_songs', JSON.stringify(newSongs));
    if (auth.currentUser) {
      try {
        for (const item of newSongs) {
          await setDoc(doc(db, 'songs', item.id), { ...item, userId: auth.currentUser.uid });
        }
        for (const item of deleted) {
          await deleteDoc(doc(db, 'songs', item.id));
        }
      } catch (e) {
        console.error('Failed to sync songs to Firestore:', e);
      }
    }
  };

  const saveSetlists = async (newSetlists: Setlist[]) => {
    const deleted = setlists.filter(old => !newSetlists.some(n => n.id === old.id));
    setSetlists(newSetlists);
    localStorage.setItem('bandz_setlists', JSON.stringify(newSetlists));
    if (auth.currentUser) {
      try {
        for (const item of newSetlists) {
          await setDoc(doc(db, 'setlists', item.id), { ...item, userId: auth.currentUser.uid });
        }
        for (const item of deleted) {
          await deleteDoc(doc(db, 'setlists', item.id));
        }
      } catch (e) {
        console.error('Failed to sync setlists to Firestore:', e);
      }
    }
  };

  const saveBudgets = async (newBudgets: BudgetItem[]) => {
    const deleted = budgets.filter(old => !newBudgets.some(n => n.id === old.id));
    setBudgets(newBudgets);
    localStorage.setItem('bandz_budgets', JSON.stringify(newBudgets));
    if (auth.currentUser) {
      try {
        for (const item of newBudgets) {
          await setDoc(doc(db, 'budgets', item.id), { ...item, userId: auth.currentUser.uid });
        }
        for (const item of deleted) {
          await deleteDoc(doc(db, 'budgets', item.id));
        }
      } catch (e) {
        console.error('Failed to sync budgets to Firestore:', e);
      }
    }
  };

  // ------------------------------------------
  // CORE ACTION MUTATORS
  // ------------------------------------------
  const handleAddGig = (newGig: Gig) => {
    saveGigs([newGig, ...gigs]);
    const artist = artists.find(a => a.id === newGig.artistId);
    if (artist) {
      const newNotifs: FanNotification[] = [];
      fanProfiles.forEach(fan => {
        if (fan.followedArtistIds.includes(artist.id)) {
          newNotifs.push({
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            fanId: fan.id,
            artistId: artist.id,
            artistName: artist.name,
            gigId: newGig.id,
            gigTitle: newGig.title,
            venueName: newGig.venueName,
            dateTime: newGig.dateTime,
            message: `${artist.name} announced a new show: "${newGig.title}" at ${newGig.venueName} on ${new Date(newGig.dateTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}!`,
            timestamp: new Date().toISOString(),
            read: false
          });
        }
      });
      if (newNotifs.length > 0) {
        saveFanNotifications([...newNotifs, ...fanNotifications]);
      }
    }
  };

  const handleUpdateGig = (updatedGig: Gig) => {
    saveGigs(gigs.map((g) => (g.id === updatedGig.id ? updatedGig : g)));
  };

  const handleDeleteGig = (gigId: string) => {
    saveGigs(gigs.filter((g) => g.id !== gigId));
    // Cascade delete budgets and setlists
    saveBudgets(budgets.filter((b) => b.gigId !== gigId));
    saveSetlists(setlists.filter((s) => s.gigId !== gigId));
  };

  const handleAddSong = (newSong: Song) => {
    saveSongs([...songs, newSong]);
  };

  const handleDeleteSong = (songId: string) => {
    saveSongs(songs.filter((s) => s.id !== songId));
    // Cascade remove from setlists
    const updatedSetlists = setlists.map((sl) => ({
      ...sl,
      songs: sl.songs
        .filter((ss) => ss.songId !== songId)
        .map((ss, idx) => ({ ...ss, order: idx + 1 }))
    }));
    saveSetlists(updatedSetlists);
  };

  const handleUpdateSetlist = (updatedSetlist: Setlist) => {
    const exists = setlists.some((s) => s.gigId === updatedSetlist.gigId);
    if (exists) {
      saveSetlists(setlists.map((s) => (s.gigId === updatedSetlist.gigId ? updatedSetlist : s)));
    } else {
      saveSetlists([...setlists, updatedSetlist]);
    }
  };

  const handleAddBudgetItem = (newItem: BudgetItem) => {
    saveBudgets([newItem, ...budgets]);
  };

  const handleDeleteBudgetItem = (itemId: string) => {
    saveBudgets(budgets.filter((b) => b.id !== itemId));
  };

  const handleAddArtist = (newArtist: Artist) => {
    saveArtists([...artists, newArtist]);
    setSelectedArtistId(newArtist.id);
  };

  const handleUpdateArtist = (updatedArtist: Artist) => {
    saveArtists(artists.map((a) => (a.id === updatedArtist.id ? updatedArtist : a)));
  };

  const handleDeleteArtist = (artistId: string) => {
    if (artists.length <= 1) return; // Prevent deleting last artist
    saveArtists(artists.filter((a) => a.id !== artistId));
    // Cascade delete gigs, songs, setlists, budgets
    const artistGigs = gigs.filter((g) => g.artistId === artistId);
    const artistGigsIds = artistGigs.map((g) => g.id);
    
    saveGigs(gigs.filter((g) => g.artistId !== artistId));
    saveSongs(songs.filter((s) => s.artistId !== artistId));
    saveSetlists(setlists.filter((s) => !artistGigsIds.includes(s.gigId)));
    saveBudgets(budgets.filter((b) => !artistGigsIds.includes(b.gigId)));

    // Shift focus
    const remaining = artists.filter((a) => a.id !== artistId);
    setSelectedArtistId(remaining[0]?.id || 'all');
  };

  // ------------------------------------------
  // CALCULATED METRICS SUMMARY
  // ------------------------------------------
  const activeArtist = artists.find((a) => a.id === selectedArtistId);
  
  // Filter gigs matching selected band
  const artistFilteredGigs = gigs.filter(
    (gig) => selectedArtistId === 'all' || gig.artistId === selectedArtistId
  );

  // Next imminent gig schedule
  const nextGig = [...artistFilteredGigs]
    .filter((g) => g.status === 'confirmed' && new Date(g.dateTime) >= new Date())
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())[0];

  // Combined artist total earnings
  const artistBudgets = budgets.filter((b) => {
    const gig = gigs.find((g) => g.id === b.gigId);
    return gig && (selectedArtistId === 'all' || gig.artistId === selectedArtistId);
  });
  const totalCombinedIncome = artistBudgets
    .filter((b) => b.type === 'income')
    .reduce((sum, b) => sum + b.amount, 0);

  const totalCompletedGigs = artistFilteredGigs.filter((g) => g.status === 'completed').length;

  // Calculate gigs with missing critical info (empty/TBA venue or empty setlist)
  const gigsMissingInfo = artistFilteredGigs.filter((gig) => {
    const hasVenue = gig.venueName && gig.venueName.trim() !== '' && 
                     gig.venueName.toUpperCase() !== 'TBA' && 
                     gig.venueName.toUpperCase() !== 'TO BE ANNOUNCED' && 
                     gig.venueName.toUpperCase() !== 'PENDING';
    const hasSetlist = setlists.some((s) => s.gigId === gig.id && s.songs && s.songs.length > 0);
    return !hasVenue || !hasSetlist;
  });
  const hasGigsMissingInfo = gigsMissingInfo.length > 0;

  if (!isDbLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-6 relative overflow-hidden" id="loader-root">
        {/* Ambient golden aura background */}
        <div className="absolute w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />

        <div className="relative flex flex-col items-center max-w-sm text-center space-y-6">
          {/* Custom logo animation container */}
          <div className="relative">
            {/* Spinning external dashed gold indicator ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
              className="absolute -inset-4 rounded-full border border-dashed border-amber-500/30"
            />
            {/* Pulsing glow background frame */}
            <motion.div
              animate={{ scale: [1, 1.06, 1], opacity: [0.2, 0.5, 0.2] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="absolute -inset-1 rounded-full bg-amber-500/15 blur-md"
            />
            {/* Premium Logo Frame */}
            <img
              src="/assets/logo.png"
              alt="Bandz Logo"
              className="relative w-28 h-28 object-contain drop-shadow-[0_0_25px_rgba(168,85,247,0.3)]"
            />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-bold tracking-widest text-slate-100 font-display">
              BANDZ
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">
              Booting Artist Management Console...
            </p>
          </div>

          {/* Golden loading track */}
          <div className="w-40 h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800/60">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
            />
          </div>
        </div>
      </div>
    );
  }

  // Standalone Public Pages Router Interceptor (Fan Portal)
  const pathname = window.location.pathname;
  const isPublicEvent = pathname.startsWith('/event/');
  const isPublicArtist = pathname.startsWith('/artist/');

  if (isPublicEvent) {
    const publicGigId = pathname.split('/event/')[1]?.split('?')[0];
    const targetGigs = gigs.length > 0 ? gigs : INITIAL_GIGS;
    const targetArtists = artists.length > 0 ? artists : INITIAL_ARTISTS;
    const gig = targetGigs.find(g => g.id === publicGigId);
    const artist = targetArtists.find(a => a.id === gig?.artistId) || targetArtists[0];
    
    if (gig) {
      return (
        <PublicEventPage 
          gig={gig} 
          artist={artist} 
          onBackToApp={() => {
            window.history.pushState({}, '', '/');
            window.location.reload();
          }} 
        />
      );
    }
  }

  if (isPublicArtist) {
    const publicArtistId = pathname.split('/artist/')[1]?.split('?')[0];
    const targetArtists = artists.length > 0 ? artists : INITIAL_ARTISTS;
    const artist = targetArtists.find(a => a.id === publicArtistId);
    
    if (artist) {
      return (
        <PublicArtistProfile 
          artist={artist} 
          onBackToApp={() => {
            window.history.pushState({}, '', '/');
            window.location.reload();
          }} 
        />
      );
    }
  }

  // ------------------------------------------
  // PAYWALL & LANDING INTERCEPTORS
  // ------------------------------------------
  if (sessionView === 'landing') {
    return (
      <LandingPage
        onEnterDemo={(email, artistName) => {
          setUserSession({ 
            email: email || 'sandbox_guest@bandz.io', 
            tier: 'pro', 
            isPremium: true 
          });

          // Log captured email to central database
          try {
            const stored = localStorage.getItem('bandz_captured_emails');
            const list = stored ? JSON.parse(stored) : [];
            const targetEmail = email || 'sandbox_guest@bandz.io';
            if (!list.some((item: any) => item.email.toLowerCase() === targetEmail.toLowerCase())) {
              list.unshift({
                id: 'cap_' + Date.now(),
                email: targetEmail,
                artistName: artistName || 'Sandbox Guest',
                source: 'demo_signup',
                capturedAt: new Date().toISOString(),
                subscribed: true
              });
              localStorage.setItem('bandz_captured_emails', JSON.stringify(list));
            }
          } catch (e) {
            console.error('Failed to register demo email capture', e);
          }

          if (artistName) {
            const newArtistId = 'artist_' + Date.now();
            const newArtist: Artist = {
              id: newArtistId,
              name: artistName,
              genre: 'Indie Rock',
              bio: `Emerging band ${artistName} ready to tour and build their visual brand profile in Bandz.`,
              members: [
                { id: `m-${Date.now()}-1`, name: 'Lead Artist', role: 'Vocals & Instruments' }
              ],
              contactEmail: email || 'booking@bandz.io',
              instagramUrl: `https://instagram.com/${artistName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
              photos: [
                'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80'
              ],
              pastPerformances: []
            };

            setArtists(prev => {
              const exists = prev.some(a => a.name.toLowerCase() === artistName.toLowerCase());
              if (exists) return prev;
              const updated = [newArtist, ...prev];
              localStorage.setItem('bandz_artists', JSON.stringify(updated));
              return updated;
            });
            setSelectedArtistId(newArtistId);
          }

          setSessionView('app');
        }}
        onEnterLogin={(preselectedTier) => {
          setSelectedSignupTier(preselectedTier || 'pro');
          setSessionView('paywall_login');
        }}
      />
    );
  }

  if (sessionView === 'paywall_login') {
    return (
      <PaywallLogin
        initialTier={selectedSignupTier}
        onBack={() => setSessionView('landing')}
        onSuccess={(tier, email) => {
          setUserSession({ email: email || 'premium_member@bandz.io', tier, isPremium: true });

          // Log captured premium checkout email to central database
          try {
            const stored = localStorage.getItem('bandz_captured_emails');
            const list = stored ? JSON.parse(stored) : [];
            const targetEmail = email || 'premium_member@bandz.io';
            if (!list.some((item: any) => item.email.toLowerCase() === targetEmail.toLowerCase())) {
              list.unshift({
                id: 'cap_' + Date.now(),
                email: targetEmail,
                artistName: 'Premium Act',
                source: tier === 'arena' ? 'premium_arena' : 'premium_pro',
                capturedAt: new Date().toISOString(),
                subscribed: true
              });
              localStorage.setItem('bandz_captured_emails', JSON.stringify(list));
            }
          } catch (e) {
            console.error('Failed to register checkout email capture', e);
          }

          setSessionView('app');
        }}
      />
    );
  }

  if (isTrialExpired && sessionView === 'app') {
    return (
      <div className="min-h-screen bg-[#04020a] text-slate-100 flex items-center justify-center p-4 lg:p-8 relative overflow-hidden font-sans" id="trial-expired-lock">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1a3a_1px,transparent_1px),linear-gradient(to_bottom,#1f1a3a_1px,transparent_1px)] bg-[size:50px_50px] opacity-10 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-red-600/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative max-w-xl w-full bg-slate-950/85 border border-red-500/15 rounded-3xl p-8 lg:p-12 text-center space-y-6 shadow-2xl"
        >
          <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-inner">
            <Clock size={32} className="text-red-500 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 px-3.5 py-1 rounded-full">
              ⚠️ CONSOLE PASS EXPIRED
            </span>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight font-display">
              Your 14-Day Trial Has Ended
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
              To keep your scheduled gigs, cost ledgers, band profiles, and campaign assets safe and active, upgrade your administrator node subscription.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-md mx-auto pt-2">
            <div 
              onClick={() => {
                setSelectedSignupTier('pro');
                setSessionView('paywall_login');
              }}
              className="bg-slate-900/40 border border-purple-500/20 hover:border-purple-400 p-5 rounded-2xl cursor-pointer transition-all hover:bg-slate-900/60"
            >
              <h4 className="text-xs font-bold text-slate-200 uppercase">Touring Pro</h4>
              <span className="text-[11px] font-bold text-purple-400 block font-mono mt-0.5">$19 / month</span>
              <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">Unlimited bands, 150 safe AI credits/mo, budget split ledger, public EPK portal link.</p>
            </div>

            <div 
              onClick={() => {
                setSelectedSignupTier('arena');
                setSessionView('paywall_login');
              }}
              className="bg-slate-900/40 border border-amber-500/20 hover:border-amber-400 p-5 rounded-2xl cursor-pointer transition-all hover:bg-slate-900/60"
            >
              <h4 className="text-xs font-bold text-slate-200 uppercase">Arena Headliner</h4>
              <span className="text-[11px] font-bold text-amber-400 block font-mono mt-0.5">$49 / month</span>
              <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">VIP Connected Geographic Tour Map routing, 500 safe AI credits/mo, dedicated priority server node.</p>
            </div>
          </div>

          <div className="pt-4 flex flex-col items-center gap-3">
            <button
              onClick={() => {
                localStorage.removeItem('bandz_trial_start_date');
                setTrialStartDate(null);
              }}
              className="text-[10px] text-slate-500 hover:text-slate-300 transition-all font-mono hover:underline cursor-pointer bg-transparent border-none"
            >
              [Reset Simulated Expiry Timer &rarr;]
            </button>
            <button
              onClick={() => {
                setUserSession(null);
                setSessionView('landing');
              }}
              className="text-xs text-purple-400 hover:text-purple-300 transition-all font-bold uppercase tracking-wider"
            >
              Return to Landing Page
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  let themeShellClass = 'bg-[#FAF9FF] text-slate-900';

  return (
    <div 
      className={`min-h-screen ${themeShellClass} flex flex-col font-sans selection:bg-purple-500/20 selection:text-purple-300`} 
      id="bandz-shell"
      style={{
        backgroundImage: "linear-gradient(135deg, #FAF9FF 0%, #F5EFFF 50%, #FAF9FF 100%)",
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center'
      }}
    >
      {/* 0. 14-Day Free Trial Mode Banner */}
      {userSession && daysRemaining > 0 && (
        <div className="bg-gradient-to-r from-[#9D4EDD] via-[#7B2CBF] to-[#5A189A] text-white py-2 px-4 text-center text-[10px] md:text-xs font-bold font-mono tracking-wide flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 shadow-lg shadow-black/15 z-40 backdrop-blur-md border-b border-purple-500/25">
          <span className="flex items-center gap-1.5 justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            🎁 14-DAY FREE TRIAL ACTIVE ({(userSession?.tier || 'pro').toUpperCase()} PLAN) • {daysRemaining} Days Remaining
          </span>
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => {
                localStorage.setItem('bandz_simulated_expired', 'true');
                window.location.reload();
              }}
              className="bg-slate-950/80 hover:bg-slate-950 border border-slate-800 text-slate-300 px-3 py-1 rounded-lg transition-all font-mono font-bold text-[8px] md:text-[9.5px] shrink-0"
              title="Simulate 15 days passing to test trial expiration"
            >
              Simulate 14-Day Expiry ⏱️
            </button>
            <button 
              onClick={() => {
                setSelectedSignupTier(userSession?.tier || 'pro');
                setSessionView('paywall_login');
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-1 rounded-full transition-all font-sans font-bold text-[9px] md:text-xs shrink-0 shadow-md cursor-pointer animate-pulse border-none"
            >
              Manage Plan &rarr;
            </button>
          </div>
        </div>
      )}

      {/* 1. Header Bar Area */}
      <header className="sticky top-0 z-30 bg-slate-950/60 backdrop-blur-md border-b border-purple-500/10 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-lg shadow-purple-950/5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-1 bg-purple-500/25 rounded-xl blur-sm animate-pulse" />
            <img 
              src="/assets/logo.png" 
              alt="Bandz Logo" 
              className="relative w-10 h-10 object-contain drop-shadow-md" 
            />
          </div>
          <div>
            <h1 className="text-lg font-black font-display tracking-tight text-white flex items-center gap-1.5 uppercase">
              <span>Bandz</span>
              <span className="text-[9px] bg-purple-500/15 border border-purple-500/30 text-purple-300 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider shadow-sm">PRO EDITION</span>
            </h1>
            <p className="text-[10px] text-purple-400 mt-0.5 font-bold font-mono tracking-wider">YOUR 4EDD MANAGER</p>
          </div>
        </div>

        {/* Header Controls Area */}
        <div className="hidden md:flex items-center gap-4">
          {/* Firestore Cloud Sync Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/60 border border-emerald-500/20 rounded-xl text-[10px] font-bold font-mono text-emerald-400 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>FIRESTORE CLOUD SYNC: ACTIVE</span>
          </div>

          {/* User Email Badge */}
          {userSession?.email && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/60 border border-purple-500/20 rounded-xl text-[10px] font-bold font-mono text-purple-300 shadow-inner truncate max-w-[180px]">
              <span>{userSession.email}</span>
            </div>
          )}

          {/* Global Band Selection Dropdown */}
          <div className="flex items-center gap-2 border-l border-slate-800/80 pl-4">
            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider font-mono">FOCUS:</span>
            <select
              value={selectedArtistId}
              onChange={(e) => setSelectedArtistId(e.target.value)}
              className="bg-slate-950/80 border border-purple-500/20 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500/50 font-bold shadow-md cursor-pointer hover:bg-slate-900 transition-colors"
            >
              <option value="all">All Registered Bands (Combined)</option>
              {artists.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.genre})
                </option>
              ))}
            </select>
          </div>

          {/* Sharon AI Voice Manager Trigger */}
          <button
            onClick={() => setShowSharonModal(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white border border-purple-400/40 rounded-xl text-[10px] font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-purple-900/30"
            title="Speak or Type to Sharon AI Manager"
          >
            <Bot size={13} className="text-purple-200" />
            <span>Sharon AI Voice</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          {/* Back to Landing Page Button */}
          <button
            onClick={() => setSessionView('landing')}
            className="px-3 py-1.5 bg-purple-950 hover:bg-purple-900 border border-purple-800/40 rounded-xl text-[10px] font-bold font-mono text-purple-300 hover:text-white transition-all cursor-pointer"
          >
            LANDING_PAGE
          </button>

          {/* Privacy & Terms Quick Modal Button */}
          <button
            onClick={() => setLegalModal('privacy')}
            className="px-2.5 py-1.5 bg-slate-900/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-[10px] font-bold font-mono text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
            title="Google-Verified Privacy Policy & Terms of Service"
          >
            <ShieldCheck size={12} className="text-emerald-400" />
            <span>PRIVACY & TOS</span>
          </button>

          {userSession && (
            <button
              onClick={async () => {
                await signOut(auth);
                setUserSession(null);
                hasSyncedRef.current = false;
                setSessionView('landing');
              }}
              className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-900/40 rounded-xl text-[10px] font-bold font-mono text-red-400 hover:text-white transition-all cursor-pointer"
            >
              LOGOUT
            </button>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-950 border-b border-purple-500/15 p-4 space-y-4"
          >
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Workspace Focus</label>
              <select
                value={selectedArtistId}
                onChange={(e) => {
                  setSelectedArtistId(e.target.value);
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">All Registered Bands</option>
                {artists.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase mb-1">Navigation</span>
              {[
                { id: 'scheduler', label: 'Gig Scheduler', icon: Calendar },
                { id: 'venues', label: 'Venues & Riders', icon: Building2 },
                { id: 'venue_portal', label: 'Venue Portal & Chat', icon: Briefcase },
                { id: 'fan_portal', label: 'Fan Portal & Alerts', icon: Heart },
                { id: 'promo', label: 'The Manager', icon: Sparkles },
                { id: 'tour_map', label: 'Tour Map', icon: Compass },
                { id: 'setlist', label: 'Setlist Builder', icon: Music },
                { id: 'budgets', label: 'Cost Accountant', icon: DollarSign },
                { id: 'artists', label: 'Band Profiles', icon: Users },
                { id: 'collaborate', label: 'Collaborate', icon: Users },
                { id: 'linktree', label: 'Link Tree', icon: Link },
                { id: 'admin', label: 'Site Admin', icon: ShieldCheck },
                { id: 'about', label: 'About', icon: Info },
                { id: 'help', label: 'Support & Wiki', icon: LifeBuoy },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as TabId);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      isSelected ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' : 'text-slate-400 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} />
                      <span>{tab.label}</span>
                      {tab.id === 'tour_map' && userSession?.tier !== 'arena' && (
                        <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-0.5">
                          <Lock size={8} /> ARENA
                        </span>
                      )}
                    </div>
                    {tab.id === 'scheduler' && hasGigsMissingInfo && (
                      <span className="flex items-center gap-1 text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-md font-mono font-bold animate-pulse" title={`${gigsMissingInfo.length} gig(s) missing critical info`}>
                        <AlertCircle size={10} />
                        <span>{gigsMissingInfo.length}</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mobile Cloud Sync Info & Navigation */}
            <div className="pt-3 border-t border-slate-900/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
                <span>CLOUD SYNC</span>
                <span className="font-bold text-white">ACTIVE (FIRESTORE)</span>
              </div>
              {userSession?.email && (
                <div className="flex items-center justify-between text-[10px] font-mono text-purple-300 truncate">
                  <span>ACCOUNT</span>
                  <span className="font-bold truncate max-w-[160px]">{userSession.email}</span>
                </div>
              )}

              {/* Landing Page Button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSessionView('landing');
                }}
                className="w-full py-2 bg-purple-950/80 hover:bg-purple-900 border border-purple-800/40 rounded-lg text-xs font-bold font-mono text-purple-300 hover:text-white transition-all text-center cursor-pointer"
              >
                RETURN TO LANDING PAGE
              </button>

              {/* Privacy & Terms Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setLegalModal('privacy');
                  }}
                  className="py-1.5 text-[10px] font-mono font-bold text-slate-400 hover:text-purple-300 bg-slate-900 border border-slate-800 rounded-lg text-center"
                >
                  PRIVACY POLICY
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setLegalModal('terms');
                  }}
                  className="py-1.5 text-[10px] font-mono font-bold text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg text-center"
                >
                  TERMS OF SERVICE
                </button>
              </div>

              {userSession && (
                <button
                  onClick={async () => {
                    await signOut(auth);
                    setUserSession(null);
                    hasSyncedRef.current = false;
                    setSessionView('landing');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full mt-2 py-2 bg-red-950/60 hover:bg-red-900 border border-red-900/40 rounded-lg text-xs font-bold font-mono text-red-400 hover:text-white transition-all text-center cursor-pointer"
                >
                  LOGOUT FROM CLOUD
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Bento Dashboard Summary Banner */}
      <section className="bg-slate-950/40 px-4 lg:px-8 py-6 border-b border-purple-500/10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch backdrop-blur-md">
        {/* Prominent Welcome Hero Section with Custom Logo & Header Image */}
        <div className="lg:col-span-7 relative rounded-2xl overflow-hidden border border-purple-500/20 shadow-[0_0_20px_rgba(157,78,221,0.1)] flex flex-col justify-end min-h-[200px] lg:min-h-0">
          {/* Header image backdrop corresponding to active tab header */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700" 
            style={{ backgroundImage: `url('${(TAB_HEADER_CONFIG[activeTab] || TAB_HEADER_CONFIG.scheduler).image}')` }} 
          />
          {/* Glass Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-purple-950/30" />
          
          <div className="relative p-6 space-y-2 z-10">
            <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest font-mono bg-purple-950/80 border border-purple-500/30 px-2.5 py-0.5 rounded-md inline-block">
              {(TAB_HEADER_CONFIG[activeTab] || TAB_HEADER_CONFIG.scheduler).badge}
            </span>
            <h2 className="text-2xl font-black text-white font-display tracking-tight uppercase">
              {(TAB_HEADER_CONFIG[activeTab] || TAB_HEADER_CONFIG.scheduler).title}
            </h2>
            <p className="text-xs text-purple-200/90 leading-relaxed max-w-lg font-medium">
              {(TAB_HEADER_CONFIG[activeTab] || TAB_HEADER_CONFIG.scheduler).desc}
            </p>
          </div>
        </div>

        {/* Imminent Gig Countdown Column */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-purple-500/10 rounded-2xl p-6 flex flex-col justify-between h-full min-h-[148px] shadow-lg shadow-black/40 backdrop-blur-md hover:border-purple-500/30 transition-all">
          {nextGig ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[9px] bg-purple-500/15 text-purple-300 px-2.5 py-0.5 rounded-md border border-purple-500/20 font-bold uppercase tracking-wider font-mono">
                  IMMINENT GIG NODE
                </span>
                {nextGig.ticketPrice === 0 ? (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">FREE ENTRY</span>
                ) : (
                  <span className="text-[10px] font-mono text-amber-400 font-bold">${nextGig.ticketPrice} TIX</span>
                )}
              </div>
              <h3 className="text-base font-bold font-display text-slate-100 line-clamp-1">{nextGig.title}</h3>
              <div className="flex flex-wrap gap-y-1.5 gap-x-4 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-purple-400" />
                  {new Date(nextGig.dateTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-purple-400" />
                  {new Date(nextGig.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-purple-400 shrink-0" />
                  <span className="truncate max-w-[150px]" title={nextGig.venueName}>{nextGig.venueName}</span>
                </span>
              </div>
              <button
                onClick={() => setActiveTab('promo')}
                className="text-[10px] text-purple-400 hover:text-purple-300 hover:underline font-bold transition-all inline-flex items-center gap-1 cursor-pointer font-mono mt-1"
              >
                DRAFT CAMPAIGNS NOW &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-[9px] bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider inline-block">
                Schedule Status
              </span>
              <h3 className="text-sm font-bold text-slate-400">No imminent gigs confirmed</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add scheduled gigs in the Scheduler to automatically feed budget reports and promotion models.
              </p>
            </div>
          )}
        </div>

        {/* Aggregate Stats Cards */}
        <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Active bands */}
          <div className="relative overflow-hidden bg-slate-900/80 border border-purple-500/10 rounded-2xl p-4 flex flex-col justify-between h-28 group hover:border-purple-500/30 transition-all shadow-md shadow-black/30">
            <div className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-20 transition-all" style={{ backgroundImage: "url('/assets/logo.png')" }} />
            <div className="relative z-10 flex justify-between items-start">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Registered Bands</span>
              <span className="text-purple-400 bg-purple-500/10 border border-purple-500/20 p-1 rounded-lg">
                <Users size={12} />
              </span>
            </div>
            <div className="relative z-10">
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-slate-100 font-mono">{artists.length}</span>
                <span className="text-[9px] text-slate-500 font-bold font-mono">NODES</span>
              </div>
              <span className="text-[9px] text-slate-400 truncate mt-1 block">
                Focus: {selectedArtistId === 'all' ? 'All Bands' : activeArtist?.name}
              </span>
            </div>
          </div>

          {/* Gigs count */}
          <div className="relative overflow-hidden bg-slate-900/80 border border-purple-500/10 rounded-2xl p-4 flex flex-col justify-between h-28 group hover:border-purple-500/30 transition-all shadow-md shadow-black/30">
            <div className="absolute inset-0 bg-cover bg-center opacity-5 group-hover:opacity-10 transition-all" style={{ backgroundImage: "url('/src/assets/images/gold_pick_1783213481183.jpg')" }} />
            <div className="relative z-10 flex justify-between items-start">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Completed Shows</span>
              <span className="text-purple-400 bg-purple-500/10 border border-purple-500/20 p-1 rounded-lg">
                <Calendar size={12} />
              </span>
            </div>
            <div className="relative z-10">
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-emerald-400 font-mono">{totalCompletedGigs}</span>
                <span className="text-[9px] text-slate-500 font-bold font-mono">SETS</span>
              </div>
              <span className="text-[9px] text-slate-400 mt-1 block">
                {artistFilteredGigs.length} total events logged
              </span>
            </div>
          </div>

          {/* Combined earnings */}
          <div className="relative overflow-hidden bg-slate-900/80 border border-amber-500/10 rounded-2xl p-4 flex flex-col justify-between h-28 group hover:border-amber-500/30 transition-all shadow-md shadow-black/30">
            <div className="absolute inset-0 bg-cover bg-center opacity-5 group-hover:opacity-10 transition-all" style={{ backgroundImage: "url('/src/assets/images/vip_ticket_1783213501263.jpg')" }} />
            <div className="relative z-10 flex justify-between items-start">
              <span className="text-[10px] text-amber-500/80 font-bold uppercase tracking-wider font-mono">Total Earnings</span>
              <span className="text-amber-500 bg-amber-500/10 border border-amber-500/20 p-1 rounded-lg">
                <DollarSign size={12} />
              </span>
            </div>
            <div className="relative z-10">
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-amber-400 font-mono">${totalCombinedIncome.toLocaleString()}</span>
                <span className="text-[9px] text-slate-500 font-bold font-mono">USD</span>
              </div>
              <span className="text-[9px] text-slate-400 mt-1 block">
                Across all logged dates
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Primary Workspace Layout (Tabs Sidebar + Active Viewport) */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 flex flex-col md:flex-row gap-6">
        {/* Desk Nav Sidebar */}
        <aside className="hidden md:flex flex-col gap-1.5 w-60 shrink-0">
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest font-mono mb-2 px-2">
            WORKSPACE NAVIGATION
          </span>
          {[
            { id: 'scheduler', label: 'Gig Scheduler', icon: Calendar, desc: 'Dates & task tracking' },
            { id: 'venues', label: 'Venues & Riders', icon: Building2, desc: 'Contacts & tech specs' },
            { id: 'venue_portal', label: 'Venue Portal & Chat', icon: Briefcase, desc: 'Gig board & messaging' },
            { id: 'fan_portal', label: 'Fan Portal & Alerts', icon: Heart, desc: 'Follow artists & tour updates' },
            { id: 'promo', label: 'The Manager', icon: Sparkles, desc: 'Consult the Manager' },
            { id: 'tour_map', label: 'Tour Map', icon: Compass, desc: 'Geographic Routing' },
            { id: 'setlist', label: 'Setlist Builder', icon: Music, desc: 'Tracks & pacing audits' },
            { id: 'budgets', label: 'Cost Accountant', icon: DollarSign, desc: 'Revenues & ledger splits' },
            { id: 'artists', label: 'Band Profiles', icon: Users, desc: 'Manage member roster' },
            { id: 'collaborate', label: 'Collab Market', icon: Users, desc: 'Musicians & talent' },
            { id: 'linktree', label: 'Link Tree', icon: Link, desc: 'Band member profiles' },
            { id: 'admin', label: 'Site Admin', icon: ShieldCheck, desc: 'Manage leads & campaigns' },
            { id: 'about', label: 'About', icon: Info, desc: 'Our mission & vision' },
            { id: 'help', label: 'Support & Wiki', icon: LifeBuoy, desc: 'How-to, wiki & live hotline' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`flex items-start gap-3.5 p-3 rounded-xl transition-all cursor-pointer text-left border ${
                  isSelected
                    ? 'bg-purple-600 border-purple-500/40 text-white shadow-lg shadow-purple-600/10'
                    : 'bg-slate-950/40 hover:bg-slate-900 border-slate-900 hover:border-purple-500/10 text-slate-400 hover:text-slate-100'
                }`}
              >
                <Icon size={16} className="mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 w-full">
                    <span className="text-xs font-bold block leading-snug">{tab.label}</span>
                    {tab.id === 'tour_map' && userSession?.tier !== 'arena' && (
                      <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-0.5 shrink-0">
                        <Lock size={8} /> ARENA
                      </span>
                    )}
                    {tab.id === 'scheduler' && hasGigsMissingInfo && (
                      <span className="flex items-center gap-1 text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-md font-mono font-bold animate-pulse" title={`${gigsMissingInfo.length} gig(s) missing critical info`}>
                        <AlertCircle size={10} />
                        <span>{gigsMissingInfo.length}</span>
                      </span>
                    )}
                  </div>
                  <span className={`text-[9px] block mt-0.5 leading-none ${isSelected ? 'text-purple-200' : 'text-slate-500'}`}>
                    {tab.desc}
                  </span>
                </div>
              </button>
            );
          })}

          {/* Web3 Pro VIP Access Card utilizing generated vip_ticket image */}
          <div className="relative bg-slate-950/40 border border-purple-500/20 rounded-2xl p-4 overflow-hidden shadow-[0_0_15px_rgba(147,51,234,0.04)] hover:shadow-[0_0_25px_rgba(147,51,234,0.12)] transition-all group mt-5">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/10 transition-all" />
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="absolute -inset-0.5 bg-purple-500/30 rounded-xl blur-sm" />
                <img 
                  src="/src/assets/images/vip_ticket_1783213501263.jpg" 
                  alt="VIP Star Ticket" 
                  className="relative w-11 h-11 rounded-xl object-cover border border-purple-500/30 shadow-[0_0_10px_rgba(147,51,234,0.2)]" 
                />
              </div>
              <div>
                <span className="text-[9px] text-purple-400 font-bold uppercase tracking-widest font-mono block">VIP ACCESS CARD</span>
                <h4 className="text-xs font-black text-slate-100 uppercase font-display tracking-tight mt-0.5">PRO MEMBER</h4>
                <span className="text-[9px] text-slate-400 block font-mono">Token: #4EDD_88A</span>
              </div>
            </div>
            <div className="border-t border-slate-900 mt-3 pt-3 flex items-center justify-between text-[10px]">
              <span className="text-slate-500 font-bold font-mono">STATUS: VALIDATED</span>
              <span className="text-purple-400 font-black font-mono">● STABLE</span>
            </div>
          </div>

          {/* Quick instructions widget */}
          <div className="mt-5 border border-purple-500/10 p-4 rounded-xl bg-slate-950/20 text-[10px] text-purple-400/70 leading-relaxed font-medium">
            <span className="text-purple-300 font-bold uppercase tracking-wider block mb-1 font-mono">LOCAL STORAGE SYNC</span>
            All bands, gigs, budget transactions, and song setlists are synchronized natively inside your browser's secure cache node.
          </div>
        </aside>


        {/* Responsive Viewport Grid */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="w-full"
            >
              {activeTab === 'scheduler' && (
                <GigsTab
                  gigs={gigs}
                  artists={artists}
                  setlists={setlists}
                  venues={venues}
                  selectedArtistId={selectedArtistId}
                  onAddGig={handleAddGig}
                  onUpdateGig={handleUpdateGig}
                  onDeleteGig={handleDeleteGig}
                  onNavigateToTab={(tabId) => setActiveTab(tabId as TabId)}
                />
              )}
              {activeTab === 'venues' && (
                <VenuesTab
                  venues={venues}
                  onAddVenue={handleAddVenue}
                  onUpdateVenue={handleUpdateVenue}
                  onDeleteVenue={handleDeleteVenue}
                  onScheduleGigAtVenue={(venue) => {
                    setPrefillVenue(venue);
                    setActiveTab('scheduler');
                  }}
                />
              )}
              {activeTab === 'venue_portal' && (
                <VenuePortalTab
                  venues={venues}
                  artists={artists}
                  opportunities={opportunities}
                  applications={applications}
                  messages={messages}
                  onAddOpportunity={handleAddOpportunity}
                  onUpdateOpportunity={handleUpdateOpportunity}
                  onAddApplication={handleAddApplication}
                  onUpdateApplication={handleUpdateApplication}
                  onSendMessage={handleSendMessage}
                  onAcceptApplicationToGig={handleAcceptApplicationToGig}
                />
              )}
              {activeTab === 'fan_portal' && (
                <FanPortalTab
                  artists={artists}
                  gigs={gigs}
                  fanProfiles={fanProfiles}
                  notifications={fanNotifications}
                  onUpdateFanProfile={handleUpdateFanProfile}
                  onMarkNotificationRead={handleMarkNotificationRead}
                />
              )}
              {activeTab === 'promo' && (
                <PromoTab
                  gigs={gigs}
                  artists={artists}
                  selectedArtistId={selectedArtistId}
                  aiCredits={aiCredits}
                  maxCredits={getMaxCreditsForTier(userSession?.tier || 'pro')}
                  onDecrementAiCredits={handleDecrementAiCredits}
                  onAddGig={handleAddGig}
                  onAddSong={handleAddSong}
                  onAddBudgetItem={handleAddBudgetItem}
                  onAddCollaborationRequest={handleAddCollaborationRequest}
                  onUpdateArtist={handleUpdateArtist}
                  onNavigateToTab={(tabId) => setActiveTab(tabId as TabId)}
                />
              )}
              {activeTab === 'tour_map' && (
                <TourMap
                  gigs={gigs}
                  artists={artists}
                  selectedArtistId={selectedArtistId}
                  userTier={userSession?.tier || 'pro'}
                  onUpgradeRequest={() => {
                    setSelectedSignupTier('arena');
                    setSessionView('paywall_login');
                  }}
                />
              )}
              {activeTab === 'setlist' && (
                <SetlistTab
                  songs={songs}
                  gigs={gigs}
                  setlists={setlists}
                  selectedArtistId={selectedArtistId}
                  onAddSong={handleAddSong}
                  onDeleteSong={handleDeleteSong}
                  onUpdateSetlist={handleUpdateSetlist}
                />
              )}
              {activeTab === 'budgets' && (
                <BudgetTab
                  budgets={budgets}
                  gigs={gigs}
                  selectedArtistId={selectedArtistId}
                  onAddBudgetItem={handleAddBudgetItem}
                  onDeleteBudgetItem={handleDeleteBudgetItem}
                />
              )}
              {activeTab === 'artists' && (
                <ArtistTab
                  artists={artists}
                  selectedArtistId={selectedArtistId}
                  onAddArtist={handleAddArtist}
                  onUpdateArtist={handleUpdateArtist}
                  onDeleteArtist={handleDeleteArtist}
                />
              )}
              {activeTab === 'linktree' && <LinkTreeTab artists={artists} />}
              {activeTab === 'collaborate' && (
                <CollaborateTab
                  requests={collaborationRequests}
                  artists={artists}
                  gigs={gigs}
                  selectedArtistId={selectedArtistId}
                  onAddRequest={handleAddCollaborationRequest}
                  onUpdateRequest={handleUpdateCollaborationRequest}
                  onDeleteRequest={handleDeleteCollaborationRequest}
                  onAddResponse={handleAddCollaborationResponse}
                  onUpdateResponseStatus={handleUpdateCollaborationResponseStatus}
                />
              )}
              {activeTab === 'admin' && (
                <AdminTab
                  artists={artists}
                  gigs={gigs}
                />
              )}
              {activeTab === 'about' && <AboutTab onNavigateToTab={(tabId) => setActiveTab(tabId as TabId)} />}
              {activeTab === 'help' && (
                <HelpTab 
                  onNavigateToTab={(tabId) => setActiveTab(tabId as TabId)} 
                  onOpenLegal={(doc) => setLegalModal(doc)}
                  userEmail={userSession?.email}
                  artistName={activeArtist?.name}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Footer Area with Support Hotline & Compliance */}
      <footer className="bg-slate-950 border-t border-slate-900 py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-500 mt-auto font-mono">
        <div className="flex flex-wrap items-center gap-2 text-center sm:text-left">
          <p>© 2026 Bandz Platform. Operated by A-List Webs.</p>
          <span className="hidden sm:inline">•</span>
          <button
            onClick={() => setActiveTab('help')}
            className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <Phone size={11} />
            <span>Support: (951) 594-5105</span>
          </button>
          <span>•</span>
          <a href="mailto:support@alistwebs.com" className="text-purple-400 hover:underline">
            support@alistwebs.com
          </a>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => setActiveTab('help')}
            className="hover:text-purple-300 transition-colors cursor-pointer"
          >
            How-To & Wiki
          </button>
          <span>•</span>
          <button 
            onClick={() => setLegalModal('privacy')} 
            className="hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1"
          >
            <ShieldCheck size={11} className="text-emerald-400" />
            <span>Privacy Policy (Google Verified)</span>
          </button>
          <span>•</span>
          <button 
            onClick={() => setLegalModal('terms')} 
            className="hover:text-purple-300 transition-colors cursor-pointer"
          >
            Terms of Service
          </button>
          <span>•</span>
          <a 
            href="https://myaccount.google.com/permissions" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-purple-400 hover:underline"
          >
            Google Permissions
          </a>
        </div>
      </footer>

      {/* Floating Action Quick Add Menu */}
      <QuickAddFAB
        artists={artists}
        gigs={gigs}
        onAddGig={handleAddGig}
        onAddSong={handleAddSong}
        onAddBudgetItem={handleAddBudgetItem}
        onNavigateToTab={(tabId) => setActiveTab(tabId as TabId)}
        onOpenSharon={() => setShowSharonModal(true)}
      />

      {/* Floating Sharon AI Manager Modal */}
      <AnimatePresence>
        {showSharonModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-purple-500/30"
            >
              <SharonAssistant
                artists={artists}
                activeArtist={artists.find(a => selectedArtistId === 'all' ? a.id === gigs[0]?.artistId : a.id === selectedArtistId) || artists[0]}
                gigs={gigs}
                onAddGig={handleAddGig}
                onAddSong={handleAddSong}
                onAddBudgetItem={handleAddBudgetItem}
                onAddCollaborationRequest={handleAddCollaborationRequest}
                onUpdateArtist={handleUpdateArtist}
                onNavigateToTab={(tabId) => {
                  setActiveTab(tabId as TabId);
                  setShowSharonModal(false);
                }}
                onClose={() => setShowSharonModal(false)}
                isModal={true}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Legal Documentation Modal */}
      <AnimatePresence>
        {legalModal !== null && (
          <LegalDocsModal
            isOpen={true}
            initialDoc={legalModal}
            onClose={() => setLegalModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
