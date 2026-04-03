import { useState } from 'react';
import { walletAPI } from '../../services/api';
import './Wallet.css';

function AddFundsModal({ onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const presetAmounts = [10, 25, 50, 100];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (numAmount < 5) {
      setError('Minimum amount is $5.00');
      return;
    }

    setLoading(true);

    try {
      await walletAPI.addFunds(numAmount);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add funds');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Funds to Wallet</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Amount (USD)</label>
            <input
              type="number"
              step="0.01"
              min="5"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
            />
          </div>

          <div className="preset-amounts">
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                type="button"
                className={`preset-btn ${amount === preset.toString() ? 'active' : ''}`}
                onClick={() => setAmount(preset.toString())}
              >
                ${preset}
              </button>
            ))}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Processing...' : 'Add Funds'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddFundsModal;