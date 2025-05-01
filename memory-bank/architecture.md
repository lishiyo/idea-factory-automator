# V0 Idea Factory Automator - Architecture Design

## 1. Overview

This document outlines the system architecture for the v0 Idea Factory Agent. The primary goals of this architecture are:

*   **Simplicity:** Implement the core v0 functionality with straightforward, understandable components.
*   **Modularity:** Design components with clear responsibilities that can be developed, tested, and maintained in isolation.
*   **Encapsulation:** Hide internal implementation details within each module, exposing only necessary interfaces.
*   **Swappability:** Facilitate easy replacement of components in the future (e.g., swapping the LLM provider, changing the site generation method from EJS templates to Astro/Tailwind).
*   **Technology:** Utilize Node.js with ES Modules.

The system operates as a Command Line Interface (CLI) tool that orchestrates interactions between the user, an LLM, the file system, and a Git repository.

## 2. Target Directory Structure

```
idea-factory-automator/
├── memory-bank/
│   ├── activeContext.md # current focus
│   ├── architecture.md # target architecture and system design principles
│   ├── progress.md # changelog
│   ├── tasks.md # tasks and subtasks
│   ├── v0_prd.md # v0 prd - what we're building
│   ├── creative-* # creative design decision docs
│   └── examples/
│       └── netlify_form_example.md
├── node_modules/
├── output/             # Locally generated site files (before deployment) - added to .gitignore
├── src/
│   ├── index.js        # Main orchestrator / entry point
│   ├── cli.js          # Handles all CLI interactions (inquirer prompts)
│   ├── services/
│   │   └── llmService.js # Interacts with the LLM API (e.g., OpenRouter)
│   ├── managers/
│   │   ├── siteGenerator.js    # Generates site files from schema + templates
│   │   ├── fileManager.js      # Handles file system operations (create dir, save files)
│   │   └── deploymentManager.js # Handles Git operations (clone, copy, commit, push)
│   ├── templates/
│   │   ├── index.ejs     # HTML template
│   │   └── style.ejs     # CSS template (or style.css)
│   └── utils/            # Optional: Small helper functions (e.g., sanitization, error handling)
├── .env                # Environment variables (API Keys, Repo URL) - added to .gitignore
├── .gitignore
├── package.json
└── package-lock.json
```

## 3. Core Components & Interactions

The system is composed of several distinct components managed by a central orchestrator.

1.  **Orchestrator (`src/index.js`)**
    *   **Responsibility:** Manages the overall workflow, coordinates calls between different components, and holds the application state (e.g., selected idea, approved schema). It acts as the main entry point.
    *   **Interactions:**
        *   Initializes environment variables (`dotenv`).
        *   Calls `cli.js` to get user input (topic, preferences, selections, approvals).
        *   Calls `llmService.js` to fetch ideas and generate the schema.
        *   Calls `siteGenerator.js` with the approved schema to get site file content.
        *   Calls `fileManager.js` to save the generated content to a local directory.
        *   Calls `deploymentManager.js` to push the local directory to the Git repository.
        *   Provides console feedback on progress and errors.

2.  **CLI (`src/cli.js`)**
    *   **Responsibility:** Handles all direct interaction with the user via the command line. Uses `inquirer` to ask questions, present choices, and get confirmations.
    *   **Interactions:**
        *   Called by `Orchestrator` to prompt for topic, preferences, idea selection, and schema confirmation.
        *   Returns user input/choices back to the `Orchestrator`.

3.  **LLM Service (`src/services/llmService.js`)**
    *   **Responsibility:** Encapsulates all communication logic with the external Large Language Model (LLM) API (e.g., OpenAI gpt-4o via OpenRouter). Handles API key management (reading from `process.env`), request formatting, API calls (`axios`), response parsing, and basic error handling for LLM interactions.
    *   **Interactions:**
        *   Called by `Orchestrator` (or potentially `SiteGenerator` for content refinement) with specific prompts.
        *   Makes HTTP requests to the LLM API endpoint.
        *   Returns the parsed response (ideas list, schema JSON string, refined content) to the caller.

4.  **Site Generator (`src/managers/siteGenerator.js`)**
    *   **Responsibility:** Generates the actual `index.html` and `style.css` file content based on the approved schema and predefined templates. For v0, this uses the EJS templating engine.
    *   **Interactions:**
        *   Called by `Orchestrator` with the `approvedSchema`.
        *   Reads template files (`index.ejs`, `style.ejs`) from `src/templates/`.
        *   Uses `ejs.renderFile()` to inject data from the schema into the templates.
        *   *(Optional V0 Enhancement/V1)* May call `llmService.js` to refine raw copy ideas from the schema into final prose before rendering.
        *   Returns the rendered HTML and CSS content as strings to the `Orchestrator`.

5.  **File Manager (`src/managers/fileManager.js`)**
    *   **Responsibility:** Handles all interactions with the local file system related to site generation output.
    *   **Interactions:**
        *   Called by `Orchestrator` with site name/identifier and base output path (`./output`).
        *   Creates the site-specific subdirectory within `./output`.
        *   Called by `Orchestrator` with the directory path and file contents (HTML, CSS).
        *   Writes the `index.html` and `style.css` files to the specified directory.
        *   Returns the path to the created site directory.

6.  **Deployment Manager (`src/managers/deploymentManager.js`)**
    *   **Responsibility:** Handles the Git operations required to deploy the generated site files to the Netlify-watched repository. Uses `zx` to execute shell commands.
    *   **Interactions:**
        *   Called by `Orchestrator` with the path to the locally generated site files and a site identifier/name.
        *   Reads the target Git repository URL from `process.env`.
        *   Clones the repository to a temporary location.
        *   Copies the generated site files into the appropriate subdirectory within the clone.
        *   Stages, commits, and pushes the changes to the remote repository.
        *   Performs cleanup (removes the temporary clone).

7.  **Templates (`src/templates/`)**
    *   **Responsibility:** Provide the static structure and styling base for the generated websites. Contain EJS placeholders (`<%= ... %>`) for dynamic content, colors, fonts, etc., derived from the schema.
    *   **Interactions:**
        *   Read by `SiteGenerator` during the rendering process.

8.  **Configuration (`.env`)**
    *   **Responsibility:** Store secrets (API keys) and configuration (target Git repository URL) outside the codebase.
    *   **Interactions:**
        *   Read by `Orchestrator` (via `dotenv`) at startup.
        *   Values accessed via `process.env`.

## 4. Key Design Patterns & Principles

*   **Modular Design:** The core principle. Functionality is broken down into distinct modules (`services`, `managers`, `cli`) located in separate files/directories.
*   **Single Responsibility Principle (SRP):** Each module aims to have one primary responsibility (e.g., `llmService` handles LLM calls, `fileManager` handles FS writes, `cli` handles user prompts).
*   **Facade:** `llmService.js` acts as a facade, simplifying interactions with the potentially complex LLM API. The `Orchestrator` itself acts as a facade for the entire agent workflow.
*   **Template Method (via EJS):** `siteGenerator.js` uses EJS template files (`.ejs`) which define the overall structure (the "template method") of the HTML/CSS, and the generator fills in the variable parts based on the schema.
*   **Dependency Injection (Implicit):** The `Orchestrator` imports and calls functions from the various managers and services, effectively "injecting" these dependencies by passing data between them, rather than having managers directly import and depend on each other. This promotes loose coupling.
*   **Configuration Management:** Separating configuration (API keys, URLs) into `.env` keeps sensitive data and environment-specific settings out of the source code.

## 5. Modularity and Swappability

This architecture explicitly supports swapping components:

*   **LLM Provider:** To change from OpenAI to Gemini (or another provider), only `src/services/llmService.js` needs to be significantly modified or replaced. As long as it maintains the same function signature (e.g., `callLLM(prompt, options)` returning the expected data format), the rest of the application remains unchanged.
*   **Site Generation:** To switch from EJS templates to a different static site generator (e.g., Astro+Tailwind), you would:
    1.  Create a new generator module (e.g., `src/managers/astroSiteGenerator.js`) that adheres to the same implicit interface as `siteGenerator.js` (i.e., takes a `schema` and eventually produces files/content).
    2.  Update the `Orchestrator` (`src/index.js`) to import and call the new generator instead of the EJS-based one. The `schema` generation, `fileManager`, and `deploymentManager` would likely remain unchanged.
*   **Deployment Method:** If switching from Git-based deployment to using the Netlify API directly, only `src/managers/deploymentManager.js` would need to be rewritten.
