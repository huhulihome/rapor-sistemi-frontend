import { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface FilterCriteria {
  dateRange?: {
    start: string;
    end: string;
  };
  status?: string[];
  priority?: string[];
  category?: string[];
  assignedTo?: string;
  createdBy?: string;
}

interface AdvancedFiltersProps {
  onApplyFilters: (filters: FilterCriteria) => void;
  onClearFilters: () => void;
  savedPresets?: FilterPreset[];
  onSavePreset?: (name: string, filters: FilterCriteria) => void;
  onLoadPreset?: (preset: FilterPreset) => void;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: FilterCriteria;
}

export const AdvancedFilters = ({
  onApplyFilters,
  onClearFilters,
  savedPresets = [],
  onSavePreset,
  onLoadPreset,
}: AdvancedFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterCriteria>({});
  const [presetName, setPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        start: field === 'start' ? value : prev.dateRange?.start || '',
        end: field === 'end' ? value : prev.dateRange?.end || '',
      },
    }));
  };

  const handleMultiSelectChange = (field: keyof FilterCriteria, value: string) => {
    setFilters(prev => {
      const currentValues = (prev[field] as string[]) || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];

      return {
        ...prev,
        [field]: newValues.length > 0 ? newValues : undefined,
      };
    });
  };

  const handleApply = () => {
    onApplyFilters(filters);
    setIsExpanded(false);
  };

  const handleClear = () => {
    setFilters({});
    onClearFilters();
  };

  const handleSavePreset = () => {
    if (presetName.trim() && onSavePreset) {
      onSavePreset(presetName.trim(), filters);
      setPresetName('');
      setShowSavePreset(false);
    }
  };

  const handleLoadPreset = (preset: FilterPreset) => {
    setFilters(preset.filters);
    if (onLoadPreset) {
      onLoadPreset(preset);
    }
  };

  const activeFilterCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof FilterCriteria];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return !!value;
  }).length;

  return (
    <Card padding="md">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Gelişmiş Filtreler</h3>
            {activeFilterCount > 0 && (
              <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
                {activeFilterCount} aktif
              </span>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            {isExpanded ? 'Gizle' : 'Göster'}
          </button>
        </div>

        {/* Saved Presets */}
        {savedPresets.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Kayıtlı Filtreler:</span>
            {savedPresets.map(preset => (
              <button
                key={preset.id}
                onClick={() => handleLoadPreset(preset)}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>
        )}

        {/* Filter Form */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarih Aralığı
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Başlangıç</label>
                  <input
                    type="date"
                    value={filters.dateRange?.start || ''}
                    onChange={(e) => handleDateRangeChange('start', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Bitiş</label>
                  <input
                    type="date"
                    value={filters.dateRange?.end || ''}
                    onChange={(e) => handleDateRangeChange('end', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durum
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['not_started', 'in_progress', 'completed', 'blocked'].map(status => (
                  <label key={status} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={(filters.status || []).includes(status)}
                      onChange={() => handleMultiSelectChange('status', status)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {status === 'not_started' && 'Başlamadı'}
                      {status === 'in_progress' && 'Devam Ediyor'}
                      {status === 'completed' && 'Tamamlandı'}
                      {status === 'blocked' && 'Engellendi'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Öncelik
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['low', 'medium', 'high', 'critical'].map(priority => (
                  <label key={priority} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={(filters.priority || []).includes(priority)}
                      onChange={() => handleMultiSelectChange('priority', priority)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {priority === 'low' && 'Düşük'}
                      {priority === 'medium' && 'Orta'}
                      {priority === 'high' && 'Yüksek'}
                      {priority === 'critical' && 'Kritik'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['routine', 'project', 'one_time', 'issue_resolution'].map(category => (
                  <label key={category} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={(filters.category || []).includes(category)}
                      onChange={() => handleMultiSelectChange('category', category)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {category === 'routine' && 'Rutin'}
                      {category === 'project' && 'Proje'}
                      {category === 'one_time' && 'Tek Seferlik'}
                      {category === 'issue_resolution' && 'Sorun Çözümü'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <Button
                  variant="primary"
                  onClick={handleApply}
                >
                  Filtreleri Uygula
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleClear}
                >
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  Temizle
                </Button>
              </div>

              {onSavePreset && (
                <button
                  onClick={() => setShowSavePreset(!showSavePreset)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Filtreyi Kaydet
                </button>
              )}
            </div>

            {/* Save Preset Form */}
            {showSavePreset && onSavePreset && (
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="Filtre adı..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <Button
                  variant="primary"
                  onClick={handleSavePreset}
                  disabled={!presetName.trim()}
                >
                  Kaydet
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
