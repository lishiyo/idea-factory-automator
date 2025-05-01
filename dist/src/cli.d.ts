/**
 * CLI Module
 *
 * Handles all user interactions via command line interface
 * using inquirer for interactive prompts.
 */
/**
 * Prompts the user to enter a topic of interest
 * @returns {Promise<string>} The entered topic
 */
export declare function getTopic(): Promise<string>;
/**
 * Presents a list of generated ideas for the user to select
 * @param {string[]} ideas Array of idea strings to choose from
 * @returns {Promise<string>} The selected idea
 */
export declare function selectIdea(ideas: string[]): Promise<string>;
/**
 * Prompts the user for design style preferences
 * @returns {Promise<string>} The selected design style
 */
export declare function getDesignPreferences(): Promise<string>;
/**
 * Type definition for schema confirmation action
 */
export type SchemaAction = 'approve' | 'regenerate' | 'cancel';
/**
 * Shows the generated schema and asks for confirmation
 * @param {Object} schema The generated schema object
 * @returns {Promise<SchemaAction>} User choice: 'approve', 'regenerate', or 'cancel'
 */
export declare function confirmSchema(schema: Record<string, any>): Promise<SchemaAction>;
