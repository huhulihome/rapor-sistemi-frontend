import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Issue } from '../types/database';
import type { CreateIssueRequest, AssignIssueRequest } from '../types/api';
import { IssueList, IssueForm, IssueAssignmentModal } from '../components/issues';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Layout } from '../components/common/Layout';
import { PlusIcon } from '@heroicons/react/24/outline';

export const Issues: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    fetchIssues();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('issues-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'issues',
        },
        () => {
          fetchIssues();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/issues`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
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

  const handleCreateIssue = async (issueData: CreateIssueRequest) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(issueData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create issue');
      }

      console.log('Issue created successfully');
      setShowCreateModal(false);
      fetchIssues();
    } catch (error) {
      console.error('Error creating issue:', error);
      throw error;
    }
  };

  const handleIssueClick = (issue: Issue) => {
    // Navigate to issue detail page (to be implemented)
    console.log('Issue clicked:', issue);
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

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(
        `${apiUrl}/api/issues/${issueId}/assign`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(assignData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Atama başarısız');
      }

      setShowAssignModal(false);
      setSelectedIssue(null);
      fetchIssues();
    } catch (error) {
      console.error('Error assigning issue:', error);
      throw error;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Sorun Bildirimleri</h1>
            <p className="mt-1 text-slate-400">
              Karşılaştığınız sorunları bildirin ve çözüm sürecini takip edin
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-orange-600 rounded-xl hover:from-red-500 hover:to-orange-500 hover:shadow-lg hover:shadow-red-500/25 hover:-translate-y-0.5 transition-all duration-200 [&>svg]:w-5 [&>svg]:h-5"
          >
            <PlusIcon className="h-5 w-5" />
            Yeni Sorun Bildir
          </Button>
        </div>

        {/* Issue List */}
        <IssueList
          issues={issues}
          loading={loading}
          showActions={isAdmin}
          onAssign={isAdmin ? handleAssignIssue : undefined}
          onIssueClick={handleIssueClick}
          emptyMessage="Henüz sorun bildirimi yok. İlk sorunu siz bildirin!"
        />

        {/* Create Issue Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Yeni Sorun Bildir"
        >
          <IssueForm
            onSubmit={handleCreateIssue}
            onCancel={() => setShowCreateModal(false)}
          />
        </Modal>

        {/* Assignment Modal - Only for admin */}
        {isAdmin && selectedIssue && (
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
    </Layout>
  );
};
