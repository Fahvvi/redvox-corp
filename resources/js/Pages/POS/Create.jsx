import { useState, useEffect, useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create({ auth, investors }) {
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
        investor_id: '', 
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

    // ==========================================
    // LOGIKA DETEKSI PARTNER JV
    // ==========================================
    const selectedInvestor = investors?.find(inv => inv.id === parseInt(data.investor_id));
    const partner = selectedInvestor?.partner_id ? investors.find(inv => inv.id === selectedInvestor.partner_id) : null;

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
                                <div className="bg-red-50 text-red-700 p-4 rounded-xl font-bold border border-red-200">
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
                                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Metode Pembayaran & Distribusi</h3>
                                
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
                                
                                <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                                    <label className="block text-sm font-bold text-orange-800 mb-1">Akun Penerima Barang (Wajib) *</label>
                                    <select 
                                        className="w-full px-3 py-2 bg-white border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-gray-800 font-medium"
                                        value={data.investor_id}
                                        onChange={e => setData('investor_id', e.target.value)}
                                        required
                                    >
                                        <option value="">-- Pilih Akun Penerima / Investor --</option>
                                        {investors && investors.map(inv => (
                                            <option key={inv.id} value={inv.id}>{inv.name} ({inv.email})</option>
                                        ))}
                                    </select>
                                    {errors.investor_id && <p className="text-red-500 text-sm font-bold mt-2">{errors.investor_id}</p>}
                                    
                                    {/* PANEL INFORMASI JOINT VENTURE */}
                                    {partner ? (
                                        <div className="mt-4 bg-blue-100/50 p-3 rounded-lg border border-blue-200">
                                            <p className="text-sm font-bold text-blue-800 flex items-center gap-1">
                                                <span>🤝</span> Kontrak Joint Venture Aktif!
                                            </p>
                                            <p className="text-xs text-blue-700 mt-1 font-medium">
                                                Barang genap akan dibagi rata dengan <span className="font-black">{partner.name}</span>.
                                            </p>
                                            
                                            {/* Estimasi Potongan 50:50 */}
                                            {data.deposit_deduction > 0 && (
                                                <div className="mt-2 pt-2 border-t border-blue-200/50 space-y-1">
                                                    <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Estimasi Potong Brankas:</p>
                                                    <div className="flex justify-between text-xs text-blue-700">
                                                        <span>{selectedInvestor.name}</span>
                                                        <span className="font-bold">-${(data.deposit_deduction / 2).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-blue-700">
                                                        <span>{partner.name}</span>
                                                        <span className="font-bold">-${(data.deposit_deduction / 2).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-orange-600 mt-2 font-medium">Barang akan masuk ke inventaris akun ini. Jika ada Deposit, akan masuk ke brankasnya.</p>
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