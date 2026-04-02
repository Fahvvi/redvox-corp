import { useState } from 'react';
import { Link } from '@inertiajs/react';

export default function AuthenticatedLayout({ user, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    
    const isAdmin = user.role === 'admin';
    const isVIP = user.role === 'admin' || user.role === 'vip';

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-orange-500 selection:text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
            
            {/* NAVBAR */}
            <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        
                        {/* Kiri: Logo & Menu Desktop */}
                        <div className="flex items-center gap-x-12">
                            <Link href="/dashboard" className="text-2xl md:text-3xl font-black tracking-wider text-orange-500 hover:scale-105 transition transform">
                                REDVOX<span className="text-gray-900">.</span>
                            </Link>

                            {/* Menu Desktop (Disembunyikan di layar kecil) */}
                            <div className="hidden md:flex items-center gap-x-8">
                                <Link href={route('dashboard')} className="text-sm font-bold text-gray-600 hover:text-orange-500 transition">
                                    Dashboard
                                </Link>
                                <Link href={route('kalkulator')} className="text-sm font-bold text-gray-600 hover:text-orange-500 transition">
                                    Kalkulator
                                </Link>
                                <Link href={route('deposits.index')} className="text-sm font-bold text-gray-600 hover:text-orange-500 transition">
                                    Deposit & JV
                                </Link>
                                <Link href={route('inventory.index')} className="text-sm font-bold text-gray-600 hover:text-orange-500 transition">
                                    Inventaris
                                </Link>

                                {/* DROPDOWN MANAJEMEN KHUSUS VIP & ADMIN */}
                                {isVIP && (
                                    <div className="relative group">
                                        <button className="text-sm font-bold text-gray-900 flex items-center gap-1 hover:text-orange-500 transition py-2">
                                            Manajemen Operasional <span className="text-xs transition-transform group-hover:rotate-180">▼</span>
                                        </button>
                                        
                                        <div className="absolute left-0 mt-0 w-56 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                            <div className="bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden flex flex-col p-2 gap-1">
                                                <Link href={route('pos.create')} className="px-4 py-3 text-sm font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition flex items-center gap-2">
                                                    <span>💳</span> Mesin Kasir (POS)
                                                </Link>
                                                <Link href={route('items.manage')} className="px-4 py-3 text-sm font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition flex items-center gap-2">
                                                    <span>📦</span> Katalog Material
                                                </Link>
                                                {isAdmin && (
                                                    <Link href={route('users.index')} className="px-4 py-3 text-sm font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition flex items-center gap-2 border-t border-gray-100 mt-1 pt-3">
                                                        <span>👥</span> Akses Karyawan
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Kanan: Profil & Logout (Desktop) */}
                        <div className="hidden md:flex items-center gap-x-6">
                            <div className="flex items-center gap-x-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
                                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="text-sm font-bold text-gray-800">{user.name} <span className="uppercase text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-black ml-1">{user.role}</span></span>
                            </div>
                            <Link method="post" href={route('logout')} as="button" className="text-sm font-bold text-red-500 hover:bg-red-50 hover:px-4 py-2 rounded-full transition-all">
                                Keluar
                            </Link>
                        </div>

                        {/* Hamburger Button (Mobile) */}
                        <div className="-mr-2 flex items-center md:hidden">
                            <button onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)} className="p-2 rounded-xl text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none transition">
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    <path className={showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                    </div>
                </div>

                {/* MOBILE MENU DROPDOWN */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' md:hidden bg-white border-t border-gray-200 absolute w-full shadow-2xl pb-4'}>
                    <div className="pt-2 pb-3 space-y-1 px-4 border-b border-gray-100">
                        <Link href={route('dashboard')} className="block py-3 text-base font-bold text-gray-700 hover:text-orange-500 border-b border-gray-50">Dashboard</Link>
                        <Link href={route('kalkulator')} className="block py-3 text-base font-bold text-gray-700 hover:text-orange-500 border-b border-gray-50">Kalkulator Internal</Link>
                        <Link href={route('deposits.index')} className="block py-3 text-base font-bold text-gray-700 hover:text-orange-500 border-b border-gray-50">Deposit & JV</Link>
                        <Link href={route('inventory.index')} className="block py-3 text-base font-bold text-gray-700 hover:text-orange-500">Inventaris Pribadi</Link>
                    </div>

                    {isVIP && (
                        <div className="pt-2 pb-3 space-y-1 px-4 bg-orange-50/30">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pt-2 pb-1">Manajemen Operasional</p>
                            <Link href={route('pos.create')} className="block py-3 text-base font-bold text-gray-800 hover:text-orange-500 border-b border-orange-100/50">💳 Kasir (POS)</Link>
                            <Link href={route('items.manage')} className="block py-3 text-base font-bold text-gray-800 hover:text-orange-500 border-b border-orange-100/50">📦 Katalog Material</Link>
                            {isAdmin && (
                                <Link href={route('users.index')} className="block py-3 text-base font-bold text-gray-800 hover:text-orange-500">👥 Akses Karyawan</Link>
                            )}
                        </div>
                    )}

                    <div className="pt-4 border-t border-gray-200 bg-gray-50 px-6 mt-2">
                        <div className="flex items-center mb-4">
                            <div className="font-black text-lg text-gray-900">{user.name}</div>
                            <span className="uppercase text-[10px] font-black bg-gray-200 text-gray-700 px-2 py-0.5 rounded ml-2">{user.role}</span>
                        </div>
                        <Link method="post" href={route('logout')} as="button" className="block w-full py-3 bg-red-100 text-red-600 rounded-xl font-bold text-center hover:bg-red-200 transition">
                            Keluar dari Sistem
                        </Link>
                    </div>
                </div>
            </nav>

            {/* MAIN CONTENT */}
            <main className="py-10">{children}</main>
        </div>
    );
}