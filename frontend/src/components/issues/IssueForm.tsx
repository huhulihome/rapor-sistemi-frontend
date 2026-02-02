import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import type { Profile } from '../../types/database';
import type { CreateIssueRequest } from '../../types/api';

interface IssueFormProps {
  onSubmit: (issue: CreateIssueRequest) => Promise<void>;
  onCancel?: () => void;
}

export const IssueForm: React.FC<IssueFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CreateIssueRequest>({
    title: '',
    description: '',
    priority: 'medium',
    suggested_assignee_id: '',
  });
  const [employees, setEmployees] = useState<Partial<Profile>[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, department')
        .order('full_name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Çalışanlar yüklenirken hata oluştu');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Sorun başlığı gereklidir');
      return;
    }

    if (!formData.description.trim()) {
      setError('Sorun açıklaması gereklidir');
      return;
    }

    if (!formData.suggested_assignee_id) {
      setError('Lütfen önerilen çözüm sorumlusunu seçin');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);

      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        suggested_assignee_id: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sorun bildirilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const inputClass = "w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const labelClass = "block text-sm font-medium text-slate-300 mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className={labelClass}>
          Sorun Başlığı <span className="text-red-400">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          placeholder="Sorunun kısa bir özeti"
          required
          disabled={loading}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Sorun Açıklaması <span className="text-red-400">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Sorunun detaylı açıklaması..."
          required
          disabled={loading}
          rows={5}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="priority" className={labelClass}>
          Öncelik <span className="text-red-400">*</span>
        </label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          required
          disabled={loading}
          className={inputClass}
        >
          <option value="low">Düşük</option>
          <option value="medium">Orta</option>
          <option value="high">Yüksek</option>
          <option value="critical">Kritik</option>
        </select>
      </div>

      <div>
        <label htmlFor="suggested_assignee_id" className={labelClass}>
          Çözebileceğini Düşündüğünüz Kişi <span className="text-red-400">*</span>
        </label>
        {loadingEmployees ? (
          <div className="text-sm text-slate-500">Çalışanlar yükleniyor...</div>
        ) : (
          <select
            id="suggested_assignee_id"
            name="suggested_assignee_id"
            value={formData.suggested_assignee_id}
            onChange={handleChange}
            required
            disabled={loading}
            className={inputClass}
          >
            <option value="">Kişi seçin...</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name} {emp.department ? `(${emp.department})` : ''}
              </option>
            ))}
          </select>
        )}
        <p className="mt-1.5 text-xs text-slate-500">
          Bu sorunun çözümünde yardımcı olabilecek kişiyi seçin
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-colors disabled:opacity-50"
          >
            İptal
          </button>
        )}
        <button
          type="submit"
          disabled={loading || loadingEmployees}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-orange-600 rounded-xl hover:from-red-500 hover:to-orange-500 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Bildiriliyor...' : 'Sorunu Bildir'}
        </button>
      </div>
    </form>
  );
};
