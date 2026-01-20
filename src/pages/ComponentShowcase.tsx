import { useState } from 'react';
import { Layout } from '../components/common/Layout';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Card } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/ToastContainer';

/**
 * Component Showcase Page - For testing and demonstrating UI components
 * This page is for development purposes only
 */
export const ComponentShowcase = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleButtonClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('İşlem Başarılı', 'Buton tıklaması başarıyla işlendi');
    }, 2000);
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Component Showcase</h1>
          <p className="mt-2 text-gray-600">
            Tüm UI componentlerinin test ve gösterim sayfası
          </p>
        </div>

        {/* Buttons */}
        <Card title="Buttons" subtitle="Farklı varyant ve boyutlarda butonlar">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="danger">Danger Button</Button>
              <Button variant="ghost">Ghost Button</Button>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button loading={loading} onClick={handleButtonClick}>
                {loading ? 'Yükleniyor...' : 'Loading Test'}
              </Button>
              <Button disabled>Disabled Button</Button>
            </div>
          </div>
        </Card>

        {/* Inputs */}
        <Card title="Inputs" subtitle="Form input componentleri">
          <div className="space-y-4 max-w-md">
            <Input
              label="Normal Input"
              placeholder="Bir şeyler yazın..."
            />
            
            <Input
              label="Required Input"
              placeholder="Zorunlu alan"
              required
            />
            
            <Input
              label="Input with Error"
              error="Bu alan gereklidir"
              placeholder="Hatalı input"
            />
            
            <Input
              label="Input with Helper Text"
              helperText="Bu bir yardımcı metindir"
              placeholder="Helper text örneği"
            />
            
            <Input
              label="Disabled Input"
              disabled
              value="Disabled değer"
            />
          </div>
        </Card>

        {/* Modal */}
        <Card title="Modal" subtitle="Modal dialog componentleri">
          <div className="space-y-4">
            <Button onClick={() => setModalOpen(true)}>
              Modal Aç
            </Button>
            
            <Modal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              title="Örnek Modal"
              size="md"
            >
              <div className="space-y-4">
                <p className="text-gray-600">
                  Bu bir örnek modal içeriğidir. Modal componentleri farklı boyutlarda
                  ve içeriklerle kullanılabilir.
                </p>
                
                <div className="flex justify-end space-x-3">
                  <Button variant="secondary" onClick={() => setModalOpen(false)}>
                    İptal
                  </Button>
                  <Button onClick={() => {
                    toast.info('Modal Onaylandı', 'Modal içeriği onaylandı');
                    setModalOpen(false);
                  }}>
                    Onayla
                  </Button>
                </div>
              </div>
            </Modal>
          </div>
        </Card>

        {/* Loading Spinner */}
        <Card title="Loading Spinner" subtitle="Yükleme göstergeleri">
          <div className="flex flex-wrap gap-8 items-center">
            <div className="text-center">
              <LoadingSpinner size="sm" />
              <p className="mt-2 text-sm text-gray-600">Small</p>
            </div>
            
            <div className="text-center">
              <LoadingSpinner size="md" />
              <p className="mt-2 text-sm text-gray-600">Medium</p>
            </div>
            
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-2 text-sm text-gray-600">Large</p>
            </div>
            
            <div className="text-center">
              <LoadingSpinner size="md" message="Yükleniyor..." />
              <p className="mt-2 text-sm text-gray-600">With Message</p>
            </div>
          </div>
        </Card>

        {/* Toast Notifications */}
        <Card title="Toast Notifications" subtitle="Bildirim mesajları">
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => toast.success('Başarılı!', 'İşlem başarıyla tamamlandı')}>
              Success Toast
            </Button>
            <Button onClick={() => toast.error('Hata!', 'Bir hata oluştu')}>
              Error Toast
            </Button>
            <Button onClick={() => toast.warning('Uyarı!', 'Dikkat edilmesi gereken bir durum')}>
              Warning Toast
            </Button>
            <Button onClick={() => toast.info('Bilgi', 'Bilgilendirme mesajı')}>
              Info Toast
            </Button>
          </div>
        </Card>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Basic Card" padding="md">
            <p className="text-gray-600">
              Bu temel bir card componentidir. Başlık, içerik ve footer içerebilir.
            </p>
          </Card>
          
          <Card
            title="Card with Footer"
            subtitle="Alt bilgi içeren card"
            padding="md"
            footer={
              <div className="flex justify-end">
                <Button size="sm">Action</Button>
              </div>
            }
          >
            <p className="text-gray-600">
              Bu card bir footer içerir.
            </p>
          </Card>
          
          <Card hoverable padding="md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Hoverable Card
            </h3>
            <p className="text-gray-600">
              Bu card üzerine gelindiğinde gölge efekti gösterir.
            </p>
          </Card>
          
          <Card padding="none">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Padding Card
              </h3>
              <p className="text-gray-600">
                Bu card padding yok olarak ayarlanmış, içerik manuel padding ile kontrol edilir.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
