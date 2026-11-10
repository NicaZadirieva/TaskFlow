# Project-wide guidance

These instructions apply throughout the repository. Follow more specific `AGENTS.md` instructions when working in a subdirectory.

## Conventional commits

Use Conventional Commits for commit messages: `type(scope): description`. Common types include `feat`, `fix`, `docs`, `refactor`, `test`, and `chore`; the scope is optional. Use `!` or a `BREAKING CHANGE:` footer for breaking changes. For example: `fix(auth): restrict client project access`.

## GitHub Flow

Keep `main` deployable. Create a short-lived branch from an up-to-date `main` for each change, push it, and open a pull request targeting `main`. Describe the change and its verification, address review feedback, and merge after the required checks and reviews pass. Delete the branch after merging.

## Changes and verification

Keep changes focused and consistent with existing patterns. Run the relevant tests and checks for the affected backend or frontend, and report any checks that could not be run. When changing shared behavior or APIs, consider both applications and update relevant documentation. Preserve tenant isolation and role-based access when handling project or task data; never commit secrets or credentials.
