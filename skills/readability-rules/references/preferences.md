# Preference Rules

## 1. Line Length

- Try to keep each line at or below 80 characters.
- Prioritize readability over strict line-length reduction.
- Do not force awkward wrapping that makes code harder to read.

### Good Examples

#### Example A: Wrap Long Arguments Clearly

```text
result = build_report(
    source_data,
    normalization_rules,
    output_format,
    include_archived_records,
)
```

This keeps each line short and preserves scanability.

#### Example B: Allow a Slightly Longer Line for Clarity

```text
error_message = "User profile update failed because the account is locked."
```

If splitting this string hurts readability, keeping one clear line is better.

#### Example C: Prefer Readable Condition Grouping

```text
if has_write_permission(user) and is_target_project(project):
    apply_changes()
```

Do not break this into unnatural fragments only to satisfy a hard limit.

#### Example D: Extract Long Conditions Before `if`

```text
can_apply_changes = (
    has_write_permission(user)
    and is_target_project(project)
    and is_change_window_open(project)
)

if can_apply_changes:
    apply_changes()
```

If an inline `if` condition would exceed 80 columns, extract it first.

## 2. Comment Spacing

- Insert one blank line before a comment line.
- Keep this rule especially in repeated comment-and-implementation patterns.

### Good Example

#### Example E: Add a Blank Line Before Repeated Constant Comments

```text
BASE_TIMEOUT_MS = 1000

# Retry interval for transient failures.
RETRY_INTERVAL_MS = 300

# Maximum retries for background sync.
MAX_RETRY_COUNT = 5

# Time window for lock renewal checks.
LOCK_RENEWAL_WINDOW_MS = 200
```

When comment and constant lines alternate, a blank line before each comment
keeps section boundaries visible.
