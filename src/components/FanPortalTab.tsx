import React, { useState } from 'react';
import { Artist, Gig, FanProfile, FanNotification } from '../types';
import { Heart, Bell, Calendar, Music, User, Check, ExternalLink, Sparkles, MapPin, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FanPortalTabProps {
  artists: Artist[];
  gigs: Gig[];
  fanProfiles: FanProfile[];
  notifications: FanNotification[];
  onUpdateFanProfile: (profile: FanProfile) => void;
  onMarkNotificationRead: (notificationId: string) => void;
}

export default function FanPortalTab({
  artists,
  gigs,
  fanProfiles,
  notifications,
  onUpdateFanProfile,
  onMarkNotificationRead,
}: FanPortalTabProps) {
  const [activeFanId, setActiveFanId] = useState<string>(fanProfiles[0]?.id || 'fan-1');
  const [subTab, setSubTab] = useState<'artists' | 'notifications' | 'feed'>('artists');

  const currentFan = fanProfiles.find(f => f.id === activeFanId) || fanProfiles[0] || {
    id: 'fan-1',
    name: 'Alex Rivera (Music Fan)',
    email: 'alex.fan@bandz.io',
    followedArtistIds: []
  };

  const handleToggleFollow = (artistId: string) => {
    const isFollowing = currentFan.followedArtistIds.includes(artistId);
    const updatedFollows = isFollowing
      ? currentFan.followedArtistIds.filter(id => id !== artistId)
      : [...currentFan.followedArtistIds, artistId];

    onUpdateFanProfile({
      ...currentFan,
      followedArtistIds: updatedFollows
    });
  };

  const fanNotifications = notifications.filter(n => n.fanId === currentFan.id);
  const unreadCount = fanNotifications.filter(n => !n.read).length;

  // Gigs by followed artists
  const followedGigs = gigs.filter(g => currentFan.followedArtistIds.includes(g.artistId));

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Fan Persona Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Fan Follow System & Notifications
            </span>
            <span className="text-xs text-slate-400">Supporter Experience</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-100 flex items-center gap-2.5">
            <Heart className="text-rose-400 fill-rose-400/20" size={26} />
            Fan Portal & Artist Updates
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl">
            Follow your favorite independent bands and artists. Receive instant notifications the moment they announce new tour dates and live gigs!
          </p>
        </div>

        {/* Fan Persona Switcher */}
        <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800 shrink-0">
          <span className="text-xs font-semibold text-slate-400 pl-2">Fan Account:</span>
          <select
            value={activeFanId}
            onChange={(e) => setActiveFanId(e.target.value)}
            className="bg-slate-900 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-rose-500 cursor-pointer"
          >
            {fanProfiles.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setSubTab('artists')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            subTab === 'artists'
              ? 'bg-slate-800 text-slate-100 border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Music size={14} className="text-rose-400" />
          <span>Discover & Follow Artists</span>
          <span className="bg-slate-900 px-1.5 py-0.5 rounded-full text-[10px] text-slate-300">
            {currentFan.followedArtistIds.length} Following
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('notifications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            subTab === 'notifications'
              ? 'bg-slate-800 text-slate-100 border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Bell size={14} className="text-amber-400" />
          <span>Notifications Feed</span>
          {unreadCount > 0 && (
            <span className="bg-rose-600 text-white px-1.5 py-0.5 rounded-full text-[10px] font-black animate-pulse">
              {unreadCount} new
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setSubTab('feed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            subTab === 'feed'
              ? 'bg-slate-800 text-slate-100 border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Calendar size={14} className="text-purple-400" />
          <span>Upcoming Gigs from Followed Artists</span>
          <span className="bg-slate-900 px-1.5 py-0.5 rounded-full text-[10px] text-slate-300">
            {followedGigs.length}
          </span>
        </button>
      </div>

      {/* SUB-TAB 1: DISCOVER & FOLLOW ARTISTS */}
      {subTab === 'artists' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold font-display text-slate-100">Featured Artists & Bands</h3>
            <p className="text-xs text-slate-400">
              Click 'Follow' on any artist to get instant notifications when they book new shows, release setlists, or schedule tours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {artists.map(artist => {
              const isFollowing = currentFan.followedArtistIds.includes(artist.id);
              const artistGigsCount = gigs.filter(g => g.artistId === artist.id).length;

              return (
                <div
                  key={artist.id}
                  className="bg-slate-900 border border-slate-800 hover:border-rose-500/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                          {artist.genre}
                        </span>
                        <h4 className="text-lg font-bold font-display text-slate-100 mt-2 group-hover:text-rose-300 transition-colors">
                          {artist.name}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleFollow(artist.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                          isFollowing
                            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                        }`}
                      >
                        <Heart size={14} className={isFollowing ? 'fill-white' : ''} />
                        <span>{isFollowing ? 'Following' : 'Follow'}</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      {artist.bio}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} className="text-purple-400" />
                        {artistGigsCount} Scheduled Gigs
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={13} className="text-emerald-400" />
                        {artist.members?.length || 0} Members
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Contact: {artist.contactEmail}</span>
                    <span className="text-xs font-semibold text-rose-400">
                      {isFollowing ? '★ Active Fan Alert' : 'Tap to Follow'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: NOTIFICATIONS FEED */}
      {subTab === 'notifications' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold font-display text-slate-100">Gig & Tour Notifications</h3>
              <p className="text-xs text-slate-400">
                Instant notifications sent when artists you follow announce new concerts or live performances.
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  fanNotifications.forEach(n => {
                    if (!n.read) onMarkNotificationRead(n.id);
                  });
                }}
                className="text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-500/30 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                Mark All as Read
              </button>
            )}
          </div>

          <div className="space-y-3">
            {fanNotifications.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <Bell size={28} className="mx-auto text-slate-500" />
                <h4 className="font-bold text-slate-200 text-sm">No notifications yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Follow artists in the discover tab to receive instant updates when they book new gigs!
                </p>
              </div>
            ) : (
              fanNotifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => !notif.read && onMarkNotificationRead(notif.id)}
                  className={`bg-slate-900 border rounded-2xl p-4 transition-all flex items-start gap-4 cursor-pointer shadow-lg ${
                    notif.read ? 'border-slate-800 opacity-80' : 'border-rose-500/50 bg-slate-900/90 ring-1 ring-rose-500/20'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    notif.read ? 'bg-slate-800 text-slate-400' : 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  }`}>
                    <Bell size={18} />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-400">{notif.artistName}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(notif.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-100">{notif.message}</p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <MapPin size={12} /> {notif.venueName}
                      </span>
                      <span className="flex items-center gap-1 text-purple-400">
                        <Clock size={12} /> {new Date(notif.dateTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {!notif.read && (
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 self-center shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: UPCOMING GIGS OF FOLLOWED ARTISTS */}
      {subTab === 'feed' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold font-display text-slate-100">Upcoming Gigs from Followed Artists</h3>
            <p className="text-xs text-slate-400">
              Personalized tour calendar of all live shows hosted by artists you follow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {followedGigs.length === 0 ? (
              <div className="col-span-full bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <Calendar size={28} className="mx-auto text-slate-500" />
                <h4 className="font-bold text-slate-200 text-sm">No scheduled gigs found for followed artists</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Follow more artists or check back when they announce new tour dates.
                </p>
              </div>
            ) : (
              followedGigs.map(gig => {
                const artist = artists.find(a => a.id === gig.artistId);
                return (
                  <div
                    key={gig.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                          {artist?.name || 'Artist'}
                        </span>
                        <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                          ${gig.ticketPrice} Tickets
                        </span>
                      </div>

                      <h4 className="text-base font-bold font-display text-slate-100">{gig.title}</h4>

                      <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                        <MapPin size={13} /> {gig.venueName} — {gig.venueAddress}
                      </p>

                      <p className="text-xs text-purple-300 flex items-center gap-1.5">
                        <Clock size={13} /> {new Date(gig.dateTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} @ {new Date(gig.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>

                      <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        {gig.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">Status: {gig.status}</span>
                      {gig.ticketUrl && (
                        <a
                          href={gig.ticketUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                        >
                          <span>Get Tickets</span> <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
