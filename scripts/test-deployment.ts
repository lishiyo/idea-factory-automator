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
    form {
      margin: 2rem 0;
      padding: 1.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
      background-color: #f7fafc;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: bold;
    }
    input, textarea {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #cbd5e0;
      border-radius: 0.25rem;
      margin-bottom: 1rem;
    }
    button {
      background-color: #4299e1;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.25rem;
      cursor: pointer;
      font-weight: bold;
    }
    button:hover {
      background-color: #3182ce;
    }
    .hidden-field {
      display: none;
    }
  </style>
</head>
<body>
  <h1>Idea Factory Test Deployment</h1>
  <p>This is a test deployment for the Idea Factory automator.</p>
  <p class="success">If you're seeing this page, the deployment was successful!</p>
  <p>Generated at: ${new Date().toISOString()}</p>

  <!-- Success page for form submissions -->
  <div id="success-message" style="display:none;">
    <h2>Thank you for your submission!</h2>
    <p>We have received your information and will be in touch soon.</p>
    <a href="/">Return to home page</a>
  </div>

  <!-- Netlify Form Implementation -->
  <h2>Contact Form Test</h2>
  <form name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" action="/success/">
    <!-- Honeypot field for spam prevention -->
    <div class="hidden-field">
      <label>Don't fill this out if you're human: <input name="bot-field" /></label>
    </div>
    
    <!-- These hidden fields are crucial for Netlify form detection -->
    <input type="hidden" name="form-name" value="contact" />
    
    <div class="form-group">
      <label for="name">Name:</label>
      <input type="text" id="name" name="name" required />
    </div>
    
    <div class="form-group">
      <label for="email">Email:</label>
      <input type="email" id="email" name="email" required />
    </div>
    
    <div class="form-group">
      <label for="message">Message:</label>
      <textarea id="message" name="message" rows="4" required></textarea>
    </div>
    
    <button type="submit">Submit Form</button>
  </form>

  <!-- Success page content -->
  <div id="success-page">
    <h2>Success Page</h2>
    <p>This content will be shown after form submission if JavaScript is disabled.</p>
  </div>
</body>
</html>
`;

  await fs.writeFile(path.join(testOutputPath, 'index.html'), htmlContent);
  console.log('✅ Created index.html');

  // Create a success page
  const successPage = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form Submission Success</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
      color: #333;
      text-align: center;
    }
    h1 { color: #38a169; }
    .success-icon {
      font-size: 4rem;
      color: #38a169;
      margin: 2rem 0;
    }
    .back-link {
      display: inline-block;
      margin-top: 2rem;
      padding: 0.75rem 1.5rem;
      background-color: #4299e1;
      color: white;
      text-decoration: none;
      border-radius: 0.25rem;
      font-weight: bold;
    }
    .back-link:hover {
      background-color: #3182ce;
    }
  </style>
</head>
<body>
  <div class="success-icon">✓</div>
  <h1>Thank You!</h1>
  <p>Your form has been successfully submitted. We'll be in touch soon!</p>
  <a href="/" class="back-link">Return to Home</a>
</body>
</html>
`;

  // Create a success directory and save the success page
  await fs.mkdir(path.join(testOutputPath, 'success'), { recursive: true });
  await fs.writeFile(path.join(testOutputPath, 'success/index.html'), successPage);
  console.log('✅ Created success page at success/index.html');

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