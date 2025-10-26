const fs = require('fs');
const path = require('path');

// Generate new version file with current timestamp
const versionData = {
  version: "2.0." + Date.now(),
  buildTime: Date.now().toString()
};

const versionPath = path.join(__dirname, '../public/version.json');
fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2));

console.log('✅ Version updated:', versionData.version);
console.log('📦 Build time:', new Date(parseInt(versionData.buildTime)).toISOString());
