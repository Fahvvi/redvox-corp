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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 flex flex-col justify-center items-center p-6 selection:bg-orange-500 selection:text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <Head title="Login - Redvox Corp" />

            {/* Logo */}
            <Link href="/" className="mb-8 text-3xl font-black tracking-wider text-orange-500 hover:scale-105 transition transform duration-300">
                REDVOX<span className="text-gray-900">CORP.</span>
            </Link>

            {/* Card Form */}
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-orange-100 p-8 sm:p-10">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Selamat Datang Kembali</h2>
                    <p className="text-gray-500 text-sm mt-1">Masuk ke portal manajerial Redvox.</p>
                </div>

                {status && <div className="mb-4 font-medium text-sm text-green-600 bg-green-50 p-3 rounded-lg">{status}</div>}

                <form onSubmit={submit} className="space-y-5">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="email">Email Akses</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition text-gray-800 font-medium"
                            autoComplete="username"
                            autoFocus
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-semibold text-gray-700" htmlFor="password">Kata Sandi</label>
                            {canResetPassword && (
                                <Link href={route('password.request')} className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition">
                                    Lupa Sandi?
                                </Link>
                            )}
                        </div>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition text-gray-800 font-medium"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="w-5 h-5 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 transition cursor-pointer"
                            />
                            <span className="ml-2 text-sm text-gray-600 font-medium">Ingat Sesi Saya</span>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={processing}
                        className={`w-full mt-2 py-3.5 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 transition transform ${processing ? 'opacity-75 cursor-not-allowed scale-95' : 'hover:-translate-y-0.5 active:scale-95'}`}
                    >
                        {processing ? 'Memverifikasi...' : 'Masuk ke Portal'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500 font-medium">
                    Belum punya akses VIP? <Link href={route('register')} className="text-orange-500 font-bold hover:underline">Daftar sekarang</Link>
                </div>
            </div>
        </div>
    );
}