import { Head, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';

export default function Index({ auth, items }) {
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState([]); 

    // Filter pencarian barang
    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) || 
        item.category.toLowerCase().includes(search.toLowerCase())
    );

    // Fungsi Tambah ke Keranjang
    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { ...item, qty: 1 }];
        });
    };

    // Fungsi Ubah Jumlah (Qty)
    const updateQty = (id, val) => {
        const qty = parseInt(val) || 0;
        setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
    };

    // Fungsi Hapus dari Keranjang
    const removeFromCart = (id) => {
        setCart(prev => prev.filter(i => i.id !== id));
    };

    // Kalkulasi Total Otomatis
    const totals = useMemo(() => {
        let buy = 0; // Uang yang dibayar Redvox ke Supplier
        let sell = 0; // Uang yang didapat Redvox dari NPC
        
        cart.forEach(c => {
            buy += (c.buy_price * c.qty);
            
            // Hitung nilai jual NPC hanya jika user login dan ada harganya
            if (auth.user && c.sell_price !== 'LOCKED' && c.sell_price) {
                sell += (c.sell_price * c.qty);
            }
        });
        
        return { buy, sell, profit: sell - buy };
    }, [cart, auth.user]);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 selection:bg-orange-500 selection:text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <Head title="Redvox Corp - Market Hub" />

            {/* NAVBAR */}
            <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
                <div className="flex items-center space-x-4">
                    <span className="text-2xl font-black tracking-wider text-orange-500">REDVOX<span className="text-gray-900">CORP.</span></span>
                    <div className="hidden md:flex space-x-6 ml-8 font-medium">
                        <Link href={route('kalkulator')} className="text-orange-500 transition">Kalkulator Harga</Link>
                        <Link href={route('wiki')} className="text-gray-500 hover:text-orange-500 transition">Crafting Wiki</Link>
                    </div>
                </div>
                <div className="flex items-center space-x-4 font-medium">
                    {auth.user ? (
                        <Link href={route('dashboard')} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg shadow-orange-500/30 transition">
                            Dashboard ({auth.user.name})
                        </Link>
                    ) : (
                        <>
                            <Link href={route('login')} className="px-4 py-2 text-gray-600 hover:text-orange-500 transition">Login</Link>
                            <Link href={route('register')} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg shadow-orange-500/30 transition">
                                Daftar VIP
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* HERO SECTION - Tampil untuk Guest */}
            {!auth.user && (
                <header className="px-6 py-16 text-center bg-white border-b border-gray-200 relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-orange-50 to-white pointer-events-none"></div>
                    <div className="relative z-10">
                        <h1 className="text-5xl md:text-6xl font-black mb-4 text-gray-900 tracking-tight">
                            Jual Barangmu ke <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-400">Redvox</span>
                        </h1>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-6">
                            Gunakan kalkulator ini untuk menghitung total uang yang akan kamu dapatkan sebelum menghubungi tim kami di kota.
                        </p>
                    </div>
                </header>
            )}

            {/* AREA KALKULATOR INTERAKTIF */}
            <section id="kalkulator" className="py-12 px-6 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-3 gap-8">
                    
                    {/* BAGIAN KIRI: DAFTAR BARANG */}
                    <div className="lg:col-span-2">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">Katalog Pembelian Redvox</h2>
                                <p className="text-gray-500 text-sm">Klik tombol <b>+</b> untuk memasukkan ke keranjang.</p>
                            </div>
                            <div className="relative w-full md:w-72">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                                <input 
                                    type="text" 
                                    placeholder="Cari Biji Perak, Kayu..." 
                                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 z-10">
                                        <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-widest text-gray-500 font-bold">
                                            <th className="px-5 py-4 w-16">Aksi</th>
                                            <th className="px-5 py-4">Nama Barang</th>
                                            <th className="px-5 py-4 text-right">Harga Beli Kami</th>
                                            {/* Kolom NPC Hanya Muncul Kalau Login */}
                                            {auth.user && <th className="px-5 py-4 text-right bg-orange-50/50">Est. Jual (NPC)</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-orange-50/50 transition duration-150">
                                                <td className="px-5 py-3">
                                                    <button 
                                                        onClick={() => addToCart(item)}
                                                        className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-500 hover:text-white font-bold transition flex items-center justify-center shadow-sm"
                                                    >
                                                        +
                                                    </button>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="font-bold text-gray-900">{item.name}</div>
                                                    <div className="text-xs text-gray-400 font-semibold">{item.category}</div>
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded-md text-sm">
                                                        ${item.buy_price}
                                                    </span>
                                                </td>
                                                {/* Kolom NPC Hanya Muncul Kalau Login */}
                                                {auth.user && (
                                                    <td className="px-5 py-3 font-black text-gray-900 text-right bg-orange-50/20">
                                                        {item.sell_price !== 'LOCKED' && item.sell_price ? `$${item.sell_price}` : <span className="text-gray-400 font-medium text-xs">Crafting</span>}
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* BAGIAN KANAN: KERANJANG KALKULATOR */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-900 rounded-3xl shadow-xl p-6 sticky top-24 border border-gray-800">
                            <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4">
                                <h3 className="text-xl font-black text-white flex items-center gap-2">
                                    <span className="text-orange-500">🧮</span> Kalkulator Setoran
                                </h3>
                                {cart.length > 0 && (
                                    <button onClick={() => setCart([])} className="text-xs text-red-400 hover:text-red-300 font-bold transition">
                                        Kosongkan
                                    </button>
                                )}
                            </div>

                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {cart.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 text-sm font-medium border border-dashed border-gray-700 rounded-xl">
                                        Belum ada barang dipilih.
                                    </div>
                                ) : (
                                    cart.map((c) => (
                                        <div key={c.id} className="bg-gray-800 p-3 rounded-xl border border-gray-700 relative group">
                                            <button 
                                                onClick={() => removeFromCart(c.id)}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition shadow-lg"
                                            >
                                                ✕
                                            </button>
                                            <div className="font-bold text-gray-100 text-sm mb-2">{c.name}</div>
                                            <div className="flex justify-between items-center gap-2">
                                                <input 
                                                    type="number" 
                                                    min="0"
                                                    value={c.qty === 0 ? '' : c.qty}
                                                    onChange={(e) => updateQty(c.id, e.target.value)}
                                                    className="w-16 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm px-2 py-1 text-center focus:ring-1 focus:ring-orange-500 outline-none"
                                                />
                                                <div className="text-right text-xs">
                                                    <div className="text-green-400">Total: ${(c.buy_price * c.qty).toLocaleString()}</div>
                                                    {auth.user && c.sell_price && c.sell_price !== 'LOCKED' && (
                                                        <div className="text-orange-400 text-[10px] mt-0.5">NPC: ${(c.sell_price * c.qty).toLocaleString()}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Rincian Total */}
                            <div className="mt-6 pt-6 border-t border-gray-700 space-y-3">
                                
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300 font-medium text-sm">
                                        {auth.user ? "Total Modal Dikeluarkan" : "Total yang Anda Dapatkan"}
                                    </span>
                                    <span className="text-green-400 font-black text-2xl">${totals.buy.toLocaleString()}</span>
                                </div>

                                {/* PANEL RAHASIA REDVOX - Hanya Muncul Saat Login */}
                                {auth.user && (
                                    <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400">Estimasi Omzet (NPC)</span>
                                            <span className="text-orange-400 font-bold">${totals.sell.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-white font-bold text-sm">Proyeksi Profit Bersih</span>
                                            <span className={`font-black text-lg ${totals.profit > 0 ? 'text-green-500' : totals.profit < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                                                {totals.profit > 0 ? '+' : ''}${totals.profit.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Ganti bagian Link ini di Index.jsx */}
                                {auth.user && cart.length > 0 && (
                                    <Link 
                                        href={route('pos.create')} 
                                        onClick={() => localStorage.setItem('redvox_cart', JSON.stringify(cart))}
                                        className="mt-6 w-full block text-center py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg transition transform hover:-translate-y-0.5"
                                    >
                                        Input ke Mesin Kasir ➔
                                    </Link>
                                )}
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
}