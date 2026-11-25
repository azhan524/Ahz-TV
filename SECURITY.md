# Security Policy

## Reporting

Once the project is hosted on GitHub, report vulnerabilities through a private
GitHub Security Advisory. Do not publish exploitable details, credentials,
network tokens, or private media in a public issue.

Include:

- Ahz TV version
- Windows version
- Reproduction steps
- Expected and observed behavior
- Relevant logs with IP addresses, tokens, file paths, and personal data
  removed

## Local Data

Phone-cast URLs contain short-lived access tokens. Treat screenshots of the QR
code or full URL as private.

The application stores its Electron data under the user's local application
data directory. Uninstalling the program does not automatically delete that
directory.
