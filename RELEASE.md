# Release process

Versioning and releases are automated with
[**semantic-release**](https://semantic-release.gitbook.io/), driven by
[Conventional Commits](https://www.conventionalcommits.org/). This mirrors the
backend's setup (which uses python-semantic-release).

## How it works

1. Work lands on `develop` via PRs (`feat:`, `fix:`, `docs:`, `chore:`…).
2. When ready to ship, open a **release PR `develop -> main`** and merge it.
3. On push to `main`, [`.github/workflows/release.yml`](.github/workflows/release.yml)
   runs `semantic-release` (config in [`.releaserc.json`](.releaserc.json)), which:
   - reads the commits since the last `vX.Y.Z` tag,
   - computes the next version,
   - updates `version` in the root `package.json` and `CHANGELOG.md`,
   - commits (`chore(release): X.Y.Z [skip ci]`), tags `vX.Y.Z`, and
   - publishes a **GitHub Release** with generated notes.

Single version for the whole monorepo (the root `package.json`); the apps are
private and are **not** published to npm (`@semantic-release/npm` runs with
`npmPublish: false`, only to bump the version).

## Version bump rules

Computed from Conventional Commit types since the last release:

| Commit | Bump | Example |
| --- | --- | --- |
| `fix:` | patch | `0.1.0 → 0.1.1` |
| `feat:` | minor | `0.1.0 → 0.2.0` |
| `feat!:` / `BREAKING CHANGE:` | major | `0.1.0 → 1.0.0` |
| `docs:`, `chore:`, `ci:`, `refactor:`, `test:`, `style:` | none | — |

We intend to stay in **0.x** for now: avoid `!`/`BREAKING CHANGE` footers until we
deliberately cut `1.0.0` (as in the backend). When ready for 1.0, bump the version
manually once or land a breaking change on purpose.

> With **squash merges**, the *PR title* becomes the commit subject — keep PR
> titles conventional (`feat: …`, `fix: …`).

## One-time setup (required)

`main` is protected (PR required, direct pushes blocked). The release commit that
semantic-release pushes back to `main` therefore needs a token allowed to bypass
that rule:

- **Recommended — PAT secret:** create a fine-grained Personal Access Token (or a
  GitHub App token) with `contents: write` on this repo, from an account in the
  branch-protection **bypass list**, and save it as the repo secret
  **`RELEASE_TOKEN`**. The workflow uses it automatically (falls back to
  `GITHUB_TOKEN` if unset).
- **Alternative — ruleset bypass:** add the release actor to the `main` ruleset
  bypass list so the default `GITHUB_TOKEN` push is allowed.

Without one of these, the release job fails when pushing the version commit.

## Notes

- `docs`/`chore`/`ci`/`test`/`refactor`/`style` commits don't trigger a release
  (see `releaseRules` in `.releaserc.json`).
- No npm publish: these are applications — releases are tag + GitHub Release only.
