import React, { useState } from 'react';
import { Venue, GigOpportunity, GigApplication, Message, Artist, Gig } from '../types';
import {
  Building2,
  Calendar,
  Clock,
  DollarSign,
  Music,
  Plus,
  Send,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Search,
  Check,
  X,
  FileText,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VenuePortalTabProps {
  venues: Venue[];
  artists: Artist[];
  opportunities: GigOpportunity[];
  applications: GigApplication[];
  messages: Message[];
  onAddOpportunity: (opp: GigOpportunity) => void;
  onUpdateOpportunity: (opp: GigOpportunity) => void;
  onAddApplication: (app: GigApplication) => void;
  onUpdateApplication: (app: GigApplication) => void;
  onSendMessage: (msg: Message) => void;
  onAcceptApplicationToGig: (applicationId: string, opportunityId: string) => void;
}

export default function VenuePortalTab({
  venues,
  artists,
  opportunities,
  applications,
  messages,
  onAddOpportunity,
  onUpdateOpportunity,
  onAddApplication,
  onUpdateApplication,
  onSendMessage,
  onAcceptApplicationToGig,
}: VenuePortalTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'opportunities' | 'applications' | 'messages' | 'venues_profile'>('opportunities');
  
  // Selected perspective (Are we acting as a Venue or as an Artist?)
  const [viewMode, setViewMode] = useState<'artist' | 'venue'>('venue');
  const [selectedVenueId, setSelectedVenueId] = useState<string>(venues[0]?.id || '');
  const [selectedArtistId, setSelectedArtistId] = useState<string>(artists[0]?.id || '');

  // New Opportunity Form State
  const [showPostOppModal, setShowPostOppModal] = useState(false);
  const [oppTitle, setOppTitle] = useState('');
  const [oppDescription, setOppDescription] = useState('');
  const [oppDateTime, setOppDateTime] = useState('');
  const [oppPay, setOppPay] = useState('');
  const [oppGenre, setOppGenre] = useState('');

  // Apply to Opportunity Modal State
  const [applyingOpp, setApplyingOpp] = useState<GigOpportunity | null>(null);
  const [pitchText, setPitchText] = useState('');

  // Messaging State
  const [activeChatRecipientId, setActiveChatRecipientId] = useState<string>('');
  const [chatMessageText, setChatMessageText] = useState('');

  const currentVenue = venues.find(v => v.id === selectedVenueId) || venues[0];
  const currentArtist = artists.find(a => a.id === selectedArtistId) || artists[0];

  const handleCreateOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oppTitle.trim() || !currentVenue) return;

    const newOpp: GigOpportunity = {
      id: `opp-${Date.now()}`,
      venueId: currentVenue.id,
      venueName: currentVenue.name,
      title: oppTitle.trim(),
      description: oppDescription.trim(),
      dateTime: oppDateTime || new Date(Date.now() + 14 * 86400000).toISOString(),
      pay: oppPay.trim() || '$400 Guarantee',
      requiredGenre: oppGenre.trim() || 'Indie / Rock',
      status: 'open',
      createdAt: new Date().toISOString()
    };

    onAddOpportunity(newOpp);
    setOppTitle('');
    setOppDescription('');
    setOppDateTime('');
    setOppPay('');
    setOppGenre('');
    setShowPostOppModal(false);
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingOpp || !currentArtist) return;

    const newApp: GigApplication = {
      id: `app-${Date.now()}`,
      opportunityId: applyingOpp.id,
      artistId: currentArtist.id,
      artistName: currentArtist.name,
      artistGenre: currentArtist.genre,
      pitchText: pitchText.trim() || 'We are very interested in performing at your venue!',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    onAddApplication(newApp);

    // Also send an introductory message to the venue
    const introMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentArtist.id,
      senderName: currentArtist.name,
      senderType: 'artist',
      recipientId: applyingOpp.venueId,
      recipientName: applyingOpp.venueName,
      recipientType: 'venue',
      opportunityId: applyingOpp.id,
      messageText: `Applied for "${applyingOpp.title}": ${pitchText.trim()}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    onSendMessage(introMsg);

    setApplyingOpp(null);
    setPitchText('');
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessageText.trim() || !activeChatRecipientId) return;

    const isVenuePOV = viewMode === 'venue';
    const senderId = isVenuePOV ? currentVenue?.id : currentArtist?.id;
    const senderName = isVenuePOV ? currentVenue?.name : currentArtist?.name;
    const senderType = isVenuePOV ? 'venue' : 'artist';

    // Find recipient name
    let recipientName = 'Recipient';
    let recipientType: 'artist' | 'venue' = isVenuePOV ? 'artist' : 'venue';
    if (isVenuePOV) {
      const art = artists.find(a => a.id === activeChatRecipientId);
      if (art) recipientName = art.name;
    } else {
      const ven = venues.find(v => v.id === activeChatRecipientId);
      if (ven) recipientName = ven.name;
    }

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: senderId || 'unknown',
      senderName: senderName || 'Unknown',
      senderType: senderType,
      recipientId: activeChatRecipientId,
      recipientName: recipientName,
      recipientType: recipientType,
      messageText: chatMessageText.trim(),
      timestamp: new Date().toISOString(),
      read: false
    };

    onSendMessage(newMsg);
    setChatMessageText('');
  };

  // Filter opportunities
  const openOpportunities = opportunities.filter(o => o.status === 'open');
  const myVenueOpportunities = opportunities.filter(o => o.venueId === currentVenue?.id);
  const myApplications = applications.filter(a => a.artistId === currentArtist?.id);

  // Incoming applications for current venue's opportunities
  const venueOpportunityIds = myVenueOpportunities.map(o => o.id);
  const incomingApplications = applications.filter(a => venueOpportunityIds.includes(a.opportunityId));

  // Chat conversation list
  const currentEntityId = viewMode === 'venue' ? currentVenue?.id : currentArtist?.id;
  const entityConversations = messages.filter(
    m => m.senderId === currentEntityId || m.recipientId === currentEntityId
  );

  // Extract unique conversation partners
  const chatPartnersMap = new Map<string, { id: string; name: string; type: 'artist' | 'venue'; lastMessage: string; timestamp: string }>();
  entityConversations.forEach(m => {
    const isSender = m.senderId === currentEntityId;
    const partnerId = isSender ? m.recipientId : m.senderId;
    const partnerName = isSender ? m.recipientName : m.senderName;
    const partnerType = isSender ? m.recipientType : m.senderType;

    if (!chatPartnersMap.has(partnerId)) {
      chatPartnersMap.set(partnerId, {
        id: partnerId,
        name: partnerName,
        type: partnerType,
        lastMessage: m.messageText,
        timestamp: m.timestamp
      });
    }
  });
  const chatPartners = Array.from(chatPartnersMap.values());

  // Active chat messages
  const activeChatMessages = messages.filter(
    m =>
      (m.senderId === currentEntityId && m.recipientId === activeChatRecipientId) ||
      (m.senderId === activeChatRecipientId && m.recipientId === currentEntityId)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <div className="space-y-6 pb-12">
      {/* Header & POV switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Booking Marketplace & Messaging
            </span>
            <span className="text-xs text-slate-400">Venue & Artist Exchange</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-100 flex items-center gap-2.5">
            <Briefcase className="text-emerald-400" size={26} />
            Venue Gig Marketplace & Direct Chat
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl">
            Venues can post gig opportunities, review artist applications, and negotiate contracts. Switch perspective between Venue and Artist to test both workflows.
          </p>
        </div>

        {/* Perspective Switcher */}
        <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 pl-2">View As:</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode('venue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'venue'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Venue ({currentVenue?.name || 'Venue'})
            </button>
            <button
              type="button"
              onClick={() => setViewMode('artist')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'artist'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Artist ({currentArtist?.name || 'Artist'})
            </button>
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab('opportunities')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === 'opportunities'
              ? 'bg-slate-800 text-slate-100 border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Calendar size={14} className="text-emerald-400" />
          <span>Gig Opportunities Board</span>
          <span className="bg-slate-900 px-1.5 py-0.5 rounded-full text-[10px] text-slate-300">{openOpportunities.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('applications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === 'applications'
              ? 'bg-slate-800 text-slate-100 border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <FileText size={14} className="text-purple-400" />
          <span>
            {viewMode === 'venue' ? 'Incoming Applications' : 'My Artist Applications'}
          </span>
          <span className="bg-slate-900 px-1.5 py-0.5 rounded-full text-[10px] text-slate-300">
            {viewMode === 'venue' ? incomingApplications.length : myApplications.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('messages')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === 'messages'
              ? 'bg-slate-800 text-slate-100 border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <MessageSquare size={14} className="text-blue-400" />
          <span>Direct Messages</span>
          <span className="bg-slate-900 px-1.5 py-0.5 rounded-full text-[10px] text-slate-300">{chatPartners.length}</span>
        </button>
      </div>

      {/* SUB-TAB 1: GIG OPPORTUNITIES BOARD */}
      {activeSubTab === 'opportunities' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold font-display text-slate-100">
                {viewMode === 'venue' ? `${currentVenue?.name} - Posted Opportunities` : 'Open Gig Opportunities'}
              </h3>
              <p className="text-xs text-slate-400">
                {viewMode === 'venue' 
                  ? 'Post open slots for bands to apply, review offers, and book upcoming showcases.'
                  : 'Browse open shows posted by venues, review pay and genre requirements, and submit your pitch.'}
              </p>
            </div>

            {viewMode === 'venue' && (
              <button
                type="button"
                onClick={() => setShowPostOppModal(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/20 shrink-0"
              >
                <Plus size={16} />
                <span>Post Gig Opportunity</span>
              </button>
            )}
          </div>

          {/* List of Opportunities */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(viewMode === 'venue' ? myVenueOpportunities : openOpportunities).length === 0 ? (
              <div className="col-span-full bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-center mx-auto text-emerald-400">
                  <Calendar size={24} />
                </div>
                <h4 className="font-bold text-slate-200 text-sm">No gig opportunities available</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {viewMode === 'venue' 
                    ? 'You have not posted any gig opportunities yet. Click above to post your first show.'
                    : 'Check back soon for new venue openings or switch to venue mode to post an opportunity.'}
                </p>
              </div>
            ) : (
              (viewMode === 'venue' ? myVenueOpportunities : openOpportunities).map((opp) => (
                <motion.div
                  key={opp.id}
                  layout
                  className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                          {opp.requiredGenre}
                        </span>
                        <h4 className="text-base font-bold font-display text-slate-100 mt-1.5 group-hover:text-emerald-300 transition-colors">
                          {opp.title}
                        </h4>
                      </div>
                      <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg shrink-0">
                        {opp.pay}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Building2 size={13} className="text-emerald-400" /> {opp.venueName}
                    </p>

                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Clock size={13} className="text-purple-400" />
                      {new Date(opp.dateTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} @ {new Date(opp.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>

                    <p className="text-xs text-slate-300 line-clamp-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      {opp.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500">
                      Posted {new Date(opp.createdAt).toLocaleDateString()}
                    </span>

                    {viewMode === 'artist' && (
                      <button
                        type="button"
                        onClick={() => setApplyingOpp(opp)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-600/20"
                      >
                        Apply Now
                      </button>
                    )}

                    {viewMode === 'venue' && (
                      <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-3 py-1 rounded-lg">
                        {applications.filter(a => a.opportunityId === opp.id).length} Applicants
                      </span>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: APPLICATIONS */}
      {activeSubTab === 'applications' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold font-display text-slate-100">
              {viewMode === 'venue' ? 'Incoming Artist Applications' : 'My Artist Applications & Status'}
            </h3>
            <p className="text-xs text-slate-400">
              {viewMode === 'venue'
                ? 'Review artist pitches and portfolios. Accepting an application automatically creates a confirmed gig in your schedule.'
                : 'Track the status of your band submissions to venue showcase opportunities.'}
            </p>
          </div>

          <div className="space-y-4">
            {(viewMode === 'venue' ? incomingApplications : myApplications).length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <FileText size={28} className="mx-auto text-slate-500" />
                <h4 className="font-bold text-slate-200 text-sm">No applications found</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {viewMode === 'venue'
                    ? 'No artists have applied to your posted opportunities yet.'
                    : 'You have not submitted any applications. Browse open gigs in the Opportunities board to apply.'}
                </p>
              </div>
            ) : (
              (viewMode === 'venue' ? incomingApplications : myApplications).map((app) => {
                const opp = opportunities.find(o => o.id === app.opportunityId);
                return (
                  <div
                    key={app.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          app.status === 'accepted'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : app.status === 'declined'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {app.status.toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-400">
                          Applied on {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
                        <User size={16} className="text-purple-400" />
                        <span>{app.artistName}</span>
                        <span className="text-xs font-normal text-slate-400">({app.artistGenre})</span>
                      </h4>

                      {opp && (
                        <p className="text-xs text-emerald-400 font-semibold">
                          Applied for: {opp.title} @ {opp.venueName} ({opp.pay})
                        </p>
                      )}

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                        <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider block">Artist Pitch & Proposal</span>
                        <p>{app.pitchText}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {viewMode === 'venue' && app.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => onAcceptApplicationToGig(app.id, app.opportunityId)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                          >
                            <Check size={14} /> Accept & Book
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateApplication({ ...app, status: 'declined' });
                            }}
                            className="bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/30 font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <X size={14} /> Decline
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setActiveSubTab('messages');
                          if (viewMode === 'venue') {
                            setActiveChatRecipientId(app.artistId);
                          } else {
                            if (opp) setActiveChatRecipientId(opp.venueId);
                          }
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MessageSquare size={14} className="text-blue-400" /> Message
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DIRECT MESSAGES / CHAT */}
      {activeSubTab === 'messages' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl min-h-[500px]">
          {/* Conversation List */}
          <div className="border-r border-slate-800 p-4 space-y-3 bg-slate-950/50">
            <h3 className="font-bold font-display text-slate-200 text-sm px-2">Conversations</h3>
            <div className="space-y-1">
              {chatPartners.length === 0 ? (
                <p className="text-xs text-slate-500 px-2 py-4 text-center">No active messages yet.</p>
              ) : (
                chatPartners.map(partner => (
                  <button
                    key={partner.id}
                    type="button"
                    onClick={() => setActiveChatRecipientId(partner.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                      activeChatRecipientId === partner.id
                        ? 'bg-emerald-600/20 border border-emerald-500/40 text-slate-100'
                        : 'hover:bg-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="space-y-0.5 truncate pr-2">
                      <div className="font-bold text-xs truncate flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${partner.type === 'venue' ? 'bg-emerald-400' : 'bg-purple-400'}`} />
                        {partner.name}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{partner.lastMessage}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Active Chat Thread */}
          <div className="md:col-span-2 flex flex-col justify-between p-4 bg-slate-900/60">
            {activeChatRecipientId ? (
              <>
                <div className="border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">
                      {chatPartners.find(p => p.id === activeChatRecipientId)?.name || 'Chat Conversation'}
                    </h4>
                    <span className="text-[10px] text-emerald-400 uppercase tracking-wider">Secure Booking Channel</span>
                  </div>
                </div>

                {/* Messages Box */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4 max-h-[350px]">
                  {activeChatMessages.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-xs">
                      Send a message to start negotiating terms, stage times, and contract details.
                    </div>
                  ) : (
                    activeChatMessages.map(m => {
                      const isMe = m.senderId === currentEntityId;
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <span className="text-[10px] text-slate-500 mb-0.5 px-1">{m.senderName}</span>
                          <div
                            className={`max-w-md p-3 rounded-2xl text-xs ${
                              isMe
                                ? 'bg-emerald-600 text-white rounded-br-none shadow-md'
                                : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                            }`}
                          >
                            <p>{m.messageText}</p>
                            <span className={`text-[9px] block mt-1 text-right ${isMe ? 'text-emerald-200' : 'text-slate-400'}`}>
                              {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Send Message Input */}
                <form onSubmit={handleSendChatMessage} className="flex items-center gap-2 pt-3 border-t border-slate-800">
                  <input
                    type="text"
                    required
                    placeholder="Type message regarding set times, guarantees, or riders..."
                    value={chatMessageText}
                    onChange={(e) => setChatMessageText(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-20 text-slate-500 space-y-2">
                <MessageSquare size={32} className="text-slate-600" />
                <p className="text-xs">Select a conversation on the left to view messages.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* POST OPPORTUNITY MODAL */}
      <AnimatePresence>
        {showPostOppModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-emerald-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative my-8 text-slate-200"
            >
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-100">Post Gig Opportunity</h3>
                  <p className="text-xs text-slate-400">Post an open performance slot for {currentVenue?.name}.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPostOppModal(false)}
                  className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateOpportunity} className="space-y-4 pt-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Opportunity Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Friday Night Rock Showcase"
                    value={oppTitle}
                    onChange={(e) => setOppTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1">Date & Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={oppDateTime}
                      onChange={(e) => setOppDateTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1">Pay / Guarantee *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., $600 + Merch Split"
                      value={oppPay}
                      onChange={(e) => setOppPay(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Required Genre *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Indie Rock / Alternative"
                    value={oppGenre}
                    onChange={(e) => setOppGenre(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Description & Requirements *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Set length, backline info, local draw expectations..."
                    value={oppDescription}
                    onChange={(e) => setOppDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowPostOppModal(false)}
                    className="bg-slate-950 hover:bg-slate-800 text-slate-400 px-4 py-2 rounded-xl font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
                  >
                    Publish Opportunity
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* APPLY TO OPPORTUNITY MODAL */}
      <AnimatePresence>
        {applyingOpp && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-emerald-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative my-8 text-slate-200"
            >
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-100">Submit Artist Application</h3>
                  <p className="text-xs text-slate-400">Applying as <strong className="text-emerald-400">{currentArtist?.name}</strong> to <strong className="text-slate-200">{applyingOpp.venueName}</strong></p>
                </div>
                <button
                  type="button"
                  onClick={() => setApplyingOpp(null)}
                  className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleApplySubmit} className="space-y-4 pt-4 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <h4 className="font-bold text-slate-200">{applyingOpp.title}</h4>
                  <p className="text-slate-400">{applyingOpp.venueName} — {applyingOpp.pay}</p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Pitch / Cover Message *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Highlight your recent shows, streaming numbers, fan draw, and why you are a great fit..."
                    value={pitchText}
                    onChange={(e) => setPitchText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setApplyingOpp(null)}
                    className="bg-slate-950 hover:bg-slate-800 text-slate-400 px-4 py-2 rounded-xl font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
                  >
                    Submit Pitch & Message
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
