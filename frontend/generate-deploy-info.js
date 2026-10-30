// frontend/generate-deploy-info.js
const fs = require('fs');
const path = require('path');

const data = {
  deployedAt: new Date().toISOString()
};

fs.writeFileSync(
  path.join(__dirname, 'deploy-info.json'),
  JSON.stringify(data, null, 2)
);

console.log('deploy-info.json updated:', data.deployedAt);