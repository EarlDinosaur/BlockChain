import { ethers } from "ethers";

export interface TxReceipt {
  hash: string;
  status: 'pending' | 'mined' | 'failed';
  blockNumber?: number;
  timestamp?: number;
  events?: any[];
}

// In-memory simulated blockchain to allow the application to work out-of-the-box
class MockBlockchain {
  public blockNumber: number = 1000;
  public state: Record<string, any> = {}; // Mock contract state
  public transactions: TxReceipt[] = [];

  constructor() {
    this.state.registries = {}; // Mapping from root -> { timestamp, author, description }
  }

  private mineBlock() {
    this.blockNumber++;
  }

  // Simulate calling the registerRoot function
  public async simulateRegisterRoot(root: string, description: string, sender: string): Promise<TxReceipt> {
    const txHash = ethers.hexlify(ethers.randomBytes(32));
    
    const receipt: TxReceipt = {
      hash: txHash,
      status: 'pending',
    };
    this.transactions.unshift(receipt);

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (this.state.registries[root]) {
            receipt.status = 'failed';
            reject(new Error("Root already registered"));
            return;
        }

        this.mineBlock();
        const timestamp = Math.floor(Date.now() / 1000);
        
        this.state.registries[root] = {
          timestamp,
          author: sender,
          description
        };

        receipt.status = 'mined';
        receipt.blockNumber = this.blockNumber;
        receipt.timestamp = timestamp;
        receipt.events = [{
          name: 'RootRegistered',
          args: { root, author: sender, description, timestamp }
        }];

        resolve(receipt);
      }, 2000); // 2 second mock mining time
    });
  }

  // Simulate calling checkProof (read-only)
  public async simulateCheckProof(root: string, leaf: string, proof: string[], positions: boolean[]): Promise<boolean> {
    if (!this.state.registries[root]) {
      throw new Error("Root not registered");
    }

    let computedHash = leaf;
    for (let i = 0; i < proof.length; i++) {
        const sibling = proof[i];
        if (positions[i]) { // right
            computedHash = ethers.solidityPackedKeccak256(["bytes32", "bytes32"], [computedHash, sibling]);
        } else { // left
            computedHash = ethers.solidityPackedKeccak256(["bytes32", "bytes32"], [sibling, computedHash]);
        }
    }

    return computedHash === root;
  }
}

export const mockBlockchain = new MockBlockchain();
