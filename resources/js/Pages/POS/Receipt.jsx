import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Receipt({ transaction }) {
    const [copied, setCopied] = useState(false);

    // Fungsi untuk memicu fitur Print/Save to PDF bawaan browser
    const handlePrint = () => {
        window.print();
    };

    // Fungsi untuk Copy Link In-Game
    const handleCopyLink = () => {
        const pmText = `[Redfox Corp] Struk Transaksi #${transaction.invoice_number} dapat dilihat di sini: ${window.location.href}`;
        
        navigator.clipboard.writeText(pmText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 3000); 
        }).catch(err => {
            console.error('Gagal menyalin teks: ', err);
            alert('Browser tidak mengizinkan copy otomatis. Silakan copy URL secara manual.');
        });
    };

    const actionType = transaction.action_type || 'beli';
    const transType = transaction.transaction_type || 'standar';
    const adjustment = parseFloat(transaction.dynamic_adjustment) || 0;

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4 flex flex-col items-center selection:bg-orange-500 selection:text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <Head title={`Struk ${transaction.invoice_number}`} />

            {/* Tombol Aksi (Disembunyikan saat di-print) */}
            <div className="mb-6 flex flex-wrap justify-center gap-3 print:hidden">
                {/* UBAHAN: Tombol Kembali diarahkan ke Halaman Utama (Landing Page) */}
                <Link 
                    href="/" 
                    className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-50 transition"
                >
                    🏠 Halaman Utama
                </Link>
                
                <button 
                    onClick={handleCopyLink}
                    className={`px-5 py-2.5 font-bold rounded-xl shadow-sm transition flex items-center gap-2 ${copied ? 'bg-green-500 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}
                >
                    {copied ? '✅ Teks PM Tersalin!' : '🔗 Salin Link PM'}
                </button>

                <button 
                    onClick={handlePrint}
                    className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition flex items-center gap-2"
                >
                    🖨️ Cetak / PDF
                </button>
            </div>

            {/* KERTAS STRUK THERMAL */}
            <div className="bg-white w-full max-w-sm p-8 shadow-2xl relative" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                
                {/* Efek gerigi kertas di bagian atas */}
                <div className="absolute top-0 left-0 w-full h-2 bg-repeat-x" style={{ backgroundImage: "radial-gradient(circle, transparent 50%, white 50%), radial-gradient(circle, transparent 50%, white 50%)", backgroundSize: "10px 10px, 10px 10px", backgroundPosition: "0 0, 5px 5px", transform: "translateY(-100%)" }}></div>
                
                {/* Header Perusahaan */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-black tracking-widest text-gray-900">REDFOX CORP</h1>
                    <p className="text-xs text-gray-500 mt-1">Los Santos Industrial Area</p>
                    <p className="text-xs text-gray-500">Divisi Logistik & Suplai</p>
                </div>

                <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

                {/* Info Transaksi */}
                <div className="text-xs text-gray-700 space-y-1.5 mb-4">
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
                    <div className="flex justify-between items-start">
                        <span>Klien:</span>
                        <span className="font-bold text-right max-w-[150px] break-words">{transaction.supplier_name}</span>
                    </div>
                    <div className="flex justify-between items-start">
                        <span>Tipe:</span>
                        <span className="text-right">
                            {actionType === 'jual' ? 'PENGELUARAN' : 'SETORAN'} 
                            {transType === 'korporat' && ' (KORPORAT)'}
                        </span>
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
                    
                    {/* Tampilkan Adjustment jika menggunakan tipe dinamis */}
                    {transType === 'dinamis' && adjustment !== 0 && (
                        <div className="text-xs text-gray-700 flex justify-between mt-3 font-bold">
                            <span className="w-3/4">Penyelesaian Khusus</span>
                            <span className="w-1/4 text-right">
                                {adjustment > 0 ? '+' : ''}${adjustment.toLocaleString()}
                            </span>
                        </div>
                    )}
                </div>

                <div className="border-t-2 border-black my-4"></div>

                {/* Total & Split Payment */}
                <div className="space-y-1.5">
                    <div className="flex justify-between text-sm font-black text-gray-900">
                        <span>TOTAL {actionType === 'jual' ? 'TAGIHAN' : 'TRANSAKSI'}</span>
                        <span>${transaction.total_amount.toLocaleString()}</span>
                    </div>
                    
                    <div className="border-t border-gray-200 my-2"></div>

                    <div className="flex justify-between text-xs text-gray-700">
                        <span>CASH (TUNAI)</span>
                        <span>${transaction.cash_deduction.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-700">
                        <span>SALDO DEPOSIT</span>
                        <span>${transaction.deposit_deduction.toLocaleString()}</span>
                    </div>
                </div>

                <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

                {/* Footer Pesan */}
                <div className="text-center text-xs text-gray-500 mt-6 space-y-1">
                    <p className="font-bold text-gray-800">
                        {actionType === 'jual' ? 'Terima kasih atas pembelian Anda!' : 'Terima kasih atas kerja samanya!'}
                    </p>
                    <p>Barang yang sudah diproses tidak dapat dikembalikan.</p>
                </div>

                {/* Efek gerigi kertas di bagian bawah */}
                <div className="absolute bottom-0 left-0 w-full h-2 bg-repeat-x" style={{ backgroundImage: "radial-gradient(circle, transparent 50%, white 50%), radial-gradient(circle, transparent 50%, white 50%)", backgroundSize: "10px 10px, 10px 10px", backgroundPosition: "0 0, 5px 5px", transform: "translateY(100%)" }}></div>
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