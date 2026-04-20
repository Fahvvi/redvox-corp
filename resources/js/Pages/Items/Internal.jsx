import { Head, Link } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Internal({ auth, items }) {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [cart, setCart] = useState([]); 

    // Filter pencarian barang
    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                              item.category.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === '' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = useMemo(() => {
        return [...new Set(items.map(item => item.category))];
    }, [items]);

    // Ambil keranjang dari localStorage saat awal load
    useEffect(() => {
        const savedCart = localStorage.getItem('redvox_cart');
        if (savedCart) setCart(JSON.parse(savedCart));
    }, []);

    // Simpan otomatis ke localStorage setiap ada perubahan
    useEffect(() => {
        localStorage.setItem('redvox_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, qty: (Number(i.qty) || 0) + 1 } : i);
            }
            return [...prev, { ...item, qty: 1 }];
        });
    };

    // PERBAIKAN BUG INPUT: Handle perubahan input text secara langsung
    const handleQtyChange = (id, value) => {
        if (value === '') {
            setCart(prev => prev.map(i => i.id === id ? { ...i, qty: '' } : i));
            return;
        }
        
        let cleanVal = value.replace(/^0+(?=\d)/, ''); 
        if (/^\d+$/.test(cleanVal)) {
            setCart(prev => prev.map(i => i.id === id ? { ...i, qty: parseInt(cleanVal, 10) } : i));
        }
    };

    // Saat input blur, jika kosong kembalikan ke 0
    const handleQtyBlur = (id) => {
        setCart(prev => prev.map(item => {
            if (item.id === id && item.qty === '') {
                return { ...item, qty: 0 };
            }
            return item;
        }));
    };

    const incrementQty = (id) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const currentQty = Number(item.qty) || 0;
                return { ...item, qty: currentQty + 1 };
            }
            return item;
        }));
    };

    const handleDecrement = (id) => {
        setCart(prev => {
            const item = prev.find(i => i.id === id);
            if (!item) return prev;
            
            const currentQty = Number(item.qty) || 0;
            if (currentQty <= 1) {
                return prev.filter(i => i.id !== id);
            } else {
                return prev.map(i => i.id === id ? { ...i, qty: currentQty - 1 } : i);
            }
        });
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(i => i.id !== id));
    };

    const getQtyInCart = (id) => {
        const item = cart.find(c => c.id === id);
        return item ? item.qty : 0;
    };

    const totals = useMemo(() => {
        let buy = 0; 
        let sell = 0; 
        
        cart.forEach(c => {
            const itemQty = Number(c.qty) || 0;
            buy += (c.buy_price * itemQty);
            if (c.sell_price !== 'LOCKED' && c.sell_price) {
                sell += (c.sell_price * itemQty);
            }
        });
        
        return { buy, sell, profit: sell - buy };
    }, [cart]);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Kalkulator Internal - Redfox Corp" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-4 mb-4 md:mb-6 mt-6">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900">Kalkulator Setoran</h2>
                        <p className="text-sm md:text-base text-gray-500 font-medium mt-1">Estimasi profit dan modal sebelum diteruskan ke Mesin Kasir.</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
                    
                    {/* BAGIAN KIRI: KATALOG BARANG */}
                    <div className="lg:col-span-2">
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
                            <h3 className="text-xl font-black text-gray-900 hidden sm:block">Katalog</h3>
                            
                            {/* KONTROL FILTER & PENCARIAN */}
                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                <div className="relative w-full sm:w-44">
                                    <select 
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold text-sm shadow-sm transition appearance-none cursor-pointer"
                                    >
                                        <option value="">Semua Kategori</option>
                                        {categories.map((cat, idx) => (
                                            <option key={idx} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">▼</div>
                                </div>

                                <div className="relative w-full sm:w-64">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                                    <input 
                                        type="text" 
                                        placeholder="Cari material..." 
                                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-sm shadow-sm transition"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 1. TAMPILAN MOBILE (KARTU E-COMMERCE) */}
                        <div className="block lg:hidden max-h-[65vh] overflow-y-auto custom-scrollbar pr-2 pb-24">
                            {filteredItems.length === 0 ? (
                                <div className="bg-white rounded-3xl p-10 text-center text-gray-400 font-medium border border-gray-100 shadow-sm">
                                    Material tidak ditemukan.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {filteredItems.map((item) => {
                                        const qtyInCart = getQtyInCart(item.id);
                                        const isSelected = qtyInCart > 0;

                                        return (
                                            <div key={item.id} className={`flex flex-col justify-between p-4 bg-white rounded-2xl transition duration-200 border ${isSelected ? 'border-orange-400 shadow-md shadow-orange-500/10' : 'border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200'}`}>
                                                <div className="mb-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 text-base leading-tight">{item.name}</h4>
                                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.category}</span>
                                                        </div>
                                                        {item.sell_price === 'LOCKED' || !item.sell_price ? (
                                                            <span className="text-[9px] bg-gray-100 text-gray-500 px-2 py-1 rounded uppercase font-bold tracking-widest whitespace-nowrap">Crafting</span>
                                                        ) : (
                                                            <span className="text-[10px] bg-green-50 text-green-600 border border-green-100 px-2 py-1 rounded uppercase font-bold tracking-widest whitespace-nowrap">Est: ${item.sell_price}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                                                    <div className="font-black text-red-500 text-lg">${item.buy_price}</div>
                                                    {isSelected ? (
                                                        <div className="flex items-center bg-gray-900 border border-gray-600 rounded-lg overflow-hidden h-9">
                                                            <button onClick={() => handleDecrement(item.id)} className="w-9 h-full bg-gray-700 hover:bg-gray-600 text-white font-black flex items-center justify-center text-lg transition active:bg-gray-500">-</button>
                                                            <input 
                                                                type="text" 
                                                                inputMode="numeric"
                                                                value={qtyInCart}
                                                                onChange={(e) => handleQtyChange(item.id, e.target.value)}
                                                                onBlur={() => handleQtyBlur(item.id)}
                                                                className="w-14 h-full bg-transparent text-white text-sm font-bold text-center outline-none border-none focus:ring-0 p-0 m-0"
                                                            />
                                                            <button onClick={() => incrementQty(item.id)} className="w-9 h-full bg-orange-500 hover:bg-orange-400 text-white font-black flex items-center justify-center text-lg transition active:bg-gray-500">+</button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => addToCart(item)} className="flex items-center gap-2 bg-white border-2 border-orange-100 text-orange-600 hover:bg-orange-500 hover:border-orange-500 hover:text-white px-4 py-1.5 rounded-full font-bold text-sm transition active:scale-95 shadow-sm">
                                                            <span className="text-lg leading-none">+</span> Tambah
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 2. TAMPILAN DESKTOP (TABEL KLASIK) */}
                        <div className="hidden lg:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="max-h-[650px] overflow-y-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 shadow-sm">
                                        <tr className="text-xs uppercase tracking-widest text-gray-500 font-bold">
                                            <th className="px-5 py-4 w-40 text-center">Aksi</th>
                                            <th className="px-5 py-4">Nama Barang</th>
                                            <th className="px-5 py-4 text-right">Modal (Beli)</th>
                                            <th className="px-5 py-4 text-right bg-orange-50/80 text-orange-800">Est. Jual (NPC)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredItems.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="text-center py-10 text-gray-400 font-medium">Material tidak ditemukan.</td>
                                            </tr>
                                        ) : (
                                            filteredItems.map((item) => {
                                                const qtyInCart = getQtyInCart(item.id);
                                                const isSelected = qtyInCart > 0;

                                                return (
                                                    <tr key={item.id} className={`${isSelected ? 'bg-orange-50/20' : 'hover:bg-gray-50/50'} transition duration-150`}>
                                                        <td className="px-5 py-3 text-center">
                                                            {isSelected ? (
                                                                <div className="flex items-center justify-center bg-gray-900 border border-gray-600 rounded-lg overflow-hidden h-9 w-[110px] mx-auto">
                                                                    <button onClick={() => handleDecrement(item.id)} className="w-9 h-full bg-gray-700 hover:bg-gray-600 text-white font-black flex items-center justify-center text-lg transition active:bg-gray-500">-</button>
                                                                    <input 
                                                                        type="text" 
                                                                        inputMode="numeric"
                                                                        value={qtyInCart}
                                                                        onChange={(e) => handleQtyChange(item.id, e.target.value)}
                                                                        onBlur={() => handleQtyBlur(item.id)}
                                                                        className="flex-1 h-full bg-transparent text-white text-sm font-bold text-center outline-none border-none focus:ring-0 p-0 m-0"
                                                                    />
                                                                    <button onClick={() => incrementQty(item.id)} className="w-9 h-full bg-orange-500 hover:bg-orange-400 text-white font-black flex items-center justify-center text-lg transition active:bg-gray-500">+</button>
                                                                </div>
                                                            ) : (
                                                                <button onClick={() => addToCart(item)} className="w-24 h-9 mx-auto bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-500 hover:text-white font-black transition flex items-center justify-center shadow-sm border border-orange-100 text-sm">
                                                                    + Tambah
                                                                </button>
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-3">
                                                            <div className="font-bold text-gray-900 text-lg leading-tight">{item.name}</div>
                                                            <div className="text-xs text-gray-400 font-bold uppercase tracking-wide mt-0.5">{item.category}</div>
                                                        </td>
                                                        <td className="px-5 py-3 text-right">
                                                            <span className="text-red-600 font-black bg-red-50 px-3 py-1.5 rounded-lg text-sm border border-red-100/50">
                                                                ${item.buy_price}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-3 font-black text-gray-900 text-right bg-orange-50/10">
                                                            {item.sell_price !== 'LOCKED' && item.sell_price ? (
                                                                <span className="text-green-600">${item.sell_price}</span>
                                                            ) : (
                                                                <span className="text-gray-400 font-medium text-xs bg-white border border-gray-100 px-2 py-1 rounded">Crafting</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* BAGIAN KANAN: KERANJANG KALKULATOR */}
                    <div className="lg:col-span-1 pb-20 lg:pb-0">
                        <div className="bg-gray-900 rounded-3xl shadow-xl p-4 md:p-8 lg:sticky lg:top-24 border border-gray-800 flex flex-col">
                            <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4">
                                <h3 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
                                    <span className="text-orange-500">🛍️</span> Keranjang <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">{cart.length}</span>
                                </h3>
                                {cart.length > 0 && (
                                    <button onClick={() => setCart([])} className="text-[10px] md:text-xs text-red-400 hover:text-red-300 font-bold transition px-3 py-1.5 bg-red-500/10 rounded-lg hover:bg-red-500/20 active:scale-95">
                                        Kosongkan
                                    </button>
                                )}
                            </div>

                            <div className="space-y-3 max-h-[40vh] lg:max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                                {cart.length === 0 ? (
                                    <div className="text-center py-8 md:py-12 text-gray-500 text-xs md:text-sm font-medium border-2 border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center">
                                        <span className="text-4xl mb-2 grayscale opacity-50">🛒</span>
                                        Belum ada barang dipilih.
                                    </div>
                                ) : (
                                    cart.map((c) => {
                                        const itemQty = Number(c.qty) || 0;
                                        return (
                                            <div key={c.id} className="flex justify-between items-center bg-gray-800 p-3 rounded-2xl border border-gray-700 relative group">
                                                <div className="flex-grow pr-2">
                                                    <div className="font-bold text-gray-100 text-xs md:text-sm leading-tight mb-1 truncate max-w-[130px] md:max-w-[180px]">{c.name}</div>
                                                    <div className="text-[10px] md:text-xs text-gray-400 font-medium">{itemQty} x ${c.buy_price.toLocaleString()}</div>
                                                </div>
                                                
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className="text-red-400 font-black text-sm">${(c.buy_price * itemQty).toLocaleString()}</div>
                                                </div>

                                                <button onClick={() => removeFromCart(c.id)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold md:opacity-0 md:group-hover:opacity-100 transition shadow-lg flex items-center justify-center z-10">
                                                    ✕
                                                </button>
                                            </div>
                                        )
                                    })
                                )}
                            </div>

                            <div className="mt-4 pt-5 md:pt-6 border-t border-gray-700 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 font-medium text-xs md:text-sm">Total Modal Beli</span>
                                    <span className="text-white font-black text-2xl md:text-3xl">${totals.buy.toLocaleString()}</span>
                                </div>

                                <div className="mt-2 pt-3 border-t border-gray-700/50 space-y-2">
                                    <div className="flex justify-between items-center text-xs md:text-sm">
                                        <span className="text-gray-400">Estimasi Omzet Jual</span>
                                        <span className="text-orange-400 font-bold">${totals.sell.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white font-bold text-xs md:text-sm">Proyeksi Profit Faksi</span>
                                        <span className={`font-black text-sm md:text-base px-2 py-1 rounded-lg ${totals.profit > 0 ? 'bg-green-500/20 text-green-400' : totals.profit < 0 ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-500'}`}>
                                            {totals.profit > 0 ? '+' : ''}${totals.profit.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {cart.length > 0 && (
                                <Link 
                                    href={route('pos.create')} 
                                    className="mt-4 md:mt-6 w-full flex items-center justify-center gap-2 py-3 md:py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-sm md:text-base rounded-xl shadow-lg shadow-orange-500/20 transition transform hover:-translate-y-0.5 active:scale-95"
                                >
                                    Lanjut ke Kasir <span>➔</span>
                                </Link>
                            )}
                        </div>
                    </div>

                </div>
            </div>
            
            {/* FLOATING CART SUMMARY UNTUK MOBILE */}
            {cart.length > 0 && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4 z-50 flex justify-between items-center shadow-[0_-10px_20px_rgba(0,0,0,0.2)] pb-safe">
                    <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Modal</div>
                        <div className="text-xl font-black text-white">${totals.buy.toLocaleString()}</div>
                    </div>
                    <Link 
                        href={route('pos.create')} 
                        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl shadow-md active:scale-95 transition"
                    >
                        Ke Kasir ➔
                    </Link>
                </div>
            )}
        </AuthenticatedLayout>
    );
}