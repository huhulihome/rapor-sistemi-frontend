import { Card } from '../common/Card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface DashboardMetrics {
  issues: {
    total: number;
    pending: number;
    byPriority: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
  };
}

const fetchDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No active session');
  }

  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analytics/dashboard`, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard metrics');
  }

  const result = await response.json();
  return result.data;
};

export const IssuePriorityChart = () => {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: fetchDashboardMetrics,
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <Card title="Sorun Öncelik Dağılımı" padding="md">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="md" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Sorun Öncelik Dağılımı" padding="md">
        <div className="text-center text-red-400 py-8">
          Grafik yüklenirken bir hata oluştu.
        </div>
      </Card>
    );
  }

  if (!metrics || metrics.issues.total === 0) {
    return (
      <Card title="Sorun Öncelik Dağılımı" padding="md">
        <div className="text-center text-slate-400 py-8">
          Henüz sorun bulunmuyor.
        </div>
      </Card>
    );
  }

  const priorities = [
    { name: 'Kritik', value: metrics.issues.byPriority.critical, color: 'bg-red-500', textColor: 'text-red-400' },
    { name: 'Yüksek', value: metrics.issues.byPriority.high, color: 'bg-orange-500', textColor: 'text-orange-400' },
    { name: 'Orta', value: metrics.issues.byPriority.medium, color: 'bg-amber-500', textColor: 'text-amber-400' },
    { name: 'Düşük', value: metrics.issues.byPriority.low, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
  ];

  const total = metrics.issues.total;

  return (
    <Card title="Sorun Öncelik Dağılımı" padding="md">
      <div className="space-y-6">
        {/* Donut Chart */}
        <div className="flex items-center justify-center">
          <div className="relative w-48 h-48">
            {/* SVG Donut Chart */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {priorities.reduce((acc, priority) => {
                const percentage = total > 0 ? (priority.value / total) * 100 : 0;
                const circumference = 2 * Math.PI * 40;
                const offset = acc.offset;
                const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

                acc.elements.push(
                  <circle
                    key={priority.name}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={priority.color.replace('bg-', '')}
                    strokeWidth="20"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={-offset}
                    className={priority.color}
                  />
                );

                acc.offset += (percentage / 100) * circumference;
                return acc;
              }, { elements: [] as React.ReactElement[], offset: 0 }).elements}
            </svg>

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold text-white">{total}</p>
              <p className="text-sm text-slate-400">Toplam</p>
            </div>
          </div>
        </div>

        {/* Legend with values */}
        <div className="space-y-2">
          {priorities.map((priority) => {
            const percentage = total > 0 ? Math.round((priority.value / total) * 100) : 0;

            return (
              <div key={priority.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded ${priority.color}`} />
                  <span className="text-sm font-medium text-slate-300">{priority.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-slate-400">{priority.value} sorun</span>
                  <span className={`text-sm font-semibold ${priority.textColor}`}>
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="pt-4 border-t border-white/10">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-400">
                {metrics.issues.pending}
              </p>
              <p className="text-sm text-slate-400">Bekleyen</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">
                {metrics.issues.byPriority.critical + metrics.issues.byPriority.high}
              </p>
              <p className="text-sm text-slate-400">Acil</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
