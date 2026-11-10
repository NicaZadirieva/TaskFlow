Need to implement the task

## [C] Context

List of projects with a progress bar (percentage visualization), highlighted in yellow if less than 30 days remain until the deadline. Project card: name, budget (hours), deadline, progress bar, task list (brief), "Перейти к задачам" button.

## [O] Result / Goal - what should be

A user with the OWNER role can view all projects within the tenant. TEAM — only those in which they are listed as an assignee. CLIENT can see all projects where they are assigned as a client.

## [S] Boundaries

Change both the frontend and backend code (by analogy with other domain models).

## [T] Verification - when it is done

- Pages open depending on the user's role. The backend returns an error if access is denied.