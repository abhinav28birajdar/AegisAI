// Test script to verify AegisAI integrations
// Run this in browser console: http://localhost:3000

console.log('🚀 AegisAI Integration Test Starting...');

// Test 1: AI Categorization API
async function testAICategorization() {
  try {
    console.log('🤖 Testing Gemini AI Categorization...');
    
    const response = await fetch('/api/ai/categorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Broken Street Light',
        description: 'The street light on Main Street has been broken for 3 days, making it dangerous for pedestrians at night.',
        location: 'Main Street, Downtown',
        reporterHistory: 'verified'
      })
    });
    
    const data = await response.json();
    console.log('✅ AI Categorization Response:', data);
    
    if (data.category && data.priority && data.aiAgent) {
      console.log('✅ AI Integration: SUCCESS');
      return true;
    } else {
      console.log('❌ AI Integration: FAILED');
      return false;
    }
  } catch (error) {
    console.error('❌ AI Categorization Error:', error);
    return false;
  }
}

// Test 2: Supabase Connection
async function testSupabaseConnection() {
  try {
    console.log('🗄️ Testing Supabase Connection...');
    
    // Test auth status
    const supabase = window.supabase;
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('✅ Supabase Auth Status:', session ? 'Authenticated' : 'Not authenticated');
      
      // Test database connection (public access)
      const { data, error } = await supabase
        .from('complaints')
        .select('count(*)')
        .limit(1);
        
      if (!error) {
        console.log('✅ Supabase Database: Connected');
        return true;
      } else {
        console.log('⚠️ Supabase Database:', error.message);
        return false;
      }
    } else {
      console.log('❌ Supabase: Not initialized');
      return false;
    }
  } catch (error) {
    console.error('❌ Supabase Connection Error:', error);
    return false;
  }
}

// Test 3: Web3 Configuration
async function testWeb3Configuration() {
  try {
    console.log('⛓️ Testing Web3 Configuration...');
    
    if (typeof window !== 'undefined' && window.ethereum) {
      console.log('✅ MetaMask: Available');
      
      // Test network configuration
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('📡 Current Chain ID:', chainId);
      
      // Suggest Polygon Mumbai for testing
      if (chainId !== '0x13881') { // Mumbai testnet
        console.log('💡 Suggestion: Switch to Polygon Mumbai testnet (Chain ID: 80001)');
      }
      
      return true;
    } else {
      console.log('⚠️ MetaMask: Not available (install MetaMask for full Web3 features)');
      return false;
    }
  } catch (error) {
    console.error('❌ Web3 Configuration Error:', error);
    return false;
  }
}

// Test 4: Environment Variables
function testEnvironmentVariables() {
  console.log('🔧 Testing Environment Configuration...');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_WC_PROJECT_ID',
    'NEXT_PUBLIC_ALCHEMY_API_KEY',
    'NEXT_PUBLIC_GEMINI_API_KEY'
  ];
  
  let allConfigured = true;
  
  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (value && value !== 'undefined') {
      console.log(`✅ ${envVar}: Configured`);
    } else {
      console.log(`❌ ${envVar}: Missing`);
      allConfigured = false;
    }
  });
  
  return allConfigured;
}

// Run all tests
async function runAllTests() {
  console.log('🎯 Running Complete AegisAI Integration Test Suite...\n');
  
  const results = {
    ai: await testAICategorization(),
    supabase: await testSupabaseConnection(),
    web3: await testWeb3Configuration(),
    env: testEnvironmentVariables()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('='.repeat(40));
  console.log(`🤖 AI Integration: ${results.ai ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🗄️ Supabase: ${results.supabase ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`⛓️ Web3: ${results.web3 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🔧 Environment: ${results.env ? '✅ PASS' : '❌ FAIL'}`);
  console.log('='.repeat(40));
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED! AegisAI is ready for production! 🚀');
  } else {
    console.log('⚠️ Some tests failed. Check configuration and dependencies.');
  }
  
  return results;
}

// Instructions for user
console.log(`
🔗 AegisAI Integration Test Instructions:

1. Open your browser and navigate to: http://localhost:3000
2. Open Developer Console (F12)
3. Copy and paste this entire script
4. Run: runAllTests()

This will test:
- ✅ Gemini AI categorization
- ✅ Supabase database connection
- ✅ Web3/MetaMask integration
- ✅ Environment variables

For complete testing:
- Install MetaMask browser extension
- Connect to Polygon Mumbai testnet
- Get test MATIC from Mumbai faucet
- Sign up for an account in the app

🚀 Ready to test AegisAI! Run runAllTests() when ready.
`);

// Auto-export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests, testAICategorization, testSupabaseConnection, testWeb3Configuration };
}
