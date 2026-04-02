import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ auth, floatingItems, storages, packages, allMyStorages }) {
    const [activeTab, setActiveTab] = useState('mengambang');
    
    // 1. Form Khusus Buat Gudang / Kendaraan
    const formLoc = useForm({
        name: '', type: 'vehicle', vehicle_id: '', location_detail: '', package_type: ''
    });

    const submitLoc = (e) => {
        e.preventDefault();
        formLoc.post(route('inventory.storeLocation'), { onSuccess: () => formLoc.reset() });
    };

    // 2. Form Khusus Buat Paket Bundling (Tipe otomatis dikunci ke 'package')
    const formPkg = useForm({
        name: '', type: 'package', vehicle_id: '', location_detail: '', package_type: ''
    });

    const submitPkg = (e) => {
        e.preventDefault();
        formPkg.post(route('inventory.storeLocation'), { onSuccess: () => formPkg.reset() });
    };

    // 3. Form Pindah Barang
    const [moveData, setMoveData] = useState({ inventory_id: null, max_qty: 0, quantity: 1, target_storage_id: '' });
    
    const submitMove = (e) => {
        e.preventDefault();
        router.post(route('inventory.move'), moveData, {
            onSuccess: () => setMoveData({ inventory_id: null, max_qty: 0, quantity: 1, target_storage_id: '' })
        });
    };

    // Mengelompokkan Barang Mengambang Berdasarkan Kategori
    const floatingByCategory = floatingItems.reduce((acc, inv) => {
        const cat = inv.item.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(inv);
        return acc;
    }, {});

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Inventaris Pribadi - Redvox Corp" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-2">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900">Sistem Inventaris</h2>
                        <p className="text-gray-500 font-medium mt-1">Kelola barang bawaan, bagasi kendaraan, dan paket bundling.</p>
                    </div>
                </div>

                {/* TAB NAVIGASI */}
                <div className="flex space-x-2 overflow-x-auto pb-2 custom-scrollbar border-b border-gray-200">
                    {['mengambang', 'gudang', 'paket'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 font-bold text-sm rounded-t-xl transition whitespace-nowrap ${
                                activeTab === tab ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                        >
                            {tab === 'mengambang' ? '🎒 Barang Mengambang' : tab === 'gudang' ? '🚗 Kendaraan & Gudang' : '📦 Manajemen Paket'}
                        </button>
                    ))}
                </div>

                {/* =========================================
                    KONTEN TAB 1: BARANG MENGAMBANG
                ========================================= */}
                {activeTab === 'mengambang' && (
                    <div className="space-y-6">
                        <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl flex items-start gap-3">
                            <span className="text-xl">⚠️</span>
                            <p className="text-sm text-orange-800 font-medium">Barang di bawah ini baru didapatkan dari transaksi kasir dan masih berada di "Tas". Segera pindahkan ke kendaraan, gudang, atau paket agar aman.</p>
                        </div>

                        {Object.keys(floatingByCategory).length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <span className="text-4xl">🎒</span>
                                <p className="mt-4 text-gray-500 font-bold">Tas Anda kosong. Belum ada barang mengambang.</p>
                            </div>
                        ) : (
                            Object.keys(floatingByCategory).map(category => (
                                <div key={category} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
                                        <h4 className="font-black text-gray-700 uppercase tracking-widest text-sm">{category}</h4>
                                    </div>
                                    <div className="divide-y divide-gray-50">
                                        {floatingByCategory[category].map(inv => (
                                            <div key={inv.id} className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4 hover:bg-orange-50/20 transition">
                                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-xl">📦</div>
                                                    <div>
                                                        <h5 className="font-bold text-gray-900 text-lg">{inv.item.name}</h5>
                                                        <p className="text-sm text-gray-500 font-medium">Jumlah: <span className="text-orange-500 font-black">{inv.quantity}</span> pcs</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => setMoveData({ inventory_id: inv.id, max_qty: inv.quantity, quantity: 1, target_storage_id: '' })}
                                                    className="w-full sm:w-auto px-6 py-2 bg-gray-900 hover:bg-orange-500 text-white font-bold rounded-xl transition"
                                                >
                                                    Pindahkan ➔
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* =========================================
                    KONTEN TAB 2: GUDANG & KENDARAAN
                ========================================= */}
                {activeTab === 'gudang' && (
                    <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {storages.length === 0 ? (
                                <p className="text-gray-500 text-center py-8 bg-white rounded-3xl shadow-sm">Anda belum mendaftarkan kendaraan atau gudang.</p>
                            ) : (
                                storages.map(storage => (
                                    <div key={storage.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="bg-gray-900 text-white p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl">{storage.type === 'vehicle' ? '🚗' : '🏭'}</span>
                                                    <h4 className="text-xl font-black">{storage.name}</h4>
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1 flex flex-wrap gap-4">
                                                    {storage.vehicle_id && <span>Plat/ID: {storage.vehicle_id}</span>}
                                                    {storage.location_detail && <span>Lokasi: {storage.location_detail}</span>}
                                                </div>
                                            </div>
                                            
                                            {/* TOMBOL HAPUS GUDANG / KENDARAAN */}
                                            <button 
                                                onClick={() => {
                                                    if(confirm(`Hapus ${storage.type === 'vehicle' ? 'kendaraan' : 'properti'} ini? Semua barang di dalamnya akan otomatis dikembalikan ke Tas Mengambang.`)) {
                                                        router.delete(route('inventory.deleteStorage', storage.id));
                                                    }
                                                }}
                                                className="px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition flex items-center gap-1 border border-red-500/30 hover:border-red-500 w-full md:w-auto justify-center"
                                            >
                                                <span>🗑️</span> Hapus
                                            </button>
                                        </div>
                                        <div className="p-6">
                                            {storage.inventories.length === 0 ? (
                                                <p className="text-sm text-gray-400 italic">Kosong.</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {storage.inventories.map(inv => (
                                                        <div key={inv.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                                                            <span className="font-bold text-gray-700">{inv.item.name}</span>
                                                            <div className="flex items-center gap-4">
                                                                <span className="font-black text-green-600">{inv.quantity} pcs</span>
                                                                <button onClick={() => setMoveData({ inventory_id: inv.id, max_qty: inv.quantity, quantity: 1, target_storage_id: '' })} className="text-xs font-bold text-orange-500 hover:underline">Pindah</button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 h-fit">
                            <h4 className="font-black text-gray-900 mb-4">Pendaftaran Aset Baru</h4>
                            <form onSubmit={submitLoc} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Tipe Aset</label>
                                    <select value={formLoc.data.type} onChange={e => formLoc.setData('type', e.target.value)} className="w-full rounded-xl border-gray-300 text-sm focus:ring-2 focus:ring-gray-900">
                                        <option value="vehicle">Kendaraan (Bagasi)</option>
                                        <option value="warehouse">Gudang / Properti</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Nama / Alias Aset *</label>
                                    <input type="text" placeholder="Contoh: Benson Hitam" required value={formLoc.data.name} onChange={e => formLoc.setData('name', e.target.value)} className="w-full rounded-xl border-gray-300 text-sm focus:ring-2 focus:ring-gray-900" />
                                </div>
                                {formLoc.data.type === 'vehicle' && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">Plat Nomor / ID Kendaraan</label>
                                        <input type="text" value={formLoc.data.vehicle_id} onChange={e => formLoc.setData('vehicle_id', e.target.value)} className="w-full rounded-xl border-gray-300 text-sm focus:ring-2 focus:ring-gray-900" />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Koordinat / Lokasi Detail</label>
                                    <input type="text" placeholder="Contoh: Parkiran City Hall" value={formLoc.data.location_detail} onChange={e => formLoc.setData('location_detail', e.target.value)} className="w-full rounded-xl border-gray-300 text-sm focus:ring-2 focus:ring-gray-900" />
                                </div>
                                <button type="submit" disabled={formLoc.processing} className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-sm transition">Daftarkan Aset</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* =========================================
                    KONTEN TAB 3: MANAJEMEN PAKET
                ========================================= */}
                {activeTab === 'paket' && (
                    <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {packages.length === 0 ? (
                                <p className="text-gray-500 text-center py-8 bg-white rounded-3xl shadow-sm">Belum ada paket bundling yang dibuat.</p>
                            ) : (
                                packages.map(pkg => (
                                    <div key={pkg.id} className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden relative">
                                        <div className="absolute top-0 left-0 w-2 h-full bg-orange-500"></div>
                                        <div className="p-6 pl-8 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-50 gap-4">
                                        <div className="flex-1">
                                            <h4 className="text-xl font-black text-gray-900">{pkg.name}</h4>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 text-[10px] font-black uppercase tracking-wider rounded-full">
                                                    Kategori: {pkg.package_type}
                                                </span>
                                                {pkg.vehicle_id && (
                                                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-wider rounded-full">
                                                        🚗 Kendaraan: {pkg.vehicle_id}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* TOMBOL HAPUS PAKET */}
                                        <button 
                                            onClick={() => {
                                                if(confirm('Hapus paket ini? Semua barang di dalamnya akan dikembalikan ke Tas Mengambang.')) {
                                                    router.delete(route('inventory.deleteStorage', pkg.id));
                                                }
                                            }}
                                            className="px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition flex items-center gap-1 border border-transparent hover:border-red-100"
                                        >
                                            <span>🗑️</span> Hapus Paket
                                        </button>
                                    </div>
                                        <div className="p-6 pl-8">
                                            {pkg.inventories.length === 0 ? (
                                                <p className="text-sm text-gray-400 italic">Paket ini masih kosong.</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {pkg.inventories.map(inv => (
                                                        <div key={inv.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                                                            <span className="font-bold text-gray-700">{inv.item.name}</span>
                                                            <div className="flex items-center gap-4">
                                                                <span className="font-black text-orange-600">{inv.quantity} pcs</span>
                                                                <button onClick={() => setMoveData({ inventory_id: inv.id, max_qty: inv.quantity, quantity: 1, target_storage_id: '' })} className="text-xs font-bold text-gray-400 hover:text-gray-900 hover:underline">Keluarkan</button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="bg-orange-50 p-6 rounded-3xl border border-orange-200 h-fit">
                            <h4 className="font-black text-orange-900 mb-4">Rakit Paket Baru</h4>
                            <form onSubmit={submitPkg} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-orange-800 mb-1">Kategori Paket *</label>
                                    <select required value={formPkg.data.package_type} onChange={e => formPkg.setData('package_type', e.target.value)} className="w-full rounded-xl border-orange-300 text-sm focus:ring-2 focus:ring-orange-500">
                                        <option value="">-- Pilih Jenis --</option>
                                        <option value="furniture">Paket Furniture</option>
                                        <option value="restoran">Paket Restoran</option>
                                        <option value="mafia">Paket Mafia / Ilegal</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-orange-800 mb-1">Nama Identifier Paket *</label>
                                    <input type="text" placeholder="Contoh: Paket Resto Burger #01" required value={formPkg.data.name} onChange={e => formPkg.setData('name', e.target.value)} className="w-full rounded-xl border-orange-300 text-sm focus:ring-2 focus:ring-orange-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-orange-800 mb-1">Plat Kendaraan Penyimpanan (Opsional)</label>
                                    <input type="text" placeholder="Contoh: 830" value={formPkg.data.vehicle_id} onChange={e => formPkg.setData('vehicle_id', e.target.value)} className="w-full rounded-xl border-orange-300 text-sm focus:ring-2 focus:ring-orange-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-orange-800 mb-1">Lokasi Detail (Opsional)</label>
                                    <input type="text" placeholder="Contoh: Bagasi Boxville" value={formPkg.data.location_detail} onChange={e => formPkg.setData('location_detail', e.target.value)} className="w-full rounded-xl border-orange-300 text-sm focus:ring-2 focus:ring-orange-500" />
                                </div>
                                <button type="submit" disabled={formPkg.processing} className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm shadow-md transition">Buat Wadah Paket</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* =========================================
                    MODAL PINDAH BARANG (GLOBAL)
                ========================================= */}
                {moveData.inventory_id && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
                            <h3 className="text-xl font-black text-gray-900 mb-4">Pindahkan Barang</h3>
                            <form onSubmit={submitMove} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Jumlah Pindah (Max: {moveData.max_qty})</label>
                                    <input 
                                        type="number" min="1" max={moveData.max_qty} required
                                        value={moveData.quantity} onChange={e => setMoveData({...moveData, quantity: e.target.value})}
                                        className="w-full rounded-xl border-gray-300 font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Tujuan Pemindahan</label>
                                    <select 
                                        required value={moveData.target_storage_id} onChange={e => setMoveData({...moveData, target_storage_id: e.target.value})}
                                        className="w-full rounded-xl border-gray-300 text-sm font-medium"
                                    >
                                        <option value="">-- Pilih Tujuan --</option>
                                        <option value="float" className="font-bold text-orange-600">🎒 Keluarkan ke Tas (Mengambang)</option>
                                        {allMyStorages.map(st => (
                                            <option key={st.id} value={st.id}>
                                                {st.type === 'package' ? '📦 ' : st.type === 'vehicle' ? '🚗 ' : '🏭 '} 
                                                {st.name} {st.package_type ? `(${st.package_type})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-4 border-t border-gray-100">
                                    <button type="button" onClick={() => setMoveData({ inventory_id: null, max_qty: 0, quantity: 1, target_storage_id: '' })} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200">Batal</button>
                                    <button type="submit" className="flex-1 py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-orange-500 transition">Konfirmasi</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}