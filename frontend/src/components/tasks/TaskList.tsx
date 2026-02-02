import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Task } from '../../types/database';
import { TaskCard } from './TaskCard';
import { TaskFilters, type TaskFilterOptions } from './TaskFilters';
import { supabase } from '../../services/supabase';
import { LoadingSpinner } from '../common/LoadingSpinner';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { TagIcon } from '@heroicons/react/24/outline';

export const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFilterOptions>({
    sort_by: 'created_at',
    sort_order: 'desc',
    hideCompleted: true, // Default: hide completed tasks
    groupByTag: true, // Default: group tasks by tags
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  useEffect(() => {
    // Setup realtime subscription
    let channel: RealtimeChannel;

    const setupRealtime = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      channel = supabase
        .channel('tasks-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks',
          },
          (payload) => {
            console.log('Task change received:', payload);

            if (payload.eventType === 'INSERT') {
              setTasks((prev) => [payload.new as Task, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              setTasks((prev) =>
                prev.map((task) =>
                  task.id === payload.new.id ? (payload.new as Task) : task
                )
              );
            } else if (payload.eventType === 'DELETE') {
              setTasks((prev) =>
                prev.filter((task) => task.id !== payload.old.id)
              );
            }
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Oturum bulunamadı');
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.sort_order) params.append('sort_order', filters.sort_order);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/tasks?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Görevler yüklenemedi');
      }

      const result = await response.json();
      setTasks(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  // Filter completed tasks if hideCompleted is true
  const filteredTasks = filters.hideCompleted
    ? tasks.filter(task => task.status !== 'completed')
    : tasks;

  // Group tasks by tag if enabled
  const groupTasksByTag = (taskList: Task[]) => {
    const groups: Record<string, Task[]> = {};
    const noTagKey = 'Etiketsiz';

    taskList.forEach(task => {
      if (task.tags && task.tags.length > 0) {
        task.tags.forEach(tag => {
          if (!groups[tag]) groups[tag] = [];
          groups[tag].push(task);
        });
      } else {
        if (!groups[noTagKey]) groups[noTagKey] = [];
        groups[noTagKey].push(task);
      }
    });

    // Sort groups by task count (descending)
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" message="Görevler yükleniyor..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 rounded-xl border-red-500/30">
        <p className="font-medium text-red-400">Hata</p>
        <p className="text-sm text-slate-400 mt-1">{error}</p>
        <button
          onClick={fetchTasks}
          className="mt-3 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div>
      <TaskFilters filters={filters} onFilterChange={setFilters} />

      {/* Summary stats */}
      <div className="flex items-center gap-4 mb-4 text-sm text-slate-400">
        <span>{filteredTasks.length} görev</span>
        {filters.hideCompleted && tasks.length !== filteredTasks.length && (
          <span className="text-slate-500">
            ({tasks.length - filteredTasks.length} tamamlanan gizlendi)
          </span>
        )}
      </div>

      {filteredTasks.length === 0 ? (
        <div className="glass-card p-10 rounded-xl text-center">
          <svg
            className="mx-auto h-12 w-12 text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-3 text-base font-medium text-white">Görev bulunamadı</h3>
          <p className="mt-1 text-sm text-slate-400">
            {filters.hideCompleted
              ? 'Aktif görev yok. Tamamlananları görmek için toggle\'ı değiştirin.'
              : 'Seçili filtrelere uygun görev bulunmuyor.'}
          </p>
        </div>
      ) : filters.groupByTag ? (
        // Grouped by tag view
        <div className="space-y-6">
          {groupTasksByTag(filteredTasks).map(([tagName, tagTasks]) => (
            <div key={tagName} className="space-y-3">
              <div className="flex items-center gap-2 sticky top-0 bg-slate-900/80 backdrop-blur-sm py-2 z-10">
                <TagIcon className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">{tagName}</h3>
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                  {tagTasks.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tagTasks.map((task) => (
                  <TaskCard
                    key={`${tagName}-${task.id}`}
                    task={task}
                    onClick={() => handleTaskClick(task.id)}
                    showAssignee={true}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Normal grid view
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => handleTaskClick(task.id)}
              showAssignee={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};
