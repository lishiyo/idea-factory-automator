# Idea Factory Automator

A CLI tool that automates the creation of landing pages for product/startup ideas, from ideation to deployment.

## Features

- Generate startup ideas based on a user-provided topic
- Create a schema with brand elements, copy, and design specifications
- Generate a responsive landing page with a Netlify form for collecting emails
- Deploy the site to a Netlify-watched Git repository

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git (for deployment)
- OpenRouter API key
- A Git repository connected to Netlify

## Installation

1. Clone this repository:
   ```
   git clone <repository-url>
   cd idea-factory-automator
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   NETLIFY_GIT_REPO_URL=your_netlify_watched_git_repo_url_here
   DEFAULT_LLM_MODEL=google/gemini-2.5-pro-preview-03-25
   ```

## Usage

### Main CLI Tool (Work in Progress)

The full implementation is in progress. When completed, you'll be able to run:

```
npm start
```

### Current Working Commands

Currently, you can run the following tests and components:

1. Test idea + schema generation and regeneration in cli:
   ```
   npx run dev
   ```

2. Test site generation (HTML/CSS rendering):
   ```
   npx tsx scripts/test-site-generator.ts
   ```
   This will create sample landing pages in `test-output/basic` and `test-output/refined` directories.

## Project Structure

```
idea-factory-automator/
├── src/
│   ├── index.ts               # Main orchestrator
│   ├── cli.ts                 # CLI interactions
│   ├── services/
│   │   ├── llmService.ts      # LLM API interactions
│   │   └── schemaService.ts   # Schema generation
│   ├── managers/
│   │   ├── siteGenerator.ts   # Site generation with EJS
│   │   ├── fileManager.ts     # File system operations
│   │   └── deploymentManager.ts # Git operations
│   ├── templates/
│   │   ├── index.ejs          # HTML template
│   │   └── style.ejs          # CSS template
│   └── utils/
│       └── parsers.ts         # Helper functions for parsing responses
├── scripts/
│   ├── test-components.ts     # Test individual components
│   └── test-site-generator.ts # Test site generation
├── test-output/               # Generated sites for testing
├── output/                    # Generated sites (before deployment)
├── memory-bank/               # Development documentation
├── .env                       # Environment variables
├── tsconfig.json              # TypeScript configuration
├── package.json
└── README.md
```

## Development

### Testing Components

You can test individual components using the scripts mentioned in the Usage section. The test scripts use mock data to verify functionality.

### Site Generator

The site generator (`src/managers/siteGenerator.ts`) can:
- Render HTML and CSS from EJS templates
- Optionally refine content using the LLM
- Handle errors gracefully

The test script creates both basic and refined versions of the site for comparison.

### Adding Features

The project is being developed in phases according to the implementation plan in `memory-bank/tasks.md`.

## Further Documentation

More detailed development documentation can be found in the `memory-bank` directory:
- `tasks.md`: Implementation tasks and progress
- `architecture.md`: System architecture and design
- `progress.md`: Development changelog
- `activeContext.md`: Current development focus

## License

ISC 