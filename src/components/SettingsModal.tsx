import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Volume2, 
  Globe, 
  RotateCcw, 
  Sliders, 
  Bell, 
  Sparkles, 
  Clock, 
  Flame, 
  Check 
} from 'lucide-react';
import { 
  Settings, 
  Language, 
  SelectedTheme, 
  AlarmSound, 
  LANGUAGES, 
  THEME_CLASSES, 
  TranslationStrings 
} from '../types';
import { playAlarmSound } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (newSettings: Settings) => void;
  onRestoreDefaults: () => void;
  onResetAllData: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
  onRestoreDefaults,
  onResetAllData,
}: SettingsModalProps) {
  const currentLang = settings.language;
  const t: TranslationStrings = LANGUAGES[currentLang].strings;

  // Local state for forms
  const [pomodoroDuration, setPomodoroDuration] = useState(settings.pomodoroDuration.toString());
  const [shortBreakDuration, setShortBreakDuration] = useState(settings.shortBreakDuration.toString());
  const [longBreakDuration, setLongBreakDuration] = useState(settings.longBreakDuration.toString());
  const [autoStartBreaks, setAutoStartBreaks] = useState(settings.autoStartBreaks);
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(settings.autoStartPomodoros);
  const [tickTockSound, setTickTockSound] = useState(settings.tickTockSound);
  const [alarmSound, setAlarmSound] = useState<AlarmSound>(settings.alarmSound);
  const [volume, setVolume] = useState(settings.volume);
  const [theme, setTheme] = useState<SelectedTheme>(settings.theme);
  const [language, setLanguage] = useState<Language>(settings.language);

  const [testPlaying, setTestPlaying] = useState(false);

  const handleTestSound = (selectedSound: AlarmSound) => {
    setTestPlaying(true);
    playAlarmSound(selectedSound, volume);
    setTimeout(() => setTestPlaying(false), 2000);
  };

  const currentThemeChoice = THEME_CLASSES[theme];

  const handleSave = () => {
    // Validate inputs
    const pomo = Math.max(1, Math.min(180, parseInt(pomodoroDuration) || 25));
    const short = Math.max(1, Math.min(60, parseInt(shortBreakDuration) || 5));
    const long = Math.max(1, Math.min(60, parseInt(longBreakDuration) || 15));

    onSave({
      pomodoroDuration: pomo,
      shortBreakDuration: short,
      longBreakDuration: long,
      autoStartBreaks,
      autoStartPomodoros,
      tickTockSound,
      alarmSound,
      volume,
      theme,
      language,
    });
    onClose();
  };

  const handleRestoreDefaultsClick = () => {
    onRestoreDefaults();
    // Reset local component state
    setPomodoroDuration('25');
    setShortBreakDuration('5');
    setLongBreakDuration('15');
    setAutoStartBreaks(true);
    setAutoStartPomodoros(false);
    setTickTockSound(true);
    setAlarmSound('crystal-bell');
    setVolume(0.5);
    setTheme('sunset-red');
    setLanguage('id');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
            id="settings-backdrop-overlay"
          />

          {/* Settings Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className={`relative w-full max-w-2xl bg-zinc-900 border ${currentThemeChoice.borderColor} rounded-3xl shadow-2xl shadow-black/80 overflow-hidden z-10 p-6 md:p-8`}
            id="settings-container-panel"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <Sliders className={`w-6 h-6 ${currentThemeChoice.accentText}`} />
                <h2 className="text-xl font-sans font-semibold text-white tracking-tight">
                  {t.settingsTitle}
                </h2>
              </div>
              <button
                id="btn-close-settings"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              
              {/* 1. LANGUAGE SELECTION */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-zinc-500" />
                  {t.languageLabel}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(LANGUAGES) as Language[]).map((langKey) => (
                    <button
                      key={langKey}
                      id={`lang-select-${langKey}`}
                      onClick={() => setLanguage(langKey)}
                      className={`py-2 px-3 text-xs md:text-sm font-medium rounded-xl border transition-all duration-200 ${
                        language === langKey
                          ? `${currentThemeChoice.navActiveBg} font-semibold`
                          : 'bg-zinc-800/40 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      {LANGUAGES[langKey].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. FOCUS TIMER DURATIONS */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-500" />
                  {t.pomodoroTime.split('(')[0].trim()}
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">
                      {t.pomodoro} (min)
                    </label>
                    <input
                      type="number"
                      id="input p-duration"
                      min="1"
                      max="180"
                      value={pomodoroDuration}
                      onChange={(e) => setPomodoroDuration(e.target.value)}
                      className="w-full bg-zinc-800/50 border border-zinc-800 rounded-xl px-3 py-2 text-white text-sm font-mono focus:outline-none focus:ring-1 focus:ring-current"
                      style={{ color: currentThemeChoice.accentText } as any}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">
                      {t.shortBreak} (min)
                    </label>
                    <input
                      type="number"
                      id="input-s-break"
                      min="1"
                      max="60"
                      value={shortBreakDuration}
                      onChange={(e) => setShortBreakDuration(e.target.value)}
                      className="w-full bg-zinc-800/50 border border-zinc-800 rounded-xl px-3 py-2 text-white text-sm font-mono focus:outline-none focus:ring-1 focus:ring-current"
                      style={{ color: currentThemeChoice.accentText } as any}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">
                      {t.longBreak} (min)
                    </label>
                    <input
                      type="number"
                      id="input h-break"
                      min="1"
                      max="60"
                      value={longBreakDuration}
                      onChange={(e) => setLongBreakDuration(e.target.value)}
                      className="w-full bg-zinc-800/50 border border-zinc-800 rounded-xl px-3 py-2 text-white text-sm font-mono focus:outline-none focus:ring-1 focus:ring-current"
                      style={{ color: currentThemeChoice.accentText } as any}
                    />
                  </div>
                </div>
              </div>

              {/* 3. VISUAL THEME PRESETS */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-zinc-500" />
                  {t.visualTheme}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(Object.keys(THEME_CLASSES) as SelectedTheme[]).map((themeKey) => {
                    const preset = THEME_CLASSES[themeKey];
                    const labelName = 
                      themeKey === 'sunset-red' ? t.themeSunsetRed :
                      themeKey === 'deep-blue' ? t.themeDeepBlue :
                      themeKey === 'forest-green' ? t.themeForestGreen :
                      t.themeCozyAmber;
                    
                    return (
                      <button
                        key={themeKey}
                        id={`theme-btn-${themeKey}`}
                        onClick={() => setTheme(themeKey)}
                        className={`flex flex-col items-center justify-between p-3 rounded-2xl border text-center transition-all duration-200 ${
                          theme === themeKey
                            ? `${preset.navActiveBg} scale-[1.02] shadow-md`
                            : 'bg-zinc-800/30 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/70'
                        }`}
                      >
                        {/* Little color circle with glow */}
                        <div 
                          className="w-8 h-8 rounded-full mb-2 flex items-center justify-center"
                          style={{
                            background: themeKey === 'sunset-red' ? 'rgb(239, 68, 68)' :
                                        themeKey === 'deep-blue' ? 'rgb(6, 182, 212)' :
                                        themeKey === 'forest-green' ? 'rgb(16, 185, 129)' :
                                        'rgb(245, 158, 11)',
                            boxShadow: `0 0 12px ${preset.glowFilter}`
                          }}
                        >
                          {theme === themeKey && <Check className="w-4 h-4 text-zinc-950 font-bold" />}
                        </div>
                        <span className="text-[11px] font-sans font-medium line-clamp-1">
                          {labelName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. SOUNDS AND ALARMS */}
              <div className="space-y-4 pt-2 border-t border-zinc-800/50">
                <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-zinc-400" />
                  {t.soundEffects}
                </h3>

                {/* Alarm Sound Preset Selection */}
                <div className="space-y-3">
                  <label className="text-xs font-medium text-zinc-400 block">
                    {t.alarmSoundLabel}
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { key: 'digital-alarm', label: t.alarmDigital },
                      { key: 'crystal-bell', label: t.alarmCrystal },
                      { key: 'zen-gong', label: t.alarmZen },
                      { key: 'birds-chirping', label: t.alarmBirds },
                    ].map((soundOpt) => (
                      <button
                        key={soundOpt.key}
                        id={`sound-btn-${soundOpt.key}`}
                        onClick={() => {
                          setAlarmSound(soundOpt.key as AlarmSound);
                          handleTestSound(soundOpt.key as AlarmSound);
                        }}
                        className={`p-2.5 rounded-xl text-[11px] md:text-xs font-medium border text-center transition-all ${
                          alarmSound === soundOpt.key
                            ? `${currentThemeChoice.navActiveBg}`
                            : 'bg-zinc-800/40 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                        }`}
                      >
                        {soundOpt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Alarm Volume */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-zinc-500" />
                      {t.alarmVolume}
                    </span>
                    <span className="text-white font-mono text-xs">{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    id="slider-sound-volume"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className={`w-full accent-emerald-400 rounded-lg cursor-pointer bg-zinc-800`}
                    style={{
                      accentColor: theme === 'sunset-red' ? '#ef4444' :
                                   theme === 'deep-blue' ? '#06b6d4' :
                                   theme === 'forest-green' ? '#10b981' :
                                   '#f59e0b'
                    }}
                  />
                </div>

                {/* Automation Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  
                  {/* Tick Tock */}
                  <div 
                    onClick={() => setTickTockSound(!tickTockSound)}
                    id="toggle-tick-tock"
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      tickTockSound 
                        ? `${currentThemeChoice.navActiveBg}` 
                        : 'bg-zinc-800/20 border-zinc-800/80 text-zinc-400 hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-white">Tick Tock Sound</span>
                      <span className="text-[10px] text-zinc-500 line-clamp-1">{t.tickTockLabel}</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-all ${tickTockSound ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                      <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-all ${tickTockSound ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  {/* Auto Start Break */}
                  <div 
                    onClick={() => setAutoStartBreaks(!autoStartBreaks)}
                    id="toggle-auto-breaks"
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      autoStartBreaks 
                        ? `${currentThemeChoice.navActiveBg}` 
                        : 'bg-zinc-800/20 border-zinc-800/80 text-zinc-400 hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-white">Auto Break</span>
                      <span className="text-[10px] text-zinc-500 line-clamp-1">{t.autoStartBreaksLabel}</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-all ${autoStartBreaks ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                      <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-all ${autoStartBreaks ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  {/* Auto Start Pomodoro */}
                  <div 
                    onClick={() => setAutoStartPomodoros(!autoStartPomodoros)}
                    id="toggle-auto-pomo"
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      autoStartPomodoros 
                        ? `${currentThemeChoice.navActiveBg}`  
                        : 'bg-zinc-800/20 border-zinc-800/80 text-zinc-400 hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-white">Auto Focus</span>
                      <span className="text-[10px] text-zinc-500 line-clamp-1">{t.autoStartPomodorosLabel}</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-all ${autoStartPomodoros ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                      <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-all ${autoStartPomodoros ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </div>

                </div>

              </div>

              {/* 5. FACTORY RESET ALL */}
              <div className="pt-4 border-t border-zinc-800/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                <div className="text-zinc-500 max-w-[280px]">
                  Beralih kembali ke pengaturan orisinil atau bersihkan data lama di browser Anda?
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    id="btn-restore-defaults"
                    onClick={handleRestoreDefaultsClick}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {t.restoreDefaults}
                  </button>
                  <button
                    type="button"
                    id="btn-reset-alldata"
                    onClick={() => {
                      if (window.confirm(t.resetStatsConfirm)) {
                        onResetAllData();
                        onClose();
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-950/20 border border-red-500/30 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all text-xs"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    {t.resetStats}
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Controls */}
            <div className="mt-6 pt-4 border-t border-zinc-800/80 flex justify-end gap-2">
              <button
                id="btn-cancel-settings"
                onClick={onClose}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white font-medium hover:bg-zinc-800/50 rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                id="btn-save-settings"
                onClick={handleSave}
                className={`px-6 py-2 rounded-xl text-sm font-semibold text-zinc-950 transition-all transform hover:scale-[1.02] active:scale-[0.98] ${currentThemeChoice.primaryBg}`}
              >
                {t.saveSettings}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
