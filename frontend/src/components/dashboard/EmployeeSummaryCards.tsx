import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { Card } from '../common/Card';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface EmployeeSummary {
    id: string;
    full_name: string;
    email: string;
    role: string;
    job_description?: string;
    score: number;
    weekly_hours: number;
    avatar_url?: string;
    activeTasks: number;
    completedThisWeek: number;
    lateTasks: number;
    overdueTasks: number;
}

const fetchEmployeesSummary = async (): Promise<EmployeeSummary[]> => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) throw new Error('No active session');

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analytics/employees-summary`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
    });

    if (!response.ok) throw new Error('Failed to fetch employees summary');

    const result = await response.json();
    return result.data;
};

const ScoreBadge = ({ score }: { score: number }) => {
    const getScoreColor = (s: number) => {
        if (s >= 90) return 'bg-green-100 text-green-800';
        if (s >= 70) return 'bg-yellow-100 text-yellow-800';
        if (s >= 50) return 'bg-orange-100 text-orange-800';
        return 'bg-red-100 text-red-800';
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(score)}`}>
            {score} puan
        </span>
    );
};

export const EmployeeSummaryCards = () => {
    const { data: employees, isLoading, error } = useQuery({
        queryKey: ['employees-summary'],
        queryFn: fetchEmployeesSummary,
        refetchInterval: 60000, // Refetch every minute
    });

    if (isLoading) {
        return (
            <Card title="Çalışan Özeti" padding="md">
                <div className="flex justify-center py-8">
                    <LoadingSpinner size="md" />
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card title="Çalışan Özeti" padding="md">
                <p className="text-red-600 text-sm">Çalışan verileri yüklenemedi.</p>
            </Card>
        );
    }

    const sortedEmployees = [...(employees || [])].sort((a, b) => b.activeTasks - a.activeTasks);

    return (
        <Card title="Çalışan Özeti" subtitle={`${employees?.length || 0} çalışan`} padding="md">
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {sortedEmployees.map((employee) => (
                    <div
                        key={employee.id}
                        className={`p-3 rounded-lg border ${employee.overdueTasks > 0
                                ? 'border-red-200 bg-red-50'
                                : 'border-gray-200 bg-white'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                    {employee.full_name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{employee.full_name}</p>
                                    <p className="text-xs text-gray-500">{employee.job_description || employee.email}</p>
                                </div>
                            </div>
                            <ScoreBadge score={employee.score || 100} />
                        </div>

                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                            <div className="bg-blue-50 rounded p-1.5">
                                <p className="font-semibold text-blue-700">{employee.activeTasks}</p>
                                <p className="text-blue-600">Aktif</p>
                            </div>
                            <div className="bg-green-50 rounded p-1.5">
                                <p className="font-semibold text-green-700">{employee.completedThisWeek}</p>
                                <p className="text-green-600">Bu Hafta</p>
                            </div>
                            <div className={`rounded p-1.5 ${employee.lateTasks > 0 ? 'bg-orange-50' : 'bg-gray-50'}`}>
                                <p className={`font-semibold ${employee.lateTasks > 0 ? 'text-orange-700' : 'text-gray-700'}`}>
                                    {employee.lateTasks}
                                </p>
                                <p className={employee.lateTasks > 0 ? 'text-orange-600' : 'text-gray-600'}>Geç</p>
                            </div>
                            <div className={`rounded p-1.5 ${employee.overdueTasks > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                                <p className={`font-semibold ${employee.overdueTasks > 0 ? 'text-red-700' : 'text-gray-700'}`}>
                                    {employee.overdueTasks}
                                </p>
                                <p className={employee.overdueTasks > 0 ? 'text-red-600' : 'text-gray-600'}>Geciken</p>
                            </div>
                        </div>
                    </div>
                ))}

                {(!employees || employees.length === 0) && (
                    <p className="text-gray-500 text-center py-4">Henüz çalışan bulunmuyor.</p>
                )}
            </div>
        </Card>
    );
};
