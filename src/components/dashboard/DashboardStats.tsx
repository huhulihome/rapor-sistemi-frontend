import { StatsCard } from './StatsCard';
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface DashboardStatsProps {
  stats: {
    totalTasks: number;
    completedTasks: number;
    pendingIssues: number;
    overdueTasks: number;
  };
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  const completionRate = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Toplam Görevler"
        value={stats.totalTasks}
        icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
        color="blue"
      />
      
      <StatsCard
        title="Tamamlanan Görevler"
        value={stats.completedTasks}
        icon={<CheckCircleIcon className="h-6 w-6" />}
        color="green"
        trend={{
          value: completionRate,
          isPositive: completionRate >= 50
        }}
      />
      
      <StatsCard
        title="Bekleyen Sorunlar"
        value={stats.pendingIssues}
        icon={<ExclamationTriangleIcon className="h-6 w-6" />}
        color="yellow"
      />
      
      <StatsCard
        title="Geciken Görevler"
        value={stats.overdueTasks}
        icon={<ClockIcon className="h-6 w-6" />}
        color="red"
      />
    </div>
  );
};
