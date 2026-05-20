import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart2, 
  Clock, 
  CheckCircle,
  HelpCircle,
  Info 
} from 'lucide-react';
import { 
  FocusStats, 
  Settings, 
  LANGUAGES, 
  THEME_CLASSES, 
  TranslationStrings 
} from '../types';

interface StatsDashboardProps {
  stats: FocusStats;
  settings: Settings;
  onClearHistory: () => void;
}

export default function StatsDashboard({ stats, settings, onClearHistory }: StatsDashboardProps) {
  const currentLang = settings.language;
  const t: TranslationStrings = LANGUAGES[currentLang].strings;
  const themeClass = THEME_CLASSES[settings.theme];
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Helper: Get past 7 days (including today)
  const getPastSevenDays = () => {
    const days = [];
    const locale = currentLang === 'id' ? 'id-ID' : currentLang === 'zh' ? 'zh-TW' : 'en-US';
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // key format like YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const key = `${year}-${month}-${day}`;

      // display name
      const label = date.toLocaleDateString(locale, { weekday: 'short' });
      days.push({ key, label, date });
    }
    return days;
  };

  const trailingDays = getPastSevenDays();

  // Aggregate stats per day
  const dailyFocusMinutes = trailingDays.map((day) => {
    // Find sessions that match this day key
    const totalMinutes = stats.history
      .filter((session) => {
        const sessDate = new Date(session.timestamp);
        const y = sessDate.getFullYear();
        const m = String(sessDate.getMonth() + 1).padStart(2, '0');
        const d = String(sessDate.getDate()).padStart(2, '0');
        const sessKey = `${y}-${m}-${d}`;
        return sessKey === day.key && session.mode === 'pomodoro';
      })
      .reduce((sum, session) => sum + session.duration, 0);

    return {
      ...day,
      minutes: totalMinutes,
    };
  });

  const maxMinutes = Math.max(...dailyFocusMinutes.map(d => d.minutes), 25); // At least scale to 25 to avoid zero division & look clean

  return (
    <div 
      className="bg-zinc-900/60 backdrop-blur-md rounded-3xl border border-zinc-800/80 p-6 md:p-8 shadow-xl"
      id="stats-panel-section"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-zinc-800/80 border border-zinc-700/30 ${themeClass.accentText}`}>
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-sans font-semibold text-white tracking-tight">
              {t.statsTitle}
            </h2>
            <p className="text-xs text-zinc-500">
              {t.weeklyTrendDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Aggregate metrics grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Metric 1 */}
        <div className="bg-zinc-900/90 border border-zinc-800/50 rounded-2xl p-4 flex items-center gap-4">
          <div className={`p-3 rounded-xl bg-zinc-800/40 text-${settings.theme === 'sunset-red' ? 'red' : settings.theme === 'deep-blue' ? 'cyan' : settings.theme === 'forest-green' ? 'emerald' : 'amber'}-400`}>
            <Clock className="w-6 h-6" style={{ color: themeClass.accentText.split(' ')[0] } as any} />
          </div>
          <div>
            <span className="text-xs text-zinc-500 block font-medium">{t.totalFocusTimeLabel}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl md:text-2xl font-bold font-mono text-white">
                {stats.totalFocusTime}
              </span>
              <span className="text-xs text-zinc-400 font-sans">{t.minutesUnit}</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-zinc-900/90 border border-zinc-800/50 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-zinc-800/40">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <span className="text-xs text-zinc-500 block font-medium">{t.totalSessionsLabel}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl md:text-2xl font-bold font-mono text-white">
                {stats.totalCompletedSessions}
              </span>
              <span className="text-xs text-zinc-400 font-sans">{t.sessionsUnit}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Daily Focus Trend Chart */}
      <div className="bg-zinc-950/40 border border-zinc-800/40 rounded-2xl p-5" id="stats-chart-card">
        <h3 className="text-xs font-semibold text-zinc-400 mb-4 uppercase tracking-wider">
          {t.weeklyTrendTitle}
        </h3>

        <div className="relative h-44 w-full flex items-end">
          {stats.history.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <div className="text-zinc-600 mb-2">
                <Info className="w-8 h-8 mx-auto stroke-[1.5]" />
              </div>
              <p className="text-xs font-sans text-zinc-500 max-w-xs leading-relaxed">
                {t.noStatsData}
              </p>
            </div>
          ) : null}

          {/* Chart Columns */}
          <div className="w-full h-32 flex justify-between items-end gap-2 px-1">
            {dailyFocusMinutes.map((day, idx) => {
              const barHeightPct = (day.minutes / maxMinutes) * 100;

              return (
                <div 
                  key={day.key}
                  className="flex-1 flex flex-col items-center group relative h-full justify-end"
                  onMouseEnter={() => setHoveredBarIndex(idx)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                >
                  {/* Tooltip on hover */}
                  {hoveredBarIndex === idx && (
                    <div 
                      className={`absolute -top-10 bg-zinc-900 border ${themeClass.borderColor} px-2.5 py-1 rounded-lg text-white font-mono text-[10px] shadow-xl z-20 whitespace-nowrap`}
                      id={`tooltip-bar-${idx}`}
                    >
                      {day.minutes} {t.minutesUnit}
                    </div>
                  )}

                  {/* Animated dynamic bar */}
                  <div className="w-full bg-zinc-800/30 rounded-t-lg overflow-hidden h-full flex items-end">
                    <motion.div
                      id={`bar-graphic-${idx}`}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(barHeightPct, day.minutes > 0 ? 5 : 0)}%` }}
                      transition={{ type: 'spring', damping: 15, stiffness: 100, delay: idx * 0.05 }}
                      className="w-full rounded-t-md transition-all relative"
                      style={{
                        background: settings.theme === 'sunset-red' ? 'linear-gradient(to top, rgba(239,68,68,0.2), rgba(239,68,68,0.85))' :
                                    settings.theme === 'deep-blue' ? 'linear-gradient(to top, rgba(6,182,212,0.2), rgba(6,182,212,0.85))' :
                                    settings.theme === 'forest-green' ? 'linear-gradient(to top, rgba(16,185,129,0.2), rgba(16,185,129,0.85))' :
                                    'linear-gradient(to top, rgba(245,158,11,0.2), rgba(245,158,11,0.85))',
                        boxShadow: hoveredBarIndex === idx ? `0 -4px 14px ${themeClass.glowFilter}` : 'none'
                      }}
                    />
                  </div>

                  {/* Day Label */}
                  <span className="text-[10px] text-zinc-500 font-sans mt-2.5 select-none font-medium text-center">
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-500 font-sans p-1">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-zinc-600" />
          Ubah durasi pengerjaan kapan saja di Gigi Roda atas.
        </span>
      </div>
    </div>
  );
}
