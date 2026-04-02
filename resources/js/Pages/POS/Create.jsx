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
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-3xl font-black text-gray-900">Checkout Transaksi</h2>
                    <Link href={route('kalkulator')} className="text-orange-500 font-bold hover:underline">Kembali</Link>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    
                    {/* BAGIAN KIRI: FORM DATA */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <form onSubmit={submit} className="space-y-6">
                            
                            {errors.error && (
                                <div className="bg-red-50 text-red-700 p-4 rounded-xl font-bold border border-red-200 break-words">
                                    {errors.error}
                                </div>
                            )}

                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Informasi Supplier</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Nama Penjual (Warga/Player) *</label>
                                        <input 
                                            type="text" 
                                            placeholder="Contoh: Ujang_Knalpot" 
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition"
                                            value={data.supplier_name}
                                            onChange={e => setData('supplier_name', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Lokasi Transaksi</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition"
                                            value={data.location}
                                            onChange={e => setData('location', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Pembayaran & Distribusi Barang</h3>
                                
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                                        <label className="block text-sm font-bold text-green-800 mb-1">Bayar Cash ($)</label>
                                        <input 
                                            type="number" 
                                            min="0"
                                            className="w-full px-3 py-2 bg-white border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-black text-green-700"
                                            value={data.cash_deduction === 0 ? '' : data.cash_deduction}
                                            onChange={e => handleCashChange(e.target.value)}
                                        />
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                        <label className="block text-sm font-bold text-blue-800 mb-1">Masuk Deposit ($)</label>
                                        <input 
                                            type="number" 
                                            min="0"
                                            className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-black text-blue-700"
                                            value={data.deposit_deduction === 0 ? '' : data.deposit_deduction}
                                            onChange={e => handleDepositChange(e.target.value)}
                                        />
                                    </div>
                                </div>
                                {errors.payment && <p className="text-red-500 text-sm font-bold mb-4">{errors.payment}</p>}
                                
                                {/* KARTU INFORMASI PENERIMA BARANG OTOMATIS */}
                                <div className={`p-4 rounded-xl border ${partner ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tujuan Inventaris</p>
                                    
                                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200/60">
                                        <span className="font-bold text-gray-900 flex items-center gap-2">
                                            <span>👤</span> Anda ({auth.user.name})
                                        </span>
                                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded font-bold">Pembeli Utama</span>
                                    </div>

                                    {partner ? (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-orange-700 flex items-center gap-2">
                                                    <span>🤝</span> {partner.name}
                                                </span>
                                                <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded font-bold">Partner JV</span>
                                            </div>
                                            <p className="text-[11px] text-orange-600 mt-3 font-medium">
                                                Sistem mendeteksi kontrak kerja sama. Saldo deposit dan barang (genap) akan dibagi otomatis 50:50. Barang ganjil diberikan kepada Anda.
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-[11px] text-gray-500 mt-2 font-medium">
                                            Seluruh barang akan masuk ke "Kantong Mengambang" Anda dan saldo (jika ada deposit) akan dipotong sepenuhnya dari brankas Anda.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={processing || cart.length === 0}
                                className={`w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black text-lg rounded-xl shadow-lg transition transform hover:-translate-y-0.5 ${processing ? 'opacity-50' : ''}`}
                            >
                                {processing ? 'Memproses...' : `Cetak Struk ($${totalBelanja.toLocaleString()})`}
                            </button>
                        </form>
                    </div>

                    {/* BAGIAN KANAN: RINGKASAN KERANJANG */}
                    <div className="bg-gray-900 rounded-3xl p-8 shadow-xl border border-gray-800 text-white h-fit sticky top-24">
                        <h3 className="text-xl font-black border-b border-gray-700 pb-4 mb-4 text-orange-500">Ringkasan Nota</h3>
                        
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {cart.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">Keranjang kosong. Silakan kembali ke Kalkulator.</p>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className="flex justify-between items-center bg-gray-800 p-3 rounded-xl border border-gray-700">
                                        <div>
                                            <div className="font-bold">{item.name}</div>
                                            <div className="text-xs text-gray-400">{item.qty} x ${item.buy_price}</div>
                                        </div>
                                        <div className="font-black text-green-400">${(item.qty * item.buy_price).toLocaleString()}</div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-700 flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-300">TOTAL BELANJA</span>
                            <span className="text-3xl font-black text-white">${totalBelanja.toLocaleString()}</span>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}