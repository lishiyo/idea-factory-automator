/**
 * File Manager Module
 *
 * Handles file system operations for the generated site files.
 */
/**
 * Creates a directory for the site files
 * @param {string} baseDir Base directory path
 * @param {string} siteName Name of the site (will be used as directory name)
 * @returns {Promise<string>} Path to the created directory
 */
export declare function createSiteDirectory(baseDir: string, siteName: string): Promise<string>;
/**
 * Saves the generated HTML and CSS files to the specified directory
 * @param {string} dirPath Path to the directory where files should be saved
 * @param {string} htmlContent HTML content to save
 * @param {string} cssContent CSS content to save
 * @returns {Promise<void>}
 */
export declare function saveSiteFiles(dirPath: string, htmlContent: string, cssContent: string): Promise<void>;
