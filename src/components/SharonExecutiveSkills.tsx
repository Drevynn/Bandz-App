import React, { useState } from 'react';
import { 
  Phone, 
  Laptop, 
  Send, 
  MessageSquare, 
  Copy, 
  Check, 
  FileText, 
  Mic, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  ExternalLink,
  Share2
} from 'lucide-react';
import { Artist, Gig, Song, BudgetItem } from '../types';

interface SharonExecutiveSkillsProps {
  activeArtist: Artist;
  gigs: Gig[];
  songs: Song[];
  onAddGig?: (gig: Gig) => void;
  onAddBudgetItem?: (item: BudgetItem) => void;
  onSharonSpeak?: (text: string) => void;
  voiceEnabled: boolean;
}

export default function SharonExecutiveSkills({
  activeArtist,
  gigs,
  songs,
  onAddGig,
  onAddBudgetItem,
  onSharonSpeak,
  voiceEnabled
}: SharonExecutiveSkillsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'phone' | 'computer'>('phone');
  
  // Phone: SMS Dispatcher states
  const [smsTargetMessage, setSmsTargetMessage] = useState(
    `🚨 Band Alert: Load-in is 5:30 PM sharp at ${gigs[0]?.venueName || 'the venue'}. Soundcheck at 6:15 PM. Downbeat at 8:00 PM!`
  );
  const [copiedSms, setCopiedSms] = useState(false);

  // Phone: Call Simulator states
  const [simulatorStep, setSimulatorStep] = useState(0);
  const [userPitchResponse, setUserPitchResponse] = useState('');
  const [simDialogue, setSimDialogue] = useState<Array<{ sender: 'booker' | 'user'; text: string; feedback?: string }>>([
    {
      sender: 'booker',
      text: `Hey, this is Dave, talent buyer at The Crocodile. Saw your email. What kind of crowd can ${activeArtist.name} realistically draw on a Thursday night in Seattle?`
    }
  ]);
  const [isSimScoring, setIsSimScoring] = useState(false);

  // Phone: Voice Memo Ingestion states
  const [voiceMemoText, setVoiceMemoText] = useState('');
  const [memoExtractionResult, setMemoExtractionResult] = useState<{
    gigCandidate?: { venue: string; date: string; pay: number };
    tasks: string[];
  } | null>(null);

  // Computer: Stage Plot & Rider states
  const [copiedTechRider, setCopiedTechRider] = useState(false);
  const [copiedContract, setCopiedContract] = useState(false);

  // Handle Booker Call Simulator response
  const handleSendSimulatorPitch = () => {
    if (!userPitchResponse.trim() || isSimScoring) return;

    const userText = userPitchResponse.trim();
    setUserPitchResponse('');
    setIsSimScoring(true);

    const bookerReplies = [
      {
        question: `Got it. If we put you on a 3-band bill, what's your guarantee expectation versus door split? And do you have your own sound engineer or are you using house production?`,
        feedback: `Great pitch! You clearly stated your past attendance. Always mention your social engagement or local mailing list numbers to strengthen your guarantee leverage.`
      },
      {
        question: `Sounds workable. Send me your tech rider, stage plot, and 2 available dates in November. Let's make it happen.`,
        feedback: `Excellent negotiation! You agreed to the 80/20 door split while holding firm on the 45-minute set length.`
      }
    ];

    setTimeout(() => {
      const nextStepData = bookerReplies[simulatorStep] || {
        question: `Deal confirmed! Send over the performance agreement for ${activeArtist.name}.`,
        feedback: `Outstanding booking call simulation! Sharon rates your phone pitch 96/100.`
      };

      setSimDialogue(prev => [
        ...prev,
        { sender: 'user', text: userText },
        { 
          sender: 'booker', 
          text: nextStepData.question,
          feedback: nextStepData.feedback
        }
      ]);

      setSimulatorStep(s => s + 1);
      setIsSimScoring(false);

      if (voiceEnabled && onSharonSpeak) {
        onSharonSpeak(nextStepData.question);
      }
    }, 1200);
  };

  // Extract action items from phone voice memo
  const handleExtractVoiceMemo = () => {
    if (!voiceMemoText.trim()) return;

    const text = voiceMemoText.toLowerCase();
    let venue = 'The Showbox';
    if (text.includes('sunset')) venue = 'The Sunset Tavern';
    else if (text.includes('tractor')) venue = 'Tractor Tavern';
    else if (text.includes('neumos')) venue = 'Neumos';

    const payMatch = voiceMemoText.match(/\$?(\d+)/);
    const pay = payMatch ? parseInt(payMatch[1], 10) : 350;

    const extracted = {
      gigCandidate: {
        venue,
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        pay
      },
      tasks: [
        `Send technical stage plot to ${venue} house audio engineer.`,
        `Confirm ${pay} payout structure ($ guarantee vs 80/20 door split).`,
        `Alert band members to block out the show date in tour calendar.`
      ]
    };

    setMemoExtractionResult(extracted);

    if (voiceEnabled && onSharonSpeak) {
      onSharonSpeak(`Voice memo analyzed. Extracted show offer at ${venue} with $${pay} payout!`);
    }
  };

  // Tech Rider template
  const generateTechRider = () => {
    return `=====================================================
TECHNICAL STAGE PLOT & INPUT RIDER
Artist: ${activeArtist.name}
Genre: ${activeArtist.genre}
Contact: ${activeArtist.contactEmail || 'booking@bandz.io'}
Manager: Sharon (AI Band Manager)
=====================================================

1. STAGE POSITIONING & LAYOUT:
- Stage Left (House Right): Lead Guitar / Amps + Vocal Mic 2
- Stage Right (House Left): Bass Guitar DI + Vocal Mic 3
- Stage Center: Lead Vocals / Synths + Monitor Wedge 1
- Upstage Center: Drum Kit (4-Piece) + Drum Monitor Wedge 4

2. CHANNEL INPUT LIST (12 CHANNELS):
CH 1: Kick Drum (Shure Beta 52A / Audix D6)
CH 2: Snare Top (Shure SM57)
CH 3: Hi-Hat (Condenser)
CH 4: Rack Tom (e604)
CH 5: Floor Tom (e604)
CH 6: Bass Guitar (Direct Out / Active DI Box)
CH 7: Electric Guitar (Shure SM57 on Cab)
CH 8: Synthesizer Left (Passive DI)
CH 9: Synthesizer Right (Passive DI)
CH 10: Lead Vocal (Shure Beta 58A / Wireless)
CH 11: Backing Vocal Stage Left (Shure SM58)
CH 12: Backing Vocal Stage Right (Shure SM58)

3. MONITOR MIX REQUIREMENTS:
- Mix 1 (Lead Vocals/Keys): Vocals prominent, Keys, Kick, Bass
- Mix 2 (Lead Guitar): Guitar, Lead Vocal, Snare
- Mix 3 (Bass): Bass DI, Kick drum, Lead Vocal
- Mix 4 (Drums): Kick, Snare, Click Track, Lead Vocals

4. HOSPITALITY & MERCH:
- 1 standard 6ft merch table with direct spotlight.
- 12 bottles of water in green room / stage area.
=====================================================`;
  };

  // Performance Contract template
  const generateContract = () => {
    return `=====================================================
STANDARD PERFORMANCE AGREEMENT
=====================================================
Date: ${new Date().toLocaleDateString()}
Between:
ARTIST: ${activeArtist.name} ("Artist")
Represented by: Sharon (AI Band Manager)
And:
VENUE / PROMOTER: ${gigs[0]?.venueName || 'Host Venue'} ("Promoter")

1. ENGAGEMENT DETAILS:
- Performance Date: ${gigs[0] ? new Date(gigs[0].dateTime).toLocaleDateString() : 'TBD'}
- Set Duration: 45 to 60 Minutes
- Soundcheck Time: 90 Minutes prior to doors

2. COMPENSATION & PAYOUT:
- Promoter guarantees Artist a minimum payment of $${gigs[0]?.ticketPrice ? gigs[0].ticketPrice * 25 : 300} OR an 80% split of gross ticket sales at the door, whichever is greater.
- Settlement: Full settlement to be paid in cash or electronic bank transfer immediately following performance conclusion.

3. MERCHANDISE:
- Artist retains 100% of all merchandise sales (T-shirts, vinyl, CDs, stickers). Promoter shall take 0% merch commission unless venue provides dedicated merch seller.

4. CANCELLATION:
- If Promoter cancels within 14 days of engagement, 50% of the guaranteed fee remains due and payable to Artist.

Signed & Approved,
Sharon (AI Band Manager for ${activeArtist.name})
=====================================================`;
  };

  const handleCopyTechRider = () => {
    navigator.clipboard.writeText(generateTechRider());
    setCopiedTechRider(true);
    setTimeout(() => setCopiedTechRider(false), 2500);
  };

  const handleCopyContract = () => {
    navigator.clipboard.writeText(generateContract());
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2500);
  };

  return (
    <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-500/20 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-600/30">
            {activeSubTab === 'phone' ? <Phone size={20} /> : <Laptop size={20} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white text-sm sm:text-base font-display">
                Sharon's Executive Assistant Suite
              </h4>
              <span className="text-[10px] font-mono font-bold bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded-full">
                Phone & Computer Skills
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sharon handles the heavy administrative lifting: dispatching SMS alerts, simulating booker phone pitches, and formatting tech riders.
            </p>
          </div>
        </div>

        {/* Skill Toggle Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('phone')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'phone'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Phone size={13} />
            <span>Phone Skills</span>
          </button>
          <button
            onClick={() => setActiveSubTab('computer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'computer'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Laptop size={13} />
            <span>Computer Skills</span>
          </button>
        </div>
      </div>

      {/* PHONE SKILLS SECTION */}
      {activeSubTab === 'phone' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 1. Band SMS / WhatsApp Dispatcher */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-850 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase font-bold text-cyan-400 flex items-center gap-1.5">
                  <MessageSquare size={13} />
                  <span>Band Call-Time SMS Dispatcher</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">1-Click Dispatch</span>
              </div>

              {/* Template Buttons */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSmsTargetMessage(`🚨 Soundcheck Alert: Load-in moved to 5:30 PM sharp at ${gigs[0]?.venueName || 'the venue'}. Downbeat at 8:00 PM!`)}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[10.5px] font-mono text-slate-300 border border-slate-800"
                >
                  Load-in Alert
                </button>
                <button
                  onClick={() => setSmsTargetMessage(`🎵 Setlist Update: Sharon locked the ${songs.length}-song setlist. Check Setlist tab for key transitions!`)}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[10.5px] font-mono text-slate-300 border border-slate-800"
                >
                  Setlist Cue
                </button>
                <button
                  onClick={() => setSmsTargetMessage(`💰 Door Split Collected: Tonight's payout has been logged. Payout split ready in Financial Ledger.`)}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[10.5px] font-mono text-slate-300 border border-slate-800"
                >
                  Door Split Payout
                </button>
              </div>

              <textarea
                value={smsTargetMessage}
                onChange={(e) => setSmsTargetMessage(e.target.value)}
                rows={3}
                className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl p-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />

              <div className="flex items-center justify-between gap-2 pt-1">
                <a
                  href={`sms:?body=${encodeURIComponent(smsTargetMessage)}`}
                  className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-600/20"
                >
                  <Send size={12} />
                  <span>Launch Phone SMS</span>
                </a>

                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(smsTargetMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 size={12} />
                  <span>WhatsApp Group</span>
                </a>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(smsTargetMessage);
                    setCopiedSms(true);
                    setTimeout(() => setCopiedSms(false), 2000);
                  }}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                  title="Copy text"
                >
                  {copiedSms ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* 2. Voice Memo / Phone Notes Ingestion */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-850 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase font-bold text-purple-400 flex items-center gap-1.5">
                  <Mic size={13} />
                  <span>Call Notes & Voice Memo Ingestion</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">NLP Extraction</span>
              </div>

              <textarea
                value={voiceMemoText}
                onChange={(e) => setVoiceMemoText(e.target.value)}
                placeholder="Paste or transcribe notes from a phone call with a venue booker or promoter (e.g. 'Dave from Tractor Tavern offered $400 for Friday Nov 14, 45 min set, load-in at 6pm...')"
                rows={3}
                className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl p-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />

              <div className="flex items-center justify-between">
                <button
                  onClick={handleExtractVoiceMemo}
                  disabled={!voiceMemoText.trim()}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles size={12} />
                  <span>Extract Gig & Actions</span>
                </button>
              </div>

              {memoExtractionResult && (
                <div className="bg-purple-950/40 border border-purple-500/30 p-3 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-300 font-mono text-[11px]">
                      Extracted Show Candidate:
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      ${memoExtractionResult.gigCandidate?.pay}
                    </span>
                  </div>
                  <p className="text-slate-200">
                    Venue: <strong className="text-white">{memoExtractionResult.gigCandidate?.venue}</strong>
                  </p>
                  <div className="pt-2 border-t border-purple-500/20 space-y-1 text-[11px] text-slate-300">
                    <span className="font-bold text-slate-400 block font-mono">Action Items:</span>
                    {memoExtractionResult.tasks.map((task, idx) => (
                      <p key={idx} className="flex items-center gap-1.5 text-slate-200">
                        <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
                        <span>{task}</span>
                      </p>
                    ))}
                  </div>

                  {onAddGig && memoExtractionResult.gigCandidate && (
                    <button
                      onClick={() => {
                        const newGig: Gig = {
                          id: `gig-memo-${Date.now()}`,
                          artistId: activeArtist.id,
                          title: `Live at ${memoExtractionResult.gigCandidate!.venue}`,
                          venueName: memoExtractionResult.gigCandidate!.venue,
                          venueAddress: `${memoExtractionResult.gigCandidate!.venue}, Seattle, WA`,
                          dateTime: memoExtractionResult.gigCandidate!.date,
                          ticketPrice: 15,
                          durationMinutes: 45,
                          description: `Booked via phone call notes parsed by Sharon AI Manager.`,
                          status: 'confirmed',
                          eventType: 'gig',
                          promoChecklist: {
                            pressRelease: false,
                            socialPost: false,
                            flyerDistributed: false,
                            outreachCompleted: false,
                            ticketsLive: false
                          }
                        };
                        onAddGig(newGig);
                        alert(`Gig at ${newGig.venueName} added to Tour Scheduler!`);
                      }}
                      className="w-full mt-2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Calendar size={12} />
                      <span>Add Extracted Show to Tour Scheduler</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 3. Venue Booker Phone Pitch Simulator */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-850 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono uppercase font-bold text-slate-200">
                  Venue Booker Telephone Call Simulator
                </span>
              </div>
              <span className="text-[10px] font-mono text-purple-400">Sharon Interactive Roleplay</span>
            </div>

            {/* Conversation Log */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {simDialogue.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl text-xs space-y-1.5 ${
                    item.sender === 'booker'
                      ? 'bg-slate-900 border border-slate-800 text-slate-200'
                      : 'bg-purple-950/60 border border-purple-500/30 text-purple-100 ml-4'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="font-bold text-slate-400 uppercase">
                      {item.sender === 'booker' ? '📞 Talent Buyer (Dave)' : '🎤 Your Pitch Response'}
                    </span>
                  </div>
                  <p className="leading-relaxed font-sans">{item.text}</p>
                  {item.feedback && (
                    <div className="pt-1.5 border-t border-slate-800/80 text-[11px] text-amber-300 font-mono flex items-start gap-1.5">
                      <Sparkles size={12} className="shrink-0 mt-0.5" />
                      <span>Sharon Coaching: {item.feedback}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pitch Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={userPitchResponse}
                onChange={(e) => setUserPitchResponse(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendSimulatorPitch()}
                placeholder="Speak or type your pitch response to the talent buyer (e.g. 'We drew 120 at Sunset last month and have a 450-person Seattle email list')..."
                className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />
              <button
                onClick={handleSendSimulatorPitch}
                disabled={!userPitchResponse.trim() || isSimScoring}
                className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Pitch</span>
                <Send size={12} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPUTER SKILLS SECTION */}
      {activeSubTab === 'computer' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 1. Technical Stage Plot & Channel Input Rider */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-850 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase font-bold text-purple-400 flex items-center gap-1.5">
                  <Laptop size={13} />
                  <span>Technical Stage Plot & 12-Channel Input Rider</span>
                </span>
                <button
                  onClick={handleCopyTechRider}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[10.5px] font-mono text-purple-300 hover:text-white border border-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  {copiedTechRider ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  <span>{copiedTechRider ? 'Copied' : 'Copy Rider'}</span>
                </button>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 max-h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {generateTechRider()}
              </div>

              <p className="text-[11px] text-slate-400 font-mono">
                💡 Sharon automatically generated your 12-channel input list and monitor mix specifications for sound engineers.
              </p>
            </div>

            {/* 2. Standard Performance Agreement Contract */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-850 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase font-bold text-cyan-400 flex items-center gap-1.5">
                  <FileText size={13} />
                  <span>Standard Performance Agreement & Payout Contract</span>
                </span>
                <button
                  onClick={handleCopyContract}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[10.5px] font-mono text-cyan-300 hover:text-white border border-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  {copiedContract ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  <span>{copiedContract ? 'Copied' : 'Copy Contract'}</span>
                </button>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 max-h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {generateContract()}
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Protects 100% merch cut & door guarantees</span>
                <a
                  href={`mailto:?subject=${encodeURIComponent(`Performance Contract - ${activeArtist.name}`)}&body=${encodeURIComponent(generateContract())}`}
                  className="text-cyan-300 hover:underline flex items-center gap-1"
                >
                  <span>Email Contract</span>
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
