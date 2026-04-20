import { useState } from 'react';
import { Link } from '@inertiajs/react';

export default function AuthenticatedLayout({ user, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [hoverLogout, setHoverLogout] = useState(false);
    
    // Logika Hak Akses
    const isAdmin = user.role === 'admin';
    const isVIP = user.role === 'admin' || user.role === 'vip';

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-orange-500 selection:text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
            
            {/* =========================================
                NAVBAR DESKTOP & MOBILE HEADER
            ========================================= */}
            <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        
                        {/* Kiri: Logo & Menu Desktop */}
                        <div className="flex items-center gap-x-8 lg:gap-x-12">
                            <Link href="/dashboard" className="text-2xl md:text-3xl font-black tracking-wider text-orange-500 hover:scale-105 transition transform">
                                REDFOX<span className="text-gray-900">.</span>
                            </Link>

                            {/* Menu Desktop (Disembunyikan di layar kecil) */}
                            <div className="hidden lg:flex items-center gap-x-6">
                                
                                {/* MENU LEVEL 1: Semua Warga Bisa Akses */}
                                <Link href={route('dashboard')} className="text-sm font-bold text-gray-600 hover:text-orange-500 transition px-2 py-2">
                                    Dashboard
                                </Link>
                                <Link href={route('pos.create')} className="text-sm font-bold text-gray-600 hover:text-orange-500 transition flex items-center gap-1.5 px-2 py-2">
                                    <span>💳</span> Kasir
                                </Link>
                                <Link href={route('kalkulator')} className="text-sm font-bold text-gray-600 hover:text-orange-500 transition px-2 py-2">
                                    Kalkulator
                                </Link>
                                <Link href={route('inventory.index')} className="text-sm font-bold text-gray-600 hover:text-orange-500 transition px-2 py-2">
                                    Inventaris
                                </Link>

                                {/* MENU LEVEL 2: Khusus VIP & Admin (Disamakan dengan Master Data) */}
                                {isVIP && (
                                    <Link href={route('deposits.index')} className="ml-2 text-sm font-black text-gray-800 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl flex items-center gap-2 transition border border-gray-200">
                                        <span>🏦</span> Deposit
                                    </Link>
                                )}

                                {/* MENU LEVEL 3: Khusus SUPER ADMIN */}
                                {isAdmin && (
                                    <div className="relative group ml-2">
                                        <button className="text-sm font-black text-gray-800 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl flex items-center gap-2 transition border border-gray-200">
                                            Master Data <span className="text-[10px] transition-transform group-hover:rotate-180">▼</span>
                                        </button>
                                        
                                        <div className="absolute left-0 top-full mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                            <div className="bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden flex flex-col p-2 gap-1 relative before:absolute before:-top-2 before:left-6 before:w-4 before:h-4 before:bg-white before:rotate-45 before:border-l before:border-t before:border-gray-100">
                                                <Link href={route('items.manage')} className="relative z-10 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-orange-600 rounded-xl transition flex items-center gap-3">
                                                    <span className="text-lg">📦</span> Katalog Material
                                                </Link>
                                                <Link href={route('users.index')} className="relative z-10 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-orange-600 rounded-xl transition flex items-center gap-3">
                                                    <span className="text-lg">👥</span> Akses Karyawan
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                  
                        {/* Kanan: Profil & Logout (Desktop) - ANIMASI DINAMIS */}
                        <div className="hidden lg:flex items-center">
                            
                            {/* Card Utama (Wadah Gabungan) */}
                            <div 
                                className={`flex items-center rounded-full border shadow-sm transition-all duration-500 overflow-hidden ${
                                    hoverLogout 
                                        ? 'bg-red-500 border-red-600 shadow-red-500/30' 
                                        : 'bg-white border-gray-200 hover:shadow-md'
                                }`}
                            >
                                {/* Area Profil (Hover untuk memanjangkan detail) */}
                                <div className="group flex items-center gap-x-3 px-4 py-2 cursor-default transition-all duration-500">
                                    
                                    {/* Titik Hijau (Berubah putih saat Logout dihover) */}
                                    <span className={`w-2.5 h-2.5 rounded-full animate-pulse shadow-sm transition-colors duration-500 ${
                                        hoverLogout ? 'bg-white shadow-white/50' : 'bg-green-500 shadow-green-500/50'
                                    }`}></span>
                                    
                                    <div className="flex items-center">
                                        {/* Nama User */}
                                        <span className={`text-sm font-bold transition-colors duration-500 ${
                                            hoverLogout ? 'text-white' : 'text-gray-800'
                                        }`}>
                                            {user.name}
                                        </span>
                                        
                                        {/* Detail Jabatan (Efek Slide Keluar/Memanjang) */}
                                        <div className="max-w-0 opacity-0 group-hover:max-w-[100px] group-hover:opacity-100 transition-all duration-500 ease-in-out overflow-hidden flex items-center">
                                            <span className={`uppercase text-[10px] px-2 py-0.5 rounded font-black ml-2 tracking-widest whitespace-nowrap transition-colors duration-500 ${
                                                hoverLogout 
                                                    ? 'bg-red-600 text-white border border-red-400' 
                                                    : isAdmin ? 'bg-orange-100 text-orange-700' 
                                                    : isVIP ? 'bg-blue-100 text-blue-700' 
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Garis Pemisah Tengah */}
                                <div className={`w-px h-5 transition-colors duration-500 ${
                                    hoverLogout ? 'bg-red-400' : 'bg-gray-200'
                                }`}></div>

                                {/* Tombol Keluar (Pemicu Efek Merah) */}
                                <Link 
                                    method="post" 
                                    href={route('logout')} 
                                    as="button" 
                                    onMouseEnter={() => setHoverLogout(true)}
                                    onMouseLeave={() => setHoverLogout(false)}
                                    className={`text-sm font-bold px-5 py-2 transition-all duration-500 ${
                                        hoverLogout 
                                            ? 'text-white bg-red-600' 
                                            : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                                    }`}
                                >
                                    Keluar
                                </Link>
                                
                            </div>
                        </div>

                        {/* Hamburger Button (Mobile) */}
                        <div className="-mr-2 flex items-center lg:hidden">
                            <button 
                                onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)} 
                                className="p-2 rounded-xl text-gray-500 hover:text-orange-500 hover:bg-orange-50 focus:outline-none transition"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    <path className={showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                    </div>
                </div>

                {/* =========================================
                    MOBILE MENU DROPDOWN
                ========================================= */}
                <div className={`${showingNavigationDropdown ? 'translate-y-0 opacity-100 visible' : '-translate-y-4 opacity-0 invisible'} lg:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-200 shadow-xl transition-all duration-300 ease-in-out z-40`}>
                    <div className="max-h-[80vh] overflow-y-auto custom-scrollbar">
                        
                        {/* ZONA 1: Warga Biasa */}
                        <div className="pt-4 pb-2 px-6">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Operasional Harian</p>
                            <div className="space-y-1">
                                <Link onClick={() => setShowingNavigationDropdown(false)} href={route('dashboard')} className="block px-4 py-3 text-sm font-bold text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition">📊 Dashboard</Link>
                                <Link onClick={() => setShowingNavigationDropdown(false)} href={route('pos.create')} className="block px-4 py-3 text-sm font-bold text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition">💳 Mesin Kasir</Link>
                                <Link onClick={() => setShowingNavigationDropdown(false)} href={route('kalkulator')} className="block px-4 py-3 text-sm font-bold text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition">🧮 Kalkulator Internal</Link>
                                <Link onClick={() => setShowingNavigationDropdown(false)} href={route('inventory.index')} className="block px-4 py-3 text-sm font-bold text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition">🎒 Inventaris Gudang</Link>
                            </div>
                        </div>

                        {/* ZONA 2: VIP & ADMIN */}
                        {isVIP && (
                            <div className="pt-4 pb-2 px-6 mt-2 border-t border-gray-100 bg-gray-50/50">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Keuangan Khusus</p>
                                <Link onClick={() => setShowingNavigationDropdown(false)} href={route('deposits.index')} className="block px-4 py-3 text-sm font-bold text-gray-800 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl transition shadow-sm">
                                    🏦 Manajemen Deposit & JV
                                </Link>
                            </div>
                        )}

                        {/* ZONA 3: SUPER ADMIN */}
                        {isAdmin && (
                            <div className="pt-4 pb-2 px-6 mt-2 border-t border-gray-100 bg-gray-50">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Zona Administrator</p>
                                <div className="space-y-1">
                                    <Link onClick={() => setShowingNavigationDropdown(false)} href={route('items.manage')} className="block px-4 py-3 text-sm font-bold text-gray-800 hover:bg-gray-200 hover:text-gray-900 rounded-xl transition">
                                        📦 Master Katalog Material
                                    </Link>
                                    <Link onClick={() => setShowingNavigationDropdown(false)} href={route('users.index')} className="block px-4 py-3 text-sm font-bold text-gray-800 hover:bg-gray-200 hover:text-gray-900 rounded-xl transition">
                                        👥 Master Akses Warga
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* ZONA PROFIL & LOGOUT */}
                        <div className="mt-4 pt-6 pb-6 px-6 border-t border-gray-100 bg-white">
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-gray-200 font-black text-gray-500 shadow-sm text-lg">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-black text-gray-900">{user.name}</div>
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{user.email}</div>
                                    </div>
                                </div>
                                <Link onClick={() => setShowingNavigationDropdown(false)} method="post" href={route('logout')} as="button" className="w-full py-3.5 bg-red-50 text-red-600 border border-red-100 hover:bg-red-500 hover:text-white rounded-xl font-bold text-sm text-center transition shadow-sm">
                                    Keluar dari Sistem
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </nav>

            {/* =========================================
                MAIN CONTENT (HALAMAN INTI)
            ========================================= */}
            <main className="py-8 md:py-10">{children}</main>
        </div>
    );
}