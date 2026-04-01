import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
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
        post(route('register'));
    };

    return (
        <div className="min-h-screen bg-gradient-to-bl from-orange-50 to-gray-50 flex flex-col justify-center items-center p-6 selection:bg-orange-500 selection:text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <Head title="Daftar VIP - Redvox Corp" />

            {/* Logo */}
            <Link href="/" className="mb-6 text-3xl font-black tracking-wider text-orange-500 hover:scale-105 transition transform duration-300">
                REDVOX<span className="text-gray-900">CORP.</span>
            </Link>

            {/* Card Form */}
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-orange-100 p-8 sm:p-10">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Registrasi Karyawan / VIP</h2>
                    <p className="text-gray-500 text-sm mt-1">Dapatkan akses eksklusif Redvox.</p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="name">Nama Lengkap (IC)</label>
                        <input
                            id="name"
                            name="name"
                            value={data.name}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition text-gray-800 font-medium"
                            autoComplete="name"
                            isFocused={true}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                    </div>

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
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="password">Kata Sandi</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition text-gray-800 font-medium"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="password_confirmation">Konfirmasi Sandi</label>
                        <input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition text-gray-800 font-medium"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                        />
                        {errors.password_confirmation && <p className="text-sm text-red-500 mt-1">{errors.password_confirmation}</p>}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={processing}
                        className={`w-full mt-4 py-3.5 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 transition transform ${processing ? 'opacity-75 cursor-not-allowed scale-95' : 'hover:-translate-y-0.5 active:scale-95'}`}
                    >
                        {processing ? 'Mendaftarkan...' : 'Buat Akun VIP'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500 font-medium">
                    Sudah punya akses? <Link href={route('login')} className="text-orange-500 font-bold hover:underline">Masuk di sini</Link>
                </div>
            </div>
        </div>
    );
}