// Export utilities for CSV and PDF generation

export interface ExportTask {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: string;
  status: string;
  progress_percentage: number;
  assigned_to_profile?: {
    full_name: string;
    email: string;
  };
  created_by_profile?: {
    full_name: string;
  };
  due_date?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Export tasks to CSV format
 */
export const exportToCSV = (tasks: ExportTask[], filename: string = 'tasks-export.csv') => {
  // Define CSV headers
  const headers = [
    'ID',
    'Başlık',
    'Açıklama',
    'Kategori',
    'Öncelik',
    'Durum',
    'İlerleme (%)',
    'Atanan Kişi',
    'Oluşturan',
    'Bitiş Tarihi',
    'Oluşturulma Tarihi',
    'Güncellenme Tarihi'
  ];

  // Convert tasks to CSV rows
  const rows = tasks.map(task => [
    task.id,
    task.title,
    task.description || '',
    translateCategory(task.category),
    translatePriority(task.priority),
    translateStatus(task.status),
    task.progress_percentage,
    task.assigned_to_profile?.full_name || '',
    task.created_by_profile?.full_name || '',
    task.due_date ? new Date(task.due_date).toLocaleDateString('tr-TR') : '',
    new Date(task.created_at).toLocaleDateString('tr-TR'),
    new Date(task.updated_at).toLocaleDateString('tr-TR')
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  // Add BOM for proper UTF-8 encoding in Excel
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export tasks to PDF format (simplified HTML-based approach)
 */
export const exportToPDF = (tasks: ExportTask[], _filename: string = 'tasks-report.pdf') => {
  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Görev Raporu</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        h1 {
          color: #2563eb;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 10px;
        }
        .summary {
          background: #f3f4f6;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .summary-item {
          display: inline-block;
          margin-right: 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background: #2563eb;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: 600;
        }
        td {
          padding: 10px;
          border-bottom: 1px solid #e5e7eb;
        }
        tr:hover {
          background: #f9fafb;
        }
        .priority-critical { color: #dc2626; font-weight: bold; }
        .priority-high { color: #ea580c; font-weight: bold; }
        .priority-medium { color: #ca8a04; }
        .priority-low { color: #16a34a; }
        .status-completed { color: #16a34a; }
        .status-in-progress { color: #2563eb; }
        .status-blocked { color: #dc2626; }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <h1>Görev Raporu</h1>
      <p>Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</p>
      
      <div class="summary">
        <div class="summary-item">
          <strong>Toplam Görev:</strong> ${tasks.length}
        </div>
        <div class="summary-item">
          <strong>Tamamlanan:</strong> ${tasks.filter(t => t.status === 'completed').length}
        </div>
        <div class="summary-item">
          <strong>Devam Eden:</strong> ${tasks.filter(t => t.status === 'in_progress').length}
        </div>
        <div class="summary-item">
          <strong>Tamamlanma Oranı:</strong> ${Math.round(
            (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100
          )}%
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Başlık</th>
            <th>Kategori</th>
            <th>Öncelik</th>
            <th>Durum</th>
            <th>İlerleme</th>
            <th>Atanan</th>
            <th>Bitiş Tarihi</th>
          </tr>
        </thead>
        <tbody>
          ${tasks.map(task => `
            <tr>
              <td><strong>${escapeHtml(task.title)}</strong></td>
              <td>${translateCategory(task.category)}</td>
              <td class="priority-${task.priority}">${translatePriority(task.priority)}</td>
              <td class="status-${task.status.replace('_', '-')}">${translateStatus(task.status)}</td>
              <td>${task.progress_percentage}%</td>
              <td>${escapeHtml(task.assigned_to_profile?.full_name || '-')}</td>
              <td>${task.due_date ? new Date(task.due_date).toLocaleDateString('tr-TR') : '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>Modern Office System - Görev Yönetim Raporu</p>
      </div>
    </body>
    </html>
  `;

  // Create a new window and print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};

/**
 * Generate custom report with specific fields
 */
export const generateCustomReport = (
  tasks: ExportTask[],
  _fields: string[],
  format: 'csv' | 'pdf',
  filename?: string
) => {
  // Export using the selected format
  if (format === 'csv') {
    exportToCSV(tasks, filename);
  } else {
    exportToPDF(tasks, filename);
  }
};

// Helper functions
function translateCategory(category: string): string {
  const translations: Record<string, string> = {
    routine: 'Rutin',
    project: 'Proje',
    one_time: 'Tek Seferlik',
    issue_resolution: 'Sorun Çözümü'
  };
  return translations[category] || category;
}

function translatePriority(priority: string): string {
  const translations: Record<string, string> = {
    low: 'Düşük',
    medium: 'Orta',
    high: 'Yüksek',
    critical: 'Kritik'
  };
  return translations[priority] || priority;
}

function translateStatus(status: string): string {
  const translations: Record<string, string> = {
    not_started: 'Başlamadı',
    in_progress: 'Devam Ediyor',
    completed: 'Tamamlandı',
    blocked: 'Engellendi'
  };
  return translations[status] || status;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
