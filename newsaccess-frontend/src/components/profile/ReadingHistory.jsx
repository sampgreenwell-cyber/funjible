import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import './Profile.css';

function ReadingHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await userAPI.getReadingHistory();
      setHistory(response.data.data);
    } catch (error) {
      console.error('Failed to fetch reading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="loading">Loading reading history...</div>;
  }

  return (
    <div className="reading-history-page">
      <div className="history-header">
        <h1>Reading History</h1>
        <p>Track all the articles you've purchased and read</p>
      </div>

      {history.length > 0 ? (
        <div className="history-list">
          {history.map((item) => (
            <div key={item._id} className="history-item">
              <div className="history-content">
                <h3>{item.article?.title || 'Article Unavailable'}</h3>
                <div className="history-meta">
                  <span className="publisher">
                    {item.article?.publisher?.name || 'Unknown Publisher'}
                  </span>
                  <span className="separator">•</span>
                  <span className="price">${item.price?.toFixed(2)}</span>
                  <span className="separator">•</span>
                  <span className="date">{formatDate(item.purchasedAt)}</span>
                </div>
              </div>
              <a 
                href={`/articles/${item.article?._id}`} 
                className="btn-reread"
              >
                Read Again
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No Reading History Yet</h2>
          <p>Start exploring articles to build your reading history</p>
          <a href="/articles" className="btn-primary">Browse Articles</a>
        </div>
      )}
    </div>
  );
}

export default ReadingHistory;