import React, { useState, useMemo } from 'react';
import { 
  CollaborationRequest, 
  CollaborationResponse, 
  CollaborationMessage,
  CollaboratorRole, 
  CollaborationCompensationType, 
  Artist, 
  Gig,
  LinkedCollaborator
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
  Tag,
  Handshake,
  MessageSquare,
  Link2,
  Share2,
  Radio,
  Layers
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
  onUpdateArtist?: (artist: Artist) => void;
  onUpdateGig?: (gig: Gig) => void;
  onNavigateToTab?: (tabId: string) => void;
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
  onUpdateResponseStatus,
  onUpdateArtist,
  onUpdateGig,
  onNavigateToTab
}) => {
  // Navigation & Filter States
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState<'all' | 'remote' | 'in_person'>('all');
  const [compensationFilter, setCompensationFilter] = useState<'all' | 'paid_fixed' | 'paid_hourly' | 'door_split' | 'trade_credit' | 'volunteer'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'filled'>('all');
  const [viewScope, setViewScope] = useState<'all' | 'my_posts' | 'my_pitches' | 'direct_collabs' | 'messages'>('all');

  // Modals & Drawers
  const [showPostModal, setShowPostModal] = useState(false);
  const [showDirectCollabModal, setShowDirectCollabModal] = useState(false);
  const [respondingToRequest, setRespondingToRequest] = useState<CollaborationRequest | null>(null);
  const [managingRequest, setManagingRequest] = useState<CollaborationRequest | null>(null);
  const [activeMessagingRequest, setActiveMessagingRequest] = useState<CollaborationRequest | null>(null);
  const [chatDraftText, setChatDraftText] = useState('');
  const [notificationBanner, setNotificationBanner] = useState<string | null>(null);

  // Active user / band context
  const defaultArtist = artists.find(a => a.id === selectedArtistId) || artists[0];
  const activeArtist = defaultArtist || { id: 'default', name: 'My Band', genre: 'Indie Rock', contactEmail: 'contact@band.com' };

  // New Request Form State (Marketplace Listing)
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

  // Direct Artist-to-Artist Proposal State
  const [directSenderId, setDirectSenderId] = useState<string>(defaultArtist?.id || artists[0]?.id || '');
  const [directTargetId, setDirectTargetId] = useState<string>(
    artists.find(a => a.id !== (defaultArtist?.id || artists[0]?.id))?.id || ''
  );
  const [directCollabType, setDirectCollabType] = useState<'co_bill_show' | 'tour_support' | 'split_single' | 'guest_musician'>('co_bill_show');
  const [directTitle, setDirectTitle] = useState('');
  const [directGigId, setDirectGigId] = useState<string>('');
  const [directCustomDate, setDirectCustomDate] = useState('');
  const [directCompensationType, setDirectCompensationType] = useState<CollaborationCompensationType>('door_split');
  const [directCompensationAmount, setDirectCompensationAmount] = useState('50/50 door & merch split');
  const [directPitchMessage, setDirectPitchMessage] = useState('');

  // New Response Form State
  const [responderName, setResponderName] = useState(defaultArtist?.name || '');
  const [responderEmail, setResponderEmail] = useState(defaultArtist?.contactEmail || '');
  const [responderPhone, setResponderPhone] = useState('');
  const [responderPortfolio, setResponderPortfolio] = useState('');
  const [responderPitch, setResponderPitch] = useState('');
  const [responderRate, setResponderRate] = useState('');
  const [isAiDraftingPitch, setIsAiDraftingPitch] = useState(false);

  // Quick stats
  const activeRequestsCount = requests.filter(r => r.status === 'open').length;
  const myBandsRequests = useMemo(() => {
    const bandIds = artists.map(a => a.id);
    return requests.filter(r => bandIds.includes(r.authorArtistId) || (r.targetArtistId && bandIds.includes(r.targetArtistId)));
  }, [requests, artists]);

  const directProposalsCount = useMemo(() => {
    return requests.filter(r => r.isDirectArtistCollab).length;
  }, [requests]);

  const totalConversationsCount = useMemo(() => {
    return requests.filter(r => r.messages && r.messages.length > 0).length;
  }, [requests]);

  // Filtering
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      // Scope filter
      if (viewScope === 'my_posts') {
        const bandIds = artists.map(a => a.id);
        if (!bandIds.includes(req.authorArtistId)) return false;
      } else if (viewScope === 'my_pitches') {
        const hasMyPitch = (req.responses || []).some(
          r => r.responderEmail === responderEmail || r.responderName === responderName
        );
        if (!hasMyPitch) return false;
      } else if (viewScope === 'direct_collabs') {
        if (!req.isDirectArtistCollab) return false;
      } else if (viewScope === 'messages') {
        if (!req.messages || req.messages.length === 0) return false;
      }

      // Category filter (only in general marketplace)
      if (viewScope === 'all' && activeCategory !== 'all') {
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

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = req.title.toLowerCase().includes(q);
        const matchesDesc = req.description.toLowerCase().includes(q);
        const matchesAuthor = req.authorArtistName.toLowerCase().includes(q);
        const matchesTarget = (req.targetArtistName || '').toLowerCase().includes(q);
        const matchesLocation = req.location.toLowerCase().includes(q);
        const matchesSkills = req.skillsRequired.some(s => s.toLowerCase().includes(q));
        const matchesRole = req.roleNeeded.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesAuthor && !matchesTarget && !matchesLocation && !matchesSkills && !matchesRole) {
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

      const res = await fetch('/api/sharon-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Draft a concise, exciting collaboration listing for ${selectedAuthor.name} (${selectedAuthor.genre}) seeking a ${postRole}. Event: ${selectedGig?.title || 'upcoming gig'}.`,
          artist: selectedAuthor,
          currentDate: new Date().toISOString()
        })
      });

      const data = await res.json();
      if (data.reply) {
        setPostDescription(data.reply);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiDraftingPost(false);
    }
  };

  // Submit standard Marketplace Request
  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedAuthor = artists.find(a => a.id === authorArtistId) || artists[0];
    const selectedGig = gigs.find(g => g.id === postGigId);

    const newReq: CollaborationRequest = {
      id: `collab-${Date.now()}`,
      authorArtistId: selectedAuthor.id,
      authorArtistName: selectedAuthor.name,
      authorContactEmail: selectedAuthor.contactEmail,
      authorGenre: selectedAuthor.genre,
      title: postTitle.trim(),
      roleNeeded: postRole,
      skillsRequired: postSkills,
      description: postDescription.trim(),
      location: postLocation.trim() || 'Seattle, WA',
      isRemote: postIsRemote,
      gigId: postGigId || undefined,
      gigTitle: selectedGig?.title,
      eventDate: postEventDate || undefined,
      deadline: postDeadline || undefined,
      compensationType: postCompensationType,
      compensationAmount: postCompensationAmount.trim() || undefined,
      status: 'open',
      responses: [],
      messages: [],
      createdAt: new Date().toISOString()
    };

    onAddRequest(newReq);
    setShowPostModal(false);
    setPostTitle('');
    setPostDescription('');
    setNotificationBanner(`Collaboration listing "${newReq.title}" posted to Marketplace!`);
    setTimeout(() => setNotificationBanner(null), 4000);
  };

  // Submit Direct Artist-to-Artist Proposal
  const handleSubmitDirectProposal = (e: React.FormEvent) => {
    e.preventDefault();
    const sender = artists.find(a => a.id === directSenderId) || artists[0];
    const target = artists.find(a => a.id === directTargetId);

    if (!target) {
      alert('Please select a recipient artist to propose collaboration with.');
      return;
    }

    const linkedGig = gigs.find(g => g.id === directGigId);
    const title = directTitle.trim() || `Co-bill Collaboration: ${sender.name} & ${target.name}`;

    const newDirectReq: CollaborationRequest = {
      id: `collab-direct-${Date.now()}`,
      authorArtistId: sender.id,
      authorArtistName: sender.name,
      authorContactEmail: sender.contactEmail,
      authorGenre: sender.genre,
      targetArtistId: target.id,
      targetArtistName: target.name,
      isDirectArtistCollab: true,
      collabType: directCollabType,
      title,
      roleNeeded: 'session_musician',
      customRoleName: directCollabType === 'co_bill_show' ? 'Co-Bill Partner' : (directCollabType === 'tour_support' ? 'Tour Support' : 'Collaborating Artist'),
      skillsRequired: ['Live Performance', 'Co-Bill Draw', 'Stage Pacing', 'Pro Communication'],
      description: directPitchMessage.trim() || `Direct collaboration proposal from ${sender.name} to ${target.name} for a shared co-bill concert and cross-promotion.`,
      location: linkedGig?.venueAddress || 'Seattle, WA',
      isRemote: false,
      gigId: directGigId || undefined,
      gigTitle: linkedGig?.title,
      eventDate: linkedGig?.dateTime || directCustomDate || undefined,
      compensationType: directCompensationType,
      compensationAmount: directCompensationAmount.trim() || '50/50 door split',
      status: 'open',
      responses: [],
      messages: [
        {
          id: `msg-${Date.now()}`,
          requestId: `collab-direct-${Date.now()}`,
          senderArtistId: sender.id,
          senderName: sender.name,
          senderRole: 'author',
          messageText: directPitchMessage.trim() || `Hey ${target.name}! We'd love to link up for a co-bill show. Check out the proposed details and let's coordinate soundcheck & set times!`,
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString()
    };

    onAddRequest(newDirectReq);
    setShowDirectCollabModal(false);
    setDirectTitle('');
    setDirectPitchMessage('');
    setNotificationBanner(`Direct collaboration request sent to ${target.name}! Check the Direct Proposals view.`);
    setTimeout(() => setNotificationBanner(null), 4500);
  };

  // Accept a collaboration proposal and LINK both profiles and events!
  const handleAcceptCollaborationAndLink = (
    req: CollaborationRequest,
    partnerId?: string,
    partnerName?: string,
    responseId?: string
  ) => {
    const sender = artists.find(a => a.id === req.authorArtistId);
    const resolvedPartnerId = partnerId || req.targetArtistId;
    const partner = artists.find(a => a.id === resolvedPartnerId);

    const partnerDisplayName = partnerName || partner?.name || req.targetArtistName || 'Collaborating Artist';

    // 1. Link Artist Profiles
    if (onUpdateArtist && sender && partner) {
      const now = new Date().toISOString();

      // Add partner to sender's profile
      const senderExisting = sender.linkedCollaborators || [];
      if (!senderExisting.some(c => c.artistId === partner.id)) {
        const updatedSender: Artist = {
          ...sender,
          linkedCollaborators: [
            ...senderExisting,
            {
              artistId: partner.id,
              artistName: partner.name,
              genre: partner.genre,
              contactEmail: partner.contactEmail,
              linkedSince: now,
              collabRequestId: req.id,
              projectTitle: req.title,
              linkedGigId: req.gigId,
              linkedGigTitle: req.gigTitle
            }
          ]
        };
        onUpdateArtist(updatedSender);
      }

      // Add sender to partner's profile
      const partnerExisting = partner.linkedCollaborators || [];
      if (!partnerExisting.some(c => c.artistId === sender.id)) {
        const updatedPartner: Artist = {
          ...partner,
          linkedCollaborators: [
            ...partnerExisting,
            {
              artistId: sender.id,
              artistName: sender.name,
              genre: sender.genre,
              contactEmail: sender.contactEmail,
              linkedSince: now,
              collabRequestId: req.id,
              projectTitle: req.title,
              linkedGigId: req.gigId,
              linkedGigTitle: req.gigTitle
            }
          ]
        };
        onUpdateArtist(updatedPartner);
      }
    }

    // 2. Link Event across both calendars
    let linkedEventTitle = req.gigTitle;
    if (req.gigId && onUpdateGig) {
      const gig = gigs.find(g => g.id === req.gigId);
      if (gig && partner) {
        const currentCollabIds = gig.collaboratorArtistIds || [];
        const currentNames = gig.coBillArtistNames || [];
        const updatedGig: Gig = {
          ...gig,
          collaboratorArtistIds: Array.from(new Set([...currentCollabIds, partner.id])),
          coBillArtistNames: Array.from(new Set([...currentNames, partner.name])),
          notes: gig.notes ? `${gig.notes}\n[Co-Bill Partner Confirmed]: ${partner.name}` : `[Co-Bill Partner Confirmed]: ${partner.name}`
        };
        onUpdateGig(updatedGig);
        linkedEventTitle = gig.title;
      }
    }

    // 3. Update Request status and append System Chat Message
    const systemChatMessage: CollaborationMessage = {
      id: `msg-${Date.now()}`,
      requestId: req.id,
      senderName: 'BandAide System',
      senderRole: 'system',
      messageText: `🤝 Collaboration officially accepted! Profiles for "${sender?.name || req.authorArtistName}" and "${partnerDisplayName}" are now linked, and "${linkedEventTitle || 'the event'}" is synchronized on both artists' tour schedules.`,
      timestamp: new Date().toISOString()
    };

    const updatedResponses = (req.responses || []).map(r => {
      if (responseId && r.id === responseId) return { ...r, status: 'accepted' as const };
      return r;
    });

    const updatedReq: CollaborationRequest = {
      ...req,
      status: 'filled',
      acceptedCollaboratorId: resolvedPartnerId,
      acceptedCollaboratorName: partnerDisplayName,
      responses: updatedResponses,
      messages: [...(req.messages || []), systemChatMessage]
    };

    onUpdateRequest(updatedReq);
    if (managingRequest?.id === req.id) {
      setManagingRequest(updatedReq);
    }
    if (activeMessagingRequest?.id === req.id) {
      setActiveMessagingRequest(updatedReq);
    }

    setNotificationBanner(`🎉 Success! Profiles for ${sender?.name || req.authorArtistName} & ${partnerDisplayName} are now linked, and the event appears in both tour schedules!`);
    setTimeout(() => setNotificationBanner(null), 6000);
  };

  // Send an in-app message
  const handleSendMessage = (req: CollaborationRequest, textToSend?: string) => {
    const text = (textToSend || chatDraftText).trim();
    if (!text) return;

    const isAuthor = req.authorArtistId === activeArtist.id;
    const newMessage: CollaborationMessage = {
      id: `msg-${Date.now()}`,
      requestId: req.id,
      senderArtistId: activeArtist.id,
      senderName: activeArtist.name,
      senderRole: isAuthor ? 'author' : 'collaborator',
      messageText: text,
      timestamp: new Date().toISOString()
    };

    const updatedReq: CollaborationRequest = {
      ...req,
      messages: [...(req.messages || []), newMessage]
    };

    onUpdateRequest(updatedReq);
    setActiveMessagingRequest(updatedReq);
    setChatDraftText('');
  };

  // Submit response pitch to an open request
  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondingToRequest) return;

    const newResponse: CollaborationResponse = {
      id: `resp-${Date.now()}`,
      requestId: respondingToRequest.id,
      responderArtistId: activeArtist.id !== 'default' ? activeArtist.id : undefined,
      responderName: responderName.trim() || activeArtist.name,
      responderEmail: responderEmail.trim() || activeArtist.contactEmail,
      responderPhone: responderPhone.trim() || undefined,
      portfolioUrl: responderPortfolio.trim() || undefined,
      pitchMessage: responderPitch.trim(),
      offeredRate: responderRate.trim() || undefined,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    onAddResponse(respondingToRequest.id, newResponse);

    // Also append as an in-app message to initiate thread
    const initialMessage: CollaborationMessage = {
      id: `msg-${Date.now()}`,
      requestId: respondingToRequest.id,
      senderArtistId: activeArtist.id,
      senderName: newResponse.responderName,
      senderRole: 'collaborator',
      messageText: `Pitch: ${newResponse.pitchMessage}${newResponse.offeredRate ? ` (Terms: ${newResponse.offeredRate})` : ''}`,
      timestamp: new Date().toISOString()
    };

    const updatedWithMsg: CollaborationRequest = {
      ...respondingToRequest,
      messages: [...(respondingToRequest.messages || []), initialMessage]
    };
    onUpdateRequest(updatedWithMsg);

    setRespondingToRequest(null);
    setResponderPitch('');
    setNotificationBanner(`Your proposal has been submitted to ${respondingToRequest.authorArtistName}!`);
    setTimeout(() => setNotificationBanner(null), 4000);
  };

  return (
    <div className="space-y-6" id="collaborate-marketplace-root">
      {/* Top Banner Notice */}
      <AnimatePresence>
        {notificationBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 bg-gradient-to-r from-emerald-950/90 via-purple-950/80 to-slate-900 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center justify-between gap-3 shadow-lg shadow-emerald-950/20"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>{notificationBanner}</span>
            </div>
            <button
              onClick={() => setNotificationBanner(null)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header & Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Artist-to-Artist Direct Co-Bill Proposer */}
        <div className="bg-gradient-to-br from-pink-950/50 via-purple-950/30 to-slate-900 border border-pink-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-pink-950/20">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-pink-300 flex items-center gap-1.5">
                <Handshake size={14} className="text-pink-400" />
                <span>Artist-to-Artist Proposer</span>
              </span>
              <span className="text-[9px] font-mono bg-pink-500/20 text-pink-200 px-2 py-0.5 rounded-full border border-pink-500/30">
                Direct Co-Bills
              </span>
            </div>
            <h4 className="text-sm font-bold text-white font-display mt-2">
              Send Direct Co-Bill Proposal
            </h4>
            <p className="text-[11px] text-slate-300 mt-1 leading-snug">
              Invite another band to co-headline, share tour dates, or feature on a release. Linked automatically when accepted!
            </p>
          </div>

          <button
            onClick={() => setShowDirectCollabModal(true)}
            className="mt-3 w-full py-2 px-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-pink-600/30 transition-all cursor-pointer font-mono"
          >
            <Handshake size={14} />
            <span>Propose Collaboration to Artist</span>
          </button>
        </div>

        {/* Card 2: Open Marketplace Listings */}
        <div className="bg-gradient-to-br from-purple-900/40 via-indigo-900/20 to-slate-900 border border-purple-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-purple-900/20">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Sparkles size={12} className="text-purple-400" />
                <span>BandAide Marketplace</span>
              </span>
              <span className="text-[9px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                {activeRequestsCount} Open
              </span>
            </div>
            <h4 className="text-sm font-bold text-white font-display mt-2">
              Post Musician or Crew Wanted
            </h4>
            <p className="text-[11px] text-slate-300 mt-1 leading-snug">
              Looking for a sub drummer, session bassist, sound engineer, or tour merch designer? Broadcast to the community.
            </p>
          </div>

          <button
            onClick={() => {
              if (selectedArtistId && selectedArtistId !== 'all') {
                setAuthorArtistId(selectedArtistId);
              }
              setShowPostModal(true);
            }}
            className="mt-3 w-full py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/30 transition-all cursor-pointer font-mono"
          >
            <Plus size={14} />
            <span>Post Seeking Collaborator</span>
          </button>
        </div>

        {/* Card 3: In-App Collaborator Chat Inbox */}
        <div className="bg-gradient-to-br from-cyan-950/40 via-slate-900 to-indigo-950/30 border border-cyan-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-cyan-950/20">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <MessageSquare size={13} className="text-cyan-400" />
                <span>Collaborator Messages</span>
              </span>
              <span className="text-[9px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full">
                {totalConversationsCount} Threads
              </span>
            </div>
            <h4 className="text-sm font-bold text-white font-display mt-2">
              In-App Collaborator Inbox
            </h4>
            <p className="text-[11px] text-slate-300 mt-1 leading-snug">
              Direct chat between artists, co-bill partners, and auditioning musicians with stage plots & call-time presets.
            </p>
          </div>

          <button
            onClick={() => setViewScope('messages')}
            className={`mt-3 w-full py-2 px-3 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer font-mono ${
              viewScope === 'messages'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 hover:border-cyan-500/40'
            }`}
          >
            <MessageSquare size={14} />
            <span>Open In-App Messages</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search, Scope Tabs & Filters */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-4">
        {/* Row 1: Search + Scope Tabs */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search band, role, or skill..."
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
          <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full lg:w-auto">
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
              onClick={() => setViewScope('direct_collabs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewScope === 'direct_collabs'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Handshake size={12} />
              <span>Direct Proposals</span>
              <span className="text-[10px] bg-pink-950/60 px-1.5 py-0.2 rounded font-mono font-bold text-pink-300">
                {directProposalsCount}
              </span>
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
              onClick={() => setViewScope('messages')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewScope === 'messages'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare size={12} />
              <span>In-App Messages</span>
              <span className="text-[10px] bg-cyan-950/60 px-1.5 py-0.2 rounded font-mono font-bold text-cyan-300">
                {totalConversationsCount}
              </span>
            </button>
          </div>

          {/* Location & Status Filters */}
          <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="open">Seeking / Open Only</option>
              <option value="filled">Filled / Linked</option>
            </select>

            <select
              value={compensationFilter}
              onChange={(e: any) => setCompensationFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">Any Terms</option>
              <option value="door_split">Door Split %</option>
              <option value="paid_fixed">Fixed Fee / Guarantee</option>
              <option value="volunteer">Volunteer / Jam</option>
            </select>
          </div>
        </div>

        {/* Row 2: Category Pills (if viewing all marketplace) */}
        {viewScope === 'all' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-800/80">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold shrink-0">Filter:</span>
            {[
              { id: 'all', label: 'All Categories' },
              { id: 'musicians', label: 'Musicians & Vocalists' },
              { id: 'creative', label: 'Art, Photo & Video' },
              { id: 'crew', label: 'Sound & Tour Crew' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Requests Grid */}
      {filteredRequests.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 border-dashed rounded-2xl p-12 text-center text-slate-500 space-y-3">
          <Handshake className="mx-auto text-slate-600" size={44} />
          <h4 className="text-base font-bold text-slate-300">No collaboration requests found</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {viewScope === 'direct_collabs'
              ? 'No direct artist-to-artist proposals yet. Click "Propose Collaboration to Artist" to invite another band!'
              : viewScope === 'messages'
              ? 'No active conversation threads. Send an artist a proposal or apply to an open listing to start chatting!'
              : 'Try clearing your search terms or post a new listing for your band.'}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setShowDirectCollabModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Propose Artist Co-Bill
            </button>
            <button
              onClick={() => setShowPostModal(true)}
              className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Post Seeking Collaborator
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequests.map(req => {
            const roleConfig = ROLE_OPTIONS.find(r => r.value === req.roleNeeded) || ROLE_OPTIONS[ROLE_OPTIONS.length - 1];
            const RoleIcon = roleConfig.icon;
            const isMyPost = artists.some(a => a.id === req.authorArtistId);
            const isTargetedToMe = req.targetArtistId && artists.some(a => a.id === req.targetArtistId);
            const responsesCount = req.responses?.length || 0;
            const messagesCount = req.messages?.length || 0;
            const isFilled = req.status === 'filled';
            const isLinked = isFilled && Boolean(req.acceptedCollaboratorName);

            return (
              <motion.div
                key={req.id}
                layout
                className={`bg-slate-900/70 border rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-xl ${
                  req.isDirectArtistCollab
                    ? 'border-pink-500/40 bg-gradient-to-b from-pink-950/20 to-slate-900/80 shadow-pink-950/10'
                    : isFilled
                    ? 'border-emerald-500/30 bg-slate-900/40'
                    : 'border-slate-800 hover:border-purple-500/40'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    {/* Role / Direct Collab Tag */}
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {req.isDirectArtistCollab ? (
                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border border-pink-500/40 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full">
                          <Handshake size={11} />
                          <span>Direct Co-Bill Proposal</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full">
                          <RoleIcon size={11} />
                          <span>{roleConfig.label}</span>
                        </span>
                      )}

                      {isLinked && (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={10} />
                          <span>Profiles & Event Linked</span>
                        </span>
                      )}
                    </div>

                    {/* Messages pill button */}
                    <button
                      onClick={() => setActiveMessagingRequest(req)}
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                        messagesCount > 0
                          ? 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                      title="Open In-App Collaborator Chat"
                    >
                      <MessageSquare size={11} className={messagesCount > 0 ? 'text-cyan-400' : 'text-slate-500'} />
                      <span>{messagesCount > 0 ? `${messagesCount} msgs` : 'Chat'}</span>
                    </button>
                  </div>

                  {/* Title & Artist Identity */}
                  <h4 className="text-sm font-bold text-white font-display mb-1 leading-snug">
                    {req.title}
                  </h4>

                  <div className="text-[11px] text-slate-400 mb-3 space-y-0.5">
                    <p className="flex items-center gap-1.5">
                      <span className="text-slate-500">Initiated by:</span>
                      <strong className="text-purple-300">{req.authorArtistName}</strong>
                      {req.authorGenre && <span className="text-[10px] font-mono text-slate-500">({req.authorGenre})</span>}
                    </p>

                    {req.targetArtistName && (
                      <p className="flex items-center gap-1.5 text-pink-300">
                        <span className="text-slate-500">Target Partner:</span>
                        <strong>{req.targetArtistName}</strong>
                      </p>
                    )}

                    {req.acceptedCollaboratorName && (
                      <p className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <Link2 size={11} />
                        <span>Connected: {req.acceptedCollaboratorName}</span>
                      </p>
                    )}
                  </div>

                  {/* Linked Gig Info if attached */}
                  {req.gigTitle && (
                    <div className="mb-3 p-2 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-purple-400 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-200 block text-[11px]">{req.gigTitle}</span>
                          {req.eventDate && (
                            <span className="text-[10px] font-mono text-purple-300">
                              {new Date(req.eventDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[9.5px] font-mono bg-purple-900/60 text-purple-200 px-1.5 py-0.5 rounded">
                        Co-Bill Show
                      </span>
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
                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-slate-400">
                      {req.isRemote ? (
                        <>
                          <Globe size={13} className="text-cyan-400" />
                          <span className="text-cyan-300 font-medium">Remote / Digital</span>
                        </>
                      ) : (
                        <>
                          <MapPin size={13} className="text-slate-500" />
                          <span className="truncate max-w-[140px]">{req.location}</span>
                        </>
                      )}
                    </div>

                    {/* Compensation */}
                    <div className="flex items-center gap-1 font-semibold text-emerald-400 font-mono text-[11px]">
                      <DollarSign size={12} />
                      <span>{req.compensationAmount || 'Negotiable'}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    {/* Status Badge */}
                    <div className="text-[11px] font-mono">
                      {isFilled ? (
                        <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                          LINKED & FILLED
                        </span>
                      ) : req.status === 'in_discussion' ? (
                        <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[10px] font-bold">
                          IN DISCUSSION
                        </span>
                      ) : (
                        <span className="text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 text-[10px] font-bold">
                          OPEN PROPOSAL
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Chat Drawer Launcher */}
                      <button
                        onClick={() => setActiveMessagingRequest(req)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer border border-slate-700"
                        title="Chat in-app"
                      >
                        <MessageSquare size={12} />
                        <span>Chat</span>
                      </button>

                      {/* If Targeted directly to me and still open, offer direct Accept & Link */}
                      {isTargetedToMe && !isFilled && (
                        <button
                          onClick={() => handleAcceptCollaborationAndLink(req, activeArtist.id, activeArtist.name)}
                          className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/30"
                        >
                          <Check size={13} />
                          <span>Accept & Link</span>
                        </button>
                      )}

                      {/* If My Post: Manage Responses */}
                      {isMyPost && !isTargetedToMe && (
                        <button
                          onClick={() => setManagingRequest(req)}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>Responses ({responsesCount})</span>
                        </button>
                      )}

                      {/* If not my post and not already responded: Pitch / Apply */}
                      {!isMyPost && !isTargetedToMe && !isFilled && (
                        <button
                          onClick={() => setRespondingToRequest(req)}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-purple-600/20"
                        >
                          <Send size={12} />
                          <span>Pitch / Join</span>
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

      {/* MODAL 1: PROPOSE DIRECT ARTIST-TO-ARTIST COLLABORATION */}
      <AnimatePresence>
        {showDirectCollabModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-pink-500/40 rounded-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-pink-500/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white shadow-md">
                    <Handshake size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-display">
                      Propose Artist Collaboration or Co-Bill
                    </h3>
                    <p className="text-xs text-slate-400">
                      Send a proposal directly to another band. If accepted, profiles and events are automatically linked!
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDirectCollabModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitDirectProposal} className="space-y-4">
                {/* Sender & Recipient Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 font-bold mb-1">
                      From Your Band:
                    </label>
                    <select
                      value={directSenderId}
                      onChange={(e) => setDirectSenderId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      {artists.map(a => (
                        <option key={a.id} value={a.id}>{a.name} ({a.genre})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-pink-300 font-bold mb-1">
                      To Partner Band: *
                    </label>
                    <select
                      value={directTargetId}
                      onChange={(e) => setDirectTargetId(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-pink-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="">Select an Artist to invite...</option>
                      {artists.filter(a => a.id !== directSenderId).map(a => (
                        <option key={a.id} value={a.id}>{a.name} ({a.genre})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Collaboration Type */}
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold mb-1.5">
                    Collaboration Project Type:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'co_bill_show', label: 'Co-Bill Show', icon: Calendar },
                      { id: 'tour_support', label: 'Tour Support', icon: Briefcase },
                      { id: 'split_single', label: 'Split Single', icon: Music },
                      { id: 'guest_musician', label: 'Guest Feature', icon: Users },
                    ].map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setDirectCollabType(type.id as any)}
                        className={`p-2 rounded-xl text-xs font-mono font-bold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                          directCollabType === type.id
                            ? 'bg-pink-600 text-white border-pink-400 shadow-md shadow-pink-600/30'
                            : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
                        }`}
                      >
                        <type.icon size={14} />
                        <span>{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Proposal Title */}
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold mb-1">
                    Project / Show Title:
                  </label>
                  <input
                    type="text"
                    value={directTitle}
                    onChange={(e) => setDirectTitle(e.target.value)}
                    placeholder="e.g. Co-bill show at The Sunset Tavern or Pacific NW Split Tour"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>

                {/* Link to an existing gig on sender calendar */}
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold mb-1 flex items-center justify-between">
                    <span>Link an Existing Gig to Synchronize:</span>
                    <span className="text-[10px] text-purple-300">Optional</span>
                  </label>
                  <select
                    value={directGigId}
                    onChange={(e) => setDirectGigId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="">No existing gig (Enter new date below)</option>
                    {gigs.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.title} • {g.venueName} ({new Date(g.dateTime).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>

                {!directGigId && (
                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 font-bold mb-1">
                      Proposed Event Date / Target Timeline:
                    </label>
                    <input
                      type="date"
                      value={directCustomDate}
                      onChange={(e) => setDirectCustomDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                )}

                {/* Compensation / Door Split */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 font-bold mb-1">
                      Revenue Terms:
                    </label>
                    <select
                      value={directCompensationType}
                      onChange={(e) => setDirectCompensationType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="door_split">Equal Door Split % (e.g. 50/50)</option>
                      <option value="paid_fixed">Fixed Guarantee Payout ($)</option>
                      <option value="trade_credit">Merch / Support Trade</option>
                      <option value="volunteer">Guest Jam / Pro Bono</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 font-bold mb-1">
                      Specific Split / Amount:
                    </label>
                    <input
                      type="text"
                      value={directCompensationAmount}
                      onChange={(e) => setDirectCompensationAmount(e.target.value)}
                      placeholder="e.g. 50% gross door split or $250 guarantee"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Proposal Message */}
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold mb-1">
                    Proposal Message / Notes to Partner:
                  </label>
                  <textarea
                    rows={3}
                    value={directPitchMessage}
                    onChange={(e) => setDirectPitchMessage(e.target.value)}
                    placeholder="Hey! We love your sound and think our fans would have huge crossover. Would love to team up on this show, share backline, and do a 50/50 split!"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-xl p-3 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowDirectCollabModal(false)}
                    className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs font-mono rounded-xl shadow-lg shadow-pink-600/30 flex items-center gap-2 cursor-pointer"
                  >
                    <Send size={13} />
                    <span>Send Collaboration Proposal</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: IN-APP COLLABORATOR MESSENGER DRAWER */}
      <AnimatePresence>
        {activeMessagingRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-2xl w-full h-[85vh] flex flex-col justify-between overflow-hidden shadow-2xl"
            >
              {/* Chat Header */}
              <div className="bg-slate-950 border-b border-cyan-500/20 p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm font-display truncate max-w-sm">
                        {activeMessagingRequest.title}
                      </h4>
                      {activeMessagingRequest.status === 'filled' && (
                        <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full font-bold">
                          LINKED
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {activeMessagingRequest.authorArtistName}
                      {activeMessagingRequest.targetArtistName && ` ↔ ${activeMessagingRequest.targetArtistName}`}
                      {activeMessagingRequest.acceptedCollaboratorName && ` ↔ ${activeMessagingRequest.acceptedCollaboratorName}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* If not filled and target artist is viewing, offer Accept & Link directly inside Chat */}
                  {activeMessagingRequest.status !== 'filled' && activeMessagingRequest.targetArtistId === activeArtist.id && (
                    <button
                      onClick={() => handleAcceptCollaborationAndLink(activeMessagingRequest, activeArtist.id, activeArtist.name)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1 shadow-sm"
                    >
                      <Check size={12} />
                      <span>Accept & Link</span>
                    </button>
                  )}

                  <button
                    onClick={() => setActiveMessagingRequest(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Chat Message Scrollable Feed */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-900/60">
                {(!activeMessagingRequest.messages || activeMessagingRequest.messages.length === 0) ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-2 p-6">
                    <MessageSquare size={32} className="text-slate-700" />
                    <p className="text-xs text-slate-400 font-bold">No messages in this collaboration yet.</p>
                    <p className="text-[11px] text-slate-600 max-w-sm">
                      Send a message below or use quick logistic chips to exchange soundcheck times, stage plots, or door splits!
                    </p>
                  </div>
                ) : (
                  activeMessagingRequest.messages.map((msg) => {
                    const isSystem = msg.senderRole === 'system';
                    const isMe = msg.senderArtistId === activeArtist.id || msg.senderName === activeArtist.name;

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs text-center my-2 font-mono flex items-center justify-center gap-1.5">
                          <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                          <span>{msg.messageText}</span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 px-1">
                          <strong className={isMe ? 'text-purple-300' : 'text-cyan-300'}>{msg.senderName}</strong>
                          <span>•</span>
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                            isMe
                              ? 'bg-purple-600 text-white rounded-br-xs shadow-md shadow-purple-600/10'
                              : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap font-sans">{msg.messageText}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick Logistic Presets Bar */}
              <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-850 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold shrink-0">Quick Chips:</span>
                {[
                  '📋 Sent our 12-channel stage plot!',
                  '⏰ Soundcheck at 5:30 PM confirmed.',
                  '💰 50/50 door split confirmed!',
                  '🎵 Stems & transition notes shared in drive.'
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(activeMessagingRequest, chip)}
                    className="text-[10.5px] font-mono text-slate-300 hover:text-white bg-slate-900 hover:bg-purple-900/40 border border-slate-800 hover:border-purple-500/30 px-2 py-1 rounded-lg shrink-0 transition-colors cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Chat Input Box */}
              <div className="p-3 bg-slate-950 border-t border-slate-800">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(activeMessagingRequest);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={chatDraftText}
                    onChange={(e) => setChatDraftText(e.target.value)}
                    placeholder={`Message ${activeMessagingRequest.authorArtistName === activeArtist.name ? (activeMessagingRequest.targetArtistName || 'collaborator') : activeMessagingRequest.authorArtistName}...`}
                    className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none font-sans"
                  />
                  <button
                    type="submit"
                    disabled={!chatDraftText.trim()}
                    className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-600/20"
                  >
                    <span>Send</span>
                    <Send size={12} />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: POST SEEKING COLLABORATOR (OPEN MARKETPLACE LISTING) */}
      <AnimatePresence>
        {showPostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-purple-500/40 rounded-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white">
                    <Plus size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-display">
                      Post Seeking Collaborator Listing
                    </h3>
                    <p className="text-xs text-slate-400">
                      Broadcast open talent searches to local musicians, designers, and crew.
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowPostModal(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitPost} className="space-y-4">
                {/* Author Band Picker */}
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold mb-1">
                    Posting on Behalf Of:
                  </label>
                  <select
                    value={authorArtistId}
                    onChange={(e) => setAuthorArtistId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {artists.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.genre})</option>
                    ))}
                  </select>
                </div>

                {/* Role Picker */}
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold mb-1">
                    Role Needed: *
                  </label>
                  <select
                    value={postRole}
                    onChange={(e) => {
                      const newRole = e.target.value as CollaboratorRole;
                      setPostRole(newRole);
                      setPostSkills(SUGGESTED_SKILL_TAGS[newRole]?.slice(0, 3) || ['Reliable Transport']);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {ROLE_OPTIONS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold mb-1">
                    Listing Title: *
                  </label>
                  <input
                    type="text"
                    required
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="e.g. Sub drummer needed for RINO Room show or Merch Screenprint Designer"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                {/* Link to existing gig */}
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold mb-1">
                    Attach to Upcoming Tour Date:
                  </label>
                  <select
                    value={postGigId}
                    onChange={(e) => handleSelectGigForPost(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="">No gig attached (General Search)</option>
                    {gigs.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.title} • {g.venueName} ({new Date(g.dateTime).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Skills Chips Picker */}
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold mb-1">
                    Key Skills / Requirements:
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {postSkills.map((sk, idx) => (
                      <span key={idx} className="bg-purple-950/60 border border-purple-500/40 text-purple-300 px-2 py-0.5 rounded-lg text-xs font-mono flex items-center gap-1">
                        <span>{sk}</span>
                        <button type="button" onClick={() => handleRemoveSkillTag(sk)} className="hover:text-white">
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customSkillInput}
                      onChange={(e) => setCustomSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkillTag(customSkillInput);
                        }
                      }}
                      placeholder="Add custom tag (e.g. Double Kick, IEMs)..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSkillTag(customSkillInput)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg font-mono"
                    >
                      Add Tag
                    </button>
                  </div>
                </div>

                {/* Description + Sharon AI Draft Button */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono text-slate-300 font-bold">
                      Project Description & Expectations: *
                    </label>
                    <button
                      type="button"
                      onClick={handleAiDraftPost}
                      disabled={isAiDraftingPost}
                      className="text-[10.5px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles size={11} />
                      <span>{isAiDraftingPost ? 'Sharon is drafting...' : 'Draft with Sharon AI'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    required
                    value={postDescription}
                    onChange={(e) => setPostDescription(e.target.value)}
                    placeholder="Describe the commitment, rehearsals, song repertoire, load-in requirements, and vibe..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl p-3 text-xs text-white focus:outline-none"
                  />
                </div>

                {/* Compensation & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 font-bold mb-1">
                      Compensation Type:
                    </label>
                    <select
                      value={postCompensationType}
                      onChange={(e) => setPostCompensationType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="paid_fixed">Fixed Fee / Guarantee ($)</option>
                      <option value="door_split">Door Split %</option>
                      <option value="paid_hourly">Hourly Rate ($/hr)</option>
                      <option value="trade_credit">Merch / Portfolio Trade</option>
                      <option value="volunteer">Volunteer / Jam</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 font-bold mb-1">
                      Amount / Details:
                    </label>
                    <input
                      type="text"
                      value={postCompensationAmount}
                      onChange={(e) => setPostCompensationAmount(e.target.value)}
                      placeholder="e.g. $250 flat fee or 20% door cut"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button type="button" onClick={() => setShowPostModal(false)} className="px-4 py-2 text-xs text-slate-400 hover:text-white">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-mono rounded-xl shadow-lg shadow-purple-600/30 cursor-pointer">
                    Publish Listing
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: PITCH / APPLY TO AN OPEN REQUEST */}
      <AnimatePresence>
        {respondingToRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-purple-500/40 rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-purple-400">Collaborator Pitch</span>
                  <h3 className="text-base font-bold text-white font-display mt-0.5">
                    {respondingToRequest.title}
                  </h3>
                </div>
                <button onClick={() => setRespondingToRequest(null)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitResponse} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 font-bold mb-1">
                      Your Name / Artist Handle: *
                    </label>
                    <input
                      type="text"
                      required
                      value={responderName}
                      onChange={(e) => setResponderName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 font-bold mb-1">
                      Email Address: *
                    </label>
                    <input
                      type="email"
                      required
                      value={responderEmail}
                      onChange={(e) => setResponderEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold mb-1">
                    Audio / Portfolio / Reel Link:
                  </label>
                  <input
                    type="url"
                    value={responderPortfolio}
                    onChange={(e) => setResponderPortfolio(e.target.value)}
                    placeholder="https://instagram.com/..., spotify link, or soundcloud reel"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold mb-1">
                    Your Pitch & Experience: *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={responderPitch}
                    onChange={(e) => setResponderPitch(e.target.value)}
                    placeholder="Describe your gear setup, in-ear monitor experience, past shows in Seattle, and why you're a great fit..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl p-3 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button type="button" onClick={() => setRespondingToRequest(null)} className="px-4 py-2 text-xs text-slate-400 hover:text-white">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-mono rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer">
                    <Send size={13} />
                    <span>Submit Proposal</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 5: MANAGE RESPONSES / APPLICANTS */}
      <AnimatePresence>
        {managingRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-purple-400">Manage Responses</span>
                  <h3 className="text-base font-bold text-white font-display mt-0.5">
                    {managingRequest.title}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {managingRequest.responses?.length || 0} applicant(s)
                  </span>
                </div>
                <button onClick={() => setManagingRequest(null)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              {/* List of responses */}
              <div className="space-y-3">
                {(!managingRequest.responses || managingRequest.responses.length === 0) ? (
                  <div className="p-8 text-center text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                    <Users size={32} className="mx-auto text-slate-700 mb-2" />
                    <p className="text-xs">No responses received yet for this listing.</p>
                  </div>
                ) : (
                  managingRequest.responses.map(resp => (
                    <div
                      key={resp.id}
                      className={`p-4 rounded-xl border space-y-2.5 ${
                        resp.status === 'accepted'
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-slate-200'
                          : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-bold text-white text-xs font-display">{resp.responderName}</h5>
                          <span className="text-[10px] font-mono text-slate-400">{resp.responderEmail}</span>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                          resp.status === 'accepted'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : resp.status === 'shortlisted'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}>
                          {resp.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                        "{resp.pitchMessage}"
                      </p>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-850">
                        <button
                          onClick={() => {
                            setManagingRequest(null);
                            setActiveMessagingRequest(managingRequest);
                          }}
                          className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                        >
                          <MessageSquare size={12} />
                          <span>Open In-App Chat</span>
                        </button>

                        <div className="flex items-center gap-2">
                          {resp.status !== 'accepted' && (
                            <button
                              onClick={() => {
                                handleAcceptCollaborationAndLink(
                                  managingRequest,
                                  resp.responderArtistId,
                                  resp.responderName,
                                  resp.id
                                );
                              }}
                              className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                            >
                              <Check size={12} />
                              <span>Accept & Link</span>
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
                              className="px-2.5 py-1 bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 rounded-lg text-xs font-mono"
                            >
                              Decline
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollaborateTab;
