/**
 * System Monitoring Dashboard
 * Admin-only page for monitoring system health and metrics
 */

import { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface HealthCheck {
  status: string;
  timestamp: string;
  checks: {
    database: {
      status: string;
      responseTime: string;
      message: string;
    };
    email: {
      status: string;
      message: string;
    };
    memory: {
      status: string;
      heapUsed: string;
      heapTotal: string;
      percentage: string;
    };
    uptime: {
      status: string;
      seconds: number;
      formatted: string;
    };
  };
}

interface Metrics {
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  requestsByStatus: Record<number, number>;
  requestsByPath: Record<string, number>;
}

export function SystemMonitoring() {
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch health check
      const healthResponse = await fetch(`${apiUrl}/api/monitoring/health`);
      const healthData = await healthResponse.json();
      setHealth(healthData);

      // Fetch metrics
      const metricsResponse = await fetch(`${apiUrl}/api/monitoring/stats`);
      const metricsData = await metricsResponse.json();
      setMetrics(metricsData);
    } catch (err) {
      setError('Failed to fetch monitoring data');
      console.error('Monitoring error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !health) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchMonitoringData}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">System Monitoring</h1>
        <button
          onClick={fetchMonitoringData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {health?.checks && (
          <>
            <Card>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-600">Database</h3>
                  <StatusBadge status={health.checks.database.status} />
                </div>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {health.checks.database.responseTime}
                </p>
                <p className="text-sm text-gray-500">{health.checks.database.message}</p>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-600">Email Service</h3>
                  <StatusBadge status={health.checks.email.status} />
                </div>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {health.checks.email.status === 'ok' ? '✓' : '✗'}
                </p>
                <p className="text-sm text-gray-500">{health.checks.email.message}</p>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-600">Memory Usage</h3>
                  <StatusBadge status={health.checks.memory.status} />
                </div>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {health.checks.memory.percentage}
                </p>
                <p className="text-sm text-gray-500">
                  {health.checks.memory.heapUsed} / {health.checks.memory.heapTotal}
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-600">Uptime</h3>
                  <StatusBadge status={health.checks.uptime.status} />
                </div>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {health.checks.uptime.formatted}
                </p>
                <p className="text-sm text-gray-500">
                  {health.checks.uptime.seconds} seconds
                </p>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Request Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-600">Total Requests</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {metrics.totalRequests.toLocaleString()}
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-600">Avg Response Time</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {metrics.averageResponseTime}ms
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-600">Error Rate</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {metrics.errorRate.toFixed(2)}%
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Requests by Status */}
      {metrics?.requestsByStatus && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Requests by Status Code
            </h2>
            <div className="space-y-3">
              {Object.entries(metrics.requestsByStatus)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${
                          Number(status) < 300
                            ? 'bg-green-100 text-green-800'
                            : Number(status) < 400
                            ? 'bg-blue-100 text-blue-800'
                            : Number(status) < 500
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {status}
                      </span>
                      <span className="text-gray-600">
                        {getStatusDescription(Number(status))}
                      </span>
                    </div>
                    <span className="text-gray-900 font-semibold">
                      {count.toLocaleString()}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </Card>
      )}

      {/* Top Endpoints */}
      {metrics?.requestsByPath && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Top Endpoints
            </h2>
            <div className="space-y-3">
              {Object.entries(metrics.requestsByPath)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([path, count]) => (
                  <div key={path} className="flex items-center justify-between">
                    <span className="text-gray-600 font-mono text-sm">{path}</span>
                    <span className="text-gray-900 font-semibold">
                      {count.toLocaleString()}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </Card>
      )}

      {/* Last Updated */}
      {health && (
        <div className="text-center text-sm text-gray-500">
          Last updated: {new Date(health.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    ok: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    not_configured: 'bg-gray-100 text-gray-800',
  };

  const color = colors[status as keyof typeof colors] || colors.error;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {status}
    </span>
  );
}

function getStatusDescription(status: number): string {
  if (status < 300) return 'Success';
  if (status < 400) return 'Redirect';
  if (status < 500) return 'Client Error';
  return 'Server Error';
}
