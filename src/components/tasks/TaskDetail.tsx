import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Task } from '../../types/database';
import type { UpdateTaskRequest } from '../../types/api';
import { LoadingSpinner, Modal } from '../common';
import { supabase } from '../../services/supabase';
import { Layout } from '../common/Layout';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { classNames } from '../../utils/classNames';

const statusLabels = {
  not_started: 'Başlamadı',
  in_progress: 'Devam Ediyor',
  completed: 'Tamamlandı',
  blocked: 'Engellendi',
};

const statusColors = {
  not_started: 'bg-slate-500/20 text-slate-300',
  in_progress: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-emerald-500/20 text-emerald-400',
  blocked: 'bg-red-500/20 text-red-400',
};

const priorityLabels = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
  critical: 'Kritik',
};

const priorityColors = {
  low: 'bg-slate-500/20 text-slate-300',
  medium: 'bg-blue-500/20 text-blue-400',
  high: 'bg-orange-500/20 text-orange-400',
  critical: 'bg-red-500/20 text-red-400',
};

const categoryLabels = {
  routine: 'Rutin',
  project: 'Proje',
  one_time: 'Tek Seferlik',
  issue_resolution: 'Sorun Çözümü',
};

export const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);

  const [newStatus, setNewStatus] = useState<Task['status']>('not_started');
  const [newProgress, setNewProgress] = useState(0);
  const [newActualHours, setNewActualHours] = useState(0);

  useEffect(() => {
    if (id) {
      fetchTask();
    }
  }, [id]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Oturum bulunamadı');
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/tasks/${id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Görev yüklenemedi');
      }

      const result = await response.json();
      setTask(result.data);
      setNewStatus(result.data.status);
      setNewProgress(result.data.progress_percentage);
      setNewActualHours(result.data.actual_hours || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      console.error('Error fetching task:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (updates: UpdateTaskRequest) => {
    try {
      setUpdating(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Oturum bulunamadı');
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Görev güncellenemedi');
      }

      const result = await response.json();
      setTask(result.data);
      return true;
    } catch (err) {
      console.error('Error updating task:', err);
      alert(err instanceof Error ? err.message : 'Güncelleme başarısız');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusUpdate = async () => {
    const success = await updateTask({ status: newStatus });
    if (success) {
      setShowStatusModal(false);
    }
  };

  const handleProgressUpdate = async () => {
    const success = await updateTask({ progress_percentage: newProgress });
    if (success) {
      setShowProgressModal(false);
    }
  };

  const handleTimeUpdate = async () => {
    const success = await updateTask({ actual_hours: newActualHours });
    if (success) {
      setShowTimeModal(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" message="Görev yükleniyor..." />
        </div>
      </Layout>
    );
  }

  if (error || !task) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-6 rounded-xl border-red-500/30">
            <p className="font-medium text-red-400">Hata</p>
            <p className="text-sm text-slate-400 mt-1">{error || 'Görev bulunamadı'}</p>
            <button
              onClick={() => navigate('/tasks')}
              className="mt-4 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              ← Görevlere Dön
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back button */}
        <button
          onClick={() => navigate('/tasks')}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors [&>svg]:w-4 [&>svg]:h-4"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Görevlere Dön
        </button>

        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{task.title}</h1>
          {isOverdue && (
            <p className="mt-2 text-sm text-red-400 font-medium">⚠️ Bu görev gecikmiş</p>
          )}
        </div>

        {/* Main Card */}
        <div className="glass-card p-6 rounded-xl space-y-6">
          {/* Status and Priority */}
          <div className="flex flex-wrap gap-4">
            <div>
              <span className="text-sm text-slate-400">Durum:</span>
              <div className="mt-1">
                <span className={classNames('px-3 py-1 text-sm font-medium rounded-full', statusColors[task.status])}>
                  {statusLabels[task.status]}
                </span>
              </div>
            </div>
            <div>
              <span className="text-sm text-slate-400">Öncelik:</span>
              <div className="mt-1">
                <span className={classNames('px-3 py-1 text-sm font-medium rounded-full', priorityColors[task.priority])}>
                  {priorityLabels[task.priority]}
                </span>
              </div>
            </div>
            <div>
              <span className="text-sm text-slate-400">Kategori:</span>
              <div className="mt-1">
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-purple-500/20 text-purple-400">
                  {categoryLabels[task.category]}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-2">Açıklama</h3>
              <p className="text-slate-400 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-slate-300">İlerleme</h3>
              <button
                onClick={() => setShowProgressModal(true)}
                className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Güncelle
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${task.progress_percentage}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-semibold text-white">
                {task.progress_percentage}%
              </span>
            </div>
          </div>

          {/* Time Tracking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <h3 className="text-sm font-medium text-slate-400 mb-1">Tahmini Süre</h3>
              <p className="text-2xl font-semibold text-white">
                {task.estimated_hours || 0} <span className="text-sm text-slate-400">saat</span>
              </p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-sm font-medium text-slate-400">Gerçekleşen Süre</h3>
                <button
                  onClick={() => setShowTimeModal(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Güncelle
                </button>
              </div>
              <p className="text-2xl font-semibold text-white">
                {task.actual_hours || 0} <span className="text-sm text-slate-400">saat</span>
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {task.due_date && (
              <div>
                <span className="text-slate-400">Bitiş Tarihi:</span>
                <span className={classNames('ml-2 font-medium', isOverdue ? 'text-red-400' : 'text-white')}>
                  {new Date(task.due_date).toLocaleDateString('tr-TR')}
                </span>
              </div>
            )}
            <div>
              <span className="text-slate-400">Oluşturulma:</span>
              <span className="ml-2 font-medium text-white">
                {new Date(task.created_at).toLocaleDateString('tr-TR')}
              </span>
            </div>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-2">Etiketler</h3>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              onClick={() => setShowStatusModal(true)}
              disabled={updating}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 disabled:opacity-50"
            >
              Durumu Güncelle
            </button>
            <button
              onClick={() => navigate(`/tasks/${id}/edit`)}
              disabled={updating}
              className="px-5 py-2.5 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors disabled:opacity-50"
            >
              Düzenle
            </button>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Durum Güncelle"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Yeni Durum
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as Task['status'])}
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="not_started">Başlamadı</option>
              <option value="in_progress">Devam Ediyor</option>
              <option value="completed">Tamamlandı</option>
              <option value="blocked">Engellendi</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowStatusModal(false)}
              disabled={updating}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleStatusUpdate}
              disabled={updating}
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50"
            >
              {updating ? 'Güncelleniyor...' : 'Güncelle'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Progress Update Modal */}
      <Modal
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        title="İlerleme Güncelle"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              İlerleme Yüzdesi: <span className="text-white font-semibold">{newProgress}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={newProgress}
              onChange={(e) => setNewProgress(parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowProgressModal(false)}
              disabled={updating}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleProgressUpdate}
              disabled={updating}
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50"
            >
              {updating ? 'Güncelleniyor...' : 'Güncelle'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Time Update Modal */}
      <Modal
        isOpen={showTimeModal}
        onClose={() => setShowTimeModal(false)}
        title="Gerçekleşen Süre Güncelle"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Gerçekleşen Süre (saat)
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={newActualHours}
              onChange={(e) => setNewActualHours(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowTimeModal(false)}
              disabled={updating}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleTimeUpdate}
              disabled={updating}
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50"
            >
              {updating ? 'Güncelleniyor...' : 'Güncelle'}
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
