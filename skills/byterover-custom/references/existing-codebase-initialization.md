# Existing Codebase Initialization

Use this guide only when the user explicitly wants to create the initial ByteRover memory from an existing codebase.

Do not use this flow for normal task execution, routine `brv query`, or routine `brv curate`.

## Goal

Create an initial memory baseline so ByteRover can later answer queries about project rules, decisions, conventions, design, and structure.

## When To Use

- The user explicitly asks to initialize ByteRover memory from an existing codebase
- The project is being onboarded into ByteRover for the first time
- The user wants an initial memory pass before normal ByteRover usage begins

## Initialization Task

Run an initialization-focused `brv curate` request that tells ByteRover to create a first memory pass for the codebase.

The request should tell ByteRover to capture durable project context in these areas:

### 1. Code Style and Quality

Capture the conventions that affect how code is expected to be written and reviewed.

- Formatting and code-organization patterns that appear repeatedly
- Error-handling, validation, and testing expectations
- Reuse and abstraction patterns that the project prefers
- Readability or maintainability rules that are visible in the codebase

### 2. Styling and Design

Capture durable UI styling and design-system patterns when the project has a user interface.

- Visual system choices such as tokens, spacing, typography, and color usage
- Component styling patterns and layout conventions
- Shared UI components, design primitives, or theming structure
- Consistent design decisions that should guide future UI work

### 3. Naming Conventions

Capture how the project names things across code and structure.

- File and directory naming patterns
- Component, function, variable, type, and interface naming conventions
- API, route, event, or store naming patterns where relevant
- Domain terms or abbreviations that are used consistently

### 4. Project Structure and Dependencies

Capture the codebase shape and the important technical boundaries.

- High-level directory structure and module boundaries
- Major frameworks, libraries, and tools the project depends on
- Architectural layering or ownership boundaries that appear in the repo
- Important integration points between packages, apps, services, or shared modules

## Organization Rules

Tell ByteRover to organize the curated memory into appropriate domains and topics instead of forcing a flat summary.

- Prefer durable project rules and recurring patterns over one-off details
- Preserve project terminology when naming domains and topics
- Focus on context that will help future agents query the codebase effectively

## Execution Notes

- Treat this as an initialization-specific curate request.
- The `brv curate` request should cover all four focus areas above in one initialization pass.
- Let ByteRover decide the domain and topic structure.
- Apply the cold-start rules from `SKILL.md` if the first request is slow.
- After `brv curate` finishes, check whether `.brv/.gitignore` already exists.
- If `.brv/.gitignore` already exists, leave it unchanged.
- If `.brv/.gitignore` does not exist, create it and add an entry that ignores `config.json` inside `.brv/`.
- After this initialization finishes, use the normal workflow from `SKILL.md` for future query and curate operations.
