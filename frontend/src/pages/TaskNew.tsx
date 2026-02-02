import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CreateTaskRequest } from '../types/api';
import { TaskForm } from '../components/tasks/TaskForm';
import { supabase } from '../services/supabase';
import { Layout } from '../components/common/Layout';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

export const TaskNew: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (taskData: CreateTaskRequest) => {
    try {
      setIsLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Oturum bulunamadı');
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Görev oluşturulamadı');
      }

      const result = await response.json();
      navigate(`/tasks/${result.data.id}`);
    } catch (error) {
      console.error('Error creating task:', error);
      alert(error instanceof Error ? error.message : 'Görev oluşturulamadı');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back button */}
        <button
          onClick={() => navigate('/tasks')}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors [&>svg]:w-4 [&>svg]:h-4"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Görevlere Dön
        </button>

        {/* Header - Rol bazlı başlık */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {isAdmin ? 'Yeni Görev Oluştur' : 'Kendime Görev Ekle'}
          </h1>
          <p className="mt-1 text-slate-400">
            {isAdmin
              ? 'Yeni bir görev oluşturun ve istediğiniz kişiye atayın'
              : 'Kendinize yeni bir görev oluşturun. Başka birine iş atamak için Sorunlar sayfasını kullanın.'
            }
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-6 rounded-xl">
          <TaskForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/tasks')}
            isLoading={isLoading}
          />
        </div>
      </div>
    </Layout>
  );
};
