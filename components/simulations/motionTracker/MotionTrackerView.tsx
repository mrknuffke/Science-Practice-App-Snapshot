import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Play,
  Pause,
  Ruler,
  Crosshair,
  Pointer,
  SkipForward,
  Undo,
  RotateCcw,
  Video,
  Download,
  Trophy,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import SimulationHeader from '../shared/SimulationHeader';
import AboutPanel from '../shared/AboutPanel';
import ChallengeDeck from '../shared/ChallengeDeck';
import { Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import html2canvas from 'html2canvas';

import {
  Point,
  KinematicScenarioConfig,
  calculateRegression,
  drawKinematicScenario,
  verifyKinematicChallenge,
} from './motionEngine';
import {
  MOTION_CHALLENGES,
  PRESET_SCENARIOS,
  GLIDER_SCENARIO,
  MotionSetup,
} from './motionChallenges';
import { MOTION_TRACKER_ABOUT } from './motionTrackerAbout';

interface MotionTrackerViewProps {
  onBack: () => void;
}

type ToolMode = 'none' | 'cal' | 'origin' | 'track';

export const MotionTrackerView: React.FC<MotionTrackerViewProps> = ({ onBack }) => {
  // Navigation & About
  const [showAbout, setShowAbout] = useState(false);
  const [challengeMode, setChallengeMode] = useState(false);
  const [challengeIdx, setChallengeIdx] = useState(0);

  // Active Source: synthetic scenario vs custom video
  const [useSynthetic, setUseSynthetic] = useState(true);
  const [activeScenario, setActiveScenario] = useState<KinematicScenarioConfig>(GLIDER_SCENARIO);

  // Video upload state
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'ready'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Playback & Timing
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const stepTime = 0.04; // ~25 fps

  // Tracking & Calibration State
  const [mode, setMode] = useState<ToolMode>('none');
  const [points, setPoints] = useState<Point[]>([]);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [metersPerPixel, setMetersPerPixel] = useState(1);
  const [scaleStart, setScaleStart] = useState<{ x: number; y: number } | null>(null);
  const [scaleEnd, setScaleEnd] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showDistanceInput, setShowDistanceInput] = useState(false);
  const [distanceInput, setDistanceInput] = useState<string>('');
  const [originLocked, setOriginLocked] = useState(false);
  const [scaleLocked, setScaleLocked] = useState(false);

  // Chart regressions
  const [fitTypes, setFitTypes] = useState({
    x: 'none',
    y: 'none',
    vx: 'none',
    vy: 'none',
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const animationFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);

  // Load a setup (neutral start or solution)
  const applySetup = useCallback((setup: MotionSetup) => {
    const scenario = PRESET_SCENARIOS.find(s => s.id === setup.scenarioId) || GLIDER_SCENARIO;
    setUseSynthetic(true);
    setActiveScenario(scenario);
    setMetersPerPixel(setup.metersPerPixel);
    setOrigin(setup.origin);
    setPoints(setup.points);
    setScaleLocked(setup.scaleLocked);
    setOriginLocked(setup.originLocked);
    setCurrentTime(0);
    setIsPlaying(false);
    setMode('none');
  }, []);

  // Frame stepping
  const stepForward = useCallback(() => {
    if (useSynthetic) {
      setCurrentTime(prev => Math.min(activeScenario.duration, Number((prev + stepTime).toFixed(4))));
    } else if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.duration || 0,
        videoRef.current.currentTime + stepTime
      );
      setCurrentTime(videoRef.current.currentTime);
    }
  }, [useSynthetic, activeScenario.duration]);

  const stepBack = useCallback(() => {
    if (useSynthetic) {
      setCurrentTime(prev => Math.max(0, Number((prev - stepTime).toFixed(4))));
      if (points.length > 0) {
        setPoints(prev => prev.slice(0, -1));
      }
    } else if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - stepTime);
      setCurrentTime(videoRef.current.currentTime);
      if (points.length > 0) {
        setPoints(prev => prev.slice(0, -1));
      }
    }
  }, [useSynthetic, points.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (useSynthetic) {
          setIsPlaying(prev => !prev);
        } else if (videoRef.current) {
          videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
        }
      }
      if (e.key.toLowerCase() === 'z') {
        e.preventDefault();
        stepBack();
      }
      if (e.key.toLowerCase() === 'x') {
        e.preventDefault();
        stepForward();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stepBack, stepForward, useSynthetic]);

  // Synthetic animation loop
  useEffect(() => {
    if (!useSynthetic || !isPlaying) {
      lastTimestampRef.current = null;
      return;
    }

    const animate = (timestamp: number) => {
      if (lastTimestampRef.current !== null) {
        const deltaSec = (timestamp - lastTimestampRef.current) / 1000;
        setCurrentTime(prev => {
          const next = prev + deltaSec;
          if (next >= activeScenario.duration) {
            setIsPlaying(false);
            return activeScenario.duration;
          }
          return next;
        });
      }
      lastTimestampRef.current = timestamp;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [useSynthetic, isPlaying, activeScenario.duration]);

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvas.width !== 800 || canvas.height !== 450) {
      canvas.width = 800;
      canvas.height = 450;
    }

    if (useSynthetic) {
      drawKinematicScenario(ctx, canvas.width, canvas.height, activeScenario, currentTime);
    } else if (videoRef.current && uploadStatus === 'ready') {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw calibration line
    if (scaleStart && scaleEnd) {
      ctx.strokeStyle = '#10b981'; // emerald-500
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(scaleStart.x, scaleStart.y);
      ctx.lineTo(scaleEnd.x, scaleEnd.y);
      ctx.stroke();
    }

    // Draw origin crosshair
    if (originLocked || mode === 'origin') {
      ctx.strokeStyle = '#06b6d4'; // cyan-500
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(origin.x - 18, origin.y);
      ctx.lineTo(origin.x + 18, origin.y);
      ctx.moveTo(origin.x, origin.y - 18);
      ctx.lineTo(origin.x, origin.y + 18);
      ctx.stroke();

      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 11px system-ui';
      ctx.fillText('(0, 0)', origin.x + 6, origin.y - 6);
    }

    // Draw tracked points
    ctx.fillStyle = '#ef4444'; // red-500
    points.forEach((p, idx) => {
      ctx.beginPath();
      ctx.arc(p.canvasX, p.canvasY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Number badge for each point
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px system-ui';
      ctx.fillText(String(idx + 1), p.canvasX - 3, p.canvasY - 7);
      ctx.fillStyle = '#ef4444';
    });
  }, [
    useSynthetic,
    activeScenario,
    currentTime,
    uploadStatus,
    scaleStart,
    scaleEnd,
    origin,
    originLocked,
    mode,
    points,
  ]);

  // Pointer interactions
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (mode === 'cal') {
      setScaleStart({ x, y });
      setScaleEnd({ x, y });
      setIsDragging(true);
      setShowDistanceInput(false);
    } else if (mode === 'origin') {
      setOrigin({ x, y });
      setOriginLocked(true);
      setMode('none');
    } else if (mode === 'track') {
      const time = useSynthetic ? currentTime : videoRef.current?.currentTime || 0;
      const posX = (x - origin.x) * metersPerPixel;
      const posY = (origin.y - y) * metersPerPixel;

      const newPoint: Point = { t: time, x: posX, y: posY, canvasX: x, canvasY: y };

      if (points.length > 0) {
        const lastPoint = points[points.length - 1];
        const dt = time - lastPoint.t;
        if (Math.abs(dt) > 1e-5) {
          newPoint.vx = (posX - lastPoint.x) / dt;
          newPoint.vy = (posY - lastPoint.y) / dt;
        }
      }

      setPoints(prev => [...prev, newPoint]);
      stepForward();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode === 'cal' && isDragging) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      setScaleEnd({
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height),
      });
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    if (mode === 'cal' && scaleStart && scaleEnd) {
      setShowDistanceInput(true);
    }
  };

  const handleLockScale = () => {
    if (!scaleStart || !scaleEnd || !distanceInput) return;
    const px = Math.sqrt(Math.pow(scaleEnd.x - scaleStart.x, 2) + Math.pow(scaleEnd.y - scaleStart.y, 2));
    const dist = parseFloat(distanceInput);
    if (px > 0 && dist > 0) {
      setMetersPerPixel(dist / px);
      setScaleLocked(true);
      setShowDistanceInput(false);
      setMode('none');
    }
  };

  const resetData = () => {
    setPoints([]);
    setCurrentTime(0);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  // Upload custom video
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('uploading');
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadStatus('ready');
          setVideoSrc(URL.createObjectURL(file));
          setUseSynthetic(false);
          return 100;
        }
        return prev + 5;
      });
    }, 25);
  };

  // Export helpers
  const exportCSV = useCallback(() => {
    if (points.length === 0) return;
    const header = 'frame,t (s),x (m),y (m),vx (m/s),vy (m/s)';
    const rows = points.map(
      (p, i) =>
        `${i + 1},${p.t.toFixed(4)},${p.x.toFixed(4)},${p.y.toFixed(4)},${(p.vx ?? 0).toFixed(4)},${(p.vy ?? 0).toFixed(4)}`
    );
    const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'kinematics_data.csv';
    a.click();
  }, [points]);

  const exportGraphPNG = useCallback(async (key: string, label: string) => {
    const container = chartRefs.current[key];
    if (!container) return;
    try {
      const canvas = await html2canvas(container, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const a = document.createElement('a');
      a.download = `${label.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    } catch (err) {
      console.error('PNG export failed:', err);
    }
  }, []);

  const handleVerifyChallenge = useCallback(() => {
    const challenge = MOTION_CHALLENGES[challengeIdx];
    return verifyKinematicChallenge(String(challenge.id), points, metersPerPixel);
  }, [challengeIdx, points, metersPerPixel]);

  const renderGraph = (title: string, yKey: 'x' | 'y' | 'vx' | 'vy', yAxisLabel: string, infoText: string) => {
    const rawData = points.filter(p => p[yKey] !== undefined).map(p => ({ x: p.t, y: p[yKey]! }));
    const fit = calculateRegression(rawData, fitTypes[yKey]);

    const chartData: { t: number; val: number | null; trend: number | null }[] = rawData.map(p => ({
      t: p.x,
      val: p.y,
      trend: fit ? fit.fn(p.x) : null,
    }));

    if (fit && fit.type === 'quad' && rawData.length > 0) {
      const minX = Math.min(...rawData.map(d => d.x));
      const maxX = Math.max(...rawData.map(d => d.x));
      const step = (maxX - minX) / 50;
      for (let x = minX; x <= maxX; x += step) {
        if (!chartData.some(d => Math.abs(d.t - x) < step / 2)) {
          chartData.push({ t: x, val: null, trend: fit.fn(x) });
        }
      }
      chartData.sort((a, b) => a.t - b.t);
    }

    return (
      <div
        ref={el => {
          chartRefs.current[yKey] = el;
        }}
        className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 w-full overflow-hidden"
      >
        <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
          <div className="flex items-center gap-2 group relative">
            <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100">{title}</h4>
            <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
            <div className="absolute bottom-full left-0 mb-2 w-60 bg-slate-800 text-white text-[11px] p-2.5 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 pointer-events-none">
              {infoText}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-lg p-1.5 focus:outline-none"
              value={fitTypes[yKey]}
              onChange={e => setFitTypes(prev => ({ ...prev, [yKey]: e.target.value }))}
              aria-label={`Regression fit type for ${title}`}
            >
              <option value="none">No Fit</option>
              <option value="linear">Linear Fit</option>
              <option value="quad">Quadratic Fit</option>
            </select>
            <button
              onClick={() => exportGraphPNG(yKey, title)}
              disabled={rawData.length === 0}
              title="Save graph as PNG"
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label={`Save ${title} graph as PNG`}
            >
              <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-200" />
            </button>
          </div>
        </div>

        {fit && (
          <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-bold mb-2 bg-blue-50 dark:bg-blue-950/40 p-1.5 rounded-lg border border-blue-200 dark:border-blue-900">
            {fit.text} | R² = {fit.r2.toFixed(4)}
          </div>
        )}

        <div className="h-56 sm:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 10, bottom: 20, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="t"
                type="number"
                tick={{ fontSize: 10 }}
                label={{ value: 'Time (s)', position: 'insideBottom', offset: -10, fontSize: 11 }}
                domain={['dataMin', 'dataMax']}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', offset: 15, fontSize: 10 }}
                domain={['auto', 'auto']}
              />
              <Tooltip
                formatter={(val) => (val !== null && val !== undefined ? Number(val).toFixed(3) : '')}
                labelFormatter={(val) => `Time: ${Number(val).toFixed(2)}s`}
              />
              <Scatter dataKey="val" fill="#ef4444" isAnimationActive={false} />
              {fit && <Line dataKey="trend" stroke="#3b82f6" dot={false} strokeWidth={2} isAnimationActive={false} />}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-3 sm:p-6 md:p-8">
      <div className="max-w-[1400px] w-full mx-auto overflow-hidden">
        <SimulationHeader
          title="Motion Tracker & Kinematics Lab"
          onBack={onBack}
          icon={Video}
          gradient="from-red-500 to-rose-600"
          onOpenAbout={() => setShowAbout(true)}
        />

        {/* Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setChallengeMode(false);
                setIsPlaying(false);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                !challengeMode
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              🧪 Free Exploration Lab
            </button>
            <button
              onClick={() => {
                setChallengeMode(true);
                applySetup(MOTION_CHALLENGES[challengeIdx].start);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                challengeMode
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              🏆 Kinematics Challenges
            </button>
          </div>

          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 pr-2">
            {challengeMode ? 'Formative Assessment Active' : 'Sandbox Mode'}
          </span>
        </div>

        {/* Challenge Deck Banner */}
        {challengeMode && (
          <div className="mt-4">
            <ChallengeDeck
              title="Kinematic Challenges"
              challenges={MOTION_CHALLENGES}
              currentIndex={challengeIdx}
              onSelectIndex={idx => {
                setChallengeIdx(idx);
                applySetup(MOTION_CHALLENGES[idx].start);
              }}
              onVerify={handleVerifyChallenge}
              onApplySolution={() => applySetup(MOTION_CHALLENGES[challengeIdx].solutionSetup)}
              solutionUnlockAfter={2}
              accentGradient="from-rose-500 to-red-600"
            />
          </div>
        )}

        {/* Lab Scenario Selector (when not in challenge mode) */}
        {!challengeMode && (
          <div className="flex flex-wrap items-center gap-2 mt-4 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Preset Lab Clips:
            </span>
            {PRESET_SCENARIOS.map(sc => (
              <button
                key={sc.id}
                onClick={() => {
                  setUseSynthetic(true);
                  setActiveScenario(sc);
                  resetData();
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  useSynthetic && activeScenario.id === sc.id
                    ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {sc.name}
              </button>
            ))}
            <label className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-xl cursor-pointer hover:bg-rose-100 transition-colors font-bold">
              <Upload className="w-3.5 h-3.5" /> Upload Video
              <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        )}

        {/* Upload progress banner if uploading */}
        {uploadStatus === 'uploading' && (
          <div className="my-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
              Processing video frames ({uploadProgress}%)
            </p>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 transition-all duration-75"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Work Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
          {/* Left Column: Canvas & Graphs */}
          <div className="lg:col-span-8 flex flex-col gap-4 max-w-full overflow-hidden">
            {/* Viewport Canvas Container */}
            <div className="bg-black rounded-2xl overflow-hidden shadow-md relative flex justify-center border-2 border-slate-200 dark:border-slate-700 w-full max-w-full">
              <video
                ref={videoRef}
                src={videoSrc || undefined}
                className="hidden"
                muted
                playsInline
                preload="auto"
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    setCurrentTime(videoRef.current.currentTime);
                  }
                }}
              />
              <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className={`max-w-full h-auto ${mode !== 'none' ? 'cursor-crosshair' : 'cursor-default'} touch-none`}
                style={{ maxHeight: '65vh' }}
              />
            </div>

            {/* Playback & Scrubbing Controls */}
            <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(prev => !prev)}
                  className="p-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-sm hover:brightness-110 active:scale-95 transition-all"
                  aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
                <button
                  onClick={stepBack}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition-all"
                  title="Step Back / Undo (Z)"
                  aria-label="Step back frame"
                >
                  <Undo className="w-3.5 h-3.5" /> Undo (Z)
                </button>
                <button
                  onClick={stepForward}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition-all"
                  title="Step Forward (X)"
                  aria-label="Step forward frame"
                >
                  Skip (X) <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Time Scrubber */}
              <div className="flex items-center gap-2 flex-1 max-w-xs">
                <span className="text-[11px] font-mono text-slate-500 font-bold min-w-[36px]">
                  {currentTime.toFixed(2)}s
                </span>
                <input
                  type="range"
                  min={0}
                  max={useSynthetic ? activeScenario.duration : videoRef.current?.duration || 2}
                  step={0.01}
                  value={currentTime}
                  onChange={e => {
                    const t = parseFloat(e.target.value);
                    setCurrentTime(t);
                    if (!useSynthetic && videoRef.current) {
                      videoRef.current.currentTime = t;
                    }
                  }}
                  className="w-full accent-rose-600"
                  aria-label="Video scrubber"
                />
              </div>

              <button
                onClick={resetData}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1"
                aria-label="Reset simulation data"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>

            {/* Graphs Grid */}
            <div className="bg-slate-100 dark:bg-slate-900/60 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100">
                  Kinematic Analysis Charts
                </h3>
                <button
                  onClick={exportCSV}
                  disabled={points.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderGraph(
                  'x-Position vs. Time',
                  'x',
                  'Position (m)',
                  'Horizontal displacement over time. A linear slope indicates constant velocity; a curved graph indicates acceleration.'
                )}
                {renderGraph(
                  'y-Position vs. Time',
                  'y',
                  'Position (m)',
                  'Vertical displacement over time. Earth gravity causes a parabolic curve (y = -4.9t²) for free-falling objects.'
                )}
                {renderGraph(
                  'x-Velocity vs. Time',
                  'vx',
                  'Velocity (m/s)',
                  'Horizontal velocity over time. The slope represents horizontal acceleration (ax).'
                )}
                {renderGraph(
                  'y-Velocity vs. Time',
                  'vy',
                  'Velocity (m/s)',
                  'Vertical velocity over time. Under gravity, this should follow a linear slope of -9.8 m/s².'
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Tracking & Calibration Tools */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 sticky top-4 space-y-4">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                Tracking Instrument
              </h3>

              {/* Step 1: Calibration Ruler */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                <button
                  onClick={() => setMode('cal')}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    mode === 'cal'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50'
                  }`}
                >
                  <Ruler className="w-4 h-4" /> Step 1: Calibrate Ruler
                </button>
                {mode === 'cal' && !scaleLocked && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-emerald-200">
                    <strong>Action:</strong> Click and drag a line between the calibration bar tick marks on the canvas.
                  </p>
                )}
                {showDistanceInput && (
                  <div className="flex gap-2 pt-1">
                    <input aria-label="Distance in meters"
                      type="number"
                      step="0.01"
                      placeholder="Distance (m)"
                      value={distanceInput}
                      onChange={e => setDistanceInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs border-2 border-emerald-500 rounded-xl focus:outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                    />
                    <button
                      onClick={handleLockScale}
                      className="px-3.5 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700"
                    >
                      Lock
                    </button>
                  </div>
                )}
                {scaleLocked && (
                  <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 text-center py-1">
                    ✓ Scale Locked ({metersPerPixel.toFixed(5)} m/px)
                  </div>
                )}
              </div>

              {/* Step 2: Coordinate Origin */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                <button
                  onClick={() => setMode('origin')}
                  disabled={!scaleLocked}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    !scaleLocked
                      ? 'opacity-40 cursor-not-allowed bg-slate-200 dark:bg-slate-700 text-slate-500'
                      : mode === 'origin'
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'bg-white dark:bg-slate-800 border-2 border-cyan-500 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50'
                  }`}
                >
                  <Crosshair className="w-4 h-4" /> Step 2: Set Origin (0,0)
                </button>
                {mode === 'origin' && !originLocked && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-cyan-200">
                    <strong>Action:</strong> Click on the canvas to fix the (0,0) position.
                  </p>
                )}
                {originLocked && (
                  <div className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 text-center py-1">
                    ✓ Origin Fixed at ({origin.x.toFixed(0)}, {origin.y.toFixed(0)})
                  </div>
                )}
              </div>

              {/* Step 3: Track Motion */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                <button
                  onClick={() => setMode('track')}
                  disabled={!originLocked}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    !originLocked
                      ? 'opacity-40 cursor-not-allowed bg-slate-200 dark:bg-slate-700 text-slate-500'
                      : mode === 'track'
                        ? 'bg-rose-600 text-white shadow-md animate-pulse'
                        : 'bg-white dark:bg-slate-800 border-2 border-rose-500 text-rose-600 dark:text-rose-400 hover:bg-rose-50'
                  }`}
                >
                  <Pointer className="w-4 h-4" /> Step 3: Track Motion
                </button>

                {mode === 'track' && (
                  <div className="space-y-2 pt-1">
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-rose-200">
                      <strong>Action:</strong> Click the moving object. The frame advances automatically!
                    </p>
                    <div className="bg-white dark:bg-slate-800 border-2 border-rose-200 dark:border-rose-900 rounded-xl p-2.5 text-center font-mono text-sm font-black text-rose-600 dark:text-rose-400">
                      Recorded Points: {points.length}
                    </div>
                  </div>
                )}
              </div>

              {/* Data Summary Counter */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
                <span>Total Data Points:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{points.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* About Panel Modal */}
        <AboutPanel
          isOpen={showAbout}
          onClose={() => setShowAbout(false)}
          content={MOTION_TRACKER_ABOUT}
          gradient="from-red-500 to-rose-600"
        />

        <div className="mt-12 text-center text-xs text-slate-400">
          <p>
            <strong>Video Motion Tracker</strong> was originally developed by <strong>Mr. Brendan Madden</strong>, and
            generously shared and adapted for use in this application.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MotionTrackerView;
