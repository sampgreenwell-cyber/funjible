import './Wallet.css';

function WalletCard({ wallet, onAddFunds }) {
  return (
    <div className="wallet-card">
      <div className="wallet-header">
        <h2>💳 Your Wallet</h2>
        <button onClick={onAddFunds} className="btn-add-funds">
          + Add Funds
        </button>
      </div>

      <div className="wallet-balance">
        <p className="balance-label">Available Balance</p>
        <h1 className="balance-amount">
          ${wallet?.balance?.toFixed(2) || '0.00'}
        </h1>
      </div>

      <div className="wallet-stats">
        <div className="stat">
          <p className="stat-label">Total Added</p>
          <p className="stat-value">${wallet?.totalAdded?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="stat">
          <p className="stat-label">Total Spent</p>
          <p className="stat-value">${wallet?.totalSpent?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="stat">
          <p className="stat-label">Articles Purchased</p>
          <p className="stat-value">{wallet?.articlesPurchased || 0}</p>
        </div>
      </div>
    </div>
  );
}

export default WalletCard;