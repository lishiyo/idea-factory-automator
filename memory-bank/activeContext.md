# Active Context - Idea Factory Automator

## Current Phase
Implementation - Subtasks 2, 3, and 4 completed, ready for Subtask 5.

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
  - DEFAULT_LLM_MODEL (added for flexibility)

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
  ├── .env                # Environment variables (configured)
  ├── package.json
  └── README.md
  ```
- **Module Status**:
  - index.js: Basic structure with dotenv configuration, ready for workflow implementation
  - cli.js: Fully implemented with inquirer for all user interactions
  - llmService.js: Fully implemented with OpenRouter API integration
  - siteGenerator.js: Placeholder EJS rendering implementation
  - fileManager.js: Placeholder file operations
  - deploymentManager.js: Placeholder Git operations
  - templates: Basic responsive HTML/CSS templates created
  - Environment Variables: Structure defined with placeholders

## Completed Tasks
- ✅ Subtask 1: Project Setup & Core Dependencies
- ✅ Subtask 2: Configuration and Secrets Management
- ✅ Subtask 3: LLM Service Implementation
- ✅ Subtask 4: Basic CLI Interface Setup

## Next Steps
- Implement Subtask 5: Idea Generation Integration
  - Modify index.js to use cli.js and llmService.js for generating and selecting startup ideas
  - Add parsing logic for LLM responses to extract ideas as an array
  - Handle potential formatting inconsistencies in LLM outputs
- Prepare for Subtask 6: Schema Generation Integration
