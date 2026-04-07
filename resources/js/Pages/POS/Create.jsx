import { useState, useEffect, useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create({ auth, partner }) {
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const savedCart = localStorage.getItem('redvox_cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    const totalBelanja = useMemo(() => {
        return cart.reduce((sum, item) => sum + (item.buy_price * item.qty), 0);
    }, [cart]);

    const { data, setData, post, processing, errors } = useForm({
        supplier_name: '',
        location: 'Gudang Flint',
        notes: '',
        cash_deduction: 0,
        deposit_deduction: 0,
        cart: []
    });

    useEffect(() => {
        setData('cart', cart);
        setData(data => ({ ...data, cash_deduction: totalBelanja, deposit_deduction: 0 }));
    }, [cart, totalBelanja]);

    const handleCashChange = (val) => {
        let cleanVal = val.replace(/^0+(?=\d)/, ''); 
        const cash = parseInt(cleanVal) || 0;
        
        let deposit = totalBelanja - cash;
        if (deposit < 0) deposit = 0;
        
        setData(data => ({ ...data, cash_deduction: cash, deposit_deduction: deposit }));
    };

    const handleDepositChange = (val) => {
        let cleanVal = val.replace(/^0+(?=\d)/, '');
        const deposit = parseInt(cleanVal) || 0;
        
        let cash = totalBelanja - deposit;
        if (cash < 0) cash = 0;
        
        setData(data => ({ ...data, deposit_deduction: deposit, cash_deduction: cash }));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('pos.store'), {
            onSuccess: () => {
                localStorage.removeItem('redvox_cart'); 
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Mesin Kasir (POS) - Redvox Corp" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                
                {/* HEADER */}
                <div className="flex items-center justify-between mb-4 md:mb-6 border-b border-gray-200 pb-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900">Checkout Transaksi</h2>
                        <p className="text-sm text-gray-500 font-medium mt-1">Selesaikan pembayaran untuk memindahkan barang ke gudang.</p>
                    </div>
                    <Link href={route('kalkulator')} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2">
                        <span>⬅</span> <span className="hidden sm:inline">Kembali</span>
                    </Link>
                </div>

                {/* GRID LAYOUT: Flex Reverse for Mobile (Summary on top), Grid for Desktop */}
                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 md:gap-8">
                    
                    {/* =========================================
                        BAGIAN KIRI: FORM DATA (Di Bawah pada Mobile)
                    ========================================= */}
                    <div className="lg:col-span-7 xl:col-span-8 order-2 lg:order-1">
                        <div className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-gray-100">
                            <form onSubmit={submit} className="space-y-6 md:space-y-8">
                                
                                {errors.error && (
                                    <div className="bg-red-50 text-red-700 p-4 rounded-2xl font-bold border border-red-200 break-words text-sm md:text-base flex items-start gap-3">
                                        <span className="text-xl">⚠️</span> {errors.error}
                                    </div>
                                )}

                                {/* SEKSI 1: INFO SUPPLIER */}
                                <div>
                                    <h3 className="text-base md:text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="text-orange-500">👤</span> Informasi Supplier
                                    </h3>
                                    <div className="space-y-4 bg-gray-50/50 p-4 md:p-5 rounded-2xl border border-gray-100">
                                        <div>
                                            <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1.5">Nama Penjual (Warga/Player) *</label>
                                            <input 
                                                type="text" 
                                                placeholder="Contoh: Ujang_Knalpot" 
                                                // text-base pada mobile mencegah auto-zoom di iOS
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition shadow-sm text-base md:text-sm font-medium"
                                                value={data.supplier_name}
                                                onChange={e => setData('supplier_name', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1.5">Lokasi Transaksi</label>
                                            <input 
                                                type="text" 
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition shadow-sm text-base md:text-sm font-medium"
                                                value={data.location}
                                                onChange={e => setData('location', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SEKSI 2: PEMBAYARAN & DISTRIBUSI */}
                                <div>
                                    <h3 className="text-base md:text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="text-orange-500">💵</span> Pembayaran & Distribusi
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                                        <div className="bg-green-50 p-4 md:p-5 rounded-2xl border border-green-200 shadow-sm">
                                            <label className="block text-xs md:text-sm font-black text-green-800 mb-2">Bayar Cash ($)</label>
                                            <input 
                                                type="number" 
                                                min="0"
                                                className="w-full px-4 py-3 bg-white border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-black text-green-700 text-lg shadow-sm"
                                                value={data.cash_deduction === 0 ? '' : data.cash_deduction}
                                                onChange={e => handleCashChange(e.target.value)}
                                            />
                                        </div>
                                        <div className="bg-blue-50 p-4 md:p-5 rounded-2xl border border-blue-200 shadow-sm">
                                            <label className="block text-xs md:text-sm font-black text-blue-800 mb-2">Masuk Deposit ($)</label>
                                            <input 
                                                type="number" 
                                                min="0"
                                                className="w-full px-4 py-3 bg-white border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-black text-blue-700 text-lg shadow-sm"
                                                value={data.deposit_deduction === 0 ? '' : data.deposit_deduction}
                                                onChange={e => handleDepositChange(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    
                                    {errors.payment && <p className="text-red-500 text-sm font-bold mb-4 bg-red-50 p-3 rounded-lg border border-red-100">{errors.payment}</p>}
                                    
                                    {/* KARTU INFORMASI PENERIMA BARANG OTOMATIS */}
                                    <div className={`p-4 md:p-5 rounded-2xl border shadow-sm ${partner ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
                                        <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Tujuan Inventaris Otomatis</p>
                                        
                                        <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200/60">
                                            <span className="font-black text-gray-900 text-sm md:text-base flex items-center gap-2">
                                                <span>👤</span> Anda ({auth.user.name})
                                            </span>
                                            <span className="text-[10px] md:text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded font-black tracking-wide">Pembeli Utama</span>
                                        </div>

                                        {partner ? (
                                            <>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-black text-orange-700 text-sm md:text-base flex items-center gap-2">
                                                        <span>🤝</span> {partner.name}
                                                    </span>
                                                    <span className="text-[10px] md:text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded font-black tracking-wide">Partner JV</span>
                                                </div>
                                                <p className="text-xs text-orange-600 mt-4 font-medium leading-relaxed">
                                                    Sistem mendeteksi kontrak kerja sama. Saldo deposit dan barang (genap) akan dibagi otomatis 50:50. Barang ganjil diberikan kepada Anda.
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-xs text-gray-500 mt-2 font-medium leading-relaxed">
                                                Seluruh barang akan masuk ke "Kantong Mengambang" Anda dan saldo (jika ada deposit) akan dipotong sepenuhnya dari brankas Anda.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={processing || cart.length === 0}
                                    className={`w-full py-4 mt-4 bg-orange-500 hover:bg-orange-600 text-white font-black text-base md:text-lg rounded-2xl shadow-lg shadow-orange-500/20 transition transform hover:-translate-y-0.5 active:scale-95 flex justify-center items-center gap-2 ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {processing ? 'Memproses Transaksi...' : (
                                        <>
                                            Cetak Struk <span className="bg-orange-600 px-2 py-0.5 rounded-lg border border-orange-400 ml-2">${totalBelanja.toLocaleString()}</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* =========================================
                        BAGIAN KANAN: RINGKASAN KERANJANG (Di Atas pada Mobile)
                    ========================================= */}
                    <div className="lg:col-span-5 xl:col-span-4 order-1 lg:order-2">
                        <div className="bg-gray-900 rounded-3xl p-5 md:p-8 shadow-xl border border-gray-800 text-white lg:sticky lg:top-24">
                            <div className="flex items-center justify-between border-b border-gray-700 pb-4 mb-4">
                                <h3 className="text-lg md:text-xl font-black text-orange-500 flex items-center gap-2">
                                    <span>🧾</span> Ringkasan Nota
                                </h3>
                                <span className="bg-gray-800 text-gray-300 text-xs font-bold px-2 py-1 rounded-lg border border-gray-700">{cart.length} Jenis</span>
                            </div>
                            
                            <div className="space-y-3 max-h-[30vh] lg:max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {cart.length === 0 ? (
                                    <p className="text-gray-500 text-center py-6 text-sm font-medium border-2 border-dashed border-gray-700 rounded-xl">Keranjang kosong. Silakan kembali ke Kalkulator.</p>
                                ) : (
                                    cart.map(item => (
                                        <div key={item.id} className="flex justify-between items-center bg-gray-800 p-3 md:p-4 rounded-xl border border-gray-700">
                                            <div>
                                                <div className="font-bold text-sm md:text-base leading-tight mb-1">{item.name}</div>
                                                <div className="text-xs text-gray-400 font-medium">{item.qty} x ${item.buy_price.toLocaleString()}</div>
                                            </div>
                                            <div className="font-black text-green-400 text-sm md:text-base bg-green-500/10 px-2 py-1 rounded-lg">
                                                ${(item.qty * item.buy_price).toLocaleString()}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-6 pt-4 md:pt-6 border-t border-gray-700 flex justify-between items-center">
                                <span className="text-sm md:text-base font-bold text-gray-400 uppercase tracking-widest">Total Bayar</span>
                                <span className="text-2xl md:text-4xl font-black text-white">${totalBelanja.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}