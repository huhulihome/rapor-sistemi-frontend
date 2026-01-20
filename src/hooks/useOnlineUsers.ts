import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export const useOnlineUsers = () => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const setupPresence = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const presenceChannel = supabase.channel('online-users', {
        config: {
          presence: {
            key: session.user.id,
          },
        },
      });

      presenceChannel
        .on('presence', { event: 'sync' }, () => {
          const state = presenceChannel.presenceState();
          const users = new Set<string>();
          
          Object.keys(state).forEach((userId) => {
            users.add(userId);
          });
          
          setOnlineUsers(users);
        })
        .on('presence', { event: 'join' }, ({ key }) => {
          console.log('User joined:', key);
          setOnlineUsers((prev) => new Set([...prev, key]));
        })
        .on('presence', { event: 'leave' }, ({ key }) => {
          console.log('User left:', key);
          setOnlineUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(key);
            return newSet;
          });
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await presenceChannel.track({
              userId: session.user.id,
              onlineAt: new Date().toISOString(),
            });
          }
        });

      setChannel(presenceChannel);
    };

    setupPresence();

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, []);

  const isUserOnline = (userId: string): boolean => {
    return onlineUsers.has(userId);
  };

  return { onlineUsers: Array.from(onlineUsers), isUserOnline };
};
