import { useState, useEffect } from 'react';
import { walletAPI } from '../services/api';
import WalletCard from '../components/wallet/WalletCard';
import AddFundsModal from '../components/wallet/AddFundsModal';
import TransactionHistory from '../components/wallet/TransactionHistory';

function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const response = await walletAPI.getWallet();
      setWallet(response.data.data);
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFundsSuccess = () => {
    fetchWallet();
  };

  if (loading) {
    return <div className="loading">Loading wallet...</div>;
  }

  return (
    <div className="wallet-page" style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
      <WalletCard 
        wallet={wallet} 
        onAddFunds={() => setShowAddFunds(true)} 
      />
      
      <TransactionHistory />

      {showAddFunds && (
        <AddFundsModal
          onClose={() => setShowAddFunds(false)}
          onSuccess={handleAddFundsSuccess}
        />
      )}
    </div>
  );
}

export default WalletPage;