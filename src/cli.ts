/**
 * CLI Module
 * 
 * Handles all user interactions via command line interface
 * using inquirer for interactive prompts.
 */

import inquirer from 'inquirer';

/**
 * Prompts the user to enter a topic of interest
 * @returns {Promise<string>} The entered topic
 */
export async function getTopic(): Promise<string> {
  const { topic } = await inquirer.prompt<{ topic: string }>([
    {
      type: 'input',
      name: 'topic',
      message: '🔍 What topic are you interested in for startup ideas?',
      validate: (input: string) => {
        if (input.trim() === '') {
          return 'Please enter a topic';
        }
        return true;
      }
    }
  ]);
  
  return topic.trim();
}

/**
 * Presents a list of generated ideas for the user to select
 * @param {string[]} ideas Array of idea strings to choose from
 * @returns {Promise<string>} The selected idea
 */
export async function selectIdea(ideas: string[]): Promise<string> {
  if (!Array.isArray(ideas) || ideas.length === 0) {
    throw new Error('No ideas provided to select from');
  }
  
  console.log('\n✨ Here are some startup ideas based on your topic:');
  
  const { selectedIdea } = await inquirer.prompt<{ selectedIdea: string }>([
    {
      type: 'list',
      name: 'selectedIdea',
      message: '📊 Which idea resonates with you the most?',
      choices: ideas.map(idea => ({
        name: idea,
        value: idea
      })),
      pageSize: Math.min(ideas.length, 10)
    }
  ]);
  
  return selectedIdea;
}

/**
 * Prompts the user for design style preferences
 * @returns {Promise<string>} The selected design style
 */
export async function getDesignPreferences(): Promise<string> {
  const designStyles = [
    'Modern & Minimal',
    'Bold & Vibrant',
    'Professional & Corporate',
    'Playful & Creative',
    'Elegant & Sophisticated',
    'Tech & Digital'
  ];
  
  const { designStyle } = await inquirer.prompt<{ designStyle: string }>([
    {
      type: 'list',
      name: 'designStyle',
      message: '🎨 What design style would you prefer for your landing page?',
      choices: designStyles,
      default: 'Modern & Minimal'
    }
  ]);
  
  return designStyle;
}

/**
 * Type definition for schema confirmation action
 */
export type SchemaAction = 'approve' | 'regenerate' | 'cancel';

/**
 * Shows the generated schema and asks for confirmation
 * @param {Object} schema The generated schema object
 * @returns {Promise<SchemaAction>} User choice: 'approve', 'regenerate', or 'cancel'
 */
export async function confirmSchema(schema: Record<string, any>): Promise<SchemaAction> {
  // Pretty print the schema for readability
  console.log('\n📋 Generated Site Schema:');
  console.log(JSON.stringify(schema, null, 2));
  
  const { action } = await inquirer.prompt<{ action: SchemaAction }>([
    {
      type: 'list',
      name: 'action',
      message: '👍 Does this schema look good to you?',
      choices: [
        { name: 'Yes, approve and continue', value: 'approve' },
        { name: 'No, regenerate the schema', value: 'regenerate' },
        { name: 'Cancel and exit', value: 'cancel' }
      ]
    }
  ]);
  
  return action;
} 