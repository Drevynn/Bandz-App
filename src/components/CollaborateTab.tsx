import React, { useState, useMemo } from 'react';
import { 
  CollaborationRequest, 
  CollaborationResponse, 
  CollaboratorRole, 
  CollaborationCompensationType, 
  Artist, 
  Gig 
} from '../types';
import { 
  Search, 
  Plus, 
  Filter, 
  MapPin, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Users, 
  Sparkles, 
  Mail, 
  Phone, 
  ExternalLink, 
  X, 
  Sliders, 
  Palette, 
  Video, 
  Mic, 
  Music, 
  Briefcase, 
  Globe, 
  ChevronRight,
  UserCheck,
  Send,
  Eye,
  Check,
  Trash2,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CollaborateTabProps {
  requests: CollaborationRequest[];
  artists: Artist[];
  gigs: Gig[];
  selectedArtistId?: string;
  onAddRequest: (req: CollaborationRequest) => void;
  onUpdateRequest: (req: CollaborationRequest) => void;
  onDeleteRequest: (id: string) => void;
  onAddResponse: (requestId: string, response: CollaborationResponse) => void;
  onUpdateResponseStatus: (requestId: string, responseId: string, status: 'pending' | 'accepted' | 'declined' | 'shortlisted') => void;
}

const ROLE_OPTIONS: { value: CollaboratorRole; label: string; icon: any; category: 'musician' | 'creative' | 'crew' }[] = [
  { value: 'drummer', label: 'Drummer', icon: Music, category: 'musician' },
  { value: 'bassist', label: 'Bassist', icon: Music, category: 'musician' },
  { value: 'guitarist', label: 'Guitarist', icon: Music, category: 'musician' },
  { value: 'vocalist', label: 'Vocalist / Singer', icon: Mic, category: 'musician' },
  { value: 'keyboardist', label: 'Keyboardist / Synths', icon: Music, category: 'musician' },
  { value: 'percussionist', label: 'Percussionist', icon: Music, category: 'musician' },
  { value: 'songwriter', label: 'Songwriter / Lyricist', icon: Mic, category: 'musician' },
  { value: 'session_musician', label: 'Session Multi-Instrumentalist', icon: Music, category: 'musician' },
  { value: 'graphic_designer', label: 'Graphic Designer / Merch Art', icon: Palette, category: 'creative' },
  { value: 'videographer', label: 'Videographer / Reel Creator', icon: Video, category: 'creative' },
  { value: 'photographer', label: 'Live Concert Photographer', icon: Video, category: 'creative' },
  { value: 'sound_engineer', label: 'Live Sound Engineer (FOH)', icon: Sliders, category: 'crew' },
  { value: 'producer', label: 'Music Producer / Mixing', icon: Sliders, category: 'creative' },
  { value: 'tour_manager', label: 'Tour Manager / Merch Tech', icon: Briefcase, category: 'crew' },
  { value: 'lighting_tech', label: 'Lighting Tech / Visuals (VJ)', icon: Sparkles, category: 'crew' },
  { value: 'other', label: 'Other Specialist', icon: Users, category: 'creative' },
];

const SUGGESTED_SKILL_TAGS: Record<CollaboratorRole, string[]> = {
  drummer: ['In-Ear Monitors (IEMs)', 'Click Track', 'Rock / Indie', 'Double Kick Pedal', 'Rehearsal Ready', 'Tight Grooves'],
  bassist: ['5-String Bass', 'In-Ear Monitors', 'Slap / Groove', 'Backing Vocals', 'Upright Bass'],
  guitarist: ['Lead Shred', 'Acoustic Fingerstyle', 'Effects Pedalboard', 'Harmonies', 'Drop Tuning'],
  vocalist: ['Harmonies', 'High Range', 'Stage Charisma', 'Folk / Warm Timbre', 'Screaming / Rock'],
  keyboardist: ['Analog Synths', 'Hammond Organ', 'Nord Stage', 'MIDI Programming', 'Backing Tracks'],
  percussionist: ['Congas & Bongos', 'Shakers / Tambourine', 'Latin Grooves', 'Cajon'],
  sound_engineer: ['Digital Consoles (X32/M32)', 'In-Ear Mix Routing', 'Vocal Compression', 'Fast Line Checks'],
  graphic_designer: ['Screenprint Prep', 'Vector Art', 'Tour Poster Typography', 'Vinyl Layout', 'Figma / Illustrator'],
  videographer: ['4K Gimbal Rig', 'Vertical Reels (9:16)', '48hr Turnaround', 'Multi-Cam Concerts'],
  photographer: ['Low-Light Stage Lenses', 'Pit Access Pass', 'Same-Night Teasers', 'High-Res Stills'],
  producer: ['Pro Tools / Ableton', 'Stem Mixing', 'Mastering (LUFS)', 'Vocal Tuning'],
  tour_manager: ['Settlement & Cash Out', 'Van & Hospitality', 'Merch Inventory (AtVenu)', 'Rider Compliance'],
  lighting_tech: ['DMX Programming', 'Moving Heads', 'Haze Management', 'Sound-Reactive Cues'],
  songwriter: ['Topline Melodies', 'Bridge Structures', 'Chord Voicings', 'Hook Specialist'],
  session_musician: ['Sight Reading / Charts', 'Clean Stems', 'Genre Versatility', 'Quick Takes'],
  other: ['Team Player', 'Reliable Transport', 'Quick Communication']
};

export const CollaborateTab: React.FC<CollaborateTabProps> = ({
  requests = [],
  artists = [],
  gigs = [],
  selectedArtistId,
  onAddRequest,
  onUpdateRequest,
  onDeleteRequest,
  onAddResponse,
  onUpdateResponseStatus
}) => {
  // Navigation & Filter States
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState<'all' | 'remote' | 'in_person'>('all');
  const [compensationFilter, setCompensationFilter] = useState<'all' | 'paid_fixed' | 'paid_hourly' | 'door_split' | 'trade_credit' | 'volunteer'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'filled'>('open');
  const [viewScope, setViewScope] = useState<'all' | 'my_posts' | 'my_pitches'>('all');

  // Modals & Drawers
  const [showPostModal, setShowPostModal] = useState(false);
  const [respondingToRequest, setRespondingToRequest] = useState<CollaborationRequest | null>(null);
  const [managingRequest, setManagingRequest] = useState<CollaborationRequest | null>(null);
  const [notificationBanner, setNotificationBanner] = useState<string | null>(null);

  // New Request Form State
  const defaultArtist = artists.find(a => a.id === selectedArtistId) || artists[0];
  const [authorArtistId, setAuthorArtistId] = useState<string>(defaultArtist?.id || '');
  const [postTitle, setPostTitle] = useState('');
  const [postRole, setPostRole] = useState<CollaboratorRole>('drummer');
  const [postSkills, setPostSkills] = useState<string[]>(['In-Ear Monitors (IEMs)', 'Click Track']);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [postLocation, setPostLocation] = useState('Seattle, WA');
  const [postIsRemote, setPostIsRemote] = useState(false);
  const [postGigId, setPostGigId] = useState<string>('');
  const [postEventDate, setPostEventDate] = useState('');
  const [postDeadline, setPostDeadline] = useState('');
  const [postCompensationType, setPostCompensationType] = useState<CollaborationCompensationType>('paid_fixed');
  const [postCompensationAmount, setPostCompensationAmount] = useState('$250 flat fee + drink tabs');
  const [isAiDraftingPost, setIsAiDraftingPost] = useState(false);

  // New Response Form State
  const [responderName, setResponderName] = useState('');
  const [responderEmail, setResponderEmail] = useState('');
  const [responderPhone, setResponderPhone] = useState('');
  const [responderPortfolio, setResponderPortfolio] = useState('');
  const [responderPitch, setResponderPitch] = useState('');
  const [responderRate, setResponderRate] = useState('');
  const [isAiDraftingPitch, setIsAiDraftingPitch] = useState(false);

  // Quick stats
  const activeRequestsCount = requests.filter(r => r.status === 'open').length;
  const myBandsRequests = useMemo(() => {
    const bandIds = artists.map(a => a.id);
    return requests.filter(r => bandIds.includes(r.authorArtistId));
  }, [requests, artists]);
  const totalResponsesReceived = useMemo(() => {
    return myBandsRequests.reduce((sum, r) => sum + (r.responses?.length || 0), 0);
  }, [myBandsRequests]);

  // Filtering
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      // Category filter
      if (activeCategory !== 'all') {
        if (activeCategory === 'musicians') {
          const musicianRoles: CollaboratorRole[] = ['drummer', 'bassist', 'guitarist', 'vocalist', 'keyboardist', 'percussionist', 'songwriter', 'session_musician'];
          if (!musicianRoles.includes(req.roleNeeded)) return false;
        } else if (activeCategory === 'creative') {
          const creativeRoles: CollaboratorRole[] = ['graphic_designer', 'videographer', 'photographer', 'producer', 'other'];
          if (!creativeRoles.includes(req.roleNeeded)) return false;
        } else if (activeCategory === 'crew') {
          const crewRoles: CollaboratorRole[] = ['sound_engineer', 'tour_manager', 'lighting_tech'];
          if (!crewRoles.includes(req.roleNeeded)) return false;
        } else if (req.roleNeeded !== activeCategory) {
          return false;
        }
      }

      // Location filter
      if (locationFilter === 'remote' && !req.isRemote) return false;
      if (locationFilter === 'in_person' && req.isRemote) return false;

      // Compensation filter
      if (compensationFilter !== 'all' && req.compensationType !== compensationFilter) return false;

      // Status filter
      if (statusFilter === 'open' && req.status !== 'open' && req.status !== 'in_discussion') return false;
      if (statusFilter === 'filled' && req.status !== 'filled') return false;

      // Scope filter
      if (viewScope === 'my_posts') {
        const bandIds = artists.map(a => a.id);
        if (!bandIds.includes(req.authorArtistId)) return false;
      } else if (viewScope === 'my_pitches') {
        const hasMyPitch = (req.responses || []).some(
          r => r.responderEmail === responderEmail || r.responderName === responderName
        );
        if (!hasMyPitch) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = req.title.toLowerCase().includes(q);
        const matchesDesc = req.description.toLowerCase().includes(q);
        const matchesAuthor = req.authorArtistName.toLowerCase().includes(q);
        const matchesLocation = req.location.toLowerCase().includes(q);
        const matchesSkills = req.skillsRequired.some(s => s.toLowerCase().includes(q));
        const matchesRole = req.roleNeeded.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesAuthor && !matchesLocation && !matchesSkills && !matchesRole) {
          return false;
        }
      }

      return true;
    });
  }, [requests, activeCategory, locationFilter, compensationFilter, statusFilter, viewScope, searchQuery, artists, responderEmail, responderName]);

  // Handle Gig selection in post modal to auto-populate fields
  const handleSelectGigForPost = (gigId: string) => {
    setPostGigId(gigId);
    if (!gigId) return;
    const gig = gigs.find(g => g.id === gigId);
    if (gig) {
      if (gig.dateTime) setPostEventDate(gig.dateTime.split('T')[0]);
      if (gig.venueAddress) setPostLocation(gig.venueAddress);
      if (!postTitle) {
        setPostTitle(`${ROLE_OPTIONS.find(r => r.value === postRole)?.label || 'Musician'} needed for ${gig.title}`);
      }
    }
  };

  // Add / remove skill tags
  const handleAddSkillTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !postSkills.includes(trimmed)) {
      setPostSkills([...postSkills, trimmed]);
      setCustomSkillInput('');
    }
  };

  const handleRemoveSkillTag = (tagToRemove: string) => {
    setPostSkills(postSkills.filter(t => t !== tagToRemove));
  };

  // Trigger Sharon AI to draft listing
  const handleAiDraftPost = async () => {
    setIsAiDraftingPost(true);
    try {
      const selectedAuthor = artists.find(a => a.id === authorArtistId) || artists[0];
      const selectedGig = gigs.find(g => g.id === postGigId);

      const res = await fetch('/api/generate-collaboration-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'request',
          role: postRole,
          title: postTitle,
          artistName: selectedAuthor?.name || 'Our Band',
          genre: selectedAuthor?.genre || 'Indie Rock',
          gigTitle: selectedGig?.title,
          compensation: postCompensationAmount,
          extraNotes: postDescription
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.title) setPostTitle(data.title);
        if (data.description) setPostDescription(data.description);
        if (Array.isArray(data.suggestedSkills) && data.suggestedSkills.length > 0) {
          const merged = Array.from(new Set([...postSkills, ...data.suggestedSkills]));
          setPostSkills(merged);
        }
      }
    } catch (e) {
      console.warn('AI post drafting fallback:', e);
      setPostDescription(`We are looking for an experienced ${postRole} for our upcoming live performances and studio tracking. Must be dependable, possess professional equipment, and be comfortable with fast-paced rehearsals.`);
    } finally {
      setIsAiDraftingPost(false);
    }
  };

  // Trigger Sharon AI to draft pitch
  const handleAiDraftPitch = async () => {
    if (!respondingToRequest) return;
    setIsAiDraftingPitch(true);
    try {
      const res = await fetch('/api/generate-collaboration-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'pitch',
          role: respondingToRequest.roleNeeded,
          artistName: respondingToRequest.authorArtistName,
          gigTitle: respondingToRequest.gigTitle,
          compensation: respondingToRequest.compensationAmount,
          skills: respondingToRequest.skillsRequired,
          responderName: responderName || 'Musician',
          extraNotes: responderPitch
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.pitch) setResponderPitch(data.pitch);
        if (data.suggestedRate && !responderRate) setResponderRate(data.suggestedRate);
      }
    } catch (e) {
      console.warn('AI pitch drafting fallback:', e);
      setResponderPitch(`Hey ${respondingToRequest.authorArtistName}! I saw your request for a ${respondingToRequest.roleNeeded} and would love to jump in. I have 6+ years playing live, top-shelf gear, and can lock in your setlist immediately. Let's make it happen!`);
    } finally {
      setIsAiDraftingPitch(false);
    }
  };

  // Submit New Request
  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postDescription.trim()) return;

    const author = artists.find(a => a.id === authorArtistId) || artists[0] || {
      id: 'artist-user',
      name: 'Independent Artist',
      contactEmail: 'artist@bandz.io'
    };

    const newReq: CollaborationRequest = {
      id: `collab-${Date.now()}`,
      authorArtistId: author.id,
      authorArtistName: author.name,
      authorContactEmail: author.contactEmail || 'booking@bandz.io',
      authorGenre: author.genre,
      title: postTitle.trim(),
      roleNeeded: postRole,
      skillsRequired: postSkills.length > 0 ? postSkills : ['Team Player', 'Reliable'],
      description: postDescription.trim(),
      location: postLocation.trim() || 'Seattle, WA',
      isRemote: postIsRemote,
      gigId: postGigId || undefined,
      gigTitle: gigs.find(g => g.id === postGigId)?.title || undefined,
      eventDate: postEventDate || undefined,
      deadline: postDeadline || undefined,
      compensationType: postCompensationType,
      compensationAmount: postCompensationAmount || 'Negotiable',
      status: 'open',
      responses: [],
      createdAt: new Date().toISOString()
    };

    onAddRequest(newReq);
    setShowPostModal(false);

    // Reset Form
    setPostTitle('');
    setPostDescription('');
    setPostSkills(['In-Ear Monitors (IEMs)', 'Click Track']);
    setPostGigId('');

    setNotificationBanner(`Your request "${newReq.title}" has been published to the marketplace!`);
    setTimeout(() => setNotificationBanner(null), 5000);
  };

  // Submit Response / Pitch
  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondingToRequest) return;
    if (!responderName.trim() || !responderEmail.trim() || !responderPitch.trim()) return;

    const newResponse: CollaborationResponse = {
      id: `resp-${Date.now()}`,
      requestId: respondingToRequest.id,
      responderName: responderName.trim(),
      responderEmail: responderEmail.trim(),
      responderPhone: responderPhone.trim() || undefined,
      portfolioUrl: responderPortfolio.trim() || undefined,
      pitchMessage: responderPitch.trim(),
      offeredRate: responderRate.trim() || undefined,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    onAddResponse(respondingToRequest.id, newResponse);
    setRespondingToRequest(null);
    setResponderPitch('');
    setResponderRate('');

    setNotificationBanner(`Your proposal was submitted to ${respondingToRequest.authorArtistName}! They will receive your pitch and portfolio.`);
    setTimeout(() => setNotificationBanner(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {notificationBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-emerald-950/90 border border-emerald-500/30 text-emerald-200 px-4 py-3 rounded-xl flex items-center justify-between shadow-xl shadow-black/40 backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold">{notificationBanner}</span>
            </div>
            <button 
              onClick={() => setNotificationBanner(null)}
              className="text-emerald-400 hover:text-white p-1 rounded cursor-pointer"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Marketplace Stats & Hero Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-purple-500/20 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-black/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-purple-400">Open Requests</span>
            <span className="p-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-300">
              <Music size={14} />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black font-mono text-white">{activeRequestsCount}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Musicians & Creatives sought</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-emerald-500/20 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-black/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-emerald-400">Paid Opportunities</span>
            <span className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300">
              <DollarSign size={14} />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black font-mono text-emerald-400">
              {requests.filter(r => r.compensationType.startsWith('paid')).length}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Guaranteed payouts & gig fees</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-amber-500/20 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-black/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-amber-400">My Band Postings</span>
            <span className="p-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-300">
              <Users size={14} />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black font-mono text-amber-400">{myBandsRequests.length}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{totalResponsesReceived} musician response(s)</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/40 via-indigo-900/20 to-slate-900 border border-purple-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-purple-900/20">
          <div>
            <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <Sparkles size={12} className="text-purple-400" /> Sharon AI Matchmaker
            </span>
            <p className="text-[11px] text-slate-300 mt-1 leading-snug">
              Need a sub drummer for Friday or a merch designer? Post a request in 30 seconds!
            </p>
          </div>
          <button
            onClick={() => {
              if (selectedArtistId && selectedArtistId !== 'all') {
                setAuthorArtistId(selectedArtistId);
              }
              setShowPostModal(true);
            }}
            className="mt-3 w-full py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
          >
            <Plus size={14} /> Post Seeking Collaborator
          </button>
        </div>
      </div>

      {/* Control Bar: Search, Category Pills, View Mode */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-4">
        {/* Row 1: Search + Scope Tabs + Post Action */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search skill (e.g. drummer, designer, IEMs)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* View Scope Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full md:w-auto">
            <button
              onClick={() => setViewScope('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewScope === 'all'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Marketplace ({requests.length})
            </button>
            <button
              onClick={() => setViewScope('my_posts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewScope === 'my_posts'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>My Band Posts</span>
              <span className="text-[10px] bg-purple-950/60 px-1.5 py-0.2 rounded font-mono font-bold text-purple-300">
                {myBandsRequests.length}
              </span>
            </button>
            <button
              onClick={() => setViewScope('my_pitches')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewScope === 'my_pitches'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              My Pitches
            </button>
          </div>

          {/* Secondary Filters */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <select
              value={locationFilter}
              onChange={(e: any) => setLocationFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">Any Location</option>
              <option value="remote">Remote / Stems Only</option>
              <option value="in_person">In-Person Gig Only</option>
            </select>

            <select
              value={compensationFilter}
              onChange={(e: any) => setCompensationFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Pay Types</option>
              <option value="paid_fixed">Paid Flat Fee</option>
              <option value="paid_hourly">Paid Hourly</option>
              <option value="door_split">Door Split %</option>
              <option value="trade_credit">Trade & Credit</option>
              <option value="volunteer">Volunteer / Jam</option>
            </select>
          </div>
        </div>

        {/* Row 2: Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'all', label: 'All Roles', icon: Users },
            { id: 'drummer', label: '🥁 Drummers', icon: Music },
            { id: 'bassist', label: '🎸 Bassists', icon: Music },
            { id: 'vocalist', label: '🎤 Vocalists', icon: Mic },
            { id: 'graphic_designer', label: '🎨 Graphic & Posters', icon: Palette },
            { id: 'sound_engineer', label: '🎚️ Sound (FOH)', icon: Sliders },
            { id: 'videographer', label: '🎥 Video & Reels', icon: Video },
            { id: 'keyboardist', label: '🎹 Keys & Synths', icon: Music },
            { id: 'producer', label: '🎛️ Producers', icon: Sliders },
            { id: 'tour_manager', label: '🚐 Tour Tech', icon: Briefcase },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Marketplace Listings Feed */}
      {filteredRequests.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mx-auto text-purple-400">
            <Users size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-200">No collaboration requests match your filters</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search criteria, clearing category filters, or be the first to post a seeking collaborator request for your band!
          </p>
          <button
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
              setLocationFilter('all');
              setCompensationFilter('all');
              setViewScope('all');
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredRequests.map(req => {
            const roleInfo = ROLE_OPTIONS.find(r => r.value === req.roleNeeded) || ROLE_OPTIONS[0];
            const RoleIcon = roleInfo.icon;
            const isMyPost = artists.some(a => a.id === req.authorArtistId);
            const responsesCount = req.responses?.length || 0;
            const isFilled = req.status === 'filled';

            return (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-slate-900/90 border rounded-2xl p-5 flex flex-col justify-between transition-all shadow-md shadow-black/20 ${
                  isFilled 
                    ? 'border-slate-800/80 opacity-60' 
                    : isMyPost 
                      ? 'border-purple-500/40 bg-purple-950/10' 
                      : 'border-slate-800 hover:border-purple-500/30'
                }`}
              >
                {/* Header: Author + Role Pill + Compensation Badge */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-purple-400 font-mono shrink-0">
                        {req.authorArtistName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{req.authorArtistName}</span>
                          {isMyPost && (
                            <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded font-mono font-bold">
                              YOUR POST
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          {req.authorGenre && <span>{req.authorGenre} • </span>}
                          <span>Posted {new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        </span>
                      </div>
                    </div>

                    {/* Role Pill */}
                    <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 shrink-0">
                      <RoleIcon size={13} />
                      <span>{roleInfo.label}</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-purple-300 transition-colors mb-2">
                    {req.title}
                  </h3>

                  {/* Associated Gig Tag if available */}
                  {req.gigTitle && (
                    <div className="mb-2.5 inline-flex items-center gap-1.5 text-[11px] bg-slate-800/80 border border-slate-700 text-slate-300 px-2.5 py-0.5 rounded-lg">
                      <Calendar size={12} className="text-amber-400" />
                      <span>For Show: <strong className="text-white">{req.gigTitle}</strong></span>
                      {req.eventDate && <span className="text-slate-400">({new Date(req.eventDate).toLocaleDateString([], { month: 'short', day: 'numeric' })})</span>}
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-3">
                    {req.description}
                  </p>

                  {/* Required Skills Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {req.skillsRequired.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-md flex items-center gap-1 font-mono"
                      >
                        <Tag size={9} className="text-purple-400" />
                        <span>{skill}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Details & Action Buttons */}
                <div className="pt-3 border-t border-slate-800/80 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    {/* Location & Remote */}
                    <div className="flex items-center gap-1.5 text-slate-400">
                      {req.isRemote ? (
                        <>
                          <Globe size={13} className="text-cyan-400" />
                          <span className="text-cyan-300 font-medium">Remote / Digital</span>
                        </>
                      ) : (
                        <>
                          <MapPin size={13} className="text-slate-500" />
                          <span>{req.location}</span>
                        </>
                      )}
                    </div>

                    {/* Compensation */}
                    <div className="flex items-center gap-1 font-semibold text-emerald-400 font-mono">
                      <DollarSign size={13} />
                      <span>{req.compensationAmount || 'Negotiable'}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-2">
                    {/* Status Badge */}
                    <div className="text-[11px] font-mono">
                      {isFilled ? (
                        <span className="text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded">ROLE FILLED</span>
                      ) : req.status === 'in_discussion' ? (
                        <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">IN DISCUSSION</span>
                      ) : (
                        <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">SEEKING NOW</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isMyPost ? (
                        <>
                          {/* Manage responses button */}
                          <button
                            onClick={() => setManagingRequest(req)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Eye size={13} />
                            <span>Responses</span>
                            <span className="bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                              {responsesCount}
                            </span>
                          </button>

                          {/* Delete request */}
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete request "${req.title}"?`)) {
                                onDeleteRequest(req.id);
                              }
                            }}
                            className="p-1.5 bg-slate-900 hover:bg-red-950 text-slate-500 hover:text-red-400 border border-slate-800 rounded-xl transition-all cursor-pointer"
                            title="Delete Request"
                          >
                            <Trash2 size={13} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setRespondingToRequest(req);
                            if (defaultArtist) {
                              setResponderName(defaultArtist.name);
                              setResponderEmail(defaultArtist.contactEmail || '');
                            }
                          }}
                          disabled={isFilled}
                          className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isFilled
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30'
                          }`}
                        >
                          <Send size={13} />
                          <span>Respond & Pitch</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: POST SEEKING COLLABORATOR REQUEST              */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showPostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-purple-500/30 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8"
            >
              {/* Header */}
              <div className="p-5 bg-slate-950 border-b border-purple-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600/20 text-purple-400 rounded-xl border border-purple-500/30">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Post Seeking Collaborator Request</h3>
                    <p className="text-xs text-slate-400">Reach drummers, graphic designers, sound engineers, or session musicians.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPostModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmitPost} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Band / Poster & Role */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Posting Artist / Band <span className="text-purple-400">*</span>
                    </label>
                    <select
                      value={authorArtistId}
                      onChange={(e) => setAuthorArtistId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      {artists.map(a => (
                        <option key={a.id} value={a.id}>{a.name} ({a.genre})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Collaborator Role Needed <span className="text-purple-400">*</span>
                    </label>
                    <select
                      value={postRole}
                      onChange={(e) => {
                        const newRole = e.target.value as CollaboratorRole;
                        setPostRole(newRole);
                        // Suggest default skills for role
                        if (SUGGESTED_SKILL_TAGS[newRole]) {
                          setPostSkills(SUGGESTED_SKILL_TAGS[newRole].slice(0, 3));
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      {ROLE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Headline / Title */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Request Headline / Title <span className="text-purple-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAiDraftPost}
                      disabled={isAiDraftingPost}
                      className="text-[11px] text-purple-300 hover:text-purple-200 font-semibold flex items-center gap-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded-lg transition-all cursor-pointer"
                    >
                      <Sparkles size={11} className={isAiDraftingPost ? 'animate-spin' : ''} />
                      <span>{isAiDraftingPost ? 'Sharon Writing...' : '✨ Let Sharon Draft Post'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Drummer needed for RINO Room gig, or Graphic designer for tour poster"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Link to Existing Gig (Optional) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Associate with Scheduled Gig (Optional)
                  </label>
                  <select
                    value={postGigId}
                    onChange={(e) => handleSelectGigForPost(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">-- No specific gig (General Studio / Tour / Brand) --</option>
                    {gigs.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.title} • {g.venueName} ({new Date(g.dateTime).toLocaleDateString([], { month: 'short', day: 'numeric' })})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Scope of Work & Expectations <span className="text-purple-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Explain the role, set length, rehearsal schedule, gear requirements, deliverables, or vibe..."
                    value={postDescription}
                    onChange={(e) => setPostDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 leading-relaxed"
                  />
                </div>

                {/* Required Skills & Tags */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Specific Skills Required (Click to add or type custom)
                  </label>
                  
                  {/* Active Skill Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {postSkills.map(skill => (
                      <span
                        key={skill}
                        className="bg-purple-600/30 text-purple-200 border border-purple-500/40 text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkillTag(skill)}
                          className="hover:text-red-400 cursor-pointer"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Suggested tags for selected role */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className="text-[10px] text-slate-500 py-0.5">Suggestions:</span>
                    {(SUGGESTED_SKILL_TAGS[postRole] || []).map(sug => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => handleAddSkillTag(sug)}
                        className={`text-[10px] px-2 py-0.5 rounded border transition-all cursor-pointer ${
                          postSkills.includes(sug)
                            ? 'bg-slate-800 text-slate-500 border-slate-800 opacity-50 cursor-default'
                            : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
                        }`}
                        disabled={postSkills.includes(sug)}
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>

                  {/* Custom tag input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add custom skill (e.g. Pro Tools, 4-Track Stems, Behringer X32)..."
                      value={customSkillInput}
                      onChange={(e) => setCustomSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkillTag(customSkillInput);
                        }
                      }}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSkillTag(customSkillInput)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Location & Remote */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Location (City, Venue, or Area)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Seattle, WA or Denver, CO"
                      value={postLocation}
                      onChange={(e) => setPostLocation(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={postIsRemote}
                        onChange={(e) => setPostIsRemote(e.target.checked)}
                        className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-purple-600 focus:ring-purple-500"
                      />
                      <span>Remote / Digital Deliverable (No travel needed)</span>
                    </label>
                  </div>
                </div>

                {/* Compensation Type & Amount */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Compensation Model <span className="text-purple-400">*</span>
                    </label>
                    <select
                      value={postCompensationType}
                      onChange={(e: any) => setPostCompensationType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="paid_fixed">Paid Flat Fee ($)</option>
                      <option value="paid_hourly">Paid Hourly Rate ($/hr)</option>
                      <option value="door_split">Door / Ticket Split (%)</option>
                      <option value="trade_credit">Trade, Merch & Songwriting Credit</option>
                      <option value="volunteer">Volunteer / Audition / Jam</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Compensation Details / Amount <span className="text-purple-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. $250 flat fee + drink tab, or $35/hr"
                      value={postCompensationAmount}
                      onChange={(e) => setPostCompensationAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Dates & Deadlines */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Show or Deliverable Date
                    </label>
                    <input
                      type="date"
                      value={postEventDate}
                      onChange={(e) => setPostEventDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Application Deadline
                    </label>
                    <input
                      type="date"
                      value={postDeadline}
                      onChange={(e) => setPostDeadline(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPostModal(false)}
                    className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Check size={14} />
                    <span>Publish Request</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 2: RESPOND / PITCH TO COLLABORATION REQUEST       */}
      {/* ======================================================== */}
      <AnimatePresence>
        {respondingToRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-purple-500/30 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl my-8"
            >
              {/* Header */}
              <div className="p-5 bg-slate-950 border-b border-purple-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold font-mono text-purple-400 uppercase tracking-wider block">
                    Submit Proposal / Pitch
                  </span>
                  <h3 className="text-base font-bold text-white truncate max-w-md">
                    {respondingToRequest.title}
                  </h3>
                  <span className="text-xs text-slate-400">
                    To: {respondingToRequest.authorArtistName} • {respondingToRequest.compensationAmount}
                  </span>
                </div>
                <button
                  onClick={() => setRespondingToRequest(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmitResponse} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Your Name / Artist Name <span className="text-purple-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Rivera or Seattle Rhythm Co."
                      value={responderName}
                      onChange={(e) => setResponderName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Contact Email <span className="text-purple-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alex@musician.com"
                      value={responderEmail}
                      onChange={(e) => setResponderEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="(206) 555-0199"
                      value={responderPhone}
                      onChange={(e) => setResponderPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Portfolio / Music Link
                    </label>
                    <input
                      type="url"
                      placeholder="https://instagram.com/..., spotify, or soundcloud"
                      value={responderPortfolio}
                      onChange={(e) => setResponderPortfolio(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Pitch Message */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Why You're a Great Fit (Your Pitch) <span className="text-purple-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAiDraftPitch}
                      disabled={isAiDraftingPitch}
                      className="text-[11px] text-purple-300 hover:text-purple-200 font-semibold flex items-center gap-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded-lg transition-all cursor-pointer"
                    >
                      <Sparkles size={11} className={isAiDraftingPitch ? 'animate-spin' : ''} />
                      <span>{isAiDraftingPitch ? 'Sharon Writing...' : '✨ Let Sharon Draft Pitch'}</span>
                    </button>
                  </div>
                  <textarea
                    required
                    rows={4}
                    placeholder="Mention your relevant gear (e.g. in-ear monitors, click track familiarity), live experience, and rehearsal availability..."
                    value={responderPitch}
                    onChange={(e) => setResponderPitch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 leading-relaxed"
                  />
                </div>

                {/* Quoted Rate / Terms */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm Rate / Availability
                  </label>
                  <input
                    type="text"
                    placeholder={`e.g. Agreed to ${respondingToRequest.compensationAmount || '$250 flat fee'}, available for soundcheck at 5pm`}
                    value={responderRate}
                    onChange={(e) => setResponderRate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setRespondingToRequest(null)}
                    className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Send size={14} />
                    <span>Send Pitch to Band</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 3: MANAGE RESPONSES FOR MY BAND'S POSTING          */}
      {/* ======================================================== */}
      <AnimatePresence>
        {managingRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-purple-500/30 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8"
            >
              {/* Header */}
              <div className="p-5 bg-slate-950 border-b border-purple-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold font-mono text-purple-400 uppercase tracking-wider block">
                    Review Musician Proposals
                  </span>
                  <h3 className="text-base font-bold text-white truncate max-w-md">
                    {managingRequest.title}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {managingRequest.responses?.length || 0} candidate(s) responded
                  </span>
                </div>
                <button
                  onClick={() => setManagingRequest(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Responses List */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {(!managingRequest.responses || managingRequest.responses.length === 0) ? (
                  <div className="text-center py-8 space-y-2">
                    <Users size={32} className="mx-auto text-slate-600" />
                    <p className="text-xs text-slate-400 font-medium">No candidates have responded to this listing yet.</p>
                    <p className="text-[11px] text-slate-500">Share your listing link or wait for local musicians to pitch!</p>
                  </div>
                ) : (
                  managingRequest.responses.map(resp => (
                    <div
                      key={resp.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{resp.responderName}</span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                              resp.status === 'accepted'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : resp.status === 'shortlisted'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : resp.status === 'declined'
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : 'bg-slate-800 text-slate-400'
                            }`}>
                              {resp.status}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {resp.responderEmail} {resp.responderPhone && `• ${resp.responderPhone}`}
                          </span>
                        </div>

                        {resp.portfolioUrl && (
                          <a
                            href={resp.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold bg-purple-500/10 px-2 py-1 rounded-lg border border-purple-500/20"
                          >
                            <span>Portfolio</span>
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>

                      {/* Pitch Message */}
                      <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg leading-relaxed border border-slate-800/80">
                        "{resp.pitchMessage}"
                      </p>

                      {resp.offeredRate && (
                        <div className="text-[11px] text-slate-400">
                          Proposed Terms: <strong className="text-emerald-400 font-mono">{resp.offeredRate}</strong>
                        </div>
                      )}

                      {/* Action buttons for response */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-900">
                        <a
                          href={`mailto:${resp.responderEmail}?subject=Re: ${encodeURIComponent(managingRequest.title)}`}
                          className="text-xs text-slate-300 hover:text-white flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800"
                        >
                          <Mail size={12} />
                          <span>Email Musician</span>
                        </a>

                        <div className="flex items-center gap-1.5">
                          {resp.status !== 'accepted' && (
                            <button
                              onClick={() => {
                                onUpdateResponseStatus(managingRequest.id, resp.id, 'accepted');
                                setManagingRequest({
                                  ...managingRequest,
                                  responses: managingRequest.responses.map(r => r.id === resp.id ? { ...r, status: 'accepted' } : r)
                                });
                              }}
                              className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                            >
                              <Check size={12} /> Accept
                            </button>
                          )}

                          {resp.status !== 'shortlisted' && (
                            <button
                              onClick={() => {
                                onUpdateResponseStatus(managingRequest.id, resp.id, 'shortlisted');
                                setManagingRequest({
                                  ...managingRequest,
                                  responses: managingRequest.responses.map(r => r.id === resp.id ? { ...r, status: 'shortlisted' } : r)
                                });
                              }}
                              className="px-2.5 py-1 bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                            >
                              Shortlist
                            </button>
                          )}

                          {resp.status !== 'declined' && (
                            <button
                              onClick={() => {
                                onUpdateResponseStatus(managingRequest.id, resp.id, 'declined');
                                setManagingRequest({
                                  ...managingRequest,
                                  responses: managingRequest.responses.map(r => r.id === resp.id ? { ...r, status: 'declined' } : r)
                                });
                              }}
                              className="px-2.5 py-1 bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-300 rounded-lg text-xs font-medium cursor-pointer"
                            >
                              Decline
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Mark as Filled Toggle */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Status: <strong className="text-white uppercase font-mono">{managingRequest.status}</strong>
                  </span>

                  <button
                    onClick={() => {
                      const nextStatus = managingRequest.status === 'filled' ? 'open' : 'filled';
                      const updated = { ...managingRequest, status: nextStatus as any };
                      onUpdateRequest(updated);
                      setManagingRequest(updated);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                      managingRequest.status === 'filled'
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    <UserCheck size={14} />
                    <span>{managingRequest.status === 'filled' ? 'Reopen Listing' : 'Mark Listing as Filled'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
