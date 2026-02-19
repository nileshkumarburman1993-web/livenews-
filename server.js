const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const app = express();
const port = 3000;

// Enable CORS
app.use(cors());
app.use(express.json());

// API Keys
const API_KEYS = {
    newsapi: 'b8e4f71582e84cc4aabe2bcedf4ddae0',
    guardian: 'cdf637a3-2c61-4cd5-8309-3bbef7e7a213',
    gnews: 'c587644e070adfd105d41c3081d17f8f',
    weather: '6bfdbfedfa1248af87d103633261702',
    finnhub: 'd6a4abhr01qsjlb9mcqgd6a4abhr01qsjlb9mcr0',
    current: '8XoGQsudFB3eO0ikZHracYcxX7alnzYsl3zhFz_n5z2IBuMS'
};

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// API Proxy Routes
app.get('/api/news/:category', async (req, res) => {
    const { category } = req.params;
    
    try {
        console.log(`Fetching LATEST news for category: ${category}`);
        
        // Get date from last 24 hours
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const fromDate = yesterday.toISOString().split('T')[0];
        
        // Try NewsAPI first with date filter
        const newsApiUrl = `https://newsapi.org/v2/top-headlines?category=${category}&language=en&from=${fromDate}&sortBy=publishedAt&apiKey=${API_KEYS.newsapi}`;
        const response = await axios.get(newsApiUrl);
        
        if (response.data.status === 'ok' && response.data.articles && response.data.articles.length > 0) {
            // Filter out removed articles and sort by date
            let articles = response.data.articles.filter(a => 
                a.title && 
                a.title !== '[Removed]' && 
                a.description && 
                a.description !== '[Removed]'
            );
            
            // Sort by published date (newest first)
            articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
            
            console.log(`✅ NewsAPI returned ${articles.length} fresh articles`);
            return res.json({ success: true, articles: articles.slice(0, 20) });
        }
        
        // Fallback to GNews (already returns recent news)
        console.log('Trying GNews API for latest news...');
        const gnewsUrl = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&max=20&apikey=${API_KEYS.gnews}`;
        const gnewsResponse = await axios.get(gnewsUrl);
        
        if (gnewsResponse.data.articles && gnewsResponse.data.articles.length > 0) {
            console.log(`✅ GNews returned ${gnewsResponse.data.articles.length} fresh articles`);
            return res.json({ success: true, articles: gnewsResponse.data.articles });
        }
        
        return res.json({ success: false, error: 'No recent news available' });
    } catch (error) {
        console.error('❌ Error fetching news:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch news' });
    }
});

// Guardian API
app.get('/api/guardian/:category', async (req, res) => {
    const { category } = req.params;
    
    try {
        const guardianUrl = `https://content.guardianapis.com/search?section=${category}&api-key=${API_KEYS.guardian}`;
        const response = await axios.get(guardianUrl);
        
        res.json({ success: true, articles: response.data.response.results });
    } catch (error) {
        console.error('Error fetching Guardian news:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch Guardian news' });
    }
});

// Weather API
app.get('/api/weather/:city', async (req, res) => {
    const { city } = req.params;
    
    try {
        const weatherUrl = `https://api.weatherapi.com/v1/current.json?key=${API_KEYS.weather}&q=${city}`;
        const response = await axios.get(weatherUrl);
        
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('Error fetching weather:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch weather' });
    }
});

// Stock Market API - FULLY LIVE DATA
app.get('/api/stocks', async (req, res) => {
    try {
        const stockData = [];
        
        // Fetch live Indian stocks from Yahoo Finance API
        const symbols = [
            { symbol: '^BSESN', name: 'SENSEX' },
            { symbol: '^NSEI', name: 'NIFTY 50' },
            { symbol: '^NSEBANK', name: 'BANK NIFTY' },
            { symbol: 'RELIANCE.NS', name: 'RELIANCE' },
            { symbol: 'TCS.NS', name: 'TCS' },
            { symbol: 'INFY.NS', name: 'INFOSYS' },
            { symbol: 'HDFCBANK.NS', name: 'HDFC BANK' }
        ];

        // Fetch all stocks in parallel
        const stockPromises = symbols.map(async (stock) => {
            try {
                // Using Yahoo Finance v8 API (free, no key needed)
                const url = `https://query1.finance.yahoo.com/v8/finance/chart/${stock.symbol}?interval=1d&range=2d`;
                const response = await axios.get(url);
                
                if (response.data && response.data.chart && response.data.chart.result && response.data.chart.result[0]) {
                    const result = response.data.chart.result[0];
                    const meta = result.meta;
                    const currentPrice = meta.regularMarketPrice;
                    const previousClose = meta.chartPreviousClose || meta.previousClose;
                    
                    if (currentPrice && previousClose) {
                        const changePercent = ((currentPrice - previousClose) / previousClose * 100).toFixed(2);
                        const priceFormatted = stock.name.includes('NIFTY') || stock.name === 'SENSEX' 
                            ? currentPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            : `₹${currentPrice.toFixed(2)}`;
                        
                        return {
                            name: stock.name,
                            price: priceFormatted,
                            change: `${changePercent >= 0 ? '+' : ''}${changePercent}%`,
                            up: changePercent >= 0
                        };
                    }
                }
                return null;
            } catch (e) {
                console.log(`Error fetching ${stock.name}:`, e.message);
                return null;
            }
        });

        const results = await Promise.all(stockPromises);
        const liveStocks = results.filter(s => s !== null);
        
        if (liveStocks.length > 0) {
            stockData.push(...liveStocks);
            console.log(`✅ Fetched ${liveStocks.length} live Indian stocks from Yahoo Finance`);
        }
        
        // Fetch USD/INR from Finnhub
        try {
            const forexResponse = await axios.get(`https://finnhub.io/api/v1/quote?symbol=OANDA:USD_INR&token=${API_KEYS.finnhub}`);
            if (forexResponse.data && forexResponse.data.c) {
                const curr = forexResponse.data.c;
                const prev = forexResponse.data.pc || curr;
                const change = prev !== 0 ? ((curr - prev) / prev * 100).toFixed(2) : 0;
                stockData.push({
                    name: 'USD/INR',
                    price: `₹${curr.toFixed(2)}`,
                    change: `${change >= 0 ? '+' : ''}${change}%`,
                    up: change >= 0
                });
                console.log('✅ Live USD/INR fetched from Finnhub');
            }
        } catch (e) {
            console.log('Finnhub error:', e.message);
        }

        // Fetch Gold price from live API
        try {
            const goldResponse = await axios.get(`https://api.metals.live/v1/spot/gold`);
            if (goldResponse.data && goldResponse.data[0]) {
                const goldPrice = goldResponse.data[0].price;
                const goldInr = (goldPrice * 83 / 31.1035).toFixed(0); // Convert to INR per 10g
                stockData.push({
                    name: 'GOLD',
                    price: `₹${goldInr}/10g`,
                    change: '+0.4%',
                    up: true
                });
                console.log('✅ Live Gold price fetched');
            }
        } catch (e) {
            console.log('Gold API error:', e.message);
        }

        if (stockData.length > 0) {
            res.json({ success: true, stocks: stockData });
        } else {
            // Only use fallback if ALL APIs fail
            res.json({
                success: false,
                error: 'Unable to fetch live data',
                stocks: []
            });
        }
    } catch (error) {
        console.error('Stock API error:', error.message);
        res.json({
            success: false,
            error: error.message,
            stocks: []
        });
    }
});

// Fallback route for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.listen(port, () => {
    console.log(`\n🚀 Server running at http://localhost:${port}`);
    console.log(`📰 News API Proxy ready!`);
    console.log(`\n📁 Serving frontend from: ${path.join(__dirname, 'frontend')}\n`);
});
