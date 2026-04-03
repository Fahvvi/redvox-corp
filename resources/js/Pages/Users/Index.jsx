import { Head, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ auth, users }) {
    const { flash, errors } = usePage().props;

    // Fungsi untuk memicu perubahan role secara instan (Untuk user yang sudah di-ACC)
    const handleRoleChange = (userId, newRole) => {
        if (confirm(`Yakin ingin mengubah hak akses user ini menjadi ${newRole.toUpperCase()}?`)) {
            router.patch(route('users.updateRole', userId), {
                role: newRole
            }, {
                preserveScroll: true
            });
        }
    };

    // Fungsi khusus untuk Menerima Pendaftar Baru
    const handleApprove = (userId, userName) => {
        if (confirm(`Setujui pendaftaran ${userName} dan berikan akses sebagai Warga/Investor?`)) {
            router.patch(route('users.updateRole', userId), {
                role: 'user' // Default saat diterima menjadi user biasa
            }, {
                preserveScroll: true
            });
        }
    };

    // Fungsi khusus untuk Menolak Pendaftar Baru (Menghapus akunnya)
    const handleReject = (userId, userName) => {
        if (confirm(`Tolak pendaftaran ${userName}? Akun ini akan dihapus permanen dari sistem.`)) {
            router.delete(route('users.destroy', userId), {
                preserveScroll: true
            });
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Manajemen Akses - Redvox Corp" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900">Manajemen Hak Akses</h2>
                        <p className="text-gray-500 font-medium mt-1">Atur persetujuan, jabatan, dan izin akses warga (Karyawan/Investor).</p>
                    </div>
                </div>

                {/* Notifikasi Sukses/Error */}
                {flash?.success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl font-bold shadow-sm flex items-center gap-2">
                        <span>✅</span> {flash.success}
                    </div>
                )}
                {errors?.error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl font-bold shadow-sm flex items-center gap-2">
                        <span>⚠️</span> {errors.error}
                    </div>
                )}

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-widest text-gray-500 font-bold">
                                    <th className="px-6 py-5">Nama Warga (IC)</th>
                                    <th className="px-6 py-5">Email Akun</th>
                                    <th className="px-6 py-5 text-center">Status / Akses</th>
                                    <th className="px-6 py-5 text-center">Aksi Manajemen</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.map((u) => (
                                    <tr key={u.id} className={`transition duration-150 group ${u.role === 'pending' ? 'bg-red-50/30 hover:bg-red-50' : 'hover:bg-orange-50/30'}`}>
                                        <td className="px-6 py-4">
                                            <div className="font-black text-gray-900 text-lg flex items-center gap-2">
                                                {u.name}
                                                {u.role === 'pending' && <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>}
                                            </div>
                                            {u.id === auth.user.id && (
                                                <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold relative -top-1">It's You</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-medium">{u.email}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-black tracking-wider ${
                                                u.role === 'admin' 
                                                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30' 
                                                : u.role === 'vip'
                                                    ? 'bg-blue-100 text-blue-600'
                                                : u.role === 'pending'
                                                    ? 'bg-red-100 text-red-600 border border-red-200'
                                                : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {u.role === 'pending' ? '⏳ MENUNGGU ACC' : u.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {u.id !== auth.user.id ? (
                                                u.role === 'pending' ? (
                                                    // TOMBOL KHUSUS UNTUK PENDAFTAR BARU
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button 
                                                            onClick={() => handleApprove(u.id, u.name)} 
                                                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm shadow-green-500/30 flex items-center gap-1"
                                                        >
                                                            <span>✅</span> Terima
                                                        </button>
                                                        <button 
                                                            onClick={() => handleReject(u.id, u.name)} 
                                                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm shadow-red-500/30 flex items-center gap-1"
                                                        >
                                                            <span>❌</span> Tolak
                                                        </button>
                                                    </div>
                                                ) : (
                                                    // DROPDOWN NORMAL UNTUK WARGA YANG SUDAH DI-ACC
                                                    <select
                                                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition cursor-pointer"
                                                        value={u.role}
                                                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                    >
                                                        <option value="user">Warga / Investor</option>
                                                        <option value="vip">VIP (Akses Kasir)</option>
                                                        <option value="admin">Super Admin</option>
                                                    </select>
                                                )
                                            ) : (
                                                <span className="text-gray-300 text-sm font-bold italic px-4 py-2 border border-dashed border-gray-200 rounded-xl inline-block">Terproteksi</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}