export interface MemberMemoryNote {
  id: string;
  timestamp: string;
  note: string;
  sentiment: 'positive' | 'neutral' | 'attention_needed';
  context: 'rehearsal' | 'gig' | 'communication' | 'musical_habit' | 'general';
}

export interface MemberCognitiveProfile {
  memberId: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  personalityArchetype: string; // e.g. "The Perfectionist Producer", "The High-Energy Performer"
  communicationStyle: string; // e.g. "Direct bullet-points", "Needs 48hr advance schedule notice"
  stressTriggers: string[];
  musicalStrengths: string[];
  stagePresenceHabit: string;
  preferredRehearsalTimes: string;
  punctualityScore: number; // 0 - 100%
  inEarMonitorNotes: string;
  memories: MemberMemoryNote[];
}

export interface Member {
  id: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  gearLink?: string;
  instagramUrl?: string;
  cognitiveProfile?: MemberCognitiveProfile;
}

export interface NotablePerformance {
  id: string;
  eventName: string;
  venue: string;
  date: string;
  location: string;
  attendance?: number;
  notes?: string;
}

export interface Artist {
  id: string;
  name: string;
  genre: string;
  bio: string;
  members: Member[];
  contactEmail: string;
  instagramUrl?: string;
  facebookUrl?: string;
  spotifyUrl?: string;
  soundcloudUrl?: string;
  youtubeUrl?: string;
  appleMusicUrl?: string;
  bandcampUrl?: string;
  tiktokUrl?: string;
  twitterUrl?: string;
  photos?: string[];
  pastPerformances?: NotablePerformance[];
  instruments?: string[];
  collaborationStatus?: 'available' | 'looking' | 'unavailable';
}

export type GigStatus = 'draft' | 'confirmed' | 'completed' | 'cancelled';

export interface GigPromoChecklist {
  pressRelease: boolean;
  socialPost: boolean;
  flyerDistributed: boolean;
  outreachCompleted: boolean;
  ticketsLive: boolean;
}

export interface VenueTechEquipment {
  paSoundSystem?: string;
  lighting?: string;
  drumKit?: string;
  amps?: string;
  micsDi?: string;
  stageDimensions?: string;
  notes?: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  capacity?: string;
  techEquipment?: VenueTechEquipment;
  notes?: string;
  website?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface VenueSearchData {
  venueName: string;
  address?: string;
  capacity?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    website?: string;
    bookingUrl?: string;
  };
  backlineSpecs?: {
    paSoundSystem?: string;
    drumKit?: string;
    guitarBassAmps?: string;
    microphonesDi?: string;
    stageDimensions?: string;
    lightingMonitors?: string;
  };
  logistics?: {
    ageRestriction?: string;
    loadInInstructions?: string;
    curfew?: string;
    merchPolicy?: string;
  };
  summaryText?: string;
  sources?: GroundingSource[];
  isDemo?: boolean;
}

export type EventType = 'gig' | 'rehearsal' | 'recording' | 'meeting';

export interface RehearsalDetails {
  roomStudio?: string;
  focusSongs?: string[];
  equipmentToBring?: string[];
  objectives?: string;
}

export interface RecordingDetails {
  studioName?: string;
  engineerName?: string;
  tracksToRecord?: string[];
  hourlyRate?: number;
  sessionGoal?: string;
}

export interface MeetingDetails {
  locationType?: 'in_person' | 'video_call';
  meetingLink?: string;
  agendaItems?: string[];
  actionItems?: string[];
  decisions?: string;
}

export interface Gig {
  id: string;
  title: string;
  artistId: string;
  venueName: string;
  venueAddress: string;
  dateTime: string; // ISO string
  durationMinutes: number;
  ticketPrice: number;
  ticketUrl?: string;
  description: string;
  status: GigStatus;
  notes?: string;
  flyerUrl?: string;
  promoChecklist: GigPromoChecklist;
  merchStockStatus?: 'ready' | 'check_needed' | 'low_stock';
  merchStockNotes?: string;
  merchChecklist?: Record<string, boolean>;
  venueData?: VenueSearchData;
  eventType?: EventType;
  rehearsalDetails?: RehearsalDetails;
  recordingDetails?: RecordingDetails;
  meetingDetails?: MeetingDetails;
}

export interface Song {
  id: string;
  title: string;
  artistId: string;
  durationSec: number;
  bpm?: number;
  key?: string;
  isOriginal: boolean;
  status: 'ready' | 'learning' | 'retired';
}

export interface SetlistSong {
  songId: string;
  order: number;
}

export interface Setlist {
  id: string;
  gigId: string;
  songs: SetlistSong[];
}

export type BudgetItemType = 'income' | 'expense';

export type BudgetItemCategory =
  | 'guarantee'
  | 'door_split'
  | 'tips'
  | 'merch'
  | 'travel'
  | 'food_drink'
  | 'commission'
  | 'promo_ads'
  | 'gear_rental'
  | 'other';

export interface BudgetItem {
  id: string;
  gigId: string;
  title: string;
  amount: number;
  type: BudgetItemType;
  category: BudgetItemCategory;
  date: string;
}

export interface PromoMaterial {
  id: string;
  gigId: string;
  platform: 'instagram' | 'facebook' | 'newsletter' | 'booking_outreach' | 'press_release';
  title: string;
  content: string;
  generatedAt: string;
}

export interface GigOpportunity {
  id: string;
  venueId: string;
  venueName: string;
  title: string;
  description: string;
  dateTime: string;
  pay: string;
  requiredGenre: string;
  status: 'open' | 'closed';
  createdAt: string;
}

export interface GigApplication {
  id: string;
  opportunityId: string;
  artistId: string;
  artistName: string;
  artistGenre: string;
  pitchText: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'venue' | 'artist';
  recipientId: string;
  recipientName: string;
  recipientType: 'venue' | 'artist';
  opportunityId?: string;
  messageText: string;
  timestamp: string;
  read?: boolean;
}

export interface FanProfile {
  id: string;
  name: string;
  email: string;
  followedArtistIds: string[];
}

export interface FanNotification {
  id: string;
  fanId: string;
  artistId: string;
  artistName: string;
  gigId: string;
  gigTitle: string;
  venueName: string;
  dateTime: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export type CollaboratorRole = 
  | 'drummer'
  | 'bassist'
  | 'guitarist'
  | 'vocalist'
  | 'keyboardist'
  | 'percussionist'
  | 'sound_engineer'
  | 'graphic_designer'
  | 'videographer'
  | 'photographer'
  | 'producer'
  | 'tour_manager'
  | 'lighting_tech'
  | 'songwriter'
  | 'session_musician'
  | 'other';

export type CollaborationCompensationType = 
  | 'paid_fixed'     // e.g. Fixed fee ($250 for gig, $150 for poster)
  | 'paid_hourly'    // Hourly rate
  | 'door_split'     // % of door / ticket split
  | 'trade_credit'   // Non-monetary / portfolio / credit / merch trade
  | 'volunteer';     // Unpaid jam / audition / collaboration

export interface CollaborationResponse {
  id: string;
  requestId: string;
  responderArtistId?: string;
  responderName: string;
  responderEmail: string;
  responderPhone?: string;
  portfolioUrl?: string; // Portfolio, Instagram, Spotify, SoundCloud, or Web link
  pitchMessage: string;
  offeredRate?: string;
  status: 'pending' | 'accepted' | 'declined' | 'shortlisted';
  createdAt: string;
}

export interface CollaborationRequest {
  id: string;
  userId?: string;
  authorArtistId: string;
  authorArtistName: string;
  authorContactEmail: string;
  authorGenre?: string;
  title: string; // e.g. "Drummer needed for RINO Room gig", "Graphic designer for tour poster"
  roleNeeded: CollaboratorRole;
  customRoleName?: string;
  skillsRequired: string[]; // e.g. ['In-ear monitors', 'Rock', 'Double kick pedal']
  description: string;
  location: string; // e.g. "Seattle, WA", "Denver, CO", "Remote"
  isRemote: boolean;
  gigId?: string; // Optional linked gig
  gigTitle?: string;
  eventDate?: string; // Target show or deadline date
  deadline?: string;
  compensationType: CollaborationCompensationType;
  compensationAmount?: string; // e.g. "$250 flat fee", "20% door cut", "Volunteer"
  status: 'open' | 'in_discussion' | 'filled' | 'closed';
  responses: CollaborationResponse[];
  createdAt: string;
}

export interface DeepResearchSource {
  title: string;
  url: string;
}

export interface DeepResearchResult {
  id: string;
  topic: string;
  category: 'venue_booking' | 'market_trends' | 'tour_logistics' | 'festival_deadlines' | 'gear_intelligence';
  timestamp: string;
  summary: string;
  keyFindings: string[];
  executiveActionPlan: string[];
  sources: DeepResearchSource[];
}

export interface MediaPipeGestureState {
  categoryName: string;
  score: number;
  label: string;
  actionDetected?: string;
}

export interface MediaPipeRehearsalMetrics {
  stageEnergyScore: number; // 0 - 100
  focusScore: number; // 0 - 100
  headMotionPacing: string;
  movementDynamic: 'steady' | 'moderate' | 'high_energy' | 'explosive';
  detectedGestures: string[];
  postureAssessment: string;
  sharonFeedback: string;
}

