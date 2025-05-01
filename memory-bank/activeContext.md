# Active Context - Idea Factory Automator

## Current Phase
Implementation - Subtask 11 completed, ready for Subtask 12 (end-to-end testing).

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
  - Replicate for image generation
- **Key Libraries**:
  - Inquirer for CLI interactions
  - EJS for templating
  - Axios for API requests
  - Dotenv for environment variables
  - ZX for shell command execution
  - TSX for running TypeScript files with ESM support
  - Replicate for image generation API integration
- **Required Environment Variables**:
  - OPENROUTER_API_KEY
  - NETLIFY_GIT_REPO_URL
  - DEFAULT_LLM_MODEL (added for flexibility)
  - REPLICATE_API_TOKEN (for image generation)

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
  │   │   ├── imageService.ts # Image generation (Replicate API)
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
  │   ├── test-components.ts # Component testing script
  │   ├── test-image-generation.ts # Image generation testing script
  │   └── test-deployment.ts # Deployment testing script
  |   test-output/        # Generated files from testing
  ├── output/             # Generated sites (before deployment)
  ├── .env                # Environment variables (configured)
  ├── tsconfig.json       # TypeScript configuration
  ├── package.json
  └── README.md
  ```
- **Module Status**:
  - index.ts: Fully implemented with complete workflow from idea generation to deployment
  - cli.ts: Fully implemented with inquirer for all user interactions
  - llmService.ts: Fully implemented with OpenRouter API integration
  - services/schemaService.ts: Implemented with step-by-step schema generation approach
  - services/imageService.ts: Implemented with Replicate API integration for image generation
  - utils/parsers.ts: Implemented with robust parsing for LLM responses and JSON correction
  - siteGenerator.ts: Implemented with EJS rendering, content refinement, and image integration
  - fileManager.ts: Fully implemented with directory creation and file saving capabilities
  - deploymentManager.ts: Fully implemented with Git operations for Netlify deployment
  - templates: 
    - index.ejs: Responsive HTML template with Netlify form implementation and image support
    - style.ejs: CSS template with dynamic styling variables and image styling
  - Environment Variables: Structure defined with placeholders

## Completed Tasks
- ✅ Subtask 1: Project Setup & Core Dependencies
- ✅ Subtask 2: Configuration and Secrets Management
- ✅ Subtask 3: LLM Service Implementation
- ✅ Subtask 4: Basic CLI Interface Setup
- ✅ Subtask 5: Idea Generation Integration
- ✅ Subtask 6: Schema Generation Integration
- ✅ Subtask 7: HTML/CSS Template Creation
- ✅ Subtask 8: Site Generator Implementation
- ✅ Subtask 9: File System Manager Implementation
- ✅ Subtask 10: Image Integration (Fixed image path issues and template rendering to display generated images)
- ✅ Subtask 11: Deployment Manager Implementation (Implemented direct Netlify API integration with ZIP-based deployment)

## Next Steps
- Implement Subtask 12: End-to-End Testing
  - Test the complete workflow from idea generation to deployment
  - Verify the deployed site works correctly on Netlify
  - Test Netlify form functionality
  - Create comprehensive test documentation
