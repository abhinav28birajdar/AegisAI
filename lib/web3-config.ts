import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygon, polygonMumbai, sepolia, mainnet } from 'wagmi/chains';

// Alchemy RPC URLs with provided API key
const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || 'U5Jt00V6iqGHtY-51fqxF';

// Web3 Configuration for AegisAI
export const web3Config = getDefaultConfig({
  appName: 'AegisAI - Decentralized Governance Platform',
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || '451f7ce63e391861923d8e3ace886fa9',
  chains: [
    {
      ...polygonMumbai,
      rpcUrls: {
        default: { http: [`https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_API_KEY}`] },
        public: { http: [`https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_API_KEY}`] }
      }
    },
    {
      ...polygon,
      rpcUrls: {
        default: { http: [`https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`] },
        public: { http: [`https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`] }
      }
    },
    {
      ...sepolia,
      rpcUrls: {
        default: { http: [`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`] },
        public: { http: [`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`] }
      }
    },
    {
      ...mainnet,
      rpcUrls: {
        default: { http: [`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`] },
        public: { http: [`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`] }
      }
    }
  ],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

// Smart Contract Addresses (Deploy these contracts)
export const CONTRACTS = {
  // Polygon Mumbai (Testnet) addresses
  MUMBAI: {
    COMPLAINT_REGISTRY: '0x0000000000000000000000000000000000000000', // To be deployed
    REPUTATION_TOKEN: '0x0000000000000000000000000000000000000000',   // To be deployed
    GOVERNANCE_DAO: '0x0000000000000000000000000000000000000000',     // To be deployed
    CARV_ATTESTATION: '0x0000000000000000000000000000000000000000',   // CARV protocol address
  },
  
  // Polygon Mainnet addresses
  POLYGON: {
    COMPLAINT_REGISTRY: '0x0000000000000000000000000000000000000000', // To be deployed
    REPUTATION_TOKEN: '0x0000000000000000000000000000000000000000',   // To be deployed
    GOVERNANCE_DAO: '0x0000000000000000000000000000000000000000',     // To be deployed
    CARV_ATTESTATION: '0x0000000000000000000000000000000000000000',   // CARV protocol address
  }
};

// ABI for smart contracts
export const COMPLAINT_REGISTRY_ABI = [
  {
    "inputs": [
      { "name": "_title", "type": "string" },
      { "name": "_description", "type": "string" },
      { "name": "_category", "type": "string" },
      { "name": "_priority", "type": "uint8" },
      { "name": "_ipfsHash", "type": "string" }
    ],
    "name": "submitComplaint",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "_complaintId", "type": "uint256" }],
    "name": "getComplaint",
    "outputs": [
      { "name": "id", "type": "uint256" },
      { "name": "submitter", "type": "address" },
      { "name": "title", "type": "string" },
      { "name": "description", "type": "string" },
      { "name": "category", "type": "string" },
      { "name": "priority", "type": "uint8" },
      { "name": "status", "type": "uint8" },
      { "name": "timestamp", "type": "uint256" },
      { "name": "ipfsHash", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "_complaintId", "type": "uint256" },
      { "name": "_newStatus", "type": "uint8" }
    ],
    "name": "updateComplaintStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export const REPUTATION_TOKEN_ABI = [
  {
    "inputs": [
      { "name": "_to", "type": "address" },
      { "name": "_amount", "type": "uint256" }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "_account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

// CARV Protocol Integration
export const CARV_CONFIG = {
  PROTOCOL_URL: 'https://protocol.carv.io',
  ATTESTATION_SCHEMA: 'civic-engagement-v1',
  REPUTATION_SCHEMA: 'governance-reputation-v1',
  DID_RESOLVER: 'did:carv:',
};

// Blockchain network configuration
export const NETWORK_CONFIG = {
  POLYGON_MUMBAI: {
    chainId: 80001,
    name: 'Polygon Mumbai',
    currency: 'MATIC',
    explorerUrl: 'https://mumbai.polygonscan.com',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com'
  },
  POLYGON: {
    chainId: 137,
    name: 'Polygon',
    currency: 'MATIC',
    explorerUrl: 'https://polygonscan.com',
    rpcUrl: 'https://polygon-rpc.com'
  }
};
