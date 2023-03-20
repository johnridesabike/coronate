# Changelog

## latest

- Reformatted changelog to use dates instead of version numbers. Old version
  numbers are preserved parenthetically.

## 2022-08-09

- Added new match results that support asynchronous tournaments.

## 2022-04-06

- Fixed the auto-pair algorithm to more correctly weight score differences.
- Made some screens more printer-friendly.
- Changed K-factor calculation to be more conservative.
- Added help windows that explain the Swiss system, pairing rules, and tie-break
  rules.

## 2022-03-01

- Adjusted how K-factor is displayed in player profiles.

## 2021-08-03 (1.5.1)

- Players can now take voluntary byes.
- Each individual bye can have a custom point value: full, half, or zero. (This
  is controlled by changing who won the round.)
- The default bye value can be set to full, half, or zero.
- The tournament pairing screen allows pre-selecting the winner of each match.
- Added a link to this changelog with the version information.

## 2021-05-10 (1.4.0)

- Moved hosting to Netlify.
- Added "export to gist" feature.
  - Added basic authentication with GitHub.

## 2021-04-28 (1.3.0)

- Relicensed to MPL 2.0.

## 2021-03-30 (1.2.0)

- Made layout responsive so it works on mobile screens.

## 2021-03-15 (1.1.2)

- Added "Buy Me a Coffee" button and tweaked splash page.
- Internal changes:
  - Migrated to ReScript.
  - Ejected from Create-React-App to optimize build system.
  - Simplified CSS.

## 2020-12-31 (1.1.1)

- Fix crashes when a tournament contains deleted players.

## 2019-11-01 (1.1)

- Added application version to "About" dialog.
- Added ability to manually adjust scores of players per-tournament.
- Various performance and stability improvements.
- Removed Electron desktop version.

## 2019-11-01 (1.0)

- Initial release
