import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { mockBlockchain, TxReceipt } from '../utils/mockBlockchain';
import FileRegistryArtifact from '../artifacts/contracts/FileRegistry.sol/FileRegistry.json';

type NetworkMode = 'mock' | 'live';

interface Web3ContextState {
  mode: NetworkMode;
  account: string | null;
  toggleMode: () => void;
  connectWallet: () => Promise<void>;
  registerRoot: (root: string, description: string) => Promise<TxReceipt>;
  verifyProof: (root: string, leaf: string, proof: string[], positions: boolean[]) => Promise<boolean>;
  transactions: TxReceipt[];
  isConnecting: boolean;
  checkRootExists: (root: string) => Promise<boolean>;
  autofillVerifyData: {
    rootHash: string;
    proof: string[];
    positions: boolean[];
    fileName: string;
  } | null;
  setAutofillVerifyData: (data: {
    rootHash: string;
    proof: string[];
    positions: boolean[];
    fileName: string;
  } | null) => void;
}

const Web3Context = createContext<Web3ContextState>({} as Web3ContextState);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<NetworkMode>('mock');
  const [account, setAccount] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<TxReceipt[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [autofillVerifyData, setAutofillVerifyData] = useState<{
    rootHash: string;
    proof: string[];
    positions: boolean[];
    fileName: string;
  } | null>(null);

  // Sync mock transactions
  useEffect(() => {
    if (mode === 'mock') {
      const interval = setInterval(() => {
        setTransactions([...mockBlockchain.transactions]);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [mode]);

  // Initialize read-only contract if MetaMask is available but not connected
  useEffect(() => {
    if (mode === 'live') {
      const initReadOnly = async () => {
        if ((window as any).ethereum) {
          try {
            const provider = new ethers.BrowserProvider((window as any).ethereum);
            const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
            try {
              const instance = new ethers.Contract(contractAddress, FileRegistryArtifact.abi, provider);
              setContract(instance);
            } catch (e) {
              console.warn("Contract not compiled or found yet during read-only init", e);
            }
          } catch (e) {
            console.error("Failed to initialize read-only provider:", e);
          }
        }
      };
      initReadOnly();
    } else {
      setContract(null);
    }
  }, [mode]);

  const toggleMode = () => {
    setMode(prev => prev === 'mock' ? 'live' : 'mock');
    setAccount(null);
    setContract(null);
    setAutofillVerifyData(null);
  };

  const connectWallet = async () => {
    if (mode === 'mock') {
      setIsConnecting(true);
      setTimeout(() => {
        // Mock account address
        setAccount('0xMockAddress' + Math.floor(Math.random() * 1000000).toString(16));
        setIsConnecting(false);
      }, 500);
    } else {
      if ((window as any).ethereum) {
        setIsConnecting(true);
        try {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          await provider.send("eth_requestAccounts", []);
          const signer = await provider.getSigner();
          setAccount(signer.address);
          
          const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 
          
          try {
            const instance = new ethers.Contract(contractAddress, FileRegistryArtifact.abi, signer);
            setContract(instance);
          } catch(e) {
            console.warn("Contract not compiled or found yet", e);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsConnecting(false);
        }
      } else {
        alert("Please install MetaMask to use Live Mode!");
      }
    }
  };

  const registerRoot = async (root: string, description: string): Promise<TxReceipt> => {
    if (mode === 'mock') {
      return await mockBlockchain.simulateRegisterRoot(root, description, account || '0xUnknown');
    } else {
      if (!contract) throw new Error("Contract not connected in Live Mode");
      const tx = await contract.registerRoot(root, description);
      const receipt = await tx.wait();
      
      const newTx: TxReceipt = {
        hash: tx.hash,
        status: receipt.status === 1 ? 'mined' : 'failed',
        blockNumber: receipt.blockNumber,
        timestamp: Math.floor(Date.now() / 1000)
      };
      setTransactions(prev => [newTx, ...prev]);
      return newTx;
    }
  };

  const verifyProof = async (root: string, leaf: string, proof: string[], positions: boolean[]): Promise<boolean> => {
    if (mode === 'mock') {
      return await mockBlockchain.simulateCheckProof(root, leaf, proof, positions);
    } else {
      if (!contract) {
        if ((window as any).ethereum) {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
          const instance = new ethers.Contract(contractAddress, FileRegistryArtifact.abi, provider);
          return await instance.checkProof(root, leaf, proof, positions);
        }
        throw new Error("Contract not connected in Live Mode. Ensure MetaMask is installed.");
      }
      return await contract.checkProof(root, leaf, proof, positions);
    }
  };

  const checkRootExists = async (root: string): Promise<boolean> => {
    if (mode === 'mock') {
      return !!mockBlockchain.state.registries[root];
    } else {
      if (!contract) {
        if ((window as any).ethereum) {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
          const instance = new ethers.Contract(contractAddress, FileRegistryArtifact.abi, provider);
          return await instance.rootExists(root);
        }
        throw new Error("Contract not connected in Live Mode. Ensure MetaMask is installed.");
      }
      return await contract.rootExists(root);
    }
  };

  return (
    <Web3Context.Provider value={{
      mode,
      account,
      toggleMode,
      connectWallet,
      registerRoot,
      verifyProof,
      transactions,
      isConnecting,
      checkRootExists,
      autofillVerifyData,
      setAutofillVerifyData
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
