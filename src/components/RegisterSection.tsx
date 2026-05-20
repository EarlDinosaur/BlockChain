import React, { useState, useRef, useEffect } from 'react';
import { MerkleTree } from '../utils/merkleTree';
import { useWeb3 } from '../context/Web3Context';
import { MerkleVisualizer } from './MerkleVisualizer';
import { Upload, FilePlus, Send, CheckCircle, Copy, ArrowRight, RefreshCw } from 'lucide-react';

export const RegisterSection: React.FC = () => {
  const { registerRoot, account, setAutofillVerifyData } = useWeb3();
  const [files, setFiles] = useState<File[]>([]);
  const [tree, setTree] = useState<MerkleTree | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Success state for registered batch
  const [registeredBatch, setRegisteredBatch] = useState<{
    root: string;
    description: string;
    files: {
      name: string;
      size: number;
      lastModified: number;
      hash: string;
      proof: string[];
      positions: boolean[];
    }[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (files.length > 0) {
      const data = files.map(f => `${f.name}-${f.size}-${f.lastModified}`);
      setTree(new MerkleTree(data));
    } else {
      setTree(null);
    }
  }, [files]);

  const handleSubmit = async () => {
    if (!tree || !account) return;
    setIsSubmitting(true);
    try {
      const rootHash = tree.getRootHash();
      const desc = description || 'Batch Registry';
      await registerRoot(rootHash, desc);
      
      // Pre-calculate proofs for all files in this registered batch
      const batchFiles = files.map(f => {
        const leafData = `${f.name}-${f.size}-${f.lastModified}`;
        const leafHash = MerkleTree.hash(leafData);
        const { proof, positions } = tree.getProof(leafHash);
        return {
          name: f.name,
          size: f.size,
          lastModified: f.lastModified,
          hash: leafHash,
          proof,
          positions
        };
      });

      setRegisteredBatch({
        root: rootHash,
        description: desc,
        files: batchFiles
      });

      // Clear inputs
      setFiles([]);
      setDescription('');
    } catch (err) {
      console.error(err);
      alert("Failed to register: " + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, message: string = "Copied to clipboard!") => {
    navigator.clipboard.writeText(text);
    alert(message);
  };

  const handleQuickVerify = (fileData: any) => {
    if (!registeredBatch) return;
    setAutofillVerifyData({
      rootHash: registeredBatch.root,
      proof: fileData.proof,
      positions: fileData.positions,
      fileName: fileData.name
    });

    const verifySection = document.getElementById('verify-section');
    if (verifySection) {
      verifySection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If successfully registered, show the premium success details panel
  if (registeredBatch) {
    return (
      <div className="glass-panel" style={{ border: '1px solid var(--success)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <CheckCircle size={28} color="var(--success)" />
          <div>
            <h2 style={{ color: 'var(--success)' }}>Batch Registered!</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Proof of existence is secured on-chain.
            </p>
          </div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>Description</span>
            <span style={{ fontWeight: 'bold' }}>{registeredBatch.description}</span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>On-Chain Merkle Root</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <code style={{ fontSize: '0.8rem', color: 'var(--primary)', background: 'rgba(56, 189, 248, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {registeredBatch.root}
              </code>
              <button 
                onClick={() => copyToClipboard(registeredBatch.root, "Merkle Root Hash copied!")} 
                className="btn btn-secondary" 
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                title="Copy Root Hash"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>
        </div>

        <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Registered Files ({registeredBatch.files.length})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {registeredBatch.files.map((file, idx) => (
            <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--surface-border)', padding: '0.75rem 1rem', borderRadius: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{file.name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Leaf #{idx + 1}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => handleQuickVerify(file)} 
                  className="btn btn-primary" 
                  style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', gap: '0.25rem' }}
                >
                  Quick Verify <ArrowRight size={12} />
                </button>
                <button 
                  onClick={() => copyToClipboard(
                    JSON.stringify({
                      root: registeredBatch.root,
                      leaf: file.hash,
                      proof: file.proof,
                      positions: file.positions
                    }, null, 2),
                    "Verification payload copied to clipboard!"
                  )} 
                  className="btn btn-secondary" 
                  style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', gap: '0.25rem' }}
                >
                  <Copy size={12} /> Copy Verification payload
                </button>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => setRegisteredBatch(null)} 
          className="btn btn-secondary" 
          style={{ width: '100%', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--success)' }}
        >
          <RefreshCw size={16} /> Register Another Batch
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel">
      <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FilePlus size={24} color="var(--primary)" />
        Register Files
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
        Add multiple files to compute their Merkle Root. Only the root hash will be stored on-chain, proving the integrity of all files simultaneously.
      </p>

      <div 
        className="file-drop" 
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={32} color="var(--text-secondary)" style={{ marginBottom: '0.5rem' }} />
        <div>Click to select files</div>
        <input 
          type="file" 
          multiple 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileChange} 
        />
      </div>

      {files.length > 0 && (
        <div className="file-list">
          {files.map((file, idx) => (
            <div key={idx} className="file-item">
              <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
              <button 
                onClick={() => removeFile(idx)}
                style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {tree && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Merkle Tree Preview</h3>
          <MerkleVisualizer tree={tree} />
          
          <div style={{ marginTop: '1.5rem' }}>
            <input 
              type="text" 
              placeholder="Batch Description (e.g., 'Semester 1 Transcripts')" 
              className="input-field"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            
            <button 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              onClick={handleSubmit}
              disabled={isSubmitting || !account}
            >
              <Send size={18} />
              {isSubmitting ? 'Registering...' : !account ? 'Connect Wallet First' : 'Register Root on Blockchain'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
