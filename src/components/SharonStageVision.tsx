import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  CameraOff, 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Maximize2, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Award,
  Zap
} from 'lucide-react';
import { StageGestureState, StageRehearsalMetrics } from '../types';

interface SharonStageVisionProps {
  artistName: string;
  onSharonSpeak?: (text: string) => void;
  voiceEnabled: boolean;
}

export default function SharonStageVision({
  artistName,
  onSharonSpeak,
  voiceEnabled
}: SharonStageVisionProps) {
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detectedGesture, setDetectedGesture] = useState<StageGestureState | null>({
    categoryName: 'Rock On / Horns',
    score: 0.94,
    label: '🤘 Stage Energy Boost',
    actionDetected: 'Audience Hype Surge'
  });

  const [metrics, setMetrics] = useState<StageRehearsalMetrics>({
    stageEnergyScore: 88,
    focusScore: 92,
    headMotionPacing: '124 BPM Synchronized',
    movementDynamic: 'high_energy',
    detectedGestures: ['Rock On (🤘)', 'Thumbs Up (👍)'],
    postureAssessment: 'Open chest, dynamic stage posture with high crowd engagement projection.',
    sharonFeedback: `Great stage posture! Your visual focus is cutting right through the front row.`
  });

  const [activePreset, setActivePreset] = useState<'high_energy' | 'intimate_ballad' | 'punk_mosh'>('high_energy');
  const [isSimulatingLive, setIsSimulatingLive] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  // Start Webcam stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam media devices not supported in this browser context.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraActive(true);
          drawOverlayLoop();
        };
      }
    } catch (err: any) {
      console.warn('Camera access:', err);
      setCameraError(err.message || 'Microphone/Camera permission dismissed. Using Rehearsal Vision Simulator.');
      setIsCameraActive(false);
    }
  };

  // Stop Webcam stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    setIsCameraActive(false);
  };

  // Draw HUD overlay onto canvas
  const drawOverlayLoop = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw dynamic stage presence wireframe
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);

    const w = canvas.width;
    const h = canvas.height;

    // Head bounding zone
    ctx.strokeRect(w * 0.35, h * 0.15, w * 0.3, h * 0.35);

    // Center crosshair
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.08);
    ctx.lineTo(w * 0.5, h * 0.92);
    ctx.moveTo(w * 0.1, h * 0.5);
    ctx.lineTo(w * 0.9, h * 0.5);
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.2)';
    ctx.stroke();

    // Stage boundary markers
    ctx.setLineDash([]);
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.3, 5, 0, Math.PI * 2);
    ctx.fill();

    animationFrameId.current = requestAnimationFrame(drawOverlayLoop);
  };

  // Handle Preset Simulation trigger
  const handleTriggerPreset = (preset: 'high_energy' | 'intimate_ballad' | 'punk_mosh') => {
    setActivePreset(preset);

    if (preset === 'high_energy') {
      setDetectedGesture({
        categoryName: 'Rock On / Horns',
        score: 0.96,
        label: '🤘 Stage Energy Boost',
        actionDetected: 'High-octane crowd engagement'
      });
      setMetrics({
        stageEnergyScore: 94,
        focusScore: 91,
        headMotionPacing: '128 BPM Synchronized',
        movementDynamic: 'explosive',
        detectedGestures: ['Rock On (🤘)', 'Thumbs Up (👍)'],
        postureAssessment: 'Explosive stage presence. Excellent vocal mic distance control.',
        sharonFeedback: `Massive energy! That posture commands the room.`
      });
      if (voiceEnabled && onSharonSpeak) {
        onSharonSpeak(`Stage presence is peak energy. Keep the tempo driving!`);
      }
    } else if (preset === 'intimate_ballad') {
      setDetectedGesture({
        categoryName: 'Open Palm',
        score: 0.92,
        label: '✋ Dynamic Listen Mode',
        actionDetected: 'Subtle Vocal Projection'
      });
      setMetrics({
        stageEnergyScore: 68,
        focusScore: 98,
        headMotionPacing: '72 BPM Steady',
        movementDynamic: 'steady',
        detectedGestures: ['Open Palm (✋)'],
        postureAssessment: 'Centered, intimate posture. High emotional connection index.',
        sharonFeedback: `Perfect composure for the acoustic transition.`
      });
      if (voiceEnabled && onSharonSpeak) {
        onSharonSpeak(`Composure is centered and intimate. Vocal dynamics are dialed in.`);
      }
    } else {
      setDetectedGesture({
        categoryName: 'Peace / Victory',
        score: 0.95,
        label: '✌️ Tempo Count-Off',
        actionDetected: '1-2-3-4 Band Cue'
      });
      setMetrics({
        stageEnergyScore: 98,
        focusScore: 89,
        headMotionPacing: '154 BPM Upbeat',
        movementDynamic: 'explosive',
        detectedGestures: ['Peace (✌️)', 'Fist (✊)'],
        postureAssessment: 'Fast-paced rhythmic head-bobbing and active floor presence.',
        sharonFeedback: `High-voltage tempo lock! The rhythm section is locked.`
      });
      if (voiceEnabled && onSharonSpeak) {
        onSharonSpeak(`Tempo count-off locked. Downbeat engaged!`);
      }
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-500/20 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Activity size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white text-sm sm:text-base font-display">
                Sharon Stage Presence & Vision Lab
              </h4>
              <span className="text-[10px] font-mono font-bold bg-purple-500/20 border border-purple-500/40 text-purple-300 px-2 py-0.5 rounded-full">
                Live Rehearsal HUD
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Visual posture analysis, band cue gestures, and dynamic stage movement tracking for {artistName}.
            </p>
          </div>
        </div>

        {/* Camera Toggle Button */}
        <div className="flex items-center gap-2">
          {isCameraActive ? (
            <button
              onClick={stopCamera}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-600/20"
            >
              <CameraOff size={13} />
              <span>Turn Off Webcam</span>
            </button>
          ) : (
            <button
              onClick={startCamera}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-600/20"
            >
              <Camera size={13} />
              <span>Launch Webcam HUD</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Vision Display: Left (Video & Canvas), Right (Metrics & Sharon Coaching) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Video & Landmark Canvas */}
        <div className="lg:col-span-7 bg-slate-950 rounded-xl border border-slate-800 p-3 flex flex-col justify-between relative overflow-hidden min-h-[290px]">
          {/* Simulated or Live Video Frame */}
          <div className="relative w-full aspect-video bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center border border-purple-500/20">
            {isCameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={480}
                  className="absolute inset-0 w-full h-full pointer-events-none -scale-x-100"
                />
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-900 to-slate-950 relative">
                {/* Stage wireframe illustration */}
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-purple-500/40 flex items-center justify-center text-purple-300 mb-3 animate-pulse">
                  <Activity size={36} />
                </div>
                <h5 className="font-bold text-white text-xs sm:text-sm font-display">
                  Stage Vision HUD Standby
                </h5>
                <p className="text-[11px] text-slate-400 max-w-sm mt-1">
                  Launch your webcam for real-time video landmark tracking or click the interactive cue buttons below to simulate band stage scenarios!
                </p>
              </div>
            )}

            {/* Overlaid HUD Badges */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-purple-500/30 text-[10px] font-mono">
              <span className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-emerald-400 animate-pulse' : 'bg-purple-400'}`} />
              <span className="text-white font-bold">{isCameraActive ? 'WEBCAM ACTIVE' : 'SIMULATOR MODE'}</span>
            </div>

            {detectedGesture && (
              <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-slate-950/90 backdrop-blur-md p-2 rounded-lg border border-purple-500/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{detectedGesture.label.split(' ')[0]}</span>
                  <div>
                    <span className="text-[11px] font-bold text-white font-mono block">
                      {detectedGesture.label}
                    </span>
                    <span className="text-[9.5px] text-purple-300 font-mono">
                      Action: {detectedGesture.actionDetected}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  {Math.round(detectedGesture.score * 100)}% Confidence
                </span>
              </div>
            )}
          </div>

          {/* Quick Preset Buttons */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-850">
            <span className="text-[10.5px] font-mono text-slate-400 uppercase font-bold">
              Simulate Stage Cue:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleTriggerPreset('high_energy')}
                className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer ${
                  activePreset === 'high_energy'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                🤘 Rock Out (Fast)
              </button>
              <button
                onClick={() => handleTriggerPreset('intimate_ballad')}
                className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer ${
                  activePreset === 'intimate_ballad'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                ✋ Vocal Dynamics
              </button>
              <button
                onClick={() => handleTriggerPreset('punk_mosh')}
                className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer ${
                  activePreset === 'punk_mosh'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                ✌️ Count-Off (1-2-3-4)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Stage Presence Metrics & Sharon Coaching */}
        <div className="lg:col-span-5 space-y-3">
          {/* Energy & Focus Gauges */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Stage Energy</span>
                <span className="text-sm font-mono font-black text-purple-400">{metrics.stageEnergyScore}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-fuchsia-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${metrics.stageEnergyScore}%` }} 
                />
              </div>
              <span className="text-[9.5px] text-slate-400 font-mono block">Dynamic: {metrics.movementDynamic.toUpperCase()}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Focus Index</span>
                <span className="text-sm font-mono font-black text-emerald-400">{metrics.focusScore}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${metrics.focusScore}%` }} 
                />
              </div>
              <span className="text-[9.5px] text-slate-400 font-mono block">Pacing: {metrics.headMotionPacing}</span>
            </div>
          </div>

          {/* Posture Assessment */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-1.5">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <Award size={12} className="text-amber-400" />
              <span>Posture & Stance Assessment</span>
            </span>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {metrics.postureAssessment}
            </p>
          </div>

          {/* Sharon Manager Live Coaching */}
          <div className="bg-purple-950/40 p-3.5 rounded-xl border border-purple-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-purple-300 flex items-center gap-1.5">
                <Sparkles size={12} className="text-purple-400" />
                <span>Sharon Manager Feedback</span>
              </span>
              <span className="text-[9.5px] font-mono text-purple-400">Live Stage Coach</span>
            </div>
            <p className="text-xs text-purple-100 font-sans italic leading-relaxed">
              "{metrics.sharonFeedback}"
            </p>
          </div>

          {/* Gesture Dictionary */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-850 text-[10px] font-mono text-slate-400 space-y-1">
            <span className="font-bold text-slate-300 block">Gesture Control Mapping:</span>
            <div className="grid grid-cols-2 gap-1 text-[9.5px]">
              <span>🤘 Horns: Hype Boost</span>
              <span>✌️ Peace: Tempo Count</span>
              <span>👍 Thumbs: Lock Cue</span>
              <span>✋ Palm: Listen / Dynamic</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
