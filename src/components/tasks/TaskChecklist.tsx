import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { 
  CheckCircleIcon, 
  PlusIcon, 
  TrashIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

interface ChecklistItem {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  position: number;
  completed_at: string | null;
  completed_by: string | null;
  created_at: string;
  updated_at: string;
}

interface TaskChecklistProps {
  taskId: string;
}

export const TaskChecklist: React.FC<TaskChecklistProps> = ({ taskId }) => {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchChecklist();
  }, [taskId]);

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`
    };
  };

  const fetchChecklist = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const response = await fetch(`${apiUrl}/api/tasks/${taskId}/checklist`, { headers });
      const result = await response.json();

      if (result.data) {
        setItems(result.data);
      }
    } catch (error) {
      console.error('Error fetching checklist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    try {
      setAdding(true);
      const headers = await getAuthHeaders();
      const response = await fetch(`${apiUrl}/api/tasks/${taskId}/checklist`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ title: newItemTitle.trim() })
      });

      if (response.ok) {
        setNewItemTitle('');
        fetchChecklist();
      }
    } catch (error) {
      console.error('Error adding checklist item:', error);
    } finally {
      setAdding(false);
    }
  };

  const handleToggleItem = async (item: ChecklistItem) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${apiUrl}/api/tasks/${taskId}/checklist/${item.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ is_completed: !item.is_completed })
      });

      if (response.ok) {
        fetchChecklist();
      }
    } catch (error) {
      console.error('Error toggling checklist item:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Bu öğeyi silmek istediğinize emin misiniz?')) return;

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${apiUrl}/api/tasks/${taskId}/checklist/${itemId}`, {
        method: 'DELETE',
        headers
      });

      if (response.ok) {
        fetchChecklist();
      }
    } catch (error) {
      console.error('Error deleting checklist item:', error);
    }
  };

  const completedCount = items.filter(item => item.is_completed).length;
  const totalCount = items.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-xl">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-slate-700 rounded w-1/3"></div>
          <div className="h-10 bg-slate-700 rounded"></div>
          <div className="h-10 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Bars3Icon className="w-5 h-5 text-blue-400" />
            Kontrol Listesi
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {completedCount} / {totalCount} tamamlandı
          </p>
        </div>
        {totalCount > 0 && (
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{progressPercentage}%</div>
            <div className="text-xs text-slate-400">İlerleme</div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}

      {/* Add New Item Form */}
      <form onSubmit={handleAddItem} className="flex gap-2">
        <input
          type="text"
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          placeholder="Yeni öğe ekle..."
          className="flex-1 bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
          disabled={adding}
        />
        <button
          type="submit"
          disabled={adding || !newItemTitle.trim()}
          className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Ekle"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </form>

      {/* Checklist Items */}
      {items.length === 0 ? (
        <div className="text-center py-8">
          <Bars3Icon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Henüz kontrol listesi öğesi yok</p>
          <p className="text-slate-500 text-xs mt-1">Görevi küçük adımlara bölmek için öğe ekleyin</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                item.is_completed
                  ? 'bg-slate-800/30 border-slate-700/50'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
              }`}
            >
              <button
                onClick={() => handleToggleItem(item)}
                className={`shrink-0 transition-all ${
                  item.is_completed
                    ? 'text-emerald-400'
                    : 'text-slate-400 hover:text-blue-400'
                }`}
              >
                {item.is_completed ? (
                  <CheckCircleIconSolid className="w-6 h-6" />
                ) : (
                  <CheckCircleIcon className="w-6 h-6" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p
                  className={`font-medium truncate ${
                    item.is_completed
                      ? 'text-slate-500 line-through'
                      : 'text-white'
                  }`}
                >
                  {item.title}
                </p>
                {item.completed_at && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    ✓ {new Date(item.completed_at).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
              </div>

              <button
                onClick={() => handleDeleteItem(item.id)}
                className="shrink-0 p-1 text-slate-400 hover:text-red-400 rounded transition-all"
                title="Sil"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
