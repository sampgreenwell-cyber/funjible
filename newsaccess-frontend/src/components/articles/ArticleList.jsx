import { useState, useEffect } from 'react';
import { articleAPI } from '../../services/api';
import ArticleCard from './ArticleCard';
import PurchaseModal from './PurchaseModal';
import './Articles.css';

function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [purchasedArticles, setPurchasedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPublisher, setFilterPublisher] = useState('all');

  useEffect(() => {
    fetchArticles();
    fetchPurchasedArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await articleAPI.getArticles({ limit: 50 });
      setArticles(response.data.data);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchasedArticles = async () => {
    try {
      const response = await articleAPI.getPurchasedArticles();
      setPurchasedArticles(response.data.data.map(a => a._id));
    } catch (error) {
      console.error('Failed to fetch purchased articles:', error);
    }
  };

  const handlePurchaseSuccess = () => {
    fetchArticles();
    fetchPurchasedArticles();
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPublisher = filterPublisher === 'all' || 
                            article.publisher?.name === filterPublisher;
    return matchesSearch && matchesPublisher;
  });

  const publishers = [...new Set(articles.map(a => a.publisher?.name).filter(Boolean))];

  if (loading) {
    return <div className="loading">Loading articles...</div>;
  }

  return (
    <div className="article-list-page">
      <div className="articles-header">
        <h1>Browse Articles</h1>
        <p>Discover quality journalism from top publishers</p>
      </div>

      <div className="articles-filters">
        <input
          type="text"
          placeholder="Search articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={filterPublisher}
          onChange={(e) => setFilterPublisher(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Publishers</option>
          {publishers.map(pub => (
            <option key={pub} value={pub}>{pub}</option>
          ))}
        </select>
      </div>

      <div className="articles-grid">
        {filteredArticles.length > 0 ? (
          filteredArticles.map(article => (
            <ArticleCard
              key={article._id}
              article={article}
              isPurchased={purchasedArticles.includes(article._id)}
              onPurchase={setSelectedArticle}
            />
          ))
        ) : (
          <div className="empty-state">
            <p>No articles found matching your criteria</p>
          </div>
        )}
      </div>

      {selectedArticle && (
        <PurchaseModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onSuccess={handlePurchaseSuccess}
        />
      )}
    </div>
  );
}

export default ArticleList;