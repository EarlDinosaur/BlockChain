import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Shield, ShieldAlert, Wallet } from 'lucide-react';

export const Header: React.FC = () => {
  const { mode, toggleMode, account, connectWallet, isConnecting } = useWeb3();

  return (
    <div className="header">
      <div className="logo">
        <Shield size={32} color="var(--primary)" />
        VeriMerkle
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div className="network-badge" onClick={toggleMode}>
          <div className={`network-indicator ${mode}`} />
          {mode === 'mock' ? 'Mock Simulator' : 'Live EVM'}
        </div>

        <button 
          className={`btn ${account ? 'btn-secondary' : 'btn-primary'}`} 
          onClick={connectWallet}
          disabled={isConnecting}
        >
          <Wallet size={18} />
          {isConnecting ? 'Connecting...' : account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'Connect Wallet'}
        </button>
      </div>
    </div>
  );
};
