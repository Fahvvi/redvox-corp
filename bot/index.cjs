require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const axios = require('axios');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Endpoint API Laravel
const API_URL = `${process.env.APP_URL}/api/bot/items`;
const API_LEADERBOARD_URL = `${process.env.APP_URL}/api/bot/leaderboard`;

// Cache sementara
let cachedItems = [];
// Session memori
const activeSessions = new Map();
const knownUsers = new Set();

// ==========================================
// KAMUS RESEP CRAFTING (SINKRON DENGAN WEBSITE)
// ==========================================
const CRAFTING_RECIPES = {
    // Lumber
    "kayu halus": "🌲 **4 Kayu Gelondong**",
    "lem kayu": "🌲 **2 Getah** + 💧 **2 Air Putih**",
    // Peternakan
    "bulu ayam": "🐔 **1 Ayam Mati**",
    "daging ayam": "🐔 **1 Ayam Mati**",
    "kotoran": "🐔 **1 Ayam Mati**",
    "daging sapi merah": "🐄 **1 Sapi Mati**",
    // Penjahit
    "benang": "🧵 **1 Bulu Ayam**",
    "kain": "🧵 **2 Benang**",
    "pakaian": "👕 **3 Benang** + 🥼 **3 Kain**",
    // Agrikultur
    "gula": "🌾 **2 Tebu** + 🥼 **2 Kain**",
    "kopi": "☕ **2 Biji Kopi** + 🥼 **2 Kain**",
    "garam": "🧂 **2 Bubuk Garam** + 🥼 **2 Kain**",
    "teh celup": "🍵 **2 Teh** + 🥼 **2 Kain**",
    "beras": "🍚 **2 Padi** + 🥼 **2 Kain**",
    "pupuk": "💩 **10 Kotoran** + 🥼 **4 Kain**",
    // Perminyakan
    "bensin": "🛢️ **5 Minyak** + 🌲 **2 Getah**",
    "solar": "🛢️ **5 Minyak** + 🌲 **2 Getah**",
    "disel": "🛢️ **5 Minyak** + 🌲 **2 Getah**",
    "avtur": "🛢️ **10 Minyak** + 🌲 **2 Getah**",
    // Pertambangan
    "perak": "⛏️ **5 Biji Perak** + 🌲 **2 Kayu Gelondong**",
    "tembaga": "⛏️ **5 Biji Tembaga** + 🌲 **2 Kayu Gelondong**",
    "belerang": "⛏️ **5 Biji Belerang** + 🌲 **2 Kayu Gelondong**",
    "emas": "⛏️ **10 Biji Emas** + 🌲 **5 Kayu Gelondong**",
    "berlian": "💎 **15 Biji Berlian** + 🌲 **5 Kayu Gelondong**"
};

client.once('clientReady', () => {
    console.log(`[REDVOX ERP] Sistem terhubung ke satelit. Bot online sebagai ${client.user.tag}!`);
});

// ==========================================
// MENDENGARKAN PERINTAH TEKS 
// ==========================================
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('!')) return;

    const args = message.content.trim().split(/ +/);
    const command = args[0].toLowerCase();
    const isAdmin = message.member?.permissions.has('Administrator');

    // ---------------------------------------------------------
    // FITUR SAPAAN & MENU
    // ---------------------------------------------------------
    if (!knownUsers.has(message.author.id) || command === '!menu' || command === '!help') {
        knownUsers.add(message.author.id);

        const embedMenu = new EmbedBuilder()
            .setColor('#F97316')
            .setTitle('🏢 Pusat Layanan Redfox Corp')
            .setDescription(`Halo <@${message.author.id}>! Selamat datang di sistem otomatis kami. Berikut adalah akses command yang tersedia untuk Anda:`)
            .addFields(
                { name: '🟢 Akses Publik (Pelanggan & Pengepul)', value: '`!beli` - Kalkulator simulasi jual material\n`!harga [barang]` - Cek harga satuan secara cepat\n`!resep [barang]` - Ensiklopedia resep crafting\n`!paket` - Melihat katalog paket suplai B2B\n`!request` - Formulir pemesanan logistik khusus\n`!leaderboard` - Melihat Peringkat Pekerja Kota\n`!loker` - Info lowongan pekerjaan di Redfox' },
                { name: '🔴 Akses Internal (Staff/Admin)', value: '`!setor` - Kalkulator setoran pekerja lapangan\n`!broadcaststok` - Menyiarkan info stok ke publik' }
            )
            .setFooter({ text: 'Redfox Corp - Ekspedisi & Logistik Terpercaya' });

        if (command === '!menu' || command === '!help') {
            return message.reply({ embeds: [embedMenu] });
        } else {
            await message.channel.send({ embeds: [embedMenu] });
        }
    }

    // ---------------------------------------------------------
    // COMMAND: !resep [nama_barang]
    // ---------------------------------------------------------
    if (command === '!resep') {
        const query = args.slice(1).join(' ').toLowerCase();
        
        if (!query) {
            return message.reply('⚠️ **Format Salah!** Gunakan: `!resep [nama barang]`\nContoh: `!resep bensin` atau `!resep pakaian`');
        }

        // Cari resep yang cocok atau mirip
        const matchedKey = Object.keys(CRAFTING_RECIPES).find(key => key.includes(query) || query.includes(key));

        if (matchedKey) {
            const embedResep = new EmbedBuilder()
                .setColor('#3B82F6')
                .setTitle(`🛠️ Resep Crafting: ${matchedKey.toUpperCase()}`)
                .setDescription(`Untuk membuat **${matchedKey}**, Anda membutuhkan material berikut:\n\n${CRAFTING_RECIPES[matchedKey]}`)
                .setFooter({ text: 'Redfox Crafting Wiki' });
            return message.reply({ embeds: [embedResep] });
        } else {
            return message.reply(`❌ Maaf, resep untuk **"${query}"** tidak ditemukan di database kami atau masuk dalam kategori rahasia perusahaan.`);
        }
    }

    // ---------------------------------------------------------
    // COMMAND: !harga [nama_barang]
    // ---------------------------------------------------------
    if (command === '!harga') {
        const query = args.slice(1).join(' ').toLowerCase();
        if (!query) return message.reply('⚠️ **Format Salah!** Gunakan: `!harga [nama barang]`\nContoh: `!harga biji emas`');

        try {
            // Ambil data jika cache kosong
            if (cachedItems.length === 0) {
                const response = await axios.get(API_URL);
                cachedItems = response.data;
            }

            // Cari barang (kasus tidak sensitif huruf besar/kecil)
            const foundItems = cachedItems.filter(item => item.name.toLowerCase().includes(query));

            if (foundItems.length === 0) {
                return message.reply(`❌ Material **"${query}"** tidak ditemukan di katalog Redfox.`);
            }

            const embedHarga = new EmbedBuilder()
                .setColor('#10B981')
                .setTitle(`💰 Informasi Harga Pengepul`);

            let descText = '';
            foundItems.slice(0, 5).forEach(item => { // Tampilkan maks 5 jika pencarian luas (misal: "biji")
                const sellText = item.sell_price !== 'LOCKED' ? `$${item.sell_price.toLocaleString()}` : '🔒 (Item Crafting/Khusus)';
                descText += `**${item.name}** [${item.category.toUpperCase()}]\n↳ Redfox Beli: **$${item.buy_price.toLocaleString()}** | NPC/Jual: **${sellText}**\n\n`;
            });

            if (foundItems.length > 5) descText += `*...dan ${foundItems.length - 5} item lainnya. Harap lebih spesifik.*`;

            embedHarga.setDescription(descText);
            return message.reply({ embeds: [embedHarga] });

        } catch (err) {
            console.error(err);
            return message.reply('⚠️ Gagal terhubung ke database gudang pusat.');
        }
    }

    // ---------------------------------------------------------
    // COMMAND: !loker / !join
    // ---------------------------------------------------------
    if (command === '!loker' || command === '!join') {
        const embedLoker = new EmbedBuilder()
            .setColor('#EF4444')
            .setTitle('🤝 Bergabunglah dengan Redfox Corp!')
            .setThumbnail('https://i.imgur.com/K3ZpZ1Z.png') // Bisa diganti URL logo Redfox nanti
            .setDescription('Kami selalu mencari talenta pekerja keras untuk menggerakkan roda ekonomi San Andreas. Jadilah bagian dari jaringan logistik terbesar di kota!')
            .addFields(
                { name: '💼 Posisi Tersedia', value: '• Supir Logistik / Freight\n• Spesialis Pengepul (Tambang/Penebang/Dll)\n• Keamanan Gudang\n• Staf Operasional' },
                { name: '📍 Cara Melamar', value: '1. Kunjungi markas kami secara Roleplay (IC) di **Glenpark**.\n2. Temui manajer atau staf yang sedang bertugas.\n3. Siapkan tanda pengenal, lisensi mengemudi (untuk supir), dan niat kerja yang kuat!' }
            )
            .setFooter({ text: 'Redfox Corp - Masa Depan Logistik Anda' });
        
        return message.reply({ embeds: [embedLoker] });
    }

    // ---------------------------------------------------------
    // COMMAND: !leaderboard / !top
    // ---------------------------------------------------------
    if (command === '!leaderboard' || command === '!top') {
        try {
            const response = await axios.get(API_LEADERBOARD_URL);
            const lbData = response.data;

            if (!lbData || lbData.length === 0) return message.reply('Belum ada data leaderboard saat ini.');

            let boardText = '';
            const medals = ['🥇', '🥈', '🥉'];
            
            lbData.slice(0, 10).forEach((user, index) => {
                const rank = index < 3 ? medals[index] : `**#${index + 1}**`;
                const score = user.total ? `$${user.total.toLocaleString()}` : '0'; 
                boardText += `${rank} **${user.name}** - ${score}\n`;
            });

            const embedLb = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('🏆 Peringkat Pengepul Redfox Corp')
                .setDescription(boardText)
                .setFooter({ text: 'Data ditarik langsung dari sistem ERP' })
                .setTimestamp();
            
            return message.reply({ embeds: [embedLb] });
        } catch (err) {
            console.error(err);
            return message.reply('⚠️ Gagal mengambil data leaderboard dari server pusat.');
        }
    }

    // ---------------------------------------------------------
    // COMMAND: !request & !paket & !broadcaststok
    // ---------------------------------------------------------
    if (command === '!request') {
        const embedReq = new EmbedBuilder()
            .setColor('#3B82F6') 
            .setTitle('📦 Sistem Request Material Redvox')
            .setDescription('Silakan klik tombol di bawah untuk mengisi formulir permintaan pesanan ke pusat.')
            .setFooter({ text: 'Redvox Corp - Ekspedisi & Logistik' });

        const btnReq = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('btn_open_request').setLabel('Isi Formulir Pesanan').setStyle(ButtonStyle.Primary).setEmoji('📝')
        );

        return message.reply({ embeds: [embedReq], components: [btnReq] });
    }

    if (command === '!paket') {
        const embedPaket = new EmbedBuilder()
            .setColor('#10B981')
            .setTitle('📦 Katalog Paket Spesial Redfox Corp')
            .setDescription('Hemat lebih banyak dengan membeli material dalam bentuk paket! Berikut adalah daftar paket yang tersedia saat ini:')
            .addFields(
                { name: '- Paket Perak', value: '↳ 10x Perak\n↳ 30x Kayu Gelondong\n**Harga Khusus:** $5,000' },
                { name: '- Paket Furniture', value: '↳ 1x Batu (Stone)\n↳ 2x Kayu Halus\n↳ 2x Lem Kayu \n↳ 1x Kain \n↳ 1x Benang \n↳ 1x Tembaga \n↳ 1x Serbuk Belerang \n**Harga Khusus:** $1,100' },
                { name: '- Paket Autopart', value: '↳ 1x Perak\n↳ 1x Bensin \n↳ 1x Disel \n↳ 1x Solar \n↳ 1x Serbuk Belerang \n↳ 1x Kayu Halus \n**Harga Khusus:** $1,000' }
            )
            .setFooter({ text: 'Klik tombol di bawah untuk langsung memesan paket ke markas kami.' });

        const btnPaket = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('btn_open_request').setLabel('Pesan Paket Ini').setStyle(ButtonStyle.Success).setEmoji('🛒')
        );

        return message.reply({ embeds: [embedPaket], components: [btnPaket] });
    }

    if (command === '!broadcaststok' || command === '!infostok') {
        if (!isAdmin) return message.reply({ content: '⛔ Maaf Bos, hanya petinggi perusahaan yang bisa mengumumkan stok!', ephemeral: true });

        const isiPesan = args.slice(1).join(' ');
        if (!isiPesan) return message.reply('⚠️ Format salah! Gunakan: `!broadcaststok [Isi pesan/Update stok]`');

        const channelPublik = client.channels.cache.get(process.env.PUBLIC_CHANNEL_ID);
        if (channelPublik) {
            const embedInfo = new EmbedBuilder().setColor('#F97316').setTitle('📢 UPDATE STOK MATERIAL REDVOX').setDescription(`**Informasi Terbaru dari Pusat:**\n\n${isiPesan}`).setFooter({ text: `Diumumkan oleh Petinggi: ${message.author.username}` }).setTimestamp();
            await channelPublik.send({ content: '@everyone Perhatian para pelanggan!', embeds: [embedInfo] });
            return message.reply('✅ Berhasil disiarkan!');
        } else {
            return message.reply('⚠️ Channel Publik tidak ditemukan di .env.');
        }
    }

    // ---------------------------------------------------------
    // COMMAND: !setor ATAU !beli (DENGAN SEARCH)
    // ---------------------------------------------------------
    if (command === '!setor' || command === '!beli') {
        if (command === '!setor' && !isAdmin) {
            return message.reply('⛔ **Akses Ditolak!** Command `!setor` hanya untuk internal Redvox.');
        }

        try {
            const response = await axios.get(API_URL);
            cachedItems = response.data;
            if (cachedItems.length === 0) return message.reply('Katalog material kosong.');

            const sessionType = command === '!setor' ? 'setor' : 'beli';

            const components = generateCalcComponents(cachedItems, '', sessionType);

            const calcMessage = await message.reply({
                embeds: [generateKalkulatorEmbed({}, sessionType)],
                components: components
            });

            activeSessions.set(calcMessage.id, {
                authorId: message.author.id,
                type: sessionType,
                cart: {},
                searchQuery: '' 
            });

        } catch (error) {
            console.error(error);
            message.reply('⚠️ Sistem sedang gangguan dalam mengambil data kalkulator.');
        }
    }
});

// ==========================================
// MENGELOLA INTERAKSI BUTTON & MODAL
// ==========================================
client.on('interactionCreate', async interaction => {
    
    // -- MEMBUKA MODAL REQUEST --
    if (interaction.isButton() && interaction.customId === 'btn_open_request') {
        const modal = new ModalBuilder().setCustomId('modal_submit_request').setTitle('Formulir Pesanan Redvox');
        const inputNama = new TextInputBuilder().setCustomId('req_paket').setLabel('Nama Paket / Barang?').setStyle(TextInputStyle.Short).setRequired(true);
        const inputJumlah = new TextInputBuilder().setCustomId('req_jumlah').setLabel('Berapa banyak?').setStyle(TextInputStyle.Short).setRequired(true);
        const inputCatatan = new TextInputBuilder().setCustomId('req_catatan').setLabel('Catatan (Lokasi/Kontak)').setStyle(TextInputStyle.Paragraph).setRequired(false);
        modal.addComponents(new ActionRowBuilder().addComponents(inputNama), new ActionRowBuilder().addComponents(inputJumlah), new ActionRowBuilder().addComponents(inputCatatan));
        return await interaction.showModal(modal);
    }

    // -- MENERIMA DATA MODAL REQUEST --
    if (interaction.isModalSubmit() && interaction.customId === 'modal_submit_request') {
        const paket = interaction.fields.getTextInputValue('req_paket');
        const jumlah = interaction.fields.getTextInputValue('req_jumlah');
        const catatan = interaction.fields.getTextInputValue('req_catatan') || 'Tidak ada catatan.';
        const mainChannel = client.channels.cache.get(process.env.MAIN_CHANNEL_ID);
        
        if (mainChannel) {
            const notifEmbed = new EmbedBuilder().setColor('#F59E0B').setTitle('🚨 ORDER MASUK!').addFields(
                { name: '👤 Pemesan', value: `<@${interaction.user.id}>`, inline: true },
                { name: '📦 Pesanan', value: `${jumlah}x ${paket}`, inline: true },
                { name: '📝 Catatan', value: catatan }
            );
            await mainChannel.send({ embeds: [notifEmbed] });
            await interaction.reply({ content: '✅ Pesanan berhasil dikirim ke markas pusat!', ephemeral: true });
        } else {
            await interaction.reply({ content: '⚠️ Gagal mengirim pesanan. Sistem internal belum diatur.', ephemeral: true });
        }
        return;
    }

    // -- LOGIKA KALKULATOR INTERAKTIF --
    const session = activeSessions.get(interaction.message?.id);
    if (!session) return; 

    if (interaction.user.id !== session.authorId) {
        return interaction.reply({ content: '⛔ Anda tidak bisa menggunakan alat hitung milik orang lain!', ephemeral: true });
    }

    // -- MEMBUKA MODAL CARI BARANG --
    if (interaction.isButton() && interaction.customId === 'btn_search') {
        const modal = new ModalBuilder().setCustomId('modal_search_item').setTitle('Cari Material');
        const searchInput = new TextInputBuilder().setCustomId('search_query').setLabel('Ketik nama barang (Kosongkan utk reset):').setStyle(TextInputStyle.Short).setRequired(false);
        modal.addComponents(new ActionRowBuilder().addComponents(searchInput));
        await interaction.showModal(modal);
        return;
    }

    // -- MENERIMA HASIL PENCARIAN --
    if (interaction.isModalSubmit() && interaction.customId === 'modal_search_item') {
        const query = interaction.fields.getTextInputValue('search_query');
        session.searchQuery = query; 

        const newComponents = generateCalcComponents(cachedItems, query, session.type);
        await interaction.update({ components: newComponents });
        return;
    }

    // -- PILIH BARANG -> MINTA JUMLAH --
    if (interaction.isStringSelectMenu() && interaction.customId === 'select_item') {
        const selectedItemId = interaction.values[0];
        const itemData = cachedItems.find(i => i.id.toString() === selectedItemId);

        const modal = new ModalBuilder().setCustomId(`modal_qty_${selectedItemId}`).setTitle(`Jumlah: ${itemData.name}`);
        const qtyInput = new TextInputBuilder().setCustomId('qty').setLabel('Masukkan angka (Contoh: 15)').setStyle(TextInputStyle.Short).setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(qtyInput));
        await interaction.showModal(modal);
    }

    // -- MENERIMA INPUT ANGKA (QTY) --
    if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_qty_')) {
        const itemId = interaction.customId.replace('modal_qty_', '');
        const qty = parseInt(interaction.fields.getTextInputValue('qty')) || 0;

        if (qty > 0) {
            session.cart[itemId] = (session.cart[itemId] || 0) + qty;
            await interaction.update({ embeds: [generateKalkulatorEmbed(session.cart, session.type)] });
        } else {
            await interaction.reply({ content: '⚠️ Masukkan nominal angka yang valid!', ephemeral: true });
        }
    }

    // -- TOMBOL KOSONGKAN & SELESAI --
    if (interaction.isButton()) {
        if (interaction.customId === 'clear_cart') {
            session.cart = {};
            await interaction.update({ embeds: [generateKalkulatorEmbed(session.cart, session.type)] });
        } 
        else if (interaction.customId === 'checkout') {
            activeSessions.delete(interaction.message.id); 
            await interaction.update({ 
                components: [], 
                content: session.type === 'setor' 
                    ? '✅ **Perhitungan Setoran Selesai!** Segera bawa material ke Gudang.'
                    : '✅ **Keranjang Beli Terkunci!** Hubungi staf Redvox untuk proses serah terima barang.'
            });
        }
    }
});

// ==========================================
// FUNGSI BANTUAN GENERATOR KALKULATOR
// ==========================================

function generateCalcComponents(items, query, type) {
    let filtered = items;
    
    if (query) {
        filtered = items.filter(i => i.name.toLowerCase().includes(query.toLowerCase()) || i.category.toLowerCase().includes(query.toLowerCase()));
    }

    const sliced = filtered.slice(0, 25);
    
    let rowDropdown;
    if (sliced.length === 0) {
        const emptyMenu = new StringSelectMenuBuilder().setCustomId('select_item').setPlaceholder('❌ Material tidak ditemukan...').setDisabled(true).addOptions([{label:'Kosong', value:'0'}]);
        rowDropdown = new ActionRowBuilder().addComponents(emptyMenu);
    } else {
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_item')
            .setPlaceholder(query ? `🔍 Hasil Cari: "${query}" (${sliced.length} item)` : '📦 Pilih Material untuk Ditambahkan...')
            .addOptions(sliced.map(item => {
                let desc = type === 'setor' 
                    ? `Modal: $${item.buy_price} | NPC: $${item.sell_price !== 'LOCKED' ? item.sell_price : 'Crafting'}`
                    : `Harga Satuan: $${item.sell_price !== 'LOCKED' ? item.sell_price : 'Harga Khusus'}`;
                return { label: item.name, description: desc, value: item.id.toString() };
            }));
        rowDropdown = new ActionRowBuilder().addComponents(selectMenu);
    }

    const rowButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('btn_search').setLabel('Cari Barang').setStyle(ButtonStyle.Primary).setEmoji('🔍'),
        new ButtonBuilder().setCustomId('clear_cart').setLabel('Kosongkan').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('checkout').setLabel('Kunci Transaksi').setStyle(ButtonStyle.Success)
    );

    return [rowDropdown, rowButtons];
}

function generateKalkulatorEmbed(cart, type) {
    let totalModal = 0;
    let totalOmzet = 0;
    let cartText = '';

    for (const [id, qty] of Object.entries(cart)) {
        const itemData = cachedItems.find(i => i.id.toString() === id);
        if (itemData && qty > 0) {
            const modal = itemData.buy_price * qty;
            const omzet = (itemData.sell_price !== 'LOCKED' ? itemData.sell_price : 0) * qty;
            totalModal += modal;
            totalOmzet += omzet;
            
            if (type === 'setor') {
                cartText += `**${qty}x ${itemData.name}**\n↳ Modal: $${modal.toLocaleString()} | NPC: $${omzet.toLocaleString()}\n`;
            } else {
                cartText += `**${qty}x ${itemData.name}**\n↳ Harga: $${omzet.toLocaleString()}\n`;
            }
        }
    }

    const profit = totalOmzet - totalModal;

    const embed = new EmbedBuilder()
        .setColor(type === 'setor' ? '#F97316' : '#10B981') 
        .setTitle(type === 'setor' ? '🧮 Kalkulator Setoran Redvox' : '🛒 Redvox Store - Checkout')
        .setDescription(cartText === '' ? '*Keranjang masih kosong.*' : cartText)
        .setFooter({ text: 'Data tersinkronisasi otomatis dengan Server Pusat Redfox ERP' });

    if (type === 'setor') {
        embed.addFields(
            { name: '💰 Total Modal Dikeluarkan', value: `$${totalModal.toLocaleString()}`, inline: true },
            { name: '📈 Estimasi Profit Bersih', value: `+$${profit.toLocaleString()}`, inline: true }
        );
    } else {
        embed.addFields(
            { name: '💳 Total Tagihan', value: `$${totalOmzet.toLocaleString()}`, inline: false }
        );
    }

    return embed;
}

client.login(process.env.DISCORD_TOKEN);