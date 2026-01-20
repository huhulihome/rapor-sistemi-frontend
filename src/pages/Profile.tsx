import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { Layout } from '../components/common/Layout';
import { CameraIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    department: '',
    email_notifications: true,
    push_notifications: true
  });

  useEffect(() => {
    if (user?.profile) {
      setFormData({
        full_name: user.profile.full_name,
        department: user.profile.department || '',
        email_notifications: user.profile.notification_preferences?.email ?? true,
        push_notifications: user.profile.notification_preferences?.push ?? true
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          department: formData.department || null,
          notification_preferences: {
            email: formData.email_notifications,
            push: formData.push_notifications
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', user!.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profil başarıyla güncellendi' });

      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Profil güncellenirken bir hata oluştu' });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setMessage(null);

      if (!e.target.files || e.target.files.length === 0) {
        return;
      }

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user!.id);

      if (updateError) throw updateError;

      setMessage({ type: 'success', text: 'Avatar başarıyla yüklendi' });
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Avatar yüklenirken bir hata oluştu' });
    } finally {
      setUploading(false);
    }
  };

  const inputClass = "w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const labelClass = "block text-sm font-medium text-slate-300 mb-2";

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Profil Ayarları</h1>
          <p className="mt-1 text-sm text-slate-400">
            Kişisel bilgilerinizi ve bildirim tercihlerinizi yönetin
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`flex items-center gap-3 p-4 rounded-xl ${message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}>
            {message.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
            ) : (
              <XCircleIcon className="w-5 h-5 flex-shrink-0" />
            )}
            {message.text}
          </div>
        )}

        {/* Avatar Section */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Profil Fotoğrafı</h3>
          <div className="flex items-center space-x-6">
            <div className="relative group">
              {user?.profile?.avatar_url ? (
                <img
                  src={user.profile.avatar_url}
                  alt="Avatar"
                  className="h-24 w-24 rounded-xl object-cover border-2 border-white/10"
                />
              ) : (
                <div className="h-24 w-24 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {user?.profile?.full_name?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
              )}
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
              >
                <CameraIcon className="w-8 h-8 text-white" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
                className="hidden"
              />
            </div>
            <div>
              <label
                htmlFor="avatar-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                {uploading ? 'Yükleniyor...' : 'Fotoğraf Yükle'}
              </label>
              <p className="mt-2 text-xs text-slate-500">
                JPG, PNG veya GIF formatında, maksimum 2MB
              </p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
          <div>
            <label htmlFor="full_name" className={labelClass}>
              Ad Soyad
            </label>
            <input
              type="text"
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              type="email"
              id="email"
              value={user?.email || ''}
              disabled
              className={`${inputClass} bg-slate-900 text-slate-500`}
            />
            <p className="mt-1 text-xs text-slate-500">Email adresi değiştirilemez</p>
          </div>

          <div>
            <label htmlFor="department" className={labelClass}>
              Departman
            </label>
            <input
              type="text"
              id="department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className={inputClass}
              placeholder="Opsiyonel"
            />
          </div>

          {/* Notification Preferences */}
          <div className="pt-6 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Bildirim Tercihleri</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.email_notifications}
                  onChange={(e) => setFormData({ ...formData, email_notifications: e.target.checked })}
                  className="w-5 h-5 rounded border-white/20 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 focus:ring-offset-slate-900"
                />
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                  Email bildirimleri
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.push_notifications}
                  onChange={(e) => setFormData({ ...formData, push_notifications: e.target.checked })}
                  className="w-5 h-5 rounded border-white/20 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 focus:ring-offset-slate-900"
                />
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                  Push bildirimleri
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6">
            <Link
              to="/dashboard"
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-lg hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};
