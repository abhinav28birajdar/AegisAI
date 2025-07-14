'use client';

import { useState, useCallback } from 'react';
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { useWeb3 } from './web3-context';
import { CONTRACTS, COMPLAINT_REGISTRY_ABI, REPUTATION_TOKEN_ABI } from './web3-config';

// Hook for complaint submission to blockchain
export function useSubmitComplaint() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { chainId } = useWeb3();
  
  const contractAddress = chainId === 80001 
    ? CONTRACTS.MUMBAI.COMPLAINT_REGISTRY 
    : CONTRACTS.POLYGON.COMPLAINT_REGISTRY;

  const { writeContractAsync: submitComplaint } = useWriteContract();

  const submit = useCallback(async (complaint: {
    title: string;
    description: string;
    category: string;
    priority: number;
    ipfsHash: string;
    isAnonymous: boolean;
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Submit to blockchain
      const result = await submitComplaint({
        address: contractAddress as `0x${string}`,
        abi: COMPLAINT_REGISTRY_ABI,
        functionName: 'submitComplaint',
        args: [
          complaint.title,
          complaint.description,
          complaint.category,
          complaint.priority,
          complaint.ipfsHash,
          complaint.isAnonymous
        ],
      });

      setIsLoading(false);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to submit complaint to blockchain');
      setIsLoading(false);
      throw err;
    }
  }, [submitComplaint, contractAddress]);

  return { submit, isLoading, error };
}

// Hook for reading complaint data from blockchain
export function useComplaint(complaintId: number) {
  const { chainId } = useWeb3();
  
  const contractAddress = chainId === 80001 
    ? CONTRACTS.MUMBAI.COMPLAINT_REGISTRY 
    : CONTRACTS.POLYGON.COMPLAINT_REGISTRY;

  const { data: complaint, isLoading, error } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: COMPLAINT_REGISTRY_ABI,
    functionName: 'getComplaint',
    args: [complaintId],
    query: {
      enabled: complaintId > 0,
    },
  });

  return { complaint, isLoading, error };
}

// Hook for updating complaint status (authorities only)
export function useUpdateComplaintStatus() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { chainId } = useWeb3();
  
  const contractAddress = chainId === 80001 
    ? CONTRACTS.MUMBAI.COMPLAINT_REGISTRY 
    : CONTRACTS.POLYGON.COMPLAINT_REGISTRY;

  const { writeContractAsync: updateStatus } = useWriteContract();

  const update = useCallback(async (complaintId: number, newStatus: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await updateStatus({
        address: contractAddress as `0x${string}`,
        abi: COMPLAINT_REGISTRY_ABI,
        functionName: 'updateComplaintStatus',
        args: [complaintId, newStatus],
      });

      setIsLoading(false);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to update complaint status');
      setIsLoading(false);
      throw err;
    }
  }, [updateStatus, contractAddress]);

  return { update, isLoading, error };
}

// Hook for reputation token operations
export function useReputationToken() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { chainId, address } = useWeb3();
  
  const contractAddress = chainId === 80001 
    ? CONTRACTS.MUMBAI.REPUTATION_TOKEN 
    : CONTRACTS.POLYGON.REPUTATION_TOKEN;

  // Read user's reputation balance
  const { data: balance, isLoading: balanceLoading } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: REPUTATION_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
    query: {
      enabled: !!address,
    },
  });

  // Read user's reputation score
  const { data: reputation } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: REPUTATION_TOKEN_ABI,
    functionName: 'getUserReputation',
    args: [address],
    query: {
      enabled: !!address,
    },
  });

  // Read user's reputation tier
  const { data: tier } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: REPUTATION_TOKEN_ABI,
    functionName: 'getReputationTier',
    args: [address],
    query: {
      enabled: !!address,
    },
  });

  // Read verification status
  const { data: isVerified } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: REPUTATION_TOKEN_ABI,
    functionName: 'isVerifiedCitizen',
    args: [address],
    query: {
      enabled: !!address,
    },
  });

  // Mint reputation tokens (authorized minters only)
  const { writeContractAsync: mintReputation } = useWriteContract();

  const mint = useCallback(async (
    to: string, 
    amount: number, 
    activityType: string, 
    details: string
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await mintReputation({
        address: contractAddress as `0x${string}`,
        abi: REPUTATION_TOKEN_ABI,
        functionName: 'mintReputation',
        args: [to, parseEther(amount.toString()), activityType, details],
      });

      setIsLoading(false);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to mint reputation tokens');
      setIsLoading(false);
      throw err;
    }
  }, [mintReputation, contractAddress]);

  return {
    balance: balance ? formatEther(balance as bigint) : '0',
    reputation: reputation ? formatEther(reputation as bigint) : '0',
    tier: tier || 0,
    isVerified: isVerified || false,
    isLoading: isLoading || balanceLoading,
    error,
    mint,
  };
}

// Hook for getting user's complaints from blockchain
export function useUserComplaints() {
  const { chainId, address } = useWeb3();
  
  const contractAddress = chainId === 80001 
    ? CONTRACTS.MUMBAI.COMPLAINT_REGISTRY 
    : CONTRACTS.POLYGON.COMPLAINT_REGISTRY;

  const { data: complaintIds, isLoading, error } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: COMPLAINT_REGISTRY_ABI,
    functionName: 'getUserComplaints',
    args: [address],
    query: {
      enabled: !!address,
    },
  });

  return { complaintIds: complaintIds || [], isLoading, error };
}

// Hook for getting complaints by category
export function useComplaintsByCategory(category: string) {
  const { chainId } = useWeb3();
  
  const contractAddress = chainId === 80001 
    ? CONTRACTS.MUMBAI.COMPLAINT_REGISTRY 
    : CONTRACTS.POLYGON.COMPLAINT_REGISTRY;

  const { data: complaintIds, isLoading, error } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: COMPLAINT_REGISTRY_ABI,
    functionName: 'getComplaintsByCategory',
    args: [category],
    query: {
      enabled: !!category,
    },
  });

  return { complaintIds: complaintIds || [], isLoading, error };
}

// Hook for getting complaints by status
export function useComplaintsByStatus(status: number) {
  const { chainId } = useWeb3();
  
  const contractAddress = chainId === 80001 
    ? CONTRACTS.MUMBAI.COMPLAINT_REGISTRY 
    : CONTRACTS.POLYGON.COMPLAINT_REGISTRY;

  const { data: complaintIds, isLoading, error } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: COMPLAINT_REGISTRY_ABI,
    functionName: 'getComplaintsByStatus',
    args: [status],
    query: {
      enabled: status >= 0,
    },
  });

  return { complaintIds: complaintIds || [], isLoading, error };
}

// Hook for CARV attestation integration
export function useCarvAttestation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useWeb3();

  const getAttestation = useCallback(async (schema: string, data: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // This would integrate with CARV Protocol API
      // For now, return mock attestation
      const attestation = {
        id: `carv-${Date.now()}`,
        schema,
        subject: address,
        data,
        timestamp: Date.now(),
        issuer: 'aegis-ai-platform',
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsLoading(false);
      return attestation;
    } catch (err: any) {
      setError(err.message || 'Failed to get CARV attestation');
      setIsLoading(false);
      throw err;
    }
  }, [address]);

  const verifyAttestation = useCallback(async (attestationId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // This would verify with CARV Protocol
      // For now, return mock verification
      const verification = {
        isValid: true,
        attestationId,
        verifiedAt: Date.now(),
      };

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsLoading(false);
      return verification;
    } catch (err: any) {
      setError(err.message || 'Failed to verify attestation');
      setIsLoading(false);
      throw err;
    }
  }, []);

  return {
    getAttestation,
    verifyAttestation,
    isLoading,
    error,
  };
}

// Hook for transaction monitoring
export function useTransactionStatus(hash?: string) {
  const { data: transaction, isLoading, isSuccess, isError } = useWaitForTransactionReceipt({
    hash: hash as `0x${string}`,
    query: {
      enabled: !!hash,
    },
  });

  return {
    transaction,
    isLoading,
    isSuccess,
    isError,
  };
}
