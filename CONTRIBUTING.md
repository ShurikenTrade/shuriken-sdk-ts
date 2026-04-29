# Contributing

## Releasing a new version

This package is published to npm by the [`publish.yml`](.github/workflows/publish.yml) workflow, which runs whenever a tag matching `v*` is pushed to GitHub. The tag drives the release — there is no other trigger.

We follow [semver](https://semver.org/): `MAJOR.MINOR.PATCH`.

- `MAJOR` — breaking changes to the public API
- `MINOR` — new functionality, backwards compatible
- `PATCH` — backwards compatible bug fixes

### Preferred: use the release scripts

The `release:*` scripts bump `package.json`, create a commit, create the tag, and push both — all in one step.

```sh
npm run release:patch   # 0.10.0 -> 0.10.1
npm run release:minor   # 0.10.0 -> 0.11.0
npm run release:major   # 0.10.0 -> 1.0.0
```

Run from a clean `main` that's up to date with `origin/main`.

### Manual release

If the version was already bumped in `package.json` as part of a feature commit (or the release scripts can't be used for some reason), you have to create and push the tag yourself. **The tag name must exactly match the version in `package.json`, prefixed with `v`.**

```sh
# Confirm package.json version, then:
git tag v0.10.0
git push origin v0.10.0
```

CI does not verify tag/version parity for this repo, so double-check before pushing — a mismatched tag will publish the wrong version to npm.
