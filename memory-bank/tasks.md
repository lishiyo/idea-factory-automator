# V0 Idea Factory Agent - Implementation Plan (Level 3)

This document outlines the comprehensive plan for implementing the v0 Idea Factory Automator, incorporating task breakdown, architecture considerations, creative phase identification, and potential challenges.

**Overall Goal:** Create a Node.js CLI tool that guides a user through selecting a topic, generating ideas, defining a site schema, generating a static landing page with a Netlify form, and deploying it via Git.

**Complexity Level:** 3 (Intermediate Feature - involves external APIs, file system manipulation, Git integration, and core creative generation logic).

---

## 1. Requirements Analysis

**Core Requirements:**
- [x] User provides a topic via CLI.
- [x] Agent fetches ~10 startup ideas from LLM based on topic.
- [x] User selects one idea via CLI.
- [x] Agent collects basic design preferences via CLI.
- [ ] Agent generates a site schema (JSON) using LLM based on idea and preferences.
- [ ] User approves or requests regeneration of the schema via CLI.
- [ ] Agent generates `index.html` and `style.css` content using EJS templates and the approved schema.
- [ ] Generated content includes a functional Netlify form (`data-netlify="true"`).
- [ ] Agent saves generated files to a local directory named after the site/brand.
- [ ] Agent clones a specified Git repository, copies the generated site files into it (under a subdirectory named after the site/brand), commits, and pushes.

**Technical Constraints:**
- [x] Must use Node.js with ES Modules.
- [x] Must use OpenRouter for LLM interactions.
- [x] Must use `inquirer` for CLI.
- [x] Must use `ejs` for templating.
- [x] Must use `axios` for HTTP requests.
- [x] Must use `dotenv` for secrets.
- [x] Must use `zx` for Git operations.
- [x] Deployment target is a Git repository watched by Netlify.

---

## 2. Component Analysis

**Affected Components (from `architecture.md`):**
- **`src/index.ts` (Orchestrator):**
    - *Changes needed:* Implement main control flow, coordinate all other modules, handle state (topic, selected idea, approved schema), manage error handling.
    - *Dependencies:* `cli.ts`, `llmService.ts`, `siteGenerator.ts`, `fileManager.ts`, `deploymentManager.ts`, `dotenv`.
- **`src/cli.ts`:**
    - *Changes needed:* Implement functions for `getTopic`, `selectIdea`, `getDesignPreferences`, `confirmSchema` using `inquirer`.
    - *Dependencies:* `inquirer`.
- **`src/services/llmService.ts`:**
    - *Changes needed:* Implement `callLLM` function to interact with OpenRouter API, handle authentication, request/response formatting, basic error handling.
    - *Dependencies:* `axios`, `dotenv`.
- **`src/managers/siteGenerator.ts`:**
    - *Changes needed:* Implement `generateSiteFiles` using `ejs` to render templates with schema data. Optionally include LLM call for content refinement.
    - *Dependencies:* `ejs`, `fs/promises`, potentially `llmService.ts`.
- **`src/managers/fileManager.ts`:**
    - *Changes needed:* Implement `createSiteDirectory` and `saveSiteFiles` using `fs/promises` and `path`.
    - *Dependencies:* `fs/promises`, `path`.
- **`src/managers/deploymentManager.ts`:**
    - *Changes needed:* Implement `deploySite` using `zx` to perform Git clone, copy, add, commit, push operations. Handle temporary directories and cleanup.
    - *Dependencies:* `zx`, `fs/promises`, `dotenv`, `path`.
- **`src/templates/index.ejs`, `src/templates/style.ejs`:**
    - *Changes needed:* Create base HTML and CSS structure with appropriate EJS placeholders corresponding to the schema definition. Ensure Netlify form attributes are present.
    - *Dependencies:* None (but structure dictated by schema).
- **`.env`:**
    - *Changes needed:* Define `OPENROUTER_API_KEY` and `NETLIFY_GIT_REPO_URL`.
    - *Dependencies:* None.
- **`.gitignore`:**
    - *Changes needed:* Include `node_modules/`, `.env`, `output/`, `dist/`.
    - *Dependencies:* None.
- **`package.json`:**
    - *Changes needed:* Set `"type": "module"`, list dependencies (`axios`, `inquirer`, `ejs`, `dotenv`, `zx`) and dev dependencies (`typescript`, `ts-node`, types).
    - *Dependencies:* None.
- **`tsconfig.json`:**
    - *Changes needed:* Configure TypeScript options for ES modules.
    - *Dependencies:* None.

---

## 3. Architecture & Design Decisions

**Architecture:**
- [x] Confirmed: Follow the modular design outlined in `architecture.md`.
- [x] Key Pattern: Orchestrator coordinates stateless modules.
- [x] Key Pattern: Services (`llmService`) encapsulate external interactions.
- [x] Key Pattern: Managers (`siteGenerator`, `fileManager`, `deploymentManager`) handle specific operational domains.
- [x] Key Pattern: Templating (`ejs`) separates presentation structure from data.
- [x] Configuration: Use `.env` for secrets and configuration.

**UI/UX (CLI):**
- [x] Use `inquirer` for clear, interactive prompts (list for ideas, confirm for schema).
- [x] Provide informative console logs during long operations (API calls, Git operations).
- [x] Pretty-print JSON schema for user confirmation.

**Algorithms/Logic:**
- [x] Schema Generation Prompt: Needs careful engineering to reliably produce valid JSON in the desired structure, incorporating the user's topic, idea, and preferences. (**Creative Phase required**)
- [x] Idea Parsing: Handle potential LLM response variations when parsing the list of 10 ideas.
- [x] Error Handling: Implement try/catch blocks for API calls, file operations, Git commands. Provide user-friendly error messages.
- [x] Content Refinement (Optional): Logic within `siteGenerator` to call `llmService` to improve raw schema copy before rendering. (**Creative Phase required**)
- [x] File/Directory Naming: Sanitize brand name from schema for use in directory/commit messages.

---

## 4. Implementation Strategy & Detailed Steps

*(Incorporates detailed steps from the original subtask breakdown)*

### Subtask 1: Project Setup & Core Dependencies
**Goal:** Initialize the Node.js project and install necessary libraries.
**Dependencies:** None
**Steps:**
- [x] Create a project directory (`idea-factory-agent`).
- [x] Navigate into the directory: `cd idea-factory-agent`
- [x] Initialize Node.js project: `npm init -y`
- [x] Edit `package.json` and add `"type": "module"` to enable ES Modules.
- [x] Install core dependencies:
    ```bash
    npm install axios inquirer ejs dotenv zx
    ```
    - [x] `axios`: For making HTTP requests to the LLM API.
    - [x] `inquirer`: For creating interactive CLI prompts.
    - [x] `ejs`: As the templating engine for HTML/CSS generation.
    - [x] `dotenv`: For managing environment variables (API keys, repo URL).
    - [x] `zx`: For easily running shell commands (like Git).
- [x] Install TypeScript and related dev dependencies:
    ```bash
    npm install --save-dev typescript ts-node @types/node @types/inquirer @types/ejs
    ```
- [x] Create basic directory structure: `mkdir src src/services src/managers src/templates src/utils scripts`
- [x] Create placeholder files: `touch src/index.ts src/cli.ts`
- [x] Create placeholder service files: `touch src/services/llmService.ts`
- [x] Create placeholder manager files: `touch src/managers/siteGenerator.ts src/managers/fileManager.ts src/managers/deploymentManager.ts`
- [x] Set up basic EJS templates: `touch src/templates/index.ejs src/templates/style.ejs`
- [x] Create TypeScript configuration: `touch tsconfig.json`
- [x] Create a `.gitignore` file to exclude `node_modules/`, `.env`, `output/`, and `dist/` directories.
- [x] Create a basic `README.md` file with setup instructions.
- [x] Create a `.env.example` file with placeholders for required environment variables.

### Subtask 2: Configuration and Secrets Management
**Goal:** Set up environment variable handling for API keys and configuration.
**Dependencies:** Subtask 1
**Steps:**
- [x] Populate `.env` file with necessary variables:
    ```dotenv
    OPENROUTER_API_KEY=your_openrouter_api_key_here
    NETLIFY_GIT_REPO_URL=your_netlify_watched_git_repo_url_here
    DEFAULT_LLM_MODEL=your_default_model_here
    ```
- [x] In `src/index.ts` (or a dedicated config module if preferred), import and configure `dotenv`:
    ```typescript
    import 'dotenv/config';
    // Access variables like process.env.OPENROUTER_API_KEY
    ```

### Subtask 3: LLM Service Implementation
**Goal:** Create a reusable service to interact with the OpenRouter API.
**Dependencies:** Subtask 1, Subtask 2
**Steps:**
- [x] Open `src/services/llmService.ts`.
- [x] Import `axios` and TypeScript types.
- [x] Define interfaces for LLMOptions and API responses.
- [x] Define an async function `callLLM(prompt: string, options: LLMOptions = {})`.
- [x] Inside the function:
    - [x] Retrieve API key from `process.env.OPENROUTER_API_KEY`.
    - [x] Set up request headers (Authorization).
    - [x] Set up request body based on OpenRouter API requirements (model, messages/prompt, temperature, max_tokens etc. - pass relevant `options`).
    - [x] Use `axios.post` to make the API call to the OpenRouter completions endpoint.
    - [x] Handle potential errors (network issues, API errors) gracefully (e.g., try/catch).
    - [x] Parse the response to extract the relevant text/JSON content.
    - [x] Return the parsed content.
- [x] Export the `callLLM` function and related interfaces.

### Subtask 4: Basic CLI Interface Setup
**Goal:** Implement the core user interaction flow using `inquirer`.
**Dependencies:** Subtask 1
**Steps:**
- [x] Open `src/cli.ts`.
- [x] Import `inquirer` and required type definitions.
- [x] Create async functions for each user interaction point:
    - [x] `getTopic(): Promise<string>`: Prompts user for the initial topic string. Returns the topic.
    - [x] `selectIdea(ideas: string[]): Promise<string>`: Takes a list of idea strings, presents them as a choice list. Returns the selected idea string.
    - [x] `getDesignPreferences(): Promise<string>`: Asks user for design style (e.g., "modern", "playful", "minimalist"). Returns the preference string.
    - [x] `confirmSchema(schema: Record<string, any>): Promise<SchemaAction>`: Takes the generated schema (as a JS object), pretty-prints it (e.g., `JSON.stringify(schema, null, 2)`), and asks for confirmation (Yes/No/Regenerate). Returns the user's choice.
- [x] Define and export the SchemaAction type for return values.
- [x] Export these functions.

### Subtask 5: Idea Generation Integration
**Goal:** Use the LLM Service and CLI to generate and select startup ideas.
**Dependencies:** Subtask 3, Subtask 4
**Steps:**
- [x] Modify `src/index.ts` (Orchestrator).
- [x] Import `getTopic`, `selectIdea` from `cli.ts`.
- [x] Import `callLLM` from `llmService.ts`.
- [x] In the main execution flow:
    - [x] Call `getTopic()` to get the user's topic.
    - [x] Construct a prompt for the LLM asking for 10 startup ideas based on the topic.
    - [x] Call `callLLM(prompt)` to get the ideas string.
    - [x] Parse the ideas string into an array of strings. Handle potential LLM formatting inconsistencies.
    - [x] Call `selectIdea(ideasArray)` to let the user choose one.
    - [x] Store the selected idea.

### Subtask 6: Schema Generation Integration
**Goal:** Use the LLM Service and CLI to generate and approve the site schema.
**Dependencies:** Subtask 3, Subtask 4, Subtask 5 (needs selected idea)
**Steps:**
- [x] Modify `src/index.ts`.
- [x] Import `getDesignPreferences`, `confirmSchema` from `cli.ts`.
- [x] In the main execution flow (after idea selection):
    - [x] Call `getDesignPreferences()` to get user style.
    - [x] Define the target JSON structure for the schema (e.g., `{ brandName: string, palette: { primary: string, secondary: string, accent: string }, font: { heading: string, body: string }, copyBlocks: { headline: string, subheadline: string, callToAction: string }, imagePrompts: { hero: string, feature1: string }, formText: { title: string, submitButton: string } }`).
    - [x] Loop for schema generation/approval:
        - [x] Construct a detailed prompt for the LLM asking it to generate the schema in the defined JSON format, based on the `selectedIdea` and `designPreferences`. Instruct it to ONLY output valid JSON. **(Creative Phase: Prompt Engineering)**
        - [x] Call `callLLM(prompt)` to get the schema JSON string.
        - [x] Attempt to `JSON.parse()` the string. Handle parsing errors (maybe retry LLM call).
        - [x] If parsing succeeds, call `confirmSchema(parsedSchema)`.
        - [x] If user approves, exit loop and store the `approvedSchema`. If user wants to regenerate, continue loop. If user cancels, exit script.

### Subtask 7: HTML/CSS Template Creation
**Goal:** Create the static EJS template files with placeholders.
**Dependencies:** Subtask 1 (files created)
**Steps:**
- [x] Open `src/templates/index.ejs`.
- [x] Write basic HTML structure for a landing page. Include:
    - [x] Placeholders for content: `<%= copyBlocks.headline %>`, `<%= copyBlocks.subheadline %>`, etc.
    - [x] Placeholders for styling variables (can be used in `<style>` tags or linked CSS): `<%= palette.primary %>`, `<%= font.heading %>`.
    - [x] A basic HTML form with necessary fields (e.g., email).
    - [x] **Crucially:** Add the `data-netlify="true"` attribute to the `<form>` tag. Add a hidden input for form name if needed: `<input type="hidden" name="form-name" value="contact">`.
    - [x] Placeholder for the submit button text: `<%= formText.submitButton %>`.
- [x] Open `src/templates/style.ejs` (or `.css` if not using EJS for CSS).
- [x] Write basic CSS rules.
- [x] Use EJS placeholders for dynamic values like colors and fonts:
    ```css
    body { font-family: '<%= font.body %>'; }
    h1 { font-family: '<%= font.heading %>'; color: <%= palette.primary %>; }
    .button { background-color: <%= palette.accent %>; }
    ```
- [x] Link the stylesheet in `index.ejs` if using a separate CSS file.

### Subtask 8: Site Generator Implementation
**Goal:** Implement the logic to populate templates with schema data and LLM-generated content.
**Dependencies:** Subtask 3 (optional content refinement), Subtask 6 (needs schema), Subtask 7 (needs templates)
**Steps:**
- [x] Open `src/managers/siteGenerator.ts`.
- [x] Import `ejs` and Node's `fs/promises`.
- [x] Import `callLLM` from `llmService.ts` (optional: if refining copy).
- [x] Define an async function `generateSiteFiles(schema)`:
    - [x] See [creative-content-refinement-prompt](./creative-content-refinement-prompt.md) for chosen prompt - use this prompt with `callLLM` to refine/expand `schema.copyBlocks` or generate image alt text based on `schema.imagePrompts`. Update the schema object with refined content. **(Creative Phase: Content Refinement Logic)**
    - [x] Define paths to the template files (`src/templates/index.ejs`, `src/templates/style.ejs`).
    - [x] Use `ejs.renderFile(templatePath, schema)` for both index and style templates, passing the `schema` object as data. This will replace the `<%= ... %>` placeholders.
    - [x] Handle potential rendering errors.
    - [x] Return an object `{ htmlContent: renderedHtml, cssContent: renderedCss }`.
- [x] Export `generateSiteFiles`.

### Subtask 9: File System Manager Implementation
**Goal:** Implement functions to create directories and save generated site files.
**Dependencies:** Subtask 1
**Steps:**
- [x] Open `src/managers/fileManager.ts`.
- [x] Import Node's `fs/promises` and `path`.
- [x] Define an async function `createSiteDirectory(baseDir, siteName)`:
    - [x] Construct the full path: `path.join(baseDir, siteName)`.
    - [x] Use `fs.mkdir(fullPath, { recursive: true })` to create the directory.
    - [x] Handle errors.
    - [x] Return the `fullPath`.
- [x] Define an async function `saveSiteFiles(dirPath, htmlContent, cssContent)`:
    - [x] Construct file paths: `path.join(dirPath, 'index.html')`, `path.join(dirPath, 'style.css')`.
    - [x] Use `fs.writeFile(htmlPath, htmlContent)` and `fs.writeFile(cssPath, cssContent)`.
    - [x] Handle errors.
- [x] Export `createSiteDirectory` and `saveSiteFiles`.

### Subtask 10: Deployment Manager Implementation
**Goal:** Implement Git operations to commit and push the generated site to the Netlify-watched repository.
**Dependencies:** Subtask 1, Subtask 2 (needs repo URL)
**Steps:**
- [ ] Open `src/managers/deploymentManager.ts`.
- [ ] Import `$` and `cd` from `zx`: `import { $, cd } from 'zx'`. Ensure `zx` script is executable or run node with `--experimental-vm-modules`. Configure `$.verbose = false` if desired.
- [ ] Import Node's `fs/promises` for cleanup.
- [ ] Define an async function `deploySite(siteSourcePath, siteName)`:
    - [ ] Retrieve repo URL from `process.env.NETLIFY_GIT_REPO_URL`.
    - [ ] Define a temporary clone directory name (e.g., `temp-deploy-clone`).
    - [ ] Wrap operations in a try/finally block for cleanup.
    - [ ] Inside `try`:
        - [ ] Clone the repo: `await $`git clone ${repoUrl} ${tempCloneDir}``.
        - [ ] `cd(tempCloneDir)`.
        - [ ] Define the target directory within the repo: `const targetDir = path.join(process.cwd(), siteName);` // Use path.join for compatibility
        - [ ] Ensure target directory exists: `await fs.mkdir(targetDir, { recursive: true });`
        - [ ] Copy generated files: `await $`cp -R ${siteSourcePath}/* ${targetDir}/``. (Ensure `siteSourcePath` is absolute or relative path resolution is correct).
        - [ ] Stage changes: `await $`git add .``.
        - [ ] Commit changes: `await $`git commit -m "feat: Add/update site for ${siteName}"``. (Consider checking `git status` first).
        - [ ] Push changes: `await $`git push``.
        - [ ] `cd('..')` // Exit the temp directory before cleanup.
    - [ ] Inside `finally`:
        - [ ] Clean up the temporary clone: `await fs.rm(tempCloneDir, { recursive: true, force: true });`
        - [ ] Handle errors appropriately throughout the process (e.g., catch specific errors from `zx`).
- [ ] Export `deploySite`.

### Subtask 11: Orchestrator Implementation
**Goal:** Tie all the components together in the main script to execute the full workflow.
**Dependencies:** Subtask 5, Subtask 6, Subtask 8, Subtask 9, Subtask 10
**Steps:**
- [ ] Open `src/index.ts`.
- [ ] Import all necessary functions from `cli.ts`, `llmService.ts`, `siteGenerator.ts`, `fileManager.ts`, `deploymentManager.ts`.
- [ ] Define a main `async` function `run()`:
    - [ ] Call functions in the sequence defined by the PRD's Implementation Plan (Steps 1-12).
    - [ ] Get topic (`cli.ts`).
    - [ ] Generate & select idea (using `llmService.ts`, `cli.ts`).
    - [ ] Get preferences (`cli.ts`).
    - [ ] Generate & approve schema (loop using `llmService.ts`, `cli.ts`). Store `approvedSchema`.
    - [ ] Generate site files using `siteGenerator.ts` -> `generateSiteFiles(approvedSchema)`. Store `fileContents`.
    - [ ] Define base output directory (e.g., `./output`).
    - [ ] Create site directory using `fileManager.ts` -> `createSiteDirectory(baseOutputDir, approvedSchema.brandName)`. Store `sitePath`. (Use a sanitized version of brandName for directory name).
    - [ ] Save site files using `fileManager.ts` -> `saveSiteFiles(sitePath, fileContents.htmlContent, fileContents.cssContent)`.
    - [ ] Deploy site using `deploymentManager.ts` -> `deploySite(sitePath, approvedSchema.brandName)`.
    - [ ] Add logging/feedback to the console at each major step.
    - [ ] Include top-level error handling.
- [ ] Call `run()` at the end of the script.
- [ ] Make `src/index.ts` executable or run via `node src/index.ts`.

---

## 5. Dependencies (Between Phases/Subtasks)

- Phase 1 must be complete before starting Phase 2, 3, or 4.
- `llmService.ts` (Phase 1) needed for Idea/Schema generation (Phase 2) and optional Content Refinement (Phase 3).
- `cli.ts` (Phase 1) needed for Idea/Schema generation (Phase 2).
- Schema Approval (Phase 2) needed before Site Generation (Phase 3).
- Templates (Phase 2) needed before Site Generation (Phase 3).
- Site Generation & Saving (Phase 3) needed before Deployment (Phase 4).
- `.env` configured (Phase 1) needed for LLM Service (Phase 1) and Deployment (Phase 4).

---

## 6. Challenges & Mitigations

- **Challenge:** LLM producing invalid JSON for schema.
    - **Mitigation:**
        - Engineer prompt to strongly request valid JSON output only.
        - Implement retry logic in `index.ts` if `JSON.parse` fails.
        - Add robust error handling around parsing.
        - Consider basic validation of the parsed object structure.
- **Challenge:** LLM API errors or rate limits.
    - **Mitigation:**
        - Implement error handling in `llmService.ts` (catch `axios` errors).
        - Provide informative messages to the user via CLI.
        - Consider adding delays or backoff for retries (more advanced).
- **Challenge:** `zx` failing due to Git errors (authentication, conflicts, etc.).
    - **Mitigation:**
        - Ensure user has correctly configured Git credentials accessible by the shell environment running the script.
        - Wrap `zx` calls in `try/catch` in `deploymentManager.ts`.
        - Log `stdout`/`stderr` from `zx` on failure for debugging.
        - Keep Git operations simple (clone fresh, copy over, commit, push). Avoid complex merges.
- **Challenge:** File system permission errors.
    - **Mitigation:**
        - Run the script with appropriate user permissions.
        - Add `try/catch` around `fs` operations in `fileManager.ts`.
- **Challenge:** Sanitizing brand names for directory/URLs/commits.
    - **Mitigation:** Implement a utility function to replace spaces and special characters.
- **Challenge:** Ensuring Netlify form integration works correctly.
    - **Mitigation:** Double-check `data-netlify="true"` and hidden `form-name` input in `index.ejs`. Manually test the first generated site.

---

## 7. Creative Phase Components

- [ ] 🎨 **Algorithm Design / Prompt Engineering:** (Required)
    - Designing the prompt for `llmService.ts` to reliably generate the site schema (JSON) based on user input (topic, idea, preferences). (Subtask 6)
    - Designing the optional prompt(s) for refining copy content within `siteGenerator.ts`. (Subtask 8)
- [ ] 🏗️ **Architecture Design:** (Not Required - Defined in `architecture.md`)
- [ ] ⚙️ **UI/UX Design (CLI):** (Minimal Required - Covered in Plan)
    - Designing the flow and specific prompts within `cli.ts` using `inquirer`.

---

## 8. Testing Strategy (High-Level)

- **Unit Tests:** (Consider for complex logic)
    - Test utility functions (e.g., name sanitization).
    - Mock `axios` and test `llmService.ts` request formatting/error handling.
    - Mock `fs` and test `fileManager.ts` path logic.
    - Mock `zx` and test `deploymentManager.ts` command sequence/cleanup logic.
- **Integration Tests:**
    - Test `index.ts` orchestrator flow by mocking external calls (`llmService`, `deploymentManager`).
- **End-to-End Tests:**
    - Run the full CLI application with sample inputs.
    - Use a test LLM API key (if available) or carefully manage real API calls.
    - Use a dedicated test Git repository for deployment testing.
    - Manually verify the generated `index.html`, `style.css`, and the deployed Netlify site/form.

---

## 9. Documentation Plan

- [ ] Update `README.md` with setup instructions, environment variable requirements, and usage guide.
- [ ] Add JSDoc comments to exported functions in each module (`cli.ts`, `llmService.ts`, etc.) explaining purpose, parameters, and return values.
- [ ] Keep `v0_prd.md` and `architecture.md` updated if significant deviations occur (though try to adhere to the plan).
- [ ] Maintain `tasks.md` (this file) with progress tracking.
- [ ] Maintain `activeContext.md` and `progress.md` (always use `date` in terminal for proper date).

---

## 10. Task Tracking (using Markdown checkboxes)

*(Use the checkboxes within the phases/subtasks above to track progress)*

---

## ✅ Plan Verification Checklist

- [x] Requirements Analysis Complete?
- [x] Components Affected Identified?
- [x] Architecture Considerations Documented?
- [x] Implementation Strategy Phased?
- [x] Detailed Steps Defined (Subtasks Integrated)?
- [x] Dependencies Mapped?
- [x] Challenges & Mitigations Identified?
- [ ] Creative Phase Components Flagged?
- [ ] Documentation Plan Included?

---

**Next Step:** Proceed to **CREATIVE** mode to address the flagged "Algorithm Design / Prompt Engineering" components.
