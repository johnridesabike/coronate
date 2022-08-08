# Changelog

## Latest

- Added new match results that support asynchronous tournaments.
- Fixed the auto-pair algorithm to more correctly weight score differences.
- Made some screens more printer-friendly.
- Changed K-factor calculation to be more conservative.
- Added help windows that explain the Swiss system, pairing rules, and tie-break
  rules.

## 1.5.1

- Adjusted how K-factor is displayed in player profiles.

## 1.5.0

- Players can now take voluntary byes.
- Each individual bye can have a custom point value: full, half, or zero. (This
  is controlled by changing who won the round.)
- The default bye value can be set to full, half, or zero.
- The tournament pairing screen allows pre-selecting the winner of each match.
- Added a link to this changelog with the version information.

## 1.4.0

- Moved hosting to Netlify.
- Added "export to gist" feature.
  - Added basic authentication with GitHub.

## 1.3.0

- Relicensed to MPL 2.0.

## 1.2.0

- Made layout responsive so it works on mobile screens.

## 1.1.2

- Added "Buy Me a Coffee" button and tweaked splash page.
- Internal changes:
  - Migrated to ReScript.
  - Ejected from Create-React-App to optimize build system.
  - Simplified CSS.

## 1.1.1

- Fix crashes when a tournament contains deleted players.

## 1.1

- Added application version to "About" dialog.
- Added ability to manually adjust scores of players per-tournament.
- Various performance and stability improvements.
- Removed Electron desktop version.

## 1.0

- Initial release
