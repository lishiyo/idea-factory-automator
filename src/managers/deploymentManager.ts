/**
 * Deployment Manager Module
 * 
 * Handles deploying the generated site to Netlify using their API.
 */

import fs from 'fs/promises';
import path from 'path';
import { createWriteStream, readdirSync } from 'fs';
import { NetlifyAPI } from 'netlify';
import archiver from 'archiver';
import axios from 'axios';

// Define interfaces for Netlify responses
interface NetlifySite {
  id: string;
  url: string;
  name: string;
}

interface NetlifyDeploy {
  id: string;
  state: string;
  deploy_url?: string;
  url?: string;
}

/**
 * Deploys the generated site to Netlify
 * @param {string} siteSourcePath Path to the directory containing the generated site files
 * @param {string} siteName Name of the site (will be used for site title if creating a new site)
 * @returns {Promise<void>}
 */
export async function deploySite(siteSourcePath: string, siteName: string): Promise<void> {
  console.log(`🚀 Deploying site "${siteName}" to Netlify...`);
  
  // Validate API token
  const apiToken = process.env.NETLIFY_AUTH_TOKEN;
  if (!apiToken) {
    throw new Error('NETLIFY_AUTH_TOKEN is not defined in environment variables');
  }
  
  try {
    // Initialize Netlify client
    const client = new NetlifyAPI(apiToken);
    
    // Sanitize site name for use as site name
    const safeSiteName = siteName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Either get existing site ID from env or create a new site
    let siteId = process.env.NETLIFY_SITE_ID;
    
    if (!siteId) {
      console.log(`ℹ️ No site ID found in environment variables. Creating a new site named "${safeSiteName}"...`);
      
      // Following the correct format from the Netlify API documentation
      const newSite = await client.createSite({
        body: {
          name: safeSiteName
        }
      }) as NetlifySite;
      
      siteId = newSite.id;
      console.log(`✅ Created new Netlify site with ID: ${siteId}`);
    } else {
      console.log(`ℹ️ Using existing Netlify site with ID: ${siteId}`);
    }
    
    // Create a ZIP of the site files
    console.log('📦 Creating ZIP archive of site files...');
    const zipFilePath = await createSiteZip(siteSourcePath, safeSiteName);
    
    // Deploy the ZIP to Netlify using the ZIP file method with direct API call
    console.log('📤 Uploading site to Netlify...');
    
    // Read the file as a Buffer
    const fileBuffer = await fs.readFile(zipFilePath);
    
    // Use axios to upload the ZIP directly to the Netlify API
    const deployUrl = `https://api.netlify.com/api/v1/sites/${siteId}/deploys`;
    const response = await axios.post(deployUrl, fileBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Authorization': `Bearer ${apiToken}`
      }
    });
    
    const deploy = response.data as NetlifyDeploy;
    
    console.log('✅ Deployment initiated successfully!');
    console.log(`🌐 Deploy ID: ${deploy.id}`);
    
    // Poll for deploy status
    console.log('⏳ Waiting for deployment to complete...');
    const deploySummary = await waitForDeploy(client, siteId, deploy.id);
    
    if (deploySummary.state === 'ready') {
      console.log(`🎉 Deployment completed successfully!`);
      console.log(`🔗 Site is now live at: ${deploySummary.deploy_url || deploySummary.url}`);
    } else {
      console.error(`❌ Deployment failed with state: ${deploySummary.state}`);
      throw new Error(`Deployment failed with state: ${deploySummary.state}`);
    }
    
    // Clean up the ZIP file
    await fs.unlink(zipFilePath);
    console.log(`🧹 Removed temporary ZIP file`);
    
  } catch (error) {
    console.error('❌ Deployment failed:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    throw new Error(`Failed to deploy site: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Creates a ZIP archive of site files for deployment
 * @param {string} siteSourcePath Path to the directory containing site files
 * @param {string} siteName Name of the site (used for naming the ZIP file)
 * @returns {Promise<string>} Path to the generated ZIP file
 */
async function createSiteZip(siteSourcePath: string, siteName: string): Promise<string> {
  // Create output directory for the ZIP file if it doesn't exist
  const outputDir = path.resolve(process.cwd(), 'temp');
  await fs.mkdir(outputDir, { recursive: true });
  
  // Define ZIP file path
  const zipFileName = `${siteName}-${Date.now()}.zip`;
  const zipFilePath = path.join(outputDir, zipFileName);
  
  return new Promise((resolve, reject) => {
    // Create a write stream for the ZIP file
    const output = createWriteStream(zipFilePath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });
    
    // Handle archive events
    output.on('close', () => {
      console.log(`📦 ZIP archive created: ${zipFilePath} (${archive.pointer()} total bytes)`);
      resolve(zipFilePath);
    });
    
    archive.on('error', (err) => {
      reject(new Error(`Failed to create ZIP archive: ${err.message}`));
    });
    
    // Pipe archive data to the output file
    archive.pipe(output);
    
    // Add files to the archive from the site source directory
    // The files need to be at the root of the archive, not in a directory
    try {
      const files = readdirSync(siteSourcePath, { withFileTypes: true });
      
      for (const file of files) {
        const fullPath = path.join(siteSourcePath, file.name);
        
        if (file.isDirectory()) {
          // Add directory and its contents recursively
          archive.directory(fullPath, file.name);
        } else {
          // Add file directly to the root of the archive
          archive.file(fullPath, { name: file.name });
        }
      }
      
      // Finalize the archive
      archive.finalize();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Polls the Netlify API until a deploy is complete or fails
 * @param {NetlifyAPI} client Netlify API client
 * @param {string} siteId Site ID
 * @param {string} deployId Deploy ID to monitor
 * @returns {Promise<NetlifyDeploy>} Deploy details
 */
async function waitForDeploy(
  client: NetlifyAPI, 
  siteId: string, 
  deployId: string
): Promise<NetlifyDeploy> {
  const maxAttempts = 30; // Maximum number of polling attempts
  const pollingInterval = 2000; // 2 seconds between polls
  
  // Helper function to pause execution
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  console.log(`⏳ Polling deploy status every ${pollingInterval/1000} seconds...`);
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Get current deploy status
    const deploy = await client.getSiteDeploy({
      site_id: siteId,
      deploy_id: deployId
    }) as NetlifyDeploy;
    
    // Log current state
    console.log(`🔄 Deploy status: ${deploy.state} (attempt ${attempt + 1})`);
    
    // Check if deploy is complete or failed
    if (deploy.state === 'ready') {
      return deploy; // Deployment successful
    } else if (deploy.state === 'error') {
      throw new Error('Deployment failed with error state');
    }
    
    // Wait before the next poll
    await sleep(pollingInterval);
  }
  
  throw new Error(`Deployment timed out after ${maxAttempts} polling attempts`);
} 