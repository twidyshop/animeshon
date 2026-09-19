const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Set cache TTL ke 300 detik (5 menit).
// Menjamin server kita hanya menembak API maksimal 1 kali tiap 5 menit per endpoint.
const cache = new NodeCache({ stdTTL: 300 });

app.use(cors());
// Serve file statis (HTML/CSS/JS frontend) dari folder public
app.use(express.static(path.join(__dirname, 'public')));

const BASE_API_URL = 'https://www.sankavollerei.web.id/anime';

// Endpoint Proxy Backend
app.get('/api/proxy', async (req, res) => {
    // Menangkap sub-path, contoh: /api/proxy?endpoint=/home
    const endpoint = req.query.endpoint || '';
    const cacheKey = `anime_${endpoint}`;

    // 1. Cek apakah data untuk endpoint ini sudah ada di Cache
    if (cache.has(cacheKey)) {
        console.log(`[CACHE HIT] Melayani dari memori untuk: ${endpoint}`);
        return res.json(cache.get(cacheKey));
    }

    // 2. Jika tidak ada di Cache, fetch API Asli
    try {
        console.log(`[API FETCH] Meminta data baru ke: ${BASE_API_URL}${endpoint}`);
        const response = await axios.get(`${BASE_API_URL}${endpoint}`, {
            headers: {
                // Menyamarkan request agar terlihat seperti dari browser standar
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        // 3. Simpan response ke Cache untuk request berikutnya
        cache.set(cacheKey, response.data);

        res.json(response.data);
    } catch (error) {
        console.error("[ERROR] Gagal mengambil API:", error.message);
        res.status(500).json({ error: 'Terjadi gangguan koneksi ke server pusat.' });
    }
});

app.listen(port, () => {
    console.log(`[READY] Server Animeshon berjalan di port ${port}`);
});
