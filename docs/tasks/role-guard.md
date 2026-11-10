Need to implement the task

## [C] Context

I want to show only those content to user if that user has a specific role (according to README.md)

## [O] Result / Goal - what should be

If the user cannot view or edit, needed to show error page. 

The main rules are:
- OWNER can access personally owned projects. An unlinked task is accessible only to its OWNER creator.
- CLIENT can view allowed-status tasks in linked projects in read-only mode. Backlog and unrecognized statuses, internal notes, executor details, estimates, costs and hour-based progress are hidden.
- TEAM can view and edit actively assigned tasks and create tasks in projects where they have an active assignment. Creators are automatically assigned, and access is rechecked on submission.
- Only the project OWNER can manage task assignments. User management is OWNER-only within the tenant.
- Everyone can change their own password and hourly rate; OWNER can also change a TEAM member’s rate in the same tenant.
- Inaccessible tasks show “Task not found”; role-restricted pages show “Access denied.”
- The backend enforces these rules, and the frontend hides unavailable controls.
- Existing projects remain unowned and inaccessible until explicitly mapped to an OWNER in the same tenant through a one-time administrative command.

## [S] Boundaries

Try to show only required design elements. Delete from page design elements (buttons with forbidden actions, etc) that don't correlate with a user's role.

## [T] Verification - when it is done

- Tests passed