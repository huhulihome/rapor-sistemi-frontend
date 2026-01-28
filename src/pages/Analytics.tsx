import { useState } from 'react';
import { Layout } from '../components/common/Layout';
import { AdvancedFilters, type FilterCriteria, type FilterPreset } from '../components/dashboard/AdvancedFilters';
import { ExportMenu } from '../components/dashboard/ExportMenu';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  ChartPieIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  LightBulbIcon,
  TagIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface OverviewData {
  summary: {
    totalTasks: number;
    completedTasks: number;
    activeTasks: number;
    overdueTasks: number;
    recurringTasks: number;
    completionRate: number;
    recurringRate: number;
  };
  weekly: {
    completedThisWeek: number;
    createdThisWeek: number;
    productivity: number;
  };
  distributions: {
    byPriority: Record<string, number>;
    byTag: Array<{ name: string; value: number; overdue: number }>;
  };
  problematicTags: Array<{
    tag: string;
    overdueRate: number;
    totalTasks: number;
    overdueTasks: number;
  }>;
  insights: string[];
}

const fetchOverview = async (): Promise<OverviewData> => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No active session');
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/analytics/overview`,
    {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch overview');
  }

  const result = await response.json();
  return result.data;
};

const fetchFilteredTasks = async (filters: FilterCriteria) => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No active session');
  }

  const params = new URLSearchParams();

  if (filters.status && filters.status.length > 0) {
    filters.status.forEach(s => params.append('status', s));
  }

  if (filters.priority && filters.priority.length > 0) {
    filters.priority.forEach(p => params.append('priority', p));
  }

  if (filters.category && filters.category.length > 0) {
    filters.category.forEach(c => params.append('category', c));
  }

  if (filters.assignedTo) {
    params.append('assigned_to', filters.assignedTo);
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/tasks?${params.toString()}`,
    {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch filtered tasks');
  }

  const result = await response.json();
  return result.data || [];
};

const priorityColors: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-amber-500',
  low: 'bg-slate-500',
};

const priorityLabels: Record<string, string> = {
  critical: 'Kritik',
  high: 'Yüksek',
  medium: 'Orta',
  low: 'Düşük',
};

const statusLabels: Record<string, string> = {
  completed: 'Tamamlandı',
  in_progress: 'Devam Ediyor',
  blocked: 'Engellendi',
  not_started: 'Başlamadı',
};

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-500/20 text-emerald-400',
  in_progress: 'bg-blue-500/20 text-blue-400',
  blocked: 'bg-red-500/20 text-red-400',
  not_started: 'bg-slate-500/20 text-slate-400',
};

export const Analytics = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterCriteria>({});
  const [savedPresets, setSavedPresets] = useState<FilterPreset[]>(() => {
    const saved = localStorage.getItem('filterPresets');
    return saved ? JSON.parse(saved) : [];
  });

  // Auto-load overview data
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: fetchOverview,
    refetchInterval: 120000, // Refetch every 2 minutes
  });

  const activeFilterCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof FilterCriteria];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return !!value;
  }).length;

  const { data: filteredTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['filtered-tasks', filters],
    queryFn: () => fetchFilteredTasks(filters),
    enabled: activeFilterCount > 0,
  });

  const handleSavePreset = (name: string, presetFilters: FilterCriteria) => {
    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name,
      filters: presetFilters,
    };
    const updatedPresets = [...savedPresets, newPreset];
    setSavedPresets(updatedPresets);
    localStorage.setItem('filterPresets', JSON.stringify(updatedPresets));
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Analitik ve Raporlama</h1>
            <p className="mt-1 text-sm text-slate-400">
              Otomatik analizler, grafikler ve öneriler
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
          >
            {showFilters ? 'Filtreleri Gizle' : 'Gelişmiş Filtreler'}
          </button>
        </div>

        {/* Auto-load Overview Section */}
        {overviewLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" message="Analizler yükleniyor..." />
          </div>
        ) : overview ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <ChartPieIcon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{overview.summary.totalTasks}</p>
                    <p className="text-xs text-slate-400">Toplam Görev</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <ArrowTrendingUpIcon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{overview.summary.completionRate}%</p>
                    <p className="text-xs text-slate-400">Tamamlama Oranı</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{overview.summary.overdueTasks}</p>
                    <p className="text-xs text-slate-400">Geciken</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <ArrowPathIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{overview.summary.recurringRate}%</p>
                    <p className="text-xs text-slate-400">Rutin Oranı</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Priority Distribution */}
              <div className="glass-card p-5">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <ChartPieIcon className="w-5 h-5 text-purple-400" />
                  Öncelik Dağılımı
                </h3>
                <div className="space-y-3">
                  {Object.entries(overview.distributions.byPriority).map(([priority, count]) => {
                    const total = Object.values(overview.distributions.byPriority).reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={priority} className="flex items-center gap-3">
                        <span className="w-20 text-sm text-slate-300">{priorityLabels[priority]}</span>
                        <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${priorityColors[priority]} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-16 text-sm text-right text-slate-400">{count} ({percentage}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tag Distribution */}
              <div className="glass-card p-5">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TagIcon className="w-5 h-5 text-blue-400" />
                  Etiketlere Göre Dağılım
                </h3>
                <div className="space-y-2">
                  {overview.distributions.byTag.slice(0, 6).map((tag) => (
                    <div key={tag.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                        <span className="text-sm text-white">{tag.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">{tag.value} görev</span>
                        {tag.overdue > 0 && (
                          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
                            {tag.overdue} geciken
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Weekly Stats */}
            <div className="glass-card p-5">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-amber-400" />
                Haftalık Özet
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-slate-800/50 rounded-xl">
                  <p className="text-3xl font-bold text-emerald-400">{overview.weekly.completedThisWeek}</p>
                  <p className="text-sm text-slate-400 mt-1">Bu Hafta Tamamlanan</p>
                </div>
                <div className="text-center p-4 bg-slate-800/50 rounded-xl">
                  <p className="text-3xl font-bold text-blue-400">{overview.weekly.createdThisWeek}</p>
                  <p className="text-sm text-slate-400 mt-1">Bu Hafta Oluşturulan</p>
                </div>
                <div className="text-center p-4 bg-slate-800/50 rounded-xl">
                  <p className="text-3xl font-bold text-purple-400">{overview.weekly.productivity}%</p>
                  <p className="text-sm text-slate-400 mt-1">Verimlilik</p>
                </div>
              </div>
            </div>

            {/* Insights & Recommendations */}
            {overview.insights.length > 0 && (
              <div className="glass-card p-5 border-l-4 border-l-amber-500">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <LightBulbIcon className="w-5 h-5 text-amber-400" />
                  Öneriler ve İçgörüler
                </h3>
                <div className="space-y-3">
                  {overview.insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-sm text-slate-300">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Problematic Tags */}
            {overview.problematicTags.length > 0 && (
              <div className="glass-card p-5 border-l-4 border-l-red-500">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                  Dikkat Gerektiren Alanlar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {overview.problematicTags.map((tag) => (
                    <div key={tag.tag} className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">{tag.tag}</span>
                        <span className="text-red-400 text-sm">{tag.overdueRate}% gecikme</span>
                      </div>
                      <p className="text-sm text-slate-400">
                        {tag.overdueTasks} / {tag.totalTasks} görev gecikmiş
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card p-6 text-center">
            <p className="text-slate-400">Analiz verileri yüklenemedi.</p>
          </div>
        )}

        {/* Advanced Filters (Collapsible) */}
        {showFilters && (
          <div className="border-t border-white/10 pt-6">
            <AdvancedFilters
              onApplyFilters={setFilters}
              onClearFilters={() => setFilters({})}
              savedPresets={savedPresets}
              onSavePreset={handleSavePreset}
              onLoadPreset={(preset) => setFilters(preset.filters)}
            />

            {/* Filtered Results */}
            {activeFilterCount > 0 && (
              <div className="mt-6 space-y-4">
                {tasksLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="md" />
                  </div>
                ) : filteredTasks && filteredTasks.length > 0 ? (
                  <>
                    <div className="glass-card p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Filtre Sonuçları</p>
                        <p className="text-xl font-bold text-white">{filteredTasks.length} görev</p>
                      </div>
                      <ExportMenu tasks={filteredTasks} />
                    </div>

                    <div className="glass-card divide-y divide-white/5">
                      {filteredTasks.map((task: any) => (
                        <div key={task.id} className="p-4 hover:bg-white/5 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-white">{task.title}</h4>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[task.status]}`}>
                                  {statusLabels[task.status]}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs bg-${priorityColors[task.priority]}/20 text-${priorityColors[task.priority].replace('bg-', '')}`}>
                                  {priorityLabels[task.priority]}
                                </span>
                              </div>
                            </div>
                            {task.due_date && (
                              <span className="text-sm text-slate-500">
                                {new Date(task.due_date).toLocaleDateString('tr-TR')}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="glass-card p-6 text-center">
                    <p className="text-slate-400">Seçilen filtrelere uygun görev bulunamadı.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};
