import React from 'react';
import { MerkleTree } from '../utils/merkleTree';

interface MerkleVisualizerProps {
  tree: MerkleTree | null;
  highlightHash?: string;
  proofHashes?: string[];
}

export const MerkleVisualizer: React.FC<MerkleVisualizerProps> = ({ tree, highlightHash, proofHashes = [] }) => {
  if (!tree || tree.levels.length === 0) return null;

  return (
    <div className="merkle-canvas-container">
      <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
        {/* Render levels from root down to leaves */}
        {[...tree.levels].reverse().map((level, levelIdx) => (
          <div key={`level-${levelIdx}`} style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            {level.map((node, nodeIdx) => {
              const isHighlighted = node.hash === highlightHash;
              const isProofNode = proofHashes.includes(node.hash);
              const isRoot = levelIdx === 0;

              let bgColor = 'rgba(255,255,255,0.05)';
              let borderColor = 'var(--surface-border)';

              if (isHighlighted) {
                bgColor = 'var(--primary-glow)';
                borderColor = 'var(--primary)';
              } else if (isProofNode) {
                bgColor = 'var(--success-glow)';
                borderColor = 'var(--success)';
              } else if (isRoot) {
                bgColor = 'rgba(16, 185, 129, 0.1)';
                borderColor = 'var(--success)';
              }

              return (
                <div 
                  key={`node-${levelIdx}-${nodeIdx}`}
                  style={{
                    padding: '0.5rem',
                    background: bgColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '0.5rem',
                    textAlign: 'center',
                    minWidth: '80px',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    position: 'relative'
                  }}
                  title={node.hash}
                >
                  <div style={{ color: isRoot ? 'var(--success)' : 'var(--text-primary)', fontWeight: 'bold' }}>
                    {isRoot ? 'ROOT' : (node.isLeaf ? 'LEAF' : 'NODE')}
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    {node.hash.substring(0, 8)}...
                  </div>
                  {node.content && (
                    <div style={{ marginTop: '0.25rem', color: 'var(--primary)', fontSize: '0.7rem' }}>
                      "{node.content}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
