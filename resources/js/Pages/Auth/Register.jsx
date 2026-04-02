import { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const [mounted, setMounted] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        setMounted(true); // Memicu animasi masuk
        return () => reset('password', 'password_confirmation');
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <div className="min-h-screen bg-gray-950 relative flex items-center justify-center p-4 sm:p-6 selection:bg-orange-500 selection:text-white overflow-hidden" style={{ fontFamily: "'Poppins', sans-serif" }}>
            
            {/* AMBIENT GLOW & GRID BACKGROUND */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

            <Head title="Login Karyawan - Redvox Corp" /> />

            {/* KARTU UTAMA */}
            <div className="relative w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden flex bg-gray-900 min-h-[550px] md:h-[550px]">
                
                {/* BACKGROUND FOTO DENGAN EFEK SLOW ZOOM */}
                <div 
                    className={`absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-out ${mounted ? 'scale-110' : 'scale-100'}`}
                    style={{ backgroundImage: "url('/images/dillimore.jpg')" }}
                >
                    {/* Gradient gelap di KANAN agar form lebih terbaca */}
                    <div className="absolute inset-0 bg-gradient-to-l from-gray-900/90 via-gray-900/40 to-transparent"></div>
                </div>

                {/* PANEL FORM REGISTER (KANAN) */}
                <div 
                    className={`relative z-10 w-full md:absolute md:w-[420px] md:top-6 md:bottom-6 md:right-6 bg-white/95 backdrop-blur-md md:rounded-3xl p-8 flex flex-col justify-center border-y md:border border-white/50 shadow-2xl transition-all duration-700 ease-out transform
                    ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`}
                >
                    <div className="md:text-right mb-4">
                        <Link href="/" className="inline-block text-2xl font-black tracking-wider text-orange-500 hover:scale-105 transition transform duration-300 w-fit">
                            REDVOX<span className="text-gray-900">.</span>
                        </Link>
                    </div>

                    <div className="mb-6 md:text-right">
                        <h2 className="text-xl font-black text-gray-900">Pendaftaran ID</h2>
                        <p className="text-gray-500 text-xs mt-1 font-medium">Lengkapi data untuk masuk ke sistem.</p>
                    </div>

                    <form onSubmit={submit} className="space-y-3">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1" htmlFor="name">Nama Panggilan</label>
                            <input
                                id="name" name="name" value={data.name}
                                className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition text-gray-800 font-bold shadow-sm text-sm"
                                autoComplete="name" autoFocus required
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            {errors.name && <p className="text-xs text-red-500 font-bold mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1" htmlFor="email">Email Valid</label>
                            <input
                                id="email" type="email" name="email" value={data.email}
                                className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition text-gray-800 font-bold shadow-sm text-sm"
                                autoComplete="username" required
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            {errors.email && <p className="text-xs text-red-500 font-bold mt-1">{errors.email}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1" htmlFor="password">Sandi Baru</label>
                                <input
                                    id="password" type="password" name="password" value={data.password}
                                    className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition text-gray-800 font-bold shadow-sm text-sm"
                                    autoComplete="new-password" required
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1" htmlFor="password_confirmation">Ulangi Sandi</label>
                                <input
                                    id="password_confirmation" type="password" name="password_confirmation" value={data.password_confirmation}
                                    className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition text-gray-800 font-bold shadow-sm text-sm"
                                    autoComplete="new-password" required
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                />
                            </div>
                        </div>
                        {errors.password && <p className="text-xs text-red-500 font-bold mt-1">{errors.password}</p>}

                        <button
                            type="submit" disabled={processing}
                            className={`w-full mt-4 py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-sm shadow-xl shadow-orange-500/20 transition transform ${processing ? 'opacity-75 cursor-not-allowed scale-95' : 'hover:-translate-y-1 active:scale-95'}`}
                        >
                            {processing ? 'Memproses...' : 'Buat ID Akses'}
                        </button>
                    </form>

                    <div className="mt-4 text-xs text-gray-500 font-medium md:text-right">
                        Sudah terdaftar? <Link href={route('login')} className="text-gray-900 font-black hover:underline">Login sekarang</Link>
                    </div>
                </div>

            </div>
        </div>
    );
}