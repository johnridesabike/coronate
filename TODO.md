## General API

[See the pairing & scoring TODO document.](https://github.com/johnridesabike/coronate/tree/master/src/TODO_Pairing_Scoring.md)

## User interface to-dos

- [ ] Overhaul the pair-picker view. It should show more information about potential pairings and have a preview & confirmation for the auto-pairings.
- [ ] Improve responsiveness across devices.
- [ ] Improve accessibility.
- [ ] Implement drag-and-drop to supplement buttons.

## Low-priority stuff

- [ ] Add round robin pairings.
- [ ] Improve rating calculations: add provisional ratings and possibly move to a different engine (e.g. Glicko-2).
- [ ] Pairing and scoring: improve potential compatibility with third parties.

## Test coverage

- [ ] Migrating to ReasonML broke all of the tests, since the create-react-app Jest configuration doesn't play well with Reason tests. That needs to be fixed.
- [ ] Test that there is only ever one dummy player per round.
- [ ] Test that removing a round resets all of the matches within the round.
- ... lots of other stuff to reach 100% coverage.