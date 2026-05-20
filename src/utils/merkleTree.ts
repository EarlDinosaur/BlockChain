import { ethers } from 'ethers';

// Simple interface for tree nodes
export interface MerkleNode {
  hash: string;
  left?: MerkleNode;
  right?: MerkleNode;
  isLeaf: boolean;
  content?: string; // Original content for visualization
}

export class MerkleTree {
  public root: MerkleNode | null = null;
  public leaves: MerkleNode[] = [];
  public levels: MerkleNode[][] = [];

  constructor(public data: string[]) {
    if (data.length > 0) {
      this.buildTree(data);
    }
  }

  // Hash function (keccak256 matching solidity)
  static hash(value: string | Uint8Array, isHex: boolean = false): string {
    if (isHex && typeof value === 'string') {
        return ethers.keccak256(value);
    }
    const bytes = typeof value === 'string' ? ethers.toUtf8Bytes(value) : value;
    return ethers.keccak256(bytes);
  }

  // Combine two hashes (matching solidity abi.encodePacked logic)
  static combineHashes(left: string, right: string): string {
    return ethers.solidityPackedKeccak256(["bytes32", "bytes32"], [left, right]);
  }

  private buildTree(data: string[]) {
    this.leaves = data.map(content => ({
      hash: MerkleTree.hash(content),
      isLeaf: true,
      content
    }));

    this.levels = [this.leaves];

    let currentLevel = this.leaves;
    while (currentLevel.length > 1) {
      const nextLevel: MerkleNode[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        // If odd number of nodes, duplicate the last node
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
        
        const parentNode: MerkleNode = {
          hash: MerkleTree.combineHashes(left.hash, right.hash),
          left,
          right,
          isLeaf: false
        };
        nextLevel.push(parentNode);
      }
      this.levels.push(nextLevel);
      currentLevel = nextLevel;
    }

    this.root = currentLevel[0];
  }

  public getRootHash(): string {
    return this.root ? this.root.hash : ethers.ZeroHash;
  }

  public getProof(leafHash: string): { proof: string[], positions: boolean[] } {
    const proof: string[] = [];
    const positions: boolean[] = [];

    let currentHash = leafHash;
    let found = false;

    // First find the leaf
    const leafIndex = this.leaves.findIndex(l => l.hash === leafHash);
    if (leafIndex === -1) return { proof, positions };

    // Traverse up the tree
    let currentIdx = leafIndex;
    for (let i = 0; i < this.levels.length - 1; i++) {
      const level = this.levels[i];
      const isRightNode = currentIdx % 2 !== 0;
      const parentIdx = Math.floor(currentIdx / 2);
      
      let siblingIdx = isRightNode ? currentIdx - 1 : currentIdx + 1;
      
      // If sibling doesn't exist, it means we duplicated the last node
      if (siblingIdx >= level.length) {
          siblingIdx = currentIdx; // Duplicate
      }

      proof.push(level[siblingIdx].hash);
      positions.push(!isRightNode); // true if sibling is on the right, false if on the left

      currentIdx = parentIdx;
    }

    return { proof, positions };
  }

  public verifyLocal(leafHash: string, proof: string[], positions: boolean[]): boolean {
    if (!this.root) return false;
    
    let computedHash = leafHash;
    for (let i = 0; i < proof.length; i++) {
      const sibling = proof[i];
      const isSiblingRight = positions[i];

      if (isSiblingRight) {
        computedHash = MerkleTree.combineHashes(computedHash, sibling);
      } else {
        computedHash = MerkleTree.combineHashes(sibling, computedHash);
      }
    }

    return computedHash === this.root.hash;
  }
}
