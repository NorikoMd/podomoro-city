export type Language = 'id' | 'zh' | 'en';

export type SelectedTheme = 'sunset-red' | 'deep-blue' | 'forest-green' | 'cozy-amber';

export type AlarmSound = 'digital-alarm' | 'crystal-bell' | 'zen-gong' | 'birds-chirping';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  pomodoroCount: number; // completed focus sessions for this task
  createdAt: number;
}

export interface Settings {
  pomodoroDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  tickTockSound: boolean;
  alarmSound: AlarmSound;
  volume: number; // 0 to 1
  theme: SelectedTheme;
  language: Language;
}

export interface FocusSession {
  timestamp: number; // ms
  duration: number; // active minutes completed
  taskId?: string; // which task it was completed for
  mode: 'pomodoro' | 'short' | 'long';
}

export interface FocusStats {
  totalFocusTime: number; // in minutes
  totalCompletedSessions: number; // number of completed pomodoro sessions
  history: FocusSession[];
}

export interface TranslationStrings {
  appName: string;
  // Timer modes
  pomodoro: string;
  shortBreak: string;
  longBreak: string;
  
  // Timer state controls
  start: string;
  pause: string;
  skip: string;
  reset: string;
  
  // Tasks Section
  todoTitle: string;
  todoPlaceholder: string;
  addTask: string;
  activeTarget: string;
  noActiveTarget: string;
  setTarget: string;
  completed: string;
  totalCompleted: string;
  tomatoCount: string;
  deleteTask: string;
  noTasks: string;

  // Stats Section
  statsTitle: string;
  totalFocusTimeLabel: string;
  totalSessionsLabel: string;
  weeklyTrendTitle: string;
  weeklyTrendDesc: string;
  resetStats: string;
  resetStatsConfirm: string;
  minutesUnit: string;
  sessionsUnit: string;
  noStatsData: string;

  // Settings Section
  settingsTitle: string;
  pomodoroTime: string;
  shortBreakTime: string;
  longBreakTime: string;
  autoStartBreaksLabel: string;
  autoStartPomodorosLabel: string;
  soundEffects: string;
  tickTockLabel: string;
  alarmSoundLabel: string;
  alarmDigital: string;
  alarmCrystal: string;
  alarmZen: string;
  alarmBirds: string;
  alarmVolume: string;
  visualTheme: string;
  languageLabel: string;
  saveSettings: string;
  restoreDefaults: string;
  
  // Theme names
  themeSunsetRed: string;
  themeDeepBlue: string;
  themeForestGreen: string;
  themeCozyAmber: string;

  // Notifications
  sessionCompletedTitle: string;
  pomodoroCompletedMsg: string;
  breakCompletedMsg: string;
}

export const LANGUAGES: Record<Language, { label: string; strings: TranslationStrings }> = {
  id: {
    label: 'Bahasa Indonesia',
    strings: {
      appName: 'PomoFlow',
      pomodoro: 'Pomodoro',
      shortBreak: 'Istirahat Pendek',
      longBreak: 'Istirahat Panjang',
      start: 'Mulai Fokus',
      pause: 'Jeda Sesi',
      skip: 'Lewati Sesi',
      reset: 'Atur Ulang',
      todoTitle: 'Daftar Tugas Hari Ini',
      todoPlaceholder: 'Tulis tugas baru di sini...',
      addTask: 'Tambah Tugas',
      activeTarget: 'Target Fokus Aktif',
      noActiveTarget: 'Klik ikon sasaran di tugas untuk fokus',
      setTarget: 'Jadikan Target Utama',
      completed: 'Selesai',
      totalCompleted: 'Total Selesai',
      tomatoCount: 'Sesi Tomat',
      deleteTask: 'Hapus Tugas',
      noTasks: 'Belum ada tugas. Tambahkan satu untuk memulai fokus!',
      statsTitle: 'Statistik Fokus',
      totalFocusTimeLabel: 'Waktu Fokus',
      totalSessionsLabel: 'Sesi Pomodoro',
      weeklyTrendTitle: 'Tren Fokus Mingguan',
      weeklyTrendDesc: 'Statistik durasi fokus harian Anda dalam 7 hari terakhir',
      resetStats: 'Reset Semua Data',
      resetStatsConfirm: 'Apakah Anda yakin ingin menyetel ulang semua tugas dan statistik?',
      minutesUnit: 'menit',
      sessionsUnit: 'sesi',
      noStatsData: 'Belum ada data fokus tercatat minggu ini.',
      settingsTitle: 'Pengaturan Timer & Sesi',
      pomodoroTime: 'Durasi Pomodoro (menit)',
      shortBreakTime: 'Istirahat Pendek (menit)',
      longBreakTime: 'Istirahat Panjang (menit)',
      autoStartBreaksLabel: 'Mulai Istirahat secara Otomatis',
      autoStartPomodorosLabel: 'Mulai Pomodoro secara Otomatis',
      soundEffects: 'Efek Suara Sintetis (Web Audio API)',
      tickTockLabel: 'Suara Detak Jam (Tick-Tock) saat fokus',
      alarmSoundLabel: 'Jenis Nada Alarm',
      alarmDigital: 'Alarm Digital Retro',
      alarmCrystal: 'Kristal Lonceng',
      alarmZen: 'Zong Genta (Zen Gong)',
      alarmBirds: 'Kicauan Burung Pagi',
      alarmVolume: 'Volume Alarm',
      visualTheme: 'Pilihan Warna Tema Visual',
      languageLabel: 'Bahasa Aplikasi',
      saveSettings: 'Simpan & Terapkan',
      restoreDefaults: 'Kembalikan ke Default',
      themeSunsetRed: 'Sunset Red (烈日紅)',
      themeDeepBlue: 'Deep Blue (深海藍)',
      themeForestGreen: 'Forest Green (森林綠)',
      themeCozyAmber: 'Cozy Amber (暖秋金)',
      sessionCompletedTitle: 'Waktu Selesai!',
      pomodoroCompletedMsg: 'Sesi Pomodoro selesai! Waktunya mengambil istirahat pendek.',
      breakCompletedMsg: 'Waktu istirahat selesai! Siap untuk kembali fokus?',
    },
  },
  zh: {
    label: '繁體中文',
    strings: {
      appName: 'PomoFlow',
      pomodoro: '番茄專注',
      shortBreak: '短暫休息',
      longBreak: '延長休息',
      start: '開始專注',
      pause: '暫停計時',
      skip: '跳過本堂',
      reset: '重新開始',
      todoTitle: '今日工作清單',
      todoPlaceholder: '在這裡輸入新的工作任務...',
      addTask: '新增任務',
      activeTarget: '目前專注目標',
      noActiveTarget: '點擊點標靶圖示開始專注於該任務',
      setTarget: '設為專注目標',
      completed: '已完成',
      totalCompleted: '累計完成',
      tomatoCount: '番茄鐘數',
      deleteTask: '刪除任務',
      noTasks: '尚無工作。新增一個任務來開始你的番茄鐘之旅吧！',
      statsTitle: '專注統計數據',
      totalFocusTimeLabel: '專注時間',
      totalSessionsLabel: '累計番茄鐘',
      weeklyTrendTitle: '每週專注趨勢',
      weeklyTrendDesc: '過去 7 天內您的每日專注時長（分鐘）',
      resetStats: '重設所有數據',
      resetStatsConfirm: '您確定要重設所有任務與專注統計數據嗎？此操作無法復原。',
      minutesUnit: '分鐘',
      sessionsUnit: '個',
      noStatsData: '本週尚無專注紀錄。',
      settingsTitle: '專注定時設置',
      pomodoroTime: '番茄鐘時長 (分鐘)',
      shortBreakTime: '短暫休息時長 (分鐘)',
      longBreakTime: '延長休息時長 (分鐘)',
      autoStartBreaksLabel: '專注結束後自動開始休息',
      autoStartPomodorosLabel: '休息結束後自動開始下個專番',
      soundEffects: '網頁合成音效 (Web Audio API)',
      tickTockLabel: '專注時撥放時鐘嘀嗒聲 (Tick-Tock)',
      alarmSoundLabel: '鬧鐘鈴聲選擇',
      alarmDigital: '復古數位警報',
      alarmCrystal: '水晶風鈴',
      alarmZen: '禪意銅鑼 (Zen Gong)',
      alarmBirds: '晨曦鳥鳴',
      alarmVolume: '警報音量',
      visualTheme: '視覺風格配色',
      languageLabel: '介面語言',
      saveSettings: '儲存並套用',
      restoreDefaults: '恢復預設值',
      themeSunsetRed: 'Sunset Red (烈日紅)',
      themeDeepBlue: 'Deep Blue (深海藍)',
      themeForestGreen: 'Forest Green (森林綠)',
      themeCozyAmber: 'Cozy Amber (暖秋金)',
      sessionCompletedTitle: '時間終了！',
      pomodoroCompletedMsg: '恭喜完成一個番茄鐘！是時候喝杯水休息一下了。',
      breakCompletedMsg: '休息時間結束！準備好繼續專注了嗎？',
    },
  },
  en: {
    label: 'English',
    strings: {
      appName: 'PomoFlow',
      pomodoro: 'Pomodoro',
      shortBreak: 'Short Break',
      longBreak: 'Long Break',
      start: 'Start Focus',
      pause: 'Pause Session',
      skip: 'Skip Session',
      reset: 'Reset Timer',
      todoTitle: "Today's Tasks",
      todoPlaceholder: 'Add a new task to work on...',
      addTask: 'Add Task',
      activeTarget: 'Active Focus Target',
      noActiveTarget: 'Click target icon on a task to state focus target',
      setTarget: 'Set as Active Target',
      completed: 'Completed',
      totalCompleted: 'Total Done',
      tomatoCount: 'Pomodoros',
      deleteTask: 'Delete Task',
      noTasks: 'No tasks yet. Add one and set it as focus target to start!',
      statsTitle: 'Focus Analytics',
      totalFocusTimeLabel: 'Focus Time',
      totalSessionsLabel: 'Pomodoros Complete',
      weeklyTrendTitle: 'Weekly Focus Trend',
      weeklyTrendDesc: 'Your focus duration trend for the past 7 days',
      resetStats: 'Reset Local Data',
      resetStatsConfirm: 'Are you sure you want to completely clear all tasks, timer settings, and analytics history?',
      minutesUnit: 'min',
      sessionsUnit: 'sessions',
      noStatsData: 'No focus sessions completed this week yet.',
      settingsTitle: 'Timer Preferences',
      pomodoroTime: 'Pomodoro Duration (min)',
      shortBreakTime: 'Short Break Duration (min)',
      longBreakTime: 'Long Break Duration (min)',
      autoStartBreaksLabel: 'Auto-start Break after Pomodoro',
      autoStartPomodorosLabel: 'Auto-start Pomodoro after Break',
      soundEffects: 'Synthesized Sounds (Web Audio API)',
      tickTockLabel: 'Metronome (Tick-Tock) during focus',
      alarmSoundLabel: 'Alarm Sound Theme',
      alarmDigital: 'Retro Digital Alarm',
      alarmCrystal: 'Crystal Bell Chime',
      alarmZen: 'Zen Bowl Gong',
      alarmBirds: 'Birds Chirping Atmosphere',
      alarmVolume: 'Alarm Sound Volume',
      visualTheme: 'Visual Glow Theme',
      languageLabel: 'Application Language',
      saveSettings: 'Save & Apply',
      restoreDefaults: 'Restore Default Settings',
      themeSunsetRed: 'Sunset Red',
      themeDeepBlue: 'Deep Blue',
      themeForestGreen: 'Forest Green',
      themeCozyAmber: 'Cozy Amber',
      sessionCompletedTitle: 'Time is Up!',
      pomodoroCompletedMsg: 'Pomodoro session complete! Excellent work. Time for a short break.',
      breakCompletedMsg: 'Break ended! Ready to immerse yourself again?',
    },
  },
};

export const THEME_CLASSES: Record<SelectedTheme, {
  primaryBg: string;
  bgColor: string;
  navActiveBg: string;
  accentText: string;
  buttonColorBefore: string;
  glowColor: string;
  glowFilter: string;
  progressBarColor: string;
  mutedBg: string;
  borderColor: string;
  themePresetName: string;
}> = {
  'sunset-red': {
    primaryBg: 'bg-red-500 hover:bg-red-600 focus:ring-red-400',
    bgColor: 'from-zinc-950 via-zinc-900 to-red-950/20',
    navActiveBg: 'bg-red-500/10 text-red-400 border border-red-500/30',
    accentText: 'text-red-400',
    buttonColorBefore: 'bg-red-500 shadow-lg shadow-red-500/40',
    glowColor: 'shadow-red-500/50',
    glowFilter: 'rgba(239, 68, 68, 0.4)',
    progressBarColor: 'stroke-red-500',
    mutedBg: 'bg-red-950/10 text-red-300 border-red-500/20',
    borderColor: 'border-red-500/20 hover:border-red-500/40',
    themePresetName: 'Sunset Red',
  },
  'deep-blue': {
    primaryBg: 'bg-cyan-500 hover:bg-cyan-600 focus:ring-cyan-400',
    bgColor: 'from-zinc-950 via-zinc-900 to-cyan-950/20',
    navActiveBg: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
    accentText: 'text-cyan-400',
    buttonColorBefore: 'bg-cyan-500 shadow-lg shadow-cyan-500/40',
    glowColor: 'shadow-cyan-500/50',
    glowFilter: 'rgba(6, 182, 212, 0.4)',
    progressBarColor: 'stroke-cyan-500',
    mutedBg: 'bg-cyan-950/10 text-cyan-300 border-cyan-500/20',
    borderColor: 'border-cyan-500/20 hover:border-cyan-500/40',
    themePresetName: 'Deep Blue',
  },
  'forest-green': {
    primaryBg: 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-400',
    bgColor: 'from-zinc-950 via-zinc-900 to-emerald-950/20',
    navActiveBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    accentText: 'text-emerald-400',
    buttonColorBefore: 'bg-emerald-500 shadow-lg shadow-emerald-500/40',
    glowColor: 'shadow-emerald-500/50',
    glowFilter: 'rgba(16, 185, 129, 0.4)',
    progressBarColor: 'stroke-emerald-500',
    mutedBg: 'bg-emerald-950/10 text-emerald-300 border-emerald-500/20',
    borderColor: 'border-emerald-500/20 hover:border-emerald-500/40',
    themePresetName: 'Forest Green',
  },
  'cozy-amber': {
    primaryBg: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-400',
    bgColor: 'from-zinc-950 via-zinc-900 to-amber-950/20',
    navActiveBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    accentText: 'text-amber-400',
    buttonColorBefore: 'bg-amber-500 shadow-lg shadow-amber-500/40',
    glowColor: 'shadow-amber-500/50',
    glowFilter: 'rgba(245, 158, 11, 0.4)',
    progressBarColor: 'stroke-amber-500',
    mutedBg: 'bg-amber-950/10 text-amber-300 border-amber-500/20',
    borderColor: 'border-amber-500/20 hover:border-amber-500/40',
    themePresetName: 'Cozy Amber',
  },
};
