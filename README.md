# 🚀 Drive News India

> India's Most Trusted AI-Powered News Platform | Est. 2026

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](http://localhost:3000)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org)

**Drive News India** is a cutting-edge, AI-powered news aggregation platform that delivers real-time news with advanced artificial intelligence analysis. Built with modern web technologies, it provides comprehensive news coverage across 12+ categories with intelligent content processing.

---

## ✨ Key Features

### 🤖 AI-Powered Analysis
- **18 AI Features** per article including:
  - Sentiment Analysis with confidence scores
  - Credibility Scoring (0-100 scale)
  - Bias Detection (political, loaded language)
  - Fact-Check Indicators
  - Named Entity Recognition
  - Impact Analysis (social, economic, environmental)
  - Readability Scoring
  - Smart Summarization (3 levels)
  - And 10+ more...

### 📰 Comprehensive News Coverage
- **12 News Categories**: Front Page, Nation, Delhi/NCR, World, Business, Editorial, Sports, Entertainment, Real Estate, Travel, Obituaries, Home & Culture
- **Real-time Updates** from multiple news sources
- **Breaking News Ticker** with live headlines
- **Featured Stories** in hero section

### 🌐 Live Data Integration
- **Weather Widget** - Live New Delhi weather with 5-day forecast
- **Stock Market** - Real-time market data
- **Trending Topics** - AI-detected trending stories

### 🎨 Modern UI/UX
- Clean, professional newspaper-style design
- Responsive layout (desktop, tablet, mobile)
- Dark theme optimized for reading
- Smooth animations and transitions
- Hindi & English bilingual support

---

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Axios** - HTTP client
- **RSS Parser** - Feed processing
- **Cheerio** - Web scraping

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with custom properties
- **Vanilla JavaScript** - No framework dependencies
- **Modern ES6+** - Async/await, modules

### APIs
- **NewsData.io** - Primary news source
- **NewsAPI.ai** - Secondary news source
- **WeatherAPI.com** - Weather data
- **Google News RSS** - Free news feeds

### AI/ML
- Custom **AI News Processor**
- Natural Language Processing (NLP)
- Sentiment analysis algorithms
- Entity recognition patterns
- Bias detection rules

---

## 🚀 Quick Start

### Prerequisites
```bash
node >= 14.0.0
npm >= 6.0.0
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/drive-news-india.git
cd drive-news-india
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure API Keys**

Edit `server.js` and update the API keys:
```javascript
const API_KEYS = {
    newsdata: 'YOUR_NEWSDATA_IO_KEY',
    newsapiai: 'YOUR_NEWSAPI_AI_KEY',
    weather: 'YOUR_WEATHERAPI_KEY'
};
```

4. **Start the server**
```bash
node server.js
```

5. **Open in browser**
```
http://localhost:3000
```

---

## 📡 API Configuration

### NewsData.io (Primary)
- **Endpoint**: `https://newsdata.io/api/1/news`
- **Features**: Real article images, 200 req/day free
- **Get Key**: [newsdata.io](https://newsdata.io)

### NewsAPI.ai (Secondary)
- **Endpoint**: `https://eventregistry.org/api/v1`
- **Features**: Advanced news analysis
- **Get Key**: [newsapi.ai](https://newsapi.ai)

### WeatherAPI.com
- **Endpoint**: `https://api.weatherapi.com/v1`
- **Features**: Live weather data
- **Get Key**: [weatherapi.com](https://www.weatherapi.com)

---

## 🎯 Features in Detail

### AI Analysis Features
1. **Sentiment Analysis** - Positive/Negative/Neutral with %
2. **Credibility Scoring** - Source trustworthiness (0-100)
3. **Bias Detection** - Political lean, loaded language
4. **Fact-Check Flags** - Claims requiring verification
5. **Named Entities** - People, places, organizations
6. **Impact Assessment** - Social, economic, environmental
7. **Readability Score** - Grade level, complexity
8. **Smart Summarization** - One-line, standard, detailed
9. **Source Metrics** - Reputation, reliability
10. **Trend Detection** - Hot topics across articles

### News Categories
- **Front Page** - Top stories
- **Nation** - National news
- **Delhi/NCR** - Local news
- **World** - International
- **Business** - Finance & economy
- **Editorial** - Opinion pieces
- **Sports** - All sports coverage
- **Entertainment** - Movies, TV, music
- **Real Estate** - Property news
- **Travel** - Travel stories
- **Obituaries** - Curated
- **Home & Culture** - Lifestyle

---

## 📂 Project Structure

```
livenews/
├── server.js                 # Express server
├── package.json              # Dependencies
├── README.md                 # This file
├── backend/
│   └── ai-news-processor.js  # AI processing engine
└── frontend/
    ├── index.html            # Main HTML
    ├── css/
    │   ├── styles.css
    │   ├── news-style.css
    │   ├── control-panel.css
    │   └── ai-enhancements.css
    └── js/
        ├── script.js
        ├── api-config.js
        ├── ai-news-display.js
        ├── user-preferences.js
        └── news-fetcher.js
```

---

## 🌐 Deployment

### Deploy to Render.com (Recommended)

1. Push to GitHub
2. Connect Render to your repo
3. Set environment variables
4. Deploy!

### Deploy to Heroku

```bash
heroku create drive-news-india
git push heroku main
heroku open
```

### Deploy to Vercel

```bash
vercel
```

---

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Check API endpoints:
```bash
# News API
curl http://localhost:3000/api/news/general

# Weather API
curl http://localhost:3000/api/weather
```

---

## 🐛 Troubleshooting

### Common Issues

**Images not loading?**
- Clear browser cache (Ctrl + Shift + R)
- Check API keys are valid
- Verify NewsData.io quota

**Weather not updating?**
- Check WeatherAPI.com key
- Verify endpoint in code
- Check browser console for errors

**AI features not showing?**
- Hard refresh browser
- Check if `aiProcessed: true` in API response
- Verify AI processor is initialized

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Nilesh Kumar Burman**

- GitHub: [@nileshkumarburman1993](https://github.com/nileshkumarburman1993-web)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- NewsData.io for news API
- WeatherAPI.com for weather data
- Unsplash for fallback images
- Google News for RSS feeds

---

## 📊 Stats

- **18 AI Features** per article
- **12 News Categories**
- **200+ Articles/day** (free tier)
- **Real-time Updates**
- **100% Free APIs** available

---

## 🎯 Roadmap

- [ ] User authentication
- [ ] Personalized news feed
- [ ] Save favorite articles
- [ ] Email newsletter
- [ ] Mobile app (React Native)
- [ ] PWA support
- [ ] Dark/Light theme toggle
- [ ] Multi-language support

---

## 📞 Support

For support, email your.email@example.com or create an issue on GitHub.

---

<div align="center">

**⭐ Star this repo if you found it helpful!**

Made with ❤️ in India 🇮🇳

</div>

