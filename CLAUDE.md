# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NCIAFlux (NeuroFluxo) is a neuroscience-based ADHD support application. It helps users discover their brain patterns, create personalized daily plans, and maintain adaptive tracking without performance pressure. The project is in early planning/setup phase with BMad Method framework installed but no source code yet.

## Development Framework: BMad Method

This project uses **BMad Method v4.44.3** for AI-assisted agile development. Key concepts:

- **Agent-based workflow**: Different AI agents handle specific roles (Analyst, PM, Architect, Developer, QA, etc.)
- **Story-driven development**: Features are captured in story files with acceptance criteria, tasks, and testing requirements
- **Quality gates**: QA agent provides risk assessment, test design, and review gates

### BMad Agent Commands (Claude Code)

Use slash commands to activate agents:
```
/BMad:agents:sm        # Scrum Master - drafts stories from epics
/BMad:agents:dev       # Developer - implements stories
/BMad:agents:qa        # QA/Test Architect - risk assessment, test design, reviews
/BMad:agents:architect # System architecture and design
/BMad:agents:pm        # Product Manager - PRD creation
/BMad:agents:po        # Product Owner - document sharding
/BMad:agents:analyst   # Market research, brainstorming
```

### Key BMad Tasks

```
/BMad:tasks:create-next-story    # SM creates next story from epic
/BMad:tasks:risk-profile         # QA risk assessment
/BMad:tasks:test-design          # QA test strategy
/BMad:tasks:review-story         # QA comprehensive review
/BMad:tasks:qa-gate              # QA quality gate decision
/BMad:tasks:shard-doc            # Break documents into epics/stories
```

### Development Workflow

1. **SM drafts story** from sharded epic + architecture
2. **QA runs** `*risk` and `*design` for high-risk stories (optional)
3. **User approves** story draft
4. **Dev implements** tasks sequentially with tests
5. **Dev marks** story "Ready for Review"
6. **QA runs** `*review` for quality gate
7. **Commit changes** before proceeding to next story

## Project Structure

```
.bmad-core/           # BMad method framework files
  agents/             # Agent persona definitions
  tasks/              # Executable workflow tasks
  templates/          # Document templates
  data/               # Knowledge bases
  core-config.yaml    # Master configuration
.claude/commands/BMad/  # Claude Code slash commands
doc/                  # Project requirements documentation (Portuguese)
docs/                 # Will contain PRD, architecture, stories (after planning)
  prd.md              # Product Requirements Document
  architecture.md     # System architecture
  stories/            # Individual story files
  qa/                 # QA assessments and gates
```

## Configuration

Key configuration in `.bmad-core/core-config.yaml`:
- PRD location: `docs/prd.md` (sharded to `docs/prd/`)
- Architecture: `docs/architecture.md` (sharded to `docs/architecture/`)
- Stories: `docs/stories/`
- QA outputs: `docs/qa/`

Developer context files (loaded automatically for dev agent):
- `docs/architecture/coding-standards.md`
- `docs/architecture/tech-stack.md`
- `docs/architecture/source-tree.md`

## Current Status

**Planning phase not yet complete.** Next steps:
1. Create PRD from requirements in `doc/` using PM agent
2. Design architecture using Architect agent
3. Shard documents into epics/stories using PO agent
4. Begin development cycle with SM/Dev/QA agents

## Technical Preferences

Technical preferences can be customized in `.bmad-core/data/technical-preferences.md` to bias PM and Architect recommendations.
