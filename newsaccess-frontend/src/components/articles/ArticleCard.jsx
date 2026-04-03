import './Articles.css';

function ArticleCard({ article, onPurchase, isPurchased }) {
  return (
    <div className="article-card">
      {article.imageUrl && (
        <div className="article-image">
          <img src={article.imageUrl} alt={article.title} />
        </div>
      )}
      
      <div className="article-content">
        <div className="article-publisher">
          {article.publisher?.name || 'Unknown Publisher'}
        </div>
        
        <h3 className="article-title">{article.title}</h3>
        
        <p className="article-excerpt">
          {article.excerpt || article.description || 'No description available'}
        </p>
        
        <div className="article-footer">
          <div className="article-meta">
            <span className="article-author">
              {article.author || 'Staff Writer'}
            </span>
            <span className="article-date">
              {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          <div className="article-actions">
            {isPurchased ? (
              <a href={`/articles/${article._id}`} className="btn-read">
                Read Article
              </a>
            ) : (
              <button 
                onClick={() => onPurchase(article)} 
                className="btn-purchase"
              >
                ${article.price?.toFixed(2)} - Purchase
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArticleCard;