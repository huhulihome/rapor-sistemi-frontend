import { useState } from 'react';
import { XMarkIcon, UserPlusIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../services/supabase';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUserCreated: () => void;
}

export const CreateUserModal = ({ isOpen, onClose, onUserCreated }: CreateUserModalProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        role: 'employee',
        department: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error('Oturum bulunamadı');
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Kullanıcı oluşturulamadı');
            }

            // Reset form
            setFormData({
                email: '',
                password: '',
                full_name: '',
                role: 'employee',
                department: '',
            });

            onUserCreated();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-md transform rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-xl transition-all">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                                <UserPlusIcon className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Yeni Kullanıcı Oluştur</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Ad Soyad *
                            </label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                                placeholder="Örn: Ahmet Yılmaz"
                                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="ornek@sirket.com"
                                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Şifre *
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    placeholder="En az 6 karakter"
                                    className="w-full px-4 py-2.5 pr-12 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="w-5 h-5 text-slate-400" />
                                    ) : (
                                        <EyeIcon className="w-5 h-5 text-slate-400" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Rol
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                            >
                                <option value="employee">Çalışan</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {/* Department */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Departman
                            </label>
                            <input
                                type="text"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                placeholder="Örn: Satış, Muhasebe, IT"
                                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white font-medium hover:bg-slate-700 transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? 'Oluşturuluyor...' : 'Oluştur'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
