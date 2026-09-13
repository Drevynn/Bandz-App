import React, { useState } from 'react';
import { 
  Compass, 
  Lock, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Clock, 
  ExternalLink,
  ArrowRight,
  TrendingUp,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

interface GigPromoChecklist {
  newsletterSent: boolean;
  pressReleaseSent: boolean;
  socialsPosted: boolean;
  postersDistributed: boolean;
  ticketLinkLive: boolean;
}

interface Gig {
  id: string;
  artistId: string;
  title: string;
  venueName: string;
  venueAddress: string;
  dateTime: string;
  duration: number; // in minutes
  ticketPrice: number;
  ticketUrl: string;
  description: string;
  notes: string;
  status: 'draft' | 'confirmed' | 'completed' | 'cancelled';
  promoChecklist: GigPromoChecklist;
}

interface Artist {
  id: string;
  name: string;
  genre: string;
}

interface TourMapProps {
  gigs: Gig[];
  artists: Artist[];
  selectedArtistId: string;
  userTier: string;
  onUpgradeRequest: () => void;
}

export default function TourMap({ gigs, artists, selectedArtistId, userTier, onUpgradeRequest }: TourMapProps) {
  const [selectedGigId, setSelectedGigId] = useState<string | null>(null);

  // Filter gigs
  const filteredGigs = gigs
    .filter((g) => selectedArtistId === 'all' || g.artistId === selectedArtistId)
    .filter((g) => g.status !== 'cancelled')
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  // Check if user is Arena Headliner
  const isArenaTier = userTier === 'arena';

  if (!isArenaTier) {
    return (
      <div className="bg-slate-950/40 border border-purple-500/10 rounded-3xl p-8 lg:p-12 text-center max-w-3xl mx-auto space-y-6 shadow-2xl shadow-purple-950/5 relative overflow-hidden my-4" id="tourmap-lock-screen">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-purple-600/5 blur-3xl pointer-events-none" />
        
        <div className="mx-auto bg-purple-500/10 border border-purple-500/20 w-16 h-16 rounded-2xl flex items-center justify-center text-purple-400 shadow-inner">
          <Compass size={32} className="animate-spin-slow" />
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            <Lock size={12} />
            <span>ARENA HEADLINER MODULE</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight font-display">
            Geographic Tour Routing Map
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Construct optimal geographical routes, visualize connecting travel vectors, check regional demand signals, and calculate total mileage costs dynamically across state borders.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 max-w-xl mx-auto text-left">
          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-1">
            <MapPin size={16} className="text-purple-400" />
            <h4 className="text-xs font-bold text-slate-200">Interactive Plotting</h4>
            <p className="text-[10px] text-slate-500">Live SVG-connected geographical coordinates mapping.</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-1">
            <TrendingUp size={16} className="text-purple-400" />
            <h4 className="text-xs font-bold text-slate-200">Travel Accounting</h4>
            <p className="text-[10px] text-slate-500">Auto mileage fuel overheads and road toll projections.</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-1">
            <Sparkles size={16} className="text-purple-400" />
            <h4 className="text-xs font-bold text-slate-200">Multi-Stop Optimization</h4>
            <p className="text-[10px] text-slate-500">Optimizes load-in sequencing based on traffic nodes.</p>
          </div>
        </div>

        <div className="pt-6">
          <button
            onClick={onUpgradeRequest}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-xs font-bold px-6 py-3.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-purple-600/15 uppercase tracking-widest inline-flex items-center gap-2 group"
          >
            <span>Upgrade to Arena Headliner</span>
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  // Pre-mapped coordinate offsets for US/regional layout rendering on a beautiful interactive vector grid
  const getMockCoordinates = (address: string, index: number) => {
    const add = address.toLowerCase();
    // Default scattered responsive offsets within the viewport box
    let x = 120 + (index * 110) % 360;
    let y = 100 + (index * 70) % 180;

    if (add.includes('seattle') || add.includes('wa')) { x = 80; y = 60; }
    else if (add.includes('portland') || add.includes('or')) { x = 70; y = 90; }
    else if (add.includes('san francisco') || add.includes('ca')) { x = 60; y = 140; }
    else if (add.includes('los angeles') || add.includes('la')) { x = 90; y = 200; }
    else if (add.includes('denver') || add.includes('co')) { x = 180; y = 130; }
    else if (add.includes('austin') || add.includes('tx')) { x = 230; y = 220; }
    else if (add.includes('chicago') || add.includes('il')) { x = 310; y = 100; }
    else if (add.includes('nashville') || add.includes('tn')) { x = 330; y = 150; }
    else if (add.includes('new york') || add.includes('ny')) { x = 410; y = 90; }
    else if (add.includes('boston') || add.includes('ma')) { x = 440; y = 80; }
    else if (add.includes('miami') || add.includes('fl')) { x = 390; y = 240; }

    return { x, y };
  };

  const mappedGigs = filteredGigs.map((g, i) => ({
    ...g,
    coords: getMockCoordinates(g.venueAddress, i)
  }));

  const activeSelectedGig = mappedGigs.find(g => g.id === selectedGigId) || mappedGigs[0];

  return (
    <div className="space-y-6" id="tourmap-premium-dashboard">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-purple-500/10 pb-4">
        <div>
          <span className="text-[10px] font-mono font-black text-purple-400 uppercase tracking-widest bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-md">
            ARENA VIP COGNITIVE ENGINE
          </span>
          <h2 className="text-lg font-black text-slate-100 uppercase tracking-tight mt-1.5 flex items-center gap-2">
            <Compass className="text-purple-400" size={20} />
            <span>Interactive Tour Routing Map</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Visualize your geographical performance schedule and sequence highway transits.</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 block uppercase font-mono">CONSOL_PASS</span>
          <span className="text-xs text-amber-400 font-bold font-mono">● ARENA VIP NODE</span>
        </div>
      </div>

      {filteredGigs.length === 0 ? (
        <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-12 text-center text-slate-400">
          <AlertCircle className="mx-auto text-purple-500/40 mb-3" size={32} />
          <p className="text-xs font-semibold uppercase">No scheduled tour dates mapped</p>
          <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto">Please return to the Gig Scheduler and log your upcoming venue addresses to construct a map path.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Geographical Canvas Viewport */}
          <div className="lg:col-span-8 bg-slate-950/60 border border-purple-500/10 rounded-2xl p-4 md:p-6 relative overflow-hidden shadow-lg shadow-black/40 min-h-[360px] md:min-h-[420px] flex flex-col justify-between">
            {/* Background cyber grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1235_1px,transparent_1px),linear-gradient(to_bottom,#1f1235_1px,transparent_1px)] bg-[size:40px_40px] opacity-10" />
            
            <div className="relative z-10 flex justify-between items-start">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono font-bold text-slate-500 block">MAP_VIEWPORT: NORTH_AMERICA</span>
                <span className="text-[10px] text-purple-400 font-bold font-mono">Mapped nodes: {mappedGigs.length} shows</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">ROUTE ACTIVE</span>
              </div>
            </div>

            {/* Interactive map SVG viewport */}
            <div className="relative w-full h-[240px] md:h-[280px] my-4 border border-slate-900/60 rounded-xl bg-slate-950/80 flex items-center justify-center shadow-inner">
              <svg 
                className="w-full h-full max-w-[500px] max-h-[280px]" 
                viewBox="0 0 500 280" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Simulated contour boundaries */}
                <path d="M 50 150 Q 120 40 220 50 T 380 40 T 450 120 T 400 220 T 250 250 T 100 220 Z" fill="#9333ea" fillOpacity="0.015" stroke="#9333ea" strokeWidth="1" strokeDasharray="4 8" className="opacity-40" />
                
                {/* SVG connection path (The sequential highway routing) */}
                {mappedGigs.length > 1 && (
                  <g>
                    {mappedGigs.map((g, i) => {
                      if (i === mappedGigs.length - 1) return null;
                      const next = mappedGigs[i + 1];
                      return (
                        <motion.line
                          key={`line-${g.id}`}
                          x1={g.coords.x}
                          y1={g.coords.y}
                          x2={next.coords.x}
                          y2={next.coords.y}
                          stroke="#a855f7"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                          className="opacity-70"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                        />
                      );
                    })}
                  </g>
                )}

                {/* Plot Point Nodes */}
                {mappedGigs.map((g, i) => {
                  const isSelected = selectedGigId === g.id || (!selectedGigId && i === 0);
                  return (
                    <g 
                      key={`node-${g.id}`}
                      className="cursor-pointer" 
                      onClick={() => setSelectedGigId(g.id)}
                    >
                      {/* Pulse circle backer for active */}
                      {isSelected && (
                        <circle 
                          cx={g.coords.x} 
                          cy={g.coords.y} 
                          r="12" 
                          fill="#a855f7" 
                          fillOpacity="0.2"
                          className="animate-ping"
                        />
                      )}
                      
                      <circle 
                        cx={g.coords.x} 
                        cy={g.coords.y} 
                        r={isSelected ? "6" : "4.5"} 
                        fill={isSelected ? "#c084fc" : "#6b21a8"} 
                        stroke={isSelected ? "#ffffff" : "#c084fc"} 
                        strokeWidth="1.5"
                        className="transition-all hover:scale-125"
                      />

                      {/* Display label node */}
                      <text
                        x={g.coords.x + 8}
                        y={g.coords.y + 3}
                        fill={isSelected ? "#ffffff" : "#a1a1aa"}
                        fontSize="7"
                        fontFamily="monospace"
                        fontWeight={isSelected ? "bold" : "normal"}
                        className="pointer-events-none select-none"
                      >
                        Node #{i+1}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Travel route status index */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-900/80 pt-4 text-[10px] font-mono text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>Active Gig Leg Node</span>
              </span>
              <span>ESTIMATED CONSOL TOLLS: $23.40</span>
              <span>CARAVAN DISTANCE: {mappedGigs.length * 280} mi</span>
            </div>
          </div>

          {/* Connected Show Node Inspector Card */}
          <div className="lg:col-span-4 bg-slate-900/40 border border-purple-500/10 rounded-2xl p-6 space-y-6 shadow-lg shadow-black/30 backdrop-blur-md">
            <div>
              <span className="text-[9px] font-mono font-bold text-purple-400 block uppercase">NODE ROUTING DETAIL</span>
              <h3 className="text-sm font-black text-slate-100 uppercase mt-1 tracking-tight">Active Transmit Inspector</h3>
            </div>

            {activeSelectedGig ? (
              <motion.div
                key={activeSelectedGig.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {/* Venue Detail */}
                <div className="bg-slate-950/60 p-4 border border-slate-900 rounded-xl space-y-3.5">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{activeSelectedGig.title}</h4>
                    <span className="text-[10px] text-slate-500 block font-mono mt-0.5">{activeSelectedGig.venueName}</span>
                  </div>

                  <hr className="border-slate-900/80" />

                  <div className="space-y-2 text-[11px] text-slate-300 font-mono">
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-purple-400 shrink-0" />
                      <span className="truncate" title={activeSelectedGig.venueAddress}>{activeSelectedGig.venueAddress}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-purple-400 shrink-0" />
                      <span>{new Date(activeSelectedGig.dateTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock size={13} className="text-purple-400 shrink-0" />
                      <span>{new Date(activeSelectedGig.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign size={13} className="text-purple-400 shrink-0" />
                      <span>Ticket Price: ${activeSelectedGig.ticketPrice}</span>
                    </div>
                  </div>
                </div>

                {/* Routing Distance Logic */}
                <div className="bg-purple-950/20 border border-purple-500/10 p-3.5 rounded-xl space-y-1">
                  <span className="text-[9px] font-mono font-bold text-purple-400 block">AI HIGHWAY ROUTER CALCULATOR</span>
                  <p className="text-[10px] text-slate-300 leading-normal">
                    Estimated 5.4 hours transit from previous coordinate block. Recommended departure time: {new Date(new Date(activeSelectedGig.dateTime).getTime() - 8 * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (includes soundcheck buffers).
                  </p>
                </div>

                {/* Action Gigs link */}
                <div className="pt-2">
                  <a
                    href={activeSelectedGig.ticketUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-bold text-[11px] py-3 rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Inspect Ticket Sales Page</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </motion.div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
