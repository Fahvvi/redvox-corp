import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ auth, deposit, partner, availableUsers }) {
    const { flash } = usePage().props;

    // Form Top Up
    const formTopup = useForm({ amount: '' });
    const submitTopup = (e) => {
        e.preventDefault();
        formTopup.post(route('deposits.topup'), {
            onSuccess: () => formTopup.reset(),
        });
    };

    // Form Joint Venture
    const formJV = useForm({ partner_id: '' });
    const submitJV = (e) => {
        e.preventDefault();
        if (confirm('Yakin ingin menggabungkan brankas dengan user ini? Keputusan ini mengikat sistem bagi hasil otomatis.')) {
            formJV.post(route('deposits.partner'));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Manajemen Deposit & JV - Redvox Corp" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900">Brankas Deposit & Investasi</h2>
                        <p className="text-gray-500 font-medium">Kelola uang titipan dan atur kontrak kerja sama (Joint Venture).</p>
                    </div>
                </div>

                {flash?.success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl font-bold shadow-sm">
                        {flash.success}
                    </div>
                )}

                <div className="grid lg:grid-cols-2 gap-8">
                    
                    {/* PANEL KIRI: INFO SALDO & TOP UP */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div>
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 text-3xl mb-6">🏦</div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Saldo Pribadi Aktif</p>
                            <h3 className="text-5xl font-black text-gray-900 mb-2">${deposit.balance.toLocaleString()}</h3>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                Uang ini siap digunakan otomatis saat Anda berbelanja melalui Mesin Kasir Redvox Corp.
                            </p>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-100">
                            <h4 className="font-bold text-gray-900 mb-4">Tambah Saldo Brankas</h4>
                            <form onSubmit={submitTopup} className="flex gap-4">
                                <div className="relative flex-1">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                                    <input 
                                        type="number" 
                                        min="1"
                                        className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition font-bold text-gray-800"
                                        placeholder="Nominal Top Up..."
                                        value={formTopup.data.amount}
                                        onChange={e => formTopup.setData('amount', e.target.value)}
                                        required
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={formTopup.processing}
                                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 whitespace-nowrap"
                                >
                                    {formTopup.processing ? 'Memproses...' : 'Setor Uang'}
                                </button>
                            </form>
                            {formTopup.errors.amount && <p className="text-red-500 text-sm mt-2 font-bold">{formTopup.errors.amount}</p>}
                        </div>
                    </div>

                    {/* PANEL KANAN: JOINT VENTURE (JV) */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-xl border border-gray-700 text-white relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 w-48 h-48 bg-orange-500 opacity-20 rounded-full blur-3xl pointer-events-none"></div>
                        
                        <div className="w-16 h-16 bg-gray-800 border border-gray-700 rounded-2xl flex items-center justify-center text-orange-500 text-3xl mb-6 relative z-10">🤝</div>
                        <h3 className="text-2xl font-black mb-2 relative z-10">Sistem Joint Venture (JV)</h3>
                        <p className="text-gray-400 font-medium text-sm leading-relaxed mb-8 relative z-10">
                            Hubungkan akun Anda dengan partner bisnis. Setiap transaksi POS akan otomatis memotong 50% saldo dari masing-masing brankas. Barang ganjil diberikan kepada pemulai transaksi.
                        </p>

                        {partner ? (
                            <div className="bg-gray-800/80 border border-orange-500/50 p-6 rounded-2xl relative z-10 backdrop-blur-sm">
                                <p className="text-xs text-orange-400 font-bold uppercase tracking-widest mb-1">Partner Aktif Anda</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-black text-xl shadow-lg">
                                        {partner.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-white">{partner.name}</h4>
                                        <p className="text-gray-400 text-sm">{partner.email}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-400 font-medium">
                                    Status: <span className="text-green-400 font-bold">Terkoneksi & Mengikat</span>
                                </div>
                            </div>
                        ) : (
                            <div className="relative z-10">
                                <form onSubmit={submitJV} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-2">Pilih Partner Kerja Sama</label>
                                        <select 
                                            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-white font-medium"
                                            value={formJV.data.partner_id}
                                            onChange={e => formJV.setData('partner_id', e.target.value)}
                                            required
                                        >
                                            <option value="">-- Pilih Warga yang Tersedia --</option>
                                            {availableUsers.map(u => (
                                                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                            ))}
                                        </select>
                                        {formJV.errors.partner_id && <p className="text-red-400 text-sm mt-1 font-bold">{formJV.errors.partner_id}</p>}
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={formJV.processing || !formJV.data.partner_id}
                                        className={`w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl shadow-lg transition transform ${formJV.processing ? 'opacity-50' : 'hover:-translate-y-0.5'}`}
                                    >
                                        {formJV.processing ? 'Memproses...' : 'Ajukan Kontrak JV'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}