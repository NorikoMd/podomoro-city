import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Flame, 
  Coffee, 
  Sparkles,
  Volume2
} from 'lucide-react';
import { 
  Settings, 
  LANGUAGES, 
  THEME_CLASSES, 
  TranslationStrings 
} from '../types';
import { playTickTockSound, playAlarmSound } from '../utils/audio';

interface TimerProps {
  settings: Settings;
  activeTaskId: string | null;
  activeTaskTitle?: string;
  onSessionComplete: (duration: number, mode: 'pomodoro' | 'short' | 'long') => void;
}

type TimerMode = 'pomodoro' | 'short' | 'long';

export default function Timer({ 
  settings, 
  activeTaskId, 
  activeTaskTitle, 
  onSessionComplete 
}: TimerProps) {
  const currentLang = settings.language;
  const t: TranslationStrings = LANGUAGES[currentLang].strings;
  const themeClass = THEME_CLASSES[settings.theme];

  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(settings.pomodoroDuration * 60);
  const [totalSeconds, setTotalSeconds] = useState(settings.pomodoroDuration * 60);
  const [continuousCount, setContinuousCount] = useState(0); // counts consecutive pomodoros

  // Track the previous session configuration to observe settings modification changes
  const lastSettingsRef = useRef(settings);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync Timer with current Settings state if modified or mode changes
  const getModeDurationSeconds = (currentMode: TimerMode, customSettings: Settings) => {
    switch (currentMode) {
      case 'pomodoro':
        return customSettings.pomodoroDuration * 60;
      case 'short':
        return customSettings.shortBreakDuration * 60;
      case 'long':
        return customSettings.longBreakDuration * 60;
    }
  };

  // Reset clock when settings or selected mode shifts
  useEffect(() => {
    const isDurationModified = 
      lastSettingsRef.current.pomodoroDuration !== settings.pomodoroDuration ||
      lastSettingsRef.current.shortBreakDuration !== settings.shortBreakDuration ||
      lastSettingsRef.current.longBreakDuration !== settings.longBreakDuration;

    if (isDurationModified || lastSettingsRef.current.language !== settings.language) {
      // update ref
      lastSettingsRef.current = settings;
    }

    if (!isRunning) {
      const neededSeconds = getModeDurationSeconds(mode, settings);
      setTimeLeft(neededSeconds);
      setTotalSeconds(neededSeconds);
    }
  }, [mode, settings, isRunning]);

  // Main tick loop
  useEffect(() => {
    if (isRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer Finished!
            clearInterval(timerIntervalRef.current!);
            setIsRunning(false);
            handleTimerFinished();
            return 0;
          }

          // Tick metronome sound check
          const nextSec = prev - 1;
          if (settings.tickTockSound) {
            playTickTockSound(nextSec % 2 === 0, settings.volume);
          }

          return nextSec;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRunning, mode, settings]);

  const handleTimerFinished = () => {
    // 1. Play Alarm synthesize ringer
    playAlarmSound(settings.alarmSound, settings.volume);

    // 2. Trigger parent metrics callback
    const finishedDurationInMinutes = Math.round(totalSeconds / 60);
    onSessionComplete(finishedDurationInMinutes, mode);

    // 3. Resolve next mode states
    let nextMode: TimerMode = 'pomodoro';
    let nextContinuousCount = continuousCount;

    if (mode === 'pomodoro') {
      nextContinuousCount = continuousCount + 1;
      setContinuousCount(nextContinuousCount);

      // Check for Long Break trigger after 4 Pomodoros
      if (nextContinuousCount >= 4) {
        nextMode = 'long';
        setContinuousCount(0); // Reset continuous count
      } else {
        nextMode = 'short';
      }
    } else {
      // Break finished, return to pomodoro focus
      nextMode = 'pomodoro';
    }

    setMode(nextMode);

    // Get next duration
    const nextDurationSec = getModeDurationSeconds(nextMode, settings);
    setTimeLeft(nextDurationSec);
    setTotalSeconds(nextDurationSec);

    // 4. Auto-Run configurations check
    const shouldAutoStart = 
      (mode === 'pomodoro' && settings.autoStartBreaks) || 
      ((mode === 'short' || mode === 'long') && settings.autoStartPomodoros);

    if (shouldAutoStart) {
      setTimeout(() => {
        setIsRunning(true);
      }, 300);
    }
  };

  const handleTogglePlay = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    const duration = getModeDurationSeconds(mode, settings);
    setTimeLeft(duration);
    setTotalSeconds(duration);
  };

  const handleSkip = () => {
    if (window.confirm(mode === 'pomodoro' ? 'Lewati sesi fokus Anda?' : 'Lewati sesi istirahat Anda?')) {
      setIsRunning(false);
      
      // Toggle modes manually
      let nextMode: TimerMode = 'pomodoro';
      if (mode === 'pomodoro') {
        const nextContinuous = continuousCount + 1;
        setContinuousCount(nextContinuous);
        nextMode = nextContinuous >= 4 ? 'long' : 'short';
      } else {
        nextMode = 'pomodoro';
      }

      setMode(nextMode);
      const nextDuration = getModeDurationSeconds(nextMode, settings);
      setTimeLeft(nextDuration);
      setTotalSeconds(nextDuration);
    }
  };

  const handleModeChange = (newMode: TimerMode) => {
    if (isRunning) {
      if (!window.confirm('Timer sedang berjalan. Putuskan hubungan dan ganti mode sesi?')) {
        return;
      }
    }
    setIsRunning(false);
    setMode(newMode);
    const duration = getModeDurationSeconds(newMode, settings);
    setTimeLeft(duration);
    setTotalSeconds(duration);
  };

  // Convert seconds to visual display
  const minutesDisplay = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secondsDisplay = String(timeLeft % 60).padStart(2, '0');

  // Circled Progress SVG Maths
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = totalSeconds > 0 ? (timeLeft / totalSeconds) : 0;
  const dashoffset = circumference - (progressRatio * circumference);

  return (
    <div 
      className="flex flex-col items-center justify-center p-6 md:p-8 rounded-3xl bg-zinc-900/60 backdrop-blur-md border border-zinc-800/85 text-center shadow-xl relative"
      id="timer-control-panel"
    >
      {/* 1. Mode Selecting Tabs */}
      <div className="flex bg-zinc-950/70 p-1.5 rounded-2xl gap-1.5 mb-10 border border-zinc-850/80 max-w-sm w-full font-sans">
        {[
          { key: 'pomodoro', label: t.pomodoro, icon: Flame },
          { key: 'short', label: t.shortBreak, icon: Coffee },
          { key: 'long', label: t.longBreak, icon: Coffee },
        ].map((btn) => {
          const IconComponent = btn.icon;
          const isActive = mode === btn.key;
          return (
            <button
              key={btn.key}
              id={`tab-mode-${btn.key}`}
              onClick={() => handleModeChange(btn.key as TimerMode)}
              className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-1.5 py-2.5 px-2 text-[11px] md:text-sm font-semibold rounded-xl cursor-pointer transition-all duration-300 ${
                isActive 
                  ? `${themeClass.navActiveBg} scale-[1.03] shadow-md shadow-black/40`
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <IconComponent className="w-4 h-4 shrink-0" />
              <span>{btn.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Ring Countdown Dial Wrapper */}
      <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center mb-10" id="radial-clockway">
        
        {/* Glow behind ring */}
        <div 
          className="absolute inset-20 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500"
          style={{ backgroundColor: themeClass.glowFilter }}
        />

        {/* Circular SVG Progress Board */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90 select-none">
          {/* Back track circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="transparent"
            stroke="rgba(39, 39, 42, 0.4)"
            strokeWidth="10"
            className="stroke-zinc-850"
          />

          {/* Glowing Front active path */}
          <motion.circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="transparent"
            strokeWidth="11"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: dashoffset,
              transition: isRunning ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.3s ease-out'
            }}
            className={`${themeClass.progressBarColor} drop-shadow-[0_0_10px_currentColor]`}
          />
        </svg>

        {/* Digits Display Core */}
        <div className="flex flex-col items-center justify-center z-10 transition-transform hover:scale-[1.02]">
          <span className="text-5xl md:text-6xl font-bold font-mono text-white tracking-tighter select-none leading-none mb-1 shadow-sm">
            {minutesDisplay}:{secondsDisplay}
          </span>
          <span className={`text-[11px] font-sans font-semibold tracking-widest uppercase select-none ${themeClass.accentText}`}>
            {mode === 'pomodoro' ? 'FOKUS' : 'ISTIRAHAT'}
          </span>
          
          {/* Current Target task label inside dial */}
          {mode === 'pomodoro' && activeTaskTitle && (
            <p className="text-zinc-400 font-sans text-xs max-w-[160px] truncate mt-3 font-medium flex items-center justify-center gap-1 px-2.5 py-1 bg-zinc-950/40 rounded-full border border-zinc-800">
              <Sparkles className="w-3 h-3 text-yellow-400 shrink-0" />
              <span className="truncate">{activeTaskTitle}</span>
            </p>
          )}
        </div>
      </div>

      {/* 3. Action HUD Buttons */}
      <div className="flex items-center justify-center gap-4 w-full max-w-sm" id="hud-timer-controls">
        
        {/* Reset Clock */}
        <button
          onClick={handleReset}
          id="btn-timer-reset"
          className="p-3.5 rounded-2xl bg-zinc-950/50 hover:bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-md flex items-center justify-center shrink-0"
          title={t.reset}
        >
          <RotateCcw className="w-5 h-5 pointer-events-none" />
        </button>

        {/* Center play-session primary button */}
        <button
          onClick={handleTogglePlay}
          id="btn-timer-play"
          className={`flex-1 py-4 px-6 rounded-2xl text-sm md:text-base font-semibold text-zinc-950 transition-all transform hover:scale-[1.03] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 max-w-[180px] ${themeClass.primaryBg} ${themeClass.glowColor}`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 pointer-events-none stroke-[2.5]" />
              <span>{t.pause.split(' ')[0]}</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 pointer-events-none fill-current stroke-[2.5]" />
              <span>{t.start.split(' ')[0]}</span>
            </>
          )}
        </button>

        {/* Skip Sesi */}
        <button
          onClick={handleSkip}
          id="btn-timer-skip"
          className="p-3.5 rounded-2xl bg-zinc-950/50 hover:bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-md flex items-center justify-center shrink-0"
          title={t.skip}
        >
          <SkipForward className="w-5 h-5 pointer-events-none" />
        </button>

      </div>

      {/* Mini Streak Dot Counter */}
      {mode === 'pomodoro' && (
        <div className="mt-8 flex items-center gap-2.5" id="streak-dots">
          {[1, 2, 3, 4].map((dot) => {
            const isFilled = continuousCount >= dot;
            return (
              <div 
                key={dot}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  isFilled 
                    ? `bg-${settings.theme === 'sunset-red' ? 'red' : settings.theme === 'deep-blue' ? 'cyan' : settings.theme === 'forest-green' ? 'emerald' : 'amber'}-500 shadow-md` 
                    : 'bg-zinc-800'
                }`}
                style={{
                  backgroundColor: isFilled ? themeClass.accentText.split(' ')[0] : undefined,
                  boxShadow: isFilled ? `0 0 8px ${themeClass.glowFilter}` : 'none'
                }}
                title={`${continuousCount}/4 Sesi fokus untuk Istirahat Panjang`}
              />
            );
          })}
          <span className="text-[10px] text-zinc-500 font-mono font-bold leading-none ml-1">
            {continuousCount}/4
          </span>
        </div>
      )}
    </div>
  );
}
