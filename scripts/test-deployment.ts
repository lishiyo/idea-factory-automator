import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { deploySite } from '../src/managers/deploymentManager.js';

// Load environment variables
dotenv.config();

// Set up paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testOutputPath = path.resolve(__dirname, '../test-output/sample-site');

/**
 * Creates a simple test site with an index.html file
 */
async function createTestSite() {
  // Ensure test directory exists
  await fs.mkdir(testOutputPath, { recursive: true });
  
  // Create a simple HTML file
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Deployment Site</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
      color: #333;
    }
    h1 { color: #2d3748; }
    .success { color: #38a169; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Idea Factory Test Deployment</h1>
  <p>This is a test deployment for the Idea Factory automator.</p>
  <p class="success">If you're seeing this page, the deployment was successful!</p>
  <p>Generated at: ${new Date().toISOString()}</p>
</body>
</html>
`;

  await fs.writeFile(path.join(testOutputPath, 'index.html'), htmlContent);
  console.log('✅ Created index.html');

  // Create a netlify.toml file with proper configuration
  const netlifyToml = `
# netlify.toml
[build]
  publish = "/"

# Set proper headers to ensure correct content types
[[headers]]
  for = "/*"
    [headers.values]
    Content-Type = "text/html; charset=utf-8"

[[headers]]
  for = "*.css"
    [headers.values]
    Content-Type = "text/css; charset=utf-8"

[[headers]]
  for = "*.js"
    [headers.values]
    Content-Type = "text/javascript; charset=utf-8"

[[headers]]
  for = "*.json"
    [headers.values]
    Content-Type = "application/json; charset=utf-8"
`;

  await fs.writeFile(path.join(testOutputPath, 'netlify.toml'), netlifyToml);
  console.log('✅ Created netlify.toml configuration');

  // Create a simple README file
  const readmeContent = `# Test Deployment

This is a test deployment for the Idea Factory Automator project.

Deployment time: ${new Date().toISOString()}
`;

  await fs.writeFile(path.join(testOutputPath, 'README.md'), readmeContent);
  console.log('✅ Created README.md');
}

/**
 * Tests the deployment functionality
 */
async function testDeployment() {
  console.log('🧪 Testing Netlify deployment...');
  
  try {
    // Create test site files
    await createTestSite();
    
    // Deploy to Netlify
    await deploySite(testOutputPath, 'test-idea-factory-' + Date.now());
    console.log('✅ Deployment test completed successfully!');
  } catch (error) {
    console.error('❌ Deployment test failed:', error);
  }
}

testDeployment(); 