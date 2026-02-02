import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { Card } from '../common/Card';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface TagData {
    tag: string;
    total: number;
    completed: number;
    active: number;
    completionRate: number;
}

const fetchTagDistribution = async (): Promise<TagData[]> => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        throw new Error('No active session');
    }

    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/analytics/tag-distribution`,
        {
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error('Failed to fetch tag distribution');
    }

    const result = await response.json();
    return result.data;
};

// Pre-defined colors for tags
const TAG_COLORS = [
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
    '#6366f1', // indigo
];

export const TagDistributionChart = () => {
    const { data: tagData, isLoading, error } = useQuery({
        queryKey: ['tag-distribution'],
        queryFn: fetchTagDistribution,
        refetchInterval: 60000,
    });

    if (isLoading) {
        return (
            <Card title="Etiketlere Göre İş Dağılımı" padding="md">
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner size="md" />
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card title="Etiketlere Göre İş Dağılımı" padding="md">
                <div className="text-center text-red-400 py-8">
                    Grafik yüklenirken bir hata oluştu.
                </div>
            </Card>
        );
    }

    if (!tagData || tagData.length === 0) {
        return (
            <Card title="Etiketlere Göre İş Dağılımı" padding="md">
                <div className="text-center text-slate-400 py-8">
                    Henüz etiketli görev bulunmuyor.
                </div>
            </Card>
        );
    }

    const totalTasks = tagData.reduce((sum, t) => sum + t.total, 0);
    const topTags = tagData.slice(0, 8); // Show top 8 tags

    // Calculate pie chart segments
    let currentAngle = 0;
    const segments = topTags.map((tag, index) => {
        const percentage = (tag.total / totalTasks) * 100;
        const angle = (percentage / 100) * 360;
        const startAngle = currentAngle;
        currentAngle += angle;

        return {
            ...tag,
            color: TAG_COLORS[index % TAG_COLORS.length],
            percentage,
            startAngle,
            endAngle: currentAngle,
        };
    });

    // Create SVG pie chart
    const createArcPath = (startAngle: number, endAngle: number, radius: number = 80) => {
        const startRad = (startAngle - 90) * (Math.PI / 180);
        const endRad = (endAngle - 90) * (Math.PI / 180);

        const x1 = 100 + radius * Math.cos(startRad);
        const y1 = 100 + radius * Math.sin(startRad);
        const x2 = 100 + radius * Math.cos(endRad);
        const y2 = 100 + radius * Math.sin(endRad);

        const largeArc = endAngle - startAngle > 180 ? 1 : 0;

        return `M 100 100 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    };

    return (
        <Card title="Etiketlere Göre İş Dağılımı" padding="md">
            <div className="flex flex-col lg:flex-row items-center gap-6">
                {/* Pie Chart */}
                <div className="relative w-52 h-52 shrink-0">
                    <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-0">
                        {segments.map((segment) => (
                            <path
                                key={segment.tag}
                                d={createArcPath(segment.startAngle, segment.endAngle)}
                                fill={segment.color}
                                className="hover:opacity-80 transition-opacity cursor-pointer"
                                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                            >
                                <title>{segment.tag}: {segment.total} görev (%{Math.round(segment.percentage)})</title>
                            </path>
                        ))}
                        {/* Center circle for donut effect */}
                        <circle cx="100" cy="100" r="45" fill="#1e293b" />
                        <text x="100" y="95" textAnchor="middle" className="fill-white text-xl font-bold">
                            {totalTasks}
                        </text>
                        <text x="100" y="115" textAnchor="middle" className="fill-slate-400 text-xs">
                            Toplam
                        </text>
                    </svg>
                </div>

                {/* Legend */}
                <div className="flex-1 grid grid-cols-2 gap-2 w-full">
                    {segments.map((segment) => (
                        <div
                            key={segment.tag}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
                        >
                            <div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: segment.color }}
                            />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm text-white truncate">{segment.tag}</p>
                                <p className="text-xs text-slate-400">
                                    {segment.total} görev • %{Math.round(segment.percentage)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Completion Stats */}
            <div className="mt-4 pt-4 border-t border-white/10">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-lg font-bold text-emerald-400">
                            {tagData.reduce((sum, t) => sum + t.completed, 0)}
                        </p>
                        <p className="text-xs text-slate-400">Tamamlanan</p>
                    </div>
                    <div>
                        <p className="text-lg font-bold text-blue-400">
                            {tagData.reduce((sum, t) => sum + t.active, 0)}
                        </p>
                        <p className="text-xs text-slate-400">Aktif</p>
                    </div>
                    <div>
                        <p className="text-lg font-bold text-purple-400">
                            {tagData.length}
                        </p>
                        <p className="text-xs text-slate-400">Etiket</p>
                    </div>
                </div>
            </div>
        </Card>
    );
};
