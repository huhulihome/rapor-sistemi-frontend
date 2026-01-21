import { useState, useEffect } from 'react';
import { Layout } from '../components/common/Layout';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
    MagnifyingGlassIcon,
    UserIcon,
    ShieldCheckIcon,
    EnvelopeIcon,
    PlusIcon,
    TrashIcon,
    KeyIcon
} from '@heroicons/react/24/outline';
import { CreateUserModal } from '../components/users/CreateUserModal';

interface User {
    id: string;
    email: string;
    full_name: string;
    role: string;
    department?: string;
    avatar_url?: string;
    created_at: string;
    last_sign_in_at?: string;
}

export const Users = () => {
    const { isAdmin } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [resetPasswordUser, setResetPasswordUser] = useState<{ id: string, name: string } | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [resetLoading, setResetLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('full_name', { ascending: true });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;

            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error('Error updating role:', error);
        }
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!confirm(`"${userName}" kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert('Oturum bulunamadı');
                return;
            }

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${apiUrl}/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Kullanıcı silinemedi');
            }

            setUsers(users.filter(u => u.id !== userId));
            alert('Kullanıcı başarıyla silindi');
        } catch (error) {
            console.error('Error deleting user:', error);
            alert(error instanceof Error ? error.message : 'Kullanıcı silinemedi');
        }
    };

    const handleResetPassword = async () => {
        if (!resetPasswordUser || !newPassword) return;
        if (newPassword.length < 6) {
            alert('Şifre en az 6 karakter olmalıdır');
            return;
        }

        setResetLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert('Oturum bulunamadı');
                return;
            }

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${apiUrl}/api/users/${resetPasswordUser.id}/reset-password`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: newPassword }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Şifre sıfırlanamadı');
            }

            alert(`${resetPasswordUser.name} kullanıcısının şifresi başarıyla değiştirildi`);
            setResetPasswordUser(null);
            setNewPassword('');
        } catch (error) {
            console.error('Error resetting password:', error);
            alert(error instanceof Error ? error.message : 'Şifre sıfırlanamadı');
        } finally {
            setResetLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const roleColors: Record<string, string> = {
        admin: 'bg-purple-500/20 text-purple-400',
        employee: 'bg-blue-500/20 text-blue-400',
    };

    if (!isAdmin) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="glass-card p-8 text-center">
                        <ShieldCheckIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">Yetkisiz Erişim</h2>
                        <p className="text-slate-400">Bu sayfayı görüntüleme yetkiniz yok.</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Kullanıcı Yönetimi</h1>
                        <p className="mt-1 text-sm text-slate-400">
                            Tüm kullanıcıları görüntüleyin ve rollerini yönetin
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-2xl font-bold text-white">{users.length}</p>
                            <p className="text-sm text-slate-400">Toplam Kullanıcı</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-medium hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Yeni Kullanıcı
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="glass-card p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="İsim veya email ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                            />
                        </div>
                        {/* Role Filter */}
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                        >
                            <option value="all">Tüm Roller</option>
                            <option value="admin">Admin</option>
                            <option value="employee">Çalışan</option>
                        </select>
                    </div>
                </div>

                {/* Users List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="glass-card p-8 text-center">
                        <UserIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-400">Kullanıcı bulunamadı</p>
                    </div>
                ) : (
                    <div className="glass-card overflow-hidden">
                        <div className="divide-y divide-white/5">
                            {filteredUsers.map((user) => (
                                <div key={user.id} className="p-4 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {/* Avatar */}
                                            {user.avatar_url ? (
                                                <img
                                                    src={user.avatar_url}
                                                    alt={user.full_name}
                                                    className="w-12 h-12 rounded-xl object-cover border border-white/10"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                    <span className="text-lg font-bold text-white">
                                                        {user.full_name?.charAt(0).toUpperCase() || '?'}
                                                    </span>
                                                </div>
                                            )}
                                            {/* Info */}
                                            <div>
                                                <h3 className="text-white font-medium">{user.full_name}</h3>
                                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                                    <EnvelopeIcon className="w-4 h-4" />
                                                    {user.email}
                                                </div>
                                                {user.department && (
                                                    <p className="text-xs text-slate-500 mt-0.5">{user.department}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Role Badge & Selector */}
                                        <div className="flex items-center gap-4">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${roleColors[user.role] || roleColors.employee}`}>
                                                {user.role === 'admin' ? 'Admin' : 'Çalışan'}
                                            </span>
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className="px-3 py-1.5 bg-slate-800 border border-white/10 rounded-lg text-sm text-white focus:border-blue-500 outline-none"
                                            >
                                                <option value="employee">Çalışan</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    setResetPasswordUser({ id: user.id, name: user.full_name });
                                                }}
                                                className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-colors cursor-pointer"
                                                title="Şifre Sıfırla"
                                            >
                                                <KeyIcon className="w-5 h-5 pointer-events-none" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    handleDeleteUser(user.id, user.full_name);
                                                }}
                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                                title="Kullanıcıyı Sil"
                                            >
                                                <TrashIcon className="w-5 h-5 pointer-events-none" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Create User Modal */}
            <CreateUserModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onUserCreated={fetchUsers}
            />

            {/* Reset Password Modal */}
            {resetPasswordUser && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => { setResetPasswordUser(null); setNewPassword(''); }}
                    />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative w-full max-w-md transform rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-xl transition-all">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl">
                                    <KeyIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Şifre Sıfırla</h2>
                                    <p className="text-sm text-slate-400">{resetPasswordUser.name}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                        Yeni Şifre
                                    </label>
                                    <input
                                        type="text"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="En az 6 karakter"
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => { setResetPasswordUser(null); setNewPassword(''); }}
                                        className="flex-1 px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white font-medium hover:bg-slate-700 transition-colors"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleResetPassword}
                                        disabled={resetLoading || newPassword.length < 6}
                                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg text-white font-medium hover:from-yellow-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        {resetLoading ? 'Sıfırlanıyor...' : 'Şifreyi Değiştir'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};
