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
  History, 
  Bot, 
  Lightbulb, 
  X,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Artist, Gig, Song, BudgetItem, CollaborationRequest } from '../types';

interface SharonAssistantProps {
  artists: Artist[];
  activeArtist: Artist;
  gigs: Gig[];
  onAddGig: (gig: Gig) => void;
  onAddSong: (song: Song) => void;
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
  actionType: 'add_gig' | 'add_song' | 'add_budget' | 'add_member' | 'add_collaboration' | 'chat';
  targetEntityName?: string;
  targetTab?: string;
}

export default function SharonAssistant({
  artists,
  activeArtist,
  gigs,
  onAddGig,
  onAddSong,
  onAddBudgetItem,
  onAddCollaborationRequest,
  onUpdateArtist,
  onNavigateToTab,
  onClose,
  isModal = false
}: SharonAssistantProps) {
  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [transcriptNotice, setTranscriptNotice] = useState<string>('');
  
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
        sharonReply: "Hey! I'm Sharon, your AI Band Manager. Tell me anything you need done: add gigs, schedule rehearsals, compose setlists, log split finances, or add band members. Just speak or type your request!",
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
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscriptNotice('Sharon is listening... Speak your request.');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setInputQuery(currentTranscript);
        setTranscriptNotice(`Heard: "${currentTranscript}"`);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        setTranscriptNotice('Voice input ended or microphone access paused.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const toggleVoiceListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported or permitted in this browser window. You can type your request directly to Sharon below!');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInputQuery('');
      setTranscriptNotice('Activating microphone...');
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start err:', err);
      }
    }
  };

  const executeSharonCommand = async (promptToRun?: string) => {
    const textToExecute = (promptToRun || inputQuery).trim();
    if (!textToExecute || isLoading) return;

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      setIsListening(false);
    }

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
      const errorLog: SharonActionLog = {
        id: `sharon-err-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userPrompt: textToExecute,
        sharonReply: `Sorry, I encountered an issue: ${err.message || 'Could not complete request'}. Please try again!`,
        actionType: 'chat'
      };
      setLogs([errorLog, ...logs]);
    } finally {
      setIsLoading(false);
    }
  };

  const examplePrompts = [
    { text: 'Sharon add the RINO room gig Dec 1 2026', icon: Calendar, color: 'text-purple-400' },
    { text: 'Sharon find a drummer for our RINO Room gig', icon: Users, color: 'text-pink-400' },
    { text: 'Sharon schedule rehearsal this Thursday at 7pm', icon: Calendar, color: 'text-cyan-400' },
    { text: 'Sharon add song "Midnight Echoes" 3m 45s in Em at 124 BPM', icon: Music, color: 'text-amber-400' },
    { text: 'Sharon log $200 expense for new drum heads', icon: DollarSign, color: 'text-rose-400' },
    { text: 'Sharon post request for graphic designer for tour poster', icon: Users, color: 'text-indigo-400' }
  ];

  return (
    <div className={`relative flex flex-col bg-slate-900 border border-purple-500/30 rounded-2xl overflow-hidden shadow-2xl ${isModal ? 'max-w-2xl w-full mx-auto' : 'w-full'}`}>
      {/* Top Sharon Status Bar */}
      <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border-b border-purple-500/20 p-4 sm:p-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 border border-purple-300/30">
              <Bot size={22} className="animate-pulse" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold font-display text-slate-100 text-sm sm:text-base flex items-center gap-1.5">
                <span>Sharon</span>
                <span className="text-[10px] font-mono font-bold bg-purple-500/20 border border-purple-500/30 text-purple-300 px-1.5 py-0.2 rounded uppercase">
                  AI Band Manager
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Managing <span className="text-purple-300 font-bold">{activeArtist.name}</span> • Listening for voice & text instructions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Sharon Assistant"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Voice Listening Wave Indicator if active */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-purple-950/60 border-b border-purple-500/30 px-5 py-3 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [6, 22, 6] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                    className="w-1 bg-purple-400 rounded-full"
                  />
                ))}
              </div>
              <span className="text-xs font-mono font-bold text-purple-300 animate-pulse">
                {transcriptNotice || 'Sharon is listening to your request...'}
              </span>
            </div>

            <button
              onClick={toggleVoiceListening}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold font-mono transition-colors flex items-center gap-1 cursor-pointer"
            >
              <MicOff size={12} />
              <span>Finish Speaking</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Suggestion Pills */}
      <div className="px-4 sm:px-5 pt-3 pb-2 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-mono font-bold mb-2">
          <Lightbulb size={12} className="text-amber-400" />
          <span>Try saying or clicking:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {examplePrompts.map((example, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputQuery(example.text);
                executeSharonCommand(example.text);
              }}
              disabled={isLoading}
              className="text-left text-[11px] bg-slate-800/70 hover:bg-purple-900/40 hover:border-purple-500/40 border border-slate-750 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <example.icon size={12} className={example.color} />
              <span>"{example.text}"</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Command Input Box */}
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
              placeholder="e.g. Sharon add the RINO room gig Dec 1 2026..."
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
              title={speechSupported ? "Tap to speak to Sharon" : "Microphone not supported in this browser"}
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
          <span>🎤 Speak or type your management request for {activeArtist.name}</span>
          <span>⚡ Gemini 3.8 Flash Engine</span>
        </div>
      </div>

      {/* Activity Logs of Actions Implemented by Sharon */}
      <div className="p-4 sm:p-5 space-y-3.5 max-h-80 overflow-y-auto bg-slate-900/50">
        <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400 font-bold">
          <span className="flex items-center gap-1.5">
            <History size={13} className="text-purple-400" />
            <span>Sharon Activity & Implemented Actions</span>
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
                <span className="font-semibold text-purple-300 font-sans">Band Request:</span>
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

                  {/* If an entity was created, show quick link to view in that tab */}
                  {log.targetEntityName && log.targetTab && (
                    <div className="flex items-center justify-between bg-emerald-950/30 border border-emerald-500/30 rounded-lg px-3 py-1.5 text-[10px]">
                      <span className="flex items-center gap-1.5 text-emerald-300 font-mono font-bold">
                        <CheckCircle2 size={12} className="text-emerald-400" />
                        <span>Implemented in App: {log.targetEntityName}</span>
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
    </div>
  );
}
