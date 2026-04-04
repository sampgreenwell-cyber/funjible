import { useState, useEffect } from 'react';
import { articleAPI, walletAPI } from '../../services/api';
import './Articles.css';

function PurchaseModal({ article, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const response = await walletAPI.getWallet();
      setWallet(response.data.data);
    } catch (err) {
      setError('Failed to load wallet information');
    }
  };

  const handlePurchase = async () => {
    setError('');
    setLoading(true);

    try {
      await articleAPI.purchaseArticle(article._id);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  const hasEnoughFunds = wallet && wallet.balance >= article.price;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content purchase-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Purchase Article</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        <div className="purchase-details">
          <h3>{article.title}</h3>
          <p className="publisher-name">{article.publisher?.name}</p>
          
          <div className="purchase-summary">
            <div className="summary-row">
              <span>Article Price:</span>
              <span className="price">${article.price?.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Your Balance:</span>
              <span className={hasEnoughFunds ? 'balance-ok' : 'balance-low'}>
                ${wallet?.balance?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="summary-row total">
              <span>After Purchase:</span>
              <span>
                ${((wallet?.balance || 0) - article.price).toFixed(2)}
              </span>
            </div>
          </div>

          {!hasEnoughFunds && (
            <div className="warning-message">
              ⚠️ Insufficient funds. Please add money to your wallet first.
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          
          {hasEnoughFunds ? (
            <button 
              onClick={handlePurchase} 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Confirm Purchase'}
            </button>
          ) : (
            <a href="/wallet" className="btn-primary">
              Add Funds
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default PurchaseModal;