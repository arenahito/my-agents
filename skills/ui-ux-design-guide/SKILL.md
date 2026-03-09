---
name: ui-ux-design-guide
description: Apply a shared UI and UX design baseline during interface planning, frontend implementation, refinement, and review. Use when a task involves a user-facing screen, dashboard, page, flow, layout, typography, color, spacing, component choice, interaction state, responsiveness, accessibility, motion, or visual hierarchy. This skill is not only for design critique; it should also guide concrete UI implementation decisions in code.
---

# UI/UX Design Guide

Use this skill to convert broad product requirements into concrete UI and UX decisions, guide frontend implementation with consistent interface rules, or review an existing interface against a shared baseline without inventing ad hoc taste rules.

## Trigger Cues

Use this skill when the request includes any of the following:

- a new screen, page, dashboard, panel, landing page, settings page, or flow
- custom frontend styling beyond library defaults when those choices materially affect usability, clarity, or product direction
- decisions about layout, hierarchy, typography, color, spacing, tokens, or motion
- responsive behavior across mobile and desktop when breakpoint choices meaningfully change layout, hierarchy, or interaction
- accessibility-sensitive UI such as keyboard interaction, focus treatment, contrast, or non-text graphics
- requests that leave the visual direction, polish level, or interface theme to the agent
- requests for a graphical, immersive, branded, thematic, or polished interface

Do not wait for the exact phrase "UI/UX". If the task is clearly about shaping a user-facing interface, use this skill.

## Source of Truth

- Treat `references/comprehensive-ui-ux-design-guide.md` as the authoritative source for this skill.
- The content of `references/comprehensive-ui-ux-design-guide.md` is the full imported guide from the repository's `design.md`, preserved so no guidance is lost.
- Read `references/comprehensive-ui-ux-design-guide.md` whenever this skill triggers.

## Workflow

0. Decide whether the task contains meaningful UI decision-making.
   - Use this skill if success depends on interface quality, interaction behavior, visual hierarchy, responsiveness, accessibility, or a coherent visual system.
   - Skip only when the UI is purely mechanical, already fully specified, or unrelated to the task outcome.
1. Classify the request as one of these modes:
   - design a new screen or flow
   - implement or refine a frontend UI
   - refine an implemented UI
   - review an existing UI and report findings
2. Confirm the operating context before making recommendations:
   - platform dominance: web or mobile
   - audience dominance: B2B or B2C
   - product constraints: brand colors, dark mode, existing component library, token system
   - whether a product-specific guide overrides this baseline
3. Read `references/comprehensive-ui-ux-design-guide.md` before making concrete recommendations or code changes.
4. Produce actionable output instead of abstract commentary:
   - for design tasks: define hierarchy, user flow, layout, component choices, semantic color use, state behavior, and token implications
   - for implementation tasks: map UI and UX intent to components, spacing, tokens, states, responsive behavior, and accessibility checks
   - for review tasks: list concrete findings first, explain the usability or consistency risk, and suggest the smallest viable fix
5. Prefer product consistency over novelty. When product-specific guidance conflicts with this baseline, follow the product-specific guidance and note the override explicitly.

### Frontend Implementation Mode

When the task includes writing UI code, translate design intent into implementation rules before coding:

- which components should be used or composed
- which decisions belong in tokens, CSS variables, or reusable styles
- how interaction states are represented
- how keyboard and focus behavior work
- what changes across breakpoints
- what must remain visible without motion
- what nearby text or labels are needed for non-text visuals

Prefer reusable rules over one-off style patches.

## MVP Mode

Use a lighter pass for prototypes and speed-first work:

- enforce the 8pt grid
- reject anti-patterns
- lean on the default behavior of the existing UI library where it does not conflict with the product direction
- still make explicit decisions about accessibility, responsiveness, and state behavior
- do not skip visual-system decisions when the interface theme is central to the request

Do not spend time on polish-heavy refinements unless the user asks for them.

## Required Output

When this skill is used for planning or implementation, produce explicit decisions for:

- layout structure
- visual hierarchy
- typography strategy
- color and semantic status usage
- component selection
- interaction states
- responsive behavior
- accessibility behavior
- motion or reduced-motion behavior

Do not leave these as implicit taste choices when they materially affect the implementation.

## Output Expectations

- State the assumed platform and audience when they are not explicit.
- Separate must-fix issues from context-dependent suggestions.
- Favor semantic reasoning over visual taste language.
- When implementing, favor reusable components, semantic tokens, explicit state handling, and predictable interaction behavior over one-off styling.
- When reviewing, explain issues in terms of readability, hierarchy, cognitive load, discoverability, consistency, accessibility, or task efficiency.
- When designing, define reusable tokens or rules instead of one-off magic numbers where possible.

## Guardrails

- Do not treat this skill as a full product-specific design system.
- Do not override explicit brand, accessibility, or platform conventions with personal preference.
- Do not recommend custom components when an existing library component already satisfies the requirement.
- Do not rely on color alone to express status, error, or emphasis.
- Do not skip this skill merely because the task also involves coding.
- Do not assume a frontend implementation task is design-neutral when the request leaves visual direction, interaction design, or UI polish to the agent.
- Do not reduce UI work to component assembly when hierarchy, responsiveness, accessibility, or thematic styling materially affect the result.

## Example Triggers

Use this skill for requests like:

- "Build a dashboard UI and decide the visuals yourself"
- "Create a landing page for a fantasy game"
- "Implement a responsive admin panel"
- "Refine this screen to feel more polished"
- "Review this UI for accessibility and hierarchy"
- "Make this page graphical, immersive, and mobile-friendly"
