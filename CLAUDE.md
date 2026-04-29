# Shuriken SDK (TypeScript)

Public SDK for the Shuriken API (REST + WebSocket streams).

## After every change

1. **Bump the version** in `package.json` following semver:
   - **patch** (0.1.0 → 0.1.1): bug fixes, internal refactors
   - **minor** (0.1.0 → 0.2.0): new streams, new types, new API methods
   - **major** (0.1.0 → 1.0.0): breaking changes (renamed types, removed streams, changed filters)
2. **Update `README.md`** if the change affects the public API surface (new streams, new methods, changed filters, renamed types).

## Releasing

A version bump alone does not publish — pushing a `v*` git tag triggers a publish to npm. See [CONTRIBUTING.md](CONTRIBUTING.md) for the release procedure. **Never push a tag or run the `release:*` scripts unless the user explicitly asks to release.**

## Build & lint

- Build: `npm run build`
- Lint: `npx biome check src/`
- Typecheck: `npx tsc --noEmit`

## Code style

- Single quotes, no semicolons, 2 space indent (enforced by biome)
- Stream payload types mirror the JSON contract served by the backend event pipeline
- Types in `src/streams/svm.ts` and `src/streams/evm.ts` must stay in sync with Rust types in `packages/shuriken-api-types-rs/src/`
- Prefix naming: `Svm*` / `Evm*` for chain-specific types, `SvmWallet*` / `EvmWallet*` for wallet-domain types
