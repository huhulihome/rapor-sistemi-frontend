import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { Card } from '../common/Card';
import { LoadingSpinner } from '../common/LoadingSpinner';
import {
    ExclamationTriangleIcon,
    InformationCircleIcon,
    ExclamationCircleIcon,
    LightBulbIcon
} from '@heroicons/react/24/outline';

interface Recommendation {
    type: 'workload' | 'performance' | 'suggestion';
    severity: 'info' | 'warning' | 'critical';
    title: string;
    description: string;
    affectedUsers?: string[];
}

const fetchRecommendations = async (): Promise<Recommendation[]> => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) throw new Error('No active session');

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analytics/recommendations`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
    });

    if (!response.ok) throw new Error('Failed to fetch recommendations');

    const result = await response.json();
    return result.data;
};

const RecommendationIcon = ({ severity }: { severity: string }) => {
    const iconClass = "h-5 w-5";

    switch (severity) {
        case 'critical':
            return <ExclamationCircleIcon className={`${iconClass} text-red-500`} />;
        case 'warning':
            return <ExclamationTriangleIcon className={`${iconClass} text-orange-500`} />;
        default:
            return <InformationCircleIcon className={`${iconClass} text-blue-500`} />;
    }
};

const getSeverityStyles = (severity: string) => {
    switch (severity) {
        case 'critical':
            return 'border-red-200 bg-red-50';
        case 'warning':
            return 'border-orange-200 bg-orange-50';
        default:
            return 'border-blue-200 bg-blue-50';
    }
};

export const AIRecommendations = () => {
    const { data: recommendations, isLoading, error } = useQuery({
        queryKey: ['ai-recommendations'],
        queryFn: fetchRecommendations,
        refetchInterval: 120000, // Refetch every 2 minutes
    });

    if (isLoading) {
        return (
            <Card
                title="AI Önerileri"
                padding="md"
            >
                <div className="flex justify-center py-8">
                    <LoadingSpinner size="md" />
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card
                title="AI Önerileri"
                padding="md"
            >
                <p className="text-red-600 text-sm">Öneriler yüklenemedi.</p>
            </Card>
        );
    }

    return (
        <Card
            title="AI Önerileri"
            subtitle={recommendations?.length ? `${recommendations.length} öneri` : undefined}
            padding="md"
        >
            <div className="space-y-3 max-h-[350px] overflow-y-auto">
                {recommendations?.map((rec, index) => (
                    <div
                        key={index}
                        className={`p-3 rounded-lg border ${getSeverityStyles(rec.severity)}`}
                    >
                        <div className="flex items-start space-x-3">
                            <RecommendationIcon severity={rec.severity} />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm">{rec.title}</p>
                                <p className="text-xs text-gray-600 mt-1">{rec.description}</p>
                                {rec.affectedUsers && rec.affectedUsers.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-500">Etkilenen kişiler:</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {rec.affectedUsers.slice(0, 5).map((user, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-white/50 text-gray-700"
                                                >
                                                    {user}
                                                </span>
                                            ))}
                                            {rec.affectedUsers.length > 5 && (
                                                <span className="text-xs text-gray-500">
                                                    +{rec.affectedUsers.length - 5} daha
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {(!recommendations || recommendations.length === 0) && (
                    <div className="text-center py-8">
                        <LightBulbIcon className="h-12 w-12 text-green-400 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium">Her şey yolunda!</p>
                        <p className="text-gray-500 text-sm">Şu an için öneri bulunmuyor.</p>
                    </div>
                )}
            </div>
        </Card>
    );
};
