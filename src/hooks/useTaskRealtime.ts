import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import type { Task } from '../types/database';
import type { RealtimeChannel } from '@supabase/supabase-js';

export const useTaskRealtime = (userId?: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel: RealtimeChannel;

    const setupRealtime = async () => {
      try {
        // Initial fetch
        let query = supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });

        if (userId) {
          query = query.or(`assigned_to.eq.${userId},created_by.eq.${userId}`);
        }

        const { data, error } = await query;

        if (error) throw error;
        setTasks(data || []);
        setLoading(false);

        // Setup realtime subscription
        channel = supabase
          .channel('tasks-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'tasks',
              filter: userId ? `assigned_to=eq.${userId}` : undefined,
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
      } catch (error) {
        console.error('Error setting up realtime:', error);
        setLoading(false);
      }
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId]);

  return { tasks, loading, setTasks };
};
