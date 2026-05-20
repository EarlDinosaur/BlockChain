import React from 'react';
import { Header } from './components/Header';
import { RegisterSection } from './components/RegisterSection';
import { VerifySection } from './components/VerifySection';
import { TransactionHistory } from './components/TransactionHistory';

function App() {
  return (
    <div className="app-container">
      <Header />
      
      <div className="main-grid">
        <div>
          <RegisterSection />
          <TransactionHistory />
        </div>
        <div>
          <VerifySection />
          
          <div className="glass-panel" style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>How it Works</h3>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>1. Hash & Tree:</strong> When you select files, we compute their local cryptographic hashes (SHA-256 equivalent) and build a Merkle Tree in your browser.
              </p>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>2. Register Root:</strong> We take only the top root hash of the tree and submit it to the Smart Contract. This proves the files existed at this timestamp, saving massive amounts of gas ($O(1)$ storage).
              </p>
              <p>
                <strong>3. Verify:</strong> Anyone can supply a file and its Merkle Proof (the sibling hashes along the path to the root) to the contract. The contract verifies it in $O(\log n)$ time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
