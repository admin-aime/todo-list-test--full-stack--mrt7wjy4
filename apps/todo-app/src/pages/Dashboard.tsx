import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  ListTodo,
  TrendingUp,
  Database,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { fetchTasks, fetchDbStatus } from '../api';
import type { Task, DbStatus } from '../types';

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);

  useEffect(() => {
    fetchTasks()
      .then(setTasks)
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));

    fetchDbStatus()
      .then(setDbStatus)
      .catch(() => setDbStatus(null));
  }, []);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const now = new Date();
  const overdue = tasks.filter(
    (t) => !t.completed && t.dueDate && new Date(t.dueDate) < now
  ).length;
  const highPriority = tasks.filter((t) => !t.completed && t.priority === 'high').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const upcomingTasks = tasks
    .filter((t) => !t.completed && t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  const stats = [
    {
      label: 'Total Tasks',
      value: total,
      icon: ListTodo,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Completed',
      value: completed,
      icon: CheckCircle2,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      label: 'Pending',
      value: pending,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
    },
    {
      label: 'Overdue',
      value: overdue,
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/30',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <Link
          to="/tasks"
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
        >
          View all tasks →
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.bg}`}>
                <s.icon size={18} className={s.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Completion rate & priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Completion Rate</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-10 text-right">
              {completionRate}%
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-red-600 dark:text-red-400" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">High Priority</h2>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{highPriority}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">pending high-priority tasks</p>
        </div>
      </div>

      {/* DB Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Database size={18} className="text-purple-600 dark:text-purple-400" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Database Status</h2>
        </div>
        {dbStatus ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              {dbStatus.connected ? (
                <Wifi size={18} className="text-green-500 flex-shrink-0" />
              ) : (
                <WifiOff size={18} className="text-red-500 flex-shrink-0" />
              )}
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                <p className={`text-sm font-semibold ${dbStatus.connected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {dbStatus.connected ? 'Connected' : dbStatus.previewNoDb ? 'Skipped (preview)' : 'Disconnected'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{dbStatus.type}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Database</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{dbStatus.database}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Host</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{dbStatus.host}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">Unable to fetch database status.</p>
        )}
      </div>

      {/* Upcoming */}
      {upcomingTasks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Upcoming Deadlines</h2>
          </div>
          <div className="space-y-2">
            {upcomingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      task.priority === 'high'
                        ? 'bg-red-500'
                        : task.priority === 'medium'
                        ? 'bg-amber-500'
                        : 'bg-green-500'
                    }`}
                  />
                  <span className="text-sm text-gray-900 dark:text-white truncate">{task.title}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
