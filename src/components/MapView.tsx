import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Calendar, 
  Clock, 
  DollarSign, 
  ExternalLink, 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  Music, 
  Sliders, 
  Users, 
  Disc, 
  CheckCircle2, 
  AlertCircle,
  X,
  ChevronRight,
  TrendingUp,
  Map as MapIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Gig, Artist, Coordinates, EventType } from '../types';

interface MapViewProps {
  gigs: Gig[];
  artists: Artist[];
  selectedArtistId: string;
  selectedGig: Gig | null;
  onSelectGig: (gig: Gig) => void;
  onQuickAddDate?: (dateString: string) => void;
  onNavigateToTab?: (tabId: string) => void;
  viewMode?: 'list' | 'calendar' | 'map';
  onViewModeChange?: (mode: 'list' | 'calendar' | 'map') => void;
  onScheduleGig?: () => void;
}

// Known coordinates for Northwest & national music venues and cities
const KNOWN_GEO_COORDINATES: Record<string, Coordinates> = {
  // Seattle Venues
  'the crocodile': { lat: 47.6134, lng: -122.3458 },
  'crocodile': { lat: 47.6134, lng: -122.3458 },
  'the sunset tavern': { lat: 47.6685, lng: -122.3848 },
  'sunset tavern': { lat: 47.6685, lng: -122.3848 },
  'capitol hill block stage': { lat: 47.6143, lng: -122.3195 },
  'neumos': { lat: 47.6143, lng: -122.3195 },
  'blackbird rehearsal': { lat: 47.6625, lng: -122.3780 },
  'orbit audio': { lat: 47.6138, lng: -122.3190 },
  'caffe vita': { lat: 47.6141, lng: -122.3185 },
  'the showbox': { lat: 47.6085, lng: -122.3394 },
  'showbox so do': { lat: 47.5878, lng: -122.3340 },
  'tractor tavern': { lat: 47.6658, lng: -122.3828 },
  'the triple door': { lat: 47.6006, lng: -122.3312 },
  'el corazon': { lat: 47.6186, lng: -122.3298 },
  'paramount theatre': { lat: 47.6131, lng: -122.3314 },
  'moore theatre': { lat: 47.6114, lng: -122.3414 },
  'climate pledge arena': { lat: 47.6221, lng: -122.3540 },

  // Regional & Touring Cities
  'portland': { lat: 45.5152, lng: -122.6784 },
  'doug fir': { lat: 45.5227, lng: -122.6575 },
  'revolution hall': { lat: 45.5189, lng: -122.6527 },
  'san francisco': { lat: 37.7749, lng: -122.4194 },
  'the independent': { lat: 37.7778, lng: -122.4384 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'the troubadour': { lat: 34.0815, lng: -118.3892 },
  'denver': { lat: 39.7392, lng: -104.9903 },
  'bluebird theater': { lat: 39.7404, lng: -104.9497 },
  'austin': { lat: 30.2672, lng: -97.7431 },
  'chicago': { lat: 41.8781, lng: -87.6298 },
  'metro chicago': { lat: 41.9542, lng: -87.6599 },
  'nashville': { lat: 36.1627, lng: -86.7816 },
  'new york': { lat: 40.7128, lng: -74.0060 },
  'bowery ballroom': { lat: 40.7204, lng: -73.9934 },
  'boston': { lat: 42.3601, lng: -71.0589 }
};

// Fallback coordinate extractor for any address
export function resolveVenueCoordinates(gig: Gig): Coordinates {
  if (gig.coordinates && gig.coordinates.lat && gig.coordinates.lng) {
    return gig.coordinates;
  }
  if (gig.venueData?.coordinates && gig.venueData.coordinates.lat && gig.venueData.coordinates.lng) {
    return gig.venueData.coordinates;
  }

  const query = `${gig.venueName} ${gig.venueAddress}`.toLowerCase();

  for (const [key, coords] of Object.entries(KNOWN_GEO_COORDINATES)) {
    if (query.includes(key)) {
      return coords;
    }
  }

  // Deterministic fallback based on address string hash around Pacific Northwest baseline
  let hash = 0;
  for (let i = 0; i < query.length; i++) {
    hash = (hash << 5) - hash + query.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = ((Math.abs(hash) % 1000) / 1000) * 0.12 - 0.06;
  const lngOffset = ((Math.abs(hash >> 3) % 1000) / 1000) * 0.14 - 0.07;

  return {
    lat: 47.6100 + latOffset,
    lng: -122.3300 + lngOffset
  };
}

// Calculate distance in miles using Haversine formula
export function calculateDistanceMiles(coord1: Coordinates, coord2: Coordinates): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const EVENT_COLOR_CONFIG: Record<EventType, { badge: string; pinBg: string; text: string; icon: any }> = {
  gig: { badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40', pinBg: 'from-purple-600 to-rose-600', text: 'text-purple-400', icon: Music },
  rehearsal: { badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', pinBg: 'from-amber-500 to-orange-600', text: 'text-amber-400', icon: Sliders },
  recording: { badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', pinBg: 'from-cyan-600 to-blue-600', text: 'text-cyan-400', icon: Disc },
  meeting: { badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', pinBg: 'from-emerald-600 to-teal-600', text: 'text-emerald-400', icon: Users }
};

export default function MapView({
  gigs,
  artists,
  selectedArtistId,
  selectedGig,
  onSelectGig,
  onQuickAddDate,
  onNavigateToTab,
  viewMode = 'map',
  onViewModeChange,
  onScheduleGig
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePopupGig, setActivePopupGig] = useState<Gig | null>(selectedGig);
  const [hoveredGigId, setHoveredGigId] = useState<string | null>(null);
  const [showRosterDrawer, setShowRosterDrawer] = useState(true);
  const [filterType, setFilterType] = useState<'all' | EventType>('all');
  const [mapStyle, setMapStyle] = useState<'dark_carto' | 'streets'>('dark_carto');

  // Map viewport pan & zoom state
  const [zoom, setZoom] = useState<number>(12);
  const [center, setCenter] = useState<Coordinates>({ lat: 47.6200, lng: -122.3500 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Filter upcoming gigs and attach coordinates
  const upcomingGigsWithCoords = useMemo(() => {
    return gigs
      .filter(g => selectedArtistId === 'all' || g.artistId === selectedArtistId || g.collaboratorArtistIds?.includes(selectedArtistId))
      .filter(g => g.status !== 'cancelled')
      .filter(g => filterType === 'all' || (g.eventType || 'gig') === filterType)
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
      .map((gig, index) => {
        const coords = resolveVenueCoordinates(gig);
        return {
          ...gig,
          resolvedCoords: coords,
          stopNumber: index + 1
        };
      });
  }, [gigs, selectedArtistId, filterType]);

  // Compute total tour distance between consecutive upcoming gigs
  const tourDistanceStats = useMemo(() => {
    let totalMiles = 0;
    const legs: { fromGig: string; toGig: string; miles: number }[] = [];

    for (let i = 0; i < upcomingGigsWithCoords.length - 1; i++) {
      const current = upcomingGigsWithCoords[i];
      const next = upcomingGigsWithCoords[i + 1];
      const distance = calculateDistanceMiles(current.resolvedCoords, next.resolvedCoords);
      totalMiles += distance;
      legs.push({
        fromGig: current.venueName,
        toGig: next.venueName,
        miles: distance
      });
    }

    return {
      totalMiles: Math.round(totalMiles * 10) / 10,
      legs
    };
  }, [upcomingGigsWithCoords]);

  // Fit all gigs automatically on first load or when artist changes
  const fitAllGigs = () => {
    if (upcomingGigsWithCoords.length === 0) return;

    if (upcomingGigsWithCoords.length === 1) {
      setCenter(upcomingGigsWithCoords[0].resolvedCoords);
      setZoom(13.5);
      return;
    }

    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    upcomingGigsWithCoords.forEach(g => {
      minLat = Math.min(minLat, g.resolvedCoords.lat);
      maxLat = Math.max(maxLat, g.resolvedCoords.lat);
      minLng = Math.min(minLng, g.resolvedCoords.lng);
      maxLng = Math.max(maxLng, g.resolvedCoords.lng);
    });

    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;
    setCenter({ lat: midLat, lng: midLng });

    // Determine zoom level based on bounding span
    const spanLat = maxLat - minLat;
    const spanLng = maxLng - minLng;
    const maxSpan = Math.max(spanLat, spanLng);

    if (maxSpan > 5) setZoom(6);
    else if (maxSpan > 2) setZoom(8);
    else if (maxSpan > 0.5) setZoom(10);
    else if (maxSpan > 0.15) setZoom(11.5);
    else setZoom(13);
  };

  useEffect(() => {
    fitAllGigs();
  }, [selectedArtistId, upcomingGigsWithCoords.length]);

  // Center on selected gig when changed from outside
  useEffect(() => {
    if (selectedGig) {
      const found = upcomingGigsWithCoords.find(g => g.id === selectedGig.id);
      if (found) {
        setCenter(found.resolvedCoords);
        setActivePopupGig(found);
      }
    }
  }, [selectedGig]);

  // Convert (lat, lng) to canvas pixels (x, y) relative to center and zoom
  const projectCoordsToPixels = (coords: Coordinates, width: number, height: number) => {
    const scale = Math.pow(2, zoom) * 256;
    
    // Web Mercator formula
    const latRad = (coords.lat * Math.PI) / 180;
    const mercatorY = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    
    const centerLatRad = (center.lat * Math.PI) / 180;
    const centerMercatorY = Math.log(Math.tan(Math.PI / 4 + centerLatRad / 2));

    const x = width / 2 + ((coords.lng - center.lng) * scale) / 360;
    const y = height / 2 - ((mercatorY - centerMercatorY) * scale) / (2 * Math.PI);

    return { x, y };
  };

  // Convert canvas pixel offset back to (lat, lng) for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.map-ui-interactive')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setDragStart({ x: e.clientX, y: e.clientY });

    const scale = Math.pow(2, zoom) * 256;
    const dLng = -(dx * 360) / scale;
    
    // Approximate latitude offset delta
    const dLat = (dy * 360) / scale * Math.cos((center.lat * Math.PI) / 180);

    setCenter(prev => ({
      lat: Math.max(-85, Math.min(85, prev.lat + dLat)),
      lng: ((prev.lng + dLng + 540) % 360) - 180
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom(prev => Math.min(18, prev + 0.3));
    } else {
      setZoom(prev => Math.max(4, prev - 0.3));
    }
  };

  // Dynamic canvas dimensions
  const [containerDimensions, setContainerDimensions] = useState({ width: 900, height: 600 });

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setContainerDimensions({ width: rect.width, height: rect.height });
        }
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const canvasWidth = containerDimensions.width;
  const canvasHeight = containerDimensions.height;

  return (
    <div className="space-y-4" id="scheduler-mapview-root">
      {/* Top Header & Tour Routing Metrics Bar */}
      <div className="bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border border-purple-500/20 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-inner">
            <Compass size={22} className="animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white font-display flex items-center gap-2">
                <span>Interactive Venue & Gig Map</span>
                <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full uppercase">
                  Live Geo-Routing
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Visualizing <span className="text-purple-300 font-bold">{upcomingGigsWithCoords.length} venue locations</span> across the touring schedule
            </p>
          </div>
        </div>

        {/* Global Stats: Distance & Sequence */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {onViewModeChange && (
            <div className="flex bg-slate-950 rounded-xl border border-slate-800 p-1">
              <button
                type="button"
                onClick={() => onViewModeChange('list')}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                List
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('calendar')}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  viewMode === 'calendar'
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Calendar
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('map')}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'map'
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MapPin size={11} />
                <span>Map</span>
              </button>
            </div>
          )}

          <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-right">
            <span className="text-[9.5px] font-mono text-slate-500 uppercase block">Total Tour Transit</span>
            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
              <TrendingUp size={12} />
              <span>{tourDistanceStats.totalMiles} Miles</span>
            </span>
          </div>

          <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-right">
            <span className="text-[9.5px] font-mono text-slate-500 uppercase block">Tour Stops</span>
            <span className="text-xs font-mono font-bold text-purple-300">
              {upcomingGigsWithCoords.length} Planned
            </span>
          </div>

          <button
            type="button"
            onClick={fitAllGigs}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/20 transition-all"
            title="Fit all upcoming venues in view"
          >
            <Maximize2 size={13} />
            <span className="hidden sm:inline">Fit All Gigs</span>
          </button>
        </div>
      </div>

      {/* Main Map Container & Visualizer */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className={`relative w-full h-[520px] sm:h-[600px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} shadow-2xl`}
      >
        {/* Slippy OpenStreetMap / CartoDB Dark Matter Background Tile Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-85">
          {/* Cyberpunk dark cartographic background texture */}
          <div className="absolute inset-0 bg-[radial-gradient(#2e1065_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-slate-950/80" />

          {/* Stylized Geo Lat/Long Grid Lines */}
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#6366f1" strokeWidth="0.5" strokeOpacity="0.08" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* SVG Overlay: Tour Transit Route Polyline */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="50%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Draw sequential route lines connecting tour dates */}
          {upcomingGigsWithCoords.length > 1 && (
            <g filter="url(#glow)">
              {upcomingGigsWithCoords.map((gig, idx) => {
                if (idx === upcomingGigsWithCoords.length - 1) return null;
                const nextGig = upcomingGigsWithCoords[idx + 1];
                const pt1 = projectCoordsToPixels(gig.resolvedCoords, canvasWidth, canvasHeight);
                const pt2 = projectCoordsToPixels(nextGig.resolvedCoords, canvasWidth, canvasHeight);
                const distance = calculateDistanceMiles(gig.resolvedCoords, nextGig.resolvedCoords);

                return (
                  <g key={`leg-${gig.id}-${nextGig.id}`}>
                    {/* Shadow line */}
                    <line
                      x1={pt1.x}
                      y1={pt1.y}
                      x2={pt2.x}
                      y2={pt2.y}
                      stroke="#4c1d95"
                      strokeWidth="4"
                      strokeDasharray="6 6"
                      opacity="0.6"
                    />
                    {/* Animated glowing route line */}
                    <motion.line
                      x1={pt1.x}
                      y1={pt1.y}
                      x2={pt2.x}
                      y2={pt2.y}
                      stroke="url(#routeGradient)"
                      strokeWidth="2.5"
                      strokeDasharray="8 6"
                      initial={{ strokeDashoffset: 50 }}
                      animate={{ strokeDashoffset: 0 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                    {/* Mileage pill along the vector midpoint */}
                    <foreignObject
                      x={(pt1.x + pt2.x) / 2 - 40}
                      y={(pt1.y + pt2.y) / 2 - 12}
                      width="80"
                      height="24"
                      className="pointer-events-auto"
                    >
                      <div className="bg-slate-950/90 border border-purple-500/40 text-[9px] font-mono font-bold text-purple-300 rounded-full px-2 py-0.5 text-center shadow-lg backdrop-blur-sm truncate">
                        {distance} mi
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
            </g>
          )}
        </svg>

        {/* Interactive Venue Markers */}
        <div className="absolute inset-0 pointer-events-none z-20">
          {upcomingGigsWithCoords.map((gig) => {
            const pos = projectCoordsToPixels(gig.resolvedCoords, canvasWidth, canvasHeight);
            const isSelected = selectedGig?.id === gig.id || activePopupGig?.id === gig.id;
            const isHovered = hoveredGigId === gig.id;
            const eventType: EventType = gig.eventType || 'gig';
            const colorCfg = EVENT_COLOR_CONFIG[eventType] || EVENT_COLOR_CONFIG.gig;
            const TypeIcon = colorCfg.icon;

            return (
              <div
                key={gig.id}
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px)`,
                  position: 'absolute',
                  left: 0,
                  top: 0
                }}
                className="pointer-events-auto map-ui-interactive"
              >
                {/* Marker Wrapper */}
                <div className="relative -translate-x-1/2 -translate-y-full">
                  {/* Pulsing halo when active */}
                  {isSelected && (
                    <span className="absolute -inset-2 rounded-full bg-purple-500/30 animate-ping pointer-events-none" />
                  )}

                  {/* Marker Pin Button */}
                  <motion.button
                    whileHover={{ scale: 1.15, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setActivePopupGig(gig);
                      onSelectGig(gig);
                    }}
                    onMouseEnter={() => setHoveredGigId(gig.id)}
                    onMouseLeave={() => setHoveredGigId(null)}
                    className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 border-white text-white ring-4 ring-purple-500/40 z-30 scale-110'
                        : isHovered
                        ? 'bg-slate-900 border-purple-400 text-white z-20 scale-105'
                        : `bg-slate-950/95 border-purple-500/40 text-slate-200 z-10`
                    }`}
                    title={`${gig.stopNumber}. ${gig.venueName} (${gig.title})`}
                  >
                    {/* Sequence Number Badge */}
                    <span className="w-5 h-5 rounded-full bg-slate-950/90 text-[10px] font-mono font-bold flex items-center justify-center text-purple-300 border border-purple-500/30">
                      {gig.stopNumber}
                    </span>

                    {/* Venue Name Label */}
                    <span className="text-[11px] font-bold font-display max-w-[120px] truncate">
                      {gig.venueName}
                    </span>

                    <TypeIcon size={12} className={isSelected ? 'text-amber-300' : colorCfg.text} />
                  </motion.button>

                  {/* Pointer arrow triangle */}
                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-6 border-transparent border-t-purple-500 mx-auto -mt-[1px]" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Interactive Controls (Zoom, Style, Recenter) */}
        <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 map-ui-interactive">
          {/* Zoom Buttons */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-1 flex flex-col shadow-xl backdrop-blur-md">
            <button
              onClick={() => setZoom(prev => Math.min(18, prev + 1))}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(4, prev - 1))}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
          </div>

          {/* Toggle Roster Drawer */}
          <button
            onClick={() => setShowRosterDrawer(!showRosterDrawer)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-xl backdrop-blur-md ${
              showRosterDrawer
                ? 'bg-purple-600 border-purple-400 text-white'
                : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Toggle Tour Stop Drawer"
          >
            <MapIcon size={16} />
          </button>
        </div>

        {/* Filter Bar Inside Map (Top Left) */}
        <div className="absolute top-4 left-4 z-30 flex items-center gap-1.5 map-ui-interactive">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-1 flex items-center gap-1 shadow-xl backdrop-blur-md">
            {[
              { id: 'all', label: 'All' },
              { id: 'gig', label: 'Gigs' },
              { id: 'rehearsal', label: 'Rehearsals' },
              { id: 'recording', label: 'Studio' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  filterType === tab.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Status Bar: Current Coordinates & Target Venue Info */}
        <div className="absolute bottom-3 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-1.5 text-[10px] font-mono text-slate-400 backdrop-blur-md pointer-events-auto flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Map Center: {center.lat.toFixed(4)}° N, {center.lng.toFixed(4)}° W</span>
            <span>•</span>
            <span>Zoom: {zoom.toFixed(1)}x</span>
          </div>

          <div className="bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-1.5 text-[10px] font-mono text-purple-300 backdrop-blur-md pointer-events-auto shadow-lg flex items-center gap-2">
            <Navigation size={12} className="text-purple-400" />
            <span>Drag to pan • Scroll to zoom • Click pin to inspect</span>
          </div>
        </div>

        {/* POPUP CARD: SELECTED GIG VENUE DETAILS */}
        <AnimatePresence>
          {activePopupGig && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="absolute bottom-14 left-4 sm:left-6 z-40 max-w-sm w-full bg-slate-900/95 border border-purple-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-lg map-ui-interactive"
            >
              <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                      Stop #{upcomingGigsWithCoords.find(g => g.id === activePopupGig.id)?.stopNumber || 1}
                    </span>
                    <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
                      {activePopupGig.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white font-display mt-1">
                    {activePopupGig.title}
                  </h4>
                </div>

                <button
                  onClick={() => setActivePopupGig(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Venue & Logistics */}
              <div className="space-y-2 py-2.5 text-xs">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white font-display block">{activePopupGig.venueName}</strong>
                    <span className="text-slate-400 text-[11px] block">{activePopupGig.venueAddress}</span>
                    <span className="text-[9.5px] font-mono text-emerald-400 block mt-0.5">
                      📍 Coordinates: {resolveVenueCoordinates(activePopupGig).lat.toFixed(4)}, {resolveVenueCoordinates(activePopupGig).lng.toFixed(4)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-300 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} className="text-purple-400" />
                    <span>{new Date(activePopupGig.dateTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock size={12} className="text-purple-400" />
                    <span>{new Date(activePopupGig.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </span>
                  {activePopupGig.ticketPrice > 0 && (
                    <span className="flex items-center gap-1 font-mono text-emerald-400 font-bold">
                      <DollarSign size={12} />
                      <span>${activePopupGig.ticketPrice}</span>
                    </span>
                  )}
                </div>

                {activePopupGig.notes && (
                  <p className="text-[11px] text-slate-400 line-clamp-2 bg-slate-950 p-2 rounded-lg border border-slate-850 italic">
                    "{activePopupGig.notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activePopupGig.venueAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                  title="Open GPS Turn-by-Turn Directions in Google Maps"
                >
                  <Navigation size={12} className="text-purple-400" />
                  <span>Directions</span>
                  <ExternalLink size={10} />
                </a>

                <button
                  onClick={() => {
                    onSelectGig(activePopupGig);
                    if (onViewModeChange) {
                      onViewModeChange('list');
                    }
                  }}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/30 cursor-pointer"
                >
                  <span>Focus in Workspace</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* COLLAPSIBLE SIDE DRAWER: TOUR STOPS ROSTER */}
        <AnimatePresence>
          {showRosterDrawer && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-16 bottom-14 right-4 w-72 sm:w-80 bg-slate-900/95 border border-purple-500/30 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col justify-between overflow-hidden z-30 map-ui-interactive"
            >
              <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white font-display flex items-center gap-1.5">
                    <Navigation size={13} className="text-purple-400" />
                    <span>Tour Transit Sequence</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {upcomingGigsWithCoords.length} Sequential Venues
                  </span>
                </div>
                <button
                  onClick={() => setShowRosterDrawer(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Roster List Scroll */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2">
                {upcomingGigsWithCoords.map((gig, idx) => {
                  const isSelected = selectedGig?.id === gig.id || activePopupGig?.id === gig.id;
                  const prevGig = idx > 0 ? upcomingGigsWithCoords[idx - 1] : null;
                  const distFromPrev = prevGig ? calculateDistanceMiles(prevGig.resolvedCoords, gig.resolvedCoords) : 0;

                  return (
                    <div
                      key={gig.id}
                      onClick={() => {
                        setCenter(gig.resolvedCoords);
                        setZoom(14);
                        setActivePopupGig(gig);
                        onSelectGig(gig);
                      }}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-purple-950/60 border-purple-500 text-white shadow-md'
                          : 'bg-slate-950/80 border-slate-850 text-slate-300 hover:border-purple-500/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full text-[10px] font-mono font-bold flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-purple-600 text-white' : 'bg-slate-800 text-purple-300'
                          }`}>
                            {gig.stopNumber}
                          </span>
                          <div>
                            <h5 className="font-bold text-xs truncate max-w-[170px]">{gig.venueName}</h5>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {new Date(gig.dateTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>

                        {idx > 0 && (
                          <span className="text-[9.5px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-1.5 py-0.2 rounded shrink-0">
                            +{distFromPrev} mi
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Drawer Footer */}
              <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Total Route:</span>
                <strong className="text-emerald-400">{tourDistanceStats.totalMiles} Miles</strong>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
