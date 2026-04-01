import { Head, Link } from '@inertiajs/react';

export default function Receipt({ transaction }) {
    // Fungsi untuk memicu fitur Print/Save to PDF bawaan browser
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4 flex flex-col items-center selection:bg-orange-500 selection:text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <Head title={`Struk ${transaction.invoice_number}`} />

            {/* Tombol Aksi (Disembunyikan saat di-print) */}
            <div className="mb-6 flex gap-4 print:hidden">
                <Link 
                    href={route('kalkulator')} 
                    className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-50 transition"
                >
                    Kembali
                </Link>
                <button 
                    onClick={handlePrint}
                    className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition flex items-center gap-2"
                >
                    🖨️ Cetak / Screenshot
                </button>
            </div>

            {/* KERTAS STRUK THERMAL */}
            <div className="bg-white w-full max-w-sm p-8 shadow-2xl relative" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                
                {/* Efek gerigi kertas di bagian atas & bawah */}
                <div className="absolute top-0 left-0 w-full h-2 bg-repeat-x" style={{ backgroundImage: "radial-gradient(circle, transparent 50%, white 50%), radial-gradient(circle, transparent 50%, white 50%)", backgroundSize: "10px 10px, 10px 10px", backgroundPosition: "0 0, 5px 5px", transform: "translateY(-100%)" }}></div>
                
                {/* Header Perusahaan */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-black tracking-widest text-gray-900">REDVOX CORP</h1>
                    <p className="text-xs text-gray-500 mt-1">Los Santos Industrial Area</p>
                    <p className="text-xs text-gray-500">CEO: Fico Alneri</p>
                </div>

                <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

                {/* Info Transaksi */}
                <div className="text-xs text-gray-700 space-y-1 mb-4">
                    <div className="flex justify-between">
                        <span>No. Nota:</span>
                        <span className="font-bold">{transaction.invoice_number}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Tanggal:</span>
                        <span>{new Date(transaction.created_at).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Kasir:</span>
                        <span>{transaction.cashier.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Supplier:</span>
                        <span className="font-bold">{transaction.supplier_name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Lokasi:</span>
                        <span>{transaction.location || 'HQ Redvox'}</span>
                    </div>
                </div>

                <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

                {/* Rincian Barang */}
                <div className="mb-4">
                    <div className="text-xs font-bold mb-2 flex justify-between text-gray-800">
                        <span className="w-1/2">Item</span>
                        <span className="w-1/4 text-center">Qty</span>
                        <span className="w-1/4 text-right">Subtotal</span>
                    </div>
                    {transaction.items.map((tItem) => (
                        <div key={tItem.id} className="text-xs text-gray-700 flex justify-between mb-1.5">
                            <span className="w-1/2 truncate pr-2">{tItem.item.name}</span>
                            <span className="w-1/4 text-center">{tItem.quantity}</span>
                            <span className="w-1/4 text-right">${tItem.subtotal_price.toLocaleString()}</span>
                        </div>
                    ))}
                </div>

                <div className="border-t-2 border-black my-4"></div>

                {/* Total & Split Payment */}
                <div className="space-y-1.5">
                    <div className="flex justify-between text-sm font-black text-gray-900">
                        <span>TOTAL BELANJA</span>
                        <span>${transaction.total_amount.toLocaleString()}</span>
                    </div>
                    
                    <div className="border-t border-gray-200 my-2"></div>

                    <div className="flex justify-between text-xs text-gray-700">
                        <span>DIBAYAR CASH</span>
                        <span>${transaction.cash_deduction.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-700">
                        <span>MASUK DEPOSIT</span>
                        <span>${transaction.deposit_deduction.toLocaleString()}</span>
                    </div>
                </div>

                <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

                {/* Footer Pesan */}
                <div className="text-center text-xs text-gray-500 mt-6 space-y-1">
                    <p className="font-bold text-gray-800">Terima kasih atas kerja samanya!</p>
                    <p>Barang yang sudah disetor tidak dapat diminta kembali.</p>
                </div>

            </div>

            {/* Style khusus untuk saat dicetak/print */}
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    body { background: white; }
                    .print\\:hidden { display: none !important; }
                    .bg-white { box-shadow: none !important; }
                }
            `}} />
        </div>
    );
}