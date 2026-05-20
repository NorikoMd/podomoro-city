import { useState, useEffect } from 'react';
import { 
  Settings as LucideSettings, 
  Sparkles, 
  Flame, 
  Coffee, 
  Layers,
  HelpCircle,
  Bell,
  Github
} from 'lucide-react';
import { 
  Settings, 
  Task, 
  FocusStats, 
  FocusSession, 
  LANGUAGES, 
  THEME_CLASSES, 
  TranslationStrings 
} from './types';
import Timer from './components/Timer';
import TodoList from './components/TodoList';
import StatsDashboard from './components/StatsDashboard';
import SettingsModal from './components/SettingsModal';

// Storage Key Constants
const ST_KEY_SETTINGS = 'pomoflow_local_settings_v3';
const ST_KEY_TASKS = 'pomoflow_local_tasks_v3';
const ST_KEY_STATS = 'pomoflow_local_stats_v3';

// Formatted defaults
const DEFAULT_SETTINGS: Settings = {
  pomodoroDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  autoStartBreaks: true,
  autoStartPomodoros: false,
  tickTockSound: true,
  alarmSound: 'crystal-bell',
  volume: 0.5,
  theme: 'sunset-red',
  language: 'id',
};

const DEFAULT_STATS: FocusStats = {
  totalFocusTime: 0,
  totalCompletedSessions: 0,
  history: [],
};

export default function App() {
  // Load states from localStorage or use defaults
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const stored = localStorage.getItem(ST_KEY_SETTINGS);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Could not read settings from localStorage:', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const stored = localStorage.getItem(ST_KEY_TASKS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read tasks from localStorage:', e);
    }
    return [];
  });

  const [stats, setStats] = useState<FocusStats>(() => {
    try {
      const stored = localStorage.getItem(ST_KEY_STATS);
      if (stored) {
        return { ...DEFAULT_STATS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Could not read stats from localStorage:', e);
    }
    return DEFAULT_STATS;
  });

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState<{ title: string; message: string } | null>(null);

  // Sync state changes with local storage
  useEffect(() => {
    try {
      localStorage.setItem(ST_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed storing settings:', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(ST_KEY_TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed storing tasks:', e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(ST_KEY_STATS, JSON.stringify(stats));
    } catch (e) {
      console.error('Failed storing stats:', e);
    }
  }, [stats]);

  // Handle document title change to mirror timer progress or status on tab
  useEffect(() => {
    const t = LANGUAGES[settings.language].strings;
    document.title = `${settings.appName} | ${t.appName}`;
  }, [settings.language]);

  const t: TranslationStrings = LANGUAGES[settings.language].strings;
  const currentTheme = THEME_CLASSES[settings.theme];

  // Actions: Todo Management
  const handleAddTask = (title: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      pomodoroCount: 0,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (activeTaskId === id) {
      setActiveTaskId(null);
    }
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
    // If completed active task, remove active focus
    const matched = tasks.find((t) => t.id === id);
    if (matched && !matched.completed && activeTaskId === id) {
      setActiveTaskId(null);
    }
  };

  const handleSetActiveTask = (id: string | null) => {
    setActiveTaskId(id);
  };

  // Actions: Timer Metrics Complete Logging
  const handleSessionComplete = (MinutesCompleted: number, mode: 'pomodoro' | 'short' | 'long') => {
    // Only pomodoro sessions increment tomato focus metrics
    if (mode === 'pomodoro') {
      // 1. Increment total Focus time & completion counts
      setStats((prev) => {
        const newSessionLog: FocusSession = {
          timestamp: Date.now(),
          duration: MinutesCompleted,
          mode: 'pomodoro',
          taskId: activeTaskId || undefined,
        };
        return {
          totalFocusTime: prev.totalFocusTime + MinutesCompleted,
          totalCompletedSessions: prev.totalCompletedSessions + 1,
          history: [newSessionLog, ...prev.history],
        };
      });

      // 2. Increment active task pomodoro counts
      if (activeTaskId) {
        setTasks((prev) =>
          prev.map((tsk) =>
            tsk.id === activeTaskId
              ? { ...tsk, pomodoroCount: tsk.pomodoroCount + 1 }
              : tsk
          )
        );
      }

      // Display short local toast/banner of completion
      triggerToastNotification(t.sessionCompletedTitle, t.pomodoroCompletedMsg);
    } else {
      // Break session completed
      triggerToastNotification(t.sessionCompletedTitle, t.breakCompletedMsg);
    }
  };

  const triggerToastNotification = (title: string, message: string) => {
    setShowNotification({ title, message });
    // Auto clear after 6 seconds
    setTimeout(() => {
      setShowNotification(null);
    }, 6000);
  };

  // Actions: Reset All Handlers
  const handleRestoreDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const handleResetAllData = () => {
    setSettings(DEFAULT_SETTINGS);
    setTasks([]);
    setStats(DEFAULT_STATS);
    setActiveTaskId(null);
    localStorage.removeItem(ST_KEY_SETTINGS);
    localStorage.removeItem(ST_KEY_TASKS);
    localStorage.removeItem(ST_KEY_STATS);
  };

  const activeTaskObj = tasks.find((t) => t.id === activeTaskId);

  return (
    <div 
      className={`min-h-screen bg-gradient-to-br ${currentTheme.bgColor} text-zinc-100 flex flex-col py-6 px-4 md:px-8 selection:bg-emerald-500 selection:text-zinc-950 transition-colors duration-700`}
      id="pomoflow-app-root"
    >
      {/* 1. Header Navigation Banner */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between border-b border-zinc-800/60 pb-5 mb-8 shrink-0">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-2xl flex items-center justify-center font-sans font-extrabold text-zinc-950 shadow-md transform hover:rotate-12 transition-transform duration-300"
            style={{
              background: settings.theme === 'sunset-red'
                ? 'linear-gradient(135deg, #f87171, #ef4444)'
                : settings.theme === 'deep-blue'
                ? 'linear-gradient(135deg, #22d3ee, #06b6d4)'
                : settings.theme === 'forest-green'
                ? 'linear-gradient(135deg, #34d399, #10b981)'
                : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              boxShadow: `0 0 16px ${currentTheme.glowFilter}`
            }}
          >
            P
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-sans font-bold tracking-tight text-white flex items-center gap-1.5">
              {t.appName}
              <span className={`text-[10px] font-mono border ${currentTheme.borderColor} ${currentTheme.accentText} uppercase tracking-wider px-1.5 py-0.5 rounded-md`}>
                v1.2
              </span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-sans leading-none mt-0.5 font-medium">
              Aplikasi Pomodoro Timer Modern & Minimalis
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-3">
          {/* Quick info status block */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-zinc-950/40 border border-zinc-850 text-xs text-zinc-400">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-sans font-medium line-clamp-1">
              Data tersimpan di LocalStorage
            </span>
          </div>

          {/* Trigger settings */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            id="btn-trigger-settings"
            className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300 hover:text-white transition-all transform hover:scale-[1.05] active:scale-[0.95]"
            title={t.settingsTitle}
          >
            <LucideSettings className="w-5 h-5 pointer-events-none" />
          </button>
        </div>
      </header>

      {/* 2. Completion local Toast alerts */}
      {showNotification && (
        <div className="max-w-7xl w-full mx-auto mb-6" id="banner-completion-toast">
          <div className={`p-4 bg-zinc-900 border ${currentTheme.borderColor} rounded-2xl flex items-start gap-3.5 shadow-xl shadow-black/40 relative overflow-hidden animate-fade-in`}>
            <div 
              className="absolute left-0 top-0 bottom-0 w-1.5"
              style={{
                backgroundColor: settings.theme === 'sunset-red'
                  ? '#ef4444'
                  : settings.theme === 'deep-blue'
                  ? '#06b6d4'
                  : settings.theme === 'forest-green'
                  ? '#10b981'
                  : '#f59e0b'
              }}
            />
            <div className="p-2 bg-zinc-800/60 rounded-xl">
              <Bell className="w-5 h-5 text-yellow-400 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-sans font-bold text-white tracking-tight">
                {showNotification.title}
              </h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                {showNotification.message}
              </p>
            </div>
            <button
              onClick={() => setShowNotification(null)}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 self-start text-xs font-semibold"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Split Board Layout */}
      <main className="max-w-7xl w-full mx-auto flex-1 flex flex-col justify-start">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Column: Huge visual countdown timer */}
          <section className="lg:col-span-5 h-full flex flex-col justify-between">
            <Timer
              settings={settings}
              activeTaskId={activeTaskId}
              activeTaskTitle={activeTaskObj?.title}
              onSessionComplete={handleSessionComplete}
            />

            {/* Quick Informational tips */}
            <div className="mt-6 p-4 rounded-3xl bg-zinc-950/25 border border-zinc-900/60 text-xs text-zinc-500 font-sans space-y-2 leading-relaxed">
              <span className="font-bold text-zinc-300 block">💡 Tips Memaksimalkan Teknik Pomodoro</span>
              <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-0.5">
                <li><strong className="text-zinc-300">Satu Tugas Sekali Waktu:</strong> Fokuslah hanya pada tugas aktif yang sudah Anda pilih. Jangan berpindah tugas sebelum bel berbunyi.</li>
                <li><strong className="text-zinc-300">Hargai Waktu Istirahat:</strong> Saat waktu istirahat tiba, benar-benar menjauhlah dari layar kerja Anda. Lakukan peregangan ringan.</li>
              </ul>
            </div>
          </section>

          {/* Right Column: Daily Task List Organizer and Focus analytics weekly trend */}
          <section className="lg:col-span-7 flex flex-col gap-6 lg:gap-8">
            <TodoList
              tasks={tasks}
              activeTaskId={activeTaskId}
              settings={settings}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onToggleTask={handleToggleTask}
              onSetActiveTask={handleSetActiveTask}
            />

            <StatsDashboard
              stats={stats}
              settings={settings}
              onClearHistory={() => setStats(DEFAULT_STATS)}
            />
          </section>

        </div>
      </main>

      {/* 4. Footer credits branding */}
      <footer className="max-w-7xl w-full mx-auto border-t border-zinc-800/40 mt-12 pt-6 pb-2 text-center text-xs text-zinc-600 font-sans flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <span>
          © {new Date().getFullYear()} <strong>PomoFlow</strong>. Hak Cipta Dilindungi, Tersimpan secara Lokal.
        </span>
        <div className="flex items-center justify-center gap-3 text-zinc-500">
          <span className="hover:text-zinc-300 cursor-pointer">Panduan Teknik Pomodoro</span>
          <span>•</span>
          <span className="hover:text-zinc-300 cursor-pointer">Keamanan & Privasi</span>
        </div>
      </footer>

      {/* Settings Modal component trigger board */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={setSettings}
        onRestoreDefaults={handleRestoreDefaults}
        onResetAllData={handleResetAllData}
      />
    </div>
  );
}
