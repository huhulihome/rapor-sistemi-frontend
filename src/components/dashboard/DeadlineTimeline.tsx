import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CalendarDaysIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

interface Task {
    id: string;
    title: string;
    due_date: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: string;
    assigned_to?: string;
    assigned_user?: {
        full_name: string;
    };
}

export const DeadlineTimeline = () => {
    const { user, isAdmin } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUpcomingTasks();
    }, [user, isAdmin]);

    const fetchUpcomingTasks = async () => {
        try {
            const today = new Date();
            const twoWeeksFromNow = new Date(today);
            twoWeeksFromNow.setDate(today.getDate() + 14);

            let query = supabase
                .from('tasks')
                .select(`
          id,
          title,
          due_date,
          priority,
          status,
          assigned_to,
          assigned_user:profiles!tasks_assigned_to_fkey(full_name)
        `)
                .gte('due_date', today.toISOString().split('T')[0])
                .lte('due_date', twoWeeksFromNow.toISOString().split('T')[0])
                .neq('status', 'completed')
                .order('due_date', { ascending: true })
                .limit(10);

            // Non-admins only see their own tasks
            if (!isAdmin && user?.id) {
                query = query.eq('assigned_to', user.id);
            }

            const { data, error } = await query;

            if (error) throw error;
            // Cast to any to handle Supabase join type mismatch
            setTasks((data as any[])?.map(task => ({
                ...task,
                assigned_user: task.assigned_user?.[0] || null
            })) || []);
        } catch (error) {
            console.error('Error fetching upcoming tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysUntil = (dueDate: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getUrgencyColor = (daysUntil: number) => {
        if (daysUntil <= 0) return 'bg-red-500';
        if (daysUntil <= 2) return 'bg-orange-500';
        if (daysUntil <= 5) return 'bg-yellow-500';
        return 'bg-blue-500';
    };

    const getUrgencyBgColor = (daysUntil: number) => {
        if (daysUntil <= 0) return 'bg-red-500/10 border-red-500/30';
        if (daysUntil <= 2) return 'bg-orange-500/10 border-orange-500/30';
        if (daysUntil <= 5) return 'bg-yellow-500/10 border-yellow-500/30';
        return 'bg-blue-500/10 border-blue-500/30';
    };

    const formatDueDate = (dueDate: string) => {
        const date = new Date(dueDate);
        return date.toLocaleDateString('tr-TR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    const priorityColors: Record<string, string> = {
        critical: 'text-red-400',
        high: 'text-orange-400',
        medium: 'text-yellow-400',
        low: 'text-blue-400',
    };

    if (loading) {
        return (
            <div className="glass-card p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-slate-700 rounded w-1/3"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-slate-700 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                        <CalendarDaysIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Yaklaşan Deadline'lar</h3>
                        <p className="text-sm text-slate-400">Sonraki 2 hafta</p>
                    </div>
                </div>
                <Link
                    to="/tasks"
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                    Tümünü Gör →
                </Link>
            </div>

            {tasks.length === 0 ? (
                <div className="text-center py-8">
                    <CalendarDaysIcon className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400">Yaklaşan deadline yok</p>
                    <p className="text-sm text-slate-500 mt-1">Tüm görevler tamamlandı veya ileri tarihlerde</p>
                </div>
            ) : (
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-purple-500 via-pink-500 to-blue-500 rounded-full" />

                    <div className="space-y-4">
                        {tasks.map((task) => {
                            const daysUntil = getDaysUntil(task.due_date);
                            const urgencyColor = getUrgencyColor(daysUntil);
                            const urgencyBgColor = getUrgencyBgColor(daysUntil);

                            return (
                                <Link
                                    key={task.id}
                                    to={`/tasks/${task.id}`}
                                    className={`block relative pl-10 group`}
                                >
                                    {/* Timeline dot */}
                                    <div
                                        className={`absolute left-2.5 top-4 w-3 h-3 rounded-full ${urgencyColor} ring-4 ring-slate-900 group-hover:ring-slate-800 transition-all`}
                                    />

                                    <div className={`p-4 rounded-xl border ${urgencyBgColor} hover:bg-white/5 transition-all`}>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-white font-medium truncate group-hover:text-blue-400 transition-colors">
                                                    {task.title}
                                                </h4>
                                                <div className="flex items-center gap-3 mt-1.5 text-sm">
                                                    <span className="flex items-center gap-1 text-slate-400">
                                                        <ClockIcon className="w-4 h-4" />
                                                        {formatDueDate(task.due_date)}
                                                    </span>
                                                    <span className={`font-medium ${priorityColors[task.priority] || 'text-slate-400'}`}>
                                                        {task.priority === 'critical' ? '⚠️ Kritik' :
                                                            task.priority === 'high' ? 'Yüksek' :
                                                                task.priority === 'medium' ? 'Orta' : 'Düşük'}
                                                    </span>
                                                </div>
                                                {isAdmin && task.assigned_user && (
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {task.assigned_user.full_name}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right shrink-0">
                                                {daysUntil <= 0 ? (
                                                    <div className="flex items-center gap-1 text-red-400">
                                                        <ExclamationTriangleIcon className="w-4 h-4" />
                                                        <span className="text-sm font-semibold">Bugün!</span>
                                                    </div>
                                                ) : daysUntil === 1 ? (
                                                    <span className="text-sm font-semibold text-orange-400">Yarın</span>
                                                ) : (
                                                    <span className="text-sm font-medium text-slate-400">
                                                        {daysUntil} gün
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
