// API Configuration for all news and data sources
const API_CONFIG = {
    // News APIs
    newsapi: {
        key: 'b8e4f71582e84cc4aabe2bcedf4ddae0',
        baseUrl: 'https://newsapi.org/v2',
        endpoints: {
            topHeadlines: '/top-headlines',
            everything: '/everything'
        }
    },
    guardian: {
        key: 'cdf637a3-2c61-4cd5-8309-3bbef7e7a213',
        baseUrl: 'https://content.guardianapis.com',
        endpoints: {
            search: '/search'
        }
    },
    gnews: {
        key: 'f4d85cbf89d6a6c0ec5a3b0a38c4c4f5',
        baseUrl: 'https://gnews.io/api/v4',
        endpoints: {
            topHeadlines: '/top-headlines',
            search: '/search'
        }
    },
    // Weather API
    weather: {
        key: '6bfdbfedfa1248af87d103633261702',
        baseUrl: 'https://api.weatherapi.com/v1',
        endpoints: {
            current: '/current.json',
            forecast: '/forecast.json'
        }
    },
    // Financial Data API
    finhub: {
        key: 'd6a4abhr01qsjlb9mcqgd6a4abhr01qsjlb9mcr0',
        baseUrl: 'https://finnhub.io/api/v1',
        endpoints: {
            news: '/news',
            quote: '/quote'
        }
    },
    // Current News API
    current: {
        key: '8XoGQsudFB3eO0ikZHracYcxX7alnzYsl3zhFz_n5z2IBuMS',
        baseUrl: 'https://api.currentsapi.services/v1',
        endpoints: {
            latest: '/latest-news',
            search: '/search'
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
