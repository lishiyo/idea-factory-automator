# Active Context - Idea Factory Automator

## Current Phase
Implementation - Subtask 1 completed, ready for subsequent tasks.

## Project Overview
The Idea Factory Automator is a CLI-based tool that helps users:
1. Generate product/startup ideas based on a topic of interest
2. Create a simple landing page for the selected idea
3. Deploy the landing page to Netlify
4. Collect user interest via an email form

For v0, we're focusing on the automated site creation workflow.

## Technical Context
- **Language/Platform**: Node.js with ES Modules
- **External Services**:
  - LLM provider (via OpenRouter, targeting models like GPT-4o)
  - Netlify for deployment
  - Git repository for site storage
- **Key Libraries**:
  - Inquirer for CLI interactions
  - EJS for templating
  - Axios for API requests
  - Dotenv for environment variables
  - ZX for shell command execution
- **Required Environment Variables**:
  - OPENROUTER_API_KEY
  - NETLIFY_GIT_REPO_URL

## Current Implementation Status
- **Project Structure**: Created and organized following architecture.md
- **Directory Structure**:
  ```
  idea-factory-agent/
  ├── src/
  │   ├── index.js        # Main orchestrator
  │   ├── cli.js          # CLI interactions
  │   ├── services/
  │   │   └── llmService.js # LLM API interactions
  │   ├── managers/
  │   │   ├── siteGenerator.js    # Site generation
  │   │   ├── fileManager.js      # File system operations
  │   │   └── deploymentManager.js # Git operations
  │   ├── templates/
  │   │   ├── index.ejs     # HTML template
  │   │   └── style.ejs     # CSS template
  │   └── utils/            # Helper functions
  ├── output/             # Generated sites (before deployment)
  ├── .env                # Environment variables (needs to be created)
  ├── package.json
  └── README.md
  ```
- **Module Status**:
  - index.js: Basic structure with placeholder implementations
  - cli.js: Function definitions with placeholder implementations
  - llmService.js: Mock API call implementation for testing
  - siteGenerator.js: Placeholder EJS rendering implementation
  - fileManager.js: Placeholder file operations
  - deploymentManager.js: Placeholder Git operations
  - templates: Basic responsive HTML/CSS templates created

## Next Steps
- Implement core orchestrator with full workflow (Subtask 2)
- Implement LLM service with actual OpenRouter API integration (Subtask 3)
- Implement CLI interactions with inquirer (Subtask 4)
