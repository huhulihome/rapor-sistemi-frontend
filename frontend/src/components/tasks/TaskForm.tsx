import React, { useState, useEffect } from 'react';
import type { CreateTaskRequest } from '../../types/api';
import type { Profile } from '../../types/database';
import { supabase } from '../../services/supabase';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

interface TaskFormProps {
  onSubmit: (task: CreateTaskRequest & RecurringFields) => void;
  onCancel: () => void;
  initialData?: Partial<CreateTaskRequest>;
  isLoading?: boolean;
}

interface RecurringFields {
  is_recurring?: boolean;
  recurrence_pattern?: string;
  recurrence_interval?: number;
  recurrence_end_date?: string;
  task_type?: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
}) => {
  const { user, isAdmin } = useAuth();

  const [formData, setFormData] = useState<CreateTaskRequest & RecurringFields>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || 'one_time',
    priority: initialData?.priority || 'medium',
    assigned_to: initialData?.assigned_to || '',
    due_date: initialData?.due_date || '',
    start_time: initialData?.start_time || '',
    end_time: initialData?.end_time || '',
    estimated_hours: initialData?.estimated_hours || undefined,
    tags: initialData?.tags || [],
    is_recurring: false,
    recurrence_pattern: 'weekly',
    recurrence_interval: 1,
    task_type: 'one_time',
  });

  const [employees, setEmployees] = useState<Profile[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Çalışanlar için otomatik olarak kendilerini ata
  useEffect(() => {
    if (!isAdmin && user?.id && !formData.assigned_to) {
      setFormData(prev => ({ ...prev, assigned_to: user.id }));
    }
  }, [isAdmin, user?.id, formData.assigned_to]);

  // Sync task_type with category
  useEffect(() => {
    if (formData.category === 'routine') {
      setFormData(prev => ({ ...prev, task_type: 'routine', is_recurring: true }));
    } else if (formData.category === 'project') {
      setFormData(prev => ({ ...prev, task_type: 'project', is_recurring: false }));
    } else {
      setFormData(prev => ({ ...prev, task_type: 'one_time', is_recurring: false }));
    }
  }, [formData.category]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .order('full_name');

      if (error) throw error;
      setEmployees((data || []) as Profile[]);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      handleChange('tags', [...(formData.tags || []), tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleChange('tags', formData.tags?.filter((tag) => tag !== tagToRemove) || []);
  };

  const inputClass = "w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors";
  const labelClass = "block text-sm font-medium text-slate-300 mb-2";
  const selectClass = "w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className={labelClass}>Görev Başlığı *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Görev başlığını girin"
          className={inputClass}
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Açıklama</label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Görev açıklamasını girin"
          rows={4}
          className={inputClass}
        />
      </div>

      {/* Category & Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Görev Tipi *</label>
          <select
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className={selectClass}
            required
          >
            <option value="one_time">📌 Tek Seferlik</option>
            <option value="routine">🔄 Rutin (Tekrarlayan)</option>
            <option value="project">📁 Proje</option>
            <option value="issue_resolution">🔧 Sorun Çözümü</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Öncelik *</label>
          <select
            value={formData.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            className={selectClass}
            required
          >
            <option value="low">🟢 Düşük</option>
            <option value="medium">🟡 Orta</option>
            <option value="high">🟠 Yüksek</option>
            <option value="critical">🔴 Kritik</option>
          </select>
        </div>
      </div>

      {/* Recurrence Options - Only show for routine tasks */}
      {formData.category === 'routine' && (
        <div className="glass-card p-4 border border-blue-500/30 rounded-xl space-y-4">
          <div className="flex items-center gap-2 text-blue-400">
            <ArrowPathIcon className="w-5 h-5" />
            <span className="font-medium">Tekrarlama Ayarları</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Tekrar Sıklığı</label>
              <select
                value={formData.recurrence_pattern}
                onChange={(e) => handleChange('recurrence_pattern', e.target.value)}
                className={selectClass}
              >
                <option value="daily">Her Gün</option>
                <option value="weekly">Her Hafta</option>
                <option value="biweekly">2 Haftada Bir</option>
                <option value="monthly">Her Ay</option>
                <option value="yearly">Her Yıl</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Tekrar Aralığı</label>
              <input
                type="number"
                min="1"
                max="12"
                value={formData.recurrence_interval}
                onChange={(e) => handleChange('recurrence_interval', parseInt(e.target.value) || 1)}
                className={inputClass}
              />
              <p className="text-xs text-slate-500 mt-1">
                Örn: 2 = her 2 {formData.recurrence_pattern === 'daily' ? 'günde' :
                  formData.recurrence_pattern === 'weekly' ? 'haftada' : 'ayda'} bir
              </p>
            </div>

            <div>
              <label className={labelClass}>Bitiş Tarihi (Opsiyonel)</label>
              <input
                type="date"
                value={formData.recurrence_end_date || ''}
                onChange={(e) => handleChange('recurrence_end_date', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      )}

      {/* Assigned To & Due Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Atanan Kişi - Sadece admin görür, çalışan kendine atanır */}
        {isAdmin ? (
          <div>
            <label className={labelClass}>Atanan Kişi</label>
            <select
              value={formData.assigned_to}
              onChange={(e) => handleChange('assigned_to', e.target.value)}
              className={selectClass}
            >
              <option value="">Seçiniz...</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.full_name} ({employee.email})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className={labelClass}>Atanan Kişi</label>
            <div className="w-full bg-slate-700/50 border border-white/10 rounded-lg px-4 py-3 text-slate-300">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Kendinize atanacak
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Başkasına iş atamak için Sorunlar sayfasından bildirim yapın
            </p>
          </div>
        )}

        <div>
          <label className={labelClass}>
            {formData.category === 'routine' ? 'İlk Bitiş Tarihi' : 'Bitiş Tarihi'}
          </label>
          <input
            type="date"
            value={formData.due_date}
            onChange={(e) => handleChange('due_date', e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Time fields - Especially useful for routine tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            Başlangıç Saati
            <span className="text-slate-500 font-normal ml-1">(Opsiyonel)</span>
          </label>
          <input
            type="time"
            value={formData.start_time || ''}
            onChange={(e) => handleChange('start_time', e.target.value)}
            className={inputClass}
          />
          <p className="text-xs text-slate-500 mt-1">
            İş hangi saatte başlamalı
          </p>
        </div>

        <div>
          <label className={labelClass}>
            Bitiş Saati
            <span className="text-slate-500 font-normal ml-1">(Opsiyonel)</span>
          </label>
          <input
            type="time"
            value={formData.end_time || ''}
            onChange={(e) => handleChange('end_time', e.target.value)}
            className={inputClass}
          />
          <p className="text-xs text-slate-500 mt-1">
            {formData.category === 'routine'
              ? 'Bu saate kadar tamamlanmalı - sonra gecikmeye düşer'
              : 'İş en geç bu saatte bitmeli'}
          </p>
        </div>
      </div>

      {/* Estimated Hours */}
      <div>
        <label className={labelClass}>Tahmini Süre (saat)</label>
        <input
          type="number"
          value={formData.estimated_hours || ''}
          onChange={(e) => handleChange('estimated_hours', parseInt(e.target.value) || 0)}
          placeholder="Tahmini süreyi girin"
          min="0"
          className={inputClass}
        />
      </div>

      {/* Tags */}
      <div>
        <label className={labelClass}>Etiketler</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            placeholder="Etiket ekle"
            className={inputClass}
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            Ekle
          </button>
        </div>
        {formData.tags && formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-500/20 text-blue-400"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-blue-300 hover:text-white"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-lg hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </form>
  );
};
