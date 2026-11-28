# Changelog

## 1.7.0 - 2026-11-29

- Upgraded Electron from 34.5.8 to 45.5.0.
- Added best-effort GitHub release checks with a visible update prompt.
- Kept update installation manual because release binaries are currently
  unsigned.
- Added Internet Archive, Wikimedia Commons, and Blender Open Movies links.
- Added code-signing and release instructions.

## 1.6.0 - 2026-11-29

- Added receiver health states for launch, listening, connection, recovery,
  errors, and disconnects.
- Added actual stream codec and resolution reporting.
- Added sanitized diagnostic export.
- Added one-time port-7000 recovery.
- Unified AirPlay quality and projection frame preferences in JSON settings.
- Made AirPlay smoke checks require a real active capture or listener.

## 1.5.9 - 2026-11-29

- Added readable receiver quality presets from 480p through 8K.
- Added Original as the default quality with device-selected native resolution.
- Applied the selected quality directly to the Ahz-Stream configuration.

## 1.5.8 - 2026-11-29

- Added adaptive framing controls for the projection view.
- Added Auto, original aspect ratio, and fill-screen modes.
- Persisted the selected framing mode locally.

## 1.5.7 - 2026-11-25

- Prepared the project for public open-source distribution.
- Added separate MIT and GPLv3 licensing documentation.
- Added contribution, security, third-party notice, and CI files.
- Excluded local receiver identity and window-layout files from packages.

## 1.5.6 - 2026-11-25

- Renamed the user-facing receiver to Ahz-Stream.
- Renamed the receiver window title and titlebar wordmark.
- Added first-run 4K, HEVC, and 60 FPS receiver defaults.
- Added visible fullscreen exit control and Escape support.
- Fixed shutdown when the receiver process is active.
- Excluded local receiver identity and layout files from release packaging.
- Prepared open-source licensing, contribution, security, and CI files.

## 1.5.5 - 2026-11-23

- Added Ahz-Stream receiver branding and settings migration.

## 1.5.4 - 2026-11-23

- Added high-quality receiver defaults.

## 1.5.1

- Added third-party protocol filtering and release packaging.
