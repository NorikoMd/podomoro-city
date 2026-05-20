import { useState, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Check, 
  Circle, 
  Target, 
  Award, 
  ClipboardList 
} from 'lucide-react';
import { 
  Task, 
  Settings, 
  LANGUAGES, 
  THEME_CLASSES, 
  TranslationStrings 
} from '../types';

interface TodoListProps {
  tasks: Task[];
  activeTaskId: string | null;
  settings: Settings;
  onAddTask: (title: string) => void;
  onDeleteTask: (id: string) => void;
  onToggleTask: (id: string) => void;
  onSetActiveTask: (id: string | null) => void;
}

export default function TodoList({
  tasks,
  activeTaskId,
  settings,
  onAddTask,
  onDeleteTask,
  onToggleTask,
  onSetActiveTask,
}: TodoListProps) {
  const [taskText, setTaskText] = useState('');
  const currentLang = settings.language;
  const t: TranslationStrings = LANGUAGES[currentLang].strings;
  const themeClass = THEME_CLASSES[settings.theme];

  const handleAdd = () => {
    if (!taskText.trim()) return;
    onAddTask(taskText.trim());
    setTaskText('');
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  const activeTask = tasks.find(t => t.id === activeTaskId);

  return (
    <div 
      className="bg-zinc-900/60 backdrop-blur-md rounded-3xl border border-zinc-800/80 p-6 md:p-8 flex flex-col h-full shadow-xl"
      id="todo-list-section"
    >
      {/* Target focus banner if active */}
      <div className="mb-6 space-y-2">
        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block">
          🎯 {t.activeTarget}
        </label>
        {activeTask ? (
          <div className={`p-4 rounded-2xl bg-zinc-950/60 border ${themeClass.borderColor} flex items-center justify-between shadow-inner`}>
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${settings.theme === 'sunset-red' ? 'bg-red-400' : settings.theme === 'deep-blue' ? 'bg-cyan-400' : settings.theme === 'forest-green' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${settings.theme === 'sunset-red' ? 'bg-red-500' : settings.theme === 'deep-blue' ? 'bg-cyan-500' : settings.theme === 'forest-green' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              </span>
              <p className="text-sm font-sans font-semibold text-white line-clamp-1">
                {activeTask.title}
              </p>
            </div>
            
            <button
              id="btn-clear-active-target"
              onClick={() => onSetActiveTask(null)}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-300 px-3 py-1 bg-zinc-805 rounded-lg border border-zinc-800 hover:bg-zinc-800 transition"
            >
              Lepas
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-zinc-950/20 border border-zinc-850 text-center py-4 text-xs text-zinc-500 italic">
            {t.noActiveTarget}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className={`w-5 h-5 ${themeClass.accentText}`} />
        <h2 className="text-lg font-sans font-semibold text-white tracking-tight">
          {t.todoTitle}
        </h2>
        <span className="text-xs bg-zinc-800 px-2.5 py-0.5 text-zinc-400 font-bold rounded-full font-mono">
          {tasks.filter(t => !t.completed).length}
        </span>
      </div>

      {/* Input row */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          id="input-new-todo"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={t.todoPlaceholder}
          className="flex-1 bg-zinc-950/40 border border-zinc-800 focus:border-zinc-700 hover:border-zinc-850 px-4 py-3 rounded-2xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-zinc-650 transition placeholder-zinc-650"
        />
        <button
          onClick={handleAdd}
          id="btn-add-todo"
          className={`p-3 rounded-2xl shrink-0 text-zinc-950 transition-all font-semibold shadow-md active:scale-95 flex items-center justify-center ${themeClass.primaryBg}`}
          title={t.addTask}
        >
          <Plus className="w-5 h-5 pointer-events-none" />
        </button>
      </div>

      {/* Checklist items container */}
      <div className="flex-1 overflow-y-auto max-h-[360px] pr-1 space-y-2.5 custom-scrollbar">
        <AnimatePresence initial={false}>
          {tasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 text-zinc-500 flex flex-col items-center justify-center gap-2"
              id="empty-todos-state"
            >
              <ClipboardList className="w-10 h-10 text-zinc-700 stroke-[1.5]" />
              <p className="text-xs font-sans max-w-[220px] mx-auto text-zinc-500">
                {t.noTasks}
              </p>
            </motion.div>
          ) : (
            tasks.map((task) => {
              const isSelectedTarget = task.id === activeTaskId;
              return (
                <motion.div
                  key={task.id}
                  id={`todo-item-${task.id}`}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                  layout
                  className={`group p-4 bg-zinc-950/35 hover:bg-zinc-950/60 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isSelectedTarget 
                      ? `border-${settings.theme === 'sunset-red' ? 'red' : settings.theme === 'deep-blue' ? 'cyan' : settings.theme === 'forest-green' ? 'emerald' : 'amber'}-500/50 bg-zinc-950/80 shadow-md`
                      : 'border-zinc-800/40 hover:border-zinc-800'
                  }`}
                  style={{
                    borderColor: isSelectedTarget ? themeClass.accentText.split(' ')[0] : undefined
                  }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Tick Checkbox */}
                    <button
                      onClick={() => onToggleTask(task.id)}
                      id={`btn-checkbox-${task.id}`}
                      className="shrink-0 transition-transform active:scale-90"
                    >
                      {task.completed ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-zinc-950">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-500 hover:text-zinc-400" />
                      )}
                    </button>

                    {/* Task Title & completed state */}
                    <div className="flex flex-col min-w-0">
                      <span 
                        className={`text-sm font-sans font-medium transition-all truncate ${
                          task.completed 
                            ? 'text-zinc-500 line-through' 
                            : 'text-zinc-200'
                        }`}
                      >
                        {task.title}
                      </span>
                      
                      {/* Metronome Tomato Badge count */}
                      {task.pomodoroCount > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-zinc-400">
                          <span className="inline-block" role="img" aria-label="pomodoro count">🍅</span>
                          <span className="font-semibold text-zinc-300 font-mono">
                            × {task.pomodoroCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions (Target Focus, Delete) */}
                  <div className="flex items-center gap-1.5 shrink-0 opacity-100 sm:opacity-40 group-hover:opacity-100 transition-opacity">
                    {!task.completed && (
                      <button
                        onClick={() => onSetActiveTask(isSelectedTarget ? null : task.id)}
                        id={`btn-target-task-${task.id}`}
                        title={t.setTarget}
                        className={`p-2 rounded-xl border transition-all ${
                          isSelectedTarget
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-750'
                        }`}
                      >
                        <Target className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteTask(task.id)}
                      id={`btn-delete-task-${task.id}`}
                      title={t.deleteTask}
                      className="p-2 rounded-xl bg-zinc-900/40 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 border border-zinc-800 hover:border-red-500/20 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
