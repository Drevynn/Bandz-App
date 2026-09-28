import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Brain, 
  Sparkles, 
  Plus, 
  Clock, 
  Heart, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare, 
  Bot, 
  Loader2, 
  ShieldAlert, 
  Headphones, 
  Save,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Artist, Member, MemberCognitiveProfile, MemberMemoryNote } from '../types';

interface SharonMemberMemoryProps {
  activeArtist: Artist;
  onUpdateArtist?: (artist: Artist) => void;
  onSharonSpeak?: (text: string) => void;
  voiceEnabled: boolean;
}

// Initial cognitive profile seed helper
const createInitialProfile = (member: Member): MemberCognitiveProfile => {
  const nameLower = member.name.toLowerCase();
  
  if (nameLower.includes('maya')) {
    return {
      memberId: member.id,
      name: member.name,
      role: member.role,
      personalityArchetype: 'The Perfectionist Creative',
      communicationStyle: 'Direct bullet points, 48h advance notice on setlist changes',
      stressTriggers: ['Monitor mix latency', 'Last-minute soundcheck rushed downbeats'],
      musicalStrengths: ['Vocal pitch precision', 'Complex synth pads & dynamic arrangements'],
      stagePresenceHabit: 'Thrives with audience interaction; needs confident downbeat cues',
      preferredRehearsalTimes: 'Tuesday & Thursday evenings (7:00 PM - 9:30 PM)',
      punctualityScore: 94,
      inEarMonitorNotes: 'Vocals +3dB, Keys pan center, Drum overheads low',
      memories: [
        {
          id: 'mem-maya-1',
          timestamp: '2026-03-10T19:00:00Z',
          note: 'Expressed high excitement about the new bridge chord progression on "Midnight Echoes". Prefers running vocals with reverb on wedge.',
          sentiment: 'positive',
          context: 'rehearsal'
        },
        {
          id: 'mem-maya-2',
          timestamp: '2026-02-18T21:30:00Z',
          note: 'Mentioned feeling vocal fatigue during back-to-back weekend gigs. Sharon advised 20-minute post-soundcheck vocal rest.',
          sentiment: 'attention_needed',
          context: 'gig'
        }
      ]
    };
  }

  if (nameLower.includes('chris') || member.role.toLowerCase().includes('guitar')) {
    return {
      memberId: member.id,
      name: member.name,
      role: member.role,
      personalityArchetype: 'The Energetic Innovator',
      communicationStyle: 'Casual text messages, responsive via WhatsApp/SMS',
      stressTriggers: ['Pedalboard power issues', 'Venues without isolated guitar cab mic setup'],
      musicalStrengths: ['Dynamic guitar solos', 'Rhythmic hooks that anchor the groove'],
      stagePresenceHabit: 'High stage mobility, interacts heavily with the crowd along the front stage monitors',
      preferredRehearsalTimes: 'Weekdays after 6:30 PM',
      punctualityScore: 88,
      inEarMonitorNotes: 'Lead guitar +2dB, Bass DI for groove timing',
      memories: [
        {
          id: 'mem-chris-1',
          timestamp: '2026-03-05T18:00:00Z',
          note: 'Tested new delay pedal configuration. Requested tighter transition into Track 3 without awkward guitar tuning gaps.',
          sentiment: 'positive',
          context: 'musical_habit'
        }
      ]
    };
  }

  if (nameLower.includes('sarah') || member.role.toLowerCase().includes('drum')) {
    return {
      memberId: member.id,
      name: member.name,
      role: member.role,
      personalityArchetype: 'The Master Timekeeper',
      communicationStyle: 'Detailed timeline schedules with exact load-in times',
      stressTriggers: ['Inconsistent count-offs', 'Wobbly tempo transitions during medleys'],
      musicalStrengths: ['Rock-solid pocket', 'Dynamic cymbal control in small acoustic rooms'],
      stagePresenceHabit: 'Anchored and deeply focused; monitors bass guitar eye contact',
      preferredRehearsalTimes: 'Weekend mornings or Thursday evenings',
      punctualityScore: 98,
      inEarMonitorNotes: 'Click track channel 1, Bass DI channel 2, Vocals soft',
      memories: [
        {
          id: 'mem-sarah-1',
          timestamp: '2026-03-01T17:30:00Z',
          note: 'Noted that having 124 BPM pre-programmed in the setlist saved 5 minutes between songs during soundcheck.',
          sentiment: 'positive',
          context: 'rehearsal'
        }
      ]
    };
  }

  // Default archetype for any musician
  return {
    memberId: member.id,
    name: member.name,
    role: member.role,
    personalityArchetype: 'The Dedicated Collaborator',
    communicationStyle: 'Direct SMS or email notices',
    stressTriggers: ['Unclear soundcheck times', 'Sudden venue delays'],
    musicalStrengths: ['Consistent harmonic foundation', 'Strong stage presence'],
    stagePresenceHabit: 'Maintains steady eye contact and energy with the rhythm section',
    preferredRehearsalTimes: 'Evenings 7:00 PM',
    punctualityScore: 90,
    inEarMonitorNotes: 'Even mix across all band members',
    memories: [
      {
        id: `mem-${member.id}-init`,
        timestamp: new Date().toISOString(),
        note: `Initial cognitive memory profile initialized by Sharon AI Manager for ${member.name}.`,
        sentiment: 'neutral',
        context: 'general'
      }
    ]
  };
};

export default function SharonMemberMemory({
  activeArtist,
  onUpdateArtist,
  onSharonSpeak,
  voiceEnabled
}: SharonMemberMemoryProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>(activeArtist.members[0]?.id || '');
  const [profiles, setProfiles] = useState<Record<string, MemberCognitiveProfile>>(() => {
    try {
      const saved = localStorage.getItem(`sharon_member_profiles_${activeArtist.id}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    
    // Seed from activeArtist members
    const initialMap: Record<string, MemberCognitiveProfile> = {};
    activeArtist.members.forEach(member => {
      initialMap[member.id] = member.cognitiveProfile || createInitialProfile(member);
    });
    return initialMap;
  });

  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteContext, setNewNoteContext] = useState<MemberMemoryNote['context']>('rehearsal');
  const [newNoteSentiment, setNewNoteSentiment] = useState<MemberMemoryNote['sentiment']>('positive');
  const [isConsultingSharon, setIsConsultingSharon] = useState(false);
  const [sharonInsightAdvice, setSharonInsightAdvice] = useState<{
    insight: string;
    recommendedAction: string;
    communicationTip: string;
  } | null>(null);

  // Sync profiles to localStorage when updated
  useEffect(() => {
    localStorage.setItem(`sharon_member_profiles_${activeArtist.id}`, JSON.stringify(profiles));
  }, [profiles, activeArtist.id]);

  const activeMember = activeArtist.members.find(m => m.id === selectedMemberId) || activeArtist.members[0];
  const activeProfile = activeMember ? (profiles[activeMember.id] || createInitialProfile(activeMember)) : null;

  // Add observation note to member memory over time
  const handleAddMemoryNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !activeMember || !activeProfile) return;

    const newNote: MemberMemoryNote = {
      id: `mem-${Date.now()}`,
      timestamp: new Date().toISOString(),
      note: newNoteText.trim(),
      sentiment: newNoteSentiment,
      context: newNoteContext
    };

    const updatedProfile: MemberCognitiveProfile = {
      ...activeProfile,
      memories: [newNote, ...(activeProfile.memories || [])]
    };

    const updatedProfiles = {
      ...profiles,
      [activeMember.id]: updatedProfile
    };

    setProfiles(updatedProfiles);
    setNewNoteText('');

    // If update artist handler exists, persist back to artist data
    if (onUpdateArtist) {
      const updatedMembers = activeArtist.members.map(m => 
        m.id === activeMember.id ? { ...m, cognitiveProfile: updatedProfile } : m
      );
      onUpdateArtist({
        ...activeArtist,
        members: updatedMembers
      });
    }

    if (voiceEnabled && onSharonSpeak) {
      onSharonSpeak(`Memory note logged for ${activeMember.name}. I've updated my cognitive profile for the band.`);
    }
  };

  // Consult Sharon for psychological management advice for this member
  const handleConsultSharon = async () => {
    if (!activeMember || !activeProfile || isConsultingSharon) return;

    setIsConsultingSharon(true);
    setSharonInsightAdvice(null);

    try {
      const response = await fetch('/api/sharon-member-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member: {
            ...activeMember,
            cognitiveProfile: activeProfile
          },
          artistName: activeArtist.name
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to get member insight');

      setSharonInsightAdvice({
        insight: data.insight || 'Member assessment completed.',
        recommendedAction: data.recommendedAction || 'Schedule a check-in before the next gig.',
        communicationTip: data.communicationTip || 'Clear, direct communication.'
      });

      if (voiceEnabled && onSharonSpeak && data.insight) {
        onSharonSpeak(data.insight);
      }
    } catch (err: any) {
      console.error(err);
      setSharonInsightAdvice({
        insight: `Sharon's Assessment for ${activeMember.name}: Key focus remains clear downbeat cues and respecting soundcheck preferences.`,
        recommendedAction: 'Confirm monitor levels 15 minutes before showtime.',
        communicationTip: 'Direct, appreciative tone.'
      });
    } finally {
      setIsConsultingSharon(false);
    }
  };

  if (!activeMember || !activeProfile) {
    return (
      <div className="p-6 text-center text-slate-400 bg-slate-900 rounded-xl">
        <Users className="mx-auto text-purple-400 mb-2" size={32} />
        <p>No band members found. Add members in the Artists tab to start tracking cognitive memories!</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-500/20 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Brain size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white text-sm sm:text-base font-display">
                Sharon's Member Memory & Cognitive Profiles
              </h4>
              <span className="text-[10px] font-mono font-bold bg-pink-500/20 border border-pink-500/40 text-pink-300 px-2 py-0.5 rounded-full">
                Persistent Memory
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sharon learns each musician's habits, stress triggers, and communication preferences over time.
            </p>
          </div>
        </div>

        {/* Member Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {activeArtist.members.map((member) => (
            <button
              key={member.id}
              onClick={() => {
                setSelectedMemberId(member.id);
                setSharonInsightAdvice(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedMemberId === member.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span>{member.name.split(' ')[0]}</span>
              <span className="text-[10px] opacity-75">({member.role.split(',')[0]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Member Deep Profile & Cognitive Archetype */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Member Psychological Matrix */}
        <div className="lg:col-span-6 space-y-3">
          {/* Identity & Archetype Card */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-850 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-purple-400 font-bold tracking-wider">
                  Psychological Archetype
                </span>
                <h5 className="text-base font-bold text-white font-display mt-0.5">
                  {activeProfile.name}
                </h5>
                <p className="text-xs text-purple-300 font-mono">
                  {activeProfile.role} • {activeProfile.personalityArchetype}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Reliability</span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  {activeProfile.punctualityScore}%
                </span>
              </div>
            </div>

            {/* Communication Style */}
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-xs">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
                How Sharon Communicates With {activeProfile.name.split(' ')[0]}:
              </span>
              <p className="text-slate-200 italic font-sans leading-relaxed">
                "{activeProfile.communicationStyle}"
              </p>
            </div>

            {/* Stress Triggers */}
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-rose-400 flex items-center gap-1 mb-1.5">
                <AlertTriangle size={11} />
                <span>Known Stress Points & Friction Triggers:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeProfile.stressTriggers.map((trigger, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] bg-rose-950/40 border border-rose-500/30 text-rose-300 px-2 py-0.5 rounded-md"
                  >
                    • {trigger}
                  </span>
                ))}
              </div>
            </div>

            {/* In-Ear & Audio Preferences */}
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-xs">
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold flex items-center gap-1 mb-1">
                <Headphones size={11} />
                <span>Soundcheck & Monitor Mix Specs:</span>
              </span>
              <p className="text-slate-300 font-mono text-[11px]">
                {activeProfile.inEarMonitorNotes || 'Standard balanced wedge mix.'}
              </p>
            </div>

            {/* Sharon Consultation Button */}
            <button
              onClick={handleConsultSharon}
              disabled={isConsultingSharon}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:opacity-95 text-white rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/20 disabled:opacity-50"
            >
              {isConsultingSharon ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Sharon is analyzing psychological notes...</span>
                </>
              ) : (
                <>
                  <Bot size={15} />
                  <span>Ask Sharon for Management Guidance on {activeProfile.name.split(' ')[0]}</span>
                </>
              )}
            </button>

            {/* Sharon Psychological Coaching Result */}
            {sharonInsightAdvice && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-purple-950/50 border border-purple-500/40 p-3.5 rounded-xl space-y-2 text-xs"
              >
                <div className="flex items-center gap-1.5 text-purple-300 font-mono font-bold text-[11px]">
                  <Sparkles size={12} className="text-amber-400" />
                  <span>Sharon's Tailored Coaching Insight:</span>
                </div>
                <p className="text-slate-200 leading-relaxed font-sans">
                  {sharonInsightAdvice.insight}
                </p>
                <div className="pt-2 border-t border-purple-500/30 space-y-1 text-[11px]">
                  <p className="text-emerald-300 font-mono">
                    <span className="font-bold">Next Action:</span> {sharonInsightAdvice.recommendedAction}
                  </p>
                  <p className="text-cyan-300 font-mono">
                    <span className="font-bold">Communication Tip:</span> {sharonInsightAdvice.communicationTip}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Column: Learned Memories & Observations Timeline */}
        <div className="lg:col-span-6 space-y-3">
          {/* Add New Observation Note Form */}
          <form
            onSubmit={handleAddMemoryNote}
            className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-850 space-y-2.5"
          >
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-300 font-bold">
              <span className="flex items-center gap-1.5">
                <Plus size={13} className="text-purple-400" />
                <span>Log New Memory / Observation</span>
              </span>
              <span className="text-[10px] text-slate-500">Learned by Sharon</span>
            </div>

            <textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder={`e.g. During rehearsal, ${activeProfile.name.split(' ')[0]} was distracted by drum bleed in their in-ears, but locked in when we dropped tempo by 4 BPM...`}
              rows={2}
              className="w-full bg-slate-900 border border-slate-750 focus:border-purple-500 rounded-xl p-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
            />

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <select
                  value={newNoteContext}
                  onChange={(e) => setNewNoteContext(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 rounded-lg px-2 py-1 focus:outline-none"
                >
                  <option value="rehearsal">Rehearsal</option>
                  <option value="gig">Live Gig</option>
                  <option value="communication">Communication</option>
                  <option value="musical_habit">Musical Habit</option>
                  <option value="general">General</option>
                </select>

                <select
                  value={newNoteSentiment}
                  onChange={(e) => setNewNoteSentiment(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 rounded-lg px-2 py-1 focus:outline-none"
                >
                  <option value="positive">🟢 Positive</option>
                  <option value="neutral">⚪ Neutral</option>
                  <option value="attention_needed">🟡 Needs Attention</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!newNoteText.trim()}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg text-xs font-mono font-bold transition-all cursor-pointer"
              >
                Log Memory
              </button>
            </div>
          </form>

          {/* Chronological Memory Timeline */}
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
              Sharon's Memory Log Over Time ({activeProfile.memories?.length || 0} events)
            </span>

            {activeProfile.memories && activeProfile.memories.length > 0 ? (
              activeProfile.memories.map((mem) => (
                <div
                  key={mem.id}
                  className="p-3 bg-slate-950/70 rounded-xl border border-slate-850 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          mem.sentiment === 'positive'
                            ? 'bg-emerald-400'
                            : mem.sentiment === 'attention_needed'
                            ? 'bg-amber-400'
                            : 'bg-slate-400'
                        }`}
                      />
                      <span className="uppercase text-purple-300">{mem.context.replace('_', ' ')}</span>
                    </span>
                    <span>{new Date(mem.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-sans text-[11.5px]">
                    "{mem.note}"
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic p-3 text-center bg-slate-950/40 rounded-xl">
                No memories recorded yet for this band member. Type an observation above to train Sharon.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
