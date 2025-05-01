/**
 * File System Manager
 * 
 * Handles file system operations for the Idea Factory Automator
 * including creating directories and saving generated site files.
 */

import fs from 'fs/promises';
import path from 'path';

// Debug log at module load time to verify if this file is loaded
console.log('fileManager.ts: Module loaded');

/**
 * Creates a directory for the generated site
 * 
 * @param baseDir - The base directory where the site directory will be created
 * @param siteName - The name of the site (will be used as directory name)
 * @returns The full path to the created directory
 */
export async function createSiteDirectory(baseDir: string, siteName: string): Promise<string> {
  console.log('createSiteDirectory: Called with', { baseDir, siteName });
  
  try {
    // Sanitize the site name for use as a directory name
    const sanitizedSiteName = siteName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
    console.log(`Sanitized site name: ${sanitizedSiteName}`);
    
    // Construct the full path
    const fullPath = path.join(baseDir, sanitizedSiteName);
    
    // Create the directory (and any parent directories if they don't exist)
    await fs.mkdir(fullPath, { recursive: true });
    
    console.log(`Created directory: ${fullPath}`);
    return fullPath;
  } catch (error) {
    console.error(`Failed to create site directory: ${error}`);
    throw new Error(`Failed to create site directory: ${(error as Error).message}`);
  }
}

/**
 * Saves the generated site files (HTML, CSS, success page) to the output directory
 * @param siteDirectory Path to the site directory
 * @param siteFiles Object containing the HTML and CSS content
 * @returns Promise resolving to an object with the saved file paths
 */
export async function saveSiteFiles(
  siteDirectory: string, 
  siteFiles: { html: string; css: string; successPage?: string }
): Promise<{ htmlPath: string; cssPath: string; successPath?: string }> {
  try {
    console.log('📝 Saving site files to:', siteDirectory);
    
    // Define file paths
    const htmlPath = path.join(siteDirectory, 'index.html');
    const cssPath = path.join(siteDirectory, 'style.css');
    
    // Write the HTML content
    await fs.writeFile(htmlPath, siteFiles.html);
    console.log('✅ Saved HTML file to:', htmlPath);
    
    // Write the CSS content
    await fs.writeFile(cssPath, siteFiles.css);
    console.log('✅ Saved CSS file to:', cssPath);
    
    // Save the success page if provided
    let successPath: string | undefined;
    if (siteFiles.successPage) {
      // Create a success directory
      const successDir = path.join(siteDirectory, 'success');
      await fs.mkdir(successDir, { recursive: true });
      
      // Write the success page
      successPath = path.join(successDir, 'index.html');
      await fs.writeFile(successPath, siteFiles.successPage);
      console.log('✅ Saved success page to:', successPath);
    }
    
    return { htmlPath, cssPath, successPath };
  } catch (error: unknown) {
    console.error('❌ Error saving site files:', (error as Error).message);
    throw new Error(`Failed to save site files: ${(error as Error).message}`);
  }
} 