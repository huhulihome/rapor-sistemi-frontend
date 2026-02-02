import React from 'react';
import type { Task } from '../../types/database';
import { classNames } from '../../utils/classNames';
import { UserCircleIcon } from '@heroicons/react/24/outline';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  showAssignee?: boolean;
}

const priorityColors = {
  low: 'bg-slate-500/20 text-slate-300',
  medium: 'bg-blue-500/20 text-blue-400',
  high: 'bg-orange-500/20 text-orange-400',
  critical: 'bg-red-500/20 text-red-400',
};

const statusColors = {
  not_started: 'bg-slate-500/20 text-slate-300',
  in_progress: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-emerald-500/20 text-emerald-400',
  blocked: 'bg-red-500/20 text-red-400',
};

const categoryLabels = {
  routine: 'Rutin',
  project: 'Proje',
  one_time: 'Tek Seferlik',
  issue_resolution: 'Sorun Çözümü',
};

const statusLabels = {
  not_started: 'Başlamadı',
  in_progress: 'Devam Ediyor',
  completed: 'Tamamlandı',
  blocked: 'Engellendi',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, showAssignee = false }) => {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  // Get assignee name from task
  const assigneeName = (task as any).assigned_user?.full_name ||
    (task as any).profiles?.full_name ||
    null;

  return (
    <div
      onClick={onClick}
      className={classNames(
        'glass-card p-5 rounded-xl cursor-pointer transition-all duration-300',
        'hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10',
        isOverdue ? 'border-l-4 border-l-red-500' : ''
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-white flex-1 pr-2">{task.title}</h3>
        <span
          className={classNames(
            'px-2.5 py-1 text-xs font-medium rounded-full',
            priorityColors[task.priority]
          )}
        >
          {task.priority.toUpperCase()}
        </span>
      </div>

      {task.description && (
        <p className="text-sm text-slate-400 mb-4 line-clamp-2">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <span className={classNames('px-2.5 py-1 text-xs font-medium rounded-full', statusColors[task.status])}>
          {statusLabels[task.status]}
        </span>
        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-400">
          {categoryLabels[task.category]}
        </span>
      </div>

      {/* Assignee display */}
      {showAssignee && assigneeName && (
        <div className="flex items-center gap-2 mb-3 text-sm">
          <UserCircleIcon className="w-4 h-4 text-slate-400" />
          <span className="text-slate-300">{assigneeName}</span>
        </div>
      )}

      {task.progress_percentage > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>İlerleme</span>
            <span className="text-white font-medium">{task.progress_percentage}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${task.progress_percentage}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-500">
        {task.due_date && (
          <div className={classNames(
            'flex items-center gap-1',
            isOverdue ? 'text-red-400 font-medium' : ''
          )}>
            <svg
              className="w-4 h-4 [&>path]:stroke-current"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {new Date(task.due_date).toLocaleDateString('tr-TR')}
            {/* Show time if end_time exists */}
            {(task as any).end_time && (
              <span className="ml-1 text-slate-400">
                {(task as any).end_time.substring(0, 5)}
              </span>
            )}
          </div>
        )}
        {task.tags && task.tags.length > 0 && (
          <div className="flex gap-1">
            {task.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs">
                {tag}
              </span>
            ))}
            {task.tags.length > 2 && (
              <span className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs">
                +{task.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
