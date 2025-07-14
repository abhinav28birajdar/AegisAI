'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAuth } from './auth-context';

interface Web3ContextType {
  // Wallet connection
  isConnected: boolean;
  address?: string;
  balance?: string;
  chainId?: number;
  
  // Connection functions
  connect: () => void;
  disconnect: () => void;
  
  // AegisAI specific features
  reputation: number;
  complaintCount: number;
  isVerified: boolean;
  carvDID?: string;
  
  // Web3 actions
  submitComplaintToBlockchain: (complaint: any) => Promise<string>;
  updateComplaintStatus: (complaintId: string, status: number) => Promise<void>;
  mintReputationTokens: (amount: number) => Promise<void>;
  getCarvAttestation: () => Promise<string>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const { user } = useAuth();
  const { address, isConnected, chain } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({ address });
  
  // AegisAI specific state
  const [reputation, setReputation] = useState(0);
  const [complaintCount, setComplaintCount] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [carvDID, setCarvDID] = useState<string>();

  // Initialize Web3 data when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      loadUserWeb3Data();
    }
  }, [isConnected, address]);

  const loadUserWeb3Data = async () => {
    try {
      // Load reputation tokens
      // This would call the smart contract
      setReputation(150); // Mock data for now
      
      // Load complaint count
      setComplaintCount(3); // Mock data for now
      
      // Check CARV verification status
      setIsVerified(true); // Mock data for now
      
      // Load CARV DID if available
      setCarvDID(`did:carv:${address?.slice(0, 8)}...`); // Mock data for now
    } catch (error) {
      console.error('Error loading Web3 data:', error);
    }
  };

  const connect = () => {
    if (openConnectModal) {
      openConnectModal();
    }
  };

  const submitComplaintToBlockchain = async (complaint: any): Promise<string> => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      // This would interact with the ComplaintRegistry smart contract
      // For now, return a mock transaction hash
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      // In a real implementation, this would:
      // 1. Upload complaint data to IPFS
      // 2. Call smart contract submitComplaint function
      // 3. Wait for transaction confirmation
      // 4. Update local state
      
      console.log('Submitting complaint to blockchain:', complaint);
      
      // Simulate blockchain transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update complaint count
      setComplaintCount(prev => prev + 1);
      
      return mockTxHash;
    } catch (error) {
      console.error('Error submitting complaint to blockchain:', error);
      throw error;
    }
  };

  const updateComplaintStatus = async (complaintId: string, status: number): Promise<void> => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      // This would interact with the ComplaintRegistry smart contract
      console.log('Updating complaint status on blockchain:', { complaintId, status });
      
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.error('Error updating complaint status:', error);
      throw error;
    }
  };

  const mintReputationTokens = async (amount: number): Promise<void> => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      // This would interact with the ReputationToken smart contract
      console.log('Minting reputation tokens:', { amount, address });
      
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update reputation
      setReputation(prev => prev + amount);
      
    } catch (error) {
      console.error('Error minting reputation tokens:', error);
      throw error;
    }
  };

  const getCarvAttestation = async (): Promise<string> => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      // This would interact with CARV Protocol
      console.log('Getting CARV attestation for address:', address);
      
      // Simulate CARV API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const attestationId = `carv-attestation-${Date.now()}`;
      setCarvDID(`did:carv:${address}`);
      setIsVerified(true);
      
      return attestationId;
      
    } catch (error) {
      console.error('Error getting CARV attestation:', error);
      throw error;
    }
  };

  const value: Web3ContextType = {
    // Wallet connection
    isConnected,
    address,
    balance: balanceData?.formatted,
    chainId: chain?.id,
    
    // Connection functions
    connect,
    disconnect,
    
    // AegisAI specific features
    reputation,
    complaintCount,
    isVerified,
    carvDID,
    
    // Web3 actions
    submitComplaintToBlockchain,
    updateComplaintStatus,
    mintReputationTokens,
    getCarvAttestation,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}
