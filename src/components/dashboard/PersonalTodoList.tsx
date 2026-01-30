import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../common/ToastContainer';
import {
    CheckCircleIcon,
    PlusIcon,
    TrashIcon,
    PencilIcon,
    XMarkIcon,
    ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

interface Todo {
    id: string;
    title: string;
    description?: string;
    is_completed: boolean;
    due_date?: string;
    priority: 'low' | 'medium' | 'high';
    created_at: string;
    user_id?: string;
    user?: {
        id: string;
        full_name: string;
        email: string;
    };
}

interface TodoFormData {
    title: string;
    description: string;
    due_date: string;
    priority: 'low' | 'medium' | 'high';
}

const emptyFormData: TodoFormData = {
    title: '',
    description: '',
    due_date: '',
    priority: 'medium'
};

export const PersonalTodoList = () => {
    const { user, isAdmin } = useAuth();
    const toast = useToast();
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCompleted, setShowCompleted] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
    const [formData, setFormData] = useState<TodoFormData>(emptyFormData);
    const [viewMode, setViewMode] = useState<'personal' | 'all'>('personal');

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    useEffect(() => {
        fetchTodos();
    }, [user, showCompleted, viewMode]);

    const getAuthHeaders = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
        };
    };

    const fetchTodos = async () => {
        try {
            setLoading(true);
            const headers = await getAuthHeaders();
            let url = `${apiUrl}/api/todos?limit=100`;

            // Admin'de viewMode'a göre filtrele
            if (isAdmin && viewMode === 'personal' && user?.id) {
                url += `&user_id=${user.id}`;
            }
            // viewMode === 'all' ise backend tüm to-do'ları döner (admin için)

            if (!showCompleted) {
                url += '&is_completed=false';
            }

            const response = await fetch(url, { headers });
            const result = await response.json();

            if (result.data) {
                setTodos(result.data);
            }
        } catch (error) {
            console.error('Error fetching todos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error('Başlık zorunludur');
            return;
        }

        try {
            const headers = await getAuthHeaders();
            const url = editingTodo
                ? `${apiUrl}/api/todos/${editingTodo.id}`
                : `${apiUrl}/api/todos`;

            const response = await fetch(url, {
                method: editingTodo ? 'PUT' : 'POST',
                headers,
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description || null,
                    due_date: formData.due_date || null,
                    priority: formData.priority
                })
            });

            if (response.ok) {
                toast.success(editingTodo ? 'Güncellendi' : 'Eklendi');
                setIsModalOpen(false);
                setEditingTodo(null);
                setFormData(emptyFormData);
                fetchTodos();
            } else {
                const result = await response.json();
                toast.error(result.message || 'Hata oluştu');
            }
        } catch (error) {
            console.error('Error saving todo:', error);
            toast.error('Kaydetme hatası');
        }
    };

    const handleToggleComplete = async (todo: Todo) => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${apiUrl}/api/todos/${todo.id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    is_completed: !todo.is_completed
                })
            });

            if (response.ok) {
                toast.success(todo.is_completed ? 'Tekrar açıldı' : 'Tamamlandı');
                fetchTodos();
            }
        } catch (error) {
            console.error('Error toggling complete:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu öğeyi silmek istediğinize emin misiniz?')) return;

        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${apiUrl}/api/todos/${id}`, {
                method: 'DELETE',
                headers
            });

            if (response.ok) {
                toast.success('Silindi');
                fetchTodos();
            } else {
                toast.error('Silinemedi');
            }
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
    };

    const handleEdit = (todo: Todo) => {
        setEditingTodo(todo);
        setFormData({
            title: todo.title,
            description: todo.description || '',
            due_date: todo.due_date || '',
            priority: todo.priority
        });
        setIsModalOpen(true);
    };

    const priorityColors: Record<string, string> = {
        low: 'bg-blue-500/20 text-blue-400',
        medium: 'bg-yellow-500/20 text-yellow-400',
        high: 'bg-red-500/20 text-red-400'
    };

    const priorityLabels: Record<string, string> = {
        low: 'Düşük',
        medium: 'Orta',
        high: 'Yüksek'
    };

    if (loading) {
        return (
            <div className="glass-card p-6">
                <div className="animate-pulse space-y-3">
                    <div className="h-5 bg-slate-700 rounded w-1/3"></div>
                    <div className="h-10 bg-slate-700 rounded"></div>
                    <div className="h-10 bg-slate-700 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="glass-card p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                            <ClipboardDocumentListIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">
                                {isAdmin && viewMode === 'all' ? 'Tüm Yapılacaklar' : 'Kişisel Yapılacaklar'}
                            </h3>
                            <p className="text-sm text-slate-400">
                                {todos.length} öğe
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowCompleted(!showCompleted)}
                            className={`px-3 py-1.5 text-xs rounded-lg transition-all ${showCompleted
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >
                            {showCompleted ? '✓ Tümü' : 'Aktif'}
                        </button>
                        <button
                            onClick={() => {
                                setEditingTodo(null);
                                setFormData(emptyFormData);
                                setIsModalOpen(true);
                            }}
                            className="p-2 text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-all"
                            title="Yeni Ekle"
                        >
                            <PlusIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Admin View Mode Tabs */}
                {isAdmin && (
                    <div className="flex gap-2 mb-4 p-1 bg-slate-800/50 rounded-lg">
                        <button
                            onClick={() => setViewMode('personal')}
                            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'personal'
                                ? 'bg-emerald-600 text-white shadow-lg'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                }`}
                        >
                            📋 Benim To-Do'larım
                        </button>
                        <button
                            onClick={() => setViewMode('all')}
                            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'all'
                                ? 'bg-emerald-600 text-white shadow-lg'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                }`}
                        >
                            👥 Tüm Kullanıcılar
                        </button>
                    </div>
                )}

                {/* Todo List */}
                {todos.length === 0 ? (
                    <div className="text-center py-8">
                        <ClipboardDocumentListIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">Henüz yapılacak öğe yok</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-3 text-sm text-emerald-400 hover:text-emerald-300"
                        >
                            + İlk öğeyi ekle
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {isAdmin && viewMode === 'all' ? (
                            // Admin "all users" view: Group todos by user
                            (() => {
                                // Group todos by user
                                const grouped = todos.reduce((acc, todo) => {
                                    const userName = todo.user?.full_name || 'Bilinmiyor';
                                    const userId = todo.user?.id || todo.user_id || 'unknown';
                                    const isOwnTodo = userId === user?.id;
                                    const key = isOwnTodo ? '__own__' : userName;
                                    if (!acc[key]) acc[key] = [];
                                    acc[key].push(todo);
                                    return acc;
                                }, {} as Record<string, Todo[]>);

                                // Sort keys: own todos first, then alphabetically
                                const sortedKeys = Object.keys(grouped).sort((a, b) => {
                                    if (a === '__own__') return -1;
                                    if (b === '__own__') return 1;
                                    return a.localeCompare(b, 'tr');
                                });

                                return sortedKeys.map(key => (
                                    <div key={key} className="space-y-2">
                                        <h4 className="text-sm font-semibold text-slate-300 border-b border-slate-700 pb-1">
                                            {key === '__own__' ? '📋 Benim Yapılacaklarım' : `👤 ${key}`}
                                        </h4>
                                        {grouped[key].map(todo => (
                                            <div
                                                key={todo.id}
                                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${todo.is_completed
                                                    ? 'bg-slate-800/30 border-slate-700/50'
                                                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                                                    }`}
                                            >
                                                <button
                                                    onClick={() => handleToggleComplete(todo)}
                                                    className={`shrink-0 p-1 rounded transition-all ${todo.is_completed
                                                        ? 'bg-emerald-500/20 text-emerald-400'
                                                        : 'bg-slate-700 text-slate-400 hover:text-emerald-400'
                                                        }`}
                                                >
                                                    <CheckCircleIcon className="w-5 h-5" />
                                                </button>

                                                <div className="flex-1 min-w-0">
                                                    <p className={`font-medium truncate ${todo.is_completed ? 'text-slate-500 line-through' : 'text-white'
                                                        }`}>
                                                        {todo.title}
                                                    </p>
                                                    {todo.due_date && (
                                                        <p className="text-xs text-slate-500">
                                                            {new Date(todo.due_date).toLocaleDateString('tr-TR')}
                                                        </p>
                                                    )}
                                                </div>

                                                <span className={`shrink-0 px-2 py-0.5 text-xs rounded ${priorityColors[todo.priority]}`}>
                                                    {priorityLabels[todo.priority]}
                                                </span>

                                                <div className="flex gap-1 shrink-0">
                                                    <button
                                                        onClick={() => handleEdit(todo)}
                                                        className="p-1 text-slate-400 hover:text-white rounded transition-all"
                                                    >
                                                        <PencilIcon className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(todo.id)}
                                                        className="p-1 text-slate-400 hover:text-red-400 rounded transition-all"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ));
                            })()
                        ) : (
                            // Personal view (admin personal or regular user): Simple list
                            todos.map(todo => (
                                <div
                                    key={todo.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${todo.is_completed
                                        ? 'bg-slate-800/30 border-slate-700/50'
                                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                                        }`}
                                >
                                    <button
                                        onClick={() => handleToggleComplete(todo)}
                                        className={`shrink-0 p-1 rounded transition-all ${todo.is_completed
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : 'bg-slate-700 text-slate-400 hover:text-emerald-400'
                                            }`}
                                    >
                                        <CheckCircleIcon className="w-5 h-5" />
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <p className={`font-medium truncate ${todo.is_completed ? 'text-slate-500 line-through' : 'text-white'
                                            }`}>
                                            {todo.title}
                                        </p>
                                        {todo.due_date && (
                                            <p className="text-xs text-slate-500">
                                                {new Date(todo.due_date).toLocaleDateString('tr-TR')}
                                            </p>
                                        )}
                                    </div>

                                    <span className={`shrink-0 px-2 py-0.5 text-xs rounded ${priorityColors[todo.priority]}`}>
                                        {priorityLabels[todo.priority]}
                                    </span>

                                    <div className="flex gap-1 shrink-0">
                                        <button
                                            onClick={() => handleEdit(todo)}
                                            className="p-1 text-slate-400 hover:text-white rounded transition-all"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(todo.id)}
                                            className="p-1 text-slate-400 hover:text-red-400 rounded transition-all"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-card w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {editingTodo ? 'Düzenle' : 'Yeni Ekle'}
                            </h2>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setEditingTodo(null);
                                    setFormData(emptyFormData);
                                }}
                                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Başlık *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    placeholder="Ne yapılacak?"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Açıklama</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                                    rows={2}
                                    placeholder="Detaylar..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Tarih</label>
                                    <input
                                        type="date"
                                        value={formData.due_date}
                                        onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Öncelik</label>
                                    <select
                                        value={formData.priority}
                                        onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    >
                                        <option value="low">Düşük</option>
                                        <option value="medium">Orta</option>
                                        <option value="high">Yüksek</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setEditingTodo(null);
                                        setFormData(emptyFormData);
                                    }}
                                    className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-all"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all"
                                >
                                    {editingTodo ? 'Güncelle' : 'Ekle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};
