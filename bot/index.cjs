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

const API_URL = `${process.env.APP_URL}/api/bot/items`;

// Cache sementara untuk data barang agar tidak membebani server web
let cachedItems = [];

// Menyimpan session kalkulator berdasarkan ID Pesan
const activeSessions = new Map();

client.once('clientReady', () => {
    console.log(`[REDVOX ERP] Sistem terhubung ke satelit. Bot online sebagai ${client.user.tag}!`);
});

// ==========================================
// MENDENGARKAN PERINTAH TEKS (!setor, !beli, !request)
// ==========================================
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const args = message.content.trim().split(/ +/);
    const command = args[0].toLowerCase();

    // 1. COMMAND: !request
    if (command === '!request') {
        const embedReq = new EmbedBuilder()
            .setColor('#3B82F6') // Biru untuk Request
            .setTitle('📦 Sistem Request Material Redvox')
            .setDescription('Silakan klik tombol di bawah untuk mengisi formulir permintaan pesanan ke pusat.')
            .setFooter({ text: 'Redvox Corp - Ekspedisi & Logistik' });

        const btnReq = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('btn_open_request').setLabel('Isi Formulir Pesanan').setStyle(ButtonStyle.Primary).setEmoji('📝')
        );

        return message.reply({ embeds: [embedReq], components: [btnReq] });
    }

    // 2. COMMAND: !setor ATAU !beli
    if (command === '!setor' || command === '!beli') {
        try {
            const response = await axios.get(API_URL);
            cachedItems = response.data;

            if (cachedItems.length === 0) return message.reply('Katalog material kosong dari pusat.');

            const sessionType = command === '!setor' ? 'setor' : 'beli';

            // Setup Dropdown Menu
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select_item')
                .setPlaceholder('📦 Pilih Material untuk Ditambahkan...')
                .addOptions(cachedItems.slice(0, 25).map(item => {
                    // Logika menyembunyikan harga modal jika yang mengetik adalah pembeli (!beli)
                    let desc = '';
                    if (sessionType === 'setor') {
                        desc = `Modal: $${item.buy_price} | NPC: $${item.sell_price !== 'LOCKED' ? item.sell_price : 'Crafting'}`;
                    } else {
                        desc = `Harga Satuan: $${item.sell_price !== 'LOCKED' ? item.sell_price : 'Harga Khusus'}`;
                    }

                    return { label: item.name, description: desc, value: item.id.toString() };
                }));

            const rowDropdown = new ActionRowBuilder().addComponents(selectMenu);
            const rowButtons = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('clear_cart').setLabel('Kosongkan').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('checkout').setLabel('Selesai').setStyle(ButtonStyle.Success)
            );

            // Kirim pesan awal dan simpan session-nya
            const calcMessage = await message.reply({
                embeds: [generateKalkulatorEmbed({}, sessionType)],
                components: [rowDropdown, rowButtons]
            });

            // Simpan data keranjang berdasarkan ID pesan
            activeSessions.set(calcMessage.id, {
                authorId: message.author.id,
                type: sessionType,
                cart: {}
            });

        } catch (error) {
            console.error(error);
            message.reply('Sistem sedang gangguan! Tidak bisa menghubungi server Redvox.');
        }
    }
});

// ==========================================
// MENGELOLA INTERAKSI (Tombol, Dropdown, Modals)
// ==========================================
client.on('interactionCreate', async interaction => {
    
    // -- INTERAKSI A: MEMBUKA MODAL UNTUK REQUEST --
    if (interaction.isButton() && interaction.customId === 'btn_open_request') {
        const modal = new ModalBuilder().setCustomId('modal_submit_request').setTitle('Formulir Pesanan Redvox');
        
        const inputNama = new TextInputBuilder().setCustomId('req_paket').setLabel('Nama Paket / Barang yang dicari?').setStyle(TextInputStyle.Short).setPlaceholder('Contoh: Paket Senjata A, Kayu Halus...').setRequired(true);
        const inputJumlah = new TextInputBuilder().setCustomId('req_jumlah').setLabel('Berapa banyak jumlahnya?').setStyle(TextInputStyle.Short).setPlaceholder('Contoh: 500').setRequired(true);
        const inputCatatan = new TextInputBuilder().setCustomId('req_catatan').setLabel('Catatan Tambahan (Lokasi/Kontak)').setStyle(TextInputStyle.Paragraph).setRequired(false);

        modal.addComponents(new ActionRowBuilder().addComponents(inputNama), new ActionRowBuilder().addComponents(inputJumlah), new ActionRowBuilder().addComponents(inputCatatan));
        return await interaction.showModal(modal);
    }

    // -- INTERAKSI B: MENERIMA DATA MODAL REQUEST --
    if (interaction.isModalSubmit() && interaction.customId === 'modal_submit_request') {
        const paket = interaction.fields.getTextInputValue('req_paket');
        const jumlah = interaction.fields.getTextInputValue('req_jumlah');
        const catatan = interaction.fields.getTextInputValue('req_catatan') || 'Tidak ada catatan.';

        // Cari channel pusat di .env
        const mainChannel = client.channels.cache.get(process.env.MAIN_CHANNEL_ID);
        
        if (mainChannel) {
            const notifEmbed = new EmbedBuilder()
                .setColor('#F59E0B')
                .setTitle('🚨 ORDER MASUK!')
                .addFields(
                    { name: '👤 Pemesan', value: `<@${interaction.user.id}> (${interaction.user.tag})`, inline: true },
                    { name: '📦 Pesanan', value: `${jumlah}x ${paket}`, inline: true },
                    { name: '📝 Catatan', value: catatan }
                )
                .setFooter({ text: `Dari Server: ${interaction.guild.name}` })
                .setTimestamp();

            await mainChannel.send({ embeds: [notifEmbed] });
            await interaction.reply({ content: '✅ **Pesanan berhasil dikirim ke markas pusat Redvox!** Tim kami akan segera memprosesnya.', ephemeral: true });
        } else {
            await interaction.reply({ content: '⚠️ Gagal mengirim pesanan. Channel markas tidak ditemukan oleh sistem.', ephemeral: true });
        }
        return;
    }

    // ==========================================
    // LOGIKA KALKULATOR (!setor / !beli) DI BAWAH INI
    // ==========================================
    
    // Cek apakah interaksi ini berasal dari pesan kalkulator yang valid
    const session = activeSessions.get(interaction.message?.id);
    if (!session) return; // Jika interaksi dari pesan lama, abaikan.

    // Pastikan hanya orang yang memanggil perintah yang bisa memencetnya
    if (interaction.user.id !== session.authorId) {
        return interaction.reply({ content: 'Anda tidak bisa menggunakan kalkulator milik orang lain!', ephemeral: true });
    }

    // -- INTERAKSI C: MEMILIH BARANG DARI DROPDOWN --
    if (interaction.isStringSelectMenu() && interaction.customId === 'select_item') {
        const selectedItemId = interaction.values[0];
        const itemData = cachedItems.find(i => i.id.toString() === selectedItemId);

        // Munculkan Pop-up (Modal) untuk meminta jumlah (Quantity)
        const modal = new ModalBuilder().setCustomId(`modal_qty_${selectedItemId}`).setTitle(`Jumlah: ${itemData.name}`);
        const qtyInput = new TextInputBuilder().setCustomId('qty').setLabel('Masukkan angka (Contoh: 15)').setStyle(TextInputStyle.Short).setRequired(true);
        
        modal.addComponents(new ActionRowBuilder().addComponents(qtyInput));
        await interaction.showModal(modal);
    }

    // -- INTERAKSI D: MENERIMA ANGKA DARI MODAL KALKULATOR --
    if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_qty_')) {
        const itemId = interaction.customId.replace('modal_qty_', '');
        const qtyInput = interaction.fields.getTextInputValue('qty');
        const qty = parseInt(qtyInput) || 0;

        if (qty > 0) {
            // Tambahkan ke keranjang session
            session.cart[itemId] = (session.cart[itemId] || 0) + qty;
            await interaction.update({ embeds: [generateKalkulatorEmbed(session.cart, session.type)] });
        } else {
            await interaction.reply({ content: '⚠️ Masukkan angka yang valid!', ephemeral: true });
        }
    }

    // -- INTERAKSI E: TOMBOL KOSONGKAN & SELESAI --
    if (interaction.isButton()) {
        if (interaction.customId === 'clear_cart') {
            session.cart = {};
            await interaction.update({ embeds: [generateKalkulatorEmbed(session.cart, session.type)] });
        } 
        else if (interaction.customId === 'checkout') {
            activeSessions.delete(interaction.message.id); // Hapus session
            await interaction.update({ 
                components: [], // Hilangkan semua tombol
                content: session.type === 'setor' 
                    ? '✅ **Perhitungan Setoran Selesai!** Bawa material ke Gudang.'
                    : '✅ **Keranjang Beli Terkunci!** Hubungi staf Redvox untuk serah terima.'
            });
        }
    }
});

// ==========================================
// FUNGSI BANTUAN PEMBUATAN TAMPILAN EMBED
// ==========================================
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
                // Tampilan untuk Pelanggan (Sembunyikan Modal)
                cartText += `**${qty}x ${itemData.name}**\n↳ Harga: $${omzet.toLocaleString()}\n`;
            }
        }
    }

    const profit = totalOmzet - totalModal;

    const embed = new EmbedBuilder()
        .setColor(type === 'setor' ? '#F97316' : '#10B981') // Oranye untuk setor, Hijau untuk beli
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