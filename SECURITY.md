# Security Policy

## Supported versions

The BarriApp client apps (mobile/web + admin) are under active development toward
their first production release. Security fixes are applied to the latest `main`
(production) and `develop` (integration) branches only.

| Branch    | Supported          |
| --------- | ------------------ |
| `main`    | :white_check_mark: |
| `develop` | :white_check_mark: |
| others    | :x:                |

## Reporting a vulnerability

**Please do not open a public issue for security vulnerabilities.**

Report privately through GitHub's
[private vulnerability reporting](https://github.com/santirogu/barriapp-client/security/advisories/new)
("Report a vulnerability" under the **Security** tab). This keeps the report
confidential until a fix is available.

Please include:

- A description of the vulnerability and its impact.
- Steps to reproduce (proof of concept if possible).
- Affected screen/component/route and, if known, a suggested fix.

### What to expect

- **Acknowledgement:** within 3 business days.
- **Assessment & triage:** within 7 business days, with a severity estimate.
- **Fix & disclosure:** we aim to ship a fix and publish an advisory as soon as
  practical; we will coordinate a disclosure timeline with you.

## Handling of personal data

BarriApp processes personal data under Colombia's Habeas Data law (Ley 1581).
Client apps must never log or persist raw credentials, JWTs, or PII beyond what
the session requires (tokens live only in secure storage). Vulnerabilities that
expose user data or session tokens are treated as **critical** and prioritized.

## Scope

In scope: this repository (app code, build/CI config, bundled config).
Out of scope: the BarriApp backend API (report separately) and third-party
services (Wompi, Mapbox, FCM, Expo, Cloudflare) — report those to the vendor.
