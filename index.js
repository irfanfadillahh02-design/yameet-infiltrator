const express = require('express');
const { chromium } = require('playwright');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/sedot', async (req, res) => {
    console.log("[SISTEM] Menerima permintaan infiltrasi...");
    
    let browser;
    try {
        // Luncurkan Chromium
        browser = await chromium.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
        
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        });
        const page = await context.newPage();

        console.log("[1] Mengetuk gerbang YaMeet...");
        await page.goto('http://bd.nanas.vip/bd/login', { waitUntil: 'networkidle' });

        // Tunggu Cloudflare RUM selesai memvalidasi browser kita
        await page.waitForTimeout(3000); 

        console.log("[2] Memasukkan kredensial rahasia...");
        await page.fill('#inviteCode', '275699'); 
        
        // PENTING: Jika nanti balasan JSON-nya "Password Error" atau "Salah", 
        // silakan ganti d6074... di bawah ini dengan PASSWORD ASLI ketikan bosku.
        await page.fill('#password', 'butterflymanagement');
        
        console.log("[3] Mendobrak masuk...");
        await page.click('a.weui-btn_primary'); 

        console.log("[3.5] Menunggu respon pintu gerbang (Loading AJAX)...");
        // Kita beri jeda 5 detik pasti cukup untuk login selesai, tanpa perlu ngecek URL
        await page.waitForTimeout(5000); 

        console.log("[4] Merampok brankas data...");
        const response = await page.goto('https://bd.nanas.vip/bd/anchor-settlement-data?pageSize=500&pageNum=1');
        
        // Ambil isi JSON-nya
        const rawJson = await response.json();

        // Kembalikan data mentah ini ke layar browser bosku
        res.status(200).json({
            status: 'sukses',
            pesan: 'Brankas berhasil dijebol Playwright!',
            data: rawJson.data || rawJson
        });

    } catch (error) {
        console.error("Gagal total:", error);
        res.status(500).json({ status: 'error', pesan: error.message });
    } finally {
        if (browser) {
            await browser.close();
            console.log("[SISTEM] Jejak browser dihapus.");
        }
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pangkalan rahasia aktif di port ${PORT}`);
});
