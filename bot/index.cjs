require('dotenv').config({ path: __dirname + '/../.env' });
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
            .setTitle('🏢 Pusat Layanan Redvox Corp')
            .setDescription(`Halo <@${message.author.id}>! Selamat datang di sistem otomatis kami. Berikut adalah akses command yang tersedia untuk Anda:`)
            .addFields(
                { name: '🟢 Akses Publik (Pelanggan)', value: '`!beli` - Kalkulator belanja material\n`!paket` - Melihat katalog paket diskon\n`!request` - Formulir pemesanan khusus\n`!leaderboard` - Melihat Top Pengepul' },
                { name: '🔴 Akses Internal (Staff/Admin)', value: '`!setor` - Kalkulator setoran pekerja\n`!broadcaststok` - Menyiarkan info stok ke publik' }
            )
            .setFooter({ text: 'Redvox Corp - Ekspedisi & Logistik Terpercaya' });

        if (command === '!menu' || command === '!help') {
            return message.reply({ embeds: [embedMenu] });
        } else {
            await message.channel.send({ embeds: [embedMenu] });
        }
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
                .setColor('#FFD700') // Warna Emas
                .setTitle('🏆 Leaderboard Redvox Corp')
                .setDescription(boardText)
                .setFooter({ text: 'Peringkat Pengepul & Karyawan Terbaik Server' })
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
            .setTitle('📦 Katalog Paket Spesial Redvox Corp')
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

            // Generate Komponen dengan Search = kosong
            const components = generateCalcComponents(cachedItems, '', sessionType);

            const calcMessage = await message.reply({
                embeds: [generateKalkulatorEmbed({}, sessionType)],
                components: components
            });

            activeSessions.set(calcMessage.id, {
                authorId: message.author.id,
                type: sessionType,
                cart: {},
                searchQuery: '' // Simpan kata kunci pencarian user
            });

        } catch (error) {
            console.error(error);
            message.reply('Sistem sedang gangguan!');
        }
    }
});

// ==========================================
// MENGELOLA INTERAKSI
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
            await interaction.reply({ content: '✅ Pesanan dikirim ke pusat!', ephemeral: true });
        } else {
            await interaction.reply({ content: '⚠️ Gagal mengirim pesanan.', ephemeral: true });
        }
        return;
    }

    // -- LOGIKA KALKULATOR INTERAKTIF --
    const session = activeSessions.get(interaction.message?.id);
    if (!session) return; 

    if (interaction.user.id !== session.authorId) {
        return interaction.reply({ content: 'Anda tidak bisa menggunakan kalkulator milik orang lain!', ephemeral: true });
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
        session.searchQuery = query; // Update kata kunci

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
            await interaction.reply({ content: '⚠️ Masukkan angka yang valid!', ephemeral: true });
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
                    ? '✅ **Perhitungan Setoran Selesai!** Bawa material ke Gudang.'
                    : '✅ **Keranjang Beli Terkunci!** Hubungi staf Redvox untuk serah terima.'
            });
        }
    }
});

// ==========================================
// FUNGSI BANTUAN GENERATOR
// ==========================================

// Memfilter barang & membuat tombol pencarian
function generateCalcComponents(items, query, type) {
    let filtered = items;
    
    // Filter berdasarkan pencarian jika ada
    if (query) {
        filtered = items.filter(i => i.name.toLowerCase().includes(query.toLowerCase()) || i.category.toLowerCase().includes(query.toLowerCase()));
    }

    // Ambil maksimal 25 teratas
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

    // Tambahkan tombol Cari Barang di samping Kosongkan dan Selesai
    const rowButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('btn_search').setLabel('Cari Barang').setStyle(ButtonStyle.Primary).setEmoji('🔍'),
        new ButtonBuilder().setCustomId('clear_cart').setLabel('Kosongkan').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('checkout').setLabel('Selesai').setStyle(ButtonStyle.Success)
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
        .setFooter({ text: 'Data tersinkronisasi otomatis dengan Server Pusat' });

    if (type === 'setor') {
        embed.addFields(
            { name: '💰 Total Modal', value: `$${totalModal.toLocaleString()}`, inline: true },
            { name: '📈 Est. Profit Faksi', value: `+$${profit.toLocaleString()}`, inline: true }
        );
    } else {
        embed.addFields(
            { name: '💳 Total Tagihan', value: `$${totalOmzet.toLocaleString()}`, inline: false }
        );
    }

    return embed;
}

client.login(process.env.DISCORD_TOKEN);