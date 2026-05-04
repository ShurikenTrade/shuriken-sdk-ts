# Shuriken SDK (TypeScript)

Public SDK for the Shuriken API (REST + WebSocket streams).

## After every change

1. **Bump the version** in `package.json` following semver:
   - **patch** (0.1.0 → 0.1.1): bug fixes, internal refactors
   - **minor** (0.1.0 → 0.2.0): new streams, new types, new API methods
   - **major** (0.1.0 → 1.0.0): breaking changes (renamed types, removed streams, changed filters)
2. **Update `README.md`** if the change affects the public API surface (new streams, new methods, changed filters, renamed types).

## Releasing

A version bump alone does not publish — pushing a `v*` git tag triggers a publish to npm. **Never push a tag or run the `release:*` scripts unless the user explicitly asks to release.**

When the user asks to release, pick one of two routes (both detailed in [CONTRIBUTING.md](CONTRIBUTING.md)):

### Manual route — version bumped inside a feature PR

Use when the change needs code review (default).

1. Bump `package.json` inside the feature commit (this is already step 1 of "After every change" above).
2. Open a PR, get it merged into `main`.
3. From a clean local `main` synced with `origin/main`:
   ```sh
   git checkout main && git pull
   git tag v0.12.0      # must exactly match the version in package.json
   git push origin v0.12.0
   ```
4. CI publishes on tag-push. Note: there is no tag/version verification, so double-check before pushing.

### Automatic route — `npm run release:*`, no PR

Use only when the change is trivial enough to skip review (e.g. dependency bump, docs typo) and the work is already directly on `main`.

```sh
npm run release:minor   # bumps package.json + commits + tags + pushes in one shot
```

Bypasses code review. Pre-condition: clean `main` synced with `origin/main`, no unmerged feature branches.

## Build & lint

- Build: `npm run build`
- Lint: `npx biome check src/`
- Typecheck: `npx tsc --noEmit`

## Code style

- Single quotes, no semicolons, 2 space indent (enforced by biome)
- Stream payload types mirror the JSON contract served by the backend event pipeline
- Types in `src/streams/svm.ts` and `src/streams/evm.ts` must stay in sync with Rust types in `packages/shuriken-api-types-rs/src/`
- Prefix naming: `Svm*` / `Evm*` for chain-specific types, `SvmWallet*` / `EvmWallet*` for wallet-domain types
