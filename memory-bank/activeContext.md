# Active Context - Idea Factory Automator

## Current Phase
Implementation - Subtask 6 completed, ready for Subtask 7.

## Project Overview
The Idea Factory Automator is a CLI-based tool that helps users:
1. Generate product/startup ideas based on a topic of interest
2. Create a simple landing page for the selected idea
3. Deploy the landing page to Netlify
4. Collect user interest via an email form

For v0, we're focusing on the automated site creation workflow.

## Technical Context
- **Language/Platform**: Node.js with TypeScript and ES Modules
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
  - TSX for running TypeScript files with ESM support
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
  │   ├── index.ts        # Main orchestrator
  │   ├── cli.ts          # CLI interactions
  │   ├── services/
  │   │   ├── llmService.ts # LLM API interactions
  │   │   └── schemaService.ts # Schema generation
  │   ├── managers/
  │   │   ├── siteGenerator.ts    # Site generation
  │   │   ├── fileManager.ts      # File system operations
  │   │   └── deploymentManager.ts # Git operations
  │   ├── templates/
  │   │   ├── index.ejs     # HTML template
  │   │   └── style.ejs     # CSS template
  │   └── utils/
  │       └── parsers.ts    # Parsing utilities for LLM responses
  ├── scripts/
  │   └── test-components.ts # Component testing script
  ├── output/             # Generated sites (before deployment)
  ├── .env                # Environment variables (configured)
  ├── tsconfig.json       # TypeScript configuration
  ├── package.json
  └── README.md
  ```
- **Module Status**:
  - index.ts: Implemented for idea generation, selection, and schema generation workflow
  - cli.ts: Fully implemented with inquirer for all user interactions
  - llmService.ts: Fully implemented with OpenRouter API integration
  - services/schemaService.ts: Implemented with step-by-step schema generation approach
  - utils/parsers.ts: Implemented with robust parsing for LLM responses and JSON correction
  - siteGenerator.ts: Placeholder EJS rendering implementation
  - fileManager.ts: Placeholder file operations
  - deploymentManager.ts: Placeholder Git operations
  - templates: Basic responsive HTML/CSS templates created
  - Environment Variables: Structure defined with placeholders

## Completed Tasks
- ✅ Subtask 1: Project Setup & Core Dependencies
- ✅ Subtask 2: Configuration and Secrets Management
- ✅ Subtask 3: LLM Service Implementation
- ✅ Subtask 4: Basic CLI Interface Setup
- ✅ Subtask 5: Idea Generation Integration
- ✅ Subtask 6: Schema Generation Integration

## Next Steps
- Implement Subtask 7: HTML/CSS Template Creation
  - Create responsive HTML template with proper Netlify form integration
  - Develop matching CSS with dynamic styling based on schema
  - Set up EJS placeholders for dynamic content
  - Ensure form includes necessary Netlify attributes
- Prepare for Subtask 8: Site Generator Implementation
