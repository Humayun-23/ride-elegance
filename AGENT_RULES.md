# Agent Rules

- Do not change existing UI or behavior.
- Refactor one feature at a time.
- Preserve all current routes.
- Keep shadcn/ui components inside src/components/ui.
- Move shared layout components to src/components/layout.
- Move shared reusable components to src/components/common.
- Move feature-specific pages, hooks, services, components into src/features.
- API endpoint functions should live in feature-level services.
- Hooks should call services.
- Pages should mainly compose hooks and components.
- Do not add dependencies without approval.
- After each refactor, update imports and ensure TypeScript builds.
- Keep conversations compact to save tokens.
## Build and Verification Rules

- Always run `npm run build` after moving files, route modules, or changing imports.
- If production build passes but TypeScript still reports pre-existing issues, mention them separately.
- Do not fix unrelated TypeScript errors unless explicitly asked.
- If the same TypeScript error appears under a new path after moving a file, treat it as an existing issue, not a new regression.

## Generated File Cleanup Rules

- Do not include generated sitemap timestamp churn in the final diff.
- Do not include TypeScript build-info artifacts such as `*.tsbuildinfo`.
- Revert generated files changed only by build output.
- Keep the final diff limited to intentional refactor changes.

## Final Summary Rules

At the end of each task, report:
- What was moved/refactored.
- Whether `npm run build` passed.
- Any existing TypeScript issues left untouched.
- Any generated files cleaned/reverted.