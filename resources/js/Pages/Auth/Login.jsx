import { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const [mounted, setMounted] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        setMounted(true); // Memicu animasi masuk saat komponen dimuat
        return () => reset('password');
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

   return (
        <div className="min-h-screen bg-gray-950 relative flex items-center justify-center p-4 sm:p-6 selection:bg-orange-500 selection:text-white overflow-hidden" style={{ fontFamily: "'Poppins', sans-serif" }}>
            
            {/* AMBIENT GLOW & GRID BACKGROUND */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

            <Head title="Login Karyawan - Redvox Corp" />

            {/* KARTU UTAMA */}
            <div className="relative w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden flex bg-gray-900 min-h-[500px] md:h-[550px]">
                
                {/* BACKGROUND FOTO DENGAN EFEK SLOW ZOOM */}
                <div 
                    className={`absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-out ${mounted ? 'scale-110' : 'scale-100'}`}
                    style={{ backgroundImage: "url('/images/dillimore.jpg')" }}
                >
                    {/* Gradient gelap di kiri agar form lebih terbaca */}
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/40 to-transparent"></div>
                </div>

                {/* PANEL FORM LOGIN (KIRI) */}
                <div 
                    className={`relative z-10 w-full md:absolute md:w-[420px] md:top-6 md:bottom-6 md:left-6 bg-white/95 backdrop-blur-md md:rounded-3xl p-8 flex flex-col justify-center border-y md:border border-white/50 shadow-2xl transition-all duration-700 ease-out transform
                    ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'}`}
                >
                    <Link href="/" className="inline-block mb-6 text-2xl font-black tracking-wider text-orange-500 hover:scale-105 transition transform duration-300 w-fit">
                        REDVOX<span className="text-gray-900">.</span>
                    </Link>

                    <div className="mb-6">
                        <h2 className="text-xl font-black text-gray-900">Selamat Datang</h2>
                        <p className="text-gray-500 text-xs mt-1 font-medium">Otorisasi masuk portal manajerial Redvox.</p>
                    </div>

                    {status && <div className="mb-4 font-bold text-xs text-green-600 bg-green-50 p-2.5 rounded-lg border border-green-200">{status}</div>}

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1" htmlFor="email">Email Akses</label>
                            <input
                                id="email" type="email" name="email" value={data.email}
                                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition text-gray-800 font-bold shadow-sm"
                                autoComplete="username" autoFocus
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            {errors.email && <p className="text-xs text-red-500 font-bold mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-bold text-gray-700" htmlFor="password">Kata Sandi</label>
                                {canResetPassword && (
                                    <Link href={route('password.request')} className="text-[10px] font-bold text-orange-500 hover:text-orange-600 transition">
                                        Lupa Sandi?
                                    </Link>
                                )}
                            </div>
                            <input
                                id="password" type="password" name="password" value={data.password}
                                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition text-gray-800 font-bold tracking-widest shadow-sm"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            {errors.password && <p className="text-xs text-red-500 font-bold mt-1">{errors.password}</p>}
                        </div>

                        <div className="flex items-center pt-1">
                            <label className="flex items-center cursor-pointer group">
                                <input
                                    type="checkbox" name="remember" checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-4 h-4 text-orange-500 bg-white border-gray-300 rounded focus:ring-orange-500 focus:ring-2 transition cursor-pointer shadow-sm"
                                />
                                <span className="ml-2 text-xs text-gray-600 font-bold group-hover:text-gray-900 transition">Ingat Sesi Saya</span>
                            </label>
                        </div>

                        <button
                            type="submit" disabled={processing}
                            className={`w-full mt-2 py-3 px-4 bg-gray-900 hover:bg-orange-500 text-white rounded-xl font-black text-sm shadow-xl shadow-gray-900/20 transition transform ${processing ? 'opacity-75 cursor-not-allowed scale-95' : 'hover:-translate-y-1 active:scale-95'}`}
                        >
                            {processing ? 'Memverifikasi...' : 'Masuk ke Portal'}
                        </button>
                    </form>

                    <div className="mt-6 text-xs text-gray-500 font-medium">
                        Belum punya akses? <Link href={route('register')} className="text-orange-500 font-black hover:underline">Daftar sekarang</Link>
                    </div>
                </div>

            </div>
        </div>
    );
}