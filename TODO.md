## General API

[See the pairing & scoring TODO document.](https://github.com/johnridesabike/coronate/tree/master/src/pairing-scoring/TODO.md)

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

- [ ] There is only ever one dummy player per round.
- [ ] Removing a round resets all of the matches within the round.
- ... lots of more stuff to reach ~100% coverage, but those are important.