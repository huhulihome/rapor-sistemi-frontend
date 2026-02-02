import React from 'react';

export interface TaskFilterOptions {
  status?: string;
  category?: string;
  priority?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  hideCompleted?: boolean;
  groupByTag?: boolean;
}

interface TaskFiltersProps {
  filters: TaskFilterOptions;
  onFilterChange: (filters: TaskFilterOptions) => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({ filters, onFilterChange }) => {
  const handleChange = (key: keyof TaskFilterOptions, value: string | boolean) => {
    onFilterChange({
      ...filters,
      [key]: value === '' ? undefined : value,
    });
  };

  const selectClass = "w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors";
  const labelClass = "block text-sm font-medium text-slate-300 mb-1.5";
  const toggleClass = "relative inline-flex h-6 w-11 items-center rounded-full transition-colors";
  const toggleDotClass = "inline-block h-4 w-4 transform rounded-full bg-white transition-transform";

  return (
    <div className="glass-card p-5 rounded-xl mb-6">
      {/* Toggle buttons row */}
      <div className="flex flex-wrap items-center gap-4 mb-4 pb-4 border-b border-white/10">
        {/* Hide completed toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <span className="text-sm text-slate-300">Tamamlananları Gizle</span>
          <button
            type="button"
            onClick={() => handleChange('hideCompleted', !filters.hideCompleted)}
            className={`${toggleClass} ${filters.hideCompleted ? 'bg-purple-600' : 'bg-slate-700'}`}
          >
            <span
              className={`${toggleDotClass} ${filters.hideCompleted ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </label>

        {/* Group by tag toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <span className="text-sm text-slate-300">Etiketlere Göre Grupla</span>
          <button
            type="button"
            onClick={() => handleChange('groupByTag', !filters.groupByTag)}
            className={`${toggleClass} ${filters.groupByTag ? 'bg-purple-600' : 'bg-slate-700'}`}
          >
            <span
              className={`${toggleDotClass} ${filters.groupByTag ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </label>
      </div>

      {/* Filter dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className={labelClass}>Durum</label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
            className={selectClass}
          >
            <option value="">Tümü</option>
            <option value="not_started">Başlamadı</option>
            <option value="in_progress">Devam Ediyor</option>
            <option value="completed">Tamamlandı</option>
            <option value="blocked">Engellendi</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Kategori</label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleChange('category', e.target.value)}
            className={selectClass}
          >
            <option value="">Tümü</option>
            <option value="routine">Rutin</option>
            <option value="project">Proje</option>
            <option value="one_time">Tek Seferlik</option>
            <option value="issue_resolution">Sorun Çözümü</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Öncelik</label>
          <select
            value={filters.priority || ''}
            onChange={(e) => handleChange('priority', e.target.value)}
            className={selectClass}
          >
            <option value="">Tümü</option>
            <option value="low">Düşük</option>
            <option value="medium">Orta</option>
            <option value="high">Yüksek</option>
            <option value="critical">Kritik</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Sırala</label>
          <select
            value={filters.sort_by || 'created_at'}
            onChange={(e) => handleChange('sort_by', e.target.value)}
            className={selectClass}
          >
            <option value="created_at">Oluşturma Tarihi</option>
            <option value="updated_at">Güncelleme Tarihi</option>
            <option value="due_date">Bitiş Tarihi</option>
            <option value="priority">Öncelik</option>
            <option value="status">Durum</option>
            <option value="title">Başlık</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Sıralama</label>
          <select
            value={filters.sort_order || 'desc'}
            onChange={(e) => handleChange('sort_order', e.target.value as 'asc' | 'desc')}
            className={selectClass}
          >
            <option value="desc">Azalan</option>
            <option value="asc">Artan</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => onFilterChange({ hideCompleted: true })}
          className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
        >
          Filtreleri Temizle
        </button>
      </div>
    </div>
  );
};
