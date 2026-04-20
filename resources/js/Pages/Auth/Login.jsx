import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => reset('password');
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 selection:bg-orange-500 selection:text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <Head title="Login Karyawan - Redfox Corp" />

            {/* KARTU UTAMA (Dibatasi tingginya agar tidak perlu scroll di PC) */}
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row md:h-[550px]">
                
                {/* =========================================
                    KIRI: VISUAL BANNER
                ========================================= */}
                <div className="hidden md:flex md:w-1/2 relative bg-gray-900 flex-col justify-between p-10">
                    {/* Background Gambar Dillimore */}
                    <div 
                        className="absolute inset-0 bg-cover bg-center opacity-40"
                        style={{ backgroundImage: "url('/images/dillimore.jpg')" }}
                    ></div>
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 to-orange-900/60"></div>

                    {/* Logo */}
                    <div className="relative z-10">
                        <Link href="/" className="flex items-center gap-3 w-fit hover:opacity-80 transition">
                            <div className="w-10 h-10 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <span className="text-xl">📦</span>
                            </div>
                            <span className="text-2xl font-black tracking-wider text-white">REDFOX<span className="text-orange-500">.</span></span>
                        </Link>
                    </div>

                    {/* Copywriting */}
                    <div className="relative z-10">
                        <h1 className="text-3xl font-black text-white leading-tight mb-4">
                            Manajemen Suplai <br/> Lebih Cerdas.
                        </h1>
                        <p className="text-gray-300 text-sm font-medium leading-relaxed max-w-sm">
                            Sistem ERP terintegrasi untuk kalkulasi harga, kasir otomatis, dan kontrol inventaris kota secara Real-time.
                        </p>
                        
                        <div className="mt-8 flex gap-8">
                            <div>
                                <div className="text-xl font-black text-white">99.9%</div>
                                <div className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">Akurasi Stok</div>
                            </div>
                            <div>
                                <div className="text-xl font-black text-white">24/7</div>
                                <div className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">Monitoring</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* =========================================
                    KANAN: FORM LOGIN
                ========================================= */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white overflow-y-auto custom-scrollbar">
                    
                    {/* Logo untuk versi Mobile */}
                    <div className="md:hidden mb-8">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-sm border border-orange-200">📦</div>
                            <span className="text-xl font-black tracking-wider text-gray-900">REDFOX<span className="text-orange-500">.</span></span>
                        </Link>
                    </div>

                    <div>
                        <h2 className="text-2xl font-black text-gray-900 mb-1">Selamat Datang!</h2>
                        <p className="text-gray-500 text-sm font-medium mb-6">Silakan masuk menggunakan Email akses Anda.</p>
                    </div>

                    {status && <div className="mb-4 font-bold text-xs text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">{status}</div>}

                    <form onSubmit={submit} className="space-y-4">
                        {/* Input Email */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1" htmlFor="email">Email Akses</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                </div>
                                <input
                                    id="email" type="email" name="email" value={data.email}
                                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition text-gray-800 text-sm font-medium placeholder-gray-400"
                                    placeholder="nama@redfoxcorp.com" autoComplete="username" autoFocus required
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-500 font-bold mt-1">{errors.email}</p>}
                        </div>

                        {/* Input Password */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1" htmlFor="password">Kata Sandi</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                </div>
                                <input
                                    id="password" type="password" name="password" value={data.password}
                                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition text-gray-800 text-sm font-bold tracking-widest placeholder-gray-400"
                                    placeholder="••••••••" autoComplete="current-password" required
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                            </div>
                            {errors.password && <p className="text-xs text-red-500 font-bold mt-1">{errors.password}</p>}
                        </div>

                        {/* Fitur Ekstra */}
                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox" name="remember" checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <span className="ml-2 text-xs text-gray-600 font-medium">Ingat Saya</span>
                            </label>
                            
                            {canResetPassword && (
                                <Link href={route('password.request')} className="text-xs font-bold text-orange-600 hover:text-orange-700 transition">
                                    Lupa password?
                                </Link>
                            )}
                        </div>

                        {/* Tombol Submit */}
                        <button
                            type="submit" disabled={processing}
                            className={`w-full mt-2 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm shadow-md transition-all ${processing ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                            {processing ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-gray-100">
                        <p className="text-[11px] text-gray-400 font-medium mb-2">
                            © {new Date().getFullYear()} Redfox Corp System.
                        </p>
                        <p className="text-xs text-gray-600 font-medium">
                            Belum mendaftar akses VIP? <Link href={route('register')} className="text-orange-600 font-bold hover:underline">Daftar sekarang</Link>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}