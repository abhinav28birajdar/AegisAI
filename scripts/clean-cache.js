#!/usr/bin/env node

console.log('🧹 Cleaning CivicChain project cache...');

const fs = require('fs');
const path = require('path');

function removeDir(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Removed: ${dirPath}`);
    }
  } catch (error) {
    console.log(`⚠️  Could not remove ${dirPath}: ${error.message}`);
  }
}

// Clear Next.js cache
removeDir('.next');

// Clear node modules cache
removeDir('node_modules/.cache');

// Clear TypeScript cache
removeDir('node_modules/.cache/typescript');

console.log('✨ Cache cleaning complete!');
console.log('💡 Tip: Restart VS Code or run "TypeScript: Restart TS Server" from Command Palette');
