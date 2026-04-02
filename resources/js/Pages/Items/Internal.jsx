import { Head, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Internal({ auth, items }) {
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState([]); 

    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) || 
        item.category.toLowerCase().includes(search.toLowerCase())
    );

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { ...item, qty: 1 }];
        });
    };

    const updateQty = (id, val) => {
        const qty = parseInt(val) || 0;
        setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(i => i.id !== id));
    };

    const totals = useMemo(() => {
        let buy = 0; 
        let sell = 0; 
        
        cart.forEach(c => {
            buy += (c.buy_price * c.qty);
            if (c.sell_price !== 'LOCKED' && c.sell_price) {
                sell += (c.sell_price * c.qty);
            }
        });
        
        return { buy, sell, profit: sell - buy };
    }, [cart]);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Kalkulator Internal - Redvox Corp" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                
                {/* Header Internal */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-4 mb-6">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900">Kalkulator Setoran</h2>
                        <p className="text-gray-500 font-medium mt-1">Estimasi profit dan modal sebelum diteruskan ke Mesin Kasir.</p>
                    </div>
                    <div className="relative w-full md:w-80">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                        <input 
                            type="text" 
                            placeholder="Cari material..." 
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium transition shadow-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    
                    {/* BAGIAN KIRI: DAFTAR BARANG */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
                                        <tr className="text-xs uppercase tracking-widest text-gray-500 font-bold">
                                            <th className="px-5 py-4 w-16">Aksi</th>
                                            <th className="px-5 py-4">Nama Barang</th>
                                            <th className="px-5 py-4 text-right">Harga Beli Kami</th>
                                            <th className="px-5 py-4 text-right bg-orange-50/50">Est. Jual (NPC)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-orange-50/30 transition duration-150">
                                                <td className="px-5 py-3">
                                                    <button 
                                                        onClick={() => addToCart(item)}
                                                        className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl hover:bg-orange-500 hover:text-white font-black transition flex items-center justify-center shadow-sm"
                                                    >
                                                        +
                                                    </button>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="font-bold text-gray-900 text-lg">{item.name}</div>
                                                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wide">{item.category}</div>
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <span className="text-red-500 font-bold bg-red-50 px-3 py-1.5 rounded-lg text-sm">
                                                        ${item.buy_price}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 font-black text-gray-900 text-right bg-orange-50/10">
                                                    {item.sell_price !== 'LOCKED' && item.sell_price ? <span className="text-green-600">${item.sell_price}</span> : <span className="text-gray-400 font-medium text-xs">Crafting</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* BAGIAN KANAN: KERANJANG KALKULATOR */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-900 rounded-3xl shadow-xl p-6 md:p-8 sticky top-24 border border-gray-800">
                            <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4">
                                <h3 className="text-xl font-black text-white flex items-center gap-2">
                                    <span className="text-orange-500">🧮</span> Keranjang
                                </h3>
                                {cart.length > 0 && (
                                    <button onClick={() => setCart([])} className="text-xs text-red-400 hover:text-red-300 font-bold transition px-3 py-1 bg-red-500/10 rounded-lg hover:bg-red-500/20">
                                        Kosongkan
                                    </button>
                                )}
                            </div>

                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {cart.length === 0 ? (
                                    <div className="text-center py-10 text-gray-500 text-sm font-medium border-2 border-dashed border-gray-700 rounded-2xl">
                                        Klik tanda <b className="text-orange-500">+</b> untuk menambah material.
                                    </div>
                                ) : (
                                    cart.map((c) => (
                                        <div key={c.id} className="bg-gray-800 p-4 rounded-2xl border border-gray-700 relative group">
                                            <button 
                                                onClick={() => removeFromCart(c.id)}
                                                className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition shadow-lg flex items-center justify-center"
                                            >
                                                ✕
                                            </button>
                                            <div className="font-bold text-gray-100 text-sm mb-3">{c.name}</div>
                                            <div className="flex justify-between items-center gap-2">
                                                <input 
                                                    type="number" 
                                                    min="0"
                                                    value={c.qty === 0 ? '' : c.qty}
                                                    onChange={(e) => updateQty(c.id, e.target.value)}
                                                    className="w-20 bg-gray-900 border border-gray-600 rounded-xl text-white font-bold text-sm px-3 py-2 text-center focus:ring-2 focus:ring-orange-500 outline-none"
                                                />
                                                <div className="text-right text-xs">
                                                    <div className="text-red-400 font-bold">Modal: ${(c.buy_price * c.qty).toLocaleString()}</div>
                                                    {c.sell_price && c.sell_price !== 'LOCKED' && (
                                                        <div className="text-green-400 font-bold mt-1">NPC: ${(c.sell_price * c.qty).toLocaleString()}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-700 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 font-medium text-sm">Modal Dibutuhkan</span>
                                    <span className="text-white font-black text-2xl">${totals.buy.toLocaleString()}</span>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">Estimasi Omzet (NPC)</span>
                                        <span className="text-orange-400 font-bold">${totals.sell.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white font-bold text-sm">Proyeksi Profit</span>
                                        <span className={`font-black text-lg ${totals.profit > 0 ? 'text-green-500' : totals.profit < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                                            {totals.profit > 0 ? '+' : ''}${totals.profit.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {cart.length > 0 && (
                                <Link 
                                    href={route('pos.create')} 
                                    onClick={() => localStorage.setItem('redvox_cart', JSON.stringify(cart))}
                                    className="mt-8 w-full block text-center py-4 bg-orange-500 hover:bg-orange-600 text-white font-black text-lg rounded-xl shadow-lg shadow-orange-500/20 transition transform hover:-translate-y-0.5"
                                >
                                    Teruskan ke Kasir ➔
                                </Link>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}