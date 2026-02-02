import { useState, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ArrowDownTrayIcon, DocumentTextIcon, TableCellsIcon } from '@heroicons/react/24/outline';
import { exportToCSV, exportToPDF, type ExportTask } from '../../utils/exportUtils';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface ExportMenuProps {
  tasks: ExportTask[];
  disabled?: boolean;
}

export const ExportMenu = ({ tasks, disabled = false }: ExportMenuProps) => {
  const [showCustomExport, setShowCustomExport] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'title',
    'category',
    'priority',
    'status',
    'assigned_to_profile',
    'due_date'
  ]);

  const availableFields = [
    { key: 'title', label: 'Başlık' },
    { key: 'description', label: 'Açıklama' },
    { key: 'category', label: 'Kategori' },
    { key: 'priority', label: 'Öncelik' },
    { key: 'status', label: 'Durum' },
    { key: 'progress_percentage', label: 'İlerleme' },
    { key: 'assigned_to_profile', label: 'Atanan Kişi' },
    { key: 'created_by_profile', label: 'Oluşturan' },
    { key: 'due_date', label: 'Bitiş Tarihi' },
    { key: 'created_at', label: 'Oluşturulma Tarihi' },
    { key: 'updated_at', label: 'Güncellenme Tarihi' },
  ];

  const handleExportCSV = () => {
    const filename = `gorevler-${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(tasks, filename);
  };

  const handleExportPDF = () => {
    const filename = `gorev-raporu-${new Date().toISOString().split('T')[0]}.pdf`;
    exportToPDF(tasks, filename);
  };

  const handleCustomExport = (format: 'csv' | 'pdf') => {
    const filename = format === 'csv' 
      ? `gorevler-ozel-${new Date().toISOString().split('T')[0]}.csv`
      : `gorev-raporu-ozel-${new Date().toISOString().split('T')[0]}.pdf`;
    
    if (format === 'csv') {
      exportToCSV(tasks, filename);
    } else {
      exportToPDF(tasks, filename);
    }
    
    setShowCustomExport(false);
  };

  const toggleField = (fieldKey: string) => {
    setSelectedFields(prev =>
      prev.includes(fieldKey)
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button
          as={Button}
          variant="secondary"
          disabled={disabled || tasks.length === 0}
        >
          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
          Dışa Aktar
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleExportCSV}
                    className={`${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    } group flex items-center w-full px-4 py-2 text-sm`}
                  >
                    <TableCellsIcon className="mr-3 h-5 w-5 text-gray-400" />
                    CSV olarak indir
                  </button>
                )}
              </Menu.Item>

              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleExportPDF}
                    className={`${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    } group flex items-center w-full px-4 py-2 text-sm`}
                  >
                    <DocumentTextIcon className="mr-3 h-5 w-5 text-gray-400" />
                    PDF raporu oluştur
                  </button>
                )}
              </Menu.Item>

              <div className="border-t border-gray-100 my-1" />

              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => setShowCustomExport(true)}
                    className={`${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    } group flex items-center w-full px-4 py-2 text-sm`}
                  >
                    <ArrowDownTrayIcon className="mr-3 h-5 w-5 text-gray-400" />
                    Özel rapor oluştur
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>

      {/* Custom Export Modal */}
      <Modal
        isOpen={showCustomExport}
        onClose={() => setShowCustomExport(false)}
        title="Özel Rapor Oluştur"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Rapora dahil etmek istediğiniz alanları seçin:
          </p>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {availableFields.map(field => (
              <label key={field.key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedFields.includes(field.key)}
                  onChange={() => toggleField(field.key)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{field.label}</span>
              </label>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Format seçin:</p>
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => handleCustomExport('csv')}
                disabled={selectedFields.length === 0}
              >
                <TableCellsIcon className="h-5 w-5 mr-2" />
                CSV
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleCustomExport('pdf')}
                disabled={selectedFields.length === 0}
              >
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                PDF
              </Button>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => setShowCustomExport(false)}
            >
              İptal
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
