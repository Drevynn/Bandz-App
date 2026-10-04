import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Send, 
  Loader2, 
  CheckCircle2, 
  Calendar, 
  Music, 
  DollarSign, 
  Users, 
  ArrowRight, 
  Volume2, 
  VolumeX, 
  History, 
  Bot, 
  Lightbulb, 
  X,
  Activity,
  Brain,
  Search,
  Laptop,
  Radio,
  FileText,
  Clock,
  ListMusic,
  MapPin,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Artist, Gig, Song, Setlist, BudgetItem, CollaborationRequest } from '../types';
import SharonStageVision from './SharonStageVision';
import SharonMemberMemory from './SharonMemberMemory';
import SharonDeepResearch from './SharonDeepResearch';
import SharonExecutiveSkills from './SharonExecutiveSkills';

interface SharonAssistantProps {
  artists: Artist[];
  activeArtist: Artist;
  gigs: Gig[];
  songs?: Song[];
  setlists?: Setlist[];
  onAddGig: (gig: Gig) => void;
  onUpdateGig?: (gig: Gig) => void;
  onAddSong: (song: Song) => void;
  onUpdateSong?: (song: Song) => void;
  onUpdateSetlist?: (setlist: Setlist) => void;
  onAddBudgetItem: (item: BudgetItem) => void;
  onAddCollaborationRequest?: (req: CollaborationRequest) => void;
  onUpdateArtist?: (artist: Artist) => void;
  onNavigateToTab?: (tabId: string) => void;
  onClose?: () => void;
  isModal?: boolean;
}

interface SharonActionLog {
  id: string;
  timestamp: string;
  userPrompt: string;
  sharonReply: string;
  actionType: 'add_gig' | 'add_song' | 'add_budget' | 'add_member' | 'add_collaboration' | 'update_tour_note' | 'update_setlist_change' | 'chat';
  targetEntityName?: string;
  targetTab?: string;
}

export type SharonModuleTab = 'chat' | 'dictation' | 'stage_vision' | 'memory' | 'research' | 'skills';
export type DictationMode = 'general' | 'tour_notes' | 'setlist';

export default function SharonAssistant({
  artists,
  activeArtist,
  gigs,
  songs = [],
  setlists = [],
  onAddGig,
  onUpdateGig,
  onAddSong,
  onUpdateSong,
  onUpdateSetlist,
  onAddBudgetItem,
  onAddCollaborationRequest,
  onUpdateArtist,
  onNavigateToTab,
  onClose,
  isModal = false
}: SharonAssistantProps) {
  const [activeModuleTab, setActiveModuleTab] = useState<SharonModuleTab>('chat');
  const [dictationMode, setDictationMode] = useState<DictationMode>('tour_notes');
  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [micPermissionState, setMicPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [transcriptNotice, setTranscriptNotice] = useState<string>('');
  
  // Real-time Audio Level Meter
  const [audioVolume, setAudioVolume] = useState<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const volumeIntervalRef = useRef<number | null>(null);

  // Voice Talk-Back State
  const [voiceTalkBackEnabled, setVoiceTalkBackEnabled] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  
  // History of Sharon interactions
  const [logs, setLogs] = useState<SharonActionLog[]>(() => {
    try {
      const saved = localStorage.getItem('bandz_sharon_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'initial-sharon-log',
        timestamp: new Date().toISOString(),
        userPrompt: 'Sharon, what can you do for the band?',
        sharonReply: `Hey! I'm Sharon, your AI Band Manager. You can now use your microphone to dictate tour road notes or setlist changes directly to me! Tell me anything you need done.`,
        actionType: 'chat'
      }
    ];
  });

  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition if supported in browser
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setMicPermissionState('granted');
        setTranscriptNotice('Microphone capturing voice... Speak clearly.');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript.trim()) {
          setInputQuery(prev => {
            // If user was already typing, append or replace
            if (!prev || prev === transcriptNotice) return currentTranscript;
            // If new speech arrives, set as current buffer
            return currentTranscript;
          });
          setTranscriptNotice(`Heard: "${currentTranscript.slice(-60)}"`);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition status:', event.error);
        if (event.error === 'not-allowed') {
          setMicPermissionState('denied');
          setTranscriptNotice('Microphone access blocked. Please allow microphone permissions in your browser bar.');
        } else if (event.error === 'no-speech') {
          // Expected when quiet, don't abort
        } else {
          setTranscriptNotice(`Voice status: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        // Recognition completed
        setIsListening(false);
        stopAudioLevelMonitoring();
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
      setMicPermissionState('unsupported');
    }

    return () => {
      stopMicrophoneDictation();
    };
  }, []);

  // Audio Level Meter using Web Audio API
  const startAudioLevelMonitoring = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setMicPermissionState('granted');

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
      volumeIntervalRef.current = window.setInterval(() => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        // Normalize to 0 - 100 percentage
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setAudioVolume(normalized);
      }, 75);
    } catch (err: any) {
      console.warn('Audio metering stream access:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicPermissionState('denied');
      }
    }
  };

  const stopAudioLevelMonitoring = () => {
    if (volumeIntervalRef.current) {
      clearInterval(volumeIntervalRef.current);
      volumeIntervalRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {
        // ignore
      }
      audioContextRef.current = null;
    }
    setAudioVolume(0);
  };

  // Vocalize speech as Sharon
  const speakAsSharon = (text: string) => {
    if (!voiceTalkBackEnabled || !text) return;

    const cleanSpeech = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/[#*`_~]/g, '')
      .trim();

    if (!cleanSpeech) return;

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanSpeech.slice(0, 320));
        utterance.rate = 1.05;
        utterance.pitch = 1.05;

        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => 
          (v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Victoria') || v.name.includes('Google UK English Female') || v.name.includes('Natural')) && v.lang.startsWith('en')
        ) || voices.find(v => v.lang.startsWith('en'));

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis playback error:', e);
        setIsSpeaking(false);
      }
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const startMicrophoneDictation = async (mode: DictationMode = 'general') => {
    setDictationMode(mode);
    setTranscriptNotice('Connecting to microphone...');

    try {
      // Start real-time audio VU volume monitoring
      await startAudioLevelMonitoring();

      if (recognitionRef.current) {
        recognitionRef.current.abort();
        setTimeout(() => {
          try {
            recognitionRef.current.start();
            setIsListening(true);
          } catch (e) {
            console.warn('Recognition start retry:', e);
          }
        }, 150);
      } else {
        setTranscriptNotice('Microphone capturing audio! Type your dictation or use voice templates.');
      }
    } catch (err: any) {
      console.warn('Microphone start error:', err);
      setTranscriptNotice('Could not access microphone. Check browser permissions.');
    }
  };

  const stopMicrophoneDictation = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    stopAudioLevelMonitoring();
    setIsListening(false);
  };

  const toggleVoiceListening = () => {
    if (isListening) {
      stopMicrophoneDictation();
    } else {
      startMicrophoneDictation('general');
    }
  };

  const executeSharonCommand = async (promptToRun?: string) => {
    const textToExecute = (promptToRun || inputQuery).trim();
    if (!textToExecute || isLoading) return;

    stopMicrophoneDictation();
    setIsLoading(true);
    setTranscriptNotice('');

    try {
      const response = await fetch('/api/sharon-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToExecute,
          artist: activeArtist,
          currentDate: new Date().toISOString()
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Sharon could not process the request');
      }

      const { action, data, reply } = result;
      let targetEntityName = '';
      let targetTab = '';

      // Execute and implement the action into the app!
      if (action === 'add_gig' && data) {
        const newGigId = `gig-sharon-${Date.now()}`;
        const newGig: Gig = {
          id: newGigId,
          artistId: activeArtist.id,
          title: data.title || `Live at ${data.venueName || 'Venue'}`,
          venueName: data.venueName || 'Local Music Venue',
          venueAddress: data.venueAddress || `${data.venueName || 'Venue'}, Seattle, WA`,
          dateTime: data.dateTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          ticketPrice: typeof data.ticketPrice === 'number' ? data.ticketPrice : 15,
          ticketUrl: data.ticketUrl || '',
          durationMinutes: data.durationMinutes || 60,
          description: data.description || `Show scheduled by Sharon (AI Manager) for ${activeArtist.name}.`,
          status: 'confirmed',
          eventType: data.eventType || 'gig',
          notes: `Added by Sharon AI Manager on ${new Date().toLocaleDateString()}`,
          promoChecklist: {
            pressRelease: false,
            socialPost: false,
            flyerDistributed: false,
            outreachCompleted: false,
            ticketsLive: false
          }
        };

        onAddGig(newGig);
        targetEntityName = newGig.title;
        targetTab = 'scheduler';
      } else if (action === 'update_tour_note' && data) {
        // Dictated Tour Notes Action!
        // Find matching gig by venue or next upcoming show
        const targetVenue = (data.targetVenueOrCity || '').toLowerCase();
        let targetGig = gigs.find(g => g.venueName.toLowerCase().includes(targetVenue) || g.title.toLowerCase().includes(targetVenue));
        if (!targetGig && gigs.length > 0) {
          targetGig = gigs[0];
        }

        if (targetGig && onUpdateGig) {
          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const newNoteEntry = `\n[Tour Note Dictation - ${timestamp}]: ${data.noteText || textToExecute}`;
          const updatedGig: Gig = {
            ...targetGig,
            notes: targetGig.notes ? `${targetGig.notes}${newNoteEntry}` : newNoteEntry.trim(),
            description: targetGig.description ? `${targetGig.description} (Road Note: ${data.noteText || textToExecute})` : (data.noteText || textToExecute)
          };
          onUpdateGig(updatedGig);
          targetEntityName = `Tour Note for ${targetGig.venueName}`;
          targetTab = 'scheduler';
        } else {
          targetEntityName = data.targetVenueOrCity || 'Tour Dispatch';
          targetTab = 'scheduler';
        }
      } else if (action === 'update_setlist_change' && data) {
        // Dictated Setlist Changes Action!
        const songName = data.songTitle || 'Updated Setlist Song';
        const existingSong = songs.find(s => s.title.toLowerCase().includes(songName.toLowerCase()));

        if (existingSong && onUpdateSong) {
          const updatedSong: Song = {
            ...existingSong,
            bpm: data.bpm || existingSong.bpm,
            key: data.key || existingSong.key
          };
          onUpdateSong(updatedSong);
          targetEntityName = `Song "${existingSong.title}" (${updatedSong.key || ''} ${updatedSong.bpm ? `@ ${updatedSong.bpm} BPM` : ''})`;
        } else {
          // Add newly dictated song
          const newSong: Song = {
            id: `song-dict-${Date.now()}`,
            artistId: activeArtist.id,
            title: songName,
            durationSec: 210,
            bpm: data.bpm || 124,
            key: data.key || 'A Minor',
            isOriginal: true,
            status: 'ready'
          };
          onAddSong(newSong);
          targetEntityName = `Setlist Song: ${newSong.title}`;
        }
        targetTab = 'setlist';
      } else if (action === 'add_song' && data) {
        const newSongId = `song-sharon-${Date.now()}`;
        const newSong: Song = {
          id: newSongId,
          artistId: activeArtist.id,
          title: data.title || 'Untitled Track',
          durationSec: typeof data.durationSec === 'number' ? data.durationSec : 210,
          bpm: typeof data.bpm === 'number' ? data.bpm : 120,
          key: data.key || 'A Minor',
          isOriginal: data.isOriginal !== false,
          status: 'ready'
        };

        onAddSong(newSong);
        targetEntityName = newSong.title;
        targetTab = 'setlist';
      } else if (action === 'add_budget' && data) {
        const newBudgetId = `budget-sharon-${Date.now()}`;
        const newBudgetItem: BudgetItem = {
          id: newBudgetId,
          gigId: gigs[0]?.id || 'general',
          title: data.title || 'Band Transaction',
          amount: typeof data.amount === 'number' ? data.amount : 100,
          type: data.type === 'income' ? 'income' : 'expense',
          category: data.category || 'other',
          date: new Date().toISOString()
        };

        onAddBudgetItem(newBudgetItem);
        targetEntityName = `$${newBudgetItem.amount} (${newBudgetItem.title})`;
        targetTab = 'budgets';
      } else if (action === 'add_member' && data && onUpdateArtist) {
        const updatedMembers = [...activeArtist.members];
        if (data.name && !updatedMembers.some(m => m.name.toLowerCase() === data.name.toLowerCase())) {
          updatedMembers.push({
            id: `mem-sharon-${Date.now()}`,
            name: data.name,
            role: data.role || 'Band Member'
          });
          onUpdateArtist({
            ...activeArtist,
            members: updatedMembers
          });
          targetEntityName = data.name;
          targetTab = 'artists';
        }
      } else if (action === 'add_collaboration' && data && onAddCollaborationRequest) {
        const newCollabId = `collab-sharon-${Date.now()}`;
        const newCollab: CollaborationRequest = {
          id: newCollabId,
          authorArtistId: activeArtist.id,
          authorArtistName: activeArtist.name,
          authorContactEmail: activeArtist.contactEmail || 'booking@bandz.io',
          authorGenre: activeArtist.genre,
          title: data.title || `${(data.roleNeeded || 'Collaborator').replace(/_/g, ' ')} needed for ${activeArtist.name}`,
          roleNeeded: data.roleNeeded || 'drummer',
          skillsRequired: Array.isArray(data.skillsRequired) && data.skillsRequired.length > 0 
            ? data.skillsRequired 
            : ['Live Performance', 'In-Ear Monitors', 'Rehearsal Discipline'],
          description: data.description || `Seeking a talented collaborator to join ${activeArtist.name}. Posted automatically via Sharon AI Manager.`,
          location: data.location || 'Seattle, WA',
          isRemote: Boolean(data.isRemote),
          compensationType: data.compensationType || 'paid_fixed',
          compensationAmount: data.compensationAmount || '$200 flat fee',
          status: 'open',
          responses: [],
          createdAt: new Date().toISOString()
        };

        onAddCollaborationRequest(newCollab);
        targetEntityName = newCollab.title;
        targetTab = 'collaborate';
      }

      // Vocalize reply
      if (reply) {
        speakAsSharon(reply);
      }

      // Add to action logs
      const newLog: SharonActionLog = {
        id: `sharon-log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userPrompt: textToExecute,
        sharonReply: reply || "Action implemented into your workspace!",
        actionType: action,
        targetEntityName,
        targetTab
      };

      const updatedLogs = [newLog, ...logs];
      setLogs(updatedLogs);
      localStorage.setItem('bandz_sharon_history', JSON.stringify(updatedLogs.slice(0, 30)));
      setInputQuery('');
    } catch (err: any) {
      console.error(err);
      const errorReply = `Sorry, I encountered an issue: ${err.message || 'Could not complete request'}. Please try again!`;
      speakAsSharon(errorReply);
      const errorLog: SharonActionLog = {
        id: `sharon-err-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userPrompt: textToExecute,
        sharonReply: errorReply,
        actionType: 'chat'
      };
      setLogs([errorLog, ...logs]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleDictationPrompts = {
    tour_notes: [
      { text: `Sharon tour note for Crocodile show: load-in is 5:30 PM sharp, sound engineer is Dave, parking is in back alley, green room code is 4021.`, label: 'Venue Load-in & Access Note' },
      { text: `Sharon tour note for Denver show: merch table needs 6ft banner and cash float, hotel check-in at Holiday Inn is 3pm.`, label: 'Tour Merch & Lodging' },
      { text: `Sharon road note: guitar amp tube fuse replaced during soundcheck, bring backup cables to Seattle show.`, label: 'Tech & Soundcheck Observation' }
    ],
    setlist: [
      { text: `Sharon setlist change: move track "Midnight Echoes" to the encore and set tempo to 126 BPM in key of E Minor.`, label: 'Encore Move & Tempo Change' },
      { text: `Sharon setlist update: add new song "Neon Horizons" 3m 45s at 120 BPM in A Minor as our mid-set opener.`, label: 'Add New Song to Setlist' },
      { text: `Sharon setlist note: open with extended drum intro into track 1, then segue immediately into track 2 without stopping.`, label: 'Pacing & Transition Note' }
    ],
    general: [
      { text: 'Sharon add the RINO room gig Dec 1 2026', label: 'Book Gig' },
      { text: 'Sharon log $200 expense for new drum heads', label: 'Log Budget Expense' },
      { text: 'Sharon find a drummer for our RINO Room gig', label: 'Find Collaborator' }
    ]
  };

  return (
    <div className={`relative flex flex-col bg-slate-900 border border-purple-500/30 rounded-2xl overflow-hidden shadow-2xl ${isModal ? 'max-w-4xl w-full mx-auto' : 'w-full'}`}>
      {/* Top Sharon Status Bar */}
      <div className="bg-gradient-to-r from-purple-950/90 via-slate-900 to-indigo-950/90 border-b border-purple-500/20 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 border border-purple-300/30 transition-transform ${isListening ? 'scale-110 ring-4 ring-purple-500/40 animate-pulse' : ''}`}>
              {isListening ? <Mic size={24} className="text-white animate-bounce" /> : <Bot size={24} className={isSpeaking ? 'animate-bounce' : 'animate-pulse'} />}
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${isListening ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold font-display text-slate-100 text-sm sm:text-base flex items-center gap-2">
                <span>Sharon</span>
                <span className="text-[10px] font-mono font-bold bg-purple-500/20 border border-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full uppercase">
                  AI Band Manager • Microphone Studio
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Managing <span className="text-purple-300 font-bold">{activeArtist.name}</span> • Dictate Tour Notes & Setlist Changes Live
            </p>
          </div>
        </div>

        {/* Global Controls: Mic Access Button, Voice Talk-Back Toggle, Close */}
        <div className="flex items-center gap-2">
          {/* Quick Mic Access Toggle Button */}
          <button
            onClick={toggleVoiceListening}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md border ${
              isListening
                ? 'bg-rose-600 border-rose-400 text-white shadow-rose-600/30 animate-pulse'
                : 'bg-purple-600 hover:bg-purple-500 border-purple-400/40 text-white shadow-purple-600/20'
            }`}
            title="Toggle Live Microphone Access"
          >
            {isListening ? (
              <>
                <MicOff size={14} />
                <span>Stop Mic</span>
              </>
            ) : (
              <>
                <Mic size={14} />
                <span>Dictate to Sharon</span>
              </>
            )}
          </button>

          {/* Voice Talk-Back Toggle */}
          <button
            onClick={() => {
              if (isSpeaking) stopSpeaking();
              setVoiceTalkBackEnabled(!voiceTalkBackEnabled);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              voiceTalkBackEnabled
                ? 'bg-purple-600/30 border-purple-500/40 text-purple-200'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Toggle Sharon Voice Talk-Back"
          >
            {voiceTalkBackEnabled ? (
              <>
                <Volume2 size={13} className={isSpeaking ? 'animate-pulse text-amber-300' : 'text-purple-300'} />
                <span>Voice: ON</span>
              </>
            ) : (
              <>
                <VolumeX size={13} />
                <span>Voice: OFF</span>
              </>
            )}
          </button>

          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
            >
              Mute
            </button>
          )}

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Sharon Assistant"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Main Sharon Capability Tabs */}
      <div className="flex overflow-x-auto gap-1 p-2 bg-slate-950/80 border-b border-purple-500/20 scrollbar-none">
        <button
          onClick={() => setActiveModuleTab('chat')}
          className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeModuleTab === 'chat'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Bot size={14} />
          <span>Manager Chat & Voice</span>
        </button>

        <button
          onClick={() => {
            setActiveModuleTab('dictation');
            if (!isListening) startMicrophoneDictation('tour_notes');
          }}
          className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeModuleTab === 'dictation'
              ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow-md shadow-rose-600/30 ring-1 ring-rose-400/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Mic size={14} className={isListening ? 'text-rose-400 animate-pulse' : 'text-purple-400'} />
          <span>Dictation Studio</span>
          <span className="text-[9px] bg-rose-950/80 border border-rose-500/40 text-rose-300 px-1.5 py-0.2 rounded-full font-mono">
            Tour & Setlist
          </span>
        </button>

        <button
          onClick={() => setActiveModuleTab('stage_vision')}
          className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeModuleTab === 'stage_vision'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Activity size={14} className="text-purple-400" />
          <span>Stage Vision Lab</span>
          <span className="text-[9px] bg-purple-900/80 border border-purple-400/40 text-purple-200 px-1.5 py-0.2 rounded-full">
            HUD
          </span>
        </button>

        <button
          onClick={() => setActiveModuleTab('memory')}
          className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeModuleTab === 'memory'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Brain size={14} className="text-pink-400" />
          <span>Member Memory</span>
        </button>

        <button
          onClick={() => setActiveModuleTab('research')}
          className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeModuleTab === 'research'
              ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Search size={14} className="text-cyan-400" />
          <span>Deep Research</span>
        </button>

        <button
          onClick={() => setActiveModuleTab('skills')}
          className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeModuleTab === 'skills'
              ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md shadow-cyan-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Laptop size={14} className="text-teal-400" />
          <span>Phone & Computer</span>
        </button>
      </div>

      {/* Real-time Audio Level VU Meter & Active Dictation Banner */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-rose-950/80 via-purple-950/80 to-slate-950/90 border-b border-rose-500/30 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              {/* Dynamic VU Meter soundwave bars */}
              <div className="flex items-center gap-1 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-rose-500/30">
                {[...Array(8)].map((_, i) => {
                  const factor = (i + 1) / 8;
                  const isSpike = (audioVolume / 100) > (factor * 0.7);
                  const barHeight = isSpike ? Math.max(8, Math.round((audioVolume / 100) * 24)) : 6;
                  return (
                    <motion.div
                      key={i}
                      animate={{ height: barHeight }}
                      transition={{ duration: 0.08 }}
                      className={`w-1 rounded-full ${
                        isSpike 
                          ? (i > 5 ? 'bg-rose-400' : 'bg-emerald-400') 
                          : 'bg-purple-500/40'
                      }`}
                    />
                  );
                })}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs font-mono font-bold text-white uppercase">
                    Live Microphone Active
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                    Audio Level: {audioVolume}%
                  </span>
                </div>
                <p className="text-[11px] text-purple-200 font-mono truncate max-w-md mt-0.5">
                  {transcriptNotice || 'Dictate tour notes or setlist changes... Sharon is recording.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  stopMicrophoneDictation();
                  if (inputQuery.trim()) {
                    executeSharonCommand();
                  }
                }}
                disabled={!inputQuery.trim() || isLoading}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/30"
              >
                <CheckCircle2 size={13} />
                <span>Save & Execute</span>
              </button>

              <button
                onClick={stopMicrophoneDictation}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-700"
              >
                <MicOff size={12} />
                <span>Cancel</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Permission Warning Notice if Denied */}
      {micPermissionState === 'denied' && (
        <div className="bg-rose-950/60 border-b border-rose-500/40 px-4 py-2.5 flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="text-rose-400 shrink-0" />
            <span>Microphone permission was denied. Click the microphone icon in your browser URL bar to allow microphone access, then retry.</span>
          </div>
          <button
            onClick={() => startMicrophoneDictation('general')}
            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-mono font-bold shrink-0 cursor-pointer"
          >
            Retry Permission
          </button>
        </div>
      )}

      {/* MODULE 1: DEDICATED DICTATION STUDIO */}
      {activeModuleTab === 'dictation' && (
        <div className="p-4 sm:p-6 space-y-5 bg-slate-950/60">
          {/* Dictation Mode Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-500/20 pb-4">
            <div>
              <h4 className="font-bold text-white text-base font-display flex items-center gap-2">
                <span>Microphone Dictation Studio</span>
                <span className="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                  Speech-to-Action
                </span>
              </h4>
              <p className="text-xs text-slate-400">
                Dictate road notes, load-in requirements, hotel details, or setlist song adjustments directly into Sharon.
              </p>
            </div>

            {/* Mode Pills */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setDictationMode('tour_notes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  dictationMode === 'tour_notes'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MapPin size={12} />
                <span>Tour Notes</span>
              </button>
              <button
                onClick={() => setDictationMode('setlist')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  dictationMode === 'setlist'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ListMusic size={12} />
                <span>Setlist Changes</span>
              </button>
              <button
                onClick={() => setDictationMode('general')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  dictationMode === 'general'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bot size={12} />
                <span>General Directives</span>
              </button>
            </div>
          </div>

          {/* Microphone Main Control Hero Box */}
          <div className="bg-slate-900/90 rounded-2xl border border-purple-500/30 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    if (isListening) stopMicrophoneDictation();
                    else startMicrophoneDictation(dictationMode);
                  }}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white transition-all cursor-pointer shadow-xl ${
                    isListening
                      ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/40 ring-4 ring-rose-500/30 animate-pulse'
                      : 'bg-gradient-to-tr from-purple-600 to-indigo-600 hover:opacity-95 shadow-purple-600/30'
                  }`}
                  title={isListening ? 'Click to Stop Dictating' : 'Click to Speak into Microphone'}
                >
                  {isListening ? <MicOff size={28} /> : <Mic size={28} />}
                </button>

                <div>
                  <h5 className="font-bold text-white text-sm sm:text-base font-display flex items-center gap-2">
                    <span>{isListening ? 'Sharon is Listening to You' : 'Tap Microphone to Dictate'}</span>
                    {isListening && (
                      <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full animate-pulse">
                        REC
                      </span>
                    )}
                  </h5>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {dictationMode === 'tour_notes' && 'Speak your venue notes, stage timings, parking instructions, or lodging info.'}
                    {dictationMode === 'setlist' && 'Speak your song swaps, tempo adjustments, key transpositions, or encore cues.'}
                    {dictationMode === 'general' && 'Speak any band command: schedule gigs, log budget expenses, or find musicians.'}
                  </p>
                </div>
              </div>

              {/* Dictation Status Metrics */}
              <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Mic Status</span>
                  <span className={`font-bold ${isListening ? 'text-rose-400' : 'text-slate-400'}`}>
                    {isListening ? 'CAPTURING AUDIO' : 'READY TO RECORD'}
                  </span>
                </div>
                <div className="w-px h-7 bg-slate-800" />
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Live Audio Level</span>
                  <span className="font-bold text-emerald-400">{audioVolume}% VU</span>
                </div>
              </div>
            </div>

            {/* Live Streaming Transcript Editor Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <Radio size={12} className={isListening ? 'text-rose-400 animate-pulse' : 'text-purple-400'} />
                  <span>Dictated Speech Buffer:</span>
                </span>
                {inputQuery && (
                  <button
                    onClick={() => setInputQuery('')}
                    className="text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={11} />
                    <span>Clear text</span>
                  </button>
                )}
              </div>

              <div className="relative">
                <textarea
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder={
                    dictationMode === 'tour_notes'
                      ? 'Dictated tour notes will stream here in real-time... (e.g. "Sharon tour note for Crocodile: load-in moved to 5:30pm, parking behind the alley")'
                      : dictationMode === 'setlist'
                      ? 'Dictated setlist changes will stream here... (e.g. "Sharon setlist change: move Midnight Echoes to encore in key of E Minor at 126 BPM")'
                      : 'Dictated band directives will stream here... (e.g. "Sharon add the RINO room gig Dec 1 2026")'
                  }
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500/30 leading-relaxed font-sans"
                />

                {isListening && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-rose-950/80 border border-rose-500/40 text-[10px] font-mono text-rose-300 px-2 py-0.5 rounded-md backdrop-blur-sm animate-pulse">
                    <span>Streaming speech...</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="text-[11px] text-slate-500 font-mono">
                  💡 Speak naturally into your microphone or click any template below to test.
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (isListening) stopMicrophoneDictation();
                      executeSharonCommand();
                    }}
                    disabled={!inputQuery.trim() || isLoading}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 disabled:opacity-50 text-white rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Sharon is Implementing...</span>
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        <span>Execute Dictation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick-Click Sample Dictation Starters */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                Quick Dictation Starters (Click or Speak aloud):
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {sampleDictationPrompts[dictationMode].map((starter, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputQuery(starter.text);
                      executeSharonCommand(starter.text);
                    }}
                    disabled={isLoading}
                    className="text-left p-2.5 rounded-xl bg-slate-950 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/40 transition-all text-xs group cursor-pointer disabled:opacity-50"
                  >
                    <span className="font-bold text-purple-300 group-hover:text-white font-mono text-[10.5px] block truncate">
                      {starter.label}
                    </span>
                    <p className="text-slate-400 group-hover:text-slate-200 text-[11px] line-clamp-2 mt-0.5 leading-snug">
                      "{starter.text}"
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 2: STAGE VISION LAB */}
      {activeModuleTab === 'stage_vision' && (
        <div className="p-4 sm:p-5">
          <SharonStageVision
            artistName={activeArtist.name}
            onSharonSpeak={speakAsSharon}
            voiceEnabled={voiceTalkBackEnabled}
          />
        </div>
      )}

      {/* MODULE 3: MEMBER COGNITIVE MEMORY */}
      {activeModuleTab === 'memory' && (
        <div className="p-4 sm:p-5">
          <SharonMemberMemory
            activeArtist={activeArtist}
            onUpdateArtist={onUpdateArtist}
            onSharonSpeak={speakAsSharon}
            voiceEnabled={voiceTalkBackEnabled}
          />
        </div>
      )}

      {/* MODULE 4: DEEP RESEARCH ENGINE */}
      {activeModuleTab === 'research' && (
        <div className="p-4 sm:p-5">
          <SharonDeepResearch
            artistName={activeArtist.name}
            genre={activeArtist.genre}
            onSharonSpeak={speakAsSharon}
            voiceEnabled={voiceTalkBackEnabled}
            onNavigateToTab={onNavigateToTab}
          />
        </div>
      )}

      {/* MODULE 5: PHONE & COMPUTER SKILLS */}
      {activeModuleTab === 'skills' && (
        <div className="p-4 sm:p-5">
          <SharonExecutiveSkills
            activeArtist={activeArtist}
            gigs={gigs}
            songs={songs}
            onAddGig={onAddGig}
            onAddBudgetItem={onAddBudgetItem}
            onSharonSpeak={speakAsSharon}
            voiceEnabled={voiceTalkBackEnabled}
          />
        </div>
      )}

      {/* MODULE 6: MANAGER CHAT & VOICE COMMAND CONSOLE (DEFAULT) */}
      {activeModuleTab === 'chat' && (
        <>
          {/* Quick Suggestion Pills */}
          <div className="px-4 sm:px-5 pt-3 pb-2 border-b border-slate-800/80 bg-slate-950/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-mono font-bold">
                <Lightbulb size={12} className="text-amber-400" />
                <span>Try saying into microphone or clicking:</span>
              </div>
              <button
                onClick={() => {
                  setActiveModuleTab('dictation');
                  startMicrophoneDictation('tour_notes');
                }}
                className="text-[10.5px] font-mono text-purple-300 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <Mic size={11} />
                <span>Open Dictation Studio →</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setInputQuery('Sharon tour note for Crocodile: load-in is 5:30 PM sharp, sound engineer is Dave, green room code is 4021');
                  executeSharonCommand('Sharon tour note for Crocodile: load-in is 5:30 PM sharp, sound engineer is Dave, green room code is 4021');
                }}
                disabled={isLoading}
                className="text-left text-[11px] bg-slate-800/70 hover:bg-purple-900/40 hover:border-purple-500/40 border border-slate-750 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <MapPin size={12} className="text-emerald-400" />
                <span>"Dictate Crocodile Tour Note"</span>
              </button>

              <button
                onClick={() => {
                  setInputQuery('Sharon setlist change: move Midnight Echoes to encore in key of E Minor at 126 BPM');
                  executeSharonCommand('Sharon setlist change: move Midnight Echoes to encore in key of E Minor at 126 BPM');
                }}
                disabled={isLoading}
                className="text-left text-[11px] bg-slate-800/70 hover:bg-purple-900/40 hover:border-purple-500/40 border border-slate-750 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <ListMusic size={12} className="text-amber-400" />
                <span>"Dictate Setlist Encore Change"</span>
              </button>

              <button
                onClick={() => {
                  setInputQuery('Sharon add the RINO room gig Dec 1 2026');
                  executeSharonCommand('Sharon add the RINO room gig Dec 1 2026');
                }}
                disabled={isLoading}
                className="text-left text-[11px] bg-slate-800/70 hover:bg-purple-900/40 hover:border-purple-500/40 border border-slate-750 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Calendar size={12} className="text-purple-400" />
                <span>"Sharon add the RINO room gig Dec 1 2026"</span>
              </button>

              <button
                onClick={() => {
                  setInputQuery('Sharon log $200 expense for new drum heads');
                  executeSharonCommand('Sharon log $200 expense for new drum heads');
                }}
                disabled={isLoading}
                className="text-left text-[11px] bg-slate-800/70 hover:bg-purple-900/40 hover:border-purple-500/40 border border-slate-750 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <DollarSign size={12} className="text-rose-400" />
                <span>"Sharon log $200 expense"</span>
              </button>
            </div>
          </div>

          {/* Interactive Command Input Box with Live Microphone Button */}
          <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-950/60">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeSharonCommand();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Speak or type: e.g. 'Sharon tour note for Crocodile: load-in at 5:30pm' or 'Sharon setlist change: move track 3 to encore'..."
                  disabled={isLoading}
                  className="w-full bg-slate-900/90 border border-slate-750 focus:border-purple-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 pr-12 transition-all font-sans"
                />

                {/* Voice microphone button inside input */}
                <button
                  type="button"
                  onClick={toggleVoiceListening}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-pulse'
                      : 'text-slate-400 hover:text-purple-300 hover:bg-slate-800'
                  }`}
                  title={speechSupported ? "Tap to speak into microphone" : "Microphone not supported in this browser"}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className="px-4 sm:px-5 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed shadow-lg shadow-purple-600/20 shrink-0 font-mono"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <span>SEND</span>
                    <Send size={14} />
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 font-mono">
              <span className="flex items-center gap-1.5">
                <Mic size={11} className={isListening ? 'text-rose-400 animate-pulse' : 'text-slate-500'} />
                <span>{isListening ? `Dictating live (${audioVolume}% VU)...` : 'Microphone ready for speech dictation'}</span>
              </span>
              <span>⚡ Gemini 3.8 Flash • Sharon Executive Suite</span>
            </div>
          </div>

          {/* Activity Logs of Actions Implemented by Sharon */}
          <div className="p-4 sm:p-5 space-y-3.5 max-h-80 overflow-y-auto bg-slate-900/50">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400 font-bold">
              <span className="flex items-center gap-1.5">
                <History size={13} className="text-purple-400" />
                <span>Sharon Activity & Implemented Dictations</span>
              </span>
              <span className="text-slate-500 text-[10px]">{logs.length} logged events</span>
            </div>

            <div className="space-y-3">
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2 text-xs"
                >
                  {/* User Prompt */}
                  <div className="flex items-start justify-between gap-2 text-slate-300">
                    <span className="font-semibold text-purple-300 font-sans flex items-center gap-1.5">
                      <Mic size={11} className="text-purple-400" />
                      <span>Band Dictation:</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-200 pl-2 border-l-2 border-purple-500/40 italic font-mono text-[11px]">
                    "{log.userPrompt}"
                  </p>

                  {/* Sharon Reply */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot size={13} />
                    </div>
                    <div className="space-y-2 flex-1">
                      <p className="text-slate-300 leading-relaxed text-[11.5px]">
                        {log.sharonReply}
                      </p>

                      {/* If an entity was created or modified, show quick link to view in that tab */}
                      {log.targetEntityName && log.targetTab && (
                        <div className="flex items-center justify-between bg-emerald-950/30 border border-emerald-500/30 rounded-lg px-3 py-1.5 text-[10px]">
                          <span className="flex items-center gap-1.5 text-emerald-300 font-mono font-bold">
                            <CheckCircle2 size={12} className="text-emerald-400" />
                            <span>Implemented: {log.targetEntityName}</span>
                          </span>

                          {onNavigateToTab && (
                            <button
                              onClick={() => {
                                if (isModal && onClose) onClose();
                                onNavigateToTab(log.targetTab!);
                              }}
                              className="text-purple-300 hover:text-white font-bold hover:underline flex items-center gap-1 cursor-pointer font-mono"
                            >
                              <span>Open in {log.targetTab.toUpperCase()}</span>
                              <ArrowRight size={10} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
