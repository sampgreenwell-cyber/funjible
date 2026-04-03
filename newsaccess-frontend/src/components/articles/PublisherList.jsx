import { useState, useEffect } from 'react';
import { publisherAPI } from '../../services/api';
import './Publishers.css';

function PublisherList() {
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublishers();
  }, []);

  const fetchPublishers = async () => {
    try {
      const response = await publisherAPI.getPublishers();
      setPublishers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch publishers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (publisherId) => {
    try {
      await publisherAPI.subscribe(publisherId);
      fetchPublishers();
    } catch (error) {
      console.error('Failed to subscribe:', error);
    }
  };

  const handleUnsubscribe = async (publisherId) => {
    try {
      await publisherAPI.unsubscribe(publisherId);
      fetchPublishers();
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading publishers...</div>;
  }

  return (
    <div className="publisher-list-page">
      <div className="publishers-header">
        <h1>Publishers</h1>
        <p>Subscribe to your favorite news sources</p>
      </div>

      <div className="publishers-grid">
        {publishers.map(publisher => (
          <div key={publisher._id} className="publisher-card">
            {publisher.logoUrl && (
              <div className="publisher-logo">
                <img src={publisher.logoUrl} alt={publisher.name} />
              </div>
            )}
            
            <div className="publisher-info">
              <h3>{publisher.name}</h3>
              <p className="publisher-description">
                {publisher.description || 'Quality journalism you can trust'}
              </p>
              
              <div className="publisher-stats">
                <div className="stat">
                  <span className="stat-label">Articles</span>
                  <span className="stat-value">{publisher.articleCount || 0}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Avg Price</span>
                  <span className="stat-value">
                    ${publisher.averagePrice?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>

              {publisher.isSubscribed ? (
                <button 
                  onClick={() => handleUnsubscribe(publisher._id)}
                  className="btn-unsubscribe"
                >
                  ✓ Subscribed
                </button>
              ) : (
                <button 
                  onClick={() => handleSubscribe(publisher._id)}
                  className="btn-subscribe"
                >
                  Subscribe
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PublisherList;