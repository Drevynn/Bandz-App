import React, { useState } from 'react';
import { Artist, NotablePerformance } from '../types';
import { Users, Mail, Compass, Music2, Plus, Edit3, Trash2, Instagram, Facebook, Globe, Calendar, MapPin, Sparkles, Image as ImageIcon, Link, Play, Disc, ExternalLink, PlusCircle, Apple, HelpCircle, Check, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PublicArtistProfile } from './PublicPages';

interface ArtistTabProps {
  artists: Artist[];
  selectedArtistId: string;
  onAddArtist: (artist: Artist) => void;
  onUpdateArtist: (artist: Artist) => void;
  onDeleteArtist: (artistId: string) => void;
}

const PRESET_PHOTOS = [
  { name: 'Live Concert Stage', url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Retro Synthesizer Deck', url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Sleek Recording Studio', url: 'https://images.unsplash.com/photo-1487180142328-054b783fc471?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Cozy Acoustic Studio', url: 'https://images.unsplash.com/photo-1485278537138-4e8911a13c02?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Massive Festival Crowd', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Gritty Electric Guitar', url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1200&q=80' }
];

export default function ArtistTab({
  artists,
  selectedArtistId,
  onAddArtist,
  onUpdateArtist,
  onDeleteArtist
}: ArtistTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingArtistId, setEditingArtistId] = useState<string | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<'info' | 'music' | 'photos' | 'performances' | 'collaborators'>('info');
  const [previewArtist, setPreviewArtist] = useState<Artist | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form States for main Artist fields
  const [name, setName] = useState('');
  const [genre, setGenre] = useState('');
  const [bio, setBio] = useState('');
  const [members, setMembers] = useState<string>(''); // Parses comma-separated
  const [contactEmail, setContactEmail] = useState('');
  
  // Music & Social Links
  const [instagramUrl, setInstagramUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [soundcloudUrl, setSoundcloudUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [appleMusicUrl, setAppleMusicUrl] = useState('');
  const [bandcampUrl, setBandcampUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  
  // Photo list Form State
  const [photos, setPhotos] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('Vintage 70s rock group portrait, grainy 35mm film, stage smoke and direct lighting');

  // Notable performance Form State (Sub-form)
  const [showPerfForm, setShowPerfForm] = useState(false);
  const [perfEventName, setPerfEventName] = useState('');
  const [perfVenue, setPerfVenue] = useState('');
  const [perfDate, setPerfDate] = useState('');
  const [perfLocation, setPerfLocation] = useState('');
  const [perfAttendance, setPerfAttendance] = useState('');
  const [perfNotes, setPerfNotes] = useState('');

  // Find currently focused artist
  const focusedArtist = artists.find(a => a.id === selectedArtistId) || artists[0];

  const handleOpenEdit = (artist: Artist) => {
    setEditingArtistId(artist.id);
    setName(artist.name);
    setGenre(artist.genre);
    setBio(artist.bio);
    setMembers(artist.members.map(m => `${m.name} (${m.role})`).join(', '));
    setContactEmail(artist.contactEmail);
    setInstagramUrl(artist.instagramUrl || '');
    setFacebookUrl(artist.facebookUrl || '');
    setSpotifyUrl(artist.spotifyUrl || '');
    setSoundcloudUrl(artist.soundcloudUrl || '');
    setYoutubeUrl(artist.youtubeUrl || '');
    setAppleMusicUrl(artist.appleMusicUrl || '');
    setBandcampUrl(artist.bandcampUrl || '');
    setTiktokUrl(artist.tiktokUrl || '');
    setTwitterUrl(artist.twitterUrl || '');
    setPhotos(artist.photos || []);
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingArtistId(null);
    setName('');
    setGenre('');
    setBio('');
    setMembers('');
    setContactEmail('');
    setInstagramUrl('');
    setFacebookUrl('');
    setSpotifyUrl('');
    setSoundcloudUrl('');
    setYoutubeUrl('');
    setAppleMusicUrl('');
    setBandcampUrl('');
    setTiktokUrl('');
    setTwitterUrl('');
    setPhotos([]);
    setNewPhotoUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !genre || !contactEmail) return;

    const membersArray = members
      .split(',')
      .map(m => m.trim())
      .filter(m => m.length > 0)
      .map(m => {
        const match = m.match(/(.*)\((.*)\)/);
        return {
          id: `member-${Date.now()}-${Math.random()}`,
          name: match ? match[1].trim() : m,
          role: match ? match[2].trim() : 'Member',
          gearLink: '',
          instagramUrl: ''
        };
      });

    // Merge existing performances or preserve them if editing
    const existingArtist = artists.find(a => a.id === editingArtistId);
    const pastPerformances = existingArtist?.pastPerformances || [];

    const artistData: Artist = {
      id: editingArtistId || `artist-${Date.now()}`,
      name,
      genre,
      bio,
      members: membersArray.length > 0 ? membersArray : [{ id: 'solo', name: name, role: 'Solo Artist' }],
      contactEmail,
      instagramUrl: instagramUrl || undefined,
      facebookUrl: facebookUrl || undefined,
      spotifyUrl: spotifyUrl || undefined,
      soundcloudUrl: soundcloudUrl || undefined,
      youtubeUrl: youtubeUrl || undefined,
      appleMusicUrl: appleMusicUrl || undefined,
      bandcampUrl: bandcampUrl || undefined,
      tiktokUrl: tiktokUrl || undefined,
      twitterUrl: twitterUrl || undefined,
      photos: photos.length > 0 ? photos : undefined,
      pastPerformances
    };

    if (editingArtistId) {
      onUpdateArtist(artistData);
    } else {
      onAddArtist(artistData);
    }

    handleCloseForm();
  };

  // Past performances sub-manager
  const handleAddPerformance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!focusedArtist || !perfEventName || !perfVenue) return;

    const newPerf: NotablePerformance = {
      id: `perf-${Date.now()}`,
      eventName: perfEventName,
      venue: perfVenue,
      date: perfDate,
      location: perfLocation,
      attendance: perfAttendance ? parseInt(perfAttendance) : undefined,
      notes: perfNotes || undefined
    };

    const updatedPerformances = [...(focusedArtist.pastPerformances || []), newPerf];
    onUpdateArtist({
      ...focusedArtist,
      pastPerformances: updatedPerformances
    });

    // Reset sub-form
    setPerfEventName('');
    setPerfVenue('');
    setPerfDate('');
    setPerfLocation('');
    setPerfAttendance('');
    setPerfNotes('');
    setShowPerfForm(false);
  };

  const handleDeletePerformance = (perfId: string) => {
    if (!focusedArtist) return;
    const filtered = (focusedArtist.pastPerformances || []).filter(p => p.id !== perfId);
    onUpdateArtist({
      ...focusedArtist,
      pastPerformances: filtered
    });
  };

  // Photos management helper
  const handleAddPhoto = () => {
    if (!newPhotoUrl) return;
    if (!photos.includes(newPhotoUrl)) {
      setPhotos([...photos, newPhotoUrl]);
    }
    setNewPhotoUrl('');
  };

  const handleSelectPresetPhoto = (url: string) => {
    if (!photos.includes(url)) {
      setPhotos([...photos, url]);
    }
  };

  const handleRemovePhoto = (urlToRemove: string) => {
    setPhotos(photos.filter(p => p !== urlToRemove));
  };

  const handleSimulateAiPhoto = () => {
    setAiGenerating(true);
    setTimeout(() => {
      // Pick a random gorgeous high-res band illustration preset URL
      const synthVibeImage = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80';
      const liveCloseUpImage = 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=80';
      const selection = Math.random() > 0.5 ? synthVibeImage : liveCloseUpImage;

      if (!photos.includes(selection)) {
        setPhotos([...photos, selection]);
      }
      setAiGenerating(false);
    }, 1800);
  };

  const copyShareLink = (artist: Artist) => {
    const link = `${window.location.origin}/artist/${artist.id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(artist.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Render Full Screen Simulated EPK
  if (previewArtist) {
    return (
      <PublicArtistProfile 
        artist={previewArtist} 
        onBackToApp={() => setPreviewArtist(null)} 
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="artist-profile-system-root">
      
      {/* 1. Artist Selection and Active EPK Details Profile Panel */}
      <div className="lg:col-span-7 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-black font-display text-slate-100 uppercase tracking-tight">Artist Profiles & EPKs</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Create, curate, and distribute high-fidelity Electronic Press Kits with photos, streaming links, and historical timelines.
            </p>
          </div>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-purple-600 hover:bg-purple-500 active:translate-y-0.5 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-purple-600/10 border border-purple-500/20 transition-all font-sans"
            >
              <Plus size={14} />
              <span>Register Artist Profile</span>
            </button>
          )}
        </div>

        {/* Display Focused Artist Profiles Card */}
        {artists.length === 0 ? (
          <div className="bg-slate-900/10 border border-slate-850 border-dashed rounded-2xl p-8 text-center text-slate-500">
            <Users size={32} className="text-slate-700 mx-auto mb-2" />
            <p className="text-xs">No artists registered. Click "Register Artist Profile" to begin.</p>
          </div>
        ) : (
          <div className="bg-slate-900/30 border border-slate-900 rounded-2xl overflow-hidden p-6 space-y-5">
            
            {/* Artist Select Carousel */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-slate-900 scrollbar-none">
              {artists.map((art) => {
                const isSelected = selectedArtistId === 'all' ? artists[0]?.id === art.id : art.id === selectedArtistId;
                return (
                  <button
                    key={art.id}
                    onClick={() => {
                      // Navigate workspace focus to this artist
                      const selectEl = document.querySelector('select');
                      if (selectEl) {
                        (selectEl as HTMLSelectElement).value = art.id;
                        try {
                          selectEl.dispatchEvent(new Event('change', { bubbles: true }));
                        } catch {
                          try {
                            const evt = document.createEvent('HTMLEvents');
                            evt.initEvent('change', true, false);
                            selectEl.dispatchEvent(evt);
                          } catch {
                            // ignore if dispatch is unsupported in iframe context
                          }
                        }
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold font-sans whitespace-nowrap transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' 
                        : 'bg-slate-950 hover:bg-slate-900 border border-slate-900 text-slate-400'
                    }`}
                  >
                    {art.name}
                  </button>
                );
              })}
            </div>

            {focusedArtist && (
              <div className="space-y-6">
                
                {/* Visual Bio Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black font-display text-slate-100 uppercase tracking-tight">{focusedArtist.name}</h3>
                      <button 
                        onClick={() => handleOpenEdit(focusedArtist)}
                        className="p-1.5 bg-slate-950 border border-slate-900 hover:border-slate-800 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-slate-100"
                        title="Edit Core Info"
                      >
                        <Edit3 size={12} />
                      </button>
                    </div>
                    <span className="inline-block text-xs text-purple-400 font-mono font-medium uppercase tracking-wider">
                      {focusedArtist.genre}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      onClick={() => setPreviewArtist(focusedArtist)}
                      className="flex items-center gap-1 bg-slate-950 hover:bg-slate-900 border border-slate-900 text-[10px] text-slate-300 px-3 py-1.5 rounded-xl font-mono font-bold cursor-pointer"
                    >
                      <Sparkles size={11} className="text-purple-400" />
                      <span>EPK Preview</span>
                    </button>

                    <button
                      onClick={() => copyShareLink(focusedArtist)}
                      className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-900 text-[10px] text-slate-300 px-3 py-1.5 rounded-xl font-mono cursor-pointer transition-all"
                    >
                      {copiedId === focusedArtist.id ? <Check size={11} className="text-emerald-400" /> : <Link size={11} />}
                      <span>{copiedId === focusedArtist.id ? 'Copied' : 'Copy EPK Link'}</span>
                    </button>
                  </div>
                </div>

                {/* Profile Tabs */}
                <div className="flex border-b border-slate-900">
                  {[
                    { id: 'info', label: 'Overview' },
                    { id: 'music', label: 'Streaming & Handles' },
                    { id: 'photos', label: `Gallery (${focusedArtist.photos?.length || 0})` },
                    { id: 'performances', label: `Performances (${focusedArtist.pastPerformances?.length || 0})` },
                    { id: 'collaborators', label: `Collaborators (${focusedArtist.linkedCollaborators?.length || 0})` }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveProfileTab(tab.id as any)}
                      className={`px-4 py-2 text-xs font-bold relative -mb-[1px] cursor-pointer transition-all ${
                        activeProfileTab === tab.id 
                          ? 'text-amber-500 border-b-2 border-amber-500' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Profile Tabs Panels */}
                <div className="bg-slate-950/20 rounded-xl p-4 border border-slate-900">
                  {activeProfileTab === 'info' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Biography</span>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-950 p-4 rounded-xl border border-slate-900">
                          {focusedArtist.bio || 'Add a rich biography to summarize this bands musical direction and story.'}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Band Roster</span>
                          <div className="mt-2 space-y-1.5">
                            {focusedArtist.members.map((m) => (
                              <div key={m.id} className="flex justify-between items-center text-xs bg-slate-950/60 p-2 rounded-lg border border-slate-900/60">
                                <span className="font-bold text-slate-300">{m.name}</span>
                                <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/10 px-1.5 py-0.5 rounded font-mono">
                                  {m.role}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Roster Contact Info</span>
                          <div className="mt-2 space-y-2.5">
                            <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-900/60 text-xs">
                              <Mail size={13} className="text-slate-400" />
                              <a href={`mailto:${focusedArtist.contactEmail}`} className="text-amber-500/90 hover:underline font-mono">
                                {focusedArtist.contactEmail}
                              </a>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-relaxed px-1">
                              This contact address serves as the primary gateway for booking promoters, bar managers, and festival curators.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeProfileTab === 'music' && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Configured Streaming Outlets</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                          {[
                            { name: 'Spotify Profile', url: focusedArtist.spotifyUrl, icon: Music2, color: 'text-emerald-400' },
                            { name: 'SoundCloud Channel', url: focusedArtist.soundcloudUrl, icon: Disc, color: 'text-orange-400' },
                            { name: 'YouTube Video/Channel', url: focusedArtist.youtubeUrl, icon: Play, color: 'text-red-400' },
                            { name: 'Apple Music', url: focusedArtist.appleMusicUrl, icon: Music2, color: 'text-pink-400' },
                            { name: 'Bandcamp Store', url: focusedArtist.bandcampUrl, icon: Globe, color: 'text-cyan-400' }
                          ].map((item, idx) => (
                            <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-900 flex items-center justify-between text-xs gap-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <item.icon size={15} className={`${item.color} shrink-0`} />
                                <div className="min-w-0">
                                  <span className="font-bold text-slate-300 block leading-none">{item.name}</span>
                                  <span className="text-[9px] text-slate-500 mt-1 truncate block">{item.url || 'Not configured'}</span>
                                </div>
                              </div>
                              {item.url ? (
                                <a 
                                  href={item.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-[10px] font-mono font-bold text-amber-500/80 hover:text-amber-500 border border-amber-500/10 bg-amber-500/5 px-2 py-0.5 rounded"
                                >
                                  Open
                                </a>
                              ) : (
                                <span className="text-[9px] font-mono text-slate-600 italic">Unset</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-900">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Social Medias Handles</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                          {[
                            { name: 'Instagram', url: focusedArtist.instagramUrl, icon: Instagram, color: 'text-purple-400' },
                            { name: 'Facebook', url: focusedArtist.facebookUrl, icon: Facebook, color: 'text-blue-400' },
                            { name: 'TikTok', url: focusedArtist.tiktokUrl, icon: Globe, color: 'text-zinc-400' },
                            { name: 'Twitter (X)', url: focusedArtist.twitterUrl, icon: Globe, color: 'text-sky-400' }
                          ].map((soc, idx) => (
                            <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-900 text-center space-y-1">
                              <soc.icon size={14} className={`${soc.color} mx-auto`} />
                              <span className="text-[10px] font-semibold text-slate-300 block">{soc.name}</span>
                              {soc.url ? (
                                <a href={soc.url} target="_blank" rel="noopener noreferrer" className="text-[9px] font-mono text-amber-500 hover:underline truncate block">
                                  Configured
                                </a>
                              ) : (
                                <span className="text-[9px] font-mono text-slate-600 italic">Unset</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeProfileTab === 'photos' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Curated Press Photos ({focusedArtist.photos?.length || 0})</span>
                        <button 
                          onClick={() => handleOpenEdit(focusedArtist)}
                          className="text-[10px] font-mono text-amber-500 hover:underline flex items-center gap-1 font-bold"
                        >
                          <Plus size={10} />
                          <span>Add/Edit Photos</span>
                        </button>
                      </div>

                      {focusedArtist.photos && focusedArtist.photos.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {focusedArtist.photos.map((ph, idx) => (
                            <div key={idx} className="relative rounded-xl overflow-hidden aspect-video border border-slate-900 group bg-slate-950">
                              <img src={ph} alt="Press Spot" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <span className="absolute bottom-1.5 right-1.5 text-[8px] font-mono text-slate-400 bg-slate-950/80 px-1 py-0.5 rounded border border-slate-800">
                                Press #{idx + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-slate-950 p-6 rounded-xl border border-slate-900 text-center text-slate-600">
                          <ImageIcon size={20} className="mx-auto mb-1 text-slate-700" />
                          <p className="text-xs italic">No high-res photos configured. Edit this profile on the right to upload image assets.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeProfileTab === 'performances' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Historical Performance Logs ({focusedArtist.pastPerformances?.length || 0})</span>
                        {!showPerfForm && (
                          <button 
                            onClick={() => setShowPerfForm(true)}
                            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold px-3 py-1 rounded-lg cursor-pointer flex items-center gap-1"
                          >
                            <PlusCircle size={11} />
                            <span>Log Show</span>
                          </button>
                        )}
                      </div>

                      {/* Add Performance inline Sub-form */}
                      <AnimatePresence>
                        {showPerfForm && (
                          <motion.form 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            onSubmit={handleAddPerformance}
                            className="bg-slate-950 p-4 rounded-xl border-2 border-amber-500/10 space-y-3.5"
                          >
                            <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                              <span className="text-[10px] font-mono font-bold text-amber-500">NEW HISTORICAL LOG</span>
                              <button 
                                type="button" 
                                onClick={() => setShowPerfForm(false)}
                                className="text-[10px] text-slate-500 hover:text-slate-300"
                              >
                                Cancel
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Event/Festival Name *</label>
                                <input 
                                  type="text" 
                                  required 
                                  placeholder="e.g., Summer Meltdown Mainstage"
                                  value={perfEventName}
                                  onChange={(e) => setPerfEventName(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/30 font-sans"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Venue *</label>
                                <input 
                                  type="text" 
                                  required 
                                  placeholder="e.g., McMenamins Alibi"
                                  value={perfVenue}
                                  onChange={(e) => setPerfVenue(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/30"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Performance Date</label>
                                <input 
                                  type="date" 
                                  value={perfDate}
                                  onChange={(e) => setPerfDate(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Location City & State</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g., Portland, OR"
                                  value={perfLocation}
                                  onChange={(e) => setPerfLocation(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Est. Attendance / Crowd Size</label>
                                <input 
                                  type="number" 
                                  placeholder="e.g., 500"
                                  value={perfAttendance}
                                  onChange={(e) => setPerfAttendance(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none font-mono"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Performance Notes / Highlights</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g., Sold out seating. Broadcasted on radio."
                                  value={perfNotes}
                                  onChange={(e) => setPerfNotes(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                                />
                              </div>
                            </div>

                            <button 
                              type="submit"
                              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 rounded-lg text-xs cursor-pointer"
                            >
                              Add Performance to History
                            </button>
                          </motion.form>
                        )}
                      </AnimatePresence>

                      {/* Performance list timeline */}
                      {focusedArtist.pastPerformances && focusedArtist.pastPerformances.length > 0 ? (
                        <div className="relative pl-3.5 border-l-2 border-slate-900 space-y-4 py-1">
                          {focusedArtist.pastPerformances.map((perf) => (
                            <div key={perf.id} className="relative group/perf">
                              <div className="absolute -left-[20px] top-1.5 w-2 h-2 rounded-full bg-amber-500 ring-4 ring-slate-950" />
                              <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-3 flex justify-between items-start gap-4 hover:border-slate-800 transition-all">
                                <div>
                                  <h4 className="text-xs font-bold text-slate-200 leading-snug">{perf.eventName}</h4>
                                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono flex items-center gap-1.5 flex-wrap">
                                    <span>{perf.venue} • {perf.location}</span>
                                    {perf.date && <span className="text-slate-500">({new Date(perf.date).toLocaleDateString([], { month: 'short', year: 'numeric' })})</span>}
                                    {perf.attendance && <span className="text-amber-500/80 font-bold">Attendance: {perf.attendance.toLocaleString()}+</span>}
                                  </p>
                                  {perf.notes && <p className="text-[10px] text-slate-500 mt-1 leading-normal italic">"{perf.notes}"</p>}
                                </div>
                                <button 
                                  onClick={() => {
                                    if (confirm('Delete this historical performance log?')) {
                                      handleDeletePerformance(perf.id);
                                    }
                                  }}
                                  className="opacity-0 group-hover/perf:opacity-100 p-1 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded transition-all cursor-pointer shrink-0"
                                  title="Delete Performance Log"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-slate-950 p-6 rounded-xl border border-slate-900 text-center text-slate-600">
                          <Calendar size={20} className="mx-auto mb-1 text-slate-700" />
                          <p className="text-xs italic">No past performance records logged. Fill your artist timeline to impress booking pitch managers!</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeProfileTab === 'collaborators' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Linked Collaborators & Co-Bill Partners</span>
                          <span className="text-xs text-slate-400">Artists linked through accepted BandAide collaboration agreements.</span>
                        </div>
                        <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded-full">
                          {focusedArtist.linkedCollaborators?.length || 0} Connected
                        </span>
                      </div>

                      {focusedArtist.linkedCollaborators && focusedArtist.linkedCollaborators.length > 0 ? (
                        <div className="space-y-2.5">
                          {focusedArtist.linkedCollaborators.map((collab, idx) => (
                            <div key={idx} className="bg-slate-950/80 border border-purple-500/30 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-purple-500/50 transition-all">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs font-bold font-display shadow-md shadow-purple-600/20">
                                  {collab.artistName.charAt(0)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-bold text-white text-xs font-display">{collab.artistName}</h5>
                                    {collab.genre && (
                                      <span className="text-[9px] bg-slate-900 text-slate-400 border border-slate-800 px-1.5 py-0.2 rounded font-mono">
                                        {collab.genre}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-purple-300 font-sans mt-0.5">
                                    {collab.projectTitle || 'Shared Music Project'}
                                  </p>
                                  {collab.linkedGigTitle && (
                                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                                      <Calendar size={10} />
                                      <span>Linked Event: {collab.linkedGigTitle}</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center">
                                <span className="text-[9.5px] font-mono text-slate-500">
                                  Linked {new Date(collab.linkedSince).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                {collab.contactEmail && (
                                  <a
                                    href={`mailto:${collab.contactEmail}`}
                                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-purple-950 text-slate-400 hover:text-purple-300 border border-slate-800 transition-colors"
                                    title={`Email ${collab.artistName}`}
                                  >
                                    <Mail size={12} />
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-slate-950 p-6 rounded-xl border border-slate-900 text-center text-slate-500 space-y-2">
                          <Users size={24} className="mx-auto text-slate-700" />
                          <p className="text-xs">No linked collaborators yet for this artist.</p>
                          <p className="text-[11px] text-slate-600 max-w-sm mx-auto">
                            Head to the <strong>Collaborate</strong> tab to browse artists, send co-bill proposals, and link your events and profiles together!
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Add / Edit Artist Profile Form Panel (Collapsible sections) */}
      <div className="lg:col-span-5">
        <AnimatePresence mode="wait">
          {showAddForm ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 sm:p-6"
            >
              <h3 className="text-sm font-black font-display text-slate-100 uppercase tracking-tight mb-5 flex items-center gap-2">
                <Compass size={16} className="text-amber-500" />
                <span>{editingArtistId ? 'Edit Band EPK' : 'Register New Band'}</span>
              </h3>

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Section A: Core Info */}
                <div className="space-y-3.5 bg-slate-950 p-3.5 rounded-xl border border-slate-900">
                  <span className="block text-[10px] font-bold font-mono text-amber-500 uppercase">Core Information</span>
                  
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Band or Artist Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., The Midnight Radios"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/30"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Genre Classification *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Synth Rock / Retro Electro"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/30"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Booking & Press Contact Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g., booking@midnightradios.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Roster Members & Roles (Comma separated) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Leo Smith (Vocals), Maya Jane (Keys)"
                      value={members}
                      onChange={(e) => setMembers(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Short Biography / Press Intro</label>
                    <textarea
                      rows={4}
                      placeholder="Describe your bands story, achievements, performance style..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500/30 resize-none leading-relaxed font-sans"
                    />
                  </div>
                </div>

                {/* Section B: Streaming Links & Social Handles */}
                <div className="space-y-3.5 bg-slate-950 p-3.5 rounded-xl border border-slate-900">
                  <span className="block text-[10px] font-bold font-mono text-amber-500 uppercase">Streaming & Channels</span>

                  <div className="grid grid-cols-1 gap-2.5">
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Spotify Artist Link</span>
                      <input
                        type="url"
                        placeholder="https://open.spotify.com/artist/..."
                        value={spotifyUrl}
                        onChange={(e) => setSpotifyUrl(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                      />
                    </div>

                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-500 mb-1">SoundCloud Link</span>
                      <input
                        type="url"
                        placeholder="https://soundcloud.com/..."
                        value={soundcloudUrl}
                        onChange={(e) => setSoundcloudUrl(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                      />
                    </div>

                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-500 mb-1">YouTube Channel URL</span>
                      <input
                        type="url"
                        placeholder="https://youtube.com/..."
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Apple Music URL</span>
                        <input
                          type="url"
                          placeholder="Apple Music Link"
                          value={appleMusicUrl}
                          onChange={(e) => setAppleMusicUrl(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Bandcamp URL</span>
                        <input
                          type="url"
                          placeholder="Bandcamp Link"
                          value={bandcampUrl}
                          onChange={(e) => setBandcampUrl(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-900">
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Instagram</span>
                        <input
                          type="url"
                          placeholder="Insta Page Link"
                          value={instagramUrl}
                          onChange={(e) => setInstagramUrl(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-850 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Facebook</span>
                        <input
                          type="url"
                          placeholder="Facebook Page Link"
                          value={facebookUrl}
                          onChange={(e) => setFacebookUrl(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-850 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-slate-500 mb-1">TikTok</span>
                        <input
                          type="url"
                          placeholder="TikTok Link"
                          value={tiktokUrl}
                          onChange={(e) => setTiktokUrl(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-850 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Twitter</span>
                        <input
                          type="url"
                          placeholder="Twitter Link"
                          value={twitterUrl}
                          onChange={(e) => setTwitterUrl(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-850 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section C: Press Photos Manager */}
                <div className="space-y-3.5 bg-slate-950 p-3.5 rounded-xl border border-slate-900">
                  <div className="flex justify-between items-center">
                    <span className="block text-[10px] font-bold font-mono text-amber-500 uppercase">Press Photos Gallerist</span>
                    <span className="text-[9px] font-mono text-slate-500">({photos.length} selected)</span>
                  </div>

                  {/* Thumbnail previews */}
                  {photos.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-2 bg-slate-900 rounded-lg border border-slate-850">
                      {photos.map((ph, idx) => (
                        <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-800">
                          <img src={ph} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(ph)}
                            className="absolute inset-0 bg-red-500/80 text-white font-bold opacity-0 hover:opacity-100 flex items-center justify-center text-[10px] transition-all cursor-pointer"
                            title="Remove Photo"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* AI photo generator prompt */}
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-850 space-y-1.5">
                    <span className="text-[9px] font-bold text-amber-500/90 uppercase flex items-center gap-1">
                      <Sparkles size={10} />
                      <span>AI Photo Generator</span>
                    </span>
                    <p className="text-[9px] text-slate-500 leading-normal">
                      Design high-resolution rock band concert portraits on the fly with custom artistic parameters.
                    </p>
                    <input 
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Prompt details for AI artist portrait..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-slate-300 focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={aiGenerating}
                      onClick={handleSimulateAiPhoto}
                      className="w-full bg-slate-950 hover:bg-slate-900 border border-amber-500/20 text-[9px] font-mono text-amber-500/80 hover:text-amber-400 py-1 rounded transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {aiGenerating ? 'Processing AI Rendering...' : 'Render AI Press Portrait'}
                    </button>
                  </div>

                  {/* Standard Photo inputs */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-[9px] uppercase font-bold text-slate-500">Custom Image URL</label>
                    <div className="flex gap-1.5">
                      <input
                        type="url"
                        placeholder="Paste image URL (Unsplash, etc.)"
                        value={newPhotoUrl}
                        onChange={(e) => setNewPhotoUrl(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddPhoto}
                        className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold px-3 rounded-lg text-xs cursor-pointer"
                      >
                        Add
                      </button>
                    </div>

                    {/* Presets selection */}
                    <div className="pt-2 border-t border-slate-900">
                      <span className="block text-[8px] uppercase font-bold text-slate-600 mb-1.5">Select high-res presets:</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {PRESET_PHOTOS.map((pres, idx) => {
                          const isUsed = photos.includes(pres.url);
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectPresetPhoto(pres.url)}
                              disabled={isUsed}
                              className={`text-[8px] font-medium p-1 text-center rounded border truncate block transition-all cursor-pointer ${
                                isUsed 
                                  ? 'bg-slate-950 border-slate-950 text-slate-600 cursor-not-allowed'
                                  : 'bg-slate-900 border-slate-850 hover:border-slate-700 text-slate-400'
                              }`}
                              title={pres.name}
                            >
                              + {pres.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Controls */}
                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-900">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="bg-slate-950 hover:bg-slate-900 border border-slate-900 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-5 py-2 rounded-xl text-xs cursor-pointer"
                  >
                    {editingArtistId ? 'Save EPK Changes' : 'Register Profile'}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <div className="bg-slate-900/10 border border-slate-900 border-dashed rounded-2xl p-8 text-center text-slate-600 flex flex-col items-center justify-center gap-3 min-h-[220px]">
              <Users size={28} className="text-slate-700" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400">Roster Administration</p>
                <p className="text-[10px] text-slate-500 leading-normal max-w-[200px]">
                  Select or register secondary profiles to toggle focus and organize separate setlists.
                </p>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-1 text-xs font-bold text-amber-500/80 hover:text-amber-500 border border-amber-500/20 hover:bg-amber-500/5 px-4 py-1.5 rounded-lg"
              >
                Add Secondary Profile
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
