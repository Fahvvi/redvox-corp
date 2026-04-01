import { useState } from 'react';
import { Link } from '@inertiajs/react';

export default function AuthenticatedLayout({ user, children }) {
    // State untuk membuka/menutup menu di HP
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    // Cek apakah user adalah Admin
    const isAdmin = user.role === 'admin';

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-orange-500 selection:text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
            
            {/* NAVBAR */}
            <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        
                        {/* Kiri: Logo & Menu Desktop */}
                        <div className="flex items-center gap-x-12">
                            <Link href="/" className="text-2xl md:text-3xl font-black tracking-wider text-orange-500 hover:scale-105 transition transform">
                                REDVOX<span className="text-gray-900">.</span>
                            </Link>

                            {/* Menu Desktop (Disembunyikan di layar kecil) */}
                            <div className="hidden md:flex items-center gap-x-8">
                                <Link href={route('dashboard')} className="text-sm font-bold text-gray-900 hover:text-orange-500 transition">
                                    Dashboard
                                </Link>
                                
                                {/* MENU KHUSUS ADMIN */}
                                {isAdmin && (
                                    <>
                                        <Link href={route('pos.create')} className="text-sm font-bold text-gray-500 hover:text-orange-500 transition">
                                            Kasir (POS)
                                        </Link>
                                        <Link href={route('users.index')} className="text-sm font-bold text-gray-500 hover:text-orange-500 transition">
                                            Akses Karyawan
                                        </Link>
                                    </>
                                )}

                                <Link href={route('kalkulator')} className="text-sm font-bold text-gray-500 hover:text-orange-500 transition">
                                    Kalkulator
                                </Link>
                                <Link href={route('deposits.index')} className="text-sm font-bold text-gray-500 hover:text-orange-500 transition">
                                    Deposit
                                </Link>
                                <Link href="#" className="text-sm font-bold text-gray-500 hover:text-orange-500 transition">
                                    Inventaris
                                </Link>
                            </div>
                        </div>

                        {/* Kanan: Profil & Logout (Desktop) */}
                        <div className="hidden md:flex items-center gap-x-6">
                            <div className="flex items-center gap-x-2 bg-orange-50 px-4 py-2 rounded-full border border-orange-100">
                                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="text-sm font-bold text-orange-800">{user.name} <span className="uppercase text-[10px] bg-orange-200 text-orange-800 px-2 py-0.5 rounded ml-1">{user.role}</span></span>
                            </div>
                            <Link 
                                method="post" 
                                href={route('logout')} 
                                as="button" 
                                className="text-sm font-bold text-red-500 hover:text-white hover:bg-red-500 px-4 py-2 rounded-full transition"
                            >
                                Logout
                            </Link>
                        </div>

                        {/* Hamburger Button (Mobile) */}
                        <div className="-mr-2 flex items-center md:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                    </div>
                </div>

                {/* MOBILE MENU DROPDOWN */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' md:hidden bg-white border-t border-gray-200 absolute w-full shadow-lg'}>
                    <div className="pt-2 pb-3 space-y-1 px-4">
                        <Link href={route('dashboard')} className="block py-3 text-base font-bold text-gray-900 border-b border-gray-100">
                            Dashboard
                        </Link>
                        
                        {isAdmin && (
                            <>
                                <Link href={route('pos.create')} className="block py-3 text-base font-bold text-gray-600 hover:text-orange-500 border-b border-gray-100">
                                    Kasir (POS)
                                </Link>
                                <Link href={route('users.index')} className="block py-3 text-base font-bold text-gray-600 hover:text-orange-500 border-b border-gray-100">
                                    Manajemen Akses Karyawan
                                </Link>
                            </>
                        )}

                        <Link href={route('kalkulator')} className="block py-3 text-base font-bold text-gray-600 hover:text-orange-500 border-b border-gray-100">
                            Kalkulator Harga
                        </Link>
                        <Link href={route('deposits.index')} className="block py-3 text-base font-bold text-gray-600 hover:text-orange-500 border-b border-gray-100">
                            Manajemen Deposit & JV
                        </Link>
                        <Link href="#" className="block py-3 text-base font-bold text-gray-600 hover:text-orange-500 border-b border-gray-100">
                            Inventaris Pribadi
                        </Link>
                    </div>

                    {/* Profil & Logout di Mobile */}
                    <div className="pt-4 pb-4 border-t border-gray-200 bg-gray-50 px-4">
                        <div className="flex items-center mb-3">
                            <div className="font-bold text-base text-gray-800">{user.name}</div>
                            <span className="uppercase text-[10px] font-bold bg-orange-200 text-orange-800 px-2 py-0.5 rounded ml-2">{user.role}</span>
                        </div>
                        <Link
                            method="post"
                            href={route('logout')}
                            as="button"
                            className="block w-full text-left py-2 text-base font-bold text-red-600 hover:text-red-800"
                        >
                            Keluar (Logout)
                        </Link>
                    </div>
                </div>
            </nav>

            {/* MAIN CONTENT AREA */}
            <main className="py-10">{children}</main>
        </div>
    );
}