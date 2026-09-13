import { Artist, Gig, Song, Setlist, BudgetItem, Venue, GigOpportunity, GigApplication, Message, FanProfile, FanNotification } from './types';

export const INITIAL_FAN_PROFILES: FanProfile[] = [
  {
    id: 'fan-1',
    name: 'Alex Rivera (Music Fan)',
    email: 'alex.fan@bandz.io',
    followedArtistIds: ['artist-1', 'artist-2']
  },
  {
    id: 'fan-2',
    name: 'Jordan Lee (Concert Goer)',
    email: 'jordan.lee@bandz.io',
    followedArtistIds: ['artist-1']
  }
];

export const INITIAL_FAN_NOTIFICATIONS: FanNotification[] = [
  {
    id: 'notif-1',
    fanId: 'fan-1',
    artistId: 'artist-1',
    artistName: 'Neon Echo',
    gigId: 'gig-1',
    gigTitle: 'Indie Rock Showcase',
    venueName: 'The Crocodile',
    dateTime: '2026-07-15T20:00:00',
    message: 'Neon Echo announced a new show: Indie Rock Showcase at The Crocodile on Jul 15, 2026!',
    timestamp: '2026-06-10T14:00:00Z',
    read: false
  },
  {
    id: 'notif-2',
    fanId: 'fan-1',
    artistId: 'artist-2',
    artistName: 'Sienna Woods',
    gigId: 'gig-2',
    gigTitle: 'Acoustic Sunset Session',
    venueName: 'Sunset Tavern',
    dateTime: '2026-07-24T19:30:00',
    message: 'Sienna Woods announced a new show: Acoustic Sunset Session at Sunset Tavern on Jul 24, 2026!',
    timestamp: '2026-06-15T11:20:00Z',
    read: true
  }
];

export const INITIAL_OPPORTUNITIES: GigOpportunity[] = [
  {
    id: 'opp-1',
    venueId: 'venue-1',
    venueName: 'The Crocodile',
    title: 'Indie Rock Showcase Main Stage',
    description: 'Looking for a high-energy indie rock or alternative band to support our Friday night showcase. 45-minute set required. Great local draw preferred.',
    dateTime: '2026-09-25T20:00:00',
    pay: '$600 Guarantee + Merch 100%',
    requiredGenre: 'Indie Rock / Alternative',
    status: 'open',
    createdAt: '2026-09-01T10:00:00Z'
  },
  {
    id: 'opp-2',
    venueId: 'venue-2',
    venueName: 'Neumos',
    title: 'Capitol Hill Pop-Punk Takeover',
    description: 'Seeking energetic pop-punk or modern rock acts for our weekend lineup. Backline shared.',
    dateTime: '2026-10-02T19:30:00',
    pay: '$500 + Door Split',
    requiredGenre: 'Pop-Punk / Rock',
    status: 'open',
    createdAt: '2026-09-02T12:00:00Z'
  },
  {
    id: 'opp-3',
    venueId: 'venue-3',
    venueName: 'The Triple Door',
    title: 'Acoustic Candlelight Session',
    description: 'Intimate acoustic listening room showcase. Unplugged or low-volume electric arrangements only.',
    dateTime: '2026-10-10T18:00:00',
    pay: '$400 Flat Fee',
    requiredGenre: 'Acoustic / Folk / Singer-Songwriter',
    status: 'open',
    createdAt: '2026-09-03T14:30:00Z'
  }
];

export const INITIAL_APPLICATIONS: GigApplication[] = [
  {
    id: 'app-1',
    opportunityId: 'opp-1',
    artistId: 'artist-1',
    artistName: 'Neon Echo',
    artistGenre: 'Indie Rock',
    pitchText: 'We played a packed show at Sunset Tavern last month and have over 2,400 local monthly listeners. Would love to bring our full lighting rig and energy to The Crocodile!',
    status: 'pending',
    createdAt: '2026-09-04T09:15:00Z'
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    senderId: 'venue-1',
    senderName: 'Marcus Vance (The Crocodile)',
    senderType: 'venue',
    recipientId: 'artist-1',
    recipientName: 'Neon Echo',
    recipientType: 'artist',
    opportunityId: 'opp-1',
    messageText: 'Hey team! We saw your application for the Sep 25 showcase. Can you send over your stage plot and current rider?',
    timestamp: '2026-09-04T11:30:00Z',
    read: false
  }
];


export const INITIAL_VENUES: Venue[] = [
  {
    id: 'venue-1',
    name: 'The Crocodile',
    address: '2505 1st Ave, Seattle, WA 98121',
    contactPerson: 'Marcus Vance (Talent Buyer)',
    phone: '(206) 441-4610',
    email: 'booking@thecrocodile.com',
    capacity: '550 standing',
    website: 'https://thecrocodile.com',
    techEquipment: {
      paSoundSystem: 'Midas M32 32-Channel Digital Console, QSC KLA Line Array Mains, 6x QSC Stage Wedges',
      lighting: 'Chauvet DMX Intelligent LED Lighting Rig with front wash & strobe fixtures',
      drumKit: 'Yamaha Stage Custom 5-piece shell pack (Drumeers bring cymbals, snare, kick pedal)',
      amps: "Fender '65 Twin Reverb & Ampeg SVT-CL 8x10 Bass Rig",
      micsDi: 'Shure SM58 / SM57, Beta 52A, Radial DI boxes',
      stageDimensions: '24ft wide x 16ft deep x 3ft high stage',
      notes: 'Load-in via back service alley. Soundcheck starts 4:00 PM.'
    },
    notes: 'Premier Seattle rock venue. Great hospitality room upstairs.'
  },
  {
    id: 'venue-2',
    name: 'Neumos',
    address: '925 E Pike St, Seattle, WA 98122',
    contactPerson: 'Sarah Jenkins',
    phone: '(206) 709-9442',
    email: 'booking@neumos.com',
    capacity: '650 capacity',
    website: 'https://neumos.com',
    techEquipment: {
      paSoundSystem: 'Soundcraft Vi1 Digital Console, Meyer Sound PA System',
      lighting: 'Full LED moving head light pack with fog machine',
      drumKit: 'Gretsch Catalina Maple 4-piece (no cymbals/snare provided)',
      amps: 'Roland Jazz Chorus JC-120, Orange AD30TC head & cab',
      micsDi: 'Audix & Shure mic package with active Radial DIs',
      stageDimensions: '22ft x 14ft stage with 8x8 drum riser',
      notes: 'Load-in via alley roll-up door on 10th Ave.'
    },
    notes: 'Iconic Capitol Hill indie venue. Strict curfew at 11:30 PM on weekdays.'
  },
  {
    id: 'venue-3',
    name: 'The Triple Door',
    address: '216 S Main St, Seattle, WA 98104',
    contactPerson: 'Elena Rostova',
    phone: '(206) 838-4333',
    email: 'events@thetripledoor.net',
    capacity: '300 seated theater',
    website: 'https://thetripledoor.net',
    techEquipment: {
      paSoundSystem: 'Yamaha CL5 Console, L-Acoustics coaxial speaker system',
      lighting: 'Warm theatrical spotlights and soft stage wash',
      drumKit: 'Not provided (Acoustic artist setup only)',
      amps: 'Fender Blues Junior / Acoustic DI setups',
      micsDi: 'Neumann & Shure condenser mics for acoustic instruments',
      stageDimensions: '20ft x 12ft hardwood stage',
      notes: 'Dine-in theater venue. Quiet stage volume required.'
    },
    notes: 'Exquisite acoustic listening room in historic basement space.'
  }
];

export const INITIAL_ARTISTS: Artist[] = [
  {
    id: 'artist-1',
    name: 'The Neon Shadows',
    genre: 'Indie Rock / Synthwave',
    bio: 'An eclectic 4-piece band combining the nostalgic warmth of 80s synthesizers with gritty garage rock guitars. Based out of Seattle, they have built a reputation for high-octane live shows and immersive visual experiences.',
    members: [
      { id: 'm-1', name: 'Maya Linn', role: 'Vocals, Keys', gearLink: 'https://www.shure.com', instagramUrl: 'https://instagram.com/mayalinn' },
      { id: 'm-2', name: 'Chris Miller', role: 'Guitar', gearLink: 'https://www.fender.com', instagramUrl: 'https://instagram.com/chrismiller' },
      { id: 'm-3', name: 'Leo Vance', role: 'Bass', gearLink: 'https://www.ampeg.com', instagramUrl: 'https://instagram.com/leovance' },
      { id: 'm-4', name: 'Sarah Chen', role: 'Drums', gearLink: 'https://www.zildjian.com', instagramUrl: 'https://instagram.com/sarahchen' }
    ],
    contactEmail: 'booking@neonshadowsband.com',
    instagramUrl: 'https://instagram.com/theneonshadows',
    facebookUrl: 'https://facebook.com/theneonshadows',
    spotifyUrl: 'https://open.spotify.com/artist/43ZHCT0c0IEg8bzo7Xb86R',
    soundcloudUrl: 'https://soundcloud.com/theneonshadows',
    youtubeUrl: 'https://youtube.com/c/theneonshadows',
    appleMusicUrl: 'https://music.apple.com/us/artist/theneonshadows',
    bandcampUrl: 'https://theneonshadows.bandcamp.com',
    tiktokUrl: 'https://tiktok.com/@theneonshadows',
    twitterUrl: 'https://twitter.com/neon_shadows_band',
    photos: [
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80'
    ],
    pastPerformances: [
      { id: 'perf-1', eventName: 'KEXP Live Broadcast Session', venue: 'KEXP Gathering Space', date: '2025-11-12', location: 'Seattle, WA', attendance: 450, notes: 'Broadcasted live to over 50,000 online listeners.' },
      { id: 'perf-2', eventName: 'Bumbershoot Festival - Indie Stage', venue: 'Seattle Center', date: '2025-08-30', location: 'Seattle, WA', attendance: 3500, notes: 'Opened the main evening rock bill with great crowd reception.' },
      { id: 'perf-3', eventName: 'Capitol Hill Block Party', venue: 'Main Stage', date: '2025-07-18', location: 'Seattle, WA', attendance: 2200, notes: 'Late afternoon slot, energetic mosh pit formed!' }
    ]
  },
  {
    id: 'artist-2',
    name: 'Fable & Fern',
    genre: 'Acoustic Folk / Americana',
    bio: 'An intimate singer-songwriter duo crafting rich vocal harmonies and intricate acoustic fingerpicking, singing tales of Oregon timberwoods and ocean breezes.',
    members: [
      { id: 'm-5', name: 'Clara Bell', role: 'Vocals, Banjo, Guitar', gearLink: 'https://www.taylorguitars.com', instagramUrl: 'https://instagram.com/clarabell' },
      { id: 'm-6', name: 'Jameson West', role: 'Guitar, Mandolin, Harmonica', gearLink: 'https://www.gibson.com', instagramUrl: 'https://instagram.com/jamesonwest' }
    ],
    contactEmail: 'fableandfern@acousticgigs.com',
    instagramUrl: 'https://instagram.com/fableandfern',
    spotifyUrl: 'https://open.spotify.com/artist/23FOsh7c0IEg8bzo7Xb82E',
    soundcloudUrl: 'https://soundcloud.com/fableandfern',
    youtubeUrl: 'https://youtube.com/c/fableandfern',
    bandcampUrl: 'https://fableandfern.bandcamp.com',
    photos: [
      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1485278537138-4e8911a13c02?auto=format&fit=crop&w=1200&q=80'
    ],
    pastPerformances: [
      { id: 'perf-4', eventName: 'Portland Folk Festival', venue: 'McMenamins Crystal Ballroom', date: '2025-10-04', location: 'Portland, OR', attendance: 1200, notes: 'Performed an acoustic-only set with stunning 3-part vocal harmonies.' },
      { id: 'perf-5', eventName: 'The Triple Door Acoustic Night', venue: 'The Triple Door', date: '2025-05-15', location: 'Seattle, WA', attendance: 400, notes: 'Sold out seating hall. Recorded a live EP from this performance.' }
    ]
  }
];

export const INITIAL_SONGS: Song[] = [
  // The Neon Shadows Songs
  {
    id: 'song-1',
    title: 'Midnight Transmission',
    artistId: 'artist-1',
    durationSec: 224,
    bpm: 120,
    key: 'A Minor',
    isOriginal: true,
    status: 'ready'
  },
  {
    id: 'song-2',
    title: 'Retrograde Heart',
    artistId: 'artist-1',
    durationSec: 198,
    bpm: 114,
    key: 'E Minor',
    isOriginal: true,
    status: 'ready'
  },
  {
    id: 'song-3',
    title: 'Echo Chambers',
    artistId: 'artist-1',
    durationSec: 250,
    bpm: 128,
    key: 'D Minor',
    isOriginal: true,
    status: 'ready'
  },
  {
    id: 'song-4',
    title: 'Blue Neon Horizon',
    artistId: 'artist-1',
    durationSec: 215,
    bpm: 105,
    key: 'C Major',
    isOriginal: true,
    status: 'ready'
  },
  {
    id: 'song-5',
    title: 'Love Will Tear Us Apart (Joy Division Cover)',
    artistId: 'artist-1',
    durationSec: 205,
    bpm: 121,
    key: 'E Minor',
    isOriginal: false,
    status: 'ready'
  },
  {
    id: 'song-6',
    title: 'Friction Burns',
    artistId: 'artist-1',
    durationSec: 180,
    bpm: 140,
    key: 'G Major',
    isOriginal: true,
    status: 'learning'
  },
  // Fable & Fern Songs
  {
    id: 'song-7',
    title: 'Pine Needle Path',
    artistId: 'artist-2',
    durationSec: 265,
    bpm: 88,
    key: 'G Major',
    isOriginal: true,
    status: 'ready'
  },
  {
    id: 'song-8',
    title: 'Riverbed Stones',
    artistId: 'artist-2',
    durationSec: 210,
    bpm: 96,
    key: 'C Major',
    isOriginal: true,
    status: 'ready'
  },
  {
    id: 'song-9',
    title: 'Oregon Rain',
    artistId: 'artist-2',
    durationSec: 242,
    bpm: 82,
    key: 'D Major',
    isOriginal: true,
    status: 'ready'
  },
  {
    id: 'song-10',
    title: 'Wagon Wheel (Cover)',
    artistId: 'artist-2',
    durationSec: 230,
    bpm: 105,
    key: 'A Major',
    isOriginal: false,
    status: 'ready'
  },
  {
    id: 'song-11',
    title: 'Stray Whispers',
    artistId: 'artist-2',
    durationSec: 195,
    bpm: 90,
    key: 'A Minor',
    isOriginal: true,
    status: 'learning'
  }
];

export const INITIAL_GIGS: Gig[] = [
  {
    id: 'gig-1',
    title: 'Album Release Showcase',
    artistId: 'artist-1',
    venueName: 'The Crocodile',
    venueAddress: '2200 2nd Ave, Seattle, WA 98121',
    dateTime: '2026-07-15T20:00:00',
    durationMinutes: 90,
    ticketPrice: 15,
    ticketUrl: 'https://thecrocodile.com/events/neon-shadows-album-release',
    description: 'A headline night to celebrate the release of our second full-length synth-rock album \"Retrograde\". Supporting act: Spark & Static.',
    status: 'confirmed',
    notes: 'Load-in starts at 4:30 PM. Soundcheck at 6:00 PM. Merch booth setup in the back-right corner next to the main bar. Spark & Static goes on at 8:00 PM, we start at 9:15 PM sharp.',
    merchStockStatus: 'ready',
    merchStockNotes: 'Stock packed: 35 Retrograde Black Tees (5 S, 10 M, 12 L, 8 XL), 20 Vinyl LPs, 50 Holographic Stickers, Square Terminal + $100 float box.',
    merchChecklist: {
      tshirts: true,
      hoodies: true,
      vinyls: true,
      stickers: true,
      cardReader: true,
      cashFloat: true,
      tableLighting: true,
    },
    promoChecklist: {
      pressRelease: true,
      socialPost: true,
      flyerDistributed: false,
      outreachCompleted: true,
      ticketsLive: true
    }
  },
  {
    id: 'gig-2',
    title: 'Folk Night Fridays',
    artistId: 'artist-2',
    venueName: 'The Sunset Tavern',
    venueAddress: '5433 Ballard Ave NW, Seattle, WA 98107',
    dateTime: '2026-07-24T19:30:00',
    durationMinutes: 60,
    ticketPrice: 12,
    ticketUrl: 'https://sunsettavern.com/folk-night-fridays',
    description: 'An acoustic candlelit session hosted by Jameson & Clara, highlighting our new woodwind collaborations.',
    status: 'confirmed',
    notes: 'Guitar tuning check: drop-D tuning for oregon rain. No drum kit allowed, percussionist using cajon. Load-in at 5:30 PM.',
    merchStockStatus: 'low_stock',
    merchStockNotes: 'Only 6 Medium Pine Forest tees left in stock. Need to restock before August dates. Bring acoustic CD digipaks and enamel pins.',
    merchChecklist: {
      tshirts: false,
      hoodies: false,
      vinyls: true,
      stickers: true,
      cardReader: true,
      cashFloat: true,
      tableLighting: false,
    },
    promoChecklist: {
      pressRelease: false,
      socialPost: true,
      flyerDistributed: true,
      outreachCompleted: false,
      ticketsLive: true
    }
  },
  {
    id: 'gig-3',
    title: 'Block Party Festival',
    artistId: 'artist-1',
    venueName: 'Capitol Hill Block Stage',
    venueAddress: 'E Pike St & 10th Ave, Seattle, WA 98122',
    dateTime: '2026-08-01T16:00:00',
    durationMinutes: 45,
    ticketPrice: 45,
    ticketUrl: 'https://capitolhillblockparty.com/tickets',
    description: 'Afternoon high-energy outdoor set for Capitol Hill Block Party 2026!',
    status: 'draft',
    notes: 'Awaiting contract signatures. Festival main stage gear is fully provided. Only bring guitars, pedals, and synth rack.',
    merchStockStatus: 'check_needed',
    merchStockNotes: 'Festival merch booth is shared. Prepare tote bags and high-volume T-shirt quantities (approx 75 units).',
    merchChecklist: {
      tshirts: false,
      hoodies: false,
      vinyls: false,
      stickers: false,
      cardReader: true,
      cashFloat: false,
      tableLighting: false,
    },
    promoChecklist: {
      pressRelease: false,
      socialPost: false,
      flyerDistributed: false,
      outreachCompleted: false,
      ticketsLive: false
    }
  }
];

export const INITIAL_SETLISTS: Setlist[] = [
  {
    id: 'setlist-1',
    gigId: 'gig-1',
    songs: [
      { songId: 'song-1', order: 1 },
      { songId: 'song-3', order: 2 },
      { songId: 'song-5', order: 3 },
      { songId: 'song-2', order: 4 },
      { songId: 'song-4', order: 5 }
    ]
  },
  {
    id: 'setlist-2',
    gigId: 'gig-2',
    songs: [
      { songId: 'song-7', order: 1 },
      { songId: 'song-8', order: 2 },
      { songId: 'song-10', order: 3 },
      { songId: 'song-9', order: 4 }
    ]
  }
];

export const INITIAL_BUDGETS: BudgetItem[] = [
  // Gig 1 (Crocodile Showcase)
  {
    id: 'b-1',
    gigId: 'gig-1',
    title: 'Guaranteed Performance Fee',
    amount: 500,
    type: 'income',
    category: 'guarantee',
    date: '2026-07-15'
  },
  {
    id: 'b-2',
    gigId: 'gig-1',
    title: 'Door Ticket Split',
    amount: 350,
    type: 'income',
    category: 'door_split',
    date: '2026-07-15'
  },
  {
    id: 'b-3',
    gigId: 'gig-1',
    title: 'Vinyl & Tee Sales',
    amount: 240,
    type: 'income',
    category: 'merch',
    date: '2026-07-15'
  },
  {
    id: 'b-4',
    gigId: 'gig-1',
    title: 'Instagram Paid Ads Campaign',
    amount: 75,
    type: 'expense',
    category: 'promo_ads',
    date: '2026-07-01'
  },
  {
    id: 'b-5',
    gigId: 'gig-1',
    title: 'Poster Screen Printing',
    amount: 110,
    type: 'expense',
    category: 'other',
    date: '2026-07-03'
  },
  {
    id: 'b-6',
    gigId: 'gig-1',
    title: 'Band Van Gas',
    amount: 40,
    type: 'expense',
    category: 'travel',
    date: '2026-07-15'
  },

  // Gig 2 (Sunset Tavern Folk Night)
  {
    id: 'b-7',
    gigId: 'gig-2',
    title: 'Sunset Tavern Fixed Fee',
    amount: 250,
    type: 'income',
    category: 'guarantee',
    date: '2026-07-24'
  },
  {
    id: 'b-8',
    gigId: 'gig-2',
    title: 'Tips Jar Cash',
    amount: 95,
    type: 'income',
    category: 'tips',
    date: '2026-07-24'
  },
  {
    id: 'b-9',
    gigId: 'gig-2',
    title: 'Sound Tech Fee',
    amount: 50,
    type: 'expense',
    category: 'commission',
    date: '2026-07-24'
  },
  {
    id: 'b-10',
    gigId: 'gig-2',
    title: 'Post-gig Dinner',
    amount: 35,
    type: 'expense',
    category: 'food_drink',
    date: '2026-07-24'
  }
];
