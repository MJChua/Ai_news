# Development Workflow

## Branches

- `master`: project bootstrap and baseline branch.
- `dev`: daily integration branch. Create normal work branches from here.
- `sit`: weekly sprint integration testing branch. The scheduled workflow attempts to merge `dev` into `sit`.
- `production`: future production branch. Do not merge into it until a dedicated domain, deployment target, and release checks exist.

## Daily Development

1. Sync `dev`.
2. Create a working branch from `dev`.
3. Use `feature/<short-name>` for new features.
4. Use `bug/<short-name>` for normal bug fixes.
5. Merge completed work back into `dev`.
6. Before merge, run:

```bash
npm run lint
npm run build
```

## Weekly Sprint And SIT

- One week is treated as one sprint cycle.
- `.github/workflows/weekly-sit-merge.yml` runs weekly and can also be triggered manually.
- The workflow attempts to merge `origin/dev` into `sit`.
- If Git conflicts occur, the workflow should fail and a human must resolve the conflict.
- Do not use `sit` as a daily development branch.

## Production Rules

- `production` exists only as a placeholder until a real release setup exists.
- Do not auto-merge into `production`.
- Only merge into `production` after domain, deployment, release validation, and rollback rules are documented.
- Production promotion must pass lint, build, and manual UI smoke checks.

## Required Checks

- Code changes: `npm run lint` and `npm run build`.
- UI changes: desktop and mobile layout check.
- Article content changes: verify dates, sources, URLs, and verification notes.
- Workflow changes: inspect YAML and confirm branch names match this document.

