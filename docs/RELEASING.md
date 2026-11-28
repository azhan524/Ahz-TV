# Releasing

## Current Signing Status

Ahz TV release binaries are currently unsigned. Windows may show an
"Unknown publisher" warning.

For that reason the application only checks GitHub for newer releases and
opens the release page. It does not silently download or install unsigned
updates.

## Build

```powershell
npm ci
npm run check
npm run dist
```

Expected files:

- `dist/Ahz-TV-<version>-portable.exe`
- `dist/Ahz-TV-<version>-setup.exe`
- `dist/Ahz-TV-<version>-setup.exe.blockmap`

## Code Signing

Use a trusted Authenticode certificate obtained from a certificate authority.
Do not put certificate files or passwords in the repository.

```powershell
$env:CSC_LINK = 'C:\secure\Ahz-TV-signing.pfx'
$env:CSC_KEY_PASSWORD = '<provided out of band>'
npm run dist
```

Verify before publishing:

```powershell
Get-AuthenticodeSignature dist\Ahz-TV-<version>-setup.exe |
  Format-List Status,StatusMessage,SignerCertificate
```

Only enable silent auto-install after signed releases have been tested.

## GitHub Release

```powershell
git tag -a v<version> -m "Ahz TV <version>"
git push origin main
git push origin v<version>

gh release create v<version> `
  "dist\Ahz-TV-<version>-setup.exe" `
  "dist\Ahz-TV-<version>-portable.exe" `
  "dist\SHA256SUMS.txt" `
  --title "Ahz TV <version>" `
  --notes-file RELEASE.md
```

Always verify:

- GitHub Actions passed
- installer and portable smoke tests passed
- SHA-256 values match uploaded assets
- release is public and not a draft
