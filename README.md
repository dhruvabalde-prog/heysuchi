# HeySuchi

HeySuchi is a mobile-first, voice-first operating system for getting things done.

## The attention principle

Time, energy, and attention are currencies of life. HeySuchi is designed to spend as little of them as possible on execution overhead.

**Default communication rule:** one-line updates, one clear question when the user is needed, and detailed context delivered as a readable artifact (for example mission.md) rather than a long chat response.

The user should see decisions, not process. HeySuchi can maintain the full execution trail underneath, but the primary interface stays calm and concise.

## Core loop

**Voice / Dump → Understand → Mission → Plan → Execute → Verify → Decision → Done**

## Product behavior

- Never narrate every task or agent step unless the user asks.
- Send short status updates only when something meaningfully changes.
- When a decision is required, ask one question and present compact choices.
- Keep deep research, execution logs, plans, evidence, and outputs in inspectable artifacts.
- Offer a markdown mission brief/report when the user wants to read, review, or think deeply.
- The human decides; HeySuchi handles execution.

## MVP

The first slice proves the Suchi Loop: capture an outcome, create a mission, execute behind the scenes, surface only meaningful updates, and provide a detailed artifact on demand.

## Architecture direction

Next.js App Router + TypeScript. The runtime will be provider-agnostic: model, browser, workspace, and automation providers plug into a common agent interface. Persistent mission state, task graphs, artifacts, approvals, verification, memory, and policy will follow.

## Production deployment

The canonical Google sign-in callback is derived from the live HeySuchi origin:
`/api/auth/callback/google`.
For production, the Google OAuth client must allow:
`https://heysuchi.vercel.app/api/auth/callback/google`.
