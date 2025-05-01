# Idea Factory Automator

A CLI tool that automates the creation of landing pages for product/startup ideas, from ideation to deployment.

## Features

- Generate startup ideas based on a user-provided topic
- Create a schema with brand elements, copy, and design specifications
- Generate AI-powered images for your landing page using Replicate
- Generate a responsive landing page with a Netlify form for collecting emails
- Deploy the site to a Netlify-watched Git repository

## How It Works

1. **Idea Generation**: Enter a topic, and the app uses an LLM to generate 10 startup ideas for you to choose from
2. **Design Preferences**: Select design preferences (modern, playful, etc.) to guide the landing page style
3. **Schema Generation**: The app creates a detailed schema with brand name, colors, fonts, copy, and image prompts
4. **Content Refinement**: The copy is optionally refined by the LLM to be more engaging and on-brand
5. **Image Generation**: Images are created using Replicate's API based on generated prompts (hero, features, etc.)
6. **Site Generation**: A responsive landing page is built using EJS templates with your schema data
7. **Local Saving**: The complete site with HTML, CSS, and images is saved to your local filesystem
8. **Deployment**: (Coming soon) The site is deployed to Netlify via Git for immediate hosting

## Tech Stack

- **Language**: TypeScript with ES Modules
- **Runtime**: Node.js (v18 or higher)
- **AI Services**: 
  - OpenRouter API for LLM text generation (schema, ideas, copy refinement)
  - Replicate API for image generation (openai/gpt-image-1 model)
- **Key Libraries**:
  - inquirer: Interactive CLI prompts
  - ejs: Templating for HTML/CSS generation
  - axios: API requests
  - dotenv: Environment variable management
  - zx: Shell commands for Git operations
  - Replicate: Image generation client

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git (for deployment)
- OpenRouter API key
- OpenAI API key (for image generation)
- Replicate API token
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
   REPLICATE_API_TOKEN=your_replicate_api_token_here
   OPENAI_API_KEY=your_openai_api_key_here
   REPLICATE_MODEL=openai/gpt-image-1
   ```

## Usage

### Main CLI Tool (Work in Progress)

The full implementation is in progress. When completed, you'll be able to run:

```
npm start
```

### Current Working Commands

Currently, you can run the following tests and components:

1. Test flow up to site generation with images in cli:
   ```
   npx run dev
   ```

2. Test only site generation (HTML/CSS rendering):
   ```
   npx tsx scripts/test-site-generator.ts
   ```
   This will create sample landing pages in `test-output/basic` and `test-output/refined` directories.

3. Test only image generation with Replicate:
   ```
   npx tsx scripts/test-image-generation.ts
   ```
   This will generate a test image using Replicate's API and save it in `test-output/image-test/test-site/images`.

## Project Structure

```
idea-factory-automator/
├── src/
│   ├── index.ts               # Main orchestrator
│   ├── cli.ts                 # CLI interactions
│   ├── services/
│   │   ├── llmService.ts      # LLM API interactions
│   │   ├── imageService.ts    # Image generation (Replicate)
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
│   ├── test-site-generator.ts # Test site generation
│   └── test-image-generation.ts # Test image generation
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

### Image Generation

The image generation service (`src/services/imageService.ts`):
- Uses Replicate's API with either:
    - `openai/gpt-image-1` - this has better text, but slower and more expensive
    - `black-forest-labs/flux-schnell` - cheaper and faster but weird text
- Generates images based on text prompts from the schema
- Supports the specific aspect ratios required by the model: "1:1" (square), "3:2" (landscape), "2:3" (portrait)
- Uses "3:2" landscape format for hero images and "1:1" square format for feature images
- Includes error handling and fallbacks if image generation fails
- Automatically converts unsupported aspect ratios to the closest supported format
- Saves generated images to the file system

### Site Generator

The site generator (`src/managers/siteGenerator.ts`) can:
- Render HTML and CSS from EJS templates
- Optionally refine content using the LLM
- Integrate generated images into the landing page
- Handle errors gracefully with fallbacks to placeholder images

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