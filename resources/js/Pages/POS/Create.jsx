import { useState, useEffect, useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create({ auth, partner }) {
    const [cart, setCart] = useState([]);
    
    // STATE BARU: Tipe Aksi & Tipe Jalur Harga
    const [actionType, setActionType] = useState('beli'); // 'beli' (Redfox beli) atau 'jual' (Redfox jual)
    const [transactionType, setTransactionType] = useState('standar'); // 'standar', 'korporat', 'dinamis'
    const [dynamicAdjustment, setDynamicAdjustment] = useState('');

    useEffect(() => {
        const savedCart = localStorage.getItem('redvox_cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    // FUNGSI PINTAR: Menentukan harga per item berdasarkan opsi Kasir
    const getItemPrice = (item) => {
        // Jika Redfox 'Jual', gunakan sell_price (Jika 'LOCKED' otomatis jadi 0)
        // Jika Redfox 'Beli', gunakan buy_price
        let basePrice = actionType === 'jual' ? (parseInt(item.sell_price) || 0) : item.buy_price;
        
        // Markup 33% untuk Jalur Korporat (Eks-Mafia)
        if (transactionType === 'korporat') {
            basePrice = basePrice * 1.33;
        }
        
        return basePrice;
    };

    // LOGIKA TOTAL KALKULATOR KASIR
    const totalBelanja = useMemo(() => {
        let subtotal = cart.reduce((sum, item) => sum + (getItemPrice(item) * item.qty), 0);
        
        // Tambahan Harga Manual untuk Jalur Dinamis (Khusus)
        if (transactionType === 'dinamis') {
            const extra = parseFloat(dynamicAdjustment) || 0;
            subtotal += extra;
        }

        // Cegah minus
        return subtotal > 0 ? subtotal : 0;
    }, [cart, actionType, transactionType, dynamicAdjustment]);

    const { data, setData, post, processing, errors } = useForm({
        supplier_name: '',
        location: 'Gudang Flint',
        notes: '',
        cash_deduction: 0,
        deposit_deduction: 0,
        cart: [],
        // Data ekstra jika backend nanti butuh riwayat jenis transaksinya
        action_type: 'beli',
        transaction_type: 'standar',
        dynamic_adjustment: 0
    });

    useEffect(() => {
        setData(currentData => ({ 
            ...currentData,
            cart: cart,
            action_type: actionType,
            transaction_type: transactionType,
            dynamic_adjustment: parseFloat(dynamicAdjustment) || 0,
            cash_deduction: totalBelanja, 
            deposit_deduction: 0 
        }));
    }, [cart, totalBelanja, actionType, transactionType, dynamicAdjustment]);

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
            <Head title="Mesin Kasir (POS) - Redfox Corp" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-8">
                
                {/* HEADER */}
                <div className="flex items-center justify-between mb-4 md:mb-6 border-b border-gray-200 pb-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900">Terminal Kasir</h2>
                        <p className="text-sm text-gray-500 font-medium mt-1">Atur alur logistik masuk dan keluar gudang Redfox.</p>
                    </div>
                    <Link href={route('kalkulator')} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2">
                        <span>⬅</span> <span className="hidden sm:inline">Pilih Barang</span>
                    </Link>
                </div>

                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 md:gap-8">
                    
                    {/* BAGIAN KIRI: FORM DATA */}
                    <div className="lg:col-span-7 xl:col-span-8 order-2 lg:order-1">
                        <div className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-gray-100">
                            <form onSubmit={submit} className="space-y-6 md:space-y-8">
                                
                                {errors.error && (
                                    <div className="bg-red-50 text-red-700 p-4 rounded-2xl font-bold border border-red-200 break-words text-sm md:text-base flex items-start gap-3">
                                        <span className="text-xl">⚠️</span> {errors.error}
                                    </div>
                                )}

                                {/* SEKSI 1: PENGATURAN TRANSAKSI (NEW) */}
                                <div>
                                    <h3 className="text-base md:text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="text-orange-500">⚙️</span> Parameter Logistik
                                    </h3>
                                    
                                    <div className="space-y-4 bg-gray-50/80 p-4 md:p-5 rounded-2xl border border-gray-100">
                                        
                                        {/* Aksi Kasir */}
                                        <div>
                                            <label className="block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Aksi Perusahaan</label>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <button type="button" onClick={() => setActionType('beli')} className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition ${actionType === 'beli' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}>
                                                    📥 Redfox Membeli (Setor)
                                                </button>
                                                <button type="button" onClick={() => setActionType('jual')} className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition ${actionType === 'jual' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}>
                                                    📤 Redfox Menjual (Keluar)
                                                </button>
                                            </div>
                                        </div>

                                        <div className="h-px w-full bg-gray-200/60 my-2"></div>

                                        {/* Jalur Harga */}
                                        <div>
                                            <label className="block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Jalur Kemitraan (Harga)</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                <button type="button" onClick={() => setTransactionType('standar')} className={`py-3 rounded-xl font-bold text-xs md:text-sm border-2 transition shadow-sm ${transactionType === 'standar' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}>
                                                    👤 Standar Umum
                                                </button>
                                                <button type="button" onClick={() => setTransactionType('korporat')} className={`py-3 rounded-xl font-bold text-xs md:text-sm border-2 transition shadow-sm ${transactionType === 'korporat' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}>
                                                    🤝 Korporat (+33%)
                                                </button>
                                                <button type="button" onClick={() => setTransactionType('dinamis')} className={`py-3 rounded-xl font-bold text-xs md:text-sm border-2 transition shadow-sm ${transactionType === 'dinamis' ? 'bg-gray-800 border-gray-900 text-white' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}>
                                                    ⚙️ Khusus Dinamis
                                                </button>
                                            </div>
                                        </div>

                                        {/* Input Dinamis */}
                                        {transactionType === 'dinamis' && (
                                            <div className="mt-4 animate-fade-in">
                                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Penyesuaian Manual Harga ($) <span className="text-gray-400 font-medium">- Gunakan (-) untuk Diskon</span></label>
                                                <input 
                                                    type="number" 
                                                    placeholder="Contoh: 500 atau -200" 
                                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none transition shadow-sm text-sm font-bold"
                                                    value={dynamicAdjustment}
                                                    onChange={e => setDynamicAdjustment(e.target.value)}
                                                />
                                            </div>
                                        )}

                                    </div>
                                </div>

                                {/* SEKSI 2: INFO SUPPLIER/PELANGGAN */}
                                <div>
                                    <h3 className="text-base md:text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="text-orange-500">📝</span> Identitas {actionType === 'beli' ? 'Penjual' : 'Pembeli'}
                                    </h3>
                                    <div className="space-y-4 bg-gray-50/50 p-4 md:p-5 rounded-2xl border border-gray-100">
                                        <div>
                                            <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1.5">Nama Warga / Player *</label>
                                            <input 
                                                type="text" 
                                                placeholder="Contoh: Ujang_Knalpot" 
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

                                {/* SEKSI 3: PEMBAYARAN & DISTRIBUSI */}
                                <div>
                                    <h3 className="text-base md:text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="text-orange-500">💵</span> Kas & Brankas
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                                        <div className="bg-green-50 p-4 md:p-5 rounded-2xl border border-green-200 shadow-sm">
                                            <label className="block text-xs md:text-sm font-black text-green-800 mb-2">Transaksi Cash ($)</label>
                                            <input 
                                                type="number" 
                                                min="0"
                                                className="w-full px-4 py-3 bg-white border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-black text-green-700 text-lg shadow-sm"
                                                value={data.cash_deduction === 0 ? '' : data.cash_deduction}
                                                onChange={e => handleCashChange(e.target.value)}
                                            />
                                        </div>
                                        <div className="bg-blue-50 p-4 md:p-5 rounded-2xl border border-blue-200 shadow-sm">
                                            <label className="block text-xs md:text-sm font-black text-blue-800 mb-2">Potong/Masuk Deposit ($)</label>
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
                                            <span className="text-[10px] md:text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded font-black tracking-wide">Kasir Utama</span>
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
                                                    Sistem mendeteksi kontrak kerja sama. Saldo deposit dan barang (genap) akan dibagi otomatis 50:50.
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-xs text-gray-500 mt-2 font-medium leading-relaxed">
                                                Seluruh pergerakan barang dan saldo akan dicatat di bawah kewenangan Anda sepenuhnya.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={processing || cart.length === 0}
                                    className={`w-full py-4 mt-4 bg-gray-900 hover:bg-orange-500 text-white font-black text-base md:text-lg rounded-2xl shadow-xl transition transform hover:-translate-y-0.5 active:scale-95 flex justify-center items-center gap-2 ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {processing ? 'Memproses Transaksi...' : (
                                        <>
                                            Cetak Struk Transaksi <span className="bg-gray-800 px-2 py-0.5 rounded-lg border border-gray-700 ml-2">${totalBelanja.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* BAGIAN KANAN: RINGKASAN KERANJANG */}
                    <div className="lg:col-span-5 xl:col-span-4 order-1 lg:order-2">
                        <div className="bg-gray-900 rounded-3xl p-5 md:p-8 shadow-2xl border border-gray-800 text-white lg:sticky lg:top-24">
                            <div className="flex items-center justify-between border-b border-gray-700 pb-4 mb-4">
                                <h3 className="text-lg md:text-xl font-black text-orange-500 flex items-center gap-2">
                                    <span>🧾</span> Ringkasan Nota
                                </h3>
                                <span className="bg-gray-800 text-gray-300 text-xs font-bold px-2 py-1 rounded-lg border border-gray-700">{cart.length} Jenis</span>
                            </div>
                            
                            <div className="space-y-3 max-h-[30vh] lg:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {cart.length === 0 ? (
                                    <p className="text-gray-500 text-center py-6 text-sm font-medium border-2 border-dashed border-gray-700 rounded-xl">Keranjang kosong. Silakan kembali ke Kalkulator.</p>
                                ) : (
                                    cart.map(item => {
                                        const price = getItemPrice(item);
                                        const itemTotal = price * item.qty;

                                        return (
                                            <div key={item.id} className="flex justify-between items-center bg-gray-800 p-3 md:p-4 rounded-xl border border-gray-700">
                                                <div>
                                                    <div className="font-bold text-sm md:text-base leading-tight mb-1">
                                                        {item.name} {transactionType === 'korporat' && <span className="text-purple-400 text-[10px]"> (+33%)</span>}
                                                    </div>
                                                    <div className="text-xs text-gray-400 font-medium">
                                                        {item.qty} x ${price.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                                    </div>
                                                </div>
                                                <div className="font-black text-green-400 text-sm md:text-base bg-green-500/10 px-2 py-1 rounded-lg">
                                                    ${itemTotal.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>

                            <div className="mt-6 pt-4 md:pt-6 border-t border-gray-700 flex flex-col gap-2">
                                {transactionType === 'dinamis' && dynamicAdjustment && (
                                    <div className="flex justify-between items-center text-sm font-bold text-gray-400">
                                        <span>Penyesuaian Manual</span>
                                        <span>{parseFloat(dynamicAdjustment) > 0 ? '+' : ''}${parseFloat(dynamicAdjustment).toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="text-sm md:text-base font-bold text-gray-400 uppercase tracking-widest">Total Tagihan</span>
                                    <span className="text-2xl md:text-4xl font-black text-white">
                                        ${totalBelanja.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}