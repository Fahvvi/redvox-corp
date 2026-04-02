import { Head, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';

export default function Index({ auth, items }) {
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState([]);
    const [showingMobileMenu, setShowingMobileMenu] = useState(false);

    // Filter pencarian barang
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
        cart.forEach(c => { buy += (c.buy_price * c.qty); });
        return { buy };
    }, [cart]);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 selection:bg-orange-500 selection:text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <Head title="Redvox Corp - Market Hub" />

            {/* =========================================
                NAVBAR PUBLIK (SUPER CLEAN)
            ========================================= */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        
                        {/* Kiri: Logo (Tanpa menu tambahan) */}
                        <div className="flex items-center">
                            <Link href="/" className="text-2xl md:text-3xl font-black tracking-wider text-orange-500 hover:scale-105 transition transform">
                                REDVOX<span className="text-gray-900">.</span>
                            </Link>
                        </div>

                        {/* Kanan: Auth Buttons (Desktop) */}
                        <div className="hidden md:flex items-center font-bold">
                            {auth.user ? (
                                <Link href={route('dashboard')} className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-orange-500 text-white rounded-full shadow-md transition text-sm">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                    Dashboard
                                </Link>
                            ) : (
                                <Link href={route('login')} className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-orange-500 hover:text-white text-gray-700 rounded-full shadow-sm transition text-sm border border-gray-200 hover:border-orange-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    Portal Login
                                </Link>
                            )}
                        </div>

                        {/* Hamburger Button (Mobile) */}
                        <div className="flex md:hidden">
                            <button 
                                onClick={() => setShowingMobileMenu(!showingMobileMenu)}
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl focus:outline-none transition"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path className={!showingMobileMenu ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    <path className={showingMobileMenu ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown (Hanya untuk Login/Auth) */}
                <div className={`${showingMobileMenu ? 'block' : 'hidden'} md:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full`}>
                    <div className="px-4 py-4 flex flex-col gap-3">
                        {auth.user ? (
                            <Link href={route('dashboard')} className="w-full text-center px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-orange-500 transition">
                                Masuk Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="w-full text-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition">Login Karyawan</Link>
                                <Link href={route('register')} className="w-full text-center px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition">Daftar VIP</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* =========================================
                HERO SECTION
            ========================================= */}
            {!auth.user && (
                <header className="px-4 sm:px-6 py-16 md:py-24 text-center bg-white border-b border-gray-200 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50 via-white to-white opacity-80"></div>
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <span className="inline-block py-1 px-3 rounded-full bg-orange-100 text-orange-600 text-xs font-black uppercase tracking-widest mb-6 border border-orange-200">
                            Pusat Pengepul Side-Job
                        </span>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 text-gray-900 tracking-tight leading-tight">
                            Jual Materialmu ke <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Redvox.</span>
                        </h1>
                        <p className="text-base sm:text-lg text-gray-500 mb-8 font-medium">
                            Gunakan kalkulator pintar ini untuk menghitung total uang yang akan kamu dapatkan sebelum membawa materialmu ke gudang kami.
                        </p>
                        <a href="#kalkulator" className="inline-block px-8 py-4 bg-gray-900 hover:bg-orange-500 text-white font-bold rounded-full shadow-xl transition transform hover:-translate-y-1">
                            Mulai Berhitung ➔
                        </a>
                    </div>
                </header>
            )}

            {/* =========================================
                AREA KALKULATOR INTERAKTIF
            ========================================= */}
            <section id="kalkulator" className="py-12 md:py-16 px-4 sm:px-6 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-3 gap-8">
                    
                    {/* BAGIAN KIRI: DAFTAR BARANG */}
                    <div className="lg:col-span-2">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-gray-900">Katalog Pembelian</h2>
                                <p className="text-gray-500 text-sm mt-1 font-medium">Klik tombol <b className="text-orange-500">+</b> untuk simulasi penjualan.</p>
                            </div>
                            <div className="relative w-full sm:w-72">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                                <input 
                                    type="text" 
                                    placeholder="Cari Biji Perak, Kayu..." 
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium shadow-sm transition"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="max-h-[600px] overflow-y-auto overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left min-w-[500px]">
                                    <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
                                        <tr className="text-xs uppercase tracking-widest text-gray-500 font-bold">
                                            <th className="px-5 py-4 w-16 text-center">Aksi</th>
                                            <th className="px-5 py-4">Nama Material</th>
                                            <th className="px-5 py-4 text-right">Harga Beli Redvox</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredItems.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="text-center py-12 text-gray-400 font-medium">Material tidak ditemukan.</td>
                                            </tr>
                                        ) : (
                                            filteredItems.map((item) => (
                                                <tr key={item.id} className="hover:bg-orange-50/40 transition duration-150">
                                                    <td className="px-5 py-4 text-center">
                                                        <button 
                                                            onClick={() => addToCart(item)}
                                                            className="w-10 h-10 mx-auto bg-gray-100 text-gray-600 rounded-xl hover:bg-orange-500 hover:text-white font-black transition flex items-center justify-center"
                                                        >
                                                            +
                                                        </button>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="font-bold text-gray-900 md:text-lg">{item.name}</div>
                                                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-wider">{item.category}</div>
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        <span className="text-green-600 font-black bg-green-50 px-3 py-1.5 rounded-lg text-sm md:text-base border border-green-100">
                                                            ${item.buy_price}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* BAGIAN KANAN: KERANJANG KALKULATOR */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-900 rounded-3xl shadow-2xl p-6 md:p-8 lg:sticky lg:top-24 border border-gray-800">
                            <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4">
                                <h3 className="text-xl font-black text-white flex items-center gap-2">
                                    <span className="text-orange-500">🛒</span> Keranjang
                                </h3>
                                {cart.length > 0 && (
                                    <button onClick={() => setCart([])} className="text-xs text-red-400 hover:text-white font-bold transition px-3 py-1.5 bg-red-500/10 hover:bg-red-500 rounded-lg">
                                        Kosongkan
                                    </button>
                                )}
                            </div>

                            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                {cart.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500 text-sm font-medium border-2 border-dashed border-gray-700 rounded-2xl">
                                        Klik tombol <b className="text-orange-500">+</b> pada tabel <br/>untuk mulai simulasi.
                                    </div>
                                ) : (
                                    cart.map((c) => (
                                        <div key={c.id} className="bg-gray-800 p-4 rounded-2xl border border-gray-700 relative group">
                                            <button 
                                                onClick={() => removeFromCart(c.id)}
                                                className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full text-xs font-bold md:opacity-0 md:group-hover:opacity-100 transition shadow-lg flex items-center justify-center"
                                            >
                                                ✕
                                            </button>
                                            <div className="font-bold text-gray-100 text-sm mb-3 truncate pr-4">{c.name}</div>
                                            <div className="flex justify-between items-center gap-3">
                                                <input 
                                                    type="number" 
                                                    min="0"
                                                    value={c.qty === 0 ? '' : c.qty}
                                                    onChange={(e) => updateQty(c.id, e.target.value)}
                                                    className="w-20 bg-gray-900 border border-gray-600 rounded-xl text-white text-sm font-bold px-3 py-2 text-center focus:ring-2 focus:ring-orange-500 outline-none"
                                                />
                                                <div className="text-right">
                                                    <div className="text-green-400 font-black">${(c.buy_price * c.qty).toLocaleString()}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-700">
                                <div className="flex flex-col space-y-2">
                                    <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Estimasi Uang Diterima</span>
                                    <span className="text-white font-black text-4xl">${totals.buy.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* =========================================
                INFORMASI CRAFTING (WIKI SECTION)
            ========================================= */}
            <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-gray-200">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <span className="inline-block py-1 px-3 rounded-full bg-orange-100 text-orange-600 text-xs font-black uppercase tracking-widest mb-4">
                        Crafting Wiki
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Panduan Pengolahan Material</h2>
                    <p className="text-gray-500 font-medium text-lg">
                        Pelajari resep dan kombinasi material untuk menciptakan barang dengan nilai jual yang jauh lebih tinggi di Redvox Corp.
                    </p>
                </div>
                
                {/* GRID 6 KATEGORI */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {/* 1. Lumber */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col h-full">
                        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl mb-4 border border-orange-100">🌲</div>
                        <h3 className="font-black text-lg text-gray-900 mb-4">Lumber / Penebang Kayu</h3>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3 text-sm font-bold text-gray-700 flex-grow">
                            <div className="border-b border-gray-200 pb-2">
                                <div className="text-orange-600 mb-1 font-black">Kayu Halus</div>
                                <div className="flex items-start gap-2 text-xs font-medium text-gray-500"><span>➔</span> 4 Kayu Gelondong</div>
                            </div>
                            <div className="pt-1">
                                <div className="text-orange-600 mb-1 font-black">Lem Kayu</div>
                                <div className="flex items-start gap-2 text-xs font-medium text-gray-500"><span>➔</span> 2 Getah + 2 Air Putih</div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Peternakan */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col h-full">
                        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl mb-4 border border-orange-100">🐄</div>
                        <h3 className="font-black text-lg text-gray-900 mb-4">Peternakan</h3>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3 text-sm font-bold text-gray-700 flex-grow">
                            <div className="border-b border-gray-200 pb-2">
                                <div className="text-orange-600 mb-1 font-black leading-tight">Bulu Ayam, Daging Ayam & Kotoran</div>
                                <div className="flex items-start gap-2 text-xs font-medium text-gray-500 mt-1"><span>➔</span> 1 Ayam Mati</div>
                            </div>
                            <div className="pt-1">
                                <div className="text-orange-600 mb-1 font-black">Daging Sapi Merah</div>
                                <div className="flex items-start gap-2 text-xs font-medium text-gray-500"><span>➔</span> 1 Sapi Mati</div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Jahit */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col h-full">
                        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl mb-4 border border-orange-100">🧵</div>
                        <h3 className="font-black text-lg text-gray-900 mb-4">Penjahit</h3>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3 text-sm font-bold text-gray-700 flex-grow">
                            <div className="border-b border-gray-200 pb-2">
                                <div className="text-orange-600 mb-1 font-black">Benang</div>
                                <div className="flex items-start gap-2 text-xs font-medium text-gray-500"><span>➔</span> 1 Bulu Ayam</div>
                            </div>
                            <div className="border-b border-gray-200 pb-2 pt-1">
                                <div className="text-orange-600 mb-1 font-black">Kain</div>
                                <div className="flex items-start gap-2 text-xs font-medium text-gray-500"><span>➔</span> 2 Benang</div>
                            </div>
                            <div className="pt-1">
                                <div className="text-orange-600 mb-1 font-black">Pakaian</div>
                                <div className="flex items-start gap-2 text-xs font-medium text-gray-500"><span>➔</span> 3 Benang + 3 Kain</div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Agrikultur */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col h-full">
                        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl mb-4 border border-orange-100">🌾</div>
                        <h3 className="font-black text-lg text-gray-900 mb-4">Agrikultur & Perkebunan</h3>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2 text-sm font-bold text-gray-700 flex-grow max-h-64 overflow-y-auto custom-scrollbar">
                            <div className="border-b border-gray-200 pb-1.5"><span className="text-orange-600 font-black inline-block w-20">Gula</span> <span className="text-xs text-gray-500 font-medium">➔ 2 Tebu + 2 Kain</span></div>
                            <div className="border-b border-gray-200 pb-1.5 pt-1"><span className="text-orange-600 font-black inline-block w-20">Kopi</span> <span className="text-xs text-gray-500 font-medium">➔ 2 Biji Kopi + 2 Kain</span></div>
                            <div className="border-b border-gray-200 pb-1.5 pt-1"><span className="text-orange-600 font-black inline-block w-20">Garam</span> <span className="text-xs text-gray-500 font-medium">➔ 2 Bubuk Garam + 2 Kain</span></div>
                            <div className="border-b border-gray-200 pb-1.5 pt-1"><span className="text-orange-600 font-black inline-block w-20">Teh Celup</span> <span className="text-xs text-gray-500 font-medium">➔ 2 Teh + 2 Kain</span></div>
                            <div className="border-b border-gray-200 pb-1.5 pt-1"><span className="text-orange-600 font-black inline-block w-20">Beras</span> <span className="text-xs text-gray-500 font-medium">➔ 2 Padi + 2 Kain</span></div>
                            <div className="pt-1"><span className="text-orange-600 font-black inline-block w-20">Pupuk</span> <span className="text-xs text-gray-500 font-medium">➔ 4 Kain + 10 Kotoran</span></div>
                        </div>
                    </div>

                    {/* 5. Perminyakan */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col h-full">
                        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl mb-4 border border-orange-100">🛢️</div>
                        <h3 className="font-black text-lg text-gray-900 mb-4">Perminyakan</h3>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3 text-sm font-bold text-gray-700 flex-grow">
                            <div className="border-b border-gray-200 pb-2">
                                <div className="text-orange-600 mb-1 font-black">Bensin & Solar</div>
                                <div className="flex items-start gap-2 text-xs font-medium text-gray-500"><span>➔</span> 5 Minyak + 2 Getah</div>
                            </div>
                            <div className="border-b border-gray-200 pb-2 pt-1">
                                <div className="text-orange-600 mb-1 font-black">Disel</div>
                                <div className="flex items-start gap-2 text-xs font-medium text-gray-500"><span>➔</span> 5 Minyak + 2 Getah</div>
                            </div>
                            <div className="pt-1">
                                <div className="text-orange-600 mb-1 font-black">Avtur</div>
                                <div className="flex items-start gap-2 text-xs font-medium text-gray-500"><span>➔</span> 10 Minyak + 2 Getah</div>
                            </div>
                        </div>
                    </div>

                    {/* 6. Pertambangan */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col h-full">
                        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl mb-4 border border-orange-100">⛏️</div>
                        <h3 className="font-black text-lg text-gray-900 mb-4">Pertambangan</h3>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2 text-sm font-bold text-gray-700 flex-grow max-h-64 overflow-y-auto custom-scrollbar">
                            <div className="border-b border-gray-200 pb-1.5"><span className="text-orange-600 font-black inline-block w-20">Perak</span> <span className="text-xs text-gray-500 font-medium">➔ 5 Biji Perak + 2 Kayu G.</span></div>
                            <div className="border-b border-gray-200 pb-1.5 pt-1"><span className="text-orange-600 font-black inline-block w-20">Tembaga</span> <span className="text-xs text-gray-500 font-medium">➔ 5 Biji Tembaga + 2 Kayu G.</span></div>
                            <div className="border-b border-gray-200 pb-1.5 pt-1"><span className="text-orange-600 font-black inline-block w-20">Belerang</span> <span className="text-xs text-gray-500 font-medium">➔ 5 Biji Belerang + 2 Kayu G.</span></div>
                            <div className="border-b border-gray-200 pb-1.5 pt-1"><span className="text-orange-600 font-black inline-block w-20">Emas</span> <span className="text-xs text-gray-500 font-medium">➔ 10 Biji Emas + 5 Kayu G.</span></div>
                            <div className="pt-1"><span className="text-orange-600 font-black inline-block w-20">Berlian</span> <span className="text-xs text-gray-500 font-medium">➔ 15 Biji Berlian + 5 Kayu G.</span></div>
                        </div>
                    </div>

                </div>
                
                {/* Banner Bantuan */}
                <div className="mt-10 bg-gray-900 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
                    <div className="text-center sm:text-left">
                        <h4 className="text-xl font-black text-white mb-2">Tidak menemukan resep yang dicari?</h4>
                        <p className="text-gray-400 text-sm font-medium">Temui staf internal Redvox di kota untuk negosiasi material rahasia.</p>
                    </div>
                    <div className="px-6 py-3 bg-white/10 border border-gray-700 text-white font-bold rounded-full whitespace-nowrap cursor-not-allowed">
                        🔒 Akses Terbatas
                    </div>
                </div>

            </section>

            {/* =========================================
                LAYANAN B2B REDVOX (PAKET)
            ========================================= */}
            <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-gray-200">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <span className="inline-block py-1 px-3 rounded-full bg-orange-100 text-orange-600 text-xs font-black uppercase tracking-widest mb-4">
                        Layanan B2B Redvox
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Paket Suplai Bisnis</h2>
                    <p className="text-gray-500 font-medium text-lg">
                        Selain membeli material, Redvox Corp juga menyediakan paket bundling dalam jumlah besar untuk memenuhi kebutuhan bisnis dan faksi Anda di kota.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* 1. Paket Furniture */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition duration-300 flex flex-col">
                        <div className="h-48 bg-gray-50 relative overflow-hidden border-b border-gray-100">
                            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-transparent"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-7xl transform group-hover:scale-110 transition duration-500">🛋️</div>
                        </div>
                        <div className="p-8 flex flex-col flex-grow">
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Paket Furniture</h3>
                            <p className="text-gray-500 text-sm mb-8 font-medium flex-grow leading-relaxed">
                                Suplai perabotan lengkap untuk dekorasi rumah, apartemen, atau kantor baru Anda. Langsung terima beres tanpa harus merakit bahan mentah satu per satu.
                            </p>
                            <button className="w-full py-3 bg-orange-50 hover:bg-orange-500 text-orange-600 hover:text-white font-bold rounded-xl transition text-sm">
                                Pesan via IC
                            </button>
                        </div>
                    </div>

                    {/* 2. Paket Restoran */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition duration-300 flex flex-col">
                        <div className="h-48 bg-gray-50 relative overflow-hidden border-b border-gray-100">
                            <div className="absolute inset-0 bg-gradient-to-tr from-green-500/10 to-transparent"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-7xl transform group-hover:scale-110 transition duration-500">🍔</div>
                        </div>
                        <div className="p-8 flex flex-col flex-grow">
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Paket Restaurant</h3>
                            <p className="text-gray-500 text-sm mb-8 font-medium flex-grow leading-relaxed">
                                Kebutuhan dapur dari bahan baku mentah (pertanian/peternakan), alat masak, hingga suplai bahan siap saji untuk menjaga restoran Anda beroperasi 24/7.
                            </p>
                            <button className="w-full py-3 bg-orange-50 hover:bg-orange-500 text-orange-600 hover:text-white font-bold rounded-xl transition text-sm">
                                Pesan via IC
                            </button>
                        </div>
                    </div>

                    {/* 3. Paket Senjata */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition duration-300 flex flex-col">
                        <div className="h-48 bg-gray-50 relative overflow-hidden border-b border-gray-100">
                            <div className="absolute inset-0 bg-gradient-to-tr from-green-500/10 to-transparent"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-7xl transform group-hover:scale-110 transition duration-500">🔫</div>
                        </div>
                        <div className="p-8 flex flex-col flex-grow">
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Paket Senjata</h3>
                            <p className="text-gray-500 text-sm mb-8 font-medium flex-grow leading-relaxed">
                                Suplai logistik "khusus" berlisensi maupun tanpa lisensi. Diperuntukkan bagi penjagaan bisnis atau kebutuhan operasional tingkat tinggi faksi Anda.
                            </p>
                            <button className="w-full py-3 bg-orange-50 hover:bg-orange-500 text-orange-600 hover:text-white font-bold rounded-xl transition text-sm">
                                Pesan via IC
                            </button>
                        </div>
                    </div>


                
                    {/* 4. Paket Custom (Full Width Banner) */}
                    <div className="md:col-span-3 bg-gray-900 rounded-3xl border border-gray-800 shadow-xl overflow-hidden group hover:shadow-2xl transition duration-300 relative flex flex-col md:flex-row">
                        {/* Efek Cahaya Latar */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500 blur-[100px] opacity-20 group-hover:opacity-40 transition pointer-events-none"></div>
                        
                        {/* Bagian Kiri: Ikon */}
                        <div className="md:w-1/3 h-48 md:h-auto bg-gray-800 relative overflow-hidden border-b md:border-b-0 md:border-r border-gray-700 flex-shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 to-transparent"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-7xl md:text-8xl transform group-hover:scale-110 transition duration-500">
                                🔫
                            </div>
                        </div>

                        {/* Bagian Kanan: Teks & Tombol */}
                        <div className="p-8 md:p-10 relative z-10 flex flex-col justify-center flex-grow">
                            <h3 className="text-2xl md:text-3xl font-black text-white mb-3">Paket Custom</h3>
                            <p className="text-gray-400 text-sm md:text-base mb-8 font-medium leading-relaxed max-w-4xl">
                                Suplai logistik "khusus" berlisensi maupun tanpa lisensi. Diperuntukkan bagi penjagaan bisnis atau kebutuhan operasional tingkat tinggi faksi Anda. Kuantitas dan jenis barang dapat dinegosiasikan secara langsung.
                            </p>
                            <div className="md:self-start">
                                <button className="w-full md:w-auto px-10 py-4 bg-white/10 hover:bg-red-600 text-white font-bold rounded-xl transition shadow-lg border border-gray-700 hover:border-red-500">
                                    Buka Jalur Khusus
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* =========================================
                FOOTER PUBLIK
            ========================================= */}
            <footer className="bg-white border-t border-gray-200 py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center">
                    <div className="text-2xl font-black tracking-wider text-gray-300 mb-4">
                        REDVOX<span className="text-gray-200">.</span>
                    </div>
                    <p className="text-gray-400 font-medium text-sm">
                        © {new Date().getFullYear()} Redvox Corp. Sistem Kalkulator Pengepul Resmi.
                    </p>
                </div>
            </footer>
        </div>
    );
}