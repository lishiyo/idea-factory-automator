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
   ```

## Usage

Run the CLI tool:

```
npm start
```

Follow the prompts to:
1. Enter a topic of interest
2. Select one of the generated ideas
3. Specify design preferences
4. Review and approve the generated schema
5. Wait for site generation and deployment

## Project Structure

```
idea-factory-automator/
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
├── .env                # Environment variables
├── package.json
└── README.md
```

## Development

More detailed development documentation can be found in the `memory-bank` directory.

## License

ISC 