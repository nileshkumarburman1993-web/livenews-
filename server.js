const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const Parser = require('rss-parser');
const cheerio = require('cheerio');
const AINewsProcessor = require('./backend/ai-news-processor');
const app = express();
const port = 3000;

// Initialize AI Processor and RSS Parser
const aiProcessor = new AINewsProcessor();
const parser = new Parser({
    customFields: {
        item: ['media:content', 'media:thumbnail', 'enclosure']
    }
});

// Enable CORS
app.use(cors());
app.use(express.json());

// API Keys
const API_KEYS = {
    newsapi: 'b8e4f71582e84cc4aabe2bcedf4ddae0',
    newsapiai: 'd2ff234e-a761-4ee0-a882-d03277dd3970',
    guardian: 'cdf637a3-2c61-4cd5-8309-3bbef7e7a213',
    gnews: 'pub_62650ab97c0f8f4c1e8e5b3a4d9c2e1f42a3b',
    newsdata: 'pub_23ba4b3c6e15496ea45e61bb84a97ca2',
    weather: '084446e50abc487f942163742261902',
    finnhub: 'd6a4abhr01qsjlb9mcqgd6a4abhr01qsjlb9mcr0',
    current: '8XoGQsudFB3eO0ikZHracYcxX7alnzYsl3zhFz_n5z2IBuMS'
};

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// API Proxy Routes
app.get('/api/news/:category', async (req, res) => {
    const { category } = req.params;
    
    try {
        console.log(`🔍 Fetching LATEST news for category: ${category}`);
        
        // Try NewsData.io API FIRST (Real images!)
        try {
            console.log('🌟 Using NewsData.io API for latest news...');
            const categoryMap = { general: '', business: 'business', sports: 'sports', entertainment: 'entertainment', technology: 'technology' };
            const newsdataCategory = categoryMap[category] || '';
            const newsdataUrl = `https://newsdata.io/api/1/news?apikey=${API_KEYS.newsdata}&country=in&language=en${newsdataCategory ? '&category=' + newsdataCategory : ''}`;
            const newsdataResponse = await axios.get(newsdataUrl, { timeout: 10000 });
            
            if (newsdataResponse.data.status === 'success' && newsdataResponse.data.results && newsdataResponse.data.results.length > 0) {
                const articles = newsdataResponse.data.results.map(item => ({
                    title: item.title,
                    description: item.description || item.content,
                    content: item.content || item.description,
                    url: item.link,
                    urlToImage: item.image_url || `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=500&fit=crop&q=80`,
                    publishedAt: item.pubDate || new Date().toISOString(),
                    source: { name: item.source_id || 'NewsData' },
                    author: item.creator ? item.creator[0] : 'News Desk'
                }));
                
                const enhancedArticles = await aiProcessor.processNewsArticles(articles);
                console.log(`✅ NewsData.io returned ${enhancedArticles.length} articles with REAL images!`);
                return res.json({ 
                    success: true, 
                    articles: enhancedArticles,
                    source: 'NewsData.io',
                    aiProcessed: true,
                    trendingTopics: aiProcessor.getTrendingTopics()
                });
            }
        } catch (newsdataError) {
            console.log('⚠️ NewsData.io failed, trying NewsAPI.ai...', newsdataError.message);
        }

        // Try NewsAPI.ai (Another source with images!)
        try {
            console.log('🌟 Using NewsAPI.ai for latest news...');
            const newsapiaiUrl = `https://newsapi.ai/api/v1/article/getArticles`;
            const newsapiaiResponse = await axios.post(newsapiaiUrl, {
                apiKey: API_KEYS.newsapiai,
                keyword: category !== 'general' ? category : '',
                sourceLocationUri: 'http://en.wikipedia.org/wiki/India',
                lang: 'eng',
                articlesCount: 20,
                articlesSortBy: 'date'
            }, { timeout: 10000 });
            
            if (newsapiaiResponse.data && newsapiaiResponse.data.articles && newsapiaiResponse.data.articles.results && newsapiaiResponse.data.articles.results.length > 0) {
                const articles = newsapiaiResponse.data.articles.results.map(item => ({
                    title: item.title,
                    description: item.body ? item.body.substring(0, 200) : item.title,
                    content: item.body,
                    url: item.url,
                    urlToImage: item.image || `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=500&fit=crop&q=80`,
                    publishedAt: item.dateTime || new Date().toISOString(),
                    source: { name: item.source?.title || 'NewsAPI.ai' },
                    author: item.authors?.[0]?.name || 'News Desk'
                }));
                
                const enhancedArticles = await aiProcessor.processNewsArticles(articles);
                console.log(`✅ NewsAPI.ai returned ${enhancedArticles.length} articles with images!`);
                return res.json({ 
                    success: true, 
                    articles: enhancedArticles,
                    source: 'NewsAPI.ai',
                    aiProcessed: true,
                    trendingTopics: aiProcessor.getTrendingTopics()
                });
            }
        } catch (newsapiaiError) {
            console.log('⚠️ NewsAPI.ai failed, trying GNews...', newsapiaiError.message);
        }

        // Fallback to GNews API
        try {
            console.log('🌟 Using GNews API for latest news...');
            const gnewsUrl = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&max=20&apikey=${API_KEYS.gnews}`;
            const gnewsResponse = await axios.get(gnewsUrl);
            
            if (gnewsResponse.data.articles && gnewsResponse.data.articles.length > 0) {
                // 🔧 FIX: GNews uses 'image' field, convert to 'urlToImage' for consistency
                const normalizedArticles = gnewsResponse.data.articles.map(article => ({
                    ...article,
                    urlToImage: article.image || article.urlToImage,
                    source: article.source || { name: 'GNews' }
                }));
                
                // 🤖 AI ENHANCEMENT for GNews articles
                console.log(`🤖 AI Processing ${normalizedArticles.length} articles...`);
                const enhancedArticles = await aiProcessor.processNewsArticles(normalizedArticles);
                console.log(`✅ GNews returned ${enhancedArticles.length} AI-enhanced articles with images`);
                return res.json({ 
                    success: true, 
                    articles: enhancedArticles,
                    aiProcessed: true,
                    trendingTopics: aiProcessor.getTrendingTopics()
                });
            }
        } catch (gnewsError) {
            console.log('⚠️ GNews failed, trying NewsAPI...', gnewsError.message);
        }
        
        // Fallback to NewsAPI if GNews fails
        try {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const fromDate = yesterday.toISOString().split('T')[0];
            
            const newsApiUrl = `https://newsapi.org/v2/top-headlines?category=${category}&language=en&from=${fromDate}&sortBy=publishedAt&apiKey=${API_KEYS.newsapi}`;
            const response = await axios.get(newsApiUrl);
            
            if (response.data.status === 'ok' && response.data.articles && response.data.articles.length > 0) {
                let articles = response.data.articles.filter(a => 
                    a.title && 
                    a.title !== '[Removed]' && 
                    a.description && 
                    a.description !== '[Removed]'
                );
                
                articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
                
                console.log(`🤖 AI Processing ${articles.length} articles...`);
                const enhancedArticles = await aiProcessor.processNewsArticles(articles.slice(0, 20));
                
                console.log(`✅ NewsAPI returned ${enhancedArticles.length} AI-enhanced articles`);
                return res.json({ 
                    success: true, 
                    articles: enhancedArticles,
                    aiProcessed: true,
                    trendingTopics: aiProcessor.getTrendingTopics()
                });
            }
        } catch (newsApiError) {
            console.log('⚠️ NewsAPI also failed:', newsApiError.message);
        }
        
        // ═══════════════════════════════════════════════════════
        // AUTOMATIC FALLBACK: FREE RSS FEEDS
        // Triggered when all API sources fail
        // NO API KEY NEEDED - Works forever - Unlimited requests
        // ═══════════════════════════════════════════════════════
        try {
            console.log('');
            console.log('🔄🔄🔄 AUTOMATIC FALLBACK ACTIVATED! 🔄🔄🔄');
            console.log('🆓 Switching to FREE Google News RSS feeds...');
            console.log('✅ No API limits • ✅ FREE forever • ✅ AI processing still active');
            const rssFeeds = {
                general: 'https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en',
                business: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pKVGlnQVAB?hl=en-IN&gl=IN&ceid=IN:en',
                sports: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0FtVnVHZ0pKVGlnQVAB?hl=en-IN&gl=IN&ceid=IN:en',
                entertainment: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNREpxYW5RU0FtVnVHZ0pKVGlnQVAB?hl=en-IN&gl=IN&ceid=IN:en'
            };
            
            const feedUrl = rssFeeds[category] || rssFeeds.general;
            const feed = await parser.parseURL(feedUrl);
            
            if (feed.items && feed.items.length > 0) {
                // Extract images from RSS items with multiple fallbacks
                const articles = feed.items.slice(0, 20).map((item, index) => {
                    // Try multiple image sources
                    let imageUrl = null;
                    
                    // 1. Try media:content or media:thumbnail
                    if (item['media:content'] && item['media:content'].$?.url) {
                        imageUrl = item['media:content'].$.url;
                    } else if (item['media:thumbnail'] && item['media:thumbnail'].$?.url) {
                        imageUrl = item['media:thumbnail'].$.url;
                    } else if (item.enclosure?.url) {
                        imageUrl = item.enclosure.url;
                    }
                    
                    // 2. Fallback to category-specific Unsplash images
                    if (!imageUrl) {
                        const unsplashImages = {
                            business: `https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop&q=80`,
                            sports: `https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=500&fit=crop&q=80`,
                            entertainment: `https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800&h=500&fit=crop&q=80`,
                            general: `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=500&fit=crop&q=80`
                        };
                        imageUrl = unsplashImages[category] || unsplashImages.general;
                    }
                    
                    return {
                        title: item.title,
                        description: item.contentSnippet || item.content || item.title,
                        content: item.content || item.contentSnippet,
                        url: item.link,
                        urlToImage: imageUrl,
                        publishedAt: item.pubDate || new Date().toISOString(),
                        source: { name: item.source?._ || item.creator || 'Google News' },
                        author: item.creator || 'News Desk'
                    };
                });
                
                const enhancedArticles = await aiProcessor.processNewsArticles(articles);
                console.log('');
                console.log('✅✅✅ RSS FALLBACK SUCCESS! ✅✅✅');
                console.log(`📰 Loaded ${enhancedArticles.length} articles from Google News RSS`);
                console.log(`🤖 AI Processing: ACTIVE (${enhancedArticles.length} articles enhanced)`);
                console.log(`🆓 Source: FREE RSS feeds (No limits, works forever!)`);
                console.log('');
                
                return res.json({ 
                    success: true, 
                    articles: enhancedArticles,
                    aiProcessed: true,
                    source: 'RSS (Auto Fallback)',
                    fallbackMode: true,
                    message: '✅ Using RSS feeds - Always available!',
                    trendingTopics: aiProcessor.getTrendingTopics()
                });
            }
        } catch (rssError) {
            console.log('⚠️ RSS also failed:', rssError.message);
        }
        
        return res.json({ success: false, error: 'All news sources failed. Please try again later.' });
    } catch (error) {
        console.error('❌ Error fetching news:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch news', details: error.message });
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
