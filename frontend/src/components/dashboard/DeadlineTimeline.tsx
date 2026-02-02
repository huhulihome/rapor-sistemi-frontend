import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../common/ToastContainer';
import {
    CalendarDaysIcon,
    ExclamationTriangleIcon,
    PlusIcon,
    ArrowUpTrayIcon,
    ArrowDownTrayIcon,
    PencilIcon,
    TrashIcon,
    CheckCircleIcon,
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';

interface Deadline {
    id: string;
    title: string;
    description?: string;
    deadline_date: string;
    reminder_date?: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    category?: string;
    is_completed: boolean;
    created_at: string;
}

interface DeadlineFormData {
    title: string;
    description: string;
    deadline_date: string;
    reminder_date: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: string;
}

const emptyFormData: DeadlineFormData = {
    title: '',
    description: '',
    deadline_date: '',
    reminder_date: '',
    priority: 'medium',
    category: ''
};

export const DeadlineTimeline = () => {
    const { user, isAdmin } = useAuth();
    const toast = useToast();
    const [deadlines, setDeadlines] = useState<Deadline[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCompleted, setShowCompleted] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
    const [formData, setFormData] = useState<DeadlineFormData>(emptyFormData);
    const [csvData, setCsvData] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    useEffect(() => {
        fetchDeadlines();
    }, [user, isAdmin, showCompleted]);

    const getAuthHeaders = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
        };
    };

    const fetchDeadlines = async () => {
        try {
            setLoading(true);
            const headers = await getAuthHeaders();
            let url = `${apiUrl}/api/deadlines?limit=100`;

            if (!showCompleted) {
                url += '&is_completed=false';
            }

            const response = await fetch(url, { headers });
            const result = await response.json();

            if (result.data) {
                // Sort by deadline_date
                const sorted = result.data.sort((a: Deadline, b: Deadline) =>
                    new Date(a.deadline_date).getTime() - new Date(b.deadline_date).getTime()
                );
                setDeadlines(sorted);
            }
        } catch (error) {
            console.error('Error fetching deadlines:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.deadline_date) {
            toast.error('Başlık ve tarih zorunludur');
            return;
        }

        try {
            const headers = await getAuthHeaders();
            const url = editingDeadline
                ? `${apiUrl}/api/deadlines/${editingDeadline.id}`
                : `${apiUrl}/api/deadlines`;

            const response = await fetch(url, {
                method: editingDeadline ? 'PUT' : 'POST',
                headers,
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                toast.success(editingDeadline ? 'Deadline güncellendi' : 'Deadline oluşturuldu');
                setIsModalOpen(false);
                setEditingDeadline(null);
                setFormData(emptyFormData);
                fetchDeadlines();
            } else {
                toast.error(result.message || 'Hata oluştu');
            }
        } catch (error) {
            console.error('Error saving deadline:', error);
            toast.error('Deadline kaydedilemedi');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu deadline\'ı silmek istediğinize emin misiniz?')) return;

        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${apiUrl}/api/deadlines/${id}`, {
                method: 'DELETE',
                headers
            });

            if (response.ok) {
                toast.success('Deadline silindi');
                fetchDeadlines();
            } else {
                toast.error('Silinemedi');
            }
        } catch (error) {
            console.error('Error deleting deadline:', error);
        }
    };

    const handleToggleComplete = async (deadline: Deadline) => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${apiUrl}/api/deadlines/${deadline.id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    is_completed: !deadline.is_completed
                })
            });

            if (response.ok) {
                toast.success(deadline.is_completed ? 'Tekrar açıldı' : 'Tamamlandı');
                fetchDeadlines();
            } else {
                const result = await response.json();
                toast.error(result.message || 'Durum güncellenemedi');
                console.error('Toggle complete error:', result);
            }
        } catch (error) {
            console.error('Error toggling complete:', error);
            toast.error('Bağlantı hatası');
        }
    };

    const handleEdit = (deadline: Deadline) => {
        setEditingDeadline(deadline);
        setFormData({
            title: deadline.title,
            description: deadline.description || '',
            deadline_date: deadline.deadline_date,
            reminder_date: deadline.reminder_date || '',
            priority: deadline.priority,
            category: deadline.category || ''
        });
        setIsModalOpen(true);
    };

    const handleExport = async () => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${apiUrl}/api/deadlines/export`, { headers });
            const result = await response.json();

            if (result.data) {
                const csvHeader = 'deadline_date,reminder_date,title,description,priority,category';
                const csvRows = result.data.map((d: any) =>
                    `${d.deadline_date},${d.reminder_date || ''},${d.title.replace(/,/g, ';')},${(d.description || '').replace(/,/g, ';')},${d.priority},${d.category || ''}`
                );
                const csv = [csvHeader, ...csvRows].join('\n');

                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `deadlines_${new Date().toISOString().split('T')[0]}.csv`;
                link.click();

                toast.success('CSV indirildi');
            }
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Dışa aktarma hatası');
        }
    };

    const handleImport = async () => {
        if (!csvData.trim()) {
            toast.error('CSV verisi giriniz');
            return;
        }

        try {
            const lines = csvData.trim().split('\n');
            const hasHeader = lines[0].toLowerCase().includes('deadline_date') || lines[0].toLowerCase().includes('title');
            const dataLines = hasHeader ? lines.slice(1) : lines;

            const deadlinesToImport = dataLines.map(line => {
                const [deadline_date, reminder_date, title, description, priority, category] = line.split(',').map(s => s.trim());
                return {
                    deadline_date,
                    reminder_date: reminder_date || null,
                    title,
                    description: description || null,
                    priority: priority || 'medium',
                    category: category || null
                };
            }).filter(d => d.title && d.deadline_date);

            if (deadlinesToImport.length === 0) {
                toast.error('Geçerli veri bulunamadı');
                return;
            }

            const headers = await getAuthHeaders();
            const response = await fetch(`${apiUrl}/api/deadlines/import`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ deadlines: deadlinesToImport })
            });

            const result = await response.json();

            if (response.ok) {
                toast.success(`${deadlinesToImport.length} deadline içe aktarıldı`);
                setIsImportModalOpen(false);
                setCsvData('');
                fetchDeadlines();
            } else {
                toast.error(result.message || 'İçe aktarma hatası');
            }
        } catch (error) {
            console.error('Import error:', error);
            toast.error('İçe aktarma hatası');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setCsvData(event.target?.result as string);
            };
            reader.readAsText(file);
        }
    };

    const scrollTimeline = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const getDaysUntil = (dueDate: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getUrgencyColor = (daysUntil: number, isCompleted: boolean) => {
        if (isCompleted) return 'from-green-500 to-emerald-600';
        if (daysUntil <= 0) return 'from-red-500 to-rose-600';
        if (daysUntil <= 2) return 'from-orange-500 to-amber-600';
        if (daysUntil <= 5) return 'from-yellow-500 to-amber-500';
        return 'from-blue-500 to-indigo-600';
    };

    const getBorderColor = (daysUntil: number, isCompleted: boolean) => {
        if (isCompleted) return 'border-green-500/50';
        if (daysUntil <= 0) return 'border-red-500/50';
        if (daysUntil <= 2) return 'border-orange-500/50';
        if (daysUntil <= 5) return 'border-yellow-500/50';
        return 'border-blue-500/50';
    };

    const formatDate = (dueDate: string) => {
        const date = new Date(dueDate);
        return {
            day: date.getDate(),
            month: date.toLocaleDateString('tr-TR', { month: 'short' }),
            weekday: date.toLocaleDateString('tr-TR', { weekday: 'short' })
        };
    };

    const priorityColors: Record<string, string> = {
        critical: 'bg-red-500',
        high: 'bg-orange-500',
        medium: 'bg-yellow-500',
        low: 'bg-blue-500',
    };

    if (loading) {
        return (
            <div className="glass-card p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-slate-700 rounded w-1/3"></div>
                    <div className="flex gap-4 overflow-hidden">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-44 h-32 bg-slate-700 rounded-xl shrink-0"></div>
                        ))}
                    </div>
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
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                            <CalendarDaysIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Deadline Takvimi</h3>
                            <p className="text-sm text-slate-400">
                                {deadlines.length} deadline • Sağa kaydır →
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowCompleted(!showCompleted)}
                            className={`px-3 py-1.5 text-xs rounded-lg transition-all ${showCompleted
                                ? 'bg-green-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >
                            {showCompleted ? '✓ Tamamlananlar' : 'Aktif'}
                        </button>
                        <button
                            onClick={() => setIsImportModalOpen(true)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
                            title="CSV İçe Aktar"
                        >
                            <ArrowUpTrayIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleExport}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
                            title="CSV Dışa Aktar"
                        >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => {
                                setEditingDeadline(null);
                                setFormData(emptyFormData);
                                setIsModalOpen(true);
                            }}
                            className="p-2 text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-all"
                            title="Yeni Deadline"
                        >
                            <PlusIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {deadlines.length === 0 ? (
                    <div className="text-center py-12">
                        <CalendarDaysIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 text-lg">Henüz deadline yok</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-all"
                        >
                            + İlk Deadline'ı Ekle
                        </button>
                    </div>
                ) : (
                    <div className="relative">
                        {/* Scroll Buttons */}
                        <button
                            onClick={() => scrollTimeline('left')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-slate-800/90 hover:bg-slate-700 rounded-full shadow-lg transition-all"
                        >
                            <ChevronLeftIcon className="w-5 h-5 text-white" />
                        </button>
                        <button
                            onClick={() => scrollTimeline('right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-slate-800/90 hover:bg-slate-700 rounded-full shadow-lg transition-all"
                        >
                            <ChevronRightIcon className="w-5 h-5 text-white" />
                        </button>

                        {/* Horizontal Timeline */}
                        <div
                            ref={scrollContainerRef}
                            className="flex gap-4 overflow-x-auto pb-4 px-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
                            style={{ scrollbarWidth: 'thin' }}
                        >
                            {deadlines.map((deadline) => {
                                const daysUntil = getDaysUntil(deadline.deadline_date);
                                const dateInfo = formatDate(deadline.deadline_date);
                                const gradientColor = getUrgencyColor(daysUntil, deadline.is_completed);
                                const borderColor = getBorderColor(daysUntil, deadline.is_completed);

                                return (
                                    <div
                                        key={deadline.id}
                                        className={`relative shrink-0 w-48 group`}
                                    >
                                        {/* Date Badge */}
                                        <div className={`absolute -top-1 left-1/2 -translate-x-1/2 z-10 px-3 py-1 bg-gradient-to-r ${gradientColor} rounded-full shadow-lg`}>
                                            <div className="flex items-center gap-1 text-white text-xs font-bold">
                                                <span>{dateInfo.day}</span>
                                                <span>{dateInfo.month}</span>
                                            </div>
                                        </div>

                                        {/* Card */}
                                        <div className={`mt-4 p-4 pt-6 rounded-xl border-2 ${borderColor} bg-slate-800/50 backdrop-blur hover:bg-slate-800/80 transition-all h-36`}>
                                            {/* Priority Indicator */}
                                            <div className={`absolute top-6 right-3 w-2 h-2 rounded-full ${priorityColors[deadline.priority]}`}
                                                title={deadline.priority} />

                                            {/* Title */}
                                            <h4 className={`font-semibold text-sm leading-tight line-clamp-2 mb-2 ${deadline.is_completed ? 'text-slate-400 line-through' : 'text-white'}`}>
                                                {deadline.title}
                                            </h4>

                                            {/* Category & Days */}
                                            <div className="space-y-1">
                                                {deadline.category && (
                                                    <span className="inline-block px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                                                        {deadline.category}
                                                    </span>
                                                )}
                                                <div className="text-xs">
                                                    {deadline.is_completed ? (
                                                        <span className="text-green-400 flex items-center gap-1">
                                                            <CheckCircleIcon className="w-3 h-3" />
                                                            Tamamlandı
                                                        </span>
                                                    ) : daysUntil <= 0 ? (
                                                        <span className="text-red-400 flex items-center gap-1">
                                                            <ExclamationTriangleIcon className="w-3 h-3" />
                                                            {daysUntil === 0 ? 'Bugün!' : `${Math.abs(daysUntil)} gün geçti`}
                                                        </span>
                                                    ) : daysUntil === 1 ? (
                                                        <span className="text-orange-400">Yarın</span>
                                                    ) : (
                                                        <span className="text-slate-400">{daysUntil} gün kaldı</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons - Show on Hover */}
                                            <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleToggleComplete(deadline)}
                                                    className={`p-1 rounded transition-all ${deadline.is_completed
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-slate-700 text-slate-400 hover:text-green-400'}`}
                                                    title={deadline.is_completed ? 'Tekrar aç' : 'Tamamla'}
                                                >
                                                    <CheckCircleIcon className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(deadline)}
                                                    className="p-1 bg-slate-700 text-slate-400 hover:text-white rounded transition-all"
                                                    title="Düzenle"
                                                >
                                                    <PencilIcon className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(deadline.id)}
                                                    className="p-1 bg-slate-700 text-slate-400 hover:text-red-400 rounded transition-all"
                                                    title="Sil"
                                                >
                                                    <TrashIcon className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Timeline Connector */}
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full h-4 w-0.5 bg-gradient-to-b from-slate-600 to-transparent" />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Timeline Base Line */}
                        <div className="absolute bottom-0 left-8 right-8 h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full" />
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-card w-full max-w-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {editingDeadline ? 'Deadline Düzenle' : 'Yeni Deadline'}
                            </h2>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setEditingDeadline(null);
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
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Deadline başlığı"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Açıklama</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                    rows={2}
                                    placeholder="Opsiyonel açıklama..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Son Tarih *</label>
                                    <input
                                        type="date"
                                        value={formData.deadline_date}
                                        onChange={e => setFormData({ ...formData, deadline_date: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Hatırlatma</label>
                                    <input
                                        type="date"
                                        value={formData.reminder_date}
                                        onChange={e => setFormData({ ...formData, reminder_date: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Öncelik</label>
                                    <select
                                        value={formData.priority}
                                        onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="low">Düşük</option>
                                        <option value="medium">Orta</option>
                                        <option value="high">Yüksek</option>
                                        <option value="critical">Kritik</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Kategori</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Ör: Toplantı, Ödeme..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setEditingDeadline(null);
                                        setFormData(emptyFormData);
                                    }}
                                    className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-all"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all"
                                >
                                    {editingDeadline ? 'Güncelle' : 'Oluştur'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {isImportModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-card w-full max-w-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">CSV İçe Aktar</h2>
                            <button
                                onClick={() => {
                                    setIsImportModalOpen(false);
                                    setCsvData('');
                                }}
                                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                <p className="text-sm text-slate-300 mb-2">CSV Format:</p>
                                <code className="text-xs text-purple-400">
                                    deadline_date,reminder_date,title,description,priority,category
                                </code>
                                <p className="text-xs text-slate-500 mt-2">
                                    Örnek: 2026-02-15,2026-02-10,Vergi Ödemesi,Açıklama,high,Finans
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Dosya Yükle veya Yapıştır
                                </label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv,.txt"
                                    onChange={handleFileUpload}
                                    className="mb-3 w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-500"
                                />
                                <textarea
                                    value={csvData}
                                    onChange={e => setCsvData(e.target.value)}
                                    className="w-full h-32 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="CSV verilerini buraya yapıştırın..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setIsImportModalOpen(false);
                                        setCsvData('');
                                    }}
                                    className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-all"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleImport}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all"
                                >
                                    İçe Aktar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
