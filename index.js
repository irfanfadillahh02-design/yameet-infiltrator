const express = require('express');
const { chromium } = require('playwright');

const app = express();
const PORT = process.env.PORT || 3000;

// Endpoint rahasia kita
app.get('/api/sedot', async (req, res) => {
    console.log("[SISTEM] Menerima permintaan infiltrasi...");
    
    let browser;
    try {
        // Luncurkan Chromium
        browser = await chromium.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // Wajib untuk server cloud
        });
        
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        });
        const page = await context.newPage();

        console.log("[1] Mengetuk gerbang YaMeet...");
        await page.goto('http://bd.nanas.vip/bd/login', { waitUntil: 'networkidle' });

        // Tunggu Cloudflare RUM selesai memvalidasi browser kita (3 detik)
        await page.waitForTimeout(3000); 

        console.log("[2] Memasukkan kredensial rahasia...");
        await page.fill('#inviteCode', '275699'); 
        await page.fill('#password', 'd6074eb8b0be2b9e818106218c3b1f53');
        
        console.log("[3] Mendobrak masuk...");
        // Sesuaikan selector tombol login jika perlu (cari class atau id tombolnya)
        await page.click('a.weui-btn_primary'); 

        // Tunggu sampai layar benar-benar berpindah ke dashboard
        await page.waitForURL('**/bd/index**', { timeout: 15000 });
        console.log("[4] Berhasil menembus Dashboard!");

        // Jeda manusia
        await page.waitForTimeout(2000);

        console.log("[5] Merampok brankas data...");
        // Buka URL data JSON menggunakan session browser yang sama!
        const response = await page.goto('https://bd.nanas.vip/bd/anchor-settlement-data?pageSize=500&pageNum=1');
        
        // Ambil isi JSON-nya
        const rawJson = await response.json();

        // Kembalikan data mentah ini ke PHP bosku
        res.status(200).json({
            status: 'sukses',
            pesan: 'Brankas berhasil dijebol Playwright!',
            data: rawJson.data || []
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
