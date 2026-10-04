import React, { useState } from 'react';
import { 
  Gig, 
  Artist, 
  GigStatus, 
  GigPromoChecklist, 
  Setlist, 
  VenueSearchData, 
  Venue,
  EventType,
  RehearsalDetails,
  RecordingDetails,
  MeetingDetails
} from '../types';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  DollarSign, 
  Plus, 
  FileText, 
  CheckCircle2, 
  ChevronRight, 
  AlertCircle, 
  ExternalLink, 
  Filter, 
  Trash2, 
  Edit2, 
  Download, 
  Package, 
  ShoppingBag, 
  Check, 
  Copy, 
  AlertTriangle, 
  Sparkles, 
  X, 
  Globe, 
  Sliders, 
  Volume2, 
  Building2,
  Music,
  Disc,
  Mic2,
  Users,
  Video,
  Target,
  Wrench,
  ListOrdered,
  CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CalendarView, { EVENT_TYPE_CONFIG } from './CalendarView';
import VenueSearchModal from './VenueSearchModal';

interface GigsTabProps {
  gigs: Gig[];
  artists: Artist[];
  setlists: Setlist[];
  venues?: Venue[];
  selectedArtistId: string;
  onAddGig: (gig: Gig) => void;
  onUpdateGig: (gig: Gig) => void;
  onDeleteGig: (gigId: string) => void;
  onNavigateToTab?: (tabId: string) => void;
}

const MERCH_SUPPLY_ITEMS = [
  { key: 'tshirts', label: 'T-Shirts (S, M, L, XL, 2XL)', category: 'Apparel', desc: 'Confirm size distribution stacks and clean folding in plastic bins' },
  { key: 'hoodies', label: 'Band Hoodies & Longsleeves', category: 'Apparel', desc: 'High-margin item for cool outdoor or late-night venues' },
  { key: 'vinyls', label: 'Vinyl Records & CD Digipaks', category: 'Physical Media', desc: 'Bring sharpies for after-show album signing sessions' },
  { key: 'stickers', label: 'Stickers, Pins & Guitar Picks', category: 'Accessories', desc: 'Low-cost impulse add-ons at point of sale' },
  { key: 'cardReader', label: 'Card Reader (Square/Stripe)', category: 'Hardware', desc: 'Ensure reader is 100% charged with backup lightning/USB cable' },
  { key: 'cashFloat', label: '$100 Cash Float & Change Box', category: 'Finance', desc: 'Tens, fives, and ones for frictionless cash sales' },
  { key: 'tableLighting', label: 'Display Lights & QR Pay Sign', category: 'Hardware', desc: 'Tablecloth, price sheet sign, and Venmo/CashApp QR stand' },
];

export default function GigsTab({
  gigs,
  artists,
  setlists,
  venues,
  selectedArtistId,
  onAddGig,
  onUpdateGig,
  onDeleteGig,
  onNavigateToTab
}: GigsTabProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEventType, setFilterEventType] = useState<'all' | EventType>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGig, setSelectedGig] = useState<Gig | null>(gigs[0] || null);

  // Merch Stock Modal State
  const [merchModalGig, setMerchModalGig] = useState<Gig | null>(null);
  const [merchNotesInput, setMerchNotesInput] = useState<string>('');
  const [merchStatusInput, setMerchStatusInput] = useState<'ready' | 'check_needed' | 'low_stock'>('check_needed');
  const [merchChecklistState, setMerchChecklistState] = useState<Record<string, boolean>>({});
  const [copiedPackingSheet, setCopiedPackingSheet] = useState(false);

  // Google Search Grounded Venue Search Modal State
  const [showVenueSearchModal, setShowVenueSearchModal] = useState(false);
  const [venueSearchTarget, setVenueSearchTarget] = useState<'add' | 'edit' | 'detail'>('add');
  const [venueSearchInitialQuery, setVenueSearchInitialQuery] = useState('');

  const handleOpenVenueSearch = (target: 'add' | 'edit' | 'detail', initialQuery?: string) => {
    setVenueSearchTarget(target);
    setVenueSearchInitialQuery(initialQuery || (target === 'add' ? formVenueName : target === 'edit' ? editVenueName : selectedGig?.venueName || ''));
    setShowVenueSearchModal(true);
  };

  const handleApplyVenueData = (data: {
    venueName?: string;
    address?: string;
    notesToAppend?: string;
    fullVenueData?: VenueSearchData;
  }) => {
    if (venueSearchTarget === 'add') {
      if (data.venueName) setFormVenueName(data.venueName);
      if (data.address) setFormVenueAddress(data.address);
      if (data.notesToAppend) {
        setFormNotes(prev => prev ? `${prev}\n\n${data.notesToAppend}` : (data.notesToAppend || ''));
      }
    } else if (venueSearchTarget === 'edit') {
      if (data.venueName) setEditVenueName(data.venueName);
      if (data.address) setEditVenueAddress(data.address);
      if (data.notesToAppend) {
        setEditNotes(prev => prev ? `${prev}\n\n${data.notesToAppend}` : (data.notesToAppend || ''));
      }
    } else if (venueSearchTarget === 'detail' && selectedGig) {
      const updatedGig: Gig = {
        ...selectedGig,
        venueName: data.venueName || selectedGig.venueName,
        venueAddress: data.address || selectedGig.venueAddress,
        notes: data.notesToAppend ? (selectedGig.notes ? `${selectedGig.notes}\n\n${data.notesToAppend}` : data.notesToAppend) : selectedGig.notes,
        venueData: data.fullVenueData || selectedGig.venueData,
      };
      onUpdateGig(updatedGig);
      setSelectedGig(updatedGig);
    }
  };

  // Form State
  const [formEventType, setFormEventType] = useState<EventType>('gig');
  const [formTitle, setFormTitle] = useState('');
  const [formVenueName, setFormVenueName] = useState('');
  const [formVenueAddress, setFormVenueAddress] = useState('');
  const [formDateTime, setFormDateTime] = useState('');
  const [formDuration, setFormDuration] = useState('90');
  const [formTicketPrice, setFormTicketPrice] = useState('10');
  const [formTicketUrl, setFormTicketUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formStatus, setFormStatus] = useState<GigStatus>('confirmed');

  // Rehearsal-specific form state
  const [formRehearsalRoom, setFormRehearsalRoom] = useState('');
  const [formRehearsalFocusSongs, setFormRehearsalFocusSongs] = useState('');
  const [formRehearsalGear, setFormRehearsalGear] = useState('');
  const [formRehearsalObjectives, setFormRehearsalObjectives] = useState('');

  // Recording-specific form state
  const [formRecordingStudio, setFormRecordingStudio] = useState('');
  const [formRecordingEngineer, setFormRecordingEngineer] = useState('');
  const [formRecordingTracks, setFormRecordingTracks] = useState('');
  const [formRecordingRate, setFormRecordingRate] = useState('75');
  const [formRecordingGoal, setFormRecordingGoal] = useState('');

  // Meeting-specific form state
  const [formMeetingFormat, setFormMeetingFormat] = useState<'in_person' | 'video_call'>('video_call');
  const [formMeetingLink, setFormMeetingLink] = useState('');
  const [formMeetingAgenda, setFormMeetingAgenda] = useState('');
  const [formMeetingActionItems, setFormMeetingActionItems] = useState('');
  const [formMeetingDecisions, setFormMeetingDecisions] = useState('');

  // Edit Form State
  const [editEventType, setEditEventType] = useState<EventType>('gig');
  const [editTitle, setEditTitle] = useState('');
  const [editVenueName, setEditVenueName] = useState('');
  const [editVenueAddress, setEditVenueAddress] = useState('');
  const [editDateTime, setEditDateTime] = useState('');
  const [editDuration, setEditDuration] = useState('90');
  const [editTicketPrice, setEditTicketPrice] = useState('10');
  const [editTicketUrl, setEditTicketUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Edit specific details
  const [editRehearsalRoom, setEditRehearsalRoom] = useState('');
  const [editRehearsalFocusSongs, setEditRehearsalFocusSongs] = useState('');
  const [editRehearsalGear, setEditRehearsalGear] = useState('');
  const [editRehearsalObjectives, setEditRehearsalObjectives] = useState('');

  const [editRecordingStudio, setEditRecordingStudio] = useState('');
  const [editRecordingEngineer, setEditRecordingEngineer] = useState('');
  const [editRecordingTracks, setEditRecordingTracks] = useState('');
  const [editRecordingRate, setEditRecordingRate] = useState('75');
  const [editRecordingGoal, setEditRecordingGoal] = useState('');

  const [editMeetingFormat, setEditMeetingFormat] = useState<'in_person' | 'video_call'>('video_call');
  const [editMeetingLink, setEditMeetingLink] = useState('');
  const [editMeetingAgenda, setEditMeetingAgenda] = useState('');
  const [editMeetingActionItems, setEditMeetingActionItems] = useState('');
  const [editMeetingDecisions, setEditMeetingDecisions] = useState('');

  const handleOpenEditModal = (gig: Gig) => {
    setEditEventType(gig.eventType || 'gig');
    setEditTitle(gig.title);
    setEditVenueName(gig.venueName);
    setEditVenueAddress(gig.venueAddress);
    setEditDateTime(gig.dateTime);
    setEditDuration(gig.durationMinutes.toString());
    setEditTicketPrice(gig.ticketPrice.toString());
    setEditTicketUrl(gig.ticketUrl || '');
    setEditDescription(gig.description || '');
    setEditNotes(gig.notes || '');

    // Rehearsal details
    setEditRehearsalRoom(gig.rehearsalDetails?.roomStudio || '');
    setEditRehearsalFocusSongs(gig.rehearsalDetails?.focusSongs?.join(', ') || '');
    setEditRehearsalGear(gig.rehearsalDetails?.equipmentToBring?.join(', ') || '');
    setEditRehearsalObjectives(gig.rehearsalDetails?.objectives || '');

    // Recording details
    setEditRecordingStudio(gig.recordingDetails?.studioName || '');
    setEditRecordingEngineer(gig.recordingDetails?.engineerName || '');
    setEditRecordingTracks(gig.recordingDetails?.tracksToRecord?.join(', ') || '');
    setEditRecordingRate(gig.recordingDetails?.hourlyRate?.toString() || '75');
    setEditRecordingGoal(gig.recordingDetails?.sessionGoal || '');

    // Meeting details
    setEditMeetingFormat(gig.meetingDetails?.locationType || 'video_call');
    setEditMeetingLink(gig.meetingDetails?.meetingLink || '');
    setEditMeetingAgenda(gig.meetingDetails?.agendaItems?.join('\n') || '');
    setEditMeetingActionItems(gig.meetingDetails?.actionItems?.join('\n') || '');
    setEditMeetingDecisions(gig.meetingDetails?.decisions || '');

    setShowEditModal(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGig || !editTitle) return;

    const rehearsalDetails: RehearsalDetails | undefined = editEventType === 'rehearsal' ? {
      roomStudio: editRehearsalRoom || undefined,
      focusSongs: editRehearsalFocusSongs.split(',').map(s => s.trim()).filter(Boolean),
      equipmentToBring: editRehearsalGear.split(',').map(s => s.trim()).filter(Boolean),
      objectives: editRehearsalObjectives || undefined,
    } : undefined;

    const recordingDetails: RecordingDetails | undefined = editEventType === 'recording' ? {
      studioName: editRecordingStudio || editVenueName,
      engineerName: editRecordingEngineer || undefined,
      tracksToRecord: editRecordingTracks.split(',').map(s => s.trim()).filter(Boolean),
      hourlyRate: parseFloat(editRecordingRate) || undefined,
      sessionGoal: editRecordingGoal || undefined,
    } : undefined;

    const meetingDetails: MeetingDetails | undefined = editEventType === 'meeting' ? {
      locationType: editMeetingFormat,
      meetingLink: editMeetingLink || undefined,
      agendaItems: editMeetingAgenda.split('\n').map(s => s.trim()).filter(Boolean),
      actionItems: editMeetingActionItems.split('\n').map(s => s.trim()).filter(Boolean),
      decisions: editMeetingDecisions || undefined,
    } : undefined;

    const updatedGig: Gig = {
      ...selectedGig,
      eventType: editEventType,
      title: editTitle,
      venueName: editVenueName,
      venueAddress: editVenueAddress,
      dateTime: editDateTime,
      durationMinutes: parseInt(editDuration) || 90,
      ticketPrice: parseFloat(editTicketPrice) || 0,
      ticketUrl: editTicketUrl,
      description: editDescription,
      notes: editNotes,
      rehearsalDetails,
      recordingDetails,
      meetingDetails,
    };

    onUpdateGig(updatedGig);
    setSelectedGig(updatedGig);
    setShowEditModal(false);
  };


  const handleOpenMerchModal = (gig: Gig) => {
    setMerchModalGig(gig);
    setMerchNotesInput(gig.merchStockNotes || '');
    setMerchStatusInput(gig.merchStockStatus || 'check_needed');
    setMerchChecklistState(gig.merchChecklist || {
      tshirts: false,
      hoodies: false,
      vinyls: false,
      stickers: false,
      cardReader: false,
      cashFloat: false,
      tableLighting: false,
    });
  };

  const handleSaveMerchModal = () => {
    if (!merchModalGig) return;
    const updatedGig: Gig = {
      ...merchModalGig,
      merchStockStatus: merchStatusInput,
      merchStockNotes: merchNotesInput,
      merchChecklist: merchChecklistState,
    };

    onUpdateGig(updatedGig);
    if (selectedGig?.id === merchModalGig.id) {
      setSelectedGig(updatedGig);
    }
    setMerchModalGig(null);
  };

  const handleToggleMerchCheckItem = (key: string) => {
    setMerchChecklistState(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleCopyPackingSheet = (gig: Gig) => {
    const band = artists.find(a => a.id === gig.artistId);
    const dateFormatted = new Date(gig.dateTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    const lines = [
      `📦 BAND AIDE MERCH STOCK & PACKING CHECKLIST`,
      `==========================================`,
      `Event: ${gig.title}`,
      `Artist: ${band?.name || 'Band'}`,
      `Venue: ${gig.venueName} (${gig.venueAddress || 'Local Venue'})`,
      `Date & Time: ${dateFormatted} @ ${new Date(gig.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      `Stock Status: ${merchStatusInput === 'ready' ? '✅ Packed & Ready' : merchStatusInput === 'low_stock' ? '⚠️ Low Stock Alert' : '📋 Check in Progress'}`,
      `------------------------------------------`,
      `SUPPLY PACKING ITEMS:`,
      ...MERCH_SUPPLY_ITEMS.map(item => `[${merchChecklistState[item.key] ? 'X' : ' '}] ${item.label} (${item.category})`),
      `------------------------------------------`,
      `EVENT INVENTORY & LOGISTICS NOTES:`,
      merchNotesInput ? merchNotesInput : 'No special instructions recorded.',
      `==========================================`,
      `Generated by Band Aide OS (${new Date().toLocaleDateString()})`
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedPackingSheet(true);
    setTimeout(() => setCopiedPackingSheet(false), 2500);
  };

  // Filter gigs by artist, status, and eventType
  const filteredGigs = gigs.filter((gig) => {
    const matchesArtist = selectedArtistId === 'all' || gig.artistId === selectedArtistId || (gig.collaboratorArtistIds && gig.collaboratorArtistIds.includes(selectedArtistId));
    const matchesStatus = filterStatus === 'all' || gig.status === filterStatus;
    const matchesType = filterEventType === 'all' || (gig.eventType || 'gig') === filterEventType;
    return matchesArtist && matchesStatus && matchesType;
  });

  const handleToggleChecklist = (gig: Gig, field: keyof Gig['promoChecklist']) => {
    const updatedGig: Gig = {
      ...gig,
      promoChecklist: {
        ...gig.promoChecklist,
        [field]: !gig.promoChecklist[field]
      }
    };
    onUpdateGig(updatedGig);
    if (selectedGig?.id === gig.id) {
      setSelectedGig(updatedGig);
    }
  };

  const handleToggleRehearsalGear = (gig: Gig, gearItem: string) => {
    if (!gig.rehearsalDetails) return;
    const currentGear = gig.rehearsalDetails.equipmentToBring || [];
    // Toggle prefix [x]
    const hasChecked = currentGear.includes(`[x] ${gearItem}`) || currentGear.includes(`✓ ${gearItem}`);
    let updatedList: string[];
    if (hasChecked) {
      updatedList = currentGear.map(g => (g === `[x] ${gearItem}` || g === `✓ ${gearItem}`) ? gearItem : g);
    } else {
      updatedList = currentGear.map(g => g === gearItem ? `✓ ${gearItem}` : g);
    }
    const updatedGig: Gig = {
      ...gig,
      rehearsalDetails: {
        ...gig.rehearsalDetails,
        equipmentToBring: updatedList
      }
    };
    onUpdateGig(updatedGig);
    if (selectedGig?.id === gig.id) {
      setSelectedGig(updatedGig);
    }
  };

  const handleStatusChange = (gig: Gig, status: GigStatus) => {
    const updatedGig: Gig = { ...gig, status };
    onUpdateGig(updatedGig);
    if (selectedGig?.id === gig.id) {
      setSelectedGig(updatedGig);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formDateTime) return;

    // Use selected band as artistId, or default to first if 'all' is selected
    const artistId = selectedArtistId === 'all' ? (artists[0]?.id || '') : selectedArtistId;

    const rehearsalDetails: RehearsalDetails | undefined = formEventType === 'rehearsal' ? {
      roomStudio: formRehearsalRoom || formVenueName || undefined,
      focusSongs: formRehearsalFocusSongs.split(',').map(s => s.trim()).filter(Boolean),
      equipmentToBring: formRehearsalGear.split(',').map(s => s.trim()).filter(Boolean),
      objectives: formRehearsalObjectives || undefined,
    } : undefined;

    const recordingDetails: RecordingDetails | undefined = formEventType === 'recording' ? {
      studioName: formRecordingStudio || formVenueName,
      engineerName: formRecordingEngineer || undefined,
      tracksToRecord: formRecordingTracks.split(',').map(s => s.trim()).filter(Boolean),
      hourlyRate: parseFloat(formRecordingRate) || 75,
      sessionGoal: formRecordingGoal || undefined,
    } : undefined;

    const meetingDetails: MeetingDetails | undefined = formEventType === 'meeting' ? {
      locationType: formMeetingFormat,
      meetingLink: formMeetingLink || undefined,
      agendaItems: formMeetingAgenda.split('\n').map(s => s.trim()).filter(Boolean),
      actionItems: formMeetingActionItems.split('\n').map(s => s.trim()).filter(Boolean),
      decisions: formMeetingDecisions || undefined,
    } : undefined;

    const newGig: Gig = {
      id: `gig-${Date.now()}`,
      eventType: formEventType,
      title: formTitle,
      artistId,
      venueName: formEventType === 'rehearsal' ? (formRehearsalRoom || formVenueName || 'Rehearsal Studio') :
                 formEventType === 'recording' ? (formRecordingStudio || formVenueName || 'Recording Studio') :
                 formEventType === 'meeting' ? (formMeetingFormat === 'video_call' ? 'Video Conference (Online)' : (formVenueName || 'Band HQ / Meeting Room')) :
                 formVenueName,
      venueAddress: formVenueAddress,
      dateTime: formDateTime,
      durationMinutes: parseInt(formDuration) || 90,
      ticketPrice: formEventType === 'gig' ? (parseFloat(formTicketPrice) || 0) : 0,
      ticketUrl: formEventType === 'gig' ? formTicketUrl : (formEventType === 'meeting' ? formMeetingLink : undefined),
      description: formDescription,
      status: formStatus,
      notes: formNotes,
      rehearsalDetails,
      recordingDetails,
      meetingDetails,
      promoChecklist: {
        pressRelease: false,
        socialPost: false,
        flyerDistributed: false,
        outreachCompleted: false,
        ticketsLive: !!formTicketUrl
      }
    };

    onAddGig(newGig);
    setSelectedGig(newGig);
    setShowAddModal(false);

    // Reset Form
    setFormEventType('gig');
    setFormTitle('');
    setFormVenueName('');
    setFormVenueAddress('');
    setFormDateTime('');
    setFormDuration('90');
    setFormTicketPrice('10');
    setFormTicketUrl('');
    setFormDescription('');
    setFormNotes('');
    setFormStatus('confirmed');
    setFormRehearsalRoom('');
    setFormRehearsalFocusSongs('');
    setFormRehearsalGear('');
    setFormRehearsalObjectives('');
    setFormRecordingStudio('');
    setFormRecordingEngineer('');
    setFormRecordingTracks('');
    setFormRecordingRate('75');
    setFormRecordingGoal('');
    setFormMeetingFormat('video_call');
    setFormMeetingLink('');
    setFormMeetingAgenda('');
    setFormMeetingActionItems('');
    setFormMeetingDecisions('');
  };

  const handleExportCSV = () => {
    if (filteredGigs.length === 0) return;

    const headers = [
      'Event ID',
      'Event Type',
      'Event Name',
      'Artist / Band',
      'Status',
      'Date & Time',
      'Duration (Mins)',
      'Location / Venue',
      'Address',
      'Ticket Price ($)',
      'Ticket / Meeting URL',
      'Description',
      'Notes'
    ];

    const escapeCSV = (val: string | number | undefined | null) => {
      if (val === undefined || val === null) return '""';
      const stringVal = String(val);
      return `"${stringVal.replace(/"/g, '""')}"`;
    };

    const rows = filteredGigs.map(gig => {
      const band = artists.find(a => a.id === gig.artistId);
      const eventType = gig.eventType || 'gig';
      return [
        escapeCSV(gig.id),
        escapeCSV(eventType.toUpperCase()),
        escapeCSV(gig.title),
        escapeCSV(band?.name || 'Unknown Artist'),
        escapeCSV(gig.status),
        escapeCSV(new Date(gig.dateTime).toLocaleString()),
        escapeCSV(gig.durationMinutes),
        escapeCSV(gig.venueName),
        escapeCSV(gig.venueAddress),
        escapeCSV(gig.ticketPrice),
        escapeCSV(gig.ticketUrl || (gig.meetingDetails?.meetingLink) || ''),
        escapeCSV(gig.description || ''),
        escapeCSV(gig.notes || '')
      ].join(',');
    });

    const csvString = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const activeArtistName = artists.find(a => a.id === selectedArtistId)?.name || 'Artist';
    const artistLabel = selectedArtistId === 'all' ? 'All_Artists' : activeArtistName.replace(/\s+/g, '_');
    const filterLabel = filterEventType !== 'all' ? filterEventType : filterStatus.toLowerCase();
    const filename = `Events_${artistLabel}_${filterLabel}_${new Date().toISOString().slice(0, 10)}.csv`;

    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const activeArtist = artists.find(a => a.id === selectedArtistId);

  // Event type counters
  const totalEventsCount = gigs.filter(g => selectedArtistId === 'all' || g.artistId === selectedArtistId).length;
  const countGigs = gigs.filter(g => (selectedArtistId === 'all' || g.artistId === selectedArtistId) && (g.eventType || 'gig') === 'gig').length;
  const countRehearsals = gigs.filter(g => (selectedArtistId === 'all' || g.artistId === selectedArtistId) && g.eventType === 'rehearsal').length;
  const countRecordings = gigs.filter(g => (selectedArtistId === 'all' || g.artistId === selectedArtistId) && g.eventType === 'recording').length;
  const countMeetings = gigs.filter(g => (selectedArtistId === 'all' || g.artistId === selectedArtistId) && g.eventType === 'meeting').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="gigs-tab-root">
      {/* Sidebar - Gig List */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="bg-slate-900/60 backdrop-blur-md border border-purple-500/10 rounded-2xl p-5 flex flex-col gap-4 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="text-purple-400" size={18} />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Schedule Hub</span>
              <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                {filteredGigs.length} {filteredGigs.length === 1 ? 'Event' : 'Events'}
              </span>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex bg-slate-950 rounded-xl border border-slate-800 p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${viewMode === 'list' ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30' : 'text-slate-400 hover:text-slate-200'}`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${viewMode === 'calendar' ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Calendar
              </button>
            </div>
          </div>

          {/* Event Type Filter Pills */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setFilterEventType('all')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                filterEventType === 'all'
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              All ({totalEventsCount})
            </button>
            <button
              onClick={() => setFilterEventType('gig')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                filterEventType === 'gig'
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                  : 'text-slate-400 hover:text-purple-300 hover:bg-slate-900'
              }`}
            >
              <Music size={11} />
              <span>Gigs ({countGigs})</span>
            </button>
            <button
              onClick={() => setFilterEventType('rehearsal')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                filterEventType === 'rehearsal'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-900'
              }`}
            >
              <Disc size={11} />
              <span>Rehearsals ({countRehearsals})</span>
            </button>
            <button
              onClick={() => setFilterEventType('recording')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                filterEventType === 'recording'
                  ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900'
              }`}
            >
              <Mic2 size={11} />
              <span>Studio ({countRecordings})</span>
            </button>
            <button
              onClick={() => setFilterEventType('meeting')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                filterEventType === 'meeting'
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                  : 'text-slate-400 hover:text-sky-300 hover:bg-slate-900'
              }`}
            >
              <Users size={11} />
              <span>Meetings ({countMeetings})</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500/40 font-bold flex-1"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="draft">Drafts</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button
              onClick={handleExportCSV}
              disabled={filteredGigs.length === 0}
              title="Export filtered view of schedule events to downloadable CSV"
              className="bg-slate-950 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-emerald-400 font-bold px-3 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-emerald-500/30 shadow-sm shrink-0"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-purple-600 hover:bg-purple-500 active:translate-y-0.5 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-purple-600/15 transition-all border border-purple-500/20 shrink-0"
            >
              <Plus size={14} />
              <span>Schedule Event</span>
            </button>
          </div>
        </div>

        {/* Gig List or Calendar View */}
        <div className="overflow-y-auto max-h-[700px] pr-2">
          {viewMode === 'list' ? (
            <div className="space-y-4">
              {filteredGigs.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800 border-dashed rounded-2xl p-10 text-center text-slate-500">
                  <Calendar className="mx-auto text-slate-600 mb-4" size={40} />
                  <p className="text-sm">No events found matching filters.</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 text-purple-400 text-xs font-semibold hover:underline"
                  >
                    Schedule an event now
                  </button>
                </div>
              ) : (
                filteredGigs.map((gig) => {
                  const band = artists.find(a => a.id === gig.artistId);
                  const gigDate = new Date(gig.dateTime);
                  const isSelected = selectedGig?.id === gig.id;
                  const eventType: EventType = gig.eventType || 'gig';
                  const typeConfig = EVENT_TYPE_CONFIG[eventType] || EVENT_TYPE_CONFIG.gig;
                  const TypeIcon = typeConfig.icon;
                  
                  // Calculate critical completeness for gigs
                  const hasVenue = gig.venueName && gig.venueName.trim() !== '' && 
                                   gig.venueName.toUpperCase() !== 'TBA' && 
                                   gig.venueName.toUpperCase() !== 'TO BE ANNOUNCED' && 
                                   gig.venueName.toUpperCase() !== 'PENDING';
                  const hasSetlist = setlists.some((s) => s.gigId === gig.id && s.songs && s.songs.length > 0);
                  const isMissingInfo = eventType === 'gig' && (!hasVenue || !hasSetlist);
                  
                  // Calculate checklist progress
                  const totalTasks = 5;
                  const completedTasks = Object.values(gig.promoChecklist).filter(Boolean).length;
                  const progressPct = Math.round((completedTasks / totalTasks) * 100);

                  return (
                    <motion.div
                      key={gig.id}
                      onClick={() => setSelectedGig(gig)}
                      className={`border p-6 rounded-2xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-purple-600/10 border-purple-500 shadow-lg shadow-purple-500/10'
                          : 'bg-slate-900/50 hover:bg-slate-800/50 border-slate-800/80'
                      }`}
                      whileHover={{ y: -2 }}
                      layoutId={`gig-card-${gig.id}`}
                    >
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {/* Event Type Badge */}
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${typeConfig.colorClasses.badgeBg}`}>
                              <TypeIcon size={10} />
                              <span>{typeConfig.badgeLabel}</span>
                            </span>

                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                              {gig.status}
                            </span>

                            {gig.coBillArtistNames && gig.coBillArtistNames.length > 0 && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/30">
                                <Users size={10} />
                                <span>Co-bill: {gig.coBillArtistNames.join(', ')}</span>
                              </span>
                            )}

                            {/* Merch Stock Alert Badge for Gigs */}
                            {eventType === 'gig' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenMerchModal(gig);
                                }}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                                  gig.merchStockStatus === 'ready'
                                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                                    : gig.merchStockStatus === 'low_stock'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 animate-pulse'
                                    : 'bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25'
                                }`}
                                title="Click to check merch stock & supply checklist for this event"
                              >
                                <Package size={11} className={gig.merchStockStatus === 'low_stock' ? 'text-amber-400' : 'text-purple-300'} />
                                <span>
                                  {gig.merchStockStatus === 'ready'
                                    ? 'Merch: Ready'
                                    : gig.merchStockStatus === 'low_stock'
                                    ? '⚠️ Merch: Low'
                                    : 'Merch Alert'}
                                </span>
                              </button>
                            )}

                            {isMissingInfo && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/25 animate-pulse" title="Missing critical info (venue or setlist)">
                                <AlertCircle size={10} />
                                <span>Missing Info</span>
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-slate-100 text-lg group-hover:text-purple-400 transition-colors">
                            {gig.title}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1">
                            {band?.name} • {band?.genre}
                          </p>
                        </div>
                        <ChevronRight size={20} className={`text-slate-500 self-center transition-transform ${isSelected ? 'translate-x-1 text-purple-400' : ''}`} />
                      </div>

                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-slate-400 pt-4 border-t border-slate-800/60 mt-2">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-500" />
                          <span>{gigDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-slate-500" />
                          <span>{gigDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({gig.durationMinutes}m)</span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                          {eventType === 'gig' ? (
                            <MapPin size={14} className="text-purple-400 shrink-0" />
                          ) : eventType === 'rehearsal' ? (
                            <Disc size={14} className="text-emerald-400 shrink-0" />
                          ) : eventType === 'recording' ? (
                            <Mic2 size={14} className="text-amber-400 shrink-0" />
                          ) : (
                            <Users size={14} className="text-sky-400 shrink-0" />
                          )}
                          <span className="truncate text-slate-300 font-medium">
                            {eventType === 'rehearsal' && gig.rehearsalDetails?.roomStudio ? gig.rehearsalDetails.roomStudio :
                             eventType === 'recording' && gig.recordingDetails?.studioName ? gig.recordingDetails.studioName :
                             eventType === 'meeting' && gig.meetingDetails?.locationType === 'video_call' ? 'Video Conference (Online)' :
                             gig.venueName}
                          </span>
                        </div>
                      </div>

                      {/* Event Type Specific Highlights */}
                      {eventType === 'gig' && (
                        <div className="mt-4 pt-3 border-t border-slate-800/40">
                          <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
                            <span>Promo Campaign</span>
                            <span className={progressPct === 100 ? 'text-purple-400 font-medium' : 'text-slate-300'}>
                              {completedTasks}/{totalTasks} ({progressPct}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300 bg-purple-500"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {eventType === 'rehearsal' && gig.rehearsalDetails && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                          <span className="text-emerald-300 font-semibold flex items-center gap-1">
                            <Disc size={12} />
                            <span>{gig.rehearsalDetails.focusSongs?.length || 0} Focus Songs</span>
                          </span>
                          <span className="text-slate-400 font-mono text-[10px]">
                            {gig.rehearsalDetails.equipmentToBring?.length || 0} Gear Items
                          </span>
                        </div>
                      )}

                      {eventType === 'recording' && gig.recordingDetails && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                          <span className="text-amber-300 font-semibold flex items-center gap-1">
                            <Mic2 size={12} />
                            <span>{gig.recordingDetails.tracksToRecord?.length || 0} Tracks to Track</span>
                          </span>
                          {gig.recordingDetails.engineerName && (
                            <span className="text-slate-400 text-[10px]">
                              Eng: {gig.recordingDetails.engineerName}
                            </span>
                          )}
                        </div>
                      )}

                      {eventType === 'meeting' && gig.meetingDetails && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                          <span className="text-sky-300 font-semibold flex items-center gap-1">
                            <Users size={12} />
                            <span>{gig.meetingDetails.agendaItems?.length || 0} Agenda Topics</span>
                          </span>
                          <span className="text-slate-400 text-[10px] uppercase font-mono">
                            {gig.meetingDetails.locationType === 'video_call' ? 'Online Call' : 'In Person'}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          ) : (
            <CalendarView 
              gigs={filteredGigs} 
              onSelectGig={setSelectedGig} 
              selectedGig={selectedGig} 
              onQuickAddDate={(dt) => {
                setFormDateTime(dt);
                setShowAddModal(true);
              }}
            />
          )}
        </div>
      </div>


      {/* Main Panel - Gig Details Workspace */}
      <div className="lg:col-span-7">
        <AnimatePresence mode="wait">
          {selectedGig ? (
            <motion.div
              key={selectedGig.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative overflow-hidden bg-slate-900/40 border border-purple-500/20 rounded-2xl p-8 flex flex-col gap-8 shadow-2xl"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none" 
                style={{ 
                  backgroundImage: (selectedGig.eventType || 'gig') === 'gig'
                    ? "url('/src/assets/images/concert_stage_header_1788820340861.jpg')" 
                    : "url('/src/assets/images/venue_backstage_header_1788820358944.jpg')" 
                }} 
              />
              
              {/* Header */}
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    {(() => {
                      const eventType = selectedGig.eventType || 'gig';
                      const config = EVENT_TYPE_CONFIG[eventType] || EVENT_TYPE_CONFIG.gig;
                      const Icon = config.icon;
                      return (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${config.colorClasses.badgeBg}`}>
                          <Icon size={12} />
                          <span>{config.badgeLabel}</span>
                        </span>
                      );
                    })()}
                    <span className="text-xs text-slate-400 font-mono">
                      Band Aide OS • {activeArtist?.name || 'All Bands'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold font-display text-slate-100 tracking-tight">{selectedGig.title}</h2>
                  <p className="text-slate-400 text-sm mt-1">
                    {(selectedGig.eventType || 'gig') === 'rehearsal' ? (
                      <span>Studio Room: <strong className="text-emerald-300 font-semibold">{selectedGig.rehearsalDetails?.roomStudio || selectedGig.venueName || 'Band Rehearsal Space'}</strong></span>
                    ) : (selectedGig.eventType || 'gig') === 'recording' ? (
                      <span>Recording Studio: <strong className="text-amber-300 font-semibold">{selectedGig.recordingDetails?.studioName || selectedGig.venueName || 'Studio Sound Lab'}</strong></span>
                    ) : (selectedGig.eventType || 'gig') === 'meeting' ? (
                      <span>Format: <strong className="text-sky-300 font-semibold">{selectedGig.meetingDetails?.locationType === 'video_call' ? 'Video Conference (Remote)' : (selectedGig.venueName || 'In-Person Meeting')}</strong></span>
                    ) : (
                      <span>At <strong className="font-semibold text-slate-200">{selectedGig.venueName}</strong></span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedGig.status}
                    onChange={(e) => handleStatusChange(selectedGig, e.target.value as GigStatus)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-semibold focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="draft">Draft / Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={() => handleOpenEditModal(selectedGig)}
                    title="Edit Event"
                    className="p-1.5 bg-slate-950 hover:bg-purple-500/10 border border-slate-800 hover:border-purple-500/20 text-slate-500 hover:text-purple-400 rounded-lg transition-all cursor-pointer"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if(confirm('Are you sure you want to delete this event schedule?')) {
                        onDeleteGig(selectedGig.id);
                        setSelectedGig(gigs.filter(g => g.id !== selectedGig.id)[0] || null);
                      }
                    }}
                    title="Delete Event"
                    className="p-1.5 bg-slate-950 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/20 text-slate-500 hover:text-red-400 rounded-lg transition-all cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* ========================================================
                  REHEARSAL VIEW WORKSPACE
                 ======================================================== */}
              {(selectedGig.eventType || 'gig') === 'rehearsal' && (
                <div className="space-y-6">
                  {/* Rehearsal Key Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-4 flex gap-3 items-start">
                      <Calendar className="text-emerald-400 mt-0.5 shrink-0" size={18} />
                      <div>
                        <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Date & Time</span>
                        <span className="text-sm font-semibold text-slate-200 block mt-0.5">
                          {new Date(selectedGig.dateTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-xs text-slate-400 mt-0.5 block flex items-center gap-1">
                          <Clock size={11} /> {new Date(selectedGig.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({selectedGig.durationMinutes} mins)
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-4 flex gap-3 items-start">
                      <Building2 className="text-emerald-400 mt-0.5 shrink-0" size={18} />
                      <div>
                        <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Studio / Room</span>
                        <span className="text-sm font-semibold text-slate-200 block mt-0.5">
                          {selectedGig.rehearsalDetails?.roomStudio || selectedGig.venueName || 'Band Space'}
                        </span>
                        <span className="text-xs text-slate-400 mt-0.5 block truncate">
                          {selectedGig.venueAddress || 'Local rehearsal studio'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-4 flex gap-3 items-start">
                      <Target className="text-emerald-400 mt-0.5 shrink-0" size={18} />
                      <div>
                        <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Prep Status</span>
                        <span className="text-sm font-semibold text-emerald-300 block mt-0.5">
                          {selectedGig.rehearsalDetails?.focusSongs?.length || 0} Songs Queued
                        </span>
                        <span className="text-xs text-slate-400 mt-0.5 block">
                          {selectedGig.rehearsalDetails?.equipmentToBring?.length || 0} Gear items to pack
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rehearsal Objectives Card */}
                  {selectedGig.rehearsalDetails?.objectives && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5">
                      <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider mb-2">
                        <Target size={15} />
                        <span>Rehearsal Target Objectives</span>
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed font-medium">
                        {selectedGig.rehearsalDetails.objectives}
                      </p>
                    </div>
                  )}

                  {/* Focus Songs Grid */}
                  <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <Disc size={15} className="text-emerald-400" />
                        <span>Songs to Rehearse & Tighten</span>
                      </h4>
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {selectedGig.rehearsalDetails?.focusSongs?.length || 0} Tracks
                      </span>
                    </div>

                    {(!selectedGig.rehearsalDetails?.focusSongs || selectedGig.rehearsalDetails.focusSongs.length === 0) ? (
                      <p className="text-xs text-slate-500 py-3 italic">No specific songs marked for this session. Edit to assign focus tracks.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {selectedGig.rehearsalDetails.focusSongs.map((songTitle, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/30 transition-all">
                            <div className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-semibold text-slate-200">{songTitle}</span>
                            </div>
                            <span className="text-[10px] uppercase font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                              Full Band
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Equipment Checklist */}
                  <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <Wrench size={15} className="text-emerald-400" />
                        <span>Equipment & Gear Checklist (Click to toggle)</span>
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">Interactive Pack List</span>
                    </div>

                    {(!selectedGig.rehearsalDetails?.equipmentToBring || selectedGig.rehearsalDetails.equipmentToBring.length === 0) ? (
                      <p className="text-xs text-slate-500 py-3 italic">No special gear noted. Bring standard gig rigs.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedGig.rehearsalDetails.equipmentToBring.map((gearItem, idx) => {
                          const isChecked = gearItem.startsWith('✓ ') || gearItem.startsWith('[x] ');
                          const cleanLabel = gearItem.replace(/^✓\s+|^\[x\]\s+/, '');
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleToggleRehearsalGear(selectedGig, cleanLabel)}
                              className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                                isChecked 
                                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200 line-through decoration-emerald-500/50' 
                                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isChecked ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700 bg-slate-950'}`}>
                                {isChecked && <Check size={12} className="stroke-[3]" />}
                              </div>
                              <span className="text-xs font-medium">{cleanLabel}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Day-of Rehearsal Notes */}
                  <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/20">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-2 flex items-center gap-1">
                      <FileText size={14} className="text-emerald-400" /> Internal Rehearsal Logistics
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap">
                      {selectedGig.notes || 'No rehearsal notes recorded. Use notes for door codes, parking directions, and break times.'}
                    </p>
                  </div>
                </div>
              )}

              {/* ========================================================
                  RECORDING STUDIO WORKSPACE
                 ======================================================== */}
              {(selectedGig.eventType || 'gig') === 'recording' && (
                <div className="space-y-6">
                  {/* Studio Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-4 flex gap-3 items-start">
                      <Calendar className="text-amber-400 mt-0.5 shrink-0" size={18} />
                      <div>
                        <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Lockout Session</span>
                        <span className="text-sm font-semibold text-slate-200 block mt-0.5">
                          {new Date(selectedGig.dateTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-xs text-slate-400 mt-0.5 block flex items-center gap-1">
                          <Clock size={11} /> {new Date(selectedGig.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({selectedGig.durationMinutes} mins)
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-4 flex gap-3 items-start">
                      <Building2 className="text-amber-400 mt-0.5 shrink-0" size={18} />
                      <div>
                        <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Tracking Studio</span>
                        <span className="text-sm font-semibold text-slate-200 block mt-0.5">
                          {selectedGig.recordingDetails?.studioName || selectedGig.venueName || 'Sound Lab'}
                        </span>
                        <span className="text-xs text-slate-400 mt-0.5 block truncate">
                          Engineer: {selectedGig.recordingDetails?.engineerName || 'In-House'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-4 flex gap-3 items-start">
                      <DollarSign className="text-amber-400 mt-0.5 shrink-0" size={18} />
                      <div>
                        <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Studio Rate & Budget</span>
                        <span className="text-sm font-semibold text-amber-300 block mt-0.5">
                          ${selectedGig.recordingDetails?.hourlyRate || 75}/hr
                        </span>
                        <span className="text-xs text-slate-400 mt-0.5 block">
                          Est: ${Math.round(((selectedGig.durationMinutes || 180) / 60) * (selectedGig.recordingDetails?.hourlyRate || 75))} Total
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Session Goals Card */}
                  {selectedGig.recordingDetails?.sessionGoal && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
                      <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider mb-2">
                        <Mic2 size={15} />
                        <span>Session Milestone & Sonic Goal</span>
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed font-medium">
                        {selectedGig.recordingDetails.sessionGoal}
                      </p>
                    </div>
                  )}

                  {/* Tracks to Record */}
                  <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <Disc size={15} className="text-amber-400" />
                        <span>Tracks Slated for Recording</span>
                      </h4>
                      <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {selectedGig.recordingDetails?.tracksToRecord?.length || 0} Tracks
                      </span>
                    </div>

                    {(!selectedGig.recordingDetails?.tracksToRecord || selectedGig.recordingDetails.tracksToRecord.length === 0) ? (
                      <p className="text-xs text-slate-500 py-3 italic">No specific tracks listed. Edit to specify tracks to record.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {selectedGig.recordingDetails.tracksToRecord.map((track, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/30 transition-all">
                            <div className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-semibold text-slate-200">{track}</span>
                            </div>
                            <span className="text-[10px] uppercase font-mono text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              Tracking
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Internal Studio Notes */}
                  <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/20">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-2 flex items-center gap-1">
                      <FileText size={14} className="text-amber-400" /> Microphone, DAW & Session Notes
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap">
                      {selectedGig.notes || 'No studio notes recorded. Use notes to log mic choices, preamps, scratch tracks, and tempo maps.'}
                    </p>
                  </div>
                </div>
              )}

              {/* ========================================================
                  BUSINESS MEETING WORKSPACE
                 ======================================================== */}
              {(selectedGig.eventType || 'gig') === 'meeting' && (
                <div className="space-y-6">
                  {/* Meeting Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-4 flex gap-3 items-start">
                      <Calendar className="text-sky-400 mt-0.5 shrink-0" size={18} />
                      <div>
                        <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Meeting Schedule</span>
                        <span className="text-sm font-semibold text-slate-200 block mt-0.5">
                          {new Date(selectedGig.dateTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-xs text-slate-400 mt-0.5 block flex items-center gap-1">
                          <Clock size={11} /> {new Date(selectedGig.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({selectedGig.durationMinutes}m)
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-4 flex gap-3 items-start">
                      <Users className="text-sky-400 mt-0.5 shrink-0" size={18} />
                      <div>
                        <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Meeting Format</span>
                        <span className="text-sm font-semibold text-slate-200 block mt-0.5">
                          {selectedGig.meetingDetails?.locationType === 'video_call' ? 'Online Video Call' : 'In-Person Sync'}
                        </span>
                        <span className="text-xs text-slate-400 mt-0.5 block truncate">
                          {selectedGig.meetingDetails?.locationType === 'video_call' ? 'Google Meet / Zoom' : (selectedGig.venueName || 'Band HQ')}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-4 flex gap-3 items-start">
                      <ListOrdered className="text-sky-400 mt-0.5 shrink-0" size={18} />
                      <div>
                        <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Agenda Scope</span>
                        <span className="text-sm font-semibold text-sky-300 block mt-0.5">
                          {selectedGig.meetingDetails?.agendaItems?.length || 0} Agenda Topics
                        </span>
                        <span className="text-xs text-slate-400 mt-0.5 block">
                          {selectedGig.meetingDetails?.actionItems?.length || 0} Action Items
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Video Call Quick Link Banner if available */}
                  {selectedGig.meetingDetails?.meetingLink && (
                    <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0">
                          <Video size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-100">Live Video Conference Room</h4>
                          <span className="text-xs text-sky-300 font-mono truncate block max-w-sm">
                            {selectedGig.meetingDetails.meetingLink}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={selectedGig.meetingDetails.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow-md shadow-sky-600/20 flex items-center gap-1.5 transition-all"
                        >
                          <Video size={13} />
                          <span>Join Video Call</span>
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Agenda Topics */}
                  <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <ListOrdered size={15} className="text-sky-400" />
                        <span>Meeting Agenda Topics</span>
                      </h4>
                      <span className="text-[11px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                        {selectedGig.meetingDetails?.agendaItems?.length || 0} Items
                      </span>
                    </div>

                    {(!selectedGig.meetingDetails?.agendaItems || selectedGig.meetingDetails.agendaItems.length === 0) ? (
                      <p className="text-xs text-slate-500 py-3 italic">No agenda items added yet. Click edit to outline discussion topics.</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedGig.meetingDetails.agendaItems.map((topic, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                            <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="text-xs text-slate-200 font-medium leading-relaxed">{topic}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Items */}
                  {selectedGig.meetingDetails?.actionItems && selectedGig.meetingDetails.actionItems.length > 0 && (
                    <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckSquare size={15} className="text-sky-400" />
                          <span>Action Items & Assignments</span>
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {selectedGig.meetingDetails.actionItems.map((action, idx) => (
                          <div key={idx} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-900/40 border border-slate-800 text-xs text-slate-300">
                            <div className="w-4 h-4 rounded border border-sky-500/40 bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                              <Check size={11} />
                            </div>
                            <span>{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Decisions & Notes */}
                  {selectedGig.meetingDetails?.decisions && (
                    <div className="bg-sky-500/5 border border-sky-500/20 rounded-xl p-4">
                      <span className="text-xs text-sky-300 font-bold uppercase tracking-wider block mb-2">
                        Recorded Decisions & Consensus
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap">
                        {selectedGig.meetingDetails.decisions}
                      </p>
                    </div>
                  )}

                  {/* Internal Notes */}
                  <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/20">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-2 flex items-center gap-1">
                      <FileText size={14} className="text-sky-400" /> Internal Meeting Notes
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap">
                      {selectedGig.notes || 'No notes added for this meeting.'}
                    </p>
                  </div>
                </div>
              )}

              {/* ========================================================
                  LIVE GIG WORKSPACE (STANDARD)
                 ======================================================== */}
              {(selectedGig.eventType || 'gig') === 'gig' && (
                <>
                  {/* Critical completeness warning banner */}
                  {(() => {
                    const hasVenueSelected = selectedGig.venueName && selectedGig.venueName.trim() !== '' && 
                                             selectedGig.venueName.toUpperCase() !== 'TBA' && 
                                             selectedGig.venueName.toUpperCase() !== 'TO BE ANNOUNCED' && 
                                             selectedGig.venueName.toUpperCase() !== 'PENDING';
                    const hasSetlistSelected = setlists.some(s => s.gigId === selectedGig.id && s.songs && s.songs.length > 0);
                    const isMissingInfoSelected = !hasVenueSelected || !hasSetlistSelected;

                    if (!isMissingInfoSelected) return null;

                    return (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
                        <div className="flex gap-3 items-start">
                          <AlertCircle className="text-red-400 mt-0.5 shrink-0" size={20} />
                          <div>
                            <h4 className="text-sm font-bold text-slate-200">Critical Information Missing!</h4>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {!hasVenueSelected && !hasSetlistSelected ? 'This gig is missing both a valid venue name and a setlist.' :
                               !hasVenueSelected ? 'This gig is missing a valid venue name (currently empty or placeholder).' :
                               'This gig has no songs in its setlist.'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!hasVenueSelected && (
                            <button
                              onClick={() => handleOpenEditModal(selectedGig)}
                              className="text-[10px] font-mono font-bold bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              Add Venue
                            </button>
                          )}
                          {!hasSetlistSelected && onNavigateToTab && (
                            <button
                              onClick={() => onNavigateToTab('setlist')}
                              className="text-[10px] font-mono font-bold bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg shadow-md shadow-purple-600/15 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              Build Setlist &rarr;
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Grid Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-950/40 border border-slate-800/50 rounded-xl p-4 flex gap-3 items-start">
                      <Calendar className="text-purple-400 mt-0.5 shrink-0" size={18} />
                      <div>
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">Date & Time</span>
                        <span className="text-sm font-semibold text-slate-200 block mt-0.5">
                          {new Date(selectedGig.dateTime).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-xs text-slate-400 mt-0.5 block flex items-center gap-1">
                          <Clock size={11} /> {new Date(selectedGig.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({selectedGig.durationMinutes} mins set)
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-950/40 border border-slate-800/50 rounded-xl p-4 flex flex-col justify-between gap-3">
                      <div className="flex gap-3 items-start">
                        <MapPin className="text-purple-400 mt-0.5 shrink-0" size={18} />
                        <div className="overflow-hidden min-w-0">
                          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">Venue Address</span>
                          <span className="text-sm font-semibold text-slate-200 block mt-0.5 truncate" title={selectedGig.venueName}>
                            {selectedGig.venueName}
                          </span>
                          <span className="text-xs text-slate-400 mt-0.5 block truncate" title={selectedGig.venueAddress}>
                            {selectedGig.venueAddress || 'No address specified'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenVenueSearch('detail', selectedGig.venueName)}
                        className="inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 hover:text-purple-200 text-xs font-semibold transition-all cursor-pointer shadow-sm w-full"
                        title="Search venue contact information, capacity, and backline specs with Google AI"
                      >
                        <span className="flex items-center gap-1.5">
                          <Sparkles size={13} className="text-purple-400" />
                          <span>Google Grounded Venue Specs</span>
                        </span>
                        <Globe size={13} className="text-blue-400" />
                      </button>
                    </div>

                    <div className="bg-slate-950/40 border border-slate-800/50 rounded-xl p-4 flex gap-3 items-start">
                      <DollarSign className="text-purple-400 mt-0.5 shrink-0" size={18} />
                      <div>
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">Ticketing</span>
                        <span className="text-sm font-semibold text-slate-200 block mt-0.5">
                          {selectedGig.ticketPrice === 0 ? 'Free Event / No Cover' : `$${selectedGig.ticketPrice} General Admission`}
                        </span>
                        {selectedGig.ticketUrl ? (
                          <a
                            href={selectedGig.ticketUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-purple-400 font-medium hover:underline flex items-center gap-1 mt-1"
                          >
                            <span>View Tickets Link</span>
                            <ExternalLink size={10} />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-500 block mt-1">No ticket link added yet</span>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-950/40 border border-slate-800/50 rounded-xl p-4 flex gap-3 items-start">
                      <FileText className="text-purple-400 mt-0.5 shrink-0" size={18} />
                      <div>
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">Description</span>
                        <p className="text-xs text-slate-300 mt-1 line-clamp-3 leading-relaxed">
                          {selectedGig.description || 'No public description available.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Promotional Marketing Checklist */}
                  <div className="bg-slate-950/30 border border-slate-800 rounded-xl p-5">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                          <CheckCircle2 size={16} className="text-purple-400" />
                          <span>Efficient Promotion Checklist</span>
                        </h3>
                        <p className="text-slate-500 text-xs mt-0.5">Complete these tasks to maximize venue turnout.</p>
                      </div>
                      <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 font-medium">
                        {Math.round((Object.values(selectedGig.promoChecklist).filter(Boolean).length / 5) * 100)}% Done
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: 'outreachCompleted', label: 'Venue Booker Pitch', desc: 'Secure slot & lock scheduling details' },
                        { key: 'ticketsLive', label: 'Ticketing Page Live', desc: 'Confirm ticket platform & publish URLs' },
                        { key: 'pressRelease', label: 'Local Press Release', desc: 'Draft PR and distribute to local blogs' },
                        { key: 'socialPost', label: 'Social Hype Campaigns', desc: 'Generate Instagram & Facebook promo posts' },
                        { key: 'flyerDistributed', label: 'Flyer & Poster Boarding', desc: 'Print posters and pin at local shops' },
                      ].map((item) => {
                        const isChecked = selectedGig.promoChecklist[item.key as keyof GigPromoChecklist];
                        return (
                          <div
                            key={item.key}
                            onClick={() => handleToggleChecklist(selectedGig, item.key as keyof GigPromoChecklist)}
                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer select-none transition-all ${
                              isChecked
                                ? 'bg-purple-500/5 border-purple-500/30'
                                : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-950 text-purple-500 focus:ring-purple-500/20 focus:ring-offset-slate-950"
                            />
                            <div>
                              <span className={`text-xs font-semibold block ${isChecked ? 'text-slate-200 line-through decoration-slate-600' : 'text-slate-300'}`}>
                                {item.label}
                              </span>
                              <span className="text-[10px] text-slate-500 block mt-0.5 leading-tight">{item.desc}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Private Venue & Band Notes */}
                  <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/20">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-2 flex items-center gap-1">
                      <AlertCircle size={14} className="text-purple-400" /> Internal Band Setlist & Day-of Notes
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap">
                      {selectedGig.notes || 'No private notes added. Use notes to coordinate load-in times, gear specifications, cover rosters, and backstage checklists.'}
                    </p>
                  </div>

                  {/* Band Merch Supply & Stocking Reminder Card */}
                  <div className="border border-purple-500/30 bg-purple-500/5 rounded-xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300">
                          <Package size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-100">Event Merch Supply & Stocking Reminder</h4>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              selectedGig.merchStockStatus === 'ready'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : selectedGig.merchStockStatus === 'low_stock'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}>
                              {selectedGig.merchStockStatus === 'ready'
                                ? '✓ Packed & Ready'
                                : selectedGig.merchStockStatus === 'low_stock'
                                ? '⚠️ Low Stock Alert'
                                : '📋 Check In Progress'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">Ensure inventory (tees, hoodies, vinyl, stickers) is packed & counted 48 hours before load-in.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenMerchModal(selectedGig)}
                          className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Package size={13} />
                          <span>Manage Event Merch</span>
                        </button>
                        <a
                          href="https://www.printful.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <span>Restock</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>

                    {/* Event Merch Notes preview if set */}
                    {selectedGig.merchStockNotes && (
                      <div className="bg-slate-950/70 p-3 rounded-lg border border-purple-500/20 text-xs text-slate-300">
                        <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block mb-1">
                          Event Merch & Packing Notes:
                        </span>
                        <p className="text-slate-300 text-xs leading-relaxed">{selectedGig.merchStockNotes}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-purple-500/20 text-xs">
                      <div className="bg-slate-950/60 p-3 rounded-lg border border-purple-500/20">
                        <span className="font-bold text-slate-200 block mb-1 flex items-center gap-1.5">
                          <ShoppingBag size={12} className="text-purple-400" />
                          1. Apparel & Sizing Audit
                        </span>
                        <span className="text-slate-400 text-[11px]">Check sizing stacks (S, M, L, XL, 2XL) for T-shirts and hoodies in plastic tubs.</span>
                      </div>
                      <div className="bg-slate-950/60 p-3 rounded-lg border border-purple-500/20">
                        <span className="font-bold text-slate-200 block mb-1 flex items-center gap-1.5">
                          <DollarSign size={12} className="text-emerald-400" />
                          2. Float & Square Reader
                        </span>
                        <span className="text-slate-400 text-[11px]">Prepare $100 cash change float ($5s & $1s) and test Stripe/Square card reader.</span>
                      </div>
                      <div className="bg-slate-950/60 p-3 rounded-lg border border-purple-500/20">
                        <span className="font-bold text-slate-200 block mb-1 flex items-center gap-1.5">
                          <ExternalLink size={12} className="text-amber-400" />
                          3. Vendor Supply Ordering
                        </span>
                        <span className="text-slate-400 text-[11px]">Need restocks? Order through <a href="https://www.merchbar.com" target="_blank" rel="noreferrer" className="text-purple-400 underline">Merchbar</a> or <a href="https://www.printful.com" target="_blank" rel="noreferrer" className="text-purple-400 underline">Printful</a>.</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ) : (
            <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-16 text-center text-slate-500">
              <Calendar className="mx-auto text-slate-700 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-slate-400">No Event Selected</h3>
              <p className="text-sm mt-1">Please select an event from the schedule or click Schedule Event to create one.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer shadow-lg shadow-purple-600/15 border border-purple-500/20"
              >
                Schedule New Event
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Gig Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative my-8"
          >
            <h3 className="text-xl font-bold font-display text-slate-100 mb-1">Schedule New Gig Event</h3>
            <p className="text-xs text-slate-400 mb-4">
              Add event particulars. This data powers the calendar, setlist builder, and Manager promotional generator.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Gig Title / Event Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Summer Rooftop Sessions, EP Release Gig"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Event Status (Confirmed / Pending) *</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as GigStatus)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50 font-semibold"
                  >
                    <option value="confirmed">Confirmed Gig</option>
                    <option value="draft">Pending / Draft</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  {venues && venues.length > 0 && (
                    <div className="mb-3 bg-purple-950/20 border border-purple-500/20 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300 mb-1">
                        <Building2 size={13} className="text-purple-400" />
                        <span>Quick-Select from Saved Venue Roster</span>
                      </div>
                      <select
                        onChange={(e) => {
                          const vId = e.target.value;
                          const v = venues.find(item => item.id === vId);
                          if (v) {
                            setFormVenueName(v.name);
                            setFormVenueAddress(v.address);
                            const techSummary = v.techEquipment ? `[Venue Rider] PA: ${v.techEquipment.paSoundSystem || 'N/A'} | Lighting: ${v.techEquipment.lighting || 'N/A'} | Capacity: ${v.capacity || 'N/A'}` : '';
                            if (techSummary) {
                              setFormNotes(prev => prev ? `${prev}\n\n${techSummary}` : techSummary);
                            }
                          }
                        }}
                        defaultValue=""
                        className="w-full bg-slate-950 border border-purple-500/30 rounded-lg px-3 py-2 text-xs text-purple-200 focus:outline-none focus:border-purple-500/50 font-semibold cursor-pointer"
                      >
                        <option value="" disabled>-- Select a venue from your roster --</option>
                        {venues.map(v => (
                          <option key={v.id} value={v.id}>{v.name} ({v.capacity ? `${v.capacity} cap` : 'General'})</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-400">Venue Name *</label>
                    <button
                      type="button"
                      onClick={() => handleOpenVenueSearch('add', formVenueName)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                      title="Search venue contact info, capacity, and backline specifications with Google Search Grounding"
                    >
                      <Sparkles size={11} className="text-purple-400 animate-pulse" />
                      <span>Search Specs (Google AI)</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g., The Crocodile, Neumos"
                      value={formVenueName}
                      onChange={(e) => setFormVenueName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50 pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => handleOpenVenueSearch('add', formVenueName)}
                      className="absolute right-2.5 top-2.5 text-slate-500 hover:text-purple-400 transition-colors cursor-pointer"
                      title="Search venue specs with Google AI"
                    >
                      <Sparkles size={14} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Venue Address</label>
                  <input
                    type="text"
                    placeholder="e.g., 2200 2nd Ave, Seattle, WA"
                    value={formVenueAddress}
                    onChange={(e) => setFormVenueAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Date & Start Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formDateTime}
                    onChange={(e) => setFormDateTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Duration (min)</label>
                    <input
                      type="number"
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Ticket Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formTicketPrice}
                      onChange={(e) => setFormTicketPrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Tickets Platform URL</label>
                  <input
                    type="url"
                    placeholder="https://ticket-platform.com/your-event-slug"
                    value={formTicketUrl}
                    onChange={(e) => setFormTicketUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Public Description</label>
                  <textarea
                    rows={2}
                    placeholder="Provide a brief summary for promo fliers or news feeds..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50 resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Internal Notes (Load-in, Soundcheck, Staff lists)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g., Load-in at 5:00 PM. Soundcheck at 6:15 PM. Do not bring acoustic guitar, DI box is provided."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold px-4 py-2 rounded-lg text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2 rounded-lg text-sm cursor-pointer shadow-lg shadow-purple-600/15 border border-purple-500/20"
                >
                  Create Schedule
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showEditModal && selectedGig && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative my-8"
          >
            <h3 className="text-xl font-bold font-display text-slate-100 mb-1">Edit Gig Event Details</h3>
            <p className="text-xs text-slate-400 mb-4">
              Update event particulars to ensure correct calendar rendering and setlist builds.
            </p>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Gig Title / Event Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Summer Rooftop Sessions, EP Release Gig"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="sm:col-span-2">
                  {venues && venues.length > 0 && (
                    <div className="mb-3 bg-purple-950/20 border border-purple-500/20 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300 mb-1">
                        <Building2 size={13} className="text-purple-400" />
                        <span>Quick-Select from Saved Venue Roster</span>
                      </div>
                      <select
                        onChange={(e) => {
                          const vId = e.target.value;
                          const v = venues.find(item => item.id === vId);
                          if (v) {
                            setEditVenueName(v.name);
                            setEditVenueAddress(v.address);
                            const techSummary = v.techEquipment ? `[Venue Rider] PA: ${v.techEquipment.paSoundSystem || 'N/A'} | Lighting: ${v.techEquipment.lighting || 'N/A'} | Capacity: ${v.capacity || 'N/A'}` : '';
                            if (techSummary) {
                              setEditNotes(prev => prev ? `${prev}\n\n${techSummary}` : techSummary);
                            }
                          }
                        }}
                        defaultValue=""
                        className="w-full bg-slate-950 border border-purple-500/30 rounded-lg px-3 py-2 text-xs text-purple-200 focus:outline-none focus:border-purple-500/50 font-semibold cursor-pointer"
                      >
                        <option value="" disabled>-- Select a venue from your roster --</option>
                        {venues.map(v => (
                          <option key={v.id} value={v.id}>{v.name} ({v.capacity ? `${v.capacity} cap` : 'General'})</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-400">Venue Name *</label>
                    <button
                      type="button"
                      onClick={() => handleOpenVenueSearch('edit', editVenueName)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                      title="Search venue contact info, capacity, and backline specifications with Google Search Grounding"
                    >
                      <Sparkles size={11} className="text-purple-400 animate-pulse" />
                      <span>Search Specs (Google AI)</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g., The Crocodile, Neumos"
                      value={editVenueName}
                      onChange={(e) => setEditVenueName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50 pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => handleOpenVenueSearch('edit', editVenueName)}
                      className="absolute right-2.5 top-2.5 text-slate-500 hover:text-purple-400 transition-colors cursor-pointer"
                      title="Search venue specs with Google AI"
                    >
                      <Sparkles size={14} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Venue Address</label>
                  <input
                    type="text"
                    placeholder="e.g., 2200 2nd Ave, Seattle, WA"
                    value={editVenueAddress}
                    onChange={(e) => setEditVenueAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Date & Start Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={editDateTime}
                    onChange={(e) => setEditDateTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Duration (min)</label>
                    <input
                      type="number"
                      value={editDuration}
                      onChange={(e) => setEditDuration(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Ticket Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editTicketPrice}
                      onChange={(e) => setEditTicketPrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Tickets Platform URL</label>
                  <input
                    type="url"
                    placeholder="https://ticket-platform.com/your-event-slug"
                    value={editTicketUrl}
                    onChange={(e) => setEditTicketUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Public Description</label>
                  <textarea
                    rows={2}
                    placeholder="Provide a brief summary for promo fliers or news feeds..."
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50 resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Internal Notes (Load-in, Soundcheck, Staff lists)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g., Load-in at 5:00 PM. Soundcheck at 6:15 PM. Do not bring acoustic guitar, DI box is provided."
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold px-4 py-2 rounded-lg text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2 rounded-lg text-sm cursor-pointer shadow-lg shadow-purple-600/15"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Event Merch Stock & Inventory Reminder Modal */}
      {merchModalGig && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8 text-slate-200"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 mt-0.5">
                  <Package size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                      Merch Supply Logistics
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(merchModalGig.dateTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold font-display text-slate-100 mt-1">{merchModalGig.title}</h3>
                  <p className="text-xs text-slate-400">
                    Venue: <span className="text-slate-200 font-semibold">{merchModalGig.venueName}</span>
                    {merchModalGig.venueAddress && ` • ${merchModalGig.venueAddress}`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMerchModalGig(null)}
                className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content body */}
            <div className="py-4 space-y-5 max-h-[70vh] overflow-y-auto pr-1">
              {/* Readiness Status Selector */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Event Merch Readiness Status
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setMerchStatusInput('ready')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      merchStatusInput === 'ready'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <CheckCircle2 size={18} className={merchStatusInput === 'ready' ? 'text-emerald-400' : 'text-slate-500'} />
                    <span>Packed & Ready</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMerchStatusInput('check_needed')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      merchStatusInput === 'check_needed'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-md shadow-purple-500/10'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ShoppingBag size={18} className={merchStatusInput === 'check_needed' ? 'text-purple-400' : 'text-slate-500'} />
                    <span>Check In Progress</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMerchStatusInput('low_stock')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      merchStatusInput === 'low_stock'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10 animate-pulse'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <AlertTriangle size={18} className={merchStatusInput === 'low_stock' ? 'text-amber-400' : 'text-slate-500'} />
                    <span>Low Stock / Order</span>
                  </button>
                </div>
              </div>

              {/* Supply Items Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Day-Of Merch Pack & Supply Checklist
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                      {MERCH_SUPPLY_ITEMS.filter(it => merchChecklistState[it.key]).length} / {MERCH_SUPPLY_ITEMS.length} Packed
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyPackingSheet(merchModalGig)}
                    className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer bg-purple-950/40 px-2.5 py-1 rounded border border-purple-500/30 transition-colors"
                  >
                    {copiedPackingSheet ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedPackingSheet ? 'Copied to Clipboard!' : 'Copy Packing List'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {MERCH_SUPPLY_ITEMS.map((item) => {
                    const isChecked = !!merchChecklistState[item.key];
                    return (
                      <div
                        key={item.key}
                        onClick={() => handleToggleMerchCheckItem(item.key)}
                        className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer select-none transition-all ${
                          isChecked
                            ? 'bg-purple-950/40 border-purple-500/40 shadow-sm'
                            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleMerchCheckItem(item.key)}
                          className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-xs font-bold truncate ${isChecked ? 'text-slate-200 line-through decoration-slate-500' : 'text-slate-200'}`}>
                              {item.label}
                            </span>
                            <span className="text-[9px] font-semibold text-slate-500 uppercase shrink-0">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Event Merch Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Event Merch Inventory & Table Setup Notes</span>
                  <span className="text-[10px] text-slate-500 font-normal">Stored with this gig</span>
                </label>
                <textarea
                  rows={3}
                  value={merchNotesInput}
                  onChange={(e) => setMerchNotesInput(e.target.value)}
                  placeholder="e.g., Bring 35 Black Tour Tees (5 S, 10 M, 12 L, 8 XL), 20 Vinyls. Table setup stage left next to merchandise floodlight. Dave on sales from 7-9 PM."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/50 resize-none font-sans"
                />
              </div>

              {/* Merch Suppliers & Budget Shortcuts */}
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-purple-400 shrink-0" />
                  <span className="text-slate-300 text-xs">Need to restock inventory or log merch split payouts?</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://www.printful.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Printful / Merchbar</span>
                    <ExternalLink size={11} />
                  </a>
                  {onNavigateToTab && (
                    <button
                      type="button"
                      onClick={() => {
                        setMerchModalGig(null);
                        onNavigateToTab('budgets');
                      }}
                      className="px-2.5 py-1.5 bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 text-purple-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <DollarSign size={12} />
                      <span>Merch Budget</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setMerchModalGig(null)}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 font-semibold px-4 py-2 rounded-xl text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveMerchModal}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-600/20 border border-purple-500/30 transition-all active:translate-y-0.5"
              >
                <Check size={14} />
                <span>Save Merch Stock Status</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Google Search Grounded Venue Search Modal */}
      <VenueSearchModal
        isOpen={showVenueSearchModal}
        initialVenueName={venueSearchInitialQuery}
        onClose={() => setShowVenueSearchModal(false)}
        onApplyVenueData={handleApplyVenueData}
      />
    </div>
  );
}
