# Third-Party Notices

Ahz TV combines original application code with separately distributed
third-party software and services.

## License Scope

Unless stated otherwise, the original Ahz TV source code in this repository is
licensed under the MIT License in [`LICENSE`](LICENSE).

The `vendor/airplay-windows/` directory is a separate GPLv3 component and is
not relicensed under MIT. Its license, source archive, and component notices
are kept in that directory.

## Ahz-Stream / AirPlay-Windows

- User-facing name: Ahz-Stream
- Upstream project: <https://github.com/moieric11/AirPlay-Windows>
- Upstream version: 0.5.0
- License: GNU General Public License v3.0
- License text: `vendor/airplay-windows/LICENSE`
- Corresponding source: `vendor/airplay-windows/SOURCE-v0.5.0.zip`
- Additional notices: `vendor/airplay-windows/THIRD_PARTY_NOTICES.md`

Ahz TV applies a reproducible string-only branding patch through
`tools/brand-receiver.ps1`. The patched executable is distributed with its
corresponding source archive and the script used to produce the modification.

Ahz-Stream is not affiliated with Apple Inc. or the AirPlay-Windows project.
AirPlay and related marks belong to Apple Inc. The name is used only to
describe protocol compatibility where necessary.

## npm Dependencies

- Electron 34.5.8: MIT
- electron-builder 26.18.0: MIT
- qrcode 1.5.4: MIT

Transitive dependency licenses are resolved by npm during installation.

## Native and Bundled Components

The Ahz-Stream component includes or links against FFmpeg libraries, OpenSSL,
SDL2, SDL2_ttf, libplist, libpng, zlib, Brotli, bzip2, and Microsoft C/C++
runtime libraries. See `vendor/airplay-windows/THIRD_PARTY_NOTICES.md` for
upstream attribution, license identifiers, and implementation caveats.

## Content and Trademarks

Ahz TV does not claim ownership of videos, artwork, names, accounts, or
streaming services provided by third-party platforms. The application opens
official platform pages and does not download protected media or bypass DRM.

Platform names and trademarks belong to their respective owners. Their
appearance in Ahz TV describes an available website link and does not imply
affiliation, endorsement, or partnership.
