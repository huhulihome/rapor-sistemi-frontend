import { Card } from '../common/Card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface TrendData {
  date: string;
  created: number;
  completed: number;
}

const fetchTaskCompletionTrend = async (days: number = 30): Promise<TrendData[]> => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No active session');
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/analytics/task-completion-trend?days=${days}`,
    {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch task completion trend');
  }

  const result = await response.json();
  return result.data;
};

export const TaskCompletionChart = () => {
  const { data: trendData, isLoading, error } = useQuery({
    queryKey: ['task-completion-trend', 30],
    queryFn: () => fetchTaskCompletionTrend(30),
    refetchInterval: 60000, // Refetch every minute
  });

  if (isLoading) {
    return (
      <Card title="Görev Tamamlama Trendi (Son 30 Gün)" padding="md">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="md" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Görev Tamamlama Trendi (Son 30 Gün)" padding="md">
        <div className="text-center text-red-400 py-8">
          Grafik yüklenirken bir hata oluştu.
        </div>
      </Card>
    );
  }

  if (!trendData || trendData.length === 0) {
    return (
      <Card title="Görev Tamamlama Trendi (Son 30 Gün)" padding="md">
        <div className="text-center text-slate-400 py-8">
          Henüz veri bulunmuyor.
        </div>
      </Card>
    );
  }

  // Calculate max value for scaling
  const maxValue = Math.max(
    ...trendData.map(d => Math.max(d.created, d.completed)),
    1
  );

  // Sample every 3 days for better readability
  const sampledData = trendData.filter((_, index) => index % 3 === 0);

  return (
    <Card title="Görev Tamamlama Trendi (Son 30 Gün)" padding="md">
      <div className="space-y-4">
        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded mr-2" />
            <span className="text-slate-300">Oluşturulan</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-emerald-500 rounded mr-2" />
            <span className="text-slate-300">Tamamlanan</span>
          </div>
        </div>

        {/* Chart */}
        <div className="relative h-64">
          <div className="absolute inset-0 flex items-end justify-between space-x-1">
            {trendData.map((data) => {
              const createdHeight = (data.created / maxValue) * 100;
              const completedHeight = (data.completed / maxValue) * 100;

              return (
                <div key={data.date} className="flex-1 flex flex-col items-center justify-end space-y-1">
                  {/* Created bar */}
                  <div
                    className="w-full bg-blue-500/80 rounded-t hover:bg-blue-400 transition-colors relative group"
                    style={{ height: `${createdHeight}%`, minHeight: data.created > 0 ? '4px' : '0' }}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 shadow-lg">
                      Oluşturulan: {data.created}
                    </div>
                  </div>

                  {/* Completed bar */}
                  <div
                    className="w-full bg-emerald-500/80 rounded-t hover:bg-emerald-400 transition-colors relative group"
                    style={{ height: `${completedHeight}%`, minHeight: data.completed > 0 ? '4px' : '0' }}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 shadow-lg">
                      Tamamlanan: {data.completed}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between text-xs text-slate-500">
          {sampledData.map((data) => (
            <span key={data.date}>
              {new Date(data.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
            </span>
          ))}
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">
              {trendData.reduce((sum, d) => sum + d.created, 0)}
            </p>
            <p className="text-sm text-slate-400">Toplam Oluşturulan</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {trendData.reduce((sum, d) => sum + d.completed, 0)}
            </p>
            <p className="text-sm text-slate-400">Toplam Tamamlanan</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
