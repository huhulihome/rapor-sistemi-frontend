import { Card } from '../common/Card';
import { classNames } from '../../utils/classNames';

export interface ActivityItem {
  id: string;
  type: 'task_created' | 'task_completed' | 'issue_reported' | 'issue_assigned';
  title: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

interface RecentActivityProps {
  activities: ActivityItem[];
  maxItems?: number;
}

export const RecentActivity = ({ activities, maxItems = 10 }: RecentActivityProps) => {
  const displayedActivities = activities.slice(0, maxItems);

  const getActivityIcon = (type: ActivityItem['type']) => {
    const iconClasses = 'h-9 w-9 rounded-xl flex items-center justify-center text-white text-sm font-semibold shadow-lg';

    switch (type) {
      case 'task_created':
        return <div className={classNames(iconClasses, 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30')}>+</div>;
      case 'task_completed':
        return <div className={classNames(iconClasses, 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/30')}>✓</div>;
      case 'issue_reported':
        return <div className={classNames(iconClasses, 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/30')}>!</div>;
      case 'issue_assigned':
        return <div className={classNames(iconClasses, 'bg-gradient-to-br from-purple-500 to-violet-600 shadow-purple-500/30')}>→</div>;
      default:
        return <div className={classNames(iconClasses, 'bg-gradient-to-br from-slate-500 to-slate-600')}>•</div>;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Az önce';
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} saat önce`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} gün önce`;

    return date.toLocaleDateString('tr-TR');
  };

  return (
    <Card title="Son Aktiviteler" padding="none">
      <div className="divide-y divide-white/5">
        {displayedActivities.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            Henüz aktivite bulunmuyor
          </div>
        ) : (
          displayedActivities.map((activity, index) => (
            <div
              key={activity.id}
              className="p-4 hover:bg-white/[0.02] transition-colors animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">
                    {activity.title}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    {activity.description}
                  </p>
                  <div className="flex items-center mt-2 space-x-2">
                    {activity.user && (
                      <span className="text-xs text-slate-400">
                        {activity.user.name}
                      </span>
                    )}
                    <span className="text-xs text-slate-500">
                      • {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {activities.length > maxItems && (
        <div className="p-4 border-t border-white/5 text-center">
          <button className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
            Tümünü Görüntüle ({activities.length - maxItems} daha)
          </button>
        </div>
      )}
    </Card>
  );
};
