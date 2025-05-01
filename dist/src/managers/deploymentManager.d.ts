/**
 * Deployment Manager Module
 *
 * Handles Git operations for deploying the generated site to a
 * Netlify-watched Git repository.
 */
/**
 * Deploys the generated site to the specified Git repository
 * @param {string} siteSourcePath Path to the directory containing the generated site files
 * @param {string} siteName Name of the site (will be used as the subdirectory in the repo)
 * @returns {Promise<void>}
 */
export declare function deploySite(siteSourcePath: string, siteName: string): Promise<void>;
