import { useState } from 'react';
import { Layout } from '../components/common/Layout';
import { AdvancedFilters, type FilterCriteria, type FilterPreset } from '../components/dashboard/AdvancedFilters';
import { ExportMenu } from '../components/dashboard/ExportMenu';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

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

  if (filters.createdBy) {
    params.append('created_by', filters.createdBy);
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

  let tasks = result.data || [];

  if (filters.dateRange?.start || filters.dateRange?.end) {
    tasks = tasks.filter((task: any) => {
      const taskDate = new Date(task.created_at);

      if (filters.dateRange?.start) {
        const startDate = new Date(filters.dateRange.start);
        if (taskDate < startDate) return false;
      }

      if (filters.dateRange?.end) {
        const endDate = new Date(filters.dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        if (taskDate > endDate) return false;
      }

      return true;
    });
  }

  return tasks;
};

const priorityColors: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400',
  high: 'bg-orange-500/20 text-orange-400',
  medium: 'bg-amber-500/20 text-amber-400',
  low: 'bg-slate-500/20 text-slate-400',
};

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-500/20 text-emerald-400',
  in_progress: 'bg-blue-500/20 text-blue-400',
  blocked: 'bg-red-500/20 text-red-400',
  not_started: 'bg-slate-500/20 text-slate-400',
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

export const Analytics = () => {
  const [filters, setFilters] = useState<FilterCriteria>({});
  const [savedPresets, setSavedPresets] = useState<FilterPreset[]>(() => {
    const saved = localStorage.getItem('filterPresets');
    return saved ? JSON.parse(saved) : [];
  });

  const { data: tasks, isLoading, error, refetch } = useQuery({
    queryKey: ['filtered-tasks', filters],
    queryFn: () => fetchFilteredTasks(filters),
    enabled: Object.keys(filters).length > 0,
  });

  const handleApplyFilters = (newFilters: FilterCriteria) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

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

  const handleLoadPreset = (preset: FilterPreset) => {
    setFilters(preset.filters);
  };

  const activeFilterCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof FilterCriteria];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return !!value;
  }).length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Analitik ve Raporlama</h1>
          <p className="mt-1 text-sm text-slate-400">
            Gelişmiş filtreler ile görevleri analiz edin ve raporlayın
          </p>
        </div>

        {/* Advanced Filters */}
        <AdvancedFilters
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          savedPresets={savedPresets}
          onSavePreset={handleSavePreset}
          onLoadPreset={handleLoadPreset}
        />

        {/* Results */}
        {activeFilterCount === 0 ? (
          <div className="glass-card p-6 text-center">
            <p className="text-blue-400">
              Görevleri görüntülemek için yukarıdaki filtrelerden en az birini seçin ve "Filtreleri Uygula" butonuna tıklayın.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="glass-card border-red-500/30 p-6 text-center">
            <p className="text-red-400">Görevler yüklenirken bir hata oluştu.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Results Summary */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Toplam Sonuç</p>
                  <p className="text-2xl font-bold text-white">{tasks?.length || 0}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <ExportMenu tasks={tasks || []} />
                  <button
                    onClick={() => refetch()}
                    className="px-4 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Yenile
                  </button>
                </div>
              </div>
            </div>

            {/* Task List */}
            {tasks && tasks.length > 0 ? (
              <div className="glass-card overflow-hidden">
                <div className="divide-y divide-white/5">
                  {tasks.map((task: any) => (
                    <div key={task.id} className="p-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-white">{task.title}</h3>
                          {task.description && (
                            <p className="mt-1 text-sm text-slate-400">{task.description}</p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority] || priorityColors.low
                              }`}>
                              {priorityLabels[task.priority] || task.priority}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status] || statusColors.not_started
                              }`}>
                              {statusLabels[task.status] || task.status}
                            </span>
                            {task.assigned_to_profile && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                                {task.assigned_to_profile.full_name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 text-sm text-slate-500">
                          {task.due_date && (
                            <p>Bitiş: {new Date(task.due_date).toLocaleDateString('tr-TR')}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="glass-card p-6 text-center">
                <p className="text-slate-400">Seçilen filtrelere uygun görev bulunamadı.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};
