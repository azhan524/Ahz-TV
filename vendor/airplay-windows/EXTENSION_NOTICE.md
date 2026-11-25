# Ahz-Stream receiver extension

Ahz TV bundles the separate open-source program **AirPlay-Windows v0.5.0**
under the user-facing name **Ahz-Stream** as an optional wireless display receiver.

- Upstream: https://github.com/moieric11/AirPlay-Windows
- Release: https://github.com/moieric11/AirPlay-Windows/releases/tag/v0.5.0
- License: GNU General Public License v3.0
- Corresponding source: `SOURCE-v0.5.0.zip` in this directory
- Release archive SHA-256:
  `f6d98cfd98826a17d3c12a6209c7a07d33beeb8c64c1705f0ea50c507309becc`
- Windows Defender custom scan: no threats detected on 2026-11-22

The receiver runs as a separate process. Ahz TV launches and stops the process,
then captures its visible receiver window into the Ahz TV interface.
The bundled upstream binary retains its filename for Windows firewall-rule
stability; Ahz TV applies source-compatible string renames so the visible
window title and titlebar wordmark match the **Ahz-Stream** product name.

Ahz-Stream is based on AirPlay-Windows. AirPlay and related marks belong to
Apple Inc. Ahz TV and Ahz-Stream are not affiliated with Apple or the
AirPlay-Windows project.
