import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useAdminIssueNotifications } from '../hooks/useIssueRealtime';
import type { Issue } from '../types/database';
import type { AssignIssueRequest } from '../types/api';
import { IssueList, IssueAssignmentModal } from '../components/issues';
import { NotificationBell } from '../components/common/NotificationBell';

export const AdminIssues: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { newIssueCount, clearNotifications } = useAdminIssueNotifications();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }

    fetchIssues();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('admin-issues-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'issues',
        },
        (payload) => {
          console.log('Issue change detected:', payload);
          fetchIssues();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, navigate]);

  const fetchIssues = async () => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/issues`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch issues');
      }

      const result = await response.json();
      setIssues(result.data || []);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (issueId: string, assignData: AssignIssueRequest) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/issues/${issueId}/assign`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(assignData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to assign issue');
      }

      await response.json();
      console.log('Issue assigned successfully');
      setShowAssignModal(false);
      setSelectedIssue(null);
      fetchIssues();
    } catch (error) {
      console.error('Error assigning issue:', error);
      throw error;
    }
  };

  const pendingIssues = issues.filter((i) => i.status === 'pending_assignment');
  const assignedIssues = issues.filter((i) => i.status !== 'pending_assignment');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sorun Yönetimi</h1>
            <p className="mt-2 text-sm text-gray-600">
              Bildirilen sorunları inceleyin ve görev olarak atayın
            </p>
          </div>
          <NotificationBell count={newIssueCount} onClick={clearNotifications} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Bekleyen</p>
              <p className="text-2xl font-bold text-gray-900">{pendingIssues.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Atandı</p>
              <p className="text-2xl font-bold text-gray-900">{assignedIssues.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Toplam</p>
              <p className="text-2xl font-bold text-gray-900">{issues.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Issues Section */}
      {pendingIssues.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Atama Bekleyen Sorunlar ({pendingIssues.length})
          </h2>
          <IssueList
            issues={pendingIssues}
            loading={loading && issues.length === 0}
            showActions={true}
            onAssign={handleAssignIssue}
            emptyMessage="Atama bekleyen sorun yok"
          />
        </div>
      )}

      {/* All Issues Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tüm Sorunlar</h2>
        <IssueList
          issues={issues}
          loading={loading}
          emptyMessage="Henüz sorun bildirimi yok"
        />
      </div>

      {/* Assignment Modal */}
      {selectedIssue && (
        <IssueAssignmentModal
          issue={selectedIssue}
          isOpen={showAssignModal}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedIssue(null);
          }}
          onAssign={handleAssignSubmit}
        />
      )}
    </div>
  );
};
