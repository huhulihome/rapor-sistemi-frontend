import { Card } from '../common/Card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

interface WorkloadData {
  userId: string;
  userName: string;
  email: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  completionRate: number;
}

const fetchUserWorkload = async (): Promise<WorkloadData[]> => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No active session');
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/analytics/user-workload`,
    {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch user workload');
  }

  const result = await response.json();
  return result.data;
};

export const UserWorkloadChart = () => {
  const { isAdmin } = useAuth();

  const { data: workloadData, isLoading, error } = useQuery({
    queryKey: ['user-workload'],
    queryFn: fetchUserWorkload,
    enabled: isAdmin,
    refetchInterval: 60000,
  });

  if (!isAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <Card title="Kullanıcı İş Yükü Dağılımı" padding="md">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="md" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Kullanıcı İş Yükü Dağılımı" padding="md">
        <div className="text-center text-red-400 py-8">
          Grafik yüklenirken bir hata oluştu.
        </div>
      </Card>
    );
  }

  if (!workloadData || workloadData.length === 0) {
    return (
      <Card title="Kullanıcı İş Yükü Dağılımı" padding="md">
        <div className="text-center text-slate-400 py-8">
          Henüz kullanıcı verisi bulunmuyor.
        </div>
      </Card>
    );
  }

  const sortedData = [...workloadData].sort((a, b) => b.totalTasks - a.totalTasks);
  const maxTasks = Math.max(...sortedData.map(d => d.totalTasks), 1);

  return (
    <Card title="Kullanıcı İş Yükü Dağılımı" padding="md">
      <div className="space-y-4">
        {/* User workload bars */}
        <div className="space-y-3">
          {sortedData.map((user) => (
            <div key={user.userId} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-white truncate max-w-[200px]">
                  {user.userName}
                </span>
                <span className="text-slate-400">
                  {user.totalTasks} görev
                </span>
              </div>

              <div className="relative h-8 bg-slate-700/50 rounded-lg overflow-hidden">
                {/* Completed tasks */}
                <div
                  className="absolute left-0 top-0 h-full bg-emerald-500/80 transition-all"
                  style={{ width: `${(user.completedTasks / maxTasks) * 100}%` }}
                />

                {/* In-progress tasks */}
                <div
                  className="absolute top-0 h-full bg-blue-500/80 transition-all"
                  style={{
                    left: `${(user.completedTasks / maxTasks) * 100}%`,
                    width: `${(user.inProgressTasks / maxTasks) * 100}%`
                  }}
                />

                {/* Completion rate label */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-white drop-shadow">
                    {user.completionRate}% tamamlandı
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 text-sm pt-4 border-t border-white/10">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-emerald-500 rounded mr-2" />
            <span className="text-slate-300">Tamamlanan</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded mr-2" />
            <span className="text-slate-300">Devam Eden</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-slate-700/50 rounded mr-2" />
            <span className="text-slate-300">Diğer</span>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {sortedData.length}
            </p>
            <p className="text-sm text-slate-400">Kullanıcı</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">
              {sortedData.reduce((sum, d) => sum + d.totalTasks, 0)}
            </p>
            <p className="text-sm text-slate-400">Toplam Görev</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {Math.round(
                sortedData.reduce((sum, d) => sum + d.completionRate, 0) / sortedData.length
              )}%
            </p>
            <p className="text-sm text-slate-400">Ort. Tamamlama</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
