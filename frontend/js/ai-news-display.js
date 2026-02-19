// ============================================
// AI-Enhanced News Display Components
// ============================================

class AINewsDisplay {
    constructor() {
        this.currentArticles = [];
        this.trendingTopics = [];
    }

    // ============================================
    // RENDER AI-ENHANCED NEWS CARD
    // ============================================
    renderEnhancedNewsCard(article, index) {
        const card = document.createElement('div');
        card.className = 'news-card ai-enhanced';
        card.onclick = () => this.openEnhancedArticle(article);
        
        const timeAgo = this.getTimeAgo(new Date(article.publishedAt));
        const source = article.source?.name || 'News Source';
        
        // Sentiment badge
        const sentimentBadge = article.sentiment ? 
            `<span class="sentiment-badge sentiment-${article.sentiment.type}" title="Sentiment: ${article.sentiment.confidence}% confident">
                ${article.sentiment.emoji} ${article.sentiment.type}
            </span>` : '';

        // Credibility score
        const credibilityBadge = article.credibilityScore ?
            `<span class="credibility-badge" title="Credibility Score">
                ${this.getCredibilityIcon(article.credibilityScore)} ${article.credibilityScore}%
            </span>` : '';

        // Impact badge
        const impactBadge = article.impact && article.impact.level !== 'low' ?
            `<span class="impact-badge impact-${article.impact.level}">
                ⚡ ${article.impact.level} impact
            </span>` : '';

        // AI Categories
        const categoriesHTML = article.aiCategories ? 
            article.aiCategories.slice(0, 2).map(cat => 
                `<span class="ai-category-tag" title="${cat.confidence}% match">
                    ${this.getCategoryIcon(cat.category)} ${cat.category}
                </span>`
            ).join('') : '';

        card.innerHTML = `
            <div class="card-image">
                <img src="${article.urlToImage || this.getPlaceholderImage(source)}" 
                     alt="${article.title}"
                     loading="lazy"
                     onerror="this.src='https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop'">
                <span class="time-badge">⏰ ${timeAgo}</span>
                ${article.impact?.level === 'high' ? '<span class="breaking-badge">🔥 TRENDING</span>' : ''}
            </div>
            <div class="news-card-content">
                <div class="news-badges">
                    <span class="source-tag">${source}</span>
                    ${sentimentBadge}
                    ${credibilityBadge}
                    ${impactBadge}
                </div>
                
                <h3>${article.title}</h3>
                
                ${article.aiSummary?.keyPoints?.length > 0 ? 
                    `<div class="ai-key-points">
                        <strong>🤖 AI Insights:</strong>
                        <ul>
                            ${article.aiSummary.keyPoints.slice(0, 2).map(point => 
                                `<li>${point}</li>`
                            ).join('')}
                        </ul>
                    </div>` : 
                    `<p class="description">${article.description || 'Click to read more...'}</p>`
                }
                
                ${categoriesHTML ? `<div class="categories-row">${categoriesHTML}</div>` : ''}
                
                <div class="meta">
                    <span>✍️ ${article.author?.substring(0, 20) || 'Reporter'}</span>
                    ${article.aiSummary?.readingTime ? `<span>📖 ${article.aiSummary.readingTime} min read</span>` : ''}
                    ${article.entities?.people?.length > 0 ? `<span>👥 ${article.entities.people[0]}</span>` : ''}
                </div>
                
                <div class="card-actions">
                    <button onclick="event.stopPropagation(); this.closest('.ai-news-display').aiNewsDisplay.speakNews('${this.escapeQuotes(article.title)}')">
                        🔊 Listen
                    </button>
                    <button onclick="event.stopPropagation(); this.closest('.ai-news-display').aiNewsDisplay.shareNews('${encodeURIComponent(article.title)}', '${encodeURIComponent(article.url || '')}')">
                        📤 Share
                    </button>
                    <button onclick="event.stopPropagation(); this.closest('.ai-news-display').aiNewsDisplay.saveNews(${index})">
                        🔖 Save
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }

    // ============================================
    // OPEN ENHANCED ARTICLE MODAL
    // ============================================
    openEnhancedArticle(article) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay ai-modal';
        
        // Build key insights section
        const keyInsightsHTML = article.keyInsights?.length > 0 ? `
            <div class="ai-insights-section">
                <h4>🔍 Key Insights</h4>
                <div class="insights-grid">
                    ${article.keyInsights.map(insight => `
                        <div class="insight-item">
                            <span class="insight-icon">${insight.icon}</span>
                            <span class="insight-text">${insight.text}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        // Build AI summary section with enhanced features
        const aiSummaryHTML = article.aiSummary ? `
            <div class="ai-summary-section">
                <h4>🤖 AI-Generated Summary</h4>
                ${article.aiSummary.oneSentence ? `
                    <div class="one-sentence-summary" style="padding: 10px; background: white; border-radius: 8px; margin-bottom: 10px; border-left: 3px solid #667eea;">
                        <strong>In one sentence:</strong> ${article.aiSummary.oneSentence}
                    </div>
                ` : ''}
                ${article.aiSummary.keyPoints?.length > 0 ? `
                    <div class="summary-key-points">
                        ${article.aiSummary.keyPoints.map(point => `
                            <div class="summary-point">${point}</div>
                        `).join('')}
                    </div>
                ` : ''}
                <p class="summary-text"><strong>Summary:</strong> ${article.aiSummary.summary}</p>
                ${article.aiSummary.detailed && article.aiSummary.detailed !== article.aiSummary.summary ? `
                    <details style="margin-top: 10px;">
                        <summary style="cursor: pointer; color: #667eea; font-weight: 600;">Show Detailed Summary</summary>
                        <p class="summary-text" style="margin-top: 10px;">${article.aiSummary.detailed}</p>
                    </details>
                ` : ''}
                <div class="summary-meta">
                    <span>📖 Reading time: ${article.aiSummary.readingTime} min</span>
                    <span>📊 Complexity: ${article.aiSummary.complexity}</span>
                    ${article.aiSummary.wordCount ? `<span>📝 ${article.aiSummary.wordCount} words</span>` : ''}
                </div>
                ${article.aiSummary.mainTopics?.length > 0 ? `
                    <div class="main-topics" style="margin-top: 10px;">
                        <strong>Main Topics:</strong>
                        ${article.aiSummary.mainTopics.map(topic => `<span class="topic-tag">${topic}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        ` : '';

        // Build sentiment analysis section
        const sentimentHTML = article.sentiment ? `
            <div class="sentiment-analysis">
                <h4>😊 Sentiment Analysis</h4>
                <div class="sentiment-bar">
                    <div class="sentiment-indicator sentiment-${article.sentiment.type}" 
                         style="width: ${article.sentiment.confidence}%">
                        ${article.sentiment.emoji} ${article.sentiment.type} (${article.sentiment.confidence}% confident)
                    </div>
                </div>
                <div class="sentiment-scores">
                    <span class="positive-score">Positive: ${article.sentiment.positiveScore}</span>
                    <span class="negative-score">Negative: ${article.sentiment.negativeScore}</span>
                </div>
            </div>
        ` : '';

        // Build entities section
        const entitiesHTML = article.entities && (article.entities.people?.length > 0 || article.entities.places?.length > 0 || article.entities.organizations?.length > 0) ? `
            <div class="entities-section">
                <h4>🏷️ Key Entities</h4>
                ${article.entities.people?.length > 0 ? `
                    <div class="entity-group">
                        <strong>👥 People:</strong>
                        ${article.entities.people.map(p => `<span class="entity-tag">${p}</span>`).join('')}
                    </div>
                ` : ''}
                ${article.entities.places?.length > 0 ? `
                    <div class="entity-group">
                        <strong>📍 Places:</strong>
                        ${article.entities.places.map(p => `<span class="entity-tag">${p}</span>`).join('')}
                    </div>
                ` : ''}
                ${article.entities.organizations?.length > 0 ? `
                    <div class="entity-group">
                        <strong>🏢 Organizations:</strong>
                        ${article.entities.organizations.map(o => `<span class="entity-tag">${o}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        ` : '';

        // Build impact analysis section
        const impactHTML = article.impact && article.impact.level !== 'low' ? `
            <div class="impact-section impact-${article.impact.level}">
                <h4>⚡ Impact Analysis</h4>
                <div class="impact-meter">
                    <div class="impact-bar" style="width: ${(article.impact.score / 10) * 100}%"></div>
                </div>
                <p><strong>Level:</strong> ${article.impact.level.toUpperCase()}</p>
                <p><strong>Description:</strong> ${article.impact.description}</p>
                ${article.impact.areas?.length > 0 ? `
                    <p><strong>Affected Areas:</strong> ${article.impact.areas.join(', ')}</p>
                ` : ''}
            </div>
        ` : '';

        // Build context section
        const contextHTML = article.context?.length > 0 ? `
            <div class="context-section">
                <h4>📚 Background & Context</h4>
                ${article.context.map(ctx => `
                    <div class="context-item">
                        <span class="context-icon">${ctx.icon}</span>
                        <div>
                            <strong>${ctx.title}:</strong>
                            <p>${ctx.text}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : '';

        // Build related articles section
        const relatedHTML = article.relatedArticles?.length > 0 ? `
            <div class="related-articles-section">
                <h4>🔗 Related Stories</h4>
                ${article.relatedArticles.map(related => `
                    <div class="related-item">
                        <span class="similarity-badge">${related.similarity}% similar</span>
                        <p>${related.title}</p>
                    </div>
                `).join('')}
            </div>
        ` : '';

        // Build key facts section
        const factsHTML = article.keyFacts?.length > 0 ? `
            <div class="key-facts-section">
                <h4>📊 Key Facts & Figures</h4>
                <div class="facts-grid">
                    ${article.keyFacts.map(fact => `
                        <div class="fact-item">
                            <span class="fact-icon">${fact.icon}</span>
                            <span class="fact-value">${fact.value}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        modal.innerHTML = `
            <div class="modal-content ai-enhanced-modal">
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">✕</button>
                
                <div class="modal-header">
                    <div class="modal-badges">
                        <span class="source-tag">${article.source?.name || 'News'}</span>
                        ${article.sentiment ? `<span class="sentiment-badge sentiment-${article.sentiment.type}">${article.sentiment.emoji} ${article.sentiment.type}</span>` : ''}
                        ${article.credibilityScore ? `<span class="credibility-badge">${this.getCredibilityIcon(article.credibilityScore)} ${article.credibilityScore}%</span>` : ''}
                        <span class="ai-badge">🤖 AI Enhanced</span>
                    </div>
                    
                    <h2>${article.title}</h2>
                    
                    <div class="meta" style="margin:10px 0; font-size:13px; color:#999;">
                        <span>📅 ${new Date(article.publishedAt).toLocaleDateString('en-US', {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        })}</span>
                        ${article.author ? `&nbsp;|&nbsp;<span>✍️ ${article.author}</span>` : ''}
                    </div>
                    
                    <div class="modal-actions">
                        <button class="action-btn" onclick="this.closest('.modal-overlay').querySelector('.close-btn').click(); window.aiNewsDisplay?.speakNews('${this.escapeQuotes(article.title)}. ${this.escapeQuotes(article.description || '')}')">
                            🔊 Listen to Article
                        </button>
                        <button class="action-btn" onclick="window.speechSynthesis.cancel()" style="background:#e74c3c;">
                            ⏹️ Stop
                        </button>
                        <button class="action-btn" onclick="window.open('${article.url || '#'}', '_blank')">
                            📰 Read Original
                        </button>
                    </div>
                </div>
                
                ${article.urlToImage ? `
                    <img src="${article.urlToImage}" alt="${article.title}"
                         onerror="this.style.display='none'"
                         style="margin:15px 0; border-radius:10px; width:100%; max-height:400px; object-fit:cover;">
                ` : ''}
                
                <div class="ai-analysis-container">
                    ${keyInsightsHTML}
                    ${aiSummaryHTML}
                    ${sentimentHTML}
                    ${this.buildBiasSection(article)}
                    ${this.buildFactCheckSection(article)}
                    ${this.buildReadabilitySection(article)}
                    ${this.buildSourceSection(article)}
                    ${factsHTML}
                    ${impactHTML}
                    ${entitiesHTML}
                    ${contextHTML}
                    
                    <div class="article-body">
                        <h4>📝 Full Article</h4>
                        <p>${article.content || article.description || 'Click "Read Original" to see the full article.'}</p>
                    </div>
                    
                    ${relatedHTML}
                    
                    ${article.relatedTopics?.length > 0 ? `
                        <div class="related-topics">
                            <h4>🏷️ Related Topics</h4>
                            <div class="topic-tags">
                                ${article.relatedTopics.map(topic => `<span class="topic-tag">${topic}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // ============================================
    // DISPLAY TRENDING TOPICS
    // ============================================
    displayTrendingTopics(topics) {
        if (!topics || topics.length === 0) return;

        const container = document.getElementById('trendingTopics');
        if (!container) return;

        container.innerHTML = `
            <h3>🔥 Trending Topics</h3>
            <div class="trending-grid">
                ${topics.map(trend => `
                    <div class="trending-topic-card">
                        <div class="trend-count">${trend.count}</div>
                        <div class="trend-name">${trend.topic}</div>
                        <div class="trend-label">articles</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    getCategoryIcon(category) {
        const icons = {
            politics: '🏛️',
            economy: '💰',
            technology: '💻',
            health: '🏥',
            environment: '🌍',
            crime: '👮',
            sports: '⚽',
            education: '📚'
        };
        return icons[category] || '📰';
    }

    getCredibilityIcon(score) {
        if (score >= 80) return '✅';
        if (score >= 60) return '☑️';
        if (score >= 40) return '⚠️';
        return '❌';
    }

    getPlaceholderImage(source) {
        // Use Unsplash news-related images as fallback
        const newsImages = [
            'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop', // Newspaper
            'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&h=200&fit=crop', // News stand
            'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=400&h=200&fit=crop', // Breaking news
            'https://images.unsplash.com/photo-1523995462485-3d171b5c8fa9?w=400&h=200&fit=crop', // News room
            'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=200&fit=crop'  // News studio
        ];
        return newsImages[Math.floor(Math.random() * newsImages.length)];
    }

    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    }

    escapeQuotes(text) {
        if (!text) return '';
        return text.replace(/'/g, "\\'").replace(/"/g, '\\"');
    }

    // ============================================
    // BUILD ADVANCED SECTIONS
    // ============================================
    buildBiasSection(article) {
        if (!article.biasAnalysis) return '';

        const biasClass = article.biasAnalysis.level;
        return `
            <div class="bias-section" style="background: linear-gradient(135deg, #fff3e0, #ffe0b2); padding: 20px; border-radius: 12px; border-left: 5px solid #ff9800;">
                <h4 style="margin: 0 0 15px 0;">⚖️ Bias Analysis</h4>
                <div class="bias-meter" style="background: #e0e0e0; border-radius: 20px; height: 30px; overflow: hidden; margin: 15px 0;">
                    <div class="bias-bar" style="height: 100%; background: linear-gradient(90deg, #fa709a, #fee140); width: ${article.biasAnalysis.score}%; display: flex; align-items: center; justify-content: flex-end; padding-right: 10px; color: white; font-weight: 600; font-size: 13px;">${article.biasAnalysis.score}/100</div>
                </div>
                <p><strong>Bias Level:</strong> ${article.biasAnalysis.level.toUpperCase()}</p>
                <p><strong>Political Lean:</strong> ${article.biasAnalysis.politicalLean}</p>
                ${article.biasAnalysis.warning ? `
                    <div style="margin-top: 10px; padding: 10px; background: #ffebee; border-radius: 8px; color: #c62828;">
                        ⚠️ ${article.biasAnalysis.recommendation}
                    </div>
                ` : `<p style="color: #2e7d32; margin-top: 10px;">✅ ${article.biasAnalysis.recommendation}</p>`}
            </div>
        `;
    }

    buildFactCheckSection(article) {
        if (!article.factCheckFlags || !article.factCheckFlags.needsFactCheck) return '';

        return `
            <div class="fact-check-section" style="background: linear-gradient(135deg, #e8f5e9, #c8e6c9); padding: 20px; border-radius: 12px; border-left: 5px solid #4caf50;">
                <h4 style="margin: 0 0 15px 0;">🔍 Fact-Check Indicators</h4>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <span class="badge ${article.factCheckFlags.riskLevel}">${article.factCheckFlags.riskLevel.toUpperCase()} RISK</span>
                    <span>${article.factCheckFlags.flagCount} flag(s) detected</span>
                </div>
                ${article.factCheckFlags.flags.map(flag => `
                    <div style="padding: 12px; background: white; border-radius: 8px; margin-bottom: 10px; border-left: 3px solid ${flag.severity === 'high' ? '#f44336' : flag.severity === 'medium' ? '#ff9800' : '#4caf50'};">
                        <div style="display: flex; gap: 10px;">
                            <div style="font-size: 24px;">${flag.icon}</div>
                            <div style="flex: 1;">
                                <strong>${flag.type.replace(/_/g, ' ').toUpperCase()}</strong>
                                <p style="margin: 5px 0; font-size: 14px;">${flag.description}</p>
                                ${flag.claims ? `<div style="font-size: 13px; color: #666;">${Array.isArray(flag.claims) ? flag.claims.join(', ') : ''}</div>` : ''}
                                ${flag.terms ? `<div style="font-size: 13px; color: #666;">${Array.isArray(flag.terms) ? flag.terms.join(', ') : ''}</div>` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
                <p style="margin-top: 10px; font-size: 13px; color: #666;">💡 These indicators suggest claims that may benefit from independent verification.</p>
            </div>
        `;
    }

    buildReadabilitySection(article) {
        if (!article.readability) return '';

        return `
            <div class="readability-section" style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); padding: 20px; border-radius: 12px; border-left: 5px solid #2196f3;">
                <h4 style="margin: 0 0 15px 0;">📖 Readability Analysis</h4>
                <div style="display: flex; gap: 20px; align-items: center;">
                    <div style="width: 80px; height: 80px; border-radius: 50%; background: white; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                        <div style="font-size: 24px; font-weight: bold; color: #2196f3;">${article.readability.score}</div>
                        <div style="font-size: 11px; color: #666;">Score</div>
                    </div>
                    <div style="flex: 1;">
                        <p><strong>Level:</strong> ${article.readability.level.replace(/_/g, ' ')}</p>
                        <p><strong>Audience:</strong> ${article.readability.audience}</p>
                        <p><strong>Avg Words/Sentence:</strong> ${article.readability.avgWordsPerSentence}</p>
                    </div>
                </div>
            </div>
        `;
    }

    buildSourceSection(article) {
        if (!article.sourceMetrics) return '';

        return `
            <div class="source-section" style="background: linear-gradient(135deg, #f3e5f5, #e1bee7); padding: 20px; border-radius: 12px; border-left: 5px solid #9c27b0;">
                <h4 style="margin: 0 0 15px 0;">📰 Source Analysis</h4>
                <div style="padding: 15px; background: white; border-radius: 8px;">
                    <div style="font-size: 20px; margin-bottom: 10px;">${article.sourceMetrics.badge}</div>
                    <p><strong>Source:</strong> ${article.sourceMetrics.name}</p>
                    <p><strong>Type:</strong> ${article.sourceMetrics.type}</p>
                    <p><strong>Tier:</strong> ${article.sourceMetrics.tier} ${article.sourceMetrics.tier === 1 ? '(Premium)' : article.sourceMetrics.tier === 2 ? '(Verified)' : '(Unknown)'}</p>
                    <p><strong>Reputation:</strong> ${article.sourceMetrics.reputation}/100</p>
                </div>
            </div>
        `;
    }

    // ============================================
    // ACTIONS
    // ============================================
    speakNews(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    }

    shareNews(title, url) {
        const text = decodeURIComponent(title);
        const newsUrl = decodeURIComponent(url);
        
        if (navigator.share) {
            navigator.share({ title: text, text: text, url: newsUrl });
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n\n' + newsUrl)}`, '_blank');
        }
    }

    saveNews(index) {
        const saved = JSON.parse(localStorage.getItem('savedNews') || '[]');
        if (this.currentArticles[index]) {
            saved.push(this.currentArticles[index]);
            localStorage.setItem('savedNews', JSON.stringify(saved));
            alert('✅ Article saved!');
        }
    }
}

// Create global instance
window.aiNewsDisplay = new AINewsDisplay();
