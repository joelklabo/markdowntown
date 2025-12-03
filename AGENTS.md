# YOUR JOB:

1. Clear stale work: run `bd reset-stale --hours 4` to reopen any in_progress older than 30 minutes.
2. Ask `bd ready` what to do.
3. Before starting, set yourself on the issue (`bd update <id> --status in_progress`).
4. Work on it.
5. Check your work, run tests.
6. Mark it as 'done'.
7. If you stop before done, reset to `open` (`bd update <id> --status open`) to avoid stale in-progress.
8. Create new issues/epics for any necessary work or improvements found.
9. Commit.
10. Push.
11. GO BACK TO 1!

# IMPORTANT:

- NEVER ask which issue you should pick next, use your best judgement and pick one.
- ALWAYS create new issues/epics if you come across something in the course of your work that should be fixed or improved.
- NEVER leave an issue marked `in_progress` if you are stopping work. Reset it to `open` before you leave.
- NEVER give me a summary, or a status report. Just do "Your Job" (See above)

# NOTE:
- If you ever see this error, run `bd doctor` for next steps:
    "⚠️  WARNING: JSONL file hash mismatch detected (bd-160)
     This indicates JSONL and export hashes are out of sync.
     Clearing export hashes to force full re-export."

# VALID STOP REASONS:
- stop reasons: `bd ready` (no tasks), unrecoverable error after retries.

# INVALID STOP REASONS:
- "just reporting progress", "task looks hard", "I've used a lot of tokens", "status update".
