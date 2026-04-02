import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Manage({ auth, items }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '', category: '', buy_price: 0, sell_price: 0, unit: 'pcs'
    });

    const [editingId, setEditingId] = useState(null);
    const [editPrices, setEditPrices] = useState({ buy: 0, sell: 0 });

    const submitNewItem = (e) => {
        e.preventDefault();
        post(route('items.store'), { onSuccess: () => reset() });
    };

    const handleUpdatePrice = (item) => {
        router.patch(route('items.update', item.id), {
            buy_price: editPrices.buy,
            sell_price: editPrices.sell
        }, { 
            onSuccess: () => setEditingId(null),
            preserveScroll: true 
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Manajemen Harga & Material - Redvox Corp" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900">Katalog Material</h2>
                        <p className="text-gray-500 font-medium mt-1">Atur harga dasar beli dari warga dan harga jual ke pengepul.</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* FORM TAMBAH BARANG BARU */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-fit sticky top-24">
                        <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                            <span className="text-orange-500">➕</span> Tambah Material
                        </h3>
                        <form onSubmit={submitNewItem} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Barang</label>
                                <input type="text" placeholder="Contoh: Baut Karatan" className="w-full rounded-xl border-gray-200 text-sm focus:ring-orange-500" value={data.name} onChange={e => setData('name', e.target.value)} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kategori</label>
                                    <select className="w-full rounded-xl border-gray-200 text-sm focus:ring-orange-500" value={data.category} onChange={e => setData('category', e.target.value)} required>
                                        <option value="">Pilih...</option>
                                        <option value="Logam">JAHIT</option>
                                        <option value="Kayu">KEHUTANAN</option>
                                        <option value="Elektronik">MINYAK</option>
                                        <option value="Ilegal">PANGAN</option>
                                        <option value="Lainnya">PERTAMBANGAN</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Satuan</label>
                                    <input type="text" className="w-full rounded-xl border-gray-200 text-sm focus:ring-orange-500" value={data.unit} onChange={e => setData('unit', e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Harga Beli ($)</label>
                                    <input type="number" min="0" className="w-full rounded-xl border-gray-200 text-sm font-bold text-red-600 focus:ring-orange-500" value={data.buy_price} onChange={e => setData('buy_price', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Harga Jual ($)</label>
                                    <input type="number" min="0" className="w-full rounded-xl border-gray-200 text-sm font-bold text-green-600 focus:ring-orange-500" value={data.sell_price} onChange={e => setData('sell_price', e.target.value)} />
                                </div>
                            </div>
                            <button type="submit" disabled={processing} className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl transition shadow-lg shadow-orange-500/20">
                                Daftarkan Material
                            </button>
                        </form>
                    </div>

                    {/* DAFTAR HARGA & MARGIN */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <th className="px-6 py-4">Material</th>
                                        <th className="px-6 py-4 text-center">Harga Beli</th>
                                        <th className="px-6 py-4 text-center">Harga Jual</th>
                                        <th className="px-6 py-4 text-center">Margin (Profit)</th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {items.map(item => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{item.name}</div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase">{item.category}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {editingId === item.id ? (
                                                    <input type="number" className="w-20 p-1 text-xs border-gray-300 rounded font-bold text-red-600 focus:ring-orange-500" value={editPrices.buy} onChange={e => setEditPrices({...editPrices, buy: e.target.value})} />
                                                ) : (
                                                    <span className="font-bold text-red-500">${item.buy_price}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {editingId === item.id ? (
                                                    <input type="number" className="w-20 p-1 text-xs border-gray-300 rounded font-bold text-green-600 focus:ring-orange-500" value={editPrices.sell} onChange={e => setEditPrices({...editPrices, sell: e.target.value})} />
                                                ) : (
                                                    <span className="font-bold text-green-600">${item.sell_price}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-black ${item.sell_price - item.buy_price >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                    {item.sell_price - item.buy_price >= 0 ? '+' : ''}${item.sell_price - item.buy_price}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {editingId === item.id ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => handleUpdatePrice(item)} className="text-green-600 font-bold text-xs hover:underline">Simpan</button>
                                                        <button onClick={() => setEditingId(null)} className="text-gray-400 font-bold text-xs hover:underline">Batal</button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-end gap-4">
                                                        <button 
                                                            onClick={() => {
                                                                setEditingId(item.id);
                                                                setEditPrices({ buy: item.buy_price, sell: item.sell_price });
                                                            }}
                                                            className="text-orange-500 font-bold text-xs hover:underline"
                                                        >
                                                            Ubah Harga
                                                        </button>
                                                        <button 
                                                            onClick={() => confirm('Hapus barang ini dari katalog?') && router.delete(route('items.destroy', item.id))}
                                                            className="text-gray-300 hover:text-red-500 transition"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}