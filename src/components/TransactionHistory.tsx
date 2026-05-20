import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export const TransactionHistory: React.FC = () => {
  const { transactions } = useWeb3();

  return (
    <div className="glass-panel" style={{ marginTop: '2rem' }}>
      <h3 style={{ marginBottom: '1rem' }}>Transaction History</h3>
      
      {transactions.length === 0 ? (
        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
          No transactions yet. Register a Merkle root to see it here.
        </div>
      ) : (
        <div className="transaction-list">
          {transactions.map((tx, idx) => (
            <div key={idx} className="tx-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span className="tx-hash">{tx.hash.substring(0, 14)}...</span>
                <span>
                  {tx.status === 'mined' && <CheckCircle size={16} color="var(--success)" />}
                  {tx.status === 'failed' && <XCircle size={16} color="var(--error)" />}
                  {tx.status === 'pending' && <Clock size={16} color="orange" className="pulsing" />}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="tx-time">
                  {tx.status === 'pending' ? 'Mining...' : `Block #${tx.blockNumber}`}
                </span>
                <span className="tx-time">
                  {tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleTimeString() : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
