const axios = require('axios');

export default async function handler(req, res) {
    // Jika tidak ada endpoint yang diminta, arahkan otomatis ke /home
    const endpoint = req.query.endpoint || '/home';
    const BASE_API_URL = 'https://www.sankavollerei.web.id/anime';

    try {
        const response = await axios.get(`${BASE_API_URL}${endpoint}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        // MAGIC TRICK VERCEL (ANTI-BAN RATE LIMIT):
        // s-maxage=300 berarti Vercel akan menahan data ini di memori selama 5 menit.
        // Walau ada 1.000 pengunjung webmu secara bersamaan, Vercel hanya akan 
        // meminta data ke server Sankavollerei 1 kali setiap 5 menit.
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=59');
        res.status(200).json(response.data);
    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({ error: 'Gagal menghubungi server pusat' });
    }
}
