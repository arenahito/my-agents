# Report Contract Reference

Use this file when the parent agent assembles the final user-facing recommendation report.

## Visible Report Shape

The report must contain:

- a markdown table summarizing action counts
- items
- recommended next step

The visible report stays item-based, not cluster-based. Each item should render as its own two-column `Field | Value` table under the item heading.

## Item-Level Fields

Each visible item contains:

- item title
- action
- URL
- file
- issue
- response

Each entry should contain:

- item title: write the substantive title text in the user's language as a short summary of the review point; append ` (nitpick)` only when the reviewer explicitly marked the comment as nitpick
- action: one of the fixed action labels below
- URL: render it as a markdown link without a `Comment URL:` label. Prefer `[<url>](<url>)`.
- file: render each affected file as a markdown link when a file URL is available. Prefer repo-relative labels with line anchors when known. If multiple files are part of the same item, repeat the `File` row once per file instead of combining them into one cell.
- issue: a self-contained plain-language summary of the review point so the user does not need to open the URL just to recall the comment. State what is wrong, where it happens, and why the reviewer cares. Do not write vague placeholders such as "feedback about X" or fragments that only make sense if the original comment is open.
- response: a short multi-line explanation that combines the reason, the proposed handling approach when relevant, and any uncertainty or follow-up needed

## Action Labels

Use exactly one of these labels:

- ⛔ must-fix
- 🟡 should-fix
- ⚪ can-skip
- ❓ needs-confirmation

Label meanings:

- `⛔ must-fix`: likely actionable and important enough that the user should normally include it in final triage
- `🟡 should-fix`: likely worth addressing, but urgency or scope is lower than `⛔ must-fix`
- `⚪ can-skip`: likely safe to exclude from final triage based on current evidence
- `❓ needs-confirmation`: more repository inspection, diff review, or user intent confirmation is needed before deciding

For comments judged out of scope or low priority, give a short reason such as:

- nitpick only
- already addressed by later changes
- unrelated to the requested scope
- not enough context from the linked review surface alone

## Nitpick Rule

- show ` (nitpick)` at the end of the item title only when the reviewer explicitly marked the comment as nitpick
- otherwise show no nitpick marker
- do not infer nitpick status from the comment text

## Item Generation Rule

- the visible report is item-based
- analysis subagents may return cluster-level bundles, but the parent agent must expand them into item-level display entries
- item-level `action`, `issue`, and `response` come from analysis results
- item-level `file` comes from intake or analysis results, using the most specific affected path available
- when multiple files belong to one item, the visible table repeats the `File` row instead of combining file paths into one value cell

## Report Template

Use this output shape:

```md
# Recommendation Report

## Summary

| Action | Count |
|---|---:|
| ⛔ must-fix | <n> |
| 🟡 should-fix | <n> |
| ⚪ can-skip | <n> |
| ❓ needs-confirmation | <n> |

## Items

### 1. <short title in user's language>

| Field | Value |
|---|---|
| Action | ⛔ must-fix |
| URL | [`<url>`](<url>) |
| File | [`path/to/file.ts:29`](<file-url>) |
| Issue | <self-contained summary of what is wrong, where it happens, and why it matters> |
| Response | <reason> <proposed handling approach if relevant> <uncertainty or follow-up note if relevant> |

### 2. <short title in user's language> (nitpick)

| Field | Value |
|---|---|
| Action | ⚪ can-skip |
| URL | [`<url>`](<url>) |
| File | [`path/to/other-file.ts:14`](<file-url>) |
| File | [`path/to/another-file.ts:31`](<file-url>) |
| Issue | <self-contained summary of what is wrong, where it happens, and why it matters> |
| Response | <reason> <proposed handling approach if relevant> |
```

When the reviewer did not explicitly mark nitpick, do not add any nitpick suffix to the title.
