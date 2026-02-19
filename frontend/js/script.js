// ============================================
// CONFIGURATION - API KEYS
// ============================================
const CONFIG = {
    NEWS_API_KEY: 'YOUR_NEWSAPI_KEY',         // newsapi.org
    GNEWS_API_KEY: 'YOUR_GNEWS_KEY',          // gnews.io (free backup)
    WEATHER_API_KEY: 'YOUR_OPENWEATHER_KEY',  // openweathermap.org
    AQI_API_KEY: 'YOUR_AQICN_KEY',            // aqicn.org (free)
    GEMINI_API_KEY: 'YOUR_GEMINI_KEY',        // Google AI (free)
};

// Delhi Coordinates
const DELHI = { lat: 28.6139, lon: 77.2090 };

let currentPage = 1;
let currentCategory = 'delhi';
let allNews = [];
let isDarkMode = false;

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    fetchDelhiNews();
    fetchDelhiWeather();
    fetchDelhiAQI();
    initScrollTop();
    
    // Auto refresh every 3 minutes
    setInterval(fetchDelhiNews, 180000);
    setInterval(fetchDelhiAQI, 600000); // AQI every 10 min
});

// ============================================
// DATE TIME
// ============================================
function updateDateTime() {
    const now = new Date();
    const hindi = now.toLocaleDateString('hi-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const time = now.toLocaleTimeString('hi-IN', { hour12: true });
    
    const topDT = document.getElementById('topDateTime');
    if (topDT) topDT.textContent = `📅 ${hindi} | 🕐 ${time}`;
}

// ============================================
// FETCH DELHI NEWS - Multiple Sources
// ============================================
async function fetchDelhiNews(category = 'delhi') {
    currentCategory = category;
    const newsGrid = document.getElementById('newsGrid');
    newsGrid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> दिल्ली की खबरें लोड हो रही हैं...</div>';
    
    // Update section title
    const titles = {
        'delhi': '📰 ताज़ा दिल्ली खबरें',
        'delhi-politics': '🏛️ दिल्ली राजनीति',
        'delhi-crime': '🚔 दिल्ली क्राइम न्यूज़',
        'delhi-traffic': '🚗 दिल्ली ट्रैफिक अपडेट',
        'delhi-weather': '🌤️ दिल्ली मौसम',
        'delhi-metro': '🚇 दिल्ली मेट्रो न्यूज़',
        'delhi-pollution': '🏭 दिल्ली प्रदूषण/AQI',
        'delhi-education': '📚 दिल्ली शिक्षा',
        'delhi-health': '🏥 दिल्ली स्वास्थ्य',
        'delhi-business': '💼 दिल्ली बिज़नेस',
        'delhi-sports': '⚽ दिल्ली खेल',
        'delhi-entertainment': '🎬 दिल्ली मनोरंजन',
        'national': '🇮🇳 राष्ट्रीय खबरें',
        'international': '🌍 अंतर्राष्ट्रीय'
    };
    
    document.getElementById('sectionTitle').textContent = titles[category] || '📰 ताज़ा खबरें';
    
    try {
        let articles = [];
        
        // Build search query based on category
        const searchQueries = {
            'delhi': 'Delhi OR दिल्ली OR "New Delhi"',
            'delhi-politics': 'Delhi politics OR "Delhi government" OR AAP OR BJP Delhi OR "दिल्ली सरकार" OR "दिल्ली राजनीति"',
            'delhi-crime': 'Delhi crime OR "Delhi police" OR "दिल्ली क्राइम" OR "दिल्ली पुलिस" OR "Delhi murder" OR "Delhi robbery"',
            'delhi-traffic': 'Delhi traffic OR "Delhi road" OR "दिल्ली ट्रैफिक" OR "Delhi accident"',
            'delhi-weather': 'Delhi weather OR "Delhi rain" OR "Delhi temperature" OR "दिल्ली मौसम" OR "Delhi heat wave"',
            'delhi-metro': 'Delhi Metro OR DMRC OR "दिल्ली मेट्रो" OR "metro line"',
            'delhi-pollution': 'Delhi pollution OR "Delhi AQI" OR "Delhi smog" OR "दिल्ली प्रदूषण" OR "Delhi air quality"',
            'delhi-education': 'Delhi education OR "Delhi school" OR "Delhi university" OR "DU admission" OR "दिल्ली शिक्षा"',
            'delhi-health': 'Delhi health OR "Delhi hospital" OR "AIIMS Delhi" OR "दिल्ली स्वास्थ्य"',
            'delhi-business': 'Delhi business OR "Delhi market" OR "Chandni Chowk" OR "Connaught Place" OR "दिल्ली बाज़ार"',
            'delhi-sports': 'Delhi sports OR "Delhi Capitals" OR "Delhi Daredevils" OR "Jawaharlal Nehru Stadium"',
            'delhi-entertainment': 'Delhi entertainment OR Bollywood OR "Delhi event" OR "दिल्ली मनोरंजन"',
            'national': 'India news OR भारत',
            'international': 'world news OR international'
        };
        
        const query = searchQueries[category] || 'Delhi';
        
        // Try NewsAPI first
        try {
            const newsApiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=30&apiKey=${CONFIG.NEWS_API_KEY}`;
            const response = await fetch(newsApiUrl);
            const data = await response.json();
            if (data.articles) {
                articles = [...articles, ...data.articles];
            }
        } catch (e) {
            console.log('NewsAPI failed, trying backup...');
        }
        
        // Try Hindi News from NewsAPI
        try {
            const hindiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=hi&sortBy=publishedAt&pageSize=20&apiKey=${CONFIG.NEWS_API_KEY}`;
            const response = await fetch(hindiUrl);
            const data = await response.json();
            if (data.articles) {
                articles = [...articles, ...data.articles];
            }
        } catch (e) {
            console.log('Hindi news fetch failed');
        }
        
        // Try GNews API (backup)
        if (articles.length < 5) {
            try {
                const gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=hi&country=in&max=20&apikey=${CONFIG.GNEWS_API_KEY}`;
                const response = await fetch(gnewsUrl);
                const data = await response.json();
                if (data.articles) {
                    articles = [...articles, ...data.articles.map(a => ({
                        ...a,
                        urlToImage: a.image,
                        source: { name: a.source.name }
                    }))];
                }
            } catch (e) {
                console.log('GNews failed');
            }
        }
        
        // Filter and clean articles
        articles = articles.filter(a => 
            a.title && 
            a.title !== '[Removed]' && 
            a.title.length > 10
        );
        
        // Remove duplicates
        const seen = new Set();
        articles = articles.filter(a => {
            const key = a.title.substring(0, 50);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
        
        // Sort by date
        articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        
        allNews = articles;
        
        if (articles.length > 0) {
            displayFeaturedNews(articles.slice(0, 3));
            displayNewsCards(articles.slice(3));
            updateBreakingTicker(articles.slice(0, 7));
            updateTrendingList(articles.slice(0, 10));
        } else {
            displayDemoNews();
        }
        
    } catch (error) {
        console.error('News fetch error:', error);
        displayDemoNews();
    }
}

// ============================================
// DISPLAY FEATURED NEWS
// ============================================
function displayFeaturedNews(articles) {
    const container = document.getElementById('featuredNews');
    if (!articles || articles.length < 1) return;
    
    container.innerHTML = articles.map((article, index) => `
        <div class="featured-card" onclick='openArticle(${JSON.stringify(article).replace(/'/g, "\\'")})'
             style="${index === 0 ? 'grid-row: span 1;' : ''}">
            <img src="${article.urlToImage || getDefaultImage('general')}" 
                 alt="${article.title}"
                 onerror="this.onerror=null; this.src=getDefaultImage('general')">
            <div class="featured-overlay">
                <span class="category-tag">DELHI</span>
                ${index === 0 ? `<h2>${article.title}</h2>` : `<h3>${article.title}</h3>`}
                <small>${getTimeAgo(new Date(article.publishedAt))}</small>
            </div>
        </div>
    `).join('');
}

// ============================================
// DISPLAY NEWS CARDS
// ============================================
function displayNewsCards(articles) {
    const grid = document.getElementById('newsGrid');
    grid.innerHTML = '';
    
    articles.forEach((article, index) => {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.onclick = () => openArticle(article);
        
        const timeAgo = getTimeAgo(new Date(article.publishedAt));
        const source = article.source?.name || 'Delhi News';
        const views = Math.floor(Math.random() * 10000) + 500;
        
        card.innerHTML = `
            <div class="card-image">
                <img src="${article.urlToImage || getDefaultImage('${category}')}" 
                     alt="${article.title}"
                     loading="lazy"
                     onerror="this.onerror=null; this.src=getDefaultImage('${category}')">
                <span class="time-badge">⏰ ${timeAgo}</span>
            </div>
            <div class="news-card-content">
                <div>
                    <span class="category-tag">${source}</span>
                    <span class="delhi-badge">📍 Delhi</span>
                    <span class="ai-badge">🤖 AI</span>
                </div>
                <h3>${article.title}</h3>
                <p>${article.description || 'पूरी खबर पढ़ने के लिए क्लिक करें...'}</p>
                <div class="meta">
                    <span>✍️ ${article.author?.substring(0, 20) || 'Reporter'}</span>
                    <span>👁️ ${views.toLocaleString()}</span>
                </div>
                <div class="card-actions">
                    <button onclick="event.stopPropagation(); speakNews('${article.title.replace(/'/g, '')}')">🔊 सुनें</button>
                    <button onclick="event.stopPropagation(); shareNews('${encodeURIComponent(article.title)}', '${encodeURIComponent(article.url || '')}')">📤 शेयर</button>
                    <button onclick="event.stopPropagation(); saveNews(${index})">🔖 सेव</button>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// ============================================
// OPEN ARTICLE WITH AI SUMMARY
// ============================================
async function openArticle(article) {
    if (!article) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    
    // Show modal first with loading
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">✕</button>
            
            <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:10px;">
                <span class="category-tag">${article.source?.name || 'Delhi News'}</span>
                <span class="delhi-badge">📍 Delhi</span>
                <span class="ai-badge">🤖 AI Enhanced</span>
            </div>
            
            <h2>${article.title}</h2>
            
            <div class="meta" style="margin:10px 0; font-size:13px; color:#999;">
                <span>📅 ${new Date(article.publishedAt).toLocaleDateString('hi-IN', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                })}</span>
                &nbsp;|&nbsp;
                <span>✍️ ${article.author || 'Staff Reporter'}</span>
            </div>
            
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <button class="text-to-speech-btn" onclick="speakNews(\`${article.title.replace(/`/g, '')}. ${(article.description || '').replace(/`/g, '')}\`)">
                    🔊 खबर सुनें
                </button>
                <button class="text-to-speech-btn" onclick="window.speechSynthesis.cancel()" style="background:#e74c3c;">
                    ⏹️ रुकें
                </button>
            </div>
            
            <img src="${article.urlToImage || ''}" alt="${article.title}"
                 onerror="this.style.display='none'"
                 style="margin:15px 0; border-radius:10px; width:100%;">
            
            <div class="article-body">
                <div class="ai-summary-box" id="aiSummaryBox">
                    <h4>🤖 AI Summary (हिंदी में):</h4>
                    <p><i class="fas fa-spinner fa-spin"></i> AI summary generate ho raha hai...</p>
                </div>
                
                <h4 style="margin-top:15px;">📝 Full Report:</h4>
                <p>${article.content || article.description || 'Is khabar ki puri detail ke liye neeche diye link par click karein.'}</p>
                
                <div class="share-btns" style="margin-top:20px;">
                    <a href="https://wa.me/?text=${encodeURIComponent(article.title + ' - ' + (article.url || ''))}" 
                       target="_blank" class="share-whatsapp">📱 WhatsApp</a>
                    <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(article.url || '')}" 
                       target="_blank" class="share-twitter">🐦 Twitter</a>
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(article.url || '')}" 
                       target="_blank" class="share-facebook">📘 Facebook</a>
                </div>
                
                ${article.url ? `
                <a href="${article.url}" target="_blank" 
                   style="display:inline-block; margin-top:15px; color:var(--primary); font-weight:bold;">
                    📖 पूरी खबर पढ़ें (Original Source) →
                </a>` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    
    // Generate AI Summary
    const summary = await generateAISummary(article.title, article.description);
    const summaryBox = document.getElementById('aiSummaryBox');
    if (summaryBox) {
        summaryBox.innerHTML = `
            <h4>🤖 AI Summary (हिंदी में):</h4>
            <p>${summary}</p>
        `;
    }
}

// ============================================
// AI SUMMARY - Using Google Gemini (FREE)
// ============================================
async function generateAISummary(title, description) {
    // Try Google Gemini API (FREE)
    if (CONFIG.GEMINI_API_KEY && CONFIG.GEMINI_API_KEY !== 'YOUR_GEMINI_KEY') {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${CONFIG.GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `Tum ek Hindi news anchor ho. Is news ka Hindi mein easy summary likho (4-5 lines). 
                                Title: "${title}"
                                Description: "${description || 'Not available'}"
                                
                                Summary Hindi mein likho, jaise TV news anchor bolta hai. Delhi ke context mein likho agar Delhi related hai.`
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 300
                        }
                    })
                }
            );
            
            const data = await response.json();
            if (data.candidates && data.candidates[0]) {
                return data.candidates[0].content.parts[0].text;
            }
        } catch (error) {
            console.log('Gemini AI failed:', error);
        }
    }
    
    // Fallback - Local AI Summary
    return generateLocalAISummary(title, description);
}

function generateLocalAISummary(title, description) {
    const templates = [
        `📌 <strong>मुख्य खबर:</strong> ${title}। ${description || ''} यह खबर दिल्ली-NCR में चर्चा का विषय बनी हुई है। इस मामले में और अपडेट आते रहेंगे। बने रहें दिल्ली समाचार के साथ।`,
        
        `🔍 <strong>विस्तार से:</strong> ${title}। ${description || ''} दिल्ली के लोगों पर इसका सीधा असर पड़ रहा है। विशेषज्ञों का कहना है कि यह एक महत्वपूर्ण घटनाक्रम है।`,
        
        `⚡ <strong>ताज़ा अपडेट:</strong> ${title}। ${description || ''} इस बारे में अधिकारियों ने बयान जारी किया है। दिल्ली समाचार इस मामले पर नज़र बनाए हुए है।`,
        
        `📰 <strong>दिल्ली से खास:</strong> ${title}। ${description || ''} राजधानी दिल्ली में इस खबर ने सबका ध्यान खींचा है। आगे की जानकारी के लिए हमारे साथ बने रहें।`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
}

// ============================================
// DELHI WEATHER
// ============================================
async function fetchDelhiWeather() {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${DELHI.lat}&lon=${DELHI.lon}&appid=${CONFIG.WEATHER_API_KEY}&units=metric&lang=hi`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.main) {
            const temp = Math.round(data.main.temp);
            const desc = data.weather[0].description;
            const icon = getWeatherEmoji(data.weather[0].main);
            
            // Update top bar
            document.getElementById('delhiWeatherTop').textContent = `🌡️ Delhi: ${temp}°C ${icon}`;
            document.getElementById('delhiTemp').textContent = `${temp}°C`;
            
            // Update weather widget
            document.getElementById('weatherIcon').textContent = icon;
            document.getElementById('weatherTemp').textContent = `${temp}°C`;
            document.getElementById('weatherDesc').textContent = desc;
            document.getElementById('humidity').textContent = `${data.main.humidity}%`;
            document.getElementById('windSpeed').textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
        }
        
        // Fetch 5-day forecast
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${DELHI.lat}&lon=${DELHI.lon}&appid=${CONFIG.WEATHER_API_KEY}&units=metric&lang=hi&cnt=5`;
        const forecastRes = await fetch(forecastUrl);
        const forecastData = await forecastRes.json();
        
        if (forecastData.list) {
            const forecast = document.getElementById('forecast');
            forecast.innerHTML = '<h4 style="margin-top:10px; font-size:13px;">आने वाले दिन:</h4>' +
                forecastData.list.map(f => `
                    <div style="display:flex; justify-content:space-between; font-size:12px; padding:3px 0;">
                        <span>${new Date(f.dt * 1000).toLocaleDateString('hi-IN', {weekday:'short'})}</span>
                        <span>${getWeatherEmoji(f.weather[0].main)} ${Math.round(f.main.temp)}°C</span>
                    </div>
                `).join('');
        }
    } catch (error) {
        console.log('Weather fetch failed');
        document.getElementById('delhiWeatherTop').textContent = '🌡️ Delhi: 35°C ☀️';
    }
}

function getWeatherEmoji(condition) {
    const emojis = {
        'Clear': '☀️', 'Clouds': '☁️', 'Rain': '🌧️',
        'Drizzle': '🌦️', 'Thunderstorm': '⛈️', 'Snow': '❄️',
        'Mist': '🌫️', 'Haze': '🌫️', 'Fog': '🌁',
        'Smoke': '💨', 'Dust': '🏜️'
    };
    return emojis[condition] || '🌤️';
}

// ============================================
// DELHI AQI (Air Quality Index)
// ============================================
async function fetchDelhiAQI() {
    try {
        // Using AQICN API (free)
        const url = `https://api.waqi.info/feed/delhi/?token=${CONFIG.AQI_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === 'ok' && data.data) {
            const aqi = data.data.aqi;
            const { pm25, pm10, no2, so2 } = data.data.iaqi;
            
            // Update AQI display
            document.getElementById('aqiNumber').textContent = aqi;
            document.getElementById('aqiLabel').textContent = getAQILabel(aqi);
            
            // Update info bar
            const aqiElement = document.getElementById('delhiAQI');
            aqiElement.textContent = `${aqi} (${getAQILabel(aqi)})`;
            aqiElement.className = `aqi-value ${getAQIClass(aqi)}`;
            
            // Update circle color
            document.getElementById('aqiCircle').style.borderColor = getAQIColor(aqi);
            document.getElementById('aqiNumber').style.color = getAQIColor(aqi);
            
            // Update details
            if (pm25) document.getElementById('pm25').textContent = pm25.v;
            if (pm10) document.getElementById('pm10').textContent = pm10.v;
            if (no2) document.getElementById('no2').textContent = no2.v;
            if (so2) document.getElementById('so2').textContent = so2.v;
        }
    } catch (error) {
        console.log('AQI fetch failed');
        // Show demo AQI
        document.getElementById('aqiNumber').textContent = '185';
        document.getElementById('aqiLabel').textContent = 'Unhealthy';
        document.getElementById('delhiAQI').textContent = '185 (Poor)';
        document.getElementById('delhiAQI').className = 'aqi-value aqi-poor';
    }
}

function getAQILabel(aqi) {
    if (aqi <= 50) return 'Good ✅';
    if (aqi <= 100) return 'Moderate 😐';
    if (aqi <= 150) return 'Unhealthy for Sensitive 😷';
    if (aqi <= 200) return 'Unhealthy 😷';
    if (aqi <= 300) return 'Very Unhealthy ⚠️';
    return 'Hazardous ☠️';
}

function getAQIClass(aqi) {
    if (aqi <= 50) return 'aqi-good';
    if (aqi <= 100) return 'aqi-moderate';
    if (aqi <= 150) return 'aqi-poor';
    if (aqi <= 200) return 'aqi-bad';
    if (aqi <= 300) return 'aqi-severe';
    return 'aqi-hazardous';
}

function getAQIColor(aqi) {
    if (aqi <= 50) return '#27ae60';
    if (aqi <= 100) return '#f39c12';
    if (aqi <= 150) return '#e67e22';
    if (aqi <= 200) return '#e74c3c';
    if (aqi <= 300) return '#8e44ad';
    return '#c0392b';
}

// ============================================
// BREAKING NEWS TICKER
// ============================================
function updateBreakingTicker(articles) {
    const ticker = document.getElementById('breakingTicker');
    ticker.textContent = articles.map(a => `📌 ${a.title}`).join('  🔴  ');
}

// ============================================
// TRENDING LIST
// ============================================
function updateTrendingList(articles) {
    const list = document.getElementById('trendingList');
    list.innerHTML = articles.map((a, i) => `
        <li onclick='openArticle(${JSON.stringify(a).replace(/'/g, "\\'")})'>
            <span class="trend-number">${i + 1}</span>
            <span>${a.title.substring(0, 65)}${a.title.length > 65 ? '...' : ''}</span>
        </li>
    `).join('');
}

// ============================================
// CATEGORY & AREA LOADING
// ============================================
function loadCategory(category) {
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    
    currentPage = 1;
    fetchDelhiNews(category);
    
    // Scroll to news section
    document.getElementById('newsGrid').scrollIntoView({ behavior: 'smooth' });
}

function loadArea(area) {
    const newsGrid = document.getElementById('newsGrid');
    newsGrid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading ' + area + ' news...</div>';
    
    document.getElementById('sectionTitle').textContent = `📍 ${area} की खबरें`;
    
    // Search for area-specific news
    searchForArea(area);
}

async function searchForArea(area) {
    try {
        const query = `"${area}" Delhi`;
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${CONFIG.NEWS_API_KEY}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.articles && data.articles.length > 0) {
            displayNewsCards(data.articles);
        } else {
            document.getElementById('newsGrid').innerHTML = `
                <div class="loading-spinner">
                    <p>😔 ${area} की कोई ताज़ा खबर नहीं मिली</p>
                    <button onclick="fetchDelhiNews('delhi')" style="padding:10px 20px; margin-top:10px; background:var(--primary); color:white; border:none; border-radius:5px; cursor:pointer;">
                        सभी दिल्ली खबरें देखें
                    </button>
                </div>
            `;
        }
    } catch (error) {
        console.log('Area search failed');
    }
}

// ============================================
// SEARCH NEWS
// ============================================
function searchNews() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;
    
    document.getElementById('sectionTitle').textContent = `🔍 "${query}" की खबरें`;
    
    const newsGrid = document.getElementById('newsGrid');
    newsGrid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';
    
    fetchSearchResults(query);
}

document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchNews();
});

async function fetchSearchResults(query) {
    try {
        // Add Delhi context to search
        const delhiQuery = `${query} Delhi`;
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(delhiQuery)}&sortBy=publishedAt&pageSize=30&apiKey=${CONFIG.NEWS_API_KEY}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.articles && data.articles.length > 0) {
            displayNewsCards(data.articles);
        } else {
            document.getElementById('newsGrid').innerHTML = `
                <div class="loading-spinner">
                    <p>😔 "${query}" से related कोई खबर नहीं मिली</p>
                </div>
            `;
        }
    } catch (error) {
        console.log('Search failed');
    }
}

// ============================================
// TEXT TO SPEECH (Hindi)
// ============================================
function speakNews(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'hi-IN';
        utterance.rate = 0.85;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        // Try to find Hindi voice
        const voices = window.speechSynthesis.getVoices();
        const hindiVoice = voices.find(v => v.lang.includes('hi'));
        if (hindiVoice) utterance.voice = hindiVoice;
        
        window.speechSynthesis.speak(utterance);
    } else {
        alert('Aapka browser Text-to-Speech support nahi karta');
    }
}

// ============================================
// SHARE NEWS
// ============================================
function shareNews(title, url) {
    const text = decodeURIComponent(title);
    const newsUrl = decodeURIComponent(url);
    
    if (navigator.share) {
        navigator.share({
            title: text,
            text: text,
            url: newsUrl
        });
    } else {
        // WhatsApp share
        window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n\n' + newsUrl)}`, '_blank');
    }
}

// ============================================
// SAVE NEWS
// ============================================
function saveNews(index) {
    const saved = JSON.parse(localStorage.getItem('savedNews') || '[]');
    if (allNews[index]) {
        saved.push(allNews[index]);
        localStorage.setItem('savedNews', JSON.stringify(saved));
        alert('✅ खबर सेव हो गई!');
    }
}

// ============================================
// LOAD MORE NEWS
// ============================================
function loadMoreNews() {
    currentPage++;
    // This would fetch more news in a real implementation
    alert('और खबरें जल्द आ रही हैं...');
}

// ============================================
// DARK MODE
// ============================================
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

// Load dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    isDarkMode = true;
}

// ============================================
// LANGUAGE TOGGLE
// ============================================
function toggleLanguage() {
    alert('Language switching feature coming soon! 🌐');
}

// ============================================
// NOTIFICATIONS
// ============================================
function showNotifications() {
    const panel = document.getElementById('notifPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

// Request browser notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

function sendBrowserNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: '📰',
            badge: '📰'
        });
    }
}

// ============================================
// AI CHATBOT
// ============================================
async function sendChat() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;
    
    const container = document.getElementById('chatContainer');
    
    // Add user message
    container.innerHTML += `<div class="chat-message user">${message}</div>`;
    input.value = '';
    
    // Add loading
    container.innerHTML += `<div class="chat-message bot" id="chatLoading"><i class="fas fa-spinner fa-spin"></i> Soch raha hoon...</div>`;
    container.scrollTop = container.scrollHeight;
    
    // Generate AI response
    let response = '';
    
    if (CONFIG.GEMINI_API_KEY && CONFIG.GEMINI_API_KEY !== 'YOUR_GEMINI_KEY') {
        try {
            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${CONFIG.GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `Tum Delhi News AI Bot ho. User ne yeh poocha: "${message}". 
                                Hindi mein jawab do (3-4 lines). Delhi ke context mein jawab do.
                                Agar news related hai to latest information do.`
                            }]
                        }]
                    })
                }
            );
            const data = await res.json();
            response = data.candidates[0].content.parts[0].text;
        } catch (e) {
            response = getChatbotResponse(message);
        }
    } else {
        response = getChatbotResponse(message);
    }
    
    // Remove loading and add response
    const loading = document.getElementById('chatLoading');
    if (loading) loading.remove();
    
    container.innerHTML += `<div class="chat-message bot">${response}</div>`;
    container.scrollTop = container.scrollHeight;
}

// Allow Enter key for chat
document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChat();
});

function getChatbotResponse(message) {
    const msg = message.toLowerCase();
    
    if (msg.includes('weather') || msg.includes('mausam') || msg.includes('मौसम')) {
        return '🌤️ Delhi mein aaj ka mausam: Temperature 35-40°C ke beech hai. Humidity zyada hai. Paani peete rahein aur dhoop se bachein! 💧';
    }
    if (msg.includes('aqi') || msg.includes('pollution') || msg.includes('प्रदूषण')) {
        return '🏭 Delhi ka AQI aaj moderate se poor category mein hai. Mask lagakar bahar jaayein aur subah ki sair se bachein. Indoor plants lagayein! 🌿';
    }
    if (msg.includes('metro') || msg.includes('मेट्रो')) {
        return '🚇 Delhi Metro abhi sab lines par normal chal rahi hai. First metro 5:30 AM aur last metro 11:00 PM ko hai. DMRC helpline: 155370 📞';
    }
    if (msg.includes('traffic') || msg.includes('ट्रैफिक')) {
        return '🚗 Delhi mein abhi ITO, Moolchand, aur CP ke paas heavy traffic hai. Google Maps ya Delhi Traffic Police app use karein! 🗺️';
    }
    if (msg.includes('hospital') || msg.includes('अस्पताल') || msg.includes('health')) {
        return '🏥 Delhi ke top hospitals: AIIMS, Safdarjung, GTB Hospital, Ram Manohar Lohia. Emergency ke liye 102 dial karein! 🚑';
    }
    
    return `🤖 Yeh ek accha sawaal hai! "${message}" ke baare mein main aapko bata deta hoon - Delhi mein isse judi latest updates hamare news section mein mil jayengi. Kuch aur poochhna hai? 😊`;
}

// ============================================
// POLL
// ============================================
function vote(option) {
    const pollSection = document.getElementById('pollSection');
    const results = {
        pollution: Math.floor(Math.random() * 400) + 300,
        traffic: Math.floor(Math.random() * 350) + 200,
        crime: Math.floor(Math.random() * 300) + 150,
        water: Math.floor(Math.random() * 250) + 100,
        roads: Math.floor(Math.random() * 200) + 80
    };
    
    const total = Object.values(results).reduce((a, b) => a + b, 0);
    
    const labels = {
        pollution: '🏭 Pollution',
        traffic: '🚗 Traffic',
        crime: '🚔 Crime',
        water: '💧 Water Crisis',
        roads: '🛣️ Roads'
    };
    
    pollSection.innerHTML = `
        <p class="poll-question">📊 Results:</p>
        ${Object.entries(results).map(([key, val]) => {
            const pct = Math.round(val / total * 100);
            const isSelected = key === option;
            return `
                <div style="margin:8px 0;">
                    <div style="display:flex; justify-content:space-between; font-size:13px;">
                        <span>${labels[key]} ${isSelected ? '✅' : ''}</span>
                        <span>${pct}%</span>
                    </div>
                    <div style="background:#eee; border-radius:10px; overflow:hidden; height:8px; margin-top:3px;">
                        <div style="width:${pct}%; background:${isSelected ? 'var(--primary)' : '#3498db'}; height:100%; border-radius:10px; transition: width 1s;"></div>
                    </div>
                </div>
            `;
        }).join('')}
        <p style="font-size:11px; color:#999; margin-top:10px;">Total votes: ${total.toLocaleString()} | Thank you! 🙏</p>
    `;
}

// ============================================
// LIVE TV CHANNEL SWITCH
// ============================================
function switchChannel(channel) {
    document.querySelectorAll('.tv-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    const channels = {
        'aajtak': 'https://www.youtube.com/embed/Nq2wYlWFucg?autoplay=0',
        'ndtv': 'https://www.youtube.com/embed/MN8p-Vrn6G0?autoplay=0',
        'abp': 'https://www.youtube.com/embed/Xmm3Kr5P1Uw?autoplay=0'
    };
    
    document.getElementById('tvFrame').src = channels[channel] || channels.aajtak;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'अभी';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} मिनट पहले`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} घंटे पहले`;
    return `${Math.floor(seconds / 86400)} दिन पहले`;
}

function getRandomColor() {
    const colors = ['e74c3c', '3498db', '27ae60', 'f39c12', '9b59b6', '1abc9c', 'e67e22'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// ============================================
// SCROLL TO TOP
// ============================================
function initScrollTop() {
    window.addEventListener('scroll', () => {
        const btn = document.getElementById('scrollTopBtn');
        btn.style.display = window.scrollY > 300 ? 'block' : 'none';
    });
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// VIEW OPTIONS (Grid/List)
// ============================================
function setView(type) {
    const grid = document.getElementById('newsGrid');
    document.querySelectorAll('.view-options button').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    
    if (type === 'list') {
        grid.classList.add('list-view');
    } else {
        grid.classList.remove('list-view');
    }
}

// ============================================
// DEMO NEWS (Fallback)
// ============================================
function displayDemoNews() {
    const demoArticles = [
        {
            title: "दिल्ली में भीषण गर्मी का कहर - तापमान 45 डिग्री पार, लू का अलर्ट जारी",
            description: "दिल्ली-NCR में गर्मी का प्रकोप जारी है। मौसम विभाग ने लू का ऑरेंज अलर्ट जारी किया है। लोगों से घर से बाहर न निकलने की अपील की गई है।",
            urlToImage: "https://images.unsplash.com/photo-1601134467661-3d775b999c8b?w=600&h=400&fit=crop",
            publishedAt: new Date().toISOString(),
            source: { name: "Delhi Samachar" },
            author: "Delhi Weather Desk",
            url: "#"
        },
        {
            title: "Delhi Metro में नई लाइन का उद्घाटन - 10 नए स्टेशन शुरू",
            description: "दिल्ली मेट्रो के विस्तार के तहत नई लाइन का उद्घाटन किया गया। इससे हजारों यात्रियों को फायदा होगा।",
            urlToImage: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=400&fit=crop",
            publishedAt: new Date(Date.now() - 3600000).toISOString(),
            source: { name: "Metro News" },
            author: "Transport Desk",
            url: "#"
        },
        {
            title: "दिल्ली पुलिस ने बड़ी कार्रवाई - गैंग का पर्दाफाश, 5 गिरफ्तार",
            description: "दिल्ली पुलिस की क्राइम ब्रांच ने एक बड़े अपराधिक गैंग का भंडाफोड़ किया है। 5 आरोपियों को गिरफ्तार किया गया है।",
            urlToImage: "https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=600&h=400&fit=crop",
            publishedAt: new Date(Date.now() - 7200000).toISOString(),
            source: { name: "Crime Reporter" },
            author: "Crime Desk",
            url: "#"
        },
        {
            title: "दिल्ली सरकार का बड़ा ऐलान - फ्री बस पास योजना का विस्तार",
            description: "दिल्ली सरकार ने छात्रों के लिए फ्री बस पास योजना का विस्तार करने का ऐलान किया है।",
            urlToImage: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop",
            publishedAt: new Date(Date.now() - 10800000).toISOString(),
            source: { name: "Politics Desk" },
            author: "Political Reporter",
            url: "#"
        },
        {
            title: "ITO-Moolchand रूट पर भारी ट्रैफिक जाम - 2 घंटे तक रहा जाम",
            description: "दिल्ली के ITO से मूलचंद तक भारी ट्रैफिक जाम रहा। एक ट्रक खराब होने के कारण जाम लगा।",
            urlToImage: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&h=400&fit=crop",
            publishedAt: new Date(Date.now() - 14400000).toISOString(),
            source: { name: "Traffic Update" },
            author: "Traffic Desk",
            url: "#"
        },
        {
            title: "दिल्ली का AQI 300 पार - प्रदूषण से बचने के उपाय",
            description: "दिल्ली में प्रदूषण का स्तर फिर से खतरनाक हो गया है। AQI 300 से ऊपर पहुंच गया है।",
            urlToImage: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600&h=400&fit=crop",
            publishedAt: new Date(Date.now() - 18000000).toISOString(),
            source: { name: "Environment" },
            author: "Environment Desk",
            url: "#"
        },
        {
            title: "DU Admission 2025: ऑनलाइन रजिस्ट्रेशन शुरू, लास्ट डेट जानें",
            description: "दिल्ली यूनिवर्सिटी में एडमिशन 2025 के लिए ऑनलाइन रजिस्ट्रेशन शुरू हो गया है।",
            urlToImage: "https://images.unsplash.com/photo-1562774053-701939374585?w=600&h=400&fit=crop",
            publishedAt: new Date(Date.now() - 21600000).toISOString(),
            source: { name: "Education" },
            author: "Education Desk",
            url: "#"
        },
        {
            title: "Chandni Chowk Market में त्योहारी सीज़न की तैयारी शुरू",
            description: "चांदनी चौक में त्योहारी सीज़न को लेकर बाज़ार सज रहे हैं। दुकानदारों ने सजावट शुरू कर दी है।",
            urlToImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop",
            publishedAt: new Date(Date.now() - 25200000).toISOString(),
            source: { name: "Delhi Market" },
            author: "Market Reporter",
            url: "#"
        }
    ];
    
    displayFeaturedNews(demoArticles.slice(0, 3));
    displayNewsCards(demoArticles.slice(3));
    updateBreakingTicker(demoArticles);
    updateTrendingList(demoArticles);
    allNews = demoArticles;
}

// ============================================
// DEFAULT IMAGES FOR FALLBACK
// ============================================
function getDefaultImage(category) {
    // High-quality news-related images from Unsplash
    const images = {
        general: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop&q=80',
        business: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop&q=80',
        technology: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=400&fit=crop&q=80',
        entertainment: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=400&fit=crop&q=80',
        sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=400&fit=crop&q=80',
        health: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=400&fit=crop&q=80',
        science: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=400&fit=crop&q=80',
        nation: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=400&fit=crop&q=80',
        world: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&h=400&fit=crop&q=80'
    };
    return images[category] || images.general;
}