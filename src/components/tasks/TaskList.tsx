import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Task } from '../../types/database';
import { TaskCard } from './TaskCard';
import { TaskFilters, type TaskFilterOptions } from './TaskFilters';
import { supabase } from '../../services/supabase';
import { LoadingSpinner } from '../common/LoadingSpinner';
import type { RealtimeChannel } from '@supabase/supabase-js';

export const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFilterOptions>({
    sort_by: 'created_at',
    sort_order: 'desc',
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

      {tasks.length === 0 ? (
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
            Seçili filtrelere uygun görev bulunmuyor.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => handleTaskClick(task.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
