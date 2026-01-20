import { useAuth } from '../contexts/AuthContext';

export const AdminDashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.profile?.full_name || user?.email}
              </span>
              <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
                Admin
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Yönetici Paneli
            </h2>
            <p className="text-gray-600">
              Bu sayfa sadece admin rolüne sahip kullanıcılar tarafından görüntülenebilir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Kullanıcı Yönetimi</h3>
              <p className="text-gray-600 text-sm">Kullanıcıları görüntüle ve yönet</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sorun Yönetimi</h3>
              <p className="text-gray-600 text-sm">Bekleyen sorunları incele ve ata</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Raporlar</h3>
              <p className="text-gray-600 text-sm">Sistem raporlarını görüntüle</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
