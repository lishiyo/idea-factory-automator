/**
 * LLM Service Module
 *
 * Handles interactions with the OpenRouter API (or other LLM providers).
 * Manages API requests, response parsing, and error handling.
 */
/**
 * Interface for LLM API options
 */
export interface LLMOptions {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    [key: string]: any;
}
/**
 * Call the LLM API with a prompt
 * @param {string} prompt The text prompt to send to the LLM
 * @param {LLMOptions} options Optional parameters like model, temperature, etc.
 * @returns {Promise<string>} The LLM response text
 */
export declare function callLLM(prompt: string, options?: LLMOptions): Promise<string>;
