/**
 * Site Generator Module
 *
 * Handles the generation of HTML and CSS files based on the approved schema
 * and EJS templates.
 */
/**
 * Interface for the site files
 */
export interface SiteFiles {
    htmlContent: string;
    cssContent: string;
}
/**
 * Generates site files (HTML and CSS) based on the provided schema
 * @param {Object} schema The approved schema object containing all site content and styling
 * @returns {Promise<SiteFiles>} Object containing htmlContent and cssContent strings
 */
export declare function generateSiteFiles(schema: Record<string, any>): Promise<SiteFiles>;
