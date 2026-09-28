import React, { useState } from 'react';
import { Gig, Artist, NotablePerformance } from '../types';
import { Calendar, MapPin, Clock, DollarSign, ExternalLink, Music2, Youtube, Instagram, Facebook, Globe, Users, Mail, ArrowLeft, ArrowRight, Image as ImageIcon, Play, Disc } from 'lucide-react';
import { motion } from 'motion/react';

interface PublicEventPageProps {
  gig: Gig;
  artist: Artist;
  onBackToApp?: () => void;
}

export function PublicEventPage({ gig, artist, onBackToApp }: PublicEventPageProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const gigDate = new Date(gig.dateTime);
  const photos = artist.photos && artist.photos.length > 0 ? artist.photos : [
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80'
  ];

  const title = encodeURIComponent(gig.title);
  const details = encodeURIComponent(gig.description || 'Live Performance');
  const location = encodeURIComponent(`${gig.venueName}, ${gig.venueAddress}`);
  const startDate = gigDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
  const endDate = new Date(gigDate.getTime() + gig.durationMinutes * 60000).toISOString().replace(/-|:|\.\d\d\d/g, "");
  const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" id="public-event-page-root">
      {/* Background Ambience */}
      <div 
        className="absolute top-0 left-0 right-0 h-[600px] bg-cover bg-center opacity-10 pointer-events-none blur-3xl transition-all"
        style={{ backgroundImage: `url(${photos[activeImageIndex]})` }}
      />

      {/* Floating Header */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Disc className="text-purple-400 animate-spin" size={20} style={{ animationDuration: '6s' }} />
          <span className="font-display font-black tracking-wider text-xs text-slate-300">BANDZDE SHOWCASE</span>
        </div>
        {onBackToApp && (
          <button 
            onClick={onBackToApp}
            className="flex items-center gap-1 text-xs text-purple-400 font-mono font-bold border border-purple-500/20 bg-purple-500/5 px-3 py-1.5 rounded-lg hover:bg-purple-500/10 cursor-pointer"
          >
            <ArrowLeft size={12} />
            <span>Console</span>
          </button>
        )}
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Media & Artist Mini EPK */}
        <div className="md:col-span-7 space-y-6">
          {/* Main Visual Frame */}
          <div className="relative rounded-2xl overflow-hidden aspect-video border border-slate-800 shadow-2xl group bg-slate-900">
            <img 
              src={photos[activeImageIndex]} 
              alt={gig.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div>
                <span className="text-[9px] bg-purple-600 text-white font-bold px-2 py-0.5 rounded uppercase font-mono tracking-wider">
                  Live Event Cover
                </span>
                <h2 className="text-lg font-black font-display text-slate-50 mt-1 uppercase tracking-tight drop-shadow-md">
                  {gig.venueName}
                </h2>
              </div>
              {photos.length > 1 && (
                <div className="flex gap-1.5 bg-slate-950/70 p-1.5 rounded-lg border border-slate-800/80 backdrop-blur-sm">
                  {photos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                        activeImageIndex === idx ? 'bg-purple-500 scale-110' : 'bg-slate-600 hover:bg-slate-400'
                      }`}
                      title={`View Cover Photo ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Performing Artist Bio Card */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-400 font-mono tracking-widest">PERFORMING ARTIST</span>
                <h3 className="text-xl font-bold text-slate-100 font-display uppercase tracking-tight mt-0.5">
                  {artist.name}
                </h3>
                <span className="inline-block text-xs font-mono text-slate-400 mt-1">
                  {artist.genre}
                </span>
              </div>
              <a 
                href={`/artist/${artist.id}`}
                className="text-[10px] text-purple-400 hover:text-purple-300 hover:underline font-bold transition-all border border-purple-500/20 bg-purple-500/5 px-2.5 py-1 rounded font-mono"
              >
                View Full EPK &rarr;
              </a>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950/20 p-3.5 rounded-xl border border-slate-850/60 whitespace-pre-wrap">
              "{artist.bio || 'Seattle-based independent artist paving custom sonic highways.'}"
            </p>

            {/* Social handles and Music Links */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-850/50">
              {artist.spotifyUrl && (
                <a 
                  href={artist.spotifyUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-850 px-3 py-1.5 rounded-lg text-[10px] text-slate-300 transition-all font-mono"
                >
                  <Music2 size={11} className="text-emerald-500" />
                  <span>Spotify</span>
                </a>
              )}
              {artist.soundcloudUrl && (
                <a 
                  href={artist.soundcloudUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-850 px-3 py-1.5 rounded-lg text-[10px] text-slate-300 transition-all font-mono"
                >
                  <Disc size={11} className="text-orange-500" />
                  <span>SoundCloud</span>
                </a>
              )}
              {artist.youtubeUrl && (
                <a 
                  href={artist.youtubeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-850 px-3 py-1.5 rounded-lg text-[10px] text-slate-300 transition-all font-mono"
                >
                  <Youtube size={11} className="text-red-500" />
                  <span>YouTube</span>
                </a>
              )}
              {artist.instagramUrl && (
                <a 
                  href={artist.instagramUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-850 px-3 py-1.5 rounded-lg text-[10px] text-slate-300 transition-all font-mono"
                >
                  <Instagram size={11} className="text-pink-400" />
                  <span>Instagram</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Event Details & Action Box */}
        <div className="md:col-span-5 space-y-6">
          {/* Main Booking Ticket Card */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-purple-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            {/* Ticket Cutout Details */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-950 border-r-2 border-purple-500/20" />
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-950 border-l-2 border-purple-500/20" />

            <div className="space-y-4">
              <div className="border-b border-dashed border-slate-800 pb-4 text-center">
                <span className="text-[10px] font-mono tracking-widest text-purple-400 font-bold uppercase">OFFICIAL CONCERT TICKET</span>
                <h1 className="text-xl font-black font-display tracking-tight text-slate-100 mt-1 uppercase line-clamp-2">
                  {gig.title}
                </h1>
              </div>

              {/* Event Metadata block */}
              <div className="space-y-3 pt-2">
                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-purple-400">
                    <Calendar size={15} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block leading-none">Date</span>
                    <span className="text-xs font-bold text-slate-200 mt-1 block">
                      {gigDate.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-purple-400">
                    <Clock size={15} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block leading-none">Time & Duration</span>
                    <span className="text-xs font-bold text-slate-200 mt-1 block">
                      {gigDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({gig.durationMinutes} mins Set)
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-purple-400">
                    <MapPin size={15} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block leading-none">Location & Venue</span>
                    <span className="text-xs font-bold text-slate-200 mt-1 block">
                      {gig.venueName}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {gig.venueAddress}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-purple-400">
                    <DollarSign size={15} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block leading-none">Admission Fee</span>
                    <span className="text-sm font-black text-purple-400 mt-1 block">
                      {gig.ticketPrice > 0 ? `$${gig.ticketPrice.toFixed(2)}` : 'Free Admission / RSVP'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 space-y-2 border-t border-dashed border-slate-800">
                {gig.ticketUrl ? (
                  <a 
                    href={gig.ticketUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black tracking-wider uppercase text-center py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/10 cursor-pointer active:translate-y-0.5 transition-all text-xs border border-purple-500/20"
                  >
                    <span>Secure Your Tickets</span>
                    <ExternalLink size={14} />
                  </a>
                ) : (
                  <button 
                    disabled
                    className="w-full bg-slate-850 text-slate-500 font-bold text-center py-3 rounded-xl text-xs"
                  >
                    No Ticket Link Provided
                  </button>
                )}

                <a 
                  href={googleCalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all cursor-pointer no-underline"
                >
                  <span>Add to Google Calendar</span>
                </a>
              </div>
            </div>
          </div>

          {/* Description Block */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Show Description</h4>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              {gig.description || 'Join us for a stellar live performance. Experience original cuts, premium live acoustics, and unmatched community energy. Doors open 30 minutes before showtime.'}
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-[10px] text-slate-600 relative z-10">
        <p>Powered by **Bandz** — Connecting Independent Artists with Live Crowds.</p>
      </footer>
    </div>
  );
}

interface PublicArtistProfileProps {
  artist: Artist;
  onBackToApp?: () => void;
}

export function PublicArtistProfile({ artist, onBackToApp }: PublicArtistProfileProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const photos = artist.photos && artist.photos.length > 0 ? artist.photos : [
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=80'
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" id="public-artist-profile-root">
      {/* Visual Header Banner */}
      <div className="h-64 sm:h-80 w-full relative overflow-hidden border-b border-slate-900">
        <img 
          src={photos[0]} 
          alt={artist.name} 
          className="w-full h-full object-cover blur-[2px] scale-105 opacity-40"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-slate-950/20" />
        
        {/* Banner Overlays */}
        <div className="absolute bottom-6 left-6 right-6 max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 z-10">
          <div>
            <span className="text-[10px] bg-purple-600 text-white font-bold px-2.5 py-0.5 rounded font-mono uppercase tracking-widest">
              OFFICIAL ARTIST EPK
            </span>
            <h1 className="text-3xl sm:text-4xl font-black font-display text-slate-50 mt-1.5 uppercase tracking-tight">
              {artist.name}
            </h1>
            <p className="text-xs font-mono text-purple-400 mt-0.5">
              {artist.genre}
            </p>
          </div>
          
          {onBackToApp && (
            <button 
              onClick={onBackToApp}
              className="flex items-center gap-1.5 text-xs text-purple-400 font-mono font-bold border border-purple-500/20 bg-purple-500/5 px-3.5 py-2 rounded-xl hover:bg-purple-500/10 cursor-pointer"
            >
              <ArrowLeft size={12} />
              <span>Back to Console</span>
            </button>
          )}
        </div>
      </div>

      {/* Main EPK Grid Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
        {/* Left Core Profile Content */}
        <div className="md:col-span-8 space-y-8">
          {/* Biography Block */}
          <section className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
              <span>Biography & Journey</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
              {artist.bio || 'An independent artist dedicated to crafting immersive sonic experiences and sharing unforgettable live sets. Bio section currently being updated.'}
            </p>
          </section>

          {/* High Resolution Gallery Grid */}
          <section className="space-y-4">
            <h2 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2">
              <ImageIcon size={14} className="text-purple-400" />
              <span>High-Resolution Photo Gallery</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {photos.map((photo, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedPhoto(photo)}
                  className="group relative rounded-xl overflow-hidden aspect-[4/3] border border-slate-900 hover:border-purple-500/40 bg-slate-900 cursor-pointer transition-all"
                >
                  <img 
                    src={photo} 
                    alt={`${artist.name} Press ${idx + 1}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/0 transition-all" />
                  <span className="absolute bottom-2 right-2 text-[8px] font-mono text-slate-400 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800">
                    Press #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Past Notable Performances Timeline */}
          <section className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-5">
            <h2 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2">
              <Calendar size={14} className="text-purple-400" />
              <span>Notable Performance History</span>
            </h2>

            {artist.pastPerformances && artist.pastPerformances.length > 0 ? (
              <div className="relative pl-4 border-l-2 border-slate-800 space-y-6">
                {artist.pastPerformances.map((perf, index) => (
                  <div key={perf.id || index} className="relative">
                    {/* Node Circle */}
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-purple-500 ring-4 ring-slate-950" />
                    
                    <div className="space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-200">
                          {perf.eventName}
                        </h4>
                        <span className="text-[10px] font-mono bg-slate-950 text-slate-400 border border-slate-850 px-2 py-0.5 rounded shrink-0 self-start sm:self-auto">
                          {perf.date ? new Date(perf.date).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown Date'}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin size={10} className="text-slate-500" />
                          {perf.venue}, {perf.location}
                        </span>
                        {perf.attendance && (
                          <span className="text-purple-400 font-bold font-mono">
                            Attendance: {perf.attendance.toLocaleString()}+
                          </span>
                        )}
                      </div>

                      {perf.notes && (
                        <p className="text-[10px] text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-slate-850/30 leading-relaxed max-w-2xl">
                          {perf.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No notable performance logs entered yet for this artist.</p>
            )}
          </section>
        </div>

        {/* Right Sidebar: Music Links, Members, Booking Contact Box */}
        <div className="md:col-span-4 space-y-6">
          {/* Music Streaming Links Block */}
          <div className="bg-slate-900/60 border border-slate-900 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">LISTEN & CONNECT</h3>
            
            <div className="grid grid-cols-1 gap-2.5">
              {artist.spotifyUrl && (
                <a 
                  href={artist.spotifyUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between bg-slate-950 hover:bg-slate-900 border border-slate-850 px-3.5 py-3 rounded-xl text-xs text-slate-300 hover:text-slate-100 transition-all font-mono"
                >
                  <div className="flex items-center gap-2.5">
                    <Music2 size={16} className="text-emerald-500" />
                    <span>Spotify Profile</span>
                  </div>
                  <ExternalLink size={12} className="text-slate-500" />
                </a>
              )}

              {artist.soundcloudUrl && (
                <a 
                  href={artist.soundcloudUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between bg-slate-950 hover:bg-slate-900 border border-slate-850 px-3.5 py-3 rounded-xl text-xs text-slate-300 hover:text-slate-100 transition-all font-mono"
                >
                  <div className="flex items-center gap-2.5">
                    <Disc size={16} className="text-orange-500 animate-spin" style={{ animationDuration: '4s' }} />
                    <span>SoundCloud</span>
                  </div>
                  <ExternalLink size={12} className="text-slate-500" />
                </a>
              )}

              {artist.youtubeUrl && (
                <a 
                  href={artist.youtubeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between bg-slate-950 hover:bg-slate-900 border border-slate-850 px-3.5 py-3 rounded-xl text-xs text-slate-300 hover:text-slate-100 transition-all font-mono"
                >
                  <div className="flex items-center gap-2.5">
                    <Youtube size={16} className="text-red-500" />
                    <span>YouTube Channel</span>
                  </div>
                  <ExternalLink size={12} className="text-slate-500" />
                </a>
              )}

              {artist.bandcampUrl && (
                <a 
                  href={artist.bandcampUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between bg-slate-950 hover:bg-slate-900 border border-slate-850 px-3.5 py-3 rounded-xl text-xs text-slate-300 hover:text-slate-100 transition-all font-mono"
                >
                  <div className="flex items-center gap-2.5">
                    <Globe size={16} className="text-cyan-500" />
                    <span>Bandcamp Store</span>
                  </div>
                  <ExternalLink size={12} className="text-slate-500" />
                </a>
              )}

              {/* Handles */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-850/65 mt-1">
                {artist.instagramUrl && (
                  <a href={artist.instagramUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-slate-950 p-2 rounded-lg border border-slate-850 text-[10px] text-slate-400 hover:text-slate-200">
                    <Instagram size={10} className="text-pink-400" />
                    <span className="truncate">Instagram</span>
                  </a>
                )}
                {artist.facebookUrl && (
                  <a href={artist.facebookUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-slate-950 p-2 rounded-lg border border-slate-850 text-[10px] text-slate-400 hover:text-slate-200">
                    <Facebook size={10} className="text-blue-500" />
                    <span className="truncate">Facebook</span>
                  </a>
                )}
                {artist.tiktokUrl && (
                  <a href={artist.tiktokUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-slate-950 p-2 rounded-lg border border-slate-850 text-[10px] text-slate-400 hover:text-slate-200">
                    <Globe size={10} className="text-teal-400" />
                    <span className="truncate">TikTok</span>
                  </a>
                )}
                {artist.twitterUrl && (
                  <a href={artist.twitterUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-slate-950 p-2 rounded-lg border border-slate-850 text-[10px] text-slate-400 hover:text-slate-200">
                    <Globe size={10} className="text-sky-400" />
                    <span className="truncate">Twitter</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Members list */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Users size={13} className="text-purple-400" />
              <span>Band Roster & Crew</span>
            </h3>

            <div className="space-y-2.5">
              {artist.members.map((member) => (
                <div key={member.id} className="flex justify-between items-center text-xs border-b border-slate-850/40 pb-2 last:border-0 last:pb-0">
                  <span className="font-bold text-slate-200">{member.name}</span>
                  <span className="text-[10px] bg-slate-950 text-slate-400 border border-slate-850 px-2 py-0.5 rounded font-mono">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Direct Booking Email Box */}
          <div className="bg-gradient-to-r from-purple-500/10 to-purple-500/[0.02] border border-purple-500/20 rounded-2xl p-5 text-center space-y-3">
            <Mail size={24} className="text-purple-400 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-200 uppercase">Book {artist.name}</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Send a detailed inquiry regarding touring slots, venue bookings, festivals, or press features.
              </p>
            </div>
            <a 
              href={`mailto:${artist.contactEmail}`}
              className="block bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-xl text-xs font-mono transition-all border border-purple-500/20 shadow-md"
            >
              {artist.contactEmail}
            </a>
          </div>
        </div>
      </main>

      {/* Lightbox Backdrop Modal */}
      {selectedPhoto && (
        <div 
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="max-w-4xl max-h-[85vh] relative" onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedPhoto} 
              alt="EPK High-Res Press Spot" 
              className="rounded-lg object-contain max-w-full max-h-[80vh] border border-slate-800"
              referrerPolicy="no-referrer"
            />
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 p-2 rounded-lg cursor-pointer text-xs font-bold"
            >
              ✕ Close
            </button>
          </div>
        </div>
      )}

      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-[10px] text-slate-600">
        <p>© 2026 Bandz EPK Portal. Designed for Independent Artists.</p>
      </footer>
    </div>
  );
}
