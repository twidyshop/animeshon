const axios = require('axios');

export default async function handler(req, res) {
    // Default ke home jika kosong
    const endpoint = req.query.endpoint || '/anime/home';
    const BASE_API_URL = 'https://www.sankavollerei.web.id'; // Base URL penyedia API

    try {
        const targetUrl = `${BASE_API_URL}${endpoint}`;
        
        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Referer': 'https://www.sankavollerei.web.id/'
            },
            timeout: 10000
        });

        // Cache 5 menit di edge network Vercel
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=59');
        return res.status(200).json(response.data);
    } catch (error) {
        console.error("Proxy Error:", error.message);
        return res.status(500).json({ 
            error: 'Gagal terhubung ke API Otakudesu', 
            details: error.message 
        });
    }
}
