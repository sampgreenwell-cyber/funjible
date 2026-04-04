import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { walletAPI, articleAPI } from '../../services/api';
import './Dashboard.css';

function DashboardHome() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

 const fetchDashboardData = async () => {
  try {
    // Fetch wallet (should work)
    const walletRes = await walletAPI.getWallet();
    setWallet(walletRes.data.data);

    // Try to fetch articles, but don't fail if endpoint doesn't exist
    try {
      const articlesRes = await articleAPI.getPurchasedArticles();
      setRecentArticles(articlesRes.data.data.slice(0, 5));
    } catch (articleError) {
      console.log('Articles endpoint not available yet');
      setRecentArticles([]);
    }
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-home">
      <div className="welcome-section">
        <h1>Welcome back, {user?.firstName}! 👋</h1>
        <p>Here's what's happening with your account</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card wallet-summary">
          <h3>💰 Wallet Balance</h3>
          <div className="balance-amount">
            ${wallet?.balance?.toFixed(2) || '0.00'}
          </div>
          <a href="/wallet" className="card-link">Manage Wallet →</a>
        </div>

        <div className="dashboard-card stats-card">
          <h3>📚 Articles Read</h3>
          <div className="stat-number">{recentArticles.length}</div>
          <p className="stat-label">This month</p>
        </div>

        <div className="dashboard-card stats-card">
          <h3>💵 Total Spent</h3>
          <div className="stat-number">
            ${wallet?.totalSpent?.toFixed(2) || '0.00'}
          </div>
          <p className="stat-label">All time</p>
        </div>
      </div>

      <div className="recent-section">
        <h2>Recent Articles</h2>
        {recentArticles.length > 0 ? (
          <div className="article-list">
            {recentArticles.map((article) => (
              <div key={article._id} className="article-item">
                <div className="article-info">
                  <h4>{article.title}</h4>
                  <p className="article-meta">
                    {article.publisher?.name} • ${article.price}
                  </p>
                </div>
                <a href={`/articles/${article._id}`} className="btn-read">
                  Read
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>You haven't purchased any articles yet</p>
            <a href="/articles" className="btn-primary">Browse Articles</a>
          </div>
        )}
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <a href="/articles" className="action-btn">
            📰 Browse Articles
          </a>
          <a href="/wallet" className="action-btn">
            💳 Add Funds
          </a>
          <a href="/profile" className="action-btn">
            👤 Edit Profile
          </a>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;