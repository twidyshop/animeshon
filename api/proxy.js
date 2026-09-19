const axios = require('axios');

export default async function handler(req, res) {
    const endpoint = req.query.endpoint || '/anime/animasu/home';
    const BASE_API_URL = 'https://www.sankavollerei.web.id';

    try {
        // Melakukan request dengan header browser yang sangat lengkap 
        // untuk menghindari blokir 403 Forbidden dari server pusat/Cloudflare.
        const response = await axios.get(`${BASE_API_URL}${endpoint}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                'Referer': 'https://www.sankavollerei.web.id/',
                'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"'
            },
            timeout: 10000 // Timeout 10 detik agar tidak gantung
        });

        // Cache Vercel untuk menghemat limit
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=59');
        res.status(200).json(response.data);
    } catch (error) {
        console.error("API Error Detail:", error.response?.status, error.message);
        res.status(500).json({ 
            error: 'Gagal menghubungi server pusat', 
            details: error.message,
            status: error.response?.status || 500
        });
    }
}
