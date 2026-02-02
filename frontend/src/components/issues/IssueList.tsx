import React, { useState } from 'react';
import type { Issue } from '../../types/database';
import { IssueCard } from './IssueCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { classNames } from '../../utils/classNames';

interface IssueListProps {
  issues: (Issue & {
    reported_by_profile?: { id: string; full_name: string; email: string; avatar_url?: string };
    suggested_assignee_profile?: { id: string; full_name: string; email: string; avatar_url?: string };
    assigned_to_profile?: { id: string; full_name: string; email: string; avatar_url?: string };
  })[];
  loading?: boolean;
  onIssueClick?: (issue: Issue) => void;
  showActions?: boolean;
  onAssign?: (issue: Issue) => void;
  emptyMessage?: string;
}

export const IssueList: React.FC<IssueListProps> = ({
  issues,
  loading = false,
  onIssueClick,
  showActions = false,
  onAssign,
  emptyMessage = 'Henüz sorun bildirimi yok',
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'assigned' | 'resolved'>('all');

  const filteredIssues = issues.filter((issue) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return issue.status === 'pending_assignment';
    if (filter === 'assigned') return issue.status === 'assigned' || issue.status === 'in_progress';
    if (filter === 'resolved') return issue.status === 'resolved' || issue.status === 'closed';
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" message="Sorunlar yükleniyor..." />
      </div>
    );
  }

  const tabClass = (active: boolean) => classNames(
    'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
    active
      ? 'border-blue-500 text-blue-400'
      : 'border-transparent text-slate-500 hover:text-slate-300'
  );

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex space-x-1 border-b border-white/10 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setFilter('all')}
          className={tabClass(filter === 'all')}
        >
          Tümü ({issues.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={tabClass(filter === 'pending')}
        >
          Bekleyen ({issues.filter((i) => i.status === 'pending_assignment').length})
        </button>
        <button
          onClick={() => setFilter('assigned')}
          className={tabClass(filter === 'assigned')}
        >
          Atandı ({issues.filter((i) => i.status === 'assigned' || i.status === 'in_progress').length})
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={tabClass(filter === 'resolved')}
        >
          Çözüldü ({issues.filter((i) => i.status === 'resolved' || i.status === 'closed').length})
        </button>
      </div>

      {/* Issue List */}
      {filteredIssues.length === 0 ? (
        <div className="glass-card p-10 rounded-xl text-center">
          <svg
            className="mx-auto h-12 w-12 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-3 text-base font-medium text-white">{emptyMessage}</h3>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredIssues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onClick={onIssueClick ? () => onIssueClick(issue) : undefined}
              showActions={showActions}
              onAssign={onAssign}
            />
          ))}
        </div>
      )}
    </div>
  );
};
