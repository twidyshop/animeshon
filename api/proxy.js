const axios = require('axios');

export default async function handler(req, res) {
    const endpoint = req.query.endpoint || '/anime/home';
    
    // GANTI INI DENGAN BASE URL API OTAKUDESU ANDA
    // Contoh: https://otakudesu-api.vercel.app atau domain proxy Anda
    const BASE_API_URL = 'https://www.sankavollerei.web.id'; 

    try {
        const targetUrl = `${BASE_API_URL}${endpoint}`;
        
        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=59');
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({ 
            error: 'Gagal terhubung ke API Otakudesu', 
            details: error.message 
        });
    }
}
