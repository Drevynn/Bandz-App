import React, { useState } from 'react';
import { 
  Brain, 
  Sparkles, 
  User, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Clock, 
  Volume2, 
  MessageSquare, 
  Lightbulb, 
  Zap,
  TrendingUp,
  Award
} from 'lucide-react';
import { Artist, Member, MemberCognitiveProfile, MemberMemoryNote } from '../types';

interface SharonMemberMemoryProps {
  activeArtist: Artist;
  onUpdateArtist?: (artist: Artist) => void;
  onSharonSpeak?: (text: string) => void;
  voiceEnabled: boolean;
}

export default function SharonMemberMemory({
  activeArtist,
  onUpdateArtist,
  onSharonSpeak,
  voiceEnabled
}: SharonMemberMemoryProps) {
  const [selectedMemberIndex, setSelectedMemberIndex] = useState<number>(0);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteContext, setNewNoteContext] = useState<MemberMemoryNote['context']>('rehearsal');
  const [newNoteSentiment, setNewNoteSentiment] = useState<MemberMemoryNote['sentiment']>('positive');
  const [aiCoachAdvice, setAiCoachAdvice] = useState<string | null>(null);
  const [isAskingSharon, setIsAskingSharon] = useState(false);

  // Fallback cognitive profiles for members
  const memberArchetypes: Record<string, Partial<MemberCognitiveProfile>> = {
    '0': {
      personalityArchetype: 'The Perfectionist Creative',
      communicationStyle: 'Direct bullet-points, appreciates 48hr advance notice',
      stressTriggers: ['Rushed soundchecks', 'Latency in monitor mix', 'Last-minute setlist rewrites'],
      musicalStrengths: ['Vocal pitch accuracy', 'Dynamic emotional pacing', 'Harmony arrangements'],
      stagePresenceHabit: 'Commands stage center, connects with audience through eye contact',
      preferredRehearsalTimes: 'Tuesday & Thursday evenings 6:30 PM - 9:00 PM',
      punctualityScore: 96,
      inEarMonitorNotes: 'Requires lead vocal at +4dB with high-end presence boost, light reverb in left ear',
      memories: [
        {
          id: 'mem-1',
          timestamp: '2026-09-18T19:30:00Z',
          note: 'Performed flawlessly on the high chorus of "Midnight Echoes" during the Crocodile show.',
          sentiment: 'positive',
          context: 'gig'
        },
        {
          id: 'mem-2',
          timestamp: '2026-09-22T18:45:00Z',
          note: 'Noted fatigue when rehearsal ran over 2.5 hours without a vocal break.',
          sentiment: 'attention_needed',
          context: 'rehearsal'
        }
      ]
    },
    '1': {
      personalityArchetype: 'The Master Timekeeper',
      communicationStyle: 'Casual and quick, prefers text messages and clear downbeat call-times',
      stressTriggers: ['Uncalibrated monitor wedge', 'Inconsistent tempo count-offs', 'Rushed load-ins'],
      musicalStrengths: ['Pocket lock', 'Dynamic drum fills', 'Consistent click-track discipline'],
      stagePresenceHabit: 'High energy, locks eyes with bass player on transitional cues',
      preferredRehearsalTimes: 'Weeknights after 7:00 PM',
      punctualityScore: 92,
      inEarMonitorNotes: 'Kick and bass guitar locked in center, click track at 70% volume',
      memories: [
        {
          id: 'mem-3',
          timestamp: '2026-09-15T20:15:00Z',
          note: 'Nailed the 7/8 breakdown transition without hesitation.',
          sentiment: 'positive',
          context: 'musical_habit'
        }
      ]
    }
  };

  const members = activeArtist.members && activeArtist.members.length > 0 
    ? activeArtist.members 
    : [
        { id: 'mem-default-1', name: 'Maya Linn', role: 'Lead Vocals, Keys' },
        { id: 'mem-default-2', name: 'Marcus Bell', role: 'Drums, Percussion' }
      ];

  const currentMember = members[selectedMemberIndex] || members[0];
  const profileDefaults = memberArchetypes[selectedMemberIndex.toString()] || memberArchetypes['0'];

  const profile: MemberCognitiveProfile = currentMember.cognitiveProfile || {
    memberId: currentMember.id,
    name: currentMember.name,
    role: currentMember.role,
    personalityArchetype: profileDefaults.personalityArchetype || 'Dedicated Artist',
    communicationStyle: profileDefaults.communicationStyle || 'Direct and honest',
    stressTriggers: profileDefaults.stressTriggers || ['Rushed soundchecks', 'Equipment audio faults'],
    musicalStrengths: profileDefaults.musicalStrengths || ['Tone precision', 'Stage discipline'],
    stagePresenceHabit: profileDefaults.stagePresenceHabit || 'Energetic and focused',
    preferredRehearsalTimes: profileDefaults.preferredRehearsalTimes || 'Evenings',
    punctualityScore: profileDefaults.punctualityScore || 90,
    inEarMonitorNotes: profileDefaults.inEarMonitorNotes || 'Balanced stereo mix',
    memories: profileDefaults.memories || []
  };

  const handleAddMemoryNote = () => {
    if (!newNoteText.trim()) return;

    const newNote: MemberMemoryNote = {
      id: `mem-${Date.now()}`,
      timestamp: new Date().toISOString(),
      note: newNoteText.trim(),
      sentiment: newNoteSentiment,
      context: newNoteContext
    };

    const updatedProfile: MemberCognitiveProfile = {
      ...profile,
      memories: [newNote, ...profile.memories]
    };

    const updatedMembers = [...members];
    updatedMembers[selectedMemberIndex] = {
      ...currentMember,
      cognitiveProfile: updatedProfile
    };

    if (onUpdateArtist) {
      onUpdateArtist({
        ...activeArtist,
        members: updatedMembers
      });
    }

    setNewNoteText('');

    if (voiceEnabled && onSharonSpeak) {
      onSharonSpeak(`Logged observation for ${currentMember.name}: "${newNote.note.slice(0, 70)}"`);
    }
  };

  const handleAskSharonForCoaching = async () => {
    setIsAskingSharon(true);
    setAiCoachAdvice(null);

    try {
      const response = await fetch('/api/sharon-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Give me a manager coaching tip on how to best collaborate with band member ${currentMember.name} (${currentMember.role}) based on their personality archetype "${profile.personalityArchetype}" and stress triggers: ${profile.stressTriggers.join(', ')}.`,
          artist: activeArtist,
          currentDate: new Date().toISOString()
        })
      });

      const resData = await response.json();
      const reply = resData.reply || `Sharon Manager tip for ${currentMember.name}: Keep communications clear, respect their ${profile.communicationStyle}, and make sure soundcheck is calm and thorough.`;
      setAiCoachAdvice(reply);

      if (voiceEnabled && onSharonSpeak) {
        onSharonSpeak(reply);
      }
    } catch (e: any) {
      const fallbackReply = `Sharon's Assessment: ${currentMember.name} responds best to ${profile.communicationStyle}. For upcoming shows, ensure technical soundcheck requirements are locked in 24 hours prior.`;
      setAiCoachAdvice(fallbackReply);
      if (voiceEnabled && onSharonSpeak) {
        onSharonSpeak(fallbackReply);
      }
    } finally {
      setIsAskingSharon(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-500/20 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-600/30">
            <Brain size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white text-sm sm:text-base font-display">
                Sharon Cognitive Member Memory
              </h4>
              <span className="text-[10px] font-mono font-bold bg-pink-500/20 border border-pink-500/40 text-pink-300 px-2 py-0.5 rounded-full">
                Long-Term Profiles
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sharon tracks the communication styles, stress triggers, and habits of each band member over time.
            </p>
          </div>
        </div>

        {/* Member Selector Pill Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {members.map((m, idx) => (
            <button
              key={m.id || idx}
              onClick={() => {
                setSelectedMemberIndex(idx);
                setAiCoachAdvice(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedMemberIndex === idx
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User size={12} />
              <span>{m.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Cognitive Assessment & Preferences */}
        <div className="lg:col-span-6 space-y-3">
          {/* Identity Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h5 className="font-bold text-white text-base font-display">{profile.name}</h5>
                <span className="text-xs text-purple-400 font-mono">{profile.role}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Reliability</span>
                <span className="text-xs font-mono font-bold text-emerald-400">{profile.punctualityScore}% Punctual</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-500/20 text-xs space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-purple-300 block">
                Psychological Archetype:
              </span>
              <p className="font-bold text-white font-sans">{profile.personalityArchetype}</p>
            </div>

            {/* Communication Style */}
            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1">
                <MessageSquare size={11} className="text-cyan-400" />
                <span>Preferred Communication Style:</span>
              </span>
              <p className="text-slate-300 font-sans pl-2 border-l border-slate-800">
                {profile.communicationStyle}
              </p>
            </div>

            {/* Stress Triggers */}
            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1">
                <AlertCircle size={11} className="text-rose-400" />
                <span>Known Stress Points / Friction Triggers:</span>
              </span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {profile.stressTriggers.map((trigger, i) => (
                  <span key={i} className="text-[10.5px] bg-rose-950/40 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-mono">
                    {trigger}
                  </span>
                ))}
              </div>
            </div>

            {/* In-Ear Monitor Notes */}
            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1">
                <Volume2 size={11} className="text-amber-400" />
                <span>In-Ear Audio Monitor Setup:</span>
              </span>
              <p className="text-slate-300 font-mono text-[11px] bg-slate-900/80 p-2 rounded border border-slate-800">
                {profile.inEarMonitorNotes}
              </p>
            </div>

            {/* Ask Sharon Coaching Button */}
            <button
              onClick={handleAskSharonForCoaching}
              disabled={isAskingSharon}
              className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-purple-600/20"
            >
              <Sparkles size={13} />
              <span>{isAskingSharon ? 'Consulting Sharon...' : `Ask Sharon How to Coach ${profile.name}`}</span>
            </button>

            {aiCoachAdvice && (
              <div className="bg-purple-950/50 border border-purple-500/40 p-3 rounded-xl text-xs space-y-1">
                <span className="font-bold text-purple-300 font-mono text-[10.5px] block">
                  Sharon's Managerial Strategy:
                </span>
                <p className="text-slate-200 leading-relaxed font-sans">{aiCoachAdvice}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sharon's Chronological Memory Log */}
        <div className="lg:col-span-6 space-y-3">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <span className="text-[11px] font-mono uppercase font-bold text-slate-300 flex items-center gap-1.5">
                <Clock size={13} className="text-purple-400" />
                <span>Observations Recorded by Sharon</span>
              </span>
              <span className="text-[10px] font-mono text-purple-400">
                {profile.memories.length} Entries
              </span>
            </div>

            {/* Add New Observation Note */}
            <div className="space-y-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <input
                type="text"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder={`Record memory note for ${profile.name} (e.g. Loved playing song at 124 BPM)...`}
                className="w-full bg-slate-950 border border-slate-750 focus:border-purple-500 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                  <select
                    value={newNoteContext}
                    onChange={(e) => setNewNoteContext(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 rounded px-2 py-1"
                  >
                    <option value="rehearsal">Rehearsal</option>
                    <option value="gig">Live Gig</option>
                    <option value="communication">Communication</option>
                    <option value="musical_habit">Musical Habit</option>
                  </select>

                  <select
                    value={newNoteSentiment}
                    onChange={(e) => setNewNoteSentiment(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 rounded px-2 py-1"
                  >
                    <option value="positive">Positive (+)</option>
                    <option value="neutral">Neutral (=)</option>
                    <option value="attention_needed">Needs Care (!)</option>
                  </select>
                </div>

                <button
                  onClick={handleAddMemoryNote}
                  disabled={!newNoteText.trim()}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={12} />
                  <span>Log Memory</span>
                </button>
              </div>
            </div>

            {/* List of Timestamped Memories */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {profile.memories.map((mem) => (
                <div
                  key={mem.id}
                  className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                    mem.sentiment === 'positive'
                      ? 'bg-slate-900/70 border-emerald-500/30 text-slate-200'
                      : mem.sentiment === 'attention_needed'
                      ? 'bg-slate-900/70 border-rose-500/30 text-slate-200'
                      : 'bg-slate-900/70 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-purple-300 uppercase font-bold">{mem.context.replace('_', ' ')}</span>
                    <span className="text-slate-500">
                      {new Date(mem.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="leading-relaxed font-sans">{mem.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
