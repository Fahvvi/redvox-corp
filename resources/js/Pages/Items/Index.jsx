import { Head, Link } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';

export default function Index({ auth, items, leaderboardData = {} }) {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [cart, setCart] = useState([]);
    const [showingMobileMenu, setShowingMobileMenu] = useState(false);
    
    const [transactionType, setTransactionType] = useState('standar');
    const [dynamicAdjustment, setDynamicAdjustment] = useState('');

    // ==========================================
    // FITUR: RADAR PENGUMUMAN HARGA (POLLING)
    // ==========================================
    const [announcement, setAnnouncement] = useState('');
    const [showAnnouncement, setShowAnnouncement] = useState(false);
    const [lastMessage, setLastMessage] = useState('');

    useEffect(() => {
        const fetchUpdates = () => {
            axios.get('/price-updates')
                .then(res => {
                    const msg = res.data?.message;
                    if (msg && msg !== lastMessage) {
                        setAnnouncement(msg);
                        setLastMessage(msg);
                        setShowAnnouncement(true);
                        
                        setTimeout(() => {
                            setShowAnnouncement(false);
                        }, 35000);
                    }
                })
                .catch(err => {});
        };

        fetchUpdates();
        const interval = setInterval(fetchUpdates, 5000); 
        return () => clearInterval(interval);
    }, [lastMessage]);

    // ==========================================
    // DATA & STATE: INFO SIDEJOB (MODAL)
    // ==========================================
    const [selectedJob, setSelectedJob] = useState(null); // Menyimpan job yang sedang diklik

    const sidejobs = [
        { 
            id: 1, 
            title: 'Tambang Batu', 
            icon: '🪨', 
            desc: 'Lokasi penambangan batu untuk material dasar seperti perak, tembaga, dan emas.', 
            fullDesc: 'Di area penambangan ini, Anda bisa mendapatkan Biji Perak, Tembaga, Belerang, Emas, dan Berlian. Datang ke daerah Flint County lalu bicaralah dengan petugas disana, ambil pekerjaan dan turun kebawah.',
            image: '/images/sidejob-tambang.jpg'
        },
        { 
            id: 2, 
            title: 'Peternakan', 
            icon: '🐄', 
            desc: 'Area peternakan hewan untuk diambil daging, bulu, dan kotorannya.', 
            fullDesc: 'Lokasi peternakan berada di Blueberry Access. Anda bisa mengumpulkan Daging Ayam, Daging Sapi Merah, Bulu, dan Kotoran yang berguna sebagai bahan dasar pembuatan pakaian dan pupuk.',
            image: '/images/sidejob-peternakan.jpg'
        },
        { 
            id: 3, 
            title: 'Lumberjack', 
            icon: '🌲', 
            desc: 'Penebangan pohon untuk mendapatkan kayu gelondong dan getah.', 
            fullDesc: 'Kerja keras memotong pohon di hutan Panopticon, dekat dengan Blueberry Access. Hasil dari pekerjaan ini adalah Kayu Gelondong dan Getah. Sangat penting untuk membuat Kayu Halus dan Lem Kayu.',
            image: '/images/sidejob-lumberjack.png'
        },
        { 
            id: 4, 
            title: 'Penjahit', 
            icon: '🧵', 
            desc: 'Pusat konveksi untuk memproses bulu ayam menjadi pakaian jadi.', 
            fullDesc: 'Di tempat penjahit yang berada di sekitar Marina, Anda bisa mengolah Bulu Ayam menjadi Benang, Benang menjadi Kain, dan Kain menjadi Pakaian siap jual dengan nilai tinggi.',
            image: '/images/sidejob-penjahit.jpg'
        },
        { 
            id: 5, 
            title: 'Tambang Minyak', 
            icon: '🛢️', 
            desc: 'Pengeboran minyak mentah untuk dijadikan bahan bakar.', 
            fullDesc: 'Area pengeboran minyak mentah yang berlokasi di Ocean Docks, dekat dengan Dealer Mobil Diamond. Anda bisa mengolah minyak yang didapat di sini menjadi Bensin, Solar, Disel, hingga Avtur.',
            image: '/images/sidejob-tambangminyak.jpg'
        },
        { 
            id: 6, 
            title: 'Berburu', 
            icon: '🦌', 
            desc: 'Perburuan hewan di hutan Panopticon untuk mendapatkan kulit.', 
            fullDesc: 'Gunakan senapan berburu Anda di area hutan yang diizinkan. Kulit hewan buruan memiliki nilai jual tersendiri di pasar Redfox.',
            image: '/images/sidejob-berburu.jpg'
        },
    ];
    // ==========================================

    const categories = useMemo(() => {
        return [...new Set(items.map(item => item.category))];
    }, [items]);

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                              item.category.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === '' || item.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, qty: (Number(i.qty) || 0) + 1 } : i);
            }
            return [...prev, { ...item, qty: 1 }];
        });
    };

    const handleQtyChange = (id, value) => {
        if (value === '') {
            setCart(prev => prev.map(i => i.id === id ? { ...i, qty: '' } : i));
            return;
        }
        let cleanVal = value.replace(/^0+(?=\d)/, ''); 
        if (/^\d+$/.test(cleanVal)) {
            setCart(prev => prev.map(i => i.id === id ? { ...i, qty: parseInt(cleanVal, 10) } : i));
        }
    };

    const incrementQty = (id) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const currentQty = Number(item.qty) || 0;
                return { ...item, qty: currentQty + 1 };
            }
            return item;
        }));
    };

    const decrementQty = (id) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const currentQty = Number(item.qty) || 0;
                return { ...item, qty: currentQty > 0 ? currentQty - 1 : 0 };
            }
            return item;
        }));
    };

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

    const totals = useMemo(() => {
        let buy = 0; 
        cart.forEach(c => { 
            const itemQty = Number(c.qty) || 0;
            let basePrice = c.buy_price;
            if (transactionType === 'korporat') {
                basePrice = basePrice * 1.33;
            }
            buy += (basePrice * itemQty); 
        });

        if (transactionType === 'dinamis') {
            const extra = parseFloat(dynamicAdjustment) || 0;
            buy += extra;
        }

        if (buy < 0) buy = 0;
        return { buy };
    }, [cart, transactionType, dynamicAdjustment]);

    const categoryConfig = {
        donator: { title: 'Top Donator', icon: '💎', unit: 'IDR' },
        playhours: { title: 'Top Playhours', icon: '⏱️', unit: 'Jam' },
        staff: { title: 'Top Staff', icon: '🛡️', unit: 'Skor' },
        gangturf: { title: 'Top Gang Turf', icon: '🏴‍☠️', unit: 'Turf' },
        playingtime: { title: 'Top Playing Time', icon: '⏳', unit: '' },
        truck: { title: 'Top Trucker', icon: '🚚', unit: 'Trip' },
        harvester: { title: 'Top Harvester', icon: '🚜', unit: 'Panen' },
        pizza: { title: 'Top Pizza Delivery', icon: '🍕', unit: 'Delivery' },
        penebang: { title: 'Top Penebang Pohon', icon: '🌲', unit: 'Pohon' },
        penambangbatu: { title: 'Top Penambang Batu', icon: '🪨', unit: 'Batu' },
        penambangminyak: { title: 'Top Penambang Minyak', icon: '🛢️', unit: 'Barrel' },
        penjahit: { title: 'Top Penjahit', icon: '🧵', unit: 'Jahitan' },
        peternak: { title: 'Top Peternak', icon: '🐄', unit: 'Ternak' },
        pilot: { title: 'Top Pilot', icon: '✈️', unit: 'Jam Terbang' },
        mekanik: { title: 'Top Mekanik', icon: '🔧', unit: 'Servis' },
        fisherman: { title: 'Top Nelayan', icon: '🎣', unit: 'Ikan' },
        bus: { title: 'Top Supir Bus', icon: '🚌', unit: 'Rute' },
        sweeper: { title: 'Top Sweeper', icon: '🧹', unit: 'Jalan' },
        berburu: { title: 'Top Pemburu', icon: '🦌', unit: 'Hewan' },
    };

    const formatScore = (score) => {
        if (!isNaN(score) && score !== '') {
            return Number(score).toLocaleString();
        }
        return score; 
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 selection:bg-orange-500 selection:text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <Head title="Redfox Corp - Market Hub" />

            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 transition-all duration-300">
                {/* ... (KODE NAVBAR DESKTOP & MOBILE TETAP SAMA) ... */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center">
                            <Link href="/" className="text-2xl md:text-3xl font-black tracking-wider text-orange-500 hover:scale-105 transition transform">
                                REDFOX<span className="text-gray-900">.</span>
                            </Link>
                        </div>

                        <div className="hidden lg:flex items-center gap-8 font-bold">
                            <div className="flex items-center gap-6">
                                <a href="#kalkulator" className="text-sm text-gray-500 hover:text-orange-500 transition relative group">
                                    Kalkulator
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></span>
                                </a>
                                <a href="#sidejob" className="text-sm text-gray-500 hover:text-orange-500 transition relative group">
                                    Info Sidejob
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></span>
                                </a>
                                <a href="#crafting" className="text-sm text-gray-500 hover:text-orange-500 transition relative group">
                                    Resep Crafting
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></span>
                                </a>
                                <a href="#b2b" className="text-sm text-gray-500 hover:text-orange-500 transition relative group">
                                    Paket Bisnis
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></span>
                                </a>
                                <a href="#leaderboard" className="text-sm text-gray-500 hover:text-orange-500 transition relative group">
                                    Papan Peringkat
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></span>
                                </a>
                            </div>
                            
                            <div className="w-px h-6 bg-gray-200"></div>

                            {auth.user ? (
                                <Link href={route('dashboard')} className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-orange-500 text-white rounded-full shadow-md transition transform hover:-translate-y-0.5 text-sm">
                                    Dashboard
                                </Link>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link href={route('login')} className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-full transition text-sm border border-gray-200">
                                        Masuk
                                    </Link>
                                    <Link href={route('register')} className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-md transition transform hover:-translate-y-0.5 text-sm">
                                        Daftar VIP
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="flex lg:hidden">
                            <button 
                                onClick={() => setShowingMobileMenu(!showingMobileMenu)}
                                className="p-2 text-gray-500 hover:bg-gray-100 hover:text-orange-500 rounded-xl focus:outline-none transition"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path className={!showingMobileMenu ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    <path className={showingMobileMenu ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={`${showingMobileMenu ? 'block' : 'hidden'} lg:hidden bg-white border-t border-gray-100 shadow-2xl absolute w-full`}>
                    <div className="px-4 py-6 flex flex-col gap-2">
                        <a href="#kalkulator" onClick={() => setShowingMobileMenu(false)} className="px-4 py-3 text-sm font-bold text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition flex items-center gap-3">
                            <span className="text-lg">🧮</span> Kalkulator Pengepul
                        </a>
                        <a href="#sidejob" onClick={() => setShowingMobileMenu(false)} className="px-4 py-3 text-sm font-bold text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition flex items-center gap-3">
                            <span className="text-lg">🗺️</span> Info Sidejob
                        </a>
                        <a href="#crafting" onClick={() => setShowingMobileMenu(false)} className="px-4 py-3 text-sm font-bold text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition flex items-center gap-3">
                            <span className="text-lg">🛠️</span> Panduan Crafting
                        </a>
                        <a href="#b2b" onClick={() => setShowingMobileMenu(false)} className="px-4 py-3 text-sm font-bold text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition flex items-center gap-3">
                            <span className="text-lg">📦</span> Paket Suplai Bisnis
                        </a>
                        <a href="#leaderboard" onClick={() => setShowingMobileMenu(false)} className="px-4 py-3 text-sm font-bold text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition flex items-center gap-3">
                            <span className="text-lg">🏆</span> Papan Peringkat
                        </a>
                        
                        <div className="h-px bg-gray-100 my-3"></div>

                        {auth.user ? (
                            <Link href={route('dashboard')} className="w-full text-center px-6 py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-orange-500 transition shadow-md">
                                Masuk Dashboard
                            </Link>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <Link href={route('login')} className="w-full text-center px-4 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition border border-gray-200">
                                    Login
                                </Link>
                                <Link href={route('register')} className="w-full text-center px-4 py-3.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition shadow-md">
                                    Daftar VIP
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {showAnnouncement && (
                    <div className="bg-red-600 border-b border-red-800 py-3 overflow-hidden shadow-md relative z-40">
                        <div className="whitespace-nowrap animate-marquee flex items-center">
                            <span className="text-white font-black text-sm md:text-base px-8 tracking-wide">
                                <span className="text-yellow-300 mr-2">⚠️ UPDATE PASAR:</span> 
                                {announcement}
                            </span>
                        </div>
                        <style dangerouslySetInnerHTML={{__html: `
                            @keyframes marquee {
                                0% { transform: translateX(100vw); }
                                100% { transform: translateX(-100%); }
                            }
                            .animate-marquee {
                                display: inline-block;
                                animation: marquee 35s linear forwards; 
                            }
                        `}} />
                    </div>
                )}

            </nav>

            {!auth.user && (
                <header className="px-4 sm:px-6 py-16 md:py-24 text-center bg-white border-b border-gray-200 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50 via-white to-white opacity-80"></div>
                    <div className="relative z-10 max-w-3xl mx-auto mt-4">
                        <span className="inline-block py-1 px-3 rounded-full bg-orange-100 text-orange-600 text-xs font-black uppercase tracking-widest mb-6 border border-orange-200">
                            Pusat Pengepul Side-Job
                        </span>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 text-gray-900 tracking-tight leading-tight">
                            Jual Materialmu ke <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Redfox.</span>
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

            <section id="kalkulator" className="py-12 md:py-16 px-4 sm:px-6 max-w-7xl mx-auto scroll-mt-20">
                {/* ... (KODE KALKULATOR TETAP SAMA TIDAK DIUBAH) ... */}
                {auth.user && (
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
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-gray-900">Katalog Pembelian</h2>
                                <p className="text-gray-500 text-sm mt-1 font-medium">Klik tombol <b className="text-orange-500">+</b> untuk simulasi penjualan.</p>
                            </div>
                            
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

                                <div className="relative w-full sm:w-56">
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

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="max-h-[600px] overflow-y-auto w-full custom-scrollbar">
                                <table className="w-full text-left min-w-[300px] md:min-w-full">
                                    <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
                                        <tr className="text-[10px] md:text-xs uppercase tracking-widest text-gray-500 font-bold">
                                            <th className="px-3 md:px-5 py-4 w-12 md:w-16 text-center">Aksi</th>
                                            <th className="px-3 md:px-5 py-4">Nama Material</th>
                                            <th className="px-3 md:px-5 py-4 text-right">Harga Dasar</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredItems.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="text-center py-12 text-gray-400 font-medium text-sm">Material tidak ditemukan.</td>
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
                                                        <span className="text-green-600 font-black bg-green-50 px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-base border border-green-100 whitespace-nowrap">
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

                    <div id="kalkulator-cart" className="lg:col-span-1 scroll-mt-24">
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
                                        Klik tombol <b className="text-orange-500">+</b> pada tabel <br/>untuk mulai simulasi.
                                    </div>
                                ) : (
                                    cart.map((c) => {
                                        const displayPrice = transactionType === 'korporat' ? c.buy_price * 1.33 : c.buy_price;
                                        const itemQty = Number(c.qty) || 0;
                                        const totalItemPrice = displayPrice * itemQty;

                                        return (
                                            <div key={c.id} className="bg-gray-800 p-3 md:p-4 rounded-2xl border border-gray-700 relative group flex flex-col sm:flex-row justify-between gap-3">
                                                <div className="flex-1 pr-6 sm:pr-2">
                                                    <div className="font-bold text-gray-100 text-sm mb-1 break-words leading-tight">
                                                        {c.name} {transactionType === 'korporat' && <span className="text-indigo-400 text-[10px]"> (+33%)</span>}
                                                    </div>
                                                    <div className="text-xs font-medium text-gray-400">
                                                        @ ${displayPrice.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between sm:justify-end sm:flex-col gap-2 mt-2 sm:mt-0">
                                                    <div className="flex items-center bg-gray-900 border border-gray-600 rounded-lg overflow-hidden h-9 md:h-10">
                                                        <button onClick={() => decrementQty(c.id)} className="w-9 h-full bg-gray-700 hover:bg-gray-600 text-white font-black flex items-center justify-center text-lg transition active:bg-gray-500">-</button>
                                                        <input 
                                                            type="text" 
                                                            inputMode="numeric"
                                                            value={c.qty}
                                                            onChange={(e) => handleQtyChange(c.id, e.target.value)}
                                                            onBlur={() => handleQtyBlur(c.id)}
                                                            className="w-14 h-full bg-transparent text-white text-sm font-bold text-center outline-none border-none focus:ring-0 p-0 m-0"
                                                        />
                                                        <button onClick={() => incrementQty(c.id)} className="w-9 h-full bg-gray-700 hover:bg-gray-600 text-white font-black flex items-center justify-center text-lg transition active:bg-gray-500">+</button>
                                                    </div>
                                                    <div className="text-red-400 font-black text-sm md:text-base whitespace-nowrap">
                                                        ${totalItemPrice.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                                    </div>
                                                </div>

                                                <button onClick={() => removeFromCart(c.id)} className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold md:opacity-0 md:group-hover:opacity-100 transition shadow-lg flex items-center justify-center z-10">
                                                    ✕
                                                </button>
                                            </div>
                                        )
                                    })
                                )}
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-700">
                                <div className="flex flex-col space-y-1 md:space-y-2">
                                    <span className="text-gray-400 font-bold text-[10px] md:text-xs uppercase tracking-widest">
                                        Total Estimasi {transactionType !== 'standar' && `(${transactionType})`}
                                    </span>
                                    <span className="text-white font-black text-3xl md:text-4xl truncate">
                                        ${totals.buy.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {cart.length > 0 && (
                <div className="lg:hidden fixed bottom-4 left-4 right-4 bg-gray-900 border border-gray-700 shadow-2xl rounded-2xl p-4 z-50 flex justify-between items-center animate-bounce-short">
                    <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total {transactionType !== 'standar' && `(${transactionType})`}</div>
                        <div className="text-lg font-black text-green-400">${totals.buy.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                    </div>
                    <a href="#kalkulator-cart" className="px-5 py-2.5 bg-orange-500 text-white text-xs font-bold rounded-xl shadow-md">
                        Lihat ({cart.length})
                    </a>
                </div>
            )}

            {/* =========================================
                INFO SIDEJOB (NEW SECTION DENGAN MODAL)
            ========================================= */}
            <section id="sidejob" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-gray-200 scroll-mt-20">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <span className="inline-block py-1 px-3 rounded-full bg-orange-100 text-orange-600 text-xs font-black uppercase tracking-widest mb-4">
                        Peta Pekerjaan
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Lokasi Sidejob di Indolife</h2>
                    <p className="text-gray-500 font-medium text-lg">
                        Panduan lokasi untuk mengumpulkan material mentah di kota sebelum disetorkan ke gudang Redfox.
                    </p>
                </div>

                <div className="flex overflow-x-auto gap-6 pb-8 custom-scrollbar snap-x snap-mandatory">
                    {sidejobs.map((job) => (
                        <div key={job.id} className="min-w-[280px] md:min-w-[320px] bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col flex-shrink-0 snap-center overflow-hidden">
                            <div className="h-48 bg-gray-100 flex items-center justify-center text-6xl border-b border-gray-100 relative">
                                {job.icon}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                            </div>
                            
                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="font-black text-xl text-gray-900 mb-3">{job.id}. {job.title}</h3>
                                
                                <p className="text-gray-500 text-sm font-medium mb-6 flex-grow leading-relaxed">
                                    {job.desc}
                                </p>
                                
                                <button 
                                    onClick={() => setSelectedJob(job)}
                                    className="mt-auto w-full py-3 bg-gray-50 hover:bg-orange-50 text-gray-600 hover:text-orange-600 font-bold rounded-xl transition text-sm flex items-center justify-center gap-2 border border-gray-100"
                                >
                                    Lihat Detail ➔
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section id="crafting" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-gray-200 scroll-mt-20">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <span className="inline-block py-1 px-3 rounded-full bg-orange-100 text-orange-600 text-xs font-black uppercase tracking-widest mb-4">
                        Crafting Wiki
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Panduan Pengolahan Material</h2>
                    <p className="text-gray-500 font-medium text-lg">
                        Pelajari resep dan kombinasi material untuk menciptakan barang dengan nilai jual yang jauh lebih tinggi di Redfox Corp.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col h-full">
                        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl mb-4 border border-orange-100">🛢️</div>
                        <h3 className="font-black text-lg text-gray-900 mb-4">Perminyakan</h3>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3 text-sm font-bold text-gray-700 flex-grow">
                            <div className="border-b border-gray-200 pb-2">
                                <div className="text-orange-600 mb-1 font-black">Bensin & Solar</div>
                                <div className="flex items-start gap-2 text-xs font-medium text-gray-500"><span>➔</span> 5 Minyak + 1 Getah</div>
                            </div>
                            <div className="border-b border-gray-200 pb-2 pt-1">
                                <div className="text-orange-600 mb-1 font-black">Disel</div>
                                <div className="flex items-start gap-2 text-xs font-medium text-gray-500"><span>➔</span> 5 Minyak + 1 Getah</div>
                            </div>
                            <div className="pt-1">
                                <div className="text-orange-600 mb-1 font-black">Avtur</div>
                                <div className="flex items-start gap-2 text-xs font-medium text-gray-500"><span>➔</span> 10 Minyak + 2 Getah</div>
                            </div>
                        </div>
                    </div>

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
            </section>

            <section id="b2b" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-gray-200 scroll-mt-20">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <span className="inline-block py-1 px-3 rounded-full bg-orange-100 text-orange-600 text-xs font-black uppercase tracking-widest mb-4">
                        Layanan B2B Redfox
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Paket Suplai Bisnis</h2>
                    <p className="text-gray-500 font-medium text-lg">
                        Selain membeli material, Redfox Corp juga menyediakan paket bundling dalam jumlah besar untuk memenuhi kebutuhan bisnis dan faksi Anda di kota.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition duration-300 flex flex-col">
                        <div className="h-48 bg-gray-50 relative overflow-hidden border-b border-gray-100">
                            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-transparent"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-7xl transform group-hover:scale-110 transition duration-500">🛋️</div>
                        </div>
                        <div className="p-6 md:p-8 flex flex-col flex-grow">
                            <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2">Paket Furniture</h3>
                            <p className="text-gray-500 text-sm mb-8 font-medium flex-grow leading-relaxed">
                                Suplai perabotan lengkap untuk dekorasi rumah, apartemen, atau kantor baru Anda. Langsung terima beres tanpa harus merakit bahan mentah satu per satu.
                            </p>
                            <button className="w-full py-3 bg-orange-50 hover:bg-orange-500 text-orange-600 hover:text-white font-bold rounded-xl transition text-sm">
                                Pesan via IC
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition duration-300 flex flex-col">
                        <div className="h-48 bg-gray-50 relative overflow-hidden border-b border-gray-100">
                            <div className="absolute inset-0 bg-gradient-to-tr from-green-500/10 to-transparent"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-7xl transform group-hover:scale-110 transition duration-500">🍔</div>
                        </div>
                        <div className="p-6 md:p-8 flex flex-col flex-grow">
                            <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2">Paket Restaurant</h3>
                            <p className="text-gray-500 text-sm mb-8 font-medium flex-grow leading-relaxed">
                                Kebutuhan dapur dari bahan baku mentah (pertanian/peternakan), alat masak, hingga suplai bahan siap saji untuk menjaga restoran Anda beroperasi 24/7.
                            </p>
                            <button className="w-full py-3 bg-orange-50 hover:bg-orange-500 text-orange-600 hover:text-white font-bold rounded-xl transition text-sm">
                                Pesan via IC
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition duration-300 flex flex-col">
                        <div className="h-48 bg-gray-50 relative overflow-hidden border-b border-gray-100">
                            <div className="absolute inset-0 bg-gradient-to-tr from-green-500/10 to-transparent"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-7xl transform group-hover:scale-110 transition duration-500">🔫</div>
                        </div>
                        <div className="p-6 md:p-8 flex flex-col flex-grow">
                            <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2">Paket PTS</h3>
                            <p className="text-gray-500 text-sm mb-8 font-medium flex-grow leading-relaxed">
                                Suplai logistik "khusus" diperuntukkan bagi penjagaan bisnis atau kebutuhan operasional tingkat tinggi faksi Anda.
                            </p>
                            <button className="w-full py-3 bg-orange-50 hover:bg-orange-500 text-orange-600 hover:text-white font-bold rounded-xl transition text-sm">
                                Pesan via IC
                            </button>
                        </div>
                    </div>

                    <div className="md:col-span-3 bg-gray-900 rounded-3xl border border-gray-800 shadow-xl overflow-hidden group hover:shadow-2xl transition duration-300 relative flex flex-col md:flex-row">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500 blur-[100px] opacity-20 group-hover:opacity-40 transition pointer-events-none"></div>
                        <div className="md:w-1/3 h-48 md:h-auto bg-gray-800 relative overflow-hidden border-b md:border-b-0 md:border-r border-gray-700 flex-shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 to-transparent"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-7xl md:text-8xl transform group-hover:scale-110 transition duration-500">
                                🤝
                            </div>
                        </div>
                        <div className="p-8 md:p-10 relative z-10 flex flex-col justify-center flex-grow">
                            <h3 className="text-2xl md:text-3xl font-black text-white mb-3">Paket Custom</h3>
                            <p className="text-gray-400 text-sm md:text-base mb-8 font-medium leading-relaxed max-w-4xl">
                                Butuh suplai yang tidak ada di katalog? Kuantitas dan jenis barang dapat dinegosiasikan secara langsung dengan tim kami.
                            </p>
                            <div className="md:self-start">
                                <button className="w-full md:w-auto px-8 py-3.5 bg-white/10 hover:bg-red-600 text-white font-bold rounded-xl transition shadow-lg border border-gray-700 hover:border-red-500 text-sm md:text-base">
                                    Buka Jalur Khusus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="leaderboard" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-gray-200 scroll-mt-20">
                <div className="text-center mb-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-orange-100 text-orange-600 text-xs font-black uppercase tracking-widest mb-4">
                        Hall of Fame
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Peringkat Pekerja Kota</h2>
                    <p className="text-gray-500 font-medium text-lg">
                        Daftar warga dengan kontribusi dan dedikasi tertinggi di berbagai sektor pekerjaan Indolife.
                    </p>
                </div>

                {(!leaderboardData || Object.keys(leaderboardData).length === 0) ? (
                    <div className="bg-white p-10 rounded-3xl shadow-sm text-center text-gray-500 border border-gray-100 font-medium text-sm md:text-base">
                        Data leaderboard saat ini tidak tersedia.
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(leaderboardData).map(([categoryKey, players]) => {
                            const config = categoryConfig[categoryKey] || { 
                                title: `Top ${categoryKey}`, 
                                icon: '🎯', 
                                unit: 'Skor' 
                            };

                            return (
                                <div key={categoryKey} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
                                    <div className="bg-gray-900 px-5 md:px-6 py-4 md:py-5 border-b border-gray-800">
                                        <h3 className="font-black text-white text-base md:text-lg flex items-center gap-3">
                                            <span className="text-xl md:text-2xl">{config.icon}</span> {config.title}
                                        </h3>
                                    </div>
                                    <ul className="divide-y divide-gray-50 flex-grow bg-white p-2">
                                        {Array.isArray(players) && players.length > 0 ? (
                                            players.slice(0, 5).map((player, idx) => (
                                                <li key={idx} className="flex items-center justify-between px-3 md:px-4 py-3 hover:bg-orange-50/50 rounded-xl transition group">
                                                    <div className="flex items-center gap-3 md:gap-4">
                                                        <span className={`min-w-[28px] h-7 flex items-center justify-center font-black text-xs md:text-sm rounded-lg shadow-sm ${
                                                            idx === 0 ? 'bg-yellow-100 text-yellow-600 border border-yellow-200' :
                                                            idx === 1 ? 'bg-gray-100 text-gray-600 border border-gray-200' :
                                                            idx === 2 ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                                                            'bg-gray-50 text-gray-400 border border-gray-100'
                                                        }`}>
                                                            {idx + 1}
                                                        </span>
                                                        <span className="font-bold text-gray-800 text-xs md:text-sm">{player.name || player.player_name}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xs md:text-sm font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100">
                                                            {formatScore(player.score)}
                                                        </span>
                                                        {config.unit && <div className="text-[8px] md:text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1 pr-1">{config.unit}</div>}
                                                    </div>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="px-4 py-8 text-center text-xs md:text-sm text-gray-400 font-medium">Data belum tersedia</li>
                                        )}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            <footer className="bg-white border-t border-gray-200 py-10 mt-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center">
                    <div className="text-2xl font-black tracking-wider text-gray-300 mb-4">
                        REDFOX<span className="text-gray-200">.</span>
                    </div>
                    <p className="text-gray-400 font-medium text-xs md:text-sm">
                        © {new Date().getFullYear()} Redfox Corp.
                    </p>
                </div>
            </footer>

            {/* ==========================================
                MODAL DETAIL SIDEJOB
            ========================================== */}
            {selectedJob && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop (Klik untuk tutup) */}
                    <div 
                        className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm transition-opacity" 
                        onClick={() => setSelectedJob(null)}
                    ></div>

                    {/* Modal Box */}
                    <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="h-32 sm:h-40 bg-orange-500 flex items-center justify-center text-6xl sm:text-7xl shrink-0">
                            {selectedJob.icon}
                        </div>
                        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-2xl sm:text-3xl font-black text-gray-900">{selectedJob.title}</h3>
                                <button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-red-500 transition text-2xl leading-none">
                                    ✕
                                </button>
                            </div>
                            
                            <div className="text-gray-600 text-sm sm:text-base leading-relaxed mb-8 space-y-4">
                                <p>{selectedJob.fullDesc || "Deskripsi lengkap belum tersedia."}</p>
                                
                                {/* Area Tampil Gambar */}
                                    {selectedJob.image ? (
                                        <img 
                                            src={selectedJob.image} 
                                            alt={`Lokasi ${selectedJob.title}`} 
                                            className="w-full h-auto object-cover rounded-xl border border-gray-200 shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-full h-32 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 font-medium text-xs">
                                            [ Gambar Peta Belum Tersedia ]
                                        </div>
                                    )}
                            </div>

                            <button 
                                onClick={() => setSelectedJob(null)}
                                className="w-full py-3 sm:py-4 bg-gray-900 hover:bg-gray-800 text-white font-black rounded-xl transition shadow-lg text-sm sm:text-base"
                            >
                                Tutup Panduan
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}