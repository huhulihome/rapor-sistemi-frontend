import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/common/Layout';
import { Button } from '../components/common';
import { useToast } from '../components/common/ToastContainer';
import { supabase } from '../services/supabase';
import {
    PlusIcon,
    CalendarDaysIcon,
    ArrowUpTrayIcon,
    ArrowDownTrayIcon,
    PencilIcon,
    TrashIcon,
    CheckCircleIcon,
    ClockIcon,
    XMarkIcon
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

export const Deadlines: React.FC = () => {
    const toast = useToast();
    const [deadlines, setDeadlines] = useState<Deadline[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
    const [formData, setFormData] = useState<DeadlineFormData>(emptyFormData);
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
    const [csvData, setCsvData] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    useEffect(() => {
        fetchDeadlines();
    }, [filter]);

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
            let url = `${apiUrl}/api/deadlines?`;

            if (filter === 'upcoming') {
                url += 'is_completed=false';
            } else if (filter === 'completed') {
                url += 'is_completed=true';
            }

            const response = await fetch(url, { headers });
            const result = await response.json();

            if (result.data) {
                setDeadlines(result.data);
            }
        } catch (error) {
            console.error('Error fetching deadlines:', error);
            toast.error('Deadline\'lar yüklenirken hata oluştu');
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
            toast.error('Silme hatası');
        }
    };

    const handleToggleComplete = async (deadline: Deadline) => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${apiUrl}/api/deadlines/${deadline.id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    is_completed: !deadline.is_completed,
                    completed_at: !deadline.is_completed ? new Date().toISOString() : null
                })
            });

            if (response.ok) {
                toast.success(deadline.is_completed ? 'Görev tekrar açıldı' : 'Görev tamamlandı');
                fetchDeadlines();
            }
        } catch (error) {
            console.error('Error toggling complete:', error);
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
                // Convert to CSV
                const csvHeader = 'deadline_date,reminder_date,title,description,priority,category';
                const csvRows = result.data.map((d: any) =>
                    `${d.deadline_date},${d.reminder_date || ''},${d.title.replace(/,/g, ';')},${(d.description || '').replace(/,/g, ';')},${d.priority},${d.category || ''}`
                );
                const csv = [csvHeader, ...csvRows].join('\n');

                // Download
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `deadlines_${new Date().toISOString().split('T')[0]}.csv`;
                link.click();

                toast.success('CSV dosyası indirildi');
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

    const getDaysUntil = (date: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadline = new Date(date);
        deadline.setHours(0, 0, 0, 0);
        return Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };

    const getUrgencyClass = (daysUntil: number, isCompleted: boolean) => {
        if (isCompleted) return 'border-green-500/30 bg-green-500/10';
        if (daysUntil < 0) return 'border-red-500/50 bg-red-500/10';
        if (daysUntil <= 2) return 'border-orange-500/50 bg-orange-500/10';
        if (daysUntil <= 5) return 'border-yellow-500/30 bg-yellow-500/10';
        return 'border-blue-500/30 bg-blue-500/10';
    };

    const priorityColors: Record<string, string> = {
        critical: 'bg-red-500 text-white',
        high: 'bg-orange-500 text-white',
        medium: 'bg-yellow-500 text-black',
        low: 'bg-blue-500 text-white'
    };

    const priorityLabels: Record<string, string> = {
        critical: 'Kritik',
        high: 'Yüksek',
        medium: 'Orta',
        low: 'Düşük'
    };

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                            <CalendarDaysIcon className="h-8 w-8 text-purple-400" />
                            Deadline'lar
                        </h1>
                        <p className="mt-1 text-slate-400">
                            Görevlerden bağımsız hatırlatma ve takvim sistemi
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            onClick={() => setIsImportModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-all"
                        >
                            <ArrowUpTrayIcon className="h-4 w-4" />
                            CSV İçe Aktar
                        </Button>
                        <Button
                            onClick={handleExport}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-all"
                        >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            Dışa Aktar
                        </Button>
                        <Button
                            onClick={() => {
                                setEditingDeadline(null);
                                setFormData(emptyFormData);
                                setIsModalOpen(true);
                            }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-500 hover:to-pink-500 hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                        >
                            <PlusIcon className="h-5 w-5" />
                            Yeni Deadline
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                    >
                        Tümü
                    </button>
                    <button
                        onClick={() => setFilter('upcoming')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'upcoming'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                    >
                        Bekleyenler
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'completed'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                    >
                        Tamamlananlar
                    </button>
                </div>

                {/* Deadlines List */}
                {loading ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="glass-card p-6 animate-pulse">
                                <div className="h-5 bg-slate-700 rounded w-3/4 mb-3"></div>
                                <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : deadlines.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <CalendarDaysIcon className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">Henüz deadline yok</h3>
                        <p className="text-slate-400 mb-6">
                            Yeni bir deadline ekleyerek başlayın veya CSV dosyası yükleyin
                        </p>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl"
                        >
                            <PlusIcon className="h-5 w-5" />
                            İlk Deadline'ı Ekle
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {deadlines.map(deadline => {
                            const daysUntil = getDaysUntil(deadline.deadline_date);
                            return (
                                <div
                                    key={deadline.id}
                                    className={`glass-card p-5 border-l-4 ${getUrgencyClass(daysUntil, deadline.is_completed)} transition-all hover:scale-[1.02]`}
                                >
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <h3 className={`font-semibold ${deadline.is_completed ? 'text-slate-400 line-through' : 'text-white'}`}>
                                            {deadline.title}
                                        </h3>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[deadline.priority]}`}>
                                            {priorityLabels[deadline.priority]}
                                        </span>
                                    </div>

                                    {deadline.description && (
                                        <p className="text-sm text-slate-400 mb-3 line-clamp-2">{deadline.description}</p>
                                    )}

                                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                                        <ClockIcon className="h-4 w-4" />
                                        <span>{new Date(deadline.deadline_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                        {!deadline.is_completed && (
                                            <span className={`ml-auto font-medium ${daysUntil < 0 ? 'text-red-400' :
                                                daysUntil <= 2 ? 'text-orange-400' :
                                                    daysUntil <= 5 ? 'text-yellow-400' : 'text-blue-400'
                                                }`}>
                                                {daysUntil < 0 ? `${Math.abs(daysUntil)} gün geçti` :
                                                    daysUntil === 0 ? 'Bugün!' :
                                                        daysUntil === 1 ? 'Yarın' : `${daysUntil} gün kaldı`}
                                            </span>
                                        )}
                                    </div>

                                    {deadline.category && (
                                        <span className="inline-block px-2 py-1 bg-slate-700 rounded text-xs text-slate-300 mb-3">
                                            {deadline.category}
                                        </span>
                                    )}

                                    <div className="flex items-center gap-2 pt-3 border-t border-slate-700">
                                        <button
                                            onClick={() => handleToggleComplete(deadline)}
                                            className={`p-2 rounded-lg transition-all ${deadline.is_completed
                                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                                }`}
                                            title={deadline.is_completed ? 'Tekrar aç' : 'Tamamla'}
                                        >
                                            <CheckCircleIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(deadline)}
                                            className="p-2 rounded-lg bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white transition-all"
                                            title="Düzenle"
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(deadline.id)}
                                            className="p-2 rounded-lg bg-slate-700 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all ml-auto"
                                            title="Sil"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

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
                                        rows={3}
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
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Hatırlatma Tarihi</label>
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
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setEditingDeadline(null);
                                            setFormData(emptyFormData);
                                        }}
                                        className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600"
                                    >
                                        İptal
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500"
                                    >
                                        {editingDeadline ? 'Güncelle' : 'Oluştur'}
                                    </Button>
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
                                        Örnek: 2026-02-15,2026-02-10,Vergi Ödemesi,Gelir vergisi son gün,high,Finans
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
                                        className="w-full h-48 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="CSV verilerini buraya yapıştırın..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        onClick={() => {
                                            setIsImportModalOpen(false);
                                            setCsvData('');
                                        }}
                                        className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600"
                                    >
                                        İptal
                                    </Button>
                                    <Button
                                        onClick={handleImport}
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500"
                                    >
                                        İçe Aktar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};
