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
 * Saves the generated HTML and CSS files to the specified directory
 * 
 * @param dirPath - The directory path where files will be saved
 * @param htmlContent - The HTML content to save
 * @param cssContent - The CSS content to save
 */
export async function saveSiteFiles(dirPath: string, htmlContent: string, cssContent: string): Promise<void> {
  console.log('saveSiteFiles: Called with', { dirPath, htmlContentLength: htmlContent.length, cssContentLength: cssContent.length });
  
  try {
    // Construct file paths
    const htmlPath = path.join(dirPath, 'index.html');
    const cssPath = path.join(dirPath, 'style.css');
    
    // Write the files
    await fs.writeFile(htmlPath, htmlContent);
    await fs.writeFile(cssPath, cssContent);
    
    console.log(`Saved site files to ${dirPath}`);
  } catch (error) {
    console.error(`Failed to save site files: ${error}`);
    throw new Error(`Failed to save site files: ${(error as Error).message}`);
  }
} 