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

    // Fungsi pintar: Jika qty dikurangi sampai 0, otomatis hapus dari keranjang
    const handleDecrement = (id, currentQty) => {
        if (currentQty <= 1) {
            removeFromCart(id);
        } else {
            updateQty(id, currentQty - 1);
        }
    };

    // Fungsi untuk mengecek jumlah barang di keranjang langsung dari Katalog
    const getQtyInCart = (id) => {
        const item = cart.find(c => c.id === id);
        return item ? item.qty : 0;
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
                
                {/* =========================================
                    HEADER INTERNAL
                ========================================= */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-4 mb-4 md:mb-6">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900">Kalkulator Setoran</h2>
                        <p className="text-sm md:text-base text-gray-500 font-medium mt-1">Estimasi profit dan modal sebelum diteruskan ke Mesin Kasir.</p>
                    </div>
                    <div className="relative w-full md:w-80 flex-shrink-0">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                        <input 
                            type="text" 
                            placeholder="Cari material..." 
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium transition shadow-sm text-sm md:text-base"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
                    
                    {/* =========================================
                        BAGIAN KIRI: DAFTAR BARANG (HYBRID UI)
                    ========================================= */}
                    <div className="lg:col-span-2">
                        
                        {/* 1. TAMPILAN MOBILE (KARTU E-COMMERCE) - Sembunyi di Desktop */}
                        <div className="block lg:hidden max-h-[65vh] overflow-y-auto custom-scrollbar pr-2">
                            {filteredItems.length === 0 ? (
                                <div className="bg-white rounded-3xl p-10 text-center text-gray-400 font-medium border border-gray-100 shadow-sm">
                                    Material tidak ditemukan.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {filteredItems.map((item) => {
                                        const qtyInCart = getQtyInCart(item.id);
                                        const isSelected = qtyInCart > 0;

                                        return (
                                            <div key={item.id} className={`flex flex-col justify-between p-4 bg-white rounded-2xl transition duration-200 border ${isSelected ? 'border-orange-400 shadow-md shadow-orange-500/10' : 'border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200'}`}>
                                                <div className="mb-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 text-base leading-tight">{item.name}</h4>
                                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.category}</span>
                                                        </div>
                                                        {item.sell_price === 'LOCKED' || !item.sell_price ? (
                                                            <span className="text-[9px] bg-gray-100 text-gray-500 px-2 py-1 rounded uppercase font-bold tracking-widest">Crafting</span>
                                                        ) : (
                                                            <span className="text-[10px] bg-green-50 text-green-600 border border-green-100 px-2 py-1 rounded uppercase font-bold tracking-widest">Est: ${item.sell_price}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                                                    <div className="font-black text-red-500 text-lg">${item.buy_price}</div>
                                                    {isSelected ? (
                                                        <div className="flex items-center gap-3 bg-orange-50 rounded-full px-1.5 py-1 border border-orange-200 shadow-sm">
                                                            <button onClick={() => handleDecrement(item.id, qtyInCart)} className="w-7 h-7 bg-white text-orange-600 font-black rounded-full shadow-sm hover:bg-orange-100 active:scale-95 transition">-</button>
                                                            <span className="font-black text-sm text-gray-900 w-4 text-center select-none">{qtyInCart}</span>
                                                            <button onClick={() => addToCart(item)} className="w-7 h-7 bg-orange-500 text-white font-black rounded-full shadow-sm hover:bg-orange-600 active:scale-95 transition">+</button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => addToCart(item)} className="flex items-center gap-2 bg-white border-2 border-orange-100 text-orange-600 hover:bg-orange-500 hover:border-orange-500 hover:text-white px-4 py-1.5 rounded-full font-bold text-sm transition active:scale-95 shadow-sm">
                                                            <span className="text-lg leading-none">+</span> Tambah
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 2. TAMPILAN DESKTOP (TABEL KLASIK) - Sembunyi di Mobile */}
                        <div className="hidden lg:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="max-h-[650px] overflow-y-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 shadow-sm">
                                        <tr className="text-xs uppercase tracking-widest text-gray-500 font-bold">
                                            <th className="px-5 py-4 w-32 text-center">Aksi</th>
                                            <th className="px-5 py-4">Nama Barang</th>
                                            <th className="px-5 py-4 text-right">Modal (Beli)</th>
                                            <th className="px-5 py-4 text-right bg-orange-50/80 text-orange-800">Est. Jual (NPC)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredItems.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="text-center py-10 text-gray-400 font-medium">Material tidak ditemukan.</td>
                                            </tr>
                                        ) : (
                                            filteredItems.map((item) => {
                                                const qtyInCart = getQtyInCart(item.id);
                                                const isSelected = qtyInCart > 0;

                                                return (
                                                    <tr key={item.id} className={`${isSelected ? 'bg-orange-50/20' : 'hover:bg-gray-50/50'} transition duration-150`}>
                                                        <td className="px-5 py-3 text-center">
                                                            {isSelected ? (
                                                                <div className="flex items-center justify-center gap-2 bg-orange-50 rounded-xl border border-orange-200 px-1 py-1">
                                                                    <button onClick={() => handleDecrement(item.id, qtyInCart)} className="w-7 h-7 bg-white text-orange-600 rounded-lg shadow-sm hover:bg-orange-100 font-black transition">-</button>
                                                                    <span className="font-black text-sm text-gray-900 w-4 text-center select-none">{qtyInCart}</span>
                                                                    <button onClick={() => addToCart(item)} className="w-7 h-7 bg-orange-500 text-white rounded-lg shadow-sm hover:bg-orange-600 font-black transition">+</button>
                                                                </div>
                                                            ) : (
                                                                <button onClick={() => addToCart(item)} className="w-10 h-10 mx-auto bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-500 hover:text-white font-black transition flex items-center justify-center shadow-sm border border-orange-100">
                                                                    +
                                                                </button>
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-3">
                                                            <div className="font-bold text-gray-900 text-lg leading-tight">{item.name}</div>
                                                            <div className="text-xs text-gray-400 font-bold uppercase tracking-wide mt-0.5">{item.category}</div>
                                                        </td>
                                                        <td className="px-5 py-3 text-right">
                                                            <span className="text-red-600 font-black bg-red-50 px-3 py-1.5 rounded-lg text-sm border border-red-100/50">
                                                                ${item.buy_price}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-3 font-black text-gray-900 text-right bg-orange-50/10">
                                                            {item.sell_price !== 'LOCKED' && item.sell_price ? (
                                                                <span className="text-green-600">${item.sell_price}</span>
                                                            ) : (
                                                                <span className="text-gray-400 font-medium text-xs bg-white border border-gray-100 px-2 py-1 rounded">Crafting</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>

                    {/* =========================================
                        BAGIAN KANAN: KERANJANG KALKULATOR
                    ========================================= */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-900 rounded-3xl shadow-xl p-5 md:p-8 lg:sticky lg:top-24 border border-gray-800 flex flex-col h-full lg:h-auto lg:max-h-[80vh]">
                            <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4">
                                <h3 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
                                    <span className="text-orange-500">🛍️</span> Keranjang <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">{cart.length}</span>
                                </h3>
                                {cart.length > 0 && (
                                    <button onClick={() => setCart([])} className="text-[10px] md:text-xs text-red-400 hover:text-red-300 font-bold transition px-3 py-1.5 bg-red-500/10 rounded-lg hover:bg-red-500/20 active:scale-95">
                                        Kosongkan
                                    </button>
                                )}
                            </div>

                            <div className="space-y-3 flex-grow overflow-y-auto pr-2 custom-scrollbar min-h-[150px] lg:min-h-[250px]">
                                {cart.length === 0 ? (
                                    <div className="text-center py-8 md:py-12 text-gray-500 text-xs md:text-sm font-medium border-2 border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center h-full">
                                        <span className="text-4xl mb-2 grayscale opacity-50">🛒</span>
                                        Keranjang masih kosong.
                                    </div>
                                ) : (
                                    cart.map((c) => (
                                        <div key={c.id} className="flex justify-between items-center bg-gray-800 p-3 rounded-2xl border border-gray-700">
                                            <div className="flex-grow pr-3">
                                                <div className="font-bold text-gray-100 text-xs md:text-sm leading-tight mb-1">{c.name}</div>
                                                <div className="text-[10px] md:text-xs text-red-400 font-bold">${(c.buy_price * c.qty).toLocaleString()}</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center bg-gray-900 rounded-lg border border-gray-700">
                                                    <button onClick={() => handleDecrement(c.id, c.qty)} className="w-7 h-7 text-gray-400 hover:text-white font-bold flex items-center justify-center transition">-</button>
                                                    <span className="w-6 text-center text-xs font-bold text-white select-none">{c.qty}</span>
                                                    <button onClick={() => addToCart(c)} className="w-7 h-7 text-orange-500 hover:text-orange-400 font-bold flex items-center justify-center transition">+</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-4 pt-5 md:pt-6 border-t border-gray-700 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 font-medium text-xs md:text-sm">Total Modal</span>
                                    <span className="text-white font-black text-xl md:text-2xl">${totals.buy.toLocaleString()}</span>
                                </div>

                                <div className="mt-2 pt-3 border-t border-gray-700/50 space-y-2">
                                    <div className="flex justify-between items-center text-xs md:text-sm">
                                        <span className="text-gray-400">Estimasi Omzet</span>
                                        <span className="text-orange-400 font-bold">${totals.sell.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white font-bold text-xs md:text-sm">Proyeksi Profit</span>
                                        <span className={`font-black text-sm md:text-base px-2 py-1 rounded-lg ${totals.profit > 0 ? 'bg-green-500/20 text-green-400' : totals.profit < 0 ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-500'}`}>
                                            {totals.profit > 0 ? '+' : ''}${totals.profit.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {cart.length > 0 && (
                                <Link 
                                    href={route('pos.create')} 
                                    onClick={() => localStorage.setItem('redvox_cart', JSON.stringify(cart))}
                                    className="mt-4 md:mt-6 w-full flex items-center justify-center gap-2 py-3 md:py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-sm md:text-base rounded-xl shadow-lg shadow-orange-500/20 transition transform hover:-translate-y-0.5 active:scale-95"
                                >
                                    Bayar Warga (${totals.buy.toLocaleString()}) <span>➔</span>
                                </Link>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}