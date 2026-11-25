# Contributing

Thanks for improving Ahz TV.

## Development

Requirements:

- Windows 10 1809 or later
- Node.js 20 or later
- PowerShell

Run:

```powershell
npm ci
npm start
npm check
```

Build both the portable and installed editions:

```powershell
npm run dist
```

## Scope

Accepted contributions include:

- Local playback and media-library improvements
- Legally distributable open-media sources
- Phone casting and accessibility improvements
- Security, privacy, reliability, and test coverage
- Documentation and translations

Not accepted:

- Scraping, downloading, or redistributing protected platform media
- DRM or membership bypasses
- Pirate source aggregators or credential-sharing features
- Platform impersonation or misleading use of trademarks

## Licensing Contributions

Contributions to original Ahz TV code are accepted under the repository's MIT
License. Contributions to `vendor/airplay-windows/` remain under its applicable
GPLv3 and upstream terms. Do not contribute code or assets you do not have the
right to redistribute.

## Pull Requests

- Keep changes focused and explain the user-visible outcome.
- Add or update tests for behavior changes.
- Run `npm check` before submitting.
- Never commit API keys, pairing identities, personal data, logs, build output,
  or local configuration.
