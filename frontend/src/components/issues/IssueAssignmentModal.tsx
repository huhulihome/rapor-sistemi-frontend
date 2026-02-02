import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import type { Issue, Profile } from '../../types/database';
import type { AssignIssueRequest } from '../../types/api';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';

interface IssueAssignmentModalProps {
  issue: Issue & {
    reported_by_profile?: { id: string; full_name: string; email: string; avatar_url?: string };
    suggested_assignee_profile?: { id: string; full_name: string; email: string; avatar_url?: string };
  };
  isOpen: boolean;
  onClose: () => void;
  onAssign: (issueId: string, assignData: AssignIssueRequest) => Promise<void>;
}

const priorityLabels = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
  critical: 'Kritik',
};

export const IssueAssignmentModal: React.FC<IssueAssignmentModalProps> = ({
  issue,
  isOpen,
  onClose,
  onAssign,
}) => {
  const [selectedAssignee, setSelectedAssignee] = useState(issue.suggested_assignee_id);
  const [editedTitle, setEditedTitle] = useState(issue.title);
  const [editedDescription, setEditedDescription] = useState(issue.description);
  const [editedPriority, setEditedPriority] = useState(issue.priority);
  const [employees, setEmployees] = useState<Partial<Profile>[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      // Reset form when modal opens
      setSelectedAssignee(issue.suggested_assignee_id);
      setEditedTitle(issue.title);
      setEditedDescription(issue.description);
      setEditedPriority(issue.priority);
      setError(null);
    }
  }, [isOpen, issue]);

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, department, role')
        .order('full_name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Çalışanlar yüklenirken hata oluştu');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);

    if (!selectedAssignee) {
      setError('Lütfen atanacak kişiyi seçin');
      return;
    }

    if (!editedTitle.trim()) {
      setError('Başlık boş olamaz');
      return;
    }

    if (!editedDescription.trim()) {
      setError('Açıklama boş olamaz');
      return;
    }

    try {
      setLoading(true);

      const assignData: AssignIssueRequest = {
        assignee_id: selectedAssignee,
      };

      // Only include edited fields if they changed
      const hasChanges =
        editedTitle !== issue.title ||
        editedDescription !== issue.description ||
        editedPriority !== issue.priority;

      if (hasChanges) {
        assignData.edited_issue = {
          title: editedTitle,
          description: editedDescription,
          priority: editedPriority,
        };
      }

      await onAssign(issue.id, assignData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Atama sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const suggestedEmployee = employees.find((e) => e.id === issue.suggested_assignee_id);
  const isSuggestedAssignee = selectedAssignee === issue.suggested_assignee_id;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sorun Ataması">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Suggested Assignee Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Önerilen Kişi</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  <strong>{suggestedEmployee?.full_name || 'Bilinmiyor'}</strong>
                  {suggestedEmployee?.department && ` (${suggestedEmployee.department})`}
                </p>
                <p className="text-xs mt-1">
                  {issue.reported_by_profile?.full_name} tarafından önerildi
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Title */}
        <div>
          <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-2">
            Sorun Başlığı
          </label>
          <Input
            id="edit-title"
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Edit Description */}
        <div>
          <label
            htmlFor="edit-description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Sorun Açıklaması
          </label>
          <textarea
            id="edit-description"
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            disabled={loading}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Edit Priority */}
        <div>
          <label htmlFor="edit-priority" className="block text-sm font-medium text-gray-700 mb-2">
            Öncelik
          </label>
          <select
            id="edit-priority"
            value={editedPriority}
            onChange={(e) =>
              setEditedPriority(e.target.value as 'low' | 'medium' | 'high' | 'critical')
            }
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="low">{priorityLabels.low}</option>
            <option value="medium">{priorityLabels.medium}</option>
            <option value="high">{priorityLabels.high}</option>
            <option value="critical">{priorityLabels.critical}</option>
          </select>
        </div>

        {/* Select Assignee */}
        <div>
          <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-2">
            Atanacak Kişi <span className="text-red-500">*</span>
          </label>
          {loadingEmployees ? (
            <div className="text-sm text-gray-500">Çalışanlar yükleniyor...</div>
          ) : (
            <select
              id="assignee"
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name}
                  {emp.id === issue.suggested_assignee_id && ' (Önerilen)'}
                  {emp.department && ` - ${emp.department}`}
                </option>
              ))}
            </select>
          )}
          {isSuggestedAssignee && (
            <p className="mt-1 text-sm text-green-600">
              ✓ Önerilen kişiye atanacak
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            İptal
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={loading || loadingEmployees}
          >
            {loading ? 'Atanıyor...' : 'Görevi Ata'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
