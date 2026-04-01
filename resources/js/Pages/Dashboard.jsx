import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

// PASTIKAN PROPS auth DAN stats ADA DI SINI
export default function Dashboard({ auth, stats = {} }) {
    
    // Amankan data agar tidak undefined
    const totalDeposit = stats.total_deposit || 0;
    const totalInventory = stats.total_inventory || 0;
    const companyCash = stats.company_cash || 0;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard - Redvox Corp" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                
                {/* WELCOME BANNER */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-3xl p-8 md:p-10 shadow-lg shadow-orange-500/20 text-white flex justify-between items-center relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-black mb-2">Selamat Datang, {auth.user.name}!</h2>
                        <p className="text-orange-100 font-medium text-lg">Sistem Manajemen Enterprise Redvox Corp siap digunakan.</p>
                    </div>
                    <div className="text-7xl md:text-8xl relative z-10 hidden md:block opacity-90 drop-shadow-md">🦊</div>
                    <div className="absolute -right-10 -top-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                    <div className="absolute left-1/2 bottom-0 w-40 h-40 bg-orange-600 opacity-20 rounded-full blur-2xl"></div>
                </div>

                {/* STATS GRID REAL-TIME */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 group hover:shadow-xl hover:border-orange-200 transition duration-300">
                        <div className="text-orange-500 text-3xl mb-4">💰</div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Nilai Aset Inventaris</p>
                        <h3 className="text-4xl font-black text-gray-900 group-hover:text-orange-500 transition">
                            ${companyCash.toLocaleString()}
                        </h3>
                        <p className="text-sm text-gray-500 mt-2 font-medium">Berdasarkan modal barang di gudang</p>
                    </div>
                    
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 group hover:shadow-xl hover:border-orange-200 transition duration-300">
                        <div className="text-blue-500 text-3xl mb-4">🏦</div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Saldo Deposit</p>
                        <h3 className="text-4xl font-black text-gray-900 group-hover:text-blue-500 transition">
                            ${totalDeposit.toLocaleString()}
                        </h3>
                        <p className="text-sm text-gray-500 mt-2 font-medium">Total uang titipan investor</p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 group hover:shadow-xl hover:border-orange-200 transition duration-300">
                        <div className="text-green-500 text-3xl mb-4">📦</div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Stok Inventaris Aktif</p>
                        <h3 className="text-4xl font-black text-gray-900 group-hover:text-green-500 transition">
                            {totalInventory.toLocaleString()} <span className="text-xl text-gray-400 ml-1">Item</span>
                        </h3>
                        <p className="text-sm text-gray-500 mt-2 font-medium">Barang fisik di storage</p>
                    </div>
                </div>

                {/* QUICK ACTIONS MENU */}
                <div className="pt-6">
                    <h3 className="text-2xl font-black text-gray-900 mb-6 px-2">Menu Operasional</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        
                        <Link href={route('pos.create')} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-orange-400 hover:-translate-y-1 transition duration-300 group text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:bg-orange-500 group-hover:text-white transition duration-300">🛒</div>
                            <h4 className="font-bold text-gray-900 text-lg">Kasir (POS)</h4>
                        </Link>
                        
                        <Link href="#" className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-orange-400 hover:-translate-y-1 transition duration-300 group text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:bg-blue-500 group-hover:text-white transition duration-300">🏦</div>
                            <h4 className="font-bold text-gray-900 text-lg">Kelola Deposit</h4>
                        </Link>

                        <Link href="#" className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-orange-400 hover:-translate-y-1 transition duration-300 group text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:bg-green-500 group-hover:text-white transition duration-300">📦</div>
                            <h4 className="font-bold text-gray-900 text-lg">Inventaris</h4>
                        </Link>

                        <Link href={route('kalkulator')} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-orange-400 hover:-translate-y-1 transition duration-300 group text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:bg-purple-500 group-hover:text-white transition duration-300">📊</div>
                            <h4 className="font-bold text-gray-900 text-lg">Kalkulator Harga</h4>
                        </Link>

                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}