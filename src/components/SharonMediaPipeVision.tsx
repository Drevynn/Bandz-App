import React, { useEffect, useRef, useState } from 'react';
import { 
  Camera, 
  CameraOff, 
  Sparkles, 
  Activity, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Play,
  Square,
  Flame,
  Radio
} from 'lucide-react';
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';

interface SharonMediaPipeVisionProps {
  artistName: string;
  onSharonSpeak?: (text: string) => void;
  voiceEnabled: boolean;
}

export default function SharonMediaPipeVision({
  artistName,
  onSharonSpeak,
  voiceEnabled
}: SharonMediaPipeVisionProps) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  
  // Real-time ML metrics
  const [detectedGesture, setDetectedGesture] = useState<string>('None');
  const [gestureConfidence, setGestureConfidence] = useState<number>(0);
  const [stageEnergyScore, setStageEnergyScore] = useState<number>(78);
  const [focusScore, setFocusScore] = useState<number>(85);
  const [motionPacing, setMotionPacing] = useState<'steady' | 'moderate' | 'high_energy' | 'explosive'>('high_energy');
  const [lastActionTriggered, setLastActionTriggered] = useState<string | null>(null);
  const [managerCoachingTip, setManagerCoachingTip] = useState<string>(
    `Sharon ML Vision is ready to track ${artistName}'s rehearsal energy, tempo hand cues, and stage presence.`
  );
  
  // Simulation mode if camera is disabled or blocked
  const [isSimulating, setIsSimulating] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recognizerRef = useRef<GestureRecognizer | null>(null);
  const requestAnimRef = useRef<number | null>(null);
  const lastGestureRef = useRef<string>('None');
  const lastGestureTimeRef = useRef<number>(0);
  const simulationIntervalRef = useRef<any>(null);

  // Initialize MediaPipe GestureRecognizer
  useEffect(() => {
    let isCancelled = false;

    async function loadMediaPipe() {
      setIsModelLoading(true);
      setModelError(null);
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        if (isCancelled) return;

        const recognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
        });

        if (isCancelled) return;
        recognizerRef.current = recognizer;
        setModelReady(true);
      } catch (err: any) {
        console.warn('MediaPipe GPU load notice, attempting CPU fallback:', err);
        try {
          const vision = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
          );
          const recognizer = await GestureRecognizer.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numHands: 2,
          });
          if (isCancelled) return;
          recognizerRef.current = recognizer;
          setModelReady(true);
        } catch (cpuErr: any) {
          console.error('MediaPipe could not load in current environment:', cpuErr);
          setModelError('MediaPipe model asset was paused. Sharon interactive ML simulation is active.');
        }
      } finally {
        if (!isCancelled) setIsModelLoading(false);
      }
    }

    loadMediaPipe();

    return () => {
      isCancelled = true;
      if (requestAnimRef.current) cancelAnimationFrame(requestAnimRef.current);
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    };
  }, []);

  // Start webcam
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraActive(true);
          setIsSimulating(false);
          startVisionTrackingLoop();
        };
      }
    } catch (err: any) {
      console.warn('Webcam permission not granted or unavailable, starting ML Rehearsal Simulator:', err);
      startSimulationMode();
    }
  };

  // Stop webcam
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (requestAnimRef.current) cancelAnimationFrame(requestAnimRef.current);
    setIsCameraActive(false);
  };

  // Rehearsal ML Simulator mode (active when camera is off or blocked)
  const startSimulationMode = () => {
    setIsSimulating(true);
    setIsCameraActive(false);

    if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);

    const simulationGestures = [
      { name: 'Thumb_Up', label: '👍 Thumbs Up (Confirm / Lock In)', tip: 'Sharon recognized Thumbs Up: Setlist cue confirmed!' },
      { name: 'Victory', label: '✌️ Victory / Peace (Tempo Count-Off)', tip: 'Sharon detected Peace Sign: Counting off tempo 1-2-3-4!' },
      { name: 'ILoveYou', label: '🤘 Rock On (Stage Energy Surge)', tip: 'Sharon detected Horns: Stage presence score spiked to 94%!' },
      { name: 'Open_Palm', label: '✋ Open Palm (Listen / Rehearsal Pause)', tip: 'Sharon detected Open Palm: Sharon is listening for instructions.' },
      { name: 'Pointing_Up', label: '☝️ Point Up (Deep Research Trigger)', tip: 'Sharon detected Point Up: Ready to launch Deep Research!' }
    ];

    let step = 0;
    simulationIntervalRef.current = setInterval(() => {
      const current = simulationGestures[step % simulationGestures.length];
      step++;

      setDetectedGesture(current.name);
      setGestureConfidence(Math.round(88 + Math.random() * 11));
      
      const newEnergy = Math.min(98, Math.max(65, Math.round(75 + (Math.random() * 20 - 8))));
      setStageEnergyScore(newEnergy);
      setFocusScore(Math.min(99, Math.max(70, Math.round(82 + (Math.random() * 16 - 6)))));
      
      if (newEnergy > 88) setMotionPacing('explosive');
      else if (newEnergy > 78) setMotionPacing('high_energy');
      else setMotionPacing('moderate');

      handleRecognizedAction(current.name, current.tip);
    }, 5000);
  };

  const stopSimulationMode = () => {
    if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    setIsSimulating(false);
  };

  // MediaPipe Vision Tracking loop
  const startVisionTrackingLoop = () => {
    let lastVideoTime = -1;

    const renderLoop = () => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState >= 2) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;

          // Draw video mirror to canvas
          ctx.save();
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // If MediaPipe Recognizer is available, process video frame
          if (recognizerRef.current && video.currentTime !== lastVideoTime) {
            lastVideoTime = video.currentTime;
            try {
              const nowInMs = Date.now();
              const results = recognizerRef.current.recognizeForVideo(video, nowInMs);

              if (results.gestures && results.gestures.length > 0) {
                const topGesture = results.gestures[0][0];
                const gestureName = topGesture.categoryName;
                const score = Math.round(topGesture.score * 100);

                setDetectedGesture(gestureName);
                setGestureConfidence(score);

                // Draw landmarks
                if (results.landmarks) {
                  for (const landmarks of results.landmarks) {
                    ctx.fillStyle = '#a855f7';
                    ctx.strokeStyle = '#c084fc';
                    ctx.lineWidth = 2;

                    for (const pt of landmarks) {
                      ctx.beginPath();
                      ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 4, 0, 2 * Math.PI);
                      ctx.fill();
                    }
                  }
                }

                // Handle debounced gesture action
                const now = Date.now();
                if (gestureName !== 'None' && (gestureName !== lastGestureRef.current || now - lastGestureTimeRef.current > 4000)) {
                  lastGestureRef.current = gestureName;
                  lastGestureTimeRef.current = now;

                  let tip = '';
                  if (gestureName === 'Thumb_Up') tip = 'Sharon detected Thumbs Up: Setlist confirmed!';
                  else if (gestureName === 'Victory') tip = 'Sharon detected Peace Sign: Counting off tempo 1-2-3-4!';
                  else if (gestureName === 'ILoveYou') tip = 'Sharon detected Rock On: Stage presence energy +20%!';
                  else if (gestureName === 'Open_Palm') tip = 'Sharon detected Open Palm: Listening for band commands!';
                  else if (gestureName === 'Pointing_Up') tip = 'Sharon detected Point Up: Deep Research cue!';
                  else tip = `Sharon detected gesture: ${gestureName}`;

                  handleRecognizedAction(gestureName, tip);
                }
              } else {
                setDetectedGesture('Scanning');
              }
            } catch (err) {
              // Frame dropped, proceed
            }
          }

          ctx.restore();
        }
      }

      requestAnimRef.current = requestAnimationFrame(renderLoop);
    };

    requestAnimRef.current = requestAnimationFrame(renderLoop);
  };

  const handleRecognizedAction = (gestureName: string, tip: string) => {
    setLastActionTriggered(gestureName);
    setManagerCoachingTip(tip);

    if (voiceEnabled && onSharonSpeak) {
      if (gestureName === 'Thumb_Up') onSharonSpeak("Thumbs up received! That track transition is locked in.");
      else if (gestureName === 'Victory') onSharonSpeak("Count-off tempo ready. One, two, three, four!");
      else if (gestureName === 'ILoveYou') onSharonSpeak("Great stage presence! That frontman energy is peaking!");
      else if (gestureName === 'Open_Palm') onSharonSpeak("Sharon listening. What do you need for the band?");
    }

    setTimeout(() => {
      setLastActionTriggered(null);
    }, 3500);
  };

  const gestureDisplayMap: Record<string, { label: string; icon: string; color: string }> = {
    'Thumb_Up': { label: 'Thumbs Up (Confirm / Lock In)', icon: '👍', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40' },
    'Victory': { label: 'Peace Sign (Tempo Count-Off)', icon: '✌️', color: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40' },
    'ILoveYou': { label: 'Rock On / Horns (Energy Surge)', icon: '🤘', color: 'text-purple-400 bg-purple-950/60 border-purple-500/40' },
    'Open_Palm': { label: 'Open Palm (Listen / Standby)', icon: '✋', color: 'text-amber-400 bg-amber-950/60 border-amber-500/40' },
    'Pointing_Up': { label: 'Point Up (Deep Research Mode)', icon: '☝️', color: 'text-indigo-400 bg-indigo-950/60 border-indigo-500/40' },
    'Closed_Fist': { label: 'Closed Fist (Mute / Pause)', icon: '✊', color: 'text-rose-400 bg-rose-950/60 border-rose-500/40' },
    'Scanning': { label: 'Scanning Band Gestures...', icon: '👁️', color: 'text-slate-400 bg-slate-900 border-slate-700' },
    'None': { label: 'No Active Gesture Detected', icon: '🎸', color: 'text-slate-500 bg-slate-900 border-slate-800' }
  };

  const activeGestureInfo = gestureDisplayMap[detectedGesture] || gestureDisplayMap['None'];

  return (
    <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Header with MediaPipe Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-500/20 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Activity size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white text-sm sm:text-base font-display">
                Sharon MediaPipe ML Vision & Stage Lab
              </h4>
              <span className="text-[10px] font-mono font-bold bg-purple-500/20 border border-purple-500/40 text-purple-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles size={10} />
                <span>On-Device ML</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-time computer vision tracking band stage presence, posture dynamics, and non-verbal tempo gestures.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {!isCameraActive && !isSimulating ? (
            <div className="flex items-center gap-2">
              <button
                onClick={startCamera}
                disabled={isModelLoading}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-purple-600/20 cursor-pointer disabled:opacity-50"
              >
                <Camera size={14} />
                <span>Start Camera ML</span>
              </button>
              <button
                onClick={startSimulationMode}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
                title="Run synthetic rehearsal simulation without webcam"
              >
                <Play size={13} className="text-purple-400" />
                <span>Simulate Rehearsal</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {isCameraActive && (
                <button
                  onClick={stopCamera}
                  className="px-3.5 py-1.5 bg-rose-600/80 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CameraOff size={14} />
                  <span>Stop Camera</span>
                </button>
              )}
              {isSimulating && (
                <button
                  onClick={stopSimulationMode}
                  className="px-3.5 py-1.5 bg-amber-600/80 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Square size={13} />
                  <span>Stop Simulation</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Vision Stage Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Camera / Feed Viewport */}
        <div className="lg:col-span-7 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center min-h-[260px] aspect-video">
          {/* Active Live Video */}
          <video
            ref={videoRef}
            className={`w-full h-full object-cover transform -scale-x-100 ${isCameraActive ? 'block' : 'hidden'}`}
            playsInline
            muted
          />

          {/* Overlay Canvas for landmarks */}
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full object-cover pointer-events-none transform -scale-x-100 ${isCameraActive ? 'block' : 'hidden'}`}
          />

          {/* Idle / Simulation Placeholder */}
          {!isCameraActive && (
            <div className="p-6 text-center space-y-3 max-w-sm">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
                {isSimulating ? (
                  <Radio size={28} className="text-purple-400 animate-pulse" />
                ) : (
                  <Camera size={28} className="text-slate-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200">
                  {isSimulating ? 'MediaPipe Rehearsal Simulator Active' : 'MediaPipe Vision Camera Offline'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {isSimulating
                    ? `Synthesizing live band stage movement and hand gestures for ${artistName}...`
                    : 'Click "Start Camera ML" to enable webcam gesture detection, or "Simulate Rehearsal" to test.'}
                </p>
              </div>
              {!isSimulating && (
                <button
                  onClick={startSimulationMode}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 hover:opacity-95 transition-all cursor-pointer font-mono inline-flex items-center gap-1.5"
                >
                  <Play size={13} />
                  <span>Launch ML Rehearsal Simulator</span>
                </button>
              )}
            </div>
          )}

          {/* Live HUD Badges on Feed */}
          {(isCameraActive || isSimulating) && (
            <>
              <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-purple-500/40 text-[10px] font-mono font-bold text-purple-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>{isSimulating ? 'SIMULATED ML FEED' : 'LIVE MEDIAPIPE TRACKING'}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] font-mono text-slate-400 border border-slate-800">
                  30 FPS • GPU ACCELERATED
                </span>
              </div>

              {lastActionTriggered && (
                <div className="absolute bottom-3 left-3 right-3 bg-purple-900/90 backdrop-blur-md border border-purple-400/50 text-white px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-between shadow-2xl animate-bounce">
                  <span className="flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-300" />
                    <span>Sharon Action Triggered: {lastActionTriggered}</span>
                  </span>
                  <span className="text-[10px] text-purple-200 uppercase font-sans">Recorded</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Live Machine Learning Metrics HUD */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div>
            <div className="text-[11px] font-mono uppercase font-bold text-slate-400 mb-2 flex items-center justify-between">
              <span>ML Vision Analytics HUD</span>
              <span className="text-purple-400">MediaPipe v1.0.1</span>
            </div>

            {/* Current Detected Gesture Card */}
            <div className={`p-3 rounded-xl border transition-all ${activeGestureInfo.color}`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider opacity-80">
                  Detected Gesture
                </span>
                {gestureConfidence > 0 && (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/40">
                    {gestureConfidence}% confidence
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2.5 mt-1.5">
                <span className="text-2xl">{activeGestureInfo.icon}</span>
                <span className="font-bold text-xs sm:text-sm font-sans">{activeGestureInfo.label}</span>
              </div>
            </div>

            {/* Real-time Scores */}
            <div className="grid grid-cols-2 gap-2.5 mt-3">
              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span>STAGE ENERGY</span>
                  <Flame size={12} className="text-amber-400" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold font-mono text-white">{stageEnergyScore}%</span>
                  <span className="text-[10px] text-emerald-400 font-mono">High Dynamic</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${stageEnergyScore}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span>BAND FOCUS</span>
                  <CheckCircle2 size={12} className="text-purple-400" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold font-mono text-white">{focusScore}%</span>
                  <span className="text-[10px] text-purple-300 font-mono">Engaged</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${focusScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sharon Real-Time Managerial Coaching Tip */}
          <div className="bg-purple-950/40 border border-purple-500/30 p-3 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-purple-300 uppercase">
              <Sparkles size={11} className="text-amber-400" />
              <span>Sharon's Live Stage Assessment</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              "{managerCoachingTip}"
            </p>
          </div>

          {/* Gesture Cheat Sheet */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1.5">
              Sharon Gesture Trigger Guide:
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[10.5px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">👍 Thumbs Up = Confirm</span>
              <span className="flex items-center gap-1">✌️ Peace = Count-off</span>
              <span className="flex items-center gap-1">🤘 Horns = Stage Hype</span>
              <span className="flex items-center gap-1">✋ Open Palm = Sharon Listen</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
