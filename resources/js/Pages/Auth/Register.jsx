import { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    // Tambahkan state untuk mendeteksi apakah form sudah berhasil disubmit
    const [isSubmitted, setIsSubmitted] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => reset('password', 'password_confirmation');
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            // Jika backend merespon sukses, ubah tampilan ke layar notifikasi
            onSuccess: () => setIsSubmitted(true),
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 selection:bg-orange-500 selection:text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <Head title="Pendaftaran Karyawan - Redfox Corp" />

            {/* KARTU UTAMA */}
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row md:h-[550px]">
                
                {/* =========================================
                    KIRI: VISUAL BANNER
                ========================================= */}
                <div className="hidden md:flex md:w-1/2 relative bg-gray-900 flex-col justify-between p-10">
                    <div 
                        className="absolute inset-0 bg-cover bg-center opacity-40"
                        style={{ backgroundImage: "url('/images/dillimore.jpg')" }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-bl from-gray-900/90 to-orange-900/60"></div>

                    <div className="relative z-10">
                        <Link href="/" className="flex items-center gap-3 w-fit hover:opacity-80 transition">
                            <div className="w-10 h-10 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <span className="text-xl">📦</span>
                            </div>
                            <span className="text-2xl font-black tracking-wider text-white">REDFOX<span className="text-orange-500">.</span></span>
                        </Link>
                    </div>

                    <div className="relative z-10">
                        <h1 className="text-3xl font-black text-white leading-tight mb-4">
                            Registrasi <br/> Akses Sistem.
                        </h1>
                        <p className="text-gray-300 text-sm font-medium leading-relaxed max-w-sm">
                            Daftarkan identitas Anda untuk mendapatkan hak akses ke dalam platform operasional internal Redfox.
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
                    KANAN: FORM REGISTER / NOTIFIKASI
                ========================================= */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white overflow-y-auto custom-scrollbar relative">
                    
                    {/* Render Form ATAU Render Notifikasi Sukses */}
                    {isSubmitted ? (
                        // LAYAR NOTIFIKASI TUNGGU ACC ADMIN
                        <div className="text-center py-10 animate-fade-in-up">
                            <div className="w-20 h-20 bg-orange-50 border border-orange-100 text-orange-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
                                ⏳
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-3">Pendaftaran Diterima!</h2>
                            <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed px-4">
                                Data identitas Anda telah masuk ke dalam sistem Redfox Corp. <br/><br/>
                                Saat ini akun Anda berstatus <b className="text-orange-600 bg-orange-50 px-2 py-1 rounded">Menunggu Persetujuan Admin</b>. Anda baru dapat mengakses portal setelah pendaftaran ini divalidasi.
                            </p>
                            <Link href="/" className="inline-flex justify-center items-center px-6 py-3 bg-gray-900 hover:bg-orange-500 text-white rounded-xl font-bold text-sm shadow-md transition-all">
                                Kembali ke Halaman Utama
                            </Link>
                        </div>
                    ) : (
                        // LAYAR FORM REGISTER NORMAL
                        <>
                            <div className="md:hidden mb-6">
                                <Link href="/" className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-sm border border-orange-200">📦</div>
                                    <span className="text-xl font-black tracking-wider text-gray-900">REDFOX<span className="text-orange-500">.</span></span>
                                </Link>
                            </div>

                            <div>
                                <h2 className="text-2xl font-black text-gray-900 mb-1">Pendaftaran VIP</h2>
                                <p className="text-gray-500 text-sm font-medium mb-6">Lengkapi formulir di bawah untuk membuat ID Anda.</p>
                            </div>

                            <form onSubmit={submit} className="space-y-4">
                                {/* Input Nama */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1" htmlFor="name">Nama Panggilan (In-Game)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                        </div>
                                        <input
                                            id="name" type="text" name="name" value={data.name}
                                            className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition text-gray-800 text-sm font-medium placeholder-gray-400"
                                            placeholder="Contoh: Rico" autoComplete="name" autoFocus required
                                            onChange={(e) => setData('name', e.target.value)}
                                        />
                                    </div>
                                    {errors.name && <p className="text-xs text-red-500 font-bold mt-1">{errors.name}</p>}
                                </div>

                                {/* Input Email */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1" htmlFor="email">Email Valid</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                        </div>
                                        <input
                                            id="email" type="email" name="email" value={data.email}
                                            className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition text-gray-800 text-sm font-medium placeholder-gray-400"
                                            placeholder="nama@redfoxcorp.com" autoComplete="username" required
                                            onChange={(e) => setData('email', e.target.value)}
                                        />
                                    </div>
                                    {errors.email && <p className="text-xs text-red-500 font-bold mt-1">{errors.email}</p>}
                                </div>

                                {/* Input Passwords (Grid) */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-700 mb-1" htmlFor="password">Sandi Baru</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                            </div>
                                            <input
                                                id="password" type="password" name="password" value={data.password}
                                                className="w-full pl-8 pr-2 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition text-gray-800 text-sm font-bold tracking-widest placeholder-gray-400"
                                                placeholder="••••••••" autoComplete="new-password" required
                                                onChange={(e) => setData('password', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-700 mb-1" htmlFor="password_confirmation">Ulangi Sandi</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                            </div>
                                            <input
                                                id="password_confirmation" type="password" name="password_confirmation" value={data.password_confirmation}
                                                className="w-full pl-8 pr-2 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition text-gray-800 text-sm font-bold tracking-widest placeholder-gray-400"
                                                placeholder="••••••••" autoComplete="new-password" required
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {errors.password && <p className="text-xs text-red-500 font-bold mt-1">{errors.password}</p>}
                                {errors.password_confirmation && <p className="text-xs text-red-500 font-bold mt-1">{errors.password_confirmation}</p>}

                                {/* Tombol Submit */}
                                <button
                                    type="submit" disabled={processing}
                                    className={`w-full mt-2 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm shadow-md transition-all ${processing ? 'opacity-75 cursor-not-allowed' : ''}`}
                                >
                                    {processing ? 'Memproses Data...' : 'Mendaftar Sistem'}
                                </button>
                            </form>

                            <div className="mt-6 text-center pt-6 border-t border-gray-100">
                                <p className="text-[11px] text-gray-400 font-medium mb-2">
                                    © {new Date().getFullYear()} Redfox Corp System.
                                </p>
                                <p className="text-xs text-gray-600 font-medium">
                                    Sudah memiliki akses VIP? <Link href={route('login')} className="text-orange-600 font-bold hover:underline">Login sekarang</Link>
                                </p>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
}