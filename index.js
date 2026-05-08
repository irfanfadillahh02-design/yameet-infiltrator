const express = require('express');
const { chromium } = require('playwright');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/sedot', async (req, res) => {
    console.log("[SISTEM] Memulai Operasi Kuras Brankas...");
    
    let browser;
    try {
        browser = await chromium.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
        
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        });
        const page = await context.newPage();

        // --- FASE 1: PENYELUPAN ---
        console.log("[1] Menuju halaman login...");
        await page.goto('http://bd.nanas.vip/bd/login', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000); 

        console.log("[2] Memasukkan kunci akses...");
        await page.fill('#inviteCode', '275699'); 
        await page.fill('#password', 'd6074eb8b0be2b9e818106218c3b1f53');
        
        console.log("[3] Mendobrak gerbang...");
        await page.click('a.weui-btn_primary'); 
        await page.waitForTimeout(5000); // Jeda login AJAX

        // --- FASE 2: PENGURASAN MULTI-TARGET ---
        // Kita set pageSize=500 agar datanya langsung ketarik banyak sekaligus
        
        console.log("[4] Menyedot Data Withdraw...");
        const resWithdraw = await page.goto('https://bd.nanas.vip/bd/anchor-settlement-data?pageSize=500&pageNum=1');
        const dataWithdraw = await resWithdraw.json();

        console.log("[5] Menyedot Data Balance...");
        const resBalance = await page.goto('http://bd.nanas.vip/bd/anchor-data?pageSize=500&pageNumber=1');
        const dataBalance = await resBalance.json();

        console.log("[6] Menyedot Data Match...");
        const resMatch = await page.goto('http://bd.nanas.vip/bd/match-data?dateType=0&pageSize=500&pageNumber=1');
        const dataMatch = await resMatch.json();

        console.log("[7] Menyedot Data Call...");
        const resCall = await page.goto('http://bd.nanas.vip/bd/call-data?dateType=0&pageSize=500&pageNumber=1');
        const dataCall = await resCall.json();

        // --- FASE 3: PENGEPAKAN DATA ---
        console.log("[8] Mengemas seluruh hasil rampokan...");
        res.status(200).json({
            status: 'sukses',
            pesan: 'Seluruh brankas berhasil dikuras habis!',
            hasil: {
                withdraw: dataWithdraw.data || dataWithdraw,
                balance: dataBalance.data || dataBalance,
                match: dataMatch.data || dataMatch,
                call: dataCall.data || dataCall
            }
        });

    } catch (error) {
        console.error("Operasi Gagal:", error);
        res.status(500).json({ status: 'error', pesan: error.message });
    } finally {
        if (browser) {
            await browser.close();
            console.log("[SISTEM] Browser ditutup. Jejak dihapus.");
        }
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pangkalan rahasia multi-target aktif di port ${PORT}`);
});
