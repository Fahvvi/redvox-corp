import { Head, Link } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Internal({ auth, items }) {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [cart, setCart] = useState([]); 
    
    // State Baru: Tipe Transaksi (standar, korporat, dinamis)
    const [transactionType, setTransactionType] = useState('standar');
    // State Baru: Input Manual untuk Jalur Dinamis
    const [dynamicAdjustment, setDynamicAdjustment] = useState('');

    // Mengambil daftar Kategori unik dari data items
    const categories = useMemo(() => {
        return [...new Set(items.map(item => item.category))];
    }, [items]);

    // Filter pencarian barang (Search + Kategori)
    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                              item.category.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === '' || item.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });

    // Ambil keranjang dari localStorage saat awal load
    useEffect(() => {
        const savedCart = localStorage.getItem('redvox_cart');
        if (savedCart) setCart(JSON.parse(savedCart));
    }, []);

    // Simpan otomatis ke localStorage setiap ada perubahan
    useEffect(() => {
        localStorage.setItem('redvox_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                // Jika sudah ada, tambah 1
                return prev.map(i => i.id === item.id ? { ...i, qty: (Number(i.qty) || 0) + 1 } : i);
            }
            // Jika belum ada, masukkan dengan qty 1 (sebagai Number)
            return [...prev, { ...item, qty: 1 }];
        });
    };

    // PERBAIKAN BUG INPUT: Handle perubahan input text secara langsung tanpa jeda
    const handleQtyChange = (id, value) => {
        // Biarkan string kosong '' jika user menghapus semua angka
        if (value === '') {
            setCart(prev => prev.map(i => i.id === id ? { ...i, qty: '' } : i));
            return;
        }
        
        // Hapus angka 0 di depan (contoh "05" menjadi "5") agar pengetikan mulus
        let cleanVal = value.replace(/^0+(?=\d)/, ''); 
        
        // Hanya update jika isinya benar-benar angka
        if (/^\d+$/.test(cleanVal)) {
            setCart(prev => prev.map(i => i.id === id ? { ...i, qty: parseInt(cleanVal, 10) } : i));
        }
    };

    // UX Tambahan: Tombol Plus/Minus Cepat
    const incrementQty = (id) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const currentQty = Number(item.qty) || 0;
                return { ...item, qty: currentQty + 1 };
            }
            return item;
        }));
    };

    const handleDecrement = (id) => {
        setCart(prev => {
            const item = prev.find(i => i.id === id);
            if (!item) return prev;
            
            const currentQty = Number(item.qty) || 0;
            if (currentQty <= 1) {
                return prev.filter(i => i.id !== id); // Hapus jika 0
            } else {
                return prev.map(i => i.id === id ? { ...i, qty: currentQty - 1 } : i);
            }
        });
    };

    // Saat input blur, jika kosong kembalikan ke 0
    const handleQtyBlur = (id) => {
        setCart(prev => prev.map(item => {
            if (item.id === id && item.qty === '') {
                return { ...item, qty: 0 };
            }
            return item;
        }));
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(i => i.id !== id));
    };

    // LOGIKA KALKULATOR TIER HARGA & PROFIT INTERNAL
    const totals = useMemo(() => {
        let buy = 0; 
        let sell = 0;
        
        cart.forEach(c => { 
            // Pastikan qty adalah angka (fallback ke 0 jika string kosong)
            const itemQty = Number(c.qty) || 0;
            let basePrice = c.buy_price;
            
            // Logika Jalur Korporat (Eks-Mafia)
            if (transactionType === 'korporat') {
                basePrice = basePrice * 1.33;
            }
            
            buy += (basePrice * itemQty); 

            // Hitung estimasi omzet jika ada harga jual
            if (c.sell_price !== 'LOCKED' && c.sell_price) {
                sell += (c.sell_price * itemQty);
            }
        });

        // Logika Jalur Dinamis (Khusus) - Tambahan global pada modal
        if (transactionType === 'dinamis') {
            const extra = parseFloat(dynamicAdjustment) || 0;
            buy += extra;
        }

        // Pastikan tidak negatif
        if (buy < 0) buy = 0;

        return { buy, sell, profit: sell - buy };
    }, [cart, transactionType, dynamicAdjustment]);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Kalkulator Internal - Redfox Corp" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-8">
                
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-4 mb-4 md:mb-6">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900">Kalkulator Setoran</h2>
                        <p className="text-sm md:text-base text-gray-500 font-medium mt-1">Estimasi profit dan modal sebelum diteruskan ke Mesin Kasir.</p>
                    </div>
                </div>

                {/* MENU TIER HARGA */}
                <div className="mb-8 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Tipe Kemitraan:</div>
                    <div className="flex flex-wrap gap-2">
                        <button 
                            onClick={() => setTransactionType('standar')}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-sm ${transactionType === 'standar' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            👤 Jalur Standar
                        </button>
                        <button 
                            onClick={() => setTransactionType('korporat')}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-sm ${transactionType === 'korporat' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            🤝 Kemitraan Eksekutif (+33%)
                        </button>
                        <button 
                            onClick={() => setTransactionType('dinamis')}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-sm ${transactionType === 'dinamis' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            ⚙️ Penyesuaian Dinamis
                        </button>
                    </div>

                    {/* Munculkan input tambahan hanya jika Jalur Dinamis */}
                    {transactionType === 'dinamis' && (
                        <div className="mt-4 animate-fade-in flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                            <label className="font-bold text-sm text-gray-700 whitespace-nowrap">Input Penambahan / Diskon ($):</label>
                            <input 
                                type="number"
                                placeholder="Contoh: 500 atau -150"
                                value={dynamicAdjustment}
                                onChange={(e) => setDynamicAdjustment(e.target.value)}
                                className="w-full sm:w-48 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-gray-900 outline-none"
                            />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* BAGIAN KIRI: DAFTAR BARANG (TABEL SEPERTI PUBLIK) */}
                    <div className="lg:col-span-2">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 hidden sm:block">Katalog</h3>
                            </div>
                            
                            {/* KONTROL FILTER & PENCARIAN */}
                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                <div className="relative w-full sm:w-44">
                                    <select 
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold text-sm shadow-sm transition appearance-none cursor-pointer"
                                    >
                                        <option value="">Semua Kategori</option>
                                        {categories.map((cat, idx) => (
                                            <option key={idx} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">▼</div>
                                </div>

                                <div className="relative w-full sm:w-64">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                                    <input 
                                        type="text" 
                                        placeholder="Cari Material..." 
                                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-sm shadow-sm transition"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* TABEL RESPONSIVE */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="max-h-[600px] overflow-y-auto overflow-x-auto w-full custom-scrollbar">
                                <table className="w-full text-left min-w-[500px] md:min-w-full border-collapse">
                                    <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
                                        <tr className="text-[10px] md:text-xs uppercase tracking-widest text-gray-500 font-bold">
                                            <th className="px-3 md:px-5 py-4 w-12 md:w-16 text-center">Aksi</th>
                                            <th className="px-3 md:px-5 py-4">Nama Material</th>
                                            <th className="px-3 md:px-5 py-4 text-right">Modal (Beli)</th>
                                            <th className="px-3 md:px-5 py-4 text-right">Est. Jual</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredItems.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="text-center py-12 text-gray-400 font-medium text-sm">Material tidak ditemukan.</td>
                                            </tr>
                                        ) : (
                                            filteredItems.map((item) => (
                                                <tr key={item.id} className="hover:bg-orange-50/40 transition duration-150">
                                                    <td className="px-3 md:px-5 py-3 md:py-4 text-center">
                                                        <button 
                                                            onClick={() => addToCart(item)}
                                                            className="w-8 h-8 md:w-10 md:h-10 mx-auto bg-gray-100 text-gray-600 rounded-lg hover:bg-orange-500 hover:text-white font-black transition flex items-center justify-center text-lg shadow-sm active:scale-95"
                                                        >
                                                            +
                                                        </button>
                                                    </td>
                                                    <td className="px-3 md:px-5 py-3 md:py-4">
                                                        <div className="font-bold text-gray-900 text-sm md:text-lg">{item.name}</div>
                                                        <div className="text-[9px] md:text-[10px] text-gray-400 font-black uppercase tracking-wider mt-0.5">{item.category}</div>
                                                    </td>
                                                    <td className="px-3 md:px-5 py-3 md:py-4 text-right">
                                                        <span className="text-red-600 font-black bg-red-50 px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm border border-red-100 whitespace-nowrap">
                                                            ${item.buy_price}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 md:px-5 py-3 md:py-4 text-right">
                                                        {item.sell_price !== 'LOCKED' && item.sell_price ? (
                                                            <span className="text-green-600 font-black bg-green-50 px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm border border-green-100 whitespace-nowrap">
                                                                ${item.sell_price}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 font-medium text-[9px] md:text-xs bg-gray-50 border border-gray-200 px-2 py-1 rounded">CRAFTING</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* BAGIAN KANAN: KERANJANG KALKULATOR (UI SAMA PERSIS DENGAN PUBLIK) */}
                    <div id="kalkulator-cart" className="lg:col-span-1 scroll-mt-24 pb-20 lg:pb-0">
                        <div className="bg-gray-900 rounded-3xl shadow-2xl p-4 md:p-8 lg:sticky lg:top-28 border border-gray-800">
                            <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4">
                                <h3 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
                                    <span className="text-orange-500">🛒</span> Keranjang
                                </h3>
                                {cart.length > 0 && (
                                    <button onClick={() => setCart([])} className="text-xs text-red-400 hover:text-white font-bold transition px-3 py-1.5 bg-red-500/10 hover:bg-red-500 rounded-lg">
                                        Kosongkan
                                    </button>
                                )}
                            </div>

                            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 md:pr-2 custom-scrollbar">
                                {cart.length === 0 ? (
                                    <div className="text-center py-10 md:py-12 text-gray-500 text-xs md:text-sm font-medium border-2 border-dashed border-gray-700 rounded-2xl mx-1">
                                        Klik tombol <b className="text-orange-500">+</b> pada tabel <br/>untuk mulai menghitung.
                                    </div>
                                ) : (
                                    cart.map((c) => {
                                        // Tampilkan indikator kenaikan harga jika Korporat
                                        const displayPrice = transactionType === 'korporat' ? c.buy_price * 1.33 : c.buy_price;
                                        const itemQty = Number(c.qty) || 0;
                                        const totalItemPrice = displayPrice * itemQty;

                                        return (
                                            <div key={c.id} className="bg-gray-800 p-3 md:p-4 rounded-2xl border border-gray-700 relative group flex flex-col sm:flex-row justify-between gap-3">
                                                
                                                {/* Info Barang & Harga */}
                                                <div className="flex-1 pr-6 sm:pr-2">
                                                    <div className="font-bold text-gray-100 text-sm mb-1 break-words leading-tight">
                                                        {c.name} {transactionType === 'korporat' && <span className="text-indigo-400 text-[10px]"> (+33%)</span>}
                                                    </div>
                                                    <div className="text-xs font-medium text-gray-400">
                                                        @ ${displayPrice.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                                    </div>
                                                </div>

                                                {/* Control Qty & Subtotal */}
                                                <div className="flex items-center justify-between sm:justify-end sm:flex-col gap-2 mt-2 sm:mt-0">
                                                    <div className="flex items-center bg-gray-900 border border-gray-600 rounded-lg overflow-hidden h-9 md:h-10">
                                                        <button 
                                                            onClick={() => handleDecrement(c.id)}
                                                            className="w-9 h-full bg-gray-700 hover:bg-gray-600 text-white font-black flex items-center justify-center text-lg transition active:bg-gray-500"
                                                        >
                                                            -
                                                        </button>
                                                        <input 
                                                            type="text" 
                                                            inputMode="numeric"
                                                            value={c.qty}
                                                            onChange={(e) => handleQtyChange(c.id, e.target.value)}
                                                            onBlur={() => handleQtyBlur(c.id)}
                                                            className="w-14 h-full bg-transparent text-white text-sm font-bold text-center outline-none border-none focus:ring-0 p-0 m-0"
                                                        />
                                                        <button 
                                                            onClick={() => incrementQty(c.id)}
                                                            className="w-9 h-full bg-gray-700 hover:bg-gray-600 text-white font-black flex items-center justify-center text-lg transition active:bg-gray-500"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    
                                                    <div className="text-red-400 font-black text-sm md:text-base whitespace-nowrap">
                                                        ${totalItemPrice.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                                    </div>
                                                </div>

                                                <button 
                                                    onClick={() => removeFromCart(c.id)}
                                                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold md:opacity-0 md:group-hover:opacity-100 transition shadow-lg flex items-center justify-center z-10"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        )
                                    })
                                )}
                            </div>

                            {/* RINGKASAN PROFIT INTERNAL */}
                            <div className="mt-4 md:mt-6 pt-5 md:pt-6 border-t border-gray-700 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 font-medium text-xs md:text-sm">
                                        Total Modal {transactionType !== 'standar' && `(${transactionType})`}
                                    </span>
                                    <span className="text-white font-black text-2xl md:text-3xl truncate max-w-[150px] text-right">
                                        ${totals.buy.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                    </span>
                                </div>

                                <div className="mt-2 pt-3 border-t border-gray-700/50 space-y-2">
                                    <div className="flex justify-between items-center text-xs md:text-sm">
                                        <span className="text-gray-400">Estimasi Omzet Jual</span>
                                        <span className="text-orange-400 font-bold">${totals.sell.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white font-bold text-xs md:text-sm">Proyeksi Profit Faksi</span>
                                        <span className={`font-black text-xs md:text-sm px-2 py-1 rounded-lg ${totals.profit > 0 ? 'bg-green-500/20 text-green-400' : totals.profit < 0 ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-500'}`}>
                                            {totals.profit > 0 ? '+' : ''}${totals.profit.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {cart.length > 0 && (
                                <Link 
                                    href={route('pos.create')} 
                                    className="mt-4 md:mt-6 w-full flex items-center justify-center gap-2 py-3 md:py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-sm md:text-base rounded-xl shadow-lg shadow-orange-500/20 transition transform hover:-translate-y-0.5 active:scale-95"
                                >
                                    Lanjut ke Kasir <span>➔</span>
                                </Link>
                            )}
                        </div>
                    </div>

                </div>
            </div>
            
            {/* FLOATING CART SUMMARY UNTUK MOBILE */}
            {cart.length > 0 && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4 z-50 flex justify-between items-center shadow-[0_-10px_20px_rgba(0,0,0,0.2)] pb-safe">
                    <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Modal</div>
                        <div className="text-lg md:text-xl font-black text-white">${totals.buy.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                    </div>
                    <Link 
                        href={route('pos.create')} 
                        className="px-5 md:px-6 py-2.5 md:py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl shadow-md active:scale-95 transition"
                    >
                        Ke Kasir ➔
                    </Link>
                </div>
            )}
        </AuthenticatedLayout>
    );
}