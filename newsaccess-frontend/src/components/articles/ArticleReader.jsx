import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { articleAPI } from '../../services/api';
import './Articles.css';

function ArticleReader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchArticle();
    checkAccess();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const response = await articleAPI.getArticle(id);
      setArticle(response.data.data);
    } catch (err) {
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const checkAccess = async () => {
    try {
      const response = await articleAPI.getPurchasedArticles();
      const purchased = response.data.data.find(a => a._id === id);
      setHasAccess(!!purchased);
    } catch (err) {
      setHasAccess(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading article...</div>;
  }

  if (error || !article) {
    return (
      <div className="article-reader-error">
        <h2>Article Not Found</h2>
        <p>{error || 'This article could not be loaded.'}</p>
        <button onClick={() => navigate('/articles')} className="btn-primary">
          Back to Articles
        </button>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="article-reader-paywall">
        <h1>{article.title}</h1>
        <p className="article-excerpt">{article.excerpt}</p>
        <div className="paywall-message">
          <h3>🔒 This article is locked</h3>
          <p>Purchase this article for ${article.price.toFixed(2)} to read the full content.</p>
          <button onClick={() => navigate('/articles')} className="btn-primary">
            Go to Articles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="article-reader">
      <button onClick={() => navigate('/articles')} className="btn-back">
        ← Back to Articles
      </button>

      <article className="article-content">
        <header className="article-header">
          {article.imageUrl && (
            <img src={article.imageUrl} alt={article.title} className="article-hero-image" />
          )}
          <h1>{article.title}</h1>
          <div className="article-meta">
            <span className="article-author">By {article.author}</span>
            <span className="separator">•</span>
            <span className="article-date">
              {new Date(article.publishedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            {article.publisher?.name && (
              <>
                <span className="separator">•</span>
                <span className="article-publisher">{article.publisher.name}</span>
              </>
            )}
          </div>
        </header>

        <div className="article-body">
          <p className="article-excerpt-large">{article.excerpt}</p>
          <div className="article-text">
            {article.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}

export default ArticleReader;