import React from 'react';
import type { Issue } from '../../types/database';
import { classNames } from '../../utils/classNames';

interface IssueCardProps {
  issue: Issue & {
    reported_by_profile?: { id: string; full_name: string; email: string; avatar_url?: string };
    suggested_assignee_profile?: { id: string; full_name: string; email: string; avatar_url?: string };
    assigned_to_profile?: { id: string; full_name: string; email: string; avatar_url?: string };
  };
  onClick?: () => void;
  showActions?: boolean;
  onAssign?: (issue: Issue) => void;
}

const priorityColors = {
  low: 'bg-slate-500/20 text-slate-300',
  medium: 'bg-blue-500/20 text-blue-400',
  high: 'bg-orange-500/20 text-orange-400',
  critical: 'bg-red-500/20 text-red-400',
};

const priorityLabels = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
  critical: 'Kritik',
};

const statusColors = {
  pending_assignment: 'bg-amber-500/20 text-amber-400',
  assigned: 'bg-blue-500/20 text-blue-400',
  in_progress: 'bg-purple-500/20 text-purple-400',
  resolved: 'bg-emerald-500/20 text-emerald-400',
  closed: 'bg-slate-500/20 text-slate-300',
};

const statusLabels = {
  pending_assignment: 'Atama Bekliyor',
  assigned: 'Atandı',
  in_progress: 'Devam Ediyor',
  resolved: 'Çözüldü',
  closed: 'Kapatıldı',
};

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  onClick,
  showActions = false,
  onAssign,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={classNames(
        'glass-card p-5 rounded-xl transition-all duration-300',
        'hover:scale-[1.01] hover:shadow-xl hover:shadow-red-500/5',
        onClick ? 'cursor-pointer' : ''
      )}
      onClick={onClick}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">{issue.title}</h3>
            <p className="text-sm text-slate-400 line-clamp-2">{issue.description}</p>
          </div>
          <div className="flex flex-col items-end space-y-2 ml-4">
            <span
              className={classNames(
                'px-2.5 py-1 text-xs font-medium rounded-full',
                priorityColors[issue.priority]
              )}
            >
              {priorityLabels[issue.priority]}
            </span>
            <span
              className={classNames(
                'px-2.5 py-1 text-xs font-medium rounded-full',
                statusColors[issue.status]
              )}
            >
              {statusLabels[issue.status]}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-slate-500">Bildiren:</span>
            <span className="ml-2 font-medium text-white">
              {issue.reported_by_profile?.full_name || 'Bilinmiyor'}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Önerilen Kişi:</span>
            <span className="ml-2 font-medium text-white">
              {issue.suggested_assignee_profile?.full_name || 'Bilinmiyor'}
            </span>
          </div>
          {issue.assigned_to_profile && (
            <div>
              <span className="text-slate-500">Atanan:</span>
              <span className="ml-2 font-medium text-emerald-400">
                {issue.assigned_to_profile.full_name}
              </span>
            </div>
          )}
          <div>
            <span className="text-slate-500">Oluşturulma:</span>
            <span className="ml-2 text-slate-300">{formatDate(issue.created_at)}</span>
          </div>
        </div>

        {/* Actions */}
        {showActions && issue.status === 'pending_assignment' && onAssign && (
          <div className="pt-4 border-t border-white/10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAssign(issue);
              }}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-lg hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
            >
              Göreve Ata
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
