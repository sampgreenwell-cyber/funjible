import { useState, useEffect } from 'react';
import { walletAPI } from '../../services/api';
import './Wallet.css';

function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
  try {
    const response = await walletAPI.getTransactions({ limit: 20 });
    // Handle nested response structure
    const txns = response.data.data?.transactions || response.data.data || [];
    setTransactions(txns);
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
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

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'credit':
        return '💵';
      case 'debit':
        return '📰';
      case 'refund':
        return '↩️';
      default:
        return '💳';
    }
  };

  if (loading) {
    return <div className="loading">Loading transactions...</div>;
  }

  return (
    <div className="transaction-history">
      <h2>Transaction History</h2>

      {transactions.length > 0 ? (
        <div className="transaction-list">
          {transactions.map((transaction) => (
            <div key={transaction._id} className="transaction-item">
              <div className="transaction-icon">
                {getTransactionIcon(transaction.type)}
              </div>
              <div className="transaction-details">
                <h4>{transaction.description}</h4>
                <p className="transaction-date">{formatDate(transaction.createdAt)}</p>
              </div>
              <div className={`transaction-amount ${transaction.type}`}>
                {transaction.type === 'credit' ? '+' : '-'}
                ${transaction.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No transactions yet</p>
        </div>
      )}
    </div>
  );
}

export default TransactionHistory;