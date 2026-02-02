import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TaskList } from '../components/tasks';
import { Button } from '../components/common';
import { Layout } from '../components/common/Layout';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

export const Tasks: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Görevler</h1>
            <p className="mt-1 text-slate-400">
              {isAdmin ? 'Tüm görevleri yönetin ve atayın' : 'Kendi görevlerinizi yönetin'}
            </p>
          </div>
          {/* Herkes görev oluşturabilir (çalışanlar sadece kendine) */}
          <Button
            onClick={() => navigate('/tasks/new')}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 transition-all duration-200 [&>svg]:w-5 [&>svg]:h-5"
          >
            <PlusIcon className="h-5 w-5" />
            {isAdmin ? 'Yeni Görev' : 'Kendime Görev Ekle'}
          </Button>
        </div>

        {/* Task List */}
        <TaskList />
      </div>
    </Layout>
  );
};
