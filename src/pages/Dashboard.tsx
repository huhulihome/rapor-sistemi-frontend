import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/common/Layout';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import type { ActivityItem } from '../components/dashboard/RecentActivity';
import { TagDistributionChart } from '../components/dashboard/TagDistributionChart';
import { UserWorkloadChart } from '../components/dashboard/UserWorkloadChart';
import { IssuePriorityChart } from '../components/dashboard/IssuePriorityChart';
import { EmployeeSummaryCards } from '../components/dashboard/EmployeeSummaryCards';
import { AIRecommendations } from '../components/dashboard/AIRecommendations';
import { DeadlineTimeline } from '../components/dashboard/DeadlineTimeline';
import { PersonalTodoList } from '../components/dashboard/PersonalTodoList';
import { Card } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';
import { ChartBarIcon } from '@heroicons/react/24/outline';

interface DashboardMetrics {
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
    completionRate: number;
    byPriority: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
    byStatus: {
      not_started: number;
      in_progress: number;
      completed: number;
      blocked: number;
    };
  };
  issues: {
    total: number;
    pending: number;
    byPriority: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
    byStatus: {
      pending_assignment: number;
      assigned: number;
      in_progress: number;
      resolved: number;
      closed: number;
    };
  };
}

const fetchDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No active session');
  }

  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analytics/dashboard`, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard metrics');
  }

  const result = await response.json();
  return result.data;
};

export const Dashboard = () => {
  const { user, isAdmin } = useAuth();

  // Fetch dashboard metrics
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: fetchDashboardMetrics,
    refetchInterval: 60000, // Refetch every 60 seconds (reduced from 30s to prevent rate limiting)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const stats = {
    totalTasks: metrics?.tasks.total || 0,
    completedTasks: metrics?.tasks.completed || 0,
    pendingIssues: metrics?.issues.pending || 0,
    overdueTasks: metrics?.tasks.overdue || 0,
  };

  // Mock activity data - will be replaced with real data from API
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'task_completed',
      title: 'Görev Tamamlandı',
      description: 'Aylık rapor hazırlama görevi tamamlandı',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      user: { name: user?.profile?.full_name || 'Kullanıcı' }
    },
    {
      id: '2',
      type: 'issue_reported',
      title: 'Yeni Sorun Bildirildi',
      description: 'Yazıcı bağlantı sorunu bildirildi',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      user: { name: 'Ahmet Yılmaz' }
    },
    {
      id: '3',
      type: 'task_created',
      title: 'Yeni Görev Oluşturuldu',
      description: 'Haftalık toplantı notları hazırlama',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      user: { name: 'Ayşe Demir' }
    }
  ];

  return (
    <Layout>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" message="Yükleniyor..." />
        </div>
      ) : error ? (
        <div className="glass-card p-4 border-red-500/20">
          <p className="text-red-400">Metrikler yüklenirken bir hata oluştu.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Hoş Geldiniz, <span className="gradient-text">{user?.profile?.full_name || user?.email?.split('@')[0]}</span>!
              </h1>
              <p className="mt-2 text-slate-400">
                {isAdmin ? '📊 Yönetici Paneli' : '📋 Görev Yönetim Sistemi'}
              </p>
            </div>
            <Link
              to="/analytics"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 transition-all duration-200 [&>svg]:w-5 [&>svg]:h-5"
            >
              <ChartBarIcon className="h-5 w-5" />
              Detaylı Analitik
            </Link>
          </div>

          {/* Stats Cards */}
          <DashboardStats stats={stats} />

          {/* Charts Section - Tag Distribution instead of Task Completion */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TagDistributionChart />
            <IssuePriorityChart />
          </div>

          {/* User Workload Chart (Admin Only) */}
          {isAdmin && (
            <UserWorkloadChart />
          )}

          {/* Deadline Timeline */}
          <DeadlineTimeline />

          {/* Personal To-Do List */}
          <PersonalTodoList />

          {/* Admin Only: Employee Summary and AI Recommendations */}
          {isAdmin && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EmployeeSummaryCards />
              <AIRecommendations />
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity - Takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              <RecentActivity activities={activities} maxItems={5} />
            </div>

            {/* Quick Info Card */}
            <div>
              <Card title="Hızlı Bilgiler" padding="md">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-400">Email</p>
                    <p className="text-base font-medium text-white">{user?.email}</p>
                  </div>

                  {user?.profile?.department && (
                    <div>
                      <p className="text-sm text-slate-400">Departman</p>
                      <p className="text-base font-medium text-white">
                        {user.profile.department}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-slate-400">Rol</p>
                    <p className="text-base font-medium text-white">
                      {isAdmin ? 'Yönetici' : 'Çalışan'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-slate-400">Hesap Durumu</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 mt-1">
                      Aktif
                    </span>
                  </div>

                  {/* Additional Metrics */}
                  {metrics && (
                    <>
                      <div className="pt-4 border-t border-white/10">
                        <p className="text-sm text-slate-400 mb-2">Görev Tamamlama Oranı</p>
                        <div className="flex items-center">
                          <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${metrics.tasks.completionRate}%` }}
                            />
                          </div>
                          <span className="ml-2 text-sm font-medium text-white">
                            {metrics.tasks.completionRate}%
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/10">
                        <p className="text-sm text-slate-400 mb-2">Görev Durumu</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Devam Eden:</span>
                            <span className="font-medium text-white">{metrics.tasks.inProgress}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Tamamlanan:</span>
                            <span className="font-medium text-emerald-400">{metrics.tasks.completed}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Geciken:</span>
                            <span className="font-medium text-red-400">{metrics.tasks.overdue}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
