---
name: ship
description: Update project documentation, clean up dead code, and commit all changes.
---

## What to do

1. Run `git diff HEAD` and `git status` to understand exactly what changed.

2. **Always update `CHANGELOG.md`** with a new entry at the top of the file (below the `# Changelog` heading). Use today's date from the `currentDate` context variable.

   Follow this exact format — no deviations:
   ```
   ## YYYY-MM-DD — [short title, 3–6 words]

   **Why:** One or two sentences explaining the problem or motivation.

   **What:** Concrete description of what was changed. Use a bullet list if multiple things changed. Reference specific function names, selectors, or file names where relevant.

   **Decision:** The reasoning behind the chosen approach — what alternatives were considered and why this was preferred. Omit this section only if there was genuinely no meaningful decision to document.

   **Files:**
   - `path/to/file.js` — one-line description of the role it plays

   ---
   ```

   The title after the date should describe *what* changed, not *why* (e.g. "Pathname guard for /sites/* only", not "Fix script running on wrong pages").

3. **Always update the features list in `src/js/modules/help-button.js`** if any feature was added, removed, or renamed. The list lives inside `buildHelpButton()` in the `<ul class="d2c-help-list">` block. Keep it in the same order as the README Features list. Rebuild (`npm run build`) after editing so `dist/d2c-enhancements.js` reflects the change — include the dist file in the commit.

4. **Update `README.md`** only if any of the following changed:
   - A feature was added, removed, or renamed (update the Features list)
   - Setup or deployment steps changed
   - The project structure changed

   Do not touch README.md for internal refactors, bug fixes, or changes that don't affect how someone sets up or uses the project.

5. **Update `CLAUDE.md`** only if any of the following changed:
   - A DOM selector was added, removed, or changed
   - The build system changed
   - A new module was added to `src/js/modules/`
   - An architectural decision was made that future Claude sessions should know about

   Do not touch CLAUDE.md for UI tweaks, content changes, or anything already captured in the module list.

6. **Check for dead code and unused files.** Look for:
   - Exported functions or variables that are never imported anywhere
   - Modules in `src/js/modules/` that are not referenced in `index.js`
   - Files that were replaced or superseded by the current change
   - Commented-out blocks of code that are no longer needed

   Present a list of everything found to the user and **ask for confirmation before deleting or modifying anything**. If nothing dead is found, skip this step silently.

7. **Commit all staged and unstaged changes** (excluding `node_modules/`, `*.html`, `*.har`, and other gitignored paths). Use a concise commit message derived from the changelog entry title. Format:

   ```
   git add <specific files>
   git commit -m "<title from changelog entry>

   Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
   ```

   Do not use `git add -A` or `git add .` — stage files explicitly by name to avoid accidentally including ignored or sensitive files. After committing, confirm success with `git status`.

## Optional argument

If `$ARGUMENTS` is provided, use it as the changelog entry title instead of generating one.
