import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import './Profile.css';

function SpendingAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await userAPI.getSpendingAnalytics();
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  if (!analytics) {
    return (
      <div className="empty-state">
        <p>No spending data available yet</p>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>Spending Analytics</h1>
        <p>Insights into your reading habits and spending</p>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>💰 Total Spent</h3>
          <div className="big-number">
            ${analytics.totalSpent?.toFixed(2) || '0.00'}
          </div>
          <p className="card-subtitle">All time</p>
        </div>

        <div className="analytics-card">
          <h3>📚 Articles Purchased</h3>
          <div className="big-number">
            {analytics.articlesPurchased || 0}
          </div>
          <p className="card-subtitle">Total articles</p>
        </div>

        <div className="analytics-card">
          <h3>📊 Average Price</h3>
          <div className="big-number">
            ${analytics.averagePrice?.toFixed(2) || '0.00'}
          </div>
          <p className="card-subtitle">Per article</p>
        </div>
      </div>

      {analytics.byPublisher && analytics.byPublisher.length > 0 && (
        <div className="publisher-breakdown">
          <h2>Spending by Publisher</h2>
          <div className="breakdown-list">
            {analytics.byPublisher.map((pub) => (
              <div key={pub.publisher} className="breakdown-item">
                <div className="breakdown-info">
                  <h4>{pub.publisherName || pub.publisher}</h4>
                  <p>{pub.count} articles</p>
                </div>
                <div className="breakdown-amount">
                  ${pub.total?.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {analytics.recentMonths && analytics.recentMonths.length > 0 && (
        <div className="monthly-breakdown">
          <h2>Monthly Spending</h2>
          <div className="month-list">
            {analytics.recentMonths.map((month) => (
              <div key={month.month} className="month-item">
                <div className="month-info">
                  <h4>{month.monthName}</h4>
                  <p>{month.count} articles</p>
                </div>
                <div className="month-amount">
                  ${month.total?.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SpendingAnalytics;