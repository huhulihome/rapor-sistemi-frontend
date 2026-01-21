import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { CreateTaskRequest } from '../types/api';
import { TaskForm } from '../components/tasks/TaskForm';
import { supabase } from '../services/supabase';
import { Layout } from '../components/common/Layout';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

interface Task {
    id: string;
    title: string;
    description?: string;
    category: string;
    priority: string;
    status: string;
    assigned_to?: string;
    due_date?: string;
    estimated_hours?: number;
    tags?: string[];
}

export const TaskEdit: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { isAdmin } = useAuth();
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchTask();
    }, [id]);

    const fetchTask = async () => {
        if (!id) return;

        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/login');
                return;
            }

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${apiUrl}/api/tasks/${id}`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Görev bulunamadı');
            }

            const result = await response.json();
            setTask(result.data);
        } catch (error) {
            console.error('Error fetching task:', error);
            alert('Görev yüklenirken bir hata oluştu');
            navigate('/tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (taskData: CreateTaskRequest) => {
        if (!id) return;

        try {
            setIsSubmitting(true);

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert('Oturum bulunamadı');
                return;
            }

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${apiUrl}/api/tasks/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Görev güncellenemedi');
            }

            navigate(`/tasks/${id}`);
        } catch (error) {
            console.error('Error updating task:', error);
            alert(error instanceof Error ? error.message : 'Görev güncellenemedi');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = () => {
        if (!id) return;

        // Use setTimeout to prevent confirm dialog from closing immediately
        setTimeout(async () => {
            const confirmed = window.confirm('Bu görevi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.');
            if (!confirmed) {
                return;
            }

            try {
                setIsDeleting(true);

                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    alert('Oturum bulunamadı');
                    return;
                }

                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                const response = await fetch(`${apiUrl}/api/tasks/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Görev silinemedi');
                }

                alert('Görev başarıyla silindi');
                navigate('/tasks');
            } catch (error) {
                console.error('Error deleting task:', error);
                alert(error instanceof Error ? error.message : 'Görev silinemedi');
            } finally {
                setIsDeleting(false);
            }
        }, 0);
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <LoadingSpinner size="lg" message="Görev yükleniyor..." />
                </div>
            </Layout>
        );
    }

    if (!task) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <p className="text-slate-400">Görev bulunamadı</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Back button */}
                <button
                    onClick={() => navigate(`/tasks/${id}`)}
                    className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors [&>svg]:w-4 [&>svg]:h-4"
                >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Göreve Dön
                </button>

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">
                            Görevi Düzenle
                        </h1>
                        <p className="mt-1 text-slate-400">
                            Görev bilgilerini güncelleyin
                        </p>
                    </div>
                    {isAdmin && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDelete();
                            }}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            <TrashIcon className="w-5 h-5 pointer-events-none" />
                            {isDeleting ? 'Siliniyor...' : 'Görevi Sil'}
                        </button>
                    )}
                </div>

                {/* Form Card */}
                <div className="glass-card p-6 rounded-xl">
                    <TaskForm
                        initialData={{
                            title: task.title,
                            description: task.description,
                            category: task.category as CreateTaskRequest['category'],
                            priority: task.priority as CreateTaskRequest['priority'],
                            assigned_to: task.assigned_to,
                            due_date: task.due_date,
                            estimated_hours: task.estimated_hours,
                            tags: task.tags,
                        }}
                        onSubmit={handleSubmit}
                        onCancel={() => navigate(`/tasks/${id}`)}
                        isLoading={isSubmitting}
                    />
                </div>
            </div>
        </Layout>
    );
};
