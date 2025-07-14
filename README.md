# AegisAI – A Decentralized, AI-Powered Public Governance Platform

🏆 **Hackathon Track 2.4 Submission** - AI × Web3 for Public Goods & Social Impact

AegisAI revolutionizes civic engagement by combining advanced AI analysis with blockchain transparency and CARV Protocol verification. Citizens can submit complaints that are intelligently categorized, immutably stored on-chain, and tracked through a reputation-based system.

## 🌟 Key Features

### AI-Powered Intelligence
- 🤖 **Multi-Agent AI System**: Intelligent complaint categorization with emergency detection
- 🔍 **Real-time Analysis**: Instant sentiment analysis and priority scoring
- 📊 **Smart Categorization**: Automatic routing to appropriate departments
- ⚡ **Emergency Escalation**: AI-detected urgent issues get immediate priority

### Blockchain & Web3 Integration  
- ⛓️ **Immutable Records**: Complaints stored permanently on Polygon blockchain
- 🪙 **Reputation Tokens**: ERC-20 tokens rewarding civic participation
- 🔗 **Multi-chain Support**: Polygon Mumbai testnet and mainnet ready
- 💼 **Wallet Integration**: RainbowKit with MetaMask, WalletConnect support

### CARV Protocol Integration
- 🆔 **Decentralized Identity**: CARV-based citizen verification
- � **Attestations**: Verifiable credentials for complaint authenticity
- 🔐 **Data Sovereignty**: Users maintain control over their civic data
- ✅ **Trust Network**: Build reputation through verified participation

### Advanced Governance
- 👥 **Role-based Access**: Citizens, authorities, and administrators
- 📈 **Analytics Dashboard**: Real-time insights into civic issues
- 🏅 **Gamification**: Reputation tiers encouraging quality participation
- 📱 **Responsive Design**: Mobile-first progressive web app

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** (Latest LTS recommended)
- **npm, yarn, or pnpm** package manager
- **Supabase account** for authentication and database
- **Web3 wallet** (MetaMask recommended) for blockchain features
- **Polygon Mumbai** testnet tokens for testing (get from faucet)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/your-username/aegis-ai-platform.git
cd aegis-ai-platform
```

2. **Install dependencies:**
```bash
npm install
```

3. **Environment Setup:**
Create `.env.local` file in the root directory:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI API Keys (Optional - has fallbacks)
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Blockchain Configuration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-walletconnect-id
NEXT_PUBLIC_ALCHEMY_API_KEY=your-alchemy-key

# CARV Protocol (Coming Soon)
CARV_API_KEY=your-carv-key
CARV_SCHEMA_ID=aegis-citizen-verification
```

4. **Database Setup:**
Run the SQL migrations in your Supabase SQL editor:
```sql
-- See database/schema.sql for complete setup
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  full_name TEXT,
  wallet_address TEXT,
  reputation_score INTEGER DEFAULT 0,
  verification_status TEXT DEFAULT 'unverified',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  priority INTEGER,
  status TEXT DEFAULT 'pending',
  ai_analysis JSONB,
  blockchain_tx_hash TEXT,
  ipfs_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

5. **Start the development server:**
```bash
npm run dev
```

The application will be available at `http://localhost:3000` (or next available port).

### 🔗 Smart Contract Deployment

For full Web3 functionality, deploy the smart contracts:

1. **Install Hardhat:**
```bash
cd contracts
npm install
```

2. **Deploy to Mumbai testnet:**
```bash
npx hardhat run scripts/deploy.js --network mumbai
```

3. **Update contract addresses** in `lib/web3-config.ts`

## 🏗️ Architecture & Tech Stack

### Frontend
- **Next.js 15**: React framework with App Router and Turbopack
- **TypeScript**: Full type safety across the application
- **Tailwind CSS v4**: Modern utility-first styling with CSS variables
- **shadcn/ui**: Beautiful, accessible UI components
- **Framer Motion**: Smooth animations and micro-interactions

### Backend & Database
- **Supabase**: PostgreSQL database with real-time subscriptions
- **Supabase Auth**: Secure authentication with email/password
- **API Routes**: Next.js API endpoints for AI integration
- **Middleware**: Route protection and request handling

### AI & Machine Learning
- **Multi-Agent System**: Specialized AI agents for different analysis types
- **OpenAI GPT-4**: Advanced language understanding and categorization
- **Anthropic Claude**: Fallback AI for enhanced reliability
- **Emergency Detection**: Real-time threat and urgency assessment
- **Sentiment Analysis**: Emotional context understanding

### Blockchain & Web3
- **Wagmi v2**: React hooks for Ethereum interaction
- **RainbowKit**: Beautiful wallet connection interface
- **TanStack Query**: Efficient blockchain data fetching
- **Polygon**: Layer 2 scaling for low-cost transactions
- **IPFS**: Decentralized storage for complaint metadata
- **Smart Contracts**: Solidity contracts for immutable governance

### CARV Protocol Integration
- **Decentralized Identity**: Self-sovereign identity management
- **Attestation System**: Verifiable credentials for citizens
- **Data Ownership**: User-controlled data sovereignty
- **Reputation Network**: Cross-platform reputation verification

## 📂 Project Structure

```
aegis-ai-platform/
├── app/                          # Next.js 15 App Router
│   ├── auth/                     # Authentication pages
│   │   ├── signin/page.tsx       # Sign in form
│   │   └── signup/page.tsx       # Registration form
│   ├── dashboard/page.tsx        # Web3 analytics dashboard
│   ├── submit-complaint/page.tsx # AI-powered complaint form
│   ├── complaints/[id]/page.tsx  # Individual complaint view
│   ├── api/                      # Backend API routes
│   │   ├── ai/categorize/        # AI analysis endpoint
│   │   ├── complaints/           # CRUD operations
│   │   └── user/profile/         # User management
│   └── layout.tsx               # Root layout with providers
├── components/                   # Reusable React components
│   ├── enhanced-complaint-form.tsx # AI-powered form
│   ├── web3-dashboard.tsx        # Blockchain analytics
│   ├── layout/                   # Layout components
│   │   ├── navbar.tsx           # Navigation with wallet connect
│   │   └── main-layout.tsx      # Main app layout
│   └── ui/                      # shadcn/ui components
├── lib/                         # Core utilities and hooks
│   ├── web3-config.ts           # Blockchain configuration
│   ├── blockchain-hooks.ts      # Custom Web3 React hooks
│   ├── supabase-client.ts       # Database client
│   └── utils.ts                 # Helper functions
├── contracts/                   # Smart contracts
│   ├── ComplaintRegistry.sol    # Main governance contract
│   ├── AegisReputationToken.sol # ERC-20 reputation system
│   └── scripts/deploy.js        # Deployment scripts
└── database/                    # Database schema
    └── schema.sql               # Supabase table definitions
```

## 🔧 Core Components

### Enhanced Complaint Form
- **AI-Powered**: Real-time categorization and priority scoring
- **Blockchain Integration**: Automatic on-chain submission
- **IPFS Storage**: Decentralized metadata storage
- **Wallet Connection**: Web3 authentication and signing

### Web3 Dashboard
- **Real-time Analytics**: Live complaint statistics and trends
- **Reputation System**: Token balance and tier visualization
- **Multi-chain Support**: Polygon mainnet and Mumbai testnet
- **CARV Integration**: Identity verification status

### Smart Contract System
- **ComplaintRegistry.sol**: Core governance and complaint management
- **AegisReputationToken.sol**: ERC-20 token for civic participation
- **Emergency Escalation**: Automated priority routing
- **Immutable Records**: Permanent transparency and accountability

## 🎯 Usage Guide

### For Citizens
1. **Connect Wallet**: Use MetaMask or any WalletConnect-compatible wallet
2. **Submit Complaint**: Describe your issue and let AI categorize it automatically
3. **Track Progress**: Monitor your complaint status on the blockchain
4. **Earn Reputation**: Gain tokens for quality participation and verified identity
5. **Anonymous Option**: Submit sensitive issues with privacy protection

### For Authorities  
1. **Dashboard Access**: View aggregated complaint analytics and trends
2. **Status Updates**: Update complaint progress with blockchain transparency
3. **Emergency Alerts**: Receive notifications for AI-detected urgent issues
4. **Reputation Rewards**: Mint tokens for responsive and effective governance
5. **Verification**: Validate citizen identities through CARV attestations

### For Developers
1. **Smart Contract Integration**: Use the ABIs to interact with contracts
2. **API Endpoints**: Leverage AI categorization and analytics APIs
3. **CARV Protocol**: Implement identity verification and attestation
4. **IPFS Integration**: Store and retrieve decentralized complaint metadata
5. **Multi-chain Deployment**: Deploy to additional EVM-compatible networks

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### Smart Contract Testing
```bash
cd contracts
npx hardhat test
```

### E2E Testing (Cypress)
```bash
npm run test:e2e
```

## 📊 Smart Contract Addresses

### Mumbai Testnet
- **ComplaintRegistry**: `0x[CONTRACT_ADDRESS]`
- **AegisReputationToken**: `0x[CONTRACT_ADDRESS]`

### Polygon Mainnet (Coming Soon)
- **ComplaintRegistry**: `0x[CONTRACT_ADDRESS]`
- **AegisReputationToken**: `0x[CONTRACT_ADDRESS]`

*Contracts will be deployed and verified on Polygonscan*

## 🔐 Security Features

- **Input Validation**: Comprehensive sanitization and validation
- **Rate Limiting**: API protection against abuse
- **Wallet Security**: Non-custodial, user-controlled private keys
- **Data Encryption**: Sensitive data encrypted at rest and in transit
- **Smart Contract Auditing**: Contracts reviewed for security vulnerabilities
- **CARV Verification**: Enhanced identity verification and attestation

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run start
```

### Docker Deployment
```bash
docker build -t aegis-ai .
docker run -p 3000:3000 aegis-ai
```

### Vercel Deployment
```bash
vercel --prod
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint with TypeScript rules
- `npm run type-check` - TypeScript compilation check
- `npm run test` - Run Jest unit tests
- `npm run test:watch` - Run tests in watch mode

## 🌐 API Reference

### AI Categorization Endpoint
```typescript
POST /api/ai/categorize
Content-Type: application/json

{
  "title": "Street light not working",
  "description": "The street light on Main St has been broken for weeks",
  "location": "Main Street, Downtown"
}

Response:
{
  "category": "Infrastructure",
  "priority": 3,
  "sentiment": "frustrated",
  "urgency": "medium",
  "department": "Public Works",
  "estimatedResolution": "3-5 business days"
}
```

### Complaint Management
```typescript
// Submit new complaint
POST /api/complaints
{
  "title": string,
  "description": string,
  "category": string,
  "priority": number,
  "isAnonymous": boolean,
  "location"?: string
}

// Get complaint by ID
GET /api/complaints/[id]

// Update complaint status (authorities only)
PATCH /api/complaints/[id]
{
  "status": "in-progress" | "resolved" | "rejected",
  "response": string
}
```

## 🔗 Web3 Integration

### Wallet Connection
```typescript
import { useAccount, useConnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

function WalletConnection() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  
  return (
    <button onClick={openConnectModal}>
      {isConnected ? `Connected: ${address}` : 'Connect Wallet'}
    </button>
  );
}
```

### Smart Contract Interaction
```typescript
import { useSubmitComplaint } from '@/lib/blockchain-hooks';

function ComplaintForm() {
  const { submit, isLoading } = useSubmitComplaint();
  
  const handleSubmit = async (data) => {
    const tx = await submit({
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      ipfsHash: data.ipfsHash,
      isAnonymous: data.isAnonymous
    });
    
    console.log('Transaction hash:', tx.hash);
  };
}
```

## 📈 Performance Optimizations

- **Next.js 15**: Latest React Server Components and streaming
- **Turbopack**: Ultra-fast bundler for development
- **Image Optimization**: Automatic WebP conversion and lazy loading
- **Code Splitting**: Automatic route-based code splitting
- **Caching**: Aggressive caching for blockchain data
- **Compression**: Gzip/Brotli compression for static assets

## 🤝 Contributing

We welcome contributions from the community! Here's how to get started:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`
5. Make your changes and test thoroughly
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Submit a Pull Request

### Contribution Guidelines
- Follow the existing code style and TypeScript patterns
- Add tests for new features
- Update documentation for any API changes
- Ensure all tests pass before submitting PR
- Include clear commit messages and PR descriptions

### Areas for Contribution
- 🔐 Enhanced security features
- 🌍 Internationalization (i18n)
- 📱 Mobile app development (React Native)
- 🔗 Additional blockchain integrations
- 🤖 Advanced AI features
- 📊 Analytics and reporting
- ♿ Accessibility improvements

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **CARV Protocol** for decentralized identity infrastructure
- **Polygon** for scalable blockchain solutions  
- **Supabase** for seamless backend services
- **OpenAI** for advanced AI capabilities
- **Vercel** for deployment and hosting
- **shadcn/ui** for beautiful UI components
- **Hackathon Organizers** for the opportunity to innovate

## 📞 Support & Contact

- **Documentation**: [docs.aegis-ai.com](https://docs.aegis-ai.com)
- **Discord Community**: [discord.gg/aegis-ai](https://discord.gg/aegis-ai)
- **GitHub Issues**: [Report bugs and feature requests](https://github.com/your-username/aegis-ai-platform/issues)
- **Twitter**: [@AegisAIPlatform](https://twitter.com/AegisAIPlatform)
- **Email**: support@aegis-ai.com

---

**Built with ❤️ for public good and social impact**

*Empowering citizens, enhancing governance, ensuring transparency through AI × Web3 innovation.*
