export interface Member {
  id: string;
  name: string;
  role: string;
  gearLink?: string;
  instagramUrl?: string;
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

