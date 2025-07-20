# 🏛️ CivicChain - AI-Powered Real-time Civic Engagement Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Real--time-green?logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?logo=typescript)](https://www.typescriptlang.org/)

A revolutionary **real-time civic engagement platform** that combines AI-powered issue categorization, democratic DAO governance, and blockchain-based reputation systems to create transparent, efficient, and participatory digital democracy.

## ✨ Key Features

🔴 **LIVE REAL-TIME** - Experience instant civic engagement:
- ⚡ **Real-time Chat** - Instant community discussions with WebSocket connections
- 🗳️ **Live Voting** - Watch DAO proposals update in real-time across all users
- 📊 **Dynamic Dashboards** - Live complaint tracking and community analytics
- 🔔 **Smart Notifications** - Priority-based real-time alerts and updates
- 🤖 **AI Categorization** - Instant complaint classification with Google Gemini AI

### 🏛️ Democratic Governance
- **DAO Voting System** - Community-driven decision making with transparent vote counting
- **Proposal Creation** - Submit and discuss civic improvement proposals
- **Transparent History** - All voting records and decisions publicly visible
- **Weighted Voting** - Optional reputation-based voting power

### 📝 Smart Complaint Management
- **AI-Powered Categorization** - Automatic issue classification using Google Gemini AI
- **Real-time Status Updates** - Live tracking of complaint resolution progress
- **Geolocation Integration** - Location-based issue reporting with map visualization
- **Anonymous Reporting** - Privacy-protected submission options
- **Multi-media Support** - Photos, videos, and document attachments

### 💬 Community Features
- **Live Chat Rooms** - Public and private community discussions
- **Event Management** - Create, organize, and join community events
- **Notification System** - Multi-channel alerts (in-app, email, push)
- **User Profiles** - Civic reputation and achievement tracking

## 🛠️ Technology Stack

- **Frontend:** Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL with real-time subscriptions)
- **Authentication:** Supabase Auth with Row Level Security (RLS)
- **AI:** Google Gemini AI for categorization and analysis
- **Blockchain:** CARV Protocol integration for reputation
- **UI:** Shadcn/ui components with accessibility compliance

## 🚀 Quick Setup

### Prerequisites
```bash
Node.js >= 18.0.0
npm >= 8.0.0
Git >= 2.0.0
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/civicchain.git
cd civicchain

# Install dependencies
npm install
```

### Database Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com) → Create new project
   - Note your project URL and API keys

2. **Run Database Schema**
   - In Supabase Dashboard → SQL Editor
   - Copy and paste contents from `database.sql`
   - Click "Run" to create all tables and functions

### Environment Configuration

Create `.env.local`:

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI (Required for complaint categorization)
GEMINI_API_KEY=your-gemini-api-key

# Optional
NEXT_PUBLIC_CARV_APP_ID=your-carv-app-id
NEXT_PUBLIC_APP_URL=http://localhost:3003
```

### Launch Application

```bash
npm run dev
```

✅ **Your platform is now running at http://localhost:3003**

## 🎯 Usage

1. **Sign up** for a new account
2. **Submit complaints** and watch AI categorization
3. **Create DAO proposals** for community voting
4. **Join chat rooms** for real-time discussions
5. **Track your civic reputation** and community impact

## 🔧 Development

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # Code linting
npm run type-check   # TypeScript validation
```

## 📊 Real-time Architecture

The platform uses Supabase real-time subscriptions for instant updates:

```typescript
// Real-time complaint updates
const { data } = await supabase
  .from('complaints')
  .select('*')
  .on('INSERT', payload => updateComplaintsList(payload.new))
  .subscribe()
```

## 🛡️ Security

- **Row Level Security (RLS)** - Database-level access control
- **Authentication** - Secure Supabase Auth integration
- **Data Encryption** - All data encrypted at rest and in transit
- **Privacy Controls** - User-configurable privacy settings

## 🚀 Production Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel --prod
```

### Docker

```bash
docker build -t civicchain .
docker run -p 3000:3000 civicchain
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

- 📧 Email: support@civicchain.com
- 💬 Discord: [Join Community](https://discord.gg/civicchain)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/civicchain/issues)

---

**🏛️ Built for democratic communities worldwide with ❤️**

[![Star on GitHub](https://img.shields.io/github/stars/yourusername/civicchain?style=social)](https://github.com/yourusername/civicchain)
