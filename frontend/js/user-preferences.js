// ============================================
// User Preferences & Personalization System
// ============================================

class UserPreferences {
    constructor() {
        this.preferences = this.loadPreferences();
        this.readingHistory = this.loadReadingHistory();
        this.savedArticles = this.loadSavedArticles();
        this.userProfile = this.buildUserProfile();
    }

    // ============================================
    // LOAD/SAVE PREFERENCES
    // ============================================
    loadPreferences() {
        const defaults = {
            categories: {
                politics: true,
                economy: true,
                technology: true,
                health: true,
                environment: true,
                crime: true,
                sports: true,
                education: true
            },
            sentimentFilter: {
                positive: true,
                negative: true,
                neutral: true
            },
            minCredibilityScore: 50,
            hideHighBias: false,
            preferredSources: [],
            language: 'en',
            autoTranslate: false,
            readingMode: 'normal', // normal, detailed, brief
            notifications: {
                breaking: true,
                trending: true,
                personalized: true
            },
            accessibility: {
                fontSize: 'medium',
                highContrast: false,
                reducedMotion: false
            }
        };

        const saved = localStorage.getItem('userPreferences');
        return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    }

    savePreferences() {
        localStorage.setItem('userPreferences', JSON.stringify(this.preferences));
        this.userProfile = this.buildUserProfile();
    }

    loadReadingHistory() {
        const history = localStorage.getItem('readingHistory');
        return history ? JSON.parse(history) : [];
    }

    saveReadingHistory() {
        // Keep only last 100 articles
        const limited = this.readingHistory.slice(-100);
        localStorage.setItem('readingHistory', JSON.stringify(limited));
    }

    loadSavedArticles() {
        const saved = localStorage.getItem('savedArticles');
        return saved ? JSON.parse(saved) : [];
    }

    saveSavedArticles() {
        localStorage.setItem('savedArticles', JSON.stringify(this.savedArticles));
    }

    // ============================================
    // USER PROFILE BUILDING
    // ============================================
    buildUserProfile() {
        const profile = {
            interests: {},
            topCategories: [],
            topSources: [],
            avgReadingTime: 0,
            preferredSentiment: null,
            readingLevel: 'average',
            activityScore: 0
        };

        // Analyze reading history
        if (this.readingHistory.length > 0) {
            const categoryCounts = {};
            const sourceCounts = {};
            let totalReadTime = 0;
            const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };

            this.readingHistory.forEach(item => {
                // Categories
                if (item.category) {
                    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
                }

                // Sources
                if (item.source) {
                    sourceCounts[item.source] = (sourceCounts[item.source] || 0) + 1;
                }

                // Reading time
                if (item.readTime) {
                    totalReadTime += item.readTime;
                }

                // Sentiment
                if (item.sentiment) {
                    sentimentCounts[item.sentiment]++;
                }
            });

            // Top categories
            profile.topCategories = Object.entries(categoryCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([cat, count]) => ({ category: cat, count }));

            // Top sources
            profile.topSources = Object.entries(sourceCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([source, count]) => ({ source, count }));

            // Avg reading time
            profile.avgReadingTime = Math.round(totalReadTime / this.readingHistory.length);

            // Preferred sentiment
            const maxSentiment = Object.entries(sentimentCounts)
                .sort((a, b) => b[1] - a[1])[0];
            profile.preferredSentiment = maxSentiment ? maxSentiment[0] : null;

            // Activity score (0-100)
            profile.activityScore = Math.min(100, this.readingHistory.length * 2);

            // Build interest map
            profile.interests = categoryCounts;
        }

        return profile;
    }

    // ============================================
    // TRACK USER ACTIVITY
    // ============================================
    trackArticleView(article) {
        const entry = {
            id: article.id,
            title: article.title,
            category: article.category || article.aiCategories?.[0]?.category,
            source: article.source?.name || article.source,
            sentiment: article.sentiment?.type,
            timestamp: Date.now(),
            readTime: 0 // Will be updated when user leaves
        };

        this.readingHistory.push(entry);
        this.saveReadingHistory();
        this.userProfile = this.buildUserProfile();

        return entry;
    }

    updateReadTime(entryId, seconds) {
        const entry = this.readingHistory.find(e => e.id === entryId);
        if (entry) {
            entry.readTime = seconds;
            this.saveReadingHistory();
        }
    }

    saveArticle(article) {
        if (!this.savedArticles.find(a => a.id === article.id)) {
            this.savedArticles.push({
                ...article,
                savedAt: Date.now()
            });
            this.saveSavedArticles();
            return true;
        }
        return false;
    }

    unsaveArticle(articleId) {
        this.savedArticles = this.savedArticles.filter(a => a.id !== articleId);
        this.saveSavedArticles();
    }

    // ============================================
    // ARTICLE FILTERING & RANKING
    // ============================================
    filterArticles(articles) {
        return articles.filter(article => {
            // Category filter
            const articleCategory = article.category || article.aiCategories?.[0]?.category;
            if (articleCategory && !this.preferences.categories[articleCategory]) {
                return false;
            }

            // Sentiment filter
            if (article.sentiment && !this.preferences.sentimentFilter[article.sentiment.type]) {
                return false;
            }

            // Credibility filter
            if (article.credibilityScore < this.preferences.minCredibilityScore) {
                return false;
            }

            // Bias filter
            if (this.preferences.hideHighBias && 
                article.biasAnalysis?.level === 'high') {
                return false;
            }

            return true;
        });
    }

    rankArticles(articles) {
        // Personalized ranking based on user profile
        return articles.map(article => {
            let score = 0;

            // Category interest score
            const articleCategory = article.category || article.aiCategories?.[0]?.category;
            if (articleCategory && this.userProfile.interests[articleCategory]) {
                score += this.userProfile.interests[articleCategory] * 10;
            }

            // Source preference score
            const articleSource = article.source?.name || article.source;
            const preferredSource = this.userProfile.topSources.find(s => s.source === articleSource);
            if (preferredSource) {
                score += preferredSource.count * 5;
            }

            // Sentiment preference
            if (article.sentiment?.type === this.userProfile.preferredSentiment) {
                score += 20;
            }

            // Credibility bonus
            if (article.credibilityScore) {
                score += article.credibilityScore / 5;
            }

            // Recency bonus
            if (article.publishedAt) {
                const hoursOld = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
                if (hoursOld < 2) score += 30;
                else if (hoursOld < 6) score += 20;
                else if (hoursOld < 12) score += 10;
            }

            // Impact bonus
            if (article.impact?.level === 'high') {
                score += 25;
            }

            return { ...article, personalizedScore: score };
        }).sort((a, b) => b.personalizedScore - a.personalizedScore);
    }

    // ============================================
    // RECOMMENDATIONS
    // ============================================
    getRecommendations(articles, count = 5) {
        // Get articles similar to user's interests
        const ranked = this.rankArticles(articles);
        return ranked.slice(0, count);
    }

    getSimilarArticles(article, allArticles, count = 3) {
        // Find articles similar to the given article
        const similar = allArticles
            .filter(a => a.id !== article.id)
            .map(a => {
                let similarity = 0;

                // Category match
                if (a.category === article.category) similarity += 30;

                // Entity overlap
                if (article.entities && a.entities) {
                    const commonPeople = article.entities.people?.filter(p => 
                        a.entities.people?.includes(p)
                    ).length || 0;
                    similarity += commonPeople * 10;

                    const commonOrgs = article.entities.organizations?.filter(o => 
                        a.entities.organizations?.includes(o)
                    ).length || 0;
                    similarity += commonOrgs * 10;
                }

                // Sentiment match
                if (a.sentiment?.type === article.sentiment?.type) similarity += 10;

                return { ...a, similarity };
            })
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, count);

        return similar;
    }

    // ============================================
    // PERSONALIZATION INSIGHTS
    // ============================================
    getPersonalizationInsights() {
        const insights = [];

        if (this.userProfile.topCategories.length > 0) {
            insights.push({
                type: 'interests',
                icon: '📊',
                title: 'Your Top Interests',
                description: `You read mostly: ${this.userProfile.topCategories.map(c => c.category).join(', ')}`
            });
        }

        if (this.userProfile.preferredSentiment) {
            insights.push({
                type: 'sentiment',
                icon: this.userProfile.preferredSentiment === 'positive' ? '😊' : 
                      this.userProfile.preferredSentiment === 'negative' ? '😟' : '😐',
                title: 'Sentiment Preference',
                description: `You tend to read ${this.userProfile.preferredSentiment} news`
            });
        }

        if (this.userProfile.avgReadingTime > 0) {
            insights.push({
                type: 'reading_time',
                icon: '📖',
                title: 'Reading Behavior',
                description: `Average reading time: ${this.userProfile.avgReadingTime} seconds`
            });
        }

        if (this.savedArticles.length > 0) {
            insights.push({
                type: 'saved',
                icon: '🔖',
                title: 'Saved Articles',
                description: `You have ${this.savedArticles.length} saved articles`
            });
        }

        return insights;
    }

    // ============================================
    // PREFERENCE MANAGEMENT
    // ============================================
    updatePreference(key, value) {
        const keys = key.split('.');
        let obj = this.preferences;
        
        for (let i = 0; i < keys.length - 1; i++) {
            obj = obj[keys[i]];
        }
        
        obj[keys[keys.length - 1]] = value;
        this.savePreferences();
    }

    resetPreferences() {
        localStorage.removeItem('userPreferences');
        this.preferences = this.loadPreferences();
        this.userProfile = this.buildUserProfile();
    }

    exportData() {
        return {
            preferences: this.preferences,
            profile: this.userProfile,
            readingHistory: this.readingHistory,
            savedArticles: this.savedArticles,
            exportDate: new Date().toISOString()
        };
    }

    importData(data) {
        if (data.preferences) {
            this.preferences = data.preferences;
            this.savePreferences();
        }
        if (data.readingHistory) {
            this.readingHistory = data.readingHistory;
            this.saveReadingHistory();
        }
        if (data.savedArticles) {
            this.savedArticles = data.savedArticles;
            this.saveSavedArticles();
        }
        this.userProfile = this.buildUserProfile();
    }
}

// Create global instance
window.userPreferences = new UserPreferences();
