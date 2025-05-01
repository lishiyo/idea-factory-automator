# Idea Factory Automator

This is a brainstorm -> idea -> site deployment agent that automates the complete flow of generating an idea for a product, creating a simple static site for it with an email form to gauge user interest, deploy it, market it, and collect sign-ups and analytics for the user to review. The idea is that multiple users can input their preferences (interests, hobbies, skillsets etc), the agent will do some research, generate 100 product/startup ideas, design and create landing sites for all of them, and collect user interest from email sign-ups and analytics.

For v0 we will focus on the automated site creation piece. The user flow looks like:
- user inputs a topic of interest to them, like "cats"
- the AI agent queries OpenAI or another LLM for 10 cool product/startup ideas around that topic, like "high-end cat toys for playful cats"
- the user selects one
- the AI agent asks about their design preferences, the user answers
- the AI agent calls the LLM to create a schema with brand name, palette, font, copy blocks, image prompts, and form text
- the user can keep asking for edits, until they approve the schema
- once approved, the AI agent queries the LLM to retrieve the complete HTML + CSS to build a landing page
    - to use Netlify forms, see [netlify_form_example](../examples/netlify_form_example.md)
- this string will be saved into an index.html file within a dedicated folder for this site
- to deploy, the AI agent will commit this folder/file to a Git repository that Netlify is watching (https://www.netlify.com/blog/create-sites-programmatically-with-the-netlify-api/)

## Tech Stack

- Node.js
- OpenAI (or another LLM like Gemini) - use Openrouter
- Netlify for deployment
- Netlify forms for email forms
- CLI to ask questions, display choices, and get approvals - use libraries like inquirer (Node.js) or rich / questionary (Python) 

## Core Components

Core Orchestrator: A central script (e.g., Python with requests/openai libraries, or Node.js with axios/openai) to manage the overall workflow state and call other components.

Modular Components: Break down the logic into distinct modules/classes:
- LLMService: Handles all interactions with the chosen LLM (OpenAI, Gemini). It takes prompts and returns parsed responses. This makes it easy to swap LLM providers later.
- SchemaGenerator: Takes user preferences, prompts the LLMService to generate the site schema (JSON is a good format for this), and potentially validates the output.
- SiteGenerator (Crucial for Modularity): This is where you abstract the site creation.
    -  Implement TemplateBasedSiteGenerator. 
    - Create simple, static HTML and CSS template files (template.html, style.css) with placeholders (e.g., using Jinja2 syntax for Python, or EJS/Handlebars for Node.js). These templates define the basic structure and include the necessary Netlify form attributes.
    - This generator takes the schema and uses the LLMService to generate only the content (headlines, paragraphs, button text, image descriptions/prompts) based on the schema.
    - It then uses a templating engine (like Jinja2, EJS) to inject this content, plus colors/fonts from the schema, into the static templates, rendering the final index.html and style.css.
    - TODO: use the image descriptions/prompts to create images
    - to switch to Astro/Tailwind later, you'd simply create a new AstroSiteGenerator class implementing the same interface (e.g., a generate(schema) method) and swap it in the orchestrator.
- FileSystemManager: Handles creating directories and saving the generated files (index.html, style.css).
- DeploymentManager: Handles the Git operations (cloning if needed, add, commit, push) using system calls (subprocess in Python, child_process in Node.js). Keep it simple for v0.


## Implementation Plan

1. User provides a topic via CLI.
2. Orchestrator calls LLMService to get 10 ideas.
3. User selects an idea via CLI.
4. Orchestrator asks for design preferences (e.g., "modern", "playful") via CLI.
5. Orchestrator calls SchemaGenerator (which uses LLMService) to create a structured JSON schema (brand name, palette, fonts, copy block ideas, image ideas, form text).
6. Orchestrator displays the schema to the user via CLI and asks for approval/edits (simplest edit loop for v0 might just be regenerate or approve).
7. Once approved, Orchestrator calls TemplateBasedSiteGenerator.
8. TemplateBasedSiteGenerator uses LLMService to refine/generate the final text content based on the schema's copy/image ideas.
9. TemplateBasedSiteGenerator uses a templating engine to populate pre-defined HTML/CSS templates with the schema data (colors, fonts) and the generated content.
10. TemplateBasedSiteGenerator returns the file content (index.html, style.css).
11. Orchestrator calls FileSystemManager to save files to a dedicated directory.
12. Orchestrator calls DeploymentManager to commit and push the directory to the target Git repository.

